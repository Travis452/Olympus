import React, { useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import {stopMusic} from '../utils/SoundManager';

const CreateProfile = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState({
    weight: "",
    height: "",
    bestBench: "",
    bestSquat: "",
    bestDeadlift: "",
  });

  const handleSubmit = async () => {
    try {
      const user = getAuth().currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
          weight: parseInt(profile.weight),
          height: profile.height,
          baselineBench: parseInt(profile.bestBench),
          baselineSquat: parseInt(profile.bestSquat),
          baselineDeadlift: parseInt(profile.bestDeadlift),
          bestBench: 0,       // reset bests
          bestSquat: 0,
          bestDeadlift: 0,
        }, { merge: true });
        

        await stopMusic();
        navigation.replace("MainTabs");
      }
    } catch (err) {
      console.error("Error saving profile:", err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <Text style={styles.title}>Create Profile</Text>

          {[
            { placeholder: "Weight (lbs)", key: "weight" },
            { placeholder: "Height (e.g., 5'11)", key: "height" },
            { placeholder: "Best Bench (lbs)", key: "bestBench" },
            { placeholder: "Best Squat (lbs)", key: "bestSquat" },
            { placeholder: "Best Deadlift (lbs)", key: "bestDeadlift" },
          ].map(({ placeholder, key }) => (
            <View key={key} style={styles.inputView}>
              <TextInput
                style={styles.inputText}
                placeholder={placeholder}
                placeholderTextColor="white"
                keyboardType={
                  key.includes("weight") || key.includes("best")
                    ? "numeric"
                    : "default"
                }
                returnKeyType="done"
                value={profile[key]}
                onChangeText={(value) =>
                  setProfile({ ...profile, [key]: value })
                }
              />
            </View>
          ))}

          <TouchableOpacity style={styles.glowBtn} onPress={handleSubmit}>
            <Text style={styles.glowText}>Save</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000", // black bg
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    color: "#ff1a1a", // neon red
    marginBottom: 30,
    letterSpacing: 3,
    fontFamily: "Orbitron_700Bold", // matches your theme
    textShadowColor: "#ff1a1a",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  inputView: {
    width: "90%",
    borderColor: "#ff1a1a",
    borderWidth: 2,
    borderRadius: 12,
    height: 50,
    marginBottom: 20,
    justifyContent: "center",
    paddingHorizontal: 15,
    backgroundColor: "rgba(255, 26, 26, 0.07)", // subtle red tint
    shadowColor: "#ff1a1a",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  inputText: {
    height: 50,
    color: "white",
    fontFamily: "Orbitron_400Regular",
    fontSize: 16,
    selectionColor: "#ff1a1a", // red cursor
  },
  glowBtn: {
    width: "90%",
    borderColor: "#ff1a1a",
    borderWidth: 2,
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    backgroundColor: "transparent",
    shadowColor: "#ff1a1a",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 12,
  },
  glowText: {
    color: "#ff1a1a",
    fontSize: 18,
    fontFamily: "Orbitron_700Bold",
    letterSpacing: 2,
  },
});


export default CreateProfile;
