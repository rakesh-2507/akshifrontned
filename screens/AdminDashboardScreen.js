import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

import DashboardScreen from './DashboardScreen';
import UserManagementScreen from './UserManagementScreen';
import ViewComplaintsScreen from './ViewComplaintsScreen';
import AnnouncementCreateScreen from './Admin/AnnouncementCreateScreen';
import RentPaymentScreen from './RentPaymentScreen';
import VisitorLogsScreen from './VisitorLogsScreen';
import MaintenanceScreen from './MaintenanceScreen';
import AmenitiesManagementScreen from './AmenitiesManagementScreen';
import UploadEvent from './Admin/UploadEvent';
import ResidentApprovalScreen from './ResidentApprovalScreen';

const tabs = [
  { key: 'dashboard', label: 'Dashboard', icon: 'assignment', component: DashboardScreen },
  { key: 'users', label: 'Residents', icon: 'group', component: UserManagementScreen },
  { key: 'complaints', label: 'Complaints', icon: 'report', component: ViewComplaintsScreen },
  { key: 'announcements', label: 'Announcements', icon: 'campaign', component: AnnouncementCreateScreen },
  { key: 'rent', label: 'Rent Records', icon: 'payments', component: RentPaymentScreen },
  { key: 'visitors', label: 'Visitor Logs', icon: 'assignment', component: VisitorLogsScreen },
  { key: 'maintenance', label: 'Maintenance', icon: 'build', component: MaintenanceScreen },
  { key: 'amenities', label: 'Amenities', icon: 'event-available', component: AmenitiesManagementScreen },
  { key: 'uploadEvent', label: 'Upload Event', icon: 'upload', component: UploadEvent },
  { key: 'approveResidents', label: 'Approve Residents', icon: 'person-add', component: ResidentApprovalScreen },
];

const AdminDashboardScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'Admin';
  const activeComponent = tabs.find(tab => tab.key === activeTab)?.component || (() => <Text>Select a tab</Text>);

  return (
    <View style={styles.fullContainer}>
      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSidebarVisible(!sidebarVisible)}>
            <MaterialIcons name="menu" size={28} color="#0072ff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Welcome, {firstName}</Text>
        </View>

        {/* Active Tab Content */}
        <ScrollView style={styles.tabContainer}>
          {React.createElement(activeComponent)}
        </ScrollView>
      </View>

      {/* Sidebar Overlay */}
      {sidebarVisible && (
        <View style={styles.overlayContainer}>
          <View style={styles.sidebar}>
            <Text style={styles.sidebarTitle}>Admin</Text>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.sidebarButton, activeTab === tab.key && styles.activeSidebarButton]}
                onPress={() => {
                  setActiveTab(tab.key);
                  setSidebarVisible(false);
                }}
              >
                <MaterialIcons name={tab.icon} size={22} color={activeTab === tab.key ? '#fff' : '#ccc'} />
                <Text style={[styles.sidebarButtonText, activeTab === tab.key && { color: '#fff' }]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
              <MaterialIcons name="logout" size={22} color="#fff" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Tap to close overlay */}
          <TouchableOpacity
            style={styles.overlayBackground}
            onPress={() => setSidebarVisible(false)}
            activeOpacity={1}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f0f2f5',
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#0072ff',
  },
  tabContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flex: 1,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    zIndex: 100,
  },
  sidebar: {
    width: 260,
    backgroundColor: '#2f3e46',
    paddingVertical: 20,
    paddingHorizontal: 10,
    zIndex: 101,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sidebarTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  sidebarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  activeSidebarButton: {
    backgroundColor: '#00c6ff',
  },
  sidebarButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#ddd',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    backgroundColor: '#e63946',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  logoutText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
});

export default AdminDashboardScreen;
