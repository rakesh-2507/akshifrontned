import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import {
  fetchProfileData,
  addFamily,
  addDailyHelp,
  addVehicle,
  addPet,
  addUser, // You must implement this in your profileService.js
} from '../services/profileService';

const Section = ({ title, data, onAddPress, renderItem }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onAddPress}>
        <Feather name="plus-circle" size={20} color="#6C63FF" />
      </TouchableOpacity>
    </View>
    {data.length > 0 ? data.map(renderItem) : (
      <Text style={styles.emptyText}>No {title.toLowerCase()} added yet</Text>
    )}
  </View>
);

const HouseholdScreen = () => {
  const { token } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [activeTab, setActiveTab] = useState('AddMember'); // 'AddUser' or 'AddMember'

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setRefreshing(true);
      const data = await fetchProfileData(token);
      setProfileData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleChange = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (modalType === 'Family') {
        if (activeTab === 'AddUser') {
          await addUser(formData, token); // Implement this in backend + service
        } else {
          await addFamily(formData, token);
        }
      } else if (modalType === 'Daily Help') {
        await addDailyHelp(formData, token);
      } else if (modalType === 'Vehicles') {
        await addVehicle(formData, token);
      } else if (modalType === 'Pets') {
        await addPet(formData, token);
      }

      setModalVisible(false);
      setFormData({});
      fetchAll();
    } catch (err) {
      alert('Error saving data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Section
          title="Family"
          data={profileData.family || []}
          onAddPress={() => {
            setModalType('Family');
            setActiveTab('AddMember');
            setModalVisible(true);
          }}
          renderItem={(item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardText}>DOB: {item.dob}</Text>
              <Text style={styles.cardText}>Gender: {item.gender}</Text>
            </View>
          )}
        />
        <Section
          title="Daily Help"
          data={profileData.dailyHelps || []}
          onAddPress={() => { setModalType('Daily Help'); setModalVisible(true); }}
          renderItem={(item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{item.service}</Text>
            </View>
          )}
        />
        <Section
          title="Vehicles"
          data={profileData.vehicles || []}
          onAddPress={() => { setModalType('Vehicles'); setModalVisible(true); }}
          renderItem={(item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{item.type} - {item.number}</Text>
              <Text style={styles.cardText}>RC: {item.rc}</Text>
            </View>
          )}
        />
        <Section
          title="Pets"
          data={profileData.pets || []}
          onAddPress={() => { setModalType('Pets'); setModalVisible(true); }}
          renderItem={(item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{item.type}</Text>
              <Text style={styles.cardText}>Count: {item.count}</Text>
            </View>
          )}
        />
      </ScrollView>

      {/* Fullscreen Modal for Family */}
      {modalVisible && modalType === 'Family' && (
        <Modal animationType="slide" transparent={false} visible={modalVisible}>
          <View style={styles.fullscreenModal}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#444" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderText}>Add Family</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'AddUser' && styles.tabActive]}
                onPress={() => setActiveTab('AddUser')}
              >
                <Text style={styles.tabText}>Add New User</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'AddMember' && styles.tabActive]}
                onPress={() => setActiveTab('AddMember')}
              >
                <Text style={styles.tabText}>Add Family Member</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }}>
              {activeTab === 'AddUser' && (
                <>
                  <TextInput placeholder="Full Name" style={styles.input} onChangeText={(t) => handleChange('name', t)} />
                  <TextInput placeholder="Email" style={styles.input} keyboardType="email-address" onChangeText={(t) => handleChange('email', t)} />
                  <TextInput placeholder="Phone Number" style={styles.input} keyboardType="phone-pad" onChangeText={(t) => handleChange('phone', t)} />
                  <TextInput placeholder="Apartment Name" style={styles.input} onChangeText={(t) => handleChange('apartmentname', t)} />
                  <TextInput placeholder="Block Number" style={styles.input} onChangeText={(t) => handleChange('floor_number', t)} />
                  <TextInput placeholder="Flat Number" style={styles.input} onChangeText={(t) => handleChange('flat_number', t)} />
                  <TextInput placeholder="Password" secureTextEntry style={styles.input} onChangeText={(t) => handleChange('password', t)} />
                </>
              )}

              {activeTab === 'AddMember' && (
                <>
                  <TextInput placeholder="Full Name" style={styles.input} onChangeText={(t) => handleChange('name', t)} />
                  <TextInput placeholder="Date of Birth" style={styles.input} onChangeText={(t) => handleChange('dob', t)} />
                  <TextInput placeholder="Gender" style={styles.input} onChangeText={(t) => handleChange('gender', t)} />
                  <TextInput placeholder="Mobile" keyboardType="phone-pad" style={styles.input} onChangeText={(t) => handleChange('mobile', t)} />
                  <TextInput placeholder="Email" keyboardType="email-address" style={styles.input} onChangeText={(t) => handleChange('email', t)} />
                </>
              )}

              <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default HouseholdScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  sectionCard: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 12,
    borderRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  emptyText: { color: '#888', fontStyle: 'italic' },
  card: { marginBottom: 10 },
  cardTitle: { fontWeight: 'bold' },
  cardText: { color: '#555' },

  fullscreenModal: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    padding: 15, borderBottomWidth: 1, borderColor: '#eee'
  },
  modalHeaderText: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f5f5f5',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    color: '#444',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderColor: '#6C63FF',
  },

  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    marginBottom: 12, fontSize: 14,
  },
  submitBtn: {
    backgroundColor: '#6C63FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
  },
});
