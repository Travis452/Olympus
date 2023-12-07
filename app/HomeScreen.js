import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Splits from '../components/Splits';

const HomeScreen = () => {


    return (
        <SafeAreaView>

            <ScrollView>
                <Text style={styles.title}>Start Workout</Text>
                <View>
                    <Text style={styles.text}>Quick Start</Text>
                </View>
                <View style={styles.btnView}>
                    <TouchableOpacity style={styles.randomBtn}>
                        <Text style={styles.btnTxt}>Random Workout</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.smTitle}>Custom Workouts</Text>
                    <Text style={styles.text}> My Custom Workouts </Text>
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.smTitle}>Example Workouts</Text>
                </View>
            </ScrollView>
            <Splits />



        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    titleContainer: {
        flex: 1,
        alignItems: 'left',
    },

    container: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        textAlignVertical: 'top',
        textAlign: 'left',
        fontSize: 35,
        fontWeight: '700',
        margin: 20,
    },
    smTitle: {
        textAlignVertical: 'top',
        textAlign: 'left',
        fontSize: 25,
        fontWeight: '700',
        margin: 20,
    },

    text: {
        fontSize: 15,
        fontWeight: '700',
        marginTop: 10,
        marginBottom: 10,
        margin: 20,
    },

    btnTxt: {
        color: 'white',
    },

    btnView: {
        width: '100%',
        height: 50,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    randomBtn: {
        width: '90%',
        backgroundColor: '#dc143c',
        borderRadius: 7,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
});

export default HomeScreen;
