import { useState } from 'react';
import { SPLITS } from '../data/SPLITS';
import { View, Text, ScrollView, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Card } from '@rneui/base';
import { useRoute, useNavigation } from '@react-navigation/native'



const WorkoutDetail = () => {


    const { selectedSplitId } = useRoute().params
    const selectedSplit = SPLITS.find(split => split.id === selectedSplitId);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const navigation = useNavigation();



    const openModal = (workout) => {

        setSelectedWorkout(selectedSplit.muscles.find(muscle => muscle.title === workout));
        setModalVisible(true);
    };

    const closeModal = () => {
        setSelectedWorkout(null);
        setModalVisible(false);
    }

    const startWorkout = () => {
        setModalVisible(false);
        navigation.navigate('StartWorkout', {
            selectedWorkout,
            selectedSplitId
        });
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{selectedSplit?.title}</Text>
            {selectedSplit?.muscles.map((muscle) => (
                <TouchableOpacity
                    key={muscle.id}
                    onPress={() => openModal(muscle.title)}>
                    <Card containerStyle={styles.cardContainer}>
                        <Card.Title>{muscle.title}</Card.Title>
                        {/* string template literal */}
                        {muscle.exercises.map((exercise, index) => (

                            <Text key={index}>{exercise.sets}x{exercise.reps} {exercise.title}</Text>

                        ))}
                    </Card>
                </TouchableOpacity>
            ))}
            <Modal animationType="fade" transparent={true} visible={modalVisible}>
                <View style={styles.centeredView}>
                    <View style={styles.modalContainer}>
                        <Text>Would you like to start this Workout?</Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={startWorkout} style={styles.startBtn}>
                                <Text>Start</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={closeModal} style={styles.cancelBtn}>
                                <Text style={styles.btnText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    container: {
        flexGrow: 1,
        padding: 40,
        paddingTop: 50,
        paddingBottom: 50,

    },
    title: {
        fontSize: 25,
        fontWeight: '700',
        textAlign: 'center',
        paddingBottom: 10
    },
    cardContainer: {
        borderRadius: 10,
        margin: 10,

    },
    modalContainer: {

        borderRadius: 10,
        padding: 40,
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    buttonContainer: {
        flexDirection: 'row', // Make children appear horizontally
        justifyContent: 'space-between', // Add space between the two buttons
        width: '100%',
        marginTop: 10,
    },
    startBtn: {
        width: '30%',
        backgroundColor: '#dc143c',
        borderRadius: 15,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        marginBottom: 10
    },
    btnText: {
        color: 'white'

    },
    cancelBtn: {
        width: '30%',
        backgroundColor: 'black',
        color: 'white',
        borderRadius: 15,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        marginBottom: 10
    },
});

export default WorkoutDetail;

