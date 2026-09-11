/**
 * AnimationLoop Utility
 * Provides a clean requestAnimationFrame tick manager for continuous 60 FPS updates.
 */

export class AnimationLoop {
  constructor(callback) {
    this.callback = callback;
    this.rafId = null;
    this.isRunning = false;
    this.lastTime = 0;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();

    const loop = (now) => {
      if (!this.isRunning) return;
      const deltaTime = (now - this.lastTime) / 1000; // in seconds
      this.lastTime = now;

      if (typeof this.callback === 'function') {
        this.callback(deltaTime, now);
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
