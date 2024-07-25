import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';

const Profile = () => {
    const firstName = useSelector((state) => state.user.firstName);


    return (
        <ScrollView style={styles.container}>
            <SafeAreaView styles={styles.safeArea}>
                <View>
                    <Text style={styles.title} >Profile</Text>
                </View>

                <View style={styles.user}>
                    <Image
                        style={styles.image}
                        resizeMode={'cover'} />

                    <Text style={styles.username}> {firstName} </Text>
                </View>
            </SafeAreaView>
        </ScrollView>
    )
}

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
        flexDirection: 'row'
    },

    username: {
        marginTop: 30,
        marginLeft: 15,
        fontSize: 20,
        fontWeight: '600'
    }
})
export default Profile;