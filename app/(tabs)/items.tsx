import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const DetectObject = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [labels, setLabels] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

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
  }

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
        encoding: FileSystem.EncodingType.Base64
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
                maxResults: 5
              }
            ]
          }
        ]
      };

      const response = await axios.post(apiURL, requestData);

      console.log("Response Data: ", response.data);
      setLabels(response.data.responses[0].labelAnnotations);
      setError(null);
    } catch (error) {
      console.error("Error with image analyzer: ", error);
      setError('Error analyzing image, please try again');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Google Cloud Vision API Demo</Text>
      {imageUri && <Image source={{ uri: imageUri }} style={{ width: 300, height: 300, marginBottom: 20 }} />}
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.text}>Choose an image</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={analyzeImage}>
        <Text style={styles.text}>Analyze Image</Text>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
      {
        labels.length > 0 && (
          <View>
            <Text>Labels:</Text>
            {
              labels.map((label, index) => (
                <Text key={index}>{label.description}</Text>
              ))
            }
          </View>
        )
      }
    </View>
  )
}

export default DetectObject;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
  },
  error: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
  }
});