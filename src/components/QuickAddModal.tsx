import React, { useState } from 'react';
import { MealType, FoodItem } from '../types';
import { X, Zap } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: MealType;
  onAddEntry: (mealType: MealType, food: FoodItem, quantity: number) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  mealType,
  onAddEntry,
}) => {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState<number>(250);
  const [protein, setProtein] = useState<number>(20);
  const [carbs, setCarbs] = useState<number>(25);
  const [fat, setFat] = useState<number>(8);
  const [fiber, setFiber] = useState<number>(5);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const food: FoodItem = {
      id: `quick_${Date.now()}`,
      name: name.trim() || `Quick ${mealType} Item`,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      fiber: Number(fiber) || 0,
      servingSize: 1,
      servingUnit: 'portion',
      isCustom: true,
    };

    onAddEntry(mealType, food, 1);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-4 sm:p-5 shadow-2xl max-h-[92vh] overflow-y-auto smooth-scroll">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white capitalize">Quick Add to {mealType}</h3>
              <p className="text-xs text-slate-400">Log numbers directly without searching</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300">Food / Meal Description</label>
            <input
              type="text"
              placeholder="e.g. Afternoon Snack / Cafe Latte"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-emerald-400">Total Calories (kcal) *</label>
            <input
              type="number"
              required
              min="0"
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-base font-bold text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-indigo-400">Protein (g)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-teal-400">Fiber (g)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={fiber}
                onChange={(e) => setFiber(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-amber-400">Carbs (g)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={carbs}
                onChange={(e) => setCarbs(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-rose-400">Fat (g)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={fat}
                onChange={(e) => setFat(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors mt-2"
          >
            Add to {mealType}
          </button>
        </form>
      </div>
    </div>
  );
};

