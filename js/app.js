(function () {
    'use strict';

    const T = window.DG_TRANSLATIONS;
    const CFG = window.DG_CONFIG || {};
    const PAGES = ['home', 'about', 'upload'];

    const $ = (id) => document.getElementById(id);

    let lang = 'en';

    function t(key) {
        return (T[lang] && T[lang][key]) || T.en[key] || key;
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
        document.querySelectorAll('[data-i18n-aria]').forEach((node) => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
        document.title = t('doc_title');

        try { localStorage.setItem('dg_lang', lang); } catch (e) { /* ignore */ }
    }

    // ---------- routing ----------
    function currentRoute() {
        const hash = location.hash.replace('#', '');
        return PAGES.includes(hash) ? hash : 'home';
    }

    function render() {
        const page = currentRoute();
        document.querySelectorAll('.page-section').forEach((s) => s.classList.toggle('active', s.id === 'page-' + page));
        document.querySelectorAll('.nav-links a[data-page]').forEach((a) => {
            const active = a.dataset.page === page;
            a.classList.toggle('active', active);
            if (active) a.setAttribute('aria-current', 'page');
            else a.removeAttribute('aria-current');
        });

        closeMenu();
        window.DG_HERO_FX.setActive(page === 'home');
        window.scrollTo(0, 0);
    }

    // ---------- mobile menu ----------
    function setMenu(open) {
        $('navLinks').classList.toggle('open', open);
        $('menuBtn').setAttribute('aria-expanded', String(open));
    }
    function closeMenu() { setMenu(false); }

    // ---------- upload link ----------
    function setupUploadLink() {
        const url = String(CFG.uploadUrl || '').trim();
        const valid = /^https:\/\//i.test(url);
        if (valid) $('uploadLink').href = url;
        $('uploadLink').hidden = !valid;
        $('uploadSoon').hidden = valid;
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
        window.addEventListener('hashchange', render);
    }

    function init() {
        let saved = null;
        try { saved = localStorage.getItem('dg_lang'); } catch (e) { /* ignore */ }
        const browserAr = (navigator.language || '').toLowerCase().startsWith('ar');

        bindEvents();
        setupUploadLink();
        applyLanguage(saved || (browserAr ? 'ar' : 'en'));
        render();
    }

    init();
})();
