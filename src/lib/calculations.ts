import type { Gender, ActivityLevel, BMIResult, EnergyRequirement, Nutrients, FoodLogEntry } from "./types";

// Asia-Pacific adult bands; not universal WHO cutoffs. See /references.
export function calculateBMI(weightKg: number, heightCm: number): BMIResult {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  let category: BMIResult["category"];
  let color: string;

  if (bmi < 18.5) {
    category = "underweight";
    color = "#3B82F6";
  } else if (bmi < 23) {
    category = "normal";
    color = "#16a34a";
  } else if (bmi < 25) {
    category = "overweight";
    color = "#D97706";
  } else if (bmi < 30) {
    category = "obese1";
    color = "#EF4444";
  } else {
    category = "obese2";
    color = "#991B1B";
  }

  return { value: Math.round(bmi * 10) / 10, category, color };
}

// Mifflin–St Jeor resting energy estimate. Activity multipliers are assumptions.
export function calculateEnergyRequirement(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel
): EnergyRequirement {
  if (![weightKg, heightCm, age].every(Number.isFinite) || weightKg <= 0 || heightCm <= 0 || age < 19 || age > 78) return { bmr: 0, tdee: 0, activityFactor: 0 };
  let bmr: number;
  if (gender === "male") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  const activityFactors: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const activityFactor = activityFactors[activityLevel];
  const tdee = Math.round(bmr * activityFactor);

  return { bmr: Math.round(bmr), tdee, activityFactor };
}

// Calculate nutrients from a food entry (weight in grams, nutrients per 100g)
export function calculateFoodNutrients(nutrientsPer100g: Nutrients, weightGrams: number): Nutrients {
  const factor = weightGrams / 100;
  return Object.fromEntries(Object.entries(nutrientsPer100g).map(([key, value]) => {
    const precision = key === 'copper' ? 1000 : ['energy', 'calcium', 'phosphorus', 'sodium', 'potassium'].includes(key) ? 10 : 100;
    return [key, value == null ? null : Math.round(value * factor * precision) / precision];
  })) as unknown as Nutrients;
}

export function sumNutrients(entries: FoodLogEntry[]): Nutrients {
  const keys = ['energy','protein','fat','carbohydrate','fiber','calcium','phosphorus','iron','sodium','potassium','copper','zinc'] as const;
  return Object.fromEntries(keys.map(key => [key, entries.some(e => typeof e.nutrients[key] !== 'number') ? null : entries.reduce((sum, e) => sum + (e.nutrients[key] ?? 0), 0)])) as unknown as Nutrients;
}

export { adultReferenceIntakes as getRDI } from "./referenceIntakes";

export function getMealTypeFromHour(hour: number): import("./types").MealType {
  if (hour >= 5 && hour < 10) return "breakfast";
  if (hour >= 10 && hour < 15) return "lunch";
  if (hour >= 17 && hour < 21) return "dinner";
  return "snack";
}

export function formatNutrientValue(value: number | null, unit: string): string {
  if (value == null) return 'Not reported';
  if (unit === "mg" || unit === "kcal") return `${Math.round(value * 10) / 10} ${unit}`;
  if (unit === "g") return `${Math.round(value * 10) / 10} ${unit}`;
  return `${value} ${unit}`;
}
