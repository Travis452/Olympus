import { useEffect } from 'react'
import Main from './app/MainComponent';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { auth } from './config/firebase';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import store from './src/redux/store.js';
import { Provider } from 'react-redux';


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
        <Provider store={store}>
            <NavigationContainer>
                <Main />
            </NavigationContainer>
        </Provider>
    )
}



export default App;
