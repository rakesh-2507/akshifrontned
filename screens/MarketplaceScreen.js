import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  Dimensions,
  Modal,
  SafeAreaView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import moment from 'moment';

const screenWidth = Dimensions.get('window').width;

const MarketplaceScreen = () => {
  const { user, token } = useAuth();
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [items, setItems] = useState([]); // Ensure initial state is an empty array

  const [newItem, setNewItem] = useState({
    item_name: '',
    price: '',
    description: '',
    type: 'sale',
    category: 'Tech',
    location: '',
    image: null,
  });

  const tabs = [
    { label: 'All', value: 'all' },
    { label: 'For Sale', value: 'sale' },
    { label: 'Rentals', value: 'rentals' },
    { label: 'Services', value: 'services' },
  ];

  const categories = [
    { label: 'All', value: 'All' },
    { label: 'Tech', value: 'Tech' },
    { label: 'Furniture', value: 'Furniture' },
    { label: 'Books', value: 'Books' },
    { label: 'Fashion', value: 'Fashion' },
  ];


  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get('/marketplace');
      setItems(res.data || []);
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setItems([]); // Ensure it's an array to prevent filter crash
    }
  };

  const handleAddProduct = async () => {
    const { item_name, price, description, type, category, location, image } = newItem;

    if (!image || !item_name || !price || !description) {
      Alert.alert('Error', 'All required fields must be filled');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('item_name', item_name);
      formData.append('price', price);
      formData.append('description', description);
      formData.append('type', type);
      formData.append('category', category);
      formData.append('location', location);

      const localUri = image.uri;
      const filename = localUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const mimeType = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('image', {
        uri: localUri,
        name: filename,
        type: mimeType,
      });

      const res = await api.post('/marketplace/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Success', 'Product added successfully');
      setItems([res.data.item, ...items]);
      setModalVisible(false);
      setNewItem({
        item_name: '',
        price: '',
        description: '',
        type: 'sale',
        category: 'Tech',
        location: '',
        image: null,
      });
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Unknown error';
      Alert.alert('Error', message);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Please grant camera roll access');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]) {
      const selected = result.assets[0];
      setNewItem({ ...newItem, image: selected });
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor:
            item.type === 'rentals' ? '#FFE8C8'
              : item.type === 'services' ? '#E1F3F8'
                : '#D9EDFF',
          position: 'relative',
        },
      ]}
    >
      {/* Label */}
      <Text
        style={[
          styles.label,
          {
            backgroundColor:
              item.type === 'rentals' ? '#1E88E5'
                : item.type === 'services' ? '#00BCD4'
                  : '#00C853',
          },
        ]}
      >
        {item.type === 'rentals'
          ? 'FOR RENT'
          : item.type === 'services'
            ? 'SERVICE'
            : 'FOR SALE'}
      </Text>

      {/* Price top-right */}
      <View style={{ position: 'absolute', top: 16, right: 16 }}>
        <Text style={[styles.price, { fontSize: 20, color: '#acacac' }]}>{`₹${item.price}`}</Text>
      </View>

      {/* Image Centered */}
      {item.image_path && (
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
          <Image
            source={{ uri: item.image_path }}
            style={{ width: 100, height: 100, borderRadius: 10 }}
            resizeMode="cover"
          />
        </View>
      )}


      {/* Footer Section */}
      <View style={styles.footerContainer}>
        <Text style={styles.itemTitle}>{item.item_name}</Text>
        <Text style={styles.desc}>{item.description}</Text>

        <View style={styles.footerRow}>
          <Text style={styles.location}>{user?.name || 'You'}</Text>
          <Text style={styles.time}>{moment(item.created_at).fromNow()}</Text>
        </View>

        <TouchableOpacity style={styles.contactBtn}>
          <Text style={styles.contactText}>Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredItems = Array.isArray(items)
    ? items.filter(
      i =>
        (selectedTab === 'all' || i.type === selectedTab) &&
        (selectedCategory === 'All' || i.category === selectedCategory)
    )
    : [];

  return (
    <View style={styles.container}>
      <Text style={styles.mainHeader}>Marketplace</Text>
      <Text style={styles.subHeader}>Buy, sell & rent nearby</Text>

      <TextInput style={styles.searchBox} placeholder="Search marketplace..." />

      <View style={styles.tabRow}>
        {tabs.map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            style={[styles.tabBtn, selectedTab === value && styles.tabBtnActive]}
            onPress={() => setSelectedTab(value)}
          >
            <Text style={[styles.tabText, selectedTab === value && styles.tabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>


      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {categories.map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            style={[styles.categoryChip, selectedCategory === value && styles.activeCategoryChip]}
            onPress={() => setSelectedCategory(value)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === value && styles.activeCategoryText,
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>


      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 250 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No items found.</Text>}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal animationType="slide" visible={modalVisible} presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={styles.modalHeader}>Add New Product</Text>

            <Text style={styles.labelTitle}>Type</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={newItem.type}
                onValueChange={val => setNewItem({ ...newItem, type: val })}
              >
                <Picker.Item label="For Sale" value="sale" />
                <Picker.Item label="Rentals" value="rentals" />
                <Picker.Item label="Services" value="services" />
              </Picker>
            </View>

            <Text style={styles.labelTitle}>Category</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={newItem.category}
                onValueChange={val => setNewItem({ ...newItem, category: val })}
              >
                <Picker.Item label="Tech" value="Tech" />
                <Picker.Item label="Furniture" value="Furniture" />
                <Picker.Item label="Books" value="Books" />
                <Picker.Item label="Fashion" value="Fashion" />
              </Picker>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Item Name"
              value={newItem.item_name}
              onChangeText={text => setNewItem({ ...newItem, item_name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              keyboardType="numeric"
              value={newItem.price}
              onChangeText={text => setNewItem({ ...newItem, price: text })}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Description"
              multiline
              value={newItem.description}
              onChangeText={text => setNewItem({ ...newItem, description: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Location (optional)"
              value={newItem.location}
              onChangeText={text => setNewItem({ ...newItem, location: text })}
            />

            {newItem.image && (
              <Image
                source={{ uri: newItem.image.uri }}
                style={{ width: '100%', height: 180, borderRadius: 10, marginBottom: 10 }}
              />
            )}

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              <Text style={styles.imagePickerText}>
                {newItem.image ? '✅ Change Image' : 'Upload Product Image'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddProduct}>
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#999' }}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};



const styles = StyleSheet.create({
  // === Container and Header ===
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  mainHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 16,
  },
  subHeader: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  // === Search and Tabs ===
  searchBox: {
    marginHorizontal: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  tabBtn: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 30,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  tabBtnActive: {
    backgroundColor: '#6C63FF',
    borderWidth: 2,
    borderColor: '#FFD93D',
  },
  tabText: {
    fontSize: 14,
    color: '#333',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // === Category Filter Chips ===
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap', // allows wrapping to next line
    gap: 8, // if using React Native >= 0.71
    paddingBottom: 16,

  },

  categoryChip: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 30,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  activeCategoryChip: {
    backgroundColor: '#4A47A3',
  },

  categoryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  activeCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },

  // === Card ===
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
    marginHorizontal: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },

  label: {
    alignSelf: 'flex-start',
    backgroundColor: '#6C63FF',
    color: '#fff',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },

  // === Images ===
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 10,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  // === Item Info ===
  price: {
    color: '#6958F6',
    fontWeight: 'bold',
    fontSize: 18,
    marginVertical: 4,
  },

  // === Buttons ===
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#6C63FF',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  // === Modal Form ===
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 14,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    marginBottom: 14,
    overflow: 'hidden',
  },
  labelTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 6,
    marginTop: 12,
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: '#6C63FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 8,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
  },
  itemTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 4,
  },
  desc: {
    fontSize: 15,
    color: '#444',
    marginTop: 4,
  },
  location: {
    fontSize: 16,
    color: '#555',
    marginTop: '10',
  },
  time: {
    fontSize: 14,
    color: '#999',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  contactBtn: {
    backgroundColor: '#1E88E5',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    margin: 10,
  },
  contactText: {
    color: '#fff',
    fontWeight: 'bold',
  },

});

export default MarketplaceScreen;
