// Splits.js
import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur"; // 🔥 for glass effect
import { SPLITS } from "../data/SPLITS";

const Splits = () => {
  const navigation = useNavigation();

  const onPressSplit = (selectedSplitId) => {
    navigation.navigate("WorkoutDetail", { selectedSplitId });
  };

  const renderSplit = ({ item }) => (
    <TouchableOpacity onPress={() => onPressSplit(item.id)} activeOpacity={0.8}>
      <View style={styles.cardWrapper}>
        <BlurView intensity={40} tint="dark" style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
        </BlurView>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={SPLITS}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderSplit}
      contentContainerStyle={styles.listPad}
    />
  );
};

const styles = StyleSheet.create({
  listPad: {
    padding: 16,
  },
  cardWrapper: {
    borderRadius: 28, // adjust as needed
    overflow: "hidden", // 🔥 ensures blur respects the rounding
    marginBottom: 16,
    shadowColor: "#ff1a1a", // glow outside the wrapper
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 25,
    elevation: 16,
  },
  card: {
    backgroundColor: "rgba(20, 0, 0, 0.4)",
    padding: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 1,
    color: "#ff1a1a",

    // 🔥 glowing text
    textShadowColor: "rgba(255, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,

    fontFamily: "Orbitron_700Bold", // swap if you don’t use Orbitron
  },
});

export default Splits;
