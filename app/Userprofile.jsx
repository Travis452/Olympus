import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { getTierFromLevel, getExpForNextLevel, getExpRequiredForLevel, LEVELS } from "../config/levels";
import BackButton from "../components/BackButton";
import useAuth from "../hooks/useAuth";
import { followUser, unfollowUser, isFollowing, getFollowCounts } from "../utils/followUtils";

const RED = "#ff1a1a";

const UserProfile = ({ route }) => {
  const { userId } = route.params;
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });

  // RGB pulsing animation
  const rgbAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse through RGB colors
    Animated.loop(
      Animated.sequence([
        Animated.timing(rgbAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(rgbAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    fetchUserData();
    checkFollowStatus();
    fetchFollowCounts();
  }, [userId]);

  const checkFollowStatus = async () => {
    if (user) {
      const status = await isFollowing(user.uid, userId);
      setFollowing(status);
    }
  };

  const fetchFollowCounts = async () => {
    const counts = await getFollowCounts(userId);
    setFollowCounts(counts);
  };

  const handleFollowToggle = async () => {
    if (!user) return;

    if (following) {
      const result = await unfollowUser(user.uid, userId);
      if (result.success) {
        setFollowing(false);
        setFollowCounts(prev => ({ ...prev, followers: prev.followers - 1 }));
      }
    } else {
      const result = await followUser(user.uid, userId);
      if (result.success) {
        setFollowing(true);
        setFollowCounts(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    }
  };

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
  const expRequiredForCurrentLevel = getExpRequiredForLevel(level);
  const totalExpForNextLevel = expRequiredForCurrentLevel + expForNext;
  
  // Calculate EXP within current level for progress bar
  const expInCurrentLevel = exp - expRequiredForCurrentLevel;
  const progressWidth = `${(expInCurrentLevel / expForNext) * 100}%`;

  return (
    <LinearGradient colors={["#000", "#1a1a1a", "#000"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <SafeAreaView>
          <View style={styles.header}>
            <View style={{ width: 60 }}>
              <BackButton />
            </View>
            <Text style={styles.title}>USER PROFILE</Text>
            <View style={{ width: 60 }} />
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
              
              {/* Follower/Following Counts */}
              <View style={styles.followCountsContainer}>
                <Text style={styles.followCount}>
                  <Text style={styles.followCountNumber}>{followCounts.followers}</Text> Followers
                </Text>
                <Text style={styles.followCount}>
                  <Text style={styles.followCountNumber}>{followCounts.following}</Text> Following
                </Text>
              </View>
            </View>
          </View>

          {/* Follow/Unfollow Button */}
          {user && user.uid !== userId && (
            <TouchableOpacity 
              style={[styles.followButton, following && styles.followingButton]}
              onPress={handleFollowToggle}
            >
              <Text style={[styles.followButtonText, following && styles.followingButtonText]}>
                {following ? "UNFOLLOW" : "FOLLOW"}
              </Text>
            </TouchableOpacity>
          )}

          {/* EXP + Level */}
          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>Level {level}</Text>
            
            {/* Pulsing RGB Border */}
            <Animated.View
              style={[
                styles.expBarWrapper,
                {
                  shadowColor: rgbAnim.interpolate({
                    inputRange: [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1],
                    outputRange: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#8b00ff', '#ff0000'],
                  }),
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 4,
                  elevation: 5,
                },
              ]}
            >
              <View style={styles.expBarContainer}>
                <View style={[styles.expBarFill, { width: progressWidth }]} />
              </View>
            </Animated.View>
            
            <Text style={styles.expText}>{exp} / {totalExpForNextLevel} EXP</Text>
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
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontFamily: "Orbitron_800ExtraBold",
    color: RED,
    textAlign: "center",
    textShadowColor: RED,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
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
  followCountsContainer: {
    flexDirection: "row",
    marginTop: 12,
    gap: 16,
  },
  followCount: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  followCountNumber: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 16,
  },
  followButton: {
    alignSelf: "center",
    width: "50%",
    borderWidth: 2,
    borderColor: RED,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 25,
    backgroundColor: RED,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 6,
  },
  followingButton: {
    backgroundColor: "transparent",
  },
  followButtonText: {
    color: "#000",
    fontFamily: "Orbitron_700Bold",
    fontSize: 14,
    letterSpacing: 1.5,
  },
  followingButtonText: {
    color: RED,
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
  expBarWrapper: {
    width: "80%",
    marginTop: 10,
    borderRadius: 8,
  },
  expBarContainer: {
    width: "100%",
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.8)",
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
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