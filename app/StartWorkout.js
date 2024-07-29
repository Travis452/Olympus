import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { incrementTimer, resetTimer, setTimer } from '../src/redux/timerReducer';
import { View, Text, TextInput, ScrollView, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native'
import { collection, addDoc, updateDoc, getDoc, setDoc, doc, getDocs, query, where, limit, orderBy, increment } from 'firebase/firestore';
import { db } from '../config/firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../components/BackButton'



const StartWorkout = ({ route }) => {

    const navigation = useNavigation();
    const { selectedWorkout, selectedSplitId } = route.params;
    const { exercises = [], title } = selectedWorkout



    const initializeSetInputs = (exercises) => {

        if (!Array.isArray(exercises)) {
            return []
        }

        return exercises.map((exercise) =>
            Array(exercise.sets).fill().map(() => ({ lbs: '', reps: '' }))
        );
    }

    useEffect(() => {
        console.log("Selected Workout:", selectedWorkout);
        console.log("Exercises:", exercises);
    }, [selectedWorkout, exercises])


    //Getting authentication 
    const auth = getAuth();

    const [currentUser, setCurrentUser] = useState(null);

    //inputting the sets data 


    // const sets = exercises.length > 0 ? exercises[0].sets : 0;
    const initialSetInputs = initializeSetInputs(exercises);
    const [setInputs, setSetInputs] = useState(initialSetInputs)
    const [previousData, setPreviousData] = useState([]);


    const handleAddSet = (exerciseIndex) => {
        const newSetInputs = setInputs.map((sets, index) => {
            if (index === exerciseIndex) {
                return [...sets, { lbs: '', reps: '' }];
            }
            return sets;
        })

        setSetInputs(newSetInputs);
        console.log('New Set Inputs', newSetInputs);
    }


    //State for workout Timer
    const dispatch = useDispatch();
    const timer = useSelector(state => state.timer.seconds);
    const [isPaused, setIsPaused] = useState(false);
    const [timerInterval, setTimerInterval] = useState(null);


    const togglePause = () => {
        setIsPaused(!isPaused);
    }

    useEffect(() => {

        let interval;

        dispatch(resetTimer());
        // Start the timer with a delay of 1 second
        const timerDelay = setTimeout(() => {
            interval = setInterval(() => {
                dispatch(incrementTimer());
            }, 1000);
            setTimerInterval(interval);
        }, 1000);

        return () => {
            clearTimeout(timerDelay);
            if (interval) {
                clearInterval(interval);
            }
        };



    }, [dispatch]);

    useEffect(() => {
        if (isPaused && timerInterval) {
            clearInterval(timerInterval);
            setTimerInterval(null); // Ensure to clear the interval reference
        } else if (!isPaused && !timerInterval) {
            // Restart the timer when unpaused
            const interval = setInterval(() => {
                dispatch(incrementTimer());
            }, 1000);
            setTimerInterval(interval);
        }

        return () => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        };
    }, [isPaused, timerInterval, dispatch]);


    //Handle input change for lbs and reps
    const handleInputChange = (exerciseIndex, setIndex, key, value) => {
        const newSetInputs = [...setInputs];
        newSetInputs[exerciseIndex][setIndex][key] = value;
        setSetInputs(newSetInputs);
    };

    //Formatting time into minutes and seconds
    const formatTime = (seconds) => {
        const positiveSeconds = Math.max(seconds, 0);
        const minutes = Math.floor(positiveSeconds / 60);
        const remainingSeconds = positiveSeconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    //Authentication Listener
    useEffect(() => {


        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                //User is Signed in.
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
            }
        })

        return () => {
            unsubscribe();
        }
    }, [auth]);


    //Listening for previous data fetch 
    useEffect(() => {
        async function fetchData() {
            if (currentUser && selectedWorkout.id) {

                setPreviousData([]);
                await fetchPreviousWorkout();
            }
        }
        fetchData();
    }, [currentUser, selectedWorkout.id]);


    //Save workout data to firebase
    const saveWorkoutData = async () => {




        try {
            if (currentUser) {
                const workoutData = {
                    userId: currentUser.uid,
                    workoutTitle: title,
                    exercises: exercises.map((exercise, exerciseIndex) => ({
                        title: exercise.title,
                        sets: Array(exercise.sets).fill().map((_, setIndex) => ({
                            lbs: setInputs[exerciseIndex][setIndex].lbs,
                            reps: setInputs[exerciseIndex][setIndex].reps,
                        })),
                    })),
                    timestamp: new Date(),
                };

                const docRef = await addDoc(collection(db, 'workouts'), workoutData)
               console.log('Workout data added with ID', docRef.id);

               const userRef = doc(db, 'users', currentUser.uid);
               const userDoc = await getDoc(userRef);

               if (userDoc.exists()) {

                await updateDoc(userRef, {
                 completedWorkouts: increment(1),
});
               } else {
                await setDoc(userRef, {
                    firstName: currentUser.displayName.split(' ')[0] || '',
                    lastName: currentUser.displayName.split(' ')[1] || '',
                    email: currentUser.email,
                    completedWorkouts:1,
                });
               }
console.log('Wokrout data added with ID', docRef.id);

            } else {
                console.error('User is not authenticated');
            }
        } catch (error) {
            console.error('Error adding workout data:', error);
        }

    }

    const fetchPreviousWorkout = async () => {
        try {
            if (currentUser) {
                const querySnapshot = await getDocs(
                    query(
                        collection(db, 'workouts'),
                        where('userId', '==', currentUser.uid),
                        where('workoutTitle', '==', title),
                        orderBy('timestamp', 'desc'),
                        limit(1)
                    )
                );
                const previousData = [];

                if (querySnapshot.size > 0) {
                    const latestWorkout = querySnapshot.docs[0].data();

                    exercises.forEach((exercise) => {
                        const previousExerciseData = latestWorkout.exercises.find(
                            (prevExercise) => prevExercise.title === exercise.title
                        );

                        if (previousExerciseData) {
                            const previousSetData = previousExerciseData.sets.map((set) => ({
                                lbs: set.lbs,
                                reps: set.reps,
                            }));

                            previousData.push({
                                exerciseTitle: exercise.title,
                                sets: previousSetData,
                            });
                        } else {
                            previousData.push({
                                exerciseTitle: exercise.title,
                                sets: [],
                            });
                        }
                    });


                } else {
                    exercises.forEach((exercise) => {
                        previousData.push({
                            exerciseTitle: exercise.title,
                            sets: [],
                        })
                    })
                }

                setPreviousData(previousData);
                console.log('Fetched Data', previousData);
            }
        } catch (error) {
            console.error('Error fetching previous data:', error);
        }
    }





    return (
        <ScrollView style={styles.container} stickyHeaderIndices={[0]}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.stickyHeader}>
                    <View style={styles.titleContainer}>
                      <BackButton />

                        <Text style={styles.title}>{title}</Text>

                        <TouchableOpacity onPress={togglePause} style={styles.timerContainer}>
                            <Text style={styles.timerText}>{formatTime(timer)}</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </SafeAreaView>
            {exercises && exercises.map((exercise, exerciseIndex) => (
                <View key={exerciseIndex} style={styles.exerciseContainer}>
                    <Text style={styles.exerciseTitle}>{exercise.title}</Text>

                    <View style={styles.headerContainer}>
                        <View style={styles.setColumn}>
                            <Text style={styles.headerText}>Set</Text>
                        </View>
                        <View style={styles.setColumn}>
                            <Text style={styles.headerText}>Prev</Text>
                        </View>
                        <View style={styles.setColumn}>
                            <Text style={styles.headerText}>lbs</Text>
                        </View>
                        <View style={styles.setColumn}>
                            <Text style={styles.headerText}>Reps</Text>
                        </View>
                    </View>

                    {setInputs[exerciseIndex] && setInputs[exerciseIndex].map((set, setIndex) => (
                        <View key={`${exerciseIndex}-${setIndex}`} style={styles.setContainer}>
                            <View style={styles.setColumn}>
                                <TouchableOpacity style={styles.setss}>
                                    <Text>
                                        {setIndex + 1}
                                    </Text>
                                </TouchableOpacity>

                            </View>

                            <TextInput
                                placeholder='---'
                                editable={false}
                                style={styles.input}
                                value={
                                    previousData[exerciseIndex] &&
                                        previousData[exerciseIndex].sets &&
                                        previousData[exerciseIndex].sets[setIndex] &&
                                        previousData[exerciseIndex].sets[setIndex].lbs
                                        ? `${previousData[exerciseIndex].sets[setIndex].lbs} lbs`
                                        : ''
                                }
                            />



                            <TextInput
                                style={styles.input}
                                placeholder='lbs'
                                keyboardType='numeric'
                                value={set.lbs}
                                onChangeText={(value) => handleInputChange(exerciseIndex, setIndex, 'lbs', value)}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder='Reps'
                                keyboardType='numeric'
                                value={set.reps}
                                onChangeText={(value) => handleInputChange(exerciseIndex, setIndex, 'reps', value)}
                            />

                        </View>


                    ))}



                    <TouchableOpacity
                        onPress={() => handleAddSet(exerciseIndex)}
                        style={styles.addButton}
                    >
                        <Text style={styles.addButtonText}>Add Set</Text>
                    </TouchableOpacity>

                </View>

            ))}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={saveWorkoutData}>
                    <Text style={styles.saveBtnTxt}>Save Workout</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
};



const styles = StyleSheet.create({

    addButton: {
        backgroundColor: '#dc143c',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },

    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },

    buttonContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    stickyHeader: {
        backgroundColor: 'white',

    },
    safeArea: {
        flex: 0,
        backgroundColor: 'white',
    },
    container: {
        flexGrow: 0,
        padding: 20,
        paddingTop: 0,
        backgroundColor: 'white',

    },
    title: {
        fontSize: 25,
        fontWeight: '700',
        marginBottom: 20,
        paddingTop: 10,
        marginLeft: 50,
        marginTop: 25,
        textAlign: 'center',


    },
    timerContainer: {
        backgroundColor: 'black',
        borderRadius: 15,
        width: '20%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        marginLeft: 15
    },
    timerText: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',


    },
    exerciseContainer: {
        marginBottom: 20,
    },
    exerciseTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 10,
        color: '#dc143c'
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,

    },

    headerText: {
        fontWeight: '700',
        textAlign: 'center'
    },

    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        width: '100%',
    },
    setContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,


    },
    setColumn: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 7,
        backgroundColor: 'lightGrey',
        width: '20%',
        height: 40,

    },

    input: {
        flex: 1,
        marginHorizontal: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderWidth: 0.5,
        borderRadius: 5,
        width: '20%'

    },
    setss: {
        backgroundColor: 'lightgrey',
        width: '50%',
        borderRadius: 5,
        alignItems: 'center',

    },
    saveButton: {
        alignSelf: 'center',
        width: '80%',
        backgroundColor: '#dc143c',
        borderRadius: 10,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20
    },
    saveBtnTxt: {
        color: 'white'
    },
    backBtn: {
        marginTop: 25




    }

});

export default StartWorkout;