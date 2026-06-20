import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDXeD4ae4UZcKDfNBJOHa8QkhyiZ6nbkfc",
  authDomain: "odyssey-talent-platform.firebaseapp.com",
  projectId: "odyssey-talent-platform",
  storageBucket: "odyssey-talent-platform.firebasestorage.app",
  messagingSenderId: "729868513653",
  appId: "1:729868513653:web:084bcaa89efa3e7de4633c",
  measurementId: "G-PLACEHOLDER" // Replace with your actual Measurement ID from Firebase Console
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
