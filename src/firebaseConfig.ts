// src/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNlR12brfyaSr4--8c1lxULPJ7A0C6_D4",
  authDomain: "quantatalk-messaging.firebaseapp.com",
  projectId: "quantatalk-messaging",
  storageBucket: "quantatalk-messaging.appspot.com",
  messagingSenderId: "980955297515",
  appId: "1:980955297515:web:6088b48e2eaf9b1373b0ae",
  measurementId: "G-614PW91WG4",  // Added comma here
  auth: {
    scopes: [
      'https://www.googleapis.com/auth/contacts.readonly',
      'https://www.googleapis.com/auth/contacts'
    ]
  }
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();