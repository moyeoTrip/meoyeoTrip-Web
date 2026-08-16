window.MOYEO_RUNTIME_CONFIG = {
  apiBaseUrl: 'https://moyeo-trip-api.jayden-bin.cc',
  firebase: {
    apiKey: 'FIREBASE_WEB_API_KEY',
    authDomain: 'FIREBASE_PROJECT_ID.firebaseapp.com',
    projectId: 'FIREBASE_PROJECT_ID',
    storageBucket: 'FIREBASE_STORAGE_BUCKET',
    messagingSenderId: 'FIREBASE_MESSAGING_SENDER_ID',
    appId: 'FIREBASE_WEB_APP_ID',
  },
  kakaoJavaScriptKey: 'KAKAO_JAVASCRIPT_KEY',
  kakaoRedirectUri: 'https://YOUR_GITHUB_PAGES_HOST/YOUR_REPOSITORY/',
  sentry: {
    dsn: 'SENTRY_DSN',
    environment: 'production',
    release: 'moyeotrip-web@GIT_SHA',
    tracesSampleRate: 0,
  },
};
