import { useState, useEffect, useRef } from 'react';
import { ExpressionManager } from '../services/live2d/ExpressionManager';
import { EXPRESSIONS } from '../config/MotionConfig';

/**
 * useExpressions Custom Hook
 * Provides expression controls (Happy, Sad, Angry, Thinking, Surprised, Neutral).
 */
export function useExpressions(model) {
  const managerRef = useRef(new ExpressionManager());
  const [currentExpression, setCurrentExpression] = useState(EXPRESSIONS.NEUTRAL);

  useEffect(() => {
    if (model) {
      managerRef.current.setModel(model);
    }
  }, [model]);

  const setExpression = async (expressionId) => {
    const success = await managerRef.current.setExpression(expressionId);
    if (success) {
      setCurrentExpression(expressionId);
    }
    return success;
  };

  const resetExpression = () => {
    return setExpression(EXPRESSIONS.NEUTRAL);
  };

  return {
    currentExpression,
    setExpression,
    resetExpression,
    EXPRESSIONS,
  };
}
