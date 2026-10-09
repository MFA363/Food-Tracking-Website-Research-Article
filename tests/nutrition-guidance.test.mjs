import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dailyNutritionTips, mealPriorities, remainingIntake, guidanceKeys } from '../src/lib/nutritionGuidance.ts';

const entry = (values = {}) => ({ foodName: 'Example', nutrients: { ...Object.fromEntries(guidanceKeys.map(k => [k, 0])), energy: 100, protein: 10, fat: 5, carbohydrate: 20, ...values } });
test('diary changes and age changes recalculate personalized gaps', () => {
  const get = (rows, age = 30) => dailyNutritionTips(rows, age, 'female').find(t => t.nutrient === 'calcium');
  assert.equal(get([entry({ calcium: 250 })]).gap, 750);
  assert.equal(get([entry({ calcium: 250 }), entry({ calcium: 750 })]).status, 'referenceReached');
  assert.equal(get([entry({ calcium: 1000 })], 50).gap, 200);
  assert.equal(get([entry({ calcium: 250 })]).status, 'belowReference');
});
test('missing and invalid data cannot become a food priority', () => {
  for (const value of [undefined, null, -1, NaN, Infinity, '0']) {
    const tips = dailyNutritionTips([entry({ fiber: value })], 30, 'male');
    assert.equal(tips[0].status, 'incomplete');
    assert.ok(!mealPriorities(tips).some(t => t.nutrient === 'fiber'));
  }
  assert.equal(dailyNutritionTips([entry({ iron: 1e308 }), entry({ iron: 1e308 })], 30, 'female').find(t => t.nutrient === 'iron').status, 'incomplete');
});
test('unsupported profiles and empty diaries have no inferred gaps', () => {
  for (const age of [18, 121, NaN, 30.5]) assert.deepEqual(dailyNutritionTips([entry()], age, 'female'), []);
  assert.deepEqual(dailyNutritionTips([entry()], 30, 'unknown'), []);
  assert.deepEqual(dailyNutritionTips([], 30, 'male'), []);
});
test('food priorities compare proportions and exclude sodium', () => {
  const tips = dailyNutritionTips([entry({ fiber: 36, calcium: 900, phosphorus: 700, iron: 9, potassium: 4700, copper: 0.45, zinc: 11 })], 30, 'male');
  assert.deepEqual(mealPriorities(tips).map(t => t.nutrient), ['copper', 'calcium']);
  assert.equal(tips.at(-1).status, 'sodiumReview');
});
test('daily meal budget clamps reached targets and withholds incomplete values', () => {
  const result = remainingIntake([entry({ protein: undefined })], { energy: 2000, protein: 80, fat: 4, carbohydrate: 0 });
  assert.equal(result[0].remaining, 1900);
  assert.equal(result.find(r => r.nutrient === 'protein').remaining, null);
  assert.equal(result.find(r => r.nutrient === 'fat').remaining, 0);
  assert.equal(result.find(r => r.nutrient === 'carbohydrate').remaining, 0);
  assert.deepEqual(remainingIntake([], { energy: 2000 }), []);
});
