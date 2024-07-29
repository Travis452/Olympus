import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuth from '../hooks/useAuth';

const Profile = () => {
    const { user, completedWorkouts } = useAuth();

    if (!user) {
        return (
            <View style={styles.container}>
                <Text>No user logged in</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <SafeAreaView styles={styles.safeArea}>
                <View>
                    <Text style={styles.title}>Profile</Text>
                </View>
                <View style={styles.user}>
                    <Image
                        style={styles.image}
                        resizeMode={'cover'} />
                        <View style={styles.userInfo}>
                    <Text style={styles.username}> {user.firstName || ''} </Text>
                    <Text style={styles.completedWorkoutsText}>{completedWorkouts} Workouts</Text>
                    </View>
                </View>
            </SafeAreaView>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 0,
        padding: 20,
        paddingTop: 0,
    },
    image: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderRadius: 75,
        marginTop: 20,
        backgroundColor: 'lightgrey'
    },
    title: {
        textAlignVertical: 'top',
        textAlign: 'left',
        fontSize: 35,
        fontWeight: '700',
        margin: 15,
        marginTop: 40,
        marginLeft: 5
    },
    safeArea: {
        flex: 0,
    },
    user: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    userInfo: {
        flexDirection: 'column',
        
    },
    username: {
        marginTop: 30,
        marginLeft: 15,
        fontSize: 20,
        fontWeight: '600'
    },
    completedWorkouts: {
        marginLeft: 70 
    },
    completedWorkoutsText: {
        fontSize: 20,
        fontWeight: '300',
        marginLeft: 20
    }
});

export default Profile;
