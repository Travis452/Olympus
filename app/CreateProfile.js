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
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const CreateProfile = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState({
    username: "",
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
        await updateDoc(userRef, {
          ...profile,
          weight: parseInt(profile.weight),
          height: profile.height,
          bestBench: parseInt(profile.bestBench),
          bestSquat: parseInt(profile.bestSquat),
          bestDeadlift: parseInt(profile.bestDeadlift),
        });
        navigation.navigate("MainTabs");
      }
    } catch (err) {
      console.error("❌ Error saving profile:", err.message);
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
            { placeholder: "Username", key: "username" },
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
    backgroundColor: "white",
  },
  title: {
    fontSize: 25,
    fontWeight: "500",
    marginBottom: 40,
  },
  inputView: {
    width: "80%",
    backgroundColor: "black",
    borderRadius: 25,
    height: 50,
    marginBottom: 20,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  inputText: {
    height: 50,
    color: "white",
  },
  glowBtn: {
    width: "80%",
    backgroundColor: "#dc143c",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 10,
    shadowColor: "#ff69b4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 10,
  },
  glowText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
});

export default CreateProfile;
