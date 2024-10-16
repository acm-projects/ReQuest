import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, FlatList, SafeAreaView, ScrollView, Linking, Alert } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const DetectObject = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [labels, setLabels] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cart, setCart] = useState<any[]>([]); // Cart state
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null); // State to track camera permission

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

    // Launch the camera after permissions are granted
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
      setModalVisible(true); // Show modal after receiving labels
    } catch (error) {
      console.error("Error with image analyzer: ", error);
      setError('Error analyzing image, please try again');
    }
  };

  const addToCart = (label: any) => {
    setCart([...cart, label]);
    setModalVisible(false); // Close modal after adding to cart
  };

  const removeFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const openSettings = () => {
    Linking.openSettings(); // Open app settings
  };

  const clearImage = () => {
    setImageUri(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <Text style={styles.title}>Recycle Time!</Text>
        {imageUri && (
          <View style={{ position: 'relative', marginBottom: 20 }}>
            <Image source={{ uri: imageUri }} style={{ width: 300, height: 300 }} />
            <TouchableOpacity
              onPress={clearImage}
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 15,
                width: 30,
                height: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text>X</Text>
            </TouchableOpacity>
          </View>
        )}
        {!imageUri && (
  <View
    style={{
      width: 300,
      height: 300,
      marginBottom: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
    }}
  >
    <Text
      style={{
        textAlign: 'center',
        fontSize: 16,
        color: '#333',
      }}
    >
      No image selected
    </Text>
  </View>
)}

        {/* Button to choose an image from the library */}
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.text}>Choose an image</Text>
        </TouchableOpacity>

        {/* Button to use the camera */}
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
                contentContainerStyle={styles.labelList} // Style for the FlatList content
                style={styles.flatList} // Added FlatList style
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
                <TouchableOpacity onPress={() => removeFromCart(index)} style={styles.deleteButton}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyCartMessage}>You have no items below.</Text>
          )}
        </View>
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
    paddingBottom: 20, // Add bottom padding for better spacing
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50', // Green color
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: 'white',
  },
  error: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#007BFF', // Blue color for title
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555', // Subtitle color
  },
  labelItem: {
    backgroundColor: '#f0f8ff', // Alice blue
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
  },
  cartContainer: {
    marginTop: 20,
    width: '100%',
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  deleteButton: {
    backgroundColor: '#FF6347', // Tomato color for delete button
    padding: 5,
    borderRadius: 5,
  },
  deleteText: {
    color: 'white',
  },
  emptyCartMessage: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%', // Set a max height for modal
  },
  labelList: {
    paddingBottom: 10,
  },
  flatList: {
    width: '100%',
  },
});