import React, { useState, useEffect } from 'react';
import MapView, { Marker, Region } from 'react-native-maps';
import { StyleSheet, View, Modal, Text, TouchableOpacity, Linking, Platform, ActivityIndicator, ScrollView, Switch } from 'react-native';
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

export default function Map() {
  const [region, setRegion] = useState<Region | null>(null);
  const [recyclingCenters, setRecyclingCenters] = useState<RecyclingCenter[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<RecyclingCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<RecyclingCenter | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [distance, setDistance] = useState(5);
  const [showOpen, setShowOpen] = useState(false);
  const [showHighestRated, setShowHighestRated] = useState(false);

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
      setFilteredCenters(centers);
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
                description: topReview,
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
    setIsExpanded(false);
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

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  const applyFilters = () => {
    let updatedCenters = [...recyclingCenters];

    if (showOpen) {
      updatedCenters = updatedCenters.filter(center => center.openingHours?.open_now);
    }

    if (showHighestRated) {
      updatedCenters = updatedCenters.filter(center => center.rating && center.rating >= 4); // Adjust the rating threshold as necessary
    }

    // Here you can add distance filtering logic if needed

    setFilteredCenters(updatedCenters);
    setFilterModalVisible(false);
  };

  const handleDistanceChange = (miles: number) => {
    setDistance(miles);
    // Apply distance filtering logic if necessary
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="beige" style={styles.loadingIndicator} />
      ) : (
        region && (
          <MapView
            style={styles.map}
            region={region}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {filteredCenters.map((center) => (
              <Marker
                key={center.id}
                coordinate={{ latitude: center.latitude, longitude: center.longitude }}
                title={center.name}
                onPress={() => handleMarkerPress(center)}
                pinColor="#C2D5BA"
              />
            ))}
          </MapView>
        )
      )}

      {/* Filter Modal */}
      <Modal transparent={true} visible={filterModalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.filterOption}>
              <Text>Only Show Open</Text>
              <Switch value={showOpen} onValueChange={setShowOpen} />
            </View>
            <View style={styles.filterOption}>
              <Text>Show Highest Rated Places</Text>
              <Switch value={showHighestRated} onValueChange={setShowHighestRated} />
            </View>
            <TouchableOpacity onPress={applyFilters} style={styles.button}>
              <Text style={styles.button}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal transparent={true} visible={sortModalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text>Sort by Distance:</Text>
            {[5, 10, 20].map((miles) => (
              <TouchableOpacity key={miles} onPress={() => handleDistanceChange(miles)}>
                <Text>{miles} miles</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => { /* Handle custom distance */ }}>
              <Text>Custom Distance</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSortModalVisible(false)} style={styles.button}>
              <Text style={styles.button}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
                </View>
              )}
              
              <ScrollView style={styles.scrollView}>
                <Text style={styles.modalDescription}>
                  {isExpanded ? selectedCenter.description : selectedCenter.description?.substring(0, 100) + '...'}
                </Text>
              </ScrollView>

              <TouchableOpacity onPress={toggleDescription}>
                <Text style={styles.modalText}>{isExpanded ? "Show Less" : "Read More"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openMaps(selectedCenter)} style={styles.button}>
                <Text style={styles.button}>Get Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.button}>
                <Text style={styles.button}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Sort and Filter Buttons */}
      <View style={styles.bottomLeftModal}>
        <TouchableOpacity onPress={() => setSortModalVisible(true)} style={styles.button}>
          <Text style={styles.button}>Sort by Distance</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.button}>
          <Text style={styles.button}>Filter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalAddress: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
  },
  modalTextSmall: {
    fontSize: 12,
  },
  scrollView: {
    maxHeight: 80,
    marginVertical: 10,
  },
  modalDescription: {
    fontSize: 14,
  },
  button: {
    padding: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 10,
  },
  bottomLeftModal: {
    position: 'absolute',
    bottom: 20,
    left: 10,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  openingHoursContainer: {
    marginVertical: 10,
  },
});
