import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import modelUrl from '../assets/modelToUse.glb?url';
import { VISEME_TYPES } from '../utils/PhoneticVisemeEngine';

export function Avatar3D({ viseme = "REST", isSpeaking = false }) {
  const group = useRef();
  const { scene } = useGLTF(modelUrl);

  // Apply human skin tone material to model meshes
  useEffect(() => {
    if (scene) {
      scene.traverse((node) => {
        if (node.isMesh) {
          node.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#e0ac69"), // Warm human skin tone
            roughness: 0.6,
            metalness: 0.1,
          });
        }
      });
    }
  }, [scene]);

  // Phonetic viseme transformations (Scale X, Scale Y, Scale Z) - BIG & PROMINENT
  const visemeTransforms = useMemo(() => ({
    [VISEME_TYPES.REST]: [1, 1, 1],
    [VISEME_TYPES.MBP]: [0.98, 1.10, 1],
    [VISEME_TYPES.AA]: [0.92, 1.45, 1.05], // Huge open mouth
    [VISEME_TYPES.EE]: [1.18, 1.18, 1.0],  // Wide open smile
    [VISEME_TYPES.IH]: [1.06, 1.25, 1.0],  // Prominent open mouth
    [VISEME_TYPES.OO]: [0.86, 1.30, 1.08], // Pursed tall open
    [VISEME_TYPES.OH]: [0.90, 1.40, 1.05], // Huge tall oval
    [VISEME_TYPES.FV]: [1.04, 1.15, 1.0],  
    [VISEME_TYPES.LNT]: [1.04, 1.20, 1.0],  
  }), []);

  useFrame((state) => {
    if (!group.current) return;
    
    const time = state.clock.elapsedTime;

    // Gentle floating breathing animation
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      -0.5 + Math.sin(time * 2) * 0.04,
      0.1
    );

    // Phonetic viseme deformation
    const activeViseme = isSpeaking ? (viseme === VISEME_TYPES.REST ? VISEME_TYPES.IH : viseme) : VISEME_TYPES.REST;
    const targetTransform = visemeTransforms[activeViseme] || visemeTransforms[VISEME_TYPES.IH];

    group.current.scale.x = THREE.MathUtils.lerp(group.current.scale.x, targetTransform[0], 0.15);
    group.current.scale.y = THREE.MathUtils.lerp(group.current.scale.y, targetTransform[1], 0.15);
    group.current.scale.z = THREE.MathUtils.lerp(group.current.scale.z, targetTransform[2], 0.15);

    // Vocal posture rotation dynamics (subtle head pitch and roll during speech)
    if (isSpeaking && viseme !== VISEME_TYPES.REST) {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        Math.sin(time * 3.5) * 0.12,
        0.15
      );
      group.current.rotation.z = THREE.MathUtils.lerp(
        group.current.rotation.z,
        Math.sin(time * 2.0) * 0.04,
        0.1
      );
    } else {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        Math.sin(time * 0.5) * 0.03,
        0.05
      );
      group.current.rotation.z = THREE.MathUtils.lerp(
        group.current.rotation.z,
        0,
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
export default Avatar3D;
