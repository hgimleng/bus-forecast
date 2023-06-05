import React from 'react';
import { Banner, useTheme } from 'react-native-paper';

function ErrorMessage({ message }) {
    const theme = useTheme();

    return (
        <Banner
        visible={true}
        style={{backgroundColor: theme.colors.errorContainer}}>
            {message}
        </Banner>
    )
}

export default ErrorMessage;
