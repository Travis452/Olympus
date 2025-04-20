import React, { useEffect, useRef } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { incrementTimer, resetTimer } from "../src/redux/timerReducer";

const WorkoutTimer = ({ isPaused, onTogglePause }) => {
  const dispatch = useDispatch();
  const timer = useSelector((state) => state.timer.seconds);
  const intervalRef = useRef(null);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  useEffect(() => {
    dispatch(resetTimer());

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
  }, [dispatch]); // reset once on mount

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
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
    backgroundColor: "black",
    borderRadius: 15,
    width: "20%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    marginLeft: 15,
  },
  timerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
});

export default WorkoutTimer;
