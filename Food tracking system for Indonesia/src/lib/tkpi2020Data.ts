import sourceData from "../../tkpi2020_data.json";
// ============================================================
// TKPI 2020 — Tabel Komposisi Pangan Indonesia
// Kementerian Kesehatan Republik Indonesia, 2020
// 1,900 food items | All values per 100g edible portion (BDD)
// ============================================================

export interface FoodNutrients {
  air: number | null;           // Water (g)
  energi_kal: number | null;    // Energy (kcal)
  protein_g: number | null;     // Protein (g)
  lemak_g: number | null;       // Fat (g)
  karbohidrat_g: number | null; // Carbohydrate (g)
  serat_g: number | null;       // Fiber (g)
  abu_g: number | null;         // Ash (g)
  kalsium_mg: number | null;    // Calcium (mg)
  fosfor_mg: number | null;     // Phosphorus (mg)
  besi_mg: number | null;       // Iron (mg)
  natrium_mg: number | null;    // Sodium (mg)
  kalium_mg: number | null;     // Potassium (mg)
  tembaga_mg: number | null;    // Copper (mg)
  seng_mg: number | null;       // Zinc (mg)
  retinol_mcg: number | null;   // Retinol (mcg)
  b_karoten_mcg: number | null; // Beta-Carotene (mcg)
  karoten_total_mcg: number | null;
  thiamin_mg: number | null;    // Thiamin / B1 (mg)
  riboflavin_mg: number | null; // Riboflavin / B2 (mg)
  niasin_mg: number | null;     // Niacin / B3 (mg)
  vitamin_c_mg: number | null;  // Vitamin C (mg)
}

export interface FoodItem {
  kode: string;       // Food code (e.g. "BR001")
  nama: string;       // Food name in Indonesian
  kategori: string;   // Category
  sumber: string;     // Data source reference
  per100g: FoodNutrients;
  bdd_pct: number | null; // Edible portion % (BDD)
}

export const TKPI_CATEGORIES = [
  "Serealia dan Hasil Olahannya",
  "Umbi Berpati dan Hasil Olahannya",
  "Kacang, Biji, Bean dan Hasil Olahannya",
  "Sayuran dan Hasil Olahannya",
  "Buah dan Hasil Olahannya",
  "Daging, Unggas dan Hasil Olahannya",
  "Ikan, Kerang, Udang, dan Hasil Olahannya",
  "Telur dan Hasil Olahannya",
  "Susu dan Hasil Olahannya",
  "Lemak dan Minyak",
  "Gula, Sirup, dan Konfeksioneri",
  "Bumbu",
  "Minuman",
] as const;

// Helper: search foods by name (case-insensitive)
export function searchFoods(query: string): FoodItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return tkpi2020Data.filter(f =>
    f.nama.toLowerCase().includes(q) || f.kode.toLowerCase().includes(q)
  );
}

// Helper: get foods by category
export function getFoodsByCategory(category: string): FoodItem[] {
  return tkpi2020Data.filter(f => f.kategori === category);
}

// Helper: get food by code
export function getFoodByCode(code: string): FoodItem | undefined {
  return tkpi2020Data.find(f => f.kode === code);
}

// Helper: calculate nutrition for a given portion size in grams
export function calcNutrition(food: FoodItem, grams: number): FoodNutrients {
  const ratio = grams / 100;
  const n = food.per100g;
  return {
    air: n.air != null ? +(n.air * ratio).toFixed(2) : null,
    energi_kal: n.energi_kal != null ? +(n.energi_kal * ratio).toFixed(1) : null,
    protein_g: n.protein_g != null ? +(n.protein_g * ratio).toFixed(2) : null,
    lemak_g: n.lemak_g != null ? +(n.lemak_g * ratio).toFixed(2) : null,
    karbohidrat_g: n.karbohidrat_g != null ? +(n.karbohidrat_g * ratio).toFixed(2) : null,
    serat_g: n.serat_g != null ? +(n.serat_g * ratio).toFixed(2) : null,
    abu_g: n.abu_g != null ? +(n.abu_g * ratio).toFixed(2) : null,
    kalsium_mg: n.kalsium_mg != null ? +(n.kalsium_mg * ratio).toFixed(2) : null,
    fosfor_mg: n.fosfor_mg != null ? +(n.fosfor_mg * ratio).toFixed(2) : null,
    besi_mg: n.besi_mg != null ? +(n.besi_mg * ratio).toFixed(2) : null,
    natrium_mg: n.natrium_mg != null ? +(n.natrium_mg * ratio).toFixed(2) : null,
    kalium_mg: n.kalium_mg != null ? +(n.kalium_mg * ratio).toFixed(2) : null,
    tembaga_mg: n.tembaga_mg != null ? +(n.tembaga_mg * ratio).toFixed(3) : null,
    seng_mg: n.seng_mg != null ? +(n.seng_mg * ratio).toFixed(2) : null,
    retinol_mcg: n.retinol_mcg != null ? +(n.retinol_mcg * ratio).toFixed(1) : null,
    b_karoten_mcg: n.b_karoten_mcg != null ? +(n.b_karoten_mcg * ratio).toFixed(1) : null,
    karoten_total_mcg: n.karoten_total_mcg != null ? +(n.karoten_total_mcg * ratio).toFixed(1) : null,
    thiamin_mg: n.thiamin_mg != null ? +(n.thiamin_mg * ratio).toFixed(3) : null,
    riboflavin_mg: n.riboflavin_mg != null ? +(n.riboflavin_mg * ratio).toFixed(3) : null,
    niasin_mg: n.niasin_mg != null ? +(n.niasin_mg * ratio).toFixed(2) : null,
    vitamin_c_mg: n.vitamin_c_mg != null ? +(n.vitamin_c_mg * ratio).toFixed(2) : null,
  };
}

export const tkpi2020Data: FoodItem[] = sourceData;