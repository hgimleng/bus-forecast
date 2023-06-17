import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'

function TableViewTiming({ style, timing, fontWeight }) {
    return (
        <View style={[style, styles.view]}>
            <Text style={[styles.text, {fontWeight: fontWeight}]}>{timing}</Text>
        </View>
    )
}

export default TableViewTiming;

const styles = StyleSheet.create({
    view: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 2,
        marginRight: 2,
        width: 80,
    },
    text: {
        textAlign: 'center',
    }
});