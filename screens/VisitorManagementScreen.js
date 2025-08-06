// VisitorManagementScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Share,
  FlatList, ScrollView, Modal, Alert
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';

const VisitorManagementScreen = () => {
  const [formData, setFormData] = useState({ name: '', purpose: '', flatNumber: '', contact: '' });
  const [visitDate, setVisitDate] = useState(new Date());
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [visitorList, setVisitorList] = useState([]);
  const [activeTab, setActiveTab] = useState('form');
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [showContactsModal, setShowContactsModal] = useState(false);

  useEffect(() => {
    fetchVisitors();
    fetchContacts();
    fetchUserFlatNumber();
  }, []);

  const fetchVisitors = async () => {
    try {
      const res = await api.get('/visitors');
      setVisitorList(res.data.reverse());
    } catch (err) {
      console.error('Error fetching visitors:', err);
    }
  };

  const fetchUserFlatNumber = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userFlat = res.data.flatNumber || res.data.flat_number;
      console.log('Fetched flat number:', userFlat);

      if (userFlat) {
        setFormData(prev => ({ ...prev, flatNumber: userFlat }));
      } else {
        console.warn('User flat number is missing in response');
      }
    } catch (error) {
      console.error('Error fetching user flat number:', error);
    }
  };

  const handleContactSelect = (contact) => {
    const phone = contact?.phoneNumbers?.[0]?.number || '';
    setFormData({ ...formData, name: contact.name, contact: phone });
    setShowContactsModal(false);
  };

  const fetchContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });
      const filtered = data.filter(c => c.phoneNumbers && c.phoneNumbers.length > 0);
      setContacts(filtered);
    }
  };

  const handleGenerate = async () => {
    const { name, purpose, contact, flatNumber } = formData;

    if (!name || !purpose || !contact || !flatNumber || !startTime || !endTime) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    const qr = `${name}-${flatNumber}-${Date.now()}`;
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const startDateTime = new Date(visitDate);
    startDateTime.setHours(startTime.getHours(), startTime.getMinutes());

    const endDateTime = new Date(visitDate);
    endDateTime.setHours(endTime.getHours(), endTime.getMinutes());

    const payload = {
      name,
      purpose,
      flatNumber,
      qrCode: qr,
      numericCode: code,
      contact,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString()
    };

    console.log('Saving visitor with:', payload);

    try {
      await api.post('/visitors', payload);
      setGeneratedData(payload);
      setQrModalVisible(true);
      fetchVisitors();
    } catch (err) {
      console.error('Error saving visitor:', err);
      Alert.alert('Error', 'Failed to save visitor.');
    }
  };

  const handleShare = async () => {
    if (!generatedData) return;
    try {
      const message = `Visitor QR Code: ${generatedData.qrCode}\nOTP: ${generatedData.numericCode}`;
      await Share.share({ message });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <LinearGradient colors={["#ffffffff", "#ffffffff"]} style={{ flex: 1 }}>
      <View style={styles.fullCard}>
        <View style={styles.tabHeaderRow}>
          {['history', 'form'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
                {tab === 'history' ? 'Recent' : 'Add Manually'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContent}>
          {activeTab === 'history' ? (
            <FlatList
              data={visitorList}
              keyExtractor={(item, index) => `${item.qr_code}-${index}`}
              renderItem={({ item }) => (
                <View style={styles.visitorCard}>
                  <Text style={styles.visitorName}>{item.name} ({item.flat_number || 'N/A'})</Text>
                  <QRCode value={item.qr_code || ''} size={100} />
                  <Text style={styles.visitorOtp}>OTP: <Text style={styles.code}>{item.numeric_code}</Text></Text>
                  <Text style={styles.timeText}>From: {new Date(item.start_time).toLocaleTimeString()}</Text>
                  <Text style={styles.timeText}>To: {new Date(item.end_time).toLocaleTimeString()}</Text>
                  <Text style={styles.timeText}>Date: {new Date(item.start_time).toLocaleDateString()}</Text>
                  <Text style={styles.contactText}>Contact: {item.contact}</Text>
                </View>
              )}
            />
          ) : (
            <ScrollView contentContainerStyle={styles.formContainer}>
              <Text style={styles.visitorinfo}>Visitor Information</Text>

              <Text style={styles.inputLabel}>Visitor Name</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.inputFlex}
                  value={formData.name}
                  onChangeText={text => setFormData({ ...formData, name: text })}
                  placeholder="Enter Visitor name"
                  placeholderTextColor="#aaa"
                />
                <TouchableOpacity onPress={() => setShowContactsModal(true)}>
                  <Text style={styles.icon}>📇</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={formData.contact}
                keyboardType="phone-pad"
                onChangeText={text => setFormData({ ...formData, contact: text })}
                placeholder="Mobile Number"
                placeholderTextColor="#aaa"
              />

              <Text style={styles.inputLabel}>Purpose</Text>
              <TextInput
                style={styles.input}
                value={formData.purpose}
                onChangeText={text => setFormData({ ...formData, purpose: text })}
                placeholder="Purpose Of Visit"
                placeholderTextColor="#aaa"
              />

              <Text style={styles.inputLabel}>Expected Visit Date</Text>
              <TouchableOpacity style={styles.inputWithIcon} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.inputText}>
                  {visitDate ? `${visitDate.getDate().toString().padStart(2, '0')}/${(visitDate.getMonth() + 1).toString().padStart(2, '0')}/${visitDate.getFullYear()}` : 'dd/mm/yyyy'}
                </Text>
                <MaterialIcons name="calendar-today" size={20} color="#555" />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={visitDate}
                  mode="date"
                  display="default"
                  onChange={(e, selected) => {
                    setShowDatePicker(false);
                    if (selected) setVisitDate(selected);
                  }}
                />
              )}

              <View style={styles.timeRow}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeLabel}>From Time</Text>
                  <TouchableOpacity style={styles.inputWithIcon} onPress={() => setShowStartPicker(true)}>
                    <Text style={styles.inputText}>
                      {startTime ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:-- --'}
                    </Text>
                    <MaterialIcons name="access-time" size={20} color="#555" />
                  </TouchableOpacity>
                </View>

                <View style={styles.timeColumn}>
                  <Text style={styles.timeLabel}>To Time</Text>
                  <TouchableOpacity style={styles.inputWithIcon} onPress={() => setShowEndPicker(true)}>
                    <Text style={styles.inputText}>
                      {endTime ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:-- --'}
                    </Text>
                    <MaterialIcons name="access-time" size={20} color="#555" />
                  </TouchableOpacity>
                </View>
              </View>

              {showStartPicker && (
                <DateTimePicker
                  mode="time"
                  value={startTime || new Date()}
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowStartPicker(false);
                    if (selectedTime) setStartTime(selectedTime);
                  }}
                />
              )}
              {showEndPicker && (
                <DateTimePicker
                  mode="time"
                  value={endTime || new Date()}
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowEndPicker(false);
                    if (selectedTime) setEndTime(selectedTime);
                  }}
                />
              )}

              <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate}>
                <Text style={styles.generateText}>Generate & Save</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>

      {/* QR Code Modal */}
      {qrModalVisible && (
        <Modal animationType="fade" transparent>
          <View style={styles.modalBackdrop}>
            <BlurView intensity={100} tint="light" style={styles.qrModal}>
              <Text style={styles.modalTitle}>Visitor QR Code</Text>
              {generatedData && (
                <>
                  <QRCode value={generatedData.qrCode} size={150} />
                  <Text style={styles.visitorOtp}>OTP: <Text style={styles.code}>{generatedData.numericCode}</Text></Text>
                  <TouchableOpacity style={styles.modalBtn} onPress={handleShare}>
                    <Text style={styles.modalBtnText}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalBtn} onPress={() => {
                    setQrModalVisible(false);
                    setActiveTab('history');
                  }}>
                    <Text style={styles.modalBtnText}>Go to History</Text>
                  </TouchableOpacity>
                </>
              )}
            </BlurView>
          </View>
        </Modal>
      )}

      {showContactsModal && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.qrModal, { maxHeight: 800, maxWidth: 600, backgroundColor: '#000' }]}>
              <Text style={styles.modalTitle}>Select Contact</Text>
              <ScrollView>
                {contacts.map((contact, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={{ padding: 10, borderBottomColor: '#ccc', borderBottomWidth: 1 }}
                    onPress={() => handleContactSelect(contact)}
                  >
                    <Text style={{ color: '#000' }}>{contact.name}</Text>
                    <Text style={{ color: '#333' }}>{contact.phoneNumbers?.[0]?.number}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={() => setShowContactsModal(false)} style={styles.modalBtn}>
                <Text style={styles.modalBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fullCard: { flex: 1, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255, 255, 255)', },
  visitorinfo: {
    color: '#000', fontWeight: 'bold', fontFamily: 'Poppins-Regular', fontSize
      : 22, marginBottom: 12
  },

  body: {
    fontFamily: 'Poppins-Regular',
  },

  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 251, 251, 0.5)',
    paddingVertical: 10,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 80,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },

  activeTabButton: {
    borderBottomColor: '#5857e3',
  },
  tabButtonText: { color: '#ccc', fontWeight: 'bold' },
  activeTabButtonText: { color: '#5857e3' },
  tabContent: { flex: 1, padding: 10 },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4, // for Android shadow
    borderWidth: 1,
    borderColor: '#ddd',
  },


  inputLabel: { marginTop: 10, marginBottom: 14, fontWeight: 'bold', color: '#000',fontSize
      : 18,},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    color: '#000',
    fontSize
      : 14
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  inputFlex: { flex: 1, paddingVertical: 10, color: '#000' },
  icon: {
    fontFamily: 'Poppins-Regular', fontSize
      : 20, marginLeft: 10
  },
  generateBtn: { marginTop: 20, backgroundColor: '#5857e3', padding: 12, borderRadius: 8, alignItems: 'center' },
  generateText: { color: '#000', fontWeight: 'bold' },
  visitorCard: {
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderColor: '#ddd',
  },
  visitorName: {
    fontFamily: 'Poppins-Regular', fontSize
      : 16, fontWeight: '600', color: '#000'
  },
  visitorOtp: {
    marginVertical: 8, fontFamily: 'Poppins-Regular', fontSize
      : 16, fontWeight: '600', color: '#000'
  },
  code: {
    fontFamily: 'Poppins-Regular', fontSize
      : 18, color: '#00f2ff'
  },
  timeText: {
    fontFamily: 'Poppins-Regular', fontSize
      : 14, color: '#ccc'
  },
  contactText: {
    fontFamily: 'Poppins-Regular', fontSize
      : 14, color: '#bbb'
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  qrModal: { backgroundColor: 'rgba(255,255,255,0.25)', padding: 20, borderRadius: 20, width: 300, alignItems: 'center', borderColor: 'rgba(255,255,255,0.3)', borderWidth: 1 },
  modalTitle: {
    fontFamily: 'Poppins-Regular', fontSize
      : 18, fontWeight: 'bold', marginBottom: 15, color: '#000'
  },
  modalBtn: { marginTop: 10, backgroundColor: '#5857e3', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  modalBtnText: { color: '#000', fontWeight: 'bold' },

  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12, // or use marginRight on the first column if `gap` doesn't work
  },

  timeColumn: {
    flex: 1,
  },

  timeLabel: {
    fontFamily: 'Poppins-Regular', fontSize
      : 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 14,
    color: '#000',
    textAlign: 'left',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },

  inputText: {
    flex: 1,
    color: '#000',
    paddingVertical: 10,
  },

  timeText: {
    fontFamily: 'Poppins-Regular', fontSize
      : 18,
    color: '#333',
  },
});

export default VisitorManagementScreen;
