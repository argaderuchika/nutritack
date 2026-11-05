import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Scale,
  Settings,
  Database,
  Flame,
  Smartphone,
  BarChart3,
  BookOpen,
  SunMedium,
  Moon,
} from 'lucide-react';

interface HeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  activeView: 'diary' | 'weekly';
  onViewChange: (view: 'diary' | 'weekly') => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenGoals: () => void;
  onOpenWeight: () => void;
  onOpenExport: () => void;
  onOpenInstall?: () => void;
  currentWeight: number;
  targetWeight: number;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onDateChange,
  activeView,
  onViewChange,
  theme,
  onToggleTheme,
  onOpenGoals,
  onOpenWeight,
  onOpenExport,
  onOpenInstall,
  currentWeight,
  targetWeight,
}) => {
  const getRelativeDateLabel = (dateStr: string) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    if (dateStr === tomorrowStr) return 'Tomorrow';

    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleTodayClick = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/60 pt-safe-top transition-all shadow-lg">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 space-y-2.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
          {/* Logo & Goal Tagline */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 text-white shrink-0">
                <Flame className="w-5 h-5 fill-white text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white bg-gradient-to-r from-white via-slate-100 to-emerald-200 bg-clip-text text-transparent">
                    NutriTrack
                  </h1>

                </div>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  {currentWeight} kg → {targetWeight} kg (Phase 1)
                </p>
              </div>
            </div>

            {/* Quick Actions (Mobile Top Bar) */}
            <div className="flex sm:hidden items-center gap-1">
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-xl bg-slate-800/80 text-amber-300 hover:text-white active:scale-95 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center border border-slate-700/60"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <SunMedium className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              </button>
              {onOpenInstall && (
                <button
                  onClick={onOpenInstall}
                  className="px-2 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-[11px] font-semibold flex items-center gap-1 active:scale-95 transition-all"
                  title="Install NutriTrack on iPhone"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Install</span>
                </button>
              )}
              <button
                onClick={onOpenWeight}
                className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white active:scale-95 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center border border-slate-700/60"
                title="Weight Tracker"
              >
                <Scale className="w-4 h-4 text-indigo-400" />
              </button>
              <button
                onClick={onOpenGoals}
                className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white active:scale-95 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center border border-slate-700/60"
                title="Goal Settings"
              >
                <Settings className="w-4 h-4 text-emerald-400" />
              </button>
              <button
                onClick={onOpenExport}
                className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white active:scale-95 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center border border-slate-700/60"
                title="Backup Data"
              >
                <Database className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>

          {/* Center Date Navigator (for Daily View) */}
          {activeView === 'diary' && (
            <div className="flex items-center justify-between sm:justify-center gap-1 bg-slate-800/90 p-1 rounded-2xl border border-slate-700/70 shadow-inner w-full sm:w-auto">
              <button
                onClick={handlePrevDay}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 active:scale-95 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 px-2 py-1 flex-1 sm:flex-initial">
                <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => e.target.value && onDateChange(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm font-semibold text-slate-100 cursor-pointer focus:outline-none [color-scheme:dark]"
                />
                <span className="text-[11px] sm:text-xs font-semibold text-emerald-400/90 whitespace-nowrap">
                  ({getRelativeDateLabel(selectedDate)})
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleNextDay}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 active:scale-95 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {!isToday && (
                  <button
                    onClick={handleTodayClick}
                    className="text-[11px] font-bold px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 active:scale-95 transition-all"
                  >
                    Today
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Desktop Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-all shadow-sm active:scale-95"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <SunMedium className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>
            {onOpenInstall && (
              <button
                onClick={onOpenInstall}
                className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 px-3 py-2 rounded-xl border border-emerald-500/30 transition-all shadow-sm active:scale-95"
                title="Install NutriTrack as iPhone PWA"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>iPhone App</span>
              </button>
            )}
            <button
              onClick={onOpenWeight}
              className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700/70 transition-all hover:border-slate-600 shadow-sm"
            >
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
              <span>Weight ({currentWeight}kg)</span>
            </button>
            <button
              onClick={onOpenGoals}
              className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700/70 transition-all hover:border-slate-600 shadow-sm"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target & Deficit</span>
            </button>
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-2 rounded-xl border border-slate-700/70 transition-all hover:border-slate-600 shadow-sm"
              title="Backup & Restore Data"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Backup</span>
            </button>
          </div>
        </div>

        {/* View Mode Segmented Tab: Daily Diary vs Overall Weekly Digest */}
        <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-800/70 border border-slate-700/60 max-w-sm mx-auto shadow-inner">
          <button
            onClick={() => onViewChange('diary')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${activeView === 'diary'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Daily Diary</span>
          </button>

          <button
            onClick={() => onViewChange('weekly')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${activeView === 'weekly'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Overall Weekly Digest</span>
          </button>
        </div>
      </div>
    </header>
  );
};
