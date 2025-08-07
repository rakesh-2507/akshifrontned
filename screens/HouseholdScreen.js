import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Modal,
} from 'react-native';
import { Feather, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';

import { AuthContext } from '../context/AuthContext';
import {
  fetchProfileData,
  addFamily,
  addDailyHelp,
  addVehicle,
  addPet,
  addUser,
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
  const { token, user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [activeTab, setActiveTab] = useState('AddMember');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: '#4e48d9' },
      headerTintColor: '#fff',
      headerTitleAlign: 'left',
      headerTitle: () => (
        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>{route.name}</Text>
          <Text style={{ fontSize: 12, color: '#e2e2e2' }}>{user?.apartmentName || 'Your Apartment'}</Text>
        </View>
      ),
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
          <AntDesign name="menu-unfold" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, route, user]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setRefreshing(true);
      const data = await fetchProfileData(token);
      setProfileData(data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleChange = (key, val) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
    setFormData({});

    if (type === 'Family' && activeTab === 'AddUser') {
      setFormData(prev => ({
        ...prev,
        apartmentname: profileData?.apartment?.apartmentname || '',
        floor_number: profileData?.apartment?.floor_number || '',
        flat_number: profileData?.apartment?.flat_number || '',
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (modalType === 'Family') {
        if (activeTab === 'AddUser') {
          await addUser(formData, token);
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

  const renderFormInputs = () => {
    switch (modalType) {
      case 'Daily Help':
        return (
          <>
            <Text style={styles.label}>Service</Text>
            <TextInput style={styles.input} placeholder="Service" onChangeText={(t) => handleChange('service', t)} />
          </>
        );
      case 'Vehicles':
        return (
          <>
            <Text style={styles.label}>Type (e.g. Car, Bike)</Text>
            <TextInput style={styles.input} placeholder="Type" onChangeText={(t) => handleChange('type', t)} />

            <Text style={styles.label}>Number</Text>
            <TextInput style={styles.input} placeholder="Number" onChangeText={(t) => handleChange('number', t)} />

            <Text style={styles.label}>RC Number</Text>
            <TextInput style={styles.input} placeholder="RC Number" onChangeText={(t) => handleChange('rc', t)} />

            <Text style={styles.label}>License Number</Text>
            <TextInput style={styles.input} placeholder="License Number" onChangeText={(t) => handleChange('license', t)} />
          </>
        );
      case 'Pets':
        return (
          <>
            <Text style={styles.label}>Type (e.g. Dog, Cat)</Text>
            <TextInput style={styles.input} placeholder="Type" onChangeText={(t) => handleChange('type', t)} />

            <Text style={styles.label}>Count</Text>
            <TextInput style={styles.input} placeholder="Count" keyboardType="numeric" onChangeText={(t) => handleChange('count', t)} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Section
          title="Family"
          data={profileData.family || []}
          onAddPress={() => {
            setActiveTab('AddMember');
            openModal('Family');
          }}
          renderItem={(item, index) => (
            <View key={item.id || index} style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardText}>DOB: {item.dob}</Text>
              <Text style={styles.cardText}>Gender: {item.gender}</Text>
            </View>
          )}
        />

        <Section
          title="Daily Help"
          data={profileData.dailyHelp || []}
          onAddPress={() => openModal('Daily Help')}
          renderItem={(item, index) => (
            <View key={item.id || index} style={styles.card}>
              <Text style={styles.cardTitle}>{item.service}</Text>
            </View>
          )}
        />

        <Section
          title="Vehicles"
          data={profileData.vehicles || []}
          onAddPress={() => openModal('Vehicles')}
          renderItem={(item, index) => (
            <View key={item.id || index} style={styles.card}>
              <Text style={styles.cardTitle}>{item.type} - {item.number}</Text>
              <Text style={styles.cardText}>RC: {item.rc}</Text>
              <Text style={styles.cardText}>License: {item.license}</Text>
            </View>
          )}
        />

        <Section
          title="Pets"
          data={profileData.pets || []}
          onAddPress={() => openModal('Pets')}
          renderItem={(item, index) => (
            <View key={item.id || index} style={styles.card}>
              <Text style={styles.cardTitle}>{item.type}</Text>
              <Text style={styles.cardText}>Count: {item.count}</Text>
            </View>
          )}
        />
      </ScrollView>

      <Modal animationType="slide" transparent={false} visible={modalVisible}>
        <View style={styles.fullscreenModal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#444" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderText}>Add {modalType}</Text>
          </View>

          {modalType === 'Family' ? (
            <>
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'AddUser' && styles.tabActive]}
                  onPress={() => {
                    setActiveTab('AddUser');
                    setFormData({
                      apartmentname: profileData?.apartment?.apartmentname || '',
                      floor_number: profileData?.apartment?.floor_number || '',
                      flat_number: profileData?.apartment?.flat_number || '',
                    });
                  }}
                >
                  <Text style={styles.tabText}>Add New User</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'AddMember' && styles.tabActive]}
                  onPress={() => {
                    setActiveTab('AddMember');
                    setFormData({});
                  }}
                >
                  <Text style={styles.tabText}>Add Family Member</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ padding: 20 }}>
                {activeTab === 'AddUser' ? (
                  <>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput style={styles.input} placeholder="Full Name" onChangeText={(t) => handleChange('name', t)} />

                    <Text style={styles.label}>Email</Text>
                    <TextInput style={styles.input} keyboardType="email-address" placeholder="Email" onChangeText={(t) => handleChange('email', t)} />

                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput style={styles.input} keyboardType="phone-pad" placeholder="Phone Number" onChangeText={(t) => handleChange('phone', t)} />

                    <Text style={styles.label}>Apartment Name</Text>
                    <TextInput style={styles.input} placeholder="Apartment Name" value={formData.apartmentname} onChangeText={(t) => handleChange('apartmentname', t)} />

                    <Text style={styles.label}>Block Number</Text>
                    <TextInput style={styles.input} placeholder="Block Number" value={formData.floor_number} onChangeText={(t) => handleChange('floor_number', t)} />

                    <Text style={styles.label}>Flat Number</Text>
                    <TextInput style={styles.input} placeholder="Flat Number" value={formData.flat_number} onChangeText={(t) => handleChange('flat_number', t)} />

                    <Text style={styles.label}>Password</Text>
                    <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={(t) => handleChange('password', t)} />
                  </>
                ) : (
                  <>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput style={styles.input} placeholder="Full Name" onChangeText={(t) => handleChange('name', t)} />

                    <Text style={styles.label}>Date of Birth</Text>
                    <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                      <Text style={{ color: formData.dob ? '#000' : '#aaa' }}>
                        {formData.dob || 'Select Date of Birth'}
                      </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                      <DateTimePicker
                        value={formData.dob ? new Date(formData.dob) : new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) {
                            const formatted = selectedDate.toISOString().split('T')[0];
                            handleChange('dob', formatted);
                          }
                        }}
                      />
                    )}

                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.input}>
                      <Picker
                        selectedValue={formData.gender || ''}
                        onValueChange={(value) => handleChange('gender', value)}
                        style={{ height: 20 }}
                      >
                        <Picker.Item label="Select Gender" value="" />
                        <Picker.Item label="Male" value="Male" />
                        <Picker.Item label="Female" value="Female" />
                        <Picker.Item label="Other" value="Other" />
                      </Picker>
                    </View>

                    <Text style={styles.label}>Mobile</Text>
                    <TextInput style={styles.input} keyboardType="phone-pad" placeholder="Mobile" onChangeText={(t) => handleChange('mobile', t)} />

                    <Text style={styles.label}>Email</Text>
                    <TextInput style={styles.input} keyboardType="email-address" placeholder="Email" onChangeText={(t) => handleChange('email', t)} />
                  </>
                )}

                <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit</Text>}
                </TouchableOpacity>
              </ScrollView>
            </>
          ) : (
            <ScrollView style={{ padding: 20 }}>
              {renderFormInputs()}
              <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit</Text>}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>
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
  label: {
    marginBottom: 4,
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },

});
