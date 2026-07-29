import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Avatar3D({ viseme = "REST", isSpeaking = false }) {
  const group = useRef();
  const headGroup = useRef();
  const mouth = useRef();
  const leftEye = useRef();
  const rightEye = useRef();
  const leftEar = useRef();
  const rightEar = useRef();
  const antenna = useRef();

  const visemeMapping = useMemo(() => ({
    "AA": [1.5, 1.2, 1],
    "EE": [2.0, 0.4, 1],
    "IH": [1.5, 0.6, 1],
    "OO": [0.8, 1.0, 1],
    "OH": [1.0, 1.5, 1],
    "REST": [1.0, 0.1, 1]
  }), []);

  useFrame((state) => {
    if (!group.current || !mouth.current || !leftEye.current || !rightEye.current) return;
    
    const time = state.clock.elapsedTime;

    const targetScale = (isSpeaking && viseme !== "REST") 
      ? (visemeMapping[viseme] || visemeMapping["OO"])
      : visemeMapping["REST"];
      
    mouth.current.scale.x = THREE.MathUtils.lerp(mouth.current.scale.x, targetScale[0], 0.3);
    mouth.current.scale.y = THREE.MathUtils.lerp(mouth.current.scale.y, targetScale[1], 0.3);

    // Floating animation
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, -0.2 + Math.sin(time * 2) * 0.05, 0.1);

    if (isSpeaking && viseme !== "REST") {
      headGroup.current.rotation.y = THREE.MathUtils.lerp(headGroup.current.rotation.y, Math.sin(time * 4) * 0.15, 0.1);
      headGroup.current.rotation.x = THREE.MathUtils.lerp(headGroup.current.rotation.x, Math.sin(time * 2) * 0.05, 0.1);
      leftEar.current.rotation.z = Math.sin(time * 10) * 0.1;
      rightEar.current.rotation.z = -Math.sin(time * 10) * 0.1;
    } else {
      headGroup.current.rotation.y = THREE.MathUtils.lerp(headGroup.current.rotation.y, Math.sin(time * 0.5) * 0.1, 0.05);
      headGroup.current.rotation.x = THREE.MathUtils.lerp(headGroup.current.rotation.x, 0, 0.05);
      leftEar.current.rotation.z = THREE.MathUtils.lerp(leftEar.current.rotation.z, 0, 0.1);
      rightEar.current.rotation.z = THREE.MathUtils.lerp(rightEar.current.rotation.z, 0, 0.1);
    }
    
    if (antenna.current) {
      antenna.current.scale.setScalar(1 + Math.sin(time * 5) * 0.2);
    }

    const isBlinking = (Math.sin(time * 3) > 0.96 && Math.sin(time * 11) > 0.5) || Math.sin(time * 7) > 0.98;
    const blinkScale = isBlinking ? 0.05 : 1;
    
    leftEye.current.scale.y = THREE.MathUtils.lerp(leftEye.current.scale.y, blinkScale, 0.6);
    rightEye.current.scale.y = THREE.MathUtils.lerp(rightEye.current.scale.y, blinkScale, 0.6);
  });

  return (
    // Scaled to fit beautifully without clipping
    <group ref={group} dispose={null} scale={0.85}>
      <group ref={headGroup}>
        {/* Robot Head (Spherical) */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.8, 64, 64]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.1} metalness={0.8} />
        </mesh>
        
        {/* Robot Face Screen (Curved Black Glass) */}
        <mesh position={[0, 0, 0.15]}>
          <sphereGeometry args={[0.78, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2.3]} />
          <meshStandardMaterial color="#020617" roughness={0.0} metalness={1.0} />
        </mesh>
        
        {/* Left Eye */}
        <mesh ref={leftEye} position={[-0.25, 0.15, 0.72]} rotation={[-0.1, -0.2, 0]}>
          <capsuleGeometry args={[0.08, 0.12, 16, 16]} />
          <meshBasicMaterial color="#00ffcc" />
        </mesh>
        
        {/* Right Eye */}
        <mesh ref={rightEye} position={[0.25, 0.15, 0.72]} rotation={[-0.1, 0.2, 0]}>
          <capsuleGeometry args={[0.08, 0.12, 16, 16]} />
          <meshBasicMaterial color="#00ffcc" />
        </mesh>
        
        {/* Lip-Syncing Mouth */}
        <mesh ref={mouth} position={[0, -0.25, 0.76]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.05, 0.15, 16, 16]} />
          <meshBasicMaterial color="#ff6584" />
        </mesh>
        
        {/* Antenna Stem */}
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Antenna Bulb */}
        <mesh ref={antenna} position={[0, 1.05, 0]}>
          <sphereGeometry args={[0.08, 32, 32]} />
          <meshBasicMaterial color="#6c63ff" />
        </mesh>

        {/* Left Ear Panel */}
        <group ref={leftEar} position={[-0.8, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.1, 32]} />
            <meshStandardMaterial color="#6c63ff" roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[-0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.15, 0.05, 32]} />
            <meshBasicMaterial color="#00ffcc" />
          </mesh>
        </group>

        {/* Right Ear Panel */}
        <group ref={rightEar} position={[0.8, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.1, 32]} />
            <meshStandardMaterial color="#6c63ff" roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.15, 0.05, 32]} />
            <meshBasicMaterial color="#00ffcc" />
          </mesh>
        </group>
      </group>
      
      {/* Robot Floating Base / Neck */}
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.3, 0.15, 0.4, 32]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
}
