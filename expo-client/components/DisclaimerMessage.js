import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Banner, useTheme } from 'react-native-paper';

function DisclaimerMessage({ message }) {
    const theme = useTheme();

    return (
        <Banner
        visible={true}
        style={{backgroundColor: theme.colors.secondaryContainer}}>
            {message}
        </Banner>
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
