import { StyleSheet, Text, TouchableOpacity, ImageBackground, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';


const Signup = () => {
    const navigation = useNavigation();
    const { user } = useAuth(navigation);

    useEffect(() => {
        if (user) {
            navigation.navigate('HomeScreen');
        }
    }, [user]);


    const onPressSignUp = () => {
        navigation.navigate('CreateAccount');
    }


    const onPressLogin = () => {
        navigation.navigate('Login');
    }


    return (

        <View style={styles.container}>
            <ImageBackground
                source={require('../assets/images/Gustave.jpeg')}
                resizeMode='cover'
                style={styles.image}
                blurRadius={2.5}>
                <Text style={styles.text}>Welcome to Olympus</Text>
                <TouchableOpacity
                    onPress={onPressSignUp}
                    style={styles.signupBtn}>
                    <Text style={styles.btnText}>Signup</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onPressLogin}>
                    <Text style={styles.btnText}>Login</Text>
                </TouchableOpacity>
            </ImageBackground>
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    image: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',


    },
    text: {
        fontSize: 35,
        fontWeight: '500',
        textAlign: 'center',
        color: 'white',
    },
    btnText: {
        fontSize: 20,
        fontWeight: '500',
        color: 'white'

    },
    signupBtn: {
        width: '70%',
        backgroundColor: '#dc143c',
        borderRadius: 15,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        marginBottom: 10
    },
})

export default Signup;