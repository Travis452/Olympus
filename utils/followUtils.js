import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { notifyFollow } from "./notificationTriggers";

/**
 * Follow a user
 */
export const followUser = async (currentUserId, targetUserId) => {
  try {
    const currentUserRef = doc(db, "users", currentUserId);
    const targetUserRef = doc(db, "users", targetUserId);

    // Get current user's data for notification
    const currentUserSnap = await getDoc(currentUserRef);
    const currentUserData = currentUserSnap.data();
    const currentUsername = currentUserData?.username || "Someone";
    const currentProfilePic = currentUserData?.profilePic || null;

    // Add targetUserId to current user's following array
    await updateDoc(currentUserRef, {
      following: arrayUnion(targetUserId),
    });

    // Add currentUserId to target user's followers array
    await updateDoc(targetUserRef, {
      followers: arrayUnion(currentUserId),
    });

    // Send push notification to target user
    await notifyFollow(targetUserId, currentUserId, currentUsername, currentProfilePic);

    return { success: true };
  } catch (error) {
    console.error("Error following user:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (currentUserId, targetUserId) => {
  try {
    const currentUserRef = doc(db, "users", currentUserId);
    const targetUserRef = doc(db, "users", targetUserId);

    // Remove targetUserId from current user's following array
    await updateDoc(currentUserRef, {
      following: arrayRemove(targetUserId),
    });

    // Remove currentUserId from target user's followers array
    await updateDoc(targetUserRef, {
      followers: arrayRemove(currentUserId),
    });

    return { success: true };
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if current user is following target user
 */
export const isFollowing = async (currentUserId, targetUserId) => {
  try {
    const currentUserRef = doc(db, "users", currentUserId);
    const currentUserSnap = await getDoc(currentUserRef);

    if (currentUserSnap.exists()) {
      const following = currentUserSnap.data().following || [];
      return following.includes(targetUserId);
    }

    return false;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
};

/**
 * Get follower and following counts
 */
export const getFollowCounts = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        followers: (userData.followers || []).length,
        following: (userData.following || []).length,
      };
    }

    return { followers: 0, following: 0 };
  } catch (error) {
    console.error("Error getting follow counts:", error);
    return { followers: 0, following: 0 };
  }
};