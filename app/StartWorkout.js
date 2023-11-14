import { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native'

const StartWorkout = ({ route }) => {
    console.log('Received parameters:', route.params.selectedWorkout);
    const { selectedWorkout } = route.params;
    const { exercises, id, title } = selectedWorkout
    const sets = exercises.length > 0 ? exercises[0].sets : 0;

    const [setInputs, setSetInputs] = useState(Array(sets).fill({ lbs: '', reps: '' }))

    const handleInputChange = (index, key, value) => {
        const newSetInputs = [...setInputs];
        newSetInputs[index][key] = value;
        setSetInputs(newSetInputs);
    };


    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            {exercises && exercises.map((exercise, exerciseIndex) => (
                <View key={exerciseIndex} style={styles.exerciseContainer}>
                    <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                    {Array(exercise.sets).fill().map((_, setIndex) => (
                        <View key={setIndex} style={styles.setContainer}>
                            <Text>Set {setIndex + 1}</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder='lbs'
                                    keyboardType='numeric'
                                    value={setInputs[setIndex].lbs}
                                    onChangeText={(value) => handleInputChange(setIndex, 'lbs', value)}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder='Reps'
                                    keyboardType='numeric'
                                    value={setInputs[setIndex].reps}
                                    onChangeText={(value) => handleInputChange(setIndex, 'reps', value)}
                                />
                            </View>
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
    },
    exerciseContainer: {
        marginBottom: 20,
    },
    exerciseTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 10,
    },
    setContainer: {
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        marginHorizontal: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderRadius: 5,
    },
});

export default StartWorkout;