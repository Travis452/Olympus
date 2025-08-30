import React, {useEffect} from "react";
import {StyleSheet, View, Dimensions} from "react-native";
import Animated, {useSharedValue, useAnimatedStyle, withRepeat, withTiming} from "react-native-reanimated";
import {LinearGradient} from "expo-linear-gradient";

const {width, height} = Dimensions.get("window");

const Blob = ({delay}) => {
    const x = useSharedValue(0);
    const y = useSharedValue(0);

    useEffect(() => {
        x.value = withRepeat(
            withTiming(width - 150, {duration: 8000}),
            -1, 
            true
        );
        y.value = withRepeat(
            withTiming(height - 300, {duration: 10000}),
            -1,
            true
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ translateX: x.value}, { translateY: y.value}],
    }));

    return (
        <Animated.View style={[styles.blob, style]}>
            <LinearGradient
             colors={["rgba(255,0,0,0.5", "transparent"]}
             style={styles.blobGradient}
             />
        </Animated.View>
    );
};

const LavaBackground = () => {
    return (
        <View style={StyleSheet.absoluteFill}>
            <Blob delay={0} />
            <Blob delay={2000} />
            <Blob delay={4000} />
        </View>
    );
};

const styles = StyleSheet.create({
    blob: {
        position: "absolute",
        width: 250,
        height: 250, 
        borderRadius: 125,
        overflow: "hidden",
    },
    blobGradient: {
        flex: 1,
    }
});

export default LavaBackground;