import * as PIXI from 'pixi.js';

/**
 * Clean 3D Illustrated Motu Avatar (From Motu Patlu)
 * Displays Motu's authentic character illustration with smooth natural breathing bob.
 */
export class MotuPuppet extends PIXI.Container {
  constructor() {
    super();
    this.name = 'MotuPuppet';
    this.isMotuPuppet = true;

    this.mouthY = 0;
    this.mouthForm = 0;
    this.isSpeaking = false;

    this.initRig();
  }

  initRig() {
    this.rootContainer = new PIXI.Container();
    this.addChild(this.rootContainer);

    // Clean Motu Character Sprite (No artificial overlays)
    this.motuSprite = PIXI.Sprite.from('/models/avatar/motu/motu.png');
    this.motuSprite.anchor.set(0.5, 0.5);
    this.motuSprite.width = 260;
    this.motuSprite.height = 260;
    this.rootContainer.addChild(this.motuSprite);
  }

  setParam(name, value) {
    const key = (name || '').toUpperCase();
    if (key.includes('PARAM_MOUTH_OPEN_Y') || key.includes('PARAMMOUTHOPENY') || key.includes('MOUTH_OPEN')) {
      this.mouthY = Math.max(0, Math.min(1.0, value));
    }
  }

  setMouthOpen(y, form = 0) {
    this.mouthY = Math.max(0, Math.min(1.0, y));
    this.mouthForm = Math.max(-1.0, Math.min(1.0, form));
  }

  setSpeaking(speaking) {
    this.isSpeaking = Boolean(speaking);
  }

  setLookTarget(x, y) {}

  update(now = performance.now()) {
    const t = now * 0.001;

    // Smooth natural breathing and speaking bob
    const hoverY = Math.sin(t * 2.2) * (this.isSpeaking ? 4.5 : 2.5);
    const breatheScale = 1.0 + Math.sin(t * 2.2) * 0.012;
    this.rootContainer.position.y = hoverY;
    if (this.motuSprite && this.motuSprite.texture) {
      this.motuSprite.scale.set(breatheScale * (260 / (this.motuSprite.texture.width || 260)));
    }
  }
}
