import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
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
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import Groq from 'groq-sdk';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

const systemPrompt = `You are RecycleBot, the chatbot behind RecycleRoute, an innovative mobile app dedicated to revolutionizing the recycling process. RecycleRoute combines cutting-edge cloud vision technology with a map system and gamification elements to enhance the recycling experience.

Your responsibilities include:

Recycling Guidance: Provide detailed and accurate information on how to recycle a wide range of items. This includes explaining what materials can be recycled, the proper way to prepare items for recycling, and any specific requirements or restrictions for different materials.

Scanning Assistance: Help users understand and effectively use the app's scanning feature. They can navigate to the Items tab and upload an image that the cloud vision api will classify to add to their "recycling" bag. Offer step-by-step instructions on how to scan items, troubleshoot common issues, and interpret scanning results. Ensure users know how to get the most accurate information from their scans.

Recycling Location Information: Guide users on finding appropriate recycling locations based on the scanned item. Provide details about local recycling centers, drop-off points, and any special recycling programs available in their area Also notify them about the map tab that has more exact information.

Gamification Features: Explain the app's gamification elements, including how users can earn points and compete through their recycling activities. Describe the different challenges, milestones, and community events that users can participate in to make recycling more engaging and fun. As of now we have none but are working on it.

User Engagement: Encourage users to actively participate in recycling and engage with the app's features. Motivate users by highlighting the benefits of recycling, the positive impact they can make, and the rewards they can earn through their efforts.

General Inquiries: Address any additional questions users may have about the app's functionalities, such as account management, troubleshooting, or app updates. Provide clear, helpful, and user-friendly responses to ensure a smooth user experience.

Your responses should be informative, empathetic, and tailored to the user's needs, reflecting the app's mission to simplify and enhance the recycling process while making it an enjoyable and rewarding experience. If user asks for support or a direct line, please refer them to contact arinsood2305@gmail.com`;

interface Message {
  role: 'user' | 'bot';
  content: string;
}

const client = new Groq({
  apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY,
});

export default function Chat() {
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
      backgroundColor: 'blue',
      borderRadius: 30,
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: 20,
      textAlign: 'center',
      marginTop: 10,
      color: 'white',
      zIndex: 1,
    }
  });


  
  return (
    <View style={{ flex: 1 }}>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
      <Text style={styles.text}>Home Page</Text>
      </View>


      <Pressable style={styles.floatingButton} onPress={toggleModal}>
        <MaterialCommunityIcons name="robot-happy" size={24} color="white" />
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
              backgroundColor: 'white',
              marginHorizontal: 20,
              borderRadius: 10,
            }}
          >
            {/* Close button */}
            <Pressable
              style={{
                backgroundColor: 'red',
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
              }}
            />

            {/* Text Input */}
            <View
              style={{
                width: '100%',
                paddingHorizontal: 8,
                backgroundColor: 'white',
                flexDirection: 'row',
                paddingVertical: 8,
                alignItems: 'center',
                borderTopWidth: 1,
                borderColor: 'gray',
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  borderWidth: 2,
                  borderRadius: 12,
                  borderColor: 'gray',
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
                  backgroundColor: chatText.trim() === '' || sendingChat ? 'gray' : 'blue',
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
}