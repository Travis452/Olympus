// MainTabs.js
import React from "react";
import { View, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeScreen from "./HomeScreen";
import Profile from "./Profile";
import Leaderboard from "./Leaderboard";

const Tab = createBottomTabNavigator();

const TabBarBackground = () => (
  <View style={{ flex: 1, backgroundColor: "transparent" }} />
);

const MainTabs = ({ route }) => {
  const { bottom } = useSafeAreaInsets();
  const extraBottom = Math.max(bottom, 10); // space for devices w/ no home indicator too

  return (
    <Tab.Navigator
      initialRouteName="HomeScreen"
      sceneContainerStyle={{
        backgroundColor: "transparent", // your BG image shows through
      }}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,

        // The magic: relative position + margins => looks floating but reserves space
        tabBarStyle: {
          position: "absolute", // make it float
          left: 20,
          right: 20,
          bottom: 20,
          backgroundColor: "rgba(20, 20, 20, 0.85)", // darker glassy look
          borderTopWidth: 0,
          height: 70,
          borderRadius: 35, // pill shape
          paddingBottom: 8,
          paddingTop: 4,
          // Glow
          shadowColor: "#ff1a1a",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: Platform.OS === "ios" ? 0.5 : 0.8,
          shadowRadius: 25,
          elevation: 18,
        },

        tabBarLabelStyle: {
          fontFamily: "Orbitron_700Bold",
          fontSize: 11,
          letterSpacing: 1,
        },
        tabBarActiveTintColor: "#ff3a3a",
        tabBarInactiveTintColor: "rgba(255,255,255,0.6)",
        tabBarBackground: () => <TabBarBackground />,
      }}
    >
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={Leaderboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="trophy" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
