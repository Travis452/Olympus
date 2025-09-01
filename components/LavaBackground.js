// LavaBackground.js
import React, { useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from "react-native-reanimated";

const LavaBackground = ({ style, ...props }) => {
  const shift = useSharedValue(0);

  useEffect(() => {
    shift.value = withRepeat(
      withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.quad) }),
      -1, // infinite
      true // yoyo
    );
  }, [shift]);

  const blob = (delay = 0, scale = 1, opacity = 0.4) => {
    const anim = useAnimatedStyle(() => {
      const x = Math.sin((shift.value + delay) * Math.PI * 2) * 60;
      const y = Math.cos((shift.value + delay) * Math.PI * 2) * 60;
      return {
        transform: [{ translateX: x }, { translateY: y }, { scale }],
        opacity,
      };
    });
    return <Animated.View style={[styles.blob, anim]} pointerEvents="none" />;
  };

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject, // pin to edges
        styles.container,
        style,                          // <— forward style prop from parent
      ]}
      {...props}
    >
      {/* subtle dark base */}
      <View style={StyleSheet.absoluteFillObject} />

      {/* blobs */}
      {blob(0.00, 1.2, 0.35)}
      {blob(0.33, 1.0, 0.30)}
      {blob(0.66, 0.9, 0.25)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "lime",
  },
  blob: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#ff1a1a",
    filter: undefined, // RN ignore; just here to show intent
    top: "40%",
    left: "50%",
    marginLeft: -130,
    marginTop: -130,
    // soft blur look (shadow used as faux blur on native)
    shadowColor: "#ff1a1a",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 50,
  },
});

export default LavaBackground;
