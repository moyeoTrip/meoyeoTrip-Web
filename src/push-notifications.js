(function bootstrapMoyeoPush(global) {
  const config = () => global.MOYEO_RUNTIME_CONFIG || {};

  function firebaseConfig() {
    return config().firebase || null;
  }

  function messaging() {
    const firebaseOptions = firebaseConfig();
    if (!global.firebase?.messaging || !firebaseOptions) return null;
    if (global.firebase.messaging.isSupported && !global.firebase.messaging.isSupported()) return null;
    if (!global.firebase.apps.length) global.firebase.initializeApp(firebaseOptions);
    return global.firebase.messaging();
  }

  function serviceWorkerUrl() {
    const url = new URL('firebase-messaging-sw.js', document.baseURI);
    url.searchParams.set('config', btoa(JSON.stringify(firebaseConfig())));
    return url;
  }

  async function registerWorker() {
    if (!('serviceWorker' in navigator) || !firebaseConfig()) return null;
    const scriptUrl = serviceWorkerUrl();
    return navigator.serviceWorker.register(scriptUrl, {
      scope: new URL('.', scriptUrl).pathname,
    });
  }

  async function currentToken({ requestPermission = false } = {}) {
    if (!('Notification' in global) || !global.isSecureContext) return null;
    let permission = Notification.permission;
    if (requestPermission && permission === 'default') permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;
    const instance = messaging();
    const vapidKey = config().firebaseVapidKey;
    if (!instance || !vapidKey) return null;
    const registration = await registerWorker();
    if (!registration) return null;
    return instance.getToken({ vapidKey, serviceWorkerRegistration: registration });
  }

  async function initializeForegroundMessages() {
    const instance = messaging();
    if (!instance) return;
    await registerWorker();
    instance.onMessage(async (payload) => {
      const detail = payload || {};
      global.dispatchEvent(new CustomEvent('moyeo:push-message', { detail }));
      const title = payload?.notification?.title || payload?.data?.title;
      const body = payload?.notification?.body || payload?.data?.body;
      if (Notification.permission === 'granted' && title) {
        const registration = await registerWorker();
        await registration?.showNotification(title, { body: body || '', data: payload?.data || {} });
      }
    });
  }

  function destination(data = {}) {
    const raw = String(data.screen || data.route || data.destination || '').toLowerCase();
    if (['notification', 'notifications', 'notification-center'].includes(raw)) return 'notifications';
    if (['explore', 'search', 'course'].includes(raw)) return 'explore';
    if (['meeting', 'meetings', 'chat', 'chatroom'].includes(raw)) return 'meetings';
    if (['feed', 'post'].includes(raw)) return 'feed';
    if (['my', 'profile', 'settings'].includes(raw)) return 'my';
    return 'home';
  }

  global.MoyeoPush = {
    currentToken,
    destination,
    initialize: initializeForegroundMessages,
    isConfigured: () => Boolean(firebaseConfig() && config().firebaseVapidKey),
  };

  global.addEventListener('load', () => {
    initializeForegroundMessages().catch(() => {});
  }, { once: true });
}(window));
