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
                <DataTable.Title style={{flex: 1}}>Bus</DataTable.Title>
                <DataTable.Title style={{flex: 2}}>Time</DataTable.Title>
                <DataTable.Title style={{flex: 5}}>Next Stop</DataTable.Title>
            </DataTable.Header>
            {arrivalData.map(item => {
                const arrivalTime = item['busTimings'][selectedStop] ? item['busTimings'][selectedStop]['time'] : '-'
                const timeDiff = busDiff[item['busId']-1] ? formatTimeDiff(busDiff[item['busId']-1]) : null
                const busLocation = item['busLocation']
                const busType = getBusType(item['busTimings'])
                const busLoad = getBusLoad(item['busTimings'])

                return (
                <DataTable.Row key={item['busId']}>
                    <DataTable.Cell style={{flex: 0.5}}>
                        {item['busId']}
                    </DataTable.Cell>
                    <ListBusTime style={{flex: 2}} arrivalTime={arrivalTime} timeDiff={timeDiff} />
                    <ListBusInfo style={{flex: 5}} busLocation={busLocation} busType={busType} busLoad={busLoad} />
                </DataTable.Row>)
            })}
        </DataTable>
    )
}

const styles = StyleSheet.create({
    container: {
        borderTopColor: 'lightgrey',
        borderTopWidth: 1,
        width: '90%',
    },
    text: {
        textAlign: 'center',
    },
});

export default ArrivalListView;
