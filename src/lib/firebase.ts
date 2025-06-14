import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration with environment variable support
const firebaseConfig = {
  apiKey: "AIzaSyDvPhMYx8a9YHscz271UEE95XKCUx720X0",
  authDomain: "tradejournal-b5c65.firebaseapp.com",
  projectId: "tradejournal-b5c65",
  storageBucket: "tradejournal-b5c65.firebasestorage.app",
  messagingSenderId: "989721088083",
  appId: "1:989721088083:web:0109776db27f293ea8f6a6",
  measurementId: "G-KEXKM4FEY6"
};
// Validate configuration in development
if (import.meta.env.DEV) {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => 
    !firebaseConfig[field as keyof typeof firebaseConfig] || 
    firebaseConfig[field as keyof typeof firebaseConfig].includes('your-')
  );
  
  if (missingFields.length > 0) {
    console.warn('⚠️ Firebase configuration incomplete. Missing or placeholder values for:', missingFields);
    console.warn('Please update your .env file or src/lib/firebase.ts with actual Firebase configuration.');
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
