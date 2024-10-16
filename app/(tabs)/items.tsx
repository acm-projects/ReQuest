import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, FlatList, SafeAreaView, ScrollView, Linking, Alert } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { StackNavigationProp } from '@react-navigation/stack';


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

      const fileUri = imageUri!.replace("file://", "");
      const base64ImageData = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

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


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <Text style={styles.title}>Recycle Time!</Text>

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

        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.text}>Choose an image</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={useCamera}>
          <Text style={styles.text}>Use Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={analyzeImage}>
          <Text style={styles.text}>Analyze Image</Text>
        </TouchableOpacity>

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

        {/* Cart display */}
        <View style={styles.cartContainer}>
          <Text style={styles.cartTitle}>Recycling Cart:</Text>
          {cart.length > 0 ? (
            cart.map((item, index) => (
              <View key={index} style={styles.cartItem}>
                <Text>{item.description}</Text>
                <View style={styles.cartButtonsContainer}>
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
            <Text style={styles.emptyCartMessage}>You have no items below.</Text>
          )}
        </View>

        {/* Spacer to ensure some space at the bottom when no image is present */}
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetectObject;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
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
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.7)', // Semi-transparent red background
    borderRadius: 15,
    padding: 5,
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  image: {
    width: 300,
    height: 300,
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
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  text: {
    color: 'white',
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
    width: '80%',
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
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
});