import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ButtonGroup, Text } from '@rneui/themed'

function DirectionSelector({ directions, onClick, selectedDirection }) {
    return (
        <View style={styles.container}>
            <Text h4>Select Direction:</Text>
            <ButtonGroup
                buttons={
                    Object.entries(directions).map(([key, direction]) => (
                        direction.text + (direction.loopDesc ? `\n${direction.loopDesc} (Loop)` : '')
                    ))
                }
                selectedIndex={selectedDirection-1}
                onPress={(value) => {
                    onClick(value + 1);
                }}
                containerStyle={{ height: 50, width: '90%' }}
                buttonStyle={{ borderColor: 'skyblue', borderWidth: 1 }}
                selectedButtonStyle={{ backgroundColor: 'skyblue'}}
                textStyle={{ textAlign: 'center', color: 'black' }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        borderTopColor: 'lightgrey',
        borderTopWidth: 1,
    },
});

export default DirectionSelector
