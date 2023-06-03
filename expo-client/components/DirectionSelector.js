import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

function DirectionSelector({ directions, onClick, selectedDirection }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Direction:</Text>
            <View style={styles.buttonGroup}>
                {Object.entries(directions).map(([key, direction]) => (
                    <TouchableOpacity 
                        key={key} 
                        style={[
                            styles.button, 
                            selectedDirection === key ? styles.activeButton : null
                        ]}
                        onPress={() => onClick(key)}
                    >
                        <Text style={styles.buttonText}>
                            {direction.text}
                            {direction.loopDesc && 
                                <Text>
                                    {"\n"}{direction.loopDesc} (Loop)
                                </Text>
                            }
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    buttonGroup: {
        flexDirection: 'row',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        margin: 5,
    },
    activeButton: {
        backgroundColor: '#0056b3',
    },
    buttonText: {
        color: '#ffffff',
        textAlign: 'center',
    },
});

export default DirectionSelector
