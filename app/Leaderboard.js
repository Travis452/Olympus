import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../config/firebase";

const StrengthLeaderboard = () => {
  const [selectedCategory, setSelectedCategory] = useState("bestBench");
  const [leaders, setLeaders] = useState([]);

  const categories = {
    bestBench: "Bench Press",
    bestSquat: "Squat",
    bestDeadlift: "Deadlift",
  };

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const q = query(collection(db, "users"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filtered = data.filter((user) => user[selectedCategory]);

        const userMaxMap = new Map();

        filtered.forEach((user) => {
          const existing = userMaxMap.get(user.username);
          if (
            !existing ||
            user[selectedCategory] > existing[selectedCategory]
          ) {
            userMaxMap.set(user.username, user);
          }
        });

        const uniqueHighScores = Array.from(userMaxMap.values()).sort(
          (a, b) => b[selectedCategory] - a[selectedCategory]
        );

        setLeaders(uniqueHighScores);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchLeaders();
  }, [selectedCategory]);

  const renderItem = ({ item, index }) => {
    const imageUrl =
      item.profilePic?.trim() || "https://placehold.co/50x50?text=No+Pic";

    console.log("ProfilePic URL:", imageUrl);

    return (
      <View style={styles.leaderItem}>
        <Text style={styles.rank}>{index + 1}</Text>
        <Image
          source={
            item.profilePic
              ? { uri: item.profilePic }
              : require("../assets/images/default-profile.jpg")
          }
          style={styles.avatar}
        />
        <Text style={styles.username}>{item.username || item.firstName}</Text>
        <Text style={styles.points}>{item[selectedCategory]} lbs</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Strength Leaderboard</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          selectionColor="red"
          style={styles.picker}
        >
          {Object.entries(categories).map(([key, label]) => (
            <Picker.Item key={key} label={label} value={key} color="white" />
          ))}
        </Picker>
      </View>
      <FlatList
        data={leaders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  pickerWrapper: {
    alignItems: "center",
    marginBottom: 10,
  },
  picker: {
    width: "80%",
    backgroundColor: "black",
    borderRadius: 10,
  },
  leaderItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  rank: {
    fontSize: 18,
    width: 30,
    textAlign: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#eee",
  },
  username: {
    flex: 1,
    fontSize: 16,
  },
  points: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default StrengthLeaderboard;
