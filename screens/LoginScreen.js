import React, { useState, useContext } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Checkbox } from 'react-native-paper';

const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Validation', 'Please enter both email and password.');
      return;
    }

    const success = await login(email, password);
    if (!success) {
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  };

  const Header = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.h1}>Akshi</Text>
        <Text style={styles.h3}>Welcome back!</Text>
      </View>
      <Ionicons name="home" size={32} color="white" />
    </View>
  );

  return (
    <>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter your email"
          keyboardType="email-address"
          style={styles.input}
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Enter your password"
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword}
          value={password}
        />

        <View style={styles.optionsRow}>
          <View style={styles.rememberMe}>
            <Checkbox
              status={rememberMe ? 'checked' : 'unchecked'}
              onPress={() => setRememberMe(!rememberMe)}
              color="#4f4ada"
            />
            <Text style={styles.optionText}>Remember Me</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.optionTextRight}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={onSubmit}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        {/* <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity
          style={styles.otpButton}
          onPress={() => navigation.navigate('OTPScreen')}
        >
          <Text style={styles.otpButtonText}>Login with OTP</Text>
        </TouchableOpacity> */}

        <View style={styles.dividerLine} />

        <View style={styles.assistanceContainer}>
          <View>
            <Text style={styles.assistanceH2}>Need Assistance?</Text>
            <Text style={styles.assistanceH4}>Contact your community manager</Text>
          </View>
          <View style={styles.iconsContainer}>
            <Ionicons name="call" size={24} color="#4f4ada" style={styles.icon} />
            <MaterialIcons name="email" size={24} color="#4f4ada" style={styles.icon} />
          </View>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.switchText}>Don’t have an account? Register</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#4f4ada',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
  },
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  h3: {
    fontSize: 16,
    color: 'white',
  },
  container: {
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  label: {
    marginBottom: 5,
    fontWeight: '500',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    marginLeft: 5,
    fontSize: 14,
  },
  optionTextRight: {
    fontSize: 14,
    color: '#4f4ada',
  },
  loginButton: {
    backgroundColor: '#4f4ada',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    marginHorizontal: 10,
    color: '#555',
    fontWeight: '600',
  },
  otpButton: {
    backgroundColor: '#e0e0e0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  otpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 20,
  },
  assistanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  assistanceH2: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  assistanceH4: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  iconsContainer: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 15,
  },
  switchText: {
    marginTop: 15,
    textAlign: 'center',
    color: 'black',
  },
});

export default LoginScreen;
