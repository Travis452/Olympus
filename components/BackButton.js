import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setTimer } from "../src/redux/timerReducer";

const BackButton = ({ destination, onPress }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleBack = () => {
    // If custom onPress is provided, use that instead
    if (onPress) {
      onPress();
      return;
    }
    
    dispatch(setTimer(-2));
    navigation.navigate("HomeScreen");
  };

  return (
    <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
      <Ionicons name="arrow-back" size={24} color="red" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backBtn: {
    padding: 8, 
  },
});

export default BackButton;