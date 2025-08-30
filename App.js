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
import { useFonts, Orbitron_400Regular, Orbitron_700Bold, Orbitron_800ExtraBold } from '@expo-google-fonts/orbitron';
const App = () => {
  const [isAppLoading, setIsAppLoading] = useState(true); 
  const [currentUser, setCurrentUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);

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
            const userData = docSnap.data();
            setHasProfile(true); // Profile created if username exists
          } else {
            setHasProfile(false);
          }
        } catch (err) {
          console.error("🔥 Error checking user profile:", err.message);
          setHasProfile(false);
        }
      } else {
        setCurrentUser(null);
        setHasProfile(false);
      }

      setIsAppLoading(false); 
    });

    return unsubscribe;
  }, []);

  if (!fontsLoaded) return null;

  if (isAppLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#dc143c" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StatusBar barStyle="dark-content" />
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
