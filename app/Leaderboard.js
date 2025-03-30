import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db } from "../config/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

const levels = ["Beginner", "Human", "Hero", "Titan"];

const Leaderboard = () => {
  const [selectedLevel, setSelectedLevel] = useState("Beginner");
  const [benchLeaders, setBenchLeaders] = useState([]);
  const [squatLeaders, setSquatLeaders] = useState([]);
  const [deadliftLeaders, setDeadliftLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      await fetchTopLifts("bestBench", setBenchLeaders);
      await fetchTopLifts("bestSquat", setSquatLeaders);
      await fetchTopLifts("bestDeadlift", setDeadliftLeaders);
    };

    fetchLeaders();
  }, [selectedLevel]);

  const fetchTopLifts = async (liftType, setter) => {
    try {
      const q = query(
        collection(db, "users"),
        where("levelName", "==", selectedLevel), // Make sure you store a level name string in user data
        orderBy(liftType, "desc"),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      const leaders = querySnapshot.docs.map((doc) => doc.data());
      setter(leaders);
    } catch (error) {
      console.error("Error fetching leaders:", error);
    }
  };

  const renderLeaders = (leaders, liftType) => (
    <View style={styles.liftContainer}>
      <Text style={styles.liftTitle}>
        Top {liftType} ({selectedLevel} level)
      </Text>
      {leaders.length > 0 ? (
        leaders.map((leader, index) => (
          <Text key={index} style={styles.leaderText}>
            {index + 1}. {leader.firstName || "User"} - {leader[liftType]} lbs
          </Text>
        ))
      ) : (
        <Text style={styles.leaderText}>No data found.</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Leaderboard</Text>
      <Picker
        selectedValue={selectedLevel}
        onValueChange={(itemValue) => setSelectedLevel(itemValue)}
        style={styles.picker}
      >
        {levels.map((level) => (
          <Picker.Item key={level} label={level} value={level} />
        ))}
      </Picker>

      {renderLeaders(benchLeaders, "bestBench")}
      {renderLeaders(squatLeaders, "bestSquat")}
      {renderLeaders(deadliftLeaders, "bestDeadlift")}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  picker: {
    marginBottom: 20,
  },
  liftContainer: {
    marginBottom: 30,
  },
  liftTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  leaderText: {
    fontSize: 16,
    marginVertical: 4,
  },
});

export default Leaderboard;
