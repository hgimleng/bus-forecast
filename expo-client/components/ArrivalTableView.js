import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { DataTable, Text } from 'react-native-paper'
import TableViewHeader from './displays/TableViewHeader'
import TableViewInfo from './displays/TableViewInfo'
import TableViewTiming from './displays/TableViewTiming'

function ArrivalTableView({ arrivalData, selectedStop, stops }) {

    function getBusTiming(busTimings, stopSequence) {
        if (!busTimings[stopSequence]) {
            return '-'
        }
        return busTimings[stopSequence]['time']
    }

    function getFontWeight(busTimings, stopSequence) {
        if (!busTimings[stopSequence]) {
          return 'normal'
        }
        return busTimings[stopSequence]['isForecasted'] ? 'normal' : 'bold'
    }

    function timeDiff(time1, time2) {
        const parseTime = (timeStr) => {
            const [hours, minutes, seconds] = timeStr.split(':').map(Number);
            const day = hours < 4 ? 1 : 0;
            return new Date(0, 0, day, hours, minutes, seconds);
        };
    
        const date1 = parseTime(time1);
        const date2 = parseTime(time2);
        const diffMins = Math.max((date2 - date1) / 60000, 0);

        // Round off to 1 decimal place
        return Math.round(diffMins * 10) / 10
    }

    function getTravelTimeRange(startStop, endStop) {
        let minTime = -1
        let maxTime = -1
        for (const bus of arrivalData) {
            if (bus['busTimings'][startStop] && bus['busTimings'][endStop]) {
                const time = timeDiff(bus['busTimings'][endStop]['time'], bus['busTimings'][startStop]['time'])
                if (minTime == -1 || time < minTime) {
                    minTime = time
                }
                if (maxTime == -1 || time > maxTime) {
                    maxTime = time
                }
            }
        }
        if (minTime == -1 || maxTime == -1) {
            return '-'
        } else {
            return `${minTime} - ${maxTime} mins`
        }
    }

    return (
        <ScrollView horizontal={true}>
        <DataTable>
            <DataTable.Header>
                <TableViewHeader title={'Bus Stop'} style={{width: 200}} />
                {arrivalData.map((item, index) => (
                    <TableViewHeader key={index} title={`Bus ${item['busId']}`} style={{width: 80}} />
                ))}
                <TableViewHeader title={'Travel Time'} style={{width: 200}} />
            </DataTable.Header>
            {stops
                .filter(stop => stop['stopSequence'] <= parseInt(selectedStop))
                .sort((a, b) => b['stopSequence'] - a['stopSequence'])
                .map(stop => (
                    <DataTable.Row key={stop['stopSequence']} style={styles.row}>
                        <TableViewInfo content={stop['name']} />
                        {arrivalData.map((bus, index) => (
                            <TableViewTiming key={index} timing={getBusTiming(bus['busTimings'], stop['stopSequence'])} fontWeight={getFontWeight(bus['busTimings'], stop['stopSequence'])} />
                        ))}
                        <TableViewInfo content={getTravelTimeRange(stop['stopSequence'], stop['stopSequence']-1)} />
                    </DataTable.Row>
                  ))
            }
        </DataTable>
        </ScrollView>
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
    row: {
        marginVertical: -6
    }
});

export default ArrivalTableView;
