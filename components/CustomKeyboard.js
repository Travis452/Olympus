import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Keyboard, Platform } from 'react-native';

const CustomKeyboard = ({ onKeyPress, onNext, onDone, inputAccessoryViewID, visible }) => {
    const translateY = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(translateY, {
                toValue: 300,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, translateY]);

    return (
        <Animated.View style={[styles.keyboardContainer, { transform: [{ translateY }] }]}>
            <View style={styles.row}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((key) => (
                    <TouchableOpacity key={key} style={styles.key} onPress={() => onKeyPress(key)}>
                        <Text style={styles.keyText}>{key}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.row}>
                <TouchableOpacity style={styles.key} onPress={onNext}>
                    <Text style={styles.keyText}>Next</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.key} onPress={onDone}>
                    <Text style={styles.keyText}>Done</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    keyboardContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#ccc',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
    },
    key: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
        padding: 10,
        backgroundColor: '#eee',
        borderRadius: 5,
    },
    keyText: {
        fontSize: 18,
    },
});

export default CustomKeyboard;
