import React from 'react'
import { ScrollView, View, StyleSheet } from 'react-native'
import { ListItem, Text } from '@rneui/themed'

function BusStopSelector({ stops, selectStop, selectedStop }) {
    return (
        <View style={styles.container}>
            <Text style={styles.text} h4>Select Bus Stop:</Text>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={true}
                persistentScrollbar={true}>
                {stops.map(stop => (
                    <ListItem
                        key={stop.stopSequence}
                        onPress={() => selectStop(stop.stopSequence)}
                        containerStyle={styles.listItem}
                        disabled={stop.stopSequence === selectedStop}
                        disabledStyle={styles.listItemSelected}
                    >
                        <ListItem.Content>
                            <ListItem.Title>{stop.name}</ListItem.Title>
                        </ListItem.Content>
                        <ListItem.Chevron />
                    </ListItem>
                ))}
            </ScrollView>
        </View>
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
    scrollView: {
        maxHeight: 300,
        borderColor: 'skyblue',
        borderLeftWidth: 1,
        borderRightWidth: 1,
    },
    listItem: {
        paddingVertical: 8,
    },
    listItemSelected: {
        backgroundColor: 'skyblue',
        opacity: 0.5,
    },
});

export default BusStopSelector;
