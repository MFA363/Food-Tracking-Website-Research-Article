// Targeted import of public Ministry of Health Malaysia reference records.
// Run manually; never called by the app. Missing measurements remain null.
import { readFileSync, writeFileSync } from 'node:fs';
const selections = [
  ['221019', 'Nasi lemak', 'grains', 'Malaysia'],
  ['221018', 'Nasi ayam (chicken rice)', 'grains', 'Malaysia'],
  ['221023', 'Roti canai', 'grains', 'Malaysia'],
  ['221025', 'Kuah dhal', 'legumes', 'Malaysia'],
  ['222014', 'Ayam kurma', 'meat', 'Malaysia'],
  ['222005', 'Rendang daging (beef)', 'meat', 'Malaysia'],
  ['222016', 'Satay ayam (chicken)', 'meat', 'Malaysia'],
  ['223003', 'Sambal ikan bilis', 'fish', 'Malaysia'],
  ['103024', 'Tau fu fah (unsweetened)', 'legumes', 'Malaysia'],
  ['103026', 'Susu soya / susu kedelai (unsweetened)', 'beverages', 'Both'],
  ['103025', 'Susu soya (packet)', 'beverages', 'Malaysia'],
  ['104013', 'Air kelapa (coconut water)', 'beverages', 'Both'],
  ['106030', 'Jambu batu / jambu biji (guava)', 'fruits', 'Both'],
  ['106066', 'Betik / pepaya (papaya)', 'fruits', 'Both'],
  ['106010', 'Pisang mas', 'fruits', 'Both'],
  ['R111062', 'Sirap bandung', 'beverages', 'Malaysia'],
  ['R113007', 'Cendol', 'beverages', 'Malaysia'],
  ['R113058', 'Soya drink (sweetened, packaged)', 'beverages', 'Malaysia'],
  ['R113060', 'Ice lemon tea (sweetened, packaged)', 'beverages', 'Malaysia'],
  ['R113064', 'Orange juice (fresh)', 'beverages', 'Both'],
  ['R211030', 'Putu bambu', 'other', 'Both'],
  ['R211044', 'Wajik', 'other', 'Both'],
  ['R214006', 'Dodol', 'other', 'Both'],
  ['R212078', 'Roti jala', 'grains', 'Malaysia'],
  ['R106035', 'Buah naga merah (red dragon fruit)', 'fruits', 'Malaysia', true],
  ['R106036', 'Buah naga putih (white dragon fruit)', 'fruits', 'Malaysia', true],
  ['R105006', 'Jagung sayur (baby corn)', 'vegetables', 'Malaysia', true],
  ['R101096', 'Ban kelapa (coconut bun)', 'grains', 'Malaysia', true],
  ['R101099', 'Ban kaya (kaya bun)', 'grains', 'Malaysia', true],
  ['R101102', 'Ban kacang merah (red bean bun)', 'grains', 'Malaysia', true],
  ['R105022', 'Lada bengala hijau (green capsicum)', 'vegetables', 'Malaysia', true],
  ['R105023', 'Lada bengala merah (red capsicum)', 'vegetables', 'Malaysia', true],
  ['R105024', 'Lada bengala kuning (yellow capsicum)', 'vegetables', 'Malaysia', true],
  ['R106051', 'Tembikai susu (honeydew)', 'fruits', 'Malaysia', true],
];
const keys = { energy: /^Energy$/, protein: /^Protein$/, fat: /^Fat$/, carbohydrate: /^Carbohydrate$/, fiber: /^(Fibre|Total dietary fibre)\s*$/, calcium: /^Calcium/, phosphorus: /^Phosphorus/, iron: /^Iron/, sodium: /^Sodium/, potassium: /^Potassium/, copper: /^Copper/, zinc: /^Zinc/ };
const strip = text => text.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
const existing = JSON.parse(readFileSync('public/data/regional_foods.json', 'utf8'));
const records = new Map(existing.map(record => [record.id, record]));
for (const [code, name, category, region, requireComplete = false] of selections) {
  if (process.argv.includes('--complete-only') && !requireComplete) continue;
  const edition = code.startsWith('R') ? 'current' : '97';
  const url = `https://myfcd.moh.gov.my/myfcd${edition}/index.php/site/detail_product/${code}/0/10/-1/0/0/`;
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw Error(`${code}: HTTP ${response.status}`);
  const html = await response.text();
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map(m => [...m[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map(c => strip(c[1])));
  const nutrients = Object.fromEntries(Object.entries(keys).map(([key, pattern]) => {
    const row = rows.find(r => pattern.test(r[0] ?? ''));
    const raw = row?.[2];
    const value = raw != null && /^\d+(\.\d+)?$/.test(raw) ? Number(raw) : null;
    return [key, value];
  }));
  if (!['energy','protein','fat','carbohydrate'].every(k => Number.isFinite(nutrients[k])) || nutrients.energy > 900 || nutrients.protein + nutrients.fat + nutrients.carbohydrate > 105) {
    console.warn(`Skipped unavailable or invalid source data: ${code}`);
    continue;
  }
  if (requireComplete && !Object.values(nutrients).every(v => typeof v === 'number' && Number.isFinite(v) && v >= 0)) {
    console.warn(`Skipped incomplete 12-nutrient profile: ${code}`);
    continue;
  }
  records.set(`myfcd-${code}`, { id: `myfcd-${code}`, name, category, region, aliases: name.toLowerCase().split(/\s*[/()]\s*/).filter(Boolean), nutrients, source: `MOH Malaysia · MyFCD ${edition === '97' ? '1997' : 'current'}`, sourceUrl: url, sourceCode: code, accessed: '2026-10-09', basis: '100 g edible portion; source preparation', note: 'Malaysian reference composition. Local recipes and brands vary. Unreported nutrients are not zero.' });
  console.log(`${code}: ${name} (${nutrients.energy} kcal)`);
}
if (records.size < 21) throw Error('Too few verified records; existing files left unchanged.');
const json = JSON.stringify([...records.values()], null, 2) + '\n';
writeFileSync('public/data/regional_foods.json', json);
writeFileSync('mobile/assets/regional_foods.json', json);
console.log(`Saved ${records.size} referenced foods to web and mobile assets.`);
