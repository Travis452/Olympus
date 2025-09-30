import { useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import LoadingScreen from "../components/LoadingScreen";

const CreateAccount = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleSubmit = async () => {
    const { firstName, lastName, email, password } = state;

    try {
      if (email && password) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          firstName,
          lastName,
          email,
          username: state.username,
          completedWorkouts: 0,
        });

        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          navigation.replace("AuthNavigation", {
            screen: "CreateProfile",
          });
        }, 2500);

        console.log("✅ User created and sent to CreateProfile screen");
      }
    } catch (err) {
      console.log("❌ Got error:", err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "black" }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <LoadingScreen isVisible={loading} />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>CREATE ACCOUNT</Text>

            {[
              { placeholder: "Username", key: "username" },
              { placeholder: "First Name", key: "firstName" },
              { placeholder: "Last Name", key: "lastName" },
              { placeholder: "Email", key: "email" },
              { placeholder: "Create Password", key: "password", secure: true },
            ].map(({ placeholder, key, secure }) => (
              <View key={key} style={styles.inputView}>
                <TextInput
                  style={styles.inputText}
                  placeholder={placeholder}
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  secureTextEntry={secure || false}
                  value={state[key]}
                  onChangeText={(value) => setState({ ...state, [key]: value })}
                  selectionColor="#ff0000"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>
            ))}

            <TouchableOpacity onPress={handleSubmit} style={styles.glowBtn}>
              <Text style={styles.glowText}>SIGN UP</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  scrollContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingBottom: 100, // ensures space above keyboard
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ff0000",
    marginBottom: 40,
    textAlign: "center",
    textShadowColor: "#ff0000",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    letterSpacing: 2,
    fontFamily: "Orbitron_700Bold",
  },
  inputView: {
    width: "80%",
    borderColor: "#ff0000",
    borderWidth: 1.5,
    borderRadius: 8,
    height: 50,
    marginBottom: 20,
    justifyContent: "center",
    paddingHorizontal: 15,
    backgroundColor: "rgba(255,0,0,0.05)",
  },
  inputText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Orbitron_400Regular",
  },
  glowBtn: {
    width: "80%",
    borderWidth: 1.5,
    borderColor: "#ff0000",
    borderRadius: 8,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    shadowColor: "#ff0000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 10,
  },
  glowText: {
    color: "#ff0000",
    fontSize: 20,
    fontFamily: "Orbitron_700Bold",
    letterSpacing: 2,
  },
});

export default CreateAccount;
