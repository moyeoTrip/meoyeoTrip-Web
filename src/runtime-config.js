// Safe defaults. Deployment or runtime-config.local.js supplies browser app keys.
window.MOYEO_RUNTIME_CONFIG = Object.assign({
  apiBaseUrl: 'https://moyeo-trip-api.jayden-bin.cc',
  // 앱 버전 — `npm run sync-version` 이 package.json 에서 채운다. 손으로 고치지 않는다.
  appVersion: '1.0.0',
  firebase: null,
  firebaseVapidKey: '',
  pushTokenRegistrationPath: '',
  kakaoJavaScriptKey: '',
  kakaoRedirectUri: '',
  sentry: {
    dsn: '',
    environment: 'development',
    release: '',
    tracesSampleRate: 0,
  },
}, window.MOYEO_RUNTIME_CONFIG || {});
