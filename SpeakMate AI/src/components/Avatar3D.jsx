import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import modelUrl from '../assets/modelToUse.glb?url';
import { EventBus, AVATAR_EVENTS } from '../services/live2d/EventBus';

export function Avatar3D({ viseme = "REST", isSpeaking: propIsSpeaking = false }) {
  const group = useRef();
  const { scene } = useGLTF(modelUrl);
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

  // Apply colorful materials to the model
  useEffect(() => {
    if (scene) {
      scene.traverse((node) => {
        if (node.isMesh) {
          // Create a human-like skin tone material
          node.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#e0ac69"), // Warm human skin tone
            roughness: 0.6,
            metalness: 0.1,
          });
        }
      });
    }
  }, [scene]);

  // Muppet-style lip-sync viseme mapping (X, Y, Z scales)
  const visemeScale = useMemo(() => ({
    "AA": [0.95, 1.15, 1], // Open mouth wide
    "EE": [1.1, 0.95, 1],  // Widen mouth
    "IH": [1.05, 0.98, 1],
    "OO": [0.9, 1.1, 1],   // Pursed lips (tall & narrow)
    "OH": [0.95, 1.1, 1],
    "REST": [1, 1, 1]
  }), []);

  useFrame((state) => {
    if (!group.current) return;
    
    const time = state.clock.elapsedTime;

    // Default floating animation
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      -0.5 + Math.sin(time * 2) * 0.05,
      0.1
    );

    // Perform Muppet-style lip-syncing by squishing/stretching the model based on the viseme or continuous speech wave
    let targetScale = visemeScale["REST"];
    if (isSpeaking) {
      if (viseme !== "REST") {
        targetScale = visemeScale[viseme] || visemeScale["OO"];
      } else {
        const pulse = Math.abs(Math.sin(time * 12)) * 0.15 + 0.92;
        targetScale = [pulse, 2 - pulse, 1];
      }
    }

    group.current.scale.x = THREE.MathUtils.lerp(group.current.scale.x, targetScale[0], 0.3);
    group.current.scale.y = THREE.MathUtils.lerp(group.current.scale.y, targetScale[1], 0.3);
    group.current.scale.z = THREE.MathUtils.lerp(group.current.scale.z, targetScale[2], 0.3);

    if (isSpeaking) {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        Math.sin(time * 6) * 0.15,
        0.2
      );
    } else {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        Math.sin(time * 0.5) * 0.05,
        0.05
      );
    }
  });


  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(modelUrl);

