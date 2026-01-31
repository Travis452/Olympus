import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import WorkoutDetail from "./WorkoutDetail";
import Profile from "./Profile";
import StartWorkout from "./StartWorkout";
import CustomWorkout from "./CustomWorkout";
import MainTabs from "./MainTabs";
import CreateProfile from "./CreateProfile";
import Exercises from "./Exercises";

const Stack = createStackNavigator();

const MainStackNavigator = ({ hasProfile }) => {
  return (
    <Stack.Navigator
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
        name="Exercises" 
        component={Exercises} 
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