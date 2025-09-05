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
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let analytics: Analytics | null = null;

// Initialize analytics only on client side
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics, auth, db, storage };

