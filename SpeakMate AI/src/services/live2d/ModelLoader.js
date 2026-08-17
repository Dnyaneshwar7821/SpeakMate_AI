/**
 * ModelLoader Service
 * Loads Live2D model assets using pixi-live2d-display and PixiJS
 * with error handling and resource disposal.
 */

import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display';
import { EventBus, AVATAR_EVENTS } from './EventBus';
import { DEFAULT_AVATAR_CONFIG } from '../../config/AvatarConfig';

// Polyfill for PixiJS v7 + pixi-live2d-display interaction compatibility
if (typeof window !== 'undefined') {
  window.PIXI = PIXI;
}

if (PIXI?.DisplayObject && !PIXI.DisplayObject.prototype.isInteractive) {
  PIXI.DisplayObject.prototype.isInteractive = function() {
    return this.interactive || this.eventMode === 'static' || this.eventMode === 'dynamic';
  };
}
if (PIXI?.Container && !PIXI.Container.prototype.isInteractive) {
  PIXI.Container.prototype.isInteractive = function() {
    return this.interactive || this.eventMode === 'static' || this.eventMode === 'dynamic';
  };
}

// Register PIXI Ticker constructor for Live2D update loops
try {
  Live2DModel.registerTicker(PIXI.Ticker);
} catch (e) {
  console.warn('[ModelLoader] Live2D Ticker registration warning:', e);
}

export class ModelLoader {
  /**
   * Loads a Live2D model asynchronously onto a Pixi stage
   * @param {string} modelPath URL or path to .model3.json or .model.json
   * @param {PIXI.Application} pixiApp PixiJS Application instance
   */
  static async loadModel(modelPath, pixiApp) {
    if (!pixiApp || !pixiApp.stage) {
      throw new Error('[ModelLoader] PixiJS Application stage is not initialized.');
    }

    const path = modelPath || DEFAULT_AVATAR_CONFIG.modelPath;

    try {
      // Create model instance
      const model = await Live2DModel.from(path, {
        autoInteract: false,
        onError: (err) => {
          console.warn('[ModelLoader] Model loading inner warning/error:', err);
        },
      });

      if (!model) {
        throw new Error(`Failed to load Live2D model from path: ${path}`);
      }

      // Safely extract screen dimensions from Pixi app or renderer
      const screenWidth = pixiApp?.screen?.width || pixiApp?.renderer?.width || 600;
      const screenHeight = pixiApp?.screen?.height || pixiApp?.renderer?.height || 700;

      // Native dimensions
      const nativeHeight = model.internalModel?.height || model.height || 1000;
      const nativeWidth = model.internalModel?.width || model.width || 1000;
      
      // Top-centered anchor & framing
      if (model.anchor) {
        model.anchor.set(0.5, 0);
      }
      const scale = (screenHeight * 1.18) / nativeHeight;
      model.scale.set(scale, scale);

      model.x = screenWidth / 2;
      model.y = Math.max(36, screenHeight * 0.08);

      // Disable PixiJS interactive flag to avoid isInteractive error in Pixi 7
      if ('eventMode' in model) {
        model.eventMode = 'none';
      }
      model.interactive = false;

      // Add to stage if stage is active
      if (pixiApp && pixiApp.stage && !pixiApp.stage.destroyed) {
        pixiApp.stage.addChild(model);
      }

      EventBus.emit(AVATAR_EVENTS.MODEL_LOADED, { model, path });
      return model;
    } catch (error) {
      console.warn('[ModelLoader] Failed to load specified model path:', path, error);
      EventBus.emit(AVATAR_EVENTS.MODEL_ERROR, { error, path });
      throw error;
    }
  }

  /**
   * Safely unload model and free textures
   * @param {Live2DModel} model 
   */
  static destroyModel(model) {
    if (!model) return;
    try {
      if (model.parent) {
        model.parent.removeChild(model);
      }
      model.destroy({ children: true, texture: true, baseTexture: true });
    } catch (err) {
      console.warn('[ModelLoader] Error disposing Live2D model resources:', err);
    }
  }
}
