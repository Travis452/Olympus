import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Animated,
  Easing,
  View,
  Text,
  TextInput,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import {
  collection,
  addDoc,
  updateDoc,
  getDoc,
  setDoc,
  doc,
  getDocs,
  query,
  where,
  limit,
  orderBy,
  increment,
} from "firebase/firestore";
import { db, awardEXP } from "../config/firebase";
import { fetchUserEXP } from "../src/redux/userSlice";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { updateUserStats } from "../config/firebase";
import { LinearGradient } from "expo-linear-gradient";
import WorkoutTimer from "../components/WorkoutTimer";
import BackButton from "../components/BackButton";
import LoadingScreen from "../components/LoadingScreen";
import WorkoutSummary from "../components/WorkoutSummary";

const StartWorkout = ({ route }) => {
  const navigation = useNavigation();
  const [workoutSummaryVisible, setWorkoutSummaryVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [expGained, setExpGained] = useState(426);
  const [finalExp, setFinalExp] = useState(1574);
  const [loadingVisible, setLoadingVisible] = useState(false);
  const timer = useSelector((state) => state.timer.seconds);

  const baseExp = 1000;
  const level = Math.floor(finalExp / baseExp) + 1;
  const expToNextLevel = level * baseExp;
  const expProgress = finalExp - (level - 1) * baseExp;

  const expBarAnim = useRef(new Animated.Value(0)).current;
  const expCounterAnim = useRef(
    new Animated.Value(finalExp - expGained),
  ).current;
  const [displayExp, setDisplayExp] = useState(finalExp - expGained);

  const { selectedWorkout, selectedSplitId } = route.params;
  const { exercises = [], title } = selectedWorkout;

  const initializeSetInputs = (exercises) => {
    if (!Array.isArray(exercises)) {
      return [];
    }
    return exercises.map((exercise) =>
      Array(exercise.sets)
        .fill()
        .map(() => ({ lbs: "", reps: "" })),
    );
  };

  useEffect(() => {
    console.log("Selected Workout:", selectedWorkout);
    console.log("Exercises:", exercises);
  }, [selectedWorkout, exercises]);

  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(null);

  const initialSetInputs = initializeSetInputs(exercises);
  const [setInputs, setSetInputs] = useState(initialSetInputs);
  const [previousData, setPreviousData] = useState([]);

  const handleAddSet = (exerciseIndex) => {
    const newSetInputs = setInputs.map((sets, index) => {
      if (index === exerciseIndex) {
        return [...sets, { lbs: "", reps: "" }];
      }
      return sets;
    });
    setSetInputs(newSetInputs);
    console.log("New Set Inputs", newSetInputs);
  };

  const dispatch = useDispatch();
  const [workoutDuration, setWorkoutDuration] = useState(0);

  const handleInputChange = (exerciseIndex, setIndex, key, value) => {
    const newSetInputs = [...setInputs];
    newSetInputs[exerciseIndex][setIndex][key] = value;
    setSetInputs(newSetInputs);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [auth]);

  useEffect(() => {
    async function fetchData() {
      if (currentUser && selectedWorkout.id) {
        setPreviousData([]);
        await fetchPreviousWorkout();
      }
    }
    fetchData();
  }, [currentUser, selectedWorkout.id]);

  const [finishModalVisible, setFinishModalVisible] = useState(false);

  useEffect(() => {
    if (workoutSummaryVisible && expGained > 0) {
      const previousEXP = finalExp - expGained;
      const currentPercentage = (previousEXP % 1000) / 10;
      const newPercentage = (finalExp % 1000) / 10;

      expBarAnim.setValue(currentPercentage);

      Animated.timing(expBarAnim, {
        toValue: newPercentage,
        duration: 1500,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }).start();

      expCounterAnim.setValue(previousEXP);

      Animated.timing(expCounterAnim, {
        toValue: finalExp,
        duration: 1500,
        useNativeDriver: false,
      }).start();

      const listenerId = expCounterAnim.addListener(({ value }) => {
        setDisplayExp(Math.round(value));
      });

      return () => {
        expCounterAnim.removeListener(listenerId);
      };
    }
  }, [workoutSummaryVisible, finalExp, expGained]);

  const handleSaveWorkout = () => {
    setFinishModalVisible(true);
  };

  const [performedExercises, setPerformedExercises] = useState([]);

  const saveWorkoutData = async () => {
    setLoadingVisible(true);
    setFinishModalVisible(false);

    try {
      if (currentUser) {
        setWorkoutDuration(timer);

        let completedExercises = [];

        exercises.forEach((exercise, exerciseIndex) => {
          const validSets =
            setInputs[exerciseIndex]?.filter(
              (set) => set.lbs !== "" && set.reps !== "",
            ) || [];

          if (validSets.length > 0) {
            completedExercises.push({
              title: exercise.title,
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

        const bodyWeight = 175;
        const isVerified = false;
        const expResult = await awardEXP(
          currentUser.uid,
          workoutData.exercises,
          bodyWeight,
          isVerified,
        );

        let newStats = { bestBench: 0, bestSquat: 0, bestDeadlift: 0 };

        completedExercises.forEach((exercise) => {
          const exerciseName = exercise.title.toLowerCase();
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
      } else {
        console.error("User is not authenticated");
      }
    } catch (error) {
      console.error("Error adding workout data:", error);
    }

    setLoadingVisible(false);
  };

  const fetchPreviousWorkout = async () => {
    try {
      if (!currentUser) return;

      const querySnapshot = await getDocs(
        query(
          collection(db, "workouts"),
          where("userId", "==", currentUser.uid),
          where("workoutTitle", "==", title),
          orderBy("timestamp", "desc"),
          limit(1),
        ),
      );

      if (querySnapshot.empty) {
        console.log("No previous workout found.");
        setPreviousData([]);
        return;
      }

      const latestWorkout = querySnapshot.docs[0].data();
      console.log("Fetched Latest Workout Data:", latestWorkout);

      if (!latestWorkout.exercises || !Array.isArray(latestWorkout.exercises)) {
        console.error(
          "Error: No 'exercises' field or invalid format in latestWorkout!",
        );
        setPreviousData([]);
        return;
      }

      const previousData = latestWorkout.exercises.map((exercise) => ({
        exerciseTitle: exercise.title || "Unnamed Exercise",
        sets: exercise.sets || [],
      }));

      console.log("Processed Previous Data:", previousData);
      setPreviousData(previousData);
    } catch (error) {
      console.error("Error fetching previous workout:", error);
    }
  };

  return (
    <LinearGradient
      colors={["#000", "#1a1a1a", "#000"]}
      style={styles.gradient}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <LoadingScreen isVisible={loadingVisible} />
          <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 300 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.titleContainer}>
              <View style={{ width: 60 }}>
                <BackButton destination="HomeScreen" />
              </View>
              <Text style={styles.title}>{title}</Text>
              <View style={{ width: 60, alignItems: "flex-end" }}>
                <WorkoutTimer
                  isPaused={isPaused}
                  onTogglePause={() => setIsPaused(!isPaused)}
                />
              </View>
            </View>
  
            {exercises &&
              exercises.map((exercise, exerciseIndex) => (
                <View key={exerciseIndex} style={styles.card}>
                  <Text style={styles.cardTitle}>{exercise.title}</Text>
  
                  <View style={styles.setHeaderRow}>
                    <Text style={styles.setHeaderText}>Set</Text>
                    <Text style={styles.setHeaderText}>Prev</Text>
                    <Text style={styles.setHeaderText}>lbs</Text>
                    <Text style={styles.setHeaderText}>Reps</Text>
                  </View>
  
                  {setInputs[exerciseIndex] &&
                    setInputs[exerciseIndex].map((set, setIndex) => (
                      <View
                        key={`${exerciseIndex}-${setIndex}`}
                        style={styles.setRow}
                      >
                        <View style={styles.setColumn}>
                          <Text style={styles.setText}>{setIndex + 1}</Text>
                        </View>
  
                        <View style={styles.setColumn}>
                          <Text style={styles.previousText}>
                            {previousData[exerciseIndex] &&
                            previousData[exerciseIndex].sets &&
                            previousData[exerciseIndex].sets[setIndex] &&
                            previousData[exerciseIndex].sets[setIndex].lbs &&
                            previousData[exerciseIndex].sets[setIndex].reps
                              ? `${previousData[exerciseIndex].sets[setIndex].lbs} x ${previousData[exerciseIndex].sets[setIndex].reps}`
                              : "---"}
                          </Text>
                        </View>
  
                        <View style={styles.setColumn}>
                          <TextInput
                            style={styles.setInput}
                            placeholder="lbs"
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                            value={set.lbs}
                            onChangeText={(value) =>
                              handleInputChange(
                                exerciseIndex,
                                setIndex,
                                "lbs",
                                value,
                              )
                            }
                          />
                        </View>
  
                        <View style={styles.setColumn}>
                          <TextInput
                            style={styles.setInput}
                            placeholder="reps"
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                            value={set.reps}
                            onChangeText={(value) =>
                              handleInputChange(
                                exerciseIndex,
                                setIndex,
                                "reps",
                                value,
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
  
            <TouchableOpacity style={styles.neonButton} onPress={handleSaveWorkout}>
              <Text style={styles.neonButtonText}>SAVE WORKOUT</Text>
            </TouchableOpacity>
  
            <Modal
              animationType="fade"
              transparent={true}
              visible={finishModalVisible}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Save Workout?</Text>
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
                      <Text
                        style={[
                          styles.modalButtonText,
                          { color: "rgba(255,255,255,0.7)" },
                        ]}
                      >
                        CANCEL
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
  
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

const RED = "#dc143c";

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  stickyHeader: {
    backgroundColor: "transparent",
  },
  safeArea: {
    flex: 0,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
    width: "100%",
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
    flex: 1,
  },

  // Exercise card
  card: {
    backgroundColor: "rgba(255,26,26,0.05)",
    borderColor: RED,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    shadowColor: RED,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  cardTitle: {
    color: RED,
    fontSize: 18,
    fontFamily: "Orbitron_700Bold",
    marginBottom: 12,
    textAlign: "center",
    textShadowColor: RED,
    textShadowRadius: 5,
    textTransform: "capitalize",
  },

  // Set header row
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
    width: "23%",
  },

  // Set rows
  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },
  setColumn: {
    width: "23%",
    alignItems: "center",
    justifyContent: "center",
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
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 13,
    textAlign: "center",
  },

  // Add Set button
  secondaryButton: {
    marginTop: 12,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: RED,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  secondaryButtonText: {
    color: RED,
    fontSize: 12,
    fontFamily: "Orbitron_700Bold",
    letterSpacing: 1,
  },

  // Save Workout button
  neonButton: {
    width: "80%",
    alignSelf: "center",
    borderWidth: 2,
    borderColor: RED,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginVertical: 12,
    marginBottom: 40,
    backgroundColor: "rgba(0,0,0,0.7)",
    shadowColor: RED,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 8,
  },
  neonButtonText: {
    color: RED,
    fontFamily: "Orbitron_700Bold",
    fontSize: 14,
    letterSpacing: 2,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
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
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 8,
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
});

export default StartWorkout;
