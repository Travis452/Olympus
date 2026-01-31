import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, Text, StyleSheet, AppState } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { incrementTimer, resetTimer, setTimer } from "../src/redux/timerReducer";

const WorkoutTimer = ({ isPaused, onTogglePause }) => {
  const dispatch = useDispatch();
  const timer = useSelector((state) => state.timer.seconds);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedSecondsRef = useRef(0);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  // Handle app going to background/foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && !isPaused && startTimeRef.current) {
        // App came back to foreground, calculate elapsed time
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000);
        dispatch(setTimer(pausedSecondsRef.current + elapsed));
      }
    });

    return () => subscription?.remove();
  }, [isPaused, dispatch]);

  useEffect(() => {
    dispatch(resetTimer());
    startTimeRef.current = Date.now();
    pausedSecondsRef.current = 0;

    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        dispatch(incrementTimer());
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [dispatch]);

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Save current seconds when pausing
      pausedSecondsRef.current = timer;
    } else {
      // Reset start time when unpausing
      startTimeRef.current = Date.now();
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          dispatch(incrementTimer());
        }, 1000);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused]);

  return (
    <TouchableOpacity style={styles.timerContainer} onPress={onTogglePause}>
      <Text style={styles.timerText}>{formatTime(timer)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
});

export default WorkoutTimer;