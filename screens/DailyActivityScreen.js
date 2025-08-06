import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Button,
  Platform,
  Alert,
  PermissionsAndroid,
  ScrollView,
  Image,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Pedometer } from 'expo-sensors';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { BlurView } from 'expo-blur';

const screenWidth = Dimensions.get('window').width;

const DailyActivityScreen = () => {
  const { user } = useContext(AuthContext);
  const userId = user?.id;

  const [isAvailable, setIsAvailable] = useState(null);
  const [stepsToday, setStepsToday] = useState(0);
  const [weeklySteps, setWeeklySteps] = useState(Array(7).fill(0));
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission denied', 'Step tracking needs permission.');
        }
      }
    };
    requestPermission();
  }, []);

  useEffect(() => {
    if (!userId) return;

    let subscription;

    Pedometer.isAvailableAsync()
      .then(result => {
        setIsAvailable(result);
        if (!result) return;

        subscription = Pedometer.watchStepCount(async result => {
          setStepsToday(prev => prev + result.steps);

          try {
            await api.post('/activity/step', {
              userId,
              steps: result.steps,
            });
          } catch (err) {
            console.log('❌ Sync error:', err.message);
          }
        });
      })
      .catch(err => {
        setIsAvailable(false);
      });

    fetchWeeklySteps();
    fetchLeaderboard();

    return () => subscription?.remove();
  }, [userId]);

  const fetchWeeklySteps = async () => {
    try {
      const res = await api.get(`/activity/week/${userId}`);
      setWeeklySteps(res.data.weeklySteps);
    } catch (err) {
      console.log('❌ Weekly fetch error:', err.message);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get(`/activity/leaderboard?userId=${userId}`);
      setLeaderboard(res.data.leaderboard);
      setCurrentUserRank(res.data.currentUser);
    } catch (err) {
      console.log('❌ Leaderboard fetch error:', err.message);
    }
  };

  const testInsert = async () => {
    try {
      await api.post('/activity/step', { userId, steps: 500 });
      Alert.alert('✅ Test Insert', '500 steps added');
    } catch (err) {
      Alert.alert('❌ Error', err.message);
    }
  };

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: weeklySteps }],
  };

  const distanceKm = (stepsToday * 0.0008).toFixed(2);     // ~0.8 meters per step
  const caloriesBurned = Math.round(stepsToday * 0.045);   // Average 0.045 kcal/step
  const timeInMinutes = Math.round(stepsToday / 120);      // Assuming 2 steps per second

  return (

    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>

        {/* Today's Activity */}
        <Text style={styles.sectionTitle}>Today's Activity</Text>
        <View style={styles.activityContainer}>
          <View style={styles.circleWrapper}>
            <View style={styles.outerCircle}>
              <Text style={styles.stepCountToday}>{stepsToday}</Text>
              <Text style={styles.stepLabel}>steps today</Text>
            </View>
          </View>
          <View style={styles.activityStats}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{distanceKm}</Text>
              <Text style={styles.statLabel}>km</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{caloriesBurned}</Text>
              <Text style={styles.statLabel}>calories</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{timeInMinutes}</Text>
              <Text style={styles.statLabel}>minutes</Text>
            </View>
          </View>
        </View>

        {/* Weekly Progress */}
        <Text style={styles.sectionTitle}>Weekly Progress</Text>
        <Text style={styles.progressSubtext}>
          Average: 8,245 steps ‧ Goal: 10,000 steps
        </Text>
        <View style={styles.chartWrapper}>
          <BarChart
            data={chartData}
            width={screenWidth - 40}
            height={200}
            fromZero
            showValuesOnTopOfBars
            chartConfig={{
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(62, 78, 255, ${opacity})`,
              labelColor: () => '#333',
              propsForBackgroundLines: {
                stroke: 'rgba(0,0,0,0.05)',
              },
              barPercentage: 0.5,
            }}
            style={styles.chart}
          />
        </View>

        {/* Leaderboard */}
        <Text style={styles.sectionTitle}>Leaderboard</Text>
        <Text style={styles.progressSubtext}>This Week</Text>
        {leaderboard.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#888' }}>No data yet</Text>
        ) : (
          leaderboard.map((userItem, index) => {
            const isCurrentUser = userItem.id === userId;
            return (
              <View
                key={userItem.id}
                style={[
                  styles.leaderboardItem,
                  isCurrentUser && styles.highlighted,
                ]}
              >
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View>
                  <Text style={styles.name}>{userItem?.name}</Text>
                  <Text style={styles.flat}>
                    {userItem?.flat_number ? `Flat ${userItem.flat_number}` : 'Flat info not available'}
                  </Text>
                </View>

                <View style={{ flex: 1 }} />
                <Text style={styles.stepCount}>{userItem.total_steps}</Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    backgroundColor: '#f7f8fa',
  },

  card: {
    margin: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e1e2f',
    marginTop: 20,
    marginBottom: 10,
  },

  progressSubtext: {
    color: '#888',
    fontSize: 14,
    marginBottom: 10,
  },

  activityContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  circleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  outerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 10,
    borderColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepCountToday: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e1e2f',
  },

  stepLabel: {
    color: '#888',
    fontSize: 14,
  },

  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
  },

  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 12,
  },

  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4f46e5',
  },

  statLabel: {
    fontSize: 14,
    color: '#666',
  },

  chartWrapper: {
    marginTop: 10,
    alignItems: 'center',
  },

  chart: {
    borderRadius: 12,
    backgroundColor: 'rgba(62, 78, 255, 0.05)',
    padding: 2,
  },

  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },

  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  rankText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e1e2f',
  },

  flat: {
    fontSize: 12,
    color: '#666',
  },

  stepCount: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#3e4eff',
  },

  highlighted: {
    backgroundColor: 'rgba(62, 78, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#4f46e5',
  },
});

export default DailyActivityScreen;
