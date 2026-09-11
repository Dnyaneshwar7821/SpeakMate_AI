/**
 * Motion & Expression Configurations
 */

export const MOTIONS = {
  IDLE: 'Idle',
  GREETING: 'Greeting',
  WAVE: 'Wave',
  LISTENING: 'Listening',
  THINKING: 'Thinking',
  SPEAKING: 'Speaking',
};

export const EXPRESSIONS = {
  NEUTRAL: 'neutral',
  HAPPY: 'happy',
  SAD: 'sad',
  ANGRY: 'angry',
  THINKING: 'thinking',
  SURPRISED: 'surprised',
};

export const MOTION_PRIORITIES = {
  IDLE: 1,
  BACKGROUND: 2,
  NORMAL: 3,
  FORCE: 4,
};

export const DEFAULT_MOTION_CONFIG = {
  idleGroup: 'Idle',
  autoIdleDelayMs: 4000,
  expressionBlendMode: 'override',
};
