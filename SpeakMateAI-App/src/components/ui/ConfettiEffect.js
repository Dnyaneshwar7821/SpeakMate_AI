import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONFETTI_COUNT = 45;

const CONFETTI_COLORS = [
  '#F59E0B', '#10B981', '#6366F1', '#EC4899', '#3B82F6',
  '#8B5CF6', '#F43F5E', '#14B8A6', '#FACC15', '#A855F7'
];

function ConfettiParticle({ color, index }) {
  const animatedY = useRef(new Animated.Value(-40)).current;
  const animatedX = useRef(new Animated.Value(0)).current;
  const animatedScale = useRef(new Animated.Value(0.2)).current;
  const animatedRotate = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(1)).current;

  const startX = useRef(Math.random() * SCREEN_WIDTH).current;
  const driftX = useRef((Math.random() - 0.5) * 160).current;
  const targetY = useRef(SCREEN_HEIGHT * (0.6 + Math.random() * 0.35)).current;
  const duration = useRef(2200 + Math.random() * 1200).current;
  const delay = useRef((index % 8) * 80).current;
  const particleSize = useRef(8 + Math.random() * 8).current;
  const isCircle = useRef(index % 2 === 0).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(animatedY, {
          toValue: targetY,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(animatedX, {
          toValue: driftX,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.spring(animatedScale, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }),
          Animated.timing(animatedScale, {
            toValue: 0.8,
            duration: duration - 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(animatedRotate, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(animatedOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(animatedOpacity, {
            toValue: 0,
            duration: duration - 200,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, []);

  const spin = animatedRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${360 + Math.random() * 720}deg`],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          left: startX,
          width: particleSize,
          height: isCircle ? particleSize : particleSize * 1.6,
          borderRadius: isCircle ? particleSize / 2 : 2,
          backgroundColor: color,
          opacity: animatedOpacity,
          transform: [
            { translateY: animatedY },
            { translateX: animatedX },
            { scale: animatedScale },
            { rotate: spin },
          ],
        },
      ]}
    />
  );
}

export default function ConfettiEffect({ active, onComplete }) {
  if (!active) return null;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
        <ConfettiParticle key={i} index={i} color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    elevation: 99999,
  },
  particle: {
    position: 'absolute',
    top: 0,
  },
});
