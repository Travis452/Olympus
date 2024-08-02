import { useState } from 'react';
import { SPLITS } from '../data/SPLITS';
import { View, Text, ScrollView, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Card } from '@rneui/base';
import { useRoute, useNavigation } from '@react-navigation/native'
import BackButton from '../components/BackButton';



const WorkoutDetail = () => {


    const { selectedSplitId } = useRoute().params
    const selectedSplit = SPLITS.find(split => split.id === selectedSplitId);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const navigation = useNavigation();

    // timer
    const [timer, setTimer] = useState(0);
    const [startTimer, setStartTimer] = useState(true);

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
        setTimer(0);
        setStartTimer(true);
        navigation.navigate('StartWorkout', {
            selectedWorkout,
            selectedSplitId,
            startTimer
        });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
            <BackButton destination = 'HomeScreen' />
            <Text style={styles.title}>{selectedSplit?.title}</Text>
            </View>
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
                                <Text style={styles.btnText}>Start</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={closeModal} style={styles.cancelBtn}>
                                <Text style={styles.btnText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <View style={styles.footer}>

            </View>
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
        paddingBottom: 300,

    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    title: {
        fontSize: 25,
        fontWeight: '700',
        textAlign: 'center',
        flex: 0.9
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
        flexDirection: 'row',
        justifyContent: 'space-between',
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

    footer: {
        height: 70,
    }
});

export default WorkoutDetail;

