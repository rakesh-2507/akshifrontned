import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SendOtpScreen from '../screens/SendOtpScreen';
import VerifyOtpScreen from '../screens/VerifyOtpScreen';
import WatchmanPage from '../screens/WatchmanPage';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import DashboardScreen from '../screens/DashboardScreen';
import UserManagementScreen from '../screens/UserManagementScreen';
import ViewComplaintsScreen from '../screens/ViewComplaintsScreen';
import VisitorLogsScreen from '../screens/VisitorLogsScreen';
import AnnouncementCreateScreen from '../screens/Admin/AnnouncementCreateScreen';
import AmenitiesManagementScreen from '../screens/AmenitiesManagementScreen';
import ResidentApprovalScreen from '../screens/ResidentApprovalScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HouseholdScreen from '../screens/HouseholdScreen';
import ResidentTabs from './ResidentTabs';
import PendingApprovalScreen from '../screens/PendingApprovalScreen';

import { AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  console.log('🧠 User loaded in navigator:', user);
  console.log('👤 Role:', user?.role);
  console.log('✅ isApproved:', user?.isApproved); // ✅ Corrected!

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="SendOtp" component={SendOtpScreen} />
            <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        ) : user.role === 'watchman' ? (
          <Stack.Screen name="WatchmanPage" component={WatchmanPage} />
        ) : user.role === 'owner' ? (
          <>
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="UserManagement" component={UserManagementScreen} />
            <Stack.Screen name="Complaints" component={ViewComplaintsScreen} />
            <Stack.Screen name="VisitorLogs" component={VisitorLogsScreen} />
            <Stack.Screen name="AnnouncementCreate" component={AnnouncementCreateScreen} />
            <Stack.Screen name="AmenitiesManagement" component={AmenitiesManagementScreen} />
            <Stack.Screen name="ResidentApproval" component={ResidentApprovalScreen} />
          </>
        ) : user.role === 'resident' ? (
          user.isApproved ? ( // ✅ Fixed this line
            <>
              <Stack.Screen name="ResidentTabs" component={ResidentTabs} />
              <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
              <Stack.Screen name="Household" component={HouseholdScreen} options={{ headerShown: true }} />
            </>
          ) : (
            <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
          )
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
