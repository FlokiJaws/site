import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Remplacez par votre configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBNarfBcszWsD6cEHmuzyK52T1qVWrE5lA",
    authDomain: "sitegamecash.firebaseapp.com",
    databaseURL: "https://sitegamecash-default-rtdb.firebaseio.com",
    projectId: "sitegamecash",
    storageBucket: "sitegamecash.firebasestorage.app",
    messagingSenderId: "537055839969",
    appId: "1:537055839969:web:97f5ea92341a4da8d819a0",
    measurementId: "G-SMQ22X2KG0"
  };

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };