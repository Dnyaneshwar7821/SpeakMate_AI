import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EventBus, AVATAR_EVENTS } from '../services/live2d/EventBus';
import { getCurrentVoiceGender } from '../utils/speechHelper';

export function Avatar2D({ isSpeaking: propIsSpeaking = false }) {
  const [eventSpeaking, setEventSpeaking] = useState(false);
  const [gender, setGender] = useState(() => getCurrentVoiceGender());

  useEffect(() => {
    const unsubStart = EventBus.on(AVATAR_EVENTS.SPEECH_STARTED, () => setEventSpeaking(true));
    const unsubFinish = EventBus.on(AVATAR_EVENTS.SPEECH_FINISHED, () => setEventSpeaking(false));
    const unsubGender = EventBus.on(AVATAR_EVENTS.GENDER_CHANGED, (data) => {
      if (data?.gender) setGender(data.gender);
      else setGender(getCurrentVoiceGender());
    });

    return () => {
      unsubStart();
      unsubFinish();
      unsubGender();
    };
  }, []);

  const activeSpeaking = propIsSpeaking || eventSpeaking;
  const avatarSrc = gender === 'male' ? '/teenager_male_2d.png' : '/teenager_2d.png';

  return (
    <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
      {/* Background glowing/pulsing ring (Soundwave effect) */}
      {activeSpeaking && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-500/20"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-purple-500/20"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
          />
        </>
      )}

      {/* Main Avatar Container */}
      <motion.div
        key={gender}
        className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-[var(--bg-card)] shadow-2xl bg-gradient-to-b from-blue-100 to-purple-100 z-10"
        // Idle / Speaking animation
        animate={activeSpeaking ? {
          y: [0, -5, 0],
          scale: [1, 1.03, 1],
        } : {
          y: [0, -15, 0],
        }}
        transition={activeSpeaking ? {
          duration: 0.25,
          repeat: Infinity,
          ease: "easeInOut"
        } : {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <img
          src={avatarSrc}
          alt={gender === 'male' ? "Male AI Tutor (Mark)" : "Female AI Tutor (Haru)"}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback if image load error occurs
            e.target.onerror = null;
            e.target.src = '/teenager_2d.png';
          }}
        />

        {/* Dynamic Animated Mouth (Lip Sync Overlay) when AI is speaking */}
        {activeSpeaking && (
          <motion.div
            className="absolute bottom-[28%] left-1/2 -translate-x-1/2 w-6 bg-[#6b2737] rounded-full border border-[#4a1824] shadow-inner"
            animate={{
              height: [4, 14, 6, 18, 4],
              width: [22, 16, 24, 18, 22],
              borderRadius: ["9999px", "40%", "9999px", "30%", "9999px"],
            }}
            transition={{
              duration: 0.22,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        )}
      </motion.div>
    </div>
  );
}

