(function () {
    'use strict';

    const T = window.DG_TRANSLATIONS;
    const CFG = window.DG_CONFIG || {};
    const MAX_MB = CFG.maxFileSizeMB || 50;
    const MAX_FILES = CFG.maxFiles || 20;
    const ALLOWED_EXT = ['stl', 'ply', 'obj', 'zip', 'dcm', 'pdf', 'jpg', 'jpeg', 'png'];
    const STATUSES = ['pending', 'in_progress', 'completed'];
    const PAGES = ['home', 'about', 'upload', 'staff'];
    const ROLE_KEYS = { 'CAD/CAM Designer': 'role_cad', 'Ceramist': 'role_ceramist', '3D Printing Tech': 'role_print', 'Admin': 'role_admin' };

    const $ = (id) => document.getElementById(id);

    let api = null;
    let apiError = null;
    let lang = 'en';
    let session = null;
    let adminTab = 'cases';
    let selectedFiles = [];
    let cases = [];
    let staff = [];

    // ---------- helpers ----------
    function t(key, vars) {
        let s = (T[lang] && T[lang][key]) || T.en[key] || key;
        if (vars) Object.keys(vars).forEach((k) => { s = s.split('{' + k + '}').join(vars[k]); });
        return s;
    }

    function el(tag, props, children) {
        const node = document.createElement(tag);
        if (props) {
            Object.entries(props).forEach(([k, v]) => {
                if (k === 'text') node.textContent = v;
                else if (k === 'class') node.className = v;
                else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
                else node.setAttribute(k, v);
            });
        }
        (children || []).forEach((c) => c && node.appendChild(c));
        return node;
    }

    function formatSize(bytes) {
        if (!bytes && bytes !== 0) return '';
        if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function formatDate(iso) {
        try {
            return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-GB', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
        } catch (e) {
            return '';
        }
    }

    let toastTimer = null;
    function toast(message, isError) {
        const box = $('toast');
        box.textContent = message;
        box.classList.toggle('error', !!isError);
        box.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { box.hidden = true; }, 5000);
    }

    async function withApi() {
        if (api) return api;
        throw apiError || new Error('Backend not ready');
    }

    // ---------- language ----------
    function applyLanguage(next) {
        lang = next === 'ar' ? 'ar' : 'en';
        const html = document.documentElement;
        html.lang = lang;
        html.dir = lang === 'ar' ? 'rtl' : 'ltr';

        const langBtn = $('langBtn');
        langBtn.textContent = lang === 'ar' ? 'English' : 'عربي';
        langBtn.setAttribute('lang', lang === 'ar' ? 'en' : 'ar');

        document.querySelectorAll('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
        document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => { node.placeholder = t(node.dataset.i18nPlaceholder); });
        document.querySelectorAll('[data-i18n-aria]').forEach((node) => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
        document.title = t('doc_title');

        try { localStorage.setItem('dg_lang', lang); } catch (e) { /* ignore */ }

        renderFiles();
        renderSessionUi();
        if (session && currentRoute() === 'staff') {
            renderCases();
            renderStaff();
        }
    }

    // ---------- routing ----------
    function currentRoute() {
        const hash = location.hash.replace('#', '');
        return PAGES.includes(hash) ? hash : 'home';
    }

    function render() {
        const page = currentRoute();
        const sectionId = page === 'staff'
            ? (session ? 'page-admin-dashboard' : 'page-staff-login')
            : 'page-' + page;

        document.querySelectorAll('.page-section').forEach((s) => s.classList.toggle('active', s.id === sectionId));
        document.querySelectorAll('.nav-links a[data-page]').forEach((a) => {
            const active = a.dataset.page === page;
            a.classList.toggle('active', active);
            if (active) a.setAttribute('aria-current', 'page');
            else a.removeAttribute('aria-current');
        });

        closeMenu();
        window.DG_HERO_FX.setActive(page === 'home');
        window.scrollTo(0, 0);

        if (page === 'staff' && session) loadDashboard();
    }

    // ---------- mobile menu ----------
    function setMenu(open) {
        $('navLinks').classList.toggle('open', open);
        $('menuBtn').setAttribute('aria-expanded', String(open));
    }
    function closeMenu() { setMenu(false); }

    // ---------- session ----------
    function renderSessionUi() {
        $('logoutNavItem').hidden = !session;
        $('dashboardNavItem').hidden = !session;
        $('sessionBadge').textContent = session ? t('logged_as', { name: session.name }) : '';
        $('tab-techs-btn').hidden = !(session && session.isAdmin);
        if (!(session && session.isAdmin) && adminTab === 'techs') adminTab = 'cases';
        renderTabs();
    }

    async function handleLogin(e) {
        e.preventDefault();
        const btn = $('loginBtn');
        btn.disabled = true;
        try {
            const a = await withApi();
            session = await a.signIn($('adminUser').value, $('adminPass').value);
            if (!session) {
                toast(t('login_failed'), true);
                return;
            }
            $('loginForm').reset();
            renderSessionUi();
            render();
        } catch (err) {
            console.error(err);
            toast(t('action_failed'), true);
        } finally {
            btn.disabled = false;
        }
    }

    async function handleLogout() {
        try { await (await withApi()).signOut(); } catch (err) { console.error(err); }
        session = null;
        cases = [];
        staff = [];
        renderSessionUi();
        if (location.hash === '#home') render();
        else location.hash = 'home';
    }

    // ---------- upload form ----------
    function fileExt(name) {
        const i = name.lastIndexOf('.');
        return i === -1 ? '' : name.slice(i + 1).toLowerCase();
    }

    function addFiles(list) {
        const errors = [];
        Array.from(list).forEach((f) => {
            if (!ALLOWED_EXT.includes(fileExt(f.name))) {
                errors.push(t('file_bad_type', { name: f.name }));
            } else if (f.size > MAX_MB * 1024 * 1024) {
                errors.push(t('file_too_big', { name: f.name, max: MAX_MB }));
            } else if (selectedFiles.some((x) => x.name === f.name && x.size === f.size)) {
                // already added
            } else if (selectedFiles.length >= MAX_FILES) {
                errors.push(t('file_too_many', { max: MAX_FILES }));
            } else {
                selectedFiles.push(f);
            }
        });
        if (errors.length) toast(errors.join('\n'), true);
        renderFiles();
    }

    function renderFiles() {
        $('fileSummary').textContent = selectedFiles.length
            ? t('files_selected', { n: selectedFiles.length })
            : t('file_text2', { max: MAX_MB });

        const list = $('fileList');
        list.replaceChildren(...selectedFiles.map((f, i) => el('li', null, [
            el('span', { class: 'file-name', text: f.name, title: f.name }),
            el('span', { class: 'file-size', text: formatSize(f.size) }),
            el('button', {
                type: 'button',
                text: '×',
                'aria-label': t('file_remove', { name: f.name }),
                onclick: () => { selectedFiles.splice(i, 1); renderFiles(); }
            })
        ])));
    }

    function setupFileZone() {
        const zone = $('fileZone');
        const input = $('fileInput');

        zone.addEventListener('click', () => input.click());
        zone.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                input.click();
            }
        });
        input.addEventListener('change', () => {
            addFiles(input.files);
            input.value = '';
        });

        ['dragenter', 'dragover'].forEach((type) => zone.addEventListener(type, (e) => {
            e.preventDefault();
            zone.classList.add('dragover');
        }));
        ['dragleave', 'dragend', 'drop'].forEach((type) => zone.addEventListener(type, (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
        }));
        zone.addEventListener('drop', (e) => {
            if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
        });
    }

    async function handleCaseSubmit(e) {
        e.preventDefault();
        const form = $('caseForm');
        const required = ['inputDoc', 'inputClinic', 'inputPatient', 'inputShade'];
        let firstInvalid = null;
        required.forEach((id) => {
            const input = $(id);
            const bad = !input.value.trim();
            input.setAttribute('aria-invalid', String(bad));
            if (bad && !firstInvalid) firstInvalid = input;
        });
        if (firstInvalid) {
            toast(t('required_missing'), true);
            firstInvalid.focus();
            return;
        }

        const btn = $('submitCaseBtn');
        btn.disabled = true;
        btn.textContent = t('btn_sending');
        try {
            const a = await withApi();
            const result = await a.submitCase({
                doctor: $('inputDoc').value.trim(),
                clinic: $('inputClinic').value.trim(),
                patient: $('inputPatient').value.trim(),
                shade: $('inputShade').value.trim(),
                notes: $('inputNotes').value.trim()
            }, selectedFiles, (pct) => { btn.textContent = t('btn_sending') + ' ' + pct + '%'; });
            const n = result && result.caseNo ? result.caseNo : '';
            toast(a.mode === 'demo' ? t('case_sent_demo', { n }) : t('case_sent', { n }));
            form.reset();
            selectedFiles = [];
            renderFiles();
        } catch (err) {
            console.error(err);
            toast(t('case_failed'), true);
        } finally {
            btn.disabled = false;
            btn.textContent = t('btn_submit');
        }
    }

    // ---------- dashboard ----------
    function renderTabs() {
        document.querySelectorAll('.admin-nav-tabs button').forEach((b) => {
            b.setAttribute('aria-selected', String(b.dataset.tab === adminTab));
        });
        $('tab-cases').hidden = adminTab !== 'cases';
        $('tab-techs').hidden = adminTab !== 'techs';
    }

    async function loadDashboard() {
        try {
            const a = await withApi();
            cases = await a.listCases();
            renderCases();
            if (session && session.isAdmin) {
                staff = await a.listStaff();
                renderStaff();
            }
        } catch (err) {
            console.error(err);
            toast(t('action_failed'), true);
        }
    }

    async function openFile(file) {
        try {
            const ok = await (await withApi()).downloadFile(file);
            if (!ok) toast(api && api.mode === 'demo' ? t('file_unavailable_demo') : t('file_unavailable'), true);
        } catch (err) {
            console.error(err);
            toast(t('action_failed'), true);
        }
    }

    async function changeStatus(c, status) {
        try {
            await (await withApi()).setCaseStatus(c.id, status);
            c.status = status;
        } catch (err) {
            console.error(err);
            toast(t('action_failed'), true);
        }
        renderCases();
    }

    async function removeCase(c) {
        if (!confirm(t('confirm_delete_case', { n: c.caseNo }))) return;
        try {
            await (await withApi()).deleteCase(c);
            cases = cases.filter((x) => x.id !== c.id);
            renderCases();
        } catch (err) {
            console.error(err);
            toast(t('action_failed'), true);
        }
    }

    function renderCases() {
        const tbody = $('casesTableBody');
        $('casesEmpty').hidden = cases.length > 0;

        tbody.replaceChildren(...cases.map((c) => {
            const statusSelect = el('select', {
                class: 'status-select status-' + c.status,
                'aria-label': t('status_label', { n: c.caseNo }),
                onchange: (e) => changeStatus(c, e.target.value)
            }, STATUSES.map((s) => el('option', { value: s, text: t('status_' + s) })));
            statusSelect.value = c.status;

            const filesCell = c.files.length
                ? c.files.map((f) => el('button', {
                    type: 'button',
                    class: 'file-link',
                    text: f.name,
                    title: f.name + (f.size ? ' (' + formatSize(f.size) + ')' : ''),
                    onclick: () => openFile(f)
                }))
                : [el('small', { text: t('no_files') })];

            const patientCell = [el('strong', { text: c.patient })];
            if (c.notes) patientCell.push(el('span', { class: 'notes-text', text: c.notes }));

            const actions = [];
            if (session && session.isAdmin) {
                actions.push(el('button', { type: 'button', class: 'action-btn delete', text: t('btn_delete'), onclick: () => removeCase(c) }));
            }

            return el('tr', null, [
                el('td', { text: String(c.caseNo) }),
                el('td', { text: formatDate(c.createdAt) }),
                el('td', null, patientCell),
                el('td', null, [
                    document.createTextNode(c.doctor),
                    el('br'),
                    el('small', { text: c.clinic })
                ]),
                el('td', { text: c.shade }),
                el('td', null, filesCell),
                el('td', null, [statusSelect]),
                el('td', null, actions)
            ]);
        }));
    }

    function renderStaff() {
        $('techsTableBody').replaceChildren(...staff.map((s) => {
            const isSelf = session && s.id === session.id;
            return el('tr', null, [
                el('td', null, [el('strong', { text: s.name })]),
                el('td', { text: s.email, dir: 'ltr' }),
                el('td', { text: ROLE_KEYS[s.role] ? t(ROLE_KEYS[s.role]) : s.role }),
                el('td', null, isSelf ? [] : [
                    el('button', {
                        type: 'button',
                        class: 'action-btn delete',
                        text: t('btn_delete_account'),
                        onclick: () => removeStaff(s)
                    })
                ])
            ]);
        }));
    }

    async function handleCreateTech(e) {
        e.preventDefault();
        const form = e.target;
        if (!form.reportValidity()) return;
        const btn = $('createTechBtn');
        btn.disabled = true;
        try {
            const a = await withApi();
            await a.createStaff({
                name: $('techName').value.trim(),
                email: $('techEmail').value.trim(),
                role: $('techRole').value,
                password: $('techPass').value
            });
            form.reset();
            staff = await a.listStaff();
            renderStaff();
            toast(t('tech_created'));
        } catch (err) {
            console.error(err);
            toast(t('action_failed') + (err && err.message ? ' (' + err.message + ')' : ''), true);
        } finally {
            btn.disabled = false;
        }
    }

    async function removeStaff(s) {
        if (!confirm(t('confirm_delete_tech', { name: s.name }))) return;
        try {
            await (await withApi()).deleteStaff(s.id);
            staff = staff.filter((x) => x.id !== s.id);
            renderStaff();
        } catch (err) {
            console.error(err);
            toast(t('action_failed'), true);
        }
    }

    // ---------- init ----------
    function bindEvents() {
        $('langBtn').addEventListener('click', () => applyLanguage(lang === 'en' ? 'ar' : 'en'));
        $('menuBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            setMenu(!$('navLinks').classList.contains('open'));
        });
        document.addEventListener('click', (e) => {
            if (!$('navLinks').contains(e.target)) closeMenu();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });
        $('logoutBtn').addEventListener('click', handleLogout);
        $('caseForm').addEventListener('submit', handleCaseSubmit);
        $('caseForm').addEventListener('input', (e) => {
            if (e.target.getAttribute('aria-invalid') === 'true' && e.target.value.trim()) {
                e.target.setAttribute('aria-invalid', 'false');
            }
        });
        $('loginForm').addEventListener('submit', handleLogin);
        $('techForm').addEventListener('submit', handleCreateTech);
        document.querySelectorAll('.admin-nav-tabs button').forEach((b) => b.addEventListener('click', () => {
            adminTab = b.dataset.tab;
            renderTabs();
        }));
        window.addEventListener('hashchange', render);
        setupFileZone();
    }

    async function init() {
        let saved = null;
        try { saved = localStorage.getItem('dg_lang'); } catch (e) { /* ignore */ }
        const browserAr = (navigator.language || '').toLowerCase().startsWith('ar');

        bindEvents();
        applyLanguage(saved || (browserAr ? 'ar' : 'en'));
        render();

        try {
            api = await window.DG_API_READY;
            document.querySelectorAll('[data-demo-only]').forEach((n) => { n.hidden = api.mode !== 'demo'; });
            document.querySelectorAll('[data-emulator-only]').forEach((n) => { n.hidden = api.mode !== 'emulator'; });
            session = await api.getSession();
        } catch (err) {
            apiError = err;
            console.error('Backend unavailable:', err);
        }
        renderSessionUi();
        if (session && currentRoute() === 'staff') render();
    }

    init();
})();
