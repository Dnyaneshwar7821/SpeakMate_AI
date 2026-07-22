import React, { useContext, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'Welcome to SpeakMateAI',
    description: 'Practice English naturally and build real speaking confidence.',
    icon: 'sparkles-outline',
  },
  {
    title: 'Improve Speaking',
    description: 'Engage in realistic interactive conversations with our advanced AI.',
    icon: 'chatbubbles-outline',
  },
  {
    title: 'Improve Pronunciation',
    description: 'Receive instant feedback on grammar, vocabulary, and pronunciation.',
    icon: 'mic-outline',
  },
  {
    title: 'Personalized Learning',
    description: 'Set daily goals, follow custom roadmaps, and track your progress.',
    icon: 'trending-up-outline',
  },
  {
    title: 'Start Learning Today',
    description: 'Join SpeakMateAI today and unlock your global potential.',
    icon: 'rocket-outline',
  },
];

export default function WelcomeScreen({ navigation }) {
  const { completeWelcome } = useContext(AuthContext);
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  const goTo = async (screen) => {
    navigation.navigate('Auth', { screen });
    setTimeout(() => {
      completeWelcome();
    }, 500);
  };

  const next = async () => {
    if (isLast) {
      await goTo('Register');
      return;
    }
    Animated.sequence([
      Animated.timing(fade, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
    setIndex((current) => current + 1);
  };

  const indicators = useMemo(() => SLIDES.map((item, slideIndex) => (
    <View key={item.title} style={[styles.dot, slideIndex === index && styles.dotActive]} />
  )), [index]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0F172A', '#1E1B4B', '#3730A3']} style={styles.background}>
        <SafeAreaView style={styles.safe}>
          {!isLast && (
            <TouchableOpacity style={styles.skipTop} onPress={() => goTo('Login')}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}

          <Animated.View style={[styles.content, { opacity: fade }]}>
            <LinearGradient colors={['rgba(255,255,255,0.24)', 'rgba(255,255,255,0.08)']} style={styles.illustration}>
              <Ionicons name={slide.icon} size={72} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </Animated.View>

          <View style={styles.footer}>
            <View style={styles.dots}>{indicators}</View>
            
            {isLast ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => goTo('Register')} style={styles.primaryButton}>
                  <Text style={styles.primaryText}>Create Account</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => goTo('Login')} style={styles.secondaryButton}>
                  <Text style={styles.secondaryText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.buttonContainer}>
                <Pressable onPress={next} style={styles.primaryButton}>
                  <Text style={styles.primaryText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  background: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24 },
  skipTop: { alignSelf: 'flex-end', paddingVertical: 12, paddingHorizontal: 6 },
  skipText: { color: 'rgba(255,255,255,0.78)', fontWeight: '800', fontSize: 15 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  illustration: {
    width: Math.min(190, width * 0.46),
    height: Math.min(190, width * 0.46),
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.24)',
    marginBottom: 38,
  },
  title: { color: '#FFFFFF', fontSize: 32, lineHeight: 38, fontWeight: '900', textAlign: 'center' },
  description: { color: 'rgba(255,255,255,0.76)', fontSize: 17, lineHeight: 25, textAlign: 'center', marginTop: 14 },
  footer: { paddingBottom: 26 },
  dots: { flexDirection: 'row', alignSelf: 'center', gap: 8, marginBottom: 22 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.28)' },
  dotActive: { width: 24, backgroundColor: '#FFFFFF' },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  secondaryButton: {
    height: 54,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});

