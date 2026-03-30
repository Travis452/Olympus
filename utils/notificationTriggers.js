import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { sendPushNotification } from './notificationUtils';
import { createNotification } from './notificationManager';

/**
 * Send notification when someone follows you
 */
export async function notifyFollow(targetUserId, followerId, followerUsername, followerProfilePic) {
  try {
    const userRef = doc(db, 'users', targetUserId);
    const userSnap = await getDoc(userRef);
    
    // Create in-app notification
    await createNotification(targetUserId, 'follow', {
      actorId: followerId,
      actorUsername: followerUsername,
      actorProfilePic: followerProfilePic,
    });
    
    // Send push notification
    if (userSnap.exists() && userSnap.data().pushToken) {
      await sendPushNotification(
        userSnap.data().pushToken,
        '👤 New Follower',
        `${followerUsername} started following you!`,
        { type: 'follow', actorId: followerId }
      );
    }
  } catch (error) {
    console.error('Error sending follow notification:', error);
  }
}

/**
 * Send notification when someone likes your workout
 */
export async function notifyLike(postOwnerId, likerId, likerUsername, likerProfilePic, workoutName) {
  try {
    const userRef = doc(db, 'users', postOwnerId);
    const userSnap = await getDoc(userRef);
    
    // Create in-app notification
    await createNotification(postOwnerId, 'like', {
      actorId: likerId,
      actorUsername: likerUsername,
      actorProfilePic: likerProfilePic,
      workoutName: workoutName,
    });
    
    // Send push notification
    if (userSnap.exists() && userSnap.data().pushToken) {
      await sendPushNotification(
        userSnap.data().pushToken,
        '❤️ New Like',
        `${likerUsername} liked your ${workoutName}`,
        { type: 'like' }
      );
    }
  } catch (error) {
    console.error('Error sending like notification:', error);
  }
}

/**
 * Send notification when someone comments on your workout
 */
export async function notifyComment(postOwnerId, commenterId, commenterUsername, commenterProfilePic, workoutName, commentText) {
  try {
    const userRef = doc(db, 'users', postOwnerId);
    const userSnap = await getDoc(userRef);
    
    // Create in-app notification
    await createNotification(postOwnerId, 'comment', {
      actorId: commenterId,
      actorUsername: commenterUsername,
      actorProfilePic: commenterProfilePic,
      workoutName: workoutName,
      commentText: commentText,
    });
    
    // Send push notification
    if (userSnap.exists() && userSnap.data().pushToken) {
      const preview = commentText.length > 50 
        ? commentText.substring(0, 50) + '...' 
        : commentText;
        
      await sendPushNotification(
        userSnap.data().pushToken,
        '💬 New Comment',
        `${commenterUsername} commented on your ${workoutName}: "${preview}"`,
        { type: 'comment' }
      );
    }
  } catch (error) {
    console.error('Error sending comment notification:', error);
  }
}