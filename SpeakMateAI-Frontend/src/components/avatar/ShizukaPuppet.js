import * as PIXI from 'pixi.js';

/**
 * Cached transparent texture generator for Shizuka.
 * Removes contiguous exterior white background (#FFFFFF) at runtime via offscreen canvas
 * while leaving internal whites (eyes, collar, details) 100% intact.
 * Original public/models/avatar/shizuku/Shizuka_Im.png bytes remain completely untouched.
 */
let cachedShizukaTexture = null;
let isGeneratingTexture = false;
const textureWaiters = [];

function getShizukaTexture(onReady) {
  if (cachedShizukaTexture) {
    if (onReady) onReady(cachedShizukaTexture);
    return cachedShizukaTexture;
  }

  if (onReady) textureWaiters.push(onReady);

  if (!isGeneratingTexture && typeof window !== 'undefined') {
    isGeneratingTexture = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/models/avatar/shizuku/Shizuka_Im.png';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 2048;
        canvas.height = img.height || 2048;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const w = canvas.width;
        const h = canvas.height;

        // BFS flood fill starting from borders to only make outer white background transparent
        const visited = new Uint8Array(w * h);
        const queue = [];

        // Seed with top row, bottom row, left col, right col
        const isWhite = (idx) => data[idx] > 240 && data[idx + 1] > 240 && data[idx + 2] > 240;

        for (let x = 0; x < w; x++) {
          const topIdx = (0 * w + x) * 4;
          if (isWhite(topIdx)) {
            visited[0 * w + x] = 1;
            queue.push(0, x);
          }
          const botIdx = ((h - 1) * w + x) * 4;
          if (isWhite(botIdx)) {
            visited[(h - 1) * w + x] = 1;
            queue.push(h - 1, x);
          }
        }
        for (let y = 0; y < h; y++) {
          const leftIdx = (y * w + 0) * 4;
          if (!visited[y * w + 0] && isWhite(leftIdx)) {
            visited[y * w + 0] = 1;
            queue.push(y, 0);
          }
          const rightIdx = (y * w + (w - 1)) * 4;
          if (!visited[y * w + (w - 1)] && isWhite(rightIdx)) {
            visited[y * w + (w - 1)] = 1;
            queue.push(y, w - 1);
          }
        }

        let head = 0;
        while (head < queue.length) {
          const cy = queue[head++];
          const cx = queue[head++];
          const pIdx = (cy * w + cx) * 4;
          data[pIdx + 3] = 0; // Alpha = 0 for outer background

          // 4-way neighbors
          if (cy > 0) {
            const up = (cy - 1) * w + cx;
            if (!visited[up] && isWhite(up * 4)) {
              visited[up] = 1;
              queue.push(cy - 1, cx);
            }
          }
          if (cy < h - 1) {
            const down = (cy + 1) * w + cx;
            if (!visited[down] && isWhite(down * 4)) {
              visited[down] = 1;
              queue.push(cy + 1, cx);
            }
          }
          if (cx > 0) {
            const left = cy * w + (cx - 1);
            if (!visited[left] && isWhite(left * 4)) {
              visited[left] = 1;
              queue.push(cy, cx - 1);
            }
          }
          if (cx < w - 1) {
            const right = cy * w + (cx + 1);
            if (!visited[right] && isWhite(right * 4)) {
              visited[right] = 1;
              queue.push(cy, cx + 1);
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        cachedShizukaTexture = PIXI.Texture.from(canvas);
      } catch (err) {
        console.warn('[ShizukaPuppet] Runtime transparency processing fallback:', err);
        cachedShizukaTexture = PIXI.Texture.from('/models/avatar/shizuku/Shizuka_Im.png');
      }

      isGeneratingTexture = false;
      while (textureWaiters.length > 0) {
        const cb = textureWaiters.shift();
        if (typeof cb === 'function') cb(cachedShizukaTexture);
      }
    };

    img.onerror = () => {
      cachedShizukaTexture = PIXI.Texture.from('/models/avatar/shizuku/Shizuka_Im.png');
      isGeneratingTexture = false;
      while (textureWaiters.length > 0) {
        const cb = textureWaiters.shift();
        if (typeof cb === 'function') cb(cachedShizukaTexture);
      }
    };
  }

  return cachedShizukaTexture || PIXI.Texture.from('/models/avatar/shizuku/Shizuka_Im.png');
}

/**
 * 2D Shizuka Rig with Dynamic Anime Lip-Sync Mouth Renderer
 * Built with pure PixiJS v7 vector graphics matching the SpeakMate avatar architecture.
 * Preserves the canonical Shizuka_Im.png artwork while providing real-time phonetic lip-sync.
 */
export class ShizukaPuppet extends PIXI.Container {
  constructor() {
    super();
    this.name = 'ShizukaPuppet';
    this.isShizukaPuppet = true;

    // Speech & Lip-Sync State
    this._mouthY = 0;
    this.smoothMouthY = 0;
    this._mouthForm = 0;
    this.smoothMouthForm = 0;
    this._isSpeaking = false;
    this.currentMood = 'neutral';
    this.isHappy = true;

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
    this._isSpeaking = Boolean(val);
  }

  initRig() {
    this.rootContainer = new PIXI.Container();
    this.addChild(this.rootContainer);

    // Uniformly scaled content container so Sprite & Mouth share identical local coordinates
    // Source canonical image is 2048x2048 centered at (0, 0)
    // Scale 0.18 brings 2048px to ~368px standard puppet viewport scale
    this.contentContainer = new PIXI.Container();
    this.contentContainer.scale.set(0.18);
    this.rootContainer.addChild(this.contentContainer);

    // 1. Base Canonical Shizuka Sprite
    const initialTexture = getShizukaTexture((readyTexture) => {
      if (this.sprite && readyTexture) {
        this.sprite.texture = readyTexture;
      }
    });

    this.sprite = new PIXI.Sprite(initialTexture);
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.position.set(0, 0);
    this.contentContainer.addChild(this.sprite);

    // 2. Dynamic Mouth Layer (shares exact 2048x2048 local coordinate space with sprite)
    this.mouthGfx = new PIXI.Graphics();
    this.mouthGfx.position.set(0, 0);
    this.contentContainer.addChild(this.mouthGfx);

    // Draw initial validated resting smile
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

  /**
   * Frame update called by PixiJS Application ticker
   */
  update(_now) {
    const active = Boolean(this.isSpeaking && this.mouthY > 0.02);
    const targetY = active ? this.mouthY : 0.0;
    const targetForm = active ? this.mouthForm : 0.0;

    // Fast snappy attack on opening (0.55), smooth natural release on closing (0.45)
    const isOpening = targetY > this.smoothMouthY;
    const lerpRate = active ? (isOpening ? 0.55 : 0.45) : 0.50;

    this.smoothMouthY += (targetY - this.smoothMouthY) * lerpRate;
    this.smoothMouthForm += (targetForm - this.smoothMouthForm) * lerpRate;

    // Clamp micro-movements when idle
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
      this.isSpeaking !== this.lastRenderedSpeakingState
    ) {
      this.renderMouth(this.smoothMouthY, this.smoothMouthForm, this.isSpeaking);
      this.lastRenderedMouthY = quantY;
      this.lastRenderedMouthForm = quantForm;
      this.lastRenderedSpeakingState = this.isSpeaking;
    }
  }

  /**
   * High-fidelity anime mouth rendering in local 2048x2048 coordinates
   * Origin: (0, 0) is image center (1024, 1024)
   * Local Landmarks:
   *   Mouth Center: (+8, -392)
   *   Nose Tip: (+15, -424)
   *   Chin Contour: (+3, -324)
   */
  renderMouth(mouthY, mouthForm, isSpeaking) {
    const g = this.mouthGfx;
    g.clear();

    const cx = 8;
    const cy = -392;

    // S1 Concealment: Soft rounded rectangle covering baked-in smile
    // X span: [-72, +88], Y span: [-422, -362]
    // Completely conceals baked smile while clearing nose (+15, -424) and chin (+3, -324)
    g.beginFill(0xF9C8A7);
    g.drawRoundedRect(cx - 80, cy - 30, 160, 60, 24);
    g.endFill();

    // ── 1. RESTING STATE (FROZEN S1 BASELINE) ──
    if (mouthY < 0.08 || !isSpeaking) {
      // Lower lip shadow crease: (-8, -373) to (+28, -373)
      g.lineStyle(1.8, 0x6A3E36, 0.95);
      g.moveTo(cx - 16, cy + 19);
      g.lineTo(cx + 20, cy + 19);

      // Delicate upper smile arc: from (-56, -414) through (+8, -394) to (+70, -417)
      g.lineStyle(2.6, 0x130000, 1.0);
      g.moveTo(cx - 64, cy - 22);
      g.quadraticCurveTo(cx, cy - 2, cx + 62, cy - 25);

      // Subtle upward corner accents
      g.lineStyle(1.8, 0x130000, 0.85);
      g.moveTo(cx - 64, cy - 22);
      g.lineTo(cx - 68, cy - 26);
      g.moveTo(cx + 62, cy - 25);
      g.lineTo(cx + 66, cy - 29);
      return;
    }

    // ── 2. DYNAMIC ARTICULATION (PHONETIC VISEME MOUTH) ──
    // Width modulates by mouthForm: -1.0 (narrow OO) -> 92px, 0.0 (AA) -> 124px, +1.0 (wide EE) -> 156px
    const halfW = (124 + mouthForm * 32) / 2.0;
    const openH = 2.0 + mouthY * 48.0;

    const topY = cy - 18;
    const botY = topY + openH;
    const leftX = cx - halfW;
    const rightX = cx + halfW;
    const cornerY = topY - (mouthForm < 0 ? 2 : 4);

    const upperCtrlY = 2 * topY - cornerY;
    const lowerCtrlY = 2 * botY - cornerY;

    // Dynamic Anime Cavity Polygon (Ruby #881B2B)
    g.beginFill(0x881B2B, 1.0);
    g.lineStyle(0);
    g.moveTo(leftX, cornerY);
    g.quadraticCurveTo(cx, upperCtrlY, rightX, cornerY);
    g.quadraticCurveTo(cx, lowerCtrlY, leftX, cornerY);
    g.endFill();

    // Progressive Soft Tongue Arch (Coral Rose #F06292)
    // Sits nestled inside cavity and touches the bottom mouth edge
    if (mouthY > 0.22) {
      const cavityH = botY - topY;
      const tH = cavityH * 0.46;
      const tHalfW = halfW * 0.58;
      const ratio = tHalfW / halfW;
      const yTw = botY + (cornerY - botY) * (ratio * ratio);
      const tTopY = botY - tH;
      const tTopCtrl = 2 * tTopY - yTw;
      const tBotCtrl = 2 * botY - yTw;

      g.beginFill(0xF06292, 1.0);
      g.lineStyle(0);
      g.moveTo(cx - tHalfW, yTw);
      g.quadraticCurveTo(cx, tTopCtrl, cx + tHalfW, yTw);
      g.quadraticCurveTo(cx, tBotCtrl, cx - tHalfW, yTw);
      g.closePath();
      g.endFill();
    }

    // Refined Anime Outline Stroke (#130000 near-black warm brown)
    g.lineStyle(2.6, 0x130000, 1.0);
    g.moveTo(leftX, cornerY);
    g.quadraticCurveTo(cx, upperCtrlY, rightX, cornerY);
    g.quadraticCurveTo(cx, lowerCtrlY, leftX, cornerY);

    // Lower Lip Shadow Accent (moves subtly with lower jaw)
    const creaseY = Math.min(cy + 34, botY + 12);
    g.lineStyle(1.8, 0x6A3E36, 0.85);
    g.moveTo(cx - 16, creaseY);
    g.lineTo(cx + 16, creaseY);
  }

  destroy(options) {
    if (this.mouthGfx) {
      try {
        this.mouthGfx.destroy(options);
      } catch (_) {}
      this.mouthGfx = null;
    }
    if (this.sprite) {
      try {
        this.sprite.destroy(options);
      } catch (_) {}
      this.sprite = null;
    }
    super.destroy(options);
  }
}

export default ShizukaPuppet;
