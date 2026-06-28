import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDXeD4ae4UZcKDfNBJOHa8QkhyiZ6nbkfc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "odyssey-talent-platform.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "odyssey-talent-platform",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "odyssey-talent-platform.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "729868513653",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:729868513653:web:084bcaa89efa3e7de4633c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PLACEHOLDER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export core services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics — only initializes in browser (not SSR/Node)
export let analytics = null;
isSupported().then((yes) => {
  if (yes) analytics = getAnalytics(app);
});

// Messaging — only available in browsers with service worker support
export let messaging = null;
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
  }
} catch (e) {
  console.warn('FCM not supported in this environment:', e.message);
}

export default app;
