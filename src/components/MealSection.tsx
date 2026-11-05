import React from 'react';
import { MealEntry, MealType } from '../types';
import { Plus, Trash2, Zap, Coffee, Sun, Moon, Apple, Edit2, Camera } from 'lucide-react';

interface MealSectionProps {
  mealType: MealType;
  entries: MealEntry[];
  onAddFood: (mealType: MealType) => void;
  onPhotoAdd?: (mealType: MealType) => void;
  onQuickAdd: (mealType: MealType) => void;
  onEditEntry: (entry: MealEntry) => void;
  onDeleteEntry: (entryId: string) => void;
}

export const MealSection: React.FC<MealSectionProps> = ({
  mealType,
  entries,
  onAddFood,
  onPhotoAdd,
  onQuickAdd,
  onEditEntry,
  onDeleteEntry,
}) => {
  const meta = {
    breakfast: {
      title: 'Breakfast',
      icon: Coffee,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      placeholder: 'Log your morning eggs, oats, or breakfast...',
    },
    lunch: {
      title: 'Lunch',
      icon: Sun,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      placeholder: 'Log your lunch, rotis, dal, protein bowl...',
    },
    dinner: {
      title: 'Dinner',
      icon: Moon,
      iconColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      placeholder: 'Log your dinner, salad, lean protein...',
    },
    snacks: {
      title: 'Snacks & Extras',
      icon: Apple,
      iconColor: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      placeholder: 'Log fruits, almonds, protein shake, tea/coffee...',
    },
  }[mealType];

  const Icon = meta.icon;

  // Subtotals
  const totalCalories = entries.reduce((sum, e) => sum + e.calculated.calories, 0);
  const totalProtein = entries.reduce((sum, e) => sum + e.calculated.protein, 0);
  const totalCarbs = entries.reduce((sum, e) => sum + e.calculated.carbs, 0);
  const totalFat = entries.reduce((sum, e) => sum + e.calculated.fat, 0);
  const totalFiber = entries.reduce((sum, e) => sum + e.calculated.fiber, 0);

  return (
    <div className="bg-slate-800/50 border border-slate-700/60 rounded-3xl p-3.5 sm:p-5 transition-all shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${meta.bgColor} flex items-center justify-center shrink-0 border ${meta.borderColor}`}>
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${meta.iconColor}`} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white capitalize">{meta.title}</h3>
            {entries.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-slate-400 mt-0.5 font-medium">
                <span className="text-indigo-400">P: {Math.round(totalProtein)}g</span>
                <span>•</span>
                <span className="text-amber-400">C: {Math.round(totalCarbs)}g</span>
                <span>•</span>
                <span className="text-rose-400">F: {Math.round(totalFat)}g</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">Fib: {Math.round(totalFiber)}g</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="text-right mr-1">
            <span className="text-sm sm:text-base font-black text-white">{Math.round(totalCalories)}</span>
            <span className="text-[10px] sm:text-xs text-slate-400 ml-1">kcal</span>
          </div>

          {onPhotoAdd && (
            <button
              onClick={() => onPhotoAdd(mealType)}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 active:scale-95 text-emerald-400 hover:text-emerald-300 transition-all min-h-[38px] min-w-[38px] flex items-center justify-center border border-emerald-500/25"
              title="Snap photo & estimate calories/oil"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onQuickAdd(mealType)}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all min-h-[38px] min-w-[38px] flex items-center justify-center"
            title="Quick calorie & macro entry"
          >
            <Zap className="w-4 h-4 text-amber-400" />
          </button>

          <button
            onClick={() => onAddFood(mealType)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 sm:py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 active:scale-95 transition-all min-h-[38px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Food</span>
          </button>
        </div>
      </div>

      {/* Entries List */}
      <div className="mt-2 divide-y divide-slate-700/40">
        {entries.length === 0 ? (
          <div className="py-5 sm:py-6 text-center text-xs text-slate-500">
            {meta.placeholder}
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="py-3 flex items-center justify-between gap-2.5 sm:gap-3 group hover:bg-slate-800/40 rounded-xl px-1.5 sm:px-2 transition-colors"
            >
              {/* Tappable details row */}
              <button
                type="button"
                onClick={() => onEditEntry(entry)}
                className="min-w-0 flex-1 text-left cursor-pointer group-hover:text-emerald-300 transition-colors"
              >
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <p className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-emerald-300 truncate">
                    {entry.food.name}
                  </p>
                  {entry.food.brand && (
                    <span className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                      ({entry.food.brand})
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-400 mt-1">
                  <span className="font-semibold text-emerald-400/90">
                    {entry.quantity} {entry.food.servingUnit}
                  </span>
                  <span>•</span>
                  <span className="text-indigo-400 font-medium">P: {entry.calculated.protein}g</span>
                  <span>•</span>
                  <span className="text-amber-400 font-medium">C: {entry.calculated.carbs}g</span>
                  <span>•</span>
                  <span className="text-rose-400 font-medium">F: {entry.calculated.fat}g</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">Fib: {entry.calculated.fiber}g</span>
                </div>
              </button>

              {/* Calories & Action buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span className="text-xs sm:text-sm font-bold text-slate-200">
                  {Math.round(entry.calculated.calories)} kcal
                </span>

                {/* Edit Button */}
                <button
                  onClick={() => onEditEntry(entry)}
                  className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 active:scale-95 transition-all min-h-[34px] min-w-[34px] flex items-center justify-center"
                  title="Edit entry"
                >
                  <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => onDeleteEntry(entry.id)}
                  className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all min-h-[34px] min-w-[34px] flex items-center justify-center"
                  title="Remove food"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
