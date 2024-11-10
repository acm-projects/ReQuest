import React from 'react';
import { Image, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import tw from 'twrnc';
import { useRouter } from 'expo-router';
import { useAuth } from '@/AuthContext';
import { usePoints, useUsername } from '../PointsContext';
import { useEffect } from 'react';
import { db } from '../../FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function Profile() {
  const {user} = useAuth();
  const router = useRouter();
  const { setSignedIn } = useAuth();
  const profileName = "ReQuest User!!!!!"; // Replace this with the actual profile name
  const {points, setPoints} = usePoints();
  const {username, setUsername} = useUsername();


  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          console.log("Pulling data for profile")
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          const response = docSnap.data();
          if (response !== undefined) {
            if(response.username !== undefined) {
              setUsername(response.username);
            } else {
              setUsername('User');
            }
          }
        } catch (error) {
          console.error("Error fetching data for profile:", error);
        }
      }
    };

    fetchData();
  }, [user]);


  const level = points < 100 ? 1 : points < 200 ? 2 : 3;
  const quote = " 'Believe you can, and you're halfway there' - Theodore Roosevelt ";
  const getThemeForLevel = (level: number) => {
    switch (level) {
      case 1:
        return { icon: require('../../assets/images/leaf.png'), description: 'Beginner Recycler' };
      case 2:
        return { icon: require('../../assets/images/trees.png'), description: 'Intermediate Recycler' };
      case 3:
        return { icon: require('../../assets/images/recycle.png'), description: 'Advanced Recycler' };
      default:
        return { icon: require('../../assets/images/leaf.png'), description: 'Beginner Recycler' };
    }
  };

  const theme = getThemeForLevel(level);

  const handleLogout = () => {
    setSignedIn(false);
    router.push('/login');
  };

  // Calculate the progress based on the user's level
  const levelProgress = (level / 3) * 100; // Convert level to a percentage (e.g., level 2 -> 66%)

  return (
    <SafeAreaView style={tw`flex-1 bg-amber-50`}>
      {/* Decorative Corner Images */}
      <Image
          source={require('../../assets/images/lightTopLeft.png')}
          style={tw`absolute top-[-30px] left-[-20px] w-[100px] h-[100px] sm:w-[180px] sm:h-[180px]`}
        />
        <Image
          source={require('../../assets/images/lightTopRight.png')}
          style={tw`absolute top-[-15px] right-[-20px] w-[100px] h-[100px] sm:w-[180px] sm:h-[180px]`}
        />
      
      <ScrollView style={tw`flex-1 bg-[#C2D5BA] pb-40 pt-0`}>
        {/* Circular Profile Picture */}
        <View style={tw`items-center mt-10`}>
          <Image
            source={require('../../assets/images/animatedCharacter.png')} // Replace with actual profile picture
            style={tw`w-[70px] h-[70px] sm:w-[120px] sm:h-[120px] rounded-full border-2 border-gray-300 mb-4`}
          />
          <Text style={tw`text-xl font-bold text-[#444] mt-2`}>{`Hi, ${username}`}</Text>
        </View>

        

        {/* Top Section: Profile Picture, Name, and Level Feature */}
        <View style={tw`flex-3 bg-[#FFFBF1] items-center justify-center relative pb-15 w-full`}>
          {/* Display User Level and Recycle Theme */}
          <View style={tw`items-center mt-6`}>
            <Text style={tw`text-xl font-bold text-[#444] mb-2`}>{`Level ${level}`}</Text>
            <Image source={theme.icon} style={tw`w-[40px] h-[40px] mb-2`} />
            <Text style={tw`text-sm font-bold text-gray-600`}>{theme.description}</Text>
          </View>
        </View>

        {/* Level Progress Bar */}
        <View style={tw`px-6 w-full mt-6`}>
          <Text style={tw`text-center text-lg font-semibold mt--20`}>Level Progress</Text>
          <View style={tw`w-full h-6 bg-gray-200 rounded-full overflow-hidden`}>
            <View style={[tw`h-full rounded-full`, { width: `${levelProgress}%`, backgroundColor: '#4CAF50' }]} />
          </View>
          <View style={tw`flex-row justify-between mt-3`}>
            <Text style={tw`font-bold text-sm text-[#444]`}>Beginner</Text>
            <Text style={tw`font-bold text-sm text-[#444]`}>Intermediate</Text>
            <Text style={tw`font-bold text-sm text-[#444]`}>Advanced</Text>
          </View>
          <Text style={tw`font-bold text-center italic text-[#444] text-base mt-4`}>{quote}</Text>
        </View>

        {/* Bottom Section with Buttons */}
        <View style={tw`bg-[#C2D5BA] pt-5 px-4 rounded-t-[20px] items-center w-full`}>
          {/* Buttons Group 1 */}
          <View style={tw`w-full max-w-[320px] bg-[#C2D5BA] justify-center items-center mb-2 rounded-lg border-2 border-white p-4`}>
            {[
              { label: 'Edit Profile Information', icon: require('../../assets/images/profileIcon.png') },
              { label: 'Notification Settings', icon: require('../../assets/images/notification.png') },
              { label: 'Change Language', icon: require('../../assets/images/changeLanguage.png') },
            ].map((item, index) => (
              <TouchableOpacity key={index} style={tw`my-2 flex-row items-center justify-between w-full`} onPress={() => console.log(item.label)}>
                <View style={tw`flex-row items-center`}>
                  <Image source={item.icon} style={tw`w-[25px] h-[25px] mr-3`} />
                  <Text style={tw`text-white text-sm text-left`}>{item.label}</Text>
                </View>
                <Image source={require('../../assets/images/rightArrow.png')} style={tw`w-[25px] h-[25px]`} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Buttons Group 2 */}
          <View style={tw`w-full max-w-[320px] bg-[#C2D5BA] justify-center items-center mb-2 rounded-lg border-2 border-white p-0`}>
            {[
              { label: 'Help & Support', icon: require('../../assets/images/help&Support.png') },
              { label: 'Contact Us', icon: require('../../assets/images/contactUs.png') },
              { label: 'Privacy Policy', icon: require('../../assets/images/privacyPolicy.png') },
            ].map((item, index) => (
              <TouchableOpacity key={index} style={tw`my-2 flex-row items-center justify-between w-full`} onPress={() => console.log(item.label)}>
                <View style={tw`flex-row items-center`}>
                  <Image source={item.icon} style={tw`w-[25px] h-[25px] mr-3`} />
                  <Text style={tw`text-white text-sm text-left`}>{item.label}</Text>
                </View>
                <Image source={require('../../assets/images/rightArrow.png')} style={tw`w-[25px] h-[25px]`} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Log Out Button */}
          <View style={tw`w-full max-w-[320px] justify-center items-center mb-40 rounded-lg border-2 border-white p-0`}>
            <TouchableOpacity style={tw`my-2 flex-row items-center justify-between w-full`} onPress={handleLogout}>
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
            style={tw`absolute bottom-[-30px] left-[-30px] w-[50px] h-[50px] sm:w-[180px] sm:h-[120px]`}
          />
          <Image
            source={require('../../assets/images/greenBottomRight.png')}
            style={tw`absolute bottom-[-30px] right-[-30px] w-[50px] h-[100px] sm:w-[180px] sm:h-[120px]`}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
