import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Daily motivation messages
const DAILY_MESSAGES = [
  "Show me you're serious. Log your session.",
  "Time to earn your place. Track your progress.",
  "Are we doing this today or not?",
];

// Day 3 disappointed messages
const DAY_3_MESSAGES = [
  "I can't want this more than you do.",
  "You've come this far. Don't quit on me now.",
  "One day off becomes two. Then three. Then nothing.",
];

// Day 4+ harsh messages (with EXP loss)
const HARSH_MESSAGES = [
  "You're losing progress. -10 EXP.",
  "I thought you wanted this. Prove me wrong.",
  "Are you really going to break your streak? For what?",
  "Another 10 EXP gone. When will you show up?",
  "Talk is cheap. Prove it in the gym.",
];

// Request notification permissions
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF1A1A',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

// Schedule daily reminder at user's preferred time
export async function scheduleDailyReminder(hour = 18, minute = 0) {
  // Cancel existing daily reminders
  await cancelDailyReminder();

  const trigger = {
    hour,
    minute,
    repeats: true,
  };

  const randomMessage = DAILY_MESSAGES[Math.floor(Math.random() * DAILY_MESSAGES.length)];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Olympus',
      body: randomMessage,
      sound: true,
    },
    trigger,
    identifier: 'daily-reminder',
  });

  console.log(`✅ Daily reminder scheduled for ${hour}:${minute}`);
}

// Cancel daily reminder
export async function cancelDailyReminder() {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const dailyReminder = scheduledNotifications.find(n => n.identifier === 'daily-reminder');
  
  if (dailyReminder) {
    await Notifications.cancelScheduledNotificationAsync('daily-reminder');
    console.log('❌ Daily reminder cancelled');
  }
}

// Check inactivity and apply EXP decay
export async function checkInactivityAndDecay(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.log('User not found');
      return;
    }

    const userData = userSnap.data();
    const lastWorkoutDate = userData.lastWorkoutDate?.toDate?.() || null;

    if (!lastWorkoutDate) {
      console.log('No previous workouts');
      return;
    }

    const now = new Date();
    const hoursSinceLastWorkout = (now - lastWorkoutDate) / (1000 * 60 * 60);
    const daysSinceLastWorkout = Math.floor(hoursSinceLastWorkout / 24);

    console.log(`Days since last workout: ${daysSinceLastWorkout}`);

    // Day 3: Disappointed message (no EXP loss yet)
    if (daysSinceLastWorkout === 3) {
      const message = DAY_3_MESSAGES[Math.floor(Math.random() * DAY_3_MESSAGES.length)];
      await sendNotification('Olympus', message);
      console.log('📢 Day 3 warning sent');
    }

    // Day 4, 8, 12, 16... Apply EXP decay
    if (daysSinceLastWorkout >= 4 && daysSinceLastWorkout % 4 === 0) {
      const currentEXP = userData.exp || 0;
      const newEXP = Math.max(0, currentEXP - 10); // Don't go below 0

      await updateDoc(userRef, {
        exp: newEXP,
      });

      const message = HARSH_MESSAGES[Math.floor(Math.random() * HARSH_MESSAGES.length)];
      await sendNotification('Olympus', message);
      
      console.log(`💔 EXP decay applied: ${currentEXP} → ${newEXP}`);
    }
  } catch (error) {
    console.error('Error checking inactivity:', error);
  }
}

// Send immediate notification
export async function sendNotification(title, body) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null, // Send immediately
  });
}

// Start background inactivity checker (runs daily)
export async function scheduleInactivityChecker(userId) {
  // Run every day at noon to check for EXP decay
  const trigger = {
    hour: 12,
    minute: 0,
    repeats: true,
  };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Inactivity Check',
      body: 'Background check', // This won't show, just triggers the check
      data: { type: 'inactivity-check', userId },
    },
    trigger,
    identifier: 'inactivity-checker',
  });

  console.log('✅ Inactivity checker scheduled');
}

// Listen for notifications (for background tasks)
export function setupNotificationListener(userId) {
  const subscription = Notifications.addNotificationReceivedListener(async (notification) => {
    const data = notification.request.content.data;
    
    if (data?.type === 'inactivity-check') {
      await checkInactivityAndDecay(userId);
    }
  });

  return subscription;
}

// Initialize notification system for user
export async function initializeNotifications(userId, reminderHour = 18, reminderMinute = 0) {
  try {
    // Request permissions
    await registerForPushNotificationsAsync();

    // Schedule daily reminder
    await scheduleDailyReminder(reminderHour, reminderMinute);

    // Schedule inactivity checker
    await scheduleInactivityChecker(userId);

    console.log('✅ Notification system initialized');
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
}

// Clean up all notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('❌ All notifications cancelled');
}
