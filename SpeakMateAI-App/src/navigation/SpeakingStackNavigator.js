/**
 * SpeakingStackNavigator
 *
 * Groups all Speaking Practice screens:
 * - SpeakingHomeScreen (Speaking Dashboard / Scenario Browser)
 * - ConversationScreen (Live interactive voice chat)
 * - SpeakingSummaryScreen (Detailed post-session report)
 * - SpeakingHistoryDetailScreen (Replay of historical sessions)
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SpeakingHomeScreen          from '../screens/main/SpeakingHomeScreen';
import ConversationScreen         from '../screens/main/ConversationScreen';
import SpeakingSummaryScreen       from '../screens/main/SpeakingSummaryScreen';
import SpeakingHistoryDetailScreen from '../screens/main/SpeakingHistoryDetailScreen';

const Stack = createNativeStackNavigator();

export default function SpeakingStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SpeakingHome"          component={SpeakingHomeScreen}          />
      <Stack.Screen name="Conversation"          component={ConversationScreen}          />
      <Stack.Screen name="SpeakingSummary"       component={SpeakingSummaryScreen}       />
      <Stack.Screen name="SpeakingHistoryDetail" component={SpeakingHistoryDetailScreen} />
    </Stack.Navigator>
  );
}
