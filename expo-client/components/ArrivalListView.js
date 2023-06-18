import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { DataTable, Text } from 'react-native-paper'

import ListBusTime from './displays/ListBusTime'
import ListBusInfo from './displays/ListBusInfo'

function ArrivalListView({ arrivalData, updateTime, selectedStop, busDiff }) {
    function getBusType(busTimings) {
        // Loop through all bus timings and find first non 'NA' bus type
        for (const stopSequence in busTimings) {
            if (busTimings[stopSequence]['busType'] != 'NA') {
                return busTimings[stopSequence]['busType']
            }
        }
    }

    function getBusLoad(busTimings) {
        // Loop through all bus timings and find first non 'NA' bus load
        for (const stopSequence in busTimings) {
            if (busTimings[stopSequence]['load'] != 'NA') {
                const load = busTimings[stopSequence]['load']
                return load
            }
        }
    }

    function formatTimeDiff(secondsArr) {
        function secondsToStr(seconds) {
            const minutes = Math.floor(seconds / 60)
            const remainingSeconds = Math.floor(seconds % 60)
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
        }

        function findMedian(arr) {
            arr.sort((a, b) => a - b)
            const middle = Math.floor(arr.length / 2)
            return arr.length % 2 === 1 ? arr[middle] : (arr[middle - 1] + arr[middle]) / 2;
        }
        
        return secondsToStr(findMedian(secondsArr))
    }

    return (
        <DataTable>
            <DataTable.Header>
                <View style={styles.busCellView}><Text variant='titleSmall'>Bus</Text></View>
                <View style={styles.timeCellView}><Text variant='titleSmall'>Time</Text></View>
                <View style={styles.infoCellView}><Text variant='titleSmall'>Next Stop</Text></View>
            </DataTable.Header>
            {arrivalData.map(item => {
                const arrivalTime = item['busTimings'][selectedStop] ? item['busTimings'][selectedStop]['time'] : '-'
                const timeDiff = busDiff[item['busId']-1] ? formatTimeDiff(busDiff[item['busId']-1]) : null
                const busLocation = item['busLocation']
                const busType = getBusType(item['busTimings'])
                const busLoad = getBusLoad(item['busTimings'])

                return (
                <DataTable.Row key={item['busId']}>
                    <View style={styles.busCellView}><Text>{item['busId']}</Text></View>
                    <ListBusTime style={styles.timeCellView} arrivalTime={arrivalTime} timeDiff={timeDiff} />
                    <ListBusInfo style={styles.infoCellView} busLocation={busLocation} busType={busType} busLoad={busLoad} />
                </DataTable.Row>)
            })}
        </DataTable>
    )
}

const styles = StyleSheet.create({
    busCellView: {
        flex: 1,
        alignItems:'center',
        justifyContent:'center',
    },
    timeCellView: {
        flex: 2,
        alignItems:'center',
        justifyContent:'center',
    },
    infoCellView: {
        flex: 5,
        alignItems:'center',
        justifyContent:'center',
    }
});

export default ArrivalListView;
