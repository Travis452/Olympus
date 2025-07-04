import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Audio } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import {playLoopingMusic} from '../utils/SoundManager';

const RetroLoadingScreen = () => {
  const navigation = useNavigation();
  // const [sound, setSound] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    playLoopingMusic();
  }, []);
  const DROP_TIME = 11500;

  useEffect(() => {
    // playSound();
    startFadeAnimation();
    startDotIncrement();

    const timeout = setTimeout(() => {
      navigation.navigate("Signup");
    }, DROP_TIME);

    return () => {
      // if (sound) sound.unloadAsync();
      clearTimeout(timeout);
    };
  }, []);



  const startFadeAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startDotIncrement = () => {
    const dotInterval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 600);

    setTimeout(() => {
      clearInterval(dotInterval);
    }, DROP_TIME);
  };

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.loadingText, { opacity: fadeAnim }]}>
        Loading{".".repeat(dotCount)}
      </Animated.Text>
      <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
        "Ascend like a legend..."
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 32,
    fontFamily: "Courier",
    color: "#dc143c",
    marginBottom: 20,
  },
  tagline: {
    color: "#dc143c",
    fontSize: 18,
    fontFamily: "Courier",
  },
});

export default RetroLoadingScreen;
