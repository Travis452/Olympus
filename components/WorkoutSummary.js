// components/WorkoutSummary.js
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";

const baseExp = 1000;

const WorkoutSummary = ({
  visible,
  onClose,
  performedExercises = [],
  expGained = 0,
  finalExp = 0,
}) => {
  // Level/EXP math
  const level = Math.floor(finalExp / baseExp) + 1;
  const expToNextLevel = level * baseExp;

  // Animations (self-contained)
  const expBarAnim = useRef(new Animated.Value(0)).current;
  const expCounterAnim = useRef(new Animated.Value(Math.max(finalExp - expGained, 0))).current;
  const [displayExp, setDisplayExp] = useState(Math.max(finalExp - expGained, 0));

  useEffect(() => {
    if (!visible || expGained <= 0) return;

    const previousEXP = Math.max(finalExp - expGained, 0);
    const currentPercentage = (previousEXP % baseExp) / 10; // 0..100
    const newPercentage = (finalExp % baseExp) / 10;

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

    const id = expCounterAnim.addListener(({ value }) => {
      setDisplayExp(Math.round(value));
    });

    return () => expCounterAnim.removeListener(id);
  }, [visible, finalExp, expGained]);

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.centeredView}>
        <View style={styles.modalContainer}>
          <Text style={styles.summaryTitle}>Workout Summary</Text>

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

          <Text style={styles.expText}>EXP Gained: +{expGained}</Text>
          <Text style={styles.expBarText}>
            Level {level} - {displayExp} / {expToNextLevel} EXP
          </Text>

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

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Styles mirror your StartWorkout ones so it drops in cleanly
const styles = StyleSheet.create({
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
  summaryTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  summaryList: { maxHeight: 200 },
  summaryItem: {
    backgroundColor: "#f4f4f4",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  summaryText: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
  setText: { fontSize: 14, color: "#555", marginLeft: 10 },
  noDataText: { fontSize: 16, color: "#888", textAlign: "center" },
  expText: { fontSize: 18, fontWeight: "bold", color: "#dc143c", marginVertical: 10 },
  expBarContainer: {
    width: "80%",
    height: 10,
    backgroundColor: "#ccc",
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 10,
    alignSelf: "center",
  },
  expBar: { height: "100%", backgroundColor: "#dc143c" },
  expBarText: { marginTop: 5, fontSize: 16, fontWeight: "bold", textAlign: "center" },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#dc143c",
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});

export default WorkoutSummary;
