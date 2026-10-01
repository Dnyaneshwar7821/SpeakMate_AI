import * as PIXI from 'pixi.js';

/**
 * 2D Male Teacher Rig for SpeakMate AI (Phase M2 Dynamic Mouth Rig)
 * Built with PixiJS v7 vector graphics matching the SpeakMate avatar architecture.
 * Loads the canonical TeacherBoy_Im.png (400x784 RGBA) with boundary-connected transparency.
 * 
 * Hierarchy:
 * MaleTeacherPuppet
 * └── rootContainer
 *     └── contentContainer (scale: 0.42, 0.42)
 *         ├── bodySprite (400x784, anchor: 0.5, 0.5 at 0, 0)
 *         └── mouthRig (position: X=+1.5, Y=-73.0)
 *             ├── mouthCavity (PIXI.Graphics: skin concealment + dynamic burgundy cavity + outline)
 *             └── tongueGraphics (PIXI.Graphics: recessed pink tongue arch when open)
 */
let cachedMaleTeacherTexture = null;

function getMaleTeacherTexture() {
  if (cachedMaleTeacherTexture) {
    return cachedMaleTeacherTexture;
  }
  cachedMaleTeacherTexture = PIXI.Texture.from('/models/avatar/teacherMale/TeacherBoy_Im.png');
  return cachedMaleTeacherTexture;
}

export class MaleTeacherPuppet extends PIXI.Container {
  constructor() {
    super();
    this.name = 'MaleTeacherPuppet';
    this.isMaleTeacherPuppet = true;

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
      window.__maleTeacherPuppet = this;
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
    // Calibrated scale: X = 0.42, Y = 0.42
    this.contentContainer = new PIXI.Container();
    this.contentContainer.name = 'contentContainer';
    this.contentContainer.scale.set(0.42, 0.42);
    this.rootContainer.addChild(this.contentContainer);

    // 1. Base Canonical Male Teacher Sprite (400x784 RGBA)
    // Visual center is at X=200, Y=392 (anchor at 0.5, 0.5)
    const texture = getMaleTeacherTexture();
    this.bodySprite = new PIXI.Sprite(texture);
    this.bodySprite.name = 'bodySprite';
    this.bodySprite.anchor.set(0.5, 0.5);
    this.bodySprite.position.set(0, 0);
    this.contentContainer.addChild(this.bodySprite);

    // 2. Precision Mouth Rig Container
    // In canonical canvas space:
    // Mouth line center is at X=201.0, Y=343.0. Anchor (0.5, 0.5) is at (200, 392).
    // Local coords: X = 201.0 - 200 = +1.0, Y = 343.0 - 392 = -49.0
    this.mouthRig = new PIXI.Container();
    this.mouthRig.name = 'mouthRig';
    this.mouthRig.position.set(1.0, -49.0);
    this.contentContainer.addChild(this.mouthRig);

    // 2a. Mouth Cavity Layer (Graphics for skin patch and deep burgundy cavity fill)
    this.mouthCavity = new PIXI.Graphics();
    this.mouthCavity.name = 'mouthCavity';
    this.mouthRig.addChild(this.mouthCavity);

    // 2b. Tongue Graphics Layer (recessed pink dome inside cavity touching bottom edge)
    this.tongueGraphics = new PIXI.Graphics();
    this.tongueGraphics.name = 'tongueGraphics';
    this.mouthRig.addChild(this.tongueGraphics);

    // 2c. Mouth Border Layer (crisp dark anime outline and accents drawn ON TOP)
    this.mouthBorder = new PIXI.Graphics();
    this.mouthBorder.name = 'mouthBorder';
    this.mouthRig.addChild(this.mouthBorder);

    // Initialize resting mouth (state 0: REST with original static artwork untouched)
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
   * High-fidelity Male Teacher mouth rendering in mouthRig local space
   * Origin (0, 0) corresponds to mouth center (X_canvas=201.5, Y_canvas=319.0)
   * 
   * @param {number} mouthY - Normalized opening [0.0, 1.0]
   * @param {number} mouthForm - Form modulation [-1.0: narrow OO/OH, +1.0: wide EE/AA]
   * @param {boolean} isSpeaking - Whether speech animation is active
   */
  renderMouth(mouthY, mouthForm, isSpeaking) {
    if (!this.mouthCavity || !this.tongueGraphics) return;

    this.mouthCavity.clear();
    this.tongueGraphics.clear();
    if (this.mouthBorder) {
      this.mouthBorder.clear();
    }

    // ── 1. REST STATE (IDLE / CLOSED) ──
    // When mouth is at REST (mouthY < 0.05 or inactive):
    // Zero dynamic cavity, zero dynamic tongue, zero dynamic replacement mouth.
    // The canonical artwork's original resting smile remains 100% visible and un-obscured.
    if (mouthY < 0.05 || !isSpeaking) {
      return;
    }

    // 2a. Skin Concealment Patch (Face tone #F1C2A1)
    // Covers original baked closed resting smile line (X: 174..228, Y: 341..344)
    // Relative to mouthRig (+1.0, -49.0): X spans [-30, +30], Y spans [-5.5, +5.5]
    this.mouthCavity.beginFill(0xF1C2A1, 1.0);
    this.mouthCavity.drawRoundedRect(-30, -5.5, 60, 11, 2.5);
    this.mouthCavity.endFill();

    // 2b. Cavity Geometry Calculations (Proportional anime teacher articulation)
    // Width modulation: base half-width 21.0px, +3.5px on mouthY, +/-2.5px on mouthForm
    const formW = mouthForm * 2.5;
    const hw = 21.0 + (mouthY * 3.5) + formW;

    // Smile corner elevation: subtle upward tilt for articulate teacher expression
    const cornerLift = 0.8 + (mouthForm * 0.8);
    const cornerY = -1.0 - cornerLift;

    // Upper smile contour: apex lifts expressively with speech
    const upperY = -2.5 - (mouthY * 3.5) - (mouthForm * 0.5);
    const upperCtrlY = 2 * upperY - cornerY;

    // Lower contour: apex at lowerY drops expressively (proportional to Female Teacher)
    // Reaches ~18.5px drop at MAX opening, providing a clear, open anime mouth opening
    const openDrop = 1.5 + (mouthY * 17.0) - (Math.abs(mouthForm) * 1.0);
    const lowerY = openDrop;
    const lowerCtrlY = 2 * lowerY - cornerY;

    // 2c. Deep Burgundy Mouth Cavity Fill (#4A151B) without outer stroke
    this.mouthCavity.beginFill(0x4A151B, 1.0);
    this.mouthCavity.lineStyle(0);
    this.mouthCavity.moveTo(-hw, cornerY);
    this.mouthCavity.quadraticCurveTo(0, upperCtrlY, hw, cornerY);
    this.mouthCavity.quadraticCurveTo(0, lowerCtrlY, -hw, cornerY);
    this.mouthCavity.closePath();
    this.mouthCavity.endFill();

    // 2d. Tongue Layer: Inside cavity and touching bottom mouth edge (#DF747E)
    // Introduced at mouthY >= 0.28; touches lower mouth boundary with 0px bleeding
    if (mouthY >= 0.28) {
      const cavityHeight = lowerY - upperY;
      const tW = hw * 0.58;
      const ratio = tW / hw;
      const yTw = lowerY + (cornerY - lowerY) * (ratio * ratio);
      const tH = cavityHeight * 0.46;
      const tTop = lowerY - tH;
      const tTopCtrl = 2 * tTop - yTw;
      const tBotCtrl = 2 * lowerY - yTw;

      this.tongueGraphics.beginFill(0xDF747E, 1.0);
      this.tongueGraphics.lineStyle(0);
      this.tongueGraphics.moveTo(-tW, yTw);
      this.tongueGraphics.quadraticCurveTo(0, tTopCtrl, tW, yTw);
      this.tongueGraphics.quadraticCurveTo(0, tBotCtrl, -tW, yTw);
      this.tongueGraphics.closePath();
      this.tongueGraphics.endFill();
    }

    // 2e. Dark Anime Mouth Border Outline (#26080B) drawn ON TOP of cavity & tongue
    const borderGfx = this.mouthBorder || this.mouthCavity;
    borderGfx.lineStyle(1.8, 0x26080B, 1.0);
    borderGfx.moveTo(-hw, cornerY);
    borderGfx.quadraticCurveTo(0, upperCtrlY, hw, cornerY);
    borderGfx.quadraticCurveTo(0, lowerCtrlY, -hw, cornerY);

    // Corner Smile Accent Marks
    borderGfx.lineStyle(1.2, 0x26080B, 0.75);
    borderGfx.moveTo(-hw - 0.5, cornerY + 0.5);
    borderGfx.lineTo(-hw + 0.5, cornerY - 0.5);
    borderGfx.moveTo(hw - 0.5, cornerY - 0.5);
    borderGfx.lineTo(hw + 0.5, cornerY + 0.5);

    // Lower Lip Crease Accent (tracks dynamically with jaw drop)
    const creaseY = Math.min(22.0, lowerY + 4.5);
    borderGfx.lineStyle(1.2, 0xB06E5E, 0.75);
    borderGfx.moveTo(-7, creaseY);
    borderGfx.lineTo(7, creaseY);
  }

  /**
   * Clean up PixiJS resources on unmount
   */
  destroy(options) {
    this._destroyed = true;
    this._isSpeaking = false;
    this._mouthY = 0;
    this._mouthForm = 0;
    if (typeof window !== 'undefined' && window.__maleTeacherPuppet === this) {
      delete window.__maleTeacherPuppet;
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
    if (this.mouthBorder) {
      try {
        this.mouthBorder.destroy(options);
      } catch (_) {}
      this.mouthBorder = null;
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

export default MaleTeacherPuppet;
