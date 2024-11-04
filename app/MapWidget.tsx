import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import axios from 'axios';
import tw from 'twrnc';

interface RecyclingCenter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const MapWidget: React.FC = () => {
  const router = useRouter();
  const [region, setRegion] = useState<Region | null>(null);
  const [recyclingCenters, setRecyclingCenters] = useState<RecyclingCenter[]>([]);
  const [loading, setLoading] = useState(true);

  const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_CLOUD_VISION_API_KEY;

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const currentRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.2,    // Increased for wider view
          longitudeDelta: 0.2,   // Increased for wider view
        };
        setRegion(currentRegion);

        const response = await axios.get(
          'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
          {
            params: {
              location: `${location.coords.latitude},${location.coords.longitude}`,
              radius: 80467,
              keyword: 'recycling center|waste management',
              key: GOOGLE_PLACES_API_KEY,
            },
          }
        );

        const centers = response.data.results.map((place: any) => ({
          id: place.place_id,
          name: place.name,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        }));

        setRecyclingCenters(centers);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !region) {
    return (
      <View style={tw`mx-4 mb-6 rounded-xl overflow-hidden shadow-lg bg-white h-48 justify-center items-center`}>
        <ActivityIndicator size="large" color="#C2D5BA" />
      </View>
    );
  }

  return (
    <Pressable 
      onPress={() => router.push('/(tabs)/map')}
      style={tw`mx-4 mb-6 bg-white rounded-xl overflow-hidden shadow-lg`}
    >
      {/* Header with new background color */}
      <View style={[tw`p-3`, { backgroundColor: '#B6AD90' }]}>
        <Text style={[tw`text-lg font-bold text-white`, { fontFamily: 'Gilroy' }]}>
          Nearby Recycling Centers
        </Text>
      </View>

      {/* Map */}
      <View style={tw`h-48 w-full`}>
        <MapView
          style={tw`h-full w-full`}
          region={region}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {recyclingCenters.map((center) => (
            <Marker
              key={center.id}
              coordinate={{
                latitude: center.latitude,
                longitude: center.longitude,
              }}
              pinColor="#C2D5BA"
              title={center.name}
            />
          ))}
        </MapView>
      </View>
    </Pressable>
  );
};

export default MapWidget;