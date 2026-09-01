import * as PIXI from 'pixi.js';

/**
 * Procedural 2D Animated Motu Puppet Rig (From Motu Patlu)
 * Complete with Motu's iconic round head, hair tuft, prominent black mustache,
 * red kurta tunic with blue sleeveless vest, eye tracking, blinking, and real-time lip-sync.
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

    // 1. Torso & Tummy (Red Kurta + Blue Vest)
    this.bodyGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.bodyGfx);

    // 2. Head Container
    this.headContainer = new PIXI.Container();
    this.headContainer.position.set(0, 0);
    this.rootContainer.addChild(this.headContainer);

    // 3. Head Base & Ears & Hair Tuft
    this.headBaseGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.headBaseGfx);

    // 4. Eyes Graphics
    this.eyesGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.eyesGfx);

    // 5. Dynamic Mouth (Behind mustache)
    this.mouthGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.mouthGfx);

    // 6. Iconic Motu Mustache & Nose (In front of mouth)
    this.mustacheNoseGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.mustacheNoseGfx);

    // 7. Arms & Hands on Tummy
    this.armsGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.armsGfx);

    this.drawStaticGeometry();
  }

  drawStaticGeometry() {
    // --- 1. Round Belly Torso (Red Kurta with Navy Blue Vest) ---
    const bg = this.bodyGfx;
    bg.clear();

    // Red Kurta Base
    bg.beginFill(0xDC2626);
    bg.lineStyle(3.5, 0x0F172A);
    bg.drawEllipse(0, 85, 62, 58);
    bg.endFill();

    // Navy Blue Sleeveless Vest (Left Flap)
    bg.beginFill(0x1E3A8A);
    bg.lineStyle(3, 0x0F172A);
    bg.moveTo(-52, 45);
    bg.lineTo(-15, 45);
    bg.lineTo(-18, 125);
    bg.lineTo(-50, 115);
    bg.closePath();
    bg.endFill();

    // Navy Blue Sleeveless Vest (Right Flap)
    bg.beginFill(0x1E3A8A);
    bg.lineStyle(3, 0x0F172A);
    bg.moveTo(52, 45);
    bg.lineTo(15, 45);
    bg.lineTo(18, 125);
    bg.lineTo(50, 115);
    bg.closePath();
    bg.endFill();

    // Kurta Neckline & Button Details
    bg.lineStyle(2, 0xFBBF24);
    bg.moveTo(0, 45);
    bg.lineTo(0, 85);
    bg.beginFill(0xFBBF24);
    bg.drawCircle(0, 58, 2.5);
    bg.drawCircle(0, 72, 2.5);
    bg.endFill();

    // --- 2. Head Base: Round Peach Face + Ears + Iconic Hair Tuft ---
    const hg = this.headBaseGfx;
    hg.clear();

    // Left Ear
    hg.beginFill(0xFDBA74);
    hg.lineStyle(3, 0x0F172A);
    hg.drawEllipse(-62, -20, 10, 15);
    hg.endFill();

    // Right Ear
    hg.beginFill(0xFDBA74);
    hg.lineStyle(3, 0x0F172A);
    hg.drawEllipse(62, -20, 10, 15);
    hg.endFill();

    // Round Motu Face / Head Base
    hg.beginFill(0xFDBA74);
    hg.lineStyle(3.8, 0x0F172A);
    hg.drawCircle(0, -22, 65);
    hg.endFill();

    // Soft Cheerful Cheek Blush
    hg.beginFill(0xFB7185, 0.35);
    hg.lineStyle(0);
    hg.drawCircle(-38, -10, 10);
    hg.drawCircle(38, -10, 10);
    hg.endFill();

    // Iconic Top Hair Tuft (Single cute curly tuft)
    hg.beginFill(0x1E293B);
    hg.lineStyle(3, 0x0F172A);
    hg.moveTo(-5, -87);
    hg.quadraticCurveTo(-15, -112, 5, -118);
    hg.quadraticCurveTo(18, -110, 10, -98);
    hg.quadraticCurveTo(6, -90, 5, -87);
    hg.closePath();
    hg.endFill();

    // Eyebrows
    hg.lineStyle(3.5, 0x1E293B);
    // Left Eyebrow
    hg.moveTo(-36, -54);
    hg.quadraticCurveTo(-22, -62, -8, -52);
    // Right Eyebrow
    hg.moveTo(8, -52);
    hg.quadraticCurveTo(22, -62, 36, -54);

    // --- 3. Iconic Mustache & Nose ---
    const mng = this.mustacheNoseGfx;
    mng.clear();

    // Big Round Friendly Nose
    mng.beginFill(0xFB923C);
    mng.lineStyle(2.5, 0x0F172A);
    mng.drawEllipse(0, -18, 12, 10);
    mng.endFill();
    mng.beginFill(0xFFFFFF, 0.6);
    mng.drawCircle(-3, -21, 2.5);
    mng.endFill();

    // Iconic Thick Black Motu Mustache
    mng.beginFill(0x1E293B);
    mng.lineStyle(3, 0x0F172A);
    // Left Wing
    mng.moveTo(0, -10);
    mng.quadraticCurveTo(-22, -8, -46, 0);
    mng.quadraticCurveTo(-38, 10, -20, 4);
    mng.lineTo(0, -2);
    // Right Wing
    mng.lineTo(20, 4);
    mng.quadraticCurveTo(38, 10, 46, 0);
    mng.quadraticCurveTo(22, -8, 0, -10);
    mng.closePath();
    mng.endFill();
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
      this.targetLookX = (Math.random() - 0.5) * 0.7;
      this.targetLookY = (Math.random() - 0.5) * 0.5;
      this.nextSaccadeTime = now + 1600 + Math.random() * 2200;
    }

    this.lookX += (this.targetLookX - this.lookX) * 0.08;
    this.lookY += (this.targetLookY - this.lookY) * 0.08;

    // 2. Jolly Belly Breathing & Head Bob
    const hoverY = Math.sin(t * 2.0) * 3.5;
    this.rootContainer.y = hoverY;

    // 3. Eye Blinking Logic
    if (now > this.blinkTimer) {
      this.isBlinking = true;
      this.blinkProgress = 0;
      this.blinkTimer = now + 2600 + Math.random() * 3200;
    }
    if (this.isBlinking) {
      this.blinkProgress += 0.18;
      if (this.blinkProgress >= 1.0) {
        this.isBlinking = false;
        this.blinkProgress = 0;
      }
    }

    this.renderEyes();
    this.renderMouth();
    this.renderArms(t);
  }

  renderEyes() {
    const eg = this.eyesGfx;
    eg.clear();

    const leftEyeX = -20;
    const rightEyeX = 20;
    const eyeY = -34;
    const eyeW = 14;
    const eyeH = 16;

    if (this.isBlinking && this.blinkProgress > 0.3 && this.blinkProgress < 0.7) {
      // Closed Jolly Eyes (^ ^)
      eg.lineStyle(3.5, 0x0F172A);
      eg.arc(leftEyeX, eyeY + 4, 10, Math.PI * 1.1, Math.PI * 1.9);
      eg.arc(rightEyeX, eyeY + 4, 10, Math.PI * 1.1, Math.PI * 1.9);
    } else {
      // White Sclera
      eg.beginFill(0xFFFFFF);
      eg.lineStyle(2.5, 0x0F172A);
      eg.drawEllipse(leftEyeX, eyeY, eyeW, eyeH);
      eg.drawEllipse(rightEyeX, eyeY, eyeW, eyeH);
      eg.endFill();

      // Pupils
      const pX = this.lookX * 4.5;
      const pY = this.lookY * 3.5;

      // Left Pupil
      eg.beginFill(0x1E293B);
      eg.drawCircle(leftEyeX + 2 + pX, eyeY + 2 + pY, 5.5);
      eg.endFill();
      eg.beginFill(0xFFFFFF);
      eg.drawCircle(leftEyeX + pX, eyeY + pY, 2);
      eg.endFill();

      // Right Pupil
      eg.beginFill(0x1E293B);
      eg.drawCircle(rightEyeX - 2 + pX, eyeY + 2 + pY, 5.5);
      eg.endFill();
      eg.beginFill(0xFFFFFF);
      eg.drawCircle(rightEyeX + pX - 4, eyeY + pY, 2);
      eg.endFill();
    }
  }

  renderMouth() {
    const mg = this.mouthGfx;
    mg.clear();

    const mY = Math.max(0, Math.min(1.0, this.mouthY));
    const mForm = Math.max(-1.0, Math.min(1.0, this.mouthForm));
    const centerY = 6;

    if (mY < 0.08) {
      // Happy Resting Smile beneath mustache
      mg.lineStyle(3, 0x0F172A);
      const smileSpread = 22 + (this.isHappy ? 4 : 0);
      const smileDrop = 12 + (this.isHappy ? 3 : 0);
      mg.moveTo(-smileSpread, centerY);
      mg.quadraticCurveTo(0, centerY + smileDrop, smileSpread, centerY);
    } else {
      // Active Speech Visemes
      const openHeight = 8 + (mY * 32);
      const openWidth = Math.max(14, 22 + (mForm * 8) + (mY * 5));

      mg.beginFill(0x881337);
      mg.lineStyle(3, 0x0F172A);
      mg.moveTo(-openWidth, centerY);
      mg.quadraticCurveTo(0, centerY - (openHeight * 0.15), openWidth, centerY);
      mg.quadraticCurveTo(0, centerY + openHeight, -openWidth, centerY);
      mg.endFill();

      // Upper Teeth
      if (mY > 0.20) {
        mg.beginFill(0xFFFFFF);
        mg.lineStyle(0);
        mg.moveTo(-openWidth * 0.75, centerY);
        mg.quadraticCurveTo(0, centerY - (openHeight * 0.1), openWidth * 0.75, centerY);
        mg.lineTo(openWidth * 0.70, centerY + 4.5);
        mg.quadraticCurveTo(0, centerY + 6.5, -openWidth * 0.70, centerY + 4.5);
        mg.closePath();
        mg.endFill();
      }

      // Pink Tongue
      if (mY > 0.16) {
        mg.beginFill(0xFB7185);
        mg.lineStyle(0);
        const tongueW = openWidth * 0.65;
        const tongueBaseY = centerY + openHeight - 2;
        mg.moveTo(-tongueW, tongueBaseY);
        mg.quadraticCurveTo(0, tongueBaseY - (openHeight * 0.45), tongueW, tongueBaseY);
        mg.quadraticCurveTo(0, tongueBaseY + 2, -tongueW, tongueBaseY);
        mg.endFill();
      }
    }
  }

  renderArms(t) {
    const ag = this.armsGfx;
    ag.clear();

    const bellyBob = Math.sin(t * 2.0) * 2;

    // Left Arm (Resting on Belly)
    ag.beginFill(0xDC2626);
    ag.lineStyle(3.5, 0x0F172A);
    ag.moveTo(-50, 52);
    ag.lineTo(-75, 80 + bellyBob);
    ag.lineTo(-40, 105);
    ag.lineTo(-30, 92);
    ag.closePath();
    ag.endFill();

    // Left Peach Hand on Belly
    ag.beginFill(0xFDBA74);
    ag.lineStyle(2.5, 0x0F172A);
    ag.drawCircle(-36, 102 + bellyBob, 12);
    ag.endFill();

    // Right Arm (Jolly Wave / Hand on Belly)
    ag.beginFill(0xDC2626);
    ag.lineStyle(3.5, 0x0F172A);
    ag.moveTo(50, 52);
    ag.lineTo(75, 80 - bellyBob);
    ag.lineTo(40, 105);
    ag.lineTo(30, 92);
    ag.closePath();
    ag.endFill();

    // Right Peach Hand
    ag.beginFill(0xFDBA74);
    ag.lineStyle(2.5, 0x0F172A);
    ag.drawCircle(36, 102 - bellyBob, 12);
    ag.endFill();
  }
}
