import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import { WebView } from 'react-native-webview'; // Ensure you have the react-native-webview package installed
import { useRouter } from 'expo-router'; // Import the router
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the back arrow

const tipsAndGuides = [
  {
    title: "Tip 1: Reduce Plastic Use",
    description: "Try to use reusable bags and bottles to minimize plastic waste.",
    link: "https://www.youtube.com/embed/CSaUzORm8s8", // Embed link format
  },
  {
    title: "Tip 2: Recycle Properly",
    description: "Make sure to clean and sort your recyclables correctly.",
    link: "https://www.youtube.com/embed/jsp7mgYv3aI", // Embed link format
  },
  {
    title: "Tip 3: Compost Organic Waste",
    description: "Consider composting food scraps and yard waste to reduce landfill waste.",
    link: "https://www.youtube.com/embed/zy70DAaeFBI", // Embed link format
  },
  {
    title: "Tip 4: Save Water",
    description: "Fix leaks and use water-efficient fixtures to conserve water.",
    link: "https://www.youtube.com/embed/5J3cw4biWWo", // Replace with your link
  },
  {
    title: "Tip 5: Reduce Food Waste",
    description: "Plan meals and use leftovers to minimize food waste.",
    link: "https://www.youtube.com/embed/ishA6kry8nc", // Replace with your link
  },
  // Add more tips here (up to 10)
];

export default function TipsAndGuides() {
  const router = useRouter(); // Use router for navigation

  return (
    <View style={tw`flex-1 bg-amber-50`}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollView}>
        {tipsAndGuides.map((tip, index) => (
          <View key={index} style={styles.tipContainer}>
            <Text style={tw`text-xl font-bold`}>{tip.title}</Text>
            <Text style={tw`text-base text-gray-700`}>{tip.description}</Text>
            <WebView
              source={{ uri: tip.link }} // Use the embed link
              style={styles.video}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scalesPageToFit={true}
            />
            <TouchableOpacity 
              onPress={() => Linking.openURL(tip.link.replace('/embed/', '/watch?v='))} // Open link on YouTube
              style={styles.linkButton}
            >
              <Text style={tw`text-blue-600`}>Watch Video on YouTube</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: 16,
    backgroundColor: 'transparent', // Make background transparent
    alignItems: 'flex-start',
    marginTop: 50, // Move the arrow down by 10 pixels
  },
  scrollView: {
    padding: 16,
    flexGrow: 1,
  },
  tipContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
  },
  video: {
    height: 200, // Set a height for the video
    marginVertical: 10,
    borderRadius: 8,
  },
  linkButton: {
    marginTop: 10,
  },
});
