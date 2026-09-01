import * as PIXI from 'pixi.js';

/**
 * High-Fidelity 3D-Rendered Motu Puppet Rig (From Motu Patlu)
 * Uses high-resolution 3D Motu character illustration with dynamic breathing,
 * eye saccades, natural blinking, and real-time phonetic speech lip-syncing.
 */
export class MotuPuppet extends PIXI.Container {
  constructor() {
    super();
    this.name = 'MotuPuppet';
    this.isMotuPuppet = true;

    // Speech & Lip-Sync State
    this.mouthY = 0;
    this.mouthForm = 0;
    this.isSpeaking = false;
    this.currentMood = 'neutral';
    this.isHappy = true;

    // Gaze & Eye-Tracking State
    this.lookX = 0;
    this.lookY = 0;
    this.targetLookX = 0;
    this.targetLookY = 0;
    this.blinkTimer = performance.now() + 2000;
    this.isBlinking = false;
    this.blinkProgress = 0;
    this.nextSaccadeTime = performance.now() + 1500;

    this.initRig();
  }

  initRig() {
    this.rootContainer = new PIXI.Container();
    this.addChild(this.rootContainer);

    // 1. High-Res 3D Motu Sprite
    this.motuSprite = PIXI.Sprite.from('/models/avatar/motu/motu.png');
    this.motuSprite.anchor.set(0.5, 0.5);
    this.motuSprite.width = 260;
    this.motuSprite.height = 260;
    this.rootContainer.addChild(this.motuSprite);

    // 2. Dynamic Mouth Visemes (Rendered in mouth region)
    this.mouthGfx = new PIXI.Graphics();
    this.mouthGfx.position.set(-2, -12);
    this.rootContainer.addChild(this.mouthGfx);

    // 3. Dynamic Eye Blinks
    this.eyesGfx = new PIXI.Graphics();
    this.eyesGfx.position.set(-2, -62);
    this.rootContainer.addChild(this.eyesGfx);
  }

  setParam(name, value) {
    const key = (name || '').toUpperCase();
    if (key.includes('PARAM_MOUTH_OPEN_Y') || key.includes('PARAMMOUTHOPENY') || key.includes('MOUTH_OPEN')) {
      this.mouthY = Math.max(0, Math.min(1.0, value));
    }
    if (key.includes('PARAM_MOUTH_FORM') || key.includes('PARAMMOUTHFORM')) {
      this.mouthForm = Math.max(-1.0, Math.min(1.0, value));
    }
  }

  setMouthOpen(y, form = 0) {
    this.mouthY = Math.max(0, Math.min(1.0, y));
    this.mouthForm = Math.max(-1.0, Math.min(1.0, form));
  }

  setSpeaking(speaking) {
    this.isSpeaking = Boolean(speaking);
    if (!this.isSpeaking) {
      this.mouthY = 0;
    }
  }

  setLookTarget(x, y) {
    this.targetLookX = Math.max(-1, Math.min(1, x));
    this.targetLookY = Math.max(-1, Math.min(1, y));
  }

  update(now = performance.now()) {
    const t = now * 0.001;

    // 1. Autonomous Saccades
    if (now > this.nextSaccadeTime) {
      this.targetLookX = (Math.random() - 0.5) * 0.6;
      this.targetLookY = (Math.random() - 0.5) * 0.4;
      this.nextSaccadeTime = now + 1600 + Math.random() * 2200;
    }

    this.lookX += (this.targetLookX - this.lookX) * 0.08;
    this.lookY += (this.targetLookY - this.lookY) * 0.08;

    // 2. Jolly Breathing Bob & Tummy Swell
    const hoverY = Math.sin(t * 2.2) * 3.5;
    const breatheScale = 1.0 + Math.sin(t * 2.2) * 0.015;
    this.rootContainer.position.y = hoverY;
    this.motuSprite.scale.set(breatheScale * (260 / (this.motuSprite.texture?.width || 260)));

    // 3. Eye Blinking Logic
    if (now > this.blinkTimer) {
      this.isBlinking = true;
      this.blinkProgress = 0;
      this.blinkTimer = now + 2800 + Math.random() * 3200;
    }
    if (this.isBlinking) {
      this.blinkProgress += 0.20;
      if (this.blinkProgress >= 1.0) {
        this.isBlinking = false;
        this.blinkProgress = 0;
      }
    }

    this.renderEyes();
    this.renderMouth();
  }

  renderEyes() {
    const eg = this.eyesGfx;
    eg.clear();

    if (this.isBlinking && this.blinkProgress > 0.2 && this.blinkProgress < 0.8) {
      // Eyelid skin cover over Motu's eyes during blink
      eg.beginFill(0xFDBA74);
      eg.lineStyle(2.5, 0x1E293B);
      eg.drawEllipse(-28, 0, 16, 14);
      eg.drawEllipse(26, 0, 16, 14);
      eg.endFill();

      // Curved happy closed eyelid lines
      eg.lineStyle(3, 0x1E293B);
      eg.arc(-28, 4, 12, Math.PI * 1.1, Math.PI * 1.9);
      eg.arc(26, 4, 12, Math.PI * 1.1, Math.PI * 1.9);
    }
  }

  renderMouth() {
    const mg = this.mouthGfx;
    mg.clear();

    const mY = Math.max(0, Math.min(1.0, this.mouthY));
    const mForm = Math.max(-1.0, Math.min(1.0, this.mouthForm));
    const cx = 0;
    const cy = 0;

    if (mY > 0.06) {
      // Active Speech Phonetic Cavity over base mouth
      const openHeight = 5 + (mY * 26);
      const openWidth = Math.max(12, 18 + (mForm * 6) + (mY * 5));

      // Dark Red Oral Cavity
      mg.beginFill(0x6B021A);
      mg.lineStyle(2.5, 0x1E293B);
      mg.moveTo(cx - openWidth, cy);
      mg.quadraticCurveTo(cx, cy - (openHeight * 0.15), cx + openWidth, cy);
      mg.quadraticCurveTo(cx, cy + openHeight, cx - openWidth, cy);
      mg.endFill();

      // Pearly White Upper Teeth
      if (mY > 0.16) {
        mg.beginFill(0xFFFFFF);
        mg.lineStyle(0);
        mg.moveTo(cx - openWidth * 0.75, cy);
        mg.quadraticCurveTo(cx, cy - (openHeight * 0.1), cx + openWidth * 0.75, cy);
        mg.lineTo(cx + openWidth * 0.70, cy + 4);
        mg.quadraticCurveTo(cx, cy + 6, cx - openWidth * 0.70, cy + 4);
        mg.closePath();
        mg.endFill();
      }

      // Pink Tongue
      if (mY > 0.12) {
        mg.beginFill(0xFB7185);
        mg.lineStyle(0);
        const tongueW = openWidth * 0.65;
        const tongueBaseY = cy + openHeight - 2;
        mg.moveTo(cx - tongueW, tongueBaseY);
        mg.quadraticCurveTo(cx, tongueBaseY - (openHeight * 0.45), cx + tongueW, tongueBaseY);
        mg.quadraticCurveTo(cx, tongueBaseY + 2, cx - tongueW, tongueBaseY);
        mg.endFill();
      }
    }
  }
}
