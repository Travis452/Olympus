import { SPLITS } from '../data/SPLITS';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Card } from '@rneui/base';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native'



const WorkoutDetail = () => {
    const { selectedSplitId } = useRoute().params
    const selectedSplit = SPLITS.find(split => split.id === selectedSplitId);
    console.log(selectedSplitId);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>{selectedSplit.title}</Text>
            {selectedSplit.muscles.map((muscle) => (

                <Card containerStyle={styles.cardContainer} key={muscle.id}>
                    <Card.Title>{muscle.title}</Card.Title>
                    <FlatList
                        data={muscle.exercises}
                        keyExtractor={(exercise, index) => index.toString()}
                        renderItem={({ item }) => <Text>{item}</Text>}
                    />
                </Card>
            ))}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 20,
    },
    title: {
        fontSize: 25,
        fontWeight: '700',
    },
    cardContainer: {
        borderRadius: 10,
        margin: 10,
    },
});

export default WorkoutDetail;