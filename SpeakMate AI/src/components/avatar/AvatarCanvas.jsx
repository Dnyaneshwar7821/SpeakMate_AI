import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { ModelLoader } from '../../services/live2d/ModelLoader';
import { DEFAULT_AVATAR_CONFIG } from '../../config/AvatarConfig';
import { getCurrentVoiceGender } from '../../utils/speechHelper';
import { EventBus, AVATAR_EVENTS } from '../../services/live2d/EventBus';
import { Avatar2D } from '../Avatar2D';

// Make PIXI available on window for Live2D SDK Cubism integration
if (typeof window !== 'undefined' && !window.PIXI) {
  window.PIXI = PIXI;
}

export function AvatarCanvas({ modelPath, onModelLoaded, onError, className = '', framing = 'faceToChest' }) {
  const containerRef = useRef(null);
  const pixiAppRef = useRef(null);
  const modelRef = useRef(null);
  const [gender, setGender] = useState(() => getCurrentVoiceGender());

  useEffect(() => {
    const unsubGender = EventBus.on(AVATAR_EVENTS.GENDER_CHANGED, (data) => {
      setGender(data?.gender || getCurrentVoiceGender());
    });
    return () => unsubGender();
  }, []);

  const femaleModelPath = "/models/avatar/haru/haru_greeter_t03.model3.json";
  const maleModelPath = "/models/avatar/mao/Mao.model3.json";
  const targetModelPath = modelPath || (gender === 'male' ? maleModelPath : femaleModelPath);

  useEffect(() => {
    if (!containerRef.current) return;

    let isMounted = true;
    const container = containerRef.current;

    // Create PixiJS Application
    const app = new PIXI.Application({
      width: container.clientWidth || DEFAULT_AVATAR_CONFIG.canvas.width,
      height: container.clientHeight || DEFAULT_AVATAR_CONFIG.canvas.height,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
      backgroundAlpha: 0,
      antialias: true,
    });

    pixiAppRef.current = app;
    container.appendChild(app.view);

    // Resize Handler
    const handleResize = () => {
      if (!app || !app.renderer || !container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      app.renderer.resize(width, height);

      if (modelRef.current) {
        const model = modelRef.current;
        const nativeHeight = model.internalModel?.height || model.height || 1000;
        const nativeWidth = model.internalModel?.width || model.width || 1000;
        
        const scaleMultiplier = framing === 'fullBody' ? 1.0 : 1.7;
        const scale = (height * scaleMultiplier) / nativeHeight;
        model.scale.set(scale, scale);
        
        if (model.anchor) model.anchor.set(0, 0);

        model.x = (width - (nativeWidth * scale)) / 2;
        model.y = framing === 'fullBody' ? height * 0.02 : height * 0.05;
      }
    };

    window.addEventListener('resize', handleResize);

    // Load Live2D Model (Mao for male, Haru for female)
    ModelLoader.loadModel(targetModelPath, app)
      .then((loadedModel) => {
        if (!isMounted) return;
        modelRef.current = loadedModel;
        handleResize();
        if (onModelLoaded) {
          onModelLoaded(loadedModel);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[AvatarCanvas] Error loading Live2D model:', err);
        if (onError) {
          onError(err);
        }
      });

    // Cleanup on unmount
    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);

      if (modelRef.current) {
        ModelLoader.destroyModel(modelRef.current);
        modelRef.current = null;
      }

      if (app) {
        try {
          app.destroy(true, { children: true, texture: true, baseTexture: true });
        } catch (e) {
          // ignore
        }
        pixiAppRef.current = null;
      }

      if (container && container.contains(app?.view)) {
        try {
          container.removeChild(app.view);
        } catch (e) {
          // ignore
        }
      }
    };
  }, [targetModelPath, gender]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[350px] flex items-center justify-center overflow-hidden ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
}


