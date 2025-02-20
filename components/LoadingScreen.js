import React, { useEffect, useRef } from "react";
import { Modal, Text, View, Animated, StyleSheet } from "react-native";

const LoadingScreen = ({ isVisible }) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(progress, {
        toValue: 100,
        duration: 3000, // Duration in milliseconds (3 seconds)
        useNativeDriver: false,
      }).start();
    }
  }, [isVisible]);

  return (
    <Modal transparent={true} visible={isVisible}>
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>LOADING...</Text>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progress.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Dark background
  },
  loadingText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF0000", // Red text color
    fontFamily: "PressStart2P-Regular", // Optional: Use a pixel font for retro style
    marginBottom: 20,
  },
  progressBarContainer: {
    width: "80%",
    height: 20,
    backgroundColor: "#222",
    borderRadius: 10,
    overflow: "hidden",
    borderColor: "#FF0000",
    borderWidth: 2,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FF0000", // Red progress bar
  },
});

export default LoadingScreen;
