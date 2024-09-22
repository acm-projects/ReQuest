import { Image, StyleSheet, Platform, Text, View, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
export default function Welcome() {
    return (
        
        <View style={tw `flex-1 justify-center items-center`}>
            <View>
              <Text style={tw `text-center text-lg`}>Welcome to RecycleRoute!</Text>
            </View>
        </View>
    );
}


