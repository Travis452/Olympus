import { collection, addDoc, query, orderBy, getDocs, where, doc, updateDoc, limit } from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Create a notification in Firestore
 */
export const createNotification = async (userId, type, data) => {
  try {
    const notification = {
      userId: userId, // Who receives this notification
      type: type, // 'follow', 'like', 'comment'
      ...data, // actorUsername, actorProfilePic, workoutName, commentText, etc.
      read: false,
      timestamp: new Date(),
    };
    
    const notificationsRef = collection(db, "users", userId, "notifications");
    const docRef = await addDoc(notificationsRef, notification);
    
    console.log("✅ Notification created:", docRef.id);
    return { success: true, notificationId: docRef.id };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch notifications for a user
 */
export const fetchNotifications = async (userId, limitCount = 50) => {
  try {
    const notificationsRef = collection(db, "users", userId, "notifications");
    const q = query(notificationsRef, orderBy("timestamp", "desc"), limit(limitCount));
    
    const snapshot = await getDocs(q);
    
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return { success: true, notifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, notifications: [] };
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (userId, notificationId) => {
  try {
    const notificationRef = doc(db, "users", userId, "notifications", notificationId);
    await updateDoc(notificationRef, { read: true });
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false };
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const notificationsRef = collection(db, "users", userId, "notifications");
    const q = query(notificationsRef, where("read", "==", false));
    
    const snapshot = await getDocs(q);
    
    const updatePromises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { read: true })
    );
    
    await Promise.all(updatePromises);
    
    console.log("✅ All notifications marked as read");
    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false };
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (userId) => {
  try {
    const notificationsRef = collection(db, "users", userId, "notifications");
    const q = query(notificationsRef, where("read", "==", false));
    
    const snapshot = await getDocs(q);
    
    return { success: true, count: snapshot.size };
  } catch (error) {
    console.error("Error getting unread count:", error);
    return { success: false, count: 0 };
  }
};