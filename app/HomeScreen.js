import React from "react";
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
import { useNavigation } from "@react-navigation/native";
import Splits from "../components/Splits";
import { SPLITS } from "../data/SPLITS";

const HomeScreen = () => {
  console.log("Navigated to HomeScreen");
  const navigation = useNavigation();

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

  // cards
  card: {
    backgroundColor: "rgba(10,10,10,0.35)",
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    backdropFilter: undefined, // web only, safe in RN
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

  // legacy styles still referenced by your renderItem
  titleContainer: { flex: 1, alignItems: "flex-start" },
  text: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginHorizontal: 2,
    fontFamily: "Orbitron_400Regular",
  },
  btnTxt: { color: "#fff" },
  customBtnView: {
    width: "100%",
    height: 50,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  randomBtn: { display: "none" }, // replaced by primaryBtn above
  customButton: { display: "none" }, // replaced by hollowBtn above
});

export default HomeScreen;
