import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
    <View style={styles.container}>
      {/* Neon OLYMPUS plate */}
      <View style={styles.brandPlate}>
        <Text style={styles.brandTitle}>OLYMPUS</Text>
      </View>

      <TouchableOpacity onPress={onPressSignUp} style={styles.neonButton}>
        <Text style={styles.neonButtonText}>SIGN UP</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onPressLogin} style={styles.neonButton}>
        <Text style={styles.neonButtonText}>LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
};

const RED = "#ff1a1a";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // solid black
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
    // glow
    shadowColor: RED,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 18,
  },
  brandTitle: {
    color: RED,
    fontFamily: 'Orbitron_800ExtraBold',
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: 6,
    textTransform: "uppercase",
    textAlign: "center",
    textShadowColor: RED,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
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
    // glow
    shadowColor: RED,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 12,
  },
  neonButtonText: {
    color: RED,
    fontFamily: 'Orbitron_700Bold',
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 2,
  },
});

export default Signup;
