import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { useAuth } from '../AuthContext';
import { FIREBASE_AUTH } from '../FirebaseConfig';
import { User } from 'firebase/auth';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() { // Renamed component to LoginScreen
  const {signedIn, setSignedIn} = useAuth();
  const router = useRouter();
  const auth = FIREBASE_AUTH;
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  /*useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log('user', user);
      setUser(user);
    });
    }, []);*/


  /*useEffect(() => {
    // Simulate a loading process, e.g., fetching data or loading assets
    const timer = setTimeout(() => {
      setIsLoading(false); // Loading done
    }, 2000); // Adjust the time to how long you need to load content

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ff00" />
        <Text>Loading...</Text>
      </View>
    );
  }*/

  const handleLogin = async (): Promise<void> => {
    setIsLoading(true); 
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
      setSignedIn(true);
      router.push('../(tabs)'); 
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error);
        alert('Sign in failed: ' + error.message);
      }
    } finally {
      setIsLoading(false); 
    }
  };


  const handleBackToFirst = () => {
    router.back();
  };

  return (
    <View style={tw`flex-1 bg-amber-50 justify-center items-center px-4`}>
      <Image
        source={require('../assets/images/img2.png')}
        style={styles.topLeftImg}
      />
      <Image
        source={require('../assets/images/bottomLeftImg.png')}
        style={styles.bottomLeftImg}
      />
      <Image
        source={require('../assets/images/bottomRightImg.png')}
        style={styles.bottomRightImg}
      />
      <Image
        source={require('../assets/images/rightCorner.png')}
        style={styles.topRightImg}
      />
      {/* Back Arrow */}
      <TouchableOpacity 
        style={tw`absolute top-10 left-4`}
        onPress={handleBackToFirst}
      >
        <Text style={tw`text-2xl`}>&larr;</Text> 
      </TouchableOpacity>
      {/* Earth Image */}
      <Image
        source={require('../assets/images/birdPlanet.png')}
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
        value={email}
        onChangeText={(text)=> setEmail(text)} //controlled input 
      />
      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        placeholderTextColor="#FFFFFF"
        secureTextEntry
        value={password}
        onChangeText = {(text)=>setPassword(text)} //controlled input
      />
      {/* Forgot Password */}
      <TouchableOpacity>
        <Text style={tw`text-right w-full text-green-600`}>Forgot password?</Text>
      </TouchableOpacity>
      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={tw`text-white text-center text-lg`}>Log In</Text>
      </TouchableOpacity>
      <Image
        source={require('../assets/images/loadingHeart.png')}
        style={styles.footerImg}
      />
      {/* Footer Text */}
      <Text style={tw`text-emerald-600 mt-6`}>Thank you for recycling responsibly!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    color: 'white',
  },
  paragraph: {
    fontSize: 16,
    color: 'white',
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
    height: 60,
    alignSelf: 'auto',
    marginTop: 22,
  },
  topLeftImg: {
    position: 'absolute',
    top: -30,
    left: -30,
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
