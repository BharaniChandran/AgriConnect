import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyAgriConnect2026Maharashtra',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'agriconnect-5e4bc.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://agriconnect-5e4bc-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'agriconnect-5e4bc',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'agriconnect-5e4bc.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1004325226218',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1004325226218:web:agriconnectweb'
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export default app;