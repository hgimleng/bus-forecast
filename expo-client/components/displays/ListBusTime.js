import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'

function ListBusTime({ style, arrivalTime, timeDiff }) {
    return (
        <View style={[style, styles.view]}>
            <Text>{arrivalTime}</Text>
            {timeDiff && <Text> (+{ timeDiff })</Text>}
        </View>
    )
}

export default ListBusTime;

const styles = StyleSheet.create({
    view: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 4,
    },
});