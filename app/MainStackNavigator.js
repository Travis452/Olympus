import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./HomeScreen";
import WorkoutDetail from "./WorkoutDetail";
import Profile from "./Profile";
import StartWorkout from "./StartWorkout";
import CustomWorkout from "./CustomWorkout";
import MainTabs from "./MainTabs";
import CreateProfile from "./CreateProfile";

const Stack = createStackNavigator();

// 👇 Accept hasProfile as a prop
const MainStackNavigator = ({ hasProfile }) => {
  return (
    <Stack.Navigator
      // 👇 Dynamically set the starting screen
      initialRouteName={hasProfile ? "MainTabs" : "CreateProfile"}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateProfile"
        component={CreateProfile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WorkoutDetail"
        component={WorkoutDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StartWorkout"
        component={StartWorkout}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CustomWorkout"
        component={CustomWorkout}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default MainStackNavigator;
