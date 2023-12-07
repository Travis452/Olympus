import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { getFirestore, collection, addDoc, doc, setDoc, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';



const StartWorkout = ({ route }) => {

    const navigation = useNavigation();
    const { selectedWorkout, selectedSplitId } = route.params;


    const { exercises, title } = selectedWorkout







    const initializeSetInputs = (exercises) => {
        return exercises.map((exercise) =>
            Array(exercise.sets).fill().map(() => ({ lbs: '', reps: '' }))
        );
    }


    //Going back to previous page.
    const handleBack = () => {

        setSetInputs(initialSetInputs)
        navigation.navigate('WorkoutDetail', { selectedSplitId });
    }

    //Getting authentication 
    const auth = getAuth();

    const [currentUser, setCurrentUser] = useState(null);

    //inputting the sets data 


    const sets = exercises.length > 0 ? exercises[0].sets : 0;
    const initialSetInputs = initializeSetInputs(exercises);
    const [setInputs, setSetInputs] = useState(initialSetInputs)



    const handleAddSet = (exerciseIndex) => {
        const newSetInputs = [...setInputs];
        newSetInputs[exerciseIndex].push({ lbs: '', reps: '' })
        setSetInputs(newSetInputs);
    }

    //State for workout Timer
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prevTimer) => prevTimer + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    //Handle input change for lbs and reps
    const handleInputChange = (exerciseIndex, setIndex, key, value) => {
        const newSetInputs = [...setInputs];
        newSetInputs[exerciseIndex][setIndex][key] = value;
        setSetInputs(newSetInputs);
    };

    //Formatting time into minutes and seconds
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
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
    const [previousData, setPreviousData] = useState([]);

    // console.log('Render Previous Data:', previousData);

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
                        }
                    });


                };

                setPreviousData(previousData);
                console.log('Fetched Data', previousData)
            }
        } catch (error) {
            console.error('Error fetching previous data:', error);
        }
    }





    return (
        <ScrollView style={styles.container}>
            <View style={styles.timerContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.timerText}>{formatTime(timer)}</Text>
                <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                    <Text>Back</Text>
                </TouchableOpacity>
            </View>
            {exercises && exercises.map((exercise, exerciseIndex) => (
                <View key={exerciseIndex} style={styles.exerciseContainer}>
                    <Text style={styles.exerciseTitle}>{exercise.title}</Text>

                    <View style={styles.headerContainer}>
                        <View style={styles.setColumn}>
                            <Text style={styles.headerText}>Set</Text>
                        </View>
                        <View style={styles.setColumn}>
                            <Text style={styles.headerText}>lbs</Text>
                        </View>
                        <View style={styles.setColumn}>
                            <Text style={styles.headerText}>Reps</Text>
                        </View>
                    </View>

                    {Array(exercise.sets).fill().map((_, setIndex) => (
                        <View key={setIndex} style={styles.setContainer}>
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
                                    previousData.length > 0
                                        && previousData[exerciseIndex]
                                        && previousData[exerciseIndex].sets
                                        && previousData[exerciseIndex].sets[setIndex]
                                        && previousData[exerciseIndex].sets[setIndex].lbs
                                        ? `${previousData[exerciseIndex].sets[setIndex].lbs} lbs`
                                        : ''

                                }
                            />

                            <TextInput
                                style={styles.input}
                                placeholder='lbs'
                                keyboardType='numeric'
                                value={setInputs[exerciseIndex] && setInputs[exerciseIndex][setIndex]
                                    ? setInputs[exerciseIndex][setIndex].lbs : ''}
                                onChangeText={(value) => handleInputChange(exerciseIndex, setIndex, 'lbs', value)}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder='Reps'
                                keyboardType='numeric'
                                value={setInputs[exerciseIndex] && setInputs[exerciseIndex][setIndex]
                                    ? setInputs[exerciseIndex][setIndex].reps : ''}
                                onChangeText={(value) => handleInputChange(exerciseIndex, setIndex, 'reps', value)}
                            />

                        </View>
                    ))}

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
    buttonContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    container: {
        flexGrow: 1,
        padding: 20,
    },
    title: {
        fontSize: 25,
        fontWeight: '700',
        marginBottom: 20,
        marginTop: 25
    },
    timerContainer: {
        flexDirection: 'row',

    },
    timerText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 30,
        marginLeft: 15
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
        fontWeight: '700'
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
        width: '30%',
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
        width: '20%',
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
        alignSelf: 'center',
        width: '30%',
        backgroundColor: '#dc143c',
        borderRadius: 10,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginLeft: 120
    }

});

export default StartWorkout;