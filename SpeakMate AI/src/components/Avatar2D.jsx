import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EventBus, AVATAR_EVENTS } from '../services/live2d/EventBus';
import { getCurrentVoiceGender } from '../utils/speechHelper';

function MaleAvatarSVG() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full object-cover">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
        <linearGradient id="jacketGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4338ca" />
          <stop offset="100%" stopColor="#3730a3" />
        </linearGradient>
        <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffdbac" />
          <stop offset="100%" stopColor="#f1c27d" />
        </linearGradient>
      </defs>

      {/* Background circle */}
      <rect width="200" height="200" fill="url(#bgGrad)" />

      {/* Shirt & Jacket */}
      <path d="M 40 200 C 40 140 160 140 160 200 Z" fill="url(#jacketGrad)" />
      <path d="M 75 200 L 100 150 L 125 200 Z" fill="#f8fafc" />

      {/* Neck */}
      <rect x="88" y="115" width="24" height="25" rx="5" fill="url(#skinGrad)" />

      {/* Head */}
      <ellipse cx="100" cy="85" rx="35" ry="42" fill="url(#skinGrad)" />

      {/* Male Short Hair */}
      <path
        d="M 62 82 C 60 45 80 32 100 32 C 120 32 140 45 138 82 C 132 55 120 40 100 40 C 80 40 68 55 62 82 Z"
        fill="#1e1b4b"
      />
      <path
        d="M 68 60 Q 100 25 132 60 Q 100 42 68 60 Z"
        fill="#312e81"
      />

      {/* Eyebrows */}
      <path d="M 75 68 Q 85 64 92 68" stroke="#1e1b4b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M 108 68 Q 115 64 125 68" stroke="#1e1b4b" strokeWidth="3.5" strokeLinecap="round" fill="none" />

      {/* Eyes */}
      <ellipse cx="83" cy="76" rx="5" ry="6" fill="#0f172a" />
      <ellipse cx="117" cy="76" rx="5" ry="6" fill="#0f172a" />
      <circle cx="85" cy="74" r="1.8" fill="#ffffff" />
      <circle cx="119" cy="74" r="1.8" fill="#ffffff" />

      {/* Nose */}
      <path d="M 98 84 Q 100 90 102 84" stroke="#e2a76f" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Friendly Smile */}
      <path d="M 82 98 Q 100 112 118 98" stroke="#9a3412" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Avatar2D({ isSpeaking: propIsSpeaking = false }) {
  const [eventSpeaking, setEventSpeaking] = useState(false);
  const [gender, setGender] = useState(() => getCurrentVoiceGender());
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const unsubStart = EventBus.on(AVATAR_EVENTS.SPEECH_STARTED, () => setEventSpeaking(true));
    const unsubFinish = EventBus.on(AVATAR_EVENTS.SPEECH_FINISHED, () => setEventSpeaking(false));
    const unsubGender = EventBus.on(AVATAR_EVENTS.GENDER_CHANGED, (data) => {
      setImageError(false);
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
  const isMale = gender === 'male';

  return (
    <div className="relative w-72 h-72 sm:w-96 sm:h-96 mx-auto flex items-center justify-center">
      {/* Background glowing/pulsing ring (Soundwave effect) */}
      {activeSpeaking && (
        <>
          <motion.div
            className="absolute inset-0 rounded-3xl bg-blue-500/20"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-3xl bg-purple-500/20"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
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
        className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden border-4 border-indigo-500/30 shadow-2xl bg-slate-900 z-10"
        // Idle / Speaking animation
        animate={activeSpeaking ? {
          y: [0, -4, 0],
          scale: [1, 1.02, 1],
        } : {
          y: [0, -8, 0],
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
        {isMale ? (
          imageError ? (
            <MaleAvatarSVG />
          ) : (
            <img
              src="/male_tutor_adult_2d.png"
              alt="Male AI English Tutor"
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          )
        ) : (
          <img
            src="/teenager_2d.png"
            alt="Female AI Tutor (Haru)"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/teenager_2d.png';
            }}
          />
        )}

        {/* Dynamic Animated Mouth (Lip Sync Overlay) when AI is speaking */}
        {activeSpeaking && (
          <motion.div
            className="absolute bottom-[35%] left-1/2 -translate-x-1/2 w-7 bg-[#501c27] rounded-full border border-[#7a2839] shadow-inner"
            animate={{
              height: [4, 12, 5, 15, 4],
              width: [20, 16, 22, 18, 20],
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



