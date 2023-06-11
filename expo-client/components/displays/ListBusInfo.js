import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'

function ListBusInfo({ style, busLocation, busType, busLoad }) {
    let busLoadColor = '#000000'
    if (busLoad == 'Low') {
        busLoadColor = '#00ff00'
    } else if (busLoad == 'Medium') {
        busLoadColor = '#ffa500'
    } else if (busLoad == 'High') {
        busLoadColor = '#ff0000'
    }

    return (
        <View style={[style, styles.view]}>
            <Text>{busLocation}</Text>
            <Text style={{color: busLoadColor}}>{`(${busType}, ${busLoad} crowd)`}</Text>
        </View>
    )
}

export default ListBusInfo;

const styles = StyleSheet.create({
    view: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 4,
    },
});