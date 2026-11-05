export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;       // kcal per 100g or per serving
  protein: number;        // grams
  carbs: number;          // grams
  fat: number;            // grams
  fiber: number;          // grams
  servingSize: number;    // default serving amount (e.g., 100)
  servingUnit: string;    // 'g', 'ml', 'piece', 'scoop', 'katori'
  category?: string;
  isCustom?: boolean;
}

export interface MealEntry {
  id: string;
  mealType: MealType;
  food: FoodItem;
  quantity: number;       // multiplier or amount in servingUnit
  calculated: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  timestamp: string;
}

export interface DayLog {
  date: string;           // YYYY-MM-DD
  entries: MealEntry[];
  waterMl: number;
  steps?: number;
  weightTrainingMins?: number;
  sleepHours?: number;    // in hours, e.g. 7.5
  weight?: number;
  notes?: string;
}

export interface WeightRecord {
  id: string;
  date: string;           // YYYY-MM-DD
  weight: number;         // in kg
  note?: string;
}

export interface UserGoal {
  currentWeight: number;      // 70 kg
  phase1TargetWeight: number; // 60 kg
  phase1TargetMonths: number; // 5 months
  phase2TargetWeight: number; // 54 kg
  startDate: string;          // YYYY-MM-DD
  gender: 'male' | 'female';
  age: number;
  heightCm: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active';
  targetCalories: number;     // e.g. 1500-1600 kcal
  targetProtein: number;      // e.g. 120g
  targetCarbs: number;        // e.g. 140g
  targetFat: number;          // e.g. 45g
  targetFiber: number;        // e.g. 30g
  waterTargetMl: number;      // e.g. 3000ml
  targetSteps?: number;       // e.g. 10000 steps
  targetWeightTrainingMins?: number; // e.g. 45 mins
  targetSleepHours?: number;  // e.g. 8.0 hrs
}

export interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  brands?: string;
  nutriments: {
    'energy-kcal_100g'?: number;
    'energy-kcal'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
  };
  serving_size?: string;
  image_front_thumb_url?: string;
}

