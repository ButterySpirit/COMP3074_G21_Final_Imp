import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, FlatList, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Appbar, Card, IconButton } from 'react-native-paper';

const dummyData = [
  {
    id: '1',
    name: 'The Italian Place',
    rating: 5,
    latitude: 37.7749,
    longitude: -122.4194,
    address: '123 Italian St, San Francisco, CA',
    contact: '(123) 456-7890',
  },
  {
    id: '2',
    name: 'Sushi World',
    rating: 4,
    latitude: 37.7849,
    longitude: -122.4094,
    address: '456 Sushi Ave, San Francisco, CA',
    contact: '(987) 654-3210',
  },
  {
    id: '3',
    name: 'Burger Haven',
    rating: 3,
    latitude: 37.7949,
    longitude: -122.4294,
    address: '789 Burger Blvd, San Francisco, CA',
    contact: '(555) 555-5555',
  },
];

export default function RestaurantList({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchRestaurants = async () => {
      const storedRestaurants = await AsyncStorage.getItem('@restaurants');
      if (storedRestaurants) {
        setRestaurants(JSON.parse(storedRestaurants));
      } else {
        setRestaurants([]);
      }
    };

    const unsubscribe = navigation.addListener('focus', fetchRestaurants);
    fetchRestaurants();
    return unsubscribe;
  }, [navigation]);

  const handleAddDummyData = async () => {
    await AsyncStorage.setItem('@restaurants', JSON.stringify(dummyData));
    setRestaurants(dummyData);
    Alert.alert('Success', 'Dummy data added!');
  };

  const handleClearData = async () => {
    await AsyncStorage.removeItem('@restaurants');
    setRestaurants([]);
    Alert.alert('Success', 'All data cleared!');
  };

  const handleCopyToClipboard = (item) => {
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
    Clipboard.setString(googleMapsLink);
    Alert.alert('Copied to Clipboard', `Google Maps link for "${item.name}" has been copied.`);
  };

  const handleDelete = async (id) => {
    const updatedRestaurants = restaurants.filter((restaurant) => restaurant.id !== id);
    await AsyncStorage.setItem('@restaurants', JSON.stringify(updatedRestaurants));
    setRestaurants(updatedRestaurants);
    Alert.alert('Deleted', 'Restaurant has been deleted.');
  };

  const renderRestaurant = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() =>
        navigation.navigate('Map', {
          restaurantLocation: { latitude: item.latitude, longitude: item.longitude },
        })
      }
    >
      <Card.Content style={styles.cardContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text>Rating: {item.rating} ⭐</Text>
      </Card.Content>

      <View style={styles.buttonGroup}>
        {!editMode && (
          <>
            <IconButton
              icon="content-copy"
              size={20}
              onPress={() => handleCopyToClipboard(item)}
            />
            <TouchableOpacity
              style={[styles.detailsButton]}
              onPress={() =>
                navigation.navigate('RestaurantDetails', { restaurant: item })
              }
            >
              <Text style={styles.detailsButtonText}>Details</Text>
            </TouchableOpacity>
          </>
        )}

        {editMode && (
          <View style={styles.editButtonsContainer}>
            <TouchableOpacity
              style={[styles.editButton, styles.deleteButton]}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.editButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editButton, styles.editButtonStyle]}
              onPress={() =>
                navigation.navigate('AddEditRestaurant', { restaurant: item })
              }
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header>
        <Appbar.Content title="Restaurant List" />
        <Appbar.Action
          icon={editMode ? 'check' : 'pencil'}
          onPress={() => setEditMode(!editMode)}
        />
      </Appbar.Header>

      {/* Restaurant List */}
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={renderRestaurant}
        ListEmptyComponent={<Text style={styles.emptyText}>No restaurants added yet.</Text>}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      {/* Footer Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.addButton]}
          onPress={handleAddDummyData}
        >
          <Text style={styles.actionButtonText}>Add Dummy Data</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          onPress={handleClearData}
        >
          <Text style={styles.actionButtonText}>Clear All Data</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.addButton]}
          onPress={() => navigation.navigate('AddEditRestaurant')}
        >
          <Text style={styles.actionButtonText}>Add Restaurant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  card: {
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 3,
  },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 18, fontWeight: 'bold' },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 8,
  },
  editButton: {
    marginHorizontal: 4,
    borderRadius: 8,
    padding: 10,
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
  },
  editButtonStyle: {
    backgroundColor: '#4da6ff',
  },
  detailsButton: {
    marginHorizontal: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: 'tomato',
  },
  clearButton: {
    backgroundColor: '#999',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#999' },
});
