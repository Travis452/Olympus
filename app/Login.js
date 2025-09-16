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
            navigation.navigate('HomeScreen')
        } catch (error) {
            console.error('Login Failed', error.message);
        }


    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('User is Logged in');
            }
        })

        return () => {
            unsubscribe();
        }
    }, [auth]);

    const onPressForgotPassword = () => {

    }

    const onPressSignUp = () => {
        navigation.navigate('CreateAccount')
    }





    return (
        <SafeAreaView style={styles.container}>
          <Text style={styles.title}>LOGIN</Text>
    
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputText}
              placeholder="Email"
              placeholderTextColor="rgba(255,255,255,0.6)"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoCorrect={false}
              value={state?.email}
              onChangeText={(value) => setState({ ...state, email: value })}
              selectionColor={RED}
            />
          </View>
    
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputText}
              placeholder="Password"
              placeholderTextColor="rgba(255,255,255,0.6)"
              secureTextEntry
              textContentType="password"
              value={state?.password}
              onChangeText={(value) => setState({ ...state, password: value })}
              selectionColor={RED}
              returnKeyType="done"
            />
          </View>
    
          <TouchableOpacity onPress={onPressForgotPassword}>
            <Text style={styles.linkMuted}>Forgot Password?</Text>
          </TouchableOpacity>
    
          <TouchableOpacity onPress={onPressLogin} style={styles.glowBtn}>
            <Text style={styles.glowText}>LOG IN</Text>
          </TouchableOpacity>
    
          <TouchableOpacity onPress={onPressSignUp} style={styles.secondaryLink}>
            <Text style={styles.linkMuted}>Create Account</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    };
    const RED = "#ff1a1a";
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
      },
    
      title: {
        fontSize: 28,
        color: RED,
        marginBottom: 36,
        letterSpacing: 2,
        fontFamily: "Orbitron_700Bold",
        textShadowColor: RED,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12,
      },
    
      inputView: {
        width: "90%",
        borderColor: RED,
        borderWidth: 1.5,
        borderRadius: 10,
        height: 52,
        marginBottom: 18,
        justifyContent: "center",
        paddingHorizontal: 15,
        backgroundColor: "rgba(255, 26, 26, 0.06)",
        shadowColor: RED,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 10,
        elevation: 8,
      },
    
      inputText: {
        color: "white",
        fontSize: 16,
        fontFamily: "Orbitron_400Regular",
      },
    
      linkMuted: {
        color: "rgba(255,255,255,0.75)",
        marginTop: 8,
        fontFamily: "Orbitron_400Regular",
        letterSpacing: 0.5,
      },
    
      secondaryLink: {
        marginTop: 14,
      },
    
      glowBtn: {
        width: "90%",
        borderColor: RED,
        borderWidth: 2,
        borderRadius: 12,
        height: 52,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 28,
        backgroundColor: "transparent",
        shadowColor: RED,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 16,
        elevation: 12,
      },
    
      glowText: {
        color: RED,
        fontSize: 18,
        fontFamily: "Orbitron_700Bold",
        letterSpacing: 2,
      },
    });
    
    export default Login;