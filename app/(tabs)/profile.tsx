import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';

export default function Profile() {
  const router = useRouter(); // Use router for navigation

  return (
    <View style={tw`flex-1 bg-amber-50 justify-center items-center px-4`}>
      {/* Profile Icon */}
     
      <Image
        source={require('../../assets/images/img2.png')} // Adjusted path to images
        style={styles.topLeftImg}
      />
      <Image
        source={require('../../assets/images/bottomLeftImg.png')}
        style={styles.bottomLeftImg}
      />
      <Image
        source={require('../../assets/images/bottomRightImg.png')}
        style={styles.bottomRightImg}
      />
      <Image
        source={require('../../assets/images/rightCorner.png')}
        style={styles.topRightImg}
      />
       <Image
        source={require('../../assets/images/fireEarth.png')} // Adjust the path to your profile icon image
        style={styles.profileIcon}
      />
      {/* Back Arrow */}
      
      {/* Profile Options */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={tw`text-lg`}>Edit Profile Information</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={tw`text-lg`}>Notification Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={tw`text-lg`}>Change Language</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={tw`text-lg`}>Help & Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={tw`text-lg`}>Contact Us</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={tw`text-lg`}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton}>
        <Text style={tw`text-white text-center`}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  profileIcon: {
    width: '40%', // Set the width of the profile icon to 40% of the screen width
    height: '20%', // Set the height of the profile icon to 20% of the screen height
    position: 'absolute',
    top: 30, // Position it near the top of the screen
    alignSelf: 'center', // Center it horizontally
  },
  optionsContainer: {
    marginTop: 100, // Adjust this value to create space below the profile icon
    width: '100%',
    paddingHorizontal: 10,
  },
  optionButton: {
    backgroundColor: '#C2D5BA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#FF5733', // A distinct color for logout
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginTop: 20,
  },
  topLeftImg: {
    position: 'absolute',
    top: -30,
    left: -30,
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  topRightImg: {
    position: 'absolute',
    top: -22,
    right: -50,
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  bottomLeftImg: {
    position: 'absolute',
    bottom: -35,
    left: -60,
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  bottomRightImg: {
    position: 'absolute',
    bottom: -48,
    right: -24,
    width: 200,
    height: 200,
  },
});
