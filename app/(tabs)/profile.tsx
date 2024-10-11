import { Text, StyleSheet, View, SafeAreaView } from 'react-native';
import React from 'react';

export default function Profile() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.center}>
                <Text style={styles.text}>
                    Profile Page
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black', // Set a background color to ensure text is visible
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        textAlign: 'center',
        color: 'white',
    },
});