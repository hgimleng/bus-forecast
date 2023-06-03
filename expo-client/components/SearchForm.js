import React, { useState } from 'react'
import { View, TextInput, Button, StyleSheet } from 'react-native'

function SearchForm({ onFind }) {
    const [text, setText] = useState('')

    const handleSubmit = () => {
        onFind(text.toUpperCase())
    }

    return (
        <View style={styles.container}>
            <View style={styles.inputGroup}>
                <TextInput 
                    style={styles.input}
                    placeholder='Bus no.'
                    maxLength={4}
                    onChangeText={(text) => setText(text)}
                />
                <Button
                    title="Find"
                    onPress={handleSubmit}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row', 
        justifyContent: 'center',
    },
    inputGroup: {
        flexDirection: 'row', 
        justifyContent: 'center',
        marginBottom: 12,
    },
    input: {
        width: 80,
        borderColor: 'gray', 
        borderWidth: 1,
        marginRight: 4,
    },
});

export default SearchForm
