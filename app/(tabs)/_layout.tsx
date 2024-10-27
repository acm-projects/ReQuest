import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useContext } from 'react';
import tw from 'twrnc';
import TabBar from "../../components/TabBar";
import { useAuth } from '@/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  // const [signedIn, setSignedIn] = useState(false);
  const { signedIn, setSignedIn } = useAuth();
  const router = useRouter();

  const renderArchedText = () => {
    const welcomeText = "Welcome to";
    const arcRadius = 45; // Adjust the radius for the curvature
    const totalAngle = Math.PI; // 180 degrees for a half-circle
    const charAngleStep = totalAngle / (welcomeText.length - 1);

    return (
      <View style={styles.archContainer}>
        {welcomeText.split('').map((char, index) => {
          const angle = (index - (welcomeText.length - 1) / 2) * charAngleStep; // Calculate the angle for each character
          const rotateAngle = `${angle * (145 / Math.PI)}deg`; // Convert radians to degrees

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

  // If user is signed in, show the Tabs layout
  if (signedIn) {
    return (
      <Tabs tabBar={props => <TabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
   
      <Tabs.Screen
        name="items"
        options={{
          title: "Items",
          headerShown: false,
        }}
      />
   
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          headerShown: false,
        }}
      />
   
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
        }}
      />
    </Tabs>

    );
  }

  // If user is not signed in, show the login/sign up screen
  return (
    <View style={styles.container}>
      {/* Top Section with Header */}
      <View style={styles.topSection}>
        <Image
          source={require('../../assets/images/greenTopLeft.png')}
          style={styles.topLeftImg}
        />
        <Image
          source={require('../../assets/images/greenTopRight.png')}
          style={styles.topRightImg}
        />
        {/* Arched "Welcome to" Text */}
        {renderArchedText()}

        {/* RecycleRoute Text */}
        <Text style={tw`text-5xl font-bold uppercase text-[#6B8068] tracking-wide mt-60`}>RECYCLE ROUTE!</Text>

        {/* Reduce, Reuse, Recycle Text */}
        <Text style={tw`text-2xl font-bold text-black mb-1 mt-4`}>Reduce, Reuse, Recycle.</Text>
        <Text style={tw`text-2xl font-bold text-black mb-1`}>The Power is Yours!</Text>
      </View>

      {/* Bottom Section with Earth Image and Buttons */}
      <View style={styles.bottomSection}>
        {/* Earth Image */}
        <Image
          source={require('../../assets/images/recycleEarth.png')}
          style={styles.earthImg}
        />
        <Image
          source={require('../../assets/images/bottomLeftImg.png')}
          style={styles.bottomLeftImg}
        />
        <Image
          source={require('../../assets/images/bottomRightImg.png')}
          style={styles.bottomRightImg}
        />

        {/* Bottom Section with Buttons */}
        <View style={styles.buttonContainer}>
          {/* Sign Up Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('../signup')}
          >
            <Text style={tw`text-white text-center text-lg`}>Sign Up</Text>
          </TouchableOpacity>

          {/* Log In Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('../login')}
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
    flex: 0.4,
    backgroundColor: '#C2D5BA',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  archContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -215,
  },
  archText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  earthImg: {
    width: 300,
    height: 300,
    marginBottom: 150,
  },
  bottomSection: {
    flex: 0.6,
    backgroundColor: tw.color('amber-50'),
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
    bottom: 90,
  },
  button: {
    backgroundColor: '#C2D5BA',
    padding: 15,
    borderRadius: 10,
    width: '30%', // Adjust width to fit three buttons
  },
    topLeftImg: {
    position: 'absolute',
    top: -40,
    left: -25,
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
    bottom: -39,
    left: -65,
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  bottomRightImg: {
    position: 'absolute',
    bottom: -49,
    right: -39,
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});
