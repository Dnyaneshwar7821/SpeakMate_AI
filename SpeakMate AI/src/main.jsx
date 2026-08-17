import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as PIXI from 'pixi.js';
import './index.css';
import App from './App.jsx';

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
