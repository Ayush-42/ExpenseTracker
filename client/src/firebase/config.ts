import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// Get these values from your Firebase Console: https://console.firebase.google.com/
// Create a .env file in the client directory with your Firebase config

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

// Debug: Log config (without exposing full API key)
if (import.meta.env.DEV) {
  console.log('🔧 Firebase Config Check:', {
    hasApiKey: !!apiKey && apiKey !== "your-api-key",
    apiKeyPrefix: apiKey ? `${apiKey.substring(0, 10)}...` : 'missing',
    authDomain,
    projectId,
  });
}

if (!apiKey || apiKey === "your-api-key" || !authDomain || !projectId) {
  console.error(
    "⚠️ Firebase configuration is missing!\n" +
    "Please create a .env file in the client directory with your Firebase config.\n" +
    "See SETUP.md or README.md for instructions."
  );
}

const firebaseConfig = {
  apiKey: apiKey || "your-api-key",
  authDomain: authDomain || "your-project.firebaseapp.com",
  projectId: projectId || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Apple Auth Provider
export const appleProvider = new OAuthProvider('apple.com');

export default app;

