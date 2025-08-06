import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const bills = [
  { type: 'Electricity Bill', icon: 'flash', color: '#FFBF00' },
  { type: 'Water Bill', icon: 'water', color: '#00BFFF' },
  { type: 'Gas Bill', icon: 'flame', color: '#FF6347' },
  { type: 'Maintanence Bill', icon: 'cash', color: '#32CD32' },
];

const MaintenanceScreen = ({ navigation }) => {
  const handlePay = (billType) => {
    navigation.navigate('BillPaymentScreen', { billType });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pay Utility Bills</Text>

      {bills.map((bill, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.card, { backgroundColor: bill.color + '22' }]}
          onPress={() => handlePay(bill.type)}
        >
          <Ionicons name={bill.icon} size={32} color={bill.color} style={styles.icon} />
          <View style={styles.cardContent}>
            <Text style={styles.billType}>{bill.type}</Text>
            <Text style={styles.payText}>Tap to Pay</Text>
          </View>
        </TouchableOpacity>
      ))}

      <Text style={styles.subtext}>Your previous payments will appear here.</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, alignSelf: 'center' },
  subtext: { marginTop: 30, fontStyle: 'italic', color: '#777', alignSelf: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  icon: { marginRight: 15 },
  cardContent: { flex: 1 },
  billType: { fontSize: 18, fontWeight: '600' },
  payText: { color: '#555', marginTop: 5 },
});

export default MaintenanceScreen;
