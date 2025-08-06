import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import moment from 'moment';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const WarrantyScreen = () => {
    const { user } = useAuth();
    const [warranties, setWarranties] = useState([]);
    const [product, setProduct] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [image, setImage] = useState(null);

    useEffect(() => {
        fetchWarranties();
    }, []);

    const fetchWarranties = async () => {
        try {
            const res = await api.get('/warranty');
            setWarranties(res.data);
        } catch (err) {
            console.error('Fetch warranty error:', err.response?.data || err.message);
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled) {
                const imageUri = result.assets[0].uri;
                setImage(imageUri);
            }
        } catch (error) {
            console.error('Image pick error:', error);
        }
    };

    const handleUpload = async () => {
        if (!product || !purchaseDate || !expiryDate || !image) {
            return Alert.alert('Missing Fields', 'Please fill all fields and select an image.');
        }

        const formData = new FormData();
        formData.append('item_name', product);
        formData.append('purchase_date', purchaseDate);
        formData.append('warranty_period', expiryDate);

        const filename = image.split('/').pop();
        const match = /\.(\w+)$/.exec(filename ?? '');
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('image', {
            uri: Platform.OS === 'ios' ? image.replace('file://', '') : image,
            name: filename,
            type,
        });

        try {
            await api.post('/warranty', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setProduct('');
            setPurchaseDate('');
            setExpiryDate('');
            setImage(null);
            fetchWarranties();
        } catch (err) {
            console.error('Upload error:', err.response?.data || err.message);
            Alert.alert('Upload Failed', 'Check your API endpoint and server.');
        }
    };

    const downloadImage = async (imagePath) => {
        const uri = `http://192.168.2.21:5000/uploads/warranty/${imagePath}`;

        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                return Alert.alert('Permission Denied', 'Cannot save image without permission.');
            }

            const fileUri = FileSystem.documentDirectory + imagePath;
            const downloadResumable = FileSystem.createDownloadResumable(uri, fileUri);

            const { uri: localUri } = await downloadResumable.downloadAsync();
            const asset = await MediaLibrary.createAssetAsync(localUri);
            await MediaLibrary.createAlbumAsync('WarrantyCards', asset, false);

            Alert.alert('Download Complete', 'Image saved to your gallery.');
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Download Failed', 'Could not save the image.');
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Image
                source={{ uri: `http://192.168.2.21:5000/uploads/warranty/${item.image_path}` }}
                style={styles.image}
            />
            <Text style={styles.title}>{item.item_name}</Text>
            <Text>Purchased: {moment(item.purchase_date).format('DD MMM YYYY')}</Text>
            <Text>Warranty Until: {moment(item.warranty_period).format('DD MMM YYYY')}</Text>

            <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => downloadImage(item.image_path)}
            >
                <Text style={styles.downloadButtonText}>Download Image</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Warranty Upload</Text>

            <TextInput
                placeholder="Product Name"
                value={product}
                onChangeText={setProduct}
                style={styles.input}
            />
            <TextInput
                placeholder="Purchase Date (YYYY-MM-DD)"
                value={purchaseDate}
                onChangeText={setPurchaseDate}
                style={styles.input}
            />
            <TextInput
                placeholder="Expiry Date (YYYY-MM-DD)"
                value={expiryDate}
                onChangeText={setExpiryDate}
                style={styles.input}
            />

            <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
                <Text style={styles.imageButtonText}>
                    {image ? 'Change Image' : 'Pick Warranty Image'}
                </Text>
            </TouchableOpacity>

            {image && (
                <Image
                    source={{ uri: image }}
                    style={{ width: 100, height: 100, marginBottom: 10 }}
                />
            )}

            <Button title="Upload Warranty" onPress={handleUpload} />

            <Text style={styles.subheading}>Your Warranties</Text>
            <FlatList
                data={warranties}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 100 }}
            />
        </View>
    );
};

export default WarrantyScreen;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
    heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
    subheading: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 6,
        backgroundColor: '#fff',
    },
    imageButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 6,
        marginBottom: 10,
    },
    imageButtonText: {
        color: '#fff',
        textAlign: 'center',
    },
    card: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 6,
        borderColor: '#ddd',
        marginVertical: 8,
        backgroundColor: '#fff',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        marginVertical: 4,
    },
    image: {
        width: '100%',
        height: 150,
        borderRadius: 6,
        marginBottom: 8,
    },
    downloadButton: {
        backgroundColor: '#28a745',
        padding: 8,
        borderRadius: 5,
        marginTop: 6,
    },
    downloadButtonText: {
        color: '#fff',
        textAlign: 'center',
    },
});
