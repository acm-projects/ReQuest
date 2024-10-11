import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import tw from 'twrnc'; 

const WelcomeScreen = () => {
  const router = useRouter(); // Use the router to handle navigation

  // Helper function to render arched "Welcome to" text
  const renderArchedText = () => {
    const welcomeText = "Welcome to";
    const arcRadius = 40; // Adjust the radius for the curvature
    const totalAngle = Math.PI; // 180 degrees for a half-circle
    const charAngleStep = totalAngle / (welcomeText.length - 1);

    return (
      <View style={styles.archContainer}>
        {welcomeText.split('').map((char, index) => {
          const angle = (index - (welcomeText.length - 1) / 2) * charAngleStep; // Calculate the angle for each character
          const rotateAngle = `${angle * (180/ Math.PI)}deg`; // Convert radians to degrees

          return (
            <Text
              key={index}
              style={[
                styles.archText,
                {
                  transform: [
                    { rotate: rotateAngle }, // Apply the rotation
                    { translateY: -arcRadius } // Adjust position along the y-axis
                  ],
                },
              ]}
            >
              {char}
            </Text>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      
      {/* Top Section with Header */}
      <View style={styles.topSection}>
        <Image
        source={require('../assets/images/topLeftWelcome.png')}
        style={styles.cornerImg}
      />
      <Image
        source={require('../assets/images/topRightWelcome.png')}
        style={styles.topRightImg}
      />
        
        {/* Arched "Welcome to" Text */}
        {renderArchedText()}

        {/* RecycleRoute Text */}
        <Text style={tw`text-5xl font-semibold text-[#6B8068] mt-60`}>RecycleRoute!</Text>

        {/* Reduce, Reuse, Recycle Text */}
        <Text style={tw`text-2xl font-bold text-black mb-1 mt-4`}>Reduce, Reuse, Recycle.</Text>
        <Text style={tw`text-2xl font-bold text-black mb-1`}>The Power is Yours!.</Text>
      </View>

      {/* Bottom Section with Earth Image and Buttons */}
      <View style={styles.bottomSection}>
        {/* Earth Image */}
        <Image
          source={require('../assets/images/recycleEarth.png')}  // globe image
          style={styles.earthImg}
        />
        <Image
        source={require('../assets/images/bottomLeftImg.png')}
        style={styles.bottomLeftImg}
      />
      <Image
        source={require('../assets/images/bottomRightImg.png')}
        style={styles.bottomRightImg}
      />

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
    flex: 0.4, // Reduce height of top section
    backgroundColor: '#C2D5BA', 
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  archContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -215, // Move the arched text up
  },
  archText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF', // White color for the text
  },
  earthImg: {
    width: 300,
    height: 300,
    marginBottom: 150,
  },
  bottomSection: {
    flex: 0.6, // Increase size of the bottom section
    backgroundColor: tw.color('amber-50'), // Light pink color for the bottom half
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 30,
    position: 'absolute',
    bottom: 90, // Position buttons at the bottom
  },
  button: {
    backgroundColor: '#C2D5BA',
    padding: 15,
    borderRadius: 10,
    width: '45%',
  },
  cornerImg: {
    position: 'absolute',
    top: -65,
    left: -45,
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  topRightImg: {
    position: 'absolute',
    top: -30,
    right: -70,
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  bottomLeftImg: {
    position: 'absolute',
    bottom: -39,
    left: -65,
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  bottomRightImg: {
    position: 'absolute',
    bottom: -49,
    right: -29,
    width: 200,
    height: 200,
  },
});

export default WelcomeScreen;
