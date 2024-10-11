import { Text, StyleSheet, View, SafeAreaView, Button } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

export default function Profile() {
    const router = useRouter();

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
        marginBottom: 20, // Add some space between the text and the button
    },
});