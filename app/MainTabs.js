// MainTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from './HomeScreen';
import Profile from './Profile';

const Tab = createBottomTabNavigator();

const MainTabs = ({route}) => {
const {firstName} = route.params || {};


    return (
        <Tab.Navigator initialRouteName="HomeScreen">
            <Tab.Screen
                name="HomeScreen"
                component={HomeScreen}
                options={{
                    headerShown: false,
                    tabBarLabel: 'Home',
                    tabBarIcon: () => (<MaterialCommunityIcons name='home' size={26} />)
                }}
            />
            <Tab.Screen
                name="Profile"
                component={Profile}
                initialParams={{firstName}}
                options={{
                    headerShown: false,
                    tabBarIcon: () => (<MaterialCommunityIcons name='account' size={26} />)
                }}
            />
        </Tab.Navigator>
    );
};

export default MainTabs;
