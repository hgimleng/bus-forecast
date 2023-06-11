import React, { useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { List } from 'react-native-paper'

function BusStopSelector({ selectStop, selectedStop, routes }) {    
    
    const [expandedId, setExpandedId] = useState(null)

    function onSelectStop(stopSequence) {
        selectStop(expandedId.toString(), stopSequence)
        setExpandedId(null)
    }

    return (
        <List.AccordionGroup
        expandedId={expandedId}
        onAccordionPress={setExpandedId}>
            {Object.entries(routes['directions']).map(([key, direction]) => (
                <List.Accordion
                    title={direction.text}
                    description={direction.loopDesc ? `${direction.loopDesc} (Loop)` : ''}
                    id={key}
                    key={key}>
                        <ScrollView
                            style={styles.scrollView}
                            showsVerticalScrollIndicator={true}
                            persistentScrollbar={true}>
                            {routes['stops'][key].map(stop => (
                                <List.Item
                                    title={stop.name}
                                    onPress={() => onSelectStop(stop.stopSequence)}
                                    style={[
                                        styles.listItem,
                                        stop.stopSequence === selectedStop ? styles.listItemSelected : null,
                                    ]}
                                    disabled={stop.stopSequence === selectedStop}
                                    key={stop.stopSequence}
                                />
                            ))}
                        </ScrollView>
                </List.Accordion>
            ))}
        </List.AccordionGroup>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        maxHeight: 300,
    },
    listItem: {
        paddingVertical: 4,
    },
    listItemSelected: {
        opacity: 0.5,
    }
});

export default BusStopSelector;
