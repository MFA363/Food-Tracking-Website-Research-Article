import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { regionalFood } from '../src/lib/regionalFoods.ts';

const text = readFileSync(new URL('../public/data/regional_foods.json', import.meta.url), 'utf8');
test('web and mobile share 31 validated reference foods', () => {
  assert.equal(text, readFileSync(new URL('../mobile/assets/regional_foods.json', import.meta.url), 'utf8'));
  const foods = JSON.parse(text).map(regionalFood);
  assert.equal(foods.length, 31);
  assert.equal(new Set(foods.map(f => f.id)).size, foods.length);
  for (const food of foods) assert.ok(food.sourceUrl.startsWith('https://myfcd.moh.gov.my/'));
  const nasi = foods.find(f => f.id === 'myfcd-221019');
  assert.equal(nasi.nutrients.energy, 169);
  assert.equal(nasi.nutrients.copper, null);
});
test('ten new Malaysian foods report every CalNut nutrient without imputation', () => {
  const codes = ['R106035', 'R106036', 'R105006', 'R101096', 'R101099', 'R101102', 'R105022', 'R105023', 'R105024', 'R106051'];
  const foods = JSON.parse(text).map(regionalFood);
  for (const code of codes) {
    const food = foods.find(f => f.id === `myfcd-${code}`);
    assert.ok(food, code);
    assert.equal(Object.keys(food.nutrients).length, 12);
    assert.ok(Object.values(food.nutrients).every(v => typeof v === 'number' && Number.isFinite(v) && v >= 0));
    assert.equal(food.region, 'Malaysia');
  }
});
test('invalid and missing macro values are rejected', () => {
  const row = JSON.parse(text)[0];
  for (const energy of [null, -1, 901, '169']) {
    assert.throws(() => regionalFood({...row, nutrients: {...row.nutrients, energy}}));
  }
});
