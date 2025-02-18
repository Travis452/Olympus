import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  incrementTimer,
  resetTimer,
  setTimer,
} from "../src/redux/timerReducer";
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
import BackButton from "../components/BackButton";

const StartWorkout = ({ route }) => {
  const navigation = useNavigation();
  const [workoutSummaryVisible, setWorkoutSummaryVisible] = useState(false);
  const [expGained, setExpGained] = useState(426); // Example EXP gained
  const [finalExp, setFinalExp] = useState(1574); // Example current total EXP
  const baseExp = 1000;
  const level = Math.floor(finalExp / baseExp) + 1;
  const expToNextLevel = level * baseExp;
  const expProgress = finalExp - (level - 1) * baseExp;

  // Animated values
  const expBarAnim = useRef(
    new Animated.Value((expProgress / expToNextLevel) * 100)
  ).current;
  const expCounterAnim = useRef(
    new Animated.Value(finalExp - expGained)
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
        .map(() => ({ lbs: "", reps: "" }))
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
  const timer = useSelector((state) => state.timer.seconds);
  const [isPaused, setIsPaused] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);
  const [workoutDuration, setWorkoutDuration] = useState(0);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  useEffect(() => {
    let interval;
    dispatch(resetTimer());
    const timerDelay = setTimeout(() => {
      interval = setInterval(() => {
        dispatch(incrementTimer());
      }, 1000);
      setTimerInterval(interval);
    }, 1000);

    return () => {
      clearTimeout(timerDelay);
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [dispatch]);

  useEffect(() => {
    if (isPaused && timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    } else if (!isPaused && !timerInterval) {
      const interval = setInterval(() => {
        dispatch(incrementTimer());
      }, 1000);
      setTimerInterval(interval);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isPaused, timerInterval, dispatch]);

  const handleInputChange = (exerciseIndex, setIndex, key, value) => {
    const newSetInputs = [...setInputs];
    newSetInputs[exerciseIndex][setIndex][key] = value;
    setSetInputs(newSetInputs);
  };

  const formatTime = (seconds) => {
    const positiveSeconds = Math.max(seconds, 0);
    const minutes = Math.floor(positiveSeconds / 60);
    const remainingSeconds = positiveSeconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
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
    if (workoutSummaryVisible) {
      // Animate EXP bar fill
      Animated.timing(expBarAnim, {
        toValue: (expProgress / expToNextLevel) * 100,
        duration: 1500,
        useNativeDriver: false,
        easing: Easing.ease,
      }).start();

      // Animate EXP counter
      Animated.timing(expCounterAnim, {
        toValue: finalExp, // Dynamically updated
        duration: 1500,
        useNativeDriver: false,
      }).start();

      // Update displayed EXP dynamically
      expCounterAnim.addListener(({ value }) => {
        setDisplayExp(Math.round(value));
      });

      return () => {
        expCounterAnim.removeAllListeners();
      };
    }
  }, [workoutSummaryVisible, finalExp]);

  const handleSaveWorkout = () => {
    setFinishModalVisible(true);
  };

  const [performedExercises, setPerformedExercises] = useState([]);

  const saveWorkoutData = async () => {
    setFinishModalVisible(false); // Close confirmation modal

    try {
      if (currentUser) {
        setIsPaused(true); // Stop the timer when saving
        setWorkoutDuration(timer); // Save workout duration

        let completedExercises = [];

        exercises.forEach((exercise, exerciseIndex) => {
          const validSets =
            setInputs[exerciseIndex]?.filter(
              (set) => set.lbs !== "" && set.reps !== ""
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
          return;
        }

        // Fetch user's EXP dynamically
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

        // Save workout in Firestore
        const docRef = await addDoc(collection(db, "workouts"), workoutData);
        console.log("Workout data added with ID", docRef.id);

        // Award EXP dynamically
        const bodyWeight = 175;
        const isVerified = false;
        const expResult = await awardEXP(
          currentUser.uid,
          workoutData.exercises,
          bodyWeight,
          isVerified
        );

        if (expResult) {
          const newEXP = expResult.exp;
          const expEarned = newEXP - previousEXP;

          setExpGained(expEarned);
          setFinalExp(newEXP);
          setPerformedExercises(completedExercises); // ✅ Store exercises correctly
          setWorkoutSummaryVisible(true); // ✅ Open modal AFTER saving
        } else {
          console.error("EXP calculation failed.");
        }
      } else {
        console.error("User is not authenticated");
      }
    } catch (error) {
      console.error("Error adding workout data:", error);
    }
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
          limit(1)
        )
      );

      if (querySnapshot.empty) {
        console.log("No previous workout found.");
        setPreviousData([]); // Set an empty array instead of breaking
        return;
      }

      const latestWorkout = querySnapshot.docs[0].data();
      console.log("Fetched Latest Workout Data:", latestWorkout);

      if (!latestWorkout.exercises || !Array.isArray(latestWorkout.exercises)) {
        console.error(
          "Error: No 'exercises' field or invalid format in latestWorkout!"
        );
        setPreviousData([]); // Prevent errors by setting a default empty array
        return;
      }

      const previousData = latestWorkout.exercises.map((exercise) => ({
        exerciseTitle: exercise.title || "Unnamed Exercise",
        sets: exercise.sets || [],
      }));

      console.log("Processed Previous Data:", previousData);
      setPreviousData(previousData);
    } catch (error) {
      console.error("❌ Error fetching previous workout:", error);
    }
  };

  return (
    <ScrollView style={styles.container} stickyHeaderIndices={[0]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.stickyHeader}>
          <View style={styles.titleContainer}>
            <BackButton destination="HomeScreen" />

            <Text style={styles.title}>{title}</Text>

            <TouchableOpacity
              onPress={togglePause}
              style={styles.timerContainer}
            >
              <Text style={styles.timerText}>{formatTime(timer)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
      {exercises &&
        exercises.map((exercise, exerciseIndex) => (
          <View key={exerciseIndex} style={styles.exerciseContainer}>
            <Text style={styles.exerciseTitle}>{exercise.title}</Text>

            <View style={styles.headerContainer}>
              <View style={styles.setColumn}>
                <Text style={styles.headerText}>Set</Text>
              </View>
              <View style={styles.setColumn}>
                <Text style={styles.headerText}>Prev</Text>
              </View>
              <View style={styles.setColumn}>
                <Text style={styles.headerText}>lbs</Text>
              </View>
              <View style={styles.setColumn}>
                <Text style={styles.headerText}>Reps</Text>
              </View>
            </View>

            {setInputs[exerciseIndex] &&
              setInputs[exerciseIndex].map((set, setIndex) => (
                <View
                  key={`${exerciseIndex}-${setIndex}`}
                  style={styles.setContainer}
                >
                  <View style={styles.setColumn}>
                    <TouchableOpacity style={styles.setss}>
                      <Text>{setIndex + 1}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.previousColumn}>
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

                  <TextInput
                    style={styles.input}
                    placeholder="lbs"
                    keyboardType="numeric"
                    returnKeyType="done"
                    value={set.lbs}
                    onChangeText={(value) =>
                      handleInputChange(exerciseIndex, setIndex, "lbs", value)
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Reps"
                    keyboardType="numeric"
                    returnKeyType="done"
                    value={set.reps}
                    onChangeText={(value) =>
                      handleInputChange(exerciseIndex, setIndex, "reps", value)
                    }
                  />
                </View>
              ))}

            <TouchableOpacity
              onPress={() => handleAddSet(exerciseIndex)}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveWorkout} // Use this function again
        >
          <Text style={styles.saveBtnTxt}>Save Workout</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={finishModalVisible}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalContainer}>
            <Text>Save Workout?</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={saveWorkoutData}
                style={styles.saveBtn}
              >
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFinishModalVisible(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.btnText}> Cancel </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={workoutSummaryVisible}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalContainer}>
            <Text style={styles.summaryTitle}>Workout Summary</Text>
            <Text style={styles.durationText}>{formatTime(timer)}</Text>

            <ScrollView style={styles.summaryList}>
              {performedExercises.length > 0 ? (
                performedExercises.map((exercise, index) => (
                  <View key={index} style={styles.summaryItem}>
                    <Text style={styles.summaryText}>{exercise.title}</Text>
                    {exercise.sets.map((set, setIndex) => (
                      <Text key={setIndex} style={styles.setText}>
                        Set {setIndex + 1}: {set.lbs} lbs x {set.reps} reps
                      </Text>
                    ))}
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No exercises performed.</Text>
              )}
            </ScrollView>

            {/* EXP Animated Counter */}
            <Text style={styles.expText}>EXP Gained: +{expGained}</Text>
            <Text style={styles.expBarText}>
              Level {level} - {displayExp} / {expToNextLevel} EXP
            </Text>

            {/* Animated EXP Bar */}
            <View style={styles.expBarContainer}>
              <Animated.View
                style={[
                  styles.expBar,
                  {
                    width: expBarAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                setWorkoutSummaryVisible(false);
                navigation.navigate("HomeScreen");
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: "#dc143c",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  stickyHeader: {
    backgroundColor: "white",
  },
  safeArea: {
    flex: 0,
    backgroundColor: "white",
  },
  container: {
    flexGrow: 0,
    padding: 20,
    paddingTop: 0,
    backgroundColor: "white",
  },
  title: {
    fontSize: 25,
    fontWeight: "700",
    marginBottom: 20,
    paddingTop: 10,
    marginLeft: 50,
    marginTop: 25,
    textAlign: "center",
  },
  timerContainer: {
    backgroundColor: "black",
    borderRadius: 15,
    width: "20%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    marginLeft: 15,
  },
  timerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
  exerciseContainer: {
    marginBottom: 20,
  },
  exerciseTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    color: "#dc143c",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerText: {
    fontWeight: "700",
    textAlign: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  setContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  setColumn: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    backgroundColor: "lightGrey",
    width: "20%",
    height: 40,
  },
  previousColumn: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    backgroundColor: "white",
    width: "25%",
    height: 40,
  },
  previousText: {
    fontSize: 14,
    color: "black",
    fontWeight: "bold",
  },

  input: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderRadius: 5,
    width: "20%",
  },
  setss: {
    backgroundColor: "lightgrey",
    width: "50%",
    borderRadius: 5,
    alignItems: "center",
  },
  saveButton: {
    alignSelf: "center",
    width: "80%",
    backgroundColor: "#dc143c",
    borderRadius: 5,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginLeft: 40,
  },
  saveBtnTxt: {
    color: "white",
    fontWeight: "bold",
  },
  backBtn: {
    marginTop: 25,
  },
  centeredView: {
    flex: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    borderRadius: 10,
    padding: 40,
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  saveBtn: {
    width: "30%",
    backgroundColor: "#dc143c",
    borderRadius: 15,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 10,
    color: "white",
  },
  btnText: {
    color: "white",
  },
  cancelBtn: {
    width: "30%",
    backgroundColor: "black",
    color: "white",
    borderRadius: 15,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 10,
  },

  //Summary Modal

  summaryTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  summaryList: {
    maxHeight: 200,
  },
  summaryItem: {
    backgroundColor: "#f4f4f4",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  setText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 10,
  },
  noDataText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  expText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc143c",
    marginVertical: 10,
  },

  expBarContainer: {
    width: "80%",
    height: 10,
    backgroundColor: "#ccc",
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 10,
    alignSelf: "center",
  },

  expBar: {
    height: "100%",
    backgroundColor: "#dc143c",
  },

  expBarText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#dc143c",
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default StartWorkout;
