import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, IconButton } from 'react-native-paper'

function ListBusInfo({ style, busLocation, busType, busLoad }) {
    let busTypeIcon = [];
    if (busType === 'Single Deck') {
        busTypeIcon = [<IconButton icon="bus-side" style={styles.icon} />];
    } else if (busType === 'Double Deck') {
        busTypeIcon = [<IconButton icon="bus-double-decker" style={styles.icon} />];
    } else if (busType === 'Bendy') {
        busTypeIcon = [<IconButton icon="bus-side" style={styles.icon} />, <IconButton icon="bus-side" style={styles.icon} />];
    }

    let busLoadIcon = [];
    if (busLoad === 'Low') {
        busLoadIcon = [<IconButton icon="account" style={styles.icon} />, <IconButton icon="account-outline" style={styles.icon} />, <IconButton icon="account-outline" style={styles.icon} />];
    } else if (busLoad === 'Medium') {
        busLoadIcon = [<IconButton icon="account" style={styles.icon} />, <IconButton icon="account" style={styles.icon} />, <IconButton icon="account-outline" style={styles.icon} />];
    } else if (busLoad === 'High') {
        busLoadIcon = [<IconButton icon="account" style={styles.icon} />, <IconButton icon="account" style={styles.icon} />, <IconButton icon="account" style={styles.icon} />];
    }

    return (
        <View style={[style, styles.view]}>
            <Text>{busLocation}</Text>
            <View style={styles.iconContainer}>
                {busTypeIcon}
                {busLoadIcon}
            </View>
        </View>
    )
}

export default ListBusInfo;

const styles = StyleSheet.create({
    view: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 4,
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        margin: -8,
    }
});