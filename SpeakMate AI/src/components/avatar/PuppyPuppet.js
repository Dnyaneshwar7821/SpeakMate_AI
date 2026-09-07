import * as PIXI from 'pixi.js';

/**
 * Procedural 2D Cute Cartoon Puppy Rig (Puppy Tutor)
 * Features autonomous breathing, floppy bouncing ears, expressive eye tracking & blinking,
 * and dynamic phonetic lip-syncing with mouth opening & tongue movement.
 */
export class PuppyPuppet extends PIXI.Container {
  constructor() {
    super();
    this.name = 'PuppyPuppet';
    this.isPuppyPuppet = true;

    // Speech & Lip-Sync State
    this.mouthY = 0;
    this.mouthForm = 0;
    this.isSpeaking = false;
    this.currentMood = 'happy';

    // Gaze & Eye-Tracking State
    this.lookX = 0;
    this.lookY = 0;
    this.targetLookX = 0;
    this.targetLookY = 0;
    this.blinkTimer = performance.now() + 2000;
    this.isBlinking = false;
    this.blinkProgress = 0;
    this.nextSaccadeTime = performance.now() + 1500;

    // Floppy Ear & Head Physics
    this.earAngleLeft = 0;
    this.earAngleRight = 0;

    this.initRig();
  }

  initRig() {
    this.rootContainer = new PIXI.Container();
    this.addChild(this.rootContainer);

    // 1. Torso & Body Graphics
    this.bodyGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.bodyGfx);

    // 2. Cute Red Collar & Golden Tag
    this.collarGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.collarGfx);

    // 3. Front Paws
    this.pawsGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.pawsGfx);

    // 4. Head Container
    this.headContainer = new PIXI.Container();
    this.headContainer.position.set(0, -10);
    this.rootContainer.addChild(this.headContainer);

    // 5. Floppy Ears (Behind head base)
    this.leftEar = new PIXI.Container();
    this.leftEar.position.set(-46, -42);
    this.leftEarGfx = new PIXI.Graphics();
    this.leftEar.addChild(this.leftEarGfx);
    this.headContainer.addChild(this.leftEar);

    this.rightEar = new PIXI.Container();
    this.rightEar.position.set(46, -42);
    this.rightEarGfx = new PIXI.Graphics();
    this.rightEar.addChild(this.rightEarGfx);
    this.headContainer.addChild(this.rightEar);

    // 6. Head Base & Fur
    this.headBaseGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.headBaseGfx);

    // 7. Expressive Puppy Eyes
    this.eyesGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.eyesGfx);

    // 8. Muzzle & Nose
    this.muzzleGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.muzzleGfx);

    // 9. Dynamic Phonetic Mouth & Tongue
    this.mouthGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.mouthGfx);

    this.drawStaticGeometry();
  }

  drawStaticGeometry() {
    // --- 1. Body & Torso ---
    const bg = this.bodyGfx;
    bg.clear();

    // Golden warm puppy coat
    bg.beginFill(0xF59E0B);
    bg.lineStyle(3.5, 0x0F172A);
    bg.drawRoundedRect(-52, 28, 104, 90, 32);
    bg.endFill();

    // Cream Belly Patch
    bg.beginFill(0xFEF3C7);
    bg.lineStyle(2, 0xD97706);
    bg.drawEllipse(0, 68, 32, 42);
    bg.endFill();

    // --- 2. Red Collar & Golden Bone Tag ---
    const cg = this.collarGfx;
    cg.clear();

    // Vibrant Red Collar band
    cg.beginFill(0xEF4444);
    cg.lineStyle(3, 0x0F172A);
    cg.drawRoundedRect(-40, 26, 80, 15, 7);
    cg.endFill();

    // Shiny Golden Bell/Tag
    cg.beginFill(0xFCD34D);
    cg.lineStyle(2.5, 0x0F172A);
    cg.drawCircle(0, 44, 11);
    cg.endFill();

    // Inner tag sparkle
    cg.beginFill(0xFFFFFF);
    cg.drawCircle(-3, 41, 3.5);
    cg.endFill();

    // --- 3. Front Paws ---
    const pg = this.pawsGfx;
    pg.clear();

    // Left Paw
    pg.beginFill(0xF59E0B);
    pg.lineStyle(3, 0x0F172A);
    pg.drawRoundedRect(-44, 98, 34, 22, 10);
    pg.endFill();
    pg.lineStyle(2, 0xD97706);
    pg.moveTo(-33, 104); pg.lineTo(-33, 116);
    pg.moveTo(-24, 104); pg.lineTo(-24, 116);

    // Right Paw
    pg.beginFill(0xF59E0B);
    pg.lineStyle(3, 0x0F172A);
    pg.drawRoundedRect(10, 98, 34, 22, 10);
    pg.endFill();
    pg.lineStyle(2, 0xD97706);
    pg.moveTo(21, 104); pg.lineTo(21, 116);
    pg.moveTo(30, 104); pg.lineTo(30, 116);

    // --- 4. Head Base ---
    const hg = this.headBaseGfx;
    hg.clear();

    // Main Golden Round Head
    hg.beginFill(0xF59E0B);
    hg.lineStyle(4, 0x0F172A);
    hg.drawCircle(0, -25, 62);
    hg.endFill();

    // Top hair tuft
    hg.beginFill(0xF59E0B);
    hg.lineStyle(3, 0x0F172A);
    hg.moveTo(-10, -84);
    hg.quadraticCurveTo(0, -98, 6, -84);
    hg.quadraticCurveTo(14, -94, 12, -80);
    hg.endFill();

    // --- 5. Muzzle & Nose Base ---
    const mg = this.muzzleGfx;
    mg.clear();

    // Soft Cream Muzzle
    mg.beginFill(0xFEF3C7);
    mg.lineStyle(3, 0x0F172A);
    mg.drawEllipse(0, -5, 34, 24);
    mg.endFill();

    // Glossy Heart/Button Nose
    mg.beginFill(0x0F172A);
    mg.drawRoundedRect(-11, -22, 22, 15, 6);
    mg.endFill();

    // Nose Highlight
    mg.beginFill(0xFFFFFF);
    mg.drawCircle(-4, -18, 2.5);
    mg.endFill();

    // Philtrum vertical line connecting nose to mouth
    mg.lineStyle(2.5, 0x0F172A);
    mg.moveTo(0, -7);
    mg.lineTo(0, 2);
  }

  update(now = performance.now()) {
    const t = now * 0.001;

    // Autonomous Saccades (Pupil movements)
    if (now > this.nextSaccadeTime) {
      this.targetLookX = (Math.random() - 0.5) * 0.8;
      this.targetLookY = (Math.random() - 0.5) * 0.5;
      this.nextSaccadeTime = now + 1600 + Math.random() * 2200;
    }

    this.lookX += (this.targetLookX - this.lookX) * 0.08;
    this.lookY += (this.targetLookY - this.lookY) * 0.08;

    // Idle Breathing & Head Sway
    const breatheY = Math.sin(t * 2.2) * 2.8;
    const breatheRot = Math.sin(t * 1.4) * 0.025;
    this.rootContainer.y = breatheY;
    this.headContainer.rotation = breatheRot;

    // Eye Blinking Logic
    if (now > this.blinkTimer) {
      this.isBlinking = true;
      this.blinkProgress = 0;
      this.blinkTimer = now + 2400 + Math.random() * 2800;
    }
    if (this.isBlinking) {
      this.blinkProgress += 0.18;
      if (this.blinkProgress >= 1.0) {
        this.isBlinking = false;
        this.blinkProgress = 0;
      }
    }

    // Dynamic Floppy Ears Animation
    this.renderEars(t);

    // Render Eyes & Lip-Sync Mouth
    this.renderEyes();
    this.renderMouth();
  }

  renderEars(t) {
    const leg = this.leftEarGfx;
    const reg = this.rightEarGfx;
    leg.clear();
    reg.clear();

    // Bouncing ear swing with speech reaction
    const speechJiggle = this.isSpeaking ? Math.sin(t * 8.0) * 0.12 : 0;
    const leftAngle = Math.sin(t * 2.4) * 0.08 + speechJiggle;
    const rightAngle = -Math.sin(t * 2.4 + 0.4) * 0.08 - speechJiggle;

    this.leftEar.rotation = leftAngle;
    this.rightEar.rotation = rightAngle;

    // Left Floppy Ear Shape
    leg.beginFill(0xD97706);
    leg.lineStyle(3.5, 0x0F172A);
    leg.drawRoundedRect(-18, 0, 26, 68, 14);
    leg.endFill();
    // Ear Inner Pink
    leg.beginFill(0xFCA5A5, 0.7);
    leg.drawRoundedRect(-13, 8, 16, 48, 9);
    leg.endFill();

    // Right Floppy Ear Shape
    reg.beginFill(0xD97706);
    reg.lineStyle(3.5, 0x0F172A);
    reg.drawRoundedRect(-8, 0, 26, 68, 14);
    reg.endFill();
    // Ear Inner Pink
    reg.beginFill(0xFCA5A5, 0.7);
    reg.drawRoundedRect(-3, 8, 16, 48, 9);
    reg.endFill();
  }

  renderEyes() {
    const eg = this.eyesGfx;
    eg.clear();

    const leftX = -22;
    const rightX = 22;
    const eyeY = -34;
    const eyeW = 12;
    const eyeH = 16;

    if (this.isBlinking && this.blinkProgress > 0.25 && this.blinkProgress < 0.75) {
      // Cheerful Closed Puppy Eyes (^ ^)
      eg.lineStyle(3.5, 0x0F172A);
      eg.arc(leftX, eyeY + 4, 10, Math.PI * 1.1, Math.PI * 1.9);
      const rightStart = Math.PI * 1.1;
      eg.moveTo(rightX + Math.cos(rightStart) * 10, eyeY + 4 + Math.sin(rightStart) * 10);
      eg.arc(rightX, eyeY + 4, 10, Math.PI * 1.1, Math.PI * 1.9);
    } else {
      // Left Eye
      eg.beginFill(0xFFFFFF);
      eg.lineStyle(3, 0x0F172A);
      eg.drawEllipse(leftX, eyeY, eyeW, eyeH);
      eg.endFill();

      // Right Eye
      eg.beginFill(0xFFFFFF);
      eg.lineStyle(3, 0x0F172A);
      eg.drawEllipse(rightX, eyeY, eyeW, eyeH);
      eg.endFill();

      // Pupil Offsets
      const pX = this.lookX * 4.5;
      const pY = this.lookY * 3.5;

      // Big, Glossy Anime Puppy Pupils
      eg.beginFill(0x1E293B);
      eg.drawCircle(leftX + 2 + pX, eyeY + 1 + pY, 7.5);
      eg.drawCircle(rightX - 2 + pX, eyeY + 1 + pY, 7.5);
      eg.endFill();

      // Eye Highlights (Big white gleam)
      eg.beginFill(0xFFFFFF);
      eg.drawCircle(leftX + pX, eyeY - 2 + pY, 3.5);
      eg.drawCircle(rightX - 4 + pX, eyeY - 2 + pY, 3.5);
      eg.drawCircle(leftX + 4 + pX, eyeY + 4 + pY, 1.8);
      eg.drawCircle(rightX + pX, eyeY + 4 + pY, 1.8);
      eg.endFill();
    }
  }

  renderMouth() {
    const mg = this.mouthGfx;
    mg.clear();

    const mY = Math.max(0, Math.min(1.0, this.mouthY));
    const startY = 1;

    if (mY < 0.08) {
      // --- RESTING: Sweet "ω" Puppy Smile with Tongue Peek ---
      // 1. Cute Little Tongue peeking out between jowls
      mg.beginFill(0xFB7185);
      mg.lineStyle(2, 0x0F172A);
      mg.drawRoundedRect(-4.5, startY + 2, 9, 8, 4);
      mg.endFill();
      // Tongue crease
      mg.lineStyle(1.4, 0xE11D48);
      mg.moveTo(0, startY + 3);
      mg.lineTo(0, startY + 8);

      // 2. Classic Double-Arc "ω" Smile Line
      mg.lineStyle(3, 0x0F172A);
      // Left jowl curve
      mg.moveTo(-15, startY);
      mg.quadraticCurveTo(-8, startY + 6, 0, startY + 1.5);
      // Right jowl curve
      mg.quadraticCurveTo(8, startY + 6, 15, startY);

      // Cute Smile Corner Dimples
      mg.moveTo(-15, startY);
      mg.quadraticCurveTo(-17.5, startY - 1, -16.5, startY - 3.5);
      mg.moveTo(15, startY);
      mg.quadraticCurveTo(17.5, startY - 1, 16.5, startY - 3.5);

      // Subtle lower chin curve beneath mouth
      mg.lineStyle(2, 0xD97706);
      mg.moveTo(-7, startY + 11);
      mg.quadraticCurveTo(0, startY + 13.5, 7, startY + 11);
    } else {
      // --- SPEAKING: Cute Rounded Open Smile (Natural U-Shape, NOT an Angular Triangle!) ---
      const openH = 5 + mY * 11; // Stays gracefully within cream muzzle
      const mouthW = 12 + mY * 3.5;

      // 1. Soft Rounded Open Mouth Cavity
      mg.beginFill(0x831843);
      mg.lineStyle(3, 0x0F172A);
      // Left corner
      mg.moveTo(-mouthW, startY);
      // Top lip (gentle curve following jowls)
      mg.quadraticCurveTo(-mouthW * 0.5, startY + 2.5, 0, startY + 1);
      mg.quadraticCurveTo(mouthW * 0.5, startY + 2.5, mouthW, startY);
      // Bottom jaw: SMOOTH, ROUNDED U-CURVE (no sharp triangles!)
      mg.quadraticCurveTo(mouthW * 0.9, startY + openH * 0.7, mouthW * 0.6, startY + openH);
      mg.quadraticCurveTo(0, startY + openH + 2.5, -mouthW * 0.6, startY + openH);
      mg.quadraticCurveTo(-mouthW * 0.9, startY + openH * 0.7, -mouthW, startY);
      mg.closePath();
      mg.endFill();

      // 2. Soft Pink Tongue in the lower jaw
      const tongueTop = startY + openH * 0.45;
      mg.beginFill(0xFB7185);
      mg.lineStyle(1.8, 0x9F1239);
      mg.moveTo(-mouthW * 0.55, tongueTop);
      mg.quadraticCurveTo(0, tongueTop - 2, mouthW * 0.55, tongueTop);
      mg.quadraticCurveTo(mouthW * 0.45, startY + openH, 0, startY + openH);
      mg.quadraticCurveTo(-mouthW * 0.45, startY + openH, -mouthW * 0.55, tongueTop);
      mg.closePath();
      mg.endFill();

      // Tongue Center Crease
      mg.lineStyle(1.4, 0xE11D48);
      mg.moveTo(0, tongueTop - 1);
      mg.lineTo(0, startY + openH * 0.85);

      // 3. Cute Smile Dimples at the mouth corners
      mg.lineStyle(2.8, 0x0F172A);
      mg.moveTo(-mouthW, startY);
      mg.quadraticCurveTo(-mouthW - 2.5, startY - 1, -mouthW - 1.5, startY - 3.5);
      mg.moveTo(mouthW, startY);
      mg.quadraticCurveTo(mouthW + 2.5, startY - 1, mouthW + 1.5, startY - 3.5);

      // 4. Supporting Lower Chin Arc beneath the open mouth
      mg.lineStyle(2, 0xD97706);
      mg.moveTo(-mouthW * 0.5, startY + openH + 3.5);
      mg.quadraticCurveTo(0, startY + openH + 6, mouthW * 0.5, startY + openH + 3.5);
    }
  }

  setMouthOpen(yVal, formVal = 0) {
    this.mouthY = Math.max(0, Math.min(1.0, yVal));
    this.mouthForm = Math.max(-1.0, Math.min(1.0, formVal));
  }

  setSpeaking(isSpeaking) {
    this.isSpeaking = Boolean(isSpeaking);
  }

  setMood(mood) {
    this.currentMood = mood;
  }
}
