import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  incrementTimer,
  resetTimer,
  setTimer,
} from "../src/redux/timerReducer";
import {
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

  const handleSaveWorkout = () => {
    setFinishModalVisible(true);
  };

  const saveWorkoutData = async () => {
    setFinishModalVisible(false);

    try {
      if (currentUser) {
        const workoutData = {
          userId: currentUser.uid,
          workoutTitle: title,
          exercises: exercises.map((exercise, exerciseIndex) => ({
            title: exercise.title,
            sets: Array(exercise.sets)
              .fill()
              .map((_, setIndex) => ({
                lbs: setInputs[exerciseIndex][setIndex].lbs,
                reps: setInputs[exerciseIndex][setIndex].reps,
              })),
          })),
          timestamp: new Date(),
        };

        const docRef = await addDoc(collection(db, "workouts"), workoutData);
        console.log("Workout data added with ID", docRef.id);

        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          await updateDoc(userRef, {
            completedWorkouts: increment(1),
          });
        } else {
          await setDoc(userRef, {
            firstName: currentUser.displayName.split(" ")[0] || "",
            lastName: currentUser.displayName.split(" ")[1] || "",
            email: currentUser.email,
            completedWorkouts: 1,
          });
        }
        console.log("Workout data added with ID", docRef.id);

        //Call awardEXP to process EXP

        const bodyWeight = 175;
        const isVerified = false;

        const expResult = await awardEXP(
          currentUser.uid,
          workoutData.exercises,
          bodyWeight,
          isVerified
        );

        if (expResult.verificationRequired) {
          alert(
            "Verification required for benchmark lift! No EXP awarded yet."
          );
        } else {
          dispatch(fetchUserEXP(currentUser.uid));
          alert(`EXP Awarded: ${expResult.exp}. New Level: ${expResult.level}`);
        }
      } else {
        console.error("User is not authenticated");
      }
    } catch (error) {
      console.error("Error adding workout data:", error);
    }
    navigation.navigate("HomeScreen");
  };

  const fetchPreviousWorkout = async () => {
    try {
      if (currentUser) {
        const querySnapshot = await getDocs(
          query(
            collection(db, "workouts"),
            where("userId", "==", currentUser.uid),
            where("workoutTitle", "==", title),
            orderBy("timestamp", "desc"),
            limit(1)
          )
        );
        const previousData = [];

        if (querySnapshot.size > 0) {
          const latestWorkout = querySnapshot.docs[0].data();

          exercises.forEach((exercise) => {
            const previousExerciseData = latestWorkout.exercises.find(
              (prevExercise) => prevExercise.title === exercise.title
            );

            if (previousExerciseData) {
              const previousSetData = previousExerciseData.sets.map((set) => ({
                lbs: set.lbs,
                reps: set.reps,
              }));

              previousData.push({
                exerciseTitle: exercise.title,
                sets: previousSetData,
              });
            } else {
              previousData.push({
                exerciseTitle: exercise.title,
                sets: [],
              });
            }
          });
        } else {
          exercises.forEach((exercise) => {
            previousData.push({
              exerciseTitle: exercise.title,
              sets: [],
            });
          });
        }

        setPreviousData(previousData);
        console.log("Fetched Data", previousData);
      }
    } catch (error) {
      console.error("Error fetching previous data:", error);
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
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveWorkout}>
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
});

export default StartWorkout;
