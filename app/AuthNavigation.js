import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Signup from "./Signup";
import Login from "./Login";
import CreateAccount from "./CreateAccount";
import RetroLoadingScreen from "./RetroLoadingScreen";
import CreateProfile from "./CreateProfile";

const Stack = createStackNavigator();

const AuthNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="RetroLoadingScreen"
        component={RetroLoadingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateProfile"
        component={CreateProfile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Signup"
        component={Signup}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CreateAccount"
        component={CreateAccount}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigation;
