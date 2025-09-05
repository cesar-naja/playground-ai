// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBe5hnCzRw1YFSAFwjKOskJF3TSHMahSiY",
  authDomain: "tech-tour-b6c88.firebaseapp.com",
  projectId: "tech-tour-b6c88",
  storageBucket: "tech-tour-b6c88.firebasestorage.app",
  messagingSenderId: "1040643045995",
  appId: "1:1040643045995:web:5df9e969a5d73b7efecf2e",
  measurementId: "G-G2XMMMSHSE"
};

// Initialize Firebase (with check to prevent re-initialization)
let app: FirebaseApp;
let analytics: Analytics | null = null;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize services
auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);

// Initialize analytics only on client side
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics, auth, db, storage };

