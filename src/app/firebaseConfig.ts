// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider  } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1-R9ZVMzD7VxFv17GhLsDqD9OdXGUduo",
  authDomain: "firesafety-dd848.firebaseapp.com",
  projectId: "firesafety-dd848",
  storageBucket: "firesafety-dd848.firebasestorage.app",
  messagingSenderId: "568834827362",
  appId: "1:568834827362:web:0d5afb94a72b2a616e9d3b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Make sure this export statement exists exactly like this
export { auth, db, googleProvider };