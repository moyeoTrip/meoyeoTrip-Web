// Safe defaults. Deployment or runtime-config.local.js supplies browser app keys.
window.MOYEO_RUNTIME_CONFIG = Object.assign({
  apiBaseUrl: 'https://moyeo-trip-api.jayden-bin.cc',
  firebase: null,
  kakaoJavaScriptKey: '',
  kakaoRedirectUri: '',
}, window.MOYEO_RUNTIME_CONFIG || {});
