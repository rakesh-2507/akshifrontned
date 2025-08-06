// components/BubbleTabBar.js
import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, Animated, Dimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const tabs = [
  { name: 'Home', icon: 'home-outline', iconFocused: 'home' },
  { name: 'Gallery', icon: 'images-outline', iconFocused: 'images' },
  { name: 'Marketplace', icon: 'cart-outline', iconFocused: 'cart' },
  { name: 'Profile', icon: 'person-outline', iconFocused: 'person' },
];

const BubbleTabBar = ({ state, descriptors, navigation, onProfilePress }) => {
  const tabWidth = Dimensions.get('window').width / state.routes.length;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      bounciness: 10,
    }).start();
  }, [state.index]);

  return (
    <View style={styles.tabBarContainer}>
      <Animated.View
        style={[
          styles.bubble,
          {
            transform: [{ translateX }],
            width: tabWidth * 0.6,
            left: tabWidth * 0.2,
          },
        ]}
      />

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const iconName = tabs[index]?.[isFocused ? 'iconFocused' : 'icon'];

        const onPress = () => {
          if (route.name === 'Profile') {
            if (onProfilePress) onProfilePress(); // 👈 call the drawer open
          } else {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            onPress={onPress}
            style={styles.tab}
          >
            <Ionicons name={iconName} size={24} color={isFocused ? '#007AFF' : 'gray'} />
            <Text style={{ color: isFocused ? '#007AFF' : 'gray', fontSize: 12 }}>{route.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: 60,
    elevation: 10,
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    position: 'absolute',
    top: 6,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F0FF',
    zIndex: 0,
  },
});

export default BubbleTabBar;
