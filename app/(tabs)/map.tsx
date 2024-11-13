import React, { useState, useEffect, useCallback, useRef } from 'react';
import MapView, { Marker, Region } from 'react-native-maps';
import { StyleSheet, View, Modal, Text, TouchableOpacity, Linking, Platform, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { Feather } from '@expo/vector-icons';
import {useRoute, RouteProp} from '@react-navigation/native';
import CustomLoadingIndicator from '../CustomLoadingIndicator';
import { useFonts } from 'expo-font';
import { WebView } from 'react-native-webview';
import { parseDocument } from 'htmlparser2';
import { selectAll } from 'css-select';



interface RecyclingCenter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  openingHours?: { open_now: boolean; weekday_text: string[] }; 
  rating?: number; 
  description?: string; 
  items?: string;
  marker?: string;
  instruction?: string;
}

type RootStackParamList = {
  map: { itemName: string }; // Define the route and its expected params
};

const defaultKeyword = 'recycling center|waste management|recyclable materials|recycle center';
const Green = '#C2D5BA';
const Blue = '#A6C8E0';

 

// Define a type for the route prop of the 'map' screen
type MapScreenRouteProp = RouteProp<RootStackParamList, 'map'>;

export default function Map() {
  const [region, setRegion] = useState<Region | null>(null);
  const [recyclingCenters, setRecyclingCenters] = useState<RecyclingCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<RecyclingCenter | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentSearchKeyword, setCurrentSearchKeyword] = useState('');

  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const route = useRoute<MapScreenRouteProp>();
  const { itemName = '' } = route.params || {};
  const [prevItemName, setPrevItemName] = useState(itemName);

  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);



  const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_CLOUD_VISION_API_KEY;

  const isInitialRender = useRef(true);



  const requestLocationPermission = async (): Promise<boolean> => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return false;
    }
    return true;
  };
  
  useEffect(() => {
    const handleItemNameChange = async () => {
      if (itemName && (itemName !== prevItemName || isInitialRender.current)) {
        console.log('Updating search with itemName:', itemName); // Debug log
        setSearchKeyword(itemName);
        setCurrentSearchKeyword(itemName);
        setPrevItemName(itemName);
        
        // If we have the region, trigger a new search
        if (region) {
          await fetchRecyclingCenters(region.latitude, region.longitude, itemName);
        }
        
        isInitialRender.current = false;
      }
    };

    handleItemNameChange();
  }, [itemName, region]);

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

  

    const fetchCrowdSourced = async (): Promise<RecyclingCenter[]> => {
      try {
        const response = await fetch(
          "https://docs.google.com/spreadsheets/d/e/2PACX-1vQK7C7fNALFEUNzWAJq9_YoR-wV6HZHhIU2CONO3tEmg3fDneTRBFJJrmCLzHmoIjqEj0N6t7bpko1T/pubhtml"
        );
        const htmlString = await response.text();
    
        // Parse the HTML document
        const dom = parseDocument(htmlString);
        const rows = selectAll('table tr', dom);
        const columnData: string[][] = [];
    
        // Iterate over each row and parse data by column
        rows.forEach((row, rowIndex) => {
          const cells = selectAll('td', row);
    
          cells.forEach((cell, colIndex) => {
            const cellText = cell.children
              .filter((node) => node.type === 'text')
              .map((node) => node.data?.trim() || '')
              .join('');
    
            // Initialize each column if it doesn’t exist
            if (!columnData[colIndex]) {
              columnData[colIndex] = [];
            }
    
            // Add cell text to the respective column
            columnData[colIndex].push(cellText);
          });
        });
    
        console.log(columnData)
        // Map the parsed data to RecyclingCenter objects
      const customCenters : RecyclingCenter[] = columnData[0].slice(1).map((name, index) => ({
        id: `crowd-${index}`,
        name,
        latitude: parseFloat(columnData[2][index + 1]),
        longitude: parseFloat(columnData[1][index + 1]),
        address: 'Crowd-sourced location',
        items: columnData[3][index + 1],
        description : "No reviews available.",
        marker: Blue,
        instruction: columnData[4][index + 1],
      }));

      return customCenters;
        
      } catch (error) {
        console.error("Error fetching or parsing spreadsheet:", error);
        return [];
      }
    };

  
  const fetchRecyclingCenters = useCallback(async (lat: number, lng: number, keyword: string = '') => {
    setLoading(true);

    const trimmedKeyword = keyword.trim();
    const searchKeyword = trimmedKeyword ? 
      `${trimmedKeyword} recycling` : 
      defaultKeyword;
    
    console.log('Searching with keyword:', searchKeyword); // Debug log

    let customCenters: RecyclingCenter[] = [];

    if (searchKeyword === defaultKeyword) {
      customCenters = await fetchCrowdSourced();
    }

    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        {
          params: {
            location: `${lat},${lng}`,
            radius: 80467,
            keyword: searchKeyword,
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
        marker: Green,
      }));

      const combinedCenters = searchKeyword === defaultKeyword
        ? [...customCenters, ...centers]
        : centers;

      setRecyclingCenters(combinedCenters);
      centers.forEach((center: RecyclingCenter) => fetchPlaceDetails(center.id));
    } catch (error) {
      console.error("Error fetching recycling centers:", error);
    } finally {
      setLoading(false);
    }
  }, [GOOGLE_PLACES_API_KEY]);


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
                description: topReview || 'No reviews available.',
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

  // Function to toggle the description view
  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (region && currentSearchKeyword !== '') {
      fetchRecyclingCenters(region.latitude, region.longitude, currentSearchKeyword);
    }
  }, [region, currentSearchKeyword, fetchRecyclingCenters]);

  useEffect(() => {
    if (itemName !== '' && itemName !== prevItemName) {
      setSearchKeyword(itemName);
      setCurrentSearchKeyword(itemName);
      setPrevItemName(itemName);
    }
  }, [itemName]);

  const handleSearch = useCallback(() => {
    if (region) {
      setCurrentSearchKeyword(searchKeyword);
      fetchRecyclingCenters(region.latitude, region.longitude, searchKeyword);
    }
    setSearchModalVisible(false);
  }, [region, searchKeyword, fetchRecyclingCenters]);

  // Update clearSearch to properly reset everything
  const clearSearch = useCallback(() => {
    setSearchKeyword('');
    setCurrentSearchKeyword('');
    setPrevItemName('');
    if (region) {
      fetchRecyclingCenters(region.latitude, region.longitude, '');
    }
  }, [region, fetchRecyclingCenters]);
  

  const handleCloseSearchModal = () => {
    if (searchKeyword === '') {
      clearSearch();
    }
    setSearchModalVisible(false);
  };


const [fontsLoaded] = useFonts({
    'Nerko-One': require('../../assets/fonts/NerkoOne-Regular.ttf'),
    'Gilroy': require('../../assets/fonts/Gilroy-Regular.otf'),
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 6000); // Adjust timing as needed
    return () => clearTimeout(timer);
  }, []);

  const handleLoadingComplete = () => {
    setShowContent(true);
  };

  // Replace your existing loading check with this
  if (!showContent) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <CustomLoadingIndicator
          imageSource={require('../../assets/images/birdPlanet.png')} // Adjust path as needed
          width={200}
          height={200}
          isLoading={isLoading}
          onExitComplete={handleLoadingComplete}
          direction="top-to-bottom"
          duration={1500}
        />
      </View>
    );
  }



  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="beige" style={styles.loadingIndicator} />
      ) : (
        <>
        {region && (
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
                pinColor = {center.marker}
              />
            ))}
          </MapView>)}
          {/* Button for filters */}
      <TouchableOpacity 
      style={[styles.filterButton, { position: 'absolute', top: 50, left: 30, zIndex: 1 }]}    
      onPress={() => setFilterModalVisible(true)}
    >
      <Text style={styles.buttonText}>Filters</Text>
    </TouchableOpacity>

    {/* Search icon */}
    <TouchableOpacity 
      style={{ position: 'absolute', top: 50, right: 30, zIndex: 1 }}
      onPress={() => setSearchModalVisible(true)}
    >
      <Feather name="search" size={24} color="black" />
    </TouchableOpacity>

    {/* Modal for filters */}
    <Modal
      visible={filterModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Filter Options</Text>
          {/* Add filter options here */}
          <TouchableOpacity onPress={() => setFilterModalVisible(false)} style={styles.button}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </>
        )
      }
  
      {/* Modal for search */}
      <Modal
        visible={searchModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseSearchModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Item to Recycle</Text>
            <TextInput
              style={{
                height: 40,
                borderColor: 'gray',
                borderWidth: 1,
                marginBottom: 20,
                paddingHorizontal: 10,
                width: '100%',
              }}
              onChangeText={setSearchKeyword}
              value={searchKeyword}
              placeholder="Enter keyword"
            />
            <TouchableOpacity onPress={handleSearch} style={styles.button}>
              <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearSearch} style={styles.button}>
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCloseSearchModal} style={styles.button}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  
      {/* Modal for the recycling locations */}
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
                  <Text style={styles.modalTextSmall}>Hours of Operation:</Text>
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
              {selectedCenter.items && (
                <Text style={styles.modalText}>
                  Items Accepted: {'\n'} {selectedCenter.items}
                </Text>
              )}
              {selectedCenter.instruction && (
                <Text style={styles.modalText}>
                  Instructions: {'\n'} {selectedCenter.instruction}
                </Text>)}
              <ScrollView style={styles.scrollView} scrollEnabled={isExpanded}>
                <Text style={styles.modalDescription}>
                  <Text style={{ fontWeight: 'bold' }}>Customer Stated: </Text>
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
    backgroundColor: 'beige',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Nerko-One',
  },
  modalAddress: {
    marginVertical: 10,
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'Gilroy',
  },
  modalText: {
    marginVertical: 5,
    textAlign: 'center',
    fontFamily: 'Gilroy',
  },
  modalTextSmall: {
    marginVertical: 2,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Gilroy',
  },
  openingHoursContainer: {
    marginVertical: 10,
  },
  scrollView: {
    maxHeight: 175,
  },
   loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#728A68',
  },
  modalDescription: {
    marginVertical: 10,
    textAlign: 'center',
    fontFamily: 'Gilroy',
  },
  button: {
    backgroundColor: '#C2D5BA',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Gilroy',
  },
  toggleText: {
    color: '#728A68',
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: 'bold',
    fontFamily: 'Gilroy',
  },
  //Beginning Modal for filter and 
   filterContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'beige',
    borderRadius: 10,
    alignItems: 'center',
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Gilroy',
  },
  filterAddress: {
    marginVertical: 10,
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'Gilroy',
  },
  filterText: {
    marginVertical: 5,
    textAlign: 'center',
    fontFamily: 'Gilroy',
  },
  filterButton: {
    backgroundColor: '#C2D5BA',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '30%',
  },
});