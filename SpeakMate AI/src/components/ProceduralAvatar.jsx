import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VISEME_TYPES } from '../utils/PhoneticVisemeEngine';

export function ProceduralAvatar({ viseme = "REST", isSpeaking = false }) {
  const mouthRef = useRef();
  const headGroupRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const eyebrowsRef = useRef();

  // Define viseme mouth scales (width, height, depth) - BIG & PROMINENT
  const visemeScales = useMemo(() => ({
    [VISEME_TYPES.REST]: [0.3, 0.02, 0.1],   // Closed mouth
    [VISEME_TYPES.MBP]: [0.34, 0.22, 0.1],   // Slight lip contact, prominent opening
    [VISEME_TYPES.AA]: [0.32, 0.48, 0.1],    // HUGE open wide mouth
    [VISEME_TYPES.EE]: [0.48, 0.28, 0.1],    // Wide smile open
    [VISEME_TYPES.IH]: [0.38, 0.38, 0.1],    // Big open mouth
    [VISEME_TYPES.OO]: [0.22, 0.38, 0.1],    // Pursed narrow lips
    [VISEME_TYPES.OH]: [0.28, 0.52, 0.1],    // HUGE tall oval
    [VISEME_TYPES.FV]: [0.36, 0.24, 0.1],    // Labiodental tuck
    [VISEME_TYPES.LNT]: [0.40, 0.30, 0.1],   // Alveolar dental
  }), []);

  // Smoothly animate the mouth and posture based on viseme
  useFrame((state, delta) => {
    if (mouthRef.current) {
      const activeViseme = isSpeaking ? (viseme === VISEME_TYPES.REST ? VISEME_TYPES.IH : viseme) : VISEME_TYPES.REST;
      const targetScale = visemeScales[activeViseme] || visemeScales[VISEME_TYPES.IH];

      mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, targetScale[0], 0.15);
      mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, targetScale[1], 0.15);
      mouthRef.current.scale.z = THREE.MathUtils.lerp(mouthRef.current.scale.z, targetScale[2], 0.15);
    }

    if (headGroupRef.current) {
      const time = state.clock.getElapsedTime();
      const bobbing = isSpeaking ? Math.sin(time * 4) * 0.04 : Math.sin(time * 1.8) * 0.02;
      headGroupRef.current.position.y = 1.4 + bobbing;
      
      // Vocal head rotation & pitch
      if (isSpeaking) {
        headGroupRef.current.rotation.y = Math.sin(time * 3) * 0.08;
        headGroupRef.current.rotation.z = Math.sin(time * 2) * 0.03;
      } else {
        headGroupRef.current.rotation.y = THREE.MathUtils.lerp(headGroupRef.current.rotation.y, 0, 0.1);
        headGroupRef.current.rotation.z = THREE.MathUtils.lerp(headGroupRef.current.rotation.z, 0, 0.1);
      }
    }

    // Arm gestures
    if (leftArmRef.current && rightArmRef.current) {
      const time = state.clock.getElapsedTime();
      const armGesture = isSpeaking ? Math.sin(time * 3) * 0.08 : 0;
      leftArmRef.current.rotation.z = Math.sin(time) * 0.05 + 0.2 + armGesture;
      rightArmRef.current.rotation.z = -Math.sin(time) * 0.05 - 0.2 - armGesture;
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

      {/* Head Group */}
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
        <group ref={eyebrowsRef}>
          <mesh position={[-0.18, 0.25, 0.42]}>
            <boxGeometry args={[0.15, 0.03, 0.02]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>
          <mesh position={[0.18, 0.25, 0.42]}>
            <boxGeometry args={[0.15, 0.03, 0.02]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>
        </group>

        {/* Nose */}
        <mesh position={[0, -0.05, 0.45]}>
          <coneGeometry args={[0.06, 0.15, 4]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} />
        </mesh>

        {/* Dynamic Mouth (Phonetic Lip Sync) */}
        <mesh ref={mouthRef} position={[0, -0.25, 0.41]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#4a0f0f" />
        </mesh>
      </group>
    </group>
  );
}

export default ProceduralAvatar;
