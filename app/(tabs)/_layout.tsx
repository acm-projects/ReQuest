import { Tabs } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import tw from 'twrnc';
import { useAuth } from '../../AuthContext';


export default function TabLayout() {
 const colorScheme = useColorScheme();
 const [signedIn, setSignedIn] = useState(false);
 const router = useRouter();


 // If user is not signed in, show the login/signup screen
 if (!signedIn) {
   return (
     <View style={styles.container}>
       {/* Top Section with Header */}
       <View style={styles.topSection}>
         <Text style={tw`text-4xl font-semibold text-[#6B8068] mt-2`}>Hello!</Text>
         <Text style={tw`text-3xl font-bold text-black mb-6`}>Register to Get Started</Text>


         {/* Earth Image */}
         <Image
           source={require('../../assets/images/recycleEarth.png')} // Globe image
           style={styles.earthImg}
         />
       </View>


       {/* Squiggly Line */}
       <Image
         source={require('../../assets/images/squiggly-line.png')} // Image of a squiggly line
         style={styles.squigglyLine}
       />


       {/* Bottom Section with Buttons */}
       <View style={styles.bottomSection}>
         <View style={styles.buttonContainer}>
           {/* Sign Up Button */}
           <TouchableOpacity
             style={styles.button}
             onPress={() => {
               router.push('../signup');
             }} // Navigate to signup.tsx
           >
             <Text style={tw`text-white text-center text-lg`}>Sign Up</Text>
           </TouchableOpacity>


           {/* Log In Button */}
           <TouchableOpacity
             style={styles.button}
             onPress={() => {
               router.push('../login');
             }} // Navigate to login.tsx
           >
             <Text style={tw`text-white text-center text-lg`}>Log In</Text>
           </TouchableOpacity>
         </View>
         {/*Lets you skip login for now*/}
         <TouchableOpacity
             style={styles.button}
             onPress={() => {
               setSignedIn(true);
             }}
           >
             <Text style={tw`text-white text-center text-lg`}>Skip Login</Text>
           </TouchableOpacity>
       </View>
     </View>
   );
 }


 // If user is signed in, show the Tabs layout
 return (
   <Tabs
     screenOptions={{
       tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
       headerShown: false,
     }}
   >
     <Tabs.Screen
       name="index"
       options={{
         title: 'Home',
         tabBarIcon: ({ color, focused }) => (
           <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
         ),
       }}
     />
     <Tabs.Screen
       name="explore"
       options={{
         title: 'Items',
         tabBarIcon: ({ color, focused }) => (
           <TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
         ),
       }}
     />
     <Tabs.Screen
       name="map"
       options={{
         title: 'Map',
         tabBarIcon: ({ color, focused }) => (
           <Ionicons name={focused ? 'map' : 'map-outline'} color={color} />
         ),
       }}
     />
     <Tabs.Screen
       name="profile"
       options={{
         title: 'Profile',
         tabBarIcon: ({ color, focused }) => (
           <Ionicons name={focused ? 'map' : 'map-outline'} color={color} />
         ),
       }}
     />
   </Tabs>
 );
}


const styles = StyleSheet.create({
 container: {
   flex: 1,
 },
 topSection: {
   flex: 1,
   backgroundColor: tw.color('bg-green-100'), // Pastel green background
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
   backgroundColor: tw.color('amber-50'), // Light amber background
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
 sbutton: {
     backgroundColor: '#C2D5BA',
     padding: 15,
     borderRadius: 5,
     width: '20%',
 },
});
