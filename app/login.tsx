import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { useAuth } from '../AuthContext';
import { FIREBASE_AUTH } from '../FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import CustomLoadingIndicator from './CustomLoadingIndicator';
import { useFonts } from 'expo-font';
import * as Font from 'expo-font';
import { SafeAreaView } from 'react-native';
import { Asset } from 'expo-asset'; // Import expo-asset

export default function LoginScreen() {

  const router = useRouter();
  const auth = FIREBASE_AUTH;
  const [showContent, setShowContent] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, setUser, signedIn, setSignedIn } = useAuth();
  const [fontsLoaded] = useFonts({
    'Nerko-One': require('../assets/fonts/NerkoOne-Regular.ttf'),
    'Gilroy': require('../assets/fonts/Gilroy-Regular.otf'),
  });

  // Preload images and fonts before showing content
  useEffect(() => {
    async function preloadAssets() {
      // Preload images
      const images = [
        require('../assets/images/birdPlanet.png'),
        require('../assets/images/lightTopLeft.png'),
        require('../assets/images/lightBottomLeft.png'),
        require('../assets/images/lightBottomRight.png'),
        require('../assets/images/lightTopRight.png'),
        require('../assets/images/loadH.png')
      ];

      // Load all assets
      await Asset.loadAsync(images);

      // Simulate a loading process (e.g., fonts, images)
      setTimeout(() => {
        setIsLoading(false); // Loading done
      }, 3000);
    }

    preloadAssets();
  }, []);

  const handleLoadingComplete = () => {
    setShowContent(true);
  };

  const handleLogin = async () => {
    setIsLoginLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
      setSignedIn(true);
      setUser({
        uid: response.user.uid,
      });
      router.push('../(tabs)');
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        alert('Sign in failed: ' + error.message);
      }
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleBackToFirst = () => {
    router.back();
  };

  if (!showContent || isLoginLoading) {
    return (
      <View style={styles.loadingContainer}>
        <CustomLoadingIndicator
          imageSource={require('../assets/images/birdPlanet.png')}
          width={200}
          height={200}
          isLoading={!showContent ? isLoading : isLoginLoading}
          onExitComplete={handleLoadingComplete}
          direction="top-to-bottom"
          duration={1500}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-amber-50`}>
      <View style={tw`flex-1 bg-amber-50 justify-center items-center px-4`}>
        <Image
          source={require('../assets/images/lightTopLeft.png')}
          style={styles.topLeftImg}
        />
        <Image
          source={require('../assets/images/lightBottomLeft.png')}
          style={styles.bottomLeftImg}
        />
        <Image
          source={require('../assets/images/lightBottomRight.png')}
          style={styles.bottomRightImg}
        />
        <Image
          source={require('../assets/images/lightTopRight.png')}
          style={styles.topRightImg}
        />
        <TouchableOpacity 
          style={tw`absolute top-0 left-2`}
          onPress={handleBackToFirst}
        >
          <Text style={tw`text-4xl`}>&larr;</Text> 
        </TouchableOpacity>
        <Image
          source={require('../assets/images/birdPlanet.png')}
          style={styles.headerImg}
        />
        <Text style={[tw`text-5xl font-semibold text-emerald-600 mt-4`, { fontFamily: 'Nerko-One' }]}>Welcome Back!</Text>
        <Text style={[tw`text-3xl font-bold text-black`, { fontFamily: 'Nerko-One'}]}>Glad to See You Again</Text>
        <TextInput
          style={[styles.input, {fontFamily: 'Gilroy'}]}
          placeholder="Enter your email"
          placeholderTextColor="black"
          value={email}
          onChangeText={(text)=> setEmail(text)}
        />
        <TextInput
          style={[styles.input, {fontFamily: 'Gilroy'}]}
          placeholder="Enter your password"
          placeholderTextColor="black"
          secureTextEntry
          value={password}
          onChangeText = {(text)=>setPassword(text)}
        />
        <TouchableOpacity>
          <Text style={[tw`text-right w-full text-green-600`, {fontFamily: 'Gilroy'}]}>Forgot password?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={[tw`text-black text-center text-lg`, {fontFamily: 'Gilroy'}]}>Log In</Text>
        </TouchableOpacity>
        <Image
          source={require('../assets/images/loadH.png')}
          style={styles.footerImg}
        />
        <Text style={[tw`text-emerald-600 mt-4`, {fontFamily: 'Gilroy'}]}>Thank you for recycling responsibly!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImg: {
    width: 220,
    height: 220,
    alignSelf: 'center',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ADD8E6',
    padding: 10,
    borderRadius: 10,
    width: '95%',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#C2D5BA',
    padding: 15,
    borderRadius: 10,
    width: '50%',
    marginTop: 20,
  },
  footerImg: {
    width: 100,
    height: 75,
    alignSelf: 'auto',
    marginTop: 50,
  },
  topLeftImg: {
    position: 'absolute',
    top: -51,
    left: -49,
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#728A68',
  },
  topRightImg: {
    position: 'absolute',
    top: -28,
    right: -65,
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  bottomLeftImg: {
    position: 'absolute',
    bottom: -48,
    left: -67,
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  bottomRightImg: {
    position: 'absolute',
    bottom: -48,
    right: -33,
    width: 200,
    height: 200,
  },
});