import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Validate username format
 */
export const validateUsernameFormat = (username) => {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: "Username is required" };
  }

  const trimmed = username.trim();

  // Length check
  if (trimmed.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters" };
  }
  if (trimmed.length > 20) {
    return { valid: false, error: "Username must be 20 characters or less" };
  }

  // Character check (letters, numbers, underscores only)
  const validPattern = /^[a-zA-Z0-9_]+$/;
  if (!validPattern.test(trimmed)) {
    return { valid: false, error: "Username can only contain letters, numbers, and underscores" };
  }

  return { valid: true, username: trimmed };
};

/**
 * Check if username is available (case-insensitive)
 */
export const isUsernameAvailable = async (username, currentUserId) => {
  try {
    const lowerUsername = username.toLowerCase();
    
    // Check if username exists in index
    const usernamesRef = collection(db, "usernames");
    const q = query(usernamesRef, where("lowercase", "==", lowerUsername));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { available: true };
    }

    // Check if it's the current user's own username
    const existingDoc = snapshot.docs[0];
    if (existingDoc.data().userId === currentUserId) {
      return { available: true, isOwnUsername: true };
    }

    return { available: false, error: "Username is already taken" };
  } catch (error) {
    console.error("Error checking username availability:", error);
    return { available: false, error: "Error checking username" };
  }
};

/**
 * Reserve username in index (call after successful user update)
 */
export const reserveUsername = async (username, userId) => {
  try {
    const lowerUsername = username.toLowerCase();
    const usernameDocRef = doc(db, "usernames", lowerUsername);
    
    await setDoc(usernameDocRef, {
      userId,
      username, // original case
      lowercase: lowerUsername,
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error reserving username:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Release old username from index (call before updating to new username)
 */
export const releaseUsername = async (oldUsername) => {
  try {
    if (!oldUsername) return { success: true };
    
    const lowerUsername = oldUsername.toLowerCase();
    const usernameDocRef = doc(db, "usernames", lowerUsername);
    
    await deleteDoc(usernameDocRef);
    return { success: true };
  } catch (error) {
    console.error("Error releasing username:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Complete username validation and reservation flow
 */
export const validateAndReserveUsername = async (newUsername, userId, oldUsername = null) => {
  // Step 1: Validate format
  const formatCheck = validateUsernameFormat(newUsername);
  if (!formatCheck.valid) {
    return { success: false, error: formatCheck.error };
  }

  const trimmedUsername = formatCheck.username;

  // Step 2: Check availability
  const availabilityCheck = await isUsernameAvailable(trimmedUsername, userId);
  if (!availabilityCheck.available) {
    return { success: false, error: availabilityCheck.error };
  }

  // Step 3: If updating (not first time), release old username
  if (oldUsername && oldUsername.toLowerCase() !== trimmedUsername.toLowerCase()) {
    await releaseUsername(oldUsername);
  }

  // Step 4: Reserve new username
  const reserveResult = await reserveUsername(trimmedUsername, userId);
  if (!reserveResult.success) {
    return { success: false, error: "Failed to reserve username" };
  }

  return { success: true, username: trimmedUsername };
};