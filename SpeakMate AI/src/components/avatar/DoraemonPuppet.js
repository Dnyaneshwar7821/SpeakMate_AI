import * as PIXI from 'pixi.js';

/**
 * Helper to generate high-DPI procedural 2.5D illustrated textures with volumetric lighting
 */
function createVolumetricTextures() {
  const textures = {};

  // 1. Volumetric Head Sphere Texture (320x320)
  try {
    const cHead = document.createElement('canvas');
    cHead.width = 320;
    cHead.height = 320;
    const ctxH = cHead.getContext('2d');
    
    // Soft 3D spherical light coming from top-left
    const gradHead = ctxH.createRadialGradient(120, 105, 20, 160, 160, 150);
    gradHead.addColorStop(0, '#38BDF8'); // Soft sky rim highlight
    gradHead.addColorStop(0.25, '#0284C7'); // Iconic Doraemon Blue
    gradHead.addColorStop(0.72, '#0369A1'); // Form shadow
    gradHead.addColorStop(1.0, '#075985'); // Ambient occlusion rim
    
    ctxH.fillStyle = gradHead;
    ctxH.beginPath();
    ctxH.arc(160, 160, 150, 0, Math.PI * 2);
    ctxH.fill();

    ctxH.lineWidth = 6.5;
    ctxH.strokeStyle = '#0F172A';
    ctxH.stroke();

    textures.head = PIXI.Texture.from(cHead);
  } catch (_) {}

  // 2. Volumetric White Face Plate Mask (280x220)
  try {
    const cFace = document.createElement('canvas');
    cFace.width = 280;
    cFace.height = 220;
    const ctxF = cFace.getContext('2d');

    const gradFace = ctxF.createRadialGradient(140, 95, 20, 140, 110, 130);
    gradFace.addColorStop(0, '#FFFFFF');
    gradFace.addColorStop(0.70, '#FFFFFF');
    gradFace.addColorStop(0.92, '#F1F5F9');
    gradFace.addColorStop(1.0, '#E2E8F0');

    ctxF.fillStyle = gradFace;
    ctxF.beginPath();
    ctxF.ellipse(140, 110, 130, 95, 0, 0, Math.PI * 2);
    ctxF.fill();

    ctxF.lineWidth = 4.5;
    ctxF.strokeStyle = '#0F172A';
    ctxF.stroke();

    textures.face = PIXI.Texture.from(cFace);
  } catch (_) {}

  // 3. Soft Airbrushed Anime Blush (80x50)
  try {
    const cBlush = document.createElement('canvas');
    cBlush.width = 80;
    cBlush.height = 50;
    const ctxB = cBlush.getContext('2d');

    const gradBlush = ctxB.createRadialGradient(40, 25, 0, 40, 25, 38);
    gradBlush.addColorStop(0, 'rgba(244, 63, 94, 0.40)');
    gradBlush.addColorStop(0.55, 'rgba(244, 63, 94, 0.16)');
    gradBlush.addColorStop(1.0, 'rgba(244, 63, 94, 0.0)');

    ctxB.fillStyle = gradBlush;
    ctxB.beginPath();
    ctxB.ellipse(40, 25, 38, 22, 0, 0, Math.PI * 2);
    ctxB.fill();

    textures.blush = PIXI.Texture.from(cBlush);
  } catch (_) {}

  // 4. Glossy 3D Candy-Apple Red Nose (70x70)
  try {
    const cNose = document.createElement('canvas');
    cNose.width = 70;
    cNose.height = 70;
    const ctxN = cNose.getContext('2d');

    const gradNose = ctxN.createRadialGradient(25, 23, 4, 35, 35, 30);
    gradNose.addColorStop(0, '#FFA4A4');
    gradNose.addColorStop(0.22, '#EF4444');
    gradNose.addColorStop(0.75, '#DC2626');
    gradNose.addColorStop(1.0, '#991B1B');

    ctxN.fillStyle = gradNose;
    ctxN.beginPath();
    ctxN.arc(35, 35, 28, 0, Math.PI * 2);
    ctxN.fill();

    ctxN.lineWidth = 4.0;
    ctxN.strokeStyle = '#0F172A';
    ctxN.stroke();

    ctxN.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctxN.beginPath();
    ctxN.ellipse(27, 24, 8, 5, -Math.PI / 5, 0, Math.PI * 2);
    ctxN.fill();

    textures.nose = PIXI.Texture.from(cNose);
  } catch (_) {}

  // 5. Metallic 3D Golden Bell (80x80)
  try {
    const cBell = document.createElement('canvas');
    cBell.width = 80;
    cBell.height = 80;
    const ctxBell = cBell.getContext('2d');

    const gradBell = ctxBell.createRadialGradient(30, 28, 5, 40, 40, 35);
    gradBell.addColorStop(0, '#FEF08A');
    gradBell.addColorStop(0.28, '#FBBF24');
    gradBell.addColorStop(0.70, '#D97706');
    gradBell.addColorStop(1.0, '#92400E');

    ctxBell.fillStyle = gradBell;
    ctxBell.beginPath();
    ctxBell.arc(40, 40, 32, 0, Math.PI * 2);
    ctxBell.fill();

    ctxBell.lineWidth = 4.5;
    ctxBell.strokeStyle = '#0F172A';
    ctxBell.stroke();

    ctxBell.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctxBell.beginPath();
    ctxBell.ellipse(32, 28, 9, 5, -Math.PI / 4, 0, Math.PI * 2);
    ctxBell.fill();

    ctxBell.lineWidth = 3.5;
    ctxBell.strokeStyle = '#0F172A';
    ctxBell.beginPath();
    ctxBell.moveTo(14, 37);
    ctxBell.lineTo(66, 37);
    ctxBell.stroke();

    ctxBell.fillStyle = '#1E293B';
    ctxBell.beginPath();
    ctxBell.arc(40, 48, 6.5, 0, Math.PI * 2);
    ctxBell.fill();

    ctxBell.beginPath();
    ctxBell.moveTo(40, 54.5);
    ctxBell.lineTo(40, 68);
    ctxBell.stroke();

    textures.bell = PIXI.Texture.from(cBell);
  } catch (_) {}

  // 6. Cylindrical 3D Red Collar (220x60)
  try {
    const cCol = document.createElement('canvas');
    cCol.width = 220;
    cCol.height = 60;
    const ctxC = cCol.getContext('2d');

    const gradCol = ctxC.createLinearGradient(0, 10, 0, 50);
    gradCol.addColorStop(0, '#F87171');
    gradCol.addColorStop(0.40, '#EF4444');
    gradCol.addColorStop(1.0, '#B91C1C');

    ctxC.fillStyle = gradCol;
    ctxC.beginPath();
    ctxC.roundRect(10, 10, 200, 38, 16);
    ctxC.fill();

    ctxC.lineWidth = 5.0;
    ctxC.strokeStyle = '#0F172A';
    ctxC.stroke();

    textures.collar = PIXI.Texture.from(cCol);
  } catch (_) {}

  // 7. Volumetric Torso with 4D Magic Pocket (240x240)
  try {
    const cBody = document.createElement('canvas');
    cBody.width = 240;
    cBody.height = 240;
    const ctxBody = cBody.getContext('2d');

    const gradBody = ctxBody.createRadialGradient(90, 80, 20, 120, 120, 110);
    gradBody.addColorStop(0, '#38BDF8');
    gradBody.addColorStop(0.30, '#0284C7');
    gradBody.addColorStop(0.75, '#0369A1');
    gradBody.addColorStop(1.0, '#075985');

    ctxBody.fillStyle = gradBody;
    ctxBody.beginPath();
    ctxBody.roundRect(20, 20, 200, 195, 65);
    ctxBody.fill();

    ctxBody.lineWidth = 6.0;
    ctxBody.strokeStyle = '#0F172A';
    ctxBody.stroke();

    const gradBelly = ctxBody.createRadialGradient(120, 105, 10, 120, 115, 75);
    gradBelly.addColorStop(0, '#FFFFFF');
    gradBelly.addColorStop(0.80, '#F8FAFC');
    gradBelly.addColorStop(1.0, '#E2E8F0');

    ctxBody.fillStyle = gradBelly;
    ctxBody.beginPath();
    ctxBody.arc(120, 115, 72, 0, Math.PI * 2);
    ctxBody.fill();

    ctxBody.lineWidth = 4.5;
    ctxBody.strokeStyle = '#0F172A';
    ctxBody.stroke();

    ctxBody.fillStyle = '#FFFFFF';
    ctxBody.beginPath();
    ctxBody.arc(120, 115, 52, 0, Math.PI);
    ctxBody.lineTo(172, 115);
    ctxBody.fill();

    ctxBody.lineWidth = 4.5;
    ctxBody.strokeStyle = '#0F172A';
    ctxBody.stroke();

    ctxBody.beginPath();
    ctxBody.moveTo(68, 115);
    ctxBody.lineTo(172, 115);
    ctxBody.stroke();

    textures.body = PIXI.Texture.from(cBody);
  } catch (_) {}

  // 8. 3D Robotic Round White Paw (80x80)
  try {
    const cHand = document.createElement('canvas');
    cHand.width = 80;
    cHand.height = 80;
    const ctxHnd = cHand.getContext('2d');

    const gradHnd = ctxHnd.createRadialGradient(32, 28, 5, 40, 40, 35);
    gradHnd.addColorStop(0, '#FFFFFF');
    gradHnd.addColorStop(0.70, '#F1F5F9');
    gradHnd.addColorStop(1.0, '#CBD5E1');

    ctxHnd.fillStyle = gradHnd;
    ctxHnd.beginPath();
    ctxHnd.arc(40, 40, 32, 0, Math.PI * 2);
    ctxHnd.fill();

    ctxHnd.lineWidth = 4.5;
    ctxHnd.strokeStyle = '#0F172A';
    ctxHnd.stroke();

    textures.hand = PIXI.Texture.from(cHand);
  } catch (_) {}

  return textures;
}

let cachedTextures = null;

/**
 * DoraemonPuppet - Grounded, Stable 2.5D Volumetric Illustrated Live Rig
 * Upright, stable posture with locked neck geometry, gentle speech nodding,
 * and expressive facial viseme lip-syncing.
 */
export class DoraemonPuppet extends PIXI.Container {
  constructor() {
    super();
    this.isDoraemonPuppet = true;

    if (!cachedTextures) {
      cachedTextures = createVolumetricTextures();
    }
    this.tex = cachedTextures;

    // Root World Anchor
    this.rootContainer = new PIXI.Container();
    this.addChild(this.rootContainer);

    // ── 1. Torso Layer (Fixed Base at Y: 46) ──
    this.bodyContainer = new PIXI.Container();
    this.bodyContainer.position.set(0, 46);
    this.rootContainer.addChild(this.bodyContainer);

    if (this.tex.body) {
      this.bodySprite = new PIXI.Sprite(this.tex.body);
      this.bodySprite.anchor.set(0.5, 0.5);
      this.bodySprite.scale.set(0.66, 0.66);
      this.bodyContainer.addChild(this.bodySprite);
    }

    // ── 2. Arms & Robotic White Paws (Y: 46) ──
    this.handsContainer = new PIXI.Container();
    this.handsContainer.position.set(0, 46);
    this.rootContainer.addChild(this.handsContainer);

    this.leftArmGfx = new PIXI.Graphics();
    this.rightArmGfx = new PIXI.Graphics();
    this.handsContainer.addChild(this.leftArmGfx);
    this.handsContainer.addChild(this.rightArmGfx);

    if (this.tex.hand) {
      this.leftPawSprite = new PIXI.Sprite(this.tex.hand);
      this.leftPawSprite.anchor.set(0.5, 0.5);
      this.leftPawSprite.scale.set(0.56, 0.56);
      this.handsContainer.addChild(this.leftPawSprite);

      this.rightPawSprite = new PIXI.Sprite(this.tex.hand);
      this.rightPawSprite.anchor.set(0.5, 0.5);
      this.rightPawSprite.scale.set(0.56, 0.56);
      this.handsContainer.addChild(this.rightPawSprite);
    }

    // ── 3. Head & Neck Pivot Group (Firmly Anchored at Y: -30) ──
    this.headMaster = new PIXI.Container();
    this.headMaster.position.set(0, -30);
    this.rootContainer.addChild(this.headMaster);

    // Outer Blue Head Sphere
    this.headShellContainer = new PIXI.Container();
    this.headMaster.addChild(this.headShellContainer);

    if (this.tex.head) {
      this.headSprite = new PIXI.Sprite(this.tex.head);
      this.headSprite.anchor.set(0.5, 0.5);
      this.headSprite.scale.set(0.66, 0.66);
      this.headShellContainer.addChild(this.headSprite);
    }

    // White Face Plate Mask
    this.facePlateContainer = new PIXI.Container();
    this.facePlateContainer.position.set(0, 8);
    this.headMaster.addChild(this.facePlateContainer);

    if (this.tex.face) {
      this.faceSprite = new PIXI.Sprite(this.tex.face);
      this.faceSprite.anchor.set(0.5, 0.5);
      this.faceSprite.scale.set(0.63, 0.60);
      this.facePlateContainer.addChild(this.faceSprite);
    }

    // Soft Anime Blush
    if (this.tex.blush) {
      this.leftBlush = new PIXI.Sprite(this.tex.blush);
      this.leftBlush.anchor.set(0.5, 0.5);
      this.leftBlush.position.set(-42, 16);
      this.leftBlush.scale.set(0.68, 0.58);
      this.facePlateContainer.addChild(this.leftBlush);

      this.rightBlush = new PIXI.Sprite(this.tex.blush);
      this.rightBlush.anchor.set(0.5, 0.5);
      this.rightBlush.position.set(42, 16);
      this.rightBlush.scale.set(0.68, 0.58);
      this.facePlateContainer.addChild(this.rightBlush);
    }

    // ── 4. Eyes Container ──
    this.eyesContainer = new PIXI.Container();
    this.eyesContainer.position.set(0, -22);
    this.facePlateContainer.addChild(this.eyesContainer);

    this.leftEyeGfx = new PIXI.Graphics();
    this.rightEyeGfx = new PIXI.Graphics();
    this.eyesContainer.addChild(this.leftEyeGfx);
    this.eyesContainer.addChild(this.rightEyeGfx);

    // ── 5. Whiskers & Philtrum Seam ──
    this.whiskersGfx = new PIXI.Graphics();
    this.facePlateContainer.addChild(this.whiskersGfx);

    // ── 6. Phonetic Lip-Sync Mouth ──
    this.mouthGfx = new PIXI.Graphics();
    this.facePlateContainer.addChild(this.mouthGfx);

    // ── 7. 3D Glossy Red Nose ──
    this.noseContainer = new PIXI.Container();
    this.noseContainer.position.set(0, -3);
    this.facePlateContainer.addChild(this.noseContainer);

    if (this.tex.nose) {
      this.noseSprite = new PIXI.Sprite(this.tex.nose);
      this.noseSprite.anchor.set(0.5, 0.5);
      this.noseSprite.scale.set(0.50, 0.50);
      this.noseContainer.addChild(this.noseSprite);
    }

    // ── 8. Red Collar & 3D Bell (Firmly Locked at the Neck Base Y: 56) ──
    this.collarContainer = new PIXI.Container();
    this.collarContainer.position.set(0, 56);
    this.headMaster.addChild(this.collarContainer);

    if (this.tex.collar) {
      this.collarSprite = new PIXI.Sprite(this.tex.collar);
      this.collarSprite.anchor.set(0.5, 0.5);
      this.collarSprite.scale.set(0.56, 0.48);
      this.collarContainer.addChild(this.collarSprite);
    }

    this.bellContainer = new PIXI.Container();
    this.bellContainer.position.set(0, 13);
    this.collarContainer.addChild(this.bellContainer);

    if (this.tex.bell) {
      this.bellSprite = new PIXI.Sprite(this.tex.bell);
      this.bellSprite.anchor.set(0.5, 0.5);
      this.bellSprite.scale.set(0.48, 0.48);
      this.bellContainer.addChild(this.bellSprite);
    }

    // ── Stable State Controls ──
    this.lookX = 0;
    this.lookY = 0;
    this.targetLookX = 0;
    this.targetLookY = 0;

    this.nextSaccadeTime = performance.now() + 2000;
    this.blinkTimer = performance.now() + 2800;
    this.isBlinking = false;
    this.blinkProgress = 0;

    this.mouthY = 0;
    this.mouthForm = 0;
    this.isSpeaking = false;
    this.isHappy = false;
  }

  update(now = performance.now()) {
    const t = now * 0.001;

    // ── 1. Subtle, Natural Eye Saccades (Eyes move, head stays grounded) ──
    if (now > this.nextSaccadeTime) {
      this.targetLookX = (Math.random() - 0.5) * 0.50;
      this.targetLookY = (Math.random() - 0.5) * 0.25;
      this.nextSaccadeTime = now + 2400 + Math.random() * 3200;
    }

    // Smooth Pupil Interpolation
    this.lookX += (this.targetLookX - this.lookX) * 0.15;
    this.lookY += (this.targetLookY - this.lookY) * 0.15;

    // ── 2. Grounded Posture (NO sideways rocking/tilting!) ──
    // Very gentle vertical breathing (1.2px)
    const breathingY = Math.sin(t * 1.8) * 1.2;
    this.rootContainer.y = breathingY;

    // Gentle speech nodding (Vertical only: 0 to 2.5px nod when talking)
    const speechNodY = this.isSpeaking ? (Math.sin(t * 8.0) * 1.8 * Math.max(0.3, this.mouthY)) : 0;
    this.headMaster.y = -30 + speechNodY;
    this.headMaster.rotation = 0; // Zero side-to-side roll!

    // Face elements have gentle 2.5D parallax inside the head sphere
    const faceParallaxX = this.lookX * 5.0;
    const faceParallaxY = this.lookY * 3.0;
    this.facePlateContainer.position.set(faceParallaxX, 8 + faceParallaxY);
    this.noseContainer.position.set(this.lookX * 3.0, -3 + (this.lookY * 2.0));

    // ── 3. Render Face & Hands ──
    this.render2DEyes();
    this.render2DWhiskers();
    this.render2DMouth();
    this.render2DHands(t);

    // ── 4. Natural Eyelid Blinking ──
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

  render2DEyes() {
    const le = this.leftEyeGfx;
    const re = this.rightEyeGfx;
    le.clear();
    re.clear();

    const eyeSpacing = 13.5;
    const leftX = -eyeSpacing;
    const rightX = eyeSpacing;
    const eyeY = 0;

    const eyeW = 13.5;
    const eyeH = 19;

    const pupilX = this.lookX * 3.8;
    const pupilY = this.lookY * 2.8;

    // ── LEFT EYE ──
    if (this.isBlinking && this.blinkProgress > 0.3 && this.blinkProgress < 0.7) {
      le.lineStyle(3.5, 0x0F172A);
      le.arc(leftX, eyeY + 3, 9.5, Math.PI * 1.1, Math.PI * 1.9);
    } else {
      le.beginFill(0xFFFFFF);
      le.lineStyle(2.8, 0x0F172A);
      le.drawEllipse(leftX, eyeY, eyeW, eyeH);
      le.endFill();

      // Top eyelid cast shadow
      le.beginFill(0xE2E8F0, 0.75);
      le.lineStyle(0);
      le.drawEllipse(leftX, eyeY - 8, eyeW * 0.9, 6);
      le.endFill();

      // Deep Midnight Navy Pupil
      const lpx = leftX + 2.5 + pupilX;
      const lpy = eyeY + 1.5 + pupilY;
      le.beginFill(0x0F172A);
      le.drawCircle(lpx, lpy, 5.8);
      le.endFill();

      // Primary & Secondary Specular Sparkles
      le.beginFill(0xFFFFFF, 0.98);
      le.drawCircle(lpx - 1.8, lpy - 1.8, 2.2);
      le.drawCircle(lpx + 1.8, lpy + 1.8, 1.1);
      le.endFill();
    }

    // ── RIGHT EYE ──
    if (this.isBlinking && this.blinkProgress > 0.3 && this.blinkProgress < 0.7) {
      re.lineStyle(3.5, 0x0F172A);
      re.arc(rightX, eyeY + 3, 9.5, Math.PI * 1.1, Math.PI * 1.9);
    } else {
      re.beginFill(0xFFFFFF);
      re.lineStyle(2.8, 0x0F172A);
      re.drawEllipse(rightX, eyeY, eyeW, eyeH);
      re.endFill();

      re.beginFill(0xE2E8F0, 0.75);
      re.lineStyle(0);
      re.drawEllipse(rightX, eyeY - 8, eyeW * 0.9, 6);
      re.endFill();

      const rpx = rightX - 2.5 + pupilX;
      const rpy = eyeY + 1.5 + pupilY;
      re.beginFill(0x0F172A);
      re.drawCircle(rpx, rpy, 5.8);
      re.endFill();

      re.beginFill(0xFFFFFF, 0.98);
      re.drawCircle(rpx - 1.8, rpy - 1.8, 2.2);
      re.drawCircle(rpx + 1.8, rpy + 1.8, 1.1);
      re.endFill();
    }
  }

  render2DWhiskers() {
    const wg = this.whiskersGfx;
    wg.clear();

    // Philtrum Seam Line
    wg.lineStyle(2.4, 0x0F172A);
    wg.moveTo(0, 7);
    wg.lineTo(0, 27);

    // 6 Whiskers
    wg.lineStyle(2.2, 0x0F172A);

    // Left Whiskers
    wg.moveTo(-16, 6); wg.lineTo(-54, 1);
    wg.moveTo(-18, 14); wg.lineTo(-60, 14);
    wg.moveTo(-16, 22); wg.lineTo(-54, 27);

    // Right Whiskers
    wg.moveTo(16, 6); wg.lineTo(54, 1);
    wg.moveTo(18, 14); wg.lineTo(60, 14);
    wg.moveTo(16, 22); wg.lineTo(54, 27);
  }

  render2DMouth() {
    const mg = this.mouthGfx;
    mg.clear();

    const mY = Math.max(0, Math.min(1.0, this.mouthY));
    const mForm = Math.max(-1.0, Math.min(1.0, this.mouthForm));
    const centerX = 0;
    const centerY = 27;

    if (mY < 0.08) {
      // Classic Cute Doraemon Smile
      mg.lineStyle(2.8, 0x0F172A);
      const spread = 26 + (this.isHappy ? 4 : 0);
      const drop = 12 + (this.isHappy ? 3 : 0);
      mg.moveTo(centerX - spread, centerY);
      mg.quadraticCurveTo(centerX, centerY + drop, centerX + spread, centerY);
    } else {
      // 2.5D Phonetic Active Mouth
      const openH = 6 + (mY * 32);
      const openW = Math.max(12, 21 + (mForm * 8) + (mY * 5));

      // 1. Dark Burgundy Mouth Cavity
      mg.beginFill(0x881337);
      mg.lineStyle(2.8, 0x0F172A);
      mg.moveTo(centerX - openW, centerY);
      mg.quadraticCurveTo(centerX, centerY - (openH * 0.15), centerX + openW, centerY);
      mg.quadraticCurveTo(centerX, centerY + openH, centerX - openW, centerY);
      mg.endFill();

      // Top depth shadow
      mg.beginFill(0x4C0519, 0.65);
      mg.lineStyle(0);
      mg.moveTo(centerX - openW * 0.9, centerY);
      mg.quadraticCurveTo(centerX, centerY - (openH * 0.12), centerX + openW * 0.9, centerY);
      mg.quadraticCurveTo(centerX, centerY + 4.5, centerX - openW * 0.9, centerY);
      mg.endFill();

      // 2. Pearlescent Teeth Bar
      if (mY > 0.20) {
        mg.beginFill(0xFFFFFF);
        mg.lineStyle(0);
        mg.moveTo(centerX - openW * 0.72, centerY);
        mg.quadraticCurveTo(centerX, centerY - (openH * 0.1), centerX + openW * 0.72, centerY);
        mg.lineTo(centerX + openW * 0.66, centerY + 4.2);
        mg.quadraticCurveTo(centerX, centerY + 6.0, centerX - openW * 0.66, centerY + 4.2);
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
        mg.quadraticCurveTo(centerX, tongueBaseY - (openH * 0.45), tongueW, tongueBaseY);
        mg.quadraticCurveTo(centerX, tongueBaseY + 2, -tongueW, tongueBaseY);
        mg.endFill();

        mg.beginFill(0xFDA4AF, 0.85);
        mg.drawEllipse(centerX, tongueBaseY - (openH * 0.22), tongueW * 0.45, 2.5);
        mg.endFill();
      }
    }
  }

  render2DHands(t) {
    const la = this.leftArmGfx;
    const ra = this.rightArmGfx;
    la.clear();
    ra.clear();

    const lOffset = Math.sin(t * 2.0) * 2.5;
    const rOffset = Math.cos(t * 2.0) * 2.5;

    // Left Arm & Paw
    la.beginFill(0x0284C7);
    la.lineStyle(3, 0x0F172A);
    la.moveTo(-36, -2);
    la.lineTo(-58, 18 + lOffset);
    la.lineTo(-48, 26 + lOffset);
    la.lineTo(-30, 8);
    la.closePath();
    la.endFill();

    if (this.leftPawSprite) {
      this.leftPawSprite.position.set(-58, 20 + lOffset);
    }

    // Right Arm & Paw
    ra.beginFill(0x0284C7);
    ra.lineStyle(3, 0x0F172A);
    ra.moveTo(36, -2);
    ra.lineTo(58, 18 + rOffset);
    ra.lineTo(48, 26 + rOffset);
    ra.lineTo(30, 8);
    ra.closePath();
    ra.endFill();

    if (this.rightPawSprite) {
      this.rightPawSprite.position.set(58, 20 + rOffset);
    }
  }
}
