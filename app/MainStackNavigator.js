import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./HomeScreen";
import WorkoutDetail from "./WorkoutDetail";
import Profile from "./Profile";
import StartWorkout from "./StartWorkout";
import CustomWorkout from "./CustomWorkout";
import MainTabs from "./MainTabs";
import CreateProfile from "./CreateProfile";
import Exercises from "./Exercises";
import RetroLoadingScreen from './RetroLoadingScreen'
import Signup from './Signup'
import CreateAccount from './CreateAccount'
import AuthNavigation from './AuthNavigation'

const Stack = createStackNavigator();

// 👇 Accept hasProfile as a prop
const MainStackNavigator = ({ hasProfile }) => {
  return (
    <Stack.Navigator
      initialRouteName={hasProfile ? "MainTabs" : "AuthNavigation"}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
            <Stack.Screen
        name="AuthNavigation"
        component={AuthNavigation}
        options={{ headerShown: false }}
      />

      
            {/* <Stack.Screen
        name="CreateAccount"
        component={CreateAccount}
        options={{ headerShown: false }}
      />

<Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />

<Stack.Screen
        name="Signup"
        component={Signup}
        options={{ headerShown: false }}
      />

<Stack.Screen
        name="RetroLoadingScreen"
        component={RetroLoadingScreen}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen
        name="CreateProfile"
        component={CreateProfile}
        options={{ headerShown: false }}
      /> */}
      <Stack.Screen
        name="WorkoutDetail"
        component={WorkoutDetail}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="Exercises" component={Exercises} />

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
