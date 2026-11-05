import { DayLog, FoodItem, UserGoal, WeightRecord } from '../types';
import { DEFAULT_FOODS } from '../data/defaultFoods';
import { DEFAULT_USER_GOAL } from './calculator';

const STORAGE_KEYS = {
  GOAL: 'nutritrack_user_goal',
  CUSTOM_FOODS: 'nutritrack_custom_foods',
  DAY_LOGS: 'nutritrack_day_logs',
  WEIGHT_LOGS: 'nutritrack_weight_logs',
};

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadUserGoal(): UserGoal {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOAL);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load user goal:', e);
  }
  return DEFAULT_USER_GOAL;
}

export function saveUserGoal(goal: UserGoal): void {
  localStorage.setItem(STORAGE_KEYS.GOAL, JSON.stringify(goal));
}

export function loadCustomFoods(): FoodItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_FOODS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load custom foods:', e);
  }
  return DEFAULT_FOODS;
}

export function saveCustomFoods(foods: FoodItem[]): void {
  localStorage.setItem(STORAGE_KEYS.CUSTOM_FOODS, JSON.stringify(foods));
}

export function loadDayLogs(): Record<string, DayLog> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAY_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load day logs:', e);
  }
  return {};
}

export function saveDayLogs(logs: Record<string, DayLog>): void {
  localStorage.setItem(STORAGE_KEYS.DAY_LOGS, JSON.stringify(logs));
}

export function loadWeightLogs(): WeightRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load weight logs:', e);
  }

  // Pre-seed with initial 70kg starting weight
  const today = getTodayString();
  return [
    {
      id: 'initial_weight_log',
      date: today,
      weight: 70,
      note: 'Starting weight. Target: 60kg in 5 months, then 54kg.',
    },
  ];
}

export function saveWeightLogs(logs: WeightRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(logs));
}

export function exportAllData(): string {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    goal: loadUserGoal(),
    customFoods: loadCustomFoods(),
    dayLogs: loadDayLogs(),
    weightLogs: loadWeightLogs(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.goal) saveUserGoal(data.goal);
    if (data.customFoods) saveCustomFoods(data.customFoods);
    if (data.dayLogs) saveDayLogs(data.dayLogs);
    if (data.weightLogs) saveWeightLogs(data.weightLogs);
    return true;
  } catch (e) {
    console.error('Failed to import data:', e);
    return false;
  }
}

