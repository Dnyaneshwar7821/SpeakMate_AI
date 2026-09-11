import * as PIXI from 'pixi.js';

/**
 * Procedural 2D Animated Superhero Kid Puppet Rig (Sparky)
 * 100% PixiJS v7 vector graphics with domino eye mask, flowing red cape,
 * golden lightning bolt badge, dynamic eye gaze tracking, blinking, and phonetic lip-sync.
 */
export class SuperheroPuppet extends PIXI.Container {
  constructor() {
    super();
    this.name = 'SuperheroPuppet';
    this.isSuperheroPuppet = true;

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

    // 1. Flowing Superhero Cape (Drawn behind body)
    this.capeGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.capeGfx);

    // 2. Torso Suit & Golden Belt
    this.bodyGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.bodyGfx);

    // 3. Lightning Chest Emblem
    this.emblemGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.emblemGfx);

    // 4. Head Container
    this.headContainer = new PIXI.Container();
    this.headContainer.position.set(0, 0);
    this.rootContainer.addChild(this.headContainer);

    // 5. Head Base & Spiky Hair
    this.headBaseGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.headBaseGfx);

    // 6. Domino Superhero Mask
    this.maskGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.maskGfx);

    // 7. Expressive Eyes
    this.eyesGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.eyesGfx);

    // 8. Dynamic Mouth
    this.mouthGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.mouthGfx);

    // 9. Arms & Fists
    this.armsGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.armsGfx);

    this.drawStaticGeometry();
  }

  drawStaticGeometry() {
    // --- 1. Torso Suit & Golden Belt ---
    const bg = this.bodyGfx;
    bg.clear();

    // Deep Royal Blue Hero Suit
    bg.beginFill(0x1D4ED8);
    bg.lineStyle(3.5, 0x0F172A);
    bg.drawRoundedRect(-48, 38, 96, 85, 20);
    bg.endFill();

    // Golden Hero Belt
    bg.beginFill(0xF59E0B);
    bg.lineStyle(2.5, 0xB45309);
    bg.drawRoundedRect(-44, 98, 88, 14, 4);
    bg.endFill();

    // Belt Buckle
    bg.beginFill(0xFEF08A);
    bg.lineStyle(2, 0x92400E);
    bg.drawCircle(0, 105, 9);
    bg.endFill();

    // --- 2. Golden Shield Emblem with Lightning Bolt ---
    const eg = this.emblemGfx;
    eg.clear();

    // Golden Shield
    eg.beginFill(0xFBBF24);
    eg.lineStyle(2.5, 0x0F172A);
    eg.moveTo(0, 48);
    eg.lineTo(24, 56);
    eg.lineTo(18, 82);
    eg.lineTo(0, 94);
    eg.lineTo(-18, 82);
    eg.lineTo(-24, 56);
    eg.closePath();
    eg.endFill();

    // Red/Yellow Lightning Bolt
    eg.beginFill(0xEF4444);
    eg.lineStyle(1.5, 0x7F1D1D);
    eg.moveTo(3, 54);
    eg.lineTo(-10, 70);
    eg.lineTo(1, 70);
    eg.lineTo(-4, 88);
    eg.lineTo(10, 68);
    eg.lineTo(0, 68);
    eg.closePath();
    eg.endFill();

    // --- 3. Head Base: Peach Face + Dark Spiky Hair ---
    const hg = this.headBaseGfx;
    hg.clear();

    // Peach Face Skin
    hg.beginFill(0xFED7AA);
    hg.lineStyle(3.5, 0x0F172A);
    hg.drawCircle(0, -25, 72);
    hg.endFill();

    // Spiky Hair Outline & Fill
    hg.beginFill(0x1E293B);
    hg.lineStyle(3.5, 0x0F172A);
    hg.moveTo(-70, -35);
    hg.quadraticCurveTo(-75, -85, -45, -92);
    hg.lineTo(-20, -108);
    hg.lineTo(10, -96);
    hg.lineTo(40, -106);
    hg.lineTo(60, -85);
    hg.quadraticCurveTo(76, -55, 72, -30);
    hg.quadraticCurveTo(50, -50, 30, -55);
    hg.quadraticCurveTo(0, -60, -30, -55);
    hg.quadraticCurveTo(-55, -45, -70, -35);
    hg.closePath();
    hg.endFill();

    // --- 4. Red Domino Superhero Eye Mask ---
    const mg = this.maskGfx;
    mg.clear();

    mg.beginFill(0xEF4444);
    mg.lineStyle(3, 0x0F172A);
    // Mask shape across eyes
    mg.moveTo(-58, -32);
    mg.quadraticCurveTo(-25, -52, 0, -36);
    mg.quadraticCurveTo(25, -52, 58, -32);
    mg.quadraticCurveTo(54, -6, 26, -14);
    mg.quadraticCurveTo(0, -18, -26, -14);
    mg.quadraticCurveTo(-54, -6, -58, -32);
    mg.closePath();
    mg.endFill();

    // Nose bridge
    mg.lineStyle(2, 0x0F172A);
    mg.moveTo(0, -10);
    mg.lineTo(0, -4);
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
      this.targetLookX = (Math.random() - 0.5) * 0.8;
      this.targetLookY = (Math.random() - 0.5) * 0.5;
      this.nextSaccadeTime = now + 1600 + Math.random() * 2200;
    }

    this.lookX += (this.targetLookX - this.lookX) * 0.08;
    this.lookY += (this.targetLookY - this.lookY) * 0.08;

    // 2. Gentle Heroic Breathing Bob
    const hoverY = Math.sin(t * 2.2) * 3.5;
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

    // 4. Render Dynamic Elements
    this.renderCape(t);
    this.renderEyes();
    this.renderMouth();
    this.renderArms(t);
  }

  renderCape(t) {
    const cg = this.capeGfx;
    cg.clear();

    const waveLeft = Math.sin(t * 3.2) * 10;
    const waveRight = Math.cos(t * 3.2) * 10;

    cg.beginFill(0xDC2626); // Hero Red
    cg.lineStyle(3, 0x0F172A);
    cg.moveTo(-40, 48);
    cg.quadraticCurveTo(-75 + waveLeft, 110, -68 + waveLeft, 155);
    cg.lineTo(68 + waveRight, 155);
    cg.quadraticCurveTo(75 + waveRight, 110, 40, 48);
    cg.closePath();
    cg.endFill();
  }

  renderEyes() {
    const eg = this.eyesGfx;
    eg.clear();

    const leftEyeX = -26;
    const rightEyeX = 26;
    const eyeY = -30;
    const eyeW = 14;
    const eyeH = 11;

    if (this.isBlinking && this.blinkProgress > 0.3 && this.blinkProgress < 0.7) {
      // Closed Happy Eyes (^ ^)
      eg.lineStyle(3.5, 0x0F172A);
      eg.arc(leftEyeX, eyeY + 2, 9, Math.PI * 1.1, Math.PI * 1.9);
      eg.arc(rightEyeX, eyeY + 2, 9, Math.PI * 1.1, Math.PI * 1.9);
    } else {
      // White Eye Sclera Inside Mask Cutouts
      eg.beginFill(0xFFFFFF);
      eg.lineStyle(2.5, 0x0F172A);
      eg.drawEllipse(leftEyeX, eyeY, eyeW, eyeH);
      eg.drawEllipse(rightEyeX, eyeY, eyeW, eyeH);
      eg.endFill();

      // Pupil Tracking
      const pX = this.lookX * 4.5;
      const pY = this.lookY * 3.0;

      // Left Iris & Pupil (Bright Hero Cyan)
      eg.beginFill(0x0284C7);
      eg.drawCircle(leftEyeX + 1 + pX, eyeY + pY, 6);
      eg.endFill();
      eg.beginFill(0x0F172A);
      eg.drawCircle(leftEyeX + 1 + pX, eyeY + pY, 3.5);
      eg.endFill();
      eg.beginFill(0xFFFFFF);
      eg.drawCircle(leftEyeX + pX - 1, eyeY + pY - 1, 1.8);
      eg.endFill();

      // Right Iris & Pupil
      eg.beginFill(0x0284C7);
      eg.drawCircle(rightEyeX - 1 + pX, eyeY + pY, 6);
      eg.endFill();
      eg.beginFill(0x0F172A);
      eg.drawCircle(rightEyeX - 1 + pX, eyeY + pY, 3.5);
      eg.endFill();
      eg.beginFill(0xFFFFFF);
      eg.drawCircle(rightEyeX + pX - 3, eyeY + pY - 1, 1.8);
      eg.endFill();
    }
  }

  renderMouth() {
    const mg = this.mouthGfx;
    mg.clear();

    const mY = Math.max(0, Math.min(1.0, this.mouthY));
    const mForm = Math.max(-1.0, Math.min(1.0, this.mouthForm));
    const centerY = 14;

    if (mY < 0.10) {
      // Confident hero smile
      mg.lineStyle(3, 0x0F172A);
      const smileSpread = 22 + (this.isHappy ? 4 : 0);
      const smileDrop = 10 + (this.isHappy ? 3 : 0);
      mg.moveTo(-smileSpread, centerY);
      mg.quadraticCurveTo(0, centerY + smileDrop, smileSpread, centerY);
    } else {
      // Active Speech Visemes
      const openHeight = 6 + (mY * 30);
      const openWidth = Math.max(12, 20 + (mForm * 8) + (mY * 5));

      mg.beginFill(0x881337);
      mg.lineStyle(3, 0x0F172A);
      mg.moveTo(-openWidth, centerY);
      mg.quadraticCurveTo(0, centerY - (openHeight * 0.15), openWidth, centerY);
      mg.quadraticCurveTo(0, centerY + openHeight, -openWidth, centerY);
      mg.endFill();

      // Upper Teeth
      if (mY > 0.22) {
        mg.beginFill(0xFFFFFF);
        mg.lineStyle(0);
        mg.moveTo(-openWidth * 0.72, centerY);
        mg.quadraticCurveTo(0, centerY - (openHeight * 0.1), openWidth * 0.72, centerY);
        mg.lineTo(openWidth * 0.68, centerY + 4);
        mg.quadraticCurveTo(0, centerY + 6, -openWidth * 0.68, centerY + 4);
        mg.closePath();
        mg.endFill();
      }

      // Pink Tongue
      if (mY > 0.18) {
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

    const armBob = Math.sin(t * 2.5) * 3;

    // Left Arm (Hand on Hip)
    ag.beginFill(0x1D4ED8);
    ag.lineStyle(3.5, 0x0F172A);
    ag.moveTo(-42, 48);
    ag.lineTo(-68, 72 + armBob);
    ag.lineTo(-58, 80 + armBob);
    ag.lineTo(-36, 58);
    ag.closePath();
    ag.endFill();

    // Red Left Hero Glove
    ag.beginFill(0xDC2626);
    ag.lineStyle(3, 0x0F172A);
    ag.drawCircle(-68, 72 + armBob, 14);
    ag.endFill();

    // Right Arm (Hero Fist)
    ag.beginFill(0x1D4ED8);
    ag.lineStyle(3.5, 0x0F172A);
    ag.moveTo(42, 48);
    ag.lineTo(68, 72 - armBob);
    ag.lineTo(58, 80 - armBob);
    ag.lineTo(36, 58);
    ag.closePath();
    ag.endFill();

    // Red Right Hero Glove
    ag.beginFill(0xDC2626);
    ag.lineStyle(3, 0x0F172A);
    ag.drawCircle(68, 72 - armBob, 14);
    ag.endFill();
  }
}
