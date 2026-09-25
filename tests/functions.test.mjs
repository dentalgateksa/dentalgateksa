// Cloud Functions tests, run end-to-end against the emulators. Run with: npm test
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after, before, describe, test } from 'node:test';
import { initializeApp as initAdmin } from 'firebase-admin/app';
import { getAuth as adminAuth } from 'firebase-admin/auth';
import { getFirestore as adminDb } from 'firebase-admin/firestore';
import { deleteApp, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, connectFirestoreEmulator, doc, getDoc, getDocs, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import { connectStorageEmulator, getStorage, ref, uploadBytes } from 'firebase/storage';

const PROJECT_ID = 'demo-dentalgate';
const run = Date.now();
const ADMIN = { email: `admin-${run}@x.test`, password: 'admin12345' };
const TECH = { email: `tech-${run}@x.test`, password: 'tech12345' };

initAdmin({ projectId: PROJECT_ID });
const apps = [];

// A separate browser-like client (own login state) per actor.
function client() {
    const app = initializeApp({ apiKey: 'demo-key', projectId: PROJECT_ID, storageBucket: `${PROJECT_ID}.appspot.com`, appId: 'x' }, 'c' + apps.length);
    apps.push(app);
    const auth = getAuth(app);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    const db = getFirestore(app);
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    const storage = getStorage(app);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    const fns = getFunctions(app, 'me-central2');
    connectFunctionsEmulator(fns, '127.0.0.1', 5001);
    return { auth, db, storage, call: (name, data) => httpsCallable(fns, name)(data).then((r) => r.data) };
}

async function makeStaff(account, isAdmin) {
    const user = await adminAuth().createUser(account);
    await adminDb().doc(`staff/${user.uid}`).set({ name: account.email, email: account.email, role: 'Ceramist', isAdmin, createdAt: new Date() });
    return user.uid;
}

async function rejects(promise, code) {
    await assert.rejects(promise, (err) => {
        assert.equal(err.code, code);
        return true;
    });
}

let adminUid;
let techUid;

before(async () => {
    adminUid = await makeStaff(ADMIN, true);
    techUid = await makeStaff(TECH, false);
});

after(async () => {
    await Promise.all(apps.map((a) => deleteApp(a)));
});

describe('submitCase (doctor, no login)', () => {
    const fields = { doctor: 'Dr. A', clinic: 'Clinic', patient: 'Patient X', shade: 'A2', notes: 'note' };

    test('uploads files and registers the case with a case number', async () => {
        const doctor = client();
        const caseId = randomUUID();
        await uploadBytes(ref(doctor.storage, `cases/${caseId}/1-Upper_Arch.stl`), new Uint8Array(10), { customMetadata: { originalName: 'Upper Arch.stl' } });
        await uploadBytes(ref(doctor.storage, `cases/${caseId}/2-photo.jpg`), new Uint8Array(5), { customMetadata: { originalName: 'photo.jpg' } });

        const res = await doctor.call('submitCase', { caseId, ...fields });
        assert.ok(Number.isInteger(res.caseNo) && res.caseNo > 0);

        const saved = (await adminDb().doc(`cases/${caseId}`).get()).data();
        assert.equal(saved.status, 'pending');
        assert.equal(saved.patient, 'Patient X');
        assert.deepEqual(saved.files.map((f) => [f.name, f.size]), [['Upper Arch.stl', 10], ['photo.jpg', 5]]);

        // The doctor still cannot read it back.
        await rejects(getDoc(doc(doctor.db, 'cases', caseId)), 'permission-denied');
        // ...nor submit it twice, nor add files afterwards.
        await rejects(doctor.call('submitCase', { caseId, ...fields }), 'functions/already-exists');
        await rejects(uploadBytes(ref(doctor.storage, `cases/${caseId}/3-extra.stl`), new Uint8Array(1)), 'storage/unauthorized');
    });

    test('case numbers increase', async () => {
        const doctor = client();
        const a = await doctor.call('submitCase', { caseId: randomUUID(), ...fields });
        const b = await doctor.call('submitCase', { caseId: randomUUID(), ...fields });
        assert.equal(b.caseNo, a.caseNo + 1);
    });

    test('rejects missing or invalid fields', async () => {
        const doctor = client();
        await rejects(doctor.call('submitCase', { caseId: randomUUID(), ...fields, patient: '  ' }), 'functions/invalid-argument');
        await rejects(doctor.call('submitCase', { caseId: 'abc', ...fields }), 'functions/invalid-argument');
        await rejects(doctor.call('submitCase', { caseId: randomUUID(), ...fields, notes: 'x'.repeat(2001) }), 'functions/invalid-argument');
    });
});

describe('createStaff / deleteStaff', () => {
    const NEW = { name: 'New Tech', email: `new-${run}@x.test`, password: 'newpass123', role: 'Ceramist' };

    test('doctors and technicians cannot manage staff', async () => {
        await rejects(client().call('createStaff', NEW), 'functions/unauthenticated');
        const t = client();
        await signInWithEmailAndPassword(t.auth, TECH.email, TECH.password);
        await rejects(t.call('createStaff', NEW), 'functions/permission-denied');
        await rejects(t.call('deleteStaff', { id: adminUid }), 'functions/permission-denied');
    });

    test('admin creates a technician who can then log in and see cases', async () => {
        const a = client();
        await signInWithEmailAndPassword(a.auth, ADMIN.email, ADMIN.password);
        const { id } = await a.call('createStaff', NEW);
        await rejects(a.call('createStaff', NEW), 'functions/already-exists');
        await rejects(a.call('createStaff', { ...NEW, email: `short-${run}@x.test`, password: '123' }), 'functions/invalid-argument');

        const profile = (await adminDb().doc(`staff/${id}`).get()).data();
        assert.equal(profile.isAdmin, false);
        assert.equal(profile.role, 'Ceramist');

        const t = client();
        await signInWithEmailAndPassword(t.auth, NEW.email, NEW.password);
        await getDocs(collection(t.db, 'cases'));

        // After deletion the same (still logged-in) session loses access immediately.
        await a.call('deleteStaff', { id });
        await rejects(getDocs(collection(t.db, 'cases')), 'permission-denied');
        await rejects(adminAuth().getUser(id), 'auth/user-not-found');
        await signOut(t.auth);
    });

    test('admin cannot delete their own account', async () => {
        const a = client();
        await signInWithEmailAndPassword(a.auth, ADMIN.email, ADMIN.password);
        await rejects(a.call('deleteStaff', { id: adminUid }), 'functions/failed-precondition');
        assert.ok(techUid);
    });
});
