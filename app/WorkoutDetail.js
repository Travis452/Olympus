import { useState } from "react";
import { SPLITS } from "../data/SPLITS";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "../components/BackButton";

const RED = "#dc143c";

const WorkoutDetail = () => {
  const { selectedSplitId } = useRoute().params;
  const selectedSplit = SPLITS.find((split) => split.id === selectedSplitId);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const navigation = useNavigation();

  const [timer, setTimer] = useState(0);
  const [startTimer, setStartTimer] = useState(true);

  const openModal = (workout) => {
    setSelectedWorkout(
      selectedSplit.muscles.find((muscle) => muscle.title === workout),
    );
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedWorkout(null);
    setModalVisible(false);
  };

  const startWorkout = () => {
    setModalVisible(false);
    setTimer(0);
    setStartTimer(true);
    navigation.navigate("StartWorkout", {
      selectedWorkout,
      selectedSplitId,
      startTimer,
    });
  };

  return (
    <LinearGradient
      colors={["#000", "#1a1a1a", "#000"]}
      style={styles.gradient}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <BackButton destination="HomeScreen" />
            <Text style={styles.title}>{selectedSplit?.title}</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Workout Cards */}
          {selectedSplit?.muscles.map((muscle) => (
            <TouchableOpacity
              key={muscle.id}
              onPress={() => openModal(muscle.title)}
              activeOpacity={0.8}
            >
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{muscle.title}</Text>
                {muscle.exercises.map((exercise, index) => (
                  <Text key={index} style={styles.exerciseText}>
                    {exercise.sets} x {exercise.reps} {exercise.title}
                  </Text>
                ))}
              </View>
            </TouchableOpacity>
          ))}

          {/* Start Workout Modal */}
          <Modal animationType="fade" transparent={true} visible={modalVisible}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Start Workout?</Text>
                <Text style={styles.modalBodyText}>
                  Ready to begin {selectedWorkout?.title}?
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={startWorkout}
                    style={styles.modalButtonPrimary}
                  >
                    <Text style={styles.modalButtonText}>START</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={closeModal}
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
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontFamily: "Orbitron_800ExtraBold",
    color: RED,
    textAlign: "center",
    textShadowColor: RED,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "rgba(255,26,26,0.05)",
    borderColor: RED,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 0 },
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
  exerciseText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginBottom: 6,
    textAlign: "center",
    textTransform: "capitalize",
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
    marginBottom: 12,
    textShadowColor: RED,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  modalBodyText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
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

export default WorkoutDetail;
