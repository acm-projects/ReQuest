import React, { useState, useEffect } from 'react'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Image, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FIREBASE_AUTH, db } from '../FirebaseConfig';
import { User } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import tw from 'twrnc'; 
import CustomLoadingIndicator from './CustomLoadingIndicator';


export default function Signup() {
  // Keep all your existing state declarations
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);  // Initial loading true
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const router = useRouter();
  const {user, setUser} = useAuth();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLoadingComplete = () => {
    setShowContent(true);
  };

  // Keep your existing signUp function as is
  const signUp = async () => {
    setIsLoading(true);
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      setIsLoading(false);
      return;
    }
    try {
      // ... rest of your existing signup logic ...
    } catch (error: any) {
      console.log(error);
      alert('Sign in failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  // Modified return for loading state
  if (!showContent) {
    return (
      <View style={styles.loadingContainer}>
        <CustomLoadingIndicator
          imageSource={require('../assets/images/sittingPlanet.png')}
          width={200}
          height={200}
          isLoading={isLoading}  // Changed this to just isLoading
          onExitComplete={handleLoadingComplete}
          direction="top-to-bottom"
          duration={1500}
        />
      </View>
    );
  }

 


  
  return (
    <View style={tw`flex-1 bg-amber-50 justify-center items-center px-4`}>
      <Image
        source={require('../assets/images/lightTopLeft.png')}
        style={styles.cornerImg}
      />
      <Image
        source={require('../assets/images/lightTopRight.png')}
        style={styles.topRightImg}
      />
      <Image
        source={require('../assets/images/lightBottomLeft.png')}
        style={styles.bottomLeftImg}
      />
      <Image
        source={require('../assets/images/lightBottomRight.png')}
        style={styles.bottomRightImg}
      />
      <TouchableOpacity 
        style={tw`absolute top-10 left-4`} 
        onPress={() => router.back()} // Navigate back to the Welcome page
      >
        <Text style={tw`text-2xl`}>&larr;</Text> 
      </TouchableOpacity>

      {/* Header with decorative elements */}
      <Text style={tw`text-5xl font-semibold text-[#6B8068] mt-2`}>Hello!</Text>
      <Text style={tw`text-3xl font-bold text-black mb-6`}>Register to Get Started</Text>

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
        value = {username}
        onChangeText={setUsername}
      />

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#FFFFFF"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        placeholderTextColor="#FFFFFF"
        secureTextEntry
        value = {password}
        onChangeText={setPassword}
      />

      {/* Confirm Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        placeholderTextColor="#FFFFFF"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {/* Register Button */}
      <TouchableOpacity style={styles.button} onPress={signUp}>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#728A68',
  },
  input: {
    backgroundColor: '#ADD8E6',
    padding: 12,
    borderRadius: 10,
    width: '90%',
    marginBottom: 12,
    textAlign: 'left',
  },
  button: {
    backgroundColor: '#C2D5BA',
    padding: 15,
    borderRadius: 10,
    width: '50%',
    marginTop: 20,
  },
    container: {
    flex: 1,
  },
  cornerImg: {
    position: 'absolute',
    top: -56,
    left: -48,
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  topRightImg: {
    position: 'absolute',
    top: -36,
    right: -55,
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  bottomLeftImg: {
    position: 'absolute',
    bottom: -49,
    left: -69,
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  bottomRightImg: {
    position: 'absolute',
    bottom: -50,
    right: -33,
    width: 200,
    height: 200,
  },
});
