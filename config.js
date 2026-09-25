// Site configuration. This file is public (it is sent to every visitor).
//
// Leave `firebase.apiKey` empty to run in DEMO mode (data is kept in the
// visitor's browser only, login is admin / admin).
// Fill `firebase` in (Firebase console → Project settings → Your apps → Web app)
// to go live: see docs/FIREBASE_SETUP_AR.md.
// These values are not secrets; security is enforced by firestore.rules,
// storage.rules and the Cloud Functions.
//
// Local testing on the Firebase Emulator: run `npm run dev` and open
// http://localhost:5500/?emulator (ignores the values below).
window.DG_CONFIG = {
    firebase: {
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        appId: ''
    },
    functionsRegion: 'me-central2',
    firebaseSdkVersion: '12.19.0',
    maxFileSizeMB: 50,
    maxFiles: 20
};
