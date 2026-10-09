import { loadEnv } from 'vite';

const env = loadEnv('production', process.cwd(), 'VITE_FIREBASE_');
const required = ['API_KEY', 'AUTH_DOMAIN', 'PROJECT_ID', 'APP_ID'];
const missing = required.filter((name) => !env['VITE_FIREBASE_' + name]);
console.log(JSON.stringify({ check: 'configuration', missing, configured: missing.length === 0 }));
if (missing.length) process.exit(1);
const probes = [
  ['authentication', 'https://identitytoolkit.googleapis.com/v1/projects?key=' + encodeURIComponent(env.VITE_FIREBASE_API_KEY)],
  ['firestore-unauthenticated-probe', 'https://firestore.googleapis.com/v1/projects/' + encodeURIComponent(env.VITE_FIREBASE_PROJECT_ID) + '/databases/(default)/documents/users/calnut-connection-probe-nonexistent'],
];
for (const [check, url] of probes) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const body = await response.json();
    console.log(JSON.stringify({ check, status: response.status, error: body.error?.status || null,
      note: check.startsWith('firestore') ? '403 is expected when unauthenticated reads are protected; it does not prove authorized read/write access.' : 'Checks service response only; does not verify sign-in.' }));
  } catch (error) { console.log(JSON.stringify({ check, networkError: error.name })); process.exitCode = 1; }
}
