import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

test('missing Firebase configuration rejects account and storage operations instead of demo persistence', async () => {
  const server = await createServer({ configFile: false, envDir: false, envPrefix: 'CALNUT_ISOLATED_TEST_', server: { middlewareMode: true }, appType: 'custom' });
  try {
    const api = await server.ssrLoadModule('/src/lib/firebase.ts');
    assert.equal(api.FIREBASE_CONFIGURED, false);
    assert.equal(api.auth, null);
    await assert.rejects(api.loginUser('synthetic@example.invalid', 'not-used'), /not configured/);
    await assert.rejects(api.registerUser('synthetic@example.invalid', 'not-used', {}), /not configured/);
    await assert.rejects(api.getCustomFoods(), /not configured/);
    await assert.rejects(api.getUserLogs('synthetic'), /not configured/);
    let uid = 'unset';
    api.onAuthStateChange((value) => { uid = value; });
    assert.equal(uid, null);
  } finally { await server.close(); }
});

test('invalid food weights fail before any cloud write', async () => {
  const server = await createServer({ configFile: false, envDir: false, envPrefix: 'CALNUT_ISOLATED_TEST_', server: { middlewareMode: true }, appType: 'custom' });
  try {
    const api = await server.ssrLoadModule('/src/lib/firebase.ts');
    for (const weightGrams of [0, -1, NaN, Infinity]) {
      await assert.rejects(api.addFoodLog({ weightGrams, nutrients: { energy: 10 } }), /positive food weight/);
    }
    const nutrients = { energy: 169, protein: 4.2, fat: 5.7, carbohydrate: 25.3, fiber: 0.3, calcium: 24, phosphorus: 51, iron: 1.8, sodium: 338, potassium: 121, copper: null, zinc: null };
    await assert.rejects(api.addFoodLog({ weightGrams: 100, nutrients }), /not configured/);
    await assert.rejects(api.addFoodLog({ weightGrams: 100, nutrients: {...nutrients, protein: null} }), /valid nutrient/);
  } finally { await server.close(); }
});
