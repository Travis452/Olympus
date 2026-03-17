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

import { LEVELS, getTierFromLevel, getExpForNextLevel } from "./levels";

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
        lastWorkoutDate:
          userData.lastWorkoutDate?.toDate?.().toISOString() || null,
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

// NEW EXP CALCULATION SYSTEM - Rewards PRs and Progress
const calculateSetEXP = async (userId, exerciseName, weight, reps) => {
  let expGain = 0;

  // Get user's personal record for this exercise
  const previousWorkout = await getPreviousWorkout(userId, exerciseName);
  
  if (!previousWorkout) {
    // First time doing this exercise - base EXP for completing it
    expGain = 20; // Just showing up and doing it
    console.log(`🆕 First time doing ${exerciseName}: +${expGain} EXP`);
    return expGain;
  }

  const prevWeight = parseFloat(previousWorkout.lbs || 0);
  const prevReps = parseInt(previousWorkout.reps || 0);
  const prevVolume = prevWeight * prevReps;
  const newVolume = weight * reps;

  // TIER 1: Personal Records - BIG REWARDS 🔥
  if (weight > prevWeight && reps >= prevReps) {
    // Weight PR!
    expGain = 100;
    console.log(`🏆 WEIGHT PR! ${exerciseName}: ${prevWeight} → ${weight} lbs (+100 EXP)`);
  } else if (weight === prevWeight && reps > prevReps) {
    // Rep PR at same weight!
    expGain = 75;
    console.log(`🏆 REP PR! ${exerciseName}: ${prevReps} → ${reps} reps (+75 EXP)`);
  } else if (newVolume > prevVolume) {
    // Volume PR (total weight × reps increased)
    expGain = 50;
    console.log(`📈 Volume PR! ${exerciseName}: ${prevVolume} → ${newVolume} (+50 EXP)`);
  }
  // TIER 2: Progressive Overload - SOLID GAINS 💪
  else if (weight > prevWeight) {
    // Increased weight (but fewer reps)
    expGain = 40;
    console.log(`⬆️ Weight increase: ${prevWeight} → ${weight} lbs (+40 EXP)`);
  } else if (reps > prevReps) {
    // Increased reps (but lower weight)
    expGain = 30;
    console.log(`⬆️ Rep increase: ${prevReps} → ${reps} reps (+30 EXP)`);
  }
  // TIER 3: Maintenance - BASE EXP ✅
  else if (weight === prevWeight && reps === prevReps) {
    // Same as last time - consistency matters
    expGain = 15;
    console.log(`✅ Matched previous: ${weight} lbs × ${reps} reps (+15 EXP)`);
  } else {
    // Decreased performance - still showed up
    expGain = 5;
    console.log(`💪 Consistency: completed set (+5 EXP)`);
  }

  return expGain;
};

// Award EXP (Now with Streak Tracking!)
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

      for (const set of sets) {
        const weight = parseFloat(set.lbs || 0);
        const reps = parseInt(set.reps || 0);

        // Calculate EXP for this set based on PRs and progress
        const setEXP = await calculateSetEXP(userId, title, weight, reps);
        totalEXP += setEXP;

        // 🏆 Big 3 Benchmark Bonus (225, 315, 405, 495, 585, 675)
        if (liftType && STRENGTH_BENCHMARKS[liftType]?.includes(weight)) {
          totalEXP += 250;
          requiresVerification = true;
          console.log(
            `🏋️ BENCHMARK HIT! ${title} - ${weight} lbs (+250 BONUS EXP)`,
          );
        }
      }
    }

    exp += totalEXP;

    // Calculate new level based on EXP
    for (let i = 0; i < LEVELS.length; i++) {
      if (exp >= LEVELS[i].expRequired) {
        level = i + 1;
      } else {
        break;
      }
    }

    // 🔥 STREAK CALCULATION
    const now = new Date();
    const lastWorkoutDate = userData.lastWorkoutDate?.toDate?.() || null;
    let currentStreak = userData.currentStreak || 0;

    if (!lastWorkoutDate) {
      // First workout ever
      currentStreak = 1;
      console.log("🔥 First workout! Streak started: 1 day");
    } else {
      const hoursSinceLastWorkout = (now - lastWorkoutDate) / (1000 * 60 * 60);
      
      if (hoursSinceLastWorkout <= 48) {
        // Within 48 hours - increment streak
        currentStreak += 1;
        console.log(`🔥 Streak continued! Now at ${currentStreak} days`);
      } else {
        // Broke streak - reset to 1
        console.log(`💔 Streak broken after ${currentStreak} days. Resetting to 1.`);
        currentStreak = 1;
      }
    }

    await updateDoc(userRef, {
      exp,
      level,
      completedWorkouts: (userData.completedWorkouts || 0) + 1,
      lastWorkoutDate: now,
      currentStreak: currentStreak,
    });

    console.log(`User ${userId} gained ${totalEXP} EXP. New total: ${exp}`);
    console.log(`🔥 Current streak: ${currentStreak} days`);

    // Return only serializable data (no Firestore Timestamps)
    return { exp, level, currentStreak };
  } catch (error) {
    console.error("Error awarding EXP:", error);
    return null;
  }
};

export { auth, db, storage };