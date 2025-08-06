import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = () => {
  const stats = {
    totalFlats: 60,
    totalResidents: 120,
    totalComplaints: 35,
    pendingComplaints: 8,
    salariesCollected: 250000,
    salariesPending: 50000,
  };

  const salaryChartData = [
    { name: 'Collected', population: stats.salariesCollected, color: '#22c55e' },
    { name: 'Pending', population: stats.salariesPending, color: '#ef4444' },
  ];

  const upcomingPayments = [
    { name: 'Flat 101 - Rent', due: '2025-07-10', amount: 15000 },
    { name: 'Flat 202 - Maintenance', due: '2025-07-12', amount: 3000 },
    { name: 'Flat 303 - Utility Bill', due: '2025-07-15', amount: 1800 },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard Overview</Text>

      {/* 🔷 Section: Dashboard Stats */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Overall Stats</Text>
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.label}>Total Flats</Text>
            <Text style={styles.value}>{stats.totalFlats}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Residents</Text>
            <Text style={styles.value}>{stats.totalResidents}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Total Complaints</Text>
            <Text style={styles.value}>{stats.totalComplaints}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Pending Complaints</Text>
            <Text style={styles.value}>{stats.pendingComplaints}</Text>
          </View>
        </View>
      </View>

      {/* 🔷 Section: Salary Chart */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Salaries Payment Overview</Text>
        <PieChart
          data={salaryChartData}
          width={screenWidth - 60}
          height={220}
          chartConfig={{
            color: () => `#333`,
            labelColor: () => '#000',
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[0, 0]}
          absolute
          hasLegend={false}
        />

        <View style={styles.chartStatsContainer}>
          <View style={styles.chartStatRow}>
            <View style={[styles.dot, { backgroundColor: '#22c55e' }]} />
            <Text style={styles.chartStatLabel}>Collected:</Text>
            <Text style={styles.chartStatValue}>₹{stats.salariesCollected.toLocaleString()}</Text>
          </View>
          <View style={styles.chartStatRow}>
            <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.chartStatLabel}>Pending:</Text>
            <Text style={styles.chartStatValue}>₹{stats.salariesPending.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* 🔷 Section: Upcoming Payments */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Upcoming Payments</Text>
        <View style={styles.upcomingContainer}>
          {upcomingPayments.map((item, index) => (
            <View key={index} style={styles.paymentCard}>
              <View>
                <Text style={styles.paymentName}>{item.name}</Text>
                <Text style={styles.paymentDue}>Due: {item.due}</Text>
              </View>
              <Text style={styles.paymentAmount}>₹{item.amount.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#0072ff',
  },
  sectionBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1e3a8a',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    alignItems: 'center',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginTop: 4,
  },
  chartStatsContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  chartStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  chartStatLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  chartStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  upcomingContainer: {
    marginTop: 10,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  paymentDue: {
    fontSize: 14,
    color: '#6b7280',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#047857',
    alignSelf: 'center',
  },
});

export default DashboardScreen;
