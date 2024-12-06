import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appbar, TextInput, Text } from 'react-native-paper';
import axios from 'axios';
import * as Location from 'expo-location';

const GOOGLE_PLACES_API_KEY = 'AIzaSyDrdu5Pxaa4B86e1fF52faAYKAZji8eDVc';

export default function MapViewScreen({ route, navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [focusedLocation, setFocusedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const mapRef = useRef(null); // Ref for the MapView

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Location Permission Denied',
            'Enable location services to see nearby restaurants.'
          );
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setCurrentLocation({ latitude, longitude });
        setFocusedLocation({ latitude, longitude });
      } catch (error) {
        console.error('Error fetching user location:', error);
      }
    };

    const fetchRestaurants = async () => {
      const storedRestaurants = await AsyncStorage.getItem('@restaurants');
      if (storedRestaurants) {
        setRestaurants(JSON.parse(storedRestaurants));
      }
    };

    fetchUserLocation();
    fetchRestaurants();

    // Handle focused location when coming from RestaurantList screen
    if (route.params?.restaurantLocation) {
      const { latitude, longitude } = route.params.restaurantLocation;
      setFocusedLocation({ latitude, longitude });

      // Animate to the location
      mapRef.current?.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  }, [route.params]);

  const handleSearch = async () => {
    if (!searchQuery || !currentLocation) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
        {
          params: {
            input: searchQuery,
            key: GOOGLE_PLACES_API_KEY,
            types: 'restaurant',
            location: `${currentLocation.latitude},${currentLocation.longitude}`,
            radius: 5000,
          },
        }
      );
      setSearchResults(response.data.predictions);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleSelectSearchResult = async (result) => {
    try {
      const placeDetailsResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: {
            place_id: result.place_id,
            key: GOOGLE_PLACES_API_KEY,
          },
        }
      );

      const placeDetails = placeDetailsResponse.data.result;
      const { lat, lng } = placeDetails.geometry.location;

      setFocusedLocation({ latitude: lat, longitude: lng });
      setSearchResults([]);
      setSearchQuery('');

      // Animate to the location
      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header style={styles.header}>
        <Appbar.Action
          icon="arrow-left"
          onPress={() => navigation.goBack()}
          color="#fff"
        />
        <Appbar.Content title="Map View" color="#fff" />
      </Appbar.Header>

      {/* Search Bar */}
      <TextInput
        mode="outlined"
        label="Search for restaurants"
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          if (text) handleSearch();
        }}
        style={styles.searchBar}
      />

      {/* Search Results */}
      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.searchResultItem}
              onPress={() => handleSelectSearchResult(item)}
            >
              <Text>{item.description}</Text>
            </TouchableOpacity>
          )}
          style={styles.searchResultsList}
        />
      )}

      {/* Map View */}
      <MapView
        ref={mapRef} // Attach ref to MapView
        style={styles.map}
        initialRegion={{
          latitude: currentLocation?.latitude || 37.7749,
          longitude: currentLocation?.longitude || -122.4194,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        region={
          focusedLocation && {
            latitude: focusedLocation.latitude,
            longitude: focusedLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }
        }
      >
        {/* Pins for user-added restaurants */}
        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            coordinate={{
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
            }}
            title={restaurant.name}
            description={`Rating: ${restaurant.rating} ⭐`}
            pinColor="blue"
          />
        ))}

        {/* Pin for selected/search location */}
        {focusedLocation && (
          <Marker
            coordinate={focusedLocation}
            title="Selected Location"
            pinColor="red"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    backgroundColor: 'tomato',
  },
  searchBar: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  searchResultsList: {
    maxHeight: 200,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  searchResultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  map: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
