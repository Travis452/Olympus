// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAFU3LDI099OWf_X2VIu1n9zBlrfjqRzJs",
    authDomain: "olympus-43444.firebaseapp.com",
    projectId: "olympus-43444",
    storageBucket: "olympus-43444.appspot.com",
    messagingSenderId: "939160989913",
    appId: "1:939160989913:web:c5c7beedc9cb58efe1cec8",
    measurementId: "G-3DQ4Y38MQW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app)