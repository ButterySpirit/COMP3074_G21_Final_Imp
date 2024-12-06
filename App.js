import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from 'react-native-vector-icons';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

// Screens
import RestaurantList from './src/screens/RestaurantList';
import AddEditRestaurant from './src/screens/AddEditRestaurant';
import MapViewScreen from './src/screens/MapView';
import AboutScreen from './src/screens/About';
import RestaurantDetails from './src/screens/RestaurantDetails';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Theme for React Native Paper
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'tomato', // Customize theme colors
    accent: 'gray',
  },
};

// Stack Navigator for Restaurant screens
function RestaurantStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: 'tomato' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="RestaurantList"
        component={RestaurantList}
        options={{ title: 'Restaurants' }}
      />
      <Stack.Screen
        name="AddEditRestaurant"
        component={AddEditRestaurant}
        options={{ title: 'Add/Edit Restaurant' }}
      />
      <Stack.Screen
        name="RestaurantDetails"
        component={RestaurantDetails}
        options={{ title: 'Restaurant Details' }}
      />
    </Stack.Navigator>
  );
}

// Stack Navigator for Map
function MapStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: 'tomato' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="MapViewScreen"
        component={MapViewScreen}
        options={{ title: 'Map View' }}
      />
    </Stack.Navigator>
  );
}

// Stack Navigator for About
function AboutStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: 'tomato' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="AboutScreen"
        component={AboutScreen}
        options={{ title: 'About' }}
      />
    </Stack.Navigator>
  );
}

// Main App Component
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ color, size }) => {
                let iconName;

                if (route.name === 'Home') {
                  iconName = 'restaurant-outline';
                } else if (route.name === 'Map') {
                  iconName = 'map-outline';
                } else if (route.name === 'About') {
                  iconName = 'information-circle-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: theme.colors.accent,
              tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 0 },
            })}
          >
            <Tab.Screen
              name="Home"
              component={RestaurantStack}
              options={{ headerShown: false }}
            />
            <Tab.Screen
              name="Map"
              component={MapStack}
              options={{ headerShown: false }}
            />
            <Tab.Screen
              name="About"
              component={AboutStack}
              options={{ headerShown: false }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
