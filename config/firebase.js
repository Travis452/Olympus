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
    const userRef = doc(db, "users", UserId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      let newExp = userData.exp + expToAdd;
      let newLevel = userData.level;

      const levelThresholds = [
        0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500,
      ];

      for (let i = 1; i < levelThresholds.length; i++) {
        if (newExp >= levelThresholds[i]) {
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
    } else {
      console.log("User not found in database");
      return null;
    }
  } catch (error) {
    console.error("Error updating EXP:", error);
  }
};

export { auth, db };
