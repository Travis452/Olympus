import { useState } from 'react';
import { StyleSheet, SafeAreaView, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const CreateAccount = () => {
    const navigation = useNavigation();
    const [state, setState] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });

    const handleSubmit = async () => {
        const { firstName, lastName, email, password } = state;

        try {
            if (email && password) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Save user details to Firestore
                await setDoc(doc(db, 'users', user.uid), {
                    firstName,
                    lastName,
                    email,
                    completedWorkouts: 0,
                });

                navigation.navigate('MainTabs', { firstName });
                console.log('User created and Firestore document set');
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
        backgroundColor: 'white'
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
