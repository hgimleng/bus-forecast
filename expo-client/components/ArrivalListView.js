import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { DataTable, Text } from 'react-native-paper'

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
            {arrivalData.map(item => (
                <DataTable.Row>
                    <DataTable.Cell style={{flex: 1}}>
                        {item['busId']}
                    </DataTable.Cell>
                    <View style={{flex: 2}}>
                        <Text>{item['busTimings'][selectedStop] ? item['busTimings'][selectedStop]['time'] : '-'}</Text>
                        {busDiff[item['busId']-1] && <Text> (+{ formatTimeDiff(busDiff[item['busId']-1]) })</Text>}
                    </View>
                    <View style={{flex: 5}}>
                        <Text>{item['busLocation']}</Text>
                        <Text>{`(${getBusType(item['busTimings'])}, ${getBusLoad(item['busTimings'])} crowd)`}</Text>
                    </View>
                </DataTable.Row>
            ))}
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
