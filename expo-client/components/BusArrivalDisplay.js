import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
// import { ListItem, Text } from '@rneui/themed'
import { Text } from 'react-native-paper';

import ArrivalListView from './ArrivalListView'

function BusArrivalDisplay({ arrivalData, updateTime, refreshData, selectedStop, stops, busDiff }) {
    const [listView, setListView] = useState(true)
    const [refreshCountdown, setRefreshCountdown] = useState(0)

    return (
        <>
        <Text
        variant="headlineSmall">
            { stops.filter(s => s['stopSequence'] === selectedStop)[0]['name'] }
        </Text>
        <ArrivalListView arrivalData={arrivalData} updateTime={updateTime} selectedStop={selectedStop} busDiff={busDiff} />
        </>
        // <View style={styles.container}>
        //     <Text style={styles.text} h4>{ stops.filter(s => s['stopSequence'] === selectedStop)[0]['name'] }</Text>
        //     {listView && <ArrivalListView arrivalData={arrivalData} updateTime={updateTime} selectedStop={selectedStop} busDiff={busDiff} />}
        // </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderTopColor: 'lightgrey',
        borderTopWidth: 1,
        width: '90%',
        alignItems: 'center',
        marginBottom: 12,
    },
    text: {
        textAlign: 'center',
    },
});

export default BusArrivalDisplay;
