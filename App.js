import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./src/redux/store";
import MainStackNavigator from "./app/MainStackNavigator";
import AuthNavigation from "./app/AuthNavigation";
import { db } from "./config/firebase";
import {
  useFonts,
  Orbitron_400Regular,
  Orbitron_700Bold,
  Orbitron_800ExtraBold,
} from "@expo-google-fonts/orbitron";

const App = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);

  const [fontsLoaded] = useFonts({
    Orbitron_400Regular,
    Orbitron_700Bold,
    Orbitron_800ExtraBold,
  });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        try {
          const userRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            setHasProfile(true);
          } else {
            setHasProfile(false);
          }
        } catch (err) {
          console.error("🔥 Error checking user profile:", err.message);
          setHasProfile(false);
        }

        setProfileChecked(true);
      } else {
        setCurrentUser(null);
        setHasProfile(false);
        setProfileChecked(false);
      }

      setIsAppLoading(false);
    });

    return unsubscribe;
  }, []);

  if (!fontsLoaded) return null;

  if (isAppLoading || (currentUser && !profileChecked)) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
        <ActivityIndicator size="large" color="#dc143c" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StatusBar barStyle="light-content" />
        <NavigationContainer>
          {currentUser ? (
            <MainStackNavigator hasProfile={hasProfile} />
          ) : (
            <AuthNavigation />
          )}
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

export default App;
