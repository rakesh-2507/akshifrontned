import React, { useContext, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const features = [
  { name: 'Add Visitor', screen: 'Visitor Management', icon: 'qr-code', iconColor: '#fff', iconBg: '#3027b0ff' },
  { name: 'Daily Activity', screen: 'Daily Activity', icon: 'directions-walk', iconColor: '#fff', iconBg: '#009688' },
  { name: 'Pay Maintenance', screen: 'Maintenance', icon: 'payment', iconColor: '#fff', iconBg: '#4CAF50' },
  // { name: 'Book Amenities', screen: 'Amenities', icon: 'event-available', iconColor: '#fff', iconBg: '#2196F3' },
  { name: 'Raise Complaint', screen: 'Complaint Management', icon: 'report-problem', iconColor: '#fff', iconBg: '#FF9800' },
  { name: 'Notices', screen: 'Community Updates', icon: 'notifications', iconColor: '#fff', iconBg: '#3F51B5' },
  // { name: 'Warranty Vault', screen: 'Warranty', icon: 'verified-user', iconColor: '#fff', iconBg: '#795548' },
  { name: 'Gallery', screen: 'Event Gallery', icon: 'photo-library', iconColor: '#fff', iconBg: '#795548' },
  { name: 'Market Place', screen: 'Marketplace', icon: 'store', iconColor: '#fff', iconBg: '#607D8B' },
];

const FeatureCard = ({
  name,
  screen,
  icon,
  iconColor,
  iconBg,
  fullWidth = false,
}) => {
  const navigation = useNavigation();

  const descriptionMap = {
    'Add Visitor': 'Generate a QR code for quick access to your apartmrnt',
    'Daily Activity': 'Track your activity',
  };

  const showGenerateButton = name === 'Add Visitor';

  if (fullWidth) {
    // Custom layout for full-width cards
    return (
      <TouchableOpacity
        style={[styles.card, styles.fullWidthCard]}
        onPress={() => navigation.navigate(screen)}
        activeOpacity={0.9}
      >
        <View style={styles.headerRow}>
          <Text style={styles.fullCardTitle}>{name}</Text>
          <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
            <MaterialIcons name={icon} size={28} color={iconColor} />
          </View>
        </View>

        {/* Subtitle */}
        {descriptionMap[name] && (
          <Text style={styles.cardSubtitle}>{descriptionMap[name]}</Text>
        )}

        {/* Generate button */}
        {showGenerateButton && (
          <TouchableOpacity
            style={styles.generateButton}
            onPress={() => navigation.navigate(screen)}
          >
            <Text style={styles.generateButtonText}>Generate QR Code</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  // Default layout for half-width cards
  return (
    <TouchableOpacity
      style={[styles.card, styles.halfWidthCard]}
      onPress={() => navigation.navigate(screen)}
    >
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon} size={28} color={iconColor} />
      </View>
      <Text style={styles.cardText}>{name}</Text>
    </TouchableOpacity>
  );
};

const getInitials = (nameOrEmail) => {
  if (!nameOrEmail) return '';
  const parts = nameOrEmail.split(/[ .@_]/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('');
};

const ApartmentListScreen = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const firstName = user?.name?.split(' ')[0];
  const initials = getInitials(user?.name || user?.email);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setDrawerVisible(false);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.blurWrapper}>
        <BlurView intensity={80} tint="light" style={styles.blurCard}>
          <View style={styles.contentWrapper}>
            <View style={styles.headerContent}>
              <View style={styles.textContainer}>
                <Text style={styles.welcomeText}>Welcome to</Text>
                {user?.apartmentName && (
                  <Text style={styles.brandText}>{user.apartmentName}</Text>
                )}
              </View>

              <Image
                source={{ uri: 'https://img.icons8.com/clouds/100/000000/building.png' }}
                style={styles.headerIcon}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              <LinearGradient colors={['#00c6ff', '#0072ff']} style={[styles.adCard, { marginTop: 20 }]}>
                <View style={styles.bubble1} />
                <View style={styles.bubble2} />
                <Text style={styles.adLabel}>Ad</Text>
                <Text style={styles.adTitle}>Summer Pool Party</Text>
                <Text style={styles.adSubtitle}>Join us this weekend for fun activities!</Text>
                <TouchableOpacity style={styles.adButton}>
                  <Text style={styles.adButtonText}>Learn More</Text>
                </TouchableOpacity>
                <View style={styles.adArrow}>
                  <MaterialIcons name="chevron-right" size={24} color="#fff" />
                </View>
              </LinearGradient>

              <View style={styles.grid}>
                <View style={styles.column}>
                  <FeatureCard {...features[0]} fullWidth />
                  <FeatureCard {...features[1]} fullWidth />
                </View>
                <View style={styles.row}>
                  <FeatureCard {...features[2]} />
                  <FeatureCard {...features[3]} />
                </View>
                <View style={styles.row}>
                  <FeatureCard {...features[4]} />
                  <FeatureCard {...features[5]} />
                </View>
                <View style={styles.row}>
                  <FeatureCard {...features[6]} />
                  {/* <FeatureCard {...features[7]} /> */}
                </View>
                <View style={styles.row}>
                  {/* <FeatureCard {...features[8]} /> */}
                </View>
              </View>
            </ScrollView>
          </View>
        </BlurView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  body: {
    fontFamily: 'sans-serif',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(218, 216, 216, 0.77)',
    fontFamily: 'sans-serif'
  },
  blurWrapper: {
    flex: 1,
    padding: 12,
    backgroundColor: 'transparent',
  },
  blurCard: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: 'rgba(218, 216, 216, 1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'scroll',
  },
  contentWrapper: {
    padding: 20,
    flex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 20,
  },
  welcomeText: {
    fontSize: 17,
    color: '#000',
    fontWeight: '400',
  },
  brandText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerIcon: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  grid: {
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  column: {
    flexDirection: 'column',
    gap: 1,
    marginBottom: 0,
  },
  fullWidthCard: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  fullCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'Poppins-Regular',

  },

  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 12,
  },

  generateButton: {
    backgroundColor: '#0072ff',
    padding: 100,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'center',
  },

  generateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  halfWidthCard: {
    width: '47%',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 2,
  },

  card: {
    marginHorizontal: 5,
  },

  cardText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  adLabel: {
    fontSize: 12,
    color: '#ffffffcc',
    marginBottom: 4,
  },
  adTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  adSubtitle: {
    fontSize: 14,
    color: '#f0f0f0',
    marginVertical: 6,
  },
  adButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  adButtonText: {
    color: '#0072ff',
    fontWeight: '600',
  },
  adArrow: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#ffffff30',
    borderRadius: 16,
    padding: 4,
  },
  bubble1: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: '#ffffff20',
    borderRadius: 50,
    top: -20,
    left: 30,
  },
  bubble2: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: '#ffffff15',
    borderRadius: 40,
    bottom: -20,
    right: 20,
  },
});

export default ApartmentListScreen;
