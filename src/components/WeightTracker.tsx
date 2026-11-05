import React, { useState } from 'react';
import { WeightRecord, UserGoal } from '../types';
import { X, Scale, TrendingDown, Award, Plus, Trash2, Calendar, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WeightTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  weightLogs: WeightRecord[];
  goal: UserGoal;
  onAddWeightLog: (record: WeightRecord) => void;
  onDeleteWeightLog: (id: string) => void;
}

export const WeightTracker: React.FC<WeightTrackerProps> = ({
  isOpen,
  onClose,
  weightLogs,
  goal,
  onAddWeightLog,
  onDeleteWeightLog,
}) => {
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newWeight, setNewWeight] = useState<number>(70);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  // Sort logs by date ascending for charts and calculations
  const sortedLogs = [...weightLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const initialWeight = sortedLogs.length > 0 ? sortedLogs[0].weight : goal.currentWeight;
  const latestRecord = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1] : { weight: initialWeight, date: '' };
  const currentWeight = latestRecord.weight;

  const totalLost = Math.max(0, Math.round((initialWeight - currentWeight) * 10) / 10);
  const remainingPhase1 = Math.max(0, Math.round((currentWeight - goal.phase1TargetWeight) * 10) / 10);
  const remainingPhase2 = Math.max(0, Math.round((currentWeight - goal.phase2TargetWeight) * 10) / 10);

  const phase1ProgressPct = Math.min(
    100,
    Math.max(0, Math.round(((initialWeight - currentWeight) / (initialWeight - goal.phase1TargetWeight)) * 100))
  );

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || newWeight <= 0) return;

    const record: WeightRecord = {
      id: `weight_${Date.now()}`,
      date: newDate,
      weight: Number(newWeight),
      note: note.trim() || undefined,
    };

    onAddWeightLog(record);

    // Celebrate if hitting a milestone
    if (newWeight <= goal.phase1TargetWeight || newWeight <= goal.phase2TargetWeight) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    setNote('');
  };

  // SVG Chart rendering
  const chartWidth = 600;
  const chartHeight = 220;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const minWeight = Math.min(50, goal.phase2TargetWeight - 2);
  const maxWeight = Math.max(75, initialWeight + 2);

  const getY = (w: number) => {
    const ratio = (w - minWeight) / (maxWeight - minWeight);
    return padding.top + plotHeight - ratio * plotHeight;
  };

  // Generate target guide points: (Month 0: 70kg, Month 5: 60kg, Month 8: 54kg)
  const targetLinePoints = [
    { x: padding.left, y: getY(goal.currentWeight) },
    { x: padding.left + plotWidth * 0.65, y: getY(goal.phase1TargetWeight) },
    { x: padding.left + plotWidth, y: getY(goal.phase2TargetWeight) },
  ];

  const targetLinePath = `M ${targetLinePoints[0].x} ${targetLinePoints[0].y} L ${targetLinePoints[1].x} ${targetLinePoints[1].y} L ${targetLinePoints[2].x} ${targetLinePoints[2].y}`;

  // Actual logs plotted across range
  const actualPoints = sortedLogs.map((log, index) => {
    const x =
      sortedLogs.length === 1
        ? padding.left
        : padding.left + (index / (sortedLogs.length - 1)) * (plotWidth * 0.7);
    const y = getY(log.weight);
    return { x, y, weight: log.weight, date: log.date };
  });

  const actualPath = actualPoints.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
    ''
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Scale className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Weight & Fat Loss Progress</h3>
              <p className="text-xs text-slate-400">
                Roadmap: 70 kg → 60 kg (Phase 1) → 54 kg (Phase 2 Maintenance)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Milestone Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Current Weight</span>
              <p className="text-xl font-black text-white mt-0.5">{currentWeight} kg</p>
              <span className="text-[11px] text-slate-400">Started at {initialWeight} kg</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Total Lost</span>
              <p className="text-xl font-black text-emerald-400 mt-0.5">-{totalLost} kg</p>
              <span className="text-[11px] text-emerald-300 font-medium">{phase1ProgressPct}% to Phase 1</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">Phase 1 Target</span>
              <p className="text-xl font-black text-white mt-0.5">{goal.phase1TargetWeight} kg</p>
              <span className="text-[11px] text-indigo-300 font-medium">{remainingPhase1} kg to go (in 5 mo)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">Final Goal</span>
              <p className="text-xl font-black text-white mt-0.5">{goal.phase2TargetWeight} kg</p>
              <span className="text-[11px] text-rose-300 font-medium">{remainingPhase2} kg total to 54kg</span>
            </div>
          </div>

          {/* Phase 1 Progress Bar */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Phase 1 Journey (70kg to 60kg in 5 Months)</span>
              </div>
              <span className="text-emerald-400 font-bold">{phase1ProgressPct}% Complete</span>
            </div>
            <div className="w-full bg-slate-700/60 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${phase1ProgressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
              <span>Start: 70 kg</span>
              <span className="text-emerald-400 font-semibold">Pace: ~0.5 kg / week deficit</span>
              <span>Target: 60 kg</span>
            </div>
          </div>

          {/* Trajectory & Logs Chart */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Target Trajectory vs Actual Weigh-ins
                </h4>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-emerald-400 inline-block border-dashed" />
                  <span className="text-slate-400">Target Plan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" />
                  <span className="text-slate-400">Your Logs</span>
                </div>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto max-h-56">
                {/* Horizontal reference grid lines */}
                {[70, 65, 60, 54].map((w) => {
                  const y = getY(w);
                  return (
                    <g key={w}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke="#334155"
                        strokeDasharray="4 4"
                      />
                      <text x={padding.left - 8} y={y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
                        {w}kg
                      </text>
                    </g>
                  );
                })}

                {/* Target planned path */}
                <path d={targetLinePath} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="6 4" />

                {/* Milestone flag points on target path */}
                <circle cx={targetLinePoints[0].x} cy={targetLinePoints[0].y} r="4" fill="#10b981" />
                <circle cx={targetLinePoints[1].x} cy={targetLinePoints[1].y} r="5" fill="#10b981" />
                <text
                  x={targetLinePoints[1].x}
                  y={targetLinePoints[1].y - 8}
                  fill="#10b981"
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  60kg (Month 5)
                </text>

                <circle cx={targetLinePoints[2].x} cy={targetLinePoints[2].y} r="5" fill="#06b6d4" />
                <text
                  x={targetLinePoints[2].x}
                  y={targetLinePoints[2].y - 8}
                  fill="#06b6d4"
                  fontSize="10"
                  textAnchor="end"
                  fontWeight="bold"
                >
                  54kg Goal
                </text>

                {/* Actual logged weights line and dots */}
                {actualPoints.length > 1 && (
                  <path d={actualPath} fill="none" stroke="#818cf8" strokeWidth="2.5" />
                )}
                {actualPoints.map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.x} cy={pt.y} r="5" fill="#6366f1" stroke="#1e1b4b" strokeWidth="2" />
                    <text x={pt.x} y={pt.y + 16} fill="#cbd5e1" fontSize="9" textAnchor="middle">
                      {pt.weight}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Log New Weight Form */}
          <form onSubmit={handleAddWeight} className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Log New Weigh-In</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  min="30"
                  max="200"
                  value={newWeight}
                  onChange={(e) => setNewWeight(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. morning fasting weight"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-3 w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Save Weigh-In
            </button>
          </form>

          {/* Weigh-in History */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Log History ({sortedLogs.length})
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {[...sortedLogs].reverse().map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold text-slate-300">{log.date}</span>
                    <span className="font-bold text-white text-sm">{log.weight} kg</span>
                    {log.note && <span className="text-slate-400 italic">"{log.note}"</span>}
                  </div>

                  {sortedLogs.length > 1 && (
                    <button
                      onClick={() => onDeleteWeightLog(log.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

