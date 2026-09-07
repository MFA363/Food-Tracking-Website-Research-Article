export type MacroPercentages = { carbohydrate: number; protein: number; fat: number };

export function calculateMacroTargets(tdee: number, percentages: MacroPercentages) {
  const values = Object.values(percentages);
  if (!values.every((value) => Number.isFinite(value) && value >= 0 && value <= 100)) {
    throw new Error("Enter a percentage between 0 and 100 for each macronutrient.");
  }
  if (Math.abs(percentages.carbohydrate + percentages.protein + percentages.fat - 100) > 0.000001) {
    throw new Error("Carbohydrate % + Protein % + Fat % must equal 100%.");
  }
  if (!Number.isFinite(tdee) || tdee <= 0) throw new Error("Complete your health profile to calculate TDEE first.");
  return {
    carbohydrate: { energy: tdee * percentages.carbohydrate / 100, grams: tdee * percentages.carbohydrate / 100 / 4 },
    protein: { energy: tdee * percentages.protein / 100, grams: tdee * percentages.protein / 100 / 4 },
    fat: { energy: tdee * percentages.fat / 100, grams: tdee * percentages.fat / 100 / 9 },
  };
}
