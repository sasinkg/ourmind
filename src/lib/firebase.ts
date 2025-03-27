// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Replace with your actual config:
const firebaseConfig = {
    apiKey: "AIzaSyCy3T4m1wvLXAhhEDbeXuJp7Wh8AbujE5M",
    authDomain: "ourmind-dcf95.firebaseapp.com",
    projectId: "ourmind-dcf95",
    storageBucket: "ourmind-dcf95.firebasestorage.app",
    messagingSenderId: "666091991726",
    appId: "1:666091991726:web:8887a1c8578df9d6ff333f"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

