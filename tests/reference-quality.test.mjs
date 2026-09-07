import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { adultReferenceIntakes } from '../src/lib/referenceIntakes.ts';
import { usableImportedNutrients } from '../src/lib/foodDataQuality.ts';

test('AKG adult rows and age boundaries match the official tables', () => {
  assert.equal(adultReferenceIntakes('female', 29).iron, 18);
  assert.equal(adultReferenceIntakes('female', 50).iron, 8);
  assert.equal(adultReferenceIntakes('male', 19).fat, 75);
  assert.equal(adultReferenceIntakes('male', 19).fiber, 37);
  assert.equal(adultReferenceIntakes('male', 30).energy, 2550);
  assert.equal(adultReferenceIntakes('male', 65).sodium, 1100);
  assert.equal(adultReferenceIntakes('female', 80).energy, 1400);
  assert.equal(adultReferenceIntakes('female', 18).energy, 0);
});
test('import rejects impossible and missing values without replacing them', () => {
  const rows = JSON.parse(readFileSync(new URL('../public/data/tkpi2020_data.json', import.meta.url)));
  const bad = rows.find((r) => r.kode === 'AP085');
  assert.equal(usableImportedNutrients(bad.per100g), false);
  const accepted = rows.filter((r) => usableImportedNutrients(r.per100g));
  assert.ok(accepted.length > 0 && accepted.length < rows.length);
  assert.equal(usableImportedNutrients({ ...accepted[0].per100g, serat_g: null }), false);
  assert.equal(usableImportedNutrients({ ...accepted[0].per100g, protein_g: 101 }), false);
  console.log(`${rows.length} imported rows; ${accepted.length} pass screening (not source verification).`);
});
