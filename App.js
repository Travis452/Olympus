import { useState, useEffect } from 'react'
import Main from './app/MainComponent';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';
import store from './src/redux/store.js';
import { Provider } from 'react-redux';
import { StatusBar } from 'react-native';
import AuthNavigation from './app/AuthNavigation';
import { View, ActivityIndicator } from 'react-native';
const App = () => {

    const auth = getAuth();
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setPersistence(auth, browserLocalPersistence)
            .catch((error) => {
                console.error('Error setting up Firebase Persistence', error.message)
            });

        const unsubscribe = onAuthStateChanged(auth, (user) => {

            setCurrentUser(user);
            setIsLoading(false);
        });

        return unsubscribe;

    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#dc143c" />
            </View>
        );
    }
    return (
        <Provider store={store}>
            <StatusBar barStyle='dark-content' />

            <NavigationContainer>
                {currentUser ? <Main currentUser={currentUser} /> : <AuthNavigation />}
            </NavigationContainer>

        </Provider>
    );
};



export default App;
