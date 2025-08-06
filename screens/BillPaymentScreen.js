import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';

const BillPaymentScreen = ({ route, navigation }) => {
  const { billType } = route.params;
  const [amount, setAmount] = useState('');

  const handlePay = () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    // Simulate payment success
    Alert.alert('Success', `${billType} paid successfully!`);
    setAmount('');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pay {billType}</Text>
      <TextInput
        placeholder="Enter amount"
        keyboardType="numeric"
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
      />
      <Button title="Pay Now" onPress={handlePay} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, alignSelf: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
});

export default BillPaymentScreen;
