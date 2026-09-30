import * as PIXI from 'pixi.js';

/**
 * Cached transparent texture generator for Ben 10.
 * Removes contiguous exterior white/near-white background at runtime via offscreen canvas
 * while leaving internal whites (eye sclera, white t-shirt, Omnitrix accents) 100% intact.
 * Original public/models/avatar/Ben 10-Im.png bytes remain completely untouched.
 */
let cachedBenTenCanvas = null;
let cachedBenTenTexture = null;
let isGeneratingTexture = false;
const textureWaiters = [];

function getBenTenTexture(onReady) {
  if (cachedBenTenTexture && cachedBenTenTexture.baseTexture && !cachedBenTenTexture.baseTexture.destroyed) {
    if (onReady) onReady(cachedBenTenTexture);
    return cachedBenTenTexture;
  }

  if (cachedBenTenCanvas) {
    try {
      cachedBenTenTexture = PIXI.Texture.from(cachedBenTenCanvas);
      if (onReady) onReady(cachedBenTenTexture);
      return cachedBenTenTexture;
    } catch (_) {}
  }

  if (onReady) textureWaiters.push(onReady);

  if (!isGeneratingTexture && typeof window !== 'undefined') {
    isGeneratingTexture = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/models/avatar/Ben%2010-Im.png';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 2390;
        canvas.height = img.height || 1792;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Contiguous BFS flood fill starting from borders to only make outer white background transparent
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const w = canvas.width;
        const h = canvas.height;
        const totalPixels = w * h;

        const visited = new Uint8Array(totalPixels);
        const queue = new Int32Array(totalPixels);
        let head = 0;
        let tail = 0;

        // Tolerance: Outer background pixels have R > 238, G > 238, B > 238
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
        cachedBenTenCanvas = canvas;
        cachedBenTenTexture = PIXI.Texture.from(canvas);
      } catch (err) {
        console.warn('[BenTenPuppet] Runtime transparency processing fallback:', err);
        cachedBenTenTexture = PIXI.Texture.from('/models/avatar/Ben%2010-Im.png');
      }

      isGeneratingTexture = false;
      while (textureWaiters.length > 0) {
        const cb = textureWaiters.shift();
        if (typeof cb === 'function') cb(cachedBenTenTexture);
      }
    };

    img.onerror = () => {
      cachedBenTenTexture = PIXI.Texture.from('/models/avatar/Ben%2010-Im.png');
      isGeneratingTexture = false;
      while (textureWaiters.length > 0) {
        const cb = textureWaiters.shift();
        if (typeof cb === 'function') cb(cachedBenTenTexture);
      }
    };
  }

  return cachedBenTenTexture || PIXI.Texture.from('/models/avatar/Ben%2010-Im.png');
}

/**
 * =========================================================================
 * PHASE B2 — BEN 10 PRECISION CARTOON MOUTH RIG GEOMETRY
 * =========================================================================
 *
 * Image Size: 2390 × 1792
 * Image Center: (1195, 896)
 *
 * Local Space = Image Space - (1195, 896)
 *
 * Canonical Endpoints:
 * - Left:  Image (1080, 1014) -> Local (-115.0, +118.0)
 * - Right: Image (1331, 985)  -> Local (+136.0, +89.0)
 * (Right endpoint is naturally ~29px higher than Left: asymmetric cartoon smile)
 *
 * Resting Smile Trough:
 * - Image (1205.5, 1025.5) -> Local (+10.5, +129.5)
 *
 * Verified Safe Dynamic Mouth Region:
 * - Image X: 1060 -> 1350  (Local: -135 -> +155)
 * - Image Y: 970 -> 1110   (Local: +74 -> +214)
 * - Maximum Open Trough: Image Y = 1080.0 (Local Y = +184.0), safely 30px above
 *   safe boundary and 88px above chin line (Y = 1168).
 *
 * Zero-Drift Guarantee:
 * - Endpoints (-115, 118) and (136, 89) remain strictly anchored at all opening levels.
 *
 * No Teeth: Faithful to canonical Ben 10 artwork.
 * Recessed Tongue: Visible only when mouthOpen > 0.38, cleanly nestled inside cavity.
 */

// 26 Sampled Vertices tracing the canonical underside of the Ben 10 smile line
export const B2_SMILE_LOCAL_PTS = [
  [-115.0, 118.0], // Left Smile Anchor (Image: 1080, 1014)
  [-105.0, 122.0],
  [ -95.0, 126.0],
  [ -85.0, 128.0],
  [ -75.0, 128.0],
  [ -65.0, 128.0],
  [ -55.0, 128.0],
  [ -45.0, 129.0],
  [ -35.0, 129.0],
  [ -25.0, 129.0],
  [ -15.0, 130.0], // Smile Peak Trough
  [  -5.0, 129.0],
  [   5.0, 128.0], // Facial midline
  [  16.0, 128.0],
  [  26.0, 127.0],
  [  36.0, 125.0],
  [  46.0, 124.0],
  [  56.0, 123.0],
  [  66.0, 121.0],
  [  76.0, 118.0],
  [  86.0, 115.0],
  [  96.0, 112.0],
  [ 106.0, 109.0],
  [ 116.0, 103.0],
  [ 126.0,  97.0],
  [ 136.0,  89.0], // Right Smile Anchor (Image: 1331, 985)
];

export function getSmileY(x) {
  if (x <= B2_SMILE_LOCAL_PTS[0][0]) return B2_SMILE_LOCAL_PTS[0][1];
  const last = B2_SMILE_LOCAL_PTS[B2_SMILE_LOCAL_PTS.length - 1];
  if (x >= last[0]) return last[1];
  for (let i = 0; i < B2_SMILE_LOCAL_PTS.length - 1; i++) {
    const p1 = B2_SMILE_LOCAL_PTS[i];
    const p2 = B2_SMILE_LOCAL_PTS[i + 1];
    if (x >= p1[0] && x <= p2[0]) {
      const frac = (x - p1[0]) / (p2[0] - p1[0]);
      return p1[1] + frac * (p2[1] - p1[1]);
    }
  }
  return 129.0;
}

// 51 Precomputed lower boundary points at maximum opening (m = 1.00)
// Right: (+136, +89) -> CP (+80, +165) -> Trough (+5, +184) [Image: (1200, 1080)]
// Left:  (+5, +184)  -> CP (-65, +175) -> Left Anchor (-115, +118)
export const B2_LOWER_MAX_SAMPLES = (() => {
  const pts = [];
  const steps = 25;
  // Right half: from (136, 89) to (5, 184)
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) * (1 - t) * 136.0 + 2 * (1 - t) * t * 80.0 + t * t * 5.0;
    const yMax = (1 - t) * (1 - t) * 89.0 + 2 * (1 - t) * t * 165.0 + t * t * 184.0;
    pts.push({ x: Number(x.toFixed(2)), yMax: Number(yMax.toFixed(2)) });
  }
  // Left half: from (5, 184) to (-115, 118)
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) * (1 - t) * 5.0 + 2 * (1 - t) * t * (-65.0) + t * t * (-115.0);
    const yMax = (1 - t) * (1 - t) * 184.0 + 2 * (1 - t) * t * 175.0 + t * t * 118.0;
    pts.push({ x: Number(x.toFixed(2)), yMax: Number(yMax.toFixed(2)) });
  }
  return pts;
})();

export function getLowerY(x, m) {
  const ySmile = getSmileY(x);
  for (let i = 0; i < B2_LOWER_MAX_SAMPLES.length - 1; i++) {
    const p1 = B2_LOWER_MAX_SAMPLES[i];
    const p2 = B2_LOWER_MAX_SAMPLES[i + 1];
    const minX = Math.min(p1.x, p2.x);
    const maxX = Math.max(p1.x, p2.x);
    if (x >= minX && x <= maxX && p1.x !== p2.x) {
      const t = (x - p1.x) / (p2.x - p1.x);
      const yMax = (1 - t) * p1.yMax + t * p2.yMax;
      return (1.0 - m) * ySmile + m * yMax;
    }
  }
  return (1.0 - m) * ySmile + m * 184.0;
}

export const B2_STATES = {
  0: 0.00, // REST
  1: 0.20, // SLIGHT (~11px aperture)
  2: 0.45, // MEDIUM (~25px aperture)
  3: 0.72, // LARGE  (~40px aperture)
  4: 1.00, // MAXIMUM (~54px aperture, Image Y = 1080.0)
};

/**
 * Maps incoming normalized mouthY (0.0 to 1.0) continuously through the 5 animation landmarks.
 * Clamps strictly at 1.00 (maximum safe ceiling).
 */
export function mapMouthYToLandmarks(y) {
  const clampedY = Math.max(0.0, Math.min(1.0, Number(y) || 0.0));
  // Below rest threshold (0.05): REST
  if (clampedY <= 0.05) {
    return 0.0;
  }
  // 0.05 -> 0.25 maps smoothly to 0.00 -> 0.20 (SLIGHT)
  if (clampedY <= 0.25) {
    const t = (clampedY - 0.05) / 0.20;
    return t * 0.20;
  }
  // 0.25 -> 0.50 maps smoothly to 0.20 -> 0.45 (MEDIUM)
  if (clampedY <= 0.50) {
    const t = (clampedY - 0.25) / 0.25;
    return 0.20 + t * (0.45 - 0.20);
  }
  // 0.50 -> 0.75 maps smoothly to 0.45 -> 0.72 (LARGE)
  if (clampedY <= 0.75) {
    const t = (clampedY - 0.50) / 0.25;
    return 0.45 + t * (0.72 - 0.45);
  }
  // 0.75 -> 1.00 maps smoothly to 0.72 -> 1.00 (MAXIMUM)
  const t = (clampedY - 0.75) / 0.25;
  return 0.72 + t * (1.00 - 0.72);
}

/**
 * BenTenPuppet
 *
 * Production procedural puppet container for Ben 10 (reusing slot 'mao').
 * Phase B2: Precision cartoon mouth rig with anchored asymmetry, smooth interpolation,
 * no teeth, and recessed tongue.
 */
export class BenTenPuppet extends PIXI.Container {
  constructor() {
    super();
    this.name = 'BenTenPuppet';
    this.isBenTenPuppet = true;

    // Speech & Lip-Sync State Contract (consumed by useLipSync.js)
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
      window.__benTenPuppet = this;
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

    // Uniformly scaled content container so Sprite & Overlays share coordinate space
    // Scale 0.15 maps 2390x1792 (character bounds 1655x1792) to ~248x269, matching 230x280 reference box
    this.contentContainer = new PIXI.Container();
    this.contentContainer.scale.set(0.15);
    this.rootContainer.addChild(this.contentContainer);

    // 1. Base Canonical Ben 10 Sprite (Original canonical artwork)
    const initialTexture = getBenTenTexture((readyTexture) => {
      if (this.sprite && readyTexture) {
        this.sprite.texture = readyTexture;
      }
    });

    this.sprite = new PIXI.Sprite(initialTexture);
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.position.set(0, 0);
    this.contentContainer.addChild(this.sprite);

    // 2. Procedural Mouth Rig Container (shares origin (0, 0) with sprite center)
    this.mouthRig = new PIXI.Container();
    this.mouthRig.position.set(0, 0);
    this.contentContainer.addChild(this.mouthRig);

    // Layer A: Deep warm burgundy mouth cavity (#2D0C10) with dark outline (#1A0505)
    this.mouthCavity = new PIXI.Graphics();
    this.mouthRig.addChild(this.mouthCavity);

    // Layer B: Subtle recessed pink tongue (#D75F73)
    this.tongueGfx = new PIXI.Graphics();
    this.mouthRig.addChild(this.tongueGfx);

    // Initial render at REST
    this.renderControlledMouth(0.0, 0.0);
  }

  /**
   * Development preview control: hold one of the 5 controlled states (0..4) and optional form (-1..+1)
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
    const idx = Number(stateIndex);
    if (B2_STATES[idx] !== undefined) {
      this.debugHoldState = idx;
      this.debugHoldForm = Math.max(-1.0, Math.min(1.0, Number(formVal) || 0.0));
      this.targetMouthOpen = B2_STATES[idx];
      this.targetMouthForm = this.debugHoldForm;
    }
  }

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

  update(_timeMs) {
    // Determine target mouth open state
    let targetOpen = this.targetMouthOpen;
    let targetForm = this.targetMouthForm;

    if (this.debugHoldState !== null) {
      targetOpen = B2_STATES[this.debugHoldState] ?? 0.0;
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

    // Hard REST clamp when effectively closed to prevent jitter
    if (!this.isSpeaking || targetOpen === 0.0) {
      if (this.currentMouthOpen < 0.04) {
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
    if (!this.mouthCavity || !this.tongueGfx || !this.mouthRig) return;

    // State 0: REST (mouthOpen <= 0.005)
    // Dynamic mouth graphics completely invisible; 100% canonical resting artwork visible
    if (mouthOpen <= 0.005) {
      this.mouthRig.visible = false;
      this.mouthCavity.clear();
      this.tongueGfx.clear();
      return;
    }

    this.mouthRig.visible = true;
    this.mouthCavity.clear();
    this.tongueGfx.clear();

    const m = Math.max(0.0, Math.min(1.0, mouthOpen));
    const form = Math.max(-1.0, Math.min(1.0, Number(mouthForm) || 0.0));

    // ── Layer 1: Deep Warm Burgundy Mouth Cavity (#2D0C10) with Outline (#1A0505) ──
    const gCavity = this.mouthCavity;
    gCavity.lineStyle(2.5, 0x1A0505, 1.0);
    gCavity.beginFill(0x2D0C10, 1.0);

    // Upper boundary: Traces the underside of the canonical smile line
    gCavity.moveTo(B2_SMILE_LOCAL_PTS[0][0], B2_SMILE_LOCAL_PTS[0][1]);
    for (let i = 1; i < B2_SMILE_LOCAL_PTS.length; i++) {
      gCavity.lineTo(B2_SMILE_LOCAL_PTS[i][0], B2_SMILE_LOCAL_PTS[i][1]);
    }

    // Lower boundary: Interpolated smoothly between smile contour and maximum open curve
    // Tapers naturally to zero opening at left (-115, 118) and right (+136, 89) corners with 0px drift
    // mouthForm subtly modulates horizontal width without altering the anchored endpoints
    const midX = 5.0;
    for (let i = 0; i < B2_LOWER_MAX_SAMPLES.length; i++) {
      const sample = B2_LOWER_MAX_SAMPLES[i];
      const ySmile = getSmileY(sample.x);
      const yCurr = (1.0 - m) * ySmile + m * sample.yMax;

      const maxDist = sample.x >= midX ? (136.0 - midX) : (midX - (-115.0));
      const dist = Math.abs(sample.x - midX);
      const tNorm = Math.min(1.0, Math.max(0.0, dist / maxDist));
      const modulation = Math.sin((1.0 - tNorm) * Math.PI);
      const xOffset = form * 6.0 * (sample.x >= midX ? 1.0 : -1.0) * modulation * m;
      const xCurr = sample.x + xOffset;

      gCavity.lineTo(xCurr, yCurr);
    }

    gCavity.endFill();

    // Redraw crisp upper smile contour line
    gCavity.lineStyle(2.5, 0x1A0505, 1.0);
    gCavity.moveTo(B2_SMILE_LOCAL_PTS[0][0], B2_SMILE_LOCAL_PTS[0][1]);
    for (let i = 1; i < B2_SMILE_LOCAL_PTS.length; i++) {
      gCavity.lineTo(B2_SMILE_LOCAL_PTS[i][0], B2_SMILE_LOCAL_PTS[i][1]);
    }

    // ── Layer 2: Subtle Recessed Pink Tongue (#D75F73) ──
    // Visible only when mouthOpen > 0.38, nestled safely inside cavity
    if (m > 0.38) {
      const gTongue = this.tongueGfx;
      const tongueM = (m - 0.38) / 0.62;
      gTongue.beginFill(0xD75F73, 1.0);

      // Follow bottom contour from right to left (offset 2.5px up to remain strictly inside outline)
      const tStartRight = 35.0;
      const tEndLeft = -25.0;
      const tSteps = 20;

      const bottomYAt = (xVal) => getLowerY(xVal, m);
      const smileYAt = (xVal) => getSmileY(xVal);

      // Start at right edge of tongue baseline
      gTongue.moveTo(tStartRight, bottomYAt(tStartRight) - 2.5);

      // Follow bottom contour to left edge
      for (let s = 1; s <= tSteps; s++) {
        const tx = tStartRight - (s / tSteps) * (tStartRight - tEndLeft);
        const ty = bottomYAt(tx) - 2.5;
        gTongue.lineTo(tx, ty);
      }

      // Arc over top of tongue mound back to right edge
      for (let s = 0; s <= tSteps; s++) {
        const tx = tEndLeft + (s / tSteps) * (tStartRight - tEndLeft);
        const bY = bottomYAt(tx);
        const sY = smileYAt(tx);
        const aperture = Math.max(0, bY - sY);
        const moundH = tongueM * (aperture * 0.45) * Math.sin(((tx - tEndLeft) / (tStartRight - tEndLeft)) * Math.PI);
        const ty = bY - 2.5 - moundH;
        gTongue.lineTo(tx, ty);
      }

      gTongue.endFill();
    }
  }

  destroy(options) {
    if (typeof window !== 'undefined' && window.__benTenPuppet === this) {
      delete window.__benTenPuppet;
    }
    if (this.mouthRig) {
      try { this.mouthRig.destroy(options); } catch (_) {}
      this.mouthRig = null;
    }
    if (this.mouthCavity) {
      try { this.mouthCavity.destroy(options); } catch (_) {}
      this.mouthCavity = null;
    }
    if (this.tongueGfx) {
      try { this.tongueGfx.destroy(options); } catch (_) {}
      this.tongueGfx = null;
    }
    if (this.sprite) {
      try { this.sprite.destroy(options); } catch (_) {}
      this.sprite = null;
    }
    if (this.contentContainer) {
      try { this.contentContainer.destroy(options); } catch (_) {}
      this.contentContainer = null;
    }
    if (this.rootContainer) {
      try { this.rootContainer.destroy(options); } catch (_) {}
      this.rootContainer = null;
    }
    super.destroy(options);
  }
}

export default BenTenPuppet;
