(function bootstrapMoyeoPush(global) {
  const REQUIRED_FIREBASE_KEYS = ['apiKey', 'authDomain', 'projectId', 'messagingSenderId', 'appId'];
  const STATUS = Object.freeze({
    READY: 'ready',
    PROMPT: 'prompt',
    DENIED: 'denied',
    UNSUPPORTED: 'unsupported',
    INSECURE: 'insecure',
    UNCONFIGURED: 'unconfigured',
    ERROR: 'error',
  });

  let workerPromise = null;
  let foregroundInitialized = false;
  let tokenRegistrar = null;

  const config = () => global.MOYEO_RUNTIME_CONFIG || {};
  const firebaseConfig = () => config().firebase || null;

  function hasFirebaseConfig() {
    const options = firebaseConfig();
    return Boolean(options && REQUIRED_FIREBASE_KEYS.every((key) => options[key]));
  }

  function emit(name, detail) {
    global.dispatchEvent(new CustomEvent(name, { detail }));
  }

  function emitState(status, extra = {}) {
    const detail = {
      status,
      permission: 'Notification' in global ? Notification.permission : 'unsupported',
      ...extra,
    };
    emit('moyeo:push-state', detail);
    return detail;
  }

  async function isMessagingSupported() {
    if (!('Notification' in global) || !('serviceWorker' in navigator) || !global.PushManager) return false;
    if (!global.firebase?.messaging) return false;
    if (!global.firebase.messaging.isSupported) return true;
    try {
      return Boolean(await Promise.resolve(global.firebase.messaging.isSupported()));
    } catch (_) {
      return false;
    }
  }

  async function capability() {
    if (!hasFirebaseConfig() || !config().firebaseVapidKey) return emitState(STATUS.UNCONFIGURED);
    if (!global.isSecureContext) return emitState(STATUS.INSECURE);
    if (!await isMessagingSupported()) return emitState(STATUS.UNSUPPORTED);
    if (Notification.permission === 'denied') return emitState(STATUS.DENIED);
    if (Notification.permission === 'default') return emitState(STATUS.PROMPT);
    return emitState(STATUS.READY);
  }

  async function messaging() {
    if (!hasFirebaseConfig() || !await isMessagingSupported()) return null;
    if (!global.firebase.apps.length) global.firebase.initializeApp(firebaseConfig());
    return global.firebase.messaging();
  }

  function serviceWorkerUrl() {
    const url = new URL('firebase-messaging-sw.js', document.baseURI);
    url.searchParams.set('config', btoa(JSON.stringify(firebaseConfig())));
    return url;
  }

  async function registerWorker() {
    if (!('serviceWorker' in navigator) || !hasFirebaseConfig()) return null;
    if (!workerPromise) {
      const scriptUrl = serviceWorkerUrl();
      workerPromise = navigator.serviceWorker.register(scriptUrl, {
        scope: new URL('.', scriptUrl).pathname,
      }).catch((error) => {
        workerPromise = null;
        emitState(STATUS.ERROR, { error: error?.message || 'service worker registration failed' });
        throw error;
      });
    }
    return workerPromise;
  }

  async function currentToken({ requestPermission = false } = {}) {
    let state = await capability();
    if (requestPermission && state.status === STATUS.PROMPT) {
      const permission = await Notification.requestPermission();
      state = permission === 'granted'
        ? emitState(STATUS.READY)
        : emitState(permission === 'denied' ? STATUS.DENIED : STATUS.PROMPT);
    }
    if (state.status !== STATUS.READY) return null;

    try {
      const instance = await messaging();
      const registration = await registerWorker();
      if (!instance || !registration) return null;
      const token = await instance.getToken({
        vapidKey: config().firebaseVapidKey,
        serviceWorkerRegistration: registration,
      });
      if (token) emit('moyeo:push-token', { token });
      return token || null;
    } catch (error) {
      emitState(STATUS.ERROR, { error: error?.message || 'push token request failed' });
      throw error;
    }
  }

  function setTokenRegistrar(registrar) {
    tokenRegistrar = typeof registrar === 'function' ? registrar : null;
  }

  async function syncToken({ requestPermission = false, reason = 'manual' } = {}) {
    const token = await currentToken({ requestPermission });
    if (!token) return null;
    if (tokenRegistrar) await tokenRegistrar(token, { reason });
    emit('moyeo:push-token-synced', { token, reason, registered: Boolean(tokenRegistrar) });
    return token;
  }

  async function initializeForegroundMessages() {
    if (foregroundInitialized) return capability();
    const state = await capability();
    if ([STATUS.UNCONFIGURED, STATUS.UNSUPPORTED, STATUS.INSECURE].includes(state.status)) return state;

    const instance = await messaging();
    if (!instance) return emitState(STATUS.UNSUPPORTED);
    await registerWorker();
    foregroundInitialized = true;
    instance.onMessage(async (payload) => {
      const detail = payload || {};
      emit('moyeo:push-message', detail);

      const title = payload?.notification?.title || payload?.data?.title;
      const body = payload?.notification?.body || payload?.data?.body;
      if (document.visibilityState !== 'visible' && Notification.permission === 'granted' && title) {
        const registration = await registerWorker();
        await registration?.showNotification(title, {
          body: body || '',
          data: payload?.data || {},
          tag: payload?.data?.notificationId || undefined,
        });
      }
    });
    return state;
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
    STATUS,
    capability,
    currentToken,
    destination,
    initialize: initializeForegroundMessages,
    isConfigured: () => Boolean(hasFirebaseConfig() && config().firebaseVapidKey),
    registerWorker,
    setTokenRegistrar,
    syncToken,
  };

  global.addEventListener('load', () => {
    initializeForegroundMessages().catch((error) => {
      emitState(STATUS.ERROR, { error: error?.message || 'push initialization failed' });
    });
  }, { once: true });
}(window));
