import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { getTierFromLevel, getExpForNextLevel, getExpRequiredForLevel, LEVELS } from "../config/levels";
import BackButton from "../components/BackButton";

const RED = "#ff1a1a";

const UserProfile = ({ route }) => {
  const { userId } = route.params;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      } else {
        console.log("User not found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#000", "#1a1a1a", "#000"]} style={styles.gradient}>
        <ActivityIndicator size="large" color={RED} style={{ marginTop: 100 }} />
      </LinearGradient>
    );
  }

  if (!userData) {
    return (
      <LinearGradient colors={["#000", "#1a1a1a", "#000"]} style={styles.gradient}>
        <BackButton />
        <Text style={styles.emptyText}>User not found</Text>
      </LinearGradient>
    );
  }

  const exp = userData.exp || 0;
  
  // Calculate actual level from LEVELS array
  let level = 1;
  for (let i = 0; i < LEVELS.length; i++) {
    if (exp >= LEVELS[i].expRequired) {
      level = LEVELS[i].level;
    } else {
      break;
    }
  }
  
  const tierName = getTierFromLevel(level);
  const expForNext = getExpForNextLevel(level);
  const expRequired = getExpRequiredForLevel(level);
  const expProgress = exp - expRequired;
  const progressWidth = `${(expProgress / expForNext) * 100}%`;

  return (
    <LinearGradient colors={["#000", "#1a1a1a", "#000"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <SafeAreaView>
          <View style={styles.header}>
            <BackButton />
            <Text style={styles.title}>USER PROFILE</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Profile Picture & Username */}
          <View style={styles.user}>
            <Image
              source={
                userData.profilePic
                  ? { uri: userData.profilePic }
                  : require("../assets/images/default-profile.jpg")
              }
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.userInfo}>
              <Text style={styles.username}>
                {userData.username || userData.firstName || "User"}
              </Text>
              <Text style={styles.tierText}>{tierName}</Text>
              <Text style={styles.joinedText}>
                Joined {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "Recently"}
              </Text>
            </View>
          </View>

          {/* EXP + Level */}
          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>Level {level}</Text>
            <View style={styles.expBarContainer}>
              <View style={[styles.expBarFill, { width: progressWidth }]} />
            </View>
            <Text style={styles.expText}>{expProgress} / {expForNext} EXP</Text>
          </View>

          {/* Stats */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>STATS</Text>
            <Text style={styles.statText}>
              Height: {userData.height || "Not set"}
            </Text>
            <Text style={styles.statText}>
              Weight: {userData.weight || "Not set"} lbs
            </Text>
            <Text style={styles.statText}>
              Best Bench: {userData.bestBench || 0} lbs
            </Text>
            <Text style={styles.statText}>
              Best Squat: {userData.bestSquat || 0} lbs
            </Text>
            <Text style={styles.statText}>
              Best Deadlift: {userData.bestDeadlift || 0} lbs
            </Text>
          </View>
        </SafeAreaView>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "Orbitron_800ExtraBold",
    color: RED,
    textAlign: "center",
    textShadowColor: RED,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 3,
  },
  user: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: RED,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  userInfo: {
    marginLeft: 15,
  },
  username: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  tierText: {
    fontSize: 14,
    fontFamily: "Orbitron_700Bold",
    color: RED,
    marginTop: 2,
    letterSpacing: 2,
  },
  joinedText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginTop: 4,
  },
  levelContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  levelText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  expBarContainer: {
    width: "80%",
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.2)",
    marginTop: 10,
  },
  expBarFill: {
    height: "100%",
    backgroundColor: "#ff1a1a",
    borderRadius: 6,
  },
  expText: {
    color: "#fff",
    fontWeight: "600",
    marginTop: 5,
  },
  card: {
    backgroundColor: "rgba(255,26,26,0.05)",
    borderColor: RED,
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: RED,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  cardTitle: {
    color: RED,
    fontSize: 20,
    fontFamily: "Orbitron_700Bold",
    marginBottom: 12,
    textAlign: "center",
    textShadowColor: RED,
    textShadowRadius: 5,
  },
  statText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 6,
  },
  emptyText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 40,
  },
});

export default UserProfile;