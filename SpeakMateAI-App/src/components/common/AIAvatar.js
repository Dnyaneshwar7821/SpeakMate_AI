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
    glowCenter: 'rgba(139, 92, 246, 0.16)',
    glowOuter:  'rgba(139, 92, 246, 0.0)',
    ring:       'rgba(167, 139, 250, 0.35)',
    ringGlow:   '#8B5CF6',
    dot:        '#A855F7',
    label:      'Ready',
    pulseSpeed: 2800,
  },
  paused: {
    glowCenter: 'rgba(245, 158, 11, 0.16)',
    glowOuter:  'rgba(245, 158, 11, 0.0)',
    ring:       'rgba(252, 211, 77, 0.35)',
    ringGlow:   '#F59E0B',
    dot:        '#FBBF24',
    label:      'Paused',
    pulseSpeed: 3000,
  },
  listening: {
    glowCenter: 'rgba(6, 182, 212, 0.28)',
    glowOuter:  'rgba(6, 182, 212, 0.0)',
    ring:       'rgba(103, 232, 249, 0.65)',
    ringGlow:   '#06B6D4',
    dot:        '#22D3EE',
    label:      'Listening...',
    pulseSpeed: 1000,
  },
  thinking: {
    glowCenter: 'rgba(168, 85, 247, 0.25)',
    glowOuter:  'rgba(168, 85, 247, 0.0)',
    ring:       'rgba(192, 132, 252, 0.55)',
    ringGlow:   '#9333EA',
    dot:        '#C084FC',
    label:      'Thinking...',
    pulseSpeed: 1400,
  },
  speaking: {
    glowCenter: 'rgba(192, 132, 252, 0.32)',
    glowOuter:  'rgba(192, 132, 252, 0.0)',
    ring:       'rgba(244, 114, 182, 0.7)',
    ringGlow:   '#F472B6',
    dot:        '#F472B6',
    label:      'Speaking',
    pulseSpeed: 500,
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

// ── Main AIAvatar Component (Master Polish & Motion) ──────────────────────────
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
  const ringPulseAnim = useRef(new Animated.Value(0)).current;

  // 1. Entrance Spring (Smooth, Fast)
  useEffect(() => {
    Animated.spring(entranceAnim, {
      toValue: 1,
      tension: 65,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, []);

  // 2. Idle Natural Breathing Motion (Slow, Organic Floating)
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // 3. State Ambient Glow Pulse
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

  // 4. Subtle Circular Ring Pulse
  useEffect(() => {
    const isDynamic = isSpeaking || resolvedState === 'listening';
    const duration = isSpeaking ? 600 : resolvedState === 'listening' ? 1100 : 2800;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulseAnim, {
          toValue: 1,
          duration,
          easing: isDynamic ? Easing.out(Easing.cubic) : Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ringPulseAnim, {
          toValue: 0,
          duration,
          easing: isDynamic ? Easing.in(Easing.cubic) : Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isSpeaking, resolvedState]);

  // ── Interpolations ─────────────────────────────────────────────────────────
  const entranceScale   = entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] });
  const entranceOpacity = entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  // Floating: ±2.0px
  const floatY = breatheAnim.interpolate({ inputRange: [0, 1], outputRange: [-2.0, 2.0] });
  
  // Presence Scale
  const stateScale = resolvedState === 'listening' ? 1.02 : resolvedState === 'speaking' ? 1.015 : 1.0;
  const breatheScale = breatheAnim.interpolate({ inputRange: [0, 1], outputRange: [1.0, 1.008] });

  // Glow Opacity & Scale (Soft, never a solid disk)
  const glowScale   = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1.0, 1.08] });
  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: isSpeaking ? [0.8, 1.0] : resolvedState === 'listening' ? [0.7, 0.95] : [0.45, 0.75],
  });

  // Perfect Circular Ring Expansion
  const ringScale = ringPulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: isSpeaking ? [1.0, 1.06] : resolvedState === 'listening' ? [1.0, 1.04] : [1.0, 1.02],
  });
  const ringOpacity = ringPulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: isSpeaking ? [0.6, 0.95] : resolvedState === 'listening' ? [0.5, 0.85] : [0.25, 0.45],
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
      {/* ── STAGE WRAPPER (Centered & Responsive) ── */}
      <View style={styles.stageWrapper}>
        
        {/* ── Layer 1: Soft Ambient Radial Glow (Diffused Light, No Solid Disk) ── */}
        <Animated.View
          style={[
            styles.ambientGlowContainer,
            {
              opacity: glowOpacity,
              transform: [{ scale: glowScale }, { translateY: floatY }],
            },
          ]}
        >
          <LinearGradient
            colors={[config.glowCenter, config.glowOuter]}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
            style={styles.diffuseGlowGradient}
          />
        </Animated.View>

        {/* ── Layer 2: Perfect Circular Activity Ring (Centered, Subtle) ── */}
        <Animated.View
          style={[
            styles.circularRing,
            {
              borderColor: config.ring,
              shadowColor: config.ringGlow,
              opacity: ringOpacity,
              transform: [{ scale: ringScale }, { translateY: floatY }],
            },
          ]}
        />

        {/* ── Layer 3: Unclipped Full-Bust Avatar Canvas ── */}
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

          {/* Layer 4: Multi-Stop Smooth Torso & Corner Fade Mask (Eliminates All Cutoffs) */}
          <LinearGradient
            pointerEvents="none"
            colors={[
              'transparent',
              'rgba(11, 15, 25, 0.15)',
              'rgba(11, 15, 25, 0.65)',
              '#0B0F19',
              '#0B0F19'
            ]}
            locations={[0, 0.35, 0.70, 0.92, 1.0]}
            style={styles.bottomTorsoFade}
          />
        </Animated.View>
      </View>

      {/* ── Layer 5: Glassmorphic State / Speaking Pill ── */}
      {!hideStatusPill && (
        <Animated.View
          style={[
            styles.statusPill,
            {
              borderColor: `${config.ringGlow}40`,
              shadowColor: config.ringGlow,
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

// ── Target Stage Dimensions (165-175px focal stage, 280px unclipped bust) ─────
const STAGE_RING_SIZE = 170; // Perfect 170px Circular Activity Ring
const AVATAR_WIDTH    = 280; // Ample width for full ponytail & both shoulders
const AVATAR_HEIGHT   = 200; // Generous height with natural headroom

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

  // 1. Diffused Soft Ambient Glow (No Solid Color Disk)
  ambientGlowContainer: {
    position:        'absolute',
    width:           STAGE_RING_SIZE + 40,
    height:          STAGE_RING_SIZE + 40,
    borderRadius:    (STAGE_RING_SIZE + 40) / 2,
    alignItems:      'center',
    justifyContent:  'center',
    overflow:        'hidden',
  },
  diffuseGlowGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: (STAGE_RING_SIZE + 40) / 2,
  },

  // 2. Perfect Circular Ring (Centered, 170px Diameter)
  circularRing: {
    position:      'absolute',
    width:         STAGE_RING_SIZE,
    height:        STAGE_RING_SIZE,
    borderRadius:  STAGE_RING_SIZE / 2,
    borderWidth:   1.5,
    shadowOpacity: 0.6,
    shadowRadius:  14,
    shadowOffset:  { width: 0, height: 0 },
    elevation:     4,
  },

  // 3. Avatar Container & Canvas
  avatarContainer: {
    width:           AVATAR_WIDTH,
    height:          AVATAR_HEIGHT,
    alignItems:      'center',
    justifyContent:  'center',
    position:        'relative',
    overflow:        'hidden',
    backgroundColor: 'transparent',
  },
  avatarCanvas: {
    width:           AVATAR_WIDTH,
    height:          AVATAR_HEIGHT,
    backgroundColor: 'transparent',
  },

  // 4. Smooth Torso & Corner Fade (80px Tall Multi-Stop Mask)
  bottomTorsoFade: {
    position: 'absolute',
    left:     0,
    right:    0,
    bottom:   0,
    height:   76,
  },

  // 5. Glassmorphic Status Pill
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
    shadowOpacity:     0.35,
    shadowRadius:      8,
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
