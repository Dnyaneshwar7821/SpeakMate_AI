import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useGraph } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// --- Error Boundary for 3D Models ---
class AvatarErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <ProceduralRobotAvatar viseme={this.props.viseme} isSpeaking={this.props.isSpeaking} />;
    }
    return this.props.children;
  }
}

// --- Realistic Human Avatar (Loads /avatar.glb) ---
function HumanAvatar({ viseme, isSpeaking }) {
  // This will throw if /avatar.glb is missing, triggering the ErrorBoundary
  const { scene } = useGLTF('/avatar.glb');
  const { nodes } = useGraph(scene);
  const group = useRef();

  // Find the head mesh (usually called Wolf3D_Head in Ready Player Me)
  const headMesh = useMemo(() => {
    let head = null;
    scene.traverse((child) => {
      if (child.isMesh && child.morphTargetDictionary) {
        // RPM usually has 'Wolf3D_Head' or 'Wolf3D_Avatar' with morphs
        if (child.name.includes('Head') || child.name.includes('Avatar') || child.name.includes('Mesh')) {
          head = child;
        }
      }
    });
    return head;
  }, [scene]);

  // Viseme to Morph Target Index mapping
  const visemeMapping = useMemo(() => {
    if (!headMesh || !headMesh.morphTargetDictionary) return {};
    const dict = headMesh.morphTargetDictionary;
    return {
      "AA": dict["viseme_aa"] !== undefined ? dict["viseme_aa"] : dict["mouthOpen"],
      "EE": dict["viseme_E"] !== undefined ? dict["viseme_E"] : dict["mouthSmile"],
      "IH": dict["viseme_I"] !== undefined ? dict["viseme_I"] : dict["mouthSmile"],
      "OO": dict["viseme_O"] !== undefined ? dict["viseme_O"] : dict["mouthPucker"],
      "OH": dict["viseme_O"] !== undefined ? dict["viseme_O"] : dict["mouthOpen"],
    };
  }, [headMesh]);

  const blinkTargetIndex = useMemo(() => {
    if (!headMesh || !headMesh.morphTargetDictionary) return -1;
    return headMesh.morphTargetDictionary["eyeBlink_Left"] !== undefined 
           ? headMesh.morphTargetDictionary["eyeBlink_Left"] 
           : -1;
  }, [headMesh]);

  useFrame((state) => {
    if (!group.current) return;
    
    // Idle animation (breathing)
    if (!isSpeaking) {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, Math.sin(state.clock.elapsedTime * 0.5) * 0.05, 0.05);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0, 0.05);
    } else {
      // Head bobbing while talking
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, Math.sin(state.clock.elapsedTime * 3) * 0.05, 0.1);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, Math.sin(state.clock.elapsedTime * 2) * 0.02, 0.1);
    }

    // Apply Lip Sync Morphs
    if (headMesh && headMesh.morphTargetInfluences) {
      // Reset all lip sync morphs to 0 smoothly
      Object.values(visemeMapping).forEach(index => {
        if (index !== undefined && index !== -1) {
          headMesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(headMesh.morphTargetInfluences[index], 0, 0.3);
        }
      });
      
      // Apply the active viseme
      if (isSpeaking && viseme !== "REST") {
        const targetIndex = visemeMapping[viseme];
        if (targetIndex !== undefined && targetIndex !== -1) {
          headMesh.morphTargetInfluences[targetIndex] = THREE.MathUtils.lerp(headMesh.morphTargetInfluences[targetIndex], 1, 0.4);
        }
      }

      // Procedural Blinking
      if (blinkTargetIndex !== -1) {
        const time = state.clock.elapsedTime;
        const isBlinking = (Math.sin(time * 3) > 0.96 && Math.sin(time * 11) > 0.5) || Math.sin(time * 7) > 0.98;
        headMesh.morphTargetInfluences[blinkTargetIndex] = THREE.MathUtils.lerp(
          headMesh.morphTargetInfluences[blinkTargetIndex], 
          isBlinking ? 1 : 0, 
          0.5
        );
        // Assuming eyeBlink_Right is usually right next to eyeBlink_Left
        if (headMesh.morphTargetInfluences[blinkTargetIndex + 1] !== undefined) {
           headMesh.morphTargetInfluences[blinkTargetIndex + 1] = headMesh.morphTargetInfluences[blinkTargetIndex];
        }
      }
    }
  });

  return (
    <group ref={group} dispose={null} position={[0, -1.5, 1]} scale={1.8}>
      <primitive object={scene} />
    </group>
  );
}

// --- Procedural Robot Fallback ---
function ProceduralRobotAvatar({ viseme, isSpeaking }) {
  const group = useRef();
  const mouth = useRef();
  const leftEye = useRef();
  const rightEye = useRef();

  const visemeMapping = useMemo(() => ({
    "AA": [0.8, 1.2, 1],
    "EE": [1.5, 0.4, 1],
    "IH": [1.2, 0.6, 1],
    "OO": [0.5, 0.8, 1],
    "OH": [0.7, 1.0, 1],
    "REST": [1.0, 0.1, 1]
  }), []);

  useFrame((state) => {
    if (!group.current || !mouth.current || !leftEye.current || !rightEye.current) return;
    
    const targetScale = (isSpeaking && viseme !== "REST") 
      ? (visemeMapping[viseme] || visemeMapping["OO"])
      : visemeMapping["REST"];
      
    mouth.current.scale.x = THREE.MathUtils.lerp(mouth.current.scale.x, targetScale[0], 0.3);
    mouth.current.scale.y = THREE.MathUtils.lerp(mouth.current.scale.y, targetScale[1], 0.3);

    if (isSpeaking && viseme !== "REST") {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, Math.sin(state.clock.elapsedTime * 4) * 0.1, 0.1);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, Math.sin(state.clock.elapsedTime * 2) * 0.05, 0.1);
    } else {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, Math.sin(state.clock.elapsedTime * 0.5) * 0.05, 0.05);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0, 0.05);
    }
    
    const time = state.clock.elapsedTime;
    const isBlinking = (Math.sin(time * 3) > 0.96 && Math.sin(time * 11) > 0.5) || Math.sin(time * 7) > 0.98;
    const blinkScale = isBlinking ? 0.05 : 1;
    
    leftEye.current.scale.y = THREE.MathUtils.lerp(leftEye.current.scale.y, blinkScale, 0.6);
    rightEye.current.scale.y = THREE.MathUtils.lerp(rightEye.current.scale.y, blinkScale, 0.6);
  });

  return (
    <group ref={group} dispose={null} position={[0, -0.2, 0]} scale={1.5}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 1.4, 1.2]} />
        <meshStandardMaterial color="#6c63ff" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.61]}>
        <planeGeometry args={[1.0, 1.2]} />
        <meshStandardMaterial color="#0F172A" roughness={0.5} />
      </mesh>
      <mesh ref={leftEye} position={[-0.25, 0.2, 0.62]}>
        <capsuleGeometry args={[0.08, 0.1, 4, 8]} />
        <meshBasicMaterial color="#00ffcc" />
      </mesh>
      <mesh ref={rightEye} position={[0.25, 0.2, 0.62]}>
        <capsuleGeometry args={[0.08, 0.1, 4, 8]} />
        <meshBasicMaterial color="#00ffcc" />
      </mesh>
      <mesh ref={mouth} position={[0, -0.3, 0.62]}>
        <boxGeometry args={[0.4, 0.1, 0.05]} />
        <meshBasicMaterial color="#ff6584" />
      </mesh>
      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.3, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

// --- Main Export ---
export function Avatar3D({ viseme, isSpeaking }) {
  return (
    <AvatarErrorBoundary viseme={viseme} isSpeaking={isSpeaking}>
      <React.Suspense fallback={<ProceduralRobotAvatar viseme={viseme} isSpeaking={isSpeaking} />}>
        <HumanAvatar viseme={viseme} isSpeaking={isSpeaking} />
      </React.Suspense>
    </AvatarErrorBoundary>
  );
}
