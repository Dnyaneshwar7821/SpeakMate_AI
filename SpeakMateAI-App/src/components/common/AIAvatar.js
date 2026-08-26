/**
 * AIAvatar — Single Oval Avatar
 *
 * Shows ONE avatar at a time (male or female) based on the `gender` prop.
 * Gender is controlled from the app Settings screen (AI Voice selection).
 *
 * Speaking state: bright purple neon oval glow + expanding ripple rings + waveform pill
 * Listening state: cyan glow, subtle nod
 * Thinking state: purple glow, tilted, animated dots
 * Idle state: calm slow purple pulse
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Live2DAvatarView from '../avatar/Live2DAvatarView';

const FEMALE_AVATAR = require('../../../assets/images/tutor_female_anime.png');
const MALE_AVATAR   = require('../../../assets/images/tutor_male_anime.png');

const BAR_COUNT  = 5;
const RING_COUNT = 3;

const STATE_COLORS = {
  idle: {
    glow:  'rgba(139, 92, 246, 0.5)',
    ring:  '#7C3AED',
    dot:   '#8B5CF6',
    label: 'Ready',
  },
  paused: {
    glow:  'rgba(245, 158, 11, 0.5)',
    ring:  '#F59E0B',
    dot:   '#FBBF24',
    label: 'Paused',
  },
  listening: {
    glow:  'rgba(34, 211, 238, 0.5)',
    ring:  '#06B6D4',
    dot:   '#22D3EE',
    label: 'Listening',
  },
  thinking: {
    glow:  'rgba(167, 139, 250, 0.55)',
    ring:  '#8B5CF6',
    dot:   '#A78BFA',
    label: 'Thinking',
  },
  speaking: {
    glow:  'rgba(139, 92, 246, 0.75)',
    ring:  '#9333EA',
    dot:   '#C084FC',
    label: 'Speaking',
  },
};

// ── Animated waveform bar ─────────────────────────────────────────────────────
function WaveBar({ delay, isSpeaking }) {
  const anim = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    if (!isSpeaking) {
      Animated.timing(anim, { toValue: 0.2, duration: 200, useNativeDriver: true }).start();
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1,   duration: 260, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.15, duration: 260, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isSpeaking]);

  const scaleY = anim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 1] });
  return <Animated.View style={[styles.waveBar, { transform: [{ scaleY }] }]} />;
}

// ── Main component ────────────────────────────────────────────────────────────
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
  const colors        = STATE_COLORS[resolvedState] || STATE_COLORS.idle;
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

  // ── Animated values ─────────────────────────────────────────────────────────
  const floatAnim   = useRef(new Animated.Value(0)).current;
  const glowAnim    = useRef(new Animated.Value(0)).current;
  const nodAnim     = useRef(new Animated.Value(0)).current;
  const smileAnim   = useRef(new Animated.Value(0)).current;
  const ringAnims   = useRef(
    Array.from({ length: RING_COUNT }, () => new Animated.Value(0))
  ).current;
  const [dotCount, setDotCount] = useState(0);



  // Float
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Glow pulse — faster while speaking
  useEffect(() => {
    const speed = isSpeaking ? 480 : 1400;
    const loop  = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: speed, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: speed, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isSpeaking]);

  // Ripple rings — only while speaking
  useEffect(() => {
    if (!isSpeaking) {
      ringAnims.forEach((a) => a.setValue(0));
      return;
    }
    const loops = ringAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 340),
          Animated.timing(anim, { toValue: 1, duration: 850, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 80,  useNativeDriver: true }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [isSpeaking]);

  // Nod (listening) / tilt (thinking)
  useEffect(() => {
    let loop;
    if (resolvedState === 'listening') {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(nodAnim, { toValue: 1,  duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(nodAnim, { toValue: 0,  duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      loop.start();
    } else {
      Animated.timing(nodAnim, {
        toValue:         resolvedState === 'thinking' ? -1 : 0,
        duration:        280,
        useNativeDriver: true,
      }).start();
    }
    return () => { if (loop) loop.stop(); };
  }, [resolvedState]);

  // Happy bounce
  useEffect(() => {
    Animated.spring(smileAnim, { toValue: isHappy ? 1 : 0, tension: 42, friction: 7, useNativeDriver: true }).start();
  }, [isHappy]);

  // Thinking dots
  useEffect(() => {
    if (resolvedState !== 'thinking') { setDotCount(0); return; }
    const id = setInterval(() => setDotCount((n) => (n + 1) % 4), 400);
    return () => clearInterval(id);
  }, [resolvedState]);

  // ── Interpolations ──────────────────────────────────────────────────────────
  const floatY      = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] });
  const glowScale   = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, isSpeaking ? 1.08 : 1.03] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  const nodRotate   = nodAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-3deg', '0deg', '2.5deg'] });
  const smileScale  = smileAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });

  const statusLabel =
    resolvedState === 'thinking'
      ? `Thinking${'.'.repeat(dotCount)}`
      : colors.label;

  if (showOnlyPill) {
    return (
      <View style={[styles.statusPillContainer, style]}>
        <View style={[styles.statusPill, { borderColor: `${colors.ring}55`, marginTop: 0 }]}>
          {resolvedState === 'speaking' ? (
            <>
              <View style={styles.waveRow}>
                {Array.from({ length: BAR_COUNT }).map((_, i) => (
                  <WaveBar key={i} delay={i * 75} isSpeaking={isSpeaking} />
                ))}
              </View>
              <Text style={[styles.statusText, { color: '#E9D5FF' }]}>Speaking</Text>
            </>
          ) : (
            <>
              <View style={[styles.statusDot, { backgroundColor: colors.dot }]} />
              <Text style={[styles.statusText, { color: '#E9D5FF' }]}>{statusLabel}</Text>
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Deep space background */}
      <LinearGradient
        colors={['#060B1A', '#0C1230', '#0D0A25']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Decorative star dots */}
      <View style={styles.star1} /><View style={styles.star2} />
      <View style={styles.star3} /><View style={styles.star4} />
      <View style={styles.star5} /><View style={styles.star6} />

      {/* ── Ripple rings (speaking only) ── */}
      {ringAnims.map((anim, i) => {
        const scale   = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35 + i * 0.18] });
        const opacity = anim.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 0.55, 0] });
        return (
          <Animated.View
            key={i}
            style={[
              styles.rippleRing,
              {
                borderColor: colors.ring,
                transform:   [{ scale }],
                opacity,
              },
            ]}
          />
        );
      })}

      {/* ── Outer neon glow ring (behind frame) ── */}
      <Animated.View
        style={[
          styles.glowOval,
          {
            borderColor: colors.ring,
            shadowColor: colors.ring,
            opacity:     glowOpacity,
            transform:   [{ scale: glowScale }, { translateY: floatY }],
          },
        ]}
      />

      {/* ── Avatar circular frame ── */}
      <Animated.View
        style={[
          styles.avatarOval,
          {
            borderColor: colors.ring,
            shadowColor: colors.ring,
            transform:   [
              { translateY: floatY },
              { rotate: nodRotate },
              { scale: smileScale },
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
            style={styles.avatarImg}
            onLoaded={() => setLive2dReady(true)}
            onError={() => setLive2dError(true)}
          />
        ) : null}

        {(!useLive2D || !live2dReady || live2dError) && (
          <Image
            source={isFemale ? FEMALE_AVATAR : MALE_AVATAR}
            style={[styles.avatarImg, (useLive2D && live2dReady && !live2dError) && { display: 'none' }]}
            resizeMode="cover"
          />
        )}

        {/* Inner shimmer border while speaking */}
        {isSpeaking && (
          <Animated.View
            style={[
              styles.innerShimmer,
              { borderColor: colors.ring, opacity: glowOpacity },
            ]}
          />
        )}

        {/* Soft bottom vignette for natural torso blend */}
        <LinearGradient
          pointerEvents="none"
          colors={['transparent', 'rgba(13, 17, 48, 0.4)', 'rgba(13, 17, 48, 0.92)']}
          style={styles.bottomVignette}
        />
      </Animated.View>

      {/* ── Status / Speaking pill ── */}
      {!hideStatusPill && (
        <View style={[styles.statusPill, { borderColor: `${colors.ring}65` }]}>
          {resolvedState === 'speaking' ? (
            <>
              <View style={styles.waveRow}>
                {Array.from({ length: BAR_COUNT }).map((_, i) => (
                  <WaveBar key={i} delay={i * 75} isSpeaking={isSpeaking} />
                ))}
              </View>
              <Text style={[styles.statusText, { color: '#E9D5FF' }]}>Speaking</Text>
            </>
          ) : (
            <>
              <View style={[styles.statusDot, { backgroundColor: colors.dot }]} />
              <Text style={[styles.statusText, { color: '#E9D5FF' }]}>{statusLabel}</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

// ── Circular Avatar Stage Dimensions ──────────────────────────────────────────
const AVATAR_SIZE = 164; // Perfectly proportioned circular portrait stage

const styles = StyleSheet.create({
  container: {
    width:          '100%',
    height:         '100%',
    alignItems:     'center',
    justifyContent: 'center',
  },

  // Starfield
  star1: { position: 'absolute', width: 2,   height: 2,   borderRadius: 1, backgroundColor: '#FFF',    opacity: 0.55, top: 12,  left: 36 },
  star2: { position: 'absolute', width: 1.5, height: 1.5, borderRadius: 1, backgroundColor: '#FFF',    opacity: 0.4,  top: 28,  right: 48 },
  star3: { position: 'absolute', width: 2.5, height: 2.5, borderRadius: 2, backgroundColor: '#A78BFA', opacity: 0.65, top: 8,   left: '55%' },
  star4: { position: 'absolute', width: 1.5, height: 1.5, borderRadius: 1, backgroundColor: '#FFF',    opacity: 0.35, bottom: 30, right: 38 },
  star5: { position: 'absolute', width: 2,   height: 2,   borderRadius: 1, backgroundColor: '#818CF8', opacity: 0.5,  top: 40,  right: 24 },
  star6: { position: 'absolute', width: 1.5, height: 1.5, borderRadius: 1, backgroundColor: '#FFF',    opacity: 0.3,  bottom: 50, left: 30 },

  // Ripple rings
  rippleRing: {
    position:     'absolute',
    width:        AVATAR_SIZE + 32,
    height:       AVATAR_SIZE + 32,
    borderRadius: (AVATAR_SIZE + 32) / 2,
    borderWidth:  1.5,
  },

  // Neon glow ring (behind frame)
  glowOval: {
    position:      'absolute',
    width:         AVATAR_SIZE + 20,
    height:        AVATAR_SIZE + 20,
    borderRadius:  (AVATAR_SIZE + 20) / 2,
    borderWidth:   2,
    shadowOpacity: 1,
    shadowRadius:  24,
    elevation:     14,
  },

  // Photo frame
  avatarOval: {
    width:           AVATAR_SIZE,
    height:          AVATAR_SIZE,
    borderRadius:    AVATAR_SIZE / 2,
    borderWidth:     3,
    overflow:        'hidden',
    backgroundColor: '#0D1130',
    shadowOpacity:   0.85,
    shadowRadius:    20,
    shadowOffset:    { width: 0, height: 0 },
    elevation:       10,
    marginBottom:    4,
  },
  avatarImg: {
    width:    AVATAR_SIZE,
    height:   AVATAR_SIZE,
    position: 'absolute',
    top:      0,
    left:     0,
  },
  innerShimmer: {
    position:     'absolute',
    top:          2,
    left:         2,
    right:        2,
    bottom:       2,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth:  1.5,
  },
  bottomVignette: {
    position: 'absolute',
    left:     0,
    right:    0,
    bottom:   0,
    height:   44,
  },

  statusPillContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  // Status pill
  statusPill: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               8,
    marginTop:         8,
    minWidth:          116,
    paddingHorizontal: 14,
    paddingVertical:   6,
    borderRadius:      20,
    backgroundColor:   'rgba(15, 23, 42, 0.85)',
    borderWidth:       1.5,
    shadowColor:       '#000',
    shadowOpacity:     0.35,
    shadowRadius:      8,
    elevation:         4,
  },
  statusDot: {
    width:        8,
    height:       8,
    borderRadius: 4,
  },
  statusText: {
    fontSize:   12,
    fontWeight: '800',
    minWidth:   54,
  },

  // Waveform bars
  waveRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           3,
    height:        18,
  },
  waveBar: {
    width:           3,
    height:          16,
    borderRadius:    2,
    backgroundColor: '#A78BFA',
  },
});
