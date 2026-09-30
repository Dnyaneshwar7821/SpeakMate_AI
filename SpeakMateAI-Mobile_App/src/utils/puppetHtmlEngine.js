/**
 * puppetHtmlEngine.js
 * High-Performance PixiJS 2.5D Canvas Avatar Generator for React Native WebView.
 * 
 * Features:
 * - Direct 1:1 parity with SpeakMate Web App (Teacher, Male Teacher, Shizuka, Doraemon, SpongeBob, Chhota Bheem, Ninja Hattori, Tom, Ben 10, Scooby-Doo)
 * - Automatic background transparency: Removes white outer bounding boxes via canvas flood-fill
 * - Mathematical coordinate locking: Mouth Bezier curves anchored inside the character container
 * - 60 FPS Asymmetric Lerp Viseme Loop (Fast attack 0.65, crisp release 0.55)
 * - 100% transparent canvas with zero webview borders
 */

import { TeacherPuppetCode } from './puppets/TeacherPuppetCode';
import { MaleTeacherPuppetCode } from './puppets/MaleTeacherPuppetCode';
import { ShizukaPuppetCode } from './puppets/ShizukaPuppetCode';
import { DoraemonPuppetCode } from './puppets/DoraemonPuppetCode';
import { SpongeBobPuppetCode } from './puppets/SpongeBobPuppetCode';
import { ChhotaBheemPuppetCode } from './puppets/ChhotaBheemPuppetCode';
import { NinjaHattoriPuppetCode } from './puppets/NinjaHattoriPuppetCode';
import { TomPuppetCode } from './puppets/TomPuppetCode';
import { BenTenPuppetCode } from './puppets/BenTenPuppetCode';
import { PuppyPuppetCode } from './puppets/PuppyPuppetCode';

const ALIAS_MAP = {
  haru: 'haru',
  teacher: 'haru',
  chitose: 'chitose',
  maleteacher: 'chitose',
  male: 'chitose',
  shizuku: 'shizuku',
  shizuka: 'shizuku',
  robopaws: 'robopaws',
  doraemon: 'robopaws',
  spongebob: 'spongebob',
  sparky: 'sparky',
  bheem: 'sparky',
  chhotabheem: 'sparky',
  koharu: 'koharu',
  hattori: 'koharu',
  ninjahattori: 'koharu',
  haruto: 'haruto',
  tom: 'haruto',
  mao: 'mao',
  ben10: 'mao',
  puppy: 'puppy',
  scooby: 'puppy',
};

const PUPPET_REGISTRY = {
  haru: {
    className: 'TeacherPuppet',
    code: TeacherPuppetCode,
    scaleW: 230,
    scaleH: 270,
    yRatio: 0.50,
  },
  chitose: {
    className: 'MaleTeacherPuppet',
    code: MaleTeacherPuppetCode,
    scaleW: 230,
    scaleH: 270,
    yRatio: 0.48,
  },
  shizuku: {
    className: 'ShizukaPuppet',
    code: ShizukaPuppetCode,
    scaleW: 230,
    scaleH: 270,
    yRatio: 0.52,
  },
  robopaws: {
    className: 'DoraemonPuppet',
    code: DoraemonPuppetCode,
    scaleW: 220,
    scaleH: 260,
    yRatio: 0.50,
  },
  spongebob: {
    className: 'SpongeBobPuppet',
    code: SpongeBobPuppetCode,
    scaleW: 230,
    scaleH: 270,
    yRatio: 0.50,
  },
  sparky: {
    className: 'ChhotaBheemPuppet',
    code: ChhotaBheemPuppetCode,
    scaleW: 230,
    scaleH: 280,
    yRatio: 0.49,
  },
  koharu: {
    className: 'NinjaHattoriPuppet',
    code: NinjaHattoriPuppetCode,
    scaleW: 220,
    scaleH: 270,
    yRatio: 0.50,
  },
  haruto: {
    className: 'TomPuppet',
    code: TomPuppetCode,
    scaleW: 220,
    scaleH: 270,
    yRatio: 0.50,
  },
  mao: {
    className: 'BenTenPuppet',
    code: BenTenPuppetCode,
    scaleW: 230,
    scaleH: 280,
    yRatio: 0.50,
  },
  puppy: {
    className: 'PuppyPuppet',
    code: PuppyPuppetCode,
    scaleW: 220,
    scaleH: 270,
    yRatio: 0.50,
  },
};

export function getPixiPuppetHtml(modelKey = 'haru', assetUri = '') {
  const normKey = (modelKey || 'haru').toLowerCase();
  const canonicalId = ALIAS_MAP[normKey] || 'haru';
  const puppetInfo = PUPPET_REGISTRY[canonicalId] || PUPPET_REGISTRY.haru;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>SpeakMate Avatar Canvas</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      background: transparent !important;
      overflow: hidden;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
    }
    #stage-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent !important;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    canvas {
      display: block;
      background: transparent !important;
    }
  </style>

  <!-- PixiJS v7 Core -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.4.2/pixi.min.js"></script>
</head>
<body>
  <div id="stage-container"></div>

  <script>
    window.__PUPPET_IMAGE_URI = ${JSON.stringify(assetUri)};
    window.__ACTIVE_MODEL = ${JSON.stringify(canonicalId)};

    // ── 1. Injected Puppet Class Definition ──
    ${puppetInfo.code}

    // ── 2. Phonetic Viseme Dictionary ──
    var VISEME_MAP = {
      REST: { yVal: 0.00, formVal: 0.00 },
      MBP:  { yVal: 0.25, formVal: 0.00 },
      AA:   { yVal: 0.95, formVal: 0.25 },
      EE:   { yVal: 0.60, formVal: 0.85 },
      IH:   { yVal: 0.65, formVal: 0.30 },
      OO:   { yVal: 0.70, formVal: -0.75 },
      OH:   { yVal: 0.90, formVal: -0.35 },
      FV:   { yVal: 0.45, formVal: -0.15 },
      LNT:  { yVal: 0.55, formVal: 0.15 }
    };

    function getWordViseme(rawWord) {
      if (!rawWord) return VISEME_MAP.REST;
      var word = rawWord.toLowerCase().replace(/[^a-z]/g, '');
      if (!word) return VISEME_MAP.REST;

      if (/oo|ou|ow/.test(word)) return VISEME_MAP.OO;
      if (/ee|ea|ie|ei|ai|ay/.test(word)) return VISEME_MAP.EE;
      if (/oa|oh|aw|au/.test(word)) return VISEME_MAP.OH;
      if (/^[mbp]/.test(word)) return VISEME_MAP.MBP;
      if (/^[fv]/.test(word)) return VISEME_MAP.FV;
      if (/^[lntdszr]/.test(word)) return VISEME_MAP.LNT;
      if (/[aeiou]/.test(word[0])) return VISEME_MAP.AA;
      return VISEME_MAP.IH;
    }

    // ── 3. Runtime Initialization ──
    (function init() {
      var container = document.getElementById('stage-container');
      if (!container || typeof PIXI === 'undefined') {
        setTimeout(init, 30);
        return;
      }

      var width = container.clientWidth || 320;
      var height = container.clientHeight || 224;

      var app = new PIXI.Application({
        width: width,
        height: height,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
        backgroundAlpha: 0,
        antialias: true,
      });

      container.appendChild(app.view);

      // Create Puppet
      var PuppetConstructor = window.${puppetInfo.className};
      if (!PuppetConstructor) {
        console.error('Puppet class not found: ${puppetInfo.className}');
        return;
      }

      var puppet = new PuppetConstructor();
      app.stage.addChild(puppet);
      window.__activePuppet = puppet;

      var resizePuppet = function() {
        var w = container.clientWidth || 320;
        var h = container.clientHeight || 224;
        app.renderer.resize(w, h);

        var scale = Math.min((w * 0.88) / ${puppetInfo.scaleW}, (h * 0.82) / ${puppetInfo.scaleH});
        puppet.scale.set(scale, scale);
        puppet.x = w / 2;
        puppet.y = h * ${puppetInfo.yRatio};
      };

      resizePuppet();
      window.addEventListener('resize', resizePuppet);

      // ── 4. 60 FPS Syllable Physics Lerp Ticker ──
      var targetMouthY = 0;
      var targetMouthForm = 0;
      var currentMouthY = 0;
      var currentMouthForm = 0;
      var isSpeaking = false;
      var wordDuration = 240;
      var lastWordTime = 0;
      var wordTickerInterval = null;

      app.ticker.add(function() {
        var now = performance.now();

        if (isSpeaking && lastWordTime > 0) {
          var elapsed = now - lastWordTime;
          if (elapsed < wordDuration) {
            var progress = elapsed / wordDuration;
            var envelope = Math.sin(progress * Math.PI);
            var destY = targetMouthY * envelope;
            var destForm = targetMouthForm;

            var lerpSpeed = destY > currentMouthY ? 0.65 : 0.55;
            currentMouthY += (destY - currentMouthY) * lerpSpeed;
            currentMouthForm += (destForm - currentMouthForm) * lerpSpeed;
          } else {
            currentMouthY += (0 - currentMouthY) * 0.50;
            currentMouthForm += (0 - currentMouthForm) * 0.50;
          }
        } else {
          currentMouthY += (0 - currentMouthY) * 0.55;
          currentMouthForm += (0 - currentMouthForm) * 0.55;
          if (currentMouthY < 0.02) currentMouthY = 0;
        }

        puppet.mouthY = Math.max(0, Math.min(1.0, currentMouthY));
        puppet.mouthForm = Math.max(-1.0, Math.min(1.0, currentMouthForm));
        puppet.isSpeaking = Boolean(isSpeaking && currentMouthY > 0.03);

        if (typeof puppet.update === 'function') {
          puppet.update(now);
        }
      });

      // ── 5. Speech Synchronizer ──
      function startSpeech(text, speed) {
        isSpeaking = true;
        if (wordTickerInterval) clearInterval(wordTickerInterval);

        var words = (text || '').trim().split(/\\s+/).filter(Boolean);
        if (!words.length) {
          targetMouthY = 0.6;
          targetMouthForm = 0.0;
          lastWordTime = performance.now();
          wordDuration = 400;
          return;
        }

        var speedMult = Number(speed) || 1.0;
        var intervalMs = Math.max(160, Math.min(320, Math.round(230 / speedMult)));
        var wordIdx = 0;

        function triggerWord() {
          if (wordIdx < words.length && isSpeaking) {
            var word = words[wordIdx++];
            var viseme = getWordViseme(word);
            targetMouthY = viseme.yVal || 0.70;
            targetMouthForm = viseme.formVal || 0.0;
            lastWordTime = performance.now();
            wordDuration = Math.max(160, Math.min(300, word.length * 40));
          } else {
            if (wordTickerInterval) {
              clearInterval(wordTickerInterval);
              wordTickerInterval = null;
            }
          }
        }

        triggerWord();
        wordTickerInterval = setInterval(triggerWord, intervalMs);
      }

      function stopSpeech() {
        isSpeaking = false;
        if (wordTickerInterval) {
          clearInterval(wordTickerInterval);
          wordTickerInterval = null;
        }
        targetMouthY = 0;
        targetMouthForm = 0;
        currentMouthY = 0;
        currentMouthForm = 0;
        puppet.mouthY = 0;
        puppet.mouthForm = 0;
        puppet.isSpeaking = false;
        if (typeof puppet.setSpeaking === 'function') puppet.setSpeaking(false);
      }

      // ── 6. Message Dispatcher from React Native ──
      window.addEventListener('message', function(event) {
        handleIncoming(event.data);
      });
      document.addEventListener('message', function(event) {
        handleIncoming(event.data);
      });

      function handleIncoming(raw) {
        try {
          var data = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (!data || !data.type) return;

          if (data.type === 'STATE') {
            if (data.isSpeaking) {
              startSpeech(data.text, data.speed);
            } else {
              stopSpeech();
            }
          } else if (data.type === 'MOOD') {
            if (puppet) puppet.currentMood = data.mood || 'neutral';
          }
        } catch (e) {
          console.warn('WebView message error:', e);
        }
      }

      // Signal ready immediately to React Native
      if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
      }
    })();
  </script>
</body>
</html>`;
}

export default getPixiPuppetHtml;
