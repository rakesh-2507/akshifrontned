import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, Alert, StyleSheet } from 'react-native';
import api from '../services/api'; // your axios instance

export default function SendOtpScreen({ navigation, route }) {
  const {
    name,
    email,
    phone,
    apartmentName,
    floorNumber,
    flatNumber,
    password,
    confirmPassword,
    role,
  } = route.params;

  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!email || !phone) {
      Alert.alert('Missing Details', 'Email and phone are required to send OTP.');
      return;
    }

    if (!password || password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Sending OTP to:', { email, phone });
      const response = await api.post('/auth/send-otp', { email, phone });

      console.log('✅ OTP sent response:', response.data);
      const maskedPhone = phone.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2');

      Alert.alert('OTP Sent', `OTP has been sent to ${email} and +91-${maskedPhone}`);

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
        'Something went wrong while sending OTP.';
      Alert.alert('Failed to Send OTP', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Alert.alert(
      'Confirm',
      `Send OTP to ${email} and +91-${phone}?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
        { text: 'Send OTP', onPress: sendOtp },
      ],
      { cancelable: false }
    );
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
