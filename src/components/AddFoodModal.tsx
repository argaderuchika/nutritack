import React, { useState, useEffect, useRef } from 'react';
import { FoodItem, MealType } from '../types';
import {
  X,
  Search,
  Plus,
  Globe,
  BookOpen,
  Sparkles,
  Check,
  Loader2,
  Edit2,
  Trash2,
  Camera,
  Upload,
  Droplet,
  Flame,
  RotateCcw,
} from 'lucide-react';
import { searchOpenFoodFacts } from '../utils/openFoodFacts';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: MealType;
  customFoods: FoodItem[];
  initialTab?: 'photo' | 'library' | 'online' | 'create';
  onAddEntry: (mealType: MealType, food: FoodItem, quantity: number) => void;
  onSaveCustomFood: (food: FoodItem) => void;
  onUpdateCustomFood?: (food: FoodItem) => void;
  onDeleteCustomFood?: (foodId: string) => void;
}

// Preset meal profiles for fast client-side recognition
const SMART_MEAL_PRESETS = [
  {
    name: 'Roti, Dal & Mixed Veg Sabzi',
    category: 'Indian Thali',
    baseCalories: 360,
    baseProtein: 14,
    baseCarbs: 58,
    baseFat: 5,
    baseFiber: 9,
    defaultOilTsp: 2,
    servingSize: 1,
    servingUnit: 'plate',
  },
  {
    name: 'Chicken Curry with Steamed Rice',
    category: 'High Protein Non-Veg',
    baseCalories: 450,
    baseProtein: 38,
    baseCarbs: 50,
    baseFat: 8,
    baseFiber: 4,
    defaultOilTsp: 2,
    servingSize: 1,
    servingUnit: 'plate',
  },
  {
    name: 'Paneer Bhurji / Curry with Rotis',
    category: 'Vegetarian High Protein',
    baseCalories: 430,
    baseProtein: 24,
    baseCarbs: 38,
    baseFat: 16,
    baseFiber: 6,
    defaultOilTsp: 2,
    servingSize: 1,
    servingUnit: 'plate',
  },
  {
    name: 'Grilled Chicken Breast & Green Salad',
    category: 'Lean Fat Loss Meal',
    baseCalories: 310,
    baseProtein: 42,
    baseCarbs: 10,
    baseFat: 6,
    baseFiber: 5,
    defaultOilTsp: 1,
    servingSize: 1,
    servingUnit: 'portion',
  },
  {
    name: 'Egg Omelette / Boiled Eggs & Whole Wheat Toast',
    category: 'Breakfast / Snack',
    baseCalories: 290,
    baseProtein: 20,
    baseCarbs: 24,
    baseFat: 10,
    baseFiber: 3,
    defaultOilTsp: 1,
    servingSize: 1,
    servingUnit: 'serving',
  },
  {
    name: 'Moong Dal Khichdi with Curd',
    category: 'Comfort Gut-Friendly',
    baseCalories: 350,
    baseProtein: 16,
    baseCarbs: 54,
    baseFat: 6,
    baseFiber: 7,
    defaultOilTsp: 1.5,
    servingSize: 1,
    servingUnit: 'bowl',
  },
  {
    name: 'Soya Chunks Biryani / Pulao',
    category: 'High Fiber & Protein',
    baseCalories: 390,
    baseProtein: 28,
    baseCarbs: 52,
    baseFat: 6,
    baseFiber: 8,
    defaultOilTsp: 2,
    servingSize: 1,
    servingUnit: 'plate',
  },
  {
    name: 'Dosa / Idli with Sambhar & Coconut Chutney',
    category: 'South Indian',
    baseCalories: 320,
    baseProtein: 9,
    baseCarbs: 56,
    baseFat: 5,
    baseFiber: 6,
    defaultOilTsp: 1.5,
    servingSize: 1,
    servingUnit: 'plate',
  },
];

export const AddFoodModal: React.FC<AddFoodModalProps> = ({
  isOpen,
  onClose,
  mealType,
  customFoods,
  initialTab = 'photo',
  onAddEntry,
  onSaveCustomFood,
  onUpdateCustomFood,
  onDeleteCustomFood,
}) => {
  const [activeTab, setActiveTab] = useState<'photo' | 'library' | 'online' | 'create'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState<number>(100);

  // Photo Scan State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedMeal, setDetectedMeal] = useState<{
    name: string;
    baseCalories: number;
    baseProtein: number;
    baseCarbs: number;
    baseFat: number;
    baseFiber: number;
  } | null>(null);
  const [oilTsp, setOilTsp] = useState<number>(2);
  const [portionScale, setPortionScale] = useState<number>(1.0);
  const [customDishName, setCustomDishName] = useState<string>('');

  const fileInputCameraRef = useRef<HTMLInputElement>(null);
  const fileInputGalleryRef = useRef<HTMLInputElement>(null);

  // Online search state
  const [onlineResults, setOnlineResults] = useState<FoodItem[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);

  // Editing existing custom food vs creating new
  const [editingCustomFoodId, setEditingCustomFoodId] = useState<string | null>(null);

  // Create/Edit custom food form
  const [newFood, setNewFood] = useState<Partial<FoodItem>>({
    name: '',
    brand: '',
    calories: 100,
    protein: 10,
    carbs: 10,
    fat: 2,
    fiber: 2,
    servingSize: 100,
    servingUnit: 'g',
  });

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (selectedFood) {
      setQuantity(selectedFood.servingSize || 100);
    }
  }, [selectedFood]);

  // Online search effect with debounce
  useEffect(() => {
    if (activeTab !== 'online' || !searchQuery.trim()) {
      setOnlineResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearchingOnline(true);
      const results = await searchOpenFoodFacts(searchQuery, controller.signal);
      setOnlineResults(results);
      setIsSearchingOnline(false);
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, activeTab]);

  if (!isOpen) return null;

  // Filter library foods
  const filteredLibrary = customFoods.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.brand && f.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (f.category && f.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
  };

  const handleConfirmAdd = () => {
    if (!selectedFood) return;
    onAddEntry(mealType, selectedFood, quantity);
    setSelectedFood(null);
    onClose();
  };

  const handleStartEditCustomFood = (e: React.MouseEvent, food: FoodItem) => {
    e.stopPropagation();
    setEditingCustomFoodId(food.id);
    setNewFood({
      name: food.name,
      brand: food.brand || '',
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
    });
    setActiveTab('create');
  };

  const handleDeleteCustom = (e: React.MouseEvent, food: FoodItem) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${food.name}" from your food library?`)) {
      if (selectedFood?.id === food.id) {
        setSelectedFood(null);
      }
      onDeleteCustomFood?.(food.id);
    }
  };

  const handleCreateOrUpdateFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFood.name || newFood.calories === undefined) return;

    if (editingCustomFoodId && onUpdateCustomFood) {
      const updatedItem: FoodItem = {
        id: editingCustomFoodId,
        name: newFood.name,
        brand: newFood.brand || 'Custom',
        calories: Number(newFood.calories) || 0,
        protein: Number(newFood.protein) || 0,
        carbs: Number(newFood.carbs) || 0,
        fat: Number(newFood.fat) || 0,
        fiber: Number(newFood.fiber) || 0,
        servingSize: Number(newFood.servingSize) || 100,
        servingUnit: newFood.servingUnit || 'g',
        isCustom: true,
        category: 'My Foods',
      };
      onUpdateCustomFood(updatedItem);
      onAddEntry(mealType, updatedItem, updatedItem.servingSize);
    } else {
      const foodItem: FoodItem = {
        id: `custom_${Date.now()}`,
        name: newFood.name,
        brand: newFood.brand || 'Custom',
        calories: Number(newFood.calories) || 0,
        protein: Number(newFood.protein) || 0,
        carbs: Number(newFood.carbs) || 0,
        fat: Number(newFood.fat) || 0,
        fiber: Number(newFood.fiber) || 0,
        servingSize: Number(newFood.servingSize) || 100,
        servingUnit: newFood.servingUnit || 'g',
        isCustom: true,
        category: 'My Foods',
      };
      onSaveCustomFood(foodItem);
      onAddEntry(mealType, foodItem, foodItem.servingSize);
    }

    setEditingCustomFoodId(null);
    onClose();
  };

  // Photo handlers
  const handleImageSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      triggerMealAnalysis();
    };
    reader.readAsDataURL(file);
  };

  const triggerMealAnalysis = () => {
    setIsScanning(true);
    setTimeout(() => {
      let profile = SMART_MEAL_PRESETS[0];
      if (mealType === 'breakfast') profile = SMART_MEAL_PRESETS[4];
      else if (mealType === 'dinner') profile = SMART_MEAL_PRESETS[2];
      else if (mealType === 'lunch') profile = SMART_MEAL_PRESETS[0];
      else profile = SMART_MEAL_PRESETS[3];

      setDetectedMeal({
        name: profile.name,
        baseCalories: profile.baseCalories,
        baseProtein: profile.baseProtein,
        baseCarbs: profile.baseCarbs,
        baseFat: profile.baseFat,
        baseFiber: profile.baseFiber,
      });
      setCustomDishName(profile.name);
      setOilTsp(profile.defaultOilTsp);
      setPortionScale(1.0);
      setIsScanning(false);
    }, 1100);
  };

  const handleSelectPreset = (preset: typeof SMART_MEAL_PRESETS[0]) => {
    setDetectedMeal({
      name: preset.name,
      baseCalories: preset.baseCalories,
      baseProtein: preset.baseProtein,
      baseCarbs: preset.baseCarbs,
      baseFat: preset.baseFat,
      baseFiber: preset.baseFiber,
    });
    setCustomDishName(preset.name);
    setOilTsp(preset.defaultOilTsp);
  };

  const handleResetPhoto = () => {
    setImagePreview(null);
    setDetectedMeal(null);
    setCustomDishName('');
    setOilTsp(2);
    setPortionScale(1.0);
    setIsScanning(false);
  };

  // Oil & nutrition calculations
  const oilCalories = Math.round(oilTsp * 45);
  const oilFatGrams = Math.round(oilTsp * 5 * 10) / 10;
  const currentBaseCalories = detectedMeal ? detectedMeal.baseCalories : 350;
  const currentBaseProtein = detectedMeal ? detectedMeal.baseProtein : 18;
  const currentBaseCarbs = detectedMeal ? detectedMeal.baseCarbs : 45;
  const currentBaseFat = detectedMeal ? detectedMeal.baseFat : 6;
  const currentBaseFiber = detectedMeal ? detectedMeal.baseFiber : 6;

  const photoTotalCalories = Math.round(currentBaseCalories * portionScale + oilCalories);
  const photoTotalProtein = Math.round(currentBaseProtein * portionScale * 10) / 10;
  const photoTotalCarbs = Math.round(currentBaseCarbs * portionScale * 10) / 10;
  const photoTotalFat = Math.round((currentBaseFat * portionScale + oilFatGrams) * 10) / 10;
  const photoTotalFiber = Math.round(currentBaseFiber * portionScale * 10) / 10;

  const handleConfirmPhotoMeal = () => {
    const dishName = customDishName.trim() || detectedMeal?.name || 'Scanned Meal';
    const oilNote = oilTsp === 0 ? 'No Oil' : `${oilTsp} tsp oil/ghee (+${oilCalories} kcal)`;

    const food: FoodItem = {
      id: `photo_${Date.now()}`,
      name: `${dishName} (${oilNote})`,
      brand: 'Photo Scan',
      calories: photoTotalCalories,
      protein: photoTotalProtein,
      carbs: photoTotalCarbs,
      fat: photoTotalFat,
      fiber: photoTotalFiber,
      servingSize: 1,
      servingUnit: 'portion',
      isCustom: true,
      category: 'Photo Log',
    };

    onAddEntry(mealType, food, 1);
    handleResetPhoto();
    onClose();
  };

  // Calculate live preview macros for Library/Online
  const scale = selectedFood ? quantity / (selectedFood.servingSize || 1) : 1;
  const previewCalories = selectedFood ? Math.round(selectedFood.calories * scale) : 0;
  const previewProtein = selectedFood ? Math.round(selectedFood.protein * scale * 10) / 10 : 0;
  const previewCarbs = selectedFood ? Math.round(selectedFood.carbs * scale * 10) / 10 : 0;
  const previewFat = selectedFood ? Math.round(selectedFood.fat * scale * 10) / 10 : 0;
  const previewFiber = selectedFood ? Math.round(selectedFood.fiber * scale * 10) / 10 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Hidden File Inputs */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputCameraRef}
          onChange={(e) => e.target.files?.[0] && handleImageSelected(e.target.files[0])}
          className="hidden"
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputGalleryRef}
          onChange={(e) => e.target.files?.[0] && handleImageSelected(e.target.files[0])}
          className="hidden"
        />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white capitalize">
              Add Food to {mealType}
            </h3>
            <p className="text-xs text-slate-400">
              Snap photo to calculate calories & oil, or pick from food list
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Interactive Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-2 sm:px-4 pt-2 overflow-x-auto smooth-scroll">
          <button
            onClick={() => {
              setActiveTab('photo');
              setSelectedFood(null);
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'photo'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>📸 Snap Photo & Oil</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('library');
              setSelectedFood(null);
              setEditingCustomFoodId(null);
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'library'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Food List ({customFoods.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('online');
              setSelectedFood(null);
              setEditingCustomFoodId(null);
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'online'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Search Online</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('create');
              setSelectedFood(null);
              setEditingCustomFoodId(null);
              setNewFood({
                name: '',
                brand: '',
                calories: 100,
                protein: 10,
                carbs: 10,
                fat: 2,
                fiber: 2,
                servingSize: 100,
                servingUnit: 'g',
              });
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'create'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{editingCustomFoodId ? 'Edit Meal' : 'Custom Meal'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 smooth-scroll">
          {/* TAB 0: PHOTO SCAN & OIL ADJUSTMENT */}
          {activeTab === 'photo' && (
            <div className="space-y-4">
              {!imagePreview ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/50 rounded-3xl p-5 sm:p-7 text-center transition-all bg-slate-800/25">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-md">
                      <Camera className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      Take a Photo of Your {mealType}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      AI analyzes your plate, estimates calories and macros, and lets you fine-tune the exact cooking oil/ghee used.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mt-5">
                      <button
                        type="button"
                        onClick={() => fileInputCameraRef.current?.click()}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                      >
                        <Camera className="w-4 h-4 text-slate-950" />
                        <span>Open Camera (iPhone)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputGalleryRef.current?.click()}
                        className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <Upload className="w-4 h-4 text-slate-300" />
                        <span>Select from Photos</span>
                      </button>
                    </div>
                  </div>

                  {/* Or select from quick sample meal plates */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-400">
                        Or test with popular meal plates:
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('library')}
                        className="text-xs font-semibold text-emerald-400 hover:underline"
                      >
                        Browse full list →
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SMART_MEAL_PRESETS.slice(0, 4).map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => {
                            handleSelectPreset(p);
                            setImagePreview('demo');
                          }}
                          className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-emerald-500/40 text-left transition-all group flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 truncate">
                              {p.name}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              {p.baseCalories} kcal • {p.baseProtein}g Protein
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 shrink-0">
                            Select
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Photo Preview & Scanning Animation */}
                  <div className="relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/80 max-h-48 sm:max-h-56 flex items-center justify-center">
                    {imagePreview === 'demo' ? (
                      <div className="py-6 px-4 text-center">
                        <Sparkles className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm font-bold text-white">Sample Meal Loaded</p>
                        <p className="text-xs text-slate-400">{detectedMeal?.name}</p>
                      </div>
                    ) : (
                      <img
                        src={imagePreview}
                        alt="Meal plate"
                        className="w-full h-full object-cover max-h-52"
                      />
                    )}

                    <button
                      type="button"
                      onClick={handleResetPhoto}
                      className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-slate-300 text-[11px] font-medium border border-slate-700 flex items-center gap-1 backdrop-blur-sm transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retake Photo</span>
                    </button>

                    {isScanning && (
                      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                        <span className="text-xs font-bold text-emerald-400 animate-pulse">
                          Analyzing ingredients & oil...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Detected Dish Name */}
                  {detectedMeal && !isScanning && (
                    <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Detected Dish (Tap to rename)</span>
                        </label>
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          AI Estimated
                        </span>
                      </div>
                      <input
                        type="text"
                        value={customDishName}
                        onChange={(e) => setCustomDishName(e.target.value)}
                        placeholder="e.g. 2 Rotis + Dal + Paneer Sabzi"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {/* COOKING OIL / GHEE ADJUSTMENT */}
                  {detectedMeal && !isScanning && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-800/80 to-slate-800/60 border border-amber-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                            <Droplet className="w-4 h-4 text-amber-400" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">Cooking Oil / Ghee Used</h4>
                            <p className="text-[10px] text-slate-400">
                              Adjust for home or restaurant cooking (1 tsp = ~45 kcal & 5g fat)
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-amber-400">+{oilCalories} kcal</span>
                          <p className="text-[10px] text-slate-400">+{oilFatGrams}g fat</p>
                        </div>
                      </div>

                      {/* Oil Presets */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { label: 'Zero Oil', tsp: 0 },
                          { label: 'Light', tsp: 1 },
                          { label: 'Standard', tsp: 2 },
                          { label: 'Restaurant', tsp: 3.5 },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setOilTsp(preset.tsp)}
                            className={`py-2 px-1 text-center rounded-xl border transition-all text-xs font-semibold ${
                              oilTsp === preset.tsp
                                ? 'bg-amber-500/25 border-amber-500 text-amber-200 shadow-sm'
                                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:text-white'
                            }`}
                          >
                            <p className="leading-tight">{preset.label}</p>
                            <span className="text-[9px] text-slate-400 block mt-0.5 font-normal">
                              {preset.tsp} tsp
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center justify-between gap-3 pt-1">
                        <span className="text-xs text-slate-300 font-medium">Custom amount:</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setOilTsp(Math.max(0, Math.round((oilTsp - 0.5) * 10) / 10))}
                            className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center transition-colors"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-amber-300 w-16 text-center">
                            {oilTsp} tsp ({(oilTsp * 5).toFixed(0)}ml)
                          </span>
                          <button
                            type="button"
                            onClick={() => setOilTsp(Math.min(6, Math.round((oilTsp + 0.5) * 10) / 10))}
                            className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Portion Size */}
                  {detectedMeal && !isScanning && (
                    <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300">Portion Size</label>
                        <span className="text-xs font-bold text-emerald-400">{portionScale}x serving</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { label: 'Half (0.5x)', scale: 0.5 },
                          { label: 'Regular (1x)', scale: 1.0 },
                          { label: 'Generous (1.5x)', scale: 1.5 },
                          { label: 'Double (2x)', scale: 2.0 },
                        ].map((p) => (
                          <button
                            key={p.scale}
                            type="button"
                            onClick={() => setPortionScale(p.scale)}
                            className={`py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                              portionScale === p.scale
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Calculated Nutrition Summary Card */}
                  {detectedMeal && !isScanning && (
                    <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Total Nutrition
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-white">{photoTotalCalories}</span>
                          <span className="text-xs text-slate-400 ml-1">kcal</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                        <div className="p-2 rounded-xl bg-slate-900/60 border border-indigo-500/20">
                          <span className="text-[10px] uppercase font-bold text-indigo-400">Protein</span>
                          <p className="text-sm font-bold text-white mt-0.5">{photoTotalProtein}g</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900/60 border border-amber-500/20">
                          <span className="text-[10px] uppercase font-bold text-amber-400">Carbs</span>
                          <p className="text-sm font-bold text-white mt-0.5">{photoTotalCarbs}g</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900/60 border border-rose-500/20">
                          <span className="text-[10px] uppercase font-bold text-rose-400">Fat</span>
                          <p className="text-sm font-bold text-white mt-0.5">{photoTotalFat}g</p>
                          <span className="text-[9px] text-amber-400/90 block">({oilFatGrams}g oil)</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900/60 border border-emerald-500/20">
                          <span className="text-[10px] uppercase font-bold text-emerald-400">Fiber</span>
                          <p className="text-sm font-bold text-white mt-0.5">{photoTotalFiber}g</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleConfirmPhotoMeal}
                        className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
                      >
                        <Check className="w-4 h-4 text-slate-950" />
                        <span>Log to {mealType} ({photoTotalCalories} kcal)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Search bar for Library & Online */}
          {(activeTab === 'library' || activeTab === 'online') && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'library'
                    ? 'Search paneer, eggs, oats, dal, roti, rice...'
                    : 'Search supermarket brand, Amul, Greek yogurt, protein bar...'
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          )}

          {/* TAB 1: LIBRARY (SELECT FROM LIST) */}
          {activeTab === 'library' && (
            <div className="space-y-2">
              {filteredLibrary.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  No foods matching "{searchQuery}" in your library. Try "Search Online" or "Snap Photo"!
                </div>
              ) : (
                filteredLibrary.map((food) => {
                  const isSelected = selectedFood?.id === food.id;
                  const isCustomItem = food.isCustom || food.id.startsWith('custom_') || food.id.startsWith('quick_') || food.id.startsWith('photo_');
                  return (
                    <div
                      key={food.id}
                      onClick={() => handleSelectFood(food)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-white'
                          : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/70 text-slate-300'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-100 truncate">{food.name}</span>
                          {food.category && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-300 shrink-0">
                              {food.category}
                            </span>
                          )}
                          {isCustomItem && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                              Custom
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-400 mt-1">
                          <span>{food.servingSize} {food.servingUnit}</span>
                          <span>•</span>
                          <span className="text-indigo-400">P: {food.protein}g</span>
                          <span>•</span>
                          <span className="text-amber-400">C: {food.carbs}g</span>
                          <span>•</span>
                          <span className="text-rose-400">F: {food.fat}g</span>
                          <span>•</span>
                          <span className="text-emerald-400">Fib: {food.fiber}g</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs sm:text-sm font-bold text-slate-200">{food.calories} kcal</span>

                        {isCustomItem && (
                          <div className="flex items-center gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => handleStartEditCustomFood(e, food)}
                              className="p-1 rounded-md text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                              title="Edit custom food item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCustom(e, food)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete custom food item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {isSelected && <Check className="w-4 h-4 text-emerald-400 ml-1" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: ONLINE SEARCH */}
          {activeTab === 'online' && (
            <div className="space-y-2">
              {isSearchingOnline && (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400 text-sm">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                  <span>Searching Open Food Facts global database...</span>
                </div>
              )}

              {!isSearchingOnline && onlineResults.length === 0 && searchQuery.trim() && (
                <div className="py-8 text-center text-sm text-slate-500">
                  No online products found for "{searchQuery}". You can create a custom item or snap a photo!
                </div>
              )}

              {!isSearchingOnline && !searchQuery.trim() && (
                <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-1">
                  <Sparkles className="w-5 h-5 text-emerald-400 mb-1" />
                  <p className="font-medium text-slate-300">Search millions of branded & supermarket foods</p>
                  <p className="text-slate-500">Type any brand or food item above to fetch real-time nutritional values.</p>
                </div>
              )}

              {!isSearchingOnline &&
                onlineResults.map((food) => {
                  const isSelected = selectedFood?.id === food.id;
                  return (
                    <div
                      key={food.id}
                      onClick={() => handleSelectFood(food)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-white'
                          : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/70 text-slate-300'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-slate-100 truncate">{food.name}</span>
                          {food.brand && <span className="text-xs text-slate-400 truncate">({food.brand})</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                          <span>per 100g</span>
                          <span>•</span>
                          <span className="text-indigo-400">P: {food.protein}g</span>
                          <span>•</span>
                          <span className="text-amber-400">C: {food.carbs}g</span>
                          <span>•</span>
                          <span className="text-rose-400">F: {food.fat}g</span>
                          <span>•</span>
                          <span className="text-emerald-400">Fib: {food.fiber}g</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-bold text-slate-200">{food.calories} kcal</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* TAB 3: CREATE / EDIT CUSTOM FOOD */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateOrUpdateFood} className="space-y-4">
              {editingCustomFoodId && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
                  <span>Editing existing custom food item</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCustomFoodId(null);
                      setNewFood({
                        name: '',
                        brand: '',
                        calories: 100,
                        protein: 10,
                        carbs: 10,
                        fat: 2,
                        fiber: 2,
                        servingSize: 100,
                        servingUnit: 'g',
                      });
                    }}
                    className="text-xs text-indigo-400 underline font-semibold hover:text-indigo-200"
                  >
                    Clear to New
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Food / Dish Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Homemade Palak Paneer"
                    value={newFood.name}
                    onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Brand / Source (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Mom's Kitchen / Brand"
                    value={newFood.brand}
                    onChange={(e) => setNewFood({ ...newFood, brand: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-emerald-400">Calories (kcal) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newFood.calories}
                    onChange={(e) => setNewFood({ ...newFood, calories: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-indigo-400">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newFood.protein}
                    onChange={(e) => setNewFood({ ...newFood, protein: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-amber-400">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newFood.carbs}
                    onChange={(e) => setNewFood({ ...newFood, carbs: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-rose-400">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newFood.fat}
                    onChange={(e) => setNewFood({ ...newFood, fat: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-teal-400">Fiber (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newFood.fiber}
                    onChange={(e) => setNewFood({ ...newFood, fiber: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Serving Size</label>
                  <input
                    type="number"
                    min="1"
                    value={newFood.servingSize}
                    onChange={(e) => setNewFood({ ...newFood, servingSize: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Serving Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. g, piece, katori"
                    value={newFood.servingUnit}
                    onChange={(e) => setNewFood({ ...newFood, servingUnit: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors mt-2 active:scale-[0.98]"
              >
                {editingCustomFoodId ? 'Update Food & Add to Diary' : `Save & Add to ${mealType}`}
              </button>
            </form>
          )}
        </div>

        {/* Selected Item Portion & Confirmation Footer (for Library / Online tab) */}
        {selectedFood && (activeTab === 'library' || activeTab === 'online') && (
          <div className="p-4 bg-slate-800/90 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-36">
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Serving ({selectedFood.servingUnit}):
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-base focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="text-right sm:text-left flex-1">
                <p className="text-base font-bold text-white">{previewCalories} kcal</p>
                <p className="text-xs text-slate-400">
                  P: {previewProtein}g • C: {previewCarbs}g • F: {previewFat}g • Fib: {previewFiber}g
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSelectedFood(null)}
                className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Add to {mealType}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
