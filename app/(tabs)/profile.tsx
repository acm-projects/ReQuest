import React from 'react';
import { Image, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';

export default function Profile() {
  return (
    <View style={tw`flex-1`}>
      {/* top section: profile icon and name */}
      <View style={styles.topSection}>
        <Image
          source={require('../../assets/images/img2.png')} // Adjusted path to images
          style={styles.topLeftImg}
        />
        <Image
          source={require('../../assets/images/rightCorner.png')}
          style={styles.topRightImg}
        />
        <Image
          source={require('../../assets/images/fireEarth.png')} // Adjust the path to your profile icon image
          style={styles.profileIcon}
        />
      </View>

      {/* bottom section */}
      <View style={styles.bottomSection}>
        <Image
          source={require('../../assets/images/profileComponents1.png')}
          style={styles.profileOne}
        />

        {/* TouchableOpacity Button */}
        <TouchableOpacity style={styles.button} onPress={() => console.log('Edit Profile Information')}>
          <Text style={styles.buttonText}>Edit Profile Information</Text>
        </TouchableOpacity>

        <Image
          source={require('../../assets/images/greenBottomLeft.png')}
          style={styles.bottomLeftImg}
        />
        <Image
          source={require('../../assets/images/greenBottomRight.png')}
          style={styles.bottomRightImg}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topSection: {
    backgroundColor: '#FFFBF1',
    flex: 3, // Occupies 30% of the screen
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative', // Add relative position to properly handle absolute child positions
    paddingBottom: 20,
  },
  bottomSection: {
    backgroundColor: '#C2D5BA',
    flex: 7, // Occupies 70% of the screen
    paddingTop: 30,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -25,
    alignItems: 'center', // Centers the button and other content horizontally
  },
  profileIcon: {
    width: 100, 
    height: 100,
    borderRadius: 50, 
    position: 'absolute',
    top: 75, 
    alignSelf: 'center',
  },
  topLeftImg: {
    position: 'absolute',
    top: -40,
    left: -30,
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
    bottom: -175,
    left: -90,
    width: 220,
    height: 222,
    resizeMode: 'contain',
  },
  bottomRightImg: {
    position: 'absolute',
    bottom: -166,
    right: -59,
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  profileOne: {
    position: 'absolute',
    top: -80,
    width: 400,
    height: 400,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    left: -50,
    borderRadius: 10,
    marginTop: 30, // Add some margin for spacing
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});
