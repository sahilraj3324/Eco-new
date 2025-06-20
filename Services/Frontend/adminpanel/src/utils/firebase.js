import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAy0Yj6yW8cCsXEAcYafUrTn8Bmh-4llLs",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "senior-5c96a.firebaseapp.com",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://senior-5c96a-default-rtdb.firebaseio.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "senior-5c96a",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "senior-5c96a.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "652023010346",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:652023010346:web:fe74365dc105558c155f53",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-K75ZVNQTQ6"
  };

console.log('🔥 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  environment: import.meta.env.NODE_ENV || 'development'
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };