import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
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

                    <Text style={styles.username}> Username </Text>
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
        marginTop: 20
    },

    title: {
        textAlignVertical: 'top',
        textAlign: 'left',
        fontSize: 35,
        fontWeight: '700',
        margin: 20,
    },
    safeArea: {
        flex: 0,

    },

    user: {
        flexDirection: 'row'
    },

    username: {
        marginTop: 30,
        marginLeft: 15
    }
})
export default Profile;