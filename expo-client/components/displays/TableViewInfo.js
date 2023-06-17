import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'

function TableViewInfo({ style, content }) {
    return (
        <View style={[style, styles.view]}>
            <Text style={styles.text}>{content}</Text>
        </View>
    )
}

export default TableViewInfo;

const styles = StyleSheet.create({
    view: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 2,
        marginRight: 2,
        width: 200,
    },
    text: {
        textAlign: 'center',
    }
});