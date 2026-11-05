import React, { useState, useEffect } from 'react';
import { MealEntry, MealType } from '../types';
import { X, Trash2, Check, Edit3, Flame, Clock, Layers } from 'lucide-react';

interface EditMealEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: MealEntry | null;
  onSaveEntry: (updatedEntry: MealEntry) => void;
  onDeleteEntry: (entryId: string) => void;
}

export const EditMealEntryModal: React.FC<EditMealEntryModalProps> = ({
  isOpen,
  onClose,
  entry,
  onSaveEntry,
  onDeleteEntry,
}) => {
  if (!isOpen || !entry) return null;

  const [quantity, setQuantity] = useState<number>(entry.quantity);
  const [mealType, setMealType] = useState<MealType>(entry.mealType);
  const [name, setName] = useState<string>(entry.food.name);
  const [brand, setBrand] = useState<string>(entry.food.brand || '');
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);

  // Editable macros
  const [calories, setCalories] = useState<number>(entry.calculated.calories);
  const [protein, setProtein] = useState<number>(entry.calculated.protein);
  const [carbs, setCarbs] = useState<number>(entry.calculated.carbs);
  const [fat, setFat] = useState<number>(entry.calculated.fat);
  const [fiber, setFiber] = useState<number>(entry.calculated.fiber);

  useEffect(() => {
    if (entry) {
      setQuantity(entry.quantity);
      setMealType(entry.mealType);
      setName(entry.food.name);
      setBrand(entry.food.brand || '');
      setCalories(entry.calculated.calories);
      setProtein(entry.calculated.protein);
      setCarbs(entry.calculated.carbs);
      setFat(entry.calculated.fat);
      setFiber(entry.calculated.fiber);
      setIsManualOverride(false);
    }
  }, [entry]);

  // When quantity changes, if not manual override, recalculate scaled macros based on base food
  const handleQuantityChange = (newQty: number) => {
    setQuantity(newQty);
    if (!isManualOverride && entry.food.servingSize) {
      const scale = newQty / entry.food.servingSize;
      setCalories(Math.round(entry.food.calories * scale));
      setProtein(Math.round(entry.food.protein * scale * 10) / 10);
      setCarbs(Math.round(entry.food.carbs * scale * 10) / 10);
      setFat(Math.round(entry.food.fat * scale * 10) / 10);
      setFiber(Math.round(entry.food.fiber * scale * 10) / 10);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry) return;

    const updatedEntry: MealEntry = {
      ...entry,
      mealType,
      quantity: Number(quantity) || 1,
      food: {
        ...entry.food,
        name: name.trim() || entry.food.name,
        brand: brand.trim() || entry.food.brand,
      },
      calculated: {
        calories: Math.max(0, Math.round(Number(calories) || 0)),
        protein: Math.max(0, Math.round((Number(protein) || 0) * 10) / 10),
        carbs: Math.max(0, Math.round((Number(carbs) || 0) * 10) / 10),
        fat: Math.max(0, Math.round((Number(fat) || 0) * 10) / 10),
        fiber: Math.max(0, Math.round((Number(fiber) || 0) * 10) / 10),
      },
    };

    onSaveEntry(updatedEntry);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${entry.food.name}" from your diary?`)) {
      onDeleteEntry(entry.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Diary Entry</h3>
              <p className="text-xs text-slate-400">Modify portion, meal section, or fine-tune macros</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-4 smooth-scroll">
          {/* Meal Category Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Meal Category</label>
            <div className="grid grid-cols-4 gap-2">
              {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMealType(type)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl capitalize transition-all border ${
                    mealType === type
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Food Name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Food Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Brand / Source (Optional)</label>
              <input
                type="text"
                value={brand}
                placeholder="e.g. Homemade, Amul, etc."
                onChange={(e) => setBrand(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Portion / Quantity */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white">
                Portion Size ({entry.food.servingUnit})
              </label>
              <span className="text-[11px] text-slate-400">
                Base: {entry.food.servingSize} {entry.food.servingUnit}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0.1"
                step="any"
                value={quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-base font-bold text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs font-semibold text-slate-400 px-2">
                {entry.food.servingUnit}
              </span>
            </div>

            {/* Quick portion buttons */}
            <div className="flex items-center gap-1.5 pt-1">
              {[0.5, 1, 1.5, 2].map((mult) => {
                const targetQty = Math.round((entry.food.servingSize || 100) * mult);
                return (
                  <button
                    key={mult}
                    type="button"
                    onClick={() => handleQuantityChange(targetQty)}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    {mult}x ({targetQty}{entry.food.servingUnit})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Total Calories & Macro Nutrition */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Nutrition for this Portion</span>
              <button
                type="button"
                onClick={() => setIsManualOverride(!isManualOverride)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium underline"
              >
                {isManualOverride ? 'Reset to Auto-scale' : 'Fine-tune numbers manually'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400">Calories</span>
                <input
                  type="number"
                  min="0"
                  value={calories}
                  onChange={(e) => {
                    setIsManualOverride(true);
                    setCalories(Number(e.target.value));
                  }}
                  className="w-full mt-1 px-2 py-1 bg-slate-900 rounded-lg text-sm font-bold text-white border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500">kcal</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-indigo-500/20">
                <span className="text-[10px] uppercase font-bold text-indigo-400">Protein</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={protein}
                  onChange={(e) => {
                    setIsManualOverride(true);
                    setProtein(Number(e.target.value));
                  }}
                  className="w-full mt-1 px-2 py-1 bg-slate-900 rounded-lg text-sm font-bold text-indigo-300 border border-slate-700 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-500">grams</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-amber-500/20">
                <span className="text-[10px] uppercase font-bold text-amber-400">Carbs</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={carbs}
                  onChange={(e) => {
                    setIsManualOverride(true);
                    setCarbs(Number(e.target.value));
                  }}
                  className="w-full mt-1 px-2 py-1 bg-slate-900 rounded-lg text-sm font-bold text-amber-300 border border-slate-700 focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500">grams</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-rose-500/20">
                <span className="text-[10px] uppercase font-bold text-rose-400">Fat</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={fat}
                  onChange={(e) => {
                    setIsManualOverride(true);
                    setFat(Number(e.target.value));
                  }}
                  className="w-full mt-1 px-2 py-1 bg-slate-900 rounded-lg text-sm font-bold text-rose-300 border border-slate-700 focus:outline-none focus:border-rose-500"
                />
                <span className="text-[10px] text-slate-500">grams</span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-slate-800/80 border border-emerald-500/20">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Fiber</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={fiber}
                  onChange={(e) => {
                    setIsManualOverride(true);
                    setFiber(Number(e.target.value));
                  }}
                  className="w-full mt-1 px-2 py-1 bg-slate-900 rounded-lg text-sm font-bold text-emerald-300 border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500">grams</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Entry</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

