import * as PIXI from 'pixi.js';

/**
 * =========================================================================
 * PHASE T2.1 — TOM PRECISION CARTOON MOUTH RIG (CORRECTED GEOMETRY)
 * =========================================================================
 *
 * Canonical Artwork: public/models/avatar/Tommy-Im.png
 * Native Canvas Dimensions: 2816 × 1536 px
 * Overall Character Bounds: X = [900, 1888], Y = [103, 1508] (988 × 1405 px)
 * Core Body Bounds: X = [1087, 1809], Y = [104, 1481]
 * Head Bounds: X = [1143, 1685], Y = [103, 550]
 * Character Visual Center: (1394.0, 805.5)
 *
 * Authoritative Face Landmarks (Native Canvas Coordinates):
 * - Nose Bounds: X in [1370, 1435], Y in [350, 400]
 * - Philtrum: (1400, 400) -> (1399, 423)
 * - Upper smile crest: (1399, 423)
 * - Left whisker pad pouch apex: (1376, 435)
 * - Right whisker pad pouch apex: (1423, 435)
 * - Resting closed smile seam: X in [1376, 1434], Y in [446, 457]
 * - Muzzle / whisker pad region: X in [1310, 1490], Y in [410, 508]
 * - Chin bottom: (1396, 507)
 *
 * Phase T2.1 Reference-Driven Reconstruction:
 * - Reference #1 establishes that the canonical resting smile is resting facial ink,
 *   NOT the complete dynamic mouth.
 * - The dynamic oral cavity is reconstructed as an expressive cartoon mouth inside
 *   the muzzle, beneath the whisker pad lobes and above the chin.
 * - At MAX opening: Width ~110 px (X: 1350..1460), Depth ~50 px (Y: 433..494).
 * - Chin clearance >= 13.0 px; Nose clearance >= 33.0 px; Philtrum clearance >= 10.0 px.
 * - Upper boundary follows dual-lobe curve under whisker pad pouches.
 * - Lower boundary forms a smooth, natural cartoon jaw curve.
 * - Gentle rounded cartoon tongue sitting in lower 38% of cavity (active for m >= 0.35).
 * - Teeth: 0 (canonical Tom does not have a human tooth row).
 * - REST state (m <= 0.005) completely hides mouthRig, preserving 100% resting canonical artwork.
 * - Smooth lerp interpolation for organic mouth movement without jitter.
 */

// ── Native Dimensions & Visual Centroid ──────────────────────────────────────
export const NATIVE_CANVAS_WIDTH = 2816;
export const NATIVE_CANVAS_HEIGHT = 1536;
export const VISUAL_CENTER_X = 1394.0;
export const VISUAL_CENTER_Y = 805.5;

// ── Character Bounds ─────────────────────────────────────────────────────────
export const CHARACTER_BOUNDS = {
  minX: 900,
  maxX: 1888,
  minY: 103,
  maxY: 1508,
};

export const CORE_BODY_BOUNDS = {
  minX: 1087,
  maxX: 1809,
  minY: 104,
  maxY: 1481,
};

export const HEAD_BOUNDS = {
  minX: 1143,
  maxX: 1685,
  minY: 103,
  maxY: 550,
};

// ── Canonical Face Landmarks (Native Canvas Space) ───────────────────────────
export const NOSE_LANDMARKS = {
  minX: 1370,
  maxX: 1435,
  minY: 350,
  maxY: 400,
};

export const PHILTRUM_START = { x: 1400.0, y: 400.0 };
export const PHILTRUM_END = { x: 1399.0, y: 423.0 };
export const LEFT_WHISKER_PAD_APEX = { x: 1376.0, y: 435.0 };
export const UPPER_SMILE_CREST = { x: 1399.0, y: 423.0 };
export const RIGHT_WHISKER_PAD_APEX = { x: 1423.0, y: 435.0 };
export const LEFT_MOUTH_CORNER = { x: 1376.0, y: 446.0 };
export const CENTER_SMILE_TROUGH = { x: 1405.0, y: 456.0 };
export const RIGHT_MOUTH_CORNER = { x: 1434.0, y: 446.0 };
export const LEFT_CHEEK_ANCHOR = { x: 1315.0, y: 438.0 };
export const RIGHT_CHEEK_ANCHOR = { x: 1485.0, y: 466.0 };
export const CHIN_BOTTOM = { x: 1396.0, y: 507.0 };

// ── T2.1 Precision Upper Black Line Landmarks (Native Canvas Space) ──────────
// Point 1 (Left end anchored directly to canonical upper black line where it joins cheek):
export const USER_LEFT_POINT = { x: 1324.0, y: 403.0 };
// Point 2 (Middle point at philtrum junction notch on canonical upper black line):
export const USER_MIDDLE_POINT = { x: 1400.0, y: 425.0 };
// Point 3 (Right end anchored directly to canonical upper black line where it joins cheek):
export const USER_RIGHT_POINT = { x: 1480.0, y: 405.0 };

// Dynamic safe envelope inside muzzle: X in [1320, 1484], Y in [400, 495]
export const DYNAMIC_MOUTH_SAFETY_REGION = {
  minX: 1320,
  maxX: 1484,
  minY: 400,
  maxY: 495,
};

// Max opening depth in native pixels (reaches Y = 484.0; chin clearance = 23.0 px)
export const MAX_MOUTH_OPENING_DEPTH = 50.0;

// Precomputed exact upper black line contour points in Local Space (relative to Visual Center: 1394.0, 805.5)
// Perfectly sticks to, touches, and follows the canonical black line across all 156 px (Native X: 1324..1480)
export const EXACT_UPPER_LINE_PTS = [
  { x: -70.00, y: -402.50 },
  { x: -67.00, y: -400.20 },
  { x: -64.00, y: -397.50 },
  { x: -61.00, y: -394.54 },
  { x: -58.00, y: -391.48 },
  { x: -55.00, y: -388.47 },
  { x: -52.00, y: -385.65 },
  { x: -49.00, y: -383.10 },
  { x: -46.00, y: -380.84 },
  { x: -43.00, y: -378.88 },
  { x: -40.00, y: -377.22 },
  { x: -37.00, y: -375.79 },
  { x: -34.00, y: -374.50 },
  { x: -31.00, y: -373.32 },
  { x: -28.00, y: -372.32 },
  { x: -25.00, y: -371.64 },
  { x: -22.00, y: -371.37 },
  { x: -19.00, y: -371.53 },
  { x: -16.00, y: -372.02 },
  { x: -13.00, y: -372.78 },
  { x: -10.00, y: -373.77 },
  { x:  -7.00, y: -375.00 },
  { x:  -4.00, y: -376.50 },
  { x:  -1.00, y: -378.21 },
  { x:   2.00, y: -379.70 },
  { x:   5.00, y: -380.49 },
  { x:   8.00, y: -380.10 },
  { x:  11.00, y: -378.69 },
  { x:  14.00, y: -376.78 },
  { x:  17.00, y: -374.91 },
  { x:  20.00, y: -373.39 },
  { x:  23.00, y: -372.26 },
  { x:  26.00, y: -371.50 },
  { x:  29.00, y: -371.10 },
  { x:  32.00, y: -371.06 },
  { x:  35.00, y: -371.34 },
  { x:  38.00, y: -371.92 },
  { x:  41.00, y: -372.76 },
  { x:  44.00, y: -373.77 },
  { x:  47.00, y: -374.87 },
  { x:  50.00, y: -376.02 },
  { x:  53.00, y: -377.23 },
  { x:  56.00, y: -378.50 },
  { x:  59.00, y: -379.86 },
  { x:  62.00, y: -381.32 },
  { x:  65.00, y: -382.93 },
  { x:  68.00, y: -384.71 },
  { x:  71.00, y: -386.69 },
  { x:  74.00, y: -388.89 },
  { x:  77.00, y: -391.35 },
  { x:  80.00, y: -394.09 },
  { x:  83.00, y: -397.13 },
  { x:  86.00, y: -400.50 },
];

// ── 5 Controlled Mouth States ────────────────────────────────────────────────
export const T2_STATES = {
  0: 0.00, // REST    (0 px opening depth, 100% canonical smile)
  1: 0.22, // SLIGHT  (~11.0 px depth, 156 px width, perfectly anchored to actual black line)
  2: 0.50, // MEDIUM  (~25.0 px depth, 156 px width, perfectly anchored to actual black line)
  3: 0.75, // LARGE   (~37.5 px depth, 156 px width, perfectly anchored to actual black line)
  4: 1.00, // MAX     (~50.0 px depth, 156 px width, perfectly anchored to actual black line)
};

/**
 * Maps incoming normalized mouthY (0.0 to 1.0) continuously through the 5 animation landmarks.
 */
export function mapMouthYToLandmarks(y) {
  const clampedY = Math.max(0.0, Math.min(1.0, Number(y) || 0.0));
  if (clampedY <= 0.04) return 0.0;
  if (clampedY <= 0.25) {
    const t = (clampedY - 0.04) / 0.21;
    return t * 0.22;
  }
  if (clampedY <= 0.55) {
    const t = (clampedY - 0.25) / 0.30;
    return 0.22 + t * (0.50 - 0.22);
  }
  if (clampedY <= 0.80) {
    const t = (clampedY - 0.55) / 0.25;
    return 0.50 + t * (0.75 - 0.50);
  }
  const t = (clampedY - 0.80) / 0.20;
  return 0.75 + t * (1.00 - 0.75);
}

// ── Background Processing & Texture Cache ─────────────────────────────────────
let cachedTomCanvas = null;
let cachedTomTexture = null;
let isGeneratingTexture = false;
const textureWaiters = [];

/**
 * Generates transparent texture for Tom by removing outer contiguous white background
 * at runtime via offscreen canvas, while strictly preserving internal whites:
 * muzzle, whisker pads, chest, belly, paws, arms, tail tip, feet, toes.
 * Also pre-clears the detached bottom-right watermark artifact (X: 2350..2816, Y: 950..1536).
 * Original Tommy-Im.png file remains byte-for-byte untouched.
 */
export function getTomTexture(onReady) {
  if (cachedTomTexture && cachedTomTexture.baseTexture && !cachedTomTexture.baseTexture.destroyed) {
    if (onReady) onReady(cachedTomTexture);
    return cachedTomTexture;
  }

  if (cachedTomCanvas) {
    try {
      cachedTomTexture = PIXI.Texture.from(cachedTomCanvas);
      if (onReady) onReady(cachedTomTexture);
      return cachedTomTexture;
    } catch {
      // ignore fallback
    }
  }

  if (onReady) textureWaiters.push(onReady);

  if (!isGeneratingTexture && typeof window !== 'undefined') {
    isGeneratingTexture = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/models/avatar/Tommy-Im.png';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || NATIVE_CANVAS_WIDTH;
        canvas.height = img.height || NATIVE_CANVAS_HEIGHT;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Pre-clear detached watermark artifact box at bottom-right (X: 2350..2816, Y: 950..1536)
        // Tom character bounds: X in [900, 1888], Y in [103, 1508]. Tom is >460 px away from X=2350.
        ctx.clearRect(2350, 950, canvas.width - 2350, canvas.height - 950);

        // Contiguous 4-way BFS flood-fill starting strictly from canvas outer perimeter
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const w = canvas.width;
        const h = canvas.height;
        const totalPixels = w * h;

        const visited = new Uint8Array(totalPixels);
        const queue = new Int32Array(totalPixels);
        let head = 0;
        let tail = 0;

        // Tolerance: outer background pixels have R > 238, G > 238, B > 238 or alpha === 0
        const isWhiteOrClear = (idx) => {
          if (data[idx + 3] === 0) return true;
          return data[idx] > 238 && data[idx + 1] > 238 && data[idx + 2] > 238;
        };

        // Top and bottom boundary rows
        for (let x = 0; x < w; x++) {
          const topIdx = (0 * w + x) * 4;
          if (isWhiteOrClear(topIdx)) {
            visited[0 * w + x] = 1;
            queue[tail++] = 0 * w + x;
          }
          const botIdx = ((h - 1) * w + x) * 4;
          if (isWhiteOrClear(botIdx)) {
            visited[(h - 1) * w + x] = 1;
            queue[tail++] = (h - 1) * w + x;
          }
        }

        // Left and right boundary columns
        for (let y = 0; y < h; y++) {
          const leftIdx = (y * w + 0) * 4;
          if (!visited[y * w + 0] && isWhiteOrClear(leftIdx)) {
            visited[y * w + 0] = 1;
            queue[tail++] = y * w + 0;
          }
          const rightIdx = (y * w + (w - 1)) * 4;
          if (!visited[y * w + (w - 1)] && isWhiteOrClear(rightIdx)) {
            visited[y * w + (w - 1)] = 1;
            queue[tail++] = y * w + (w - 1);
          }
        }

        // Fast contiguous 4-way BFS loop
        while (head < tail) {
          const p = queue[head++];
          const cy = Math.floor(p / w);
          const cx = p % w;
          data[p * 4 + 3] = 0; // Make exterior pixel fully transparent

          if (cy > 0) {
            const up = (cy - 1) * w + cx;
            if (!visited[up] && isWhiteOrClear(up * 4)) {
              visited[up] = 1;
              queue[tail++] = up;
            }
          }
          if (cy < h - 1) {
            const down = (cy + 1) * w + cx;
            if (!visited[down] && isWhiteOrClear(down * 4)) {
              visited[down] = 1;
              queue[tail++] = down;
            }
          }
          if (cx > 0) {
            const left = cy * w + (cx - 1);
            if (!visited[left] && isWhiteOrClear(left * 4)) {
              visited[left] = 1;
              queue[tail++] = left;
            }
          }
          if (cx < w - 1) {
            const right = cy * w + (cx + 1);
            if (!visited[right] && isWhiteOrClear(right * 4)) {
              visited[right] = 1;
              queue[tail++] = right;
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        cachedTomCanvas = canvas;
        cachedTomTexture = PIXI.Texture.from(canvas);
      } catch (err) {
        console.warn('[TomPuppet] Runtime transparency processing fallback:', err);
        cachedTomTexture = PIXI.Texture.from('/models/avatar/Tommy-Im.png');
      }

      isGeneratingTexture = false;
      while (textureWaiters.length > 0) {
        const cb = textureWaiters.shift();
        if (typeof cb === 'function') cb(cachedTomTexture);
      }
    };

    img.onerror = () => {
      cachedTomTexture = PIXI.Texture.from('/models/avatar/Tommy-Im.png');
      isGeneratingTexture = false;
      while (textureWaiters.length > 0) {
        const cb = textureWaiters.shift();
        if (typeof cb === 'function') cb(cachedTomTexture);
      }
    };
  }

  return cachedTomTexture || (typeof window !== 'undefined' && typeof window.Image !== 'undefined' ? PIXI.Texture.from('/models/avatar/Tommy-Im.png') : PIXI.Texture.EMPTY);
}

/**
 * Tom Puppet Class (occupying existing persisted slot 'haruto')
 *
 * Phase T2.1: Precision Cartoon Mouth Rig.
 * Reconstructs Tom's open speaking mouth to visually match Reference #1 while preserving
 * 100% canonical resting artwork at REST.
 */
export class TomPuppet extends PIXI.Container {
  constructor() {
    super();

    this.name = 'TomPuppet';
    this.isTomPuppet = true;
    this.isPuppet = true;

    // Standard Lip-Sync Contract properties (consumed by useLipSync.js)
    this._mouthY = 0.0;
    this._mouthForm = 0.0;
    this._isSpeaking = false;
    this.currentMood = 'happy';

    // Animation state interpolation targets
    this.targetMouthOpen = 0.0;
    this.targetMouthForm = 0.0;
    this.currentMouthOpen = 0.0;
    this.currentMouthForm = 0.0;
    this.debugHoldState = null;
    this.debugHoldForm = 0.0;

    // Development preview hook
    if (typeof window !== 'undefined') {
      window.__tomPuppet = this;
    }

    this.initRig();
  }

  get mouthY() {
    return this._mouthY || 0.0;
  }
  set mouthY(val) {
    this._mouthY = Math.max(0.0, Math.min(1.0, Number(val) || 0.0));
  }

  get mouthForm() {
    return this._mouthForm || 0.0;
  }
  set mouthForm(val) {
    this._mouthForm = Math.max(-1.0, Math.min(1.0, Number(val) || 0.0));
  }

  get isSpeaking() {
    return this._isSpeaking || false;
  }
  set isSpeaking(val) {
    this._isSpeaking = Boolean(val);
  }

  initRig() {
    // 1. Root Container
    this.rootContainer = new PIXI.Container();
    this.addChild(this.rootContainer);

    // 2. Uniformly scaled Content Container
    // Character bounds are 988 × 1405 px.
    // Scale 0.18 maps character bounds to ~177.8 × 252.9 px, perfectly fitting standard 220 × 270 puppet stage.
    this.contentContainer = new PIXI.Container();
    this.contentContainer.scale.set(0.18);
    this.rootContainer.addChild(this.contentContainer);

    // 3. Base Canonical Tom Sprite (Untouched canonical artwork)
    const initialTexture = getTomTexture((readyTexture) => {
      if (this.sprite && readyTexture) {
        this.sprite.texture = readyTexture;
      }
    });

    this.sprite = new PIXI.Sprite(initialTexture);
    // Anchor anchored at character visual center: X = 1394.0, Y = 805.5
    this.sprite.anchor.set(VISUAL_CENTER_X / NATIVE_CANVAS_WIDTH, VISUAL_CENTER_Y / NATIVE_CANVAS_HEIGHT);
    this.sprite.position.set(0, 0);
    this.contentContainer.addChild(this.sprite);

    // 4. Procedural Mouth Rig Container (shares origin (0, 0) with visual center anchor)
    this.mouthRig = new PIXI.Container();
    this.mouthRig.position.set(0, 0);
    this.contentContainer.addChild(this.mouthRig);

    // 5. Persistent Mouth Cavity Graphics (deep warm burgundy)
    this.mouthCavity = new PIXI.Graphics();
    this.mouthRig.addChild(this.mouthCavity);

    // 6. Persistent Tongue Graphics (soft warm rose pink)
    this.tongueGraphics = new PIXI.Graphics();
    this.mouthRig.addChild(this.tongueGraphics);

    // 7. Persistent Mouth Border Graphics (crisp dark ink contours on top of tongue)
    this.mouthBorder = new PIXI.Graphics();
    this.mouthRig.addChild(this.mouthBorder);

    // Initial render at REST
    this.renderControlledMouth(0.0, 0.0);
  }

  /**
   * Preview hook: hold one of the 5 controlled states (0..4) and optional form (-1..+1)
   * or null to resume live input.
   */
  setPreviewState(stateIndex, formVal = 0.0) {
    if (stateIndex === null || stateIndex === undefined) {
      this.debugHoldState = null;
      this.debugHoldForm = 0.0;
      this.targetMouthOpen = this.isSpeaking ? mapMouthYToLandmarks(this.mouthY) : 0.0;
      this.targetMouthForm = this.mouthForm;
      return;
    }
    this.debugHoldState = Math.max(0, Math.min(4, Number(stateIndex) || 0));
    this.debugHoldForm = Math.max(-1.0, Math.min(1.0, Number(formVal) || 0.0));
    this.targetMouthOpen = T2_STATES[this.debugHoldState] ?? 0.0;
    this.targetMouthForm = this.debugHoldForm;
  }

  /**
   * Standard puppet contract methods
   */
  setMouthOpen(yVal, formVal = 0.0) {
    const clampedY = Math.max(0.0, Math.min(1.0, typeof yVal === 'number' && !isNaN(yVal) ? yVal : 0.0));
    const clampedForm = Math.max(-1.0, Math.min(1.0, typeof formVal === 'number' && !isNaN(formVal) ? formVal : 0.0));

    this.mouthY = clampedY;
    this.mouthForm = clampedForm;
    this.debugHoldState = null;

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

  setMood(mood) {
    this.currentMood = mood;
  }

  /**
   * Update hook: smoothly interpolates current mouth open and form toward targets.
   * Rock-solid static stability when idle or at REST.
   */
  update(_timeMs) {
    let targetOpen = this.targetMouthOpen;
    let targetForm = this.targetMouthForm;

    if (this.debugHoldState !== null) {
      targetOpen = T2_STATES[this.debugHoldState] ?? 0.0;
      targetForm = this.debugHoldForm ?? 0.0;
    } else if (!this.isSpeaking) {
      targetOpen = 0.0;
      targetForm = 0.0;
    }

    // Smooth lerp: fast responsive attack on opening, natural release on closing
    const isOpening = targetOpen > this.currentMouthOpen;
    const lerpRate = this.isSpeaking ? (isOpening ? 0.55 : 0.45) : 0.50;
    this.currentMouthOpen += (targetOpen - this.currentMouthOpen) * lerpRate;
    this.currentMouthForm += (targetForm - this.currentMouthForm) * 0.35;

    // Hard REST clamp when effectively closed to prevent sub-pixel jitter
    if (!this.isSpeaking || targetOpen === 0.0) {
      if (this.debugHoldState === null && this.currentMouthOpen < 0.04) {
        this.currentMouthOpen = 0.0;
        this.currentMouthForm = 0.0;
      }
    }

    this.renderControlledMouth(this.currentMouthOpen, this.currentMouthForm);
  }

  /**
   * Phase T2.1 Precision 3-Point Cartoon Mouth Renderer
   *
   * Reconstructed directly from the user's 3 authoritative points:
   * - Starts at the Left Point (X: 1354, Y: 440) on the left whisker pad
   * - Ends at the Right Point (X: 1448, Y: 440) on the right whisker pad
   * - Upper boundary forms a dual-arch curve structure:
   *     Left Point -> curves under left whisker pad -> arches into Middle Point (X: 1400, Y: 424)
   *     Middle Point -> curves under right whisker pad -> arches into Right Point (X: 1448, Y: 440)
   * - Lower boundary sweeps down forming a rounded cartoon smile cup (depth up to 50 px)
   * - Tongue size kept small (width ~30% of mouth width, height ~22% of opening depth)
   *
   * @param {number} mouthOpen - Normalized opening in [0.00, 1.00]
   * @param {number} mouthForm - Horizontal shape articulation in [-1.00, +1.00]
   */
  renderControlledMouth(mouthOpen, mouthForm = 0.0) {
    if (!this.mouthCavity || !this.mouthRig || !this.tongueGraphics) return;

    // State 0: REST (mouthOpen <= 0.005)
    // Dynamic mouth graphics completely invisible; 100% canonical resting artwork visible
    if (mouthOpen <= 0.005) {
      this.mouthRig.visible = false;
      this.mouthCavity.clear();
      this.tongueGraphics.clear();
      if (this.mouthBorder) this.mouthBorder.clear();
      return;
    }

    this.mouthRig.visible = true;
    this.mouthCavity.clear();
    this.tongueGraphics.clear();
    if (this.mouthBorder) this.mouthBorder.clear();

    const m = Math.max(0.0, Math.min(1.0, mouthOpen));
    const form = Math.max(-1.0, Math.min(1.0, Number(mouthForm) || 0.0));

    // Center philtrum notch local X = +6.0
    const midX = 6.0;

    // Horizontal span modulation with form
    const spanMod = 1.0 + form * 0.03;

    // 1. Upper boundary: exactly sticks to, touches, and follows the actual upper black line
    const topPts = EXACT_UPPER_LINE_PTS.map((p) => ({
      x: midX + (p.x - midX) * spanMod,
      y: p.y,
    }));

    const leftX = topPts[0].x;
    const leftY = topPts[0].y;
    const rightX = topPts[topPts.length - 1].x;
    const rightY = topPts[topPts.length - 1].y;

    // Dynamic vertical depth in local coordinates
    // Depth at MAX: 50.0 px (reaches Native Y = 484.0; Chin clearance = 23.0 px)
    const depthMod = form < 0 ? (1.0 + form * 0.02) : (1.0 - form * 0.06);
    const currentDepth = MAX_MOUTH_OPENING_DEPTH * m * depthMod;

    // 2. Lower jaw boundary: drops smoothly from Right End to Left End
    const floorY = -371.2 + currentDepth; // Lowest center floor Y
    const cornerAvgY = (leftY + rightY) / 2.0;
    const jawDropTotal = floorY - cornerAvgY;

    const botSteps = 60;
    const botPts = [];
    for (let i = 0; i <= botSteps; i++) {
      const u = i / botSteps;
      const x = rightX - u * (rightX - leftX);
      const baseY = (1.0 - u) * rightY + u * leftY;
      const botY = baseY + jawDropTotal * Math.pow(Math.sin(Math.PI * u), 0.85);
      botPts.push({ x, y: botY });
    }

    const g = this.mouthCavity;

    // 3. Draw Oral Cavity: deep warm burgundy (0x2E0B11)
    g.beginFill(0x2E0B11, 1.0);

    g.moveTo(topPts[0].x, topPts[0].y);
    for (let i = 1; i < topPts.length; i++) {
      g.lineTo(topPts[i].x, topPts[i].y);
    }
    for (let i = 0; i < botPts.length; i++) {
      g.lineTo(botPts[i].x, botPts[i].y);
    }
    g.closePath();
    g.endFill();

    // 4. Precision Cartoon Tongue: perfectly touches and follows lower jaw curve with organic rounded dome
    if (m >= 0.10) {
      // Smooth dynamic scaling with mouth opening depth and articulation
      const tProg = Math.max(0.0, Math.min(1.0, (m - 0.10) / 0.90));
      const rx = (14.0 + 23.0 * tProg) * spanMod; // 14 px at 0.10, ~24.6 px at 0.50, 37.0 px at 1.00 (plump & visible)
      const tH = (3.0 + 19.0 * tProg) * depthMod;  // 3 px at 0.10, ~11.4 px at 0.50, 22.0 px at 1.00

      const tLeftX = midX - rx;
      const tRightX = midX + rx;

      // Exact jaw Y interpolation along botPts
      const getJawY = (xVal) => {
        for (let i = 0; i < botPts.length - 1; i++) {
          const p1 = botPts[i];
          const p2 = botPts[i + 1];
          if ((p1.x >= xVal && xVal >= p2.x) || (p1.x <= xVal && xVal <= p2.x)) {
            const ratio = p2.x !== p1.x ? (xVal - p1.x) / (p2.x - p1.x) : 0;
            return p1.y + ratio * (p2.y - p1.y);
          }
        }
        return floorY;
      };

      const pLeftY = getJawY(tLeftX);
      const pRightY = getJawY(tRightX);

      // Lower boundary: exactly touches and follows the jaw curve from tLeftX to tRightX
      const jawPts = [{ x: tLeftX, y: pLeftY }];
      const midJaw = botPts.filter((p) => p.x > tLeftX && p.x < tRightX).sort((a, b) => a.x - b.x);
      jawPts.push(...midJaw);
      jawPts.push({ x: tRightX, y: pRightY });

      // Upper boundary: convex elliptical arch curving down organically to meet jaw contact points
      const domeSteps = 30;
      const domePts = [];
      for (let i = 0; i <= domeSteps; i++) {
        const u = i / domeSteps; // 0 at right, 1 at left
        const x = tRightX - u * (tRightX - tLeftX);
        const t = 1.0 - u;
        const chordY = (1.0 - t) * pLeftY + t * pRightY;
        let normX = (x - midX) / rx;
        normX = Math.max(-1.0, Math.min(1.0, normX));
        const arch = Math.sqrt(Math.max(0.0, 1.0 - normX * normX));
        const domeY = chordY - tH * arch;
        domePts.push({ x, y: domeY });
      }

      const tg = this.tongueGraphics;
      // Soft warm rose pink (0xD65D6C) fill touching lower jawline
      tg.beginFill(0xD65D6C, 1.0);
      tg.moveTo(jawPts[0].x, jawPts[0].y);
      for (let i = 1; i < jawPts.length; i++) {
        tg.lineTo(jawPts[i].x, jawPts[i].y);
      }
      for (let i = 0; i < domePts.length; i++) {
        tg.lineTo(domePts[i].x, domePts[i].y);
      }
      tg.closePath();
      tg.endFill();

      // Soft burgundy contour (0x8E2F3B) along the upper tongue arch only (prevents endpoint spikes)
      tg.lineStyle(1.8, 0x8E2F3B, 1.0);
      tg.moveTo(domePts[0].x, domePts[0].y);
      for (let i = 1; i < domePts.length; i++) {
        tg.lineTo(domePts[i].x, domePts[i].y);
      }
    }

    // 5. Crisp dark ink contours on top of tongue (guarantees zero tongue leakage)
    const mb = this.mouthBorder || g;
    // Lower jaw border
    mb.lineStyle(2.4, 0x150406, 1.0);
    mb.moveTo(botPts[0].x, botPts[0].y);
    for (let i = 1; i < botPts.length; i++) {
      mb.lineTo(botPts[i].x, botPts[i].y);
    }
    // Upper lip contour (perfectly touches and matches actual black line)
    mb.lineStyle(2.8, 0x150406, 1.0);
    mb.moveTo(topPts[0].x, topPts[0].y);
    for (let i = 1; i < topPts.length; i++) {
      mb.lineTo(topPts[i].x, topPts[i].y);
    }
  }

  destroy(options) {
    if (typeof window !== 'undefined' && window.__tomPuppet === this) {
      delete window.__tomPuppet;
    }
    if (this.mouthBorder) {
      try { this.mouthBorder.destroy({ children: true }); } catch { /* ignore */ }
      this.mouthBorder = null;
    }
    if (this.tongueGraphics) {
      try { this.tongueGraphics.destroy({ children: true }); } catch { /* ignore */ }
      this.tongueGraphics = null;
    }
    if (this.mouthCavity) {
      try { this.mouthCavity.destroy({ children: true }); } catch { /* ignore */ }
      this.mouthCavity = null;
    }
    if (this.mouthRig) {
      try { this.mouthRig.destroy({ children: true }); } catch { /* ignore */ }
      this.mouthRig = null;
    }
    if (this.sprite) {
      try { this.sprite.destroy(false); } catch { /* ignore */ }
      this.sprite = null;
    }
    if (this.contentContainer) {
      try { this.contentContainer.destroy({ children: true }); } catch { /* ignore */ }
      this.contentContainer = null;
    }
    if (this.rootContainer) {
      try { this.rootContainer.destroy({ children: true }); } catch { /* ignore */ }
      this.rootContainer = null;
    }
    super.destroy(options);
  }
}

export { TomPuppet as HarutoPuppet };
