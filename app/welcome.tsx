import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import tw from 'twrnc'; 

const WelcomeScreen = () => {
  const router = useRouter(); // Use the router to handle navigation

  return (
    <View style={styles.container}>
      
      {/* Top Section with Header */}
      <View style={styles.topSection}>
       

        {/* Header */}
        <Text style={tw`text-4xl font-semibold text-[#6B8068] mt-2`}>Hello!</Text>
        <Text style={tw`text-2xl font-bold text-black mb-6`}>Register to Get Started</Text>

        {/* Earth Image */}
        <Image
          source={require('../assets/images/recycleEarth.png')}  // globe image
          style={styles.earthImg}
        />
      </View>

      {/* Squiggly Line */}
      <Image 
        source={require('../assets/images/squiggly-line.png')}  // Image of a squiggly line
        style={styles.squigglyLine} 
      />

      {/* Bottom Section with Buttons */}
      <View style={styles.bottomSection}>
        <View style={styles.buttonContainer}>
          {/* Sign Up Button */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => router.push('/signup')} // Navigate to signup.tsx
          >
            <Text style={tw`text-white text-center text-lg`}>Sign Up</Text>
          </TouchableOpacity>

          {/* Log In Button */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => router.push('/login')} // Navigate to login.tsx
          >
            <Text style={tw`text-white text-center text-lg`}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    flex: 1,
    backgroundColor: tw.color('bg-green-100'), // this is pastelgreen
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  earthImg: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  squigglyLine: {
    width: '100%',
    height: 0,
    zIndex: 1,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: tw.color('amber-50'), // Light pink color for the bottom half
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#C2D5BA',
    padding: 15,
    borderRadius: 10,
    width: '45%',
  },
});

export default WelcomeScreen;
