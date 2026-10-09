// Read-only native configuration/connectivity check. Never creates accounts,
// writes records, deploys rules, or prints API keys.
import { readFile } from 'node:fs/promises';
const config = JSON.parse(await readFile(new URL('../android/app/google-services.json', import.meta.url), 'utf8'));
const client = config.client.find(c => c.client_info?.android_client_info?.package_name === 'com.calnut.calnut');
if (!client || config.project_info?.project_id !== 'food-tracker-aa487') throw new Error('Unexpected native app or Firebase project.');
const key = client.api_key?.[0]?.current_key;
if (!key) throw new Error('Firebase client API key missing.');
const checks = [
  ['Auth project configuration', `https://identitytoolkit.googleapis.com/v1/projects?key=${encodeURIComponent(key)}`, 200],
  ['Unauthenticated Firestore access is denied', `https://firestore.googleapis.com/v1/projects/${config.project_info.project_id}/databases/(default)/documents/users/calnut-connection-probe-nonexistent`, 403],
];
let failed = false;
for (const [label, url, expected] of checks) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000), headers: {
      'X-Android-Package': 'com.calnut.calnut',
      'X-Android-Cert': '993A0354BB3CE1B4AE1E0B342779564E908383CA',
    } });
    console.log(`${label}: HTTP ${response.status} (expected ${expected})`);
    if (response.status !== expected) failed = true;
  } catch { console.log(`${label}: request failed or timed out`); failed = true; }
}
console.log('This does not verify authenticated writes, App Check enforcement, or Gemini availability.');
process.exitCode = failed ? 1 : 0;
