import { initializeApp, getApps } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

import { LEVELS } from "./levels";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAFU3LDI099OWf_X2VIu1n9zBlrfjqRzJs",
  authDomain: "olympus-43444.firebaseapp.com",
  projectId: "olympus-43444",
  storageBucket: "olympus-43444.firebasestorage.app",
  messagingSenderId: "939160989913",
  appId: "1:939160989913:web:c5c7beedc9cb58efe1cec8",
  measurementId: "G-3DQ4Y38MQW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Create User Profile with EXP & Level
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
      { merge: true },
    );

    console.log("User profile created with EXP and Level");
  } catch (error) {
    console.error("Error creating user profile:", error);
  }
};

// Fetch User EXP
// Fetch User EXP
export const getUserEXP = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();

      // Convert Firestore Timestamps to ISO strings (serializable)
      return {
        ...userData,
        createdAt:
          userData.createdAt?.toDate?.().toISOString() ||
          new Date().toISOString(),
        updatedAt:
          userData.updatedAt?.toDate?.().toISOString() ||
          new Date().toISOString(),
      };
    } else {
      console.log("No user data found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user EXP:", error);
    return null;
  }
};

// Fetch Previous Workout for an Exercise (Fix)
const getPreviousWorkout = async (userId, exerciseTitle) => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, "workouts"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(1),
      ),
    );

    if (!querySnapshot.empty) {
      const workoutData = querySnapshot.docs[0].data();
      const matchedExercise = workoutData.exercises.find(
        (exercise) =>
          exercise.title.toLowerCase() === exerciseTitle.toLowerCase(),
      );

      if (matchedExercise) {
        console.log(
          `Previous workout found for ${exerciseTitle}:`,
          matchedExercise.sets,
        );
        return matchedExercise.sets.length > 0 ? matchedExercise.sets[0] : null;
      }
    }

    console.log(`No previous data for ${exerciseTitle}`);
    return null;
  } catch (error) {
    console.error("Error fetching previous workout:", error);
    return null;
  }
};

export const updateUserStats = async (userId, stats, isVerified = false) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.log("User not found in database");
      return;
    }

    const userData = userSnap.data();
    let updatedStats = {};

    // Bench
    if (stats.bestBench && stats.bestBench > (userData.bestBench || 0)) {
      updatedStats.bestBench = stats.bestBench;
      if (isVerified && stats.bestBench > (userData.verifiedBench || 0)) {
        updatedStats.verifiedBench = stats.bestBench;
      }
    }

    // Squat
    if (stats.bestSquat && stats.bestSquat > (userData.bestSquat || 0)) {
      updatedStats.bestSquat = stats.bestSquat;
      if (isVerified && stats.bestSquat > (userData.verifiedSquat || 0)) {
        updatedStats.verifiedSquat = stats.bestSquat;
      }
    }

    // Deadlift
    if (
      stats.bestDeadlift &&
      stats.bestDeadlift > (userData.bestDeadlift || 0)
    ) {
      updatedStats.bestDeadlift = stats.bestDeadlift;
      if (isVerified && stats.bestDeadlift > (userData.verifiedDeadlift || 0)) {
        updatedStats.verifiedDeadlift = stats.bestDeadlift;
      }
    }

    if (Object.keys(updatedStats).length > 0) {
      await updateDoc(userRef, updatedStats);
      console.log("User PR stats updated:", updatedStats);
    } else {
      console.log("No PR stats to update.");
    }
  } catch (error) {
    console.error("Error updating user PR stats:", error);
  }
};

//  Update User EXP & Level
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
      `User ${userId} updated to Level ${newLevel} with ${newExp} EXP`,
    );

    // Return only serializable data (no Firestore Timestamps)
    return { exp: newExp, level: newLevel };
  } catch (error) {
    console.error("Error updating EXP:", error);
  }
};

// Strength Benchmarks
const STRENGTH_BENCHMARKS = {
  bench: [225, 275, 315],
  squat: [225, 315, 405, 495],
  deadlift: [405, 495, 585],
};

// Exercise Tags
const EXERCISE_TAGS = {
  "Flat Bench Press": "bench",
  "Barbell Squats": "squat",
  Deadlift: "deadlift",
};

// Strength Multiplier
const getStrengthMultiplier = (liftWeight, bodyWeight) => {
  const ratio = liftWeight / bodyWeight;
  if (ratio >= 2.5) return 2.0;
  if (ratio >= 2.0) return 1.5;
  if (ratio >= 1.5) return 1.2;
  return 1.0;
};

// Progressive Overload EXP (Fix)
const calculateProgressiveOverloadEXP = (
  prevWeight,
  prevReps,
  newWeight,
  newReps,
) => {
  let expGain = 0;

  if (newWeight > prevWeight) {
    expGain += 25;
    console.log(
      `Weight increased from ${prevWeight} to ${newWeight} (+25 EXP)`,
    );
  }

  if (newReps > prevReps) {
    expGain += 15;
    console.log(`Reps increased from ${prevReps} to ${newReps} (+15 EXP)`);
  }

  return expGain;
};

// Award EXP (Now Progressive Overload EXP is Applied Correctly)
export const awardEXP = async (userId, exercises, bodyWeight, isVerified) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error("User not found in database");
      return null;
    }

    const userData = userSnap.data();
    let exp = typeof userData.exp === "number" ? userData.exp : 0;
    let level = typeof userData.level === "number" ? userData.level : 1;
    let totalEXP = 0;
    let requiresVerification = false;

    // 🏆 First workout ever = flat bonus
    const isFirstWorkout =
      !userData.completedWorkouts || userData.completedWorkouts === 0;
    if (isFirstWorkout) {
      totalEXP += 100;
      console.log("🏆 First workout bonus: +100 EXP");
    }

    for (const exercise of exercises) {
      const { title, sets } = exercise;
      const liftType = EXERCISE_TAGS[title]; // defined only for Big 3

      // Get last logged workout for this exercise
      const previousWorkout = await getPreviousWorkout(userId, title);
      let prevWeight = previousWorkout
        ? parseFloat(previousWorkout.lbs || 0)
        : 0;
      let prevReps = previousWorkout ? parseInt(previousWorkout.reps || 0) : 0;

      for (const set of sets) {
        const weight = parseFloat(set.lbs || 0);
        const reps = parseInt(set.reps || 0);

        if (!previousWorkout) {
          // ✅ First time doing THIS lift → reps-based EXP
          const baseEXP = reps * 2;
          totalEXP += baseEXP;
          console.log(`🆕 First time doing ${title}: +${baseEXP} EXP`);
        } else {
          // ✅ Progressive overload
          const overloadEXP = calculateProgressiveOverloadEXP(
            prevWeight,
            prevReps,
            weight,
            reps,
          );
          totalEXP += overloadEXP;
        }

        // 🏆 Big 3: only these get benchmark checks + leaderboard relevance
        if (liftType && STRENGTH_BENCHMARKS[liftType]?.includes(weight)) {
          totalEXP += 250;
          requiresVerification = true;
          console.log(
            `🏋️ Benchmark hit! ${title} - ${weight} lbs requires verification.`,
          );
        }
      }
    }

    exp += totalEXP;

    await updateDoc(userRef, {
      exp,
      level,
      completedWorkouts: (userData.completedWorkouts || 0) + 1,
    });

    console.log(`User ${userId} gained ${totalEXP} EXP. New total: ${exp}`);

    // Return only serializable data (no Firestore Timestamps)
    return { exp, level };
  } catch (error) {
    console.error("Error awarding EXP:", error);
  }
};

export { auth, db, storage };
