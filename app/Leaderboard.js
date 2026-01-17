import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Image } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../config/firebase";
import { LinearGradient } from "expo-linear-gradient";

const RED = "#ff1a1a";

const StrengthLeaderboard = () => {
  const [selectedCategory, setSelectedCategory] = useState("bestBench");
  const [leaders, setLeaders] = useState([]);

  const categories = {
    bestBench: "Bench Press",
    bestSquat: "Squat",
    bestDeadlift: "Deadlift",
  };

  useFocusEffect(
    useCallback(() => {
      const fetchLeaders = async () => {
        try {
          const q = query(
            collection(db, "users"),
            orderBy(selectedCategory, "desc")
          );

          const querySnapshot = await getDocs(q);
          const data = querySnapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));

          const filtered = data.filter((user) => user[selectedCategory]);
          setLeaders(filtered);
        } catch (error) {
          console.error("Error fetching leaderboard:", error);
        }
      };

      fetchLeaders();
    }, [selectedCategory])
  );

  const renderItem = ({ item, index }) => {
    const hasPic = !!item.profilePic?.trim();

    return (
      <View style={styles.card}>
        <View style={styles.left}>
          <View style={styles.rankPill}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>

          <View style={styles.avatarRing}>
            <Image
              source={
                hasPic
                  ? { uri: item.profilePic }
                  : require("../assets/images/default-profile.jpg")
              }
              style={styles.avatar}
            />
          </View>
        </View>

        <View style={styles.mid}>
          <Text style={styles.username} numberOfLines={1}>
            {item.username || item.firstName || "Unknown"}
          </Text>
          <Text style={styles.subText}>{categories[selectedCategory]}</Text>
        </View>

        <View style={styles.right}>
          <Text style={styles.points}>{item[selectedCategory]} lbs</Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={["#000000", "#050816", "#190000"]}
      style={styles.gradient}
    >
      <Text style={styles.title}>STRENGTH LEADERBOARD</Text>

      <View style={styles.pickerCard}>
        <View style={styles.pickerInner}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            dropdownIconColor={RED}
            style={styles.picker}
          >
            {Object.entries(categories).map(([key, label]) => (
              <Picker.Item key={key} label={label} value={key} color="#fff" />
            ))}
          </Picker>
        </View>
      </View>

      <FlatList
        data={leaders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No leaderboard data yet.</Text>
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    padding: 20,
    paddingTop: 55,
  },

  title: {
    fontSize: 22,
    fontFamily: "Orbitron_800ExtraBold",
    color: RED,
    textAlign: "center",
    marginBottom: 18,
    textShadowColor: RED,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 3,
  },

  // Picker neon card
  pickerCard: {
    backgroundColor: "rgba(255,26,26,0.05)",
    borderColor: RED,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    shadowColor: RED,
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 8,
  },
  pickerLabel: {
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
    fontSize: 12,
    letterSpacing: 1,
  },
  pickerInner: {
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    color: "#fff",
  },

  // Row card
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,26,26,0.05)",
    borderColor: RED,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    shadowColor: RED,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 8,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginRight: 10,
  },

  rankPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: RED,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  rankText: {
    color: RED,
    fontFamily: "Orbitron_700Bold",
    fontSize: 12,
  },

  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: RED,
    padding: 2,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    backgroundColor: "#111",
  },

  mid: {
    flex: 1,
    justifyContent: "center",
  },
  username: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  subText: {
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
    fontSize: 12,
  },

  right: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 10,
  },
  points: {
    color: RED,
    fontFamily: "Orbitron_700Bold",
    fontSize: 14,
    letterSpacing: 1,
  },

  emptyText: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginTop: 30,
  },
});

export default StrengthLeaderboard;
