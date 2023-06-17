import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Button, SegmentedButtons, Text } from 'react-native-paper';

import ArrivalListView from './ArrivalListView'
import ArrivalTableView from './ArrivalTableView'

function BusArrivalDisplay({ arrivalData, updateTime, refreshData, selectedStop, stops, busDiff, isLoading }) {
    const [viewType, setViewType] = useState('list')
    const [allowRefresh, setAllowRefresh] = useState(true)

    function handleRefresh() {
        refreshData()
        setAllowRefresh(false)

        setTimeout(() => {
            setAllowRefresh(true)
        }, 15000);
    }

    return (
        <View>
            <View style={styles.buttonView}>
            <SegmentedButtons
                value={viewType}
                onValueChange={value => setViewType(value)}
                buttons={[{ label: 'List View', value: 'list' }, { label: 'Table View', value: 'table' }]}
                theme={{ roundness: 0 }}
                style={{ flex: 4 }}
            />
            <Button style={{ flex: 1 }} mode={'outlined'} onPress={handleRefresh} theme={{ roundness: 0 }} disabled={!allowRefresh} loading={isLoading} >
                Refresh
            </Button>
            </View>

            <Text
            variant="headlineSmall"
            style={styles.text}>
                { stops.filter(s => s['stopSequence'] === selectedStop)[0]['name'] }
            </Text>
            {viewType === 'list' && <ArrivalListView arrivalData={arrivalData} updateTime={updateTime} selectedStop={selectedStop} busDiff={busDiff} />}
            {viewType === 'table' && <ArrivalTableView arrivalData={arrivalData} selectedStop={selectedStop} stops={stops} />}
            <Text>Last Updated: {updateTime}</Text>
        </View>
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
    buttonView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 12,
    }
});

export default BusArrivalDisplay;
