import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Card, Title, Paragraph } from 'react-native-paper';
import axios from 'axios';

const GOOGLE_PLACES_API_KEY = 'AIzaSyDrdu5Pxaa4B86e1fF52faAYKAZji8eDVc';

export default function RestaurantDetails({ route }) {
  const { restaurant } = route.params;
  const [contactInfo, setContactInfo] = useState({
    phoneNumber: restaurant.contact || 'No contact information',
    address: restaurant.address || 'No address provided',
  });

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      if (!restaurant.place_id) {
        console.warn('No place_id found for this restaurant. Using provided data.');
        return;
      }

      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/details/json`,
          {
            params: {
              place_id: restaurant.place_id,
              key: GOOGLE_PLACES_API_KEY,
            },
          }
        );

        const result = response.data.result;
        setContactInfo({
          phoneNumber: result.formatted_phone_number || contactInfo.phoneNumber,
          address: result.formatted_address || contactInfo.address,
        });
      } catch (error) {
        console.error('Error fetching place details:', error);
      }
    };

    fetchPlaceDetails();
  }, [restaurant.place_id]);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{restaurant.name}</Title>
          <Paragraph>Rating: {restaurant.rating} ⭐</Paragraph>
          <Paragraph>Address: {contactInfo.address}</Paragraph>
          <Paragraph>Contact: {contactInfo.phoneNumber}</Paragraph>
        </Card.Content>
      </Card>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
          }}
          title={restaurant.name}
          description={`Rating: ${restaurant.rating} ⭐`}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  card: { marginBottom: 16 },
  map: {
    flex: 1,
    borderRadius: 8,
    marginTop: 16,
  },
});
