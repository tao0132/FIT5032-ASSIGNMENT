// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// *************************************************************** //
// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB1Ipz08DVkqYqKxCbintGigABn82xHqIc",
    authDomain: "fit5032-nfp-wellness-e219a.firebaseapp.com",
    projectId: "fit5032-nfp-wellness-e219a",
    storageBucket: "fit5032-nfp-wellness-e219a.firebasestorage.app",
    messagingSenderId: "878056680267",
    appId: "1:878056680267:web:f2496c765f6cabf44256ce",
    measurementId: "G-XKHWZTXDS1"
  };
// *************************************************************** //

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize and export Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
