import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import api from '../services/api';

export default function VerifyOtpScreen({ route, navigation }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const userDetails = route.params;

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP.');
      return;
    }

    const payload = { ...userDetails, otp };
    console.log('🔐 Verifying OTP with payload:', JSON.stringify({ ...userDetails, otp }, null, 2));

    // Check all required fields are present before sending
    const requiredFields = ['otp', 'email', 'name', 'phone', 'apartmentName', 'floorNumber', 'flatNumber', 'password', 'role'];
    const missingFields = requiredFields.filter(field => !payload[field]);

    if (missingFields.length > 0) {
      Alert.alert('Missing Fields', `Required: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', payload);
      console.log('✅ OTP verification response:', response.data);

      Alert.alert('Registration Successful', 'You can now log in.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error.message ||
        'Something went wrong';
      Alert.alert('Verification Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter the OTP sent to {userDetails.email}</Text>
      <TextInput
        placeholder="Enter 6-digit OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        style={styles.input}
        maxLength={6}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <Button title="Verify OTP" onPress={verifyOtp} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
});
