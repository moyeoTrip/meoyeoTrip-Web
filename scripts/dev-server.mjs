import { spawn } from 'node:child_process';
import { chmod, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = process.env.PORT || '5173';
const host = process.env.HOST || '127.0.0.1';
const localOrigin = `http://${host}:${port}`;
const configPath = path.join(root, 'src', 'runtime-config.local.js');

let existingConfig = {};
try {
  const sandbox = { window: {} };
  vm.runInNewContext(await readFile(configPath, 'utf8'), sandbox, { filename: configPath });
  existingConfig = sandbox.window.MOYEO_RUNTIME_CONFIG || {};
} catch (error) {
  if (error?.code !== 'ENOENT') {
    console.warn(`[moyeo] Ignoring invalid local runtime config: ${error.message}`);
  }
}

const existingFirebase = existingConfig.firebase || {};
const firebase = {
  apiKey: process.env.FIREBASE_WEB_API_KEY || existingFirebase.apiKey || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || existingFirebase.authDomain || '',
  projectId: process.env.FIREBASE_PROJECT_ID || existingFirebase.projectId || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || existingFirebase.storageBucket || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || existingFirebase.messagingSenderId || '',
  appId: process.env.FIREBASE_WEB_APP_ID || existingFirebase.appId || '',
};

const config = {
  apiBaseUrl: process.env.MOYEO_API_BASE_URL || existingConfig.apiBaseUrl || 'https://moyeo-trip-api.jayden-bin.cc',
  firebase,
  firebaseVapidKey: process.env.FIREBASE_WEB_VAPID_KEY || existingConfig.firebaseVapidKey || '',
  pushTokenRegistrationPath: process.env.MOYEO_FCM_TOKEN_REGISTRATION_PATH || existingConfig.pushTokenRegistrationPath || '',
  kakaoJavaScriptKey: process.env.KAKAO_JAVASCRIPT_KEY || existingConfig.kakaoJavaScriptKey || '',
  kakaoRedirectUri: process.env.KAKAO_REDIRECT_URI || existingConfig.kakaoRedirectUri || `${localOrigin}/`,
  sentry: {
    dsn: process.env.SENTRY_DSN || existingConfig.sentry?.dsn || '',
    environment: process.env.SENTRY_ENVIRONMENT || existingConfig.sentry?.environment || 'development',
    release: process.env.SENTRY_RELEASE || existingConfig.sentry?.release || '',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || existingConfig.sentry?.tracesSampleRate || 0),
  },
};

await writeFile(
  configPath,
  `window.MOYEO_RUNTIME_CONFIG = ${JSON.stringify(config, null, 2)};\n`,
  { mode: 0o600 },
);
await chmod(configPath, 0o600);

const firebaseReady = Object.values(firebase).every(Boolean);
const kakaoReady = Boolean(config.kakaoJavaScriptKey && config.kakaoRedirectUri);
console.log(`[moyeo] Firebase web config: ${firebaseReady ? 'ready' : 'incomplete'}`);
console.log(`[moyeo] Kakao web config: ${kakaoReady ? 'ready' : 'incomplete'}`);
if (!config.kakaoRedirectUri.startsWith(localOrigin)) {
  console.warn(`[moyeo] Kakao redirect URI points outside this dev server: ${config.kakaoRedirectUri}`);
}

const server = spawn('python3', ['-m', 'http.server', port, '--bind', host], {
  cwd: root,
  stdio: 'inherit',
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.kill(signal));
}

server.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exitCode = code ?? 0;
});
