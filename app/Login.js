import { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, ScrollView, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'


const Login = () => {


    const navigation = useNavigation();
    const auth = getAuth();

    const [state, setState] = useState({
        email: '',
        password: '',
    })

    const onPressLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, state.email, state.password);
        } catch (error) {
            console.error('Login Failed', error.message);
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigation.navigate('HomeScreen');
            }
        })

        return () => {
            unsubscribe();
        }
    }, [auth, navigation]);

    const onPressForgotPassword = () => {

    }

    const onPressSignUp = () => {
        navigation.navigate('CreateAccount')
    }





    return (
        <SafeAreaView style={styles.container}>


            <Text style={styles.title}>Login</Text>
            <View style={styles.inputView}>
                <TextInput
                    style={styles.inputText}
                    placeholder='Email'
                    onChangeText={(value) => setState({ ...state, email: value })}
                />
            </View>
            <View style={styles.inputView}>
                <TextInput
                    style={styles.inputText}

                    placeholder='Password'
                    onChangeText={(value) => setState({ ...state, password: value })}
                />
            </View>
            <TouchableOpacity
                onPress={onPressForgotPassword}>
                <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={onPressLogin}
                style={styles.loginBtn}>
                <Text style={styles.loginText}>LOGIN</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={onPressSignUp}>
                <Text style={styles.forgot}>Signup</Text>
            </TouchableOpacity>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backGroundColor: '#4FD3DA'
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
    forgotAndSignUpText: {
        color: 'black',
        fontSize: 11
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
})

export default Login