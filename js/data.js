// Data layer. Exposes window.DG_API_READY -> Promise<api>.
// Both backends implement the same interface:
//   mode, getSession(), signIn(user, pass), signOut(),
//   submitCase(fields, files), listCases(), setCaseStatus(id, status), deleteCase(c),
//   getFileUrl(file), listStaff(), createStaff(s), deleteStaff(id)
// A session is { id, name, isAdmin }.
(function () {
    'use strict';

    const cfg = window.DG_CONFIG || {};
    const BUCKET = 'case-files';
    const SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

    function uuid() {
        if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
            const r = (Math.random() * 16) | 0;
            return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
    }

    function safeName(name) {
        return name.normalize('NFKD').replace(/[^\w.-]+/g, '_').slice(-100) || 'file';
    }

    // ---------------- Demo backend (localStorage) ----------------
    function createDemoApi() {
        const KEY = 'dg_demo_v1';
        const SESSION_KEY = 'dg_demo_session';

        function seed() {
            const now = Date.now();
            return {
                nextCaseNo: 3,
                cases: [
                    { id: uuid(), caseNo: 2, createdAt: new Date(now - 3600e3).toISOString(), patient: 'Sarah Mahmoud', doctor: 'Dr. Omar Taher', clinic: 'Lumineer Center', shade: 'BL2', notes: '', files: [{ name: 'Patient_Sara_Scan.stl', size: 18_400_000 }], status: 'pending' },
                    { id: uuid(), caseNo: 1, createdAt: new Date(now - 86400e3).toISOString(), patient: 'Abdullah Al-Khaled', doctor: 'Dr. Ayman Sherif', clinic: 'Fayrouz Clinics', shade: 'A2', notes: '', files: [{ name: 'Upper_Arch_3D.zip', size: 32_100_000 }], status: 'completed' }
                ],
                staff: [
                    { id: 'demo-admin', name: 'Admin', email: 'admin', role: 'Admin', isAdmin: true },
                    { id: uuid(), name: 'Eng. Mohamed Sami', email: 'm.sami@dentalgate.com', role: 'CAD/CAM Designer', isAdmin: false },
                    { id: uuid(), name: 'Eng. Tariq Ali', email: 'tariq@dentalgate.com', role: 'Ceramist', isAdmin: false }
                ]
            };
        }

        let memory = null;
        function load() {
            if (memory) return memory;
            try { memory = JSON.parse(localStorage.getItem(KEY)); } catch (e) { memory = null; }
            if (!memory || !Array.isArray(memory.cases)) memory = seed();
            return memory;
        }
        function save() {
            try { localStorage.setItem(KEY, JSON.stringify(memory)); } catch (e) { /* storage unavailable: keep in memory */ }
        }
        function readSession() {
            try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch (e) { return null; }
        }

        return {
            mode: 'demo',
            async getSession() { return readSession(); },
            async signIn(user, pass) {
                if (user.trim().toLowerCase() !== 'admin' || pass !== 'admin') return null;
                const s = { id: 'demo-admin', name: 'Admin', isAdmin: true };
                try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
                return s;
            },
            async signOut() {
                try { sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
            },
            async submitCase(fields, files) {
                const db = load();
                db.cases.unshift({
                    id: uuid(),
                    caseNo: db.nextCaseNo++,
                    createdAt: new Date().toISOString(),
                    ...fields,
                    files: files.map((f) => ({ name: f.name, size: f.size })),
                    status: 'pending'
                });
                save();
            },
            async listCases() { return load().cases.slice(); },
            async setCaseStatus(id, status) {
                const c = load().cases.find((x) => x.id === id);
                if (c) { c.status = status; save(); }
            },
            async deleteCase(c) {
                const db = load();
                db.cases = db.cases.filter((x) => x.id !== c.id);
                save();
            },
            async getFileUrl() { return null; },
            async listStaff() { return load().staff.slice(); },
            async createStaff(s) {
                const db = load();
                if (db.staff.some((x) => x.email.toLowerCase() === s.email.toLowerCase())) {
                    throw new Error('Email already registered');
                }
                db.staff.push({ id: uuid(), name: s.name, email: s.email, role: s.role, isAdmin: false });
                save();
            },
            async deleteStaff(id) {
                const db = load();
                db.staff = db.staff.filter((x) => x.id !== id);
                save();
            }
        };
    }

    // ---------------- Supabase backend ----------------
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = () => reject(new Error('Failed to load ' + src));
            document.head.appendChild(s);
        });
    }

    function fromCaseRow(r) {
        return {
            id: r.id,
            caseNo: r.case_no,
            createdAt: r.created_at,
            patient: r.patient,
            doctor: r.doctor,
            clinic: r.clinic,
            shade: r.shade,
            notes: r.notes || '',
            files: Array.isArray(r.files) ? r.files : [],
            status: r.status
        };
    }

    async function createSupabaseApi() {
        await loadScript(SUPABASE_JS);
        const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);

        async function loadProfile() {
            const { data: { user } } = await client.auth.getUser();
            if (!user) return null;
            const { data, error } = await client.from('staff').select('name, is_admin').eq('id', user.id).maybeSingle();
            if (error || !data) return null;
            return { id: user.id, name: data.name, isAdmin: !!data.is_admin };
        }

        async function invokeStaffFn(body) {
            const { data, error } = await client.functions.invoke('manage-staff', { body });
            if (error) throw error;
            if (data && data.error) throw new Error(data.error);
            return data;
        }

        return {
            mode: 'supabase',
            async getSession() {
                const { data } = await client.auth.getSession();
                return data.session ? loadProfile() : null;
            },
            async signIn(email, password) {
                const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
                if (error) return null;
                const profile = await loadProfile();
                if (!profile) {
                    await client.auth.signOut();
                    return null;
                }
                return profile;
            },
            async signOut() { await client.auth.signOut(); },
            async submitCase(fields, files) {
                const id = uuid();
                const stored = [];
                for (let i = 0; i < files.length; i++) {
                    const f = files[i];
                    const path = `${id}/${i + 1}-${safeName(f.name)}`;
                    const { error } = await client.storage.from(BUCKET).upload(path, f, {
                        upsert: false,
                        contentType: f.type || 'application/octet-stream'
                    });
                    if (error) throw error;
                    stored.push({ name: f.name, path, size: f.size });
                }
                // Visitors may insert but not read cases, so don't ask for the row back.
                const { error } = await client.from('cases').insert({ id, ...fields, files: stored });
                if (error) throw error;
            },
            async listCases() {
                const { data, error } = await client.from('cases').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                return data.map(fromCaseRow);
            },
            async setCaseStatus(id, status) {
                const { error } = await client.from('cases').update({ status }).eq('id', id);
                if (error) throw error;
            },
            async deleteCase(c) {
                const paths = c.files.map((f) => f.path).filter(Boolean);
                if (paths.length) {
                    const { error } = await client.storage.from(BUCKET).remove(paths);
                    if (error) throw error;
                }
                const { error } = await client.from('cases').delete().eq('id', c.id);
                if (error) throw error;
            },
            async getFileUrl(file) {
                if (!file.path) return null;
                const { data, error } = await client.storage.from(BUCKET).createSignedUrl(file.path, 300, { download: file.name });
                if (error) throw error;
                return data.signedUrl;
            },
            async listStaff() {
                const { data, error } = await client.from('staff').select('id, name, email, role, is_admin').order('created_at');
                if (error) throw error;
                return data.map((r) => ({ id: r.id, name: r.name, email: r.email, role: r.role, isAdmin: r.is_admin }));
            },
            async createStaff(s) { await invokeStaffFn({ action: 'create', ...s }); },
            async deleteStaff(id) { await invokeStaffFn({ action: 'delete', id }); }
        };
    }

    const configured = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey);
    // If Supabase is configured but fails to load, reject rather than fall back to
    // demo mode: a doctor must never believe a case was sent when it wasn't.
    window.DG_API_READY = configured ? createSupabaseApi() : Promise.resolve(createDemoApi());
})();
