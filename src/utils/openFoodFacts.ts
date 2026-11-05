import { FoodItem } from '../types';

export async function searchOpenFoodFacts(query: string, signal?: AbortSignal): Promise<FoodItem[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
    cleanQuery
  )}&search_simple=1&action=process&json=1&page_size=24`;

  try {
    const response = await fetch(url, {
      signal,
      headers: {
        'User-Agent': 'NutriTrack - Personal Calorie & Macro Tracker'
      }
    });

    if (!response.ok) {
      throw new Error(`OpenFoodFacts returned ${response.status}`);
    }

    const data = await response.json();
    if (!data.products || !Array.isArray(data.products)) {
      return [];
    }

    const items: FoodItem[] = [];

    for (const prod of data.products) {
      const name = prod.product_name || prod.product_name_en;
      if (!name) continue;

      const nutriments = prod.nutriments || {};
      
      // Calories: OpenFoodFacts has energy-kcal_100g or energy-kcal or converts from energy-kj
      let calories = nutriments['energy-kcal_100g'];
      if (calories === undefined || calories === null) {
        calories = nutriments['energy-kcal'];
      }
      if ((calories === undefined || calories === null) && nutriments['energy_100g']) {
        calories = Math.round(nutriments['energy_100g'] / 4.184);
      }

      const protein = Number(nutriments['proteins_100g'] ?? nutriments['proteins'] ?? 0);
      const carbs = Number(nutriments['carbohydrates_100g'] ?? nutriments['carbohydrates'] ?? 0);
      const fat = Number(nutriments['fat_100g'] ?? nutriments['fat'] ?? 0);
      const fiber = Number(nutriments['fiber_100g'] ?? nutriments['fiber'] ?? 0);

      // Only add items that have non-zero calories or macro content
      if (calories === undefined || calories === null) continue;

      const serving = prod.serving_size || '100g';
      const brand = prod.brands ? prod.brands.split(',')[0].trim() : undefined;

      items.push({
        id: `off_${prod.code || Math.random().toString(36).substring(2, 9)}`,
        name,
        brand,
        calories: Math.round(Number(calories)),
        protein: Math.round(protein * 10) / 10,
        carbs: Math.round(carbs * 10) / 10,
        fat: Math.round(fat * 10) / 10,
        fiber: Math.round(fiber * 10) / 10,
        servingSize: 100,
        servingUnit: serving.toLowerCase().includes('serving') ? serving : 'g (per 100g)',
        category: 'Searched',
      });
    }

    return items;
  } catch (error) {
    if (signal?.aborted) return [];
    console.warn('Error fetching from Open Food Facts:', error);
    return [];
  }
}

