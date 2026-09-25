// Local test environment (no Firebase account needed).
// Run with:  npm run dev
// It is started by `firebase emulators:exec`, which points firebase-admin at the
// emulators. This script fills them with test accounts + a sample case, then
// serves the website at http://localhost:5500/?emulator until you press Ctrl+C.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const PORT = 5500;
const PROJECT_ID = 'demo-dentalgate';
const ROOT = fileURLToPath(new URL('..', import.meta.url));

export const ACCOUNTS = {
    admin: { email: 'admin@dentalgate.test', password: 'admin12345', name: 'Admin', role: 'Admin', isAdmin: true },
    tech: { email: 'tech@dentalgate.test', password: 'tech12345', name: 'Eng. Mohamed Sami', role: 'CAD/CAM Designer', isAdmin: false }
};

async function seed() {
    initializeApp({ projectId: PROJECT_ID, storageBucket: `${PROJECT_ID}.appspot.com` });
    const auth = getAuth();
    const db = getFirestore();

    for (const a of Object.values(ACCOUNTS)) {
        const user = await auth.createUser({ email: a.email, password: a.password, displayName: a.name });
        await db.doc(`staff/${user.uid}`).set({
            name: a.name, email: a.email, role: a.role, isAdmin: a.isAdmin, createdAt: FieldValue.serverTimestamp()
        });
    }

    const caseId = '3f1c2b9a-0d4e-4a57-9c1b-2e6f8a7d5c40';
    const path = `cases/${caseId}/1-Sample_Scan.stl`;
    const content = Buffer.from('solid sample\nendsolid sample\n');
    await getStorage().bucket().file(path).save(content, { metadata: { metadata: { originalName: 'Sample_Scan.stl' } } });
    await db.doc('meta/counters').set({ caseNo: 1 });
    await db.doc(`cases/${caseId}`).set({
        caseNo: 1,
        doctor: 'Dr. Omar Taher',
        clinic: 'Lumineer Center',
        patient: 'Sample Patient',
        shade: 'A2',
        notes: 'Sample case created by the emulator seed.',
        files: [{ name: 'Sample_Scan.stl', path, size: content.length }],
        status: 'pending',
        createdAt: FieldValue.serverTimestamp()
    });
}

const TYPES = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png'
};
const PUBLIC = /^\/(index\.html|config\.js|manifest\.json|icon\.svg|css\/[\w.-]+|js\/[\w.-]+)$/;

function serve() {
    const server = http.createServer(async (req, res) => {
        let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
        if (path === '/') path = '/index.html';
        if (!PUBLIC.test(path)) {
            res.writeHead(404).end('Not found');
            return;
        }
        try {
            const body = await readFile(join(ROOT, normalize(path)));
            res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
            res.end(body);
        } catch {
            res.writeHead(404).end('Not found');
        }
    });
    return new Promise((resolve) => server.listen(PORT, resolve));
}

await seed();
await serve();
console.log(`
============================================================
  DENTALGATE is running on the Firebase Emulator (test data)

  Website:        http://localhost:${PORT}/?emulator
  Staff login:    http://localhost:${PORT}/?emulator#staff
     Admin:       ${ACCOUNTS.admin.email} / ${ACCOUNTS.admin.password}
     Technician:  ${ACCOUNTS.tech.email} / ${ACCOUNTS.tech.password}
  Emulator UI:    http://localhost:4000  (see stored data)

  Everything is deleted when you stop. Press Ctrl+C to stop.
============================================================
`);
