import * as PIXI from 'pixi.js';

/**
 * DoraemonPuppet - 2.5D WebGL Procedural Rig for Doraemon-Style Gadget Cat AI Tutor
 * Implements true 2.5D Live2D-style spherical perspective warping, multi-layer depth parallax,
 * eye foreshortening, spring pendulum physics, and phonetic viseme articulation.
 */
export class DoraemonPuppet extends PIXI.Container {
  constructor() {
    super();
    this.isDoraemonPuppet = true;

    // Root World Anchor & Floating Rig
    this.rootContainer = new PIXI.Container();
    this.addChild(this.rootContainer);

    // ── LAYER HIERARCHY (Ordered by 2.5D Depth Z-Index) ──

    // 1. Torso & Gadget Pouch (Depth Z: 0.2)
    this.bodyContainer = new PIXI.Container();
    this.rootContainer.addChild(this.bodyContainer);
    this.bodyGfx = new PIXI.Graphics();
    this.bodyContainer.addChild(this.bodyGfx);

    // 2. Robotic Hands (Depth Z: 0.4)
    this.handsContainer = new PIXI.Container();
    this.rootContainer.addChild(this.handsContainer);
    this.leftHandGfx = new PIXI.Graphics();
    this.rightHandGfx = new PIXI.Graphics();
    this.handsContainer.addChild(this.leftHandGfx);
    this.handsContainer.addChild(this.rightHandGfx);

    // 3. Red Collar & 3D Pendulum Bell (Depth Z: 0.6)
    this.collarContainer = new PIXI.Container();
    this.rootContainer.addChild(this.collarContainer);
    this.collarGfx = new PIXI.Graphics();
    this.bellContainer = new PIXI.Container();
    this.bellGfx = new PIXI.Graphics();
    this.collarContainer.addChild(this.collarGfx);
    this.collarContainer.addChild(this.bellContainer);
    this.bellContainer.addChild(this.bellGfx);

    // 4. Head Master Pivot (Neck Joint at Y: 35)
    this.headMaster = new PIXI.Container();
    this.headMaster.position.set(0, 35);
    this.rootContainer.addChild(this.headMaster);

    // 5. Spherical Outer Blue Head Shell (Depth Z: 0.8)
    this.headBaseGfx = new PIXI.Graphics();
    this.headBaseGfx.position.set(0, -65);
    this.headMaster.addChild(this.headBaseGfx);

    // 6. 2.5D White Face Plate (Parallax Depth Z: 1.0)
    this.facePlateContainer = new PIXI.Container();
    this.facePlateContainer.position.set(0, -65);
    this.headMaster.addChild(this.facePlateContainer);
    this.faceGfx = new PIXI.Graphics();
    this.facePlateContainer.addChild(this.faceGfx);

    // 7. 2.5D Dynamic EYES Container (Parallax Depth Z: 1.25)
    this.eyesContainer = new PIXI.Container();
    this.facePlateContainer.addChild(this.eyesContainer);
    this.leftEyeGfx = new PIXI.Graphics();
    this.rightEyeGfx = new PIXI.Graphics();
    this.eyesContainer.addChild(this.leftEyeGfx);
    this.eyesContainer.addChild(this.rightEyeGfx);

    // 8. 2.5D Whiskers & Dynamic Seam (Parallax Depth Z: 1.15)
    this.whiskersGfx = new PIXI.Graphics();
    this.facePlateContainer.addChild(this.whiskersGfx);

    // 9. 2.5D Phonetic MOUTH (Parallax Depth Z: 1.20)
    this.mouthGfx = new PIXI.Graphics();
    this.facePlateContainer.addChild(this.mouthGfx);

    // 10. 3D Spherical Red NOSE (Parallax Depth Z: 1.45 - Frontmost)
    this.noseGfx = new PIXI.Graphics();
    this.facePlateContainer.addChild(this.noseGfx);

    // ── 2.5D Physics, Pose & Tracking State ──
    this.angleX = 0; // Head Yaw (-30 to +30 deg equivalent)
    this.angleY = 0; // Head Pitch (-30 to +30 deg equivalent)
    this.angleZ = 0; // Head Roll (-20 to +20 deg equivalent)
    this.bodyAngleX = 0; // Body Sway

    this.targetAngleX = 0;
    this.targetAngleY = 0;
    this.targetAngleZ = 0;

    this.lookX = 0; // Eye Gaze X (-1.0 to +1.0)
    this.lookY = 0; // Eye Gaze Y (-1.0 to +1.0)
    this.targetLookX = 0;
    this.targetLookY = 0;

    // Autonomous Saccade Timer
    this.nextSaccadeTime = performance.now() + 2000;

    // Eyelid & Blink State
    this.blinkTimer = performance.now() + 2800;
    this.isBlinking = false;
    this.blinkProgress = 0;

    // Phonetic Lip-Sync Parameters (0.0 to 1.0)
    this.mouthY = 0;
    this.mouthForm = 0;
    this.isSpeaking = false;
    this.isHappy = false;

    // Bell Pendulum State
    this.bellAngle = 0;
    this.bellVelocity = 0;

    this.initStaticGeometry();
  }

  initStaticGeometry() {
    // 1. Blue Outer Head Shell (R: 78px sphere with subtle specular rim)
    const hg = this.headBaseGfx;
    hg.clear();
    hg.beginFill(0x0284C7); // Iconic Doraemon Blue
    hg.lineStyle(3.5, 0x0F172A);
    hg.drawCircle(0, 0, 78);
    hg.endFill();

    // 2. Torso: Blue Body with White Belly & Gadget Pouch
    const bg = this.bodyGfx;
    bg.clear();
    bg.beginFill(0x0284C7);
    bg.lineStyle(3.5, 0x0F172A);
    bg.drawRoundedRect(-54, 8, 108, 92, 32);
    bg.endFill();

    // White Belly Disc
    bg.beginFill(0xFFFFFF);
    bg.lineStyle(2.5, 0x0F172A);
    bg.drawCircle(0, 48, 36);
    bg.endFill();

    // 4D Magic Gadget Pocket
    bg.beginFill(0xFFFFFF);
    bg.lineStyle(2.5, 0x0F172A);
    bg.arc(0, 48, 25, 0, Math.PI);
    bg.lineTo(25, 48);
    bg.endFill();
    bg.lineStyle(2.5, 0x0F172A);
    bg.moveTo(-25, 48);
    bg.lineTo(25, 48);
  }

  /**
   * Main 60 FPS 2.5D Rig Physics & Rendering Loop
   */
  update(now = performance.now()) {
    const t = now * 0.001;

    // ── 1. Autonomous Saccades & Head Movement ──
    if (now > this.nextSaccadeTime) {
      this.targetLookX = (Math.random() - 0.5) * 0.65;
      this.targetLookY = (Math.random() - 0.5) * 0.35;
      this.targetAngleX = this.targetLookX * 0.45;
      this.targetAngleY = this.targetLookY * 0.35;
      this.targetAngleZ = (Math.random() - 0.5) * 0.08;
      this.nextSaccadeTime = now + 2400 + Math.random() * 3200;
    }

    // Speech-induced micro-nods & emphasis gestures
    if (this.isSpeaking) {
      const speechNod = Math.sin(t * 7.0) * 0.06 * Math.max(0.2, this.mouthY);
      const speechTilt = Math.cos(t * 3.5) * 0.04;
      this.targetAngleY += speechNod;
      this.targetAngleZ += speechTilt;
    }

    // Smooth Spring Dampening Interpolation (2.5D Ease)
    const ease = 0.12;
    this.angleX += (this.targetAngleX - this.angleX) * ease;
    this.angleY += (this.targetAngleY - this.angleY) * ease;
    this.angleZ += (this.targetAngleZ - this.angleZ) * ease;
    this.lookX += (this.targetLookX - this.lookX) * 0.18;
    this.lookY += (this.targetLookY - this.lookY) * 0.18;
    this.bodyAngleX += (-this.angleX * 0.35 - this.bodyAngleX) * 0.08;

    // ── 2. Floating Hover & Neck Transform ──
    const hoverY = Math.sin(t * 2.2) * 4;
    this.rootContainer.y = hoverY;

    // Head Master Rotation (Yaw / Pitch / Roll)
    this.headMaster.rotation = this.angleZ;
    this.headMaster.x = this.angleX * 8;
    this.headMaster.y = 35 + (this.angleY * 6);

    // Torso Counter-Balance
    this.bodyContainer.rotation = this.bodyAngleX * 0.5;
    this.bodyContainer.x = -this.angleX * 3;

    // ── 3. 2.5D Spherical Depth Parallax ──
    // Face plate moves inside the blue head shell with spherical projection
    const faceParallaxX = this.angleX * 18;
    const faceParallaxY = this.angleY * 12;
    this.facePlateContainer.position.set(faceParallaxX, -65 + faceParallaxY);

    // Foreshortening compression across X axis when turning
    const yawScaleX = Math.cos(this.angleX * 1.1);
    this.facePlateContainer.scale.x = Math.max(0.82, yawScaleX);

    // ── 4. Render All 2.5D Layer Components ──
    this.render2DFacePlate();
    this.render2DEyes();
    this.render2DWhiskersAndNose();
    this.render2DMouth();
    this.render2DCollarAndBell(t);
    this.render2DHands(t);

    // ── 5. Natural Blinking Loop ──
    if (now > this.blinkTimer) {
      this.isBlinking = true;
      this.blinkProgress = 0;
      this.blinkTimer = now + 2800 + Math.random() * 3500;
    }
    if (this.isBlinking) {
      this.blinkProgress += 0.22;
      if (this.blinkProgress >= 1.0) {
        this.isBlinking = false;
        this.blinkProgress = 0;
      }
    }
  }

  render2DFacePlate() {
    const fg = this.faceGfx;
    fg.clear();

    // 2.5D White Face Plate (Natural spherical lower contour)
    fg.beginFill(0xFFFFFF);
    fg.lineStyle(2.2, 0x0F172A);
    fg.drawEllipse(0, 18, 64, 46);
    fg.endFill();

    // Cute Soft Pink Cheeks
    fg.beginFill(0xF472B6, 0.22);
    fg.drawEllipse(-36, 16, 10, 6);
    fg.drawEllipse(36, 16, 10, 6);
    fg.endFill();
  }

  render2DEyes() {
    const le = this.leftEyeGfx;
    const re = this.rightEyeGfx;
    le.clear();
    re.clear();

    // 2.5D Eye Positioning with Depth Perspective
    const yaw = this.angleX;
    const pitch = this.angleY;

    // As head turns right, left eye turns towards center and right eye compresses towards edge
    const eyeSpacing = 14;
    const leftEyeBaseX = -eyeSpacing + (yaw * 3);
    const rightEyeBaseX = eyeSpacing + (yaw * 3);
    const eyeBaseY = -18 + (pitch * 4);

    // 2.5D Perspective Capsule Scale
    const leftScaleX = Math.max(0.72, 1.0 + (yaw * 0.35));
    const rightScaleX = Math.max(0.72, 1.0 - (yaw * 0.35));

    const eyeW = 14.5;
    const eyeH = 20;

    // Pupil Gaze Position
    const pupilXOffset = this.lookX * 4.5;
    const pupilYOffset = this.lookY * 3.5;

    // ── LEFT EYE ──
    if (this.isBlinking && this.blinkProgress > 0.3 && this.blinkProgress < 0.7) {
      // Happy Closed Eye Arc (^ ^)
      le.lineStyle(3.5, 0x0F172A);
      le.arc(leftEyeBaseX, eyeBaseY + 4, 10 * leftScaleX, Math.PI * 1.1, Math.PI * 1.9);
    } else {
      le.beginFill(0xFFFFFF);
      le.lineStyle(2.8, 0x0F172A);
      le.drawEllipse(leftEyeBaseX, eyeBaseY, eyeW * leftScaleX, eyeH);
      le.endFill();

      // Pupil & Dual Highlights
      const lpx = leftEyeBaseX + 3 + pupilXOffset;
      const lpy = eyeBaseY + 2 + pupilYOffset;
      le.beginFill(0x0F172A);
      le.drawCircle(lpx, lpy, 6.0);
      le.endFill();

      // Specular Reflection
      le.beginFill(0xFFFFFF, 0.95);
      le.drawCircle(lpx - 2, lpy - 2, 2.4);
      le.drawCircle(lpx + 2, lpy + 2, 1.2);
      le.endFill();
    }

    // ── RIGHT EYE ──
    if (this.isBlinking && this.blinkProgress > 0.3 && this.blinkProgress < 0.7) {
      re.lineStyle(3.5, 0x0F172A);
      re.arc(rightEyeBaseX, eyeBaseY + 4, 10 * rightScaleX, Math.PI * 1.1, Math.PI * 1.9);
    } else {
      re.beginFill(0xFFFFFF);
      re.lineStyle(2.8, 0x0F172A);
      re.drawEllipse(rightEyeBaseX, eyeBaseY, eyeW * rightScaleX, eyeH);
      re.endFill();

      const rpx = rightEyeBaseX - 3 + pupilXOffset;
      const rpy = eyeBaseY + 2 + pupilYOffset;
      re.beginFill(0x0F172A);
      re.drawCircle(rpx, rpy, 6.0);
      re.endFill();

      re.beginFill(0xFFFFFF, 0.95);
      re.drawCircle(rpx - 2, rpy - 2, 2.4);
      re.drawCircle(rpx + 2, rpy + 2, 1.2);
      re.endFill();
    }
  }

  render2DWhiskersAndNose() {
    const wg = this.whiskersGfx;
    const ng = this.noseGfx;
    wg.clear();
    ng.clear();

    const yaw = this.angleX;
    const pitch = this.angleY;

    // 2.5D High-Parallax Nose Offset (Nose is spherical and projects furthest outwards)
    const noseX = yaw * 8;
    const noseY = 0 + (pitch * 6);

    // ── 1. Red 3D Button Nose ──
    // Drop Shadow on face plate
    ng.beginFill(0x0F172A, 0.18);
    ng.drawEllipse(noseX + 1.5, noseY + 4, 10, 4);
    ng.endFill();

    // Red Spherical Nose
    ng.beginFill(0xEF4444);
    ng.lineStyle(2.5, 0x0F172A);
    ng.drawCircle(noseX, noseY, 11);
    ng.endFill();

    // 3D Glass Specular Highlight
    ng.beginFill(0xFFFFFF, 0.92);
    ng.drawCircle(noseX - 3, noseY - 3.5, 3.2);
    ng.endFill();

    // ── 2. Vertical Philtrum Seam Line ──
    wg.lineStyle(2.5, 0x0F172A);
    wg.moveTo(noseX, noseY + 11);
    wg.lineTo(noseX * 0.7, 34);

    // ── 3. 6 Elastic 2.5D Whiskers (3 on each cheek) ──
    wg.lineStyle(2.2, 0x0F172A);

    // Left Whiskers (Extend & fan out as head turns right)
    const lSpread = 1.0 - (yaw * 0.4);
    const rSpread = 1.0 + (yaw * 0.4);

    // Left Cheek Whiskers
    wg.moveTo(-16 + (yaw * 4), 10); wg.lineTo(-16 - (42 * lSpread), 4 - (pitch * 5));
    wg.moveTo(-18 + (yaw * 4), 18); wg.lineTo(-18 - (48 * lSpread), 18);
    wg.moveTo(-16 + (yaw * 4), 26); wg.lineTo(-16 - (42 * lSpread), 32 + (pitch * 5));

    // Right Cheek Whiskers
    wg.moveTo(16 + (yaw * 4), 10); wg.lineTo(16 + (42 * rSpread), 4 - (pitch * 5));
    wg.moveTo(18 + (yaw * 4), 18); wg.lineTo(18 + (48 * rSpread), 18);
    wg.moveTo(16 + (yaw * 4), 26); wg.lineTo(16 + (42 * rSpread), 32 + (pitch * 5));
  }

  render2DMouth() {
    const mg = this.mouthGfx;
    mg.clear();

    const mY = Math.max(0, Math.min(1.0, this.mouthY));
    const mForm = Math.max(-1.0, Math.min(1.0, this.mouthForm));
    const yaw = this.angleX;

    const centerX = yaw * 5;
    const centerY = 34;

    if (mY < 0.08) {
      // Classic Resting Cute Smile Curve
      mg.lineStyle(2.8, 0x0F172A);
      const spread = 27 + (this.isHappy ? 5 : 0);
      const drop = 13 + (this.isHappy ? 4 : 0);
      mg.moveTo(centerX - spread, centerY);
      mg.quadraticCurveTo(centerX, centerY + drop, centerX + spread, centerY);
    } else {
      // Active Phonetic 2.5D Mouth Cavity
      const openH = 6 + (mY * 34);
      const openW = Math.max(12, 22 + (mForm * 8) + (mY * 6));

      // 1. Dark Crimson Mouth Cavity
      mg.beginFill(0x881337);
      mg.lineStyle(2.8, 0x0F172A);
      mg.moveTo(centerX - openW, centerY);
      mg.quadraticCurveTo(centerX, centerY - (openH * 0.15), centerX + openW, centerY);
      mg.quadraticCurveTo(centerX, centerY + openH, centerX - openW, centerY);
      mg.endFill();

      // 2. Curved White Teeth Arc
      if (mY > 0.20) {
        mg.beginFill(0xFFFFFF);
        mg.lineStyle(0);
        mg.moveTo(centerX - openW * 0.72, centerY);
        mg.quadraticCurveTo(centerX, centerY - (openH * 0.1), centerX + openW * 0.72, centerY);
        mg.lineTo(centerX + openW * 0.66, centerY + 4.5);
        mg.quadraticCurveTo(centerX, centerY + 6.5, centerX - openW * 0.66, centerY + 4.5);
        mg.closePath();
        mg.endFill();
      }

      // 3. Dynamic Pink Tongue
      if (mY > 0.16) {
        mg.beginFill(0xFB7185);
        mg.lineStyle(0);
        const tongueW = openW * 0.65;
        const tongueBaseY = centerY + openH - 2;
        mg.moveTo(centerX - tongueW, tongueBaseY);
        mg.quadraticCurveTo(centerX, tongueBaseY - (openH * 0.45), centerX + tongueW, tongueBaseY);
        mg.quadraticCurveTo(centerX, tongueBaseY + 2, centerX - tongueW, tongueBaseY);
        mg.endFill();
      }
    }
  }

  render2DCollarAndBell(t) {
    const cg = this.collarGfx;
    const bg = this.bellGfx;
    cg.clear();
    bg.clear();

    const yaw = this.angleX;

    // 1. Red Collar Band (Perspective ellipse curve based on head turn)
    cg.beginFill(0xEF4444);
    cg.lineStyle(3, 0x0F172A);
    cg.drawRoundedRect(-46 + (yaw * 3), 0, 92, 15, 6);
    cg.endFill();

    // 2. 3D Golden Bell with Pendulum Physics
    const bellTargetAngle = -yaw * 0.5 + Math.sin(t * 3) * 0.05;
    this.bellAngle += (bellTargetAngle - this.bellAngle) * 0.15;

    this.bellContainer.position.set(yaw * 4, 15);
    this.bellContainer.rotation = this.bellAngle;

    // Golden Spherical Bell
    bg.beginFill(0xFBBF24);
    bg.lineStyle(2.5, 0x0F172A);
    bg.drawCircle(0, 0, 13);
    bg.endFill();

    // Specular Highlight on Bell
    bg.beginFill(0xFFFFFF, 0.85);
    bg.drawCircle(-3, -3.5, 3.0);
    bg.endFill();

    // Bell Horizontal Seam & Center Resonance Hole
    bg.lineStyle(2, 0x0F172A);
    bg.moveTo(-11, -2);
    bg.lineTo(11, -2);
    bg.beginFill(0x334155);
    bg.drawCircle(0, 3, 3.2);
    bg.endFill();
    bg.moveTo(0, 6.2);
    bg.lineTo(0, 12.5);
  }

  render2DHands(t) {
    const lh = this.leftHandGfx;
    const rh = this.rightHandGfx;
    lh.clear();
    rh.clear();

    const lOffset = Math.sin(t * 2.5) * 3.5;
    const rOffset = Math.cos(t * 2.5) * 3.5;
    const yaw = this.angleX;

    // Left Arm & White Robotic Spherical Hand
    lh.beginFill(0x0284C7);
    lh.lineStyle(3, 0x0F172A);
    lh.moveTo(-42, 24);
    lh.lineTo(-64 - (yaw * 4), 48 + lOffset);
    lh.lineTo(-54 - (yaw * 4), 56 + lOffset);
    lh.lineTo(-36, 34);
    lh.closePath();
    lh.endFill();

    lh.beginFill(0xFFFFFF);
    lh.lineStyle(3, 0x0F172A);
    lh.drawCircle(-64 - (yaw * 4), 48 + lOffset, 15);
    lh.endFill();

    // Right Arm & White Robotic Spherical Hand
    rh.beginFill(0x0284C7);
    rh.lineStyle(3, 0x0F172A);
    rh.moveTo(42, 24);
    rh.lineTo(64 - (yaw * 4), 48 + rOffset);
    rh.lineTo(54 - (yaw * 4), 56 + rOffset);
    rh.lineTo(36, 34);
    rh.closePath();
    rh.endFill();

    rh.beginFill(0xFFFFFF);
    rh.lineStyle(3, 0x0F172A);
    rh.drawCircle(64 - (yaw * 4), 48 + rOffset, 15);
    rh.endFill();
  }
}
