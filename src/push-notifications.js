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

  // 서버 FCM 데이터에는 `screen`·`route`·`destination` 이 **없다.** 담기는 것은
  // `notificationId`·`notificationType`·`referenceId`·`chatRoomId` 넷뿐이다
  // (BE `PushNotificationSender.toFirebaseMessage`). 예전에는 앞의 세 키만 읽어서
  // **어떤 푸시를 눌러도 홈**이 열렸다 — 알림을 눌러도 그 알림이 가리키는 곳으로 가지 않았다.
  //
  // 유형별 목적지는 **앱 안 알림 목록과 같은 규칙**이다(`screens-extra.jsx` 의 `openServerNotification`).
  // 같은 알림을 목록에서 누를 때와 푸시로 누를 때 다른 곳이 열리면 안 된다.
  const PUSH_LEGACY_ALIASES = {
    notification: 'notifications',
    'notification-center': 'notifications',
    meeting: 'meetings',
    chat: 'meetings',
    chatroom: 'meetings',
    post: 'feed',
    profile: 'my',
    settings: 'my',
    search: 'explore',
    course: 'explore',
  };

  // 승격은 「내가 그 방의 참가자가 됐다」는 뜻이고 공지는 방 안에 있다 — 둘 다 채팅방이다.
  const PUSH_CHAT_ROOM_TYPES = [
    'CHAT_MESSAGE_RECEIVED',
    'CHAT_ROOM_CREATED',
    'CHAT_ROOM_WAITLIST_PROMOTED',
    'CHAT_ROOM_NOTICE_POSTED',
  ];

  // 확정·불발·신청 결과·마감은 일정이 걸린 일이라 모집 상세다.
  const PUSH_TRIP_DETAIL_TYPES = [
    'CHAT_ROOM_CONFIRMED',
    'CHAT_ROOM_CANCELLED',
    'CHAT_ROOM_APPLICATION_APPROVED',
    'CHAT_ROOM_APPLICATION_REJECTED',
    'RECRUITMENT_DEADLINE',
    'MEETING_INFO_UPDATED',
    'TRAVEL_COURSE_UPDATED',
  ];

  function pushTarget(data = {}) {
    const legacy = String(data.screen || data.route || data.destination || '').toLowerCase();
    if (legacy) return { screen: PUSH_LEGACY_ALIASES[legacy] || legacy };

    const type = String(data.notificationType || data.type || '');
    const roomId = data.chatRoomId == null ? '' : String(data.chatRoomId);
    if (PUSH_CHAT_ROOM_TYPES.includes(type)) {
      return roomId ? { screen: 'chat', roomId } : { screen: 'meetings' };
    }
    if (PUSH_TRIP_DETAIL_TYPES.includes(type)) {
      return roomId ? { screen: 'detail', roomId } : { screen: 'meetings' };
    }
    if (type === 'FRIEND_REQUEST' || type === 'FRIEND_ACCEPTED') return { screen: 'friends' };
    // 강퇴 사유·피드 좋아요·안내는 알림 목록에서 그 줄을 눌러야 제 곳으로 간다.
    if (type === 'CHAT_ROOM_KICKED' || type === 'FEED_LIKE' || type === 'MARKETING') {
      return { screen: 'notifications' };
    }
    // 모르는 유형이라도 **알림 목록**까지는 데려간다. 홈으로 되돌리면 왜 열렸는지 알 길이 없다.
    return roomId ? { screen: 'detail', roomId } : { screen: 'notifications' };
  }

  function destination(data = {}) {
    return pushTarget(data).screen || 'home';
  }

  global.MoyeoPush = {
    STATUS,
    capability,
    currentToken,
    destination,
    pushTarget,
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
