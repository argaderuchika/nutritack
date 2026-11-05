import { UserGoal } from '../types';

export const ACTIVITY_MULTIPLIERS = {
  sedentary: { label: 'Sedentary (desk job, little exercise)', factor: 1.2 },
  light: { label: 'Lightly Active (exercise 1-3 days/week)', factor: 1.375 },
  moderate: { label: 'Moderately Active (exercise 3-5 days/week)', factor: 1.55 },
  very_active: { label: 'Very Active (hard exercise 6-7 days/week)', factor: 1.725 },
};

export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female'): number {
  // Mifflin-St Jeor Equation
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
}

export function calculateTDEE(bmr: number, activityLevel: keyof typeof ACTIVITY_MULTIPLIERS): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel].factor);
}

/**
 * Calculates optimal calorie and macro targets for fat loss:
 * Phase 1: 10 kg in 5 months (~150 days) => 77,000 kcal deficit / 150 days ≈ 510 kcal/day deficit.
 */
export function calculateFatLossTargets(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: keyof typeof ACTIVITY_MULTIPLIERS,
  targetLossKg: number = 10,
  months: number = 5
): {
  bmr: number;
  tdee: number;
  dailyDeficit: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetFiber: number;
} {
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);

  // 1 kg body fat is approximately 7,700 kcal
  const totalDeficitNeeded = targetLossKg * 7700;
  const days = months * 30.5;
  const dailyDeficit = Math.round(totalDeficitNeeded / days);

  // Safe floor: min 1200 kcal for females, 1500 kcal for males
  const safeFloor = gender === 'male' ? 1500 : 1200;
  const rawTargetCalories = tdee - dailyDeficit;
  const targetCalories = Math.max(safeFloor, rawTargetCalories);

  // Protein for fat loss & muscle sparing: 1.8g per kg bodyweight
  const targetProtein = Math.round(weightKg * 1.8);
  const proteinCalories = targetProtein * 4;

  // Healthy Fat: 25% of target calories (minimum 0.7g/kg for hormones)
  const targetFat = Math.max(Math.round((targetCalories * 0.25) / 9), Math.round(weightKg * 0.7));
  const fatCalories = targetFat * 9;

  // Carbs: Remainder of calories
  const remainingCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
  const targetCarbs = Math.round(remainingCalories / 4);

  // Fiber target: 14g per 1000 kcal, min 28g for satiety
  const targetFiber = Math.max(28, Math.round((targetCalories / 1000) * 14));

  return {
    bmr,
    tdee,
    dailyDeficit,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    targetFiber,
  };
}

export const DEFAULT_USER_GOAL: UserGoal = {
  currentWeight: 70,
  phase1TargetWeight: 60,
  phase1TargetMonths: 5,
  phase2TargetWeight: 54,
  startDate: new Date().toISOString().split('T')[0],
  gender: 'female',
  age: 28,
  heightCm: 162,
  activityLevel: 'light',
  targetCalories: 1550,
  targetProtein: 120,
  targetCarbs: 150,
  targetFat: 45,
  targetFiber: 30,
  waterTargetMl: 2800,
  targetSteps: 10000,
  targetWeightTrainingMins: 45,
  targetSleepHours: 8.0,
};

