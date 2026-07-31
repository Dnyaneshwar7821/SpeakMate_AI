/**
 * MotionManager Service
 * Controls Live2D motion queues and triggers (Idle, Wave, Greeting, Thinking, Listening, Speaking).
 */

import { EventBus, AVATAR_EVENTS } from './EventBus';
import { MOTIONS, MOTION_PRIORITIES } from '../../config/MotionConfig';

export class MotionManager {
  constructor(model = null) {
    this.model = model;
    this.currentMotion = MOTIONS.IDLE;
  }

  setModel(model) {
    this.model = model;
  }

  /**
   * Play motion by group name and index
   * @param {string} group Motion group name (e.g. 'Idle', 'TapBody')
   * @param {number} index Index within group
   * @param {number} priority Priority level
   */
  async playMotion(group, index = 0, priority = MOTION_PRIORITIES.NORMAL) {
    if (!this.model || !this.model.internalModel) {
      console.warn('[MotionManager] No active model assigned.');
      return false;
    }

    try {
      EventBus.emit(AVATAR_EVENTS.MOTION_STARTED, { group, index, priority });
      
      const motionManager = this.model.internalModel.motionManager;
      if (motionManager) {
        await motionManager.startMotion(group, index, priority);
      } else {
        await this.model.motion(group, index, priority);
      }

      this.currentMotion = group;
      EventBus.emit(AVATAR_EVENTS.MOTION_FINISHED, { group, index });
      return true;
    } catch (err) {
      console.warn(`[MotionManager] Could not play motion '${group}':`, err);
      return false;
    }
  }

  /**
   * Play standard idle motion
   */
  playIdle() {
    return this.playMotion(MOTIONS.IDLE, 0, MOTION_PRIORITIES.IDLE);
  }

  getCurrentMotion() {
    return this.currentMotion;
  }
}
