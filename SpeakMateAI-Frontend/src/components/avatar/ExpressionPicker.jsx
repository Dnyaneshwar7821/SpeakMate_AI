import React from 'react';
import { EXPRESSIONS } from '../../config/MotionConfig';

const EXPRESSION_EMOJIS = {
  [EXPRESSIONS.NEUTRAL]: '🙂 Neutral',
  [EXPRESSIONS.HAPPY]: '😊 Happy',
  [EXPRESSIONS.SAD]: '😢 Sad',
  [EXPRESSIONS.ANGRY]: '😠 Angry',
  [EXPRESSIONS.THINKING]: '🤔 Thinking',
  [EXPRESSIONS.SURPRISED]: '😲 Surprised',
};

export function ExpressionPicker({ currentExpression, onSelectExpression }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 p-2 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-xl">
      {Object.values(EXPRESSIONS).map((exp) => (
        <button
          key={exp}
          onClick={() => onSelectExpression(exp)}
          className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 ${
            currentExpression === exp
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105'
              : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:text-white'
          }`}
        >
          {EXPRESSION_EMOJIS[exp] || exp}
        </button>
      ))}
    </div>
  );
}
