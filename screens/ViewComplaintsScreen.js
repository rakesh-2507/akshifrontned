// ViewComplaintsScreen.js (Updated with modal for admin to update status/response)

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import api from '../services/api';

const ViewComplaintsScreen = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [status, setStatus] = useState('pending');
  const [response, setResponse] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/admin/complaints');
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const openModal = (complaint) => {
    setSelectedComplaint(complaint);
    setStatus(complaint.status);
    setResponse(complaint.response || '');
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/chat/admin/complaints/${selectedComplaint.id}/status`, {
        status,
        response,
      });
      Alert.alert('Updated', 'Complaint status updated successfully.');
      setModalVisible(false);
      fetchComplaints();
    } catch (err) {
      console.error('Update error:', err);
      Alert.alert('Error', 'Failed to update complaint.');
    }
  };

  const renderComplaint = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
      <Text style={styles.subject}>{item.type}</Text>
      <Text style={styles.meta}>By: {item.user_name} (Flat {item.flat_number})</Text>
      <Text>{item.description}</Text>
      <Text style={styles.status}>Status: {item.status}</Text>
      {item.response && <Text style={styles.response}>Response: {item.response}</Text>}
      <Text style={styles.date}>Date: {new Date(item.created_at).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0072ff" />
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderComplaint}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Complaint</Text>
            <Text>Status:</Text>
            <View style={styles.statusButtons}>
              {['pending', 'closed'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusButton, status === s && styles.selectedStatus]}
                  onPress={() => setStatus(s)}
                >
                  <Text>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text>Response:</Text>
            <TextInput
              style={styles.input}
              value={response}
              onChangeText={setResponse}
              placeholder="Enter response to user"
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpdate} style={styles.updateButton}>
                <Text style={{ color: 'white' }}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  subject: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginTop: 6,
  },
  response: {
    marginTop: 4,
    fontSize: 13,
    fontStyle: 'italic',
    color: '#0072ff',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusButtons: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  statusButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    marginRight: 10,
  },
  selectedStatus: {
    backgroundColor: '#4f4ada',
    borderColor: '#4f4ada',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 8,
    marginBottom: 12,
    padding: 8,
    minHeight: 60,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    marginRight: 10,
  },
  updateButton: {
    backgroundColor: '#4f4ada',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 5,
  },
});

export default ViewComplaintsScreen;
