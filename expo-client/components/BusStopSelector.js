import React, { useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { List, Divider } from 'react-native-paper'

function BusStopSelector({ selectStop, selectedStop, selectedDirection, routes }) {    
    
    const [expandedId, setExpandedId] = useState(null)

    function onSelectStop(stopSequence) {
        selectStop(expandedId.toString(), stopSequence)
    }

    return (
        <List.AccordionGroup
        expandedId={expandedId}
        onAccordionPress={(id) => id == expandedId ? setExpandedId(null) : setExpandedId(id)}>
            {Object.entries(routes['directions']).map(([directionNum, direction]) => (
                <List.Accordion
                    title={direction.text}
                    description={direction.loopDesc ? `${direction.loopDesc} (Loop)` : ''}
                    id={directionNum}
                    key={directionNum}>
                        <ScrollView
                            style={styles.scrollView}
                            showsVerticalScrollIndicator={true}
                            persistentScrollbar={true}
                            nestedScrollEnabled={true}>
                            {routes['stops'][directionNum].map((stop, index) => {
                                let isSelected = stop.stopSequence === selectedStop && expandedId === selectedDirection

                                return (<React.Fragment key={index}>
                                <List.Item
                                    title={stop.name}
                                    onPress={() => onSelectStop(stop.stopSequence)}
                                    style={[
                                        styles.listItem,
                                        isSelected ? styles.listItemSelected : null,
                                    ]}
                                    disabled={isSelected}
                                    key={`${directionNum}-${stop.stopSequence}`}
                                /><Divider />
                                </React.Fragment>)
                            })}
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
