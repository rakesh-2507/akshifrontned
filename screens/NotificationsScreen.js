import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  TextInput,
} from 'react-native';
import api from '../services/api';

const tagOptions = ['all', 'urgent', 'rule', 'update', 'event', 'new'];

const AnnouncementCard = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = item.description.length > 100;
  const displayText = expanded
    ? item.description
    : item.description.slice(0, 100) + (isLong ? '...' : '');

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>📄</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardType}>{item.type.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.cardDescription}>{displayText}</Text>

      {isLong && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text style={styles.readMore}>
            {expanded ? 'Show Less ▲' : 'Read More ▼'}
          </Text>
        </TouchableOpacity>
      )}

      {item.pdf_url && (
        <View style={styles.pdfBox}>
          <Text style={styles.pdfIcon}>📄</Text>
          <Text
            style={styles.pdfText}
            onPress={() => Linking.openURL(item.pdf_url)}
          >
            {item.pdf_url.split('/').pop()}
          </Text>
        </View>
      )}

      {item.image_url && (
        <Text
          style={styles.link}
          onPress={() => Linking.openURL(item.image_url)}
        >
          View Image
        </Text>
      )}

      <Text style={styles.date}>
        Posted on: {new Date(item.posted_at).toLocaleDateString()}
      </Text>
    </View>
  );
};

const NotificationsScreen = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedTag, setSelectedTag] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Error fetching announcements:', err.message);
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesCategory =
      selectedTag === 'all' || a.type.toLowerCase() === selectedTag;
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());

    // If search is active, ignore tabs and show all matching search
    if (search.trim() !== '') return matchesSearch;

    // Otherwise, filter by tab and return normally
    return matchesCategory;
  });

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search notices..."
        placeholderTextColor="#aaa"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      <View style={styles.tabs}>
        {tagOptions.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[styles.tab, selectedTag === tag && styles.activeTab]}
            onPress={() => setSelectedTag(tag)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTag === tag && styles.activeTabText,
              ]}
            >
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredAnnouncements}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <AnnouncementCard item={item} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f4f4' },

  searchInput: {
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },

  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 12,
  },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginBottom: 8,
  },

  activeTab: {
    backgroundColor: '#eef1ff',
    borderColor: '#4f4ada',
  },

  tabText: {
    color: '#555',
    fontWeight: '500',
    fontSize: 13,
  },

  activeTabText: {
    color: '#4f4ada',
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  iconBox: {
    backgroundColor: '#49a9f8',
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  iconText: {
    fontSize: 20,
    color: '#fff',
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },

  cardType: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e3ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 12,
    color: '#5857e3',
    marginTop: 4,
  },

  cardDescription: {
    fontSize: 14,
    color: '#444',
    marginVertical: 6,
  },

  pdfBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
  },

  pdfIcon: {
    marginRight: 8,
    color: '#f44336',
  },

  pdfText: {
    color: '#333',
    fontSize: 14,
  },

  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },

  readMore: {
    marginTop: 4,
    color: '#4f4ada',
    fontWeight: 'bold',
    fontSize: 13,
  },

  link: {
    color: '#007bff',
    marginTop: 6,
    fontSize: 13,
  },
});

export default NotificationsScreen;
