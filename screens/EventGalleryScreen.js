// GalleryScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';

const eventTabs = ['All Events', 'Festival', 'Sports', 'Community', 'Parties', 'Others'];

const gradients = [
  ['rgba(255,107,107,0.7)', 'rgba(255,217,61,0.7)'],
  ['rgba(107,203,119,0.7)', 'rgba(77,150,255,0.7)'],
  ['rgba(255,159,28,0.7)', 'rgba(255,64,64,0.7)'],
  ['rgba(132,94,194,0.7)', 'rgba(214,93,177,0.7)'],
  ['rgba(0,201,167,0.7)', 'rgba(146,254,157,0.7)'],
  ['rgba(255,110,127,0.7)', 'rgba(191,233,255,0.7)'],
];

const GalleryScreen = () => {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('All Events');
  const [modalData, setModalData] = useState({
    visible: false,
    images: [],
    mode: 'grid',
    currentIndex: 0,
    eventTitle: '',
    eventPlace: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/gallery-events');
      setEvents(res.data);
    } catch (error) {
      console.error('Failed to fetch gallery events', error);
    }
  };

  const filteredEvents =
    activeTab === 'All Events'
      ? events
      : events.filter(event => event.event_type.toLowerCase() === activeTab.toLowerCase());

  const latestEvent = events.length > 0 ? events[0] : null;

  const getImageUrls = (assets = []) => {
    const filtered = assets.filter(asset =>
      asset.toLowerCase().endsWith('.jpg') ||
      asset.toLowerCase().endsWith('.jpeg') ||
      asset.toLowerCase().endsWith('.png')
    );
    return filtered.map(asset => `https://akshi-aid3.onrender.com/uploads/gallery/${asset}`);
  };

  const openModalGrid = (images, title = '', place = '') => {
    if (!images || images.length === 0) return;
    setModalData({ visible: true, images, mode: 'grid', currentIndex: 0, eventTitle: title, eventPlace: place });
  };

  const closeModal = () => {
    setModalData({ visible: false, images: [], mode: 'grid', currentIndex: 0, eventTitle: '', eventPlace: '' });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Gallery</Text>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {eventTabs.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Latest Event Card */}
      {latestEvent && (
        <LinearGradient
          colors={['rgba(45, 90, 240, 0.7)', 'rgba(198, 63, 240, 0.7)']}
          style={styles.latestCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.imageIcon}>
            <Ionicons name="image-outline" size={20} color="#fff" />
          </View>

          <View style={styles.latestTag}>
            <Text style={styles.latestTagText}>Latest Event</Text>
          </View>

          <Text style={styles.eventTitle}>{latestEvent.title}</Text>
          <Text style={styles.eventDetails}>
            {latestEvent.place} • {new Date(latestEvent.event_date).toLocaleDateString()}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>
              {
                latestEvent.assets.filter(a =>
                  a.toLowerCase().endsWith('.jpg') ||
                  a.toLowerCase().endsWith('.jpeg') ||
                  a.toLowerCase().endsWith('.png')
                ).length
              } photos • {
                latestEvent.assets.filter(a =>
                  a.toLowerCase().endsWith('.mp4') ||
                  a.toLowerCase().endsWith('.mov')
                ).length
              } videos
            </Text>
            <TouchableOpacity
              onPress={() => openModalGrid(getImageUrls(latestEvent.assets), latestEvent.title, latestEvent.place)}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      )}

      {/* Other Events */}
      <FlatList
        data={filteredEvents.filter(event => getImageUrls(event.assets).length > 0)}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
        scrollEnabled={false}
        renderItem={({ item, index }) => {
          const screenWidth = Dimensions.get('window').width;
          const margin = 12;
          const cardWidth = (screenWidth - margin * 3) / 2;
          const photoUrls = getImageUrls(item.assets);

          return (
            <TouchableOpacity
              style={{
                margin: margin / 2,
                borderRadius: 12,
                overflow: 'hidden',
                width: cardWidth,
              }}
              activeOpacity={0.8}
              onPress={() => openModalGrid(photoUrls, item.title, item.place)}
            >
              <LinearGradient
                colors={gradients[index % gradients.length]}
                style={styles.eventSummaryCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.photoCountContainer}>
                  <Text style={styles.photoCountText}>{photoUrls.length} photos</Text>
                </View>

                <View style={styles.eventInfoContainer}>
                  <Text style={styles.eventSummaryTitle}>{item.title || item.event_type}</Text>
                  <Text style={styles.eventSummaryDate}>{new Date(item.event_date).toLocaleDateString()}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        }}
      />

      {/* Recent Images Card - Only when All Events tab is active */}
      {activeTab === 'All Events' &&
        latestEvent &&
        getImageUrls(latestEvent.assets).length > 0 && (
          <View style={styles.recentCardWrapper}>
            <Text style={styles.recentCardTitle}>Recent Images</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                openModalGrid(getImageUrls(latestEvent.assets), latestEvent.title, latestEvent.place)
              }
              style={styles.recentCard}
            >
              <Image
                source={{ uri: getImageUrls(latestEvent.assets)[0] }}
                style={styles.recentImage}
                resizeMode="cover"
              />
              <View style={styles.recentOverlay}>
                <Text style={styles.recentOverlayText}>View All</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

      {/* Modal */}
      <Modal
        visible={modalData.visible}
        transparent={false}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{modalData.eventTitle}</Text>
            <Text style={styles.modalPlace}>{modalData.eventPlace}</Text>
          </View>

          <FlatList
            contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
            data={modalData.images}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3}
            renderItem={({ item }) => (
              <View style={{ flex: 1 / 3, padding: 5 }}>
                <Image
                  source={{ uri: item }}
                  style={{
                    width: '100%',
                    aspectRatio: 1,
                    borderRadius: 8,
                    backgroundColor: '#222',
                  }}
                  resizeMode="cover"
                />
              </View>
            )}
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 15,
    marginLeft: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    color: '#444',
  },
  activeTabText: {
    color: '#fff',
  },
  latestCard: {
    margin: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    paddingBottom: 60,
    position: 'relative',
  },
  imageIcon: {
    backgroundColor: 'rgba(200, 202, 204, 0.7)',
    padding: 8,
    borderRadius: 30,
    position: 'absolute',
    top: 5,
    left: 16,
  },
  latestTag: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(200, 202, 204, 0.7)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  latestTagText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#fff',
  },
  eventDetails: {
    color: '#fff',
    marginBottom: 8,
  },
  cardFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 44,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fafafa',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  footerText: {
    color: '#444',
    fontWeight: '600',
    fontSize: 14,
  },
  viewAllText: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 14,
  },
  eventSummaryCard: {
    padding: 10,
    borderRadius: 12,
    elevation: 2,
    minHeight: 110,
    justifyContent: 'flex-end',
  },
  photoCountContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(200, 202, 204, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    elevation: 3,
  },
  photoCountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  eventInfoContainer: {
    alignSelf: 'flex-start',
  },
  eventSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  eventSummaryDate: {
    fontSize: 12,
    color: '#eee',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 2,
  },
  modalHeader: {
    paddingTop: 80,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    backgroundColor: '#111',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  modalPlace: {
    fontSize: 14,
    color: '#ccc',
  },
  recentCardWrapper: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // for Android
  },
  recentCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recentCard: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  recentImage: {
    width: '100%',
    height: '100%',
  },
  recentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
  },
  recentOverlayText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default GalleryScreen;
