import React from 'react';

interface MacroProgressBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color: 'indigo' | 'amber' | 'rose' | 'emerald';
  subtext?: string;
}

export const MacroProgressBar: React.FC<MacroProgressBarProps> = ({
  label,
  current,
  target,
  unit = 'g',
  color,
  subtext,
}) => {
  const percent = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
  const isOver = current > target;

  const colorStyles = {
    indigo: {
      bar: 'bg-indigo-500',
      text: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      accent: 'from-indigo-500 to-sky-400',
    },
    amber: {
      bar: 'bg-amber-500',
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      accent: 'from-amber-500 to-orange-400',
    },
    rose: {
      bar: 'bg-rose-500',
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      accent: 'from-rose-500 to-pink-400',
    },
    emerald: {
      bar: 'bg-emerald-500',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      accent: 'from-emerald-500 to-teal-400',
    },
  }[color];

  return (
    <div className={`p-3.5 rounded-2xl bg-slate-800/60 border ${colorStyles.border} flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-slate-300">{label}</span>
        <span className={`text-xs font-bold ${colorStyles.text}`}>
          {Math.round(current)} / {target}{unit}
        </span>
      </div>

      <div className="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden mb-1.5">
        <div
          className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${colorStyles.accent}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>{subtext || `${percent}%`}</span>
        <span className={isOver ? 'text-amber-400 font-medium' : 'text-slate-400'}>
          {isOver ? `+${Math.round(current - target)}${unit} over` : `${Math.round(target - current)}${unit} left`}
        </span>
      </div>
    </div>
  );
};

