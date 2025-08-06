import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const AmenitiesManagementScreen = () => {
  const { token } = useContext(AuthContext);
  const [tab, setTab] = useState('amenities');
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [availability, setAvailability] = useState('');
  const [timing, setTiming] = useState('');
  const [status, setStatus] = useState('');
  const [scalable, setScalable] = useState('false');
  const [amenities, setAmenities] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);

  useEffect(() => {
    fetchAmenities();
    fetchBookingHistory();
  }, []);

  const fetchAmenities = async () => {
    try {
      const res = await api.get('/admin/amenities', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAmenities(res.data);
    } catch (err) {
      console.error('Error fetching amenities:', err);
    }
  };

  const fetchBookingHistory = async () => {
    try {
      const res = await api.get('/admin/bookings/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookingHistory(res.data);
    } catch (err) {
      console.error('Error fetching booking history:', err);
    }
  };

  const addAmenity = async () => {
    if (!title.trim()) return Alert.alert('Error', 'Title is required');
    try {
      await api.post(
        '/admin/amenities',
        {
          title,
          image_url: imageUrl,
          description,
          availability,
          timing,
          status,
          scalable: scalable === 'true',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTitle('');
      setImageUrl('');
      setDescription('');
      setAvailability('');
      setTiming('');
      setStatus('');
      setScalable('false');
      fetchAmenities();
      Alert.alert('Success', 'Amenity added successfully');
    } catch (err) {
      console.error('Error adding amenity:', err);
      Alert.alert('Error', 'Failed to add amenity');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, tab === 'amenities' && styles.activeTab]} onPress={() => setTab('amenities')}>
          <Text style={styles.tabText}>Amenities</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'history' && styles.activeTab]} onPress={() => setTab('history')}>
          <Text style={styles.tabText}>Booking History</Text>
        </TouchableOpacity>
      </View>

      {tab === 'amenities' && (
        <FlatList
          data={amenities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.amenityItem}>
              <Text style={styles.amenityText}>🏷️ {item.title}</Text>
              <Text style={styles.subText}>📝 {item.description}</Text>
              <Text style={styles.subText}>📅 Timing: {item.timing}</Text>
              <Text style={styles.subText}>✅ Availability: {item.availability}</Text>
              <Text style={styles.subText}>⚙️ Status: {item.status}</Text>
              <Text style={styles.subText}>📈 Scalable: {item.scalable ? 'Yes' : 'No'}</Text>
            </View>
          )}
          ListHeaderComponent={
            <>
              <Text style={styles.title}>Add New Amenity</Text>
              <TextInput value={title} onChangeText={setTitle} placeholder="Title" style={styles.input} />
              <TextInput value={imageUrl} onChangeText={setImageUrl} placeholder="Image URL" style={styles.input} />
              <TextInput value={description} onChangeText={setDescription} placeholder="Description" style={[styles.input, { height: 80 }]} multiline />
              <TextInput value={availability} onChangeText={setAvailability} placeholder="Availability" style={styles.input} />
              <TextInput value={timing} onChangeText={setTiming} placeholder="Timing" style={styles.input} />
              <TextInput value={status} onChangeText={setStatus} placeholder="Status" style={styles.input} />
              <Text style={styles.label}>Is Scalable?</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={scalable} onValueChange={setScalable} style={styles.picker}>
                  <Picker.Item label="No" value="false" />
                  <Picker.Item label="Yes" value="true" />
                </Picker>
              </View>
              <TouchableOpacity onPress={addAmenity} style={styles.button}>
                <Text style={styles.buttonText}>Add Amenity</Text>
              </TouchableOpacity>
              <Text style={styles.listTitle}>Amenities List</Text>
            </>
          }
        />
      )}

      {tab === 'history' && (
        <FlatList
          data={bookingHistory}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.amenityItem}>
              <Text>🧑 User: {item.user_name}</Text>
              <Text>🏷️ Amenity: {item.amenity_title}</Text>
              <Text>📅 From: {item.start_date}</Text>
              <Text>📅 To: {item.end_date}</Text>
              <Text>✅ Status: {item.status}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { borderColor: '#ccc', borderWidth: 1, padding: 10, borderRadius: 8, marginBottom: 10 },
  button: { backgroundColor: '#007BFF', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  amenityItem: { backgroundColor: '#f1f1f1', padding: 12, borderRadius: 8, marginBottom: 10 },
  amenityText: { fontWeight: 'bold', fontSize: 16 },
  subText: { fontSize: 13, color: '#666' },
  label: { fontWeight: 'bold', marginBottom: 4 },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 12 },
  picker: { height: 50, width: '100%' },
  tabContainer: { flexDirection: 'row', marginBottom: 12 },
  tab: { flex: 1, padding: 12, backgroundColor: '#ccc', alignItems: 'center', borderRadius: 5 },
  activeTab: { backgroundColor: '#007BFF' },
  tabText: { color: '#fff', fontWeight: 'bold' },
  listTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
});

export default AmenitiesManagementScreen;
