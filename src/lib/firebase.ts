// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALVkB5jfl6O0CLNBtGmaX87Kc6UBu2TLE",
  authDomain: "safai-saathi.firebaseapp.com",
  projectId: "safai-saathi",
  storageBucket: "safai-saathi.firebasestorage.app",
  messagingSenderId: "6015045092",
  appId: "1:6015045092:web:67cef730d1d5f45b0d4bf1",
  measurementId: "G-VXSJC8JN9Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
