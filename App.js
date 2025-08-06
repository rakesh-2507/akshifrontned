import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';

const loadFonts = () =>
  Font.loadAsync({
    'Poppins-Black': require('./assets/fonts/Poppins-Black.ttf'),
    'Poppins-BlackItalic': require('./assets/fonts/Poppins-BlackItalic.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
    'Poppins-BoldItalic': require('./assets/fonts/Poppins-BoldItalic.ttf'),
    'Poppins-ExtraBold': require('./assets/fonts/Poppins-ExtraBold.ttf'),
    'Poppins-ExtraBoldItalic': require('./assets/fonts/Poppins-ExtraBoldItalic.ttf'),
    'Poppins-ExtraLight': require('./assets/fonts/Poppins-ExtraLight.ttf'),
    'Poppins-ExtraLightItalic': require('./assets/fonts/Poppins-ExtraLightItalic.ttf'),
    'Poppins-Italic': require('./assets/fonts/Poppins-Italic.ttf'),
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
  });

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      await loadFonts();
      setFontsLoaded(true);

      // Set default font for all Text components
      if (Text.defaultProps == null) Text.defaultProps = {};
      Text.defaultProps.style = { fontFamily: 'Poppins-Regular' };
    };

    prepare();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
