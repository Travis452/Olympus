// CreateAccount.js
import { useState } from 'react';
import { StyleSheet, SafeAreaView, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

const CreateAccount = () => {
    const navigation = useNavigation();
    const [state, setState] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });

    const handleSubmit = async () => {
        const { email, password } = state;

        try {
            if (email && password) {
                await createUserWithEmailAndPassword(auth, email, password);
                console.log('User created, navigating to HomeScreen');
                navigation.navigate('MainTabs'); // Correct navigation target
                console.log('Navigation action dispatched');
            }
        } catch (err) {
            console.log('got error:', err.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <View style={styles.inputView}>
                <TextInput
                    style={styles.inputText}
                    placeholder='First Name'
                    placeholderTextColor="white"
                    value={state.firstName}
                    onChangeText={(value) => setState({ ...state, firstName: value })}
                />
            </View>
            <View style={styles.inputView}>
                <TextInput
                    style={styles.inputText}
                    placeholder='Last Name'
                    placeholderTextColor="white"
                    value={state.lastName}
                    onChangeText={(value) => setState({ ...state, lastName: value })}
                />
            </View>
            <View style={styles.inputView}>
                <TextInput
                    style={styles.inputText}
                    placeholder='Email'
                    placeholderTextColor="white"
                    value={state.email}
                    onChangeText={(value) => setState({ ...state, email: value })}
                />
            </View>
            <View style={styles.inputView}>
                <TextInput
                    style={styles.inputText}
                    placeholder='Create Password'
                    placeholderTextColor="white"
                    value={state.password}
                    onChangeText={(value) => setState({ ...state, password: value })}
                />
            </View>
            <TouchableOpacity
                onPress={handleSubmit}
                style={styles.loginBtn}>
                <Text style={styles.loginText}>Sign Up</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4FD3DA'
    },
    title: {
        fontSize: 25,
        fontWeight: '500',
        marginBottom: 40
    },
    inputView: {
        width: '80%',
        backgroundColor: 'black',
        borderRadius: 25,
        height: 50,
        marginBottom: 20,
        justifyContent: 'center',
        padding: 20
    },
    inputText: {
        height: 50,
        color: 'white'
    },
    loginBtn: {
        width: '80%',
        backgroundColor: '#dc143c',
        borderRadius: 25,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        marginBottom: 10
    },
    loginText: {
        color: 'white',
    }
});

export default CreateAccount;
