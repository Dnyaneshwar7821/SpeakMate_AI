import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EventBus, AVATAR_EVENTS } from '../../services/live2d/EventBus';

/**
 * ThreeAvatarCanvas
 * High-performance 3D avatar viewport for real-time GLTF/GLB characters (e.g., Pikachu).
 * Features studio lighting, auto-centering, 3D mouse gaze tracking,
 * idle breathing physics, and real-time phonetic speech/ear animation.
 */
export function ThreeAvatarCanvas({
  modelPath = '/models/avatar/pikachu/pikachu.glb',
  isSpeaking: isSpeakingProp = false,
  className = '',
  onModelLoaded,
  onError,
}) {
  const containerRef = useRef(null);
  const isSpeakingRef = useRef(isSpeakingProp);
  const mouthYRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    isSpeakingRef.current = isSpeakingProp;
  }, [isSpeakingProp]);

  useEffect(() => {
    const unsubStart = EventBus.on(AVATAR_EVENTS.SPEECH_STARTED, () => {
      isSpeakingRef.current = true;
    });
    const unsubEnd = EventBus.on(AVATAR_EVENTS.SPEECH_FINISHED, () => {
      isSpeakingRef.current = false;
      mouthYRef.current = 0;
    });
    const unsubLip = EventBus.on(AVATAR_EVENTS.LIP_SYNC_UPDATE, (data) => {
      isSpeakingRef.current = true;
      if (data?.yVal !== undefined) {
        mouthYRef.current = data.yVal;
      }
    });

    return () => {
      if (typeof unsubStart === 'function') unsubStart();
      if (typeof unsubEnd === 'function') unsubEnd();
      if (typeof unsubLip === 'function') unsubLip();
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isMounted = true;
    let reqId = null;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;

    // 1. Scene & Camera Setup - perfectly framed for character portrait
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    camera.position.set(0, 0.1, 2.9);

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if ('outputColorSpace' in renderer) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Studio Lighting Rig - Beautifully illuminates face and cheeks from the front
    const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0x444455, 1.8);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xFFFBEB, 2.5);
    keyLight.position.set(2.0, 2.5, 3.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xFEF08A, 1.3);
    fillLight.position.set(-2.5, 1.5, 3.0);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x93C5FD, 1.2);
    rimLight.position.set(0, 3.0, -2.5);
    scene.add(rimLight);

    const bounceLight = new THREE.PointLight(0xFACC15, 0.7, 6);
    bounceLight.position.set(0, -0.8, 1.8);
    scene.add(bounceLight);

    // 4. Model Container & Rig References
    const avatarGroup = new THREE.Group();
    // Default 180 deg rotation around Y so GLB model faces the user/camera directly!
    avatarGroup.rotation.y = Math.PI;
    scene.add(avatarGroup);

    let headNode = null;
    let leftEarNode = null;
    let rightEarNode = null;
    let leftArmNode = null;
    let rightArmNode = null;
    let mouthMesh = null;
    let initialHeadRot = new THREE.Euler();
    let initialLeftEarRot = new THREE.Euler();
    let initialRightEarRot = new THREE.Euler();
    let initialLeftArmRot = new THREE.Euler();
    let initialRightArmRot = new THREE.Euler();
    let initialMouthScale = new THREE.Vector3(1, 1, 1);

    // 5. Load 3D GLB Model
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        if (!isMounted) return;

        const model = gltf.scene;

        // Auto-center and fit model into view
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center on X and Z, and vertically adjust so smiling face and rosy cheeks are at eye-level
        model.position.x = -center.x;
        model.position.y = -center.y + 0.16;
        model.position.z = -center.z;

        // Optimal normalization scale to generously fill the avatar portrait frame
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const targetScale = 2.05 / maxDim;
        avatarGroup.scale.set(targetScale, targetScale, targetScale);
        avatarGroup.add(model);

        // Discover and bind bones & facial parts
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.roughness = 0.5;
              child.material.metalness = 0.05;
            }
            if (/mouth/i.test(child.name) || /mouth/i.test(child.material?.name || '')) {
              mouthMesh = child;
              initialMouthScale.copy(child.scale);
            }
          }
          if (/head/i.test(child.name)) {
            headNode = child;
            initialHeadRot.copy(child.rotation);
          }
          // Prioritize LEar1 / REar1 (ear base) so the entire ear pivots expressively
          if (/LEar1/i.test(child.name)) {
            leftEarNode = child;
            initialLeftEarRot.copy(child.rotation);
          } else if (/LEar/i.test(child.name) && !leftEarNode) {
            leftEarNode = child;
            initialLeftEarRot.copy(child.rotation);
          }

          if (/REar1/i.test(child.name)) {
            rightEarNode = child;
            initialRightEarRot.copy(child.rotation);
          } else if (/REar/i.test(child.name) && !rightEarNode) {
            rightEarNode = child;
            initialRightEarRot.copy(child.rotation);
          }

          if (/LArm/i.test(child.name) && !leftArmNode) {
            leftArmNode = child;
            initialLeftArmRot.copy(child.rotation);
          }
          if (/RArm/i.test(child.name) && !rightArmNode) {
            rightArmNode = child;
            initialRightArmRot.copy(child.rotation);
          }
        });

        if (onModelLoaded) {
          onModelLoaded(model);
        }
      },
      undefined,
      (err) => {
        if (!isMounted) return;
        console.error('[ThreeAvatarCanvas] Failed to load 3D GLB model:', err);
        if (onError) onError(err);
      }
    );

    // 6. Gaze & Pointer Event Handling
    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? (rect.left + rect.width / 2);
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? (rect.top + rect.height / 2);
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -(((clientY - rect.top) / rect.height) * 2 - 1);
      pointerRef.current.targetX = Math.max(-1, Math.min(1, ndcX));
      pointerRef.current.targetY = Math.max(-1, Math.min(1, ndcY));
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // 7. Continuous 60 FPS Render & Physics Loop
    let clock = new THREE.Clock();

    const animate = () => {
      if (!isMounted) return;
      reqId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const ptr = pointerRef.current;
      ptr.x += (ptr.targetX - ptr.x) * 0.08;
      ptr.y += (ptr.targetY - ptr.y) * 0.08;

      const isSpeaking = Boolean(isSpeakingRef.current);
      const mY = Math.max(0, Math.min(1, mouthYRef.current));

      // 3D Idle Breathing & Floating Physics
      const breathe = Math.sin(elapsed * 2.5) * 0.025;
      avatarGroup.position.y = breathe;

      // Whole-body subtle gaze tracking (faces user cursor naturally)
      avatarGroup.rotation.y = Math.PI - ptr.x * 0.16;

      // 3D Head Tracking & Speech Nods
      if (headNode) {
        const gazeYaw = -ptr.x * 0.20;
        const gazePitch = -ptr.y * 0.16;
        const speakNod = isSpeaking ? Math.sin(elapsed * 8.0) * 0.05 : 0;
        headNode.rotation.y = initialHeadRot.y + gazeYaw;
        headNode.rotation.x = initialHeadRot.x + gazePitch + speakNod;
      }

      // Reactive Ear Physics (Bouncy ear wiggles when talking or idle)
      const earIdle = Math.sin(elapsed * 2.8) * 0.04;
      const earSpeakWiggle = isSpeaking ? Math.sin(elapsed * 12.0) * 0.14 : 0;

      if (leftEarNode) {
        leftEarNode.rotation.z = initialLeftEarRot.z + earIdle + earSpeakWiggle;
        leftEarNode.rotation.x = initialLeftEarRot.x + (isSpeaking ? Math.cos(elapsed * 10.0) * 0.07 : 0);
      }
      if (rightEarNode) {
        rightEarNode.rotation.z = initialRightEarRot.z - earIdle - earSpeakWiggle;
        rightEarNode.rotation.x = initialRightEarRot.x + (isSpeaking ? Math.cos(elapsed * 10.0) * 0.07 : 0);
      }

      // Reactive Arm Gestures while speaking
      if (leftArmNode) {
        const armTalk = isSpeaking ? Math.sin(elapsed * 6.0) * 0.08 : 0;
        leftArmNode.rotation.x = initialLeftArmRot.x + armTalk;
      }
      if (rightArmNode) {
        const armTalk = isSpeaking ? -Math.sin(elapsed * 6.0) * 0.08 : 0;
        rightArmNode.rotation.x = initialRightArmRot.x + armTalk;
      }

      // Mouth deformation / scale during speech
      if (mouthMesh) {
        const openScale = 1.0 + (isSpeaking ? (0.35 + mY * 0.45) : 0);
        mouthMesh.scale.set(
          initialMouthScale.x,
          initialMouthScale.y * openScale,
          initialMouthScale.z
        );
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Responsive Resize Observer
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 9. Resource Cleanup on Unmount
    return () => {
      isMounted = false;
      if (reqId) cancelAnimationFrame(reqId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);

      if (renderer) {
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      }

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    };
  }, [modelPath]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[350px] flex items-center justify-center overflow-hidden ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
}

export default ThreeAvatarCanvas;
