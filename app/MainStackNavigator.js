import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import WorkoutDetail from './WorkoutDetail';
import Profile from './Profile';
import StartWorkout from './StartWorkout';
import CustomWorkout from './CustomWorkout';
import MainTabs from './MainTabs';

const Stack = createStackNavigator();

const MainStackNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="MainTabs">
            <Stack.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="WorkoutDetail"
                component={WorkoutDetail}
                options={{ headerShown: false }}
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