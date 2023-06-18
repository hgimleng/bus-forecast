import React from 'react';
import { Banner, useTheme } from 'react-native-paper';

function DisclaimerMessage({ message }) {
    const theme = useTheme();

    return (
        <Banner
        visible={true}
        style={{backgroundColor: theme.colors.secondaryContainer}}>
            {message}
        </Banner>
    )
}

export default DisclaimerMessage;
