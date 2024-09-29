import React, { useState, useEffect } from 'react';
import MapView, { Marker, Region } from 'react-native-maps';
import { StyleSheet, View, Modal, Text, TouchableOpacity, Linking, Platform, ActivityIndicator, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

interface RecyclingCenter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  openingHours?: { open_now: boolean; weekday_text: string[] }; 
  rating?: number; 
  description?: string; 
}

export default function App() {
  const [region, setRegion] = useState<Region | null>(null);
  const [recyclingCenters, setRecyclingCenters] = useState<RecyclingCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<RecyclingCenter | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false); // State to toggle description view

  const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_CLOUD_VISION_API_KEY;

  const requestLocationPermission = async (): Promise<boolean> => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return false;
    }
    return true;
  };

  useEffect(() => {
    const fetchLocationAndCenters = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });

      fetchRecyclingCenters(latitude, longitude);
    };

    fetchLocationAndCenters();
  }, []);

  const fetchRecyclingCenters = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
        {
          params: {
            location: `${lat},${lng}`,
            radius: 80467,
            keyword: 'recycling center|waste management|recyclable materials',
            key: GOOGLE_PLACES_API_KEY,
          },
        }
      );

      const centers = response.data.results.map((place: any) => ({
        id: place.place_id,
        name: place.name,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        address: place.vicinity || 'Address not available',
      }));

      setRecyclingCenters(centers);
      centers.forEach((center: RecyclingCenter) => fetchPlaceDetails(center.id));
    } catch (error) {
      console.error("Error fetching recycling centers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaceDetails = async (placeId: string) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: {
            place_id: placeId,
            key: GOOGLE_PLACES_API_KEY,
          },
        }
      );
  
      const placeDetails = response.data.result;
  
      let topReview = 'No reviews available.';
      if (placeDetails.reviews && placeDetails.reviews.length > 0) {
        topReview = placeDetails.reviews[0].text;
      }
  
      setRecyclingCenters(prevCenters =>
        prevCenters.map(center =>
          center.id === placeId
            ? {
                ...center,
                openingHours: placeDetails.opening_hours,
                rating: placeDetails.rating,
                description: topReview + " " + placeDetails.about,
              }
            : center
        )
      );
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  const handleMarkerPress = (center: RecyclingCenter) => {
    setSelectedCenter(center);
    setModalVisible(true);
    setIsExpanded(false); // Reset description toggle when a new marker is pressed
  };

  const openMaps = (center: RecyclingCenter) => {
    const latLng = `${center.latitude},${center.longitude}`;
    const url = Platform.select({
      ios: `maps:0,0?q=${latLng}(${center.name})`,
      android: `geo:0,0?q=${latLng}(${center.name})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${latLng}`,
    });

    Linking.openURL(url).catch((err) => console.error("Failed to open maps:", err));
    setModalVisible(false);
  };

  // Function to toggle the description view
  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      ) : (
        region && (
          <MapView
            style={styles.map}
            region={region}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {recyclingCenters.map((center) => (
              <Marker
                key={center.id}
                coordinate={{ latitude: center.latitude, longitude: center.longitude }}
                title={center.name}
                onPress={() => handleMarkerPress(center)}
              />
            ))}
          </MapView>
        )
      )}
      
      {selectedCenter && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{selectedCenter.name}</Text>
              <Text style={styles.modalAddress}>{selectedCenter.address}</Text>
              
              {selectedCenter.openingHours && (
                <View style={styles.openingHoursContainer}>
                  <Text style={styles.modalText}>
                    {selectedCenter.openingHours.open_now ? "Open Now" : "Closed"}
                  </Text>
                  <Text style={styles.modalTextSmall}>Timings:</Text>
                  {selectedCenter.openingHours.weekday_text.map((timing, index) => (
                    <Text key={index} style={styles.modalTextSmall}>{timing}</Text>
                  ))}
                </View>
              )}
              
              {selectedCenter.rating && (
                <Text style={styles.modalText}>
                  Rating: {selectedCenter.rating} ⭐
                </Text>
              )}
              <ScrollView style = {styles.scrollView} scrollEnabled={isExpanded}>
                <Text style={styles.modalDescription}>
                <Text style={{ fontWeight: 'bold' }}>A user said: </Text>
                <Text style={{ fontStyle: 'italic' }}>
                  {isExpanded 
                    ? selectedCenter.description 
                    : (selectedCenter.description && selectedCenter.description.split(" ").length > 20 
                      ? selectedCenter.description.split(" ").slice(0, 20).join(" ") + "..." 
                      : selectedCenter.description)}
                </Text>
              </Text>
              </ScrollView>
              <TouchableOpacity onPress={toggleDescription}>
                <Text style={styles.toggleText}>
                  {isExpanded ? "Show Less" : "Show More"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.button}
                onPress={() => openMaps(selectedCenter)}
              >
                <Text style={styles.buttonText}>Get Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => setModalVisible(false)} 
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalAddress: {
    marginVertical: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalText: {
    marginVertical: 5,
    textAlign: 'center',
  },
  modalTextSmall: {
    marginVertical: 2,
    textAlign: 'center',
    fontSize: 12,
  },
  openingHoursContainer: {
    marginVertical: 10,
  },
  scrollView: {
    maxHeight: 175,
  },
  modalDescription: {
    marginVertical: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  toggleText: {
    color: '#2196F3',
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: 'bold',
  },
});