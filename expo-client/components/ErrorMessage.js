import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function ErrorMessage({ message }) {
    return (
        <View style={styles.alert}>
            <Text style={styles.alertText}>{message}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    alert: {
        backgroundColor: 'tomato',
        padding: 10,
        borderRadius: 5
    },
    alertText: {
        color: '#fff',
    },
});

export default ErrorMessage;
