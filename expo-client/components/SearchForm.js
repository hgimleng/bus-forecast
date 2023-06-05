import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Searchbar } from 'react-native-paper';

function SearchForm({ onFind }) {
    const [text, setText] = useState('')

    const handleSubmit = () => {
        if (text.length > 0) {
            onFind(text.toUpperCase())
        }
    }

    return (
        <View style={styles.container}>
            <Searchbar 
                placeholder="Bus no."
                onChangeText={(text) => setText(text)}
                maxLength={4}
                onSubmitEditing={handleSubmit}
                onEndEditing={handleSubmit}
                onIconPress={handleSubmit}
                theme={{ roundness: 0 }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
    },
});

export default SearchForm;
