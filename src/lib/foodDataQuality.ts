const tracked = ["energi_kal","protein_g","lemak_g","karbohidrat_g","serat_g","kalsium_mg","fosfor_mg","besi_mg","natrium_mg","kalium_mg","tembaga_mg","seng_mg"];
const grams = ["air","protein_g","lemak_g","karbohidrat_g","serat_g","abu_g"];
// Conservative rejection checks, not a certification of accepted rows.
export function usableImportedNutrients(n: Record<string, number | null>): boolean {
  if (!tracked.every((key) => typeof n[key] === "number" && Number.isFinite(n[key]) && n[key]! >= 0)) return false;
  if (Object.values(n).some((v) => v !== null && (!Number.isFinite(v) || v < 0))) return false;
  if (grams.some((key) => n[key] !== null && n[key] !== undefined && n[key]! > 100)) return false;
  if (n.energi_kal! > 900) return false;
  const mass = ["air","protein_g","lemak_g","karbohidrat_g","abu_g"].reduce((sum,key) => sum + (n[key] ?? 0), 0);
  return mass <= 105;
}
