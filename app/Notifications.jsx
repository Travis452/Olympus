import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { fetchNotifications, markAllNotificationsAsRead } from "../utils/notificationManager";
import useAuth from "../hooks/useAuth";
import { Heart, MessageCircle, UserPlus } from "lucide-react-native";

const RED = "#ff1a1a";

const Notifications = ({ navigation }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Mark all as read when screen loads
      markAllNotificationsAsRead(user.uid);
    }
  }, [user]);

  const loadNotifications = async () => {
    const result = await fetchNotifications(user.uid);
    if (result.success) {
      setNotifications(result.notifications);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const getTimeAgo = (date) => {
    if (!date) return "Just now";
    
    const timestamp = date.toDate ? date.toDate() : new Date(date);
    const seconds = Math.floor((new Date() - timestamp) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  const renderNotification = (notification) => {
    let icon, message;

    switch (notification.type) {
      case "follow":
        icon = <UserPlus color={RED} size={24} />;
        message = `${notification.actorUsername} started following you`;
        break;
      case "like":
        icon = <Heart color={RED} size={24} fill={RED} />;
        message = `${notification.actorUsername} liked your ${notification.workoutName}`;
        break;
      case "comment":
        icon = <MessageCircle color={RED} size={24} />;
        message = `${notification.actorUsername} commented on your ${notification.workoutName}`;
        break;
      default:
        return null;
    }

    return (
      <TouchableOpacity
        key={notification.id}
        style={[styles.notificationCard, !notification.read && styles.unreadCard]}
        onPress={() => {
          // Navigate based on type
          if (notification.type === "follow") {
            navigation.navigate("UserProfile", { userId: notification.actorId });
          }
          // Can add navigation for like/comment later
        }}
      >
        <View style={styles.iconContainer}>{icon}</View>
        
        <Image
          source={
            notification.actorProfilePic
              ? { uri: notification.actorProfilePic }
              : require("../assets/images/default-profile.jpg")
          }
          style={styles.profilePic}
        />
        
        <View style={styles.notificationContent}>
          <Text style={styles.notificationMessage}>{message}</Text>
          <Text style={styles.notificationTime}>{getTimeAgo(notification.timestamp)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={["#000", "#1a1a1a", "#000"]} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>NOTIFICATIONS</Text>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={RED} />
          }
        >
          {loading ? (
            <Text style={styles.emptyText}>Loading...</Text>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptyText}>
                You'll see notifications here when someone follows you, likes your workouts, or comments!
              </Text>
            </View>
          ) : (
            notifications.map(renderNotification)
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: "Orbitron_800ExtraBold",
    color: RED,
    textAlign: "center",
    marginVertical: 20,
    textShadowColor: RED,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 4,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: "Orbitron_700Bold",
    color: "#fff",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,26,26,0.05)",
    borderColor: "rgba(255,26,26,0.3)",
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  unreadCard: {
    backgroundColor: "rgba(255,26,26,0.1)",
    borderColor: RED,
  },
  iconContainer: {
    marginRight: 12,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: RED,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
});

export default Notifications;