import * as PIXI from 'pixi.js';

/**
 * Procedural 2.5D Animated Superhero Kid Puppet Rig
 * Complete with superhero eye-mask, flowing cape, lightning bolt emblem,
 * dynamic eye-gaze tracking, blinking, and phonetic lip-syncing.
 */
function createSuperheroTextures() {
  const textures = {};

  // 1. Superhero Head with Mask
  try {
    const cHead = document.createElement('canvas');
    cHead.width = 300;
    cHead.height = 300;
    const ctx = cHead.getContext('2d');

    // Face skin
    const skinGrad = ctx.createRadialGradient(150, 130, 20, 150, 150, 130);
    skinGrad.addColorStop(0, '#FED7AA');
    skinGrad.addColorStop(0.8, '#FDBA74');
    skinGrad.addColorStop(1.0, '#FB923C');

    ctx.fillStyle = skinGrad;
    ctx.beginPath();
    ctx.arc(150, 150, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 5;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();

    // Hero Hair Tuft / Spiky Hair
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.moveTo(70, 90);
    ctx.quadraticCurveTo(120, 20, 160, 40);
    ctx.quadraticCurveTo(200, 10, 230, 80);
    ctx.quadraticCurveTo(180, 70, 150, 85);
    ctx.quadraticCurveTo(110, 75, 70, 90);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Domino Superhero Eye Mask
    const maskGrad = ctx.createLinearGradient(60, 100, 240, 160);
    maskGrad.addColorStop(0, '#DC2626');
    maskGrad.addColorStop(0.5, '#EF4444');
    maskGrad.addColorStop(1.0, '#B91C1C');

    ctx.fillStyle = maskGrad;
    ctx.beginPath();
    // Left eye mask wing
    ctx.moveTo(50, 120);
    ctx.quadraticCurveTo(90, 85, 140, 120);
    // Mask nose bridge
    ctx.quadraticCurveTo(150, 130, 160, 120);
    // Right eye mask wing
    ctx.quadraticCurveTo(210, 85, 250, 120);
    // Right bottom wing
    ctx.quadraticCurveTo(220, 165, 165, 145);
    ctx.quadraticCurveTo(150, 150, 135, 145);
    // Left bottom wing
    ctx.quadraticCurveTo(80, 165, 50, 120);
    ctx.closePath();
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#7F1D1D';
    ctx.stroke();

    textures.head = PIXI.Texture.from(cHead);
  } catch (_) {}

  // 2. Glowing Lightning Chest Emblem
  try {
    const cEmblem = document.createElement('canvas');
    cEmblem.width = 120;
    cEmblem.height = 120;
    const ctx = cEmblem.getContext('2d');

    // Golden Shield Badge
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(60, 10);
    ctx.lineTo(105, 30);
    ctx.lineTo(95, 90);
    ctx.lineTo(60, 115);
    ctx.lineTo(25, 90);
    ctx.lineTo(15, 30);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#B45309';
    ctx.stroke();

    // Bright Lightning Bolt
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.moveTo(65, 20);
    ctx.lineTo(40, 60);
    ctx.lineTo(60, 60);
    ctx.lineTo(50, 100);
    ctx.lineTo(80, 50);
    ctx.lineTo(60, 50);
    ctx.closePath();
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#D97706';
    ctx.stroke();

    textures.emblem = PIXI.Texture.from(cEmblem);
  } catch (_) {}

  return textures;
}

export class SuperheroPuppet extends PIXI.Container {
  constructor() {
    super();
    this.name = 'SuperheroPuppet';
    this.isSuperheroPuppet = true;

    this.textures = createSuperheroTextures();

    // Speech & Emotion
    this.mouthY = 0;
    this.mouthForm = 0;
    this.isSpeaking = false;
    this.currentMood = 'neutral';
    this.isHappy = true;

    // Gaze & Blinking
    this.lookX = 0;
    this.lookY = 0;
    this.targetLookX = 0;
    this.targetLookY = 0;
    this.blinkProgress = 0;
    this.isBlinking = false;
    this.nextBlinkTime = performance.now() + 2500;
    this.nextSaccadeTime = performance.now() + 1800;

    this.initRig();
  }

  initRig() {
    this.rootContainer = new PIXI.Container();
    this.addChild(this.rootContainer);

    // 1. Flowing Superhero Cape
    this.capeGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.capeGfx);

    // 2. Hero Torso & Suit
    this.bodyGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.bodyGfx);

    // 3. Lightning Emblem
    if (this.textures.emblem) {
      this.emblemSprite = new PIXI.Sprite(this.textures.emblem);
      this.emblemSprite.anchor.set(0.5, 0.5);
      this.emblemSprite.position.set(0, 95);
      this.emblemSprite.scale.set(0.55);
      this.rootContainer.addChild(this.emblemSprite);
    }

    // 4. Head Container
    this.headContainer = new PIXI.Container();
    this.headContainer.position.set(0, -10);
    this.rootContainer.addChild(this.headContainer);

    // Head Base Sprite
    if (this.textures.head) {
      this.headSprite = new PIXI.Sprite(this.textures.head);
      this.headSprite.anchor.set(0.5, 0.5);
      this.headContainer.addChild(this.headSprite);
    }

    // Eyes Container
    this.eyesGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.eyesGfx);

    // Mouth Graphics
    this.mouthGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.mouthGfx);

    // Arms
    this.armsGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.armsGfx);
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
    const t = now * 0.003;

    // Autonomous Eye Blinking
    if (now > this.nextBlinkTime && !this.isBlinking) {
      this.isBlinking = true;
      this.blinkProgress = 0;
      this.nextBlinkTime = now + 3000 + Math.random() * 2500;
    }

    if (this.isBlinking) {
      this.blinkProgress += 0.14;
      if (this.blinkProgress >= 1.0) {
        this.isBlinking = false;
        this.blinkProgress = 0;
      }
    }

    // Autonomous Gaze Saccades
    if (now > this.nextSaccadeTime) {
      this.targetLookX = (Math.random() - 0.5) * 0.7;
      this.targetLookY = (Math.random() - 0.5) * 0.4;
      this.nextSaccadeTime = now + 1500 + Math.random() * 2000;
    }

    this.lookX += (this.targetLookX - this.lookX) * 0.08;
    this.lookY += (this.targetLookY - this.lookY) * 0.08;

    // Gentle Heroic Breathing & Cape Flutter
    const breathY = Math.sin(t * 1.5) * 2.0;
    this.rootContainer.position.y = breathY;

    // Render Cape
    this.renderCape(t);

    // Render Torso Suit
    this.renderBody();

    // Render Eyes & Mask
    this.renderEyes();

    // Render Mouth Visemes
    this.renderMouth();

    // Render Hero Arms & Fists
    this.renderArms(t);
  }

  renderCape(t) {
    const cg = this.capeGfx;
    cg.clear();

    const waveLeft = Math.sin(t * 3.0) * 12;
    const waveRight = Math.cos(t * 3.0) * 12;

    cg.beginFill(0xDC2626); // Bright Hero Red
    cg.lineStyle(3, 0x991B1B);
    cg.moveTo(-45, 60);
    cg.quadraticCurveTo(-90 + waveLeft, 140, -80 + waveLeft, 200);
    cg.lineTo(80 + waveRight, 200);
    cg.quadraticCurveTo(90 + waveRight, 140, 45, 60);
    cg.closePath();
    cg.endFill();
  }

  renderBody() {
    const bg = this.bodyGfx;
    bg.clear();

    // Deep Royal Blue Hero Suit
    bg.beginFill(0x1D4ED8);
    bg.lineStyle(4, 0x0F172A);
    bg.moveTo(-50, 50);
    bg.lineTo(50, 50);
    bg.lineTo(40, 140);
    bg.lineTo(-40, 140);
    bg.closePath();
    bg.endFill();

    // Golden Hero Belt
    bg.beginFill(0xF59E0B);
    bg.lineStyle(2, 0xB45309);
    bg.drawRect(-42, 130, 84, 14);
    bg.endFill();
  }

  renderEyes() {
    const eg = this.eyesGfx;
    eg.clear();

    const eyeOpen = this.isBlinking ? (1 - Math.sin(this.blinkProgress * Math.PI)) : 1.0;
    const pupilX = this.lookX * 5;
    const pupilY = this.lookY * 3;

    const drawEye = (cx, cy) => {
      if (eyeOpen < 0.15) {
        // Closed eye line
        eg.lineStyle(3.5, 0x0F172A);
        eg.moveTo(cx - 16, cy);
        eg.quadraticCurveTo(cx, cy + 5, cx + 16, cy);
      } else {
        // White sclera
        eg.beginFill(0xFFFFFF);
        eg.lineStyle(2.5, 0x0F172A);
        eg.drawEllipse(cx, cy, 18, 14 * eyeOpen);
        eg.endFill();

        // Bright blue superhero iris
        eg.beginFill(0x0284C7);
        eg.drawCircle(cx + pupilX, cy + pupilY, 7 * eyeOpen);
        eg.endFill();

        // Dark pupil
        eg.beginFill(0x0F172A);
        eg.drawCircle(cx + pupilX, cy + pupilY, 4 * eyeOpen);
        eg.endFill();

        // Eye glint
        eg.beginFill(0xFFFFFF);
        eg.drawCircle(cx + pupilX - 2, cy + pupilY - 2, 2.5 * eyeOpen);
        eg.endFill();
      }
    };

    drawEye(-42, -18);
    drawEye(42, -18);
  }

  renderMouth() {
    const mg = this.mouthGfx;
    mg.clear();

    const mY = Math.max(0, Math.min(1.0, this.mouthY));
    const mForm = Math.max(-1.0, Math.min(1.0, this.mouthForm));
    const cx = 0;
    const cy = 25;

    if (mY < 0.08) {
      // Confident hero smile
      mg.lineStyle(3.5, 0x0F172A);
      mg.moveTo(cx - 24, cy);
      mg.quadraticCurveTo(cx, cy + 12, cx + 24, cy);
    } else {
      // Open mouth with phonetic speech
      const openH = 6 + (mY * 26);
      const openW = Math.max(12, 18 + (mForm * 6) + (mY * 6));

      mg.beginFill(0x881337);
      mg.lineStyle(3, 0x0F172A);
      mg.moveTo(cx - openW, cy);
      mg.quadraticCurveTo(cx, cy - (openH * 0.15), cx + openW, cy);
      mg.quadraticCurveTo(cx, cy + openH, cx - openW, cy);
      mg.endFill();

      // Tongue
      if (mY > 0.15) {
        mg.beginFill(0xFB7185);
        mg.lineStyle(0);
        mg.drawEllipse(cx, cy + openH - 4, openW * 0.6, openH * 0.35);
        mg.endFill();
      }
    }
  }

  renderArms(t) {
    const ag = this.armsGfx;
    ag.clear();

    const fistBob = Math.sin(t * 2.0) * 3;

    // Left Arm (Heroic Hand on Hip)
    ag.beginFill(0x1D4ED8);
    ag.lineStyle(4, 0x0F172A);
    ag.moveTo(-46, 60);
    ag.lineTo(-75, 95 + fistBob);
    ag.lineTo(-44, 115);
    ag.stroke();

    // Red Hero Glove
    ag.beginFill(0xDC2626);
    ag.drawCircle(-44, 115, 12);
    ag.endFill();

    // Right Arm (Heroic Fist Raised)
    ag.beginFill(0x1D4ED8);
    ag.lineStyle(4, 0x0F172A);
    ag.moveTo(46, 60);
    ag.lineTo(75, 95 - fistBob);
    ag.lineTo(44, 115);
    ag.stroke();

    // Red Hero Glove
    ag.beginFill(0xDC2626);
    ag.drawCircle(44, 115, 12);
    ag.endFill();
  }
}
