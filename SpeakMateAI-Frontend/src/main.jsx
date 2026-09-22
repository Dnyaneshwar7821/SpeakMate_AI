import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as PIXI from 'pixi.js';
import './index.css';
import App from './App.jsx';

// Handle dynamic module load errors when a new deployment invalidates old chunk hashes
if (typeof window !== 'undefined') {
  const triggerReloadForStaleChunk = () => {
    const lastReload = sessionStorage.getItem('speakmate_chunk_reload_ts');
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
      sessionStorage.setItem('speakmate_chunk_reload_ts', now.toString());
      window.location.reload();
    }
  };

  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    triggerReloadForStaleChunk();
  });

  window.addEventListener('error', (event) => {
    const msg = event?.message || '';
    if (
      msg.includes('dynamically imported module') ||
      msg.includes('Expected a JavaScript-or-Wasm module script') ||
      msg.includes('Failed to fetch dynamically imported module')
    ) {
      triggerReloadForStaleChunk();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason?.message || String(event?.reason || '');
    if (
      reason.includes('dynamically imported module') ||
      reason.includes('Expected a JavaScript-or-Wasm module script') ||
      reason.includes('Failed to fetch dynamically imported module')
    ) {
      triggerReloadForStaleChunk();
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
