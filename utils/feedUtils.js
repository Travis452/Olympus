import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Create a feed post when a workout is completed
 */
export const createFeedPost = async (userId, workoutData, expGained) => {
  try {
    // Get user data for profile pic and username
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.error("User not found");
      return { success: false, error: "User not found" };
    }
    
    const userData = userSnap.data();
    
    // Create feed post object
    const feedPost = {
      userId: userId,
      username: userData.username || userData.firstName || "User",
      profilePic: userData.profilePic || null,
      workoutName: workoutData.workoutTitle || "Workout",
      exercises: workoutData.exercises || [], // Store full exercise data
      exerciseCount: workoutData.exercises.length,
      expGained: expGained,
      duration: workoutData.duration || 0,
      timestamp: new Date(),
      likes: [], // Array of userIds who liked this post
      likeCount: 0,
      commentCount: 0, // Track number of comments
    };
    
    // Add to feedPosts collection
    const docRef = await addDoc(collection(db, "feedPosts"), feedPost);
    
    console.log("✅ Feed post created with ID:", docRef.id);
    return { success: true, postId: docRef.id };
    
  } catch (error) {
    console.error("Error creating feed post:", error);
    return { success: false, error: error.message };
  }
};