import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Button, Input } from '@rneui/themed';

function SearchForm({ onFind }) {
    const [text, setText] = useState('')

    const handleSubmit = () => {
        onFind(text.toUpperCase())
    }

    return (
        <View style={styles.container}>
            <Input 
                containerStyle={{width: 100, height: 50}}
                placeholder='Bus no.'
                maxLength={4}
                onChangeText={(text) => setText(text)}
            />
            <Button
                title="Find"
                loading={false}
                loadingProps={{ size: 'small', color: 'white' }}
                buttonStyle={{
                    backgroundColor: 'skyblue',
                    borderRadius: 5,
                }}
                containerStyle={{
                    width: 100
                }}
                onPress={handleSubmit}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row', 
        justifyContent: 'center',
        marginBottom: 12,
    },
});

export default SearchForm;
