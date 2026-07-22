/**
 * LessonsStackNavigator
 *
 * Wraps LessonsScreen and LessonDetailScreen in a native stack so that
 * pressing Back on LessonDetail returns to LessonsScreen — not the Dashboard.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LessonsScreen      from '../screens/main/LessonsScreen';
import LessonDetailScreen from '../screens/main/LessonDetailScreen';

const Stack = createNativeStackNavigator();

export default function LessonsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LessonsList"  component={LessonsScreen}      />
      <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
    </Stack.Navigator>
  );
}
