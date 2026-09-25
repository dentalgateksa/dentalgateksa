// Security rules tests (Firestore + Storage). Run with: npm test
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, test } from 'node:test';
import {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, getDocs, collection, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { deleteObject, getBytes, ref, uploadBytes } from 'firebase/storage';

const CASE_ID = '0b8a3c1e-5f2d-4e6a-9b7c-1d2e3f4a5b6c';
const NEW_CASE_ID = '7c6b5a4f-3e2d-4c1b-8a9f-0e1d2c3b4a59';
const FILE = new Uint8Array([1, 2, 3]);

let env;

before(async () => {
    env = await initializeTestEnvironment({
        projectId: 'demo-dentalgate',
        firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
        storage: { rules: readFileSync('storage.rules', 'utf8'), host: '127.0.0.1', port: 9199 }
    });
});

after(async () => {
    await env.clearFirestore();
    await env.clearStorage();
    await env.cleanup();
});

beforeEach(async () => {
    await env.clearFirestore();
    await env.clearStorage();
    await env.withSecurityRulesDisabled(async (ctx) => {
        const db = ctx.firestore();
        await setDoc(doc(db, 'staff/admin1'), { name: 'Admin', email: 'a@x.test', role: 'Admin', isAdmin: true });
        await setDoc(doc(db, 'staff/tech1'), { name: 'Tech', email: 't@x.test', role: 'Ceramist', isAdmin: false });
        await setDoc(doc(db, 'meta/counters'), { caseNo: 1 });
        await setDoc(doc(db, `cases/${CASE_ID}`), {
            caseNo: 1, doctor: 'D', clinic: 'C', patient: 'P', shade: 'A2', notes: '',
            files: [{ name: 'a.stl', path: `cases/${CASE_ID}/1-a.stl`, size: 3 }], status: 'pending'
        });
        await uploadBytes(ref(ctx.storage(), `cases/${CASE_ID}/1-a.stl`), FILE);
    });
});

const anon = () => env.unauthenticatedContext();
const tech = () => env.authenticatedContext('tech1');
const admin = () => env.authenticatedContext('admin1');
const stranger = () => env.authenticatedContext('someone-else');

describe('Firestore: doctor (no login)', () => {
    test('cannot read or list cases', async () => {
        await assertFails(getDoc(doc(anon().firestore(), `cases/${CASE_ID}`)));
        await assertFails(getDocs(collection(anon().firestore(), 'cases')));
    });
    test('cannot create, change or delete cases directly', async () => {
        const db = anon().firestore();
        await assertFails(setDoc(doc(db, `cases/${NEW_CASE_ID}`), { patient: 'X', status: 'pending' }));
        await assertFails(updateDoc(doc(db, `cases/${CASE_ID}`), { status: 'completed', updatedAt: serverTimestamp() }));
        await assertFails(deleteDoc(doc(db, `cases/${CASE_ID}`)));
    });
    test('cannot read staff or counters', async () => {
        await assertFails(getDocs(collection(anon().firestore(), 'staff')));
        await assertFails(getDoc(doc(anon().firestore(), 'meta/counters')));
    });
    test('a logged-in account that is not staff sees nothing', async () => {
        await assertFails(getDocs(collection(stranger().firestore(), 'cases')));
        await assertFails(getDocs(collection(stranger().firestore(), 'staff')));
    });
});

describe('Firestore: technician', () => {
    test('can read cases and the staff list', async () => {
        await assertSucceeds(getDocs(collection(tech().firestore(), 'cases')));
        await assertSucceeds(getDocs(collection(tech().firestore(), 'staff')));
    });
    test('can change the status', async () => {
        await assertSucceeds(updateDoc(doc(tech().firestore(), `cases/${CASE_ID}`), { status: 'in_progress', updatedAt: serverTimestamp() }));
    });
    test('cannot set an unknown status or edit other fields', async () => {
        const db = tech().firestore();
        await assertFails(updateDoc(doc(db, `cases/${CASE_ID}`), { status: 'shipped', updatedAt: serverTimestamp() }));
        await assertFails(updateDoc(doc(db, `cases/${CASE_ID}`), { patient: 'Changed', updatedAt: serverTimestamp() }));
    });
    test('cannot delete cases or manage staff', async () => {
        const db = tech().firestore();
        await assertFails(deleteDoc(doc(db, `cases/${CASE_ID}`)));
        await assertFails(setDoc(doc(db, 'staff/tech1'), { name: 'Tech', isAdmin: true }));
        await assertFails(setDoc(doc(db, 'staff/new'), { name: 'New', isAdmin: false }));
    });
});

describe('Firestore: admin', () => {
    test('can delete cases', async () => {
        await assertSucceeds(deleteDoc(doc(admin().firestore(), `cases/${CASE_ID}`)));
    });
    test('cannot write staff directly (only through Cloud Functions)', async () => {
        await assertFails(setDoc(doc(admin().firestore(), 'staff/new'), { name: 'New', isAdmin: false }));
    });
});

describe('Storage', () => {
    const newPath = `cases/${NEW_CASE_ID}/1-Scan.stl`;

    test('doctor can upload a scan for a new case', async () => {
        await assertSucceeds(uploadBytes(ref(anon().storage(), newPath), FILE));
    });
    test('doctor cannot read, overwrite or delete files', async () => {
        const st = anon().storage();
        const path = `cases/${NEW_CASE_ID}/2-Other.stl`;
        await assertFails(getBytes(ref(st, `cases/${CASE_ID}/1-a.stl`)));
        await assertSucceeds(uploadBytes(ref(st, path), FILE));
        await assertFails(getBytes(ref(st, path)));
        await assertFails(uploadBytes(ref(st, path), FILE));
        await assertFails(deleteObject(ref(st, path)));
    });
    test('doctor cannot add files to an already submitted case', async () => {
        await assertFails(uploadBytes(ref(anon().storage(), `cases/${CASE_ID}/2-b.stl`), FILE));
    });
    test('rejects bad file types, bad paths and files over 50 MB', async () => {
        const st = anon().storage();
        await assertFails(uploadBytes(ref(st, `cases/${NEW_CASE_ID}/1-virus.exe`), FILE));
        await assertFails(uploadBytes(ref(st, 'cases/not-a-uuid/1-a.stl'), FILE));
        await assertFails(uploadBytes(ref(st, 'other/1-a.stl'), FILE));
        await assertFails(uploadBytes(ref(st, `cases/${NEW_CASE_ID}/3-big.zip`), new Uint8Array(50 * 1024 * 1024 + 1)));
    });
    test('technician can download but not delete', async () => {
        await assertSucceeds(getBytes(ref(tech().storage(), `cases/${CASE_ID}/1-a.stl`)));
        await assertFails(deleteObject(ref(tech().storage(), `cases/${CASE_ID}/1-a.stl`)));
    });
    test('admin can delete', async () => {
        await assertSucceeds(deleteObject(ref(admin().storage(), `cases/${CASE_ID}/1-a.stl`)));
    });
    test('a logged-in account that is not staff cannot download', async () => {
        await assertFails(getBytes(ref(stranger().storage(), `cases/${CASE_ID}/1-a.stl`)));
    });
});
