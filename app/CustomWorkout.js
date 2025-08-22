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
} from "react-native";

import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  addDoc,
  getDoc,
  doc,
} from "firebase/firestore";
import { db, awardEXP, updateUserStats } from "../config/firebase";
import { fetchUserEXP } from "../src/redux/userSlice";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import Exercises from "./Exercises";
import BackButton from "../components/BackButton";
import WorkoutTimer from "../components/WorkoutTimer";
import LoadingScreen from "../components/LoadingScreen"; 
import WorkoutSummary from "../components/WorkoutSummary";


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
const [title, setTitle] = useState("Custom Workout"); // used in workoutData

  const dispatch = useDispatch();
  const timer = useSelector((state) => state.timer.seconds);

  const auth = getAuth();

  const slideAnim = useRef(new Animated.Value(-500)).current;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user || null));
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

  const [finishModalVisible, setFinishModalVisible] = useState(false);

  const handleAddExercise = (exercise) => {
    setSelectedExercises((prev) => [...prev, exercise]);
    setSetInputs((prev) => [...prev, [{ lbs: "", reps: "" }]]);
    setShowExerciseModal(false);
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
    setLoadingVisible(true); // Show loading screen
    setFinishModalVisible(false);

    try {
      if (currentUser) {
        setWorkoutDuration(timer); // Store final workout duration

        let completedExercises = [];

        selectedExercises.forEach((exercise, exerciseIndex) => {
          const validSets =
            setInputs[exerciseIndex]?.filter(
              (set) => set.lbs !== "" && set.reps !== ""
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
          setLoadingVisible(false); // Hide loading screen
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
          isVerified
        );

        let newStats = { bestBench: 0, bestSquat: 0, bestDeadlift: 0 };

        completedExercises.forEach((exercise) => {
          const exerciseName = exercise.title.toLowerCase();
          const maxWeight = Math.max(
            ...exercise.sets.map((set) => parseInt(set.lbs || 0))
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
        await updateUserStats(currentUser.uid, newStats);

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

    setLoadingVisible(false); // Hide loading screen when done
  };

  const capitalizeWords = (str) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
      <LoadingScreen isVisible={loadingVisible} />
        <View style={styles.headerContainer}>
          <BackButton destination="HomeScreen" />

          <Text style={styles.title}>Custom Workout</Text>
          <WorkoutTimer
            isPaused={isPaused}
            onTogglePause={() => setIsPaused(!isPaused)}
          />
        </View>

        {selectedExercises.map((exercise, exerciseIndex) => (
          <View key={exerciseIndex} style={styles.exerciseContainer}>
            <Text style={styles.exerciseTitle}>
              {capitalizeWords(exercise.name)}
            </Text>

            <View style={styles.headerContainerSets}>
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
                <View key={setIndex} style={styles.setContainer}>
                  <View style={styles.setColumn}>
                    <Text style={styles.setText}>{setIndex + 1}</Text>
                  </View>
                  <View style={styles.previousColumn}>
                    <Text style={styles.previousText}>---</Text>
                  </View>
                  <View style={styles.setColumn}>
                    <TextInput
                      style={styles.input}
                      placeholder="lbs"
                      keyboardType="numeric"
                      value={set.lbs}
                      onChangeText={(val) =>
                        handleInputChange(exerciseIndex, setIndex, "lbs", val)
                      }
                    />
                  </View>
                  <View style={styles.setColumn}>
                    <TextInput
                      style={styles.input}
                      placeholder="reps"
                      keyboardType="numeric"
                      value={set.reps}
                      onChangeText={(val) =>
                        handleInputChange(exerciseIndex, setIndex, "reps", val)
                      }
                    />
                  </View>
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
        
        <View style={styles.addButtonContainer}>
          <TouchableOpacity onPress={openModal} style={styles.addButton}>
            <Text style={styles.addButtonText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveWorkout}
          >
            <Text style={styles.saveBtnTxt}>Save Workout</Text>
          </TouchableOpacity>
        </View>



        <Modal
          visible={showExerciseModal}
          animationType="none"
          transparent={true}
        >
          <Animated.View
            style={[
              styles.modalOverlay,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.modalContent}>
              <Exercises onClose={closeModal} onSelect={handleAddExercise} />
            </View>
          </Animated.View>
        </Modal>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    padding: 20,
    backgroundColor: "white",
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  backBtn: {
    marginRight: 20,
  },

  exerciseContainer: {
    marginBottom: 30,
  },
  exerciseTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#dc143c",
    marginBottom: 10,
  },
  headerContainerSets: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  setContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  setColumn: {
    alignItems: "center",
    justifyContent: "center",
    width: "20%",
  },
  headerText: {
    fontWeight: "700",
  },
  previousColumn: {
    alignItems: "center",
    justifyContent: "center",
    width: "25%",
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
    width: "100%",
  },
  setText: {
    fontSize: 14,
  },
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
  addButtonContainer: {
    alignItems: "center",
    marginTop: 20,
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

  centeredView: {
    flex: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    marginTop: 100,
    marginLeft: 20,
    marginRight: 20,
    height: "75%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },

  modalContainer: {
    borderRadius: 10,
    padding: 40,
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  
});

export default CustomWorkout;
