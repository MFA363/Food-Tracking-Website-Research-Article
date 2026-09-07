import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateMacroTargets, deriveMacroPercentages } from '../src/lib/macronutrients.ts';

test('allocates 2000 kcal at 55/25/20 into calories and grams', () => {
  const result = calculateMacroTargets(2000, { carbohydrate: 55, protein: 25, fat: 20 });
  assert.deepEqual(result.carbohydrate, { energy: 1100, grams: 275 });
  assert.deepEqual(result.protein, { energy: 500, grams: 125 });
  assert.equal(result.fat.energy, 400);
  assert.equal(result.fat.grams, 400 / 9);
});
test('rejects invalid totals, percentages, and TDEE', () => {
  for (const value of [99, 101]) assert.throws(() => calculateMacroTargets(2000, { carbohydrate: value - 40, protein: 20, fat: 20 }));
  for (const value of [NaN, Infinity, -1, 101]) assert.throws(() => calculateMacroTargets(2000, { carbohydrate: value, protein: 25, fat: 20 }));
  for (const value of [0, -2000, NaN, Infinity]) assert.throws(() => calculateMacroTargets(value, { carbohydrate: 55, protein: 25, fat: 20 }));
});
test('accepts decimal percentages and conserves total energy', () => {
  const targets = calculateMacroTargets(2345, { carbohydrate: 55.55, protein: 24.45, fat: 20 });
  assert.ok(Math.abs(Object.values(targets).reduce((sum, target) => sum + target.energy, 0) - 2345) < 1e-8);
});

test('carbohydrate is the remainder, including decimal and zero boundaries', () => {
  assert.deepEqual(deriveMacroPercentages(25, 20), { carbohydrate: 55, protein: 25, fat: 20 });
  assert.equal(deriveMacroPercentages(24.45, 20).carbohydrate, 55.55);
  assert.equal(deriveMacroPercentages(0, 0).carbohydrate, 100);
  assert.equal(deriveMacroPercentages(60, 40).carbohydrate, 0);
  for (const [protein, fat] of [[70, 40], [-1, 20], [20, Infinity], [NaN, 20]]) assert.throws(() => deriveMacroPercentages(protein, fat));
});
