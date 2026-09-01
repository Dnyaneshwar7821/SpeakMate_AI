import * as PIXI from 'pixi.js';

/**
 * Procedural 2D Doraemon-Style Mascot Rig (Robo-Paws)
 * Clean, iconic 2D cel-shaded vector character with dynamic eye tracking,
 * blinking, autonomous breathing, and phonetic speech visemes.
 */
export class DoraemonPuppet extends PIXI.Container {
  constructor() {
    super();
    this.name = 'DoraemonPuppet';
    this.isDoraemonPuppet = true;

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

    // 1. Torso & Body Graphics
    this.bodyGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.bodyGfx);

    // 2. Red Collar & Golden Bell
    this.collarGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.collarGfx);

    // 3. Head Container
    this.headContainer = new PIXI.Container();
    this.headContainer.position.set(0, 0);
    this.rootContainer.addChild(this.headContainer);

    // 4. Head Base (Spherical Cyan Head + White Face Disc)
    this.headBaseGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.headBaseGfx);

    // 5. Expressive Eyes
    this.eyesGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.eyesGfx);

    // 6. Nose & Whiskers
    this.noseWhiskersGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.noseWhiskersGfx);

    // 7. Dynamic Phonetic Mouth
    this.mouthGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.mouthGfx);

    // 8. Robotic Arms & Hands
    this.leftHandGfx = new PIXI.Graphics();
    this.rightHandGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.leftHandGfx);
    this.rootContainer.addChild(this.rightHandGfx);

    this.drawStatic2DGeometry();
  }

  drawStatic2DGeometry() {
    // --- 1. Torso, Belly & Gadget Pocket ---
    const bg = this.bodyGfx;
    bg.clear();

    // Iconic 2D Cyan-Blue Body
    bg.beginFill(0x0284C7);
    bg.lineStyle(3.5, 0x0F172A);
    bg.drawRoundedRect(-58, 42, 116, 95, 34);
    bg.endFill();

    // White Circular Belly Disc
    bg.beginFill(0xFFFFFF);
    bg.lineStyle(2.5, 0x0F172A);
    bg.drawCircle(0, 84, 38);
    bg.endFill();

    // Gadget Pocket
    bg.beginFill(0xFFFFFF);
    bg.lineStyle(2.5, 0x0F172A);
    bg.arc(0, 84, 27, 0, Math.PI);
    bg.lineTo(27, 84);
    bg.endFill();
    bg.lineStyle(2.5, 0x0F172A);
    bg.moveTo(-27, 84);
    bg.lineTo(27, 84);

    // --- 2. Red Neck Collar & Golden Bell ---
    const col = this.collarGfx;
    col.clear();

    // Bright Red Collar Band
    col.beginFill(0xEF4444);
    col.lineStyle(3, 0x0F172A);
    col.drawRoundedRect(-48, 35, 96, 16, 7);
    col.endFill();

    // Golden Bell
    col.beginFill(0xFBBF24);
    col.lineStyle(2.5, 0x0F172A);
    col.drawCircle(0, 50, 14);
    col.endFill();

    // Bell Details
    col.lineStyle(2, 0x0F172A);
    col.moveTo(-12, 48);
    col.lineTo(12, 48);
    col.beginFill(0x334155);
    col.drawCircle(0, 54, 3.5);
    col.endFill();
    col.moveTo(0, 57.5);
    col.lineTo(0, 64);

    // --- 3. Head Base: Spherical Cyan Head + White Face Mask ---
    const hg = this.headBaseGfx;
    hg.clear();

    // 2D Cyan Robot Head
    hg.beginFill(0x0284C7);
    hg.lineStyle(3.8, 0x0F172A);
    hg.drawCircle(0, -30, 80);
    hg.endFill();

    // 2D White Face Plate
    hg.beginFill(0xFFFFFF);
    hg.lineStyle(2.2, 0x0F172A);
    hg.drawEllipse(0, -10, 66, 48);
    hg.endFill();

    // --- 4. Red Button Nose & 6 Whiskers ---
    const nwg = this.noseWhiskersGfx;
    nwg.clear();

    // Red Sphere Nose
    nwg.beginFill(0xEF4444);
    nwg.lineStyle(2.5, 0x0F172A);
    nwg.drawCircle(0, -30, 11);
    nwg.endFill();

    // Nose White Glint
    nwg.beginFill(0xFFFFFF, 0.9);
    nwg.drawCircle(-3, -33, 3.5);
    nwg.endFill();

    // Center Vertical Seam
    nwg.lineStyle(2.5, 0x0F172A);
    nwg.moveTo(0, -19);
    nwg.lineTo(0, 6);

    // 6 Whiskers
    nwg.lineStyle(2.2, 0x0F172A);
    nwg.moveTo(-16, -20); nwg.lineTo(-58, -26);
    nwg.moveTo(-18, -12); nwg.lineTo(-64, -12);
    nwg.moveTo(-16, -4); nwg.lineTo(-58, 2);

    nwg.moveTo(16, -20); nwg.lineTo(58, -26);
    nwg.moveTo(18, -12); nwg.lineTo(64, -12);
    nwg.moveTo(16, -4); nwg.lineTo(58, 2);

    this.drawHands(0);
  }

  drawHands(t) {
    const lh = this.leftHandGfx;
    const rh = this.rightHandGfx;
    lh.clear();
    rh.clear();

    const lOffset = Math.sin(t) * 3;
    const rOffset = Math.cos(t) * 3;

    // Left Arm
    lh.beginFill(0x0284C7);
    lh.lineStyle(3, 0x0F172A);
    lh.moveTo(-44, 48);
    lh.lineTo(-66, 68 + lOffset);
    lh.lineTo(-56, 76 + lOffset);
    lh.lineTo(-38, 58);
    lh.closePath();
    lh.endFill();

    // Left White Round Hand
    lh.beginFill(0xFFFFFF);
    lh.lineStyle(3, 0x0F172A);
    lh.drawCircle(-66, 68 + lOffset, 16);
    lh.endFill();

    // Right Arm
    rh.beginFill(0x0284C7);
    rh.lineStyle(3, 0x0F172A);
    rh.moveTo(44, 48);
    rh.lineTo(66, 68 + rOffset);
    rh.lineTo(56, 76 + rOffset);
    rh.lineTo(38, 58);
    rh.closePath();
    rh.endFill();

    // Right White Round Hand
    rh.beginFill(0xFFFFFF);
    rh.lineStyle(3, 0x0F172A);
    rh.drawCircle(66, 68 + rOffset, 16);
    rh.endFill();
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

    // Autonomous Saccades
    if (now > this.nextSaccadeTime) {
      this.targetLookX = (Math.random() - 0.5) * 0.8;
      this.targetLookY = (Math.random() - 0.5) * 0.5;
      this.nextSaccadeTime = now + 1600 + Math.random() * 2200;
    }

    this.lookX += (this.targetLookX - this.lookX) * 0.08;
    this.lookY += (this.targetLookY - this.lookY) * 0.08;

    // Gentle Breathing
    const hoverY = Math.sin(t * 2.0) * 3.0;
    this.rootContainer.y = hoverY;

    this.drawHands(t * 2.2);

    // Eye Blinking Logic
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
  }

  renderEyes() {
    const eg = this.eyesGfx;
    eg.clear();

    const leftEyeX = -15;
    const rightEyeX = 15;
    const eyeY = -48;
    const eyeW = 15;
    const eyeH = 20;

    if (this.isBlinking && this.blinkProgress > 0.3 && this.blinkProgress < 0.7) {
      // Closed Happy Eyes (^ ^)
      eg.lineStyle(3.5, 0x0F172A);
      eg.arc(leftEyeX, eyeY + 4, 11, Math.PI * 1.1, Math.PI * 1.9);
      eg.arc(rightEyeX, eyeY + 4, 11, Math.PI * 1.1, Math.PI * 1.9);
    } else {
      // Left Eye Capsule (White)
      eg.beginFill(0xFFFFFF);
      eg.lineStyle(3, 0x0F172A);
      eg.drawEllipse(leftEyeX, eyeY, eyeW, eyeH);
      eg.endFill();

      // Right Eye Capsule (White)
      eg.beginFill(0xFFFFFF);
      eg.lineStyle(3, 0x0F172A);
      eg.drawEllipse(rightEyeX, eyeY, eyeW, eyeH);
      eg.endFill();

      // Pupil Tracking
      const pX = this.lookX * 5.2;
      const pY = this.lookY * 4.0;

      // Left Pupil
      eg.beginFill(0x0F172A);
      eg.drawCircle(leftEyeX + 3 + pX, eyeY + 2 + pY, 6.5);
      eg.endFill();
      eg.beginFill(0xFFFFFF);
      eg.drawCircle(leftEyeX + 1 + pX, eyeY - 1 + pY, 2.5);
      eg.endFill();

      // Right Pupil
      eg.beginFill(0x0F172A);
      eg.drawCircle(rightEyeX - 3 + pX, eyeY + 2 + pY, 6.5);
      eg.endFill();
      eg.beginFill(0xFFFFFF);
      eg.drawCircle(rightEyeX - 5 + pX, eyeY - 1 + pY, 2.5);
      eg.endFill();
    }
  }

  renderMouth() {
    const mg = this.mouthGfx;
    mg.clear();

    const mY = Math.max(0, Math.min(1.0, this.mouthY));
    const mForm = Math.max(-1.0, Math.min(1.0, this.mouthForm));
    const centerY = 5;

    if (mY < 0.10) {
      // Resting Smile Curve
      mg.lineStyle(3, 0x0F172A);
      const smileSpread = 28 + (this.isHappy ? 6 : 0);
      const smileDrop = 14 + (this.isHappy ? 4 : 0);
      mg.moveTo(-smileSpread, centerY);
      mg.quadraticCurveTo(0, centerY + smileDrop, smileSpread, centerY);
    } else {
      // Active Speech Visemes
      const openHeight = 8 + (mY * 36);
      const openWidth = Math.max(14, 24 + (mForm * 10) + (mY * 6));

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
        mg.lineTo(openWidth * 0.68, centerY + 5);
        mg.quadraticCurveTo(0, centerY + 7, -openWidth * 0.68, centerY + 5);
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
}
