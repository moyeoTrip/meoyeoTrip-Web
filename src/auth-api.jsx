// Firebase identity + MoyeoTrip service session client.
(function () {
  const DEFAULT_BASE_URL = 'https://moyeo-trip-api.jayden-bin.cc';
  const SESSION_KEY = 'moyeo.auth.session';
  const CONTEXT_KEY = 'moyeo.auth.signup-context';
  const REDIRECT_KEY = 'moyeo.auth.pending-redirect';

  function localStore() {
    return window.localStorage || window.sessionStorage;
  }

  function sessionStore() {
    return window.sessionStorage || window.localStorage;
  }

  function readJson(store, key) {
    try {
      return JSON.parse(store.getItem(key) || 'null');
    } catch (_) {
      store.removeItem(key);
      return null;
    }
  }

  function queryFlag(name) {
    try {
      return new URLSearchParams(window.location.search).get(name) === '1';
    } catch (_) {
      return false;
    }
  }

  function getConfig() {
    const runtime = window.MOYEO_RUNTIME_CONFIG || {};
    const mockAll = queryFlag('mockAuth');
    return {
      baseUrl: String(window.MOYEO_API_BASE_URL || runtime.apiBaseUrl || DEFAULT_BASE_URL).replace(/\/$/, ''),
      firebase: window.MOYEO_FIREBASE_CONFIG || runtime.firebase || null,
      kakaoJavaScriptKey: window.MOYEO_KAKAO_JAVASCRIPT_KEY || runtime.kakaoJavaScriptKey || '',
      kakaoRedirectUri: window.MOYEO_KAKAO_REDIRECT_URI || runtime.kakaoRedirectUri || '',
      mockIdentity: mockAll || window.MOYEO_MOCK_IDENTITY === true,
      mockBackend: mockAll || window.MOYEO_MOCK_AUTH_BACKEND === true,
    };
  }

  function readSession() {
    return readJson(localStore(), SESSION_KEY);
  }

  function saveSession(tokens) {
    const session = { ...(readSession() || {}), ...tokens };
    localStore().setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function clearServiceSession() {
    localStore().removeItem(SESSION_KEY);
  }

  function readContext() {
    return window.__moyeoAuthContext || readJson(sessionStore(), CONTEXT_KEY);
  }

  function saveContext(context) {
    window.__moyeoAuthContext = context;
    sessionStore().setItem(CONTEXT_KEY, JSON.stringify(context));
    return context;
  }

  function clearContext() {
    delete window.__moyeoAuthContext;
    sessionStore().removeItem(CONTEXT_KEY);
  }

  class AuthApiError extends Error {
    constructor(message, status = 0, code = '') {
      super(message);
      this.name = 'AuthApiError';
      this.status = status;
      this.code = code;
    }
  }

  function friendlyIdentityError(error) {
    if (error instanceof AuthApiError) return error;
    const code = String(error?.code || '');
    const messages = {
      'auth/popup-closed-by-user': '로그인 창이 닫혔어요. 다시 시도해주세요.',
      'auth/cancelled-popup-request': '진행 중인 로그인 창을 확인해주세요.',
      'auth/account-exists-with-different-credential': '이미 다른 로그인 방식으로 가입된 이메일이에요.',
      'auth/email-already-in-use': '이미 가입된 이메일이에요. 로그인 탭을 이용해주세요.',
      'auth/invalid-credential': '이메일 또는 비밀번호를 확인해주세요.',
      'auth/invalid-login-credentials': '이메일 또는 비밀번호를 확인해주세요.',
      'auth/weak-password': '비밀번호를 6자 이상 입력해주세요.',
      'auth/unauthorized-domain': '현재 웹 주소가 Firebase 승인 도메인에 등록되지 않았어요.',
      'auth/network-request-failed': '네트워크 연결을 확인한 뒤 다시 시도해주세요.',
      'auth/operation-not-allowed': 'Firebase Console에서 이 로그인 방식을 먼저 활성화해주세요.',
    };
    return new AuthApiError(messages[code] || error?.message || '로그인을 완료하지 못했어요.', 0, code);
  }

  async function parseResponse(response) {
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new AuthApiError(
        payload.errorMessage || payload.message || '요청을 처리하지 못했어요. 잠시 후 다시 시도해주세요.',
        response.status,
        payload.code || payload.errorCode || ''
      );
    }
    return payload;
  }

  async function rawRequest(path, { method = 'GET', body, accessToken, timeoutMs } = {}) {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const controller = timeoutMs && window.AbortController ? new window.AbortController() : null;
    const timeout = controller ? window.setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      const response = await fetch(`${getConfig().baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller?.signal,
      });
      return await parseResponse(response);
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new AuthApiError('요청이 계속 처리 중이에요. 잠시 뒤 다시 확인해주세요.', 0, 'REQUEST_TIMEOUT');
      }
      throw error;
    } finally {
      if (timeout) window.clearTimeout(timeout);
    }
  }

  let refreshPromise = null;
  async function refreshSession() {
    const refreshToken = readSession()?.refreshToken;
    if (!refreshToken) throw new AuthApiError('로그인이 필요해요.', 401, 'SESSION_REQUIRED');
    if (!refreshPromise) {
      refreshPromise = rawRequest('/api/v1/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
      }).then(saveSession).catch((error) => {
        clearServiceSession();
        throw error;
      }).finally(() => {
        refreshPromise = null;
      });
    }
    return refreshPromise;
  }

  async function request(path, options = {}) {
    const { authenticated = false, retry = true, ...rest } = options;
    const session = readSession();
    try {
      return await rawRequest(path, {
        ...rest,
        accessToken: authenticated ? session?.accessToken : undefined,
      });
    } catch (error) {
      if (!authenticated || !retry || error?.status !== 401 || !session?.refreshToken) throw error;
      const refreshed = await refreshSession();
      return rawRequest(path, { ...rest, accessToken: refreshed.accessToken });
    }
  }

  const mockState = { nextProfileId: 1, profileCandidates: [] };
  const mockBackend = {
    async login(provider) {
      await new Promise((resolve) => window.setTimeout(resolve, 120));
      const authUser = new URLSearchParams(window.location.search).get('authUser');
      if (authUser === 'profile') {
        return { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', isNewUser: false, signupState: 'PROFILE_IMAGE_REQUIRED', providerType: provider.toUpperCase() };
      }
      if (authUser === 'existing') {
        return { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', isNewUser: false, signupState: 'SIGNUP_COMPLETE', providerType: provider.toUpperCase() };
      }
      return { accessToken: null, refreshToken: null, isNewUser: true, signupState: 'USER_INFO_REQUIRED', providerType: provider.toUpperCase() };
    },
    async signup() {
      return { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', signupState: 'PROFILE_IMAGE_REQUIRED' };
    },
    async generateProfileImage() {
      if (mockState.profileCandidates.length >= 3) throw new AuthApiError('프로필 이미지는 최대 3번까지 만들 수 있어요.', 409, 'PROFILE_IMAGE_GENERATION_LIMIT');
      const id = mockState.nextProfileId++;
      const kinds = ['deer', 'bear', 'rabbit'];
      const candidate = { profileImageId: id, profileImageUrl: '', selected: false, mockKind: kinds[(id - 1) % kinds.length] };
      mockState.profileCandidates.push(candidate);
      return { candidate, generationCount: mockState.profileCandidates.length, remainingGenerationCount: 3 - mockState.profileCandidates.length, signupState: 'PROFILE_IMAGE_REQUIRED' };
    },
    async getProfileImages() {
      return { candidates: [...mockState.profileCandidates], generationCount: mockState.profileCandidates.length, remainingGenerationCount: 3 - mockState.profileCandidates.length, signupState: 'PROFILE_IMAGE_REQUIRED' };
    },
    async selectProfileImage(profileImageId) {
      const selectedImage = mockState.profileCandidates.find((item) => item.profileImageId === profileImageId);
      return { selectedImage: { ...selectedImage, selected: true }, signupState: 'SIGNUP_COMPLETE' };
    },
  };

  function firebaseAuth() {
    const config = getConfig().firebase;
    if (!window.firebase) {
      throw new AuthApiError('Firebase 인증 SDK를 불러오지 못했어요. 네트워크 연결이나 콘텐츠 차단 설정을 확인해 주세요.', 0, 'FIREBASE_SDK_NOT_LOADED');
    }
    if (!config?.apiKey || !config?.appId) {
      throw new AuthApiError('Firebase Web 앱 설정이 필요해요.', 0, 'FIREBASE_NOT_CONFIGURED');
    }
    if (!window.firebase.apps.length) window.firebase.initializeApp(config);
    return window.firebase.auth();
  }

  function providerObject(provider) {
    if (provider === 'google') return new window.firebase.auth.GoogleAuthProvider();
    if (provider === 'apple') {
      const apple = new window.firebase.auth.OAuthProvider('apple.com');
      apple.addScope('email');
      apple.addScope('name');
      return apple;
    }
    throw new AuthApiError('지원하지 않는 로그인 방식이에요.', 0, 'UNSUPPORTED_PROVIDER');
  }

  function shouldRedirect() {
    return window.matchMedia?.('(max-width: 700px), (pointer: coarse)').matches === true;
  }

  function currentCallbackUri() {
    return `${window.location.origin || ''}${window.location.pathname || '/'}`;
  }

  function kakaoRedirectUri() {
    return getConfig().kakaoRedirectUri || currentCallbackUri();
  }

  function randomState() {
    if (window.crypto?.getRandomValues) {
      const bytes = new Uint8Array(16);
      window.crypto.getRandomValues(bytes);
      return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function savePendingRedirect(provider, extra = {}) {
    const pending = { provider, createdAt: Date.now(), ...extra };
    sessionStore().setItem(REDIRECT_KEY, JSON.stringify(pending));
    return pending;
  }

  function takePendingRedirect() {
    const pending = readJson(sessionStore(), REDIRECT_KEY);
    sessionStore().removeItem(REDIRECT_KEY);
    return pending;
  }

  function cleanCallbackUrl() {
    if (!window.history?.replaceState || !window.location?.href) return;
    const url = new URL(window.location.href);
    ['code', 'state', 'error', 'error_description'].forEach((key) => url.searchParams.delete(key));
    const title = typeof document === 'undefined' ? '' : document.title;
    window.history.replaceState({}, title, `${url.pathname}${url.search}${url.hash}`);
  }

  async function kakaoFirebaseIdTokenFromCode(code, redirectUri) {
    const { customToken } = await rawRequest('/api/v1/auth/firebase/kakao/authorization-code/custom-token', {
      method: 'POST', body: { code, redirectUri },
    });
    const credential = await firebaseAuth().signInWithCustomToken(customToken);
    return credential.user.getIdToken(true);
  }

  let identityProvider = {
    async getFirebaseIdToken(provider, options = {}) {
      if (getConfig().mockIdentity) {
        await new Promise((resolve) => window.setTimeout(resolve, 80));
        return { idToken: `mock-firebase-id-token-${provider}` };
      }
      try {
        const auth = firebaseAuth();
        if (provider === 'email') {
          const { email, password, mode = 'login' } = options;
          if (!email || !password) throw new AuthApiError('이메일과 비밀번호를 입력해주세요.', 0, 'EMAIL_CREDENTIALS_REQUIRED');
          const credential = mode === 'signup'
            ? await auth.createUserWithEmailAndPassword(email, password)
            : await auth.signInWithEmailAndPassword(email, password);
          return { idToken: await credential.user.getIdToken(true) };
        }
        if (provider === 'kakao') {
          const key = getConfig().kakaoJavaScriptKey;
          if (!window.Kakao || !key) throw new AuthApiError('카카오 JavaScript 키 설정이 필요해요.', 0, 'KAKAO_NOT_CONFIGURED');
          if (!window.Kakao.isInitialized()) window.Kakao.init(key);
          const state = randomState();
          savePendingRedirect('kakao', { state, redirectUri: kakaoRedirectUri(), intent: options.intent || 'login' });
          window.Kakao.Auth.authorize({ redirectUri: kakaoRedirectUri(), state });
          return { redirecting: true };
        }
        const firebaseProvider = providerObject(provider);
        if (shouldRedirect() && options.forcePopup !== true) {
          savePendingRedirect(provider, { intent: options.intent || 'login' });
          await auth.signInWithRedirect(firebaseProvider);
          return { redirecting: true };
        }
        const credential = await auth.signInWithPopup(firebaseProvider);
        return { idToken: await credential.user.getIdToken(true) };
      } catch (error) {
        throw friendlyIdentityError(error);
      }
    },
    async sendPasswordResetEmail(email) {
      if (getConfig().mockIdentity) return;
      try {
        await firebaseAuth().sendPasswordResetEmail(email);
      } catch (error) {
        throw friendlyIdentityError(error);
      }
    },
  };

  async function loginWithIdToken(provider, idToken) {
    const fcmToken = await window.MoyeoPush?.currentToken?.().catch(() => null);
    const loginBody = { idToken };
    if (fcmToken) loginBody.fcmToken = fcmToken;
    const login = getConfig().mockBackend
      ? await mockBackend.login(provider)
      : await rawRequest('/api/v1/auth/login', { method: 'POST', body: loginBody });
    if (login.accessToken && login.refreshToken) saveSession(login);
    else clearServiceSession();
    return saveContext({ provider: String(login.providerType || provider).toLowerCase(), idToken, login });
  }

  async function linkWithIdToken(idToken) {
    return request('/api/v1/auth/providers', {
      method: 'POST', authenticated: true, body: { idToken },
    });
  }

  async function recoverRedirect() {
    const params = new URLSearchParams(window.location.search || '');
    const callbackCode = params.get('code');
    const callbackError = params.get('error');
    const pending = readJson(sessionStore(), REDIRECT_KEY);

    if (callbackError) {
      takePendingRedirect();
      cleanCallbackUrl();
      throw new AuthApiError(params.get('error_description') || '카카오 로그인이 취소됐어요.', 0, callbackError);
    }

    if (callbackCode && pending?.provider === 'kakao') {
      takePendingRedirect();
      if (pending.state && params.get('state') !== pending.state) {
        cleanCallbackUrl();
        throw new AuthApiError('로그인 요청을 확인하지 못했어요. 다시 시도해주세요.', 0, 'INVALID_OAUTH_STATE');
      }
      try {
        const idToken = await kakaoFirebaseIdTokenFromCode(callbackCode, pending.redirectUri || kakaoRedirectUri());
        if (pending.intent === 'link') return { linkedProviders: await linkWithIdToken(idToken), linked: true };
        return await loginWithIdToken('kakao', idToken);
      } finally {
        cleanCallbackUrl();
      }
    }

    if (!getConfig().mockIdentity && getConfig().firebase) {
      try {
        const credential = await firebaseAuth().getRedirectResult();
        if (credential?.user) {
          const completedPending = takePendingRedirect();
          const idToken = await credential.user.getIdToken(true);
          if (completedPending?.intent === 'link') return { linkedProviders: await linkWithIdToken(idToken), linked: true };
          return loginWithIdToken(completedPending?.provider || 'firebase', idToken);
        }
      } catch (error) {
        takePendingRedirect();
        throw friendlyIdentityError(error);
      }
    }
    return null;
  }

  function routeForSignupState(signupState) {
    if (signupState === 'SIGNUP_COMPLETE') return 'home';
    if (signupState === 'PROFILE_IMAGE_REQUIRED') return 'prof-2';
    return 'prof-1';
  }

  const api = {
    setIdentityProvider(provider) { identityProvider = provider; },
    getConfig,
    getSession: readSession,
    clearSession: clearServiceSession,
    routeForSignupState,
    async begin(provider, options = {}) {
      const result = await identityProvider.getFirebaseIdToken(provider, options);
      if (typeof result === 'string') return loginWithIdToken(provider, result);
      if (result?.redirecting) return { redirecting: true, provider };
      return loginWithIdToken(provider, result?.idToken);
    },
    async restoreAuthState() {
      const redirected = await recoverRedirect();
      if (redirected?.linked) return { route: 'auth-methods', linkedProviders: redirected.linkedProviders };
      if (redirected) return { route: routeForSignupState(redirected.login.signupState), context: redirected };

      const session = readSession();
      if (session?.refreshToken) {
        try {
          const refreshed = getConfig().mockBackend ? session : await refreshSession();
          return { route: routeForSignupState(refreshed.signupState), session: refreshed };
        } catch (_) {
          clearServiceSession();
        }
      }

      if (!getConfig().mockIdentity && getConfig().firebase) {
        const auth = firebaseAuth();
        await new Promise((resolve) => {
          let unsubscribe = () => {};
          unsubscribe = auth.onAuthStateChanged(
            () => { unsubscribe(); resolve(); },
            () => { unsubscribe(); resolve(); }
          );
        });
        if (auth.currentUser) {
          const providerId = auth.currentUser.providerData?.[0]?.providerId || 'firebase';
          const provider = providerId.replace('.com', '');
          const context = await loginWithIdToken(provider, await auth.currentUser.getIdToken(true));
          return { route: routeForSignupState(context.login.signupState), context };
        }
      }
      return { route: 'onboarding' };
    },
    async resetEmailPassword(email) {
      if (!email) throw new AuthApiError('이메일을 입력해주세요.', 0, 'EMAIL_REQUIRED');
      return identityProvider.sendPasswordResetEmail(email);
    },
    async signup({ nickname, nicknameSelectionToken, gender, birthDate, fcmToken }) {
      let context = readContext();
      if (!context?.idToken && !getConfig().mockIdentity && getConfig().firebase) {
        const user = firebaseAuth().currentUser;
        if (user) context = { ...(context || {}), idToken: await user.getIdToken(true) };
      } else if (context?.idToken && !getConfig().mockIdentity && getConfig().firebase?.apiKey) {
        const user = firebaseAuth().currentUser;
        if (user) context.idToken = await user.getIdToken(true);
      }
      if (!context?.idToken) throw new AuthApiError('로그인을 다시 시작해주세요.', 0, 'AUTH_CONTEXT_MISSING');
      const currentFcmToken = fcmToken || await window.MoyeoPush?.currentToken?.().catch(() => null);
      const body = { idToken: context.idToken, nicknameSelectionToken, nickname, gender, birthDate };
      if (currentFcmToken) body.fcmToken = currentFcmToken;
      const tokens = getConfig().mockBackend
        ? await mockBackend.signup(body)
        : await rawRequest('/api/v1/auth/signup', { method: 'POST', body });
      saveSession(tokens);
      saveContext({ ...context, login: { ...(context.login || {}), ...tokens, isNewUser: false } });
      return tokens;
    },
    async generateProfileImage() {
      return getConfig().mockBackend ? mockBackend.generateProfileImage() : request('/api/v1/users/me/profile-images', { method: 'POST', authenticated: true, timeoutMs: 180000 });
    },
    async getProfileImages() {
      return getConfig().mockBackend ? mockBackend.getProfileImages() : request('/api/v1/users/me/profile-images', { authenticated: true });
    },
    async selectProfileImage(profileImageId) {
      const result = getConfig().mockBackend
        ? await mockBackend.selectProfileImage(profileImageId)
        : await request('/api/v1/users/me/profile-image', { method: 'PUT', authenticated: true, body: { profileImageId } });
      saveSession({ signupState: result.signupState });
      if (result.signupState === 'SIGNUP_COMPLETE') clearContext();
      return result;
    },
    async getLinkedProviders() {
      return getConfig().mockBackend ? { providers: ['KAKAO'] } : request('/api/v1/auth/providers', { authenticated: true });
    },
    async linkProvider(provider, options = {}) {
      const result = await identityProvider.getFirebaseIdToken(provider, { ...options, intent: 'link' });
      if (result?.redirecting) return result;
      const idToken = typeof result === 'string' ? result : result?.idToken;
      return linkWithIdToken(idToken);
    },
    async withdraw() {
      const result = getConfig().mockBackend ? {} : await request('/api/v1/users/me', { method: 'DELETE', authenticated: true });
      await api.signOut();
      return result;
    },
    async signOut() {
      clearContext();
      clearServiceSession();
      sessionStore().removeItem(REDIRECT_KEY);
      if (!getConfig().mockIdentity && getConfig().firebase && window.firebase) await firebaseAuth().signOut();
    },
  };

  window.MoyeoAuth = api;
  window.MoyeoAuthApiError = AuthApiError;
})();
