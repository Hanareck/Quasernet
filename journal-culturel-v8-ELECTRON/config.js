// CONFIGURATION FIREBASE

var firebaseConfig = {
    apiKey: "AIzaSyDGlMNexeE4IyvSyoB00v3ar9j4noGIIqA",
    authDomain: "mon-journal-culturel.firebaseapp.com",
    projectId: "mon-journal-culturel",
    storageBucket: "mon-journal-culturel.firebasestorage.app",
    messagingSenderId: "1011760927530",
    appId: "1:1011760927530:web:00b837981281b70fcd4453"
};

var app, auth, db;
var firebaseInitialized = false;

try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    firebaseInitialized = true;
} catch (error) {
    console.error("Erreur Firebase:", error);
}
