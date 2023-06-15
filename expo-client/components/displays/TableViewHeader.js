import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Divider } from 'react-native-paper'

function TableViewHeader({ style, title }) {
    return (
        <View style={[style, styles.view]}>
            <Text style={styles.text}>{title}</Text>
        </View>
    )
}

export default TableViewHeader;

const styles = StyleSheet.create({
    view: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 2,
        marginRight: 2,
    },
    text: {
        fontWeight: 'bold',
    }
});