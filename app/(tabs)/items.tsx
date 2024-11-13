import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, FlatList, SafeAreaView, ScrollView, Linking, Alert } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { StackNavigationProp } from '@react-navigation/stack';
import { Platform } from 'react-native';
import Groq from 'groq-sdk';
import {usePoints, useWeight, useImpact, useHistory, useChartHistory} from '../PointsContext';
import BottomSheet from '../BottomSheet'; 
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as Font from 'expo-font';

const client = new Groq({
  apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY,
});



const systemPrompt = 
`
You are RecycleBot, an AI assistant for RecycleRoute, a mobile app that gamifies recycling. When provided an item name, you must respond *only* with a JSON object in the format below—nothing else. Do not include any prefacing text or extra information. If you detect an error, still return a JSON object in this exact format.

It is critical that you classify objects correctly as recyclable or non-recyclable. Animals and body appendages should probably not be recycled, while regular everyday items should be.

For recyclable items, return:

{
  "recyclable": true,
  "points": <integer from 1 to 5 depending on required effort, 1 being for easy items like bottles and 5 being for high-value items like metals>,
  "weight": <double for the estimated weight of item in kg>,
  "lifespan_extension": <double for estimated days world resources last longer with daily recycling like yours, be very strict with this number and ensure it reflects realistic impact>
}

For non-recyclable items, return:

{
  "recyclable": false,
  "points": 0,
  "weight": 0,
  "lifespan_extension": 0
}

Be fair but very strict in awarding points and other metrics. Use a scale of 0–5 points, where:
- "Points" are based on the difficulty or ease of recycling the item, with low-effort items like drink containers at 1–2 points and items like metals or electronics at 4–5 points.
- "Weight" reflects the item’s approximate mass in kg.
- "Lifespan_extension" represents a minimal but meaningful impact in days added to global resource availability through daily recycling of this item. Calculate this strictly based on the item's weight, assuming it conserves resources proportionate to daily recycling for an average person globally. Avoid overestimating; be conservative in your estimates for accuracy and consistency.
`

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
  const {points, addPoints} = usePoints();
  const {weight, addWeight} = useWeight();
  const {impact, addImpact} = useImpact();
  const {history, addHistory} = useHistory();
  const {chartHistory, addChartHistory} = useChartHistory();
  const [recycledItems, setRecycledItems] = useState<Set<string>>(new Set());
  const [fontsLoaded] = useFonts({
    'Nerko-One': require('../../assets/fonts/NerkoOne-Regular.ttf'),
    'Gilroy': require('../../assets/fonts/Gilroy-Regular.otf'),
  });


  
    const [recycleSuccessModal, setRecycleSuccessModal] = useState({
      visible: false,
      itemName: '',
      weight: 0,
      points: 0,
      totalPoints: 0
    });

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
    setLabels(response.data.responses[0].labelAnnotations);
    setError(null);
    setModalVisible(true);
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
  };

  const navigateToMap = (itemName: string) => {
    navigation.navigate('map', { itemName });
  };

  
  interface ResponseData {
    recyclable: boolean;
    points: number;
    weight: number;
    lifespan_extension: number;
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
          const { recyclable, points : earnedPoints, weight : earnedWeight, lifespan_extension: earnedImpact }: ResponseData = JSON.parse(response);
          const formattedWeight = parseFloat(earnedWeight.toFixed(2));
          console.log(`Recyclable: ${recyclable}, Points: ${points}, Weight: ${weight}, Impact: ${impact}`);
          
              if (recyclable === true) {
          addPoints(earnedPoints);
          addWeight(formattedWeight);
          addImpact(earnedImpact);
          addHistory(`Recycled ${formattedWeight} kg of ${itemName} for ${earnedPoints}`);
          addChartHistory(itemName);
          
          setRecycledItems(prev => new Set(prev).add(itemName));
          setRecycleSuccessModal({
            visible: true,
            itemName,
            weight: formattedWeight,
            points: earnedPoints,
            totalPoints: earnedPoints + points
          });
          
          const newCart = cart.filter((item) => item.description !== itemName);
          setCart(newCart);
  } else {
    Alert.alert('Not Recyclable', `Sorry, ${itemName} is not recyclable. Please remove from bag.`);
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

  {/* 
    
    const PointsDisplay = () => (
    <View>
      <Text>Total Points: {points}</Text>
      <Text>Total Weight: {weight} kg</Text>
      <Text>Total Impact: {impact} days</Text>
    </View>
  );
    
    */}

  


  return (
        <GestureHandlerRootView style={{ flex: 1 }}>
  <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/greenTopLeft.png')}
        style={styles.topLeftImg}
      />
      <Image
        source={require('../../assets/images/greenTopRight.png')}
        style={styles.topRightImg}
      />
      <Image
        source={require('../../assets/images/greenBottomLeft.png')}
        style={styles.bottomLeftImg}
      />
      <Image
        source={require('../../assets/images/greenBottomRight.png')}
        style={styles.bottomRightImg}
      />
    </View>

      <Modal
    animationType="fade"
    transparent={true}
    visible={recycleSuccessModal.visible}
    onRequestClose={() => setRecycleSuccessModal(prev => ({...prev, visible: false}))}
  >
    <View style={styles.recycleModalOverlay}>
      <View style={styles.recycleModalContainer}>
        <Text style={[styles.recycleModalTitle, { fontFamily: 'Nerko-One' }]}>
          Recycling Success! 🌱
        </Text>
        
        <View style={styles.recycleModalContent}>
          <Text style={[styles.recycleModalText, { fontFamily: 'Gilroy' }]}>
            You have recycled
          </Text>
          <Text style={[styles.recycleModalHighlight, { fontFamily: 'Nerko-One' }]}>
            {recycleSuccessModal.itemName}
          </Text>
          
          <View style={styles.recycleModalStats}>
            <View style={styles.recycleModalStatItem}>
              <Text style={[styles.recycleModalLabel, { fontFamily: 'Gilroy' }]}>Weight Saved</Text>
              <Text style={[styles.recycleModalValue, { fontFamily: 'Gilroy' }]}>
                {recycleSuccessModal.weight} kg
              </Text>
            </View>
            
            <View style={styles.recycleModalStatItem}>
              <Text style={[styles.recycleModalLabel, { fontFamily: 'Gilroy' }]}>Points Earned</Text>
              <Text style={[styles.recycleModalValue, { fontFamily: 'Gilroy' }]}>
                +{recycleSuccessModal.points}
              </Text>
            </View>
          </View>

          <Text style={[styles.recycleModalTotal, { fontFamily: 'Gilroy' }]}>
            Total Points: {recycleSuccessModal.totalPoints}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.recycleModalButton}
          onPress={() => setRecycleSuccessModal(prev => ({...prev, visible: false}))}
        >
          <Text style={[styles.recycleModalButtonText, { fontFamily: 'Gilroy' }]}>
            Keep Recycling!
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>

  <Text style={[styles.title2, {fontFamily: 'Nerko-One'}]}>Scan To See If Your Image Is Recyclable!</Text>
   
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
    <Text style={[styles.title, {fontFamily: 'Nerko-One', color: "green"}]}>Where Can You Recycle This?</Text>

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
        <Text style={[styles.text, {fontFamily: 'Gilroy'}]}>Analyze Image</Text>
      </TouchableOpacity>

      {/* Wrap the buttons in a row */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.tallButton]} onPress={useCamera}>
          <Image source={require('../../assets/images/takePhoto.png')} style={styles.buttonImage}/>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.tallButton]} onPress={pickImage}>
          <Image source={require('../../assets/images/uploadImage.png')} style={styles.uploadImage}/>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

          {/* Modal for label selection */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Select a Label</Text>
                <Text style={styles.modalSubtitle}>
                  (If your item does not appear then please retake the photo with the item in clear focus)
                </Text>
                <FlatList
                  data={labels}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.labelItem} onPress={() => addToCart(item)}>
                      <Text>{item.description}</Text>
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={styles.labelList}
                  style={styles.flatList}
                />
                <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
                  <Text style={styles.text}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          {/*  <PointsDisplay /> */}


          {/* Cart display */}
        <BottomSheet
    cart={cart.map(item => item.description)}
    total={points} // Using your points from usePoints()
    handleRecycle={(itemName) => handleRecycle(itemName)}
    navigateToMap={(itemName) => navigateToMap(itemName)}
    removeFromCart={(index) => removeFromCart(index)}
    recycledItems={recycledItems}
  />

          {/* Spacer to ensure some space at the bottom when no image is present */}
          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>
        </GestureHandlerRootView>

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
  width: 110,  
  height: 100, 
  justifyContent: 'center',
  alignItems: 'center',
},
  scrollViewContainer: {
    paddingBottom: 100,
    alignItems: 'center',
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  title2: {
    fontSize: 35,
    fontWeight: 'bold',
    textAlign: 'center',
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
    backgroundColor: '#8AA984',
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
    width: 90,
    height: 90,
  },
  uploadImage: {
    width: 91,
    height: 91,
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
    backgroundColor: 'white',
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
    maxHeight: 300, 
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
    height: 100, 
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
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
    width: '50%',
    marginVertical: -5, 
    gap: 5,
    marginRight: 13,
  },
  halfButton: {
    width: '48%', 
  },
    recycleModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recycleModalContainer: {
    width: '85%',
    backgroundColor: 'beige',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  recycleModalTitle: {
    fontSize: 28,
    color: '#728A68',
    marginBottom: 20,
    textAlign: 'center',
  },
  recycleModalContent: {
    width: '100%',
    alignItems: 'center',
  },
  recycleModalText: {
    fontSize: 18,
    color: '#400908',
    marginBottom: 10,
  },
  recycleModalHighlight: {
    fontSize: 24,
    color: '#728A68',
    marginBottom: 20,
  },
  recycleModalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  recycleModalStatItem: {
    alignItems: 'center',
    backgroundColor: '#C2D5BA',
    padding: 15,
    borderRadius: 15,
    width: '45%',
  },
  recycleModalLabel: {
    fontSize: 14,
    color: 'white',
    marginBottom: 5,
  },
  recycleModalValue: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  recycleModalTotal: {
    fontSize: 22,
    color: '#400908',
    marginTop: 10,
    fontWeight: 'bold',
  },
  recycleModalButton: {
    backgroundColor: '#728A68',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  recycleModalButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DetectObject;