/*
  FIDA FILAMENTS — Firebase connection settings (used ONLY for enquiries)
  1. Go to https://console.firebase.google.com and create a project.
  2. Left menu → Build → Firestore Database → Create database → Start in
     "production mode" → pick a location close to you (e.g. asia-south1).
  3. Project settings (gear icon) → General → scroll to "Your apps" →
     click the </> (Web) icon → register an app (any nickname) →
     copy the firebaseConfig object it shows you and paste the values below.
  4. After creating the database, go to Firestore → Rules tab and paste
     the rules from firestore-rules.txt (given separately), then Publish.
*/
const firebaseConfig = {
    apiKey: "AIzaSyBi8IaEnbO8PtBKVZWKAOM_HNyK9L4724w",
    authDomain: "fida-filaments.firebaseapp.com",
    projectId: "fida-filaments",
    storageBucket: "fida-filaments.firebasestorage.app",
    messagingSenderId: "20560315014",
    appId: "1:20560315014:web:7056943ee347a1712d8707"
  };
  
  (function () {
    const isConfigured = !Object.values(firebaseConfig).some(v => String(v).startsWith('PASTE_'));
    if (isConfigured && window.firebase && !window.firebase.apps.length) {
      window.firebase.initializeApp(firebaseConfig);
      window.FidaFirestore = window.firebase.firestore();
    }
  })();