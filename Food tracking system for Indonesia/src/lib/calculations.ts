import type { Gender, ActivityLevel, BMIResult, EnergyRequirement, Nutrients, FoodLogEntry } from "./types";

// WHO Asian-Pacific BMI classification
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

// Mifflin-St Jeor equation (more accurate than Harris-Benedict)
export function calculateEnergyRequirement(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel
): EnergyRequirement {
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
  return {
    energy: Math.round(nutrientsPer100g.energy * factor * 10) / 10,
    protein: Math.round(nutrientsPer100g.protein * factor * 100) / 100,
    fat: Math.round(nutrientsPer100g.fat * factor * 100) / 100,
    carbohydrate: Math.round(nutrientsPer100g.carbohydrate * factor * 100) / 100,
    fiber: Math.round(nutrientsPer100g.fiber * factor * 100) / 100,
    calcium: Math.round(nutrientsPer100g.calcium * factor * 10) / 10,
    phosphorus: Math.round(nutrientsPer100g.phosphorus * factor * 10) / 10,
    iron: Math.round(nutrientsPer100g.iron * factor * 100) / 100,
    sodium: Math.round(nutrientsPer100g.sodium * factor * 10) / 10,
    potassium: Math.round(nutrientsPer100g.potassium * factor * 10) / 10,
    copper: Math.round(nutrientsPer100g.copper * factor * 1000) / 1000,
    zinc: Math.round(nutrientsPer100g.zinc * factor * 100) / 100,
  };
}

export function sumNutrients(entries: FoodLogEntry[]): Nutrients {
  return entries.reduce(
    (acc, entry) => ({
      energy: acc.energy + entry.nutrients.energy,
      protein: acc.protein + entry.nutrients.protein,
      fat: acc.fat + entry.nutrients.fat,
      carbohydrate: acc.carbohydrate + entry.nutrients.carbohydrate,
      fiber: acc.fiber + entry.nutrients.fiber,
      calcium: acc.calcium + entry.nutrients.calcium,
      phosphorus: acc.phosphorus + entry.nutrients.phosphorus,
      iron: acc.iron + entry.nutrients.iron,
      sodium: acc.sodium + entry.nutrients.sodium,
      potassium: acc.potassium + entry.nutrients.potassium,
      copper: acc.copper + entry.nutrients.copper,
      zinc: acc.zinc + entry.nutrients.zinc,
    }),
    {
      energy: 0, protein: 0, fat: 0, carbohydrate: 0, fiber: 0,
      calcium: 0, phosphorus: 0, iron: 0, sodium: 0, potassium: 0,
      copper: 0, zinc: 0,
    }
  );
}

// Recommended Daily Intake reference values (Indonesian AKG 2019 for adults 19-29y)
export function getRDI(gender: Gender, age: number): Nutrients {
  const isMale = gender === "male";
  // Values adjusted by age groups (simplified)
  const ageAdult = age >= 60;
  return {
    energy: isMale ? 2650 : 2250,
    protein: isMale ? 65 : 60,
    fat: isMale ? 73 : 65,
    carbohydrate: isMale ? 430 : 360,
    fiber: isMale ? 38 : 32,
    calcium: 1000,
    phosphorus: 700,
    iron: isMale ? 9 : (age < 50 ? 26 : 9),
    sodium: 1500,
    potassium: isMale ? 4700 : 4700,
    copper: 0.9,
    zinc: isMale ? 11 : 8,
  };
}

export function getMealTypeFromHour(hour: number): import("./types").MealType {
  if (hour >= 5 && hour < 10) return "breakfast";
  if (hour >= 10 && hour < 15) return "lunch";
  if (hour >= 17 && hour < 21) return "dinner";
  return "snack";
}

export function formatNutrientValue(value: number, unit: string): string {
  if (unit === "mg" || unit === "kcal") return `${Math.round(value * 10) / 10} ${unit}`;
  if (unit === "g") return `${Math.round(value * 10) / 10} ${unit}`;
  return `${value} ${unit}`;
}
