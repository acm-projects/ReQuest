import React, { useEffect, useRef, useState, } from 'react';
import tw from 'twrnc';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview'; // Ensure you have the react-native-webview package installed
import { Ionicons } from '@expo/vector-icons'; 
import { useFonts } from 'expo-font';
import EStyleSheet from 'react-native-extended-stylesheet';
import { CartesianChart, Bar, useChartPressState, StackedBar} from "victory-native";
import { Circle, useFont, vec } from "@shopify/react-native-skia";
import { LinearGradient, Text as SKText } from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import * as Font from 'expo-font';







import {
  Pressable,
  Linking,
  ScrollView,
  TextInput,
  View,
  Animated,
  Keyboard,
  Easing,
  Platform,
  Text,
  ActivityIndicator,
  FlatList,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
  KeyboardEvent,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  SafeAreaView,
  Image, 
  TouchableOpacity,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import Groq from 'groq-sdk';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const systemPrompt = `You are RecycleBot, the chatbot behind RecycleRoute, an innovative mobile app dedicated to revolutionizing the recycling process. RecycleRoute combines cutting-edge cloud vision technology with a map system and gamification elements to enhance the recycling experience.

Your responsibilities include:

Recycling Guidance: Provide detailed and accurate information on how to recycle a wide range of items. This includes explaining what materials can be recycled, the proper way to prepare items for recycling, and any specific requirements or restrictions for different materials.

Scanning Assistance: Help users understand and effectively use the app's scanning feature. They can navigate to the Items tab and upload an image that the cloud vision api will classify to add to their "recycling" bag. Offer step-by-step instructions on how to scan items, troubleshoot common issues, and interpret scanning results. Ensure users know how to get the most accurate information from their scans.

Recycling Location Information: Guide users on finding appropriate recycling locations based on the scanned item. Provide details about local recycling centers, drop-off points, and any special recycling programs available in their area Also notify them about the map tab that has more exact information.

Gamification Features: Explain the app's gamification elements, including how users can earn points and compete through their recycling activities. Describe the different challenges, milestones, and community events that users can participate in to make recycling more engaging and fun. As of now we have none but are working on it.

User Engagement: Encourage users to actively participate in recycling and engage with the app's features. Motivate users by highlighting the benefits of recycling, the positive impact they can make, and the rewards they can earn through their efforts.

General Inquiries: Address any additional questions users may have about the app's functionalities, such as account management, troubleshooting, or app updates. Provide clear, helpful, and user-friendly responses to ensure a smooth user experience.

Your responses should be informative, empathetic, and tailored to the user's needs, reflecting the app's mission to simplify and enhance the recycling process while making it an enjoyable and rewarding experience. If user asks for support or a direct line, please refer them to contact arinsood2305@gmail.com

As well as in your responses please try to keep them short your responses should never exceed over 50 words and you want to make sure to say the most important things in the most simple way so the user can see it and easily read it`;



interface Message {
  role: 'user' | 'bot';
  content: string;
}

const client = new Groq({
  apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY,
});

export function Chat() {
  const [chatText, setChatText] = useState<string>('');
  const [textInputHeight, setTextInputHeight] = useState<number>(60);
  const [sendingChat, setSendingChat] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isModalVisible, setModalVisible] = useState(false); // Add modal state

  const translateYRef = useRef<Animated.Value>(new Animated.Value(0)).current;
  const tabBarHeight = useBottomTabBarHeight();

  
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      (event: KeyboardEvent) => {
        const { height: newKeyboardHeight } = event.endCoordinates;
        Animated.timing(translateYRef, {
          toValue: tabBarHeight - newKeyboardHeight,
          duration: event.duration,
          easing: Easing.bezier(0.33, 0.66, 0.66, 1),
          useNativeDriver: false,
        }).start();
      }
    );

   

    const keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      (event: KeyboardEvent) => {
        Animated.timing(translateYRef, {
          toValue: 0,
          duration: event.duration,
          easing: Easing.bezier(0.33, 0.66, 0.66, 1),
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [tabBarHeight, translateYRef]);

  const handleContentSizeChange = (event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
    setTextInputHeight(Math.max(event.nativeEvent.contentSize.height, 40));
  };

  const handleSubmit = async () => {
    if (chatText.trim() === '') return;
  
    setSendingChat(true);
    Keyboard.dismiss();
    const userMessage = chatText;
    setChatText('');
  
    setMessages([...messages, { role: 'user', content: userMessage }]);
  
    try {
      const chatCompletion = await client.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        model: 'llama3-8b-8192',
      });
  
      const botResponse = chatCompletion.choices[0].message.content ?? '';
  
      setMessages([...messages, { role: 'user', content: userMessage }, { role: 'bot', content: botResponse }]);
    } catch (error) {
      console.error('Error sending message:', error);
      return alert('Error communicating with chatbot, check your internet or reach out to support');
    }
  
    setSendingChat(false);
  };

  const styles = StyleSheet.create({
    floatingButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: '#0a7ea4',
      borderRadius: 30,
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex : 1,
    },
    
     scrollView: {
    padding: 16,
    flexGrow: 1,
  },
  tipContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
  },
  video: {
    height: 200, // Set a height for the video
    marginVertical: 10,
    borderRadius: 8,
  },
  linkButton: {
    marginTop: 10,
  },
    text: {
      fontSize: 20,
      textAlign: 'center',
      marginTop: 10,
      color: 'white',
      zIndex: 1,
    },
     boldDivider: {
    borderBottomWidth: 5,
    borderBottomColor: 'black',
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Align items
    alignItems: 'center', // Center vertically
    borderBottomWidth: 2,
    borderBottomColor: 'gray',
    paddingVertical: 35, // Original padding
    marginBottom: 10,
  },
  statText: {
    flex: 1, // Allow the text to grow and take up available space
    textAlign: 'left', // Left-align the text
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'green',
  },
  guideButton: {
    backgroundColor: '#C2D5BA',
    padding: 15,
    borderRadius: 10,
    width: '80%', // Adjusted width for the button
    alignSelf: 'center', // Center the button horizontally
    position: 'absolute', // Position the button absolutely
    bottom: 40, // Move the button up closer to the last stat item
  },
  });


  



   return (
    <View style={{flex: 1} }>


      <Pressable style={styles.floatingButton} onPress={toggleModal}>
  <Image 
    source={require('../../assets/images/recycleEarth.png')} // Update with your image path
    style={{ width: 40, height: 40 }} // Adjust size as needed
    resizeMode="contain" // This will keep the aspect ratio of the image
  />
</Pressable>

      {/* Chatbot Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleModal}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{
              flex: 1,
              backgroundColor: 'beige',
              marginHorizontal: 20,
              borderRadius: 20,
            }}
          >
            {/* Close button */}
            <Pressable
              style={{
                backgroundColor: '#400908',
                padding: 12,
                borderRadius: 24,
                position: 'absolute',
                top: 10,
                left: 10,
                zIndex: 1, // Ensure it is above other elements
              }}
              onPress={toggleModal}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>

            <FlatList
              data={messages}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View
                  style={{
                    marginVertical: 5,
                    alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                  }}
                >
                  <View
                    style={{
                      backgroundColor: item.role === 'user' ? '#DCF8C6' : '#ECECEC',
                      padding: 10,
                      borderRadius: 15,
                      borderBottomLeftRadius: item.role === 'user' ? 15 : 0,
                      borderBottomRightRadius: item.role === 'user' ? 0 : 15,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 1,
                      elevation: 1,
                    }}
                  >
                    <Text>{item.content}</Text>
                  </View>
                </View>
              )}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'flex-end',
                paddingBottom: 100, // Adjust this padding for TextInput space
                backgroundColor: 'beige',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                

              }}
            />

            {/* Text Input */}
            <View
              style={{
                width: '100%',
                paddingHorizontal: 8,
                backgroundColor: 'green',
                flexDirection: 'row',
                paddingVertical: 8,
                alignItems: 'center',
                borderTopWidth: 1,
                borderColor: 'gray',
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,

              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  borderWidth: 2,
                  borderRadius: 12,
                  borderColor: 'beige',
                  marginRight: 16,
                  paddingHorizontal: 12,
                  maxHeight: 80,
                  height: textInputHeight,
                }}
                multiline
                value={chatText}
                onChangeText={(text) => setChatText(text)}
                placeholder="Ask a question here"
                onContentSizeChange={handleContentSizeChange}
              />
              <Pressable
                style={{
                  backgroundColor: chatText.trim() === '' || sendingChat ? 'gray' : 'beige',
                  width: 48,
                  borderRadius: 24,
                  padding: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={handleSubmit}
                disabled={chatText.trim() === '' || sendingChat}
              >
                {sendingChat ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Feather name="send" size={20} color="black" />
                )}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>

  );
}


          





export default function Dashboard() {
  const tipsAndGuides = [
    {
      title: "Tip 1: Reduce Plastic Use",
      description: "Try to use reusable bags and bottles to minimize plastic waste.",
      link: "https://www.youtube.com/embed/CSaUzORm8s8",
    },
    {
      title: "Tip 2: Recycle Properly",
      description: "Make sure to clean and sort your recyclables correctly.",
      link: "https://www.youtube.com/embed/jsp7mgYv3aI",
    },
    {
      title: "Tip 3: Compost Organic Waste",
      description: "Consider composting food scraps and yard waste to reduce landfill waste.",
      link: "https://www.youtube.com/embed/zy70DAaeFBI",
    },
    {
      title: "Tip 4: Saving Water Use",
      description: "Fix leaks and use water-efficient fixtures to conserve water.",
      link: "https://www.youtube.com/embed/5J3cw4biWWo",
    },
    {
      title: "Tip 5: Reduce Food Waste",
      description: "Plan meals and use leftovers to minimize food waste.",
      link: "https://www.youtube.com/embed/ishA6kry8nc",
    },
  ];

  


 

  return (
    <SafeAreaView style={tw`flex-1 bg-amber-50`}>
<View style={tw`flex-1`}>
  <View style={tw`pt-7`}> 
    <Text style={[tw`text-3xl font-bold text-black text-center`, { color: '#400908' }]}>
      Welcome Back, Name!
    </Text>
  </View>
  <Text style={tw`text-lg text-[#400908] mt-2 ml-3 pt-22 text-left`}>These are your current stats:</Text>
</View>


         <Image
  source={require('../../assets/images/recycleEarth.png')}
  style={tw`absolute right-3 top-32 w-30 h-30 z-11`} 
/>


      {/* Stats Sections */}
<View style={[{ zIndex: 8 }]}>
  <View style={[tw`absolute px-8 pt-5 top-[-40]`, { zIndex: 2, width: '90%', alignSelf: 'center' }]}> 
    <View style={[tw`absolute inset--1 bg-[#DCF8C6]`, { borderRadius: 30, zIndex: -1 }]} />
    
    {/* <View style={tw`flex-row justify-between mb-4 max-w-[60%]`}>
      <Text style={tw`text-[#400908] text-base`}>Number of items recycled:</Text>
      <Text style={tw`text-green-500 text-lg font-bold text-right`}>123 items</Text>
    </View> */}

    <View style={tw`flex-row justify-between mb-4`}>
     
        <View style={tw`flex-1 max-w-[60%]`}> 
          <Text style={tw`text-[#400908] text-base`}>Number of items recycled:</Text>
        </View >
      
        <View style={tw`flex-1 max-w-[40%]`} >
        <Text style={tw`text-[#400908] text-3xl font-bold text-right`}>220 items</Text>
        </View>
    </View>
    
     <View style={tw`flex-row justify-between mb-4`}>
     
        <View style={tw`flex-1 max-w-[60%]`}> 
          <Text style={tw`text-[#400908] text-base`}>How long the world would last if everyone recycled like you:</Text>
        </View >
      
        <View style={tw`flex-1 max-w-[40%]`} >
        <Text style={tw`text-[#400908] text-3xl font-bold text-right`}>800 years</Text>
        </View>
    </View>

     <View style={tw`flex-row justify-between mb-4`}>
     
        <View style={tw`flex-1 max-w-[60%]`}> 
          <Text style={tw`text-[#400908] text-base`}>Reduced Carbon Footprint:</Text>
        </View >
      
        <View style={tw`flex-1 max-w-[40%]`} >
        <Text style={tw`text-[#400908] text-3xl font-bold text-right`}>789 kg</Text>
        </View>
    </View>
    
    {/* <View style={tw`flex-row justify-between mb-4 max-w-[60%]`}>
      <Text style={tw`text-[#400908] text-base`}>Reduced Carbon Footprint:</Text>
      <Text style={tw`text-green-500 text-lg font-bold text-right`}>789 kg</Text>
    </View> */}
  </View>
</View>









 <View style={tw`flex-1 bg-amber-50`}>
  <ScrollView
    contentContainerStyle={[
      styles.scrollView, 
      tw`p-15 mt-15`, // Add padding instead of justify-end for spacing
      { alignItems: 'center', paddingBottom: 0 } // Ensure there's enough space at the bottom
    ]}
    horizontal={true}
    showsHorizontalScrollIndicator={false}
  >
    {tipsAndGuides.map((tip, index) => (
<View key={index} style={[tw`w-60 m-2 p-4 rounded-3xl`, { backgroundColor: '#DCF8C6' }]}>
  <Text style={[tw`text-xl font-bold mt-1`, { color: '#400908' }]}>{tip.title}</Text> 
  <WebView
    source={{ uri: tip.link }}
    style={tw`w-55 h-60`} 
    javaScriptEnabled={true}
    domStorageEnabled={true}
    startInLoadingState={true}
    scalesPageToFit={true}
  />
</View>
    ))}
  </ScrollView>
</View>


     
    <View style={{ zIndex: 10 }}>
    <Chat />
  </View>
    </SafeAreaView>
  );
}

const styles = EStyleSheet.create({
  scrollView: {
    padding: 20,
    flexGrow: 1,
    marginTop: 50, // Keeps the ScrollView down
  },
  textColor: {
    color: '#400908',
    
  },
  tipBackground: {
    backgroundColor: '#DCF8C6',  // Green background
    borderRadius: 12,  // Rounded corners for the background
    padding: 16,  // Padding for content inside each tip
    marginBottom: 20,  // Space between tips
    width: '60%', // Keep tips at 60% width
    alignSelf: 'center', // Center the tips
  },
  video: {
    height: 100, // Set a height for the video
    marginVertical: 10,
    borderRadius: 6,
    width: '100%', // Full width for responsiveness
  },
  linkButton: {
    marginTop: 10,
  },
 statItem: {
    marginBottom: 20, // Space between items
    paddingVertical: 10, // Add padding to each stat item
    zIndex: 2,
    alignItems: 'flex-start', // Align items to the start
  },
  statText: {
    fontSize: 16, // Adjusted size for better readability
    fontWeight: '600',
    color: '#400908',
  },
  statNumber: {
    fontSize: 200, // Adjust size for numbers
    fontWeight: 'bold',
    color: 'green',
  },
});



