import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AIChatScreen           from '../screens/main/AIChatScreen';
import ConversationChatScreen from '../screens/main/ConversationChatScreen';

const Stack = createNativeStackNavigator();

export default function ChatStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AIChatHome"        component={AIChatScreen} />
      <Stack.Screen name="ConversationChat"  component={ConversationChatScreen} />
    </Stack.Navigator>
  );
}
