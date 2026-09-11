import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleY = useRef(new Animated.Value(20)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.8)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.sequence([
      // Logo scales + fades in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Title fades up
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(titleY, {
          toValue: 0,
          tension: 70,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Subtitle fades up
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(subtitleY, {
          toValue: 0,
          tension: 70,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Loading dots appear
      Animated.timing(dotsOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Infinite pulsing logo glow ring
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(glowScale, {
            toValue: 1.3,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowScale, {
            toValue: 0.8,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.6,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.2,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient
      colors={['#0F172A', '#1E1B4B', '#312E81', '#4F46E5']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.container}
    >
      {/* Decorative premium blurred ambient lights */}
      <View style={styles.ambientLight1} />
      <View style={styles.ambientLight2} />
      <View style={styles.ambientLight3} />

      {/* Logo Wrapper */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        {/* Glow Ring Behind Logo */}
        <Animated.View
          style={[
            styles.logoGlow,
            {
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />
        
        {/* Main Logo Container */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.08)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoGlass}
        >
          <LinearGradient
            colors={['#4F46E5', '#6366F1']}
            style={styles.logoInner}
          >
            <Text style={styles.logoText}>SM</Text>
          </LinearGradient>
        </LinearGradient>
      </Animated.View>

      {/* App Name */}
      <Animated.Text
        style={[
          styles.appName,
          {
            opacity: titleOpacity,
            transform: [{ translateY: titleY }],
          },
        ]}
      >
        SpeakMateAI
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text
        style={[
          styles.subtitle,
          {
            opacity: subtitleOpacity,
            transform: [{ translateY: subtitleY }],
          },
        ]}
      >
        Practice Smarter. Speak Better.
      </Animated.Text>

      {/* Bouncing Dots Loading Indicator */}
      <Animated.View style={[styles.dotsContainer, { opacity: dotsOpacity }]}>
        <LoadingDots />
      </Animated.View>
    </LinearGradient>
  );
}

// Bouncing dots loading indicator
function LoadingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -10, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      );

    Animated.parallel([
      bounce(dot1, 0),
      bounce(dot2, 150),
      bounce(dot3, 300),
    ]).start();
  }, []);

  return (
    <View style={styles.dots}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[styles.dot, { transform: [{ translateY: dot }] }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Ambient glow background decorations
  ambientLight1: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    top: -width * 0.3,
    right: -width * 0.2,
  },
  ambientLight2: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
    bottom: -width * 0.2,
    left: -width * 0.2,
  },
  ambientLight3: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(37, 99, 235, 0.06)',
    top: '35%',
    left: '10%',
  },
  // Logo styles
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logoGlass: {
    width: 110,
    height: 110,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  logoInner: {
    width: 90,
    height: 90,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  logoGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(99, 102, 241, 0.35)',
    zIndex: -1,
  },
  // Typography
  appName: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.4,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Dots Loading Indicator
  dotsContainer: {
    position: 'absolute',
    bottom: 80,
  },
  dots: {
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    opacity: 0.85,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
});
