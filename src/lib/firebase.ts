
"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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

export { app, db };
