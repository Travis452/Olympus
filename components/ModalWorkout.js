import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ModalWorkout = ({ selectedCard, modalVisible, setModalVisible }) => {

    const renderWorkouts = () => {
        if (!selectedCard.modalExerciseArr) return null;
        return selectedCard.modalExerciseArr.map((workout, index) => (
            <Text key={index} style={{ marginBottom: 5 }}>
                {workout}
            </Text>
        ));
    }
    return (
        <Modal
            transparent={true}
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}

            onRequestClose={() => {
                setModalVisible(!modalVisible)
            }}>
            <TouchableOpacity style={styles.centeredView}
                onPress={() => setModalVisible(false)}>
                <View style={styles.modalView}>


                    <Text>{selectedCard.title}</Text>
                    {renderWorkouts()}



                </View>
            </TouchableOpacity>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalView: {
        margin: 20,
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },

    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
})

export default ModalWorkout;