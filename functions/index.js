// DENTALGATE — Cloud Functions (region: me-central2, Dammam).
//   submitCase  : anyone (doctors)  -> register a case after its files were uploaded
//   createStaff : admins only       -> create a technician account
//   deleteStaff : admins only       -> delete a technician account
// Never log patient data (names, notes): Cloud Logging is not stored in Saudi Arabia by default.
'use strict';

const { setGlobalOptions } = require('firebase-functions/v2');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { getAuth } = require('firebase-admin/auth');

setGlobalOptions({ region: 'me-central2', maxInstances: 5 });
initializeApp();

const db = getFirestore();

const CASE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FILES = 20;
const ROLES = ['CAD/CAM Designer', 'Ceramist', '3D Printing Tech'];
const CASE_FIELDS = { doctor: 120, clinic: 120, patient: 120, shade: 40 };

function text(value, max, required) {
    const s = String(value ?? '').trim();
    if ((required && !s) || s.length > max) throw new HttpsError('invalid-argument', 'Invalid field');
    return s;
}

async function requireAdmin(req) {
    if (!req.auth) throw new HttpsError('unauthenticated', 'Login required');
    const me = await db.doc(`staff/${req.auth.uid}`).get();
    if (!me.exists || me.get('isAdmin') !== true) throw new HttpsError('permission-denied', 'Admins only');
}

exports.submitCase = onCall(async (req) => {
    const data = req.data || {};
    const caseId = String(data.caseId ?? '');
    if (!CASE_ID.test(caseId)) throw new HttpsError('invalid-argument', 'Invalid case id');

    const fields = {};
    for (const [key, max] of Object.entries(CASE_FIELDS)) fields[key] = text(data[key], max, true);
    fields.notes = text(data.notes, 2000, false);

    // The uploaded files are the source of truth, not what the browser claims.
    const [objects] = await getStorage().bucket().getFiles({ prefix: `cases/${caseId}/` });
    if (objects.length > MAX_FILES) throw new HttpsError('invalid-argument', 'Too many files');
    const files = objects
        .map((o) => ({
            name: String((o.metadata.metadata && o.metadata.metadata.originalName) || o.name.split('/').pop()).slice(0, 200),
            path: o.name,
            size: Number(o.metadata.size) || 0
        }))
        .sort((a, b) => a.path.localeCompare(b.path, 'en', { numeric: true }));

    const caseRef = db.doc(`cases/${caseId}`);
    const counterRef = db.doc('meta/counters');
    const caseNo = await db.runTransaction(async (tx) => {
        const [counter, existing] = await Promise.all([tx.get(counterRef), tx.get(caseRef)]);
        if (existing.exists) throw new HttpsError('already-exists', 'Case already submitted');
        const next = (counter.get('caseNo') || 0) + 1;
        tx.set(counterRef, { caseNo: next }, { merge: true });
        tx.create(caseRef, {
            caseNo: next,
            ...fields,
            files,
            status: 'pending',
            createdAt: FieldValue.serverTimestamp()
        });
        return next;
    });

    return { caseNo };
});

exports.createStaff = onCall(async (req) => {
    await requireAdmin(req);
    const data = req.data || {};
    const name = text(data.name, 120, true);
    const email = String(data.email ?? '').trim().toLowerCase();
    const password = String(data.password ?? '');
    const role = ROLES.includes(data.role) ? data.role : ROLES[0];

    if (!EMAIL.test(email)) throw new HttpsError('invalid-argument', 'Invalid email');
    if (password.length < 8) throw new HttpsError('invalid-argument', 'Password must be at least 8 characters');

    let user;
    try {
        user = await getAuth().createUser({ email, password, displayName: name });
    } catch (err) {
        if (err.code === 'auth/email-already-exists') throw new HttpsError('already-exists', 'Email already registered');
        throw new HttpsError('invalid-argument', 'Could not create user');
    }

    try {
        await db.doc(`staff/${user.uid}`).set({
            name,
            email,
            role,
            isAdmin: false,
            createdAt: FieldValue.serverTimestamp()
        });
    } catch (err) {
        await getAuth().deleteUser(user.uid);
        throw new HttpsError('internal', 'Could not save staff profile');
    }
    return { id: user.uid };
});

exports.deleteStaff = onCall(async (req) => {
    await requireAdmin(req);
    const id = String((req.data && req.data.id) ?? '');
    if (!id) throw new HttpsError('invalid-argument', 'Missing id');
    if (id === req.auth.uid) throw new HttpsError('failed-precondition', 'You cannot delete your own account');

    // Remove the staff profile first: that alone revokes all access (see firestore.rules).
    await db.doc(`staff/${id}`).delete();
    try {
        await getAuth().deleteUser(id);
    } catch (err) {
        if (err.code !== 'auth/user-not-found') throw new HttpsError('internal', 'Could not delete login');
    }
    return { ok: true };
});
