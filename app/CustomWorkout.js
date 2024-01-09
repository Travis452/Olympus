import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CustomWorkout = () => {

    const navigation = useNavigation();

    const handleBack = () => {
        console.log("back button pressed")
        navigation.navigate('HomeScreen');
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>

                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                        <Ionicons name='md-arrow-back' size={24} color='red' />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Custom Workout</Text>
                    </View>
                </View>

                <View style={styles.addButtonContainer}>
                    <TouchableOpacity style={styles.addButton}>
                        <Text style={styles.addButtonText}>Add Exercise</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}
















const styles = StyleSheet.create({




    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 50,
        marginBottom: 20,




    },
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',


    },

    title: {
        fontSize: 25,
        fontWeight: '700',
    },

    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },

    backBtn: {
        marginLeft: 10,
        padding: 0
    },
    addButtonContainer: {
        alignItems: 'center',
        marginTop: 20,

    },
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


})


export default CustomWorkout;