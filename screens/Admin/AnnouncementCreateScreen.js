import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet,
  TouchableOpacity, FlatList, Linking, ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const AnnouncementCreateScreen = () => {
  const { token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('create');
  const [form, setForm] = useState({
    title: '',
    type: 'update',
    description: '',
    image_url: '',
    pdf_url: '',
  });
  const [announcements, setAnnouncements] = useState([]);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Error fetching announcements:', err.message);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchAnnouncements();
    }
  }, [activeTab]);

  const handlePost = async () => {
    if (!form.title || !form.description || !form.type) {
      alert('Please fill all required fields.');
      return;
    }

    try {
      await api.post('/announcements', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Announcement posted!');
      setForm({
        title: '',
        type: 'update',
        description: '',
        image_url: '',
        pdf_url: '',
      });
      setActiveTab('history');
      fetchAnnouncements();
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert('Error posting announcement');
    }
  };

  const renderAnnouncement = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardTag}>{item.type.toUpperCase()}</Text>
      <Text numberOfLines={3} style={styles.cardDescription}>{item.description}</Text>
      <Text style={styles.cardDate}>Posted on: {new Date(item.posted_at).toLocaleDateString()}</Text>
      {item.image_url ? (
        <Text style={styles.link} onPress={() => Linking.openURL(item.image_url)}>View Image</Text>
      ) : null}
      {item.pdf_url ? (
        <Text style={styles.link} onPress={() => Linking.openURL(item.pdf_url)}>View PDF</Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setActiveTab('create')} style={[styles.tab, activeTab === 'create' && styles.activeTab]}>
          <Text style={styles.tabText}>Create</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('history')} style={[styles.tab, activeTab === 'history' && styles.activeTab]}>
          <Text style={styles.tabText}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Tab: Create Announcement */}
      {activeTab === 'create' && (
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={styles.label}>Title (h1):</Text>
          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={(text) => setForm({ ...form, title: text })}
          />

          <Text style={styles.label}>Tag:</Text>
          <Picker
            selectedValue={form.type}
            onValueChange={(itemValue) => setForm({ ...form, type: itemValue })}
            style={styles.picker}
          >
            <Picker.Item label="Urgent" value="urgent" />
            <Picker.Item label="Event" value="event" />
            <Picker.Item label="Rule" value="rule" />
            <Picker.Item label="Update" value="update" />
            <Picker.Item label="New" value="new" />
          </Picker>

          <Text style={styles.label}>Description:</Text>
          <TextInput
            multiline
            style={[styles.input, { height: 100 }]}
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
          />

          <Text style={styles.label}>Image URL:</Text>
          <TextInput
            style={styles.input}
            value={form.image_url}
            onChangeText={(text) => setForm({ ...form, image_url: text })}
          />

          <Text style={styles.label}>PDF URL:</Text>
          <TextInput
            style={styles.input}
            value={form.pdf_url}
            onChangeText={(text) => setForm({ ...form, pdf_url: text })}
          />

          <Button title="Post Announcement" onPress={handlePost} />
        </ScrollView>
      )}

      {/* Tab: History */}
      {activeTab === 'history' && (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAnnouncement}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { marginTop: 10, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 4,
    borderRadius: 6,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#eee',
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#007bff',
  },
  tabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardTag: {
    fontSize: 12,
    color: '#007bff',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 12,
    color: '#888',
  },
  link: {
    color: '#007bff',
    marginTop: 6,
  },
});

export default AnnouncementCreateScreen;
