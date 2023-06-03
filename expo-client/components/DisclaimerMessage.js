import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function DisclaimerMessage({ message }) {
    return (
        <View style={styles.alert}>
            <Text style={styles.alertText}>{message}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    alert: {
        backgroundColor: 'skyblue',
        padding: 10,
        borderRadius: 5,
        marginBottom: 12,
    },
    alertText: {
        color: 'white',
    },
});

export default DisclaimerMessage;
