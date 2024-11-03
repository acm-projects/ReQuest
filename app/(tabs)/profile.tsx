import React from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import tw from 'twrnc';
import { useRouter } from 'expo-router';
import { useAuth } from '@/AuthContext';

export default function Profile() {
  const router = useRouter();
  const { setSignedIn } = useAuth();

  const handleLogout = () => {
    setSignedIn(false);
    router.push('/login');
  };

  return (
    <View style={tw`flex-1 bg-[#C2D5BA]`}>
      {/* Top Section: Profile Icon and Name */}
      <View style={tw`flex-3 bg-[#FFFBF1] items-center justify-center relative pb-3 w-full`}>
        <Image
          source={require('../../assets/images/img2.png')}
          style={tw`absolute top-[-30px] left-[-20px] w-[100px] h-[100px] sm:w-[180px] sm:h-[180px]`}
        />
        <Image
          source={require('../../assets/images/rightCorner.png')}
          style={tw`absolute top-[-15px] right-[-20px] w-[100px] h-[100px] sm:w-[180px] sm:h-[180px]`}
        />
        <Image
          source={require('../../assets/images/fireEarth.png')}
          style={tw`w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] rounded-full absolute top-[60px]`}
        />
      </View>

      {/* Bottom Section */}
      <View style={tw`flex-7 bg-[#C2D5BA] pt-6 px-4 rounded-t-[20px] items-center relative w-full`}>
        {/* Buttons Group 1 */}
        <View style={tw`w-full max-w-[320px] bg-[#C2D5BA] justify-center items-center mb-4 rounded-lg border-2 border-white p-2`}>
          {[
            { label: 'Edit Profile Information', icon: require('../../assets/images/profileIcon.png') },
            { label: 'Notification Settings', icon: require('../../assets/images/notification.png') },
            { label: 'Change Language', icon: require('../../assets/images/changeLanguage.png') },
          ].map((item, index) => (
            <TouchableOpacity key={index} style={tw`my-1 flex-row items-center justify-between w-full`} onPress={() => console.log(item.label)}>
              <View style={tw`flex-row items-center`}>
                <Image source={item.icon} style={tw`w-[25px] h-[25px] mr-3`} />
                <Text style={tw`text-white text-sm text-left`}>{item.label}</Text>
              </View>
              <Image source={require('../../assets/images/rightArrow.png')} style={tw`w-[25px] h-[25px]`} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Buttons Group 2 */}
        <View style={tw`w-full max-w-[320px] bg-[#C2D5BA] justify-center items-center mb-4 rounded-lg border-2 border-white p-2`}>
          {[
            { label: 'Help & Support', icon: require('../../assets/images/help&Support.png') },
            { label: 'Contact Us', icon: require('../../assets/images/contactUs.png') },
            { label: 'Privacy Policy', icon: require('../../assets/images/privacyPolicy.png') },
          ].map((item, index) => (
            <TouchableOpacity key={index} style={tw`my-1 flex-row items-center justify-between w-full`} onPress={() => console.log(item.label)}>
              <View style={tw`flex-row items-center`}>
                <Image source={item.icon} style={tw`w-[25px] h-[25px] mr-3`} />
                <Text style={tw`text-white text-sm text-left`}>{item.label}</Text>
              </View>
              <Image source={require('../../assets/images/rightArrow.png')} style={tw`w-[25px] h-[25px]`} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Buttons Group 3 */}
        <View style={tw`w-full max-w-[320px] bg-[#C2D5BA] justify-center items-center mb-4 rounded-lg border-2 border-white p-2`}>
          <TouchableOpacity style={tw`my-1 flex-row items-center justify-between w-full`} onPress={handleLogout}>
            <View style={tw`flex-row items-center`}>
              <Image source={require('../../assets/images/logOut.png')} style={tw`w-[25px] h-[25px] mr-3`} />
              <Text style={tw`text-white text-sm text-left`}>Log Out</Text>
            </View>
            <Image source={require('../../assets/images/rightArrow.png')} style={tw`w-[25px] h-[25px]`} />
          </TouchableOpacity>
        </View>

        {/* Bottom Images */}
        <Image
          source={require('../../assets/images/greenBottomLeft.png')}
          style={tw`absolute bottom-[-60px] left-[-30px] w-[100px] h-[100px] sm:w-[180px] sm:h-[180px]`}
        />
        <Image
          source={require('../../assets/images/greenBottomRight.png')}
          style={tw`absolute bottom-[-60px] right-[-30px] w-[100px] h-[100px] sm:w-[180px] sm:h-[180px]`}
        />
      </View>
    </View>
  );
}
