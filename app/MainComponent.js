import Signup from './Signup';
import WorkoutDetail from './WorkoutDetail';
import HomeScreen from './HomeScreen';
import CreateAccount from './CreateAccount';
import Login from './Login';
import Profile from './Profile';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();





const Main = () => {
    return (
        <>




            <Tab.Navigator>

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
            </Tab.Navigator>


        </>
    )
}
export default Main;