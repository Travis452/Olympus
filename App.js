import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './src/redux/store'; // Ensure correct path
import MainStackNavigator from './app/MainStackNavigator';
import AuthNavigation from './app/AuthNavigation';
import useAuth from './hooks/useAuth';

const App = () => {
    const { user, isLoading } = useAuth();
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        if (user) {
            console.log('User is logged in:', user);
        } else {
            console.log('No user is logged in');
        }
    }, [user]);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
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
            <PersistGate loading={null} persistor={persistor}>
                <StatusBar barStyle='dark-content' />
                <NavigationContainer>
                    {currentUser ? <MainStackNavigator /> : <AuthNavigation />}
                </NavigationContainer>
            </PersistGate>
        </Provider>
    );
};

export default App;
