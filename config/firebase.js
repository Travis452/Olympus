// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { LEVELS } from "./levels";

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
  measurementId: "G-3DQ4Y38MQW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);
const auth = getAuth(app);

export const createUserProfile = async (userId, email) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        email,
        exp: 0,
        level: 1,
      },
      { merge: true }
    );

    console.log("User profle created with EXP and Level");
  } catch (error) {
    console.error("Error creating user profile:", error);
  }
};

export const getUserEXP = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      console.log("No user data found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user EXP:", error);
    return null;
  }
};

export const updateUserEXP = async (userId, expToAdd) => {
  try {
    if (!userId) {
      console.error("UserId is undefined in updateUserEXP");
      return;
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.log("User not found in database");
      return null;
    }

    const userData = userSnap.data();
    let newExp = (userData.exp || 0) + expToAdd;
    let newLevel = userData.level || 1;

    // Use LEVELS.js to determine level progression
    for (let i = 0; i < LEVELS.length; i++) {
      if (newExp >= LEVELS[i].expRequired) {
        newLevel = i + 1;
      } else {
        break;
      }
    }

    await updateDoc(userRef, {
      exp: newExp,
      level: newLevel,
    });

    console.log(
      `User ${userId} updated to Level ${newLevel} with ${newExp} EXP`
    );
    return { exp: newExp, level: newLevel };
  } catch (error) {
    console.error("Error updating EXP:", error);
  }
};

const STRENGTH_BENCHMARKS = {
  bench: [225, 275, 315],
  squat: [225, 315, 405, 495],
  deadlift: [405, 495, 585],
};

const getStrengthMultiplier = (liftWeight, bodyWeight) => {
  const ratio = liftWeight / bodyWeight;

  if (ratio >= 2.5) return 2.0;
  if (ratio >= 2.0) return 1.5;
  if (ratio >= 1.5) return 1.2;
  return 1.0;
};

export { auth, db };
