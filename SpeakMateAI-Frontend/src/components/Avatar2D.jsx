import React from 'react';
import { motion } from 'framer-motion';
import { VISEME_TYPES } from '../utils/PhoneticVisemeEngine';

export function Avatar2D({ isSpeaking = false, viseme = "REST" }) {
  const isMouthOpen = isSpeaking && viseme !== VISEME_TYPES.REST && viseme !== VISEME_TYPES.MBP;

  return (
    <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
      {/* Dynamic Soundwave Rings matched to Speech state */}
      {isSpeaking && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-500/30 blur-sm"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: isMouthOpen ? [1, 1.45, 1] : [1, 1.15, 1], opacity: [0.8, 0.1, 0.8] }}
            transition={{
              duration: isMouthOpen ? 0.6 : 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-purple-500/25 blur-md"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: isMouthOpen ? [1, 1.6, 1] : [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
            transition={{
              duration: isMouthOpen ? 0.8 : 1.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.15
            }}
          />
        </>
      )}

      {/* Main Avatar Container */}
      <motion.div
        className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-[var(--bg-card)] shadow-2xl bg-gradient-to-b from-blue-100 to-purple-100 z-10"
        // Dynamic bouncing when talking, slow floating when idle
        animate={isSpeaking ? {
          y: isMouthOpen ? [0, -6, 0] : [0, -2, 0],
          scale: isMouthOpen ? [1, 1.04, 1] : [1, 1.01, 1],
        } : {
          y: [0, -12, 0],
        }}
        transition={isSpeaking ? {
          duration: isMouthOpen ? 0.35 : 0.7,
          repeat: Infinity,
          ease: "easeInOut"
        } : {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <img
          src="/teenager_2d.png"
          alt="AI Assistant"
          className="w-full h-full object-cover"
        />

        {/* Dynamic Mouth Visualizer Overlay */}
        {isSpeaking && (
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2 rounded-full bg-red-900/60 blur-[1px]"
            animate={{
              width: isMouthOpen ? (viseme === "EE" ? 22 : viseme === "OO" ? 10 : 16) : 8,
              height: isMouthOpen ? (viseme === "AA" || viseme === "OH" ? 16 : 8) : 2,
              opacity: isMouthOpen ? 0.8 : 0.2,
            }}
            transition={{ duration: 0.12 }}
          />
        )}
      </motion.div>
    </div>
  );
}

export default Avatar2D;
