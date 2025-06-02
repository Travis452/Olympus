import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ImageBackground,
  View,
  Image,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import useAuth from "../hooks/useAuth";

const Signup = () => {
  const navigation = useNavigation();
  const { user } = useAuth(navigation);

  // useEffect(() => {
  //   if (user) {
  //     navigation.navigate("HomeScreen");
  //   }
  // }, [user]);

  const onPressSignUp = () => {
    navigation.navigate("CreateAccount");
  };

  const onPressLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/images/Gustave.jpeg")}
        resizeMode="cover"
        style={styles.image}
        blurRadius={2.5}
      >
        {/* Scanline overlay */}
        <View style={styles.scanlines} />

        <Text style={styles.title}>Welcome to Olympus</Text>

        <TouchableOpacity onPress={onPressSignUp} style={styles.glowButton}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onPressLogin} style={styles.outlineButton}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  static: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25, // Static intensity
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      "linear-gradient(to bottom, rgba(255,255,255,0.03) 50%, transparent 50%)",
    backgroundRepeat: "repeat",
    backgroundSize: "100% 4px",
  },
  title: {
    fontSize: 35,
    fontWeight: "500",
    textAlign: "center",
    color: "white",
    marginBottom: 60,
  },
  glowButton: {
    width: "70%",
    backgroundColor: "#dc143c",
    borderRadius: 12,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    shadowColor: "#FF00FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  outlineButton: {
    width: "70%",
    borderColor: "#00FFFF",
    borderWidth: 2,
    borderRadius: 12,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontFamily: "Courier",
  },
});

export default Signup;
