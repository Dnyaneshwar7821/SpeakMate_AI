import * as PIXI from 'pixi.js';

/**
 * Cached transparent texture generator for Scooby-Doo (occupying slot 'puppy').
 * Removes contiguous exterior white background at runtime via offscreen canvas
 * while leaving internal whites (eye sclera, pupil highlights) 100% intact.
 * Also removes the detached bottom-left background artifact (X: 0..77, Y: 1410..1490).
 * Original public/models/avatar/ScobbyDoo-Im.png bytes remain completely untouched.
 */
let cachedScoobyCanvas = null;
let cachedScoobyTexture = null;
let isGeneratingTexture = false;
const textureWaiters = [];

export function getScoobyTexture(onReady) {
  if (cachedScoobyTexture && cachedScoobyTexture.baseTexture && !cachedScoobyTexture.baseTexture.destroyed) {
    if (onReady) onReady(cachedScoobyTexture);
    return cachedScoobyTexture;
  }

  if (cachedScoobyCanvas) {
    try {
      cachedScoobyTexture = PIXI.Texture.from(cachedScoobyCanvas);
      if (onReady) onReady(cachedScoobyTexture);
      return cachedScoobyTexture;
    } catch (_) {}
  }

  if (onReady) textureWaiters.push(onReady);

  if (!isGeneratingTexture && typeof window !== 'undefined') {
    isGeneratingTexture = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/models/avatar/ScobbyDoo-Im.png';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 1126;
        canvas.height = img.height || 1536;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Pre-clear detached background artifact box at bottom-left (X: 0..85, Y: 1400..1500)
        ctx.clearRect(0, 1400, 85, 100);

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

        // Tolerance: Outer background pixels have R > 238, G > 238, B > 238 or alpha === 0
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

        // Fast contiguous BFS loop
        while (head < tail) {
          const p = queue[head++];
          const cy = Math.floor(p / w);
          const cx = p % w;
          data[p * 4 + 3] = 0;

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

        // Fade out remaining lower body parts beneath the SD collar medallion (tag tip at Y ≈ 938)
        // Between Y = 940 and Y = 1040, smoothly ramp alpha to 0.0 using hermite curve
        const Y_FADE_START = 940;
        const Y_FADE_END = 1040;
        for (let y = Y_FADE_START; y < h; y++) {
          const t = (y - Y_FADE_START) / (Y_FADE_END - Y_FADE_START);
          const alphaMult = y >= Y_FADE_END ? 0 : 1.0 - (3 * t * t - 2 * t * t * t);
          const rowStart = y * w * 4;
          for (let x = 0; x < w; x++) {
            const aIdx = rowStart + x * 4 + 3;
            if (data[aIdx] > 0) {
              data[aIdx] = Math.round(data[aIdx] * alphaMult);
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        cachedScoobyCanvas = canvas;
        cachedScoobyTexture = PIXI.Texture.from(canvas);
      } catch (err) {
        console.warn('[PuppyPuppet/Scooby] Runtime transparency processing fallback:', err);
        cachedScoobyTexture = PIXI.Texture.from('/models/avatar/ScobbyDoo-Im.png');
      }

      isGeneratingTexture = false;
      while (textureWaiters.length > 0) {
        const cb = textureWaiters.shift();
        if (typeof cb === 'function') cb(cachedScoobyTexture);
      }
    };

    img.onerror = () => {
      cachedScoobyTexture = PIXI.Texture.from('/models/avatar/ScobbyDoo-Im.png');
      isGeneratingTexture = false;
      while (textureWaiters.length > 0) {
        const cb = textureWaiters.shift();
        if (typeof cb === 'function') cb(cachedScoobyTexture);
      }
    };
  }

  return cachedScoobyTexture || PIXI.Texture.from('/models/avatar/ScobbyDoo-Im.png');
}

/**
 * PHASE S2 — SCOOBY-DOO PRECISION ASYMMETRIC MOUTH RIG GEOMETRY
 *
 * S0/S1.1 Verified Constants:
 * Origin (Character BBox Center): (583.5, 796.5)
 * Safe Region: Native X in [276, 425], Y in [530, 600]
 * Local Space: localX = nativeX - 583.5, localY = nativeY - 796.5
 * Left Endpoint: Native (274, 541) -> Local (-309.5, -255.5) [FIXED]
 * Right Apex: Native (470, 404) -> Local (-113.5, -392.5) [FIXED]
 * Right Endpoint: Native (482, 408) -> Local (-101.5, -388.5) [FIXED]
 * Nose: Native X in [183, 324], Y in [340, 429] [FIXED]
 */

// Sampled vertices along exact underside of canonical smile line
export const S2_UPPER_SMILE_LOCAL_PTS = [
  [-309.5, -255.5], // Native (274.0, 541.0) - Left corner notch
  [-301.5, -260.5], // Native (282.0, 536.0)
  [-293.5, -262.5], // Native (290.0, 534.0)
  [-283.5, -261.0], // Native (300.0, 535.5)
  [-271.5, -255.5], // Native (312.0, 541.0)
  [-258.5, -250.0], // Native (325.0, 546.5)
  [-245.5, -246.5], // Native (338.0, 550.0)
  [-231.5, -244.0], // Native (352.0, 552.5) - Central trough
  [-215.5, -244.5], // Native (368.0, 552.0)
  [-198.5, -248.5], // Native (385.0, 548.0)
  [-181.5, -259.0], // Native (402.0, 537.5)
  [-165.5, -275.0], // Native (418.0, 521.5)
  [-151.5, -294.0], // Native (432.0, 502.5)
  [-145.5, -307.5], // Native (438.0, 489.0) - Right smile crease anchor
];

// Target bottom boundary vertices at MAX opening (cleanly envelops resting lower lip)
export const S2_BOT_MAX_LOCAL_PTS = [
  [-309.5, -255.5], // Native (274.0, 541.0) - Left corner notch
  [-297.8, -222.7], // Native (285.7, 573.8) - Cleanly envelops resting lower lip
  [-286.1, -212.7], // Native (297.4, 583.8)
  [-274.4, -206.6], // Native (309.1, 589.9)
  [-262.6, -202.3], // Native (320.9, 594.2)
  [-250.9, -200.6], // Native (332.6, 595.9)
  [-239.2, -199.6], // Native (344.3, 596.9) - Lowest jaw drop floor
  [-227.5, -199.8], // Native (356.0, 596.7)
  [-215.8, -201.7], // Native (367.7, 594.8)
  [-204.1, -205.1], // Native (379.4, 591.4)
  [-192.4, -212.6], // Native (391.1, 583.9)
  [-180.6, -223.5], // Native (402.9, 573.0)
  [-168.9, -240.9], // Native (414.6, 555.6)
  [-157.2, -267.3], // Native (426.3, 529.2)
  [-145.5, -307.5], // Native (438.0, 489.0) - Right smile crease anchor
];

export function interpLocalPts(pts, x) {
  if (x <= pts[0][0]) return pts[0][1];
  const last = pts[pts.length - 1];
  if (x >= last[0]) return last[1];
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    if (x >= p1[0] && x <= p2[0]) {
      const frac = (x - p1[0]) / (p2[0] - p1[0]);
      return p1[1] + frac * (p2[1] - p1[1]);
    }
  }
  return last[1];
}

export function getUpperSmileY(x) {
  return interpLocalPts(S2_UPPER_SMILE_LOCAL_PTS, x);
}

export function getBotMaxY(x) {
  return interpLocalPts(S2_BOT_MAX_LOCAL_PTS, x);
}

export const S2_STATES = {
  0: 0.00, // REST    (0 px opening)
  1: 0.23, // SLIGHT  (~11.0 px opening, target 10-12 px)
  2: 0.51, // MEDIUM  (~24.2 px opening, target 20-28 px)
  3: 0.76, // LARGE   (~36.1 px opening, target 32-40 px)
  4: 1.00, // MAX     (~47.5 px opening, target 45-50 px)
};

/**
 * Maps incoming normalized mouthY (0.0 to 1.0) continuously through the 5 animation landmarks.
 */
export function mapMouthYToLandmarks(y) {
  const clampedY = Math.max(0.0, Math.min(1.0, Number(y) || 0.0));
  if (clampedY <= 0.05) return 0.0;
  if (clampedY <= 0.20) {
    const t = (clampedY - 0.05) / 0.15;
    return t * 0.23;
  }
  if (clampedY <= 0.45) {
    const t = (clampedY - 0.20) / 0.25;
    return 0.23 + t * (0.51 - 0.23);
  }
  if (clampedY <= 0.70) {
    const t = (clampedY - 0.45) / 0.25;
    return 0.51 + t * (0.76 - 0.51);
  }
  const t = (clampedY - 0.70) / 0.30;
  return 0.76 + t * (1.00 - 0.76);
}

/**
 * Scooby-Doo Puppet (occupying existing persisted slot 'puppy')
 *
 * Phase S2.1: Natural full mouth opening (~47.5 px MAX depth) + small subtle tongue refinement.
 * Preserves three-quarter canine perspective, strictly protects fixed right cheek contour,
 * keeps nose completely static, stays inside safe region, and features smooth interpolation.
 */
export class PuppyPuppet extends PIXI.Container {
  constructor() {
    super();
    this.name = 'PuppyPuppet';
    this.isPuppyPuppet = true;

    // Standard Lip-Sync Contract (consumed by useLipSync.js)
    this._mouthY = 0.0;
    this._mouthForm = 0.0;
    this._isSpeaking = false;
    this.currentMood = 'happy';

    // Animation interpolation state
    this.targetMouthOpen = 0.0;
    this.targetMouthForm = 0.0;
    this.currentMouthOpen = 0.0;
    this.currentMouthForm = 0.0;
    this.debugHoldState = null;
    this.debugHoldForm = 0.0;

    // Development preview hook
    if (typeof window !== 'undefined') {
      window.__scoobyPuppet = this;
    }

    this.initRig();
  }

  get mouthY() {
    return this._mouthY;
  }
  set mouthY(val) {
    this._mouthY = Math.max(0, Math.min(1.0, Number(val) || 0));
  }

  get mouthForm() {
    return this._mouthForm;
  }
  set mouthForm(val) {
    this._mouthForm = Math.max(-1.0, Math.min(1.0, Number(val) || 0));
  }

  get isSpeaking() {
    return this._isSpeaking;
  }
  set isSpeaking(val) {
    this._isSpeaking = Boolean(val);
  }

  initRig() {
    this.rootContainer = new PIXI.Container();
    this.addChild(this.rootContainer);

    // Uniformly scaled Content Container (Upper-Bust Portrait Framing)
    // Scale 0.36 with offset (53.5, 117.5) frames Scooby-Doo's head, collar, and SD tag prominently (~2x larger)
    this.contentContainer = new PIXI.Container();
    this.contentContainer.scale.set(0.36);
    this.contentContainer.position.set(53.5, 117.5);
    this.rootContainer.addChild(this.contentContainer);

    // 1. Base Canonical Scooby-Doo Sprite (Untouched original canonical artwork)
    const initialTexture = getScoobyTexture((readyTexture) => {
      if (this.sprite && readyTexture) {
        this.sprite.texture = readyTexture;
      }
    });

    this.sprite = new PIXI.Sprite(initialTexture);
    // Verified character bounding box center (X=583.5, Y=796.5 in 1126x1536 artwork)
    this.sprite.anchor.set(583.5 / 1126, 796.5 / 1536);
    this.sprite.position.set(0, 0);
    this.contentContainer.addChild(this.sprite);

    // 2. Procedural Asymmetric Mouth Rig Container (shares origin (0, 0) with sprite center)
    this.mouthRig = new PIXI.Container();
    this.mouthRig.position.set(0, 0);
    this.contentContainer.addChild(this.mouthRig);

    // Deep warm brown/near-black oral cavity (#1F0B06) with dark contour (#0F0502)
    this.mouthCavity = new PIXI.Graphics();
    this.mouthRig.addChild(this.mouthCavity);

    // Small subtle tongue (#C26470) with subtle darker contour (#7E2C37)
    this.tongueGraphics = new PIXI.Graphics();
    this.mouthRig.addChild(this.tongueGraphics);

    // Outer contour lines
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
    this.currentMouthOpen = S2_STATES[this.debugHoldState];
    this.currentMouthForm = this.debugHoldForm;
    this.renderControlledMouth(this.currentMouthOpen, this.currentMouthForm);
  }

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
    if (!this.isSpeaking) {
      this.mouthY = 0;
      this.targetMouthOpen = 0.0;
      this.targetMouthForm = 0.0;
      this.currentMouthOpen = 0.0;
      this.currentMouthForm = 0.0;
      this.debugHoldState = null;
      this.renderControlledMouth(0.0, 0.0);
    }
  }

  setMood(mood) {
    this.currentMood = mood;
  }

  update(_timeMs) {
    let targetOpen = this.targetMouthOpen;
    let targetForm = this.targetMouthForm;

    if (this.debugHoldState !== null) {
      targetOpen = S2_STATES[this.debugHoldState] ?? 0.0;
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
      if (this.debugHoldState === null && this.currentMouthOpen < 0.04) {
        this.currentMouthOpen = 0.0;
        this.currentMouthForm = 0.0;
      }
    }

    this.renderControlledMouth(this.currentMouthOpen, this.currentMouthForm);
  }

  /**
   * Phase S2.1 Dynamic Asymmetric Mouth & Tongue Renderer
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

    const spanMod = 1.0 + form * 0.03;
    const midX = -233.5;
    const xStart = -309.5;
    const xEnd = -145.5;

    const steps = 60;
    const topPts = [];
    const botPts = [];

    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const baseX = xStart + u * (xEnd - xStart);
      const x = midX + (baseX - midX) * spanMod;

      const yTop = getUpperSmileY(baseX);
      const yBotMax = getBotMaxY(baseX);
      const yBot = yTop + m * (yBotMax - yTop);

      topPts.push({ x, y: yTop });
      botPts.push({ x, y: yBot });
    }

    // 1. Fill deep warm brown-black oral cavity (#1F0B06)
    const g = this.mouthCavity;
    g.beginFill(0x1F0B06, 1.0);

    g.moveTo(topPts[0].x, topPts[0].y);
    for (let i = 1; i < topPts.length; i++) {
      g.lineTo(topPts[i].x, topPts[i].y);
    }
    for (let i = botPts.length - 1; i >= 0; i--) {
      g.lineTo(botPts[i].x, botPts[i].y);
    }
    g.closePath();
    g.endFill();

    // 2. Draw organic rounded tongue inside cavity if mouthOpen >= 0.18
    if (m >= 0.18) {
      const tReveal = Math.max(0.0, Math.min(1.0, (m - 0.18) / 0.82));
      const tW = (20.0 + 22.0 * tReveal) * (1.0 + form * 0.08);
      const tH = (5.0 + 14.0 * tReveal) * (1.0 - form * 0.10);

      const tCx = midX + form * 3.0;
      const tYTop = getUpperSmileY(tCx);
      const tYBotMax = getBotMaxY(tCx);
      const floorY = tYTop + m * (tYBotMax - tYTop);

      const tBot = floorY - 2.5;
      const tTop = tBot - tH;
      const tLeft = tCx - tW / 2.0;
      const tRight = tCx + tW / 2.0;
      const yCp = tTop - tH / 3.0;

      const tg = this.tongueGraphics;
      tg.beginFill(0xC26470, 1.0);
      tg.lineStyle(2.0, 0x7E2C37, 1.0);
      tg.moveTo(tLeft, tBot);
      tg.bezierCurveTo(tLeft, yCp, tRight, yCp, tRight, tBot);
      tg.lineTo(tLeft, tBot);
      tg.closePath();
      tg.endFill();
    }

    // 3. Crisp outer contours
    const mb = this.mouthBorder || g;
    // Lower lip contour
    mb.lineStyle(3.0, 0x0F0502, 1.0);
    mb.moveTo(botPts[0].x, botPts[0].y);
    for (let i = 1; i < botPts.length; i++) {
      mb.lineTo(botPts[i].x, botPts[i].y);
    }
    // Upper lip contour
    mb.lineStyle(3.5, 0x0F0502, 1.0);
    mb.moveTo(topPts[0].x, topPts[0].y);
    for (let i = 1; i < topPts.length; i++) {
      mb.lineTo(topPts[i].x, topPts[i].y);
    }
  }

  destroy(options) {
    if (typeof window !== 'undefined' && window.__scoobyPuppet === this) {
      delete window.__scoobyPuppet;
    }
    if (this.mouthBorder) {
      try { this.mouthBorder.destroy({ children: true }); } catch (_) {}
      this.mouthBorder = null;
    }
    if (this.tongueGraphics) {
      try { this.tongueGraphics.destroy({ children: true }); } catch (_) {}
      this.tongueGraphics = null;
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

export { PuppyPuppet as ScoobyDooPuppet };
