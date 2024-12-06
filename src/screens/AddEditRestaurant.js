import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { TextInput, Text, Card, Title, Divider } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';

const GOOGLE_PLACES_API_KEY = 'AIzaSyDrdu5Pxaa4B86e1fF52faAYKAZji8eDVc';

export default function AddEditRestaurant({ navigation, route }) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState('');
  const [location, setLocation] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
  });
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Pre-fill form fields when editing
  useEffect(() => {
    if (route.params?.restaurant) {
      const { name, rating, latitude, longitude, contact, address } = route.params.restaurant;
      setName(name);
      setRating(rating.toString());
      setLocation({ latitude, longitude });
      setContact(contact || '');
      setAddress(address || '');
    }
  }, [route.params?.restaurant]);

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
        {
          params: {
            input: query,
            key: GOOGLE_PLACES_API_KEY,
            types: 'establishment',
          },
        }
      );
      setSuggestions(response.data.predictions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSelectSuggestion = async (suggestion) => {
    setName(suggestion.description);
    setSuggestions([]);

    // Fetch place details to get exact location, contact, and address
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: {
            place_id: suggestion.place_id,
            key: GOOGLE_PLACES_API_KEY,
          },
        }
      );
      const result = response.data.result;
      const { lat, lng } = result.geometry.location;

      setLocation({ latitude: lat, longitude: lng });
      setContact(result.formatted_phone_number || '');
      setAddress(result.formatted_address || '');
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  const saveRestaurant = async () => {
    if (!name || !rating) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }

    const newRestaurant = {
      id: route.params?.restaurant?.id || Date.now().toString(),
      name,
      rating: parseInt(rating, 10),
      latitude: location.latitude,
      longitude: location.longitude,
      contact,
      address,
    };

    const storedRestaurants = await AsyncStorage.getItem('@restaurants');
    const restaurants = storedRestaurants ? JSON.parse(storedRestaurants) : [];

    if (route.params?.restaurant?.id) {
      // Update existing restaurant
      const updatedRestaurants = restaurants.map((r) =>
        r.id === route.params.restaurant.id ? newRestaurant : r
      );
      await AsyncStorage.setItem('@restaurants', JSON.stringify(updatedRestaurants));
    } else {
      // Add new restaurant
      await AsyncStorage.setItem('@restaurants', JSON.stringify([...restaurants, newRestaurant]));
    }

    Alert.alert('Success', `Restaurant ${route.params?.restaurant ? 'updated' : 'added'}!`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>
        {route.params?.restaurant ? 'Edit Restaurant' : 'Add Restaurant'}
      </Title>
      <Divider style={styles.divider} />

      <TextInput
        label="Restaurant Name"
        value={name}
        onChangeText={(text) => {
          setName(text);
          fetchSuggestions(text);
        }}
        mode="outlined"
        style={styles.input}
      />
      {suggestions.length > 0 && (
        <Card style={styles.suggestionsCard}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(item)}
              >
                <Text>{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        </Card>
      )}

      <TextInput
        label="Rating (1-5)"
        value={rating}
        onChangeText={setRating}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
      />

      <TextInput
        label="Contact Information"
        value={contact}
        onChangeText={setContact}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Address"
        value={address}
        onChangeText={setAddress}
        mode="outlined"
        style={styles.input}
      />

      <Text style={styles.label}>Select Restaurant Location:</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={(e) => setLocation(e.nativeEvent.coordinate)}
      >
        <Marker coordinate={location} />
      </MapView>

      <TouchableOpacity style={styles.saveButton} onPress={saveRestaurant}>
        <Text style={styles.saveButtonText}>Save Restaurant</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  divider: { marginBottom: 16 },
  input: { marginBottom: 16 },
  suggestionsCard: { marginBottom: 16 },
  suggestionItem: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  label: { fontSize: 16, marginBottom: 8, fontWeight: 'bold' },
  map: { flex: 1, height: 300, marginBottom: 16 },
  saveButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'tomato',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
