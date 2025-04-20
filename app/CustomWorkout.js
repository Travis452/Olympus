import { useState, useRef } from "react";
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
import { useNavigation } from "@react-navigation/native";
import Exercises from "./Exercises";
import BackButton from "../components/BackButton";
import WorkoutTimer from "../components/WorkoutTimer";

const CustomWorkout = () => {
  const navigation = useNavigation();
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [setInputs, setSetInputs] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  const slideAnim = useRef(new Animated.Value(-500)).current;

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

  const capitalizeWords = (str) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
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
});

export default CustomWorkout;
