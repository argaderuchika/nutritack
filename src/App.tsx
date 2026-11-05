import React, { useState, useEffect } from 'react';
import { FoodItem, MealEntry, MealType, DayLog, UserGoal, WeightRecord } from './types';
import {
  loadUserGoal,
  saveUserGoal,
  loadCustomFoods,
  saveCustomFoods,
  loadDayLogs,
  saveDayLogs,
  loadWeightLogs,
  saveWeightLogs,
  getTodayString,
} from './utils/storage';
import { Header } from './components/Header';
import { DailyDashboard } from './components/DailyDashboard';
import { MealSection } from './components/MealSection';
import { AddFoodModal } from './components/AddFoodModal';
import { EditMealEntryModal } from './components/EditMealEntryModal';
import { QuickAddModal } from './components/QuickAddModal';
import { DailyNotesCard } from './components/DailyNotesCard';
import { WeightTracker } from './components/WeightTracker';
import { GoalsSettingsModal } from './components/GoalsSettingsModal';
import { ExportImportModal } from './components/ExportImportModal';
import { IosInstallModal } from './components/IosInstallModal';
import { WeeklyDigest } from './components/WeeklyDigest';
import { Copy, PlusCircle, Scale, Sparkles, BookOpen, Smartphone, X, Camera, BarChart3 } from 'lucide-react';

export const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [goal, setGoal] = useState<UserGoal>(loadUserGoal);
  const [customFoods, setCustomFoods] = useState<FoodItem[]>(loadCustomFoods);
  const [dayLogs, setDayLogs] = useState<Record<string, DayLog>>(loadDayLogs);
  const [weightLogs, setWeightLogs] = useState<WeightRecord[]>(loadWeightLogs);

  // Modals state
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType>('breakfast');
  const [addFoodInitialTab, setAddFoodInitialTab] = useState<'photo' | 'library' | 'online' | 'create'>('photo');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickMealType, setQuickMealType] = useState<MealType>('breakfast');
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Edit entry modal state
  const [editingEntry, setEditingEntry] = useState<MealEntry | null>(null);
  const [isEditEntryOpen, setIsEditEntryOpen] = useState(false);

  // iOS Banner state
  const [showIosBanner, setShowIosBanner] = useState(false);

  useEffect(() => {
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const dismissed = sessionStorage.getItem('nutritrack_ios_banner_dismissed');

    if (isIos && !isRunningStandalone && !dismissed) {
      setShowIosBanner(true);
    }
  }, []);

  const handleDismissIosBanner = () => {
    setShowIosBanner(false);
    sessionStorage.setItem('nutritrack_ios_banner_dismissed', 'true');
  };

  // View Mode & Theme
  const [activeView, setActiveView] = useState<'diary' | 'weekly'>('diary');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('nutritrack_theme') as 'dark' | 'light') || 'dark';
  });

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('nutritrack_theme', next);
  };

  // Current day data
  const currentDayLog: DayLog = dayLogs[selectedDate] || {
    date: selectedDate,
    entries: [],
    waterMl: 0,
    steps: 0,
    weightTrainingMins: 0,
    sleepHours: 0,
    notes: '',
  };

  // Daily totals
  const consumedCalories = currentDayLog.entries.reduce((sum, e) => sum + e.calculated.calories, 0);
  const consumedProtein = currentDayLog.entries.reduce((sum, e) => sum + e.calculated.protein, 0);
  const consumedCarbs = currentDayLog.entries.reduce((sum, e) => sum + e.calculated.carbs, 0);
  const consumedFat = currentDayLog.entries.reduce((sum, e) => sum + e.calculated.fat, 0);
  const consumedFiber = currentDayLog.entries.reduce((sum, e) => sum + e.calculated.fiber, 0);

  // Group entries by meal type
  const entriesByMeal = {
    breakfast: currentDayLog.entries.filter((e) => e.mealType === 'breakfast'),
    lunch: currentDayLog.entries.filter((e) => e.mealType === 'lunch'),
    dinner: currentDayLog.entries.filter((e) => e.mealType === 'dinner'),
    snacks: currentDayLog.entries.filter((e) => e.mealType === 'snacks'),
  };

  // Check if yesterday had meals to enable "Copy from Yesterday"
  const getYesterdayDate = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };
  const yesterdayLog = dayLogs[getYesterdayDate()];
  const canCopyYesterday = currentDayLog.entries.length === 0 && yesterdayLog && yesterdayLog.entries.length > 0;

  // Add Food Entry (Create)
  const handleAddEntry = (mealType: MealType, food: FoodItem, quantity: number) => {
    const scale = quantity / (food.servingSize || 1);
    const newEntry: MealEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      mealType,
      food,
      quantity,
      calculated: {
        calories: Math.round(food.calories * scale),
        protein: Math.round(food.protein * scale * 10) / 10,
        carbs: Math.round(food.carbs * scale * 10) / 10,
        fat: Math.round(food.fat * scale * 10) / 10,
        fiber: Math.round(food.fiber * scale * 10) / 10,
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedLog: DayLog = {
      ...currentDayLog,
      entries: [...currentDayLog.entries, newEntry],
    };

    const updatedDayLogs = { ...dayLogs, [selectedDate]: updatedLog };
    setDayLogs(updatedDayLogs);
    saveDayLogs(updatedDayLogs);
  };

  // Open Edit Modal for a logged food entry (Edit)
  const handleOpenEditEntry = (entry: MealEntry) => {
    setEditingEntry(entry);
    setIsEditEntryOpen(true);
  };

  // Save changes to an existing food diary entry (Edit)
  const handleSaveEditedEntry = (updatedEntry: MealEntry) => {
    const updatedEntries = currentDayLog.entries.map((e) =>
      e.id === updatedEntry.id ? updatedEntry : e
    );

    const updatedLog: DayLog = {
      ...currentDayLog,
      entries: updatedEntries,
    };

    const updatedDayLogs = { ...dayLogs, [selectedDate]: updatedLog };
    setDayLogs(updatedDayLogs);
    saveDayLogs(updatedDayLogs);
    setIsEditEntryOpen(false);
    setEditingEntry(null);
  };

  // Delete Food Entry (Delete)
  const handleDeleteEntry = (entryId: string) => {
    const updatedEntries = currentDayLog.entries.filter((e) => e.id !== entryId);
    const updatedLog: DayLog = { ...currentDayLog, entries: updatedEntries };
    const updatedDayLogs = { ...dayLogs, [selectedDate]: updatedLog };
    setDayLogs(updatedDayLogs);
    saveDayLogs(updatedDayLogs);
  };

  // Daily Food Diary Notes (Create / Edit / Delete)
  const handleSaveDayNotes = (notes: string) => {
    const updatedLog: DayLog = { ...currentDayLog, notes };
    const updatedDayLogs = { ...dayLogs, [selectedDate]: updatedLog };
    setDayLogs(updatedDayLogs);
    saveDayLogs(updatedDayLogs);
  };

  const handleDeleteDayNotes = () => {
    const updatedLog: DayLog = { ...currentDayLog, notes: '' };
    const updatedDayLogs = { ...dayLogs, [selectedDate]: updatedLog };
    setDayLogs(updatedDayLogs);
    saveDayLogs(updatedDayLogs);
  };

  // Water intake update
  const handleUpdateWater = (deltaMl: number) => {
    const newWater = Math.max(0, currentDayLog.waterMl + deltaMl);
    const updatedLog: DayLog = { ...currentDayLog, waterMl: newWater };
    const updatedDayLogs = { ...dayLogs, [selectedDate]: updatedLog };
    setDayLogs(updatedDayLogs);
    saveDayLogs(updatedDayLogs);
  };

  // Steps count update
  const handleUpdateSteps = (steps: number) => {
    const newSteps = Math.max(0, steps);
    const updatedLog: DayLog = { ...currentDayLog, steps: newSteps };
    const updatedDayLogs = { ...dayLogs, [selectedDate]: updatedLog };
    setDayLogs(updatedDayLogs);
    saveDayLogs(updatedDayLogs);
  };

  // Weight training mins update
  const handleUpdateWeightTraining = (mins: number) => {
    const newMins = Math.max(0, mins);
    const updatedLog: DayLog = { ...currentDayLog, weightTrainingMins: newMins };
    const updatedDayLogs = { ...dayLogs, [selectedDate]: updatedLog };
    setDayLogs(updatedDayLogs);
    saveDayLogs(updatedDayLogs);
  };

  // Sleep time update
  const handleUpdateSleep = (hours: number) => {
    const newSleep = Math.max(0, hours);
    const updatedLog: DayLog = { ...currentDayLog, sleepHours: newSleep };
    const updatedDayLogs = { ...dayLogs, [selectedDate]: updatedLog };
    setDayLogs(updatedDayLogs);
    saveDayLogs(updatedDayLogs);
  };

  // Copy meals from yesterday
  const handleCopyYesterday = () => {
    if (!yesterdayLog) return;
    const clonedEntries: MealEntry[] = yesterdayLog.entries.map((e) => ({
      ...e,
      id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

    const updatedLog: DayLog = {
      ...currentDayLog,
      entries: clonedEntries,
    };
    const updatedDayLogs = { ...dayLogs, [selectedDate]: updatedLog };
    setDayLogs(updatedDayLogs);
    saveDayLogs(updatedDayLogs);
  };

  // Custom Food saved to library (Create)
  const handleSaveCustomFood = (food: FoodItem) => {
    const updated = [food, ...customFoods];
    setCustomFoods(updated);
    saveCustomFoods(updated);
  };

  // Custom Food edited in library (Edit)
  const handleUpdateCustomFood = (updatedFood: FoodItem) => {
    const updated = customFoods.map((f) => (f.id === updatedFood.id ? updatedFood : f));
    setCustomFoods(updated);
    saveCustomFoods(updated);
  };

  // Custom Food deleted from library (Delete)
  const handleDeleteCustomFood = (foodId: string) => {
    const updated = customFoods.filter((f) => f.id !== foodId);
    setCustomFoods(updated);
    saveCustomFoods(updated);
  };

  // Goal saved
  const handleSaveGoal = (updatedGoal: UserGoal) => {
    setGoal(updatedGoal);
    saveUserGoal(updatedGoal);
  };

  // Weight Log added
  const handleAddWeightLog = (record: WeightRecord) => {
    const updated = [...weightLogs, record];
    setWeightLogs(updated);
    saveWeightLogs(updated);

    // Update goal current weight with latest recorded weight
    const sorted = [...updated].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sorted[sorted.length - 1];
    if (latest) {
      const newGoal = { ...goal, currentWeight: latest.weight };
      setGoal(newGoal);
      saveUserGoal(newGoal);
    }
  };

  // Weight Log deleted
  const handleDeleteWeightLog = (id: string) => {
    const updated = weightLogs.filter((w) => w.id !== id);
    setWeightLogs(updated);
    saveWeightLogs(updated);
  };

  // Reload data after backup import
  const handleReloadData = () => {
    setGoal(loadUserGoal());
    setCustomFoods(loadCustomFoods());
    setDayLogs(loadDayLogs());
    setWeightLogs(loadWeightLogs());
  };

  // Open Add Food modal
  const handleOpenAddFood = (type: MealType, tab: 'photo' | 'library' | 'online' | 'create' = 'photo') => {
    setActiveMealType(type);
    setAddFoodInitialTab(tab);
    setIsAddFoodOpen(true);
  };

  // Open Quick Add modal
  const handleOpenQuickAdd = (type: MealType) => {
    setQuickMealType(type);
    setIsQuickAddOpen(true);
  };

  return (
    <div className={`min-h-screen flex flex-col pb-mobile-content transition-colors duration-300 ${theme === 'light' ? 'theme-light text-slate-900' : 'dark-gradient-bg text-slate-100'}`}>
      {/* Top Header */}
      <Header
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        activeView={activeView}
        onViewChange={setActiveView}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenGoals={() => setIsGoalsModalOpen(true)}
        onOpenWeight={() => setIsWeightModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
        currentWeight={goal.currentWeight}
        targetWeight={goal.phase1TargetWeight}
      />

      {/* iOS Safari PWA Install Banner */}
      {showIosBanner && (
        <div className="max-w-5xl mx-auto w-full px-3 sm:px-4 pt-3">
          <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs shadow-md">
            <div className="flex items-center gap-2.5 text-slate-200">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-white">Install NutriTrack on your iPhone:</span>
                <span className="text-slate-400 ml-1 hidden sm:inline">
                  Add to home screen for full-screen view & offline access.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsInstallModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors shadow-sm active:scale-95"
              >
                How to Install
              </button>
              <button
                onClick={handleDismissIosBanner}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto w-full px-3 sm:px-4 pt-3 sm:pt-6 space-y-4 sm:space-y-6 flex-1">
        {activeView === 'weekly' ? (
          /* Overall Week-Wise Digest View */
          <WeeklyDigest
            currentDate={selectedDate}
            dayLogs={dayLogs}
            goal={goal}
            onSelectDate={(newDate) => {
              setSelectedDate(newDate);
              setActiveView('diary');
            }}
          />
        ) : (
          /* Daily Food Diary View */
          <>
            {/* Daily Calorie & Macro Dashboard */}
            <DailyDashboard
              goal={goal}
              consumedCalories={consumedCalories}
              consumedProtein={consumedProtein}
              consumedCarbs={consumedCarbs}
              consumedFat={consumedFat}
              consumedFiber={consumedFiber}
              waterMl={currentDayLog.waterMl}
              steps={currentDayLog.steps || 0}
              weightTrainingMins={currentDayLog.weightTrainingMins || 0}
              sleepHours={currentDayLog.sleepHours || 0}
              onUpdateWater={handleUpdateWater}
              onUpdateSteps={handleUpdateSteps}
              onUpdateWeightTraining={handleUpdateWeightTraining}
              onUpdateSleep={handleUpdateSleep}
            />

            {/* Copy yesterday prompt banner if today is empty */}
            {canCopyYesterday && (
              <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Ate similar meals yesterday? Log in one click:</span>
                </div>
                <button
                  onClick={handleCopyYesterday}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-semibold flex items-center gap-1.5 transition-colors shrink-0 active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Yesterday</span>
                </button>
              </div>
            )}

            {/* Daily Food Diary Notes & Reflection */}
            <DailyNotesCard
              notes={currentDayLog.notes}
              onSaveNotes={handleSaveDayNotes}
              onDeleteNotes={handleDeleteDayNotes}
            />

            {/* Meals Sections: Breakfast, Lunch, Dinner, Snacks */}
            <div className="space-y-3.5 sm:space-y-4">
              <MealSection
                mealType="breakfast"
                entries={entriesByMeal.breakfast}
                onAddFood={(type) => handleOpenAddFood(type, 'photo')}
                onPhotoAdd={(type) => handleOpenAddFood(type, 'photo')}
                onQuickAdd={handleOpenQuickAdd}
                onEditEntry={handleOpenEditEntry}
                onDeleteEntry={handleDeleteEntry}
              />

              <MealSection
                mealType="lunch"
                entries={entriesByMeal.lunch}
                onAddFood={(type) => handleOpenAddFood(type, 'photo')}
                onPhotoAdd={(type) => handleOpenAddFood(type, 'photo')}
                onQuickAdd={handleOpenQuickAdd}
                onEditEntry={handleOpenEditEntry}
                onDeleteEntry={handleDeleteEntry}
              />

              <MealSection
                mealType="dinner"
                entries={entriesByMeal.dinner}
                onAddFood={(type) => handleOpenAddFood(type, 'photo')}
                onPhotoAdd={(type) => handleOpenAddFood(type, 'photo')}
                onQuickAdd={handleOpenQuickAdd}
                onEditEntry={handleOpenEditEntry}
                onDeleteEntry={handleDeleteEntry}
              />

              <MealSection
                mealType="snacks"
                entries={entriesByMeal.snacks}
                onAddFood={(type) => handleOpenAddFood(type, 'photo')}
                onPhotoAdd={(type) => handleOpenAddFood(type, 'photo')}
                onQuickAdd={handleOpenQuickAdd}
                onEditEntry={handleOpenEditEntry}
                onDeleteEntry={handleDeleteEntry}
              />
            </div>
          </>
        )}
      </main>

      {/* Floating Bottom Action Dock for iPhone 17 & Mobile */}
      <div className="sm:hidden fixed bottom-safe-dock left-3 right-3 z-20 flex items-center justify-around bg-slate-900/95 border border-slate-700/80 backdrop-blur-lg py-2 px-2 rounded-2xl shadow-2xl">
        <button
          onClick={() => handleOpenAddFood('dinner', 'photo')}
          className="flex flex-col items-center justify-center gap-1 p-1 text-[10px] font-semibold text-emerald-400 active:scale-90 transition-transform min-w-[54px]"
        >
          <Camera className="w-5 h-5" />
          <span>Snap Meal</span>
        </button>

        <button
          onClick={() => setIsWeightModalOpen(true)}
          className="flex flex-col items-center justify-center gap-1 p-1 text-[10px] font-semibold text-indigo-400 active:scale-90 transition-transform min-w-[54px]"
        >
          <Scale className="w-5 h-5" />
          <span>{goal.currentWeight}kg</span>
        </button>

        <button
          onClick={() => {
            const notesEl = document.querySelector('textarea');
            if (notesEl) {
              notesEl.focus();
            } else {
              window.scrollTo({ top: 350, behavior: 'smooth' });
            }
          }}
          className="flex flex-col items-center justify-center gap-1 p-1 text-[10px] font-semibold text-purple-400 active:scale-90 transition-transform min-w-[54px]"
        >
          <BookOpen className="w-5 h-5" />
          <span>Diary Note</span>
        </button>

        <button
          onClick={() => setIsGoalsModalOpen(true)}
          className="flex flex-col items-center justify-center gap-1 p-1 text-[10px] font-semibold text-amber-400 active:scale-90 transition-transform min-w-[54px]"
        >
          <Sparkles className="w-5 h-5" />
          <span>Target</span>
        </button>

        <button
          onClick={() => setActiveView(activeView === 'diary' ? 'weekly' : 'diary')}
          className="flex flex-col items-center justify-center gap-1 p-1 text-[10px] font-semibold text-teal-400 active:scale-90 transition-transform min-w-[54px]"
        >
          {activeView === 'diary' ? <BarChart3 className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          <span>{activeView === 'diary' ? 'Weekly' : 'Diary'}</span>
        </button>

        <button
          onClick={() => setIsInstallModalOpen(true)}
          className="flex flex-col items-center justify-center gap-1 p-1 text-[10px] font-semibold text-slate-400 hover:text-white active:scale-90 transition-transform min-w-[50px]"
        >
          <Smartphone className="w-5 h-5" />
          <span>Install</span>
        </button>
      </div>

      {/* Add Food Modal (Create) */}
      <AddFoodModal
        isOpen={isAddFoodOpen}
        onClose={() => setIsAddFoodOpen(false)}
        mealType={activeMealType}
        customFoods={customFoods}
        initialTab={addFoodInitialTab}
        onAddEntry={handleAddEntry}
        onSaveCustomFood={handleSaveCustomFood}
        onUpdateCustomFood={handleUpdateCustomFood}
        onDeleteCustomFood={handleDeleteCustomFood}
      />

      {/* Edit Food Diary Entry Modal (Edit & Delete) */}
      <EditMealEntryModal
        isOpen={isEditEntryOpen}
        onClose={() => {
          setIsEditEntryOpen(false);
          setEditingEntry(null);
        }}
        entry={editingEntry}
        onSaveEntry={handleSaveEditedEntry}
        onDeleteEntry={handleDeleteEntry}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        mealType={quickMealType}
        onAddEntry={handleAddEntry}
      />

      {/* Weight Tracker Modal */}
      <WeightTracker
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        weightLogs={weightLogs}
        goal={goal}
        onAddWeightLog={handleAddWeightLog}
        onDeleteWeightLog={handleDeleteWeightLog}
      />

      {/* Goals & Settings Modal */}
      <GoalsSettingsModal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
        goal={goal}
        onSaveGoal={handleSaveGoal}
      />

      {/* Export & Import Modal */}
      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onDataReload={handleReloadData}
      />

      {/* iPhone PWA Install Instructions Modal */}
      <IosInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
};

export default App;
