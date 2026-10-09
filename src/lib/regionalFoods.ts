import type { Food, Nutrients } from './types';

export const nutrientKeys = ['energy', 'protein', 'fat', 'carbohydrate', 'fiber', 'calcium', 'phosphorus', 'iron', 'sodium', 'potassium', 'copper', 'zinc'] as const;
export function regionalFood(raw: any): Food {
  const n = raw?.nutrients;
  if (!n || typeof raw.id !== 'string' || typeof raw.name !== 'string' || !nutrientKeys.every((key, i) =>
    (i >= 4 && n[key] === null) || (typeof n[key] === 'number' && Number.isFinite(n[key]) && n[key] >= 0 && n[key] <= (i === 0 ? 900 : i < 5 ? 100 : 100000))
  ) || n.protein + n.fat + n.carbohydrate > 105) throw new Error('Invalid regional food reference.');
  return {
    id: raw.id, name: { en: raw.name, id: raw.name, ms: raw.name, jv: raw.name, ar: raw.name },
    category: raw.category, nutrients: n as Nutrients, defaultUnit: 'default', defaultWeight: 100,
    region: raw.region, aliases: raw.aliases, source: raw.source, sourceUrl: raw.sourceUrl,
  };
}
