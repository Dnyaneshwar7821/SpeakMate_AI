import * as PIXI from 'pixi.js';

/**
 * Procedural 2D Vector Motu Mascot Rig (From Motu Patlu)
 * Built with pure PixiJS v7 vector graphics matching the Robo-Paws architecture.
 * Features Motu's iconic pear-shaped head, hair tuft, thick black mustache,
 * red kurta with blue vest, eye gaze tracking, blinking, and real-time phonetic lip-sync.
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

    // 1. Torso, Belly, Red Kurta & Blue Vest
    this.bodyGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.bodyGfx);

    // 2. Head Container
    this.headContainer = new PIXI.Container();
    this.headContainer.position.set(0, 0);
    this.rootContainer.addChild(this.headContainer);

    // 3. Head Base (Pear-shaped bald head, ears, side hair, hair tuft)
    this.headBaseGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.headBaseGfx);

    // 4. Expressive Eyes & Eyebrows
    this.eyesGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.eyesGfx);

    // 5. Dynamic Phonetic Mouth (Drawn behind the mustache)
    this.mouthGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.mouthGfx);

    // 6. Iconic Nose & Thick Mustache (Drawn in front of mouth top lip)
    this.mustacheNoseGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.mustacheNoseGfx);

    // 7. Chubby Arms & Hands
    this.armsGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.armsGfx);

    this.drawStatic2DGeometry();
  }

  drawStatic2DGeometry() {
    // --- 1. Chunky Belly in Red Kurta + Navy Blue Vest ---
    const bg = this.bodyGfx;
    bg.clear();

    // Round Red Kurta Belly
    bg.beginFill(0xDC2626);
    bg.lineStyle(3.5, 0x0F172A);
    bg.drawEllipse(0, 80, 64, 60);
    bg.endFill();

    // Navy Blue Sleeveless Vest (Left Flap)
    bg.beginFill(0x1E3A8A);
    bg.lineStyle(3, 0x0F172A);
    bg.moveTo(-54, 40);
    bg.lineTo(-16, 40);
    bg.lineTo(-20, 122);
    bg.lineTo(-52, 114);
    bg.closePath();
    bg.endFill();

    // Navy Blue Sleeveless Vest (Right Flap)
    bg.beginFill(0x1E3A8A);
    bg.lineStyle(3, 0x0F172A);
    bg.moveTo(54, 40);
    bg.lineTo(16, 40);
    bg.lineTo(20, 122);
    bg.lineTo(52, 114);
    bg.closePath();
    bg.endFill();

    // Kurta Placket & Golden Buttons
    bg.lineStyle(2.5, 0xFBBF24);
    bg.moveTo(0, 38);
    bg.lineTo(0, 82);

    bg.beginFill(0xFBBF24);
    bg.lineStyle(1.5, 0xB45309);
    bg.drawCircle(0, 52, 3);
    bg.drawCircle(0, 68, 3);
    bg.endFill();

    // --- 2. Head Base: Pear-shaped Bald Head, Ears, Hair Tuft ---
    const hg = this.headBaseGfx;
    hg.clear();

    // Left Ear
    hg.beginFill(0xFDBA74);
    hg.lineStyle(3, 0x0F172A);
    hg.drawEllipse(-65, -20, 11, 16);
    hg.endFill();
    hg.lineStyle(2, 0xEA580C);
    hg.arc(-65, -20, 7, 0.5, Math.PI * 1.2);

    // Right Ear
    hg.beginFill(0xFDBA74);
    hg.lineStyle(3, 0x0F172A);
    hg.drawEllipse(65, -20, 11, 16);
    hg.endFill();
    hg.lineStyle(2, 0xEA580C);
    hg.arc(65, -20, 7, Math.PI * 1.8, Math.PI * 0.5);

    // Side Hair Patches above ears
    hg.beginFill(0x1E293B);
    hg.lineStyle(3, 0x0F172A);
    // Left side hair
    hg.moveTo(-60, -32);
    hg.lineTo(-72, -18);
    hg.lineTo(-62, -12);
    hg.closePath();
    hg.endFill();
    // Right side hair
    hg.beginFill(0x1E293B);
    hg.lineStyle(3, 0x0F172A);
    hg.moveTo(60, -32);
    hg.lineTo(72, -18);
    hg.lineTo(62, -12);
    hg.closePath();
    hg.endFill();

    // Motu's Iconic Pear-Shaped Head (Wide chubby cheeks, narrower bald dome)
    hg.beginFill(0xFDBA74);
    hg.lineStyle(3.8, 0x0F172A);
    hg.moveTo(0, -90);
    hg.quadraticCurveTo(55, -90, 62, -35);
    hg.quadraticCurveTo(68, 15, 42, 35);
    hg.quadraticCurveTo(0, 44, -42, 35);
    hg.quadraticCurveTo(-68, 15, -62, -35);
    hg.quadraticCurveTo(-55, -90, 0, -90);
    hg.closePath();
    hg.endFill();

    // Rosy Cheeks
    hg.beginFill(0xFB7185, 0.4);
    hg.lineStyle(0);
    hg.drawEllipse(-40, -6, 12, 8);
    hg.drawEllipse(40, -6, 12, 8);
    hg.endFill();

    // Iconic Curly Hair Tuft on top of bald head
    hg.beginFill(0x1E293B);
    hg.lineStyle(3.2, 0x0F172A);
    hg.moveTo(-4, -90);
    hg.quadraticCurveTo(-14, -116, 8, -122);
    hg.quadraticCurveTo(22, -114, 12, -100);
    hg.quadraticCurveTo(6, -92, 4, -90);
    hg.closePath();
    hg.endFill();

    // Thick Expressive Eyebrows
    hg.lineStyle(4, 0x1E293B);
    // Left Eyebrow
    hg.moveTo(-42, -54);
    hg.quadraticCurveTo(-26, -66, -10, -54);
    // Right Eyebrow
    hg.moveTo(10, -54);
    hg.quadraticCurveTo(26, -66, 42, -54);

    // --- 3. Nose & Thick Black Mustache ---
    const mng = this.mustacheNoseGfx;
    mng.clear();

    // Bulbous Round Orange-Peach Nose
    mng.beginFill(0xFB923C);
    mng.lineStyle(2.8, 0x0F172A);
    mng.drawEllipse(0, -18, 14, 11);
    mng.endFill();

    // Nose White Glint
    mng.beginFill(0xFFFFFF, 0.7);
    mng.drawCircle(-4, -22, 3);
    mng.endFill();

    // Famous Thick Motu Mustache (Curving Handlebar)
    mng.beginFill(0x1E293B);
    mng.lineStyle(3.2, 0x0F172A);
    mng.moveTo(0, -10);
    mng.quadraticCurveTo(-24, -8, -50, 2);
    mng.quadraticCurveTo(-42, 14, -22, 6);
    mng.lineTo(0, -2);
    mng.lineTo(22, 6);
    mng.quadraticCurveTo(42, 14, 50, 2);
    mng.quadraticCurveTo(24, -8, 0, -10);
    mng.closePath();
    mng.endFill();

    this.drawHands(0);
  }

  drawHands(t) {
    const ag = this.armsGfx;
    ag.clear();

    const bellyBob = Math.sin(t) * 3;

    // Left Arm (Chubby red sleeve resting on tummy)
    ag.beginFill(0xDC2626);
    ag.lineStyle(3.5, 0x0F172A);
    ag.moveTo(-48, 48);
    ag.lineTo(-76, 75 + bellyBob);
    ag.lineTo(-44, 98);
    ag.lineTo(-34, 86);
    ag.closePath();
    ag.endFill();

    // Left Peach Hand
    ag.beginFill(0xFDBA74);
    ag.lineStyle(2.8, 0x0F172A);
    ag.drawCircle(-42, 96 + bellyBob, 14);
    ag.endFill();

    // Right Arm (Chubby red sleeve resting on tummy)
    ag.beginFill(0xDC2626);
    ag.lineStyle(3.5, 0x0F172A);
    ag.moveTo(48, 48);
    ag.lineTo(76, 75 - bellyBob);
    ag.lineTo(44, 98);
    ag.lineTo(34, 86);
    ag.closePath();
    ag.endFill();

    // Right Peach Hand
    ag.beginFill(0xFDBA74);
    ag.lineStyle(2.8, 0x0F172A);
    ag.drawCircle(42, 96 - bellyBob, 14);
    ag.endFill();
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
    const hoverY = Math.sin(t * 2.2) * 3.5;
    this.rootContainer.y = hoverY;

    this.drawHands(t * 2.2);

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
  }

  renderEyes() {
    const eg = this.eyesGfx;
    eg.clear();

    const leftEyeX = -22;
    const rightEyeX = 22;
    const eyeY = -36;
    const eyeW = 15;
    const eyeH = 17;

    if (this.isBlinking && this.blinkProgress > 0.3 && this.blinkProgress < 0.7) {
      // Closed Jolly Eyes (^ ^)
      eg.lineStyle(3.5, 0x0F172A);
      eg.arc(leftEyeX, eyeY + 4, 11, Math.PI * 1.1, Math.PI * 1.9);
      eg.arc(rightEyeX, eyeY + 4, 11, Math.PI * 1.1, Math.PI * 1.9);
    } else {
      // White Eye Sclera
      eg.beginFill(0xFFFFFF);
      eg.lineStyle(2.8, 0x0F172A);
      eg.drawEllipse(leftEyeX, eyeY, eyeW, eyeH);
      eg.drawEllipse(rightEyeX, eyeY, eyeW, eyeH);
      eg.endFill();

      // Pupil Gaze Tracking
      const pX = this.lookX * 5.0;
      const pY = this.lookY * 3.8;

      // Left Pupil (Dark Brown/Black)
      eg.beginFill(0x1E293B);
      eg.drawCircle(leftEyeX + 2 + pX, eyeY + 2 + pY, 6.0);
      eg.endFill();
      eg.beginFill(0xFFFFFF);
      eg.drawCircle(leftEyeX + pX, eyeY + pY, 2.2);
      eg.endFill();

      // Right Pupil
      eg.beginFill(0x1E293B);
      eg.drawCircle(rightEyeX - 2 + pX, eyeY + 2 + pY, 6.0);
      eg.endFill();
      eg.beginFill(0xFFFFFF);
      eg.drawCircle(rightEyeX + pX - 4, eyeY + pY, 2.2);
      eg.endFill();
    }
  }

  renderMouth() {
    const mg = this.mouthGfx;
    mg.clear();

    const mY = Math.max(0, Math.min(1.0, this.mouthY));
    const mForm = Math.max(-1.0, Math.min(1.0, this.mouthForm));
    const centerY = 8;

    if (mY < 0.08) {
      // Happy Resting Smile Curve visible below mustache
      mg.lineStyle(3.2, 0x0F172A);
      const smileSpread = 24 + (this.isHappy ? 4 : 0);
      const smileDrop = 14 + (this.isHappy ? 4 : 0);
      mg.moveTo(-smileSpread, centerY);
      mg.quadraticCurveTo(0, centerY + smileDrop, smileSpread, centerY);
    } else {
      // Active Speech Visemes Opening from under mustache
      const openHeight = 8 + (mY * 34);
      const openWidth = Math.max(14, 24 + (mForm * 8) + (mY * 6));

      // Dark Red Oral Cavity
      mg.beginFill(0x881337);
      mg.lineStyle(3, 0x0F172A);
      mg.moveTo(-openWidth, centerY);
      mg.quadraticCurveTo(0, centerY - (openHeight * 0.15), openWidth, centerY);
      mg.quadraticCurveTo(0, centerY + openHeight, -openWidth, centerY);
      mg.endFill();

      // Upper White Teeth
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
}
