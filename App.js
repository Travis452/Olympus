import { useEffect } from 'react'
import Main from './app/MainComponent';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { auth } from './config/firebase';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const App = () => {

    useEffect(() => {
        auth.setPersistence(auth, browserLocalPersistence)
            .then(() => {

            })
            .catch((error) => {
                console.error('Error setting up Firebase Persistence', error.message)
            })

    }, []);
    return (
        <NavigationContainer>
            <Main />
        </NavigationContainer>
    )
}



export default App;
