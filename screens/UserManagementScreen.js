import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';

const UserManagementScreen = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users?role=resident', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error('Fetch error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    Alert.alert('Confirm', 'Are you sure you want to delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/users/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUsers((prev) => prev.filter((user) => user.id !== userId));
          } catch (error) {
            console.error('Delete error:', error.response?.data || error.message);
            Alert.alert('Error', 'Failed to delete user.');
          }
        },
      },
    ]);
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.flatNumber || '-'}</Text>
      <Text style={styles.cell}>{item.role}</Text>
      <Text style={styles.cell}>{item.phone}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
          <MaterialIcons name="delete" size={20} color="#e63946" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert('Edit', 'Edit feature coming soon')} style={styles.iconBtn}>
          <MaterialIcons name="edit" size={20} color="#0077b6" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Residents</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ minWidth: 800 }}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.headerCell]}>Name</Text>
            <Text style={[styles.cell, styles.headerCell]}>Flat</Text>
            <Text style={[styles.cell, styles.headerCell]}>Role</Text>
            <Text style={[styles.cell, styles.headerCell]}>Phone</Text>
            <Text style={[styles.cell, styles.headerCell]}>Actions</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={users}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={<Text style={{ marginTop: 10 }}>No residents found.</Text>}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e1e5ea',
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cell: {
    flex: 1,
    paddingHorizontal: 4,
    fontSize: 14,
    color: '#333',
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#1d3557',
  },
  actions: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 4,
  },
  iconBtn: {
    marginHorizontal: 4,
  },
});

export default UserManagementScreen;
