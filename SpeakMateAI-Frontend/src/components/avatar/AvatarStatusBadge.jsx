import React from 'react';

export function AvatarStatusBadge({ status = 'Idle' }) {
  const getBadgeStyle = () => {
    switch (status.toLowerCase()) {
      case 'speaking':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400 animate-pulse',
        };
      case 'thinking':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400 animate-ping',
        };
      case 'listening':
        return {
          bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          dot: 'bg-blue-400 animate-pulse',
        };
      default:
        return {
          bg: 'bg-slate-800/80 text-slate-400 border-slate-700/50',
          dot: 'bg-slate-500',
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-md transition-all duration-300 ${style.bg}`}>
      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
      <span className="capitalize">{status}</span>
    </div>
  );
}
