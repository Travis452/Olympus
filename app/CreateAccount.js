import { useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
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

        // Save base user info to Firestore
        await setDoc(doc(db, "users", user.uid), {
          firstName,
          lastName,
          email,
          username: state.username,
          completedWorkouts: 0,
        });

        // Redirect to CreateProfile instead of MainTabs
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          navigation.replace("AuthNavigation", {
            screen: "CreateProfile"
          }, 2500);
        })

        
        console.log(" User created and sent to CreateProfile screen");
      }
    } catch (err) {
      console.log("Got error:", err.message);
    } 
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>CREATE ACCOUNT</Text>

      <LoadingScreen isVisible={loading} />

      <View style={styles.inputView}>
  <TextInput
    style={styles.inputText}
    placeholder="Username"
    placeholderTextColor="rgba(255,255,255,0.6)"
    value={state.username}
    onChangeText={(value) => setState({ ...state, username: value })}
    selectionColor="#ff0000"
  />
</View>


      <View style={styles.inputView}>
        <TextInput
          style={styles.inputText}
          placeholder="First Name"
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={state.firstName}
          onChangeText={(value) => setState({ ...state, firstName: value })}
          selectionColor="#ff0000" 
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          style={styles.inputText}
          placeholder="Last Name"
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={state.lastName}
          onChangeText={(value) => setState({ ...state, lastName: value })}
          selectionColor="#ff0000" 
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          style={styles.inputText}
          placeholder="Email"
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={state.email}
          onChangeText={(value) => setState({ ...state, email: value })}
          selectionColor="#ff0000" 
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          style={styles.inputText}
          placeholder="Create Password"
          placeholderTextColor="rgba(255,255,255,0.6)"
          secureTextEntry
          value={state.password}
          onChangeText={(value) => setState({ ...state, password: value })}
          selectionColor="#ff0000" 
        />
      </View>

      <TouchableOpacity onPress={handleSubmit} style={styles.glowBtn}>
        <Text style={styles.glowText}>SIGN UP</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
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
    fontFamily: "Orbitron_700Bold", // make sure Orbitron is loaded in App.js
  },
  inputView: {
    width: "90%",
    borderColor: "#ff0000",
    borderWidth: 1.5,
    borderRadius: 8,
    height: 50,
    marginBottom: 20,
    justifyContent: "center",
    paddingHorizontal: 15,
    backgroundColor: "rgba(255,0,0,0.05)", // subtle glow background
  },
  inputText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Orbitron_400Regular",
  },
  glowBtn: {
    width: "90%",
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

