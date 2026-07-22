import './global.css';
import React, { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { AuthProvider } from './src/context/AuthContext';
import { DrawerProvider } from './src/context/DrawerContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { usePushNotifications } from './src/hooks/usePushNotifications';
import AppNavigator from './src/navigation/AppNavigator';
import api from './src/api/api';

// ─── Error Boundary ──────────────────────────────────────────────────────────
// Catches React render/lifecycle errors and shows them on screen instead of
// crashing silently back to Expo Go home.
class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] caught:', error.message);
    console.error('[ErrorBoundary] stack:', error.stack);
    console.error('[ErrorBoundary] component stack:', info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 60 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#dc2626', marginBottom: 12 }}>
            ❌ App Error — share this with the developer
          </Text>
          <ScrollView>
            <Text style={{ color: '#111', fontSize: 13, fontFamily: 'monospace' }}>
              {this.state.error?.message}
            </Text>
            <Text style={{ color: '#555', fontSize: 11, marginTop: 12, fontFamily: 'monospace' }}>
              {this.state.error?.stack}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}
// ─────────────────────────────────────────────────────────────────────────────

const linking = {
  prefixes: [Linking.createURL('/'), 'speakmateai://', 'https://speakmateai.com'],
  config: {
    screens: {
      Auth: {
        path: 'auth',
        screens: {
          ResetPassword: 'reset-password',
        },
      },
    },
  },
};

// Inner component so hooks work inside providers
function AppContent() {
  usePushNotifications();
  return <AppNavigator />;
}

export default function App() {
  useEffect(() => {
    const registerExpoUrl = async () => {
      try {
        const url = Linking.createURL('/');
        console.log('[Registering Expo URL with Backend]:', url);
        await api.post('/api/users/register-expo-url', { url });
      } catch (err) {
        console.warn('Failed to register Expo URL with backend:', err.message);
      }
    };
    registerExpoUrl();
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider>
            <NotificationProvider>
              <DrawerProvider>
                <NavigationContainer linking={linking}>
                  <AppContent />
                </NavigationContainer>
              </DrawerProvider>
            </NotificationProvider>
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
