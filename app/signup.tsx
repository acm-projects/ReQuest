import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Image, StyleSheet, Text, View, TextInput, TouchableOpacity, TouchableWithoutFeedback, ScrollView, KeyboardAvoidingView, Platform, Keyboard, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { FIREBASE_AUTH, db } from '../FirebaseConfig';
import { User } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import tw from 'twrnc';
import CustomLoadingIndicator from './CustomLoadingIndicator';
import { useFonts } from 'expo-font';
import * as Font from 'expo-font';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Initial loading true
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const router = useRouter();
  const { user, setUser, signedIn, setSignedIn } = useAuth();
  const [showContent, setShowContent] = useState(false);
  const [fontsLoaded] = useFonts({
    'Nerko-One': require('../assets/fonts/NerkoOne-Regular.ttf'),
    'Gilroy': require('../assets/fonts/Gilroy-Regular.otf'),
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleLoadingComplete = () => {
    setShowContent(true);
  };

  const auth = FIREBASE_AUTH;

  const signUp = async (): Promise<boolean> => {  // Add return type
    setIsLoading(true);
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      setIsLoading(false);
      return false;  // Return false for invalid password
    }
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      console.log(response.user);
      console.log(response.user.uid);

      setUser({
        uid: response.user.uid,
      });
      setSignedIn(true);

      console.log(user);
      const docRef = doc(db, "users", response.user.uid);
      await setDoc(docRef, {
        email: email,
        username: username,
        points: 0,
        numRecycled: 0,
        recyclingCart: [],
        successfullyRecycled: [],
        weight: 0,
        impact: 0,
        recycled: {},
      });
      console.log(response);
      return true;  // Return true for successful signup

    } catch (error: any) {
      console.log(error);
      alert('Sign in failed: ' + error.message);
      setSignedIn(false);
      return false;  // Return false for any errors
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterPress = async () => {
    const signupSuccessful = await signUp();
    if (signupSuccessful) {
      router.push('../(tabs)');  // Make sure this path matches your file structure
    }
  };

  // Show loading animation if content isn't ready
  if (!showContent) {
    return (
      <View style={styles.loadingContainer}>
        <CustomLoadingIndicator
          imageSource={require('../assets/images/sittingPlanet.png')}
          width={200}
          height={200}
          isLoading={isLoading}  // Loading state is passed here
          onExitComplete={handleLoadingComplete}
          direction="top-to-bottom"
          duration={1500}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-amber-50`}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={tw`flex-grow`}
            keyboardShouldPersistTaps="handled"
          >
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
              {/* Back Arrow */}
              <TouchableOpacity 
                style={tw`absolute top-0 left-2`}
                onPress={() => router.back()}
              >
                <Text style={tw`text-4xl`}>&larr;</Text> 
              </TouchableOpacity>

              <Text style={[tw`text-8xl font-semibold text-[#6B8068] mt-2`, { fontFamily: 'Nerko-One' }]}>Hello!</Text>
              <Text style={[tw`text-4xl font-bold text-black mb-6`, { fontFamily: 'Nerko-One' }]}>Register to Get Started</Text>

              <Image
                source={require('../assets/images/sittingPlanet.png')}
                style={styles.earthImg}
              />

              <TextInput
                style={[styles.input, { fontFamily: 'Gilroy' }]}
                placeholder="Enter your username"
                placeholderTextColor="black"
                value={username}
                onChangeText={setUsername}
              />

              <TextInput
                style={[styles.input, { fontFamily: 'Gilroy' }]}
                placeholder="Enter your email"
                placeholderTextColor="black"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={[styles.input, { fontFamily: 'Gilroy' }]}
                placeholder="Enter your password"
                placeholderTextColor="black"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />

              <TextInput
                style={[styles.input, { fontFamily: 'Gilroy' }]}
                placeholder="Confirm password"
                placeholderTextColor="black"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
              />

              <TouchableOpacity 
                style={[styles.button, tw`mb-6`]} // Added margin bottom
                onPress={handleRegisterPress}
              >
                <Text style={[tw`text-black text-center text-lg`, { fontFamily: 'Gilroy' }]}>Register</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    padding: Platform.OS === 'ios' ? 12 : 10, // Slightly smaller on Android
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
    marginBottom: Platform.OS === 'ios' ? 20 : 10,
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
    resizeMode: 'contain',
  },
});