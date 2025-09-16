import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import useAuth from "../hooks/useAuth";

const Signup = () => {
  const navigation = useNavigation();
  const { user } = useAuth(navigation);

  const onPressSignUp = () => {
    navigation.navigate("CreateAccount");
  };

  const onPressLogin = () => {
    navigation.navigate("Login");
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
    </LinearGradient>
  );
};

const RED = "#ff1a1a";

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
    // smaller glow
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
    // smaller glow
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
    // smaller glow
    shadowColor: RED,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 8,
    // added subtle button shadow for depth
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
});

export default Signup;
