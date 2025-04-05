import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "quantatalk-messaging.firebaseapp.com",
  projectId: "quantatalk-messaging",
  storageBucket: "quantatalk-messaging.appspot.com",
  messagingSenderId: "980955297515",
  appId: "1:980955297515:web:6088b48e2eaf9b1373b0ae",
  measurementId: "G-614PW91WG4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
