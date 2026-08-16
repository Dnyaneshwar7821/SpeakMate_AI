import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EventBus, AVATAR_EVENTS } from '../services/live2d/EventBus';

export function ProceduralAvatar({ viseme = "REST", isSpeaking: propIsSpeaking = false }) {
  const mouthRef = useRef();
  const headGroupRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const [eventSpeaking, setEventSpeaking] = useState(false);

  useEffect(() => {
    const unsubStart = EventBus.on(AVATAR_EVENTS.SPEECH_STARTED, () => setEventSpeaking(true));
    const unsubFinish = EventBus.on(AVATAR_EVENTS.SPEECH_FINISHED, () => setEventSpeaking(false));
    return () => {
      unsubStart();
      unsubFinish();
    };
  }, []);

  const isSpeaking = propIsSpeaking || eventSpeaking;

  // Define viseme mouth scales (width, height, depth)
  const visemeScales = useMemo(() => ({
    REST: [0.3, 0.02, 0.1], // Closed mouth
    AA: [0.25, 0.25, 0.1],  // Open wide
    EE: [0.4, 0.1, 0.1],    // Wide smile
    OO: [0.15, 0.2, 0.1],   // Pursed lips
    IH: [0.3, 0.15, 0.1],   // Slightly open
    OH: [0.2, 0.3, 0.1],    // Tall oval
  }), []);

  // Smoothly animate the mouth based on viseme
  useFrame((state, delta) => {
    if (mouthRef.current) {
      let targetScale = visemeScales[viseme] || visemeScales.REST;
      if (isSpeaking && viseme === "REST") {
        const time = state.clock.getElapsedTime();
        const openAmount = Math.abs(Math.sin(time * 10)) * 0.22 + 0.08;
        targetScale = [0.3, openAmount, 0.1];
      }
      mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, targetScale[0], 0.25);
      mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, targetScale[1], 0.25);
      mouthRef.current.scale.z = THREE.MathUtils.lerp(mouthRef.current.scale.z, targetScale[2], 0.25);
    }

    if (headGroupRef.current) {
      // Gentle head bobbing when idle or speaking
      const time = state.clock.getElapsedTime();
      const bobbing = isSpeaking ? Math.sin(time * 5) * 0.05 : Math.sin(time * 2) * 0.02;
      headGroupRef.current.position.y = 1.4 + bobbing;
      
      // Slight head rotation when speaking
      if (isSpeaking) {
        headGroupRef.current.rotation.y = Math.sin(time * 3) * 0.1;
      } else {
        headGroupRef.current.rotation.y = THREE.MathUtils.lerp(headGroupRef.current.rotation.y, 0, 0.1);
      }
    }

    // Arm idle animation
    if (leftArmRef.current && rightArmRef.current) {
      const time = state.clock.getElapsedTime();
      leftArmRef.current.rotation.z = Math.sin(time) * 0.05 + 0.2;
      rightArmRef.current.rotation.z = -Math.sin(time) * 0.05 - 0.2;
    }
  });


  // Colors for a teenager avatar
  const skinColor = "#ffcd94";
  const hairColor = "#2b1d14"; // Dark brown
  const shirtColor = "#4338ca"; // Indigo hoodie
  const eyeColor = "#ffffff";
  const pupilColor = "#000000";

  return (
    <group position={[0, -1, 0]}>
      {/* Body / Shirt */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 1.2, 32]} />
        <meshStandardMaterial color={shirtColor} roughness={0.8} />
      </mesh>

      {/* Arms */}
      <group position={[-0.5, 1.0, 0]} ref={leftArmRef}>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.8, 16]} />
          <meshStandardMaterial color={shirtColor} roughness={0.8} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.9, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.4} />
        </mesh>
      </group>

      <group position={[0.5, 1.0, 0]} ref={rightArmRef}>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.8, 16]} />
          <meshStandardMaterial color={shirtColor} roughness={0.8} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.9, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.4} />
        </mesh>
      </group>

      {/* Head Group (moves and bobs) */}
      <group ref={headGroupRef} position={[0, 1.4, 0]}>
        {/* Neck */}
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.15, 0.18, 0.3, 32]} />
          <meshStandardMaterial color={skinColor} roughness={0.4} />
        </mesh>

        {/* Head Shape */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.9, 0.8]} />
          <meshStandardMaterial color={skinColor} roughness={0.4} />
        </mesh>

        {/* Hair - Top */}
        <mesh position={[0, 0.48, 0]}>
          <boxGeometry args={[0.85, 0.2, 0.85]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </mesh>
        {/* Hair - Back/Sides */}
        <mesh position={[0, 0.1, -0.42]}>
          <boxGeometry args={[0.85, 0.6, 0.1]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </mesh>
        <mesh position={[-0.42, 0.1, 0]}>
          <boxGeometry args={[0.1, 0.6, 0.85]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </mesh>
        <mesh position={[0.42, 0.1, 0]}>
          <boxGeometry args={[0.1, 0.6, 0.85]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </mesh>

        {/* Left Eye */}
        <group position={[-0.18, 0.1, 0.41]}>
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color={eyeColor} />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color={pupilColor} />
          </mesh>
        </group>

        {/* Right Eye */}
        <group position={[0.18, 0.1, 0.41]}>
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color={eyeColor} />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color={pupilColor} />
          </mesh>
        </group>

        {/* Eyebrows */}
        <mesh position={[-0.18, 0.25, 0.42]}>
          <boxGeometry args={[0.15, 0.03, 0.02]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
        <mesh position={[0.18, 0.25, 0.42]}>
          <boxGeometry args={[0.15, 0.03, 0.02]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.05, 0.45]}>
          <coneGeometry args={[0.06, 0.15, 4]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} />
        </mesh>

        {/* Dynamic Mouth (Lip Sync) */}
        <mesh ref={mouthRef} position={[0, -0.25, 0.41]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#4a0f0f" />
        </mesh>
      </group>
    </group>
  );
}

export default ProceduralAvatar;
