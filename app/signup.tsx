import React from 'react';
import { Image, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import tw from 'twrnc'; 

export default function Signup() {
  const router = useRouter(); // Use router for navigation


  return (
    <View style={tw`flex-1 bg-[#F8F5E5] justify-center items-center px-4`}>
      <Image
        source={require('../assets/images/signUpLeftCorner.png')}
        style={styles.cornerImg}
      />
      <Image
        source={require('../assets/images/rightCorner.png')}
        style={styles.topRightImg}
      />
      <Image
        source={require('../assets/images/bottomLeftImg.png')}
        style={styles.bottomLeftImg}
      />
      <Image
        source={require('../assets/images/bottomRightImg.png')}
        style={styles.bottomRightImg}
      />
      <TouchableOpacity 
        style={tw`absolute top-10 left-4`} 
        onPress={() => router.back()} // Navigate back to the Welcome page
      >
        <Text style={tw`text-2xl`}>&larr;</Text> 
      </TouchableOpacity>

      {/* Header with decorative elements */}
      <Text style={tw`text-4xl font-semibold text-[#6B8068] mt-2`}>Hello!</Text>
      <Text style={tw`text-2xl font-bold text-black mb-6`}>Register to Get Started</Text>

      {/* Earth Image */}
      <Image
        source={require('../assets/images/sittingPlanet.png')}  // globe image
        style={styles.earthImg}
      />

      {/* Username Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        placeholderTextColor="#FFFFFF"
      />

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#FFFFFF"
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        placeholderTextColor="#FFFFFF"
        secureTextEntry
      />

      {/* Confirm Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        placeholderTextColor="#FFFFFF"
        secureTextEntry
      />

      {/* Register Button */}
      <TouchableOpacity style={styles.button}
        onPress={() => router.push('../(tabs)')}
      >
        <Text style={tw`text-white text-center text-lg`}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  earthImg: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#ADD8E6',
    padding: 12,
    borderRadius: 10,
    width: '100%',
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#C2D5BA',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginTop: 20,
  },
    container: {
    flex: 1,
  },
  cornerImg: {
    position: 'absolute',
    top: -56,
    left: -36,
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  topRightImg: {
    position: 'absolute',
    top: -30,
    right: -55,
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
