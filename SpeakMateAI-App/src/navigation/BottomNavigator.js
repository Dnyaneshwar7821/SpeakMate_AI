import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DashboardScreen from '../screens/main/DashboardScreen';
import SpeakingStackNavigator from './SpeakingStackNavigator';
import ChatStackNavigator from './ChatStackNavigator';
import ProfileScreen   from '../screens/main/ProfileScreen';

import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();

const TAB_CONFIG = {
  Dashboard: { iconOutline: 'home-outline',           iconFilled: 'home',           label: 'Home' },
  Speaking:  { iconOutline: 'mic-outline',             iconFilled: 'mic',            label: 'Speak' },
  AIChat:    { iconOutline: 'sparkles-outline',        iconFilled: 'sparkles',       label: 'AI' },
  Profile:   { iconOutline: 'person-circle-outline',   iconFilled: 'person-circle',  label: 'Profile' },
};

export default function BottomNavigator() {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 0);
  const tabBarHeight = (Platform.OS === 'ios' ? 60 : 60) + bottomInset;

  const activeBarBg = isDark ? '#1E293B' : '#FFFFFF';
  const activeBorderColor = isDark ? '#334155' : '#E2E8F0';
  const inactiveText = isDark ? '#64748B' : '#94A3B8';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const cfg = TAB_CONFIG[route.name];
        return {
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: inactiveText,
          tabBarStyle: [
            styles.tabBar,
            {
              backgroundColor: activeBarBg,
              borderTopColor: activeBorderColor,
              height: tabBarHeight,
              paddingBottom: bottomInset + 4,
            }
          ],
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? cfg.iconFilled : cfg.iconOutline}
              color={color}
              size={focused ? size + 2 : size}
            />
          ),
          tabBarLabel: cfg?.label ?? route.name,
        };
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Speaking"  component={SpeakingStackNavigator}    />
      <Tab.Screen name="AIChat"    component={ChatStackNavigator}    options={{ title: 'AI Chat' }} />
      <Tab.Screen name="Profile"   component={ProfileScreen}   />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    paddingTop: 6,
    borderTopWidth: 1,
    elevation: 16,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
});
