import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Note: In a real app, these would be in .env
// For this demo/MVP, the user will need to provide their own config
const firebaseConfig = {
  apiKey: "AIzaSyBB0ft4LRKFUBiVUDQRzh9BZmzMxN9P008",
  authDomain: "quan-ly-nha-tro-8f700.firebaseapp.com",
  projectId: "quan-ly-nha-tro-8f700",
  storageBucket: "quan-ly-nha-tro-8f700.firebasestorage.app",
  messagingSenderId: "630113919721",
  appId: "1:630113919721:web:04e4accda3726284bcc678"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
