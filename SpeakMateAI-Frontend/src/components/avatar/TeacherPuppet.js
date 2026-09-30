import * as PIXI from 'pixi.js';

/**
 * 2D Teacher Rig for SpeakMate AI (Phase T2 Precision Mouth Reconstruction)
 * Built with PixiJS v7 vector graphics matching the SpeakMate avatar architecture.
 * Loads the canonical cropped Teacher_Im.png (400x784 RGBA) with boundary-connected transparency.
 * 
 * Hierarchy:
 * TeacherPuppet
 * └── rootContainer
 *     └── contentContainer (scale: 0.33 to fit entire body & hair comfortably within avatar container)
 *         ├── bodySprite (400x784, anchor: 0.5, 0.5 at 0, 0)
 *         └── mouthRig (position: -1, -166.5)
 *             ├── mouthCavity (PIXI.Graphics: skin concealment + closed smile / open cavity + outline)
 *             └── tongueGraphics (PIXI.Graphics: recessed pink tongue arch when open)
 */
let cachedTeacherTexture = null;

function getTeacherTexture() {
  if (cachedTeacherTexture) {
    return cachedTeacherTexture;
  }
  cachedTeacherTexture = PIXI.Texture.from('/models/avatar/teacher/Teacher_Im.png');
  return cachedTeacherTexture;
}

export class TeacherPuppet extends PIXI.Container {
  constructor() {
    super();
    this.name = 'TeacherPuppet';
    this.isTeacherPuppet = true;

    // Speech & Lip-Sync State
    this._mouthY = 0;
    this.smoothMouthY = 0;
    this._mouthForm = 0;
    this.smoothMouthForm = 0;
    this._isSpeaking = false;
    this._destroyed = false;
    this.currentMood = 'neutral';
    this.isHappy = true;

    // Development preview hook
    if (typeof window !== 'undefined') {
      window.__teacherPuppet = this;
    }

    // Render Cache State (avoid redundant GPU draw calls)
    this.lastRenderedMouthY = -1;
    this.lastRenderedMouthForm = -1;
    this.lastRenderedSpeakingState = null;

    this.initRig();
  }

  get mouthY() {
    return this._mouthY || 0;
  }
  set mouthY(val) {
    this._mouthY = Math.max(0, Math.min(1.0, Number(val) || 0));
  }

  get mouthForm() {
    return this._mouthForm || 0;
  }
  set mouthForm(val) {
    this._mouthForm = Math.max(-1.0, Math.min(1.0, Number(val) || 0));
  }

  get isSpeaking() {
    return this._isSpeaking || false;
  }
  set isSpeaking(val) {
    const boolVal = Boolean(val);
    this._isSpeaking = boolVal;
    if (!boolVal) {
      this._mouthY = 0;
      this._mouthForm = 0;
    }
  }

  initRig() {
    this.rootContainer = new PIXI.Container();
    this.rootContainer.name = 'rootContainer';
    this.addChild(this.rootContainer);

    // Uniformly scaled content container so Sprite & Mouth share identical local coordinates
    // Calibrated scale: X = 0.405 (breadth boost so she does not look thin), Y = 0.375 (fits entire body & hair comfortably within avatar container)
    this.contentContainer = new PIXI.Container();
    this.contentContainer.name = 'contentContainer';
    this.contentContainer.scale.set(0.405, 0.375);
    this.rootContainer.addChild(this.contentContainer);

    // 1. Base Canonical Teacher Sprite (400x784 RGBA)
    // Visual center is at X=200, Y=392 (anchor at 0.5, 0.5)
    const texture = getTeacherTexture();
    this.bodySprite = new PIXI.Sprite(texture);
    this.bodySprite.name = 'bodySprite';
    this.bodySprite.anchor.set(0.5, 0.5);
    this.bodySprite.position.set(0, 0);
    this.contentContainer.addChild(this.bodySprite);

    // 2. Precision Mouth Rig Container
    // Mouth center is at (X=199, Y=225.5) in canonical crop space, which translates to:
    // X_local = 199 - 200 = -1
    // Y_local = 225.5 - 392 = -166.5
    this.mouthRig = new PIXI.Container();
    this.mouthRig.name = 'mouthRig';
    this.mouthRig.position.set(-1, -166.5);
    this.contentContainer.addChild(this.mouthRig);

    // 2a. Mouth Cavity Layer (Graphics for skin concealment patch, closed smile / open cavity, and outline)
    this.mouthCavity = new PIXI.Graphics();
    this.mouthCavity.name = 'mouthCavity';
    this.mouthRig.addChild(this.mouthCavity);

    // 2b. Tongue Graphics Layer (recessed pink dome inside cavity when speaking)
    this.tongueGraphics = new PIXI.Graphics();
    this.tongueGraphics.name = 'tongueGraphics';
    this.mouthRig.addChild(this.tongueGraphics);

    // Initialize resting mouth (state 0: REST with friendly closed smile)
    this.renderMouth(0, 0, false);
  }

  /**
   * Duck-typed interface expected by useLipSync.js
   */
  setMouthOpen(yVal, formVal) {
    this.mouthY = yVal;
    if (formVal !== undefined) {
      this.mouthForm = formVal;
    }
    if ((yVal === 0 || !this.isSpeaking) && this.smoothMouthY < 0.05) {
      this.smoothMouthY = 0;
      this.renderMouth(0, 0, false);
    }
  }

  /**
   * Duck-typed interface expected by useLipSync.js
   */
  setSpeaking(isSpeaking) {
    this.isSpeaking = Boolean(isSpeaking);
    if (!this.isSpeaking) {
      this.mouthY = 0;
      this.smoothMouthY = 0;
      this.mouthForm = 0;
      this.smoothMouthForm = 0;
      this.lastRenderedMouthY = 0;
      this.lastRenderedMouthForm = 0;
      this.lastRenderedSpeakingState = false;
      this.renderMouth(0, 0, false);
    }
  }

  setMood(mood) {
    this.currentMood = mood;
  }

  /**
   * Frame update called by PixiJS Application ticker
   */
  update(_now) {
    if (this._destroyed) return;

    const active = Boolean(this.isSpeaking && this.mouthY > 0.02);
    const targetY = active ? this.mouthY : 0.0;
    const targetForm = active ? this.mouthForm : 0.0;

    // Fast snappy attack on opening (0.55), smooth natural release on closing (0.45)
    const isOpening = targetY > this.smoothMouthY;
    const lerpRate = active ? (isOpening ? 0.55 : 0.45) : 0.50;

    this.smoothMouthY += (targetY - this.smoothMouthY) * lerpRate;
    this.smoothMouthForm += (targetForm - this.smoothMouthForm) * 0.40;

    // Clamp micro-movements when idle or closing
    if (!active || this.smoothMouthY < 0.03) {
      if (!active || targetY === 0) {
        this.smoothMouthY = 0;
        this.smoothMouthForm = 0;
      }
    }

    const quantY = Math.round(this.smoothMouthY * 100) / 100;
    const quantForm = Math.round(this.smoothMouthForm * 50) / 50;

    if (
      quantY !== this.lastRenderedMouthY ||
      quantForm !== this.lastRenderedMouthForm ||
      active !== this.lastRenderedSpeakingState
    ) {
      this.renderMouth(this.smoothMouthY, this.smoothMouthForm, active);
      this.lastRenderedMouthY = quantY;
      this.lastRenderedMouthForm = quantForm;
      this.lastRenderedSpeakingState = active;
    }
  }

  /**
   * High-fidelity anime teacher mouth rendering in mouthRig local space
   * Origin (0, 0) corresponds to mouth center (X_crop=199, Y_crop=225.5)
   * 
   * @param {number} mouthY - Normalized opening [0.0, 1.0]
   * @param {number} mouthForm - Form modulation [-1.0: narrow OO/OH, +1.0: wide EE/AA]
   * @param {boolean} isSpeaking - Whether speech animation is active
   */
  renderMouth(mouthY, mouthForm, isSpeaking) {
    if (!this.mouthCavity || !this.tongueGraphics) return;

    this.mouthCavity.clear();
    this.tongueGraphics.clear();

    // ── 1. CLOSED SMILE STATE (REST / IDLE / CLOSED) ──
    // When mouth is at REST (mouthY < 0.05 or inactive):
    // Display a beautiful, friendly, closed cartoon smile.
    // Conceals the baked-in open mouth so she only opens her mouth when speaking.
    if (mouthY < 0.05 || !isSpeaking) {
      // 1a. Skin concealment patch covering baked open smile
      this.mouthCavity.beginFill(0xF9CDB4, 1.0);
      this.mouthCavity.drawRoundedRect(-25, -9.5, 50, 26, 6);
      this.mouthCavity.endFill();

      // 1b. Friendly closed smile curve (dark anime line #240808)
      const leftX = -18;
      const rightX = 18;
      const cornerY = -4.5;
      const centerY = -1.0;
      const ctrlY = 2 * centerY - cornerY;

      this.mouthCavity.lineStyle(2.0, 0x240808, 1.0);
      this.mouthCavity.moveTo(leftX, cornerY);
      this.mouthCavity.quadraticCurveTo(0, ctrlY, rightX, cornerY);

      // 1c. Upward smiling corner accent flicks
      this.mouthCavity.lineStyle(1.8, 0x240808, 0.95);
      this.mouthCavity.moveTo(leftX, cornerY);
      this.mouthCavity.lineTo(leftX - 2.5, cornerY - 2.0);
      this.mouthCavity.moveTo(rightX, cornerY);
      this.mouthCavity.lineTo(rightX + 2.5, cornerY - 2.0);

      // 1d. Subtle lower lip shadow accent
      this.mouthCavity.lineStyle(1.0, 0xC38273, 0.75);
      this.mouthCavity.moveTo(-4, 4.5);
      this.mouthCavity.lineTo(4, 4.5);

      return;
    }

    // ── 2. DYNAMIC ARTICULATION (SPEAKING OPEN MOUTH) ──
    // 2a. Skin Concealment Patch (Face tone #F9CDB4)
    // Covers original baked resting smile (X: 176..223, Y: 218..241 in crop space)
    // Relative to mouthRig (0, 0): X spans [-25, +25], Y spans [-9.5, +16.5]
    // Cleanly leaves nose tip (Y = -28.2) and chin crease (Y = +22.5..+25.5) untouched.
    this.mouthCavity.beginFill(0xF9CDB4, 1.0);
    this.mouthCavity.drawRoundedRect(-25, -9.5, 50, 26, 6);
    this.mouthCavity.endFill();

    // 2b. Cavity Geometry Calculations
    // Width modulation: base half-width 21px, +2px on mouthY, +/-3.5px on mouthForm
    const formW = mouthForm * 3.5;
    const hw = 21.0 + (mouthY * 2.0) + formW;

    // Smile corner elevation: subtle upward tilt for friendly teacher expression
    const cornerLift = 1.0 + (mouthForm * 1.0);
    const cornerY = -4.5 - cornerLift;

    // Upper smile arch: apex at upperY
    const upperY = -6.5 - (mouthForm * 0.5);
    const upperCtrlY = 2 * upperY - cornerY;

    // Lower contour: vertex at lowerY smoothly drops with mouthY
    // SLIGHT (0.22): drop ~5.7px, MEDIUM (0.50): drop ~11.8px,
    // LARGE (0.75): drop ~17.1px, MAX (1.00): drop ~22.5px
    // Stays strictly within verified safe bound Y_crop <= 254 (relative Y <= +28.5)
    const openDrop = 1.0 + (mouthY * 21.5) - (Math.abs(mouthForm) * 1.5);
    const lowerY = openDrop;
    const lowerCtrlY = 2 * lowerY - cornerY;

    // 2c. Deep Burgundy Mouth Cavity Fill (#5A161C) with Dark Anime Outline (#240808)
    this.mouthCavity.beginFill(0x5A161C, 1.0);
    this.mouthCavity.lineStyle(2.0, 0x240808, 1.0);
    this.mouthCavity.moveTo(-hw, cornerY);
    this.mouthCavity.quadraticCurveTo(0, upperCtrlY, hw, cornerY);
    this.mouthCavity.quadraticCurveTo(0, lowerCtrlY, -hw, cornerY);
    this.mouthCavity.closePath();
    this.mouthCavity.endFill();

    // 2d. Corner Smile Accent Marks
    this.mouthCavity.lineStyle(1.2, 0x240808, 0.85);
    this.mouthCavity.moveTo(-hw - 1, cornerY + 1);
    this.mouthCavity.lineTo(-hw + 1, cornerY - 1);
    this.mouthCavity.moveTo(hw - 1, cornerY - 1);
    this.mouthCavity.lineTo(hw + 1, cornerY + 1);


    // 2f. Recessed Warm Pink Tongue Arch (#EC7886)
    // Introduced at MEDIUM, LARGE, MAX (mouthY >= 0.35)
    // Nestled snugly along lower contour; never protrudes outside cavity
    if (mouthY >= 0.35) {
      const cavityHeight = lowerY - upperY;
      const tW = hw * 0.62;
      const ratio = tW / hw;
      // Parabolic lower boundary Y coordinate at x = tW
      const yTw = lowerY + (cornerY - lowerY) * (ratio * ratio);
      const tH = cavityHeight * 0.50;
      const tTop = lowerY - tH;
      const tTopCtrl = 2 * tTop - yTw;
      const tBotCtrl = 2 * (lowerY - 1.0) - yTw;

      this.tongueGraphics.beginFill(0xEC7886, 1.0);
      this.tongueGraphics.lineStyle(0);
      this.tongueGraphics.moveTo(-tW, yTw);
      this.tongueGraphics.quadraticCurveTo(0, tTopCtrl, tW, yTw);
      this.tongueGraphics.quadraticCurveTo(0, tBotCtrl, -tW, yTw);
      this.tongueGraphics.closePath();
      this.tongueGraphics.endFill();
    }
  }

  /**
   * Clean up PixiJS resources on unmount
   */
  destroy(options) {
    this._destroyed = true;
    this._isSpeaking = false;
    this._mouthY = 0;
    this._mouthForm = 0;
    if (typeof window !== 'undefined' && window.__teacherPuppet === this) {
      delete window.__teacherPuppet;
    }
    if (this.mouthCavity) {
      try {
        this.mouthCavity.destroy(options);
      } catch (_) {}
      this.mouthCavity = null;
    }
    if (this.tongueGraphics) {
      try {
        this.tongueGraphics.destroy(options);
      } catch (_) {}
      this.tongueGraphics = null;
    }
    if (this.mouthRig) {
      try {
        this.mouthRig.destroy(options);
      } catch (_) {}
      this.mouthRig = null;
    }
    if (this.bodySprite) {
      try {
        this.bodySprite.destroy(options);
      } catch (_) {}
      this.bodySprite = null;
    }
    super.destroy(options);
  }
}

export default TeacherPuppet;
