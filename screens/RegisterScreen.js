import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { register } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [apartmentName, setApartmentName] = useState('');
  const [apartmentList, setApartmentList] = useState([]);
  const [floorNumber, setFloorNumber] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('resident');

  useEffect(() => {
    if (route.params?.email) {
      setEmail(route.params.email);
    }

    const fetchApartments = async () => {
      try {
        const res = await api.get('/apartments');
        setApartmentList(res.data);
      } catch (err) {
        console.error('Failed to load apartments:', err);
      }
    };

    fetchApartments();
  }, [route.params?.email]);

  const onSubmit = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Validation', 'Please fill all the required fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation', 'Passwords do not match.');
      return;
    }

    if (role === 'resident' && (!apartmentName || !floorNumber || !flatNumber)) {
      Alert.alert('Validation', 'Please fill apartment, floor, and flat details.');
      return;
    }

    const success = await register({
      name,
      email,
      phone,
      apartmentName,
      floorNumber,
      flatNumber,
      password,
      role,
    });

    if (success) {
      Alert.alert('Success', 'Registration successful. Please login.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } else {
      Alert.alert('Error', 'Failed to register. Try again.');
    }
  };

  const Header = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.h1}>Akshi</Text>
        <View style={{ marginTop: 15 }}>
          <Text style={styles.h3}>Please fill the details to get registered</Text>
        </View>
      </View>
      <Ionicons name="home" size={32} color="white" />
    </View>
  );

  return (
    <>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          placeholder="Enter your name"
          style={styles.input}
          onChangeText={setName}
          value={name}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter your email"
          keyboardType="email-address"
          style={[styles.input, { backgroundColor: '#eee' }]}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          style={styles.input}
          onChangeText={setPhone}
          value={phone}
        />

        {role === 'resident' && (
          <>
            <Text style={styles.label}>Apartment Name</Text>
            <View style={styles.picker}>
              <Picker
                selectedValue={apartmentName}
                onValueChange={(itemValue) => setApartmentName(itemValue)}
              >
                <Picker.Item label="Select apartment" value="" />
                {apartmentList.map((name, index) => (
                  <Picker.Item key={index} label={name} value={name} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Block Number</Text>
            <TextInput
              placeholder="Enter floor number"
              keyboardType="numeric"
              style={styles.input}
              onChangeText={setFloorNumber}
              value={floorNumber}
            />

            <Text style={styles.label}>Flat Number</Text>
            <TextInput
              placeholder="Enter flat number"
              style={styles.input}
              onChangeText={setFlatNumber}
              value={flatNumber}
            />
          </>
        )}

        <Text style={styles.label}>Create Password</Text>
        <TextInput
          placeholder="Enter a strong password"
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword}
          value={password}
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          placeholder="Please Re-enter password"
          secureTextEntry
          style={styles.input}
          onChangeText={setConfirmPassword}
          value={confirmPassword}
        />

        <TouchableOpacity
          style={styles.otpButton}
          onPress={() =>
            navigation.navigate('SendOtp', {
              name,
              email,
              phone,
              apartmentName,
              floorNumber,
              flatNumber,
              password,
              confirmPassword,  // ✅ Add this line
              role,
            })
          }
        >
          <Text style={styles.otpButtonText}>Send OTP</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.switchText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
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
  headerTextContainer: {
    flex: 1,
  },
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  h3: {
    fontSize: 16,
    color: 'white',
  },
  container: {
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  picker: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  label: {
    marginBottom: 5,
    fontWeight: '500',
  },
  switchText: {
    marginTop: 15,
    textAlign: 'center',
    color: 'black',
  },
  otpButton: {
    backgroundColor: '#4f4ada',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  otpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterScreen;
