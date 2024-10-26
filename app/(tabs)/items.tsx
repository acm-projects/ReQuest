import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, FlatList, SafeAreaView, ScrollView, Linking, Alert } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { StackNavigationProp } from '@react-navigation/stack';
import { Platform } from 'react-native';
import Groq from 'groq-sdk';

const client = new Groq({
  apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY,
});

const systemPrompt = 
`You are RecycleBot, an AI assistant for RecycleRoute, a mobile app that gamifies recycling. When provided an item name, you must respond *only* with a JSON object in the format below—nothing else. Do not include any prefacing text or extra information. If you detect an error, still return a JSON object in this exact format.

For recyclable items, return:

{
  "recyclable": true,
  "points": <integer from 0 to 5>
}

For non-recyclable items, return:

{
  "recyclable": false,
  "points": 0
}

Be fair but somewhat strict in awarding points (0-5) based on the difficulty or ease of recycling the item.`


type RootStackParamList = {
  map: { itemName: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'map'>;

const DetectObject = () => {
  const navigation = useNavigation<NavigationProp>(); // Initialize useNavigation with correct type
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [labels, setLabels] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<any>(null);


  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error with image: ", error);
      setError("Error picking image");
    }
  };

  const useCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    setCameraPermission(permissionResult.granted);

    if (permissionResult.granted === false) {
      Alert.alert(
        "Camera access is required to take pictures!",
        "Please enable it in settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: openSettings },
        ]
      );
      return;
    }

    const cameraResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!cameraResult.canceled && cameraResult.assets && cameraResult.assets[0].uri) {
      setImageUri(cameraResult.assets[0].uri);
    }
  };

const analyzeImage = async () => {
  try {
    if (!imageUri) {
      alert("Please select an image first");
      return;
    }

    const apiKey = process.env.EXPO_PUBLIC_CLOUD_VISION_API_KEY;
    const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    // Platform-specific URI handling
    let base64ImageData;
    if (Platform.OS === 'android') {
      // For Android, we need to handle the content:// or file:// URI differently
      const fileUri = imageUri.startsWith('file://') ? 
        imageUri.replace('file://', '') : 
        imageUri;
        
      try {
        base64ImageData = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (readError) {
        // If direct read fails, try reading the cached image
        const cacheUri = `${FileSystem.cacheDirectory}temp_image.jpg`;
        await FileSystem.copyAsync({
          from: imageUri,
          to: cacheUri
        });
        base64ImageData = await FileSystem.readAsStringAsync(cacheUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }
    } else {
      // For iOS, the original code works fine
      const fileUri = imageUri.replace("file://", "");
      base64ImageData = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    const requestData = {
      requests: [
        {
          image: {
            content: base64ImageData,
          },
          features: [
            {
              type: "LABEL_DETECTION",
              maxResults: 5,
            },
          ],
        },
      ],
    };

      const response = await axios.post(apiURL, requestData);
      console.log("Response Data: ", response.data);
      const detectedLabels = response.data.responses[0].labelAnnotations || [];
      setLabels(detectedLabels);

      const detectedBottle = detectedLabels.some((label: any) => label.description === "Bottle" || label.description === "Drinking water");
      const detectedPaper = detectedLabels.some((label: any) => label.description === "Paper");

      if (detectedBottle) {
        setModalMessage("Detected: Plastic Container\nYou CAN recycle this!");
        setModalImage(require('../../assets/images/waterBottle.png'));
        setModalVisible(true);
      } else if (detectedPaper) {
        setModalMessage("Detected: Paper\nYou CAN recycle this!");
        setModalImage(require('../../assets/images/paperIcon.png')); 
        setModalVisible(true);
      } else {
        requestData;
      }
    } catch (error) {
      console.error("Error with image analyzer: ", error);
      setError('Error analyzing image, please try again');
    }
  };

  const addToCart = (label: any) => {
    setCart([...cart, label]);
    setModalVisible(false);
  };

  const removeFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  const clearImage = () => {
    setImageUri(null); // Clear the image URI
    setLabels([]);
    setError(null);
  };

  const navigateToMap = (itemName: string) => {
    navigation.navigate('map', { itemName });
  };
  
  interface ResponseData {
    recyclable: boolean;
    points: number;
  }
  
  const handleRecycle = async (itemName: string) => {
    if (!itemName) {
      console.error('Unable to recycle item, name error');
      return;
    }
  
    try {
      const chatCompletion = await client.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `I am recycling ${itemName}?` }
        ],
        model: 'llama3-8b-8192',
      });
  
      const response = chatCompletion.choices[0].message.content;
  
      if (typeof response === 'string') {
        try {
          const { recyclable, points }: ResponseData = JSON.parse(response);
          console.log(`Recyclable: ${recyclable}, Points: ${points}`);
          
          if (recyclable === true) {
            // Use functional update to ensure we're working with latest state
            setTotal(prevTotal => {
              const newTotal = prevTotal + points;
              console.log(`Previous total: ${prevTotal}, Added points: ${points}, New total: ${newTotal}`);
              return newTotal;
            });
            
            Alert.alert(
              'Recycling Success!',
              `Congrats! You have recycled ${itemName} and earned ${points} points!\nTotal Points: ${total + points}`
            );
          } else {
            Alert.alert('Not Recyclable', `Sorry, ${itemName} is not recyclable.`);
          }
        } catch (error) {
          console.error('Error parsing response:', error);
          Alert.alert('Error', 'Unable to process recycling points');
        }
      } else {
        console.error('Invalid response type');
        Alert.alert('Error', 'Unable to verify item recyclability');
      }
    } catch (error) {
      console.error('Error during recycle verification:', error);
      Alert.alert('Error', 'Failed to process recycling request');
    }
  };

  const PointsDisplay = () => (
    <View>
      <Text>Total Points: {total}</Text>
    </View>
  );


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <Text style={[styles.title, { color: 'white' }]}>
          Scan To See If Your Image Is Recyclable!
        </Text>
        <Text style={[styles.title, { color: '#4D9F39' }]}>
          Where Can You Recycle This?
        </Text>

        {imageUri ? (
          <View style={styles.imageContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={clearImage}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>
            <Image source={{ uri: imageUri }} style={styles.image} />
          </View>
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>No image selected</Text>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={analyzeImage}>
          <Text style={styles.text}>Analyze Image</Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.tallButton]} onPress={useCamera}>
            <Image source={require('../../assets/images/takePhoto.png')} style={styles.buttonImage} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.tallButton]} onPress={pickImage}>
            <Image source={require('../../assets/images/uploadImage.png')} style={styles.uploadImage} />
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        {/* Modal for image detection */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainerNew}>
              <Text style={styles.modalTitle}>{modalMessage}</Text>
              {modalImage && <Image source={modalImage} style={styles.waterBottleImage} />}
              <View style={styles.buttonContainerNew}>
                <TouchableOpacity style={styles.retakeButton} onPress={() => { setModalVisible(false); clearImage(); }}>
                  <Text style={styles.text}>Retake Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.continueButton} onPress={() => { if (modalMessage && modalMessage.includes("Plastic")) { addToCart("Plastic"); } else { addToCart("Paper"); } setModalVisible(false); }} >
                  <Text style={styles.text}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <PointsDisplay />


        {/* Cart display */}
        <View style={styles.cartContainer}>
          <Text style={styles.cartTitle}>Recycling Cart:</Text>
          {cart.length > 0 ? (
            cart.map((item, index) => (
              <View key={index} style={styles.cartItem}>
                <Text>{item.description}</Text>
                <View style={styles.cartButtonsContainer}>
                  <TouchableOpacity style = {styles.mapButton}>
                    <Text style={styles.mapButtonText} onPress={() => handleRecycle(item.description)}>Recycle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.mapButton}
                    onPress={() => navigateToMap(item.description)} // Navigate to Map with item name
                  >
                    <Text style={styles.mapButtonText}>Go to Map</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeFromCart(index)} style={styles.deleteButton}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyCartMessage}>It's empty in here... Get to it!</Text>
          )}
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C2D5BA',
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
    marginVertical: 10,
  },
  tallButton: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    marginLeft: 25,
  },
  scrollViewContainer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative', // This allows positioning of the close button
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: -10,
    left: -10,
    backgroundColor: 'rgba(255, 0, 0, 0.7)', // Semi-transparent red background
    borderRadius: 15,
    padding: 5,
    zIndex: 1,
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 20,
  },
  noImageContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  noImageText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#FFFBF1',
    borderRadius: 25,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonImage: {
    width: 75,
    height: 75,
  },
  uploadImage: {
    width: 85,
    height: 85,
  },
  text: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '75%',
    backgroundColor: '#728a68',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  labelItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  labelList: {
    maxHeight: 300, // Limit the height of the FlatList
  },
  flatList: {
    marginBottom: 10,
  },
  cartContainer: {
    marginTop: 20,
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  deleteButton: {
    backgroundColor: '#FF5722',
    borderRadius: 5,
    padding: 5,
  },
  deleteText: {
    color: 'white',
  },
  mapButton: {
    backgroundColor: '#2196F3',
    borderRadius: 5,
    padding: 5,
    marginRight: 10,
  },
  mapButtonText: {
    color: 'white',
  },
  cartButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyCartMessage: {
    textAlign: 'center',
    color: '#555',
    paddingVertical: 10,
  },
  spacer: {
    height: 100, // Space at the bottom when no image is present
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  topLeftImg: {
    position: 'absolute',
    top: -90,
    left: -25,
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  topRightImg: {
    position: 'absolute',
    top: -80,
    right: -50,
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  bottomLeftImg: {
    position: 'absolute',
    bottom: -795,
    left: -80,
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  bottomRightImg: {
    position: 'absolute',
    bottom: -790,
    right: -35,
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  buttonRow: {
    flexDirection: 'row', 
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '70%',
    marginBottom: 10, 
  },
  halfButton: {
    width: '48%', 
  },
    retakeButton: {
    backgroundColor: '#c2d5ba',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
    alignItems: 'center',
    width: '45%',
  },
  continueButton: {
    backgroundColor: '#c2d5ba',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '45%',
  },
  buttonContainerNew: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 10,
  },
  modalContainerNew: {
    width: '75%',
    backgroundColor: '#728a68',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,

  },
  waterBottleImage: {
    width: 100,
    height: 150,
    resizeMode: 'contain',
    marginVertical: 10,
  },
});
export default DetectObject;