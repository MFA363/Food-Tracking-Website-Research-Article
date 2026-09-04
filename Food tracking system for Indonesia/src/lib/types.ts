export type Language = "en" | "id" | "ms" | "jv" | "ar";
export type Gender = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type Role = "user" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: Role;
  height: number; // cm
  weight: number; // kg
  age: number;
  gender: Gender;
  job: string;
  activityLevel: ActivityLevel;
  createdAt: string;
  updatedAt: string;
  language: Language;
}

export interface Nutrients {
  energy: number;    // kcal
  protein: number;   // g
  fat: number;       // g
  carbohydrate: number; // g
  fiber: number;     // g
  calcium: number;   // mg
  phosphorus: number; // mg
  iron: number;      // mg
  sodium: number;    // mg
  potassium: number; // mg
  copper: number;    // mg
  zinc: number;      // mg
}

export interface Food {
  id: string;
  name: Record<Language, string>;
  category: string;
  nutrients: Nutrients; // per 100g
  defaultUnit: string;
  defaultWeight: number; // grams per default unit
  isCustom?: boolean;
  createdBy?: string;
}

export interface FoodUnit {
  label: string;
  grams: number;
}

export interface FoodLogEntry {
  id: string;
  userId: string;
  foodId: string;
  foodName: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  weightGrams: number;
  unit: string;
  unitGrams: number;
  quantity: number;
  nutrients: Nutrients; // calculated total
  loggedAt: string;
}

export interface DailyLog {
  date: string;
  entries: FoodLogEntry[];
  totalNutrients: Nutrients;
}

export interface BMIResult {
  value: number;
  category: "underweight" | "normal" | "overweight" | "obese1" | "obese2";
  color: string;
}

export interface EnergyRequirement {
  bmr: number;
  tdee: number;
  activityFactor: number;
}
