import * as PIXI from 'pixi.js';

/**
 * =========================================================================
 * PHASE N2 — NINJA HATTORI PRECISION CURLED MOUTH RIG
 * =========================================================================
 *
 * Canonical Artwork: public/models/avatar/NinjaHattori-Im.png
 * Native Image Dimensions: 2814 × 1536 px
 * Character Bounds: X = [1054, 1898], Y = [139, 1451] (845 × 1313 px)
 * Character Visual Center: (1476.5, 795.5)
 *
 * Mouth Geometry & Aperture:
 * - Left Curl Endpoint:   (1346.0, 552.5) [FIXED]
 * - Left Inner Trough:    (1368.0, 568.0) [DYNAMIC APERTURE LEFT ANCHOR]
 * - Center Smile Crest:   (1457.0, 554.0)
 * - Right Inner Trough:   (1541.0, 562.5) [DYNAMIC APERTURE RIGHT ANCHOR]
 * - Right Curl Endpoint:  (1585.0, 545.0) [FIXED]
 *
 * Fundamental Rule:
 * - Region A (X: 1346 → 1368): Left Curl = FIXED
 * - Region B (X: 1368 → 1541): Dynamic Aperture = OPENS
 * - Region C (X: 1541 → 1585): Right Curl = FIXED
 *
 * REST State:
 * At mouthY = 0, dynamic mouthRig is completely hidden (visible = false).
 * 100% of the canonical resting smile artwork is visible with 0.0px drift.
 *
 * Teeth & Tongue: NONE (0% visible, completely faithful to canonical art).
 */

// ── Native Dimensions & Visual Centroid ──────────────────────────────────────
export const NATIVE_CANVAS_WIDTH = 2814;
export const NATIVE_CANVAS_HEIGHT = 1536;
export const VISUAL_CENTER_X = 1476.5;
export const VISUAL_CENTER_Y = 795.5;

// ── Canonical Mouth Landmarks (Native Canvas Space) ──────────────────────────
export const MOUTH_LEFT_CURL_END = { x: 1346.0, y: 552.5 };
export const MOUTH_LEFT_TROUGH = { x: 1368.0, y: 568.0 };
export const MOUTH_CENTER_CREST = { x: 1457.0, y: 554.0 };
export const MOUTH_RIGHT_TROUGH = { x: 1541.0, y: 562.5 };
export const MOUTH_RIGHT_CURL_END = { x: 1585.0, y: 545.0 };

export const DYNAMIC_APERTURE_LEFT = 1368.0;
export const DYNAMIC_APERTURE_RIGHT = 1541.0;

// ── Local Coordinates (Relative to Visual Center Anchor) ─────────────────────
export const LOCAL_LEFT_CURL_END = {
  x: MOUTH_LEFT_CURL_END.x - VISUAL_CENTER_X, // -130.5
  y: MOUTH_LEFT_CURL_END.y - VISUAL_CENTER_Y, // -243.0
};
export const LOCAL_LEFT_TROUGH = {
  x: MOUTH_LEFT_TROUGH.x - VISUAL_CENTER_X, // -108.5
  y: MOUTH_LEFT_TROUGH.y - VISUAL_CENTER_Y, // -227.5
};
export const LOCAL_CENTER_CREST = {
  x: MOUTH_CENTER_CREST.x - VISUAL_CENTER_X, // -19.5
  y: MOUTH_CENTER_CREST.y - VISUAL_CENTER_Y, // -241.5
};
export const LOCAL_RIGHT_TROUGH = {
  x: MOUTH_RIGHT_TROUGH.x - VISUAL_CENTER_X, // +64.5
  y: MOUTH_RIGHT_TROUGH.y - VISUAL_CENTER_Y, // -233.0
};
export const LOCAL_RIGHT_CURL_END = {
  x: MOUTH_RIGHT_CURL_END.x - VISUAL_CENTER_X, // +108.5
  y: MOUTH_RIGHT_CURL_END.y - VISUAL_CENTER_Y, // -250.5
};

// ── N2 Controlled Opening States ─────────────────────────────────────────────
export const N2_STATES = {
  0: 0.00, // REST
  1: 0.20, // SLIGHT (~8px aperture drop)
  2: 0.45, // MEDIUM (~18px aperture drop)
  3: 0.72, // LARGE  (~29px aperture drop)
  4: 1.00, // MAX    (~40px aperture drop, 51px safe margin above chin)
};

/**
 * Upper smile line interpolation across the dynamic aperture.
 * Matches canonical asymmetric profile between Left Trough and Right Trough.
 */
export function getSmileY(x) {
  if (x <= LOCAL_CENTER_CREST.x) {
    const t = Math.max(0.0, Math.min(1.0, (x - LOCAL_LEFT_TROUGH.x) / (LOCAL_CENTER_CREST.x - LOCAL_LEFT_TROUGH.x)));
    const yc = -233.0;
    return (1 - t) * (1 - t) * LOCAL_LEFT_TROUGH.y + 2 * (1 - t) * t * yc + t * t * LOCAL_CENTER_CREST.y;
  } else {
    const t = Math.max(0.0, Math.min(1.0, (x - LOCAL_CENTER_CREST.x) / (LOCAL_RIGHT_TROUGH.x - LOCAL_CENTER_CREST.x)));
    const yc = -237.5;
    return (1 - t) * (1 - t) * LOCAL_CENTER_CREST.y + 2 * (1 - t) * t * yc + t * t * LOCAL_RIGHT_TROUGH.y;
  }
}

/**
 * Lower boundary curve of the dynamic aperture.
 * Tapers smoothly to 0 at Left Trough (-108.5) and Right Trough (+64.5).
 * Modulated by mouthForm in [-1, +1].
 */
export function getLowerY(x, m, form = 0.0) {
  const ySmile = getSmileY(x);
  if (m <= 0.0) return ySmile;

  const xMin = LOCAL_LEFT_TROUGH.x;   // -108.5
  const xMax = LOCAL_RIGHT_TROUGH.x;  // +64.5
  const xMid = LOCAL_CENTER_CREST.x;  // -19.5

  if (x < xMin || x > xMax) return ySmile;

  const t = x <= xMid
    ? (x - xMin) / (xMid - xMin)
    : (xMax - x) / (xMax - xMid);

  // Smooth sinusoidal envelope with natural curvature
  const envelope = Math.pow(Math.sin(t * (Math.PI / 2.0)), 1.4);
  const depthMod = 1.0 - form * 0.12;
  const maxDrop = 40.0 * depthMod;

  return ySmile + m * maxDrop * envelope;
}

/**
 * Maps incoming normalized mouthY (0.0 to 1.0) continuously through the 5 animation landmarks.
 * Clamps strictly at 1.00 (maximum safe ceiling).
 */
export function mapMouthYToLandmarks(y) {
  const clampedY = Math.max(0.0, Math.min(1.0, Number(y) || 0.0));
  if (clampedY <= 0.03) {
    return 0.0;
  }
  if (clampedY <= 0.25) {
    const t = (clampedY - 0.03) / 0.22;
    return t * 0.20;
  }
  if (clampedY <= 0.50) {
    const t = (clampedY - 0.25) / 0.25;
    return 0.20 + t * (0.45 - 0.20);
  }
  if (clampedY <= 0.75) {
    const t = (clampedY - 0.50) / 0.25;
    return 0.45 + t * (0.72 - 0.45);
  }
  const t = (clampedY - 0.75) / 0.25;
  return 0.72 + t * (1.00 - 0.72);
}

// ── Background Processing & Texture Cache ─────────────────────────────────────
let cachedNinjaHattoriCanvas = null;
let cachedNinjaHattoriTexture = null;
let isGeneratingTexture = false;
const textureWaiters = [];

export function getNinjaHattoriTexture(onReady) {
  if (cachedNinjaHattoriTexture && cachedNinjaHattoriTexture.baseTexture && !cachedNinjaHattoriTexture.baseTexture.destroyed) {
    if (onReady) onReady(cachedNinjaHattoriTexture);
    return cachedNinjaHattoriTexture;
  }

  if (cachedNinjaHattoriCanvas) {
    try {
      cachedNinjaHattoriTexture = PIXI.Texture.from(cachedNinjaHattoriCanvas);
      if (onReady) onReady(cachedNinjaHattoriTexture);
      return cachedNinjaHattoriTexture;
    } catch (_) {}
  }

  if (onReady) textureWaiters.push(onReady);

  if (!isGeneratingTexture && typeof window !== 'undefined') {
    isGeneratingTexture = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/models/avatar/NinjaHattori-Im.png';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 2814;
        canvas.height = img.height || 1536;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Contiguous BFS flood fill starting strictly from outer canvas borders
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const w = canvas.width;
        const h = canvas.height;
        const totalPixels = w * h;

        const visited = new Uint8Array(totalPixels);
        const queue = new Int32Array(totalPixels);
        let head = 0;
        let tail = 0;

        // Tolerance: Outer boundary background pixels have R > 238, G > 238, B > 238
        const isWhite = (idx) => data[idx] > 238 && data[idx + 1] > 238 && data[idx + 2] > 238;

        // Top and bottom boundary rows
        for (let x = 0; x < w; x++) {
          const topIdx = (0 * w + x) * 4;
          if (isWhite(topIdx)) {
            visited[0 * w + x] = 1;
            queue[tail++] = 0 * w + x;
          }
          const botIdx = ((h - 1) * w + x) * 4;
          if (isWhite(botIdx)) {
            visited[(h - 1) * w + x] = 1;
            queue[tail++] = (h - 1) * w + x;
          }
        }

        // Left and right boundary columns
        for (let y = 0; y < h; y++) {
          const leftIdx = (y * w + 0) * 4;
          if (!visited[y * w + 0] && isWhite(leftIdx)) {
            visited[y * w + 0] = 1;
            queue[tail++] = y * w + 0;
          }
          const rightIdx = (y * w + (w - 1)) * 4;
          if (!visited[y * w + (w - 1)] && isWhite(rightIdx)) {
            visited[y * w + (w - 1)] = 1;
            queue[tail++] = y * w + (w - 1);
          }
        }

        // Fast contiguous BFS loop
        while (head < tail) {
          const p = queue[head++];
          const cy = Math.floor(p / w);
          const cx = p % w;
          data[p * 4 + 3] = 0; // Set Alpha to 0

          if (cy > 0) {
            const up = (cy - 1) * w + cx;
            if (!visited[up] && isWhite(up * 4)) {
              visited[up] = 1;
              queue[tail++] = up;
            }
          }
          if (cy < h - 1) {
            const down = (cy + 1) * w + cx;
            if (!visited[down] && isWhite(down * 4)) {
              visited[down] = 1;
              queue[tail++] = down;
            }
          }
          if (cx > 0) {
            const left = cy * w + (cx - 1);
            if (!visited[left] && isWhite(left * 4)) {
              visited[left] = 1;
              queue[tail++] = left;
            }
          }
          if (cx < w - 1) {
            const right = cy * w + (cx + 1);
            if (!visited[right] && isWhite(right * 4)) {
              visited[right] = 1;
              queue[tail++] = right;
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        cachedNinjaHattoriCanvas = canvas;
        cachedNinjaHattoriTexture = PIXI.Texture.from(canvas);
      } catch (err) {
        console.warn('[NinjaHattoriPuppet] Runtime transparency processing fallback:', err);
        cachedNinjaHattoriTexture = PIXI.Texture.from('/models/avatar/NinjaHattori-Im.png');
      }

      isGeneratingTexture = false;
      while (textureWaiters.length > 0) {
        const cb = textureWaiters.shift();
        if (typeof cb === 'function') cb(cachedNinjaHattoriTexture);
      }
    };

    img.onerror = () => {
      cachedNinjaHattoriTexture = PIXI.Texture.from('/models/avatar/NinjaHattori-Im.png');
      isGeneratingTexture = false;
      while (textureWaiters.length > 0) {
        const cb = textureWaiters.shift();
        if (typeof cb === 'function') cb(cachedNinjaHattoriTexture);
      }
    };
  }

  return cachedNinjaHattoriTexture || (typeof window !== 'undefined' && typeof window.Image !== 'undefined' ? PIXI.Texture.from('/models/avatar/NinjaHattori-Im.png') : PIXI.Texture.EMPTY);
}

export class NinjaHattoriPuppet extends PIXI.Container {
  constructor() {
    super();

    this.name = 'NinjaHattoriPuppet';
    this.isNinjaHattoriPuppet = true;

    // Speech & Lip-Sync State Contract (consumed by useLipSync.js in N3)
    this._mouthY = 0.0;
    this._mouthForm = 0.0;
    this._isSpeaking = false;

    // Animation interpolation state
    this.targetMouthOpen = 0.0;
    this.targetMouthForm = 0.0;
    this.currentMouthOpen = 0.0;
    this.currentMouthForm = 0.0;
    this.debugHoldState = null;
    this.debugHoldForm = 0.0;

    // Development preview hook
    if (typeof window !== 'undefined') {
      window.__ninjaHattoriPuppet = this;
    }

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
    this._isSpeaking = Boolean(val);
  }

  initRig() {
    this.rootContainer = new PIXI.Container();
    this.addChild(this.rootContainer);

    // Uniformly scaled content container so character is framed stably
    // Character bounds are 845 × 1313 px. Scale 0.20 maps it to 169 × 262.6 px, matching 220 × 270 puppet reference box.
    this.contentContainer = new PIXI.Container();
    this.contentContainer.scale.set(0.20);
    this.rootContainer.addChild(this.contentContainer);

    // 1. Base Canonical Ninja Hattori Sprite
    const initialTexture = getNinjaHattoriTexture((readyTexture) => {
      if (this.sprite && readyTexture) {
        this.sprite.texture = readyTexture;
      }
    });

    this.sprite = new PIXI.Sprite(initialTexture);
    // Anchor set at character visual center: X=1476.5, Y=795.5 (native 2814 × 1536 canvas)
    this.sprite.anchor.set(VISUAL_CENTER_X / NATIVE_CANVAS_WIDTH, VISUAL_CENTER_Y / NATIVE_CANVAS_HEIGHT);
    this.sprite.position.set(0, 0);
    this.contentContainer.addChild(this.sprite);

    // 2. Procedural Mouth Rig Container (shares origin (0, 0) with sprite center)
    this.mouthRig = new PIXI.Container();
    this.mouthRig.position.set(0, 0);
    this.contentContainer.addChild(this.mouthRig);

    // Dynamic warm burgundy mouth cavity (#3B1219) with dark contour (#200808)
    this.mouthCavity = new PIXI.Graphics();
    this.mouthRig.addChild(this.mouthCavity);

    // Initial render at REST (completely hidden)
    this.renderControlledMouth(0.0, 0.0);
  }

  /**
   * Puppet contract methods for speech lip-sync integration
   */
  setMouthOpen(yVal, formVal) {
    this.mouthY = yVal;
    if (formVal !== undefined) this.mouthForm = formVal;
    this.debugHoldState = null;

    const clampedY = Math.max(0.0, Math.min(1.0, typeof yVal === 'number' ? yVal : 0.0));
    const clampedForm = Math.max(-1.0, Math.min(1.0, typeof formVal === 'number' ? formVal : 0.0));

    this.targetMouthOpen = this.isSpeaking ? mapMouthYToLandmarks(clampedY) : 0.0;
    this.targetMouthForm = clampedForm;

    if (clampedY === 0 || !this.isSpeaking) {
      if (this.currentMouthOpen < 0.06) {
        this.currentMouthOpen = 0.0;
        this.renderControlledMouth(0.0, 0.0);
      }
    }
  }

  setSpeaking(isSpeaking) {
    this.isSpeaking = Boolean(isSpeaking);
    if (!this.isSpeaking && this.debugHoldState === null) {
      this.mouthY = 0;
      this.targetMouthOpen = 0.0;
      this.targetMouthForm = 0.0;
      this.currentMouthOpen = 0.0;
      this.currentMouthForm = 0.0;
      this.renderControlledMouth(0.0, 0.0);
    }
  }

  /**
   * Development preview control: hold one of the 5 controlled states (0..4) and optional form (-1..+1)
   * or pass null to resume live input.
   */
  setPreviewState(stateIndex, formVal = 0.0) {
    if (stateIndex === null || stateIndex === undefined) {
      this.debugHoldState = null;
      this.debugHoldForm = 0.0;
      this.targetMouthOpen = this.isSpeaking ? mapMouthYToLandmarks(this.mouthY) : 0.0;
      this.targetMouthForm = this.mouthForm;
      return;
    }
    const idx = Number(stateIndex);
    if (N2_STATES[idx] !== undefined) {
      this.debugHoldState = idx;
      this.debugHoldForm = Math.max(-1.0, Math.min(1.0, Number(formVal) || 0.0));
      this.targetMouthOpen = N2_STATES[idx];
      this.targetMouthForm = this.debugHoldForm;
    }
  }

  /**
   * Update loop: smoothly interpolates current mouth open and form toward targets.
   * Rock-solid static stability when idle or at REST.
   */
  update(_timeMs) {
    let targetOpen = this.targetMouthOpen;
    let targetForm = this.targetMouthForm;

    if (this.debugHoldState !== null) {
      targetOpen = N2_STATES[this.debugHoldState] ?? 0.0;
      targetForm = this.debugHoldForm ?? 0.0;
    } else if (!this.isSpeaking) {
      targetOpen = 0.0;
      targetForm = 0.0;
    }

    // Smooth lerp (fast attack on opening, natural release on closing)
    const isOpening = targetOpen > this.currentMouthOpen;
    const lerpRate = this.isSpeaking ? (isOpening ? 0.55 : 0.45) : 0.50;
    this.currentMouthOpen += (targetOpen - this.currentMouthOpen) * lerpRate;
    this.currentMouthForm += (targetForm - this.currentMouthForm) * 0.35;

    // Hard REST clamp when effectively closed to prevent micro-jitter
    if (!this.isSpeaking || targetOpen === 0.0) {
      if (this.debugHoldState === null && this.currentMouthOpen < 0.04) {
        this.currentMouthOpen = 0.0;
        this.currentMouthForm = 0.0;
      }
    }

    this.renderControlledMouth(this.currentMouthOpen, this.currentMouthForm);
  }

  /**
   * Canonical Dynamic Mouth Rig Renderer
   *
   * @param {number} mouthOpen - Normalized opening in [0.00, 1.00]
   * @param {number} mouthForm - Horizontal shape articulation in [-1.00, +1.00]
   */
  renderControlledMouth(mouthOpen, mouthForm = 0.0) {
    if (!this.mouthCavity || !this.mouthRig) return;

    // State 0: REST (mouthOpen <= 0.005)
    // Dynamic mouth graphics completely invisible; 100% canonical resting artwork visible
    if (mouthOpen <= 0.005) {
      this.mouthRig.visible = false;
      this.mouthCavity.clear();
      return;
    }

    this.mouthRig.visible = true;
    this.mouthCavity.clear();

    const m = Math.max(0.0, Math.min(1.0, mouthOpen));
    const form = Math.max(-1.0, Math.min(1.0, Number(mouthForm) || 0.0));

    // Deep warm burgundy cavity fill (#3B1219) with dark contour (#200808)
    const g = this.mouthCavity;
    g.lineStyle(2.5, 0x200808, 1.0);
    g.beginFill(0x3B1219, 1.0);

    const steps = 36;
    const xMin = LOCAL_LEFT_TROUGH.x;   // -108.5
    const xMax = LOCAL_RIGHT_TROUGH.x;  // +64.5

    // 1. Upper boundary from left trough to right trough (following canonical smile line)
    g.moveTo(xMin, getSmileY(xMin));
    for (let i = 1; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      g.lineTo(x, getSmileY(x));
    }

    // 2. Lower boundary from right trough to left trough (opening smoothly downward)
    for (let i = steps; i >= 0; i--) {
      const x = xMin + (i / steps) * (xMax - xMin);
      g.lineTo(x, getLowerY(x, m, form));
    }

    g.closePath();
    g.endFill();
  }

  destroy(options) {
    if (typeof window !== 'undefined' && window.__ninjaHattoriPuppet === this) {
      delete window.__ninjaHattoriPuppet;
    }
    if (this.mouthCavity) {
      try { this.mouthCavity.destroy({ children: true }); } catch (_) {}
      this.mouthCavity = null;
    }
    if (this.mouthRig) {
      try { this.mouthRig.destroy({ children: true }); } catch (_) {}
      this.mouthRig = null;
    }
    super.destroy(options);
  }
}
