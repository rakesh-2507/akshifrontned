import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, setUser, token } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    flatNumber: '',
  });

  // Fetch fresh user data on screen load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
        setForm({
          name: res.data.name || '',
          phone: res.data.phone || '',
          flatNumber: res.data.flatNumber || '',
        });
      } catch (err) {
        console.error('Failed to load profile:', err.response?.data || err.message);
        Alert.alert('Error', 'Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const res = await api.put(
        '/auth/update',
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(res.data);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message);
      Alert.alert('Error', 'Could not update profile');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5857e3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>👤 Profile</Text>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Name:</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(val) => setForm({ ...form, name: val })}
          />
        ) : (
          <Text style={styles.value}>{user?.name}</Text>
        )}

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user?.email}</Text>

        <Text style={styles.label}>Mobile:</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={form.phone}
            onChangeText={(val) => setForm({ ...form, phone: val })}
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.value}>{user?.phone}</Text>
        )}

        <Text style={styles.label}>Flat Number:</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={form.flatNumber}
            onChangeText={(val) => setForm({ ...form, flatNumber: val })}
          />
        ) : (
          <Text style={styles.value}>{user?.flatNumber}</Text>
        )}

        <Text style={styles.label}>Role:</Text>
        <Text style={styles.value}>{user?.role}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={editing ? handleSave : () => setEditing(true)}
      >
        <Text style={styles.buttonText}>{editing ? 'Save' : 'Edit'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f7f7f7' },
  backButton: { marginBottom: 10, alignSelf: 'flex-start' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },
  label: { fontSize: 16, color: '#555', marginTop: 10 },
  value: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  input: {
    fontSize: 18,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 5,
    color: '#000',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#5857e3',
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: { textAlign: 'center', color: '#fff', fontSize: 16, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ProfileScreen;
