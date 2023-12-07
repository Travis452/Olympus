import Signup from './Signup';
import WorkoutDetail from './WorkoutDetail';
import HomeScreen from './HomeScreen';
import CreateAccount from './CreateAccount';
import Login from './Login';
import Profile from './Profile';
import StartWorkout from './StartWorkout';
import Exercises from './Exercises';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useAuth from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';


const Tab = createBottomTabNavigator();





const Main = () => {


    const auth = getAuth();

    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        })
        return unsubscribe();
    }, [auth]);
    const navigation = useNavigation();
    useEffect(() => {
        if (user) {
            navigation.navigate('HomeScreen');
        }
    }, [user, navigation]);
    if (user) {

        return (
            <>
                <Tab.Navigator>


                    <Tab.Screen name='WorkoutDetail'
                        component={WorkoutDetail}
                        options={{
                            tabBarStyle: { display: 'none' },
                            tabBarItemStyle: { display: 'none' },
                            tabBarShowLabel: false,
                            headerShown: false,

                        }}
                    />


                    <Tab.Screen
                        name='HomeScreen'
                        component={HomeScreen}
                        options={{
                            headerShown: false,
                            tabBarIcon: () => (<MaterialCommunityIcons name='home' size={26} />)
                        }}
                    />

                    <Tab.Screen
                        name='Profile'
                        component={Profile}
                        options={{
                            href: 'Profile',
                            tabBarIcon: () => (<MaterialCommunityIcons name='account' size={26} />)
                        }}
                    />
                    <Tab.Screen
                        name='StartWorkout'
                        component={StartWorkout}
                        options={{
                            tabBarStyle: { display: 'none' },
                            tabBarItemStyle: { display: 'none' },
                            headerShown: false,
                            href: null
                        }}
                    />

                    <Tab.Screen
                        name='Exercises'
                        component={Exercises}
                        options={{
                            headerShown: false,
                            tabBarIcon: () => (<MaterialCommunityIcons name='account' size={26} />)
                        }}
                    />
                </Tab.Navigator>


            </>
        );

    } else {
        return (
            <>




                <Tab.Navigator>

                    {/* <Tab.Screen
                        name='Exercises'
                        component={Exercises}
                        options={{
                            headerShown: false,
                            tabBarIcon: () => (<MaterialCommunityIcons name='dumbbell' size={26} />)
                        }}
                    /> */}

                    <Tab.Screen
                        name='Sign-Up'
                        component={Signup}

                        options={{
                            tabBarStyle: { display: 'none' },
                            tabBarItemStyle: { display: 'none' },
                            tabBarShowLabel: false,
                            headerShown: false,


                        }}
                    />
                    <Tab.Screen name='WorkoutDetail'
                        component={WorkoutDetail}
                        options={{
                            tabBarStyle: { display: 'none' },
                            tabBarItemStyle: { display: 'none' },
                            tabBarShowLabel: false,
                            headerShown: false,

                        }}
                    />
                    <Tab.Screen
                        name='CreateAccount'
                        component={CreateAccount}
                        options={{
                            tabBarStyle: { display: 'none' },
                            tabBarItemStyle: { display: 'none' },
                            headerShown: false,
                            href: null
                        }}
                    />

                    <Tab.Screen
                        name='Login'
                        component={Login}
                        options={{
                            tabBarStyle: { display: 'none' },
                            tabBarItemStyle: { display: 'none' },
                            headerShown: false,
                            href: null
                        }}
                    />

                    <Tab.Screen
                        name='HomeScreen'
                        component={HomeScreen}
                        options={{
                            headerShown: false,
                            tabBarIcon: () => (<MaterialCommunityIcons name='home' size={26} />)
                        }}
                    />

                    <Tab.Screen
                        name='Profile'
                        component={Profile}
                        options={{
                            href: 'Profile',
                            tabBarIcon: () => (<MaterialCommunityIcons name='account' size={26} />)
                        }}
                    />
                    <Tab.Screen
                        name='StartWorkout'
                        component={StartWorkout}
                        options={{
                            tabBarStyle: { display: 'none' },
                            tabBarItemStyle: { display: 'none' },
                            headerShown: false,
                            href: null
                        }}
                    />
                </Tab.Navigator>




            </>
        )
    }

}
export default Main;