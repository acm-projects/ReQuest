import React from 'react';
import { Image, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc'; 

export default function Login() {
  const router = useRouter(); // Use router for navigation


  return (
    <View style={tw`flex-1 bg-amber-50 justify-center items-center px-4`}>
      
      {/* Back Arrow */}
      <TouchableOpacity 
        style={tw`absolute top-10 left-4`} 
        onPress={() => router.push('/welcome')} // Navigate back to the Welcome page
      >
        <Text style={tw`text-2xl`}>&larr;</Text> 
      </TouchableOpacity>

      {/* Earth Image */}
      <Image
        source={require('../../assets/images/birdPlanet.png')}  // link to the earth image
        style={styles.headerImg}
      />

      {/* Welcome Text */}
      <Text style={tw`text-2xl font-semibold text-emerald-600 mt-4`}>Welcome Back!</Text>
      <Text style={tw`text-2xl font-bold text-black`}>Glad to See You Again</Text>

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

      {/* Forgot Password */}
      <TouchableOpacity>
        <Text style={tw`text-right w-full text-green-600`}>Forgot password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={tw`text-white text-center text-lg`}>Log In</Text>
      </TouchableOpacity>

      <Image
        source={require('../../assets/images/loadingHeart.png')}  // link to the heart image
        style={styles.footerImg}
      />

      {/* Footer Text */}
      <Text style={tw`text-emerald-600 mt-6`}>Thank you for recycling responsibly!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerImg: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ADD8E6',
    padding: 10,
    borderRadius: 10,
    width: '100%',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#C2D5BA',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginTop: 20,
  },
  footerImg: {
    width: 100,
    height: 60,
    alignSelf: 'auto',
    marginTop: 22,
  }
});