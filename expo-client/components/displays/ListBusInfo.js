import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, IconButton } from 'react-native-paper'

function ListBusInfo({ style, busLocation, busType, busLoad }) {
    let busTypeIcon = [];
    if (busType === 'Single Deck') {
        busTypeIcon = [<IconButton key='bus-side-1' icon="bus-side" style={styles.icon} />];
    } else if (busType === 'Double Deck') {
        busTypeIcon = [<IconButton key='bus-double-decker-1' icon="bus-double-decker" style={styles.icon} />];
    } else if (busType === 'Bendy') {
        busTypeIcon = [<IconButton key='bus-side-1' icon="bus-side" style={styles.icon} />, <IconButton key='bus-side-2' icon="bus-side" style={styles.icon} />];
    }

    let busLoadIcon = [];
    if (busLoad === 'Low') {
        busLoadIcon = [<IconButton key='account-1' icon="account" style={styles.icon} />, <IconButton key='account-outline-1' icon="account-outline" style={styles.icon} />, <IconButton key='account-outline-2' icon="account-outline" style={styles.icon} />];
    } else if (busLoad === 'Medium') {
        busLoadIcon = [<IconButton key='account-1' icon="account" style={styles.icon} />, <IconButton key='account-2' icon="account" style={styles.icon} />, <IconButton key='account-outline-1' icon="account-outline" style={styles.icon} />];
    } else if (busLoad === 'High') {
        busLoadIcon = [<IconButton key='account-1' icon="account" style={styles.icon} />, <IconButton key='account-2' icon="account" style={styles.icon} />, <IconButton key='account-3' icon="account" style={styles.icon} />];
    }

    return (
        <View style={[style, styles.view]}>
            <Text style={{textAlign: 'center'}}>{busLocation}</Text>
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