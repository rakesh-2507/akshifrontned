import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const RentPaymentScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pay Rent</Text>
      <Text>Current Due: ₹10,000</Text>
      <Button title="Pay Now" onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
});

export default RentPaymentScreen;
