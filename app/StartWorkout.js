import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'

const StartWorkout = ({ route }) => {

    const { selectedWorkout } = route.params;
    const { exercises, id, title } = selectedWorkout
    const sets = exercises.length > 0 ? exercises[0].sets : 0;

    const [setInputs, setSetInputs] = useState(() => {

        return exercises.map((exercise) =>
            Array(exercise.sets).fill().map(() => ({ lbs: '', reps: '' }))
        );
    });

    const [timer, setTimer] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prevTimer) => prevTimer + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleInputChange = (exerciseIndex, setIndex, key, value) => {
        const newSetInputs = [...setInputs];
        newSetInputs[exerciseIndex][setIndex][key] = value;
        setSetInputs(newSetInputs);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }


    return (
        <ScrollView style={styles.container}>
            <View style={styles.timerContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.timerText}>{formatTime(timer)}</Text>
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
                                style={styles.input}
                                placeholder='lbs'
                                keyboardType='numeric'
                                value={setInputs[exerciseIndex][setIndex].lbs}
                                onChangeText={(value) => handleInputChange(exerciseIndex, setIndex, 'lbs', value)}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder='Reps'
                                keyboardType='numeric'
                                value={setInputs[exerciseIndex][setIndex].reps}
                                onChangeText={(value) => handleInputChange(exerciseIndex, setIndex, 'reps', value)}
                            />

                        </View>
                    ))}
                </View>
            ))}

        </ScrollView>
    );
};

const styles = StyleSheet.create({
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
    }

});

export default StartWorkout;