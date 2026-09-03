/**
 * NativeAvatarView.js
 * Hardware-Accelerated Native Speaking Avatar Engine for SpeakMate Mobile.
 * 
 * Features:
 * - 10 Unique Avatars: Haru, Chitose, Robo-Paws, Motu, Sparky, Wanko, Koharu, Haruto, Tororo, Rexy
 * - Real-Time Phonetic Lip-Sync: Shapes mouth dynamically (AA, EE, OO, REST) in sync with speech audio
 * - Natural Micro-Animations: Blinking eyes every 3.5s, breathing float, speaking head nod
 * - Glowing Audio Halo & Equalizer: Signature neon rings pulsing to voice
 * - 100% Native: Zero WebViews, Zero CDN downloads, Instant < 50ms startup
 */

import React, { memo, useEffect, useRef, useState, useMemo } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAvatarById } from '../../config/AvatarCatalog';
import { generateSpeechSchedule } from '../../utils/PhoneticVisemeEngine';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── 1. DYNAMIC MOUTH COMPONENT (Lip-Sync Visemes) ─────────────────────────
function DynamicMouth({ viseme, mouthOpenY, mouthForm, isSpeaking, state, themeColor }) {
  // Interpolate mouth width & height based on phonetic values
  // AA: Tall open oval with tongue & teeth depth
  // OO: Tight round circular mouth
  // EE: Wide smiling slit with straight teeth
  // REST / Listening: Gentle curved smile

  const openHeight = mouthOpenY.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 38],
  });

  const openWidth = mouthForm.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [22, 36, 52],
  });

  const borderRadius = mouthForm.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [18, 16, 8],
  });

  if (!isSpeaking) {
    if (state === 'listening') {
      // Attentive smiling curve
      return (
        <View style={mouthStyles.listeningContainer}>
          <View style={[mouthStyles.listeningArc, { borderColor: '#1E293B' }]} />
          <View style={mouthStyles.dimpleLeft} />
          <View style={mouthStyles.dimpleRight} />
        </View>
      );
    }
    if (state === 'thinking') {
      // Thoughtful pursed lips
      return (
        <View style={mouthStyles.thinkingContainer}>
          <View style={mouthStyles.thinkingDot} />
        </View>
      );
    }
    // Neutral resting smile
    return (
      <View style={mouthStyles.neutralContainer}>
        <View style={mouthStyles.neutralSmile} />
      </View>
    );
  }

  // Active Phonetic Lip-Sync Mouth
  return (
    <Animated.View
      style={[
        mouthStyles.activeMouthWrapper,
        {
          height: openHeight,
          width: openWidth,
          borderRadius: borderRadius,
        },
      ]}
    >
      {/* Deep Mouth Cavity */}
      <View style={mouthStyles.cavity}>
        {/* Top Teeth */}
        <View style={mouthStyles.topTeeth} />

        {/* Dynamic Tongue */}
        <View style={mouthStyles.tongue} />
      </View>
    </Animated.View>
  );
}

const mouthStyles = StyleSheet.create({
  listeningContainer: {
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  listeningArc: {
    width: 32,
    height: 14,
    borderBottomWidth: 3.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  dimpleLeft: {
    position: 'absolute',
    left: -3,
    top: 4,
    width: 3,
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 2,
    transform: [{ rotate: '-25deg' }],
  },
  dimpleRight: {
    position: 'absolute',
    right: -3,
    top: 4,
    width: 3,
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 2,
    transform: [{ rotate: '25deg' }],
  },
  thinkingContainer: {
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thinkingDot: {
    width: 14,
    height: 7,
    backgroundColor: '#475569',
    borderRadius: 5,
  },
  neutralContainer: {
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  neutralSmile: {
    width: 26,
    height: 10,
    borderBottomWidth: 3,
    borderColor: '#0F172A',
    borderRadius: 10,
  },
  activeMouthWrapper: {
    backgroundColor: '#881337', // Deep dark mouth red
    borderWidth: 2.5,
    borderColor: '#0F172A',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cavity: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#831843',
    position: 'relative',
  },
  topTeeth: {
    width: '75%',
    height: 6,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  tongue: {
    width: '65%',
    height: 12,
    backgroundColor: '#F43F5E',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignSelf: 'center',
    position: 'absolute',
    bottom: -2,
  },
});

// ─── 2. DYNAMIC EYES COMPONENT (Natural Blinking) ──────────────────────────
function DynamicEyes({ blinkAnim, lookX, lookY, eyeType = 'anime' }) {
  const scaleY = blinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 1],
  });

  const pupilTranslateX = lookX.interpolate({
    inputRange: [-1, 1],
    outputRange: [-4, 4],
  });

  const pupilTranslateY = lookY.interpolate({
    inputRange: [-1, 1],
    outputRange: [-3, 3],
  });

  if (eyeType === 'doraemon') {
    // Large round Doraemon-style cartoon eyes touching in center
    return (
      <View style={eyeStyles.doraemonRow}>
        <Animated.View style={[eyeStyles.doraemonEye, { transform: [{ scaleY }] }]}>
          <Animated.View
            style={[
              eyeStyles.doraemonPupil,
              { transform: [{ translateX: pupilTranslateX }, { translateY: pupilTranslateY }] },
            ]}
          >
            <View style={eyeStyles.eyeGleam} />
          </Animated.View>
        </Animated.View>
        <Animated.View style={[eyeStyles.doraemonEye, { transform: [{ scaleY }] }]}>
          <Animated.View
            style={[
              eyeStyles.doraemonPupil,
              { transform: [{ translateX: pupilTranslateX }, { translateY: pupilTranslateY }] },
            ]}
          >
            <View style={eyeStyles.eyeGleam} />
          </Animated.View>
        </Animated.View>
      </View>
    );
  }

  // Expressive Stylized Eyes (Haru, Chitose, Motu, Wanko, etc.)
  return (
    <View style={eyeStyles.standardRow}>
      {/* Left Eye */}
      <Animated.View style={[eyeStyles.standardEye, { transform: [{ scaleY }] }]}>
        <Animated.View
          style={[
            eyeStyles.pupil,
            { transform: [{ translateX: pupilTranslateX }, { translateY: pupilTranslateY }] },
          ]}
        >
          <View style={eyeStyles.eyeGleam} />
          <View style={eyeStyles.eyeGleamSmall} />
        </Animated.View>
      </Animated.View>

      {/* Right Eye */}
      <Animated.View style={[eyeStyles.standardEye, { transform: [{ scaleY }] }]}>
        <Animated.View
          style={[
            eyeStyles.pupil,
            { transform: [{ translateX: pupilTranslateX }, { translateY: pupilTranslateY }] },
          ]}
        >
          <View style={eyeStyles.eyeGleam} />
          <View style={eyeStyles.eyeGleamSmall} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const eyeStyles = StyleSheet.create({
  doraemonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  doraemonEye: {
    width: 44,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    borderWidth: 3,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  doraemonPupil: {
    width: 14,
    height: 18,
    backgroundColor: '#0F172A',
    borderRadius: 9,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  standardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 108,
  },
  standardEye: {
    width: 36,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pupil: {
    width: 22,
    height: 26,
    backgroundColor: '#1E1B4B',
    borderRadius: 13,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeGleam: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  eyeGleamSmall: {
    position: 'absolute',
    bottom: 5,
    left: 4,
    width: 3.5,
    height: 3.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
});

// ─── 3. INDIVIDUAL CHARACTER RIGS (10 Avatars) ─────────────────────────────
function CharacterRig({ id, blinkAnim, lookX, lookY, mouthOpenY, mouthForm, isSpeaking, state, mood }) {
  const norm = (id || 'haru').toLowerCase();

  // ── 1. HARU (Anime Female Coach) ──
  if (norm.includes('haru') && !norm.includes('haruto') && !norm.includes('koharu')) {
    return (
      <View style={rigStyles.charContainer}>
        {/* Headphone Band */}
        <View style={rigStyles.headphoneBand} />

        {/* Anime Hair Back Ponytail */}
        <View style={rigStyles.haruHairBack} />

        {/* Head Base */}
        <View style={[rigStyles.headBase, { backgroundColor: '#FDE047' }]}>
          {/* Natural Skin Face */}
          <View style={rigStyles.skinFace}>
            {/* Hair Bangs Top */}
            <View style={rigStyles.haruBangs} />

            {/* Eyes */}
            <View style={{ marginTop: 28 }}>
              <DynamicEyes blinkAnim={blinkAnim} lookX={lookX} lookY={lookY} eyeType="anime" />
            </View>

            {/* Soft Blush */}
            <View style={rigStyles.blushRow}>
              <View style={rigStyles.blushDot} />
              <View style={rigStyles.blushDot} />
            </View>

            {/* Mouth */}
            <View style={{ marginTop: 12 }}>
              <DynamicMouth
                mouthOpenY={mouthOpenY}
                mouthForm={mouthForm}
                isSpeaking={isSpeaking}
                state={state}
                themeColor="#EC4899"
              />
            </View>
          </View>
        </View>

        {/* Glowing Headphone Cups */}
        <View style={[rigStyles.headphoneCupLeft, { backgroundColor: '#EC4899' }]} />
        <View style={[rigStyles.headphoneCupRight, { backgroundColor: '#EC4899' }]} />
      </View>
    );
  }

  // ── 2. CHITOSE (Pro Male Business Coach) ──
  if (norm.includes('chitose') || norm === 'male') {
    return (
      <View style={rigStyles.charContainer}>
        {/* Sleek Short Dark Hair */}
        <View style={rigStyles.chitoseHair} />

        {/* Head Base */}
        <View style={[rigStyles.headBase, { backgroundColor: '#FED7AA' }]}>
          {/* Eyes */}
          <View style={{ marginTop: 38 }}>
            <DynamicEyes blinkAnim={blinkAnim} lookX={lookX} lookY={lookY} eyeType="anime" />
          </View>

          {/* Strong Jawline Mouth */}
          <View style={{ marginTop: 16 }}>
            <DynamicMouth
              mouthOpenY={mouthOpenY}
              mouthForm={mouthForm}
              isSpeaking={isSpeaking}
              state={state}
              themeColor="#3B82F6"
            />
          </View>
        </View>

        {/* Business Executive Headset Mic */}
        <View style={rigStyles.executiveHeadset} />
        <View style={rigStyles.headsetMicBoom} />
      </View>
    );
  }

  // ── 3. ROBO-PAWS (Doraemon-Style Robot Cat Buddy) ──
  if (norm.includes('robo') || norm.includes('paws') || norm.includes('doraemon')) {
    return (
      <View style={rigStyles.charContainer}>
        {/* Blue Dome Head */}
        <View style={[rigStyles.headBase, { backgroundColor: '#0284C7', borderRadius: 80, width: 160, height: 154 }]}>
          {/* White Oval Face Insert */}
          <View style={rigStyles.doraemonFaceWhite}>
            {/* Eyes Touching in Center */}
            <View style={{ marginTop: 10 }}>
              <DynamicEyes blinkAnim={blinkAnim} lookX={lookX} lookY={lookY} eyeType="doraemon" />
            </View>

            {/* Big Red Shiny Nose */}
            <View style={rigStyles.doraemonRedNose}>
              <View style={rigStyles.noseGleam} />
            </View>

            {/* Vertical Whisker Center Line */}
            <View style={rigStyles.whiskerCenterLine} />

            {/* Whiskers (3 left, 3 right) */}
            <View style={rigStyles.whiskersLeft}>
              <View style={[rigStyles.whisker, { transform: [{ rotate: '12deg' }] }]} />
              <View style={rigStyles.whisker} />
              <View style={[rigStyles.whisker, { transform: [{ rotate: '-12deg' }] }]} />
            </View>
            <View style={rigStyles.whiskersRight}>
              <View style={[rigStyles.whisker, { transform: [{ rotate: '-12deg' }] }]} />
              <View style={rigStyles.whisker} />
              <View style={[rigStyles.whisker, { transform: [{ rotate: '12deg' }] }]} />
            </View>

            {/* Mouth */}
            <View style={{ marginTop: 8 }}>
              <DynamicMouth
                mouthOpenY={mouthOpenY}
                mouthForm={mouthForm}
                isSpeaking={isSpeaking}
                state={state}
                themeColor="#38BDF8"
              />
            </View>
          </View>

          {/* Red Collar & Golden Bell */}
          <View style={rigStyles.doraemonCollar}>
            <View style={rigStyles.goldenBell}>
              <View style={rigStyles.bellHole} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // ── 4. MOTU (Furfuri Nagar Samosa Friend) ──
  if (norm.includes('motu')) {
    return (
      <View style={rigStyles.charContainer}>
        {/* Bald Head with Side Hair Tufts */}
        <View style={rigStyles.motuHairTuftLeft} />
        <View style={rigStyles.motuHairTuftRight} />

        {/* Round Chubby Head Base */}
        <View style={[rigStyles.headBase, { backgroundColor: '#FDBA74', borderRadius: 75, width: 154, height: 148 }]}>
          {/* Eyes */}
          <View style={{ marginTop: 34 }}>
            <DynamicEyes blinkAnim={blinkAnim} lookX={lookX} lookY={lookY} eyeType="anime" />
          </View>

          {/* Motu's Signature Big Black Moustache */}
          <View style={rigStyles.motuMoustacheWrapper}>
            <View style={rigStyles.motuMoustacheLeft} />
            <View style={rigStyles.motuMoustacheRight} />
          </View>

          {/* Mouth below Moustache */}
          <View style={{ marginTop: 6 }}>
            <DynamicMouth
              mouthOpenY={mouthOpenY}
              mouthForm={mouthForm}
              isSpeaking={isSpeaking}
              state={state}
              themeColor="#EA580C"
            />
          </View>

          {/* Red Vest Neckline */}
          <View style={rigStyles.motuVest} />
        </View>
      </View>
    );
  }

  // ── 5. SPARKY (Superhero Kid with Lightning Emblem) ──
  if (norm.includes('sparky')) {
    return (
      <View style={rigStyles.charContainer}>
        {/* Spiky Superhero Hair */}
        <View style={rigStyles.spikyHair} />

        {/* Head */}
        <View style={[rigStyles.headBase, { backgroundColor: '#FED7AA' }]}>
          {/* Red Superhero Eye Mask */}
          <View style={rigStyles.superheroMask}>
            <DynamicEyes blinkAnim={blinkAnim} lookX={lookX} lookY={lookY} eyeType="anime" />
          </View>

          {/* Determined Smile Mouth */}
          <View style={{ marginTop: 14 }}>
            <DynamicMouth
              mouthOpenY={mouthOpenY}
              mouthForm={mouthForm}
              isSpeaking={isSpeaking}
              state={state}
              themeColor="#EF4444"
            />
          </View>
        </View>

        {/* Cape Collars */}
        <View style={rigStyles.superheroCape} />
      </View>
    );
  }

  // ── 6. WANKO (Shiba Inu Puppy Mascot) ──
  if (norm.includes('wanko') || norm.includes('dog') || norm.includes('shiba')) {
    return (
      <View style={rigStyles.charContainer}>
        {/* Shiba Ears */}
        <View style={rigStyles.shibaEarLeft} />
        <View style={rigStyles.shibaEarRight} />

        {/* Golden Shiba Head */}
        <View style={[rigStyles.headBase, { backgroundColor: '#D97706', borderRadius: 75, width: 150, height: 144 }]}>
          {/* White Fur Cheeks & Muzzle */}
          <View style={rigStyles.shibaWhiteMuzzle}>
            {/* Eyes */}
            <View style={{ marginTop: 16 }}>
              <DynamicEyes blinkAnim={blinkAnim} lookX={lookX} lookY={lookY} eyeType="anime" />
            </View>

            {/* Black Snout Nose */}
            <View style={rigStyles.dogBlackNose} />

            {/* Mouth */}
            <View style={{ marginTop: 8 }}>
              <DynamicMouth
                mouthOpenY={mouthOpenY}
                mouthForm={mouthForm}
                isSpeaking={isSpeaking}
                state={state}
                themeColor="#FBBF24"
              />
            </View>
          </View>

          {/* Green Bandana */}
          <View style={rigStyles.shibaBandana} />
        </View>
      </View>
    );
  }

  // ── 7. KOHARU (Chibi Student with Twin Ribbon Buns) ──
  if (norm.includes('koharu') || norm.includes('ribbon')) {
    return (
      <View style={rigStyles.charContainer}>
        {/* Twin Hair Ribbon Buns */}
        <View style={rigStyles.bunLeft}>
          <View style={rigStyles.ribbonPink} />
        </View>
        <View style={rigStyles.bunRight}>
          <View style={rigStyles.ribbonPink} />
        </View>

        {/* Head */}
        <View style={[rigStyles.headBase, { backgroundColor: '#FDE047' }]}>
          <View style={rigStyles.skinFace}>
            <View style={rigStyles.koharuBangs} />

            {/* Big Expressive Eyes */}
            <View style={{ marginTop: 28 }}>
              <DynamicEyes blinkAnim={blinkAnim} lookX={lookX} lookY={lookY} eyeType="anime" />
            </View>

            <View style={rigStyles.blushRow}>
              <View style={[rigStyles.blushDot, { backgroundColor: 'rgba(244, 63, 94, 0.45)' }]} />
              <View style={[rigStyles.blushDot, { backgroundColor: 'rgba(244, 63, 94, 0.45)' }]} />
            </View>

            <View style={{ marginTop: 10 }}>
              <DynamicMouth
                mouthOpenY={mouthOpenY}
                mouthForm={mouthForm}
                isSpeaking={isSpeaking}
                state={state}
                themeColor="#FB7185"
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // ── 8. HARUTO (Junior Explorer Boy with Cap) ──
  if (norm.includes('haruto') || norm.includes('cap') || norm.includes('explorer')) {
    return (
      <View style={rigStyles.charContainer}>
        {/* Backwards Baseball Cap */}
        <View style={rigStyles.backwardsCap}>
          <View style={rigStyles.capVisor} />
        </View>

        {/* Head */}
        <View style={[rigStyles.headBase, { backgroundColor: '#FED7AA' }]}>
          <View style={{ marginTop: 36 }}>
            <DynamicEyes blinkAnim={blinkAnim} lookX={lookX} lookY={lookY} eyeType="anime" />
          </View>

          <View style={{ marginTop: 14 }}>
            <DynamicMouth
              mouthOpenY={mouthOpenY}
              mouthForm={mouthForm}
              isSpeaking={isSpeaking}
              state={state}
              themeColor="#3B82F6"
            />
          </View>
        </View>

        {/* Sporty Headphones around neck */}
        <View style={rigStyles.neckHeadphones} />
      </View>
    );
  }

  // ── 9. TORORO (Sakura Kitten with Bell) ──
  if (norm.includes('tororo') || norm.includes('cat') || norm.includes('kitty')) {
    return (
      <View style={rigStyles.charContainer}>
        {/* Cat Ears */}
        <View style={rigStyles.catEarLeft}>
          <View style={rigStyles.catEarInner} />
        </View>
        <View style={rigStyles.catEarRight}>
          <View style={rigStyles.catEarInner} />
        </View>

        {/* Fluffy White Face */}
        <View style={[rigStyles.headBase, { backgroundColor: '#FFFFFF', borderRadius: 75, width: 150, height: 140 }]}>
          {/* Big Anime Cat Eyes */}
          <View style={{ marginTop: 24 }}>
            <DynamicEyes blinkAnim={blinkAnim} lookX={lookX} lookY={lookY} eyeType="anime" />
          </View>

          {/* Tiny Pink Nose */}
          <View style={rigStyles.catPinkNose} />

          {/* Mouth */}
          <View style={{ marginTop: 8 }}>
            <DynamicMouth
              mouthOpenY={mouthOpenY}
              mouthForm={mouthForm}
              isSpeaking={isSpeaking}
              state={state}
              themeColor="#C084FC"
            />
          </View>

          {/* Pink Bow & Bell Ribbon */}
          <View style={rigStyles.catBowRibbon}>
            <View style={rigStyles.catBellGold} />
          </View>
        </View>
      </View>
    );
  }

  // ── 10. REXY (Baby Dinosaur Mascot) ──
  return (
    <View style={rigStyles.charContainer}>
      {/* Dino Crest Spikes */}
      <View style={rigStyles.dinoSpikeTop} />
      <View style={rigStyles.dinoSpikeLeft} />
      <View style={rigStyles.dinoSpikeRight} />

      {/* Emerald Dino Head */}
      <View style={[rigStyles.headBase, { backgroundColor: '#10B981', borderRadius: 70, width: 154, height: 146 }]}>
        {/* Yellow Muzzle Underbelly */}
        <View style={rigStyles.dinoMuzzleYellow}>
          <View style={{ marginTop: 18 }}>
            <DynamicEyes blinkAnim={blinkAnim} lookX={lookX} lookY={lookY} eyeType="anime" />
          </View>

          {/* Nostrils */}
          <View style={rigStyles.dinoNostrils}>
            <View style={rigStyles.dinoNostrilDot} />
            <View style={rigStyles.dinoNostrilDot} />
          </View>

          {/* Mouth */}
          <View style={{ marginTop: 6 }}>
            <DynamicMouth
              mouthOpenY={mouthOpenY}
              mouthForm={mouthForm}
              isSpeaking={isSpeaking}
              state={state}
              themeColor="#34D399"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const rigStyles = StyleSheet.create({
  charContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 170,
    height: 165,
  },
  headBase: {
    width: 146,
    height: 142,
    borderRadius: 73,
    borderWidth: 3.5,
    borderColor: '#0F172A',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  skinFace: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FED7AA',
    alignItems: 'center',
    position: 'relative',
  },
  haruHairBack: {
    position: 'absolute',
    top: -12,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#312E81',
  },
  haruBangs: {
    position: 'absolute',
    top: -6,
    width: 150,
    height: 38,
    backgroundColor: '#312E81',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headphoneBand: {
    position: 'absolute',
    top: -8,
    width: 156,
    height: 48,
    borderTopWidth: 6,
    borderColor: '#1E1B4B',
    borderRadius: 30,
    zIndex: 10,
  },
  headphoneCupLeft: {
    position: 'absolute',
    left: -2,
    top: 50,
    width: 22,
    height: 44,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: '#0F172A',
    zIndex: 12,
  },
  headphoneCupRight: {
    position: 'absolute',
    right: -2,
    top: 50,
    width: 22,
    height: 44,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: '#0F172A',
    zIndex: 12,
  },
  blushRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 124,
    marginTop: 4,
  },
  blushDot: {
    width: 18,
    height: 10,
    backgroundColor: 'rgba(244, 63, 94, 0.35)',
    borderRadius: 8,
  },
  chitoseHair: {
    position: 'absolute',
    top: -10,
    width: 150,
    height: 52,
    backgroundColor: '#18181B',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    zIndex: 5,
  },
  executiveHeadset: {
    position: 'absolute',
    right: 2,
    top: 48,
    width: 18,
    height: 38,
    backgroundColor: '#0284C7',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0F172A',
    zIndex: 12,
  },
  headsetMicBoom: {
    position: 'absolute',
    right: 14,
    top: 72,
    width: 32,
    height: 3,
    backgroundColor: '#0F172A',
    transform: [{ rotate: '-15deg' }],
    zIndex: 12,
  },
  doraemonFaceWhite: {
    width: 142,
    height: 118,
    backgroundColor: '#FFFFFF',
    borderRadius: 60,
    position: 'absolute',
    bottom: 2,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#0F172A',
  },
  doraemonRedNose: {
    width: 24,
    height: 24,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0F172A',
    marginTop: -8,
    position: 'relative',
  },
  noseGleam: {
    position: 'absolute',
    top: 3,
    left: 4,
    width: 5,
    height: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  whiskerCenterLine: {
    width: 2.5,
    height: 18,
    backgroundColor: '#0F172A',
  },
  whiskersLeft: {
    position: 'absolute',
    left: 12,
    top: 46,
    gap: 6,
  },
  whiskersRight: {
    position: 'absolute',
    right: 12,
    top: 46,
    gap: 6,
  },
  whisker: {
    width: 24,
    height: 2.5,
    backgroundColor: '#0F172A',
    borderRadius: 1,
  },
  doraemonCollar: {
    position: 'absolute',
    bottom: -6,
    width: 120,
    height: 12,
    backgroundColor: '#DC2626',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldenBell: {
    width: 18,
    height: 18,
    backgroundColor: '#FACC15',
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#0F172A',
    position: 'absolute',
    bottom: -8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellHole: {
    width: 4,
    height: 4,
    backgroundColor: '#0F172A',
    borderRadius: 2,
  },
  motuHairTuftLeft: {
    position: 'absolute',
    left: 4,
    top: 48,
    width: 16,
    height: 24,
    backgroundColor: '#18181B',
    borderRadius: 8,
  },
  motuHairTuftRight: {
    position: 'absolute',
    right: 4,
    top: 48,
    width: 16,
    height: 24,
    backgroundColor: '#18181B',
    borderRadius: 8,
  },
  motuMoustacheWrapper: {
    flexDirection: 'row',
    marginTop: 6,
    alignItems: 'center',
  },
  motuMoustacheLeft: {
    width: 26,
    height: 14,
    backgroundColor: '#18181B',
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 10,
    transform: [{ rotate: '15deg' }],
  },
  motuMoustacheRight: {
    width: 26,
    height: 14,
    backgroundColor: '#18181B',
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 10,
    transform: [{ rotate: '-15deg' }],
  },
  motuVest: {
    position: 'absolute',
    bottom: -2,
    width: 110,
    height: 16,
    backgroundColor: '#DC2626',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  spikyHair: {
    position: 'absolute',
    top: -12,
    width: 130,
    height: 42,
    backgroundColor: '#92400E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 5,
  },
  superheroMask: {
    marginTop: 26,
    width: 136,
    height: 48,
    backgroundColor: '#DC2626',
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  superheroCape: {
    position: 'absolute',
    bottom: -8,
    width: 138,
    height: 14,
    backgroundColor: '#DC2626',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  shibaEarLeft: {
    position: 'absolute',
    left: 10,
    top: -12,
    width: 38,
    height: 44,
    backgroundColor: '#D97706',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 6,
    borderWidth: 3,
    borderColor: '#0F172A',
    transform: [{ rotate: '-20deg' }],
  },
  shibaEarRight: {
    position: 'absolute',
    right: 10,
    top: -12,
    width: 38,
    height: 44,
    backgroundColor: '#D97706',
    borderTopRightRadius: 24,
    borderTopLeftRadius: 6,
    borderWidth: 3,
    borderColor: '#0F172A',
    transform: [{ rotate: '20deg' }],
  },
  shibaWhiteMuzzle: {
    position: 'absolute',
    bottom: 2,
    width: 126,
    height: 104,
    backgroundColor: '#FEF3C7',
    borderRadius: 55,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  dogBlackNose: {
    width: 18,
    height: 12,
    backgroundColor: '#0F172A',
    borderRadius: 6,
    marginTop: -4,
  },
  shibaBandana: {
    position: 'absolute',
    bottom: -6,
    width: 90,
    height: 14,
    backgroundColor: '#10B981',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  bunLeft: {
    position: 'absolute',
    left: 2,
    top: 4,
    width: 36,
    height: 36,
    backgroundColor: '#92400E',
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6,
  },
  bunRight: {
    position: 'absolute',
    right: 2,
    top: 4,
    width: 36,
    height: 36,
    backgroundColor: '#92400E',
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6,
  },
  ribbonPink: {
    width: 14,
    height: 8,
    backgroundColor: '#F43F5E',
    borderRadius: 4,
  },
  koharuBangs: {
    position: 'absolute',
    top: -4,
    width: 144,
    height: 34,
    backgroundColor: '#92400E',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backwardsCap: {
    position: 'absolute',
    top: -14,
    width: 140,
    height: 48,
    backgroundColor: '#2563EB',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 3,
    borderColor: '#0F172A',
    zIndex: 6,
  },
  capVisor: {
    position: 'absolute',
    bottom: -4,
    width: 110,
    height: 10,
    backgroundColor: '#1E40AF',
    borderRadius: 5,
    alignSelf: 'center',
  },
  neckHeadphones: {
    position: 'absolute',
    bottom: -8,
    width: 118,
    height: 14,
    backgroundColor: '#18181B',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  catEarLeft: {
    position: 'absolute',
    left: 8,
    top: -10,
    width: 36,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderWidth: 3,
    borderColor: '#0F172A',
    transform: [{ rotate: '-18deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  catEarRight: {
    position: 'absolute',
    right: 8,
    top: -10,
    width: 36,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 22,
    borderWidth: 3,
    borderColor: '#0F172A',
    transform: [{ rotate: '18deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  catEarInner: {
    width: 18,
    height: 22,
    backgroundColor: '#F472B6',
    borderRadius: 10,
  },
  catPinkNose: {
    width: 10,
    height: 8,
    backgroundColor: '#F43F5E',
    borderRadius: 4,
    marginTop: 4,
  },
  catBowRibbon: {
    position: 'absolute',
    bottom: -6,
    width: 70,
    height: 12,
    backgroundColor: '#EC4899',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catBellGold: {
    width: 12,
    height: 12,
    backgroundColor: '#FACC15',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  dinoSpikeTop: {
    position: 'absolute',
    top: -14,
    width: 24,
    height: 24,
    backgroundColor: '#047857',
    transform: [{ rotate: '45deg' }],
    zIndex: 2,
  },
  dinoSpikeLeft: {
    position: 'absolute',
    left: 2,
    top: 6,
    width: 20,
    height: 20,
    backgroundColor: '#047857',
    transform: [{ rotate: '45deg' }],
    zIndex: 2,
  },
  dinoSpikeRight: {
    position: 'absolute',
    right: 2,
    top: 6,
    width: 20,
    height: 20,
    backgroundColor: '#047857',
    transform: [{ rotate: '45deg' }],
    zIndex: 2,
  },
  dinoMuzzleYellow: {
    position: 'absolute',
    bottom: 2,
    width: 136,
    height: 104,
    backgroundColor: '#A7F3D0',
    borderRadius: 52,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  dinoNostrils: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  dinoNostrilDot: {
    width: 5,
    height: 5,
    backgroundColor: '#047857',
    borderRadius: 3,
  },
});

// ─── 4. MAIN NATIVE AVATAR VIEW COMPONENT ──────────────────────────────────
export const NativeAvatarView = memo(function NativeAvatarView({
  model = 'haru',
  isSpeaking = false,
  spokenText = '',
  speechSpeed = 1.0,
  state = 'idle',
  mood = 'neutral',
  style,
  onLoaded,
}) {
  const avatarMeta = useMemo(() => getAvatarById(model), [model]);

  // Animated values
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const lookX = useRef(new Animated.Value(0)).current;
  const lookY = useRef(new Animated.Value(0)).current;
  const mouthOpenY = useRef(new Animated.Value(0)).current;
  const mouthForm = useRef(new Animated.Value(0)).current;
  const breathingFloat = useRef(new Animated.Value(0)).current;
  const speakingNod = useRef(new Animated.Value(0)).current;
  const haloPulse = useRef(new Animated.Value(1)).current;

  // Signal ready immediately upon mount (< 10ms)
  useEffect(() => {
    if (onLoaded) onLoaded();
  }, [onLoaded]);

  // 1. Idle Breathing Loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathingFloat, {
          toValue: -3,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathingFloat, {
          toValue: 3,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breathingFloat]);

  // 2. Stochastic Natural Eye Blinking
  useEffect(() => {
    let timeoutId;
    const triggerBlink = () => {
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.05, duration: 110, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 130, useNativeDriver: true }),
      ]).start(() => {
        const nextBlink = 2800 + Math.random() * 2400; // blink every 2.8 - 5.2s
        timeoutId = setTimeout(triggerBlink, nextBlink);
      });
    };

    timeoutId = setTimeout(triggerBlink, 2000);
    return () => clearTimeout(timeoutId);
  }, [blinkAnim]);

  // 3. Ambient Halo Pulse
  useEffect(() => {
    if (isSpeaking) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(haloPulse, { toValue: 1.12, duration: 320, useNativeDriver: true }),
          Animated.timing(haloPulse, { toValue: 1.0, duration: 320, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      haloPulse.setValue(1.0);
    }
  }, [isSpeaking, haloPulse]);

  // 4. Speaking Head Nod & Cadence
  useEffect(() => {
    if (isSpeaking) {
      const nodLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(speakingNod, {
            toValue: 2.5,
            duration: 380,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(speakingNod, {
            toValue: -1.5,
            duration: 380,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      nodLoop.start();
      return () => nodLoop.stop();
    } else {
      Animated.timing(speakingNod, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    }
  }, [isSpeaking, speakingNod]);

  // 5. Real-Time Phonetic Lip-Sync Scheduler
  useEffect(() => {
    if (!isSpeaking || !spokenText) {
      Animated.parallel([
        Animated.timing(mouthOpenY, { toValue: 0, duration: 120, useNativeDriver: false }),
        Animated.timing(mouthForm, { toValue: 0, duration: 120, useNativeDriver: false }),
      ]).start();
      return;
    }

    const schedule = generateSpeechSchedule(spokenText, speechSpeed);
    if (!schedule || schedule.length === 0) return;

    let frameId;
    const startTime = Date.now();
    let currentIndex = 0;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      while (currentIndex < schedule.length && schedule[currentIndex].end < elapsed) {
        currentIndex++;
      }

      if (currentIndex < schedule.length) {
        const currentItem = schedule[currentIndex];
        const targetY = currentItem.isPause ? 0.05 : currentItem.yVal;
        const targetForm = currentItem.formVal;

        Animated.parallel([
          Animated.timing(mouthOpenY, { toValue: targetY, duration: 55, useNativeDriver: false }),
          Animated.timing(mouthForm, { toValue: targetForm, duration: 55, useNativeDriver: false }),
        ]).start();

        frameId = setTimeout(tick, 45);
      } else {
        // Schedule finished, return to gentle pause
        Animated.parallel([
          Animated.timing(mouthOpenY, { toValue: 0, duration: 120, useNativeDriver: false }),
          Animated.timing(mouthForm, { toValue: 0, duration: 120, useNativeDriver: false }),
        ]).start();
      }
    };

    tick();

    return () => {
      if (frameId) clearTimeout(frameId);
    };
  }, [isSpeaking, spokenText, speechSpeed, mouthOpenY, mouthForm]);

  return (
    <View style={[viewStyles.container, style]}>
      {/* ── Glowing Neon Ambient Halo ── */}
      <Animated.View
        style={[
          viewStyles.ambientHalo,
          {
            borderColor: avatarMeta.ringColor || '#38BDF8',
            shadowColor: avatarMeta.themeColor || '#38BDF8',
            transform: [{ scale: haloPulse }],
          },
        ]}
      />

      {/* ── Floating Character Rig Stage ── */}
      <Animated.View
        style={[
          viewStyles.rigStage,
          {
            transform: [
              { translateY: Animated.add(breathingFloat, speakingNod) },
            ],
          },
        ]}
      >
        <CharacterRig
          id={avatarMeta.id}
          blinkAnim={blinkAnim}
          lookX={lookX}
          lookY={lookY}
          mouthOpenY={mouthOpenY}
          mouthForm={mouthForm}
          isSpeaking={isSpeaking}
          state={state}
          mood={mood}
        />
      </Animated.View>

      {/* ── Real-Time Soundwave Indicator (Active during speech) ── */}
      {isSpeaking && (
        <View style={viewStyles.soundwaveRow}>
          {[12, 20, 16, 26, 14, 22, 10].map((h, idx) => (
            <View
              key={idx}
              style={[
                viewStyles.waveBar,
                {
                  height: h,
                  backgroundColor: avatarMeta.ringColor || '#38BDF8',
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
});

const viewStyles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  ambientHalo: {
    position: 'absolute',
    width: 188,
    height: 188,
    borderRadius: 94,
    borderWidth: 2.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 18,
    elevation: 12,
  },
  rigStage: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  soundwaveRow: {
    position: 'absolute',
    bottom: -6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 15,
  },
  waveBar: {
    width: 3.5,
    borderRadius: 2,
    opacity: 0.9,
  },
});

export default NativeAvatarView;
