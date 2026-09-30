import * as PIXI from 'pixi.js';

/**
 * 2D Doraemon Mascot Rig with Dynamic Phonetic Mouth Renderer
 * Preserves the canonical Doraemon.jpg image pixel-identically while animating
 * the mouth using a high-fidelity PIXI.Graphics overlay for real-time lip-sync.
 */
export class DoraemonPuppet extends PIXI.Container {
  constructor() {
    super();
    this.name = 'DoraemonPuppet';
    this.isDoraemonPuppet = true;

    // Speech & Lip-Sync State
    this._mouthY = 0;
    this.smoothMouthY = 0;
    this._mouthForm = 0;
    this._isSpeaking = false;
    this.debugOverride = false;
    this.currentMood = 'neutral';
    this.isHappy = true;

    // Gaze & Eye-Tracking State (kept for compatibility)
    this.lookX = 0;
    this.lookY = 0;
    this.targetLookX = 0;
    this.targetLookY = 0;

    // Render Cache State (avoid unnecessary redraws)
    this.lastRenderedMouthY = -1;
    this.lastRenderedMouthForm = -1;
    this.lastRenderedSpeakingState = null;

    this.initRig();
  }

  get mouthY() {
    return this._mouthY || 0;
  }
  set mouthY(val) {
    if (this.debugOverride) return;
    this._mouthY = Math.max(0, Math.min(1.0, Number(val) || 0));
  }

  get mouthForm() {
    return this._mouthForm || 0;
  }
  set mouthForm(val) {
    if (this.debugOverride) return;
    this._mouthForm = Math.max(-1.0, Math.min(1.0, Number(val) || 0));
  }

  get isSpeaking() {
    return this._isSpeaking || false;
  }
  set isSpeaking(val) {
    const boolVal = Boolean(val);
    if (boolVal) {
      this.debugOverride = false;
    } else if (this.debugOverride) {
      return;
    }
    this._isSpeaking = boolVal;
  }

  initRig() {
    this.rootContainer = new PIXI.Container();
    this.addChild(this.rootContainer);

    // 1. Base Canonical Doraemon Image
    this.sprite = PIXI.Sprite.from('/models/avatar/Doraemon.jpg');
    this.sprite.anchor.set(0.5, 0.5);

    // Scale down to match procedural puppet standard size (~200px)
    this.sprite.scale.set(0.2);
    this.rootContainer.addChild(this.sprite);

    // 2. Dynamic Mouth Container (inherits identical 0.2 scale & coordinate origin)
    this.mouthContainer = new PIXI.Container();
    this.mouthContainer.scale.set(0.2);
    this.rootContainer.addChild(this.mouthContainer);

    // 3. PIXI.Graphics Mouth Overlay (allocated once, cleared/redrawn as needed)
    this.mouthGfx = new PIXI.Graphics();
    this.mouthGfx.position.set(-627, -627);
    this.mouthContainer.addChild(this.mouthGfx);

    // Initial render in closed resting state
    this.renderMouth();

    // Debug Hook for development testing (console verification)
    if (typeof window !== 'undefined') {
      window.__speakmate_doraemon_debug = (y = 0.5, form = 0.0) => {
        if (y === null || y === undefined) {
          this.debugOverride = false;
          this._isSpeaking = false;
          this._mouthY = 0;
          this.smoothMouthY = 0;
          this._mouthForm = 0;
          this.renderMouth();
          console.log('[DoraemonPuppet Debug] Debug override cleared');
          return;
        }
        this.debugOverride = true;
        this._mouthY = Math.max(0, Math.min(1.0, y));
        this.smoothMouthY = this._mouthY;
        this._mouthForm = Math.max(-1.0, Math.min(1.0, form));
        this._isSpeaking = this._mouthY >= 0.08;
        this.renderMouth();
        console.log(`[DoraemonPuppet Debug] mouthY=${y}, mouthForm=${form}, isSpeaking=${this._isSpeaking}`);
      };

      this.checkHashDebug = () => {
        const hash = window.location.hash || '';
        const search = window.location.search || '';
        const match = hash.match(/debug=([0-9.-]+)(?:,([0-9.-]+))?/) || search.match(/[?&]mY=([0-9.-]+)(?:&mForm=([0-9.-]+))?/);
        if (match) {
          const y = parseFloat(match[1]);
          const form = match[2] !== undefined ? parseFloat(match[2]) : 0.0;
          window.__speakmate_doraemon_debug(y, form);
        } else if (hash.includes('debug=clear') || hash.includes('debug=null')) {
          window.__speakmate_doraemon_debug(null);
        }
      };

      this.handleWindowMessage = (event) => {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (data && data.type === 'DORAEMON_DEBUG') {
            window.__speakmate_doraemon_debug(data.y, data.form);
          }
        } catch (_) {}
      };

      window.addEventListener('hashchange', this.checkHashDebug);
      window.addEventListener('message', this.handleWindowMessage);
      this.checkHashDebug();
    }
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
    if ((y === 0 || !this.isSpeaking) && this.smoothMouthY < 0.08) {
      this.smoothMouthY = 0;
      this.renderMouth();
    }
  }

  setSpeaking(speaking) {
    this.isSpeaking = Boolean(speaking);
    if (!this.isSpeaking && !this.debugOverride) {
      this.mouthY = 0;
      this.smoothMouthY = 0;
      this.mouthForm = 0;
      this.renderMouth();
    }
  }

  setLookTarget(x, y) {
    this.targetLookX = Math.max(-1, Math.min(1, x));
    this.targetLookY = Math.max(-1, Math.min(1, y));
  }

  /**
   * Phase R2: Dynamic Cartoon Lip-Sync Renderer
   * State 0: Resting (mouthY < 0.08 || !isSpeaking) -> Exact validated R1 closed smile
   * States 1-4: Dynamic cartoon cavity articulating with mouthY and mouthForm
   * Muzzle concealment patch is ALWAYS active as base layer (never reveals baked mouth)
   */
  renderMouth() {
    if (!this.mouthGfx) return;

    const mg = this.mouthGfx;
    mg.clear();

    const mY = Math.max(0, Math.min(1.0, this.smoothMouthY));
    const mForm = Math.max(-1.0, Math.min(1.0, this.mouthForm));
    const isSpk = Boolean(this.debugOverride || (this.isSpeaking && mY >= 0.08));

    this.lastRenderedMouthY = mY;
    this.lastRenderedMouthForm = mForm;
    this.lastRenderedSpeakingState = isSpk;

    // Landmark coordinates in canonical unscaled space (1254 x 1254)
    // Sprite anchor is (627, 627), and this.mouthGfx is positioned at (-627, -627) inside this.mouthContainer
    // guaranteeing that canonical image pixel (X, Y) maps 1:1 to mouthGfx coordinates (X, Y)
    const cx = 626.5;             // Center of philtrum line in canonical image
    const strokeColor = 0x0F172A; // Classic dark ink outline matching artwork
    const skinColor = 0xF2F5FB;   // Sampled median white muzzle color (within #EFF0F5..#F3F6FB range)
    const strokeWidth = 5.0;      // ~5-6px visual line weight at native 1254px resolution

    // ── 1. Muzzle Skin Concealment Patch (ALWAYS drawn first, concealing baked mouth) ──
    // Seamlessly and completely conceals the baked open mouth in Doraemon.jpg
    // (verified 53,758 pixels across X: 434..811, Y: 423..609).
    // Safely terminates above the red collar (collar starts at Y >= 644, Y=662 at center)
    // and stays well clear of cheeks, whiskers (Y=380), eyes, and nose.
    mg.beginFill(skinColor);
    mg.lineStyle(0);
    mg.moveTo(420, 460);
    mg.lineTo(480, 432);
    mg.lineTo(550, 418);
    mg.lineTo(cx, 415);
    mg.lineTo(703, 418);
    mg.lineTo(773, 432);
    mg.lineTo(825, 460);
    mg.lineTo(812, 515);
    mg.lineTo(765, 570);
    mg.lineTo(700, 608);
    mg.lineTo(cx, 620);
    mg.lineTo(553, 608);
    mg.lineTo(488, 570);
    mg.lineTo(441, 515);
    mg.closePath();
    mg.endFill();

    if (!isSpk) {
      // ── STATE 0: RESTING (Exact validated R1 closed smile) ──
      const halfW = 145.0;           // Smile half-width (X: 481.5 to 771.5)
      const cornerY = 475.0;         // Smile endpoints Y position
      const dip = 38.0;              // Smile downward curvature depth
      const bottomY = cornerY + dip; // Smile center lowest point (Y = 513.0)

      // Philtrum extension line connecting from intact nose philtrum down to resting smile
      mg.lineStyle(strokeWidth, strokeColor, 1.0);
      mg.moveTo(cx, 415);
      mg.lineTo(cx, bottomY);

      // Symmetrical quadratic Bézier curve centered on the philtrum
      mg.moveTo(cx - halfW, cornerY);
      mg.quadraticCurveTo(cx, cornerY + 2 * dip, cx + halfW, cornerY);
    } else {
      // ── DYNAMIC CARTOON MOUTH ARTICULATION (States 1 through 4) ──
      const ty = Math.max(0.0, Math.min(1.0, (mY - 0.08) / 0.92));

      // Dynamic geometry dimensions responding to mouthY and mouthForm
      const roundBoost = Math.max(0.0, -mForm) * 14.0 * ty;
      const openH = 10.0 + (ty * 85.0) + roundBoost;
      const formScale = 1.0 + (mForm * 0.30);
      const halfW = Math.max(38.0, Math.min(140.0, (55.0 + (ty * 55.0)) * formScale));

      const topLipY = 475.0 - (ty * 14.0);
      const bottomY = topLipY + openH;
      const cornerY = topLipY + 3.0 - (mForm * 5.0 * ty);
      const topCenterY = topLipY - (ty * 2.0) - Math.max(0.0, -mForm) * 3.0 * ty;

      const leftX = cx - halfW;
      const rightX = cx + halfW;

      // Control points for smooth quadratic Bézier curves
      const botCpY = 2.0 * bottomY - cornerY;
      const topCpY = 2.0 * topCenterY - cornerY;

      // 2a. Philtrum connection down to top lip center
      mg.lineStyle(strokeWidth, strokeColor, 1.0);
      mg.moveTo(cx, 415);
      mg.lineTo(cx, topCenterY);

      // 2b. Dark Crimson Oral Cavity Fill (#991B2B)
      mg.beginFill(0x991B2B);
      mg.lineStyle(0);
      mg.moveTo(leftX, cornerY);
      mg.quadraticCurveTo(cx, topCpY, rightX, cornerY);
      mg.quadraticCurveTo(cx, botCpY, leftX, cornerY);
      mg.closePath();
      mg.endFill();

      // 2c. Warm Pink Tongue (#F47662 with #D64E40 crease, progressively revealed inside cavity)
      if (mY >= 0.25 && openH > 18.0) {
        const tngProgress = Math.min(1.0, (mY - 0.25) / 0.55);
        const tngH = Math.min(22.0, (openH * 0.30) * tngProgress);
        const tngW = halfW * (0.30 + 0.14 * tngProgress);
        const tngBotY = bottomY - 9.0;
        const tngTopY = tngBotY - tngH;
        const tngCornerY = tngBotY - (tngH * 0.45);

        const tngTopCpY = 2.0 * tngTopY - tngCornerY;
        const tngBotCpY = 2.0 * tngBotY - tngCornerY;

        mg.beginFill(0xF47662);
        mg.lineStyle(0);
        mg.moveTo(cx - tngW, tngCornerY);
        mg.quadraticCurveTo(cx, tngTopCpY, cx + tngW, tngCornerY);
        mg.quadraticCurveTo(cx, tngBotCpY, cx - tngW, tngCornerY);
        mg.closePath();
        mg.endFill();

        if (tngProgress > 0.45 && tngH > 9.0) {
          mg.lineStyle(1.8, 0xD64E40, 0.75);
          mg.moveTo(cx, tngTopY + 2.0);
          mg.lineTo(cx, tngBotY - 2.0);
        }
      }

      // 2e. Clean Dark Outer Border Stroke
      mg.lineStyle(strokeWidth, strokeColor, 1.0);
      mg.moveTo(leftX, cornerY);
      mg.quadraticCurveTo(cx, topCpY, rightX, cornerY);
      mg.quadraticCurveTo(cx, botCpY, leftX, cornerY);
    }
  }

  update(now = performance.now()) {
    const t = now * 0.001;

    // Gentle Breathing Hover Effect (preserved exactly)
    const hoverY = Math.sin(t * 2.0) * 3.0;
    this.rootContainer.y = hoverY;

    // Smooth mouth interpolation when speech starts/stops or during speech
    const active = Boolean(this.debugOverride || (this.isSpeaking && this.mouthY >= 0.05));
    const targetY = active ? this.mouthY : 0.0;
    const targetForm = active ? this.mouthForm : 0.0;

    // Quick, responsive approach
    const deltaY = targetY - this.smoothMouthY;
    if (Math.abs(deltaY) > 0.001) {
      this.smoothMouthY += deltaY * 0.45;
    } else {
      this.smoothMouthY = targetY;
    }

    if (!active && this.smoothMouthY < 0.08) {
      this.smoothMouthY = 0;
    }

    const mY = Math.max(0, Math.min(1.0, this.smoothMouthY));
    const mForm = Math.max(-1.0, Math.min(1.0, targetForm));
    const isSpk = Boolean(this.debugOverride || (this.isSpeaking && mY >= 0.08));

    const stateChanged =
      Math.abs(mY - this.lastRenderedMouthY) > 0.004 ||
      Math.abs(mForm - this.lastRenderedMouthForm) > 0.01 ||
      isSpk !== this.lastRenderedSpeakingState;

    if (stateChanged) {
      this.renderMouth();
    }
  }

  destroy(options) {
    if (typeof window !== 'undefined') {
      if (this.checkHashDebug) {
        window.removeEventListener('hashchange', this.checkHashDebug);
      }
      if (this.handleWindowMessage) {
        window.removeEventListener('message', this.handleWindowMessage);
      }
      if (window.__speakmate_doraemon_debug) {
        delete window.__speakmate_doraemon_debug;
      }
    }
    if (this.mouthGfx) {
      try { this.mouthGfx.destroy(true); } catch (_) {}
      this.mouthGfx = null;
    }
    if (this.mouthContainer) {
      try { this.mouthContainer.destroy({ children: true }); } catch (_) {}
      this.mouthContainer = null;
    }
    super.destroy(options);
  }
}

