import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as PIXI from 'pixi.js';
import './index.css';
import App from './App.jsx';

// Handle dynamic module load errors when a new deployment invalidates old chunk hashes
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    window.location.reload();
  });

  window.addEventListener('error', (event) => {
    if (
      event?.message &&
      (event.message.includes('dynamically imported module') ||
       event.message.includes('Expected a JavaScript-or-Wasm module script'))
    ) {
      const lastReload = sessionStorage.getItem('speakmate_chunk_reload_ts');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('speakmate_chunk_reload_ts', now.toString());
        window.location.reload();
      }
    }
  });
}

// Make PIXI available on window for Live2D SDK integration
if (typeof window !== 'undefined') {
  window.PIXI = PIXI;
}

// Polyfill isInteractive for PixiJS v7 & Live2D integration
if (PIXI?.DisplayObject && !PIXI.DisplayObject.prototype.isInteractive) {
  PIXI.DisplayObject.prototype.isInteractive = function () {
    return Boolean(this.interactive || this.eventMode === 'static' || this.eventMode === 'dynamic');
  };
}
if (PIXI?.Container && !PIXI.Container.prototype.isInteractive) {
  PIXI.Container.prototype.isInteractive = function () {
    return Boolean(this.interactive || this.eventMode === 'static' || this.eventMode === 'dynamic');
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
