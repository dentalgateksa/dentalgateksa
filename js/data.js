// Data layer. Exposes window.DG_API_READY -> Promise<api>.
// Both backends implement the same interface:
//   mode ('demo' | 'firebase' | 'emulator'), getSession(), signIn(user, pass), signOut(),
//   submitCase(fields, files, onProgress) -> { caseNo }, listCases(), setCaseStatus(id, status),
//   deleteCase(c), downloadFile(file) -> boolean, listStaff(), createStaff(s), deleteStaff(id)
// A session is { id, name, isAdmin }.
(function () {
    'use strict';

    const cfg = window.DG_CONFIG || {};
    const REGION = cfg.functionsRegion || 'me-central2';
    const SDK_BASE = 'https://www.gstatic.com/firebasejs/' + (cfg.firebaseSdkVersion || '12.19.0') + '/';
    const EMULATOR_CONFIG = {
        apiKey: 'demo-key',
        authDomain: 'demo-dentalgate.firebaseapp.com',
        projectId: 'demo-dentalgate',
        storageBucket: 'demo-dentalgate.appspot.com',
        appId: 'demo-app'
    };

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
                const caseNo = db.nextCaseNo++;
                db.cases.unshift({
                    id: uuid(),
                    caseNo,
                    createdAt: new Date().toISOString(),
                    ...fields,
                    files: files.map((f) => ({ name: f.name, size: f.size })),
                    status: 'pending'
                });
                save();
                return { caseNo };
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
            async downloadFile() { return false; },
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

    // ---------------- Firebase backend ----------------
    function toIso(ts) {
        return ts && typeof ts.toDate === 'function' ? ts.toDate().toISOString() : new Date().toISOString();
    }

    function callableError(err) {
        // Firebase callable errors look like "functions/already-exists"; keep the server message.
        return new Error((err && err.message) || 'Request failed');
    }

    async function createFirebaseApi(firebaseConfig, useEmulator) {
        const [appM, authM, fsM, stM, fnM] = await Promise.all(
            ['app', 'auth', 'firestore', 'storage', 'functions'].map((n) => import(SDK_BASE + 'firebase-' + n + '.js'))
        );
        const app = appM.initializeApp(firebaseConfig);
        const auth = authM.getAuth(app);
        const db = fsM.getFirestore(app);
        const storage = stM.getStorage(app);
        const fns = fnM.getFunctions(app, REGION);

        if (useEmulator) {
            const host = location.hostname;
            authM.connectAuthEmulator(auth, 'http://' + host + ':9099', { disableWarnings: true });
            fsM.connectFirestoreEmulator(db, host, 8080);
            stM.connectStorageEmulator(storage, host, 9199);
            fnM.connectFunctionsEmulator(fns, host, 5001);
        }

        const call = (name) => async (data) => {
            try {
                return (await fnM.httpsCallable(fns, name)(data)).data;
            } catch (err) {
                throw callableError(err);
            }
        };

        async function loadProfile() {
            const user = auth.currentUser;
            if (!user) return null;
            try {
                const snap = await fsM.getDoc(fsM.doc(db, 'staff', user.uid));
                if (!snap.exists()) return null;
                const d = snap.data();
                return { id: user.uid, name: d.name, isAdmin: d.isAdmin === true };
            } catch (err) {
                return null; // not staff: the rules deny the read
            }
        }

        return {
            mode: useEmulator ? 'emulator' : 'firebase',
            async getSession() {
                await auth.authStateReady();
                return loadProfile();
            },
            async signIn(email, password) {
                try {
                    await authM.signInWithEmailAndPassword(auth, email.trim(), password);
                } catch (err) {
                    return null;
                }
                const profile = await loadProfile();
                if (!profile) {
                    await authM.signOut(auth);
                    return null;
                }
                return profile;
            },
            async signOut() { await authM.signOut(auth); },
            async submitCase(fields, files, onProgress) {
                const caseId = uuid();
                const total = files.reduce((n, f) => n + f.size, 0) || 1;
                let done = 0;
                for (let i = 0; i < files.length; i++) {
                    const f = files[i];
                    const fileRef = stM.ref(storage, 'cases/' + caseId + '/' + (i + 1) + '-' + safeName(f.name));
                    const task = stM.uploadBytesResumable(fileRef, f, {
                        contentType: f.type || 'application/octet-stream',
                        customMetadata: { originalName: f.name }
                    });
                    if (onProgress) {
                        task.on('state_changed', (s) => onProgress(Math.round(((done + s.bytesTransferred) / total) * 100)));
                    }
                    await task;
                    done += f.size;
                }
                // Doctors may create but never read cases: the function registers it server-side.
                return call('submitCase')({ caseId, ...fields });
            },
            async listCases() {
                const snap = await fsM.getDocs(fsM.query(fsM.collection(db, 'cases'), fsM.orderBy('createdAt', 'desc')));
                return snap.docs.map((d) => {
                    const r = d.data();
                    return {
                        id: d.id,
                        caseNo: r.caseNo,
                        createdAt: toIso(r.createdAt),
                        patient: r.patient,
                        doctor: r.doctor,
                        clinic: r.clinic,
                        shade: r.shade,
                        notes: r.notes || '',
                        files: Array.isArray(r.files) ? r.files : [],
                        status: r.status
                    };
                });
            },
            async setCaseStatus(id, status) {
                await fsM.updateDoc(fsM.doc(db, 'cases', id), { status, updatedAt: fsM.serverTimestamp() });
            },
            async deleteCase(c) {
                for (const f of c.files) {
                    if (!f.path) continue;
                    try {
                        await stM.deleteObject(stM.ref(storage, f.path));
                    } catch (err) {
                        if (err.code !== 'storage/object-not-found') throw err;
                    }
                }
                await fsM.deleteDoc(fsM.doc(db, 'cases', c.id));
            },
            async downloadFile(file) {
                if (!file.path) return false;
                let blob;
                try {
                    blob = await stM.getBlob(stM.ref(storage, file.path));
                } catch (err) {
                    if (err.code === 'storage/object-not-found') return false; // e.g. removed by the auto-cleanup
                    throw err;
                }
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = file.name;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 60e3);
                return true;
            },
            async listStaff() {
                const snap = await fsM.getDocs(fsM.query(fsM.collection(db, 'staff'), fsM.orderBy('createdAt')));
                return snap.docs.map((d) => {
                    const r = d.data();
                    return { id: d.id, name: r.name, email: r.email, role: r.role, isAdmin: r.isAdmin === true };
                });
            },
            async createStaff(s) { await call('createStaff')(s); },
            async deleteStaff(id) { await call('deleteStaff')({ id }); }
        };
    }

    const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
    const useEmulator = isLocal && new URLSearchParams(location.search).has('emulator');
    const fbCfg = cfg.firebase || {};
    const configured = Boolean(fbCfg.apiKey && fbCfg.projectId && fbCfg.appId);

    // If Firebase is configured but fails to load, reject rather than fall back to
    // demo mode: a doctor must never believe a case was sent when it wasn't.
    window.DG_API_READY = useEmulator ? createFirebaseApi(EMULATOR_CONFIG, true)
        : configured ? createFirebaseApi(fbCfg, false)
            : Promise.resolve(createDemoApi());
})();
