/**
 * Centralized Live2D Avatar Configuration
 * Defines parameter keys, canvas rendering defaults, and fallback paths.
 */

export const AVATAR_PARAMS = {
  // Eye Parameters
  EYE_L_OPEN: 'ParamEyeLOpen',
  EYE_R_OPEN: 'ParamEyeROpen',

  // Head Rotation Parameters
  ANGLE_X: 'ParamAngleX',
  ANGLE_Y: 'ParamAngleY',
  ANGLE_Z: 'ParamAngleZ',

  // Mouth Parameters
  MOUTH_OPEN_Y: 'ParamMouthOpenY',
  MOUTH_FORM: 'ParamMouthForm',

  // Body & Breathing Parameters
  BODY_ANGLE_X: 'ParamBodyAngleX',
  BREATH: 'ParamBreath',

  // Eyebrows
  BROW_L_Y: 'ParamBrowLY',
  BROW_R_Y: 'ParamBrowRY',
};

export const DEFAULT_AVATAR_CONFIG = {
  // Primary default Live2D model location (Cubism 4 Haru Model)
  modelPath: '/models/avatar/haru/haru_greeter_t03.model3.json',
  fallbackModelPath: 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json',

  // Canvas dimensions and scaling
  canvas: {
    width: 600,
    height: 700,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
    backgroundColor: 0x000000,
    backgroundAlpha: 0, // Transparent background
  },

  // Mouse & Eye Tracking limits
  tracking: {
    maxAngleX: 30, // Degrees
    maxAngleY: 30,
    maxAngleZ: 15,
    lerpFactor: 0.1, // Linear interpolation smoothing speed
  },

  // Eye Blinking rules
  blinking: {
    minIntervalMs: 2000,
    maxIntervalMs: 6000,
    durationMs: 200,
  },

  // Lip Sync smoothing and gain
  lipSync: {
    smoothingFactor: 0.75, // 0 (raw) to 1 (heavy smooth)
    amplitudeMultiplier: 2.2, // Gain multiplier to scale amplitude to 0..1
    minThreshold: 0.03, // Noise gate floor
  },
};
