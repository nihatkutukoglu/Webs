import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAlw8jlMN8ZW2-Sb-yOeuWF1AsJ6y2bDWY",
  authDomain: "bandirma-yemek.firebaseapp.com",
  projectId: "bandirma-yemek",
  storageBucket: "bandirma-yemek.firebasestorage.app",
  messagingSenderId: "669229189476",
  appId: "1:669229189476:web:1ef603240ac649d43d9271",
  measurementId: "G-N8CRBBT1LJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Servisleri dışa aktar
export const db = getFirestore(app);
export const auth = getAuth(app);
export const appId = "bandirma-yemek-public";
