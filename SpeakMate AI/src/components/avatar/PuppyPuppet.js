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

    // Cute Cheeks Blushing Dots
    mg.beginFill(0xFDA4AF, 0.6);
    mg.drawCircle(-32, -12, 9);
    mg.drawCircle(32, -12, 9);
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

    // Whiskers dots
    mg.beginFill(0x92400E);
    mg.drawCircle(-15, -4, 2);
    mg.drawCircle(-22, -6, 2);
    mg.drawCircle(15, -4, 2);
    mg.drawCircle(22, -6, 2);
    mg.endFill();
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

      // Cute Little Arched Eyebrows
      eg.lineStyle(2.8, 0x78350F);
      eg.arc(leftX + 1, eyeY - 17, 7, Math.PI * 1.2, Math.PI * 1.8);
      eg.arc(rightX - 1, eyeY - 17, 7, Math.PI * 1.2, Math.PI * 1.8);
    }
  }

  renderMouth() {
    const mg = this.mouthGfx;
    mg.clear();

    const mY = Math.max(0, Math.min(1.0, this.mouthY));
    const mForm = Math.max(-1.0, Math.min(1.0, this.mouthForm));
    const startY = 2;

    if (mY < 0.08) {
      // Resting State: Cute Puppy Smile with Little Tongue
      mg.lineStyle(3, 0x0F172A);

      // Left mouth arc (w-shaped puppy smile)
      mg.moveTo(-16, startY);
      mg.quadraticCurveTo(-8, startY + 7, 0, startY + 2);
      // Right mouth arc
      mg.quadraticCurveTo(8, startY + 7, 16, startY);

      // Playful Little Tongue peeking out
      mg.beginFill(0xFB7185);
      mg.lineStyle(2, 0x0F172A);
      mg.drawEllipse(0, startY + 7, 6, 6.5);
      mg.endFill();
      mg.lineStyle(1.5, 0xE11D48);
      mg.moveTo(0, startY + 3);
      mg.lineTo(0, startY + 9);
    } else {
      // Dynamic Speech Lip-Sync State: Natural Curved Smile Opening (NOT a circular donut/pacifier!)
      const openHeight = 8 + mY * 18;
      const mouthWidth = 14 + (mForm > 0 ? mForm * 6 : 0) + mY * 6;

      // 1. Soft Warm Rose Mouth Cavity
      mg.beginFill(0x831843);
      mg.lineStyle(3, 0x0F172A);
      mg.moveTo(-mouthWidth, startY);
      // Top lip line (soft curved smile arch)
      mg.quadraticCurveTo(0, startY, mouthWidth, startY);
      // Dropping curved bottom jaw (smile bowl)
      mg.quadraticCurveTo(mouthWidth * 0.75, startY + openHeight, 0, startY + openHeight);
      mg.quadraticCurveTo(-mouthWidth * 0.75, startY + openHeight, -mouthWidth, startY);
      mg.closePath();
      mg.endFill();

      // 2. Animated Tongue along the bottom curve
      const tongueTop = startY + openHeight * 0.52;
      mg.beginFill(0xFB7185);
      mg.lineStyle(1.8, 0x9F1239);
      mg.moveTo(-mouthWidth * 0.62, tongueTop);
      mg.quadraticCurveTo(0, tongueTop - 2, mouthWidth * 0.62, tongueTop);
      mg.quadraticCurveTo(mouthWidth * 0.5, startY + openHeight, 0, startY + openHeight);
      mg.quadraticCurveTo(-mouthWidth * 0.5, startY + openHeight, -mouthWidth * 0.62, tongueTop);
      mg.closePath();
      mg.endFill();

      // 3. Crisp upper lip smile contour
      mg.lineStyle(3, 0x0F172A);
      mg.moveTo(-mouthWidth - 1, startY);
      mg.quadraticCurveTo(-mouthWidth * 0.5, startY + 2, 0, startY + 1);
      mg.quadraticCurveTo(mouthWidth * 0.5, startY + 2, mouthWidth + 1, startY);
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
