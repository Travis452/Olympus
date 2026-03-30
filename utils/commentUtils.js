import { collection, addDoc, query, orderBy, getDocs, doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Add a comment to a feed post
 */
export const addComment = async (postId, userId, commentText) => {
  try {
    // Get user data for username and profile pic
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return { success: false, error: "User not found" };
    }
    
    const userData = userSnap.data();
    
    const comment = {
      userId: userId,
      username: userData.username || userData.firstName || "User",
      profilePic: userData.profilePic || null,
      text: commentText,
      timestamp: new Date(),
    };
    
    // Add to comments subcollection
    const commentsRef = collection(db, "feedPosts", postId, "comments");
    const docRef = await addDoc(commentsRef, comment);
    
    // Increment commentCount on the post
    const postRef = doc(db, "feedPosts", postId);
    await updateDoc(postRef, {
      commentCount: increment(1),
    });
    
    console.log("✅ Comment added with ID:", docRef.id);
    return { success: true, commentId: docRef.id, comment };
    
  } catch (error) {
    console.error("Error adding comment:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch comments for a feed post
 */
export const fetchComments = async (postId) => {
  try {
    const commentsRef = collection(db, "feedPosts", postId, "comments");
    const q = query(commentsRef, orderBy("timestamp", "asc"));
    
    const snapshot = await getDocs(q);
    
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return { success: true, comments };
    
  } catch (error) {
    console.error("Error fetching comments:", error);
    return { success: false, error: error.message, comments: [] };
  }
};