// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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


const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
})

const db = getFirestore(app);

isSupported().then((supported) => {
    if (supported) {
        const analytics = getAnalytics(app);
        console.log('Firebase analytics intialized')
    } else {
        console.log('Firebase analytics not supported in this environment')
    }
})

export { auth, db };