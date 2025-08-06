// ResidentTabs.js
import React, { useRef, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Animated, Dimensions } from 'react-native';
import { Text, TouchableOpacity, View } from 'react-native';

import ApartmentListScreen from '../screens/ApartmentListScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import MaintenanceScreen from '../screens/MaintenanceScreen';
import BillPaymentScreen from '../screens/BillPaymentScreen';
import ChatSupportScreen from '../screens/ChatSupportScreen';
import RentPaymentScreen from '../screens/RentPaymentScreen';
import LeaseDocsScreen from '../screens/LeaseDocsScreen';
import VisitorManagementScreen from '../screens/VisitorManagementScreen';
import AmenitiesScreen from '../screens/AmenitiesScreen';
import DailyActivityScreen from '../screens/DailyActivityScreen';
import ProfileDrawer from '../components/ProfileDrawer';
import WarrantyScreen from '../screens/WarrantyScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import BubbleTabBar from '../components/BubbleTabBar';


import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AntDesign } from '@expo/vector-icons';
import EventGalleryScreen from '../screens/EventGalleryScreen';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


const HomeStack = () => {
  const { user } = useContext(AuthContext); // Get user info

  return (
    <Stack.Navigator
      screenOptions={({ navigation, route }) => ({
        headerStyle: {
          backgroundColor: '#4e48d9',
        },
        headerTitle: () => (
          <View style={{ alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 10 }}>
              {route.name}
            </Text>
            <Text style={{ fontSize: 14, color: '#e2e2e2', marginBottom: 10 }}>
              {user?.apartmentName || 'Your Apartment'}
            </Text>
          </View>
        ),
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginLeft: 5, padding: 10 }}
          >
            <AntDesign name="menu-unfold" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      })}
    >
      <Stack.Screen name="ApartmentList" component={ApartmentListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Maintenance" component={MaintenanceScreen} />
      <Stack.Screen name="BillPayment" component={BillPaymentScreen} />
      <Stack.Screen name="Complaint Management" component={ChatSupportScreen} />
      <Stack.Screen name="Rent" component={RentPaymentScreen} />
      <Stack.Screen name="Lease" component={LeaseDocsScreen} />
      <Stack.Screen
        name="Visitor Management"
        component={VisitorManagementScreen}
        options={{ title: 'Visitor Management' }}
      />
      <Stack.Screen name="Amenities" component={AmenitiesScreen} />
      <Stack.Screen name="Daily Activity" component={DailyActivityScreen} />
      <Stack.Screen name="Warranty" component={WarrantyScreen} />
      <Stack.Screen name="Event Gallery" component={EventGalleryScreen} />
      <Stack.Screen name="Market Place" component={MarketplaceScreen} />
      <Stack.Screen name="Community Updates" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};

const GalleryStack = () => {
  const { user } = useContext(AuthContext);
  return (
    <Stack.Navigator
      screenOptions={({ navigation, route }) => ({
        headerStyle: { backgroundColor: '#4e48d9' },
        headerTintColor: '#fff',
        headerTitle: () => (
          <View style={{ alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 10 }}>
              {route.name}
            </Text>
            <Text style={{ fontSize: 14, color: '#e2e2e2', marginBottom: 10 }}>
              {user?.apartmentName || 'Your Apartment'}
            </Text>
          </View>
        ),
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginLeft: 5, padding: 10 }}
          >
            <AntDesign name="menu-unfold" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      })}
    >
      <Stack.Screen name="Gallery" component={EventGalleryScreen} />
    </Stack.Navigator>
  );
};

const MarketplaceStack = () => {
  const { user } = useContext(AuthContext);
  return (
    <Stack.Navigator
      screenOptions={({ navigation, route }) => ({
        headerStyle: { backgroundColor: '#4e48d9' },
        headerTintColor: '#fff',
        headerTitle: () => (
          <View style={{ alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 10 }}>
              {route.name}
            </Text>
            <Text style={{ fontSize: 14, color: '#e2e2e2', marginBottom: 10 }}>
              {user?.apartmentName || 'Your Apartment'}
            </Text>
          </View>
        ),
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginLeft: 5, padding: 10 }}
          >
            <AntDesign name="menu-unfold" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      })}
    >
      <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
    </Stack.Navigator>
  );
};

const ResidentTabs = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setDrawerVisible(false));
  };

  return (
    <>
      <Tab.Navigator
        tabBar={(props) => (
          <BubbleTabBar
            {...props}
            onProfilePress={openDrawer} // 👈 pass openDrawer
          />
        )}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Gallery" component={GalleryStack} />
        <Tab.Screen name="Marketplace" component={MarketplaceStack} />
        <Tab.Screen name="Profile">
          {() => null}
        </Tab.Screen>
      </Tab.Navigator>
      <ProfileDrawer visible={drawerVisible} onClose={closeDrawer} slideAnim={slideAnim} />
    </>
  );
};

export default ResidentTabs;
