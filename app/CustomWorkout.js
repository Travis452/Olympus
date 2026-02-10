import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, awardEXP, updateUserStats } from "../config/firebase";
import { fetchUserEXP } from "../src/redux/userSlice";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";

import Exercises from "./Exercises";
import BackButton from "../components/BackButton";
import WorkoutTimer from "../components/WorkoutTimer";
import LoadingScreen from "../components/LoadingScreen";
import WorkoutSummary from "../components/WorkoutSummary";

const RED = "#ff1a1a";

const CustomWorkout = () => {
  const navigation = useNavigation();
  const [workoutSummaryVisible, setWorkoutSummaryVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [setInputs, setSetInputs] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [performedExercises, setPerformedExercises] = useState([]);
  const [expGained, setExpGained] = useState(0);
  const [finalExp, setFinalExp] = useState(0);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [title, setTitle] = useState("Custom Workout");
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [previousData, setPreviousData] = useState([]);
  const scrollViewRef = useRef(null);

  const fetchPreviousForExercise = async (exerciseName) => {
    try {
      if (!currentUser) return null;

      const q = query(
        collection(db, "workouts"),
        where("userId", "==", currentUser.uid),
        orderBy("timestamp", "desc"),
        limit(20),
      );

      const snapshot = await getDocs(q);

      for (const doc of snapshot.docs) {
        const workout = doc.data();
        const match = workout.exercises?.find(
          (ex) => (ex.title || "").toLowerCase() === exerciseName.toLowerCase(),
        );
        if (match) return match.sets;
      }

      return null;
    } catch (error) {
      console.error("Error fetching previous data:", error);
      return null;
    }
  };

  const scrollToInput = (reactNode) => {
    scrollViewRef.current?.scrollTo({ y: reactNode, animated: true });
  };

  const dispatch = useDispatch();
  const timer = useSelector((state) => state.timer.seconds);

  const auth = getAuth();
  const slideAnim = useRef(new Animated.Value(-500)).current;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) =>
      setCurrentUser(user || null),
    );
    return unsub;
  }, [auth]);

  const openModal = () => {
    setShowExerciseModal(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: -500,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowExerciseModal(false);
    });
  };

  const handleAddExercise = async (exercise) => {
    setSelectedExercises((prev) => [...prev, exercise]);
    setSetInputs((prev) => [...prev, [{ lbs: "", reps: "" }]]);
    setShowExerciseModal(false);

    const prevSets = await fetchPreviousForExercise(exercise.name);
    setPreviousData((prev) => [...prev, prevSets || []]);
  };

  const handleInputChange = (exerciseIndex, setIndex, key, value) => {
    const updatedInputs = [...setInputs];
    updatedInputs[exerciseIndex][setIndex][key] = value;
    setSetInputs(updatedInputs);
  };

  const handleAddSet = (exerciseIndex) => {
    const updatedInputs = [...setInputs];
    updatedInputs[exerciseIndex].push({ lbs: "", reps: "" });
    setSetInputs(updatedInputs);
  };

  const handleSaveWorkout = () => {
    setFinishModalVisible(true);
  };

  const saveWorkoutData = async () => {
    setLoadingVisible(true);
    setFinishModalVisible(false);

    try {
      if (!currentUser) {
        console.error("User is not authenticated");
        setLoadingVisible(false);
        return;
      }

      setWorkoutDuration(timer);

      let completedExercises = [];

      selectedExercises.forEach((exercise, exerciseIndex) => {
        const validSets =
          setInputs[exerciseIndex]?.filter(
            (set) => set.lbs !== "" && set.reps !== "",
          ) || [];

        if (validSets.length > 0) {
          completedExercises.push({
            title: exercise.title || exercise.name,
            sets: validSets,
          });
        }
      });

      if (completedExercises.length === 0) {
        alert("No exercises were completed. Workout not saved.");
        setLoadingVisible(false);
        return;
      }

      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      let previousEXP = userDoc.exists() ? userDoc.data().exp || 0 : 0;

      const workoutData = {
        userId: currentUser.uid,
        workoutTitle: title,
        exercises: completedExercises,
        timestamp: new Date(),
        duration: timer,
      };

      const docRef = await addDoc(collection(db, "workouts"), workoutData);
      console.log("Workout data added with ID", docRef.id);

      const bodyWeight = 175; // later: pull from profile
      const isVerified = false;

      const expResult = await awardEXP(
        currentUser.uid,
        workoutData.exercises,
        bodyWeight,
        isVerified,
      );

      let newStats = { bestBench: 0, bestSquat: 0, bestDeadlift: 0 };

      completedExercises.forEach((exercise) => {
        const exerciseName = (exercise.title || "").toLowerCase();
        const maxWeight = Math.max(
          ...exercise.sets.map((set) => parseInt(set.lbs || 0)),
        );

        if (exerciseName.includes("bench")) {
          newStats.bestBench = Math.max(newStats.bestBench, maxWeight);
        } else if (exerciseName.includes("squat")) {
          newStats.bestSquat = Math.max(newStats.bestSquat, maxWeight);
        } else if (exerciseName.includes("deadlift")) {
          newStats.bestDeadlift = Math.max(newStats.bestDeadlift, maxWeight);
        }
      });

      console.log("💪 Updating user stats with:", newStats);
      await updateUserStats(currentUser.uid, newStats, isVerified);

      if (expResult) {
        const newEXP = expResult.exp;
        const expEarned = newEXP - previousEXP;

        setExpGained(expEarned);
        setFinalExp(newEXP);
        dispatch(fetchUserEXP(currentUser.uid));
        setPerformedExercises(completedExercises);
        setWorkoutSummaryVisible(true);
      } else {
        console.error("EXP calculation failed.");
      }
    } catch (error) {
      console.error("Error adding workout data:", error);
    }

    setLoadingVisible(false);
  };

  const capitalizeWords = (str) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <LinearGradient
      colors={["#000000", "#050816", "#190000"]}
      style={styles.gradient}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <LoadingScreen isVisible={loadingVisible} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{ paddingBottom: 300 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.headerRow}>
              <View style={{ width: 60 }}>
                <BackButton />
              </View>
              <Text style={styles.title}>CUSTOM WORKOUT</Text>
              <View style={{ width: 60, alignItems: "flex-end" }}>
                <WorkoutTimer
                  isPaused={isPaused}
                  onTogglePause={() => setIsPaused(!isPaused)}
                />
              </View>
            </View>

            {/* Workout name input */}
            <View style={styles.workoutNameContainer}>
              <Text style={styles.workoutNameLabel}>Workout Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter workout name..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Exercise cards */}
            {selectedExercises.map((exercise, exerciseIndex) => (
              <View key={exerciseIndex} style={styles.card}>
                <Text style={styles.cardTitle}>
                  {capitalizeWords(exercise.name)}
                </Text>

                {/* Set header row */}
                <View style={styles.setHeaderRow}>
                  <View style={styles.setColumn}>
                    <Text style={styles.setHeaderText}>Set</Text>
                  </View>
                  <View style={styles.setColumn}>
                    <Text style={styles.setHeaderText}>Prev</Text>
                  </View>
                  <View style={styles.setColumn}>
                    <Text style={styles.setHeaderText}>lbs</Text>
                  </View>
                  <View style={styles.setColumn}>
                    <Text style={styles.setHeaderText}>Reps</Text>
                  </View>
                </View>

                {/* Sets */}
                {setInputs[exerciseIndex] &&
                  setInputs[exerciseIndex].map((set, setIndex) => (
                    <View key={setIndex} style={styles.setRow}>
                      <View style={styles.setColumn}>
                        <Text style={styles.setText}>{setIndex + 1}</Text>
                      </View>
                      <View style={styles.setColumn}>
                        <Text style={styles.previousText}>
                          {previousData[exerciseIndex] &&
                          previousData[exerciseIndex][setIndex] &&
                          previousData[exerciseIndex][setIndex].lbs &&
                          previousData[exerciseIndex][setIndex].reps
                            ? `${previousData[exerciseIndex][setIndex].lbs} x ${previousData[exerciseIndex][setIndex].reps}`
                            : "---"}
                        </Text>
                      </View>
                      <View style={styles.setColumn}>
                        <TextInput
                          style={styles.setInput}
                          placeholder="lbs"
                          placeholderTextColor="rgba(255,255,255,0.5)"
                          keyboardType="numeric"
                          value={set.lbs}
                          onChangeText={(val) =>
                            handleInputChange(
                              exerciseIndex,
                              setIndex,
                              "lbs",
                              val,
                            )
                          }
                        />
                      </View>
                      <View style={styles.setColumn}>
                        <TextInput
                          style={styles.setInput}
                          placeholder="reps"
                          placeholderTextColor="rgba(255,255,255,0.5)"
                          keyboardType="numeric"
                          value={set.reps}
                          onChangeText={(val) =>
                            handleInputChange(
                              exerciseIndex,
                              setIndex,
                              "reps",
                              val,
                            )
                          }
                        />
                      </View>
                    </View>
                  ))}

                <TouchableOpacity
                  onPress={() => handleAddSet(exerciseIndex)}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>+ ADD SET</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Exercise */}
            <TouchableOpacity onPress={openModal} style={styles.neonButton}>
              <Text style={styles.neonButtonText}>+ ADD EXERCISE</Text>
            </TouchableOpacity>

            {/* Save Workout */}
            <TouchableOpacity
              style={[styles.neonButton, { marginTop: 10 }]}
              onPress={handleSaveWorkout}
            >
              <Text style={styles.neonButtonText}>SAVE WORKOUT</Text>
            </TouchableOpacity>

            {/* Exercise picker modal */}
            <Modal
              visible={showExerciseModal}
              animationType="fade"
              transparent={true}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.fullscreenModalContent}>
                  <Exercises
                    onClose={closeModal}
                    onSelect={handleAddExercise}
                  />
                </View>
              </View>
            </Modal>

            {/* Confirm save modal */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={finishModalVisible}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Save Workout?</Text>
                  <Text style={styles.modalBodyText}>
                    This will log your workout and update your EXP.
                  </Text>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      onPress={saveWorkoutData}
                      style={styles.modalButtonPrimary}
                    >
                      <Text style={styles.modalButtonText}>SAVE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setFinishModalVisible(false)}
                      style={styles.modalButtonSecondary}
                    >
                      <Text style={styles.modalButtonText}>CANCEL</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {/* Summary modal */}
            <WorkoutSummary
              visible={workoutSummaryVisible}
              performedExercises={performedExercises}
              expGained={expGained}
              finalExp={finalExp}
              onClose={() => {
                setWorkoutSummaryVisible(false);
                navigation.navigate("HomeScreen");
              }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
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

  workoutNameContainer: {
    marginVertical: 10,
  },
  workoutNameLabel: {
    color: "rgba(255,255,255,0.7)",
    marginBottom: 6,
    fontSize: 14,
  },

  // reused from Profile style
  input: {
    backgroundColor: "#000",
    color: "#fff",
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },

  card: {
    backgroundColor: "rgba(255,26,26,0.05)",
    borderColor: RED,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    shadowColor: RED,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cardTitle: {
    color: RED,
    fontSize: 18,
    fontFamily: "Orbitron_700Bold",
    marginBottom: 12,
    textAlign: "center",
    textShadowColor: RED,
    textShadowRadius: 3,
  },

  setHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  setHeaderText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },
  setColumn: {
    width: "23%",
    alignItems: "center",
  },
  setText: {
    color: "#fff",
    fontSize: 14,
  },
  previousText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
  setInput: {
    width: "100%",
    backgroundColor: "#000",
    color: "#fff",
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 13,
  },

  fullscreenModalContent: {
    width: "80%",
    height: "80%",
  },

  neonButton: {
    width: "80%",
    alignSelf: "center",
    borderWidth: 2,
    borderColor: RED,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginVertical: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    shadowColor: RED,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },

  modalButtons: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },

  modalButtonPrimary: {
    flex: 1,
    borderWidth: 2,
    borderColor: RED,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    shadowColor: RED,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },

  modalButtonSecondary: {
    flex: 1,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  modalButtonText: {
    color: RED,
    fontFamily: "Orbitron_700Bold",
    fontSize: 14,
    letterSpacing: 2,
  },

  neonButtonText: {
    color: RED,
    fontFamily: "Orbitron_700Bold",
    fontSize: 14,
    letterSpacing: 2,
  },
  secondaryButton: {
    marginTop: 8,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: RED,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.7)",
    // NO shadow properties here - removes the glow
  },
  secondaryButtonText: {
    color: RED,
    fontSize: 12,
    fontFamily: "Orbitron_700Bold",
    letterSpacing: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "85%",
    maxHeight: "80%",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: RED,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Orbitron_800ExtraBold",
    color: RED,
    textAlign: "center",
    marginBottom: 16,
  },
  modalBodyText: {
    color: "#fff", // Changed from black to white
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
});

export default CustomWorkout;
