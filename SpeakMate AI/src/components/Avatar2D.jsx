import React from 'react';
import { motion } from 'framer-motion';

export function Avatar2D({ isSpeaking = false }) {
  return (
    <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
      {/* Background glowing/pulsing ring (Soundwave effect) */}
      {isSpeaking && (
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
        className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-[var(--bg-card)] shadow-2xl bg-gradient-to-b from-blue-100 to-purple-100 z-10"
        // Idle floating animation
        animate={isSpeaking ? {
          y: [0, -5, 0],
          scale: [1, 1.05, 1],
        } : {
          y: [0, -15, 0],
        }}
        transition={isSpeaking ? {
          duration: 0.3, // Fast bouncing when talking
          repeat: Infinity,
          ease: "easeInOut"
        } : {
          duration: 4, // Slow floating when idle
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <img
          src="/teenager_2d.png"
          alt="AI Assistant"
          className="w-full h-full object-cover"
        />
      </motion.div>
    </div>
  );
}
