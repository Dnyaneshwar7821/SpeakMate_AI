/**
 * ExpressionManager Service
 * Programmatically triggers Live2D expressions (Happy, Sad, Angry, Thinking, Surprised, Neutral).
 */

import { EventBus, AVATAR_EVENTS } from './EventBus';
import { EXPRESSIONS } from '../../config/MotionConfig';

export class ExpressionManager {
  constructor(model = null) {
    this.model = model;
    this.currentExpression = EXPRESSIONS.NEUTRAL;
  }

  setModel(model) {
    this.model = model;
  }

  /**
   * Set expression by name or index
   * @param {string|number} expressionId Expression identifier
   */
  async setExpression(expressionId) {
    if (!this.model || !this.model.internalModel) {
      console.warn('[ExpressionManager] No active model assigned.');
      return false;
    }

    try {
      const expressionManager = this.model.internalModel.expressionManager;
      if (expressionManager) {
        if (typeof expressionId === 'number') {
          await expressionManager.setExpression(expressionId);
        } else {
          // Attempt to match expression string
          await expressionManager.setExpression(expressionId);
        }
      }

      this.currentExpression = expressionId;
      EventBus.emit(AVATAR_EVENTS.EXPRESSION_CHANGED, { expression: expressionId });
      return true;
    } catch (err) {
      console.warn(`[ExpressionManager] Could not set expression '${expressionId}':`, err);
      return false;
    }
  }

  /**
   * Reset expression to neutral/default state
   */
  reset() {
    return this.setExpression(EXPRESSIONS.NEUTRAL);
  }

  getCurrentExpression() {
    return this.currentExpression;
  }
}
