import React, { useState } from 'react';
import {
  Flame,
  Droplets,
  Target,
  ShieldCheck,
  Sparkles,
  Footprints,
  Dumbbell,
  Moon,
  Plus,
  Minus,
} from 'lucide-react';
import { MacroProgressBar } from './MacroProgressBar';
import { UserGoal } from '../types';

interface DailyDashboardProps {
  goal: UserGoal;
  consumedCalories: number;
  consumedProtein: number;
  consumedCarbs: number;
  consumedFat: number;
  consumedFiber: number;
  waterMl: number;
  steps?: number;
  weightTrainingMins?: number;
  sleepHours?: number;
  onUpdateWater: (deltaMl: number) => void;
  onUpdateSteps: (steps: number) => void;
  onUpdateWeightTraining: (mins: number) => void;
  onUpdateSleep: (hours: number) => void;
}

export const DailyDashboard: React.FC<DailyDashboardProps> = ({
  goal,
  consumedCalories,
  consumedProtein,
  consumedCarbs,
  consumedFat,
  consumedFiber,
  waterMl,
  steps = 0,
  weightTrainingMins = 0,
  sleepHours = 0,
  onUpdateWater,
  onUpdateSteps,
  onUpdateWeightTraining,
  onUpdateSleep,
}) => {
  const remainingCalories = goal.targetCalories - consumedCalories;
  const isOverCalories = remainingCalories < 0;
  const caloriePercent = Math.min(Math.round((consumedCalories / goal.targetCalories) * 100), 100);

  // Targets
  const targetSteps = goal.targetSteps || 10000;
  const targetTrainingMins = goal.targetWeightTrainingMins || 45;
  const targetSleep = goal.targetSleepHours || 8.0;

  const stepsPercent = Math.min(100, Math.round((steps / targetSteps) * 100));
  const trainingPercent = Math.min(100, Math.round((weightTrainingMins / targetTrainingMins) * 100));
  const sleepPercent = Math.min(100, Math.round((sleepHours / targetSleep) * 100));
  const waterPercent = Math.min(100, Math.round((waterMl / goal.waterTargetMl) * 100));

  // Inline edit state
  const [isEditingSteps, setIsEditingSteps] = useState(false);
  const [stepsInput, setStepsInput] = useState(String(steps));

  const [isEditingTraining, setIsEditingTraining] = useState(false);
  const [trainingInput, setTrainingInput] = useState(String(weightTrainingMins));

  const [isEditingSleep, setIsEditingSleep] = useState(false);
  const [sleepInput, setSleepInput] = useState(String(sleepHours));

  // Calorie ring SVG dimensions
  const size = 160;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (caloriePercent / 100) * circumference;

  const handleSaveStepsInput = () => {
    const parsed = parseInt(stepsInput, 10);
    onUpdateSteps(isNaN(parsed) ? 0 : Math.max(0, parsed));
    setIsEditingSteps(false);
  };

  const handleSaveTrainingInput = () => {
    const parsed = parseInt(trainingInput, 10);
    onUpdateWeightTraining(isNaN(parsed) ? 0 : Math.max(0, parsed));
    setIsEditingTraining(false);
  };

  const handleSaveSleepInput = () => {
    const parsed = parseFloat(sleepInput);
    onUpdateSleep(isNaN(parsed) ? 0 : Math.max(0, Math.round(parsed * 10) / 10));
    setIsEditingSleep(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Deficit & Motivation with Vibrant Gradient */}
      <div className="bg-gradient-to-r from-emerald-900/50 via-slate-800/90 to-teal-900/50 border border-emerald-500/30 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/25 shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                Phase 1 Fat Loss Goal: {goal.currentWeight}kg → {goal.phase1TargetWeight}kg
              </h2>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                ~500 kcal Deficit / Day
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Target loss: ~0.5 kg/week. Keep protein high to spare lean muscle while burning body fat.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center text-xs font-bold text-emerald-300 bg-emerald-500/15 px-3.5 py-2 rounded-2xl border border-emerald-500/30 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Final Goal: {goal.phase2TargetWeight}kg</span>
        </div>
      </div>

      {/* Primary Dashboard Grid: Calorie Ring + Macros */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4">
        {/* Calorie Card with Radial Progress */}
        <div className="md:col-span-5 bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/70 rounded-3xl p-5 flex flex-col items-center justify-between shadow-xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="w-full flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <Flame className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Calories</h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">Budget: {goal.targetCalories} kcal</span>
          </div>

          <div className="relative my-2 flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background track */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="transparent"
                className="text-slate-800"
              />
              {/* Progress track */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                stroke="url(#calorieGradient)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner text */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span
                className={`text-3xl sm:text-4xl font-black tracking-tight ${
                  isOverCalories ? 'text-rose-400' : 'text-white'
                }`}
              >
                {Math.abs(remainingCalories)}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                {isOverCalories ? 'kcal Over Budget' : 'kcal Remaining'}
              </span>
            </div>
          </div>

          {/* Quick Sub-Stats */}
          <div className="grid grid-cols-2 gap-2 w-full pt-3 border-t border-slate-700/60 text-center">
            <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Consumed</span>
              <p className="text-sm sm:text-base font-black text-slate-100">{Math.round(consumedCalories)} kcal</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Target Budget</span>
              <p className="text-sm sm:text-base font-black text-emerald-400">{goal.targetCalories} kcal</p>
            </div>
          </div>
        </div>

        {/* 4 Key Macros Grid */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <MacroProgressBar
            label="Protein (Muscle Defense)"
            current={consumedProtein}
            target={goal.targetProtein}
            color="indigo"
            subtext="Essential for lean fat loss"
          />
          <MacroProgressBar
            label="Fiber (Satiety & Gut)"
            current={consumedFiber}
            target={goal.targetFiber}
            color="emerald"
            subtext="Keeps you full & controls sugar"
          />
          <MacroProgressBar
            label="Carbohydrates (Energy)"
            current={consumedCarbs}
            target={goal.targetCarbs}
            color="amber"
            subtext="Fuel for workouts & daily steps"
          />
          <MacroProgressBar
            label="Healthy Fats (Hormones)"
            current={consumedFat}
            target={goal.targetFat}
            color="rose"
            subtext="Essential hormonal balance"
          />
        </div>
      </div>

      {/* 4 Key Wellness & Fitness Habits: Steps, Weight Training, Sleep, Hydration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Steps Count */}
        <div className="bg-slate-800/80 border border-slate-700/70 hover:border-emerald-500/50 rounded-3xl p-4 flex flex-col justify-between shadow-lg backdrop-blur-md transition-all">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Footprints className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Steps Count</h4>
                <div className="flex items-baseline gap-1 mt-0.5">
                  {isEditingSteps ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        autoFocus
                        value={stepsInput}
                        onChange={(e) => setStepsInput(e.target.value)}
                        onBlur={handleSaveStepsInput}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveStepsInput()}
                        className="w-20 px-2 py-0.5 rounded-lg bg-slate-900 border border-emerald-500 text-sm font-bold text-white focus:outline-none"
                      />
                      <button
                        onClick={handleSaveStepsInput}
                        className="text-[10px] px-1.5 py-0.5 bg-emerald-500 text-slate-950 font-bold rounded"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setStepsInput(String(steps));
                        setIsEditingSteps(true);
                      }}
                      className="text-left group cursor-pointer"
                      title="Click to edit steps directly"
                    >
                      <span className="text-base sm:text-lg font-black text-emerald-400 group-hover:underline">
                        {steps.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1">
                        / {targetSteps.toLocaleString()}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-lg border border-emerald-500/25">
              {stepsPercent}%
            </span>
          </div>

          <div className="w-full bg-slate-700/50 rounded-full h-1.5 my-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${stepsPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-1 pt-1">
            <button
              onClick={() => onUpdateSteps(Math.max(0, steps - 1000))}
              disabled={steps <= 0}
              className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-700/60 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
            >
              -1k
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateSteps(steps + 1000)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 active:scale-95 transition-all"
              >
                +1,000
              </button>
              <button
                onClick={() => onUpdateSteps(steps + 2500)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 active:scale-95 transition-all"
              >
                +2.5k
              </button>
            </div>
          </div>
        </div>

        {/* 2. Weight Training Mins */}
        <div className="bg-slate-800/80 border border-slate-700/70 hover:border-indigo-500/50 rounded-3xl p-4 flex flex-col justify-between shadow-lg backdrop-blur-md transition-all">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Dumbbell className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Weight Training</h4>
                <div className="flex items-baseline gap-1 mt-0.5">
                  {isEditingTraining ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        autoFocus
                        value={trainingInput}
                        onChange={(e) => setTrainingInput(e.target.value)}
                        onBlur={handleSaveTrainingInput}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveTrainingInput()}
                        className="w-16 px-2 py-0.5 rounded-lg bg-slate-900 border border-indigo-500 text-sm font-bold text-white focus:outline-none"
                      />
                      <button
                        onClick={handleSaveTrainingInput}
                        className="text-[10px] px-1.5 py-0.5 bg-indigo-500 text-white font-bold rounded"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setTrainingInput(String(weightTrainingMins));
                        setIsEditingTraining(true);
                      }}
                      className="text-left group cursor-pointer"
                      title="Click to edit training minutes directly"
                    >
                      <span className="text-base sm:text-lg font-black text-indigo-400 group-hover:underline">
                        {weightTrainingMins}m
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1">
                        / {targetTrainingMins}m
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded-lg border border-indigo-500/25">
              {trainingPercent}%
            </span>
          </div>

          <div className="w-full bg-slate-700/50 rounded-full h-1.5 my-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${trainingPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-1 pt-1">
            <button
              onClick={() => onUpdateWeightTraining(Math.max(0, weightTrainingMins - 15))}
              disabled={weightTrainingMins <= 0}
              className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-700/60 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
            >
              -15m
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateWeightTraining(weightTrainingMins + 15)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 active:scale-95 transition-all"
              >
                +15m
              </button>
              <button
                onClick={() => onUpdateWeightTraining(weightTrainingMins + 30)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 active:scale-95 transition-all"
              >
                +30m
              </button>
            </div>
          </div>
        </div>

        {/* 3. Sleep Time (NEW) */}
        <div className="bg-slate-800/80 border border-slate-700/70 hover:border-purple-500/50 rounded-3xl p-4 flex flex-col justify-between shadow-lg backdrop-blur-md transition-all">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Moon className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Sleep Time</h4>
                <div className="flex items-baseline gap-1 mt-0.5">
                  {isEditingSleep ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="24"
                        autoFocus
                        value={sleepInput}
                        onChange={(e) => setSleepInput(e.target.value)}
                        onBlur={handleSaveSleepInput}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveSleepInput()}
                        className="w-16 px-2 py-0.5 rounded-lg bg-slate-900 border border-purple-500 text-sm font-bold text-white focus:outline-none"
                      />
                      <button
                        onClick={handleSaveSleepInput}
                        className="text-[10px] px-1.5 py-0.5 bg-purple-500 text-white font-bold rounded"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSleepInput(String(sleepHours));
                        setIsEditingSleep(true);
                      }}
                      className="text-left group cursor-pointer"
                      title="Click to edit sleep hours directly"
                    >
                      <span className="text-base sm:text-lg font-black text-purple-400 group-hover:underline">
                        {sleepHours}h
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1">
                        / {targetSleep}h target
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                sleepHours >= 7
                  ? 'text-purple-300 bg-purple-500/20 border-purple-500/30'
                  : 'text-amber-300 bg-amber-500/20 border-amber-500/30'
              }`}
            >
              {sleepHours >= 7 ? 'Restorative 💤' : sleepHours > 0 ? 'Recovery ⚡' : '0h'}
            </span>
          </div>

          <div className="w-full bg-slate-700/50 rounded-full h-1.5 my-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-fuchsia-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${sleepPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-1 pt-1">
            <button
              onClick={() => onUpdateSleep(Math.max(0, Math.round((sleepHours - 0.5) * 10) / 10))}
              disabled={sleepHours <= 0}
              className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-700/60 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
            >
              -0.5h
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateSleep(Math.round((sleepHours + 0.5) * 10) / 10)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 active:scale-95 transition-all"
              >
                +0.5h
              </button>
              <button
                onClick={() => onUpdateSleep(7.5)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 active:scale-95 transition-all"
              >
                7.5h 💤
              </button>
            </div>
          </div>
        </div>

        {/* 4. Water Hydration */}
        <div className="bg-slate-800/80 border border-slate-700/70 hover:border-sky-500/50 rounded-3xl p-4 flex flex-col justify-between shadow-lg backdrop-blur-md transition-all">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0">
                <Droplets className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Water Intake</h4>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-base sm:text-lg font-black text-sky-400">
                    {waterMl} ml
                  </span>
                  <span className="text-[11px] text-slate-400 ml-1">
                    / {goal.waterTargetMl} ml
                  </span>
                </div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-sky-400 bg-sky-500/15 px-2 py-0.5 rounded-lg border border-sky-500/25">
              {waterPercent}%
            </span>
          </div>

          <div className="w-full bg-slate-700/50 rounded-full h-1.5 my-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-400 to-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${waterPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-1 pt-1">
            <button
              onClick={() => onUpdateWater(-250)}
              disabled={waterMl <= 0}
              className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-700/60 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
            >
              -250ml
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateWater(250)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 active:scale-95 transition-all"
              >
                +250ml
              </button>
              <button
                onClick={() => onUpdateWater(500)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 active:scale-95 transition-all"
              >
                +500ml
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
