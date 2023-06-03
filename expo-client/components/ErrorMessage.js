import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function ErrorMessage({ message }) {
    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.alert}>
                    <Text style={styles.alertText}>{message}</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    innerContainer: {
        flexDirection: 'column',
    },
    alert: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    alertText: {
        color: '#fff',
    },
});

export default ErrorMessage;
