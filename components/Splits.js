import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@rneui/base';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SPLITS } from '../data/SPLITS';
import WorkoutCard from './WorkoutCard';

const Splits = () => {
    const naviagtion = useNavigation();

    const onPressSplit = (selectedSplitId) => {


        naviagtion.navigate('WorkoutDetail', { selectedSplitId });

    }
    return (

        <FlatList
            data={SPLITS}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.splitItem}
                    onPress={() => onPressSplit(item.id)}>

                    <Text style={styles.splitTitle}>{item.title}</Text>
                </TouchableOpacity>
            )}
        />



    )
}



const styles = StyleSheet.create({
    cardContainer: {
        width: '90%', // Adjust the width as needed
        borderRadius: 10,
        marginBottom: 5
    },
    splitItem: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    splitTitle: {
        fontSize: 20
    }
});

export default Splits;