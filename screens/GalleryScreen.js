import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext'; // ✅ Import context

const GalleryScreen = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext); // ✅ Get logged-in user

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await api.get('/gallery');
      setImages(res.data);
    } catch (err) {
      console.error('Fetch error:', err?.response?.data || err.message);
      Alert.alert('Error', 'Failed to fetch images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const image = result.assets[0];
      const formData = new FormData();
      const filename = image.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename ?? '');
      const type = match ? `image/${match[1]}` : 'image';

      formData.append('image', {
        uri: image.uri,
        name: filename,
        type,
      });

      try {
        await api.post('/gallery', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        Alert.alert('Success', 'Image uploaded successfully');
        fetchGallery();
      } catch (err) {
        console.error('Upload error:', err?.response?.data || err.message);
        Alert.alert('Error', 'Failed to upload image');
      }
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: `http://192.168.2.21:5000/uploads/gallery/${item.image_path}` }}
        style={styles.image}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ✅ Only show upload button for admin */}
      {user?.role === 'admin' && (
        <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
          <Ionicons name="cloud-upload" size={24} color="white" />
          <Text style={styles.uploadText}>Upload Image</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  uploadBtn: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: { color: 'white', marginLeft: 8 },
  card: {
    width: '48%',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
    elevation: 2,
    backgroundColor: '#eee',
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
});

export default GalleryScreen;
