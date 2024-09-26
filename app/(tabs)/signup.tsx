import React from 'react';
import { Image, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import tw from 'twrnc'; 

export default function Signup() {
  return (
    <View style={tw`flex-1 bg-[#F8F5E5] justify-center items-center px-4`}>
      
      {/* Back Arrow */}
      <TouchableOpacity style={tw`absolute top-10 left-4`}>
        <Text style={tw`text-2xl`}>&larr;</Text> 
      </TouchableOpacity>

      {/* Header with decorative elements */}
      <Text style={tw`text-4xl font-semibold text-[#6B8068] mt-2`}>Hello!</Text>
      <Text style={tw`text-2xl font-bold text-black mb-6`}>Register to Get Started, Excited to have you with us</Text>

      {/* Earth Image */}
      <Image
        source={require('../../assets/images/plswork2.png')}  // globe image
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
      <TouchableOpacity style={styles.button}>
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
    backgroundColor: '#D6E7F2',
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
});
