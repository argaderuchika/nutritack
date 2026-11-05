import React, { useState } from 'react';
import { DayLog, UserGoal } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  TrendingDown,
  TrendingUp,
  Award,
  Sparkles,
  Footprints,
  Dumbbell,
  Droplets,
  Moon,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface WeeklyDigestProps {
  currentDate: string; // YYYY-MM-DD
  dayLogs: Record<string, DayLog>;
  goal: UserGoal;
  onSelectDate: (date: string) => void;
}

export const WeeklyDigest: React.FC<WeeklyDigestProps> = ({
  currentDate,
  dayLogs,
  goal,
  onSelectDate,
}) => {
  // Compute start of week (Monday) for the currently selected date
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const getWeekDays = (offset: number) => {
    const base = new Date(currentDate + 'T00:00:00');
    // Shift by offset * 7 days
    base.setDate(base.getDate() + offset * 7);

    // Get Monday of this week (1 = Monday, 0 = Sunday)
    const day = base.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(base);
    monday.setDate(base.getDate() + diffToMonday);

    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const weekDayStrings = getWeekDays(weekOffset);
  const weekStartStr = weekDayStrings[0];
  const weekEndStr = weekDayStrings[6];

  const formatShortDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDayName = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Compile stats for each day
  const weekData = weekDayStrings.map((dateStr) => {
    const log = dayLogs[dateStr];
    const entries = log?.entries || [];
    const calories = entries.reduce((s, e) => s + e.calculated.calories, 0);
    const protein = entries.reduce((s, e) => s + e.calculated.protein, 0);
    const carbs = entries.reduce((s, e) => s + e.calculated.carbs, 0);
    const fat = entries.reduce((s, e) => s + e.calculated.fat, 0);
    const fiber = entries.reduce((s, e) => s + e.calculated.fiber, 0);
    const steps = log?.steps || 0;
    const workoutMins = log?.weightTrainingMins || 0;
    const sleepHours = log?.sleepHours || 0;
    const waterMl = log?.waterMl || 0;
    const hasData = entries.length > 0 || steps > 0 || workoutMins > 0 || sleepHours > 0;

    const calorieDiff = calories - goal.targetCalories; // negative = deficit
    const inDeficit = calories > 0 && calorieDiff <= 50;

    return {
      date: dateStr,
      dayName: formatDayName(dateStr),
      shortDate: formatShortDate(dateStr),
      calories,
      protein,
      carbs,
      fat,
      fiber,
      steps,
      workoutMins,
      sleepHours,
      waterMl,
      hasData,
      inDeficit,
      calorieDiff,
    };
  });

  // Calculate weekly aggregates
  const loggedDays = weekData.filter((d) => d.hasData);
  const loggedDaysCount = loggedDays.length || 1;

  const totalCalories = loggedDays.reduce((s, d) => s + d.calories, 0);
  const avgCalories = Math.round(totalCalories / loggedDaysCount);

  const totalProtein = loggedDays.reduce((s, d) => s + d.protein, 0);
  const avgProtein = Math.round((totalProtein / loggedDaysCount) * 10) / 10;

  const totalSteps = loggedDays.reduce((s, d) => s + d.steps, 0);
  const avgSteps = Math.round(totalSteps / loggedDaysCount);

  const totalSleep = loggedDays.reduce((s, d) => s + d.sleepHours, 0);
  const avgSleep = Math.round((totalSleep / loggedDaysCount) * 10) / 10;

  const totalWorkoutMins = loggedDays.reduce((s, d) => s + d.workoutMins, 0);

  // Deficit Calculation
  // Total calorie target for the logged days
  const targetCaloriesForLogged = goal.targetCalories * loggedDaysCount;
  const netWeeklyDeficit = targetCaloriesForLogged - totalCalories; // positive = net deficit
  const estFatLostKg = Math.round((netWeeklyDeficit / 7700) * 100) / 100;

  const deficitDaysCount = weekData.filter((d) => d.calories > 0 && d.calories <= goal.targetCalories).length;

  const maxCalorieChart = Math.max(goal.targetCalories * 1.35, ...weekData.map((d) => d.calories));

  const isTodayInWeek = weekDayStrings.includes(new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Week Header & Range Navigator */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-3xl p-4 sm:p-5 shadow-lg backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">Overall Weekly Digest</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {deficitDaysCount}/7 Days in Deficit
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {formatShortDate(weekStartStr)} — {formatShortDate(weekEndStr)}
            </p>
          </div>
        </div>

        {/* Week navigation buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-colors"
            >
              Current Week
            </button>
          )}

          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Scorecard: Net Weekly Deficit & Fat Loss Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Net Calorie Deficit Card */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-800/80 to-slate-900 border border-emerald-500/30 rounded-3xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Net Deficit
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span
              className={`text-2xl sm:text-3xl font-black ${
                netWeeklyDeficit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {netWeeklyDeficit >= 0 ? `-${netWeeklyDeficit.toLocaleString()}` : `+${Math.abs(netWeeklyDeficit).toLocaleString()}`}
            </span>
            <span className="text-xs text-slate-400 ml-1">kcal</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">
            {netWeeklyDeficit >= 0
              ? `🔥 Est. ~${estFatLostKg} kg fat burned this week`
              : 'Over target budget for logged days'}
          </p>
        </div>

        {/* Avg Calories & Target */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Daily Avg Calories
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {avgCalories.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 ml-1">/ {goal.targetCalories} kcal</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {avgCalories <= goal.targetCalories
              ? `✅ ${goal.targetCalories - avgCalories} kcal below budget on average`
              : `⚠️ ${avgCalories - goal.targetCalories} kcal above budget on average`}
          </p>
        </div>

        {/* Avg Protein */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Daily Avg Protein
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-indigo-400">{avgProtein}g</span>
            <span className="text-xs text-slate-400 ml-1">/ {goal.targetProtein}g target</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {avgProtein >= goal.targetProtein ? '💪 Muscle goal achieved' : 'Aim for 1.8g per kg bodyweight'}
          </p>
        </div>

        {/* Habits: Sleep & Steps */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Activity & Sleep
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <span className="text-lg font-black text-purple-400">{avgSleep}h</span>
              <p className="text-[10px] text-slate-400">Avg Sleep</p>
            </div>
            <div>
              <span className="text-lg font-black text-emerald-400">{avgSteps.toLocaleString()}</span>
              <p className="text-[10px] text-slate-400">Avg Steps</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            🏋️ {totalWorkoutMins} mins total workout this week
          </p>
        </div>
      </div>

      {/* Interactive 7-Day Calorie & Deficit Bar Chart */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>7-Day Calorie Consumption Trend</span>
              <span className="text-xs text-emerald-400 font-medium">
                (Click any bar to open that day's diary)
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Dashed line marks your daily fat loss budget ({goal.targetCalories} kcal). Green bars indicate deficit.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" />
              <span>In Deficit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-500 inline-block" />
              <span>Over Budget</span>
            </div>
          </div>
        </div>

        {/* Chart Bars */}
        <div className="pt-6 pb-2">
          <div className="h-44 sm:h-52 flex items-end justify-between gap-2 sm:gap-4 relative border-b border-slate-700/60 pb-1">
            {/* Target Calorie Horizontal Guide Line */}
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-emerald-400/40 pointer-events-none z-10 flex items-center justify-end"
              style={{
                bottom: `${(goal.targetCalories / maxCalorieChart) * 100}%`,
              }}
            >
              <span className="text-[10px] bg-slate-900/90 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 -translate-y-1/2 mr-1 font-bold">
                Goal: {goal.targetCalories} kcal
              </span>
            </div>

            {weekData.map((d) => {
              const heightPct = d.calories > 0 ? Math.min(100, Math.round((d.calories / maxCalorieChart) * 100)) : 4;
              const isSelected = d.date === currentDate;
              const isOver = d.calories > goal.targetCalories;

              return (
                <div
                  key={d.date}
                  onClick={() => onSelectDate(d.date)}
                  className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer group transition-all"
                >
                  {/* Calorie tooltip badge on top */}
                  <span
                    className={`text-[10px] sm:text-xs font-bold mb-1 opacity-90 group-hover:scale-110 transition-transform ${
                      d.calories === 0
                        ? 'text-slate-600'
                        : isOver
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {d.calories > 0 ? d.calories : '—'}
                  </span>

                  {/* Vertical Bar */}
                  <div className="w-full max-w-[48px] bg-slate-700/30 rounded-t-xl h-full flex items-end overflow-hidden p-0.5">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 group-hover:brightness-125 ${
                        d.calories === 0
                          ? 'bg-slate-700/40'
                          : isOver
                          ? 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-md shadow-rose-500/20'
                          : 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md shadow-emerald-500/20'
                      } ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  {/* Day label */}
                  <div className="mt-2 text-center">
                    <p
                      className={`text-xs font-bold ${
                        isSelected ? 'text-emerald-400 underline' : 'text-slate-200'
                      }`}
                    >
                      {d.dayName}
                    </p>
                    <p className="text-[10px] text-slate-400">{d.shortDate.split(' ')[1]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day-by-Day Habit Compliance Breakdown */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Daily Wellness & Macro Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Complete review of calories, protein, steps, sleep, and workouts for each day
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-700/50">
          {weekData.map((d) => {
            const isSelected = d.date === currentDate;
            return (
              <div
                key={d.date}
                onClick={() => onSelectDate(d.date)}
                className={`py-3 px-2 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 cursor-pointer hover:bg-slate-700/40 transition-colors ${
                  isSelected ? 'bg-slate-700/30 border border-emerald-500/30' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                      d.calories > 0
                        ? d.calories <= goal.targetCalories
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {d.dayName}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{d.shortDate}</span>
                      {d.calories > 0 && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            d.calories <= goal.targetCalories
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {d.calories <= goal.targetCalories
                            ? `-${goal.targetCalories - d.calories} kcal deficit`
                            : `+${d.calories - goal.targetCalories} kcal over`}
                        </span>
                      )}
                    </div>

                    {/* Macro chips */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                      <span>Calories: <strong className="text-white">{d.calories}</strong> kcal</span>
                      <span>•</span>
                      <span className="text-indigo-400">P: {d.protein}g</span>
                      <span>•</span>
                      <span className="text-amber-400">C: {d.carbs}g</span>
                      <span>•</span>
                      <span className="text-rose-400">F: {d.fat}g</span>
                      <span>•</span>
                      <span className="text-emerald-400">Fib: {d.fiber}g</span>
                    </div>
                  </div>
                </div>

                {/* Right metrics: steps, sleep, workout */}
                <div className="flex items-center gap-3 self-end sm:self-center text-xs text-slate-300">
                  <div className="flex items-center gap-1 text-emerald-400" title="Steps">
                    <Footprints className="w-3.5 h-3.5" />
                    <span>{d.steps > 0 ? d.steps.toLocaleString() : '—'}</span>
                  </div>

                  <div className="flex items-center gap-1 text-purple-400" title="Sleep">
                    <Moon className="w-3.5 h-3.5" />
                    <span>{d.sleepHours > 0 ? `${d.sleepHours}h` : '—'}</span>
                  </div>

                  <div className="flex items-center gap-1 text-indigo-400" title="Weight Training">
                    <Dumbbell className="w-3.5 h-3.5" />
                    <span>{d.workoutMins > 0 ? `${d.workoutMins}m` : '—'}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDate(d.date);
                    }}
                    className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition-colors"
                    title="Open food diary for this date"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

