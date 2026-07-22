import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen      from '../screens/splash/SplashScreen';
import WelcomeScreen     from '../screens/onboarding/WelcomeScreen';
import OnboardingScreen  from '../screens/onboarding/OnboardingScreen';
import AuthNavigator     from './AuthNavigator';
import DrawerNavigator   from './DrawerNavigator';
import { AuthContext }   from '../context/AuthContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, loading, welcomeCompleted, onboardingCompleted } = useContext(AuthContext);

  if (loading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  // ─── Unauthenticated flow ────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Always mount both Welcome + Auth so navigation between them works */}
        {!welcomeCompleted && (
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        )}
        <Stack.Screen name="Auth" component={AuthNavigator} />
      </Stack.Navigator>
    );
  }

  // ─── Authenticated flow ──────────────────────────────────────────────────────
  if (!onboardingCompleted) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={DrawerNavigator} />
    </Stack.Navigator>
  );
}
