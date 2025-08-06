import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, Alert, Modal
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const AmenitiesScreen = () => {
  const { token, user } = useContext(AuthContext);
  const [tab, setTab] = useState('amenities');
  const [amenities, setAmenities] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    fetchAmenities();
    fetchBookings();
  }, []);

  const fetchAmenities = async () => {
    try {
      const res = await api.get('/admin/amenities', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAmenities(res.data);
    } catch (err) {
      console.error('Error loading amenities:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const isOverlapping = (start1, end1, start2, end2) => {
    return !(end1 < start2 || start1 > end2);
  };

  const handleBookNow = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please select both start and end dates');
      return;
    }

    if (startDate >= endDate) {
      Alert.alert('Invalid Date Range', 'End date must be after start date.');
      return;
    }

    const conflict = bookings.find(
      (b) =>
        b.amenity_id === selectedAmenity.id &&
        isOverlapping(
          new Date(startDate),
          new Date(endDate),
          new Date(b.start_date),
          new Date(b.end_date)
        )
    );

    if (conflict) {
      Alert.alert('Already Booked', `Amenity already booked during this range.`);
      return;
    }

    try {
      const payload = {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      };

      await api.post(
        `/bookings/amenities/${selectedAmenity.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', 'Amenity booked successfully');
      setModalVisible(false);
      fetchBookings();
    } catch (err) {
      console.error('Booking failed:', err?.response?.data || err.message);
      Alert.alert('Booking Failed', err?.response?.data?.message || 'Please try again');
    }
  };

  const cancelBooking = async (bookingId) => {
    Alert.alert('Cancel Booking', 'Are you sure?', [
      { text: 'No' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await api.delete(`/bookings/${bookingId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert('Cancelled', 'Booking cancelled successfully');
            fetchBookings();
          } catch (err) {
            console.error('Cancel failed:', err);
            Alert.alert('Error', 'Could not cancel booking');
          }
        },
      },
    ]);
  };

  const openBookingModal = (amenity) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    setStartDate(tomorrow);
    setEndDate(dayAfter);
    setSelectedAmenity(amenity);
    setModalVisible(true);
  };

  const renderAmenityCard = ({ item }) => {
    const today = new Date();

    const currentBooking = bookings.find(
      (b) =>
        b.amenity_id === item.id &&
        isOverlapping(
          today,
          today,
          new Date(b.start_date),
          new Date(b.end_date)
        )
    );

    return (
      <View style={styles.card}>
        {item.image_url && <Image source={{ uri: item.image_url }} style={styles.image} />}
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc}>{item.description}</Text>
        {item.timing && <Text style={styles.cardMeta}>🕒 {item.timing}</Text>}
        {item.availability && <Text style={styles.cardMeta}>📅 {item.availability}</Text>}
        {item.status && <Text style={styles.cardMeta}>⚙️ {item.status}</Text>}

        {currentBooking ? (
          <Text style={styles.cardMeta}>
            🔒 Booked by you from {currentBooking.start_date} to {currentBooking.end_date}
          </Text>
        ) : (
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => openBookingModal(item)}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderBookingHistory = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Amenity: {item.amenity_title}</Text>
      <Text style={styles.cardMeta}>📅 From: {item.start_date} To: {item.end_date}</Text>
      <Text style={styles.cardMeta}>Status: ✅ Confirmed</Text>
      <TouchableOpacity
        style={[styles.bookButton, { backgroundColor: '#dc3545' }]}
        onPress={() => cancelBooking(item.id)}
      >
        <Text style={styles.bookButtonText}>Cancel Booking</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setTab('amenities')} style={[styles.tab, tab === 'amenities' && styles.activeTab]}>
          <Text style={styles.tabText}>Amenities</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('history')} style={[styles.tab, tab === 'history' && styles.activeTab]}>
          <Text style={styles.tabText}>My Bookings</Text>
        </TouchableOpacity>
      </View>

      {tab === 'amenities' ? (
        <FlatList
          data={amenities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAmenityCard}
        />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBookingHistory}
        />
      )}

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Start & End Date</Text>

            <TouchableOpacity style={styles.dateTimeBox} onPress={() => setShowStartPicker(true)}>
              <Text style={styles.dateTimeLabel}>Start Date</Text>
              <Text style={styles.dateTimeValue}>{startDate?.toDateString()}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateTimeBox} onPress={() => setShowEndPicker(true)}>
              <Text style={styles.dateTimeLabel}>End Date</Text>
              <Text style={styles.dateTimeValue}>{endDate?.toDateString()}</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.bookButton, { backgroundColor: '#999', flex: 1, marginRight: 10 }]}>
                <Text style={styles.bookButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBookNow} style={[styles.bookButton, { flex: 1 }]}>
                <Text style={styles.bookButtonText}>Book Now</Text>
              </TouchableOpacity>
            </View>

            {showStartPicker && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                minimumDate={new Date(Date.now() + 86400000)}
                onChange={(event, date) => {
                  setShowStartPicker(false);
                  if (date) setStartDate(date);
                }}
              />
            )}

            {showEndPicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                minimumDate={startDate || new Date()}
                onChange={(event, date) => {
                  setShowEndPicker(false);
                  if (date) setEndDate(date);
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardDesc: { marginTop: 4, color: '#555' },
  cardMeta: { marginTop: 4, fontSize: 12, color: '#888' },
  bookButton: {
    backgroundColor: '#5857e3',
    padding: 10,
    marginTop: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    padding: 12,
    backgroundColor: '#7d7d7d',
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#5857e3',
  },
  tabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 10,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dateTimeBox: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 6,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dateTimeLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateTimeValue: {
    fontSize: 16,
    color: '#333',
  },
});

export default AmenitiesScreen;
