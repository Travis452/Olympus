import { useState, useEffect } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Bell } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { getUnreadCount } from "../utils/notificationManager";
import useAuth from "../hooks/useAuth";

const RED = "#ff1a1a";

const BellIcon = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
    }
  }, [user]);

  const loadUnreadCount = async () => {
    const result = await getUnreadCount(user.uid);
    if (result.success) {
      setUnreadCount(result.count);
    }
  };

  const handlePress = () => {
    navigation.navigate("Notifications");
    setUnreadCount(0); // Reset count when opening notifications
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Bell color={RED} size={28} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: RED,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default BellIcon;