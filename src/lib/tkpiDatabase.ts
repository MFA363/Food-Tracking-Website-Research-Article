import type { Food, Language, Nutrients } from "./types";

type TkpiRecord = { kode: string; nama: string; kategori: string; per100g: Record<string, number | null> };
let databasePromise: Promise<Food[]> | undefined;
const value = (nutrients: Record<string, number | null>, key: string) => nutrients[key] ?? 0;

function toFood(item: TkpiRecord): Food {
  const n = item.per100g;
  const nutrients: Nutrients = {
    energy: value(n, "energi_kal"), protein: value(n, "protein_g"), fat: value(n, "lemak_g"),
    carbohydrate: value(n, "karbohidrat_g"), fiber: value(n, "serat_g"), calcium: value(n, "kalsium_mg"),
    phosphorus: value(n, "fosfor_mg"), iron: value(n, "besi_mg"), sodium: value(n, "natrium_mg"),
    potassium: value(n, "kalium_mg"), copper: value(n, "tembaga_mg"), zinc: value(n, "seng_mg"),
  };
  const name = item.nama.trim();
  return {
    id: `tkpi-${item.kode}`,
    name: { id: name, en: name, ms: name, jv: name, ar: name } as Record<Language, string>,
    category: item.kategori, nutrients, defaultUnit: "default", defaultWeight: 100,
  };
}

export function loadTkpiFoods(): Promise<Food[]> {
  databasePromise ??= fetch("/data/tkpi2020_data.json")
    .then((response) => {
      if (!response.ok) throw new Error("TKPI 2020 data could not be loaded.");
      return response.json() as Promise<TkpiRecord[]>;
    })
    .then((data) => data.map(toFood));
  return databasePromise;
}

export function searchTkpiFoods(foods: Food[], query: string): Food[] {
  const term = query.trim().toLocaleLowerCase("id-ID");
  if (!term) return foods.slice(0, 20);
  return foods.filter((food) => food.name.id.toLocaleLowerCase("id-ID").includes(term)).slice(0, 20);
}
