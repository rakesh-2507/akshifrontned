import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, Alert, StyleSheet } from 'react-native';
import api from '../services/api'; // axios instance

export default function SendOtpScreen({ navigation, route }) {
  const {
    name,
    email,
    phone,
    apartmentName,
    floorNumber,
    flatNumber,
    password,
    role,
  } = route.params;

  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!email || !phone) {
      Alert.alert('Missing Details', 'Email and phone are required to send OTP.');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Sending OTP to:', { email, phone });
      const response = await api.post('/auth/send-otp', { email, phone });

      console.log('✅ OTP sent response:', response.data);
      Alert.alert('OTP Sent', `OTP has been sent to ${email} and +91${phone}`);

      navigation.navigate('VerifyOtp', {
        name,
        email,
        phone,
        apartmentName,
        floorNumber,
        flatNumber,
        password,
        role,
      });
    } catch (error) {
      console.error('❌ Error sending OTP:', error);
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error.message ||
        'Something went wrong while sending OTP';
      Alert.alert('Failed to Send OTP', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    sendOtp();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={{ marginTop: 15 }}>Sending OTP to {email}...</Text>
        </>
      ) : (
        <Text>Preparing to send OTP...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
});
