import { SPLITS } from '../data/EXERCISES';
import { FlatList, View, Text, TouchableOpacity, Modal, StyleSheet, Button } from 'react-native';
import { Card } from '@rneui/base';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import ModalWorkout from './ModalWorkout'


const WorkoutCard = ({ splitData }) => {
    const [modalVisible, setModalVisible] = useState(false)
    const [selectedCard, setSelectedCard] = useState(splitData[0]);
    const cardComponent = (muscle) => {

        return (

            <SafeAreaView>

                <TouchableOpacity style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => {

                        setSelectedCard(muscle)
                        setModalVisible(true)
                    }}>

                    <Card containerStyle={{ borderRadius: 10, margin: 10 }}>
                        <Card.Title>{muscle.title}</Card.Title>
                        {muscle.exercises.map((muscle) => <Text key={muscle.id}>{muscle.title}</Text>)}
                    </Card>
                </TouchableOpacity>
            </SafeAreaView>



        )
    }
    return (
        <>
            <ModalWorkout
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                selectedCard={selectedCard} />

            {splitData.map((split) => cardComponent(split))}

        </>

    )

}







export default WorkoutCard;