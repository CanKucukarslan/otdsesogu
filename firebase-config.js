// Your web app's Firebase configuration
// LÜTFEN BURAYI KENDİ FIREBASE PROJE BİLGİLERİNİZLE DOLDURUN
const firebaseConfig = {
    apiKey: "AIzaSyDa1p2Pfn5QfnwxWU2kBRhzaXvujrQSLKg",
    authDomain: "otds-a9c69.firebaseapp.com",
    projectId: "otds-a9c69",
    storageBucket: "otds-a9c69.firebasestorage.app",
    messagingSenderId: "1064020840580",
    appId: "1:1064020840580:web:47dcaa2ea922ba079fb2d1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Create global variables for easier access
const db = firebase.firestore();
const auth = firebase.auth();

// Explicitly assign to window to ensure global access across scripts
window.db = db;
window.auth = auth;
