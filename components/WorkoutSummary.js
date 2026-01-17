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
  const expCounterAnim = useRef(
    new Animated.Value(Math.max(finalExp - expGained, 0))
  ).current;
  const [displayExp, setDisplayExp] = useState(
    Math.max(finalExp - expGained, 0)
  );

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

const styles = StyleSheet.create({
  centeredView: {
    flex: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    backgroundColor: "rgba(0,0,0,0.7)", // darker overlay
  },
  modalContainer: {
    borderRadius: 15,
    padding: 40,
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a", // dark grey background
    borderWidth: 1,
    borderColor: "#dc143c", // subtle red border
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#fff", // white title
  },
  summaryList: { maxHeight: 200 },
  summaryItem: {
    backgroundColor: "#2a2a2a", // slightly lighter card
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
    textTransform: "capitalize",
  },
  setText: {
    fontSize: 14,
    color: "#aaa", // light grey for sets
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
    // glowy red effect
    textShadowColor: "#dc143c",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  expBarContainer: {
    width: "80%",
    height: 10,
    backgroundColor: "#333", // dark track
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
    color: "#fff", // white level text
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#dc143c",
    borderRadius: 5,
    alignItems: "center",
    // subtle glow on button
    shadowColor: "#dc143c",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5, // for Android
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default WorkoutSummary;
