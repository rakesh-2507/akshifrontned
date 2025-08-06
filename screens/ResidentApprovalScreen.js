// screens/ResidentApprovalScreen.js
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { fetchPendingResidents, approveResident } from '../services/adminService';

const ResidentApprovalScreen = () => {
  const { token } = useContext(AuthContext);
  const [pendingResidents, setPendingResidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingResidents();
  }, []);

  const loadPendingResidents = async () => {
    try {
      setLoading(true);
      const users = await fetchPendingResidents(token);
      setPendingResidents(users);
    } catch (err) {
      console.error('Error fetching pending residents:', err);
      Alert.alert('Error', 'Failed to fetch pending residents');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await approveResident(userId, token);
      Alert.alert('Success', 'Resident approved successfully');
      loadPendingResidents();
    } catch (err) {
      console.error('Error approving resident:', err);
      Alert.alert('Error', 'Failed to approve resident');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text>Email: {item.email}</Text>
      <Text>Phone: {item.phone}</Text>
      <Text>Apartment: {item.apartmentname}</Text>
      <Text>Floor: {item.floor_number}</Text>
      <Text>Flat: {item.flat_number}</Text>
      <Text>Role: {item.role}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.approveButton}
          onPress={() => handleApprove(item.id)}
        >
          <Text style={styles.buttonText}>Approve Resident</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (pendingResidents.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No pending resident requests</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pendingResidents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
      />
    </View>
  );
};

export default ResidentApprovalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
