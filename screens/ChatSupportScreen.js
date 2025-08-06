// ChatSupportScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { raiseComplaint, getMyComplaints } from '../services/chatService';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const ChatSupportScreen = () => {
  const [activeTab, setActiveTab] = useState('raise');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchComplaints();
    }, [])
  );
  const fetchComplaints = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const data = await getMyComplaints(token);
      setAllComplaints(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImagePick = async () => {
    if (images.length >= 3) {
      Alert.alert('Limit reached', 'You can only upload up to 3 images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleSubmit = async () => {
    if (!type || !description) {
      Alert.alert('Required', 'Please select complaint type and enter description.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const newComplaint = {
        type,
        description,
        images,
      };
      const saved = await raiseComplaint(newComplaint, token);
      setAllComplaints([saved, ...allComplaints]);
      setType('');
      setDescription('');
      setImages([]);
      Alert.alert('Success', 'Complaint submitted successfully.');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit complaint.');
    }
  };

  const filteredComplaints = (status) =>
    allComplaints.filter((c) => c.status === status);

  const renderComplaint = ({ item }) => (
    <View style={styles.complaintItem}>
      <Text style={{ fontWeight: 'bold' }}>{item.type.toUpperCase()}</Text>
      <Text>{item.description}</Text>
      {item.images?.map((img, idx) => (
        <Image
          key={idx}
          source={{ uri: img }}
          style={{ width: 80, height: 80, marginTop: 5, borderRadius: 5 }}
        />
      ))}
      <Text style={styles.complaintType}>Status: {item.status}</Text>
      {item.response && (
        <Text style={{ marginTop: 4, color: '#0072ff' }}>Admin Response: {item.response}</Text>
      )}
    </View>
  );

  const renderRaiseTab = () => (
    <View>
      {/* 👇 Raise Complaint Form Card */}
      <View style={styles.formCard}>
        <Text style={styles.subHeader}>Raise a Complaint</Text>

        <Text style={styles.label}>Complaint Type</Text>
        <View style={styles.dropdownContainer}>
          <Picker
            selectedValue={type}
            onValueChange={(itemValue) => setType(itemValue)}
            style={styles.picker}
            dropdownIconColor="#000"
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="Select Type" value="" style={styles.pickerItem} />
            <Picker.Item label="Apartment" value="apartment" style={styles.pickerItem} />
            <Picker.Item label="Electricity" value="electricity" style={styles.pickerItem} />
            <Picker.Item label="Water" value="water" style={styles.pickerItem} />
            <Picker.Item label="Maintenance" value="maintenance" style={styles.pickerItem} />
            <Picker.Item label="Flat" value="flat" style={styles.pickerItem} />
          </Picker>
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput
          placeholder="Describe your complaint..."
          style={styles.input}
          multiline
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Add Photos (Max 3)</Text>
        <View>
          <View style={styles.imageRow}>
            {images.map((img, index) => (
              <Image key={index} source={{ uri: img }} style={styles.imagePreview} />
            ))}
            {images.length < 3 && (
              <TouchableOpacity onPress={handleImagePick} style={styles.addImageButton}>
                <Ionicons name="add" size={24} color="#555" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.imageLimitText}>You can add up to 3 images</Text>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Complaint</Text>
        </TouchableOpacity>
      </View>

      {/* 👇 Recent Complaints Card */}
      <View style={styles.recentCard}>
        <Text style={styles.recentHeader}>Recent Complaints</Text>
        {allComplaints.length === 0 ? (
          <Text style={styles.recentEmpty}>No complaints yet.</Text>
        ) : (
          allComplaints.slice(0, 3).map((item) => (
            <View key={item.id} style={styles.recentItem}>
              <Text style={{ fontWeight: 'bold' }}>{item.type.toUpperCase()}</Text>
              <Text numberOfLines={2} style={{ color: '#555' }}>{item.description}</Text>
              <Text
                style={{
                  fontSize: 12,
                  color: item.status === 'pending' ? 'red' : item.status === 'closed' ? 'green' : 'gray',
                  fontWeight: '600',
                }}
              >
                Status: {item.status}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'raise':
        return renderRaiseTab();
      case 'pending':
        return (
          <FlatList
            data={filteredComplaints('pending')}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderComplaint}
            ListEmptyComponent={<Text>No pending complaints.</Text>}
          />
        );
      case 'closed':
        return (
          <FlatList
            data={filteredComplaints('closed')}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderComplaint}
            ListEmptyComponent={<Text>No closed complaints.</Text>}
          />
        );
      case 'all':
        return (
          <FlatList
            data={allComplaints}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderComplaint}
            ListEmptyComponent={<Text>No complaints available.</Text>}
          />
        );
      default:
        return null;
    }
  };

  const TabButton = ({ label, value }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === value && styles.activeTabButton]}
      onPress={() => setActiveTab(value)}
    >
      <Text style={activeTab === value ? styles.activeTabText : styles.tabText}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.mainCard}>
        {/* Tab Buttons */}
        <View style={styles.tabsCard}>
          <TabButton label="Raise" value="raise" />
          <TabButton label="All" value="all" />
          <TabButton label="Pending" value="pending" />
          <TabButton label="Closed" value="closed" />
        </View>

        {/* ✅ This is the fix */}
        <View style={styles.contentCard}>
          {renderTabContent()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#4f4ada',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: { flex: 1 },
  h1: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: 'white',
    marginBottom: 8,
  },
  h2: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: 'white',
    marginBottom: 8,
  },
  h3: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
  },
  h4: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: 'white',
    marginBottom: 8,
  },
  tabBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    backgroundColor: '#e6f0ec',
    paddingVertical: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#ccc',
    margin: 4,
  },
  activeTabButton: { backgroundColor: '#4f4ada' },
  tabText: {
    color: 'black',
    fontFamily: 'Poppins-Regular',
  },
  activeTabText: {
    color: 'white',
    fontFamily: 'Poppins-Bold',
  },
  tabContent: {
    flex: 1,
    padding: 16,
    fontFamily: 'Poppins-Regular',
  },
  subHeader: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    marginBottom: 12,
  },
  label: {
    marginTop: 10,
    fontFamily: 'Poppins-Bold',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  chip: {
    backgroundColor: '#ddd',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#4f4ada',
  },
  chipText: {
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    height: 80,
    marginTop: 5,
    fontFamily: 'Poppins-Regular',
  },
  imageRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 8,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#4f4ada',
    padding: 12,
    borderRadius: 6,
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '400',
    fontFamily: 'Poppins-Bold',
  },
  complaintItem: {
    padding: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 6,
    marginVertical: 6,
  },
  complaintType: {
    marginTop: 4,
    fontSize: 12,
    color: 'gray',
    fontFamily: 'Poppins-Regular',
  },
  screen: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 12,
  },
  mainCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabsCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
  },
  imageLimitText: {
    marginTop: 6,
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
    fontFamily: 'Poppins-Regular',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    width: '100%',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  pickerItem: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  recentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginTop: 0,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recentHeader: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 6,
    fontFamily: 'Poppins-Bold',
  },
  recentEmpty: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  },
  recentItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
});

export default ChatSupportScreen;
