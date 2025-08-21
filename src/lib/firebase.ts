
"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "tarefa360",
  appId: "1:1061924451857:web:3529dd0f0083a15d8523b0",
  storageBucket: "tarefa360.firebasestorage.app",
  apiKey: "AIzaSyD0IRonzcjuM60LAGg54J6gaSEA7nEgd0Y",
  authDomain: "tarefa360.firebaseapp.com",
  messagingSenderId: "1061924451857",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Initialize App Check
if (typeof window !== "undefined") {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LcrwP0pAAAAAPp_4v-A-E8f2p_aN-pE-fC_aB_c'), // Chave pública do reCAPTCHA v3 (exemplo)
    isTokenAutoRefreshEnabled: true
  });
}


export { app, db };
