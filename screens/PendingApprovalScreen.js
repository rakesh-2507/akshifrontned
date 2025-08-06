import React, { useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { AuthContext } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const features = [
  { name: 'Add Visitor', icon: 'qr-code', iconColor: '#fff', iconBg: '#3027b0ff' },
  { name: 'Daily Activity', icon: 'directions-walk', iconColor: '#fff', iconBg: '#009688' },
  { name: 'Pay Maintenance', icon: 'payment', iconColor: '#fff', iconBg: '#4CAF50' },
  { name: 'Raise Complaint', icon: 'report-problem', iconColor: '#fff', iconBg: '#FF9800' },
  { name: 'Notices', icon: 'notifications', iconColor: '#fff', iconBg: '#3F51B5' },
  { name: 'Gallery', icon: 'photo-library', iconColor: '#fff', iconBg: '#795548' },
  { name: 'Market Place', icon: 'store', iconColor: '#fff', iconBg: '#607D8B' },
];

const FeatureCard = ({ name, icon, iconColor, iconBg, fullWidth = false }) => (
  <View style={[styles.card, fullWidth ? styles.fullWidthCard : styles.halfWidthCard]}>
    <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
      <MaterialIcons name={icon} size={28} color={iconColor} />
    </View>
    <Text style={styles.cardText}>{name}</Text>
  </View>
);

const PendingApprovalScreen = () => {
  const { user, logout, refreshUser } = useContext(AuthContext);
  const navigation = useNavigation();

  // 🔁 Refresh user on screen focus
  useFocusEffect(
    useCallback(() => {
      const checkApproval = async () => {
        await refreshUser();

        if (user?.is_approved) {
          // Navigate if approved
          navigation.reset({
            index: 0,
            routes: [{ name: 'ResidentTabs' }],
          });
        }
      };
      checkApproval();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout(); // this is enough; AppNavigator will render <LoginScreen>
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoutWrapper}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.blurWrapper}>
        <BlurView intensity={80} tint="light" style={styles.blurCard}>
          <View style={styles.contentWrapper}>
            <View style={styles.headerContent}>
              <View style={styles.textContainer}>
                <Text style={styles.welcomeText}>Approval Needed</Text>
                <Text style={styles.brandText}>
                  {user?.apartmentName || 'Apartment'}
                </Text>
              </View>
            </View>

            <Text style={styles.subText}>
              You can explore the app features, but actions are disabled until approval.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <LinearGradient
                colors={['#00c6ff', '#0072ff']}
                style={[styles.adCard, { marginTop: 20 }]}
              >
                <Text style={styles.adLabel}>Announcement</Text>
                <Text style={styles.adTitle}>Pending Review</Text>
                <Text style={styles.adSubtitle}>
                  Your details are under verification by the admin.
                </Text>
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
  container: {
    flex: 1,
    backgroundColor: 'rgba(218, 216, 216, 0.77)',
  },
  logoutWrapper: {
    padding: 12,
    alignItems: 'flex-end',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  blurWrapper: {
    flex: 1,
    padding: 12,
  },
  blurCard: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: 'rgba(218, 216, 216, 1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    elevation: 10,
  },
  contentWrapper: {
    padding: 20,
    flex: 1,
  },
  headerContent: {
    flexDirection: 'row',
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
  subText: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10,
    color: '#666',
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
});

export default PendingApprovalScreen;
