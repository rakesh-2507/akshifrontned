// 📁 WatchmanScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView,
  TouchableOpacity, Image, TextInput
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const Tab = createBottomTabNavigator();

// 🔷 Reusable Header
const Header = () => (
  <View style={styles.headerContainer}>
    <View style={styles.headerTextContainer}>
      <Text style={styles.h1}>🏢 One Hyderabad</Text>
      <Text style={styles.h3}>Welcome to your Watchman Panel</Text>
      <Text style={styles.h2}>👮 Watchman Dashboard</Text>
      <Text style={styles.h4}>Scan, validate and track visitors</Text>
    </View>
    <Ionicons name="shield-checkmark" size={34} color="white" />
  </View>
);

// 🔷 Tab 1: QR Scan
const ScanQRScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!permission) requestPermission();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    setLoading(true);

    try {
      const res = await api.post('/visitors/validate', { qrCode: data });
      setLoading(false);

      if (res.data.expired) {
        Alert.alert('⚠️ QR Expired', 'This QR code is no longer valid or already used.');
      } else {
        Alert.alert('✅ Entry Confirmed', `👤 ${res.data.visitor.name}\n🏠 Flat: ${res.data.visitor.flat_number}`);
      }
    } catch (err) {
      console.error('Scan Error:', err);
      setLoading(false);
      Alert.alert('❌ Invalid QR', err?.response?.data?.error || 'Failed to validate QR.');
    }
  };

  if (!permission) return <ActivityIndicator style={{ marginTop: 50 }} />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>Camera access required to scan QR codes.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      {scanned && (
        <View style={styles.scanAgainContainer}>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <TouchableOpacity style={styles.primaryButton} onPress={() => setScanned(false)}>
              <Text style={styles.primaryButtonText}>Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

// 🔷 Tab 2: Visitor History
const HistoryScreen = () => {
  const [visitorList, setVisitorList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/visitors/scanned');
      setVisitorList(res.data);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.headerTitle}>📋 Visitor History</Text>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : visitorList.length === 0 ? (
          <Text style={styles.emptyText}>No visitor entries yet.</Text>
        ) : (
          visitorList.map((item, index) => (
            <View key={index} style={styles.visitorCard}>
              <Text style={styles.visitorName}>👤 {item.name} ({item.flat_number})</Text>
              <Text style={styles.timeText}>🕓 {new Date(item.scanned_at).toLocaleString()}</Text>
              <Text style={styles.code}>🔑 QR Code: {item.qr_code}</Text>
              <Text style={styles.contactText}>📞 Contact: {item.contact}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

// 🔷 Tab 3: Profile
const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', contact: '' });
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      setForm({ name: res.data.name || '', contact: res.data.contact || '' });
    } catch (err) {
      console.error('Error fetching profile:', err);
      Alert.alert('Error', 'Failed to load profile information.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/auth/update', form);
      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (err) {
      console.error('Update error:', err);
      Alert.alert('Error', 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.reset({ index: 0, routes: [{ name: 'Register' }] });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <View style={styles.center}>
        <Image
          source={require('../assets/watchman-avatar.png')}
          style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 20 }}
        />
        <Text style={styles.headerTitle}>👤 Watchman Profile</Text>

        {loading ? (
          <ActivityIndicator size="large" />
        ) : editing ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact"
              value={form.contact}
              onChangeText={(text) => setForm({ ...form, contact: text })}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={saving}>
              <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditing(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: 'gray' }}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.profileItem}>Name: {user.name}</Text>
            <Text style={styles.profileItem}>Role: {user.role}</Text>
            <Text style={styles.profileItem}>Contact: {user.phone}</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setEditing(true)}>
              <Text style={styles.primaryButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, { marginTop: 20, backgroundColor: '#e74c3c' }]}
          onPress={handleLogout}
        >
          <Text style={styles.primaryButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// 🔷 Tab Navigator
const WatchmanScreen = () => {
  return (
    <Tab.Navigator
      initialRouteName="ScanQR"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'ScanQR') iconName = 'qr-code';
          else if (route.name === 'History') iconName = 'time';
          else if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4f4ada',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: { backgroundColor: '#fff', paddingBottom: 5, height: 60 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="ScanQR" component={ScanQRScreen} options={{ title: 'Scan QR' }} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#4f4ada',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTextContainer: { flex: 1 },
  h1: { fontSize: 26, fontWeight: 'bold', color: 'white' },
  h2: { fontSize: 18, fontWeight: '600', color: 'white' },
  h3: { fontSize: 14, color: 'white', marginBottom: 4 },
  h4: { fontSize: 13, color: 'white' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  emptyText: { fontSize: 16, color: 'gray', marginTop: 20 },
  visitorCard: {
    backgroundColor: '#f7f9ff',
    padding: 15,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    borderLeftWidth: 4,
    borderLeftColor: '#4f4ada',
  },
  visitorName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  timeText: { fontSize: 14, color: '#333' },
  contactText: { fontSize: 14, color: '#555' },
  code: { fontSize: 14, color: '#4f4ada' },
  primaryButton: {
    backgroundColor: '#4f4ada',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  profileItem: { fontSize: 16, marginVertical: 4 },
  scanAgainContainer: { padding: 20, alignItems: 'center' },
  permissionText: { fontSize: 16, marginBottom: 20, color: '#333' },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
});

export default WatchmanScreen;
