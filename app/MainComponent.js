import Signup from './Signup';
import WorkoutDetail from './WorkoutDetail';
import HomeScreen from './HomeScreen';
import CreateAccount from './CreateAccount';
import Login from './Login';
import Profile from './Profile';
import StartWorkout from './StartWorkout';
import CustomWorkout from './CustomWorkout';
import Exercises from './Exercises';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';



const Tab = createBottomTabNavigator();





const Main = ({ currentUser }) => {


    return (
        <>




            <Tab.Navigator initialRouteName="HomeScreen">

                {/* <Tab.Screen
                        name='Exercises'
                        component={Exercises}
                        options={{
                            headerShown: false,
                            tabBarIcon: () => (<MaterialCommunityIcons name='dumbbell' size={26} />)
                        }}
                    /> */}


                <Tab.Screen name='WorkoutDetail'
                    component={WorkoutDetail}
                    options={{
                        tabBarItemStyle: { display: 'none' },
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
                    name='CustomWorkout'
                    component={CustomWorkout}
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


export default Main;