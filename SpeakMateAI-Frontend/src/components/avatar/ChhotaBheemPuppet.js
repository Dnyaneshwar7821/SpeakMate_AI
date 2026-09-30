import * as PIXI from 'pixi.js';

/**
 * Cached transparent texture generator for Chhota Bheem.
 * Removes contiguous exterior white background (#FFFFFF) at runtime via offscreen canvas
 * while leaving internal whites (eye sclera) 100% intact.
 * Original public/models/avatar/Chhota Bheem-Im.png bytes remain completely untouched.
 */
let cachedChhotaBheemTexture = null;
let isGeneratingTexture = false;
const textureWaiters = [];

function getChhotaBheemTexture(onReady) {
  if (cachedChhotaBheemTexture) {
    if (onReady) onReady(cachedChhotaBheemTexture);
    return cachedChhotaBheemTexture;
  }

  if (onReady) textureWaiters.push(onReady);

  if (!isGeneratingTexture && typeof window !== 'undefined') {
    isGeneratingTexture = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/models/avatar/Chhota%20Bheem-Im.png';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 2048;
        canvas.height = img.height || 2048;
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

        const isWhite = (idx) => data[idx] > 240 && data[idx + 1] > 240 && data[idx + 2] > 240;

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
          data[p * 4 + 3] = 0;

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
        cachedChhotaBheemTexture = PIXI.Texture.from(canvas);
      } catch (err) {
        console.warn('[ChhotaBheemPuppet] Runtime transparency processing fallback:', err);
        cachedChhotaBheemTexture = PIXI.Texture.from('/models/avatar/Chhota%20Bheem-Im.png');
      }

      isGeneratingTexture = false;
      while (textureWaiters.length > 0) {
        const cb = textureWaiters.shift();
        if (typeof cb === 'function') cb(cachedChhotaBheemTexture);
      }
    };

    img.onerror = () => {
      cachedChhotaBheemTexture = PIXI.Texture.from('/models/avatar/Chhota%20Bheem-Im.png');
      isGeneratingTexture = false;
      while (textureWaiters.length > 0) {
        const cb = textureWaiters.shift();
        if (typeof cb === 'function') cb(cachedChhotaBheemTexture);
      }
    };
  }

  return cachedChhotaBheemTexture || PIXI.Texture.from('/models/avatar/Chhota%20Bheem-Im.png');
}

/**
 * PHASE CB2 — CHHOTA BHEEM PROCEDURAL MOUTH RIG
 *
 * Implements the 5-state procedural mouth rig for Chhota Bheem:
 * 1. Endpoints FROZEN: Left (-116, -39) [Image: 908, 985], Right (+103, -43) [Image: 1127, 981].
 * 2. Five Animation Landmarks:
 *    - REST:    0.00 (Mouth closed, 100% canonical artwork)
 *    - SLIGHT:  0.20 (~12px aperture)
 *    - MEDIUM:  0.45 (~25px aperture, subtle recessed tongue)
 *    - LARGE:   0.72 (~38px aperture, covers chin crease at Y=1040)
 *    - MAXIMUM: 1.00 (~52px aperture, strictly Y <= 1055)
 * 3. Continuous smooth interpolation without snapping.
 * 4. Deep warm burgundy cavity (#66141D) anchored directly to the smile line.
 * 5. Pink recessed tongue (#F4718C) visible when mouthOpen > 0.30.
 * 6. NO TEETH added (faithful to canonical artwork).
 */

// 21 Sampled Vertices along exact underside of canonical smile line (Origin: 1024, 1024)
export const CB2_SMILE_LOCAL_PTS = [
  [-116, -39.0], // Left Smile Anchor (Image: 908, 985)
  [-106, -48.5],
  [ -95, -42.5],
  [ -84, -37.5],
  [ -73, -33.5],
  [ -62, -30.0],
  [ -51, -27.5],
  [ -40, -25.5],
  [ -29, -24.0],
  [ -18, -24.0],
  [  -7, -23.5], // Facial Midline Trough (Image: 1017, 1000.5)
  [   4, -23.5],
  [  15, -24.0],
  [  26, -25.5],
  [  37, -27.5],
  [  48, -29.5],
  [  59, -33.0],
  [  70, -37.5],
  [  81, -42.0],
  [  92, -50.5],
  [ 103, -43.0], // Right Smile Anchor (Image: 1127, 981)
];

export function getSmileY(x) {
  if (x <= CB2_SMILE_LOCAL_PTS[0][0]) return CB2_SMILE_LOCAL_PTS[0][1];
  const last = CB2_SMILE_LOCAL_PTS[CB2_SMILE_LOCAL_PTS.length - 1];
  if (x >= last[0]) return last[1];
  for (let i = 0; i < CB2_SMILE_LOCAL_PTS.length - 1; i++) {
    const p1 = CB2_SMILE_LOCAL_PTS[i];
    const p2 = CB2_SMILE_LOCAL_PTS[i + 1];
    if (x >= p1[0] && x <= p2[0]) {
      const frac = (x - p1[0]) / (p2[0] - p1[0]);
      return p1[1] + frac * (p2[1] - p1[1]);
    }
  }
  return -23.5;
}

// Precomputed lower boundary points at maximum opening
// Right: (+103, -43) -> CP (+95, +25) -> Bottom Center (-7, +28) [Image: (1017, 1052)]
// Left:  (-7, +28)   -> CP (-108, +25) -> Left Anchor (-116, -39)
export const CB2_LOWER_MAX_SAMPLES = (() => {
  const pts = [];
  pts.push({ x: 103.0, yMax: -43.0, ySmile: getSmileY(103.0) });
  const steps = 25;
  // Right side: from (103, -43) to (-7, 28) with CP (95, 25)
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) * (1 - t) * 103.0 + 2 * (1 - t) * t * 95.0 + t * t * (-7.0);
    const yMax = (1 - t) * (1 - t) * (-43.0) + 2 * (1 - t) * t * 25.0 + t * t * 28.0;
    pts.push({ x, yMax, ySmile: getSmileY(x) });
  }
  // Left side: from (-7, 28) to (-116, -39) with CP (-108, 25)
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) * (1 - t) * (-7.0) + 2 * (1 - t) * t * (-108.0) + t * t * (-116.0);
    const yMax = (1 - t) * (1 - t) * 28.0 + 2 * (1 - t) * t * 25.0 + t * t * (-39.0);
    pts.push({ x, yMax, ySmile: getSmileY(x) });
  }
  return pts;
})();

export const CB2_STATES = {
  0: 0.00, // REST
  1: 0.20, // SLIGHT (~12px aperture)
  2: 0.45, // MEDIUM (~25px aperture)
  3: 0.72, // LARGE  (~38px aperture)
  4: 1.00, // MAXIMUM (~52px aperture, Y ≈ 1052)
};

/**
 * Maps incoming normalized mouthY (0.0 to 1.0) continuously through the 5 approved animation landmarks.
 * Clamps strictly at 1.00 (maximum approved ceiling).
 */
export function mapMouthYToLandmarks(y) {
  const clampedY = Math.max(0.0, Math.min(1.0, Number(y) || 0.0));
  // Below rest threshold (0.06): REST
  if (clampedY <= 0.06) {
    return 0.0;
  }
  // 0.06 -> 0.20 maps smoothly to 0.00 -> 0.20 (SLIGHT)
  if (clampedY <= 0.20) {
    const t = (clampedY - 0.06) / 0.14;
    return t * 0.20;
  }
  // 0.20 -> 0.40 maps smoothly to 0.20 -> 0.45 (MEDIUM)
  if (clampedY <= 0.40) {
    const t = (clampedY - 0.20) / 0.20;
    return 0.20 + t * (0.45 - 0.20);
  }
  // 0.40 -> 0.65 maps smoothly to 0.45 -> 0.72 (LARGE)
  if (clampedY <= 0.65) {
    const t = (clampedY - 0.40) / 0.25;
    return 0.45 + t * (0.72 - 0.45);
  }
  // 0.65 -> 0.85 maps smoothly to 0.72 -> 1.00 (MAXIMUM)
  if (clampedY <= 0.85) {
    const t = (clampedY - 0.65) / 0.20;
    return 0.72 + t * (1.00 - 0.72);
  }
  // 0.85 -> 1.00: saturated at approved ceiling 1.00
  return 1.00;
}

export class ChhotaBheemPuppet extends PIXI.Container {
  constructor() {
    super();
    this.name = 'ChhotaBheemPuppet';
    this.isChhotaBheemPuppet = true;

    // Speech & Lip-Sync State (consumed from useLipSync.js)
    this._mouthY = 0.0;
    this._mouthForm = 0.0;
    this._isSpeaking = false;

    // Continuous Animation Interpolation State
    this.currentMouthOpen = 0.0;
    this.targetMouthOpen = 0.0;
    this.currentMouthForm = 0.0;
    this.targetMouthForm = 0.0;
    this.debugHoldState = null; // null | 0 | 1 | 2 | 3 | 4

    // Development preview hooks & convenient keyboard shortcuts
    if (typeof window !== 'undefined') {
      window.__chhotaBheemPuppet = this;
      window.__setChhotaBheemPreviewState = (stateIdx) => this.setPreviewState(stateIdx);
      window.__setChhotaBheemMouthOpen = (openVal, formVal) => this.setMouthOpen(openVal, formVal);

      this._keyHandler = (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        if (e.key === '0') this.setPreviewState(0);
        else if (e.key === '1') this.setPreviewState(1);
        else if (e.key === '2') this.setPreviewState(2);
        else if (e.key === '3') this.setPreviewState(3);
        else if (e.key === '4') this.setPreviewState(4);
        else if (e.key === 'r' || e.key === 'R') this.setMouthOpen(1.0, -1.0);
        else if (e.key === 'w' || e.key === 'W') this.setMouthOpen(1.0, 1.0);
      };
      window.addEventListener('keydown', this._keyHandler);
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
    const boolVal = Boolean(val);
    this._isSpeaking = boolVal;
    if (!boolVal && this.debugHoldState === null) {
      this.targetMouthOpen = 0.0;
      this.targetMouthForm = 0.0;
    }
  }

  initRig() {
    this.rootContainer = new PIXI.Container();
    this.addChild(this.rootContainer);

    // Uniformly scaled content container so Sprite & Overlays share coordinate space
    // Scale 0.18 maps 2048x2048 to ~368x368 with character bounds 142x308
    this.contentContainer = new PIXI.Container();
    this.contentContainer.scale.set(0.18);
    this.rootContainer.addChild(this.contentContainer);

    // 1. Base Canonical Chhota Bheem Sprite (Untouched original artwork)
    const initialTexture = getChhotaBheemTexture((readyTexture) => {
      if (this.sprite && readyTexture) {
        this.sprite.texture = readyTexture;
      }
    });

    this.sprite = new PIXI.Sprite(initialTexture);
    this.sprite.anchor.set(0.5, 0.5);
    // Shift Y by -100 to vertically center the character's core (midline Y=1191 in 2048 canvas)
    this.sprite.position.set(0, -100);
    this.contentContainer.addChild(this.sprite);

    // 2. Procedural Mouth Rig Container (shares position offset (0, -100) with sprite)
    this.mouthRig = new PIXI.Container();
    this.mouthRig.position.set(0, -100);
    this.contentContainer.addChild(this.mouthRig);

    // Layer A: Deep warm burgundy mouth cavity (#66141D)
    this.mouthCavity = new PIXI.Graphics();
    this.mouthRig.addChild(this.mouthCavity);

    // Layer B: Pink recessed tongue (#F4718C)
    this.tongueGfx = new PIXI.Graphics();
    this.mouthRig.addChild(this.tongueGfx);

    // Initial render at REST
    this.renderControlledMouth(0.0, 0.0);
  }

  /**
   * Development preview control: hold one of the 5 controlled states (0..4) or null to resume live input
   */
  setPreviewState(stateIndex) {
    if (stateIndex === null || stateIndex === undefined) {
      this.debugHoldState = null;
      this.targetMouthOpen = this.isSpeaking ? mapMouthYToLandmarks(this.mouthY) : 0.0;
      return;
    }
    const idx = Number(stateIndex);
    if (CB2_STATES[idx] !== undefined) {
      this.debugHoldState = idx;
      this.targetMouthOpen = CB2_STATES[idx];
      this.targetMouthForm = 0.0;
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
    if (!this.isSpeaking) {
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
      targetOpen = CB2_STATES[this.debugHoldState];
      targetForm = 0.0;
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
    if (!this.mouthCavity || !this.tongueGfx) return;

    // State 0: REST (mouthOpen <= 0.005)
    // Dynamic mouth graphics completely invisible; 100% canonical resting artwork visible
    if (mouthOpen <= 0.005) {
      this.mouthCavity.visible = false;
      this.tongueGfx.visible = false;
      this.mouthCavity.clear();
      this.tongueGfx.clear();
      return;
    }

    this.mouthCavity.visible = true;
    this.mouthCavity.clear();
    this.tongueGfx.clear();

    const m = Math.max(0.0, Math.min(1.0, mouthOpen));
    const form = Math.max(-1.0, Math.min(1.0, Number(mouthForm) || 0.0));

    // ── Layer 1: Deep Warm Burgundy Mouth Cavity (#66141D) ──
    const gCavity = this.mouthCavity;
    gCavity.lineStyle(2.5, 0x140D0F, 0.95);
    gCavity.beginFill(0x66141D, 1.0);

    // Upper boundary: Traces the underside of the canonical smile line
    gCavity.moveTo(CB2_SMILE_LOCAL_PTS[0][0], CB2_SMILE_LOCAL_PTS[0][1]);
    for (let i = 1; i < CB2_SMILE_LOCAL_PTS.length; i++) {
      gCavity.lineTo(CB2_SMILE_LOCAL_PTS[i][0], CB2_SMILE_LOCAL_PTS[i][1]);
    }

    // Lower boundary: Interpolated smoothly between smile contour and maximum open curve
    // Tapers naturally to zero opening at left (-116, -39) and right (+103, -43) corners with 0px drift
    // mouthForm subtly modulates horizontal width without altering the anchored endpoints
    for (let i = 1; i < CB2_LOWER_MAX_SAMPLES.length; i++) {
      const sample = CB2_LOWER_MAX_SAMPLES[i];
      const yCurr = (1.0 - m) * sample.ySmile + m * sample.yMax;

      const maxDist = sample.x < -7.0 ? 109.0 : 110.0;
      const dist = Math.abs(sample.x - (-7.0));
      const tNorm = Math.max(0.0, Math.min(1.0, dist / maxDist));
      const modulation = Math.sin((1.0 - tNorm) * Math.PI);
      const xOffset = form * 6.0 * (sample.x < -7.0 ? -1.0 : 1.0) * modulation;

      gCavity.lineTo(sample.x + xOffset, yCurr);
    }

    gCavity.closePath();
    gCavity.endFill();

    // ── Layer 2: Pink Tongue (#F4718C) in Lower Interior ──
    // Visible only when mouth is sufficiently open (m > 0.30)
    if (m > 0.30) {
      this.tongueGfx.visible = true;
      const gTongue = this.tongueGfx;
      gTongue.lineStyle(1.5, 0xE85D75, 0.9);
      gTongue.beginFill(0xF4718C, 1.0);

      const tProgress = (m - 0.30) / 0.70;
      const scale = 0.40 + 0.60 * tProgress;
      const tRadiusX = 42.0 * scale * (1.0 + 0.10 * form);
      const tRadiusY = 16.0 * scale;

      const tCenterX = -7.0; // Aligned directly on midline
      const botY = (1.0 - m) * (-23.5) + m * 28.0;
      const tCenterY = botY - 5.0 - tRadiusY * 0.70; // Recessed above cavity floor

      // Draw smooth convex tongue chord
      const tongueSteps = 24;
      for (let i = 0; i <= tongueSteps; i++) {
        const rad = (i / tongueSteps) * Math.PI; // Bottom half arc
        const tx = tCenterX + tRadiusX * Math.cos(rad);
        const ty = tCenterY + tRadiusY * Math.sin(rad);
        if (i === 0) {
          gTongue.moveTo(tx, ty);
        } else {
          gTongue.lineTo(tx, ty);
        }
      }
      gTongue.closePath();
      gTongue.endFill();

      // Subtle center tongue groove line for visual depth
      if (m >= 0.50) {
        gTongue.lineStyle(1.5, 0xC85069, 0.75);
        gTongue.moveTo(tCenterX, tCenterY - tRadiusY * 0.30);
        gTongue.lineTo(tCenterX, tCenterY + tRadiusY * 0.40);
      }
    } else {
      this.tongueGfx.visible = false;
    }
  }

  destroy(options) {
    if (typeof window !== 'undefined') {
      if (window.__chhotaBheemPuppet === this) {
        delete window.__chhotaBheemPuppet;
        delete window.__setChhotaBheemPreviewState;
        delete window.__setChhotaBheemMouthOpen;
      }
      if (this._keyHandler) {
        window.removeEventListener('keydown', this._keyHandler);
        this._keyHandler = null;
      }
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

export default ChhotaBheemPuppet;
