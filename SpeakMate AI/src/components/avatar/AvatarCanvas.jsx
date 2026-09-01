import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { ModelLoader } from '../../services/live2d/ModelLoader';
import { DoraemonPuppet } from './DoraemonPuppet';
import { DEFAULT_AVATAR_CONFIG } from '../../config/AvatarConfig';
import { getCurrentVoiceGender } from '../../utils/speechHelper';
import { EventBus, AVATAR_EVENTS } from '../../services/live2d/EventBus';

import { useLipSync } from '../../hooks/useLipSync';

import { getAvatarById, AVATAR_CATALOG } from '../../config/AvatarCatalog';

// Make PIXI available on window for Live2D SDK Cubism integration
if (typeof window !== 'undefined' && !window.PIXI) {
  window.PIXI = PIXI;
}

export function AvatarCanvas({ modelPath, onModelLoaded, onError, className = '', framing = 'faceToChest', isSpeaking = false }) {
  const containerRef = useRef(null);
  const pixiAppRef = useRef(null);
  const modelRef = useRef(null);
  const [modelInstance, setModelInstance] = useState(null);
  const [activeModelKey, setActiveModelKey] = useState(() => {
    return localStorage.getItem('speakmate_avatar_model') || getCurrentVoiceGender() || 'haru';
  });

  // Automatic Lip-Sync & Viseme Hook
  useLipSync(modelInstance, isSpeaking);

  useEffect(() => {
    const unsubGender = EventBus.on(AVATAR_EVENTS.GENDER_CHANGED, (data) => {
      const chosen = data?.model || data?.gender || localStorage.getItem('speakmate_avatar_model') || 'haru';
      setActiveModelKey(chosen);
    });
    return () => unsubGender();
  }, []);

  const catalogEntry = getAvatarById(activeModelKey);
  const isPuppet = catalogEntry.type === 'puppet' || catalogEntry.id === 'robopaws';
  const targetModelPath = modelPath || catalogEntry.modelPath || AVATAR_CATALOG.haru.modelPath;

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

    if (isPuppet) {
      const puppet = new DoraemonPuppet();
      app.stage.addChild(puppet);
      modelRef.current = puppet;
      setModelInstance(puppet);

      const resizePuppet = () => {
        if (!app || !app.renderer || !container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        app.renderer.resize(width, height);
        const scale = Math.min((width * 0.85) / 220, (height * 0.80) / 260);
        puppet.scale.set(scale, scale);
        puppet.x = width / 2;
        puppet.y = height * 0.50;
      };

      resizePuppet();
      window.addEventListener('resize', resizePuppet);

      const tickerFn = () => {
        puppet.update(performance.now());
      };
      app.ticker.add(tickerFn);

      if (onModelLoaded) onModelLoaded(puppet);

      return () => {
        isMounted = false;
        window.removeEventListener('resize', resizePuppet);
        app.ticker.remove(tickerFn);
        setModelInstance(null);
        if (modelRef.current) {
          try { modelRef.current.destroy({ children: true }); } catch (e) {}
          modelRef.current = null;
        }
        if (app) {
          try { app.destroy(true, { children: true, texture: true, baseTexture: true }); } catch (e) {}
          pixiAppRef.current = null;
        }
        if (container && container.contains(app?.view)) {
          try { container.removeChild(app.view); } catch (e) {}
        }
      };
    }

    // Resize Handler for all Live2D Models
    const handleResize = () => {
      if (!app || !app.renderer || !container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      app.renderer.resize(width, height);

      if (modelRef.current) {
        const model = modelRef.current;
        const nativeHeight = model.internalModel?.height || model.height || 1000;

        if (model.anchor) {
          model.anchor.set(0.5, 0);
        }

        const scaleMultiplier = catalogEntry.scaleMultiplier || 1.18;
        const scale = (height * scaleMultiplier) / nativeHeight;
        model.scale.set(scale, scale);

        model.x = width / 2;
        const yOffset = catalogEntry.yOffsetRatio ?? 0.08;
        model.y = Math.max(28, height * yOffset);
      }
    };

    window.addEventListener('resize', handleResize);

    // Load Live2D Model
    ModelLoader.loadModel(targetModelPath, app)
      .then((loadedModel) => {
        if (!isMounted) return;
        
        // Prevent PixiJS v7 EventBoundary isInteractive recursion errors
        loadedModel.interactive = false;
        loadedModel.interactiveChildren = false;
        loadedModel.eventMode = 'none';
        loadedModel.isInteractive = () => false;

        modelRef.current = loadedModel;
        setModelInstance(loadedModel);
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
      setModelInstance(null);

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
  }, [targetModelPath, activeModelKey, isPuppet]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[350px] flex items-center justify-center overflow-hidden ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
}
