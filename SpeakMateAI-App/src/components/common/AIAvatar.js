import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Live2DAvatarView from '../avatar/Live2DAvatarView';

const FEMALE_AVATAR = require('../../../assets/images/tutor_female_anime.png');
const MALE_AVATAR   = require('../../../assets/images/tutor_male_anime.png');

const BAR_COUNT = 5;

export const STATE_CONFIG = {
  idle: {
    glow:      'rgba(139, 92, 246, 0.35)',
    innerRing: '#A78BFA',
    dot:       '#A855F7',
    label:     'Ready',
    pulseSpeed: 1800,
  },
  paused: {
    glow:      'rgba(245, 158, 11, 0.35)',
    innerRing: '#FCD34D',
    dot:       '#FBBF24',
    label:     'Paused',
    pulseSpeed: 2200,
  },
  listening: {
    glow:      'rgba(6, 182, 212, 0.55)',
    innerRing: '#67E8F9',
    dot:       '#22D3EE',
    label:     'Listening...',
    pulseSpeed: 900,
  },
  thinking: {
    glow:      'rgba(168, 85, 247, 0.5)',
    innerRing: '#C084FC',
    dot:       '#C084FC',
    label:     'Thinking...',
    pulseSpeed: 1200,
  },
  speaking: {
    glow:      'rgba(192, 132, 252, 0.65)',
    innerRing: '#F472B6',
    dot:       '#F472B6',
    label:     'Speaking',
    pulseSpeed: 450,
  },
};

// ── Animated Waveform Bar for Status Pill ─────────────────────────────────────
function WaveBar({ delay, isSpeaking }) {
  const anim = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    if (!isSpeaking) {
      Animated.timing(anim, { toValue: 0.25, duration: 200, useNativeDriver: true }).start();
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 240, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.2, duration: 240, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isSpeaking]);

  const scaleY = anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
  return <Animated.View style={[styles.waveBar, { transform: [{ scaleY }] }]} />;
}

// ── Thinking Animated Dots ────────────────────────────────────────────────────
function ThinkingDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createAnim = (val, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay(400),
        ])
      );

    const a1 = createAnim(dot1, 0);
    const a2 = createAnim(dot2, 150);
    const a3 = createAnim(dot3, 300);

    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={styles.dotsRow}>
      <Animated.View style={[styles.thinkingDot, { opacity: dot1, transform: [{ scale: dot1 }] }]} />
      <Animated.View style={[styles.thinkingDot, { opacity: dot2, transform: [{ scale: dot2 }] }]} />
      <Animated.View style={[styles.thinkingDot, { opacity: dot3, transform: [{ scale: dot3 }] }]} />
    </View>
  );
}

// ── Main AIAvatar Component (Full-Width Studio Avatar without clipping frames) ──
export default function AIAvatar({
  gender     = 'female',
  isSpeaking = false,
  state      = 'idle',
  expression,
  style,
  hideStatusPill = false,
  showOnlyPill = false,
  forceStatic = false,
}) {
  const isFemale      = String(gender).trim().toLowerCase() !== 'male';
  const targetModel   = isFemale ? 'haru' : 'chitose';
  const resolvedState = isSpeaking ? 'speaking' : state;
  const config        = STATE_CONFIG[resolvedState] || STATE_CONFIG.idle;
  const isHappy       = expression === 'happy' || expression === 'encouraging';

  const [useLive2D, setUseLive2D] = useState(!forceStatic);
  const [live2dReady, setLive2dReady] = useState(false);
  const [live2dError, setLive2dError] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('speakmate_avatar_mode').then((val) => {
      if (val === 'static') setUseLive2D(false);
      else if (!forceStatic) setUseLive2D(true);
    }).catch(() => {});
  }, [forceStatic]);

  // ── Animated Values ─────────────────────────────────────────────────────────
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim    = useRef(new Animated.Value(0)).current;

  // 1. Entrance Spring
  useEffect(() => {
    Animated.spring(entranceAnim, {
      toValue: 1,
      tension: 55,
      friction: 8.5,
      useNativeDriver: true,
    }).start();
  }, []);

  // 2. Idle Natural Breathing Motion (Subtle vertical floating)
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // 3. State Glow Pulse
  useEffect(() => {
    const duration = config.pulseSpeed;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [resolvedState]);

  // ── Interpolations ─────────────────────────────────────────────────────────
  const entranceScale   = entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] });
  const entranceOpacity = entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  // Floating: ±2.5px
  const floatY = breatheAnim.interpolate({ inputRange: [0, 1], outputRange: [-2.5, 2.5] });
  
  // Presence Scale
  const stateScale = resolvedState === 'listening' ? 1.02 : resolvedState === 'speaking' ? 1.015 : 1.0;
  const breatheScale = breatheAnim.interpolate({ inputRange: [0, 1], outputRange: [1.0, 1.01] });

  // Glow Opacity & Scale
  const glowScale   = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1.0, 1.08] });
  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: isSpeaking ? [0.65, 0.95] : resolvedState === 'listening' ? [0.55, 0.85] : [0.35, 0.6],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: entranceOpacity,
          transform: [{ scale: entranceScale }],
        },
      ]}
    >
      {/* ── STAGE WRAPPER (Full-Width, No Oval Borders) ── */}
      <View style={styles.stageWrapper}>
        
        {/* ── Soft Ambient Glow Behind Avatar (No hard borders) ── */}
        <Animated.View
          style={[
            styles.ambientGlow,
            {
              backgroundColor: config.glow,
              opacity: glowOpacity,
              transform: [{ scale: glowScale }, { translateY: floatY }],
            },
          ]}
        />

        {/* ── Full-Bust Avatar Canvas (Ponytail, Shoulders & Head 100% Unclipped) ── */}
        <Animated.View
          style={[
            styles.avatarContainer,
            {
              transform: [
                { translateY: floatY },
                { scale: Animated.multiply(breatheScale, new Animated.Value(stateScale)) },
              ],
            },
          ]}
        >
          {useLive2D && !live2dError ? (
            <Live2DAvatarView
              isSpeaking={isSpeaking}
              state={resolvedState}
              mood={isHappy ? 'happy' : 'neutral'}
              model={targetModel}
              style={styles.avatarCanvas}
              onLoaded={() => setLive2dReady(true)}
              onError={() => setLive2dError(true)}
            />
          ) : null}

          {(!useLive2D || !live2dReady || live2dError) && (
            <Image
              source={isFemale ? FEMALE_AVATAR : MALE_AVATAR}
              style={[styles.avatarCanvas, (useLive2D && live2dReady && !live2dError) && { display: 'none' }]}
              resizeMode="contain"
            />
          )}

          {/* Smooth Bottom Vignette to Taper Blazer into Dark Backdrop */}
          <LinearGradient
            pointerEvents="none"
            colors={['transparent', 'rgba(11, 15, 25, 0.4)', 'rgba(11, 15, 25, 0.95)']}
            locations={[0, 0.6, 1.0]}
            style={styles.bottomVignette}
          />
        </Animated.View>
      </View>

      {/* ── Glassmorphic State / Speaking Pill ── */}
      {!hideStatusPill && (
        <Animated.View
          style={[
            styles.statusPill,
            {
              borderColor: `${config.innerRing}55`,
              shadowColor: config.innerRing,
              transform: [{ translateY: floatY }],
            },
          ]}
        >
          {resolvedState === 'speaking' ? (
            <>
              <View style={styles.waveRow}>
                {Array.from({ length: BAR_COUNT }).map((_, i) => (
                  <WaveBar key={i} delay={i * 70} isSpeaking={isSpeaking} />
                ))}
              </View>
              <Text style={[styles.statusText, { color: '#F3E8FF' }]}>Speaking</Text>
            </>
          ) : resolvedState === 'thinking' ? (
            <>
              <ThinkingDots />
              <Text style={[styles.statusText, { color: '#E9D5FF' }]}>Thinking</Text>
            </>
          ) : (
            <>
              <View style={[styles.statusDot, { backgroundColor: config.dot, shadowColor: config.dot }]} />
              <Text style={[styles.statusText, { color: '#E9D5FF' }]}>{config.label}</Text>
            </>
          )}
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ── Full-Bust Dimensions (Wide & Generous to Prevent Any Clipping) ────────────
const AVATAR_WIDTH = 290; // Ample width for full ponytail & both shoulders
const AVATAR_HEIGHT = 205; // Generous height for full head & hair clearance

const styles = StyleSheet.create({
  container: {
    width:          '100%',
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
  },

  stageWrapper: {
    width:          AVATAR_WIDTH,
    height:         AVATAR_HEIGHT,
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
    overflow:       'visible',
  },

  // 1. Soft Ambient Radial Glow (Behind Avatar, No Lines)
  ambientGlow: {
    position:      'absolute',
    width:         180,
    height:        180,
    borderRadius:  90,
    shadowOpacity: 1,
    shadowRadius:  45,
    elevation:     8,
  },

  // 2. Avatar Container & Canvas (Unclipped)
  avatarContainer: {
    width:           AVATAR_WIDTH,
    height:          AVATAR_HEIGHT,
    alignItems:      'center',
    justifyContent:  'center',
    position:        'relative',
    overflow:        'hidden',
  },
  avatarCanvas: {
    width:    AVATAR_WIDTH,
    height:   AVATAR_HEIGHT,
  },
  bottomVignette: {
    position: 'absolute',
    left:     0,
    right:    0,
    bottom:   0,
    height:   52,
  },

  // 3. Glassmorphic Status Pill
  statusPill: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               8,
    marginTop:         6,
    minWidth:          120,
    paddingHorizontal: 15,
    paddingVertical:   6.5,
    borderRadius:      22,
    backgroundColor:   'rgba(15, 23, 42, 0.85)',
    borderWidth:       1.5,
    shadowOpacity:     0.4,
    shadowRadius:      10,
    shadowOffset:      { width: 0, height: 2 },
    elevation:         6,
  },
  statusDot: {
    width:        8,
    height:       8,
    borderRadius: 4,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize:      12,
    fontWeight:    '800',
    letterSpacing: 0.3,
  },
  waveRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           3,
    height:        16,
  },
  waveBar: {
    width:           3,
    height:          16,
    borderRadius:    2,
    backgroundColor: '#F472B6',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  thinkingDot: {
    width:           5,
    height:          5,
    borderRadius:    2.5,
    backgroundColor: '#C084FC',
  },
});
