// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA3Cn9e9j8iOx6RNQoYfCVUOpLXJmNKPPI",
  authDomain: "verdu-shop.firebaseapp.com",
  projectId: "verdu-shop",
  storageBucket: "verdu-shop.appspot.com",
  messagingSenderId: "188984786995",
  appId: "1:188984786995:web:5c6ce0dd1e82975d1da346"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

export default app; 

