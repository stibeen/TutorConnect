// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth,GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDD4ovhho-gIZzrjqx9KmOewY2wY5g3bcg",
  authDomain: "tutor-connect-eba49.firebaseapp.com",
  projectId: "tutor-connect-eba49",
  storageBucket: "tutor-connect-eba49.firebasestorage.app",
  messagingSenderId: "702186696434",
  appId: "1:702186696434:web:7c4d332016af5a281faa6b",
  measurementId: "G-5T19BVKBWB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export {auth,provider};