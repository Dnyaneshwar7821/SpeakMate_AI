import * as PIXI from 'pixi.js';

/**
 * DoraemonPuppet - WebGL/PixiJS 2D Rig for Doraemon-Style Robotic Gadget Cat Tutor
 * Supports real-time phonetic viseme mouth rendering, eye blinking, gaze tracking, and floating bob.
 */
export class DoraemonPuppet extends PIXI.Container {
  constructor() {
    super();
    this.isDoraemonPuppet = true;

    this.rootContainer = new PIXI.Container();
    this.addChild(this.rootContainer);

    // 1. Torso / Body Layer
    this.bodyGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.bodyGfx);

    // 2. Collar & Bell Layer
    this.collarGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.collarGfx);

    // 3. Round White Robotic Hands
    this.leftHandGfx = new PIXI.Graphics();
    this.rightHandGfx = new PIXI.Graphics();
    this.rootContainer.addChild(this.leftHandGfx);
    this.rootContainer.addChild(this.rightHandGfx);

    // 4. Head Container (Nods & Tilts)
    this.headContainer = new PIXI.Container();
    this.rootContainer.addChild(this.headContainer);

    // 5. Head Base & White Face Plate
    this.headBaseGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.headBaseGfx);

    // 6. Expressive Cartoon Eyes (Layered behind nose)
    this.eyesGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.eyesGfx);

    // 7. Whiskers & Red Button Nose (Layered in front of eyes)
    this.noseWhiskersGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.noseWhiskersGfx);

    // 8. Dynamic Phonetic Mouth
    this.mouthGfx = new PIXI.Graphics();
    this.headContainer.addChild(this.mouthGfx);

    // Animation & Lip-Sync State
    this.blinkTimer = performance.now() + 2500;
    this.isBlinking = false;
    this.blinkProgress = 0;
    this.lookX = 0;
    this.lookY = 0;
    this.mouthY = 0;
    this.mouthForm = 0;
    this.isHappy = false;
    this.isSpeaking = false;

    this.drawStaticFeatures();
  }

  drawStaticFeatures() {
    // --- 1. Torso: Cyan-Blue Body + White Belly Disc + 22nd-Century Gadget Pouch ---
    const bg = this.bodyGfx;
    bg.clear();

    // Metallic Cyan-Blue Body
    bg.beginFill(0x0284C7);
    bg.lineStyle(3.5, 0x0F172A);
    bg.drawRoundedRect(-58, 42, 116, 95, 34);
    bg.endFill();

    // White Circular Belly Disc
    bg.beginFill(0xFFFFFF);
    bg.lineStyle(2.5, 0x0F172A);
    bg.drawCircle(0, 84, 38);
    bg.endFill();

    // Gadget Pouch
    bg.beginFill(0xFFFFFF);
    bg.lineStyle(2.5, 0x0F172A);
    bg.arc(0, 84, 27, 0, Math.PI);
    bg.lineTo(27, 84);
    bg.endFill();
    bg.lineStyle(2.5, 0x0F172A);
    bg.moveTo(-27, 84);
    bg.lineTo(27, 84);

    // --- 2. Red Neck Collar & Golden Gadget Bell ---
    const col = this.collarGfx;
    col.clear();

    // Soft chin shadow behind collar
    col.beginFill(0x0F172A, 0.15);
    col.drawEllipse(0, 33, 48, 6);
    col.endFill();

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

    // Bell golden detail line & center hole
    col.lineStyle(2, 0x0F172A);
    col.moveTo(-12, 48);
    col.lineTo(12, 48);
    col.beginFill(0x334155);
    col.drawCircle(0, 54, 3.5);
    col.endFill();
    col.moveTo(0, 57.5);
    col.lineTo(0, 64);

    // --- 3. Head Base: Clean Spherical Cyan-Blue Robot Head ---
    const hg = this.headBaseGfx;
    hg.clear();

    // Spherical Robot Head
    hg.beginFill(0x0284C7);
    hg.lineStyle(3.8, 0x0F172A);
    hg.drawCircle(0, -32, 82);
    hg.endFill();

    // White Face Disc
    hg.beginFill(0xFFFFFF);
    hg.lineStyle(3.2, 0x0F172A);
    hg.drawEllipse(0, -18, 70, 56);
    hg.endFill();

    // --- 4. Red Button Nose & 6 Whiskers (Drawn in front of eyes) ---
    const nwg = this.noseWhiskersGfx;
    nwg.clear();

    // Red Sphere Nose in front of eyes
    nwg.beginFill(0xEF4444);
    nwg.lineStyle(2.5, 0x0F172A);
    nwg.drawCircle(0, -34, 11);
    nwg.endFill();

    // Nose White Shine Highlight
    nwg.beginFill(0xFFFFFF, 0.9);
    nwg.drawCircle(-3, -37, 3.5);
    nwg.endFill();

    // Center seam line from nose to mouth
    nwg.lineStyle(2.5, 0x0F172A);
    nwg.moveTo(0, -23);
    nwg.lineTo(0, 5);

    // 6 Whiskers (3 on each cheek)
    nwg.lineStyle(2.5, 0x0F172A);
    // Left
    nwg.moveTo(-16, -26); nwg.lineTo(-58, -32);
    nwg.moveTo(-18, -17); nwg.lineTo(-64, -17);
    nwg.moveTo(-16, -8); nwg.lineTo(-58, -2);
    // Right
    nwg.moveTo(16, -26); nwg.lineTo(58, -32);
    nwg.moveTo(18, -17); nwg.lineTo(64, -17);
    nwg.moveTo(16, -8); nwg.lineTo(58, -2);

    this.drawHands(0);
  }

  drawHands(t) {
    const lh = this.leftHandGfx;
    const rh = this.rightHandGfx;
    lh.clear();
    rh.clear();

    const lOffset = Math.sin(t) * 4;
    const rOffset = Math.cos(t) * 4;

    // Left Cyan-Blue Robotic Arm
    lh.beginFill(0x0284C7);
    lh.lineStyle(3, 0x0F172A);
    lh.moveTo(-44, 48);
    lh.lineTo(-66, 68 + lOffset);
    lh.lineTo(-56, 76 + lOffset);
    lh.lineTo(-38, 58);
    lh.closePath();
    lh.endFill();

    // Left Round White Robotic Hand
    lh.beginFill(0xFFFFFF);
    lh.lineStyle(3, 0x0F172A);
    lh.drawCircle(-66, 68 + lOffset, 16);
    lh.endFill();

    // Right Cyan-Blue Robotic Arm
    rh.beginFill(0x0284C7);
    rh.lineStyle(3, 0x0F172A);
    rh.moveTo(44, 48);
    rh.lineTo(66, 68 + rOffset);
    rh.lineTo(56, 76 + rOffset);
    rh.lineTo(38, 58);
    rh.closePath();
    rh.endFill();

    // Right Round White Robotic Hand
    rh.beginFill(0xFFFFFF);
    rh.lineStyle(3, 0x0F172A);
    rh.drawCircle(66, 68 + rOffset, 16);
    rh.endFill();
  }

  update(now = performance.now()) {
    const t = now * 0.001;

    // 1. Floating Hover & Ambient Bob
    const hoverY = Math.sin(t * 2.2) * 5;
    const headTilt = this.isSpeaking ? (Math.sin(t * 3.5) * 0.04 + this.lookX * 0.04) : (this.lookX * 0.04);
    const headNod = this.isSpeaking ? (Math.cos(t * 2.8) * 3 - (this.mouthY * 4)) : (Math.sin(t * 1.5) * 2);

    this.rootContainer.y = hoverY;
    this.headContainer.rotation = headTilt;
    this.headContainer.y = headNod;

    this.drawHands(t * 2.5);

    // 2. Eye Blinking Logic
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

    // 3. Render Expressive Eyes
    this.renderEyes();

    // 4. Render Dynamic Phonetic Mouth
    this.renderMouth();
  }

  renderEyes() {
    const eg = this.eyesGfx;
    eg.clear();

    const leftEyeX = -15;
    const rightEyeX = 15;
    const eyeY = -52;
    const eyeW = 15;
    const eyeH = 20;

    if (this.isBlinking && this.blinkProgress > 0.3 && this.blinkProgress < 0.7) {
      // Closed Happy Eye Curves (^ ^)
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

      // Pupil Gaze Tracking
      const pX = this.lookX * 5.2;
      const pY = this.lookY * 4.0;

      // Left Pupil
      eg.beginFill(0x0F172A);
      eg.drawCircle(leftEyeX + 3 + pX, eyeY + 2 + pY, 6.5);
      eg.endFill();
      // Left Pupil Shine
      eg.beginFill(0xFFFFFF);
      eg.drawCircle(leftEyeX + 1 + pX, eyeY - 1 + pY, 2.5);
      eg.endFill();

      // Right Pupil
      eg.beginFill(0x0F172A);
      eg.drawCircle(rightEyeX - 3 + pX, eyeY + 2 + pY, 6.5);
      eg.endFill();
      // Right Pupil Shine
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
      // Resting / Closed Smile: Classic cute Doraemon wide smile curve
      mg.lineStyle(3, 0x0F172A);
      const smileSpread = 28 + (this.isHappy ? 6 : 0);
      const smileDrop = 14 + (this.isHappy ? 4 : 0);
      mg.moveTo(-smileSpread, centerY);
      mg.quadraticCurveTo(0, centerY + smileDrop, smileSpread, centerY);
    } else {
      // Active Speech Phonetic Mouth Shape
      const openHeight = 8 + (mY * 36);
      const openWidth = Math.max(14, 24 + (mForm * 10) + (mY * 6));

      // Dark Red Mouth Cavity
      mg.beginFill(0x881337);
      mg.lineStyle(3, 0x0F172A);

      // Top Lip Arc
      mg.moveTo(-openWidth, centerY);
      mg.quadraticCurveTo(0, centerY - (openHeight * 0.15), openWidth, centerY);
      // Bottom Lip Arc
      mg.quadraticCurveTo(0, centerY + openHeight, -openWidth, centerY);
      mg.endFill();

      // Upper White Teeth Arc
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

      // Pink Tongue Arc
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
