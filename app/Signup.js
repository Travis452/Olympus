import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import useAuth from "../hooks/useAuth";

const RED = "#ff1a1a";
const WEB_CLIENT_ID =
  "939160989913-r39ur9ee6csc6t53s7hk49np0cu5dfu5.apps.googleusercontent.com";

const Signup = () => {
  const navigation = useNavigation();
  const { user } = useAuth(navigation);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: true,
    });
  }, []);

  const onPressSignUp = () => {
    navigation.navigate("CreateAccount");
  };

  const onPressLogin = () => {
    navigation.navigate("Login");
  };

  const onPressGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      // Get the ID token
      const idToken = userInfo.data?.idToken || userInfo.idToken;

      if (!idToken) {
        throw new Error("No ID token found");
      }

      // Create Firebase credential
      const auth = getAuth();
      const credential = GoogleAuthProvider.credential(idToken);

      // Sign in to Firebase
      const result = await signInWithCredential(auth, credential);
      const firebaseUser = result.user;

      // Check if user profile exists in Firestore
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create new user profile
        await setDoc(userRef, {
          email: firebaseUser.email,
          firstName: firebaseUser.displayName?.split(" ")[0] || "",
          lastName:
            firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
          username:
            firebaseUser.displayName || firebaseUser.email.split("@")[0],
          profilePic: firebaseUser.photoURL || null,
          exp: 0,
          completedWorkouts: 0,
          bestBench: 0,
          bestSquat: 0,
          bestDeadlift: 0,
          height: "",
          weight: 0,
          createdAt: new Date(),
        });
      }

      // App.js will handle navigation via onAuthStateChanged
      console.log("Google Sign In successful:", firebaseUser.uid);
    } catch (error) {
      console.error("Google Sign In Error:", error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the sign in
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert("Sign in already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Play services not available");
      } else {
        Alert.alert("Sign In Error", error.message);
      }
    }
  };

  return (
    <LinearGradient
      colors={["#000000", "#1a1a1a", "#1a1a1a", "#1a1a1a", "#000000"]}
      style={styles.gradient}
    >
      {/* Neon OLYMPUS plate */}
      <TouchableOpacity style={styles.brandPlate} disabled>
        <Text style={styles.brandTitle}>OLYMPUS</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onPressSignUp} style={styles.neonButton}>
        <Text style={styles.neonButtonText}>SIGN UP</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onPressLogin} style={styles.neonButton}>
        <Text style={styles.neonButtonText}>LOGIN</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Google Sign In Button */}
      <TouchableOpacity
        onPress={onPressGoogleSignIn}
        style={styles.googleButton}
      >
        <Text style={styles.googleButtonText}>SIGN IN WITH GOOGLE</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  brandPlate: {
    width: "80%",
    borderWidth: 2,
    borderColor: RED,
    borderRadius: 12,
    paddingVertical: 28,
    alignItems: "center",
    marginBottom: 80,
    backgroundColor: "rgba(255, 26, 26, 0.03)",
    shadowColor: RED,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 10,
  },
  brandTitle: {
    color: RED,
    fontFamily: "Orbitron_800ExtraBold",
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: 6,
    textTransform: "uppercase",
    textAlign: "center",
    textShadowColor: RED,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
  },

  neonButton: {
    width: "70%",
    height: 52,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: RED,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  neonButtonText: {
    color: RED,
    fontFamily: "Orbitron_700Bold",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 2,
    textShadowColor: RED,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "70%",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dividerText: {
    color: "rgba(255,255,255,0.5)",
    marginHorizontal: 15,
    fontFamily: "Orbitron_700Bold",
    fontSize: 12,
    letterSpacing: 2,
  },

  googleButton: {
    width: "70%",
    height: 52,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  googleButtonText: {
    color: "#fff",
    fontFamily: "Orbitron_700Bold",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },
});

export default Signup;
