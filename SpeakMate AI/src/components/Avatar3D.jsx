import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Avatar3D({ viseme, isSpeaking }) {
  const group = useRef();
  const mouth = useRef();
  const leftEye = useRef();
  const rightEye = useRef();

  // Viseme to mouth scale mapping for a procedural robot
  // [scaleX, scaleY, scaleZ]
  const visemeMapping = useMemo(() => ({
    "AA": [0.8, 1.2, 1],
    "EE": [1.5, 0.4, 1],
    "IH": [1.2, 0.6, 1],
    "OO": [0.5, 0.8, 1],
    "OH": [0.7, 1.0, 1],
    "REST": [1.0, 0.1, 1] // Closed mouth
  }), []);

  useFrame((state) => {
    if (!group.current || !mouth.current || !leftEye.current || !rightEye.current) return;
    
    // Smoothly interpolate mouth scale based on viseme
    const targetScale = (isSpeaking && viseme !== "REST") 
      ? (visemeMapping[viseme] || visemeMapping["OO"])
      : visemeMapping["REST"];
      
    mouth.current.scale.x = THREE.MathUtils.lerp(mouth.current.scale.x, targetScale[0], 0.3);
    mouth.current.scale.y = THREE.MathUtils.lerp(mouth.current.scale.y, targetScale[1], 0.3);

    // Slight head bob while talking
    if (isSpeaking && viseme !== "REST") {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, Math.sin(state.clock.elapsedTime * 4) * 0.1, 0.1);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, Math.sin(state.clock.elapsedTime * 2) * 0.05, 0.1);
    } else {
      // Idle animation when not speaking (breathing movement)
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, Math.sin(state.clock.elapsedTime * 0.5) * 0.05, 0.05);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0, 0.05);
    }
    
    // Blinking logic
    const time = state.clock.elapsedTime;
    const isBlinking = (Math.sin(time * 3) > 0.96 && Math.sin(time * 11) > 0.5) || Math.sin(time * 7) > 0.98;
    const blinkScale = isBlinking ? 0.05 : 1;
    
    leftEye.current.scale.y = THREE.MathUtils.lerp(leftEye.current.scale.y, blinkScale, 0.6);
    rightEye.current.scale.y = THREE.MathUtils.lerp(rightEye.current.scale.y, blinkScale, 0.6);
  });

  return (
    <group ref={group} dispose={null} position={[0, -0.2, 0]} scale={1.5}>
      {/* Head Base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 1.4, 1.2]} />
        <meshStandardMaterial color="#6c63ff" roughness={0.3} metalness={0.7} />
      </mesh>
      
      {/* Face Screen */}
      <mesh position={[0, 0, 0.61]}>
        <planeGeometry args={[1.0, 1.2]} />
        <meshStandardMaterial color="#0F172A" roughness={0.5} />
      </mesh>

      {/* Left Eye */}
      <mesh ref={leftEye} position={[-0.25, 0.2, 0.62]}>
        <capsuleGeometry args={[0.08, 0.1, 4, 8]} />
        <meshBasicMaterial color="#00ffcc" />
      </mesh>
      
      {/* Right Eye */}
      <mesh ref={rightEye} position={[0.25, 0.2, 0.62]}>
        <capsuleGeometry args={[0.08, 0.1, 4, 8]} />
        <meshBasicMaterial color="#00ffcc" />
      </mesh>

      {/* Mouth (Lip Sync) */}
      <mesh ref={mouth} position={[0, -0.3, 0.62]}>
        <boxGeometry args={[0.4, 0.1, 0.05]} />
        <meshBasicMaterial color="#ff6584" />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.3, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}
