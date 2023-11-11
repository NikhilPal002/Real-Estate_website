// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "real-estate-30c22.firebaseapp.com",
  projectId: "real-estate-30c22",
  storageBucket: "real-estate-30c22.appspot.com",
  messagingSenderId: "984858405961",
  appId: "1:984858405961:web:473b343f27d1f44deb2398"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);