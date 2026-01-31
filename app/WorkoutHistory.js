// WorkoutHistory.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import useAuth from "../hooks/useAuth";

const RED = "#ff1a1a";

const WorkoutHistory = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch workouts
  useEffect(() => {
    if (!user) return;

    const fetchWorkouts = async () => {
      try {
        const q = query(
          collection(db, "workouts"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc"),
          limit(7)
        );
        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map((doc) => {
          const workout = doc.data();
          console.log("📦 Workout fetched:", workout);
          return {
            id: doc.id,
            ...workout, // include title, sets, timestamp, etc.
          };
        });

        setWorkouts(data);
      } catch (error) {
        console.error("❌ Error fetching workouts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [user]);

  const renderWorkout = ({ item }) => (
    <View style={styles.card}>
      {/* Use workoutTitle from Firestore */}
      <Text style={styles.cardTitle}>{item.workoutTitle || "Untitled Workout"}</Text>
  
      <Text style={styles.cardDate}>
        {item.timestamp?.seconds
          ? new Date(item.timestamp.seconds * 1000).toLocaleDateString()
          : "Unknown date"}
      </Text>
  
      {/* Show exercises & sets */}
      {item.exercises && item.exercises.length > 0 ? (
        item.exercises.map((exercise, idx) => (
          <View key={idx} style={{ marginBottom: 6 }}>
            <Text style={[styles.setText, { fontWeight: "bold", textTransform: "capitalize" }]}>{exercise.title}</Text>
            {exercise.sets && exercise.sets.length > 0 ? (
              exercise.sets.map((set, i) => (
                <Text key={i} style={styles.setText}>
                  Set {i + 1}: {set.lbs} lbs × {set.reps} reps
                </Text>
              ))
            ) : (
              <Text style={styles.setText}>No sets logged</Text>
            )}
          </View>
        ))
      ) : (
        <Text style={styles.setText}>No exercises logged</Text>
      )}
    </View>
  );
  

  return (
    <LinearGradient
      colors={["#000000", "#1a1a1a", "#1a1a1a", "#000000"]}
      style={styles.gradient}
    >
      <Text style={styles.title}>WORKOUT HISTORY</Text>

      {loading ? (
        <ActivityIndicator size="large" color={RED} style={{ marginTop: 50 }} />
      ) : workouts.length === 0 ? (
        <Text style={styles.emptyText}>No workouts logged yet.</Text>
      ) : (
        <FlatList
          data={workouts}
          renderItem={renderWorkout}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingTop: 100, // push content down a bit
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: "Orbitron_800ExtraBold",
    color: RED,
    textAlign: "center",
    marginBottom: 30,
    textShadowColor: RED,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 3,
  },
  list: {
    paddingBottom: 80,
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
  card: {
    backgroundColor: "rgba(255, 26, 26, 0.05)",
    borderColor: RED,
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  cardDate: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
  },
  setText: {
    color: "#fff",
    fontSize: 14,
    marginTop: 2,
  },
});

export default WorkoutHistory;
