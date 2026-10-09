import { adultReferenceIntakes } from './referenceIntakes.ts';
import type { FoodLogEntry, Gender, Nutrients } from './types';

export const guidanceKeys = ['fiber', 'calcium', 'phosphorus', 'iron', 'potassium', 'copper', 'zinc', 'sodium'] as const;
export type GuidanceKey = typeof guidanceKeys[number];
export type IntakeRow = Pick<FoodLogEntry, 'foodName' | 'nutrients'>;
export type TipStatus = 'belowReference' | 'referenceReached' | 'incomplete' | 'sodiumReview';
export interface NutrientTip {
  nutrient: GuidanceKey;
  recorded: number;
  reference: number;
  gap: number;
  status: TipStatus;
}

export function recordedNutrient(entries: readonly IntakeRow[], key: keyof Nutrients) {
  let total = 0;
  let complete = true;
  for (const entry of entries) {
    const value = entry.nutrients?.[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) complete = false;
    else total += value;
  }
  return { total: Number.isFinite(total) ? total : 0, complete: complete && Number.isFinite(total) };
}

export function supportedGuidanceProfile(age: number, gender: string): gender is Gender {
  return Number.isInteger(age) && age >= 19 && age <= 120 && (gender === 'male' || gender === 'female');
}

export function dailyNutritionTips(entries: readonly IntakeRow[], age: number, gender: string): NutrientTip[] {
  if (!entries.length || !supportedGuidanceProfile(age, gender)) return [];
  const refs = adultReferenceIntakes(gender, age);
  return guidanceKeys.map(nutrient => {
    const { total: recorded, complete } = recordedNutrient(entries, nutrient);
    const reference = refs[nutrient];
    return {
      nutrient, recorded, reference,
      gap: Math.max(0, reference - recorded),
      status: !complete ? 'incomplete' : nutrient === 'sodium' ? 'sodiumReview' : recorded < reference ? 'belowReference' : 'referenceReached',
    };
  });
}

// Rank proportional shortfalls, not unlike units (e.g. grams vs milligrams).
// This is a display order, not a clinical urgency score.
export function mealPriorities(tips: readonly NutrientTip[]): NutrientTip[] {
  return tips.filter(t => t.status === 'belowReference')
    .sort((a, b) => a.recorded / a.reference - b.recorded / b.reference || guidanceKeys.indexOf(a.nutrient) - guidanceKeys.indexOf(b.nutrient))
    .slice(0, 3);
}

export function remainingIntake(entries: readonly IntakeRow[], targets: Partial<Nutrients>) {
  if (!entries.length) return [];
  return (['energy', 'carbohydrate', 'protein', 'fat'] as const).flatMap(nutrient => {
    const target = targets[nutrient];
    const { total: recorded, complete } = recordedNutrient(entries, nutrient);
    if (typeof target !== 'number' || !Number.isFinite(target) || target < 0) return [];
    return [{ nutrient, target, recorded, complete, remaining: complete ? Math.max(0, target - recorded) : null }];
  });
}
