import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';

export default function Dashboard() {
  const router = useRouter(); // Use router for navigation

  return (
    <View style={tw`flex-1 bg-amber-50`}>
      {/* Top Section */}
      <View style={tw`flex-1 justify-center items-center`}>
        <Text style={tw`text-2xl font-bold text-black`}>Welcome Back, Name!</Text>
        <Text style={tw`text-lg text-gray-700 mt-2`}>These are your current stats:</Text>
      </View>

      {/* Bold Black Line Divider */}
      <View style={styles.boldDivider} />

      {/* Stats Sections */}
      <View style={tw`flex-2 px-6 pt-4`}>
        <View style={styles.statItem}>
          <Text style={styles.statText}>Number of items recycled:</Text>
          <Text style={styles.statNumber}>123 items</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statText}>How long the world could last if everyone recycled like you:</Text>
          <Text style={styles.statNumber}>690 years</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statText}>Reduced Carbon Footprint:</Text>
          <Text style={styles.statNumber}>789 kg</Text>
        </View>
      </View>

      {/* Tips and Guide Button */}
      <TouchableOpacity style={styles.guideButton} onPress={() => router.push('../tipandguide')}>
        <Text style={tw`text-white text-center text-lg`}>Tips and Guides</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  boldDivider: {
    borderBottomWidth: 5,
    borderBottomColor: 'black',
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Align items
    alignItems: 'center', // Center vertically
    borderBottomWidth: 2,
    borderBottomColor: 'gray',
    paddingVertical: 35, // Original padding
    marginBottom: 10,
  },
  statText: {
    flex: 1, // Allow the text to grow and take up available space
    textAlign: 'left', // Left-align the text
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'green',
  },
  guideButton: {
    backgroundColor: '#C2D5BA',
    padding: 15,
    borderRadius: 10,
    width: '80%', // Adjusted width for the button
    alignSelf: 'center', // Center the button horizontally
    position: 'absolute', // Position the button absolutely
    bottom: 40, // Move the button up closer to the last stat item
  },
});
