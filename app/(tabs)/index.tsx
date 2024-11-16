import React, { useEffect, useRef, useState, useCallback } from 'react';
import tw from 'twrnc';
//import { useRouter } from 'expo-router';
//import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import EStyleSheet from 'react-native-extended-stylesheet';
//import { CartesianChart, Bar, useChartPressState, StackedBar } from "victory-native";
//import { Circle, Points, useFont, vec } from "@shopify/react-native-skia";
//import { LinearGradient, Text as SKText } from "@shopify/react-native-skia";
//import { useDerivedValue } from "react-native-reanimated";
import * as Font from 'expo-font';
import TipsCarouselWithDots from '../tipcarouselwithdots';
import { NativeScrollEvent } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { usePoints, PointsProvider, useWeight, useImpact, useHistory, useChartHistory } from '../PointsContext';
import { db } from '../../FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../AuthContext';
import { PieChart } from 'react-native-chart-kit';
import { Asset } from 'expo-asset';
import {
  Pressable,
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
  Dimensions,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import Groq from 'groq-sdk';
import MapWidget from '../MapWidget'; // Adjust path based on where you created the file
import BarGraphComponent from '../BarChartComponent';


//import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


const systemPrompt = `You are RecycleBot, the chatbot behind ReQuest, an innovative mobile app dedicated to revolutionizing the recycling process. ReQuest combines cutting-edge cloud vision technology with a map system and gamification elements to enhance the recycling experience.

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

const Chat = () => {
  const [chatText, setChatText] = useState<string>('');
  const [textInputHeight, setTextInputHeight] = useState<number>(60);
  const [sendingChat, setSendingChat] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);

  const translateYRef = useRef<Animated.Value>(new Animated.Value(0)).current;
  const tabBarHeight = useBottomTabBarHeight();

  const toggleModal = () => {
  if (!isModalVisible) {
    setMessages([{ role: 'bot', content: 'Hello, welcome to ReQuest! My name is RecycleBot and I am here to help you with any recycle-related queries you may have. How can I help you today?' }]);
  }
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

    setMessages(prevMessages => [...prevMessages, { role: 'user', content: userMessage }]);

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
      bottom: 75,
      right: 20,
      borderRadius: 30,
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
      backgroundColor: '#007BFF',  // Example background color (blue)
      borderWidth: 2,              // Add a subtle border
      borderColor: '#0056b3',      // Darker blue for border to create depth
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
    <View style={{ flex: 1 }}>
     <Pressable style={styles.floatingButton} onPress={toggleModal}>
  <View style={{
    width: 60,  // Increased from 40
    height: 60, // Increased from 40
    overflow: 'hidden',
    borderRadius: 30,
  }}>
    <Image
      source={require('../../assets/images/recycleEarth.png')}
      style={{
        width: 90,  // Increased from 60
        height: 90, // Increased from 60
        transform: [
          { scale: 2.4 },
          { translateX: 2 }, // Adjusted from -10
          { translateY: 11 }, // Adjusted from -10 to move up
        ],
      }}
      resizeMode="cover"
    />
  </View>
</Pressable>

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
            <Pressable
              style={{
                backgroundColor: '#400908',
                padding: 12,
                borderRadius: 24,
                position: 'absolute',
                top: 10,
                left: 10,
                zIndex: 1,
              }}
              onPress={toggleModal}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>

            <View style={{ flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' }}>
          <FlatList
 data={messages}
 keyExtractor={(item, index) => index.toString()}
 renderItem={({ item }) => (
   <View
     style={{
       marginVertical: 7,
       alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
       maxWidth: item.role === 'user' ? '85%' : '90%',
       flexDirection: 'row',
       alignItems: 'flex-end',
       marginRight: item.role === 'user' ? 0 : undefined,
     }}
   >
     {item.role === 'bot' && (
       <View style={{
         width: 45,
         height: 45,
         marginRight: 5,
         borderRadius: 23,
         overflow: 'hidden',
         marginBottom: -20,
       }}>
         <Image
           source={require('../../assets/images/recycleEarth.png')}
           style={{
             width: 68,
             height: 68,
             transform: [
               { scale: 2.4 },
               { translateX: 1 },
               { translateY: 8 },
             ],
           }}
           resizeMode="cover"
         />
       </View>
     )}
     
     <View
       style={{
         backgroundColor: item.role === 'user' ? '#8AA984' : '#87BAC7',
         padding: 10,
         borderRadius: 15,
         borderBottomLeftRadius: item.role === 'user' ? 15 : 0,
         borderBottomRightRadius: item.role === 'user' ? 0 : 15,
         shadowColor: '#000',
         shadowOffset: { width: 0, height: 1 },
         shadowOpacity: 0.2,
         shadowRadius: 1,
         elevation: 1,
         flex: 1,
       }}
     >
       <Text style={{ 
         color: 'white',
         fontFamily: 'Gilroy',
         fontSize: 16,
       }}>
         {item.content}
       </Text>
     </View>
     
     {item.role === 'user' && <View style={{ width: 8 }} />}
   </View>
 )}
 contentContainerStyle={{
   paddingTop: 60,
   paddingLeft: 8,
   paddingRight: 0,
 }}
/>
            </View>

            <View
              style={{
                width: '100%',
                paddingHorizontal: 8,
                backgroundColor: '#728A68',
                flexDirection: 'row',
                paddingVertical: 8,
                alignItems: 'center',
                borderTopWidth: 1,
                borderColor: '#400908',
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  borderWidth: 2,
                  borderRadius: 12,
                  borderColor: '#400908',
                  marginRight: 16,
                  paddingHorizontal: 12,
                  maxHeight: 80,
                  height: textInputHeight,
                  paddingVertical: 10,
                  backgroundColor: '#728A68',
                  color: 'white',
                  fontFamily: 'Gilroy',
                  fontSize: 16,
                }}
                multiline
                value={chatText}
                onChangeText={(text) => setChatText(text)}
                placeholder="Ask a question here"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                onContentSizeChange={handleContentSizeChange}
              />
              <Pressable
                style={{
                  backgroundColor: chatText.trim() === '' || sendingChat ? 'gray' : '#592524',
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
                  <Feather name="send" size={20} color="white" />
                )}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

interface UserData {
  email: string;
  numRecycled: number;
  points: number;
}

interface ChartProps {
  data: Record<string, number>;
}


const FetchData = async() => {
  
}
         
const Dashboard = () => {
  const { user } = useAuth();
  console.log(user);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const { points, setPoints } = usePoints();
  const { weight, setWeight } = useWeight();
  const { impact, setImpact } = useImpact();
  const { history, setHistory } = useHistory();
  const [isInitialized, setIsInitialized] = useState(false);
  const { chartHistory } = useChartHistory();
  const [username, setUsername] = useState('');

  // Initial fetch of points from Firebase
  useEffect(() => {
    const fetchData = async () => {
      if (user && !isInitialized) {
        try {
          console.log("Pulling data")
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          const response = docSnap.data();
          
          if (response !== undefined) {
            if (response.points !== undefined) {
            setPoints(response.points);
            }
            if(response.weight !== undefined) {
            setWeight(response.weight);
            }
            if(response.impact !== undefined) {
            setImpact(response.impact);
            }
            if(response.username !== undefined) {
              setUsername(response.username);
            } else {
              setUsername('User');
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsInitialized(true);
        }
      }
    };

    fetchData();
  }, [user]);

  // Sync points to Firebase whenever they change
  useEffect(() => {
    const updatePoints = async () => {
      if (user && isInitialized) {
        try {
          console.log("Beginning updating")
          const docRef = doc(db, "users", user.uid);
          console.log("In the middle of updating")
          await updateDoc(docRef, {
            points: points,
            weight: weight,
            impact: impact,
          });
          console.log('Data updated successfully');
        } catch (error) {
          console.error("Error updating points:", error);
        }
      }
    };

    updatePoints();
  }, [points, user, isInitialized, weight, impact, username]);
  
  const [fontsLoaded] = useFonts({
    'Nerko-One': require('../../assets/fonts/NerkoOne-Regular.ttf'),
    'Gilroy': require('../../assets/fonts/Gilroy-Regular.otf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
      } catch (e) {
        console.warn(e);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const { width } = Dimensions.get('window');

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setActiveIndex(currentIndex);
  };

  if (!fontsLoaded) {
    return null;
  }

  const PointsDisplay = () => {
    return (
      <PointsProvider>
        { points }
      </PointsProvider>
    )
  }

  const WeightDisplay = () => {
    const formattedWeight = weight.toFixed(2);
    return (
      <PointsProvider>
        {formattedWeight} kg
      </PointsProvider>
    )
  }

  const ImpactDisplay = () => {
    const formattedImpact = Number(impact.toFixed(5));
    return (
      <PointsProvider>
        {formattedImpact} days
      </PointsProvider>
    )
  }

  const HistoryDisplay = () => {
    if (history.length === 0) {
      return (
        <PointsProvider>
          No history... yet!
        </PointsProvider>
      )
    }
    
    return (
      <PointsProvider>
        <Text>
        {history.map((item, index) => (
      <Text key={index}>{item}{'\n'}</Text>
      ))}
        </Text>
      </PointsProvider>
    )
  }

  const CountItems = () => {
      <PointsProvider>
        {history.length}
      </PointsProvider>
  }



  const chartData = {
    'Plastic': 45,
    'Paper': 30,
    'Glass': 25,
    'Metal': 15,
    'Other': 10,
  };
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
    <ScrollView 
      style={tw`flex-1`}
      contentContainerStyle={tw`pb-20`} // Add padding at bottom for content
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={tw`pt-7`}>
        <Text style={[tw`text-4xl font-bold text-center text-[#400908]`, { fontFamily: 'Nerko-One' }]}>
          Welcome Back, {username}!
        </Text>
      </View>
      
      <Text style={[tw`text-lg text-[#400908] mt-2 ml-3 pt-22 text-left`, { fontFamily: 'Gilroy' }]}>
        These are your current stats:
      </Text>

      {/* Floating Earth Image */}
     <Image
  source={require('../../assets/images/recycleEarth.png')}
  style={tw`
    absolute 
    right-[5%] 
    top-[8%] 
    h-30 
    w-30 
    z-10
  `}
  resizeMode="contain"
/>

      {/* Stats Section */}
      <View style={[tw`px-8 pt-5 mt-[50] mb-4`, { width: '90%', alignSelf: 'center' }]}>
        <View style={[tw`absolute inset--1 bg-[#C2D5BA]`, { borderRadius: 30 }]} />
        
        <View style={tw`flex-row justify-between mb-4`}>
          <View style={tw`flex-1 max-w-[75%]`}>
            <Text style={[tw`text-[#400908] text-base`, { fontFamily: 'Gilroy' }]}>
              Points: {  }
            </Text>
          </View>
          <View style={tw`flex-1 max-w-[30%]`}>
            <Text style={[tw`text-[#400908] text-base font-bold text-right`, { fontFamily: 'Gilroy' }]}>
              <PointsDisplay />
            </Text>
          </View>
        </View>

        <View style={tw`flex-row justify-between mb-4`}>
          <View style={tw`flex-1 max-w-[75%]`}>
            <Text style={[tw`text-[#400908] text-base`, { fontFamily: 'Gilroy' }]}>
              How long the world would last if everyone recycled like you:
            </Text>
          </View>
          <View style={tw`flex-1 max-w-[30%]`}>
            <Text style={[tw`text-[#400908] text-base font-bold text-right`, { fontFamily: 'Gilroy' }]}>
              <ImpactDisplay />
            </Text>
          </View>
        </View>

        <View style={tw`flex-row justify-between mb-0`}>
          <View style={tw`flex-1 max-w-[75%]`}>
            <Text style={[tw`text-[#400908] text-base`, { fontFamily: 'Gilroy' }]}>
              Reduced Carbon Footprint:
            </Text>
          </View>
          <View style={tw`flex-1 max-w-[30%]`}>
            <Text style={[tw`text-[#400908] text-base font-bold text-right`, { fontFamily: 'Gilroy' }]}>
              <WeightDisplay/>
            </Text>
          </View>
        </View>

        <View style={tw`flex-1 justify-center items-center mb-4`}>
          <Text style={[tw`text-[#400908] text-base`, { fontFamily: 'Gilroy' }]}>
            Session History:
          </Text>
          <ScrollView style={tw`max-h-[40%]`}>
            <Text style={[tw`text-[#400908] text-base font-bold`, { fontFamily: 'Gilroy', fontSize: 14 }]}>
              <HistoryDisplay />
            </Text>
          </ScrollView>
        </View>
      </View>

<View style={tw`h-4`} />

<View style={tw`mt-4 mb-4`}>
  <View style={tw`mt-4 mb-4`}>
  <BarGraphComponent data={chartData} />
</View>
</View>

<MapWidget />

{/* Dots and Tips Container */}
<View style={tw`relative`}>
  {/* Dots Indicator */}
 

  {/* Tips Carousel Section */}
 <View style={[tw`flex-1 mt-1`, { minHeight: 500 }]}>
  <TipsCarouselWithDots
    tipsAndGuides={tipsAndGuides}
    onIndexChange={setActiveIndex}
  />
</View>
 <View style={[tw`w-full items-center justify-center py-2`, { backgroundColor: 'transparent', position: 'relative', zIndex: 2 }]}>
    <View style={dotStyles.dotsContainer}>
      {tipsAndGuides.map((_, index) => (
        <Animated.View
          key={index}
          style={[
            dotStyles.dot,
            activeIndex === index ? dotStyles.activeDot : dotStyles.inactiveDot,
            tw`mx-1`
          ]}
        />
      ))}
    </View>
  </View>
</View>



    </ScrollView>

    {/* Fixed Chat Button */}
    <View style={[tw`absolute bottom-9 right-4`, { zIndex: 999 }]}>
      <Chat />
    </View>
  </SafeAreaView>
);
 };



const styles = StyleSheet.create({
  scrollView: {
    padding: 20,
    flexGrow: 1,
    marginTop: 50,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  
  textColor: {
    color: '#400908',
  },
  welcomeText: {
    fontFamily: 'NerkoOne',
    color: '#400908',
  },
  tipBackground: {
    backgroundColor: '#C2D5BA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: '60%',
    alignSelf: 'center',
  },
  video: {
    height: 100,
    marginVertical: 10,
    borderRadius: 6,
    width: '100%',
  },
  linkButton: {
    marginTop: 10,
  },
  statItem: {
    marginBottom: 20,
    paddingVertical: 10,
    zIndex: 2,
    alignItems: 'flex-start',
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#400908',
  },
  statNumber: {
    fontSize: 200,
    fontWeight: 'bold',
    color: 'green',
  },
});

const dotStyles = StyleSheet.create({
  dot: {
    width: 8, // Start smaller for inactive dots
    height: 8,
    borderRadius: 4,
    marginHorizontal: 6,
    backgroundColor: '#C0C0C0',
    transform: [{ scale: 1 }], // Default scale
  },
  activeDot: {
    backgroundColor: '#400908', // Your maroon color
    transform: [{ scale: 1.5 }], // Make active dot 50% larger
    width: 8,
    height: 8,
  },
  inactiveDot: {
    backgroundColor: '#C0C0C0',
    opacity: 0.5, // Make inactive dots slightly transparent
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    alignItems: 'center', // This helps with alignment when dots are different sizes
  },
});

export default Dashboard;

