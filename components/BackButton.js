import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setTimer } from "../src/redux/timerReducer";

const BackButton = ({ destination }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleBack = () => {
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
    marginTop: 15,
  },
});

export default BackButton;
