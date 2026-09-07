import * as PIXI from 'pixi.js';

/**
 * 2.5D Chhota Bheem Interactive Avatar Rig
 * Authentic kid-hero character from Dholakpur.
 * Features:
 * - Warm golden-brown Indian skin tone, athletic boy muscular torso
 * - Iconic pleated saffron-orange dhoti with golden waist sash
 * - Sacred red & gold forehead tilak
 * - Golden wrist kadas
 * - Autonomous breathing, eye tracking, and eyelid blinking
 * - Dynamic phonetic mouth lip-syncing with teeth & tongue
 */
export class BheemPuppet extends PIXI.Container {
  constructor() {
    super();
    this.name = 'BheemPuppet';
    this.isBheemPuppet = true;

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

    this.initRig();
  }

  initRig() {
    this.rootContainer = new PIXI.Container();
    this.addChild(this.rootContainer);

    // 1. Torso & Muscular Athletic Body
    this.bodyGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.bodyGfx);

    // 2. Saffron Dhoti & Golden Waist Sash
    this.dhotiGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.dhotiGfx);

    // 3. Golden Kadas & Arms
    this.armsGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.armsGfx);

    // 4. Head Container (for 2.5D rotation and head sways)
    this.headContainer = new PIXI.Container();
    this.headContainer.position.set(0, -15);
    this.rootContainer.addChild(this.headContainer);

    // 5. Neck & Jaw Base
    this.neckGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.neckGfx);

    // 6. Main Head Base & Ears
    this.headBaseGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.headBaseGfx);

    // 7. Hair Base (Behind forehead)
    this.hairGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.hairGfx);

    // 8. Sacred Forehead Tilak
    this.tilakGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.tilakGfx);

    // 9. Eyebrows
    this.eyebrowsGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.eyebrowsGfx);

    // 10. Expressive Eyes (Sclera, Pupils, Catchlights)
    this.eyesGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.eyesGfx);

    // 11. Heroic Nose & Cheek Accents
    this.noseCheeksGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.noseCheeksGfx);

    // 12. Dynamic Phonetic Mouth & Tongue
    this.mouthGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.mouthGfx);

    this.drawStaticGeometry();
  }

  drawStaticGeometry() {
    // Palette Constants
    const SKIN_BASE = 0xEA9738;    // Warm golden-brown Indian skin
    const SKIN_SHADOW = 0xD47E1F;  // Muscular definition shadow
    const SKIN_LIGHT = 0xF5AC56;   // Highlight tone
    const OUTLINE = 0x1E1B18;      // Crisp dark outline
    const DHOTI_BASE = 0xEA580C;   // Saffron orange
    const DHOTI_DARK = 0xC2410C;   // Dhoti pleat shadow
    const GOLD = 0xFBBF24;         // Golden sash & kadas
    const GOLD_SHINE = 0xFEF08A;   // Kada shine
    const HAIR = 0x18181B;         // Rich black cartoon hair

    // --- 1. Torso & Muscular Chest ---
    const bg = this.bodyGfx;
    bg.clear();

    // Upper Torso Base
    bg.beginFill(SKIN_BASE);
    bg.lineStyle(3.5, OUTLINE);
    bg.drawRoundedRect(-48, 15, 96, 68, 20);
    bg.endFill();

    // Pectoral Muscle Definition
    bg.lineStyle(2.5, SKIN_SHADOW);
    bg.moveTo(-36, 32);
    bg.quadraticCurveTo(-18, 45, -3, 36);
    bg.moveTo(36, 32);
    bg.quadraticCurveTo(18, 45, 3, 36);

    // Abdominal center line
    bg.moveTo(0, 37);
    bg.lineTo(0, 65);

    // Upper chest highlight
    bg.beginFill(SKIN_LIGHT, 0.4);
    bg.drawEllipse(-18, 28, 14, 6);
    bg.drawEllipse(18, 28, 14, 6);
    bg.endFill();

    // --- 2. Saffron Dhoti & Golden Waist Sash ---
    const dg = this.dhotiGfx;
    dg.clear();

    // Golden Waistband / Sash
    dg.beginFill(GOLD);
    dg.lineStyle(3, OUTLINE);
    dg.drawRoundedRect(-44, 62, 88, 18, 6);
    dg.endFill();

    // Golden Sash Knot
    dg.beginFill(GOLD_SHINE);
    dg.lineStyle(2, OUTLINE);
    dg.drawCircle(0, 71, 9);
    dg.endFill();

    // Golden sash tails hanging down
    dg.beginFill(GOLD);
    dg.lineStyle(2.5, OUTLINE);
    dg.moveTo(-6, 76);
    dg.lineTo(-12, 110);
    dg.lineTo(-2, 108);
    dg.lineTo(0, 78);
    dg.endFill();

    dg.beginFill(GOLD);
    dg.moveTo(0, 78);
    dg.lineTo(2, 108);
    dg.lineTo(12, 110);
    dg.lineTo(6, 76);
    dg.endFill();

    // Saffron Pleated Dhoti Bottom
    dg.beginFill(DHOTI_BASE);
    dg.lineStyle(3.5, OUTLINE);
    dg.drawRoundedRect(-52, 76, 104, 52, 18);
    dg.endFill();

    // Dhoti Fold Pleats
    dg.lineStyle(2.5, DHOTI_DARK);
    dg.moveTo(-28, 80); dg.lineTo(-32, 118);
    dg.moveTo(-16, 80); dg.lineTo(-18, 122);
    dg.moveTo(16, 80); dg.lineTo(18, 122);
    dg.moveTo(28, 80); dg.lineTo(32, 118);

    // --- 3. Muscular Arms & Golden Kadas ---
    const ag = this.armsGfx;
    ag.clear();

    // Left Arm (Biceps / Forearm)
    ag.beginFill(SKIN_BASE);
    ag.lineStyle(3.5, OUTLINE);
    ag.drawRoundedRect(-68, 22, 24, 75, 12);
    ag.endFill();

    // Right Arm (Biceps / Forearm)
    ag.beginFill(SKIN_BASE);
    ag.lineStyle(3.5, OUTLINE);
    ag.drawRoundedRect(44, 22, 24, 75, 12);
    ag.endFill();

    // Left Golden Kada (Wristband)
    ag.beginFill(GOLD);
    ag.lineStyle(2.5, OUTLINE);
    ag.drawRoundedRect(-69, 70, 26, 14, 4);
    ag.endFill();
    ag.beginFill(GOLD_SHINE);
    ag.drawCircle(-56, 77, 3);
    ag.endFill();

    // Right Golden Kada (Wristband)
    ag.beginFill(GOLD);
    ag.lineStyle(2.5, OUTLINE);
    ag.drawRoundedRect(43, 70, 26, 14, 4);
    ag.endFill();
    ag.beginFill(GOLD_SHINE);
    ag.drawCircle(56, 77, 3);
    ag.endFill();

    // Left Fist / Hand
    ag.beginFill(SKIN_BASE);
    ag.lineStyle(3, OUTLINE);
    ag.drawCircle(-56, 100, 14);
    ag.endFill();

    // Right Fist / Hand
    ag.beginFill(SKIN_BASE);
    ag.lineStyle(3, OUTLINE);
    ag.drawCircle(56, 100, 14);
    ag.endFill();

    // --- 4. Neck ---
    const ng = this.neckGfx;
    ng.clear();
    ng.beginFill(SKIN_SHADOW);
    ng.lineStyle(3, OUTLINE);
    ng.drawRoundedRect(-18, 5, 36, 24, 6);
    ng.endFill();

    // --- 5. Main Head & Ears ---
    const hg = this.headBaseGfx;
    hg.clear();

    // Left Ear
    hg.beginFill(SKIN_BASE);
    hg.lineStyle(3, OUTLINE);
    hg.drawCircle(-54, -18, 14);
    hg.endFill();
    hg.lineStyle(2, SKIN_SHADOW);
    hg.arc(-53, -18, 7, Math.PI * 0.4, Math.PI * 1.6);

    // Right Ear
    hg.beginFill(SKIN_BASE);
    hg.lineStyle(3, OUTLINE);
    hg.drawCircle(54, -18, 14);
    hg.endFill();
    hg.lineStyle(2, SKIN_SHADOW);
    hg.arc(53, -18, 7, -Math.PI * 0.6, Math.PI * 0.6);

    // Round Energetic Face Base
    hg.beginFill(SKIN_BASE);
    hg.lineStyle(4, OUTLINE);
    hg.drawCircle(0, -26, 56);
    hg.endFill();

    // Cheekbones and Chin contour
    hg.beginFill(SKIN_BASE);
    hg.lineStyle(3.5, OUTLINE);
    hg.drawRoundedRect(-42, -18, 84, 38, 18);
    hg.endFill();

    // --- 6. Spiky Black Cartoon Hair ---
    const hr = this.hairGfx;
    hr.clear();
    hr.beginFill(HAIR);
    hr.lineStyle(3.5, OUTLINE);

    // Top hair volume
    hr.moveTo(-52, -45);
    hr.quadraticCurveTo(-38, -88, 0, -84);
    hr.quadraticCurveTo(38, -88, 52, -45);

    // Iconic Front Spikes / Tuft
    hr.quadraticCurveTo(46, -65, 32, -68);
    hr.quadraticCurveTo(30, -78, 14, -76);
    hr.quadraticCurveTo(0, -92, -14, -76);
    hr.quadraticCurveTo(-30, -78, -32, -68);
    hr.quadraticCurveTo(-46, -65, -52, -45);
    hr.endFill();

    // Hair Sheen / Highlight
    hr.lineStyle(2.5, 0x52525B);
    hr.moveTo(-22, -74);
    hr.quadraticCurveTo(0, -82, 22, -74);

    // --- 7. Sacred Red & Gold Forehead Tilak ---
    const tg = this.tilakGfx;
    tg.clear();

    // Red Sacred Stripe
    tg.beginFill(0xDC2626);
    tg.lineStyle(1.5, 0x991B1B);
    tg.moveTo(-3.5, -60);
    tg.lineTo(3.5, -60);
    tg.lineTo(2, -36);
    tg.lineTo(-2, -36);
    tg.closePath();
    tg.endFill();

    // Golden Tilak Base Dot
    tg.beginFill(GOLD);
    tg.lineStyle(1, 0xD97706);
    tg.drawCircle(0, -33, 3);
    tg.endFill();

    // --- 8. Nose & Rosy Cheeks ---
    const ncg = this.noseCheeksGfx;
    ncg.clear();

    // Cute Button Nose
    ncg.lineStyle(3, OUTLINE);
    ncg.moveTo(-6, -18);
    ncg.quadraticCurveTo(0, -12, 6, -18);

    // Rosy Cheerful Cheeks
    ncg.beginFill(0xF87171, 0.45);
    ncg.drawCircle(-32, -12, 8);
    ncg.drawCircle(32, -12, 8);
    ncg.endFill();
  }

  update(now = performance.now()) {
    const t = now * 0.001;

    // Autonomous Saccades (Pupil eye tracking)
    if (now > this.nextSaccadeTime) {
      this.targetLookX = (Math.random() - 0.5) * 0.8;
      this.targetLookY = (Math.random() - 0.5) * 0.5;
      this.nextSaccadeTime = now + 1600 + Math.random() * 2400;
    }

    this.lookX += (this.targetLookX - this.lookX) * 0.08;
    this.lookY += (this.targetLookY - this.lookY) * 0.08;

    // Heroic Idle Breathing & Gentle Torso Sway
    const breathe = Math.sin(t * 2.2);
    this.bodyGfx.scale.y = 1.0 + breathe * 0.015;
    this.rootContainer.y = breathe * 2.2;

    // 2.5D Head Sway
    const headRot = Math.sin(t * 1.5) * 0.025;
    const headNod = Math.sin(t * 2.2) * 1.4;
    this.headContainer.rotation = headRot;
    this.headContainer.y = -15 + headNod;

    // Eye Blinking Animation
    if (now > this.blinkTimer) {
      this.isBlinking = true;
      this.blinkProgress = 0;
      this.blinkTimer = now + 2400 + Math.random() * 3200;
    }
    if (this.isBlinking) {
      this.blinkProgress += 0.20;
      if (this.blinkProgress >= 1.0) {
        this.isBlinking = false;
        this.blinkProgress = 0;
      }
    }

    // Render Dynamic Layers
    this.renderEyebrows(t);
    this.renderEyes();
    this.renderMouth();
  }

  renderEyebrows(t) {
    const ebg = this.eyebrowsGfx;
    ebg.clear();

    const OUTLINE = 0x1E1B18;
    ebg.lineStyle(3.5, OUTLINE);

    // Dynamic raising when speaking
    const speechRaise = this.isSpeaking ? Math.sin(t * 5.0) * 2.5 : 0;
    const baseBrowY = -38 - speechRaise;

    // Left Eyebrow (Heroic confident arch)
    ebg.moveTo(-36, baseBrowY + 3);
    ebg.quadraticCurveTo(-24, baseBrowY - 4, -10, baseBrowY + 1);

    // Right Eyebrow (Heroic confident arch)
    ebg.moveTo(10, baseBrowY + 1);
    ebg.quadraticCurveTo(24, baseBrowY - 4, 36, baseBrowY + 3);
  }

  renderEyes() {
    const eg = this.eyesGfx;
    eg.clear();

    const leftX = -22;
    const rightX = 22;
    const eyeY = -24;
    const eyeW = 13;
    const eyeH = 15;
    const OUTLINE = 0x1E1B18;

    if (this.isBlinking && this.blinkProgress > 0.2 && this.blinkProgress < 0.8) {
      // Cheerful Closed Eyes (^ ^)
      eg.lineStyle(3.5, OUTLINE);
      eg.arc(leftX, eyeY + 2, 9, Math.PI * 1.1, Math.PI * 1.9);
      eg.arc(rightX, eyeY + 2, 9, Math.PI * 1.1, Math.PI * 1.9);
    } else {
      // Left White Sclera
      eg.beginFill(0xFFFFFF);
      eg.lineStyle(3, OUTLINE);
      eg.drawEllipse(leftX, eyeY, eyeW, eyeH);
      eg.endFill();

      // Right White Sclera
      eg.beginFill(0xFFFFFF);
      eg.lineStyle(3, OUTLINE);
      eg.drawEllipse(rightX, eyeY, eyeW, eyeH);
      eg.endFill();

      // Pupil Offsets
      const pX = this.lookX * 4.5;
      const pY = this.lookY * 3.5;

      // Dark Pupils
      eg.beginFill(0x18181B);
      eg.drawCircle(leftX + pX, eyeY + pY, 7.5);
      eg.drawCircle(rightX + pX, eyeY + pY, 7.5);
      eg.endFill();

      // Gleaming Catchlights
      eg.beginFill(0xFFFFFF);
      eg.drawCircle(leftX - 2.5 + pX, eyeY - 2.5 + pY, 3);
      eg.drawCircle(rightX - 2.5 + pX, eyeY - 2.5 + pY, 3);
      eg.drawCircle(leftX + 2.5 + pX, eyeY + 2.5 + pY, 1.5);
      eg.drawCircle(rightX + 2.5 + pX, eyeY + 2.5 + pY, 1.5);
      eg.endFill();
    }
  }

  renderMouth() {
    const mg = this.mouthGfx;
    mg.clear();

    const mY = Math.max(0, Math.min(1.0, this.mouthY));
    const mForm = Math.max(-1.0, Math.min(1.0, this.mouthForm));
    const startY = -2;
    const OUTLINE = 0x1E1B18;

    if (mY < 0.08) {
      // Resting State: Heroic Confident Kid Smile
      mg.lineStyle(3.5, OUTLINE);
      mg.moveTo(-22, startY);
      mg.quadraticCurveTo(0, startY + 14, 22, startY);

      // Cheek Dimples
      mg.moveTo(-22, startY - 2); mg.lineTo(-20, startY + 3);
      mg.moveTo(22, startY - 2); mg.lineTo(20, startY + 3);
    } else {
      // Dynamic Speech Lip-Sync State
      const openHeight = 10 + mY * 26;
      const mouthWidth = 16 + (mForm > 0 ? mForm * 10 : 0) + mY * 6;

      // Dark Mouth Cavity
      mg.beginFill(0x881337);
      mg.lineStyle(3, OUTLINE);
      mg.drawEllipse(0, startY + openHeight * 0.45, mouthWidth, openHeight * 0.52);
      mg.endFill();

      // Animated Pink Tongue
      const tongueY = startY + openHeight * 0.48 + (1 - mY) * 3;
      mg.beginFill(0xFB7185);
      mg.drawEllipse(0, tongueY, mouthWidth * 0.65, openHeight * 0.28);
      mg.endFill();

      // Top White Teeth Arc
      mg.beginFill(0xFFFFFF);
      mg.lineStyle(1.5, OUTLINE);
      mg.drawRoundedRect(-mouthWidth * 0.6, startY, mouthWidth * 1.2, 5.5, 2);
      mg.endFill();
    }
  }

  // --- External API for Speech & Lip-Sync Engine ---
  setMouthOpen(yVal, formVal = 0) {
    this.mouthY = Math.max(0, Math.min(1.0, yVal));
    this.mouthForm = Math.max(-1.0, Math.min(1.0, formVal));
  }

  setSpeaking(isSpeaking) {
    this.isSpeaking = Boolean(isSpeaking);
  }

  setMood(mood) {
    this.currentMood = mood || 'happy';
  }
}
