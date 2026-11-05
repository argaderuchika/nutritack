import React, { useState } from 'react';
import { UserGoal } from '../types';
import { X, Target, Calculator, Check, Flame } from 'lucide-react';
import { ACTIVITY_MULTIPLIERS, calculateFatLossTargets } from '../utils/calculator';

interface GoalsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: UserGoal;
  onSaveGoal: (updatedGoal: UserGoal) => void;
}

export const GoalsSettingsModal: React.FC<GoalsSettingsModalProps> = ({
  isOpen,
  onClose,
  goal,
  onSaveGoal,
}) => {
  const [formData, setFormData] = useState<UserGoal>({ ...goal });

  if (!isOpen) return null;

  const handleCalculateRecommended = () => {
    const calculated = calculateFatLossTargets(
      formData.currentWeight,
      formData.heightCm,
      formData.age,
      formData.gender,
      formData.activityLevel,
      formData.currentWeight - formData.phase1TargetWeight,
      formData.phase1TargetMonths
    );

    setFormData({
      ...formData,
      targetCalories: calculated.targetCalories,
      targetProtein: calculated.targetProtein,
      targetCarbs: calculated.targetCarbs,
      targetFat: calculated.targetFat,
      targetFiber: calculated.targetFiber,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGoal(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Target & Deficit Calculator</h3>
              <p className="text-xs text-slate-400">
                Scientifically tuned for 70 kg → 60 kg (5 months) → 54 kg
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Section 1: Body Parameters */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              1. Your Profile & Timeline
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Current (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.currentWeight}
                  onChange={(e) => setFormData({ ...formData, currentWeight: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-emerald-400">Phase 1 Goal (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.phase1TargetWeight}
                  onChange={(e) => setFormData({ ...formData, phase1TargetWeight: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Phase 1 Months</label>
                <input
                  type="number"
                  value={formData.phase1TargetMonths}
                  onChange={(e) => setFormData({ ...formData, phase1TargetMonths: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-cyan-400">Final Goal (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.phase2TargetWeight}
                  onChange={(e) => setFormData({ ...formData, phase2TargetWeight: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Height (cm)</label>
                <input
                  type="number"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Water Target (ml)</label>
                <input
                  type="number"
                  step="100"
                  value={formData.waterTargetMl}
                  onChange={(e) => setFormData({ ...formData, waterTargetMl: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-emerald-400">Daily Steps Target</label>
                <input
                  type="number"
                  step="500"
                  value={formData.targetSteps ?? 10000}
                  onChange={(e) => setFormData({ ...formData, targetSteps: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-indigo-400">Weight Training Target (mins)</label>
                <input
                  type="number"
                  step="5"
                  value={formData.targetWeightTrainingMins ?? 45}
                  onChange={(e) => setFormData({ ...formData, targetWeightTrainingMins: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-purple-400">Target Sleep (hours)</label>
                <input
                  type="number"
                  step="0.5"
                  min="4"
                  max="14"
                  value={formData.targetSleepHours ?? 8.0}
                  onChange={(e) => setFormData({ ...formData, targetSleepHours: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs font-semibold text-slate-400">Activity Level</label>
              <select
                value={formData.activityLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    activityLevel: e.target.value as keyof typeof ACTIVITY_MULTIPLIERS,
                  })
                }
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {Object.entries(ACTIVITY_MULTIPLIERS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Auto-Calculate Banner */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-emerald-400">Auto-Calculate Sustainable Deficit</p>
              <p className="text-[11px] text-slate-300">
                Calculates BMR & TDEE, sets ~510 kcal deficit to lose 10 kg in 5 months with high protein & fiber.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCalculateRecommended}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Calculator className="w-4 h-4" />
              <span>Apply Recommended Macros</span>
            </button>
          </div>

          {/* Section 2: Daily Macro Targets */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              2. Daily Nutrition Targets
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Calories (kcal)</span>
                </label>
                <input
                  type="number"
                  value={formData.targetCalories}
                  onChange={(e) => setFormData({ ...formData, targetCalories: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-indigo-400">Protein (g)</label>
                <input
                  type="number"
                  value={formData.targetProtein}
                  onChange={(e) => setFormData({ ...formData, targetProtein: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-teal-400">Fiber (g)</label>
                <input
                  type="number"
                  value={formData.targetFiber}
                  onChange={(e) => setFormData({ ...formData, targetFiber: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-amber-400">Carbs (g)</label>
                <input
                  type="number"
                  value={formData.targetCarbs}
                  onChange={(e) => setFormData({ ...formData, targetCarbs: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-rose-400">Fat (g)</label>
                <input
                  type="number"
                  value={formData.targetFat}
                  onChange={(e) => setFormData({ ...formData, targetFat: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all mt-4"
          >
            <Check className="w-4 h-4" />
            <span>Save Goal Settings</span>
          </button>
        </form>
      </div>
    </div>
  );
};

