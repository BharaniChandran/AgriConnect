import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAA6oJiZVBGiRfh0PzQ_I1T2NKDuQ_9fns',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'agriconnect-5e4bc.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://agriconnect-5e4bc-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'agriconnect-5e4bc',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'agriconnect-5e4bc.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1004325226218',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1004325226218:web:b6a1e76de16b9a0a98f993',
  measurementId: 'G-PH9RFGBMPZ'
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export default app;