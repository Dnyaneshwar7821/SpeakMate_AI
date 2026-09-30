import * as PIXI from 'pixi.js';

/**
 * Cached transparent texture generator for SpongeBob SquarePants.
 * Removes contiguous exterior white background (#FFFFFF) at runtime via offscreen canvas
 * while leaving internal whites (eyes, buck teeth, white shirt, highlights) 100% intact.
 * Original public/models/avatar/spongebob/SpongeBob-Im.png bytes remain completely untouched.
 */
let cachedSpongeBobTexture = null;
let isGeneratingTexture = false;
const textureWaiters = [];

function getSpongeBobTexture(onReady) {
  if (cachedSpongeBobTexture) {
    if (onReady) onReady(cachedSpongeBobTexture);
    return cachedSpongeBobTexture;
  }

  if (onReady) textureWaiters.push(onReady);

  if (!isGeneratingTexture && typeof window !== 'undefined') {
    isGeneratingTexture = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/models/avatar/spongebob/SpongeBob-Im.png';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 2816;
        canvas.height = img.height || 1536;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // BFS flood fill starting from borders to only make outer white background transparent
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

        // Top and bottom rows
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

        // Left and right columns
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
        cachedSpongeBobTexture = PIXI.Texture.from(canvas);
      } catch (err) {
        console.warn('[SpongeBobPuppet] Runtime transparency processing fallback:', err);
        cachedSpongeBobTexture = PIXI.Texture.from('/models/avatar/spongebob/SpongeBob-Im.png');
      }

      isGeneratingTexture = false;
      while (textureWaiters.length > 0) {
        const cb = textureWaiters.shift();
        if (typeof cb === 'function') cb(cachedSpongeBobTexture);
      }
    };

    img.onerror = () => {
      cachedSpongeBobTexture = PIXI.Texture.from('/models/avatar/spongebob/SpongeBob-Im.png');
      isGeneratingTexture = false;
      while (textureWaiters.length > 0) {
        const cb = textureWaiters.shift();
        if (typeof cb === 'function') cb(cachedSpongeBobTexture);
      }
    };
  }

  return cachedSpongeBobTexture || PIXI.Texture.from('/models/avatar/spongebob/SpongeBob-Im.png');
}

/**
 * PHASE SB3 — SPONGEBOB REAL-TIME LIP-SYNC INTEGRATION
 *
 * Connects the approved frozen 5-state SpongeBob mouth rig to SpeakMateAI's
 * real-time lip-sync pipeline (useLipSync.js + PhoneticVisemeEngine.js + EventBus).
 *
 * Invariants:
 * 1. Endpoints FROZEN: Left (-170, -189), Right (253, -191) [Span: 423px].
 * 2. Five Animation Landmarks:
 *    - REST:    0.00
 *    - SLIGHT:  0.22
 *    - MEDIUM:  0.45
 *    - LARGE:   0.72
 *    - MAXIMUM: 1.00 (Ceiling)
 * 3. Continuous morphing between landmarks without discrete snapping.
 * 4. Two buck teeth anchored flush against upper smile line (tucked 1.0px into curved getSmileY) with canonical dimensions (width ~57px, bottom at Y = -62.5).
 * 5. Progressive tongue emergence (hidden at REST/SLIGHT, emerging at MEDIUM, full at MAXIMUM).
 * 6. Smooth return to REST upon speech finish or user interruption.
 */

// 25 Sampled Vertices along exact underside of black smile line (Origin: 1408, 768)
const SMILE_LOCAL_PTS = [
  [-170, -189], // Exact Left Smile Anchor at left cheek dimple
  [-152, -186],
  [-135, -168],
  [-117, -155],
  [-100, -145],
  [ -82, -137],
  [ -64, -129],
  [ -47, -123],
  [ -29, -118],
  [ -11, -115],
  [   6, -112],
  [  24, -111],
  [  42, -109], // Facial midline below nose tip (Image 1450)
  [  59, -111],
  [  77, -112],
  [  94, -114],
  [ 112, -117],
  [ 130, -122],
  [ 147, -128],
  [ 165, -135],
  [ 182, -144],
  [ 200, -155],
  [ 218, -169],
  [ 235, -186],
  [ 253, -191], // Exact Right Smile Anchor at right cheek dimple
];

function getSmileY(x) {
  if (x <= SMILE_LOCAL_PTS[0][0]) return SMILE_LOCAL_PTS[0][1];
  const last = SMILE_LOCAL_PTS[SMILE_LOCAL_PTS.length - 1];
  if (x >= last[0]) return last[1];
  for (let i = 0; i < SMILE_LOCAL_PTS.length - 1; i++) {
    const p1 = SMILE_LOCAL_PTS[i];
    const p2 = SMILE_LOCAL_PTS[i + 1];
    if (x >= p1[0] && x <= p2[0]) {
      const frac = (x - p1[0]) / (p2[0] - p1[0]);
      return p1[1] + frac * (p2[1] - p1[1]);
    }
  }
  return -109.0;
}

// Precomputed lower boundary points at maximum opening
// Right: (253, -191) -> CP (245, -15) -> Bottom Center (42, -10) [Image (1450, 758)]
// Left:  (42, -10)   -> CP (-165, -15) -> Left Anchor (-170, -189)
const LOWER_MAX_SAMPLES = (() => {
  const pts = [];
  pts.push({ x: 253.0, yMax: -191.0, ySmile: getSmileY(253.0) });
  const steps = 30;
  // Right side: from (253, -191) to (42, -10) with CP (245, -15)
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) * (1 - t) * 253.0 + 2 * (1 - t) * t * 245.0 + t * t * 42.0;
    const yMax = (1 - t) * (1 - t) * (-191.0) + 2 * (1 - t) * t * (-15.0) + t * t * (-10.0);
    pts.push({ x, yMax, ySmile: getSmileY(x) });
  }
  // Left side: from (42, -10) to (-170, -189) with CP (-165, -15)
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) * (1 - t) * 42.0 + 2 * (1 - t) * t * (-165.0) + t * t * (-170.0);
    const yMax = (1 - t) * (1 - t) * (-10.0) + 2 * (1 - t) * t * (-15.0) + t * t * (-189.0);
    pts.push({ x, yMax, ySmile: getSmileY(x) });
  }
  return pts;
})();

export const SB25_STATES = {
  0: 0.00, // REST
  1: 0.22, // SLIGHT
  2: 0.45, // MEDIUM
  3: 0.72, // LARGE
  4: 1.00, // MAXIMUM
};

/**
 * Maps incoming normalized mouthY (0.0 to 1.0) continuously through the 5 approved animation landmarks.
 * Clamps strictly at 1.00 (maximum approved ceiling).
 */
export function mapMouthYToLandmarks(y) {
  const clampedY = Math.max(0.0, Math.min(1.0, Number(y) || 0.0));
  // Below rest threshold (0.06): return 0.0 (REST)
  if (clampedY <= 0.06) {
    return 0.0;
  }
  // 0.06 -> 0.20 maps smoothly to 0.00 -> 0.22 (SLIGHT)
  if (clampedY <= 0.20) {
    const t = (clampedY - 0.06) / 0.14;
    return t * 0.22;
  }
  // 0.20 -> 0.40 maps smoothly to 0.22 -> 0.45 (MEDIUM)
  if (clampedY <= 0.40) {
    const t = (clampedY - 0.20) / 0.20;
    return 0.22 + t * (0.45 - 0.22);
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
  // 0.85 -> 1.00: saturated at approved MAXIMUM ceiling
  return 1.00;
}

export class SpongeBobPuppet extends PIXI.Container {
  constructor() {
    super();
    this.name = 'SpongeBobPuppet';
    this.isSpongeBobPuppet = true;

    // Speech & Lip-Sync State (consumed from useLipSync.js)
    this._mouthY = 0.0;
    this.smoothMouthY = 0.0;
    this._mouthForm = 0.0;
    this.smoothMouthForm = 0.0;
    this._isSpeaking = false;

    // Continuous Animation Interpolation State
    this.currentMouthOpen = 0.0;
    this.targetMouthOpen = 0.0;
    this.currentMouthForm = 0.0;
    this.targetMouthForm = 0.0;
    this.debugHoldState = null; // null | 0 | 1 | 2 | 3 | 4

    // Development preview hooks for developer console verification
    if (typeof window !== 'undefined') {
      window.__spongeBobPuppet = this;
      window.__setSpongeBobPreviewState = (stateIdx) => this.setPreviewState(stateIdx);
      window.__setSpongeBobMouthOpen = (openVal, formVal) => this.setMouthOpen(openVal, formVal);
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

    // Uniformly scaled content container so Sprite & Overlays share exact 2816x1536 local space
    // Center of 2816x1536 is (1408, 768)
    this.contentContainer = new PIXI.Container();
    this.contentContainer.scale.set(0.20);
    this.rootContainer.addChild(this.contentContainer);

    // 1. Base Canonical SpongeBob Sprite (Untouched original artwork)
    const initialTexture = getSpongeBobTexture((readyTexture) => {
      if (this.sprite && readyTexture) {
        this.sprite.texture = readyTexture;
      }
    });

    this.sprite = new PIXI.Sprite(initialTexture);
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.position.set(0, 0);
    this.contentContainer.addChild(this.sprite);

    // 2. Coherent Procedural Mouth Rig Container
    this.mouthRig = new PIXI.Container();
    this.contentContainer.addChild(this.mouthRig);

    // Layer A: Dark warm-red mouth cavity (#6B121A)
    this.mouthCavity = new PIXI.Graphics();
    this.mouthRig.addChild(this.mouthCavity);

    // Layer B: Plump pink tongue (#F4718C) in lower cavity interior
    this.tongueGfx = new PIXI.Graphics();
    this.mouthRig.addChild(this.tongueGfx);

    // Layer C: Two iconic buck teeth anchored flush to upper mouth structure
    this.teethGfx = new PIXI.Graphics();
    this.mouthRig.addChild(this.teethGfx);

    // Initial render at REST
    this.renderControlledMouth(0.0, 0.0);
  }

  /**
   * Development preview control: hold one of the 5 controlled states (0..4) or null to resume live speech
   */
  setPreviewState(stateIndex) {
    if (stateIndex === null || stateIndex === undefined) {
      this.debugHoldState = null;
      this.targetMouthOpen = this.isSpeaking ? mapMouthYToLandmarks(this.mouthY) : 0.0;
      return;
    }
    const idx = Number(stateIndex);
    if (SB25_STATES[idx] !== undefined) {
      this.debugHoldState = idx;
      this.targetMouthOpen = SB25_STATES[idx];
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

  update(timeMs) {
    const now = typeof timeMs === 'number' ? timeMs : (typeof performance !== 'undefined' ? performance.now() : 0);

    // Subtle synchronized gentle breathing
    const breathe = Math.sin(now * 0.0015) * 0.003;
    if (this.contentContainer) {
      this.contentContainer.scale.set(0.20 + breathe, 0.20 - breathe * 0.5);
    }

    // Determine target mouth open state
    let targetOpen = this.targetMouthOpen;
    let targetForm = this.targetMouthForm;

    if (this.debugHoldState !== null) {
      targetOpen = SB25_STATES[this.debugHoldState];
      targetForm = 0.0;
    } else if (!this.isSpeaking) {
      targetOpen = 0.0;
      targetForm = 0.0;
    }

    // Fast-attack lerp on opening, smooth natural release on closing
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
    if (!this.mouthCavity || !this.tongueGfx || !this.teethGfx) return;

    // State 0: REST (mouthOpen <= 0.005)
    // Dynamic mouth disappears completely; canonical SpongeBob smile visible as supplied
    if (mouthOpen <= 0.005) {
      this.mouthCavity.visible = false;
      this.tongueGfx.visible = false;
      this.teethGfx.visible = false;
      this.mouthCavity.clear();
      this.tongueGfx.clear();
      this.teethGfx.clear();
      return;
    }

    this.mouthCavity.visible = true;
    this.teethGfx.visible = true;

    this.mouthCavity.clear();
    this.tongueGfx.clear();
    this.teethGfx.clear();

    const m = Math.max(0.0, Math.min(1.0, mouthOpen));
    const form = Math.max(-1.0, Math.min(1.0, Number(mouthForm) || 0.0));

    // ── Layer 1: Dark Warm-Red Mouth Cavity (#6B121A) ──
    // Upper boundary exactly traces the underside of the black smile line from Left Anchor to Right Anchor
    const gCavity = this.mouthCavity;
    gCavity.beginFill(0x6B121A, 1.0);
    gCavity.moveTo(SMILE_LOCAL_PTS[0][0], SMILE_LOCAL_PTS[0][1]);

    for (let i = 1; i < SMILE_LOCAL_PTS.length; i++) {
      gCavity.lineTo(SMILE_LOCAL_PTS[i][0], SMILE_LOCAL_PTS[i][1]);
    }

    // Lower boundary: Interpolated smoothly between smile contour and maximum open curve
    // Tapers naturally to zero opening at left and right corners with zero protruding points
    // mouthForm subtly articulates the base width without shifting the anchored endpoints
    const openProg = Math.pow(m, 0.72);
    for (let i = 1; i < LOWER_MAX_SAMPLES.length; i++) {
      const sample = LOWER_MAX_SAMPLES[i];
      const yCurr = (1.0 - openProg) * sample.ySmile + openProg * sample.yMax;
      
      // Subtle horizontal articulation based on mouthForm (endpoints at -170 and 253 remain fixed)
      const distFromCenter = (sample.x - 42.0) / 200.0;
      const taper = 1.0 - Math.min(1.0, Math.abs(distFromCenter));
      const xOffset = form * 8.0 * distFromCenter * taper;

      gCavity.lineTo(sample.x + xOffset, yCurr);
    }

    gCavity.closePath();
    gCavity.endFill();

    // ── Layer 2: Tongue (#F4718C) in Lower Interior ──
    if (m > 0.30) {
      this.tongueGfx.visible = true;
      const gTongue = this.tongueGfx;
      gTongue.beginFill(0xF4718C, 1.0);

      const tProgress = (m - 0.30) / 0.70;
      const scale = 0.40 + 0.60 * tProgress;
      const tRadiusX = 70.0 * scale * (1.0 + 0.10 * form);
      const tRadiusY = 22.0 * scale;

      const tCenterX = 42.0; // Aligned directly beneath nose midline
      const botY = (1.0 - m) * (-109.0) + m * (-10.0);
      const tCenterY = botY - 8.0 - tRadiusY * 0.75; // Recessed 8px above cavity floor

      const tongueSteps = 36;
      for (let i = 0; i <= tongueSteps; i++) {
        const rad = (i / tongueSteps) * Math.PI * 2;
        const ry = Math.sin(rad) < 0 ? tRadiusY : tRadiusY * 0.75;
        const tx = tCenterX + tRadiusX * Math.cos(rad);
        const ty = tCenterY + ry * Math.sin(rad);
        if (i === 0) {
          gTongue.moveTo(tx, ty);
        } else {
          gTongue.lineTo(tx, ty);
        }
      }
      gTongue.closePath();
      gTongue.endFill();

      // Subtle center groove line for tongue when clearly visible
      if (m >= 0.50) {
        gTongue.lineStyle(2.0, 0xC85069, 0.85);
        gTongue.moveTo(tCenterX, tCenterY - tRadiusY * 0.50);
        gTongue.lineTo(tCenterX, tCenterY + tRadiusY * 0.20);
      }
    } else {
      this.tongueGfx.visible = false;
    }

    // ── Layer 3: Two Iconic Buck Teeth (Perfect Curved Attachment & Canonical Dimensions) ──
    // Left tooth: [-17.5, 39.5] (width = 57.0px), Right tooth: [65.5, 123.5] (width = 58.0px)
    // Anchored seamlessly to the curved smile line (getSmileY) with 1.0px tuck for 100% zero-gap coverage
    const gTeeth = this.teethGfx;
    const teethDef = [
      { x1: -17.5, x2: 39.5 },
      { x1: 65.5, x2: 123.5 }
    ];
    const yBottom = -62.5;
    const tuckY = 1.0;
    const toothSteps = 20;

    for (const tooth of teethDef) {
      const { x1, x2 } = tooth;

      // 1. Tooth Body Fill (pure cartoon white)
      gTeeth.lineStyle(0);
      gTeeth.beginFill(0xFFFFFF, 1.0);
      gTeeth.moveTo(x1, yBottom);
      gTeeth.lineTo(x2, yBottom);
      for (let s = 0; s <= toothSteps; s++) {
        const sx = x2 - (s / toothSteps) * (x2 - x1);
        const sy = getSmileY(sx) - tuckY;
        gTeeth.lineTo(sx, sy);
      }
      gTeeth.closePath();
      gTeeth.endFill();

      // 2. Canonical Cel Shading (#D8E3E8) under upper lip
      gTeeth.beginFill(0xD8E3E8, 1.0);
      gTeeth.moveTo(x1, getSmileY(x1) - tuckY);
      for (let s = 1; s <= toothSteps; s++) {
        const sx = x1 + (s / toothSteps) * (x2 - x1);
        const sy = getSmileY(sx) - tuckY;
        gTeeth.lineTo(sx, sy);
      }
      for (let s = toothSteps; s >= 0; s--) {
        const sx = x1 + (s / toothSteps) * (x2 - x1);
        const sy = getSmileY(sx) + 5.5;
        gTeeth.lineTo(sx, sy);
      }
      gTeeth.closePath();
      gTeeth.endFill();

      // 3. Bold Cartoon Ink Outlines (#1E140F) along left edge, bottom edge, and right edge
      gTeeth.lineStyle(3.5, 0x1E140F, 1.0);
      gTeeth.moveTo(x1, getSmileY(x1) - tuckY);
      gTeeth.lineTo(x1, yBottom);
      gTeeth.lineTo(x2, yBottom);
      gTeeth.lineTo(x2, getSmileY(x2) - tuckY);
    }
  }

  renderMaximumMouth() {
    this.renderControlledMouth(1.0, 0.0);
  }

  destroy(options) {
    if (typeof window !== 'undefined' && window.__spongeBobPuppet === this) {
      delete window.__spongeBobPuppet;
      delete window.__setSpongeBobPreviewState;
      delete window.__setSpongeBobMouthOpen;
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
    if (this.teethGfx) {
      try { this.teethGfx.destroy(options); } catch (_) {}
      this.teethGfx = null;
    }
    if (this.sprite) {
      try { this.sprite.destroy(options); } catch (_) {}
      this.sprite = null;
    }
    super.destroy(options);
  }
}

export default SpongeBobPuppet;
