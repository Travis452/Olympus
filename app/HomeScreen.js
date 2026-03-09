import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import useAuth from "../hooks/useAuth";
import Splits from "../components/Splits";
import { SPLITS } from "../data/SPLITS";

const HomeScreen = () => {
  console.log("Navigated to HomeScreen");
  const navigation = useNavigation();
  const { user } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch streak when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchStreak();
      }
    }, [user])
  );

  const fetchStreak = async () => {
    try {
      if (!user) return;
      
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const streak = userData.currentStreak || 0;
        const lastWorkoutDate = userData.lastWorkoutDate?.toDate?.() || null;
        
        // Check if streak is still valid (within 48 hours)
        if (lastWorkoutDate) {
          const hoursSinceLastWorkout = (new Date() - lastWorkoutDate) / (1000 * 60 * 60);
          if (hoursSinceLastWorkout > 48) {
            // Streak broken - show 0
            setCurrentStreak(0);
          } else {
            setCurrentStreak(streak);
          }
        } else {
          setCurrentStreak(0);
        }
      }
    } catch (error) {
      console.error("Error fetching streak:", error);
    } finally {
      setLoading(false);
    }
  };

  const onPress = () => {
    navigation.navigate("CustomWorkout");
  };

  const getRandomWorkout = () => {
    const randomSplit = SPLITS[Math.floor(Math.random() * SPLITS.length)];
    const randomMuscleGroup =
      randomSplit.muscles[
        Math.floor(Math.random() * randomSplit.muscles.length)
      ];
    return {
      selectedWorkout: {
        ...randomMuscleGroup,
        exercises: randomMuscleGroup.exercises || [],
      },
      selectedSplitId: randomSplit.id,
    };
  };

  const handleRandomWorkout = () => {
    const { selectedWorkout, selectedSplitId } = getRandomWorkout();
    navigation.navigate("StartWorkout", {
      selectedWorkout,
      selectedSplitId,
    });
  };

  const renderItem = ({ item }) => {
    if (item.type === "static") {
      return item.component;
    } else if (item.type === "splits") {
      return <Splits />;
    }
  };

  const data = [
    // Streak Counter Card (NEW!)
    {
      type: "static",
      component: (
        <View style={styles.streakCard}>
          <View style={styles.streakContent}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View style={styles.streakInfo}>
              <Text style={styles.streakNumber}>{currentStreak}</Text>
              <Text style={styles.streakLabel}>DAY STREAK</Text>
            </View>
          </View>
          {currentStreak > 0 && (
            <Text style={styles.streakSubtext}>
              Keep it going! Work out within 48 hours.
            </Text>
          )}
          {currentStreak === 0 && (
            <Text style={styles.streakSubtext}>
              Start your streak! Log a workout today.
            </Text>
          )}
        </View>
      ),
    },

    {
      type: "static",
      component: (
        <View style={styles.card}>
          <Text style={styles.title}>START WORKOUT</Text>
          <Text style={styles.kicker}>Quick Start</Text>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleRandomWorkout}
            >
              <Text style={styles.primaryBtnText}>RANDOM WORKOUT</Text>
            </TouchableOpacity>
          </View>
        </View>
      ),
    },

    {
      type: "static",
      component: (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>CUSTOM WORKOUTS</Text>
          <Text style={styles.subtle}>My Custom Workouts</Text>
          <View style={styles.btnRowLeft}>
            <TouchableOpacity style={styles.hollowBtn} onPress={onPress}>
              <Text style={styles.hollowBtnText}>NEW WORKOUT</Text>
            </TouchableOpacity>
          </View>
        </View>
      ),
    },

    {
      type: "static",
      component: (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>PRE-MADE WORKOUTS</Text>
        </View>
      ),
    },

    { type: "splits" },
  ];

  return (
    <ImageBackground
      source={require("../assets/images/HomeScreenBG.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* dark overlay for contrast */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

const RED = "#ff1a1a";

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 16,
  },

  // Streak Card (NEW!)
  streakCard: {
    backgroundColor: "rgba(255,26,26,0.08)",
    borderColor: RED,
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    shadowColor: RED,
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 10,
  },
  streakContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  streakEmoji: {
    fontSize: 60,
    marginRight: 16,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    color: RED,
    fontSize: 48,
    fontFamily: "Orbitron_800ExtraBold",
    letterSpacing: 2,
    textShadowColor: RED,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  streakLabel: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Orbitron_700Bold",
    letterSpacing: 2,
    marginTop: -4,
  },
  streakSubtext: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Orbitron_400Regular",
    textAlign: "center",
  },

  // cards
  card: {
    backgroundColor: "rgba(10,10,10,0.35)",
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    backdropFilter: undefined,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 8,
    elevation: 6,
  },

  // headings
  title: {
    color: RED,
    fontSize: 28,
    letterSpacing: 3,
    fontFamily: "Orbitron_700Bold",
    marginBottom: 6,
    textTransform: "uppercase",
    textShadowColor: RED,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  sectionTitle: {
    color: RED,
    fontSize: 22,
    letterSpacing: 2,
    fontFamily: "Orbitron_700Bold",
    marginBottom: 8,
    textTransform: "uppercase",
    textShadowColor: RED,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  kicker: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    marginBottom: 12,
    fontFamily: "Orbitron_400Regular",
  },
  subtle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginTop: 2,
    fontFamily: "Orbitron_400Regular",
  },

  // buttons
  btnRow: {
    width: "100%",
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnRowLeft: {
    width: "100%",
    marginTop: 12,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  primaryBtn: {
    width: "100%",
    height: 48,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: RED,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,26,26,0.08)",
    shadowColor: RED,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 8,
  },
  primaryBtnText: {
    color: RED,
    letterSpacing: 2,
    fontSize: 14,
    fontFamily: "Orbitron_700Bold",
  },
  hollowBtn: {
    paddingHorizontal: 18,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: RED,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    shadowColor: RED,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 6,
  },
  hollowBtnText: {
    color: RED,
    letterSpacing: 2,
    fontSize: 13,
    fontFamily: "Orbitron_700Bold",
  },
});

export default HomeScreen;