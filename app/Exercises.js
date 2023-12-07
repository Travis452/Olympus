import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import axios from 'axios';

const Exercises = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExercises = async () => {
            const options = {
                method: 'GET',
                url: 'https://exercisedb.p.rapidapi.com/exercises',
                headers: {
                    'X-RapidAPI-Key': 'af77d413eamsh0c2a0d3d9880799p182697jsnb18404139001',
                    'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
                }
            };

            try {
                const response = await axios.request(options);
                setExercises(response.data);
            } catch (error) {
                console.error('Error fetching exercises', error);
            } finally {
                setLoading(false);
            }
        }

        fetchExercises();
    }, []);

    if (loading) {
        return <ActivityIndicator size='large' color='#0000ff' />
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={exercises}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <Text style={styles.item}>{item.name}</Text>
                )}
            />
        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 22
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    },
});

export default Exercises;