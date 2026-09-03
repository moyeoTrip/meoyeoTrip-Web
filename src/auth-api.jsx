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
    return {
      baseUrl: String(window.MOYEO_API_BASE_URL || runtime.apiBaseUrl || DEFAULT_BASE_URL).replace(/\/$/, ''),
      firebase: window.MOYEO_FIREBASE_CONFIG || runtime.firebase || null,
      kakaoJavaScriptKey: window.MOYEO_KAKAO_JAVASCRIPT_KEY || runtime.kakaoJavaScriptKey || '',
      kakaoRedirectUri: window.MOYEO_KAKAO_REDIRECT_URI || runtime.kakaoRedirectUri || '',
      pushTokenRegistrationPath: runtime.pushTokenRegistrationPath || '',
      // ?mockAuth=1 로 URL 에서 가짜 백엔드를 켜던 경로는 없앴다 — 캡처가 실제 앱이 아닌
      // 프로토타입을 찍고 있었다. 오프라인 개발용 스위치(window.*)만 남긴다.
      mockIdentity: window.MOYEO_MOCK_IDENTITY === true,
      mockBackend: window.MOYEO_MOCK_AUTH_BACKEND === true,
    };
  }

  // ── 라이브 캡처 세션 (?liveData=1 + src/capture-session.local.js) ──
  // 캡처 도구가 gitignore 파일 src/capture-session.local.js 에 토큰을 써 두고,
  // ?liveData=1 일 때만 그 토큰으로 세션을 세운다. 라이브 캡처는 "라우팅은 캡처처럼,
  // 데이터 차단만 해제" 구조라 캡처 라우트(?screen=)를 그대로 쓰면서 실서버를 타야 한다.
  //
  // 지키는 규칙:
  //  · 토큰을 URL 에 넣지 않는다 (쿼리스트링은 로그·리퍼러·캡처 파일명에 남는다).
  //  · localStorage 에도 쓰지 않는다 — 이 세션은 메모리 전용이라 브라우저 프로필에 남지 않는다.
  //  · 파일이 없거나 accessToken 이 비면 null 이라 미로그인 빈 상태가 그대로 유지된다.
  //  · refreshToken 은 일부러 받지 않는다. 401 이면 조용히 실패해야 하고,
  //    refresh 응답을 saveSession 이 localStorage 에 쓰는 경로를 아예 막는다.
  // 주입 토큰이 유효한 라이브 캡처 실행인지. 한 번 켜지면 이 문서 안에서는 계속 메모리 세션만 쓴다.
  function captureSessionActive() {
    if (!queryFlag('liveData')) return false;
    return Boolean(captureSessionToken());
  }

  function captureSessionToken() {
    const injected = window.MOYEO_CAPTURE_SESSION;
    const accessToken = typeof injected?.accessToken === 'string' ? injected.accessToken.trim() : '';
    return accessToken || '';
  }

  let memorySession;
  function captureSession() {
    if (!captureSessionActive()) return null;
    if (memorySession === undefined) {
      memorySession = { accessToken: captureSessionToken(), signupState: window.MOYEO_CAPTURE_SESSION.signupState || 'SIGNUP_COMPLETE' };
    }
    return memorySession;
  }

  function readSession() {
    if (captureSessionActive()) return memorySession === null ? null : captureSession();
    return readJson(localStore(), SESSION_KEY);
  }

  function saveSession(tokens) {
    const session = { ...(readSession() || {}), ...tokens };
    // 라이브 캡처 세션은 메모리에만 둔다 — 주입 토큰이 브라우저 프로필로 새지 않게 한다.
    if (captureSessionActive()) {
      memorySession = session;
      return session;
    }
    localStore().setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function clearServiceSession() {
    if (captureSessionActive()) {
      memorySession = null;
      return;
    }
    localStore().removeItem(SESSION_KEY);
  }

  // ── 내 신원은 토큰에서 즉시 읽는다 (TAB-STATE-CANON R6) ──
  // 채팅 정렬처럼 첫 프레임부터 맞아야 하는 값에 비동기 응답(GET members 의 me 플래그)을
  // 물리면, 응답이 오기 전까지 내가 보낸 메시지가 남의 것처럼 왼쪽에 그려졌다가 튄다.
  // 액세스 토큰 페이로드에 userId 가 이미 들어 있으므로 네트워크 없이 동기로 읽는다.
  function decodeJwtPayload(token) {
    const encoded = String(token || '').split('.')[1];
    if (!encoded || typeof window.atob !== 'function') return null;
    try {
      const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
      const binary = window.atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
      let text = binary;
      try {
        // atob 는 바이트 문자열을 준다 — 한글이 섞인 클레임이 깨지지 않게 UTF-8 로 되돌린다.
        text = decodeURIComponent(Array.prototype.map.call(
          binary,
          (character) => `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`,
        ).join(''));
      } catch (_) { /* ASCII 뿐이면 바이트 문자열이 곧 원문이다 */ }
      return JSON.parse(text);
    } catch (_) {
      // 토큰이 JWT 가 아니거나(목 토큰) 손상됐으면 신원을 모르는 것으로 둔다.
      return null;
    }
  }

  function currentUserId() {
    const raw = decodeJwtPayload(readSession()?.accessToken)?.userId;
    if (raw === null || raw === undefined || raw === '') return null;
    // 서버는 userId 를 문자열로 싣는데 다른 응답의 senderId·userId 는 숫자다.
    // 비교하는 쪽마다 형이 갈리면 정렬이 조용히 빗나가므로 문자열로 통일한다.
    return String(raw);
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
      // 서버 오류 코드는 숫자(40918)로도 문자열("40918")로도 온다.
      // 비교하는 쪽마다 형이 갈리면 게이트 판정이 조용히 빗나가므로 문자열로 통일한다.
      this.code = code === null || code === undefined ? '' : String(code);
    }
  }

  // ── 가입 게이트 (409) ──
  // 서버는 인증이 필요한 일반 API 마다 "가입 단계"와 "실제 프로필 이미지 보유"를 함께 본다.
  // 이 코드들은 **토큰 문제가 아니다** — 401 재발급 경로로 새면 원인이 그대로인 채
  // 재발급 → 재요청 → 409 를 무한히 돈다. 그래서 재발급 판정보다 먼저 걸러 가입 단계로 돌려보낸다.
  const SIGNUP_GATE_STATES = {
    40902: 'USER_INFO_REQUIRED',    // 닉네임·성별·생년월일 입력 전
    40918: 'PROFILE_IMAGE_REQUIRED', // 프로필 이미지 선택 전
  };
  // 프로필 이미지 3종(POST/GET /profile-images, PUT /profile-image)에서만 나온다.
  // "이미 끝났다"는 뜻이라 사용자에게는 오류가 아니다.
  const PROFILE_IMAGE_ALREADY_SET = '40919';

  function signupGateState(error) {
    if (error?.status !== 409) return '';
    // hasOwnProperty 로 본다 — 서버 코드가 'constructor' 같은 값이어도 프로토타입 체인이 잡히지 않게.
    return Object.prototype.hasOwnProperty.call(SIGNUP_GATE_STATES, error.code) ? SIGNUP_GATE_STATES[error.code] : '';
  }

  // 라우터가 React 컨텍스트라 API 계층에서 직접 화면을 바꿀 수 없다.
  // 푸시(moyeo:push-message)와 같은 관례로 이벤트를 쏘고 prototype.jsx 의 라우터가 받아 이동한다.
  function announceSignupGate(signupState) {
    saveSession({ signupState });
    // 이벤트 지원이 없는 실행 환경(테스트 vm 등)에서도 세션 갱신까지는 그대로 남아야 한다.
    if (typeof window.CustomEvent !== 'function' || typeof window.dispatchEvent !== 'function') return;
    window.dispatchEvent(new window.CustomEvent('moyeo:signup-gate', {
      detail: { signupState, route: routeForSignupState(signupState) },
    }));
  }

  // R6: 공백만 있는 FCM 토큰은 400 `40016 FCM_TOKEN_BLANK` 라 가입·로그인 자체가 막힌다.
  // 값이 없으면 필드를 아예 싣지 않는다(생략 = null 과 같게 처리된다).
  // 같은 토큰을 다른 계정이 갖고 있어도 서버가 이관하므로 클라가 삭제 후 재시도할 필요는 없다.
  function normalizeFcmToken(token) {
    return typeof token === 'string' ? token.trim() : '';
  }

  // ── 사용자가 스스로 그만둔 것은 실패가 아니다 (AUTH-SILENT-CASES-CANON R1) ──
  // SDK 오류를 그대로 흘려보내면 화면이 실패로 그린다. 취소를 별도 결과로 갈라내
  // 호출부가 "조용히 아무 일도 하지 않음"을 고를 수 있게 한다.
  const IDENTITY_CANCELLED_CODES = new Set([
    'auth/popup-closed-by-user',    // 로그인 팝업을 사용자가 닫았다
    'auth/cancelled-popup-request', // 새 팝업을 여느라 앞 요청이 취소됐다
    'auth/user-cancelled',          // 제공자 동의 화면에서 사용자가 거부했다
    'access_denied',                // 카카오 인가 콜백의 취소 신호
  ]);

  function isCancelledIdentity(error) {
    return IDENTITY_CANCELLED_CODES.has(String(error?.code || ''));
  }

  // 취소를 "아무 일도 없었음"으로 접는다. 원인 코드는 개발자에게만 로그로 남기고
  // 화면에는 아무것도 띄우지 않는다 (R1 · R2).
  function foldCancelled(error, where) {
    if (!isCancelledIdentity(error)) return null;
    window.console?.debug?.('[moyeo] 로그인 취소', where, error?.code);
    return { cancelled: true };
  }

  function friendlyIdentityError(error) {
    if (error instanceof AuthApiError) return error;
    const code = String(error?.code || '');
    const messages = {
      // 취소 코드는 여기 없다 — 문구를 만들지 않고 조용히 넘긴다.
      'auth/account-exists-with-different-credential': '이미 다른 로그인 방식으로 가입된 이메일이에요.',
      // 로그인 탭이 따로 없다 — 한 번에 로그인/가입을 시도한다.
      'auth/email-already-in-use': '이미 가입된 이메일이에요. 비밀번호를 확인해주세요.',
      // Email Enumeration Protection 때문에 계정 없음과 비밀번호 오류가 같은 코드로 온다.
      // 가입 시도까지 해 본 뒤에도 이 코드가 남았다면 계정은 있고 비밀번호가 틀린 것이다.
      'auth/invalid-credential': '비밀번호가 올바르지 않아요. 비밀번호 재설정을 이용해주세요.',
      'auth/invalid-login-credentials': '비밀번호가 올바르지 않아요. 비밀번호 재설정을 이용해주세요.',
      'auth/user-not-found': '비밀번호가 올바르지 않아요. 비밀번호 재설정을 이용해주세요.',
      'auth/wrong-password': '비밀번호가 올바르지 않아요. 비밀번호 재설정을 이용해주세요.',
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
    // multipart 요청(17 모집 만들기의 POST /chat-rooms)은 FormData 를 그대로 보낸다 —
    // Content-Type 을 직접 넣으면 boundary 가 빠져 서버가 파트를 읽지 못한다.
    const multipart = typeof window.FormData === 'function' && body instanceof window.FormData;
    const headers = { Accept: 'application/json' };
    if (body !== undefined && !multipart) headers['Content-Type'] = 'application/json';
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const controller = timeoutMs && window.AbortController ? new window.AbortController() : null;
    const timeout = controller ? window.setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      const response = await fetch(`${getConfig().baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : (multipart ? body : JSON.stringify(body)),
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

  // ── 세션 만료는 오류가 아니다 (AUTH-SILENT-CASES-CANON R3 · R4) ──
  // 리프레시 실패 응답은 `400 40001 "유효하지 않은 RefreshToken 입니다."` 다.
  // 그 서버 원문을 그대로 흘려보내면 로그인 화면 하단 배너에 개발자 언어가 그대로 뜬다.
  // 원문은 로그로 남기고, 밖으로는 클라이언트가 정한 값 하나만 내보낸다.
  function sessionExpiredError(cause) {
    if (cause) window.console?.debug?.('[moyeo] 세션 재발급 실패', cause.status, cause.code, cause.message);
    const expired = new AuthApiError('로그인이 필요해요.', 401, 'SESSION_EXPIRED');
    // 호출부가 "조용히 로그인 화면으로" 를 고를 수 있게 실패와 갈라둔다.
    expired.sessionExpired = true;
    return expired;
  }

  // 토큰이 죽은 것(4xx)과 서버·네트워크가 죽은 것(5xx·연결 실패)은 다르다.
  // 후자는 §3 대로 계속 오류로 보여줘야 하고, 세션을 지워서도 안 된다 —
  // 잠깐의 연결 문제로 로그아웃되면 사용자가 잃는 게 더 크다.
  function isRejectedRefresh(error) {
    return error instanceof AuthApiError && error.status >= 400 && error.status < 500;
  }

  let refreshPromise = null;
  async function refreshSession() {
    const refreshToken = readSession()?.refreshToken;
    if (!refreshToken) throw sessionExpiredError(null);
    if (!refreshPromise) {
      refreshPromise = rawRequest('/api/v1/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
      }).then(saveSession).catch((error) => {
        if (!isRejectedRefresh(error)) throw error;
        clearServiceSession();
        throw sessionExpiredError(error);
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
      // R1: 가입 게이트 판정이 401 판정보다 **먼저** 와야 한다.
      // 순서가 뒤집히면 40902·40918 이 재발급 경로로 새어 무한 재시도가 된다.
      const gateState = signupGateState(error);
      if (gateState) {
        announceSignupGate(gateState);
        throw error;
      }
      if (!authenticated || !retry || error?.status !== 401 || !session?.refreshToken) throw error;
      const refreshed = await refreshSession();
      try {
        return await rawRequest(path, { ...rest, accessToken: refreshed.accessToken });
      } catch (retriedError) {
        // 새 토큰으로도 409 가 오면 토큰이 아니라 가입 단계가 모자란 것이다 — 여기서 멈춘다.
        const retriedGate = signupGateState(retriedError);
        if (retriedGate) announceSignupGate(retriedGate);
        throw retriedError;
      }
    }
  }

  // R2: 프로필 이미지 3종이 주는 40919 는 "이미 프로필 이미지 설정을 완료했습니다" 다.
  // 사용자가 잘못한 게 없으므로 오류를 띄우지 않고, SIGNUP_COMPLETE 를 받은 것처럼 돌려줘
  // 화면이 조용히 다음(홈)으로 넘어가게 한다.
  async function profileImageStep(run) {
    try {
      return await run();
    } catch (error) {
      if (error?.code !== PROFILE_IMAGE_ALREADY_SET) throw error;
      saveSession({ signupState: 'SIGNUP_COMPLETE' });
      clearContext();
      return {
        signupState: 'SIGNUP_COMPLETE',
        alreadyCompleted: true,
        candidates: [],
        remainingGenerationCount: 0,
      };
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

  /// 이메일 로그인 — 사용자가 "로그인 / 새 계정 만들기"를 먼저 고르지 않는다.
  //
  // 한 번 로그인해 보고, 계정이 없으면 그대로 만든다. 소셜 로그인과 같은 흐름이다.
  //
  // 이 프로젝트는 Firebase **Email Enumeration Protection** 이 켜져 있어서 로그인 실패가
  // "계정 없음"인지 "비밀번호 틀림"인지 구분되지 않는다(둘 다 auth/invalid-credential).
  // 그래서 두 번째 호출로 가린다 — 계정 만들기가 EMAIL_EXISTS 로 막히면 비밀번호가 틀린 것이다.
  // (실측 2026-08-29: 없는 이메일 로그인 → INVALID_LOGIN_CREDENTIALS, 있는 이메일 가입 → EMAIL_EXISTS)
  const EMAIL_SIGN_IN_MISS_CODES = new Set([
    'auth/user-not-found',
    'auth/invalid-credential',
    'auth/invalid-login-credentials',
    'auth/wrong-password',
  ]);

  async function signInOrCreateEmailUser(auth, email, password) {
    try {
      return await auth.signInWithEmailAndPassword(email, password);
    } catch (signInError) {
      if (!EMAIL_SIGN_IN_MISS_CODES.has(signInError?.code)) throw signInError;
      try {
        return await auth.createUserWithEmailAndPassword(email, password);
      } catch (createError) {
        // 계정은 있었다 → 처음 실패는 비밀번호가 틀린 것이다.
        if (createError?.code === 'auth/email-already-in-use') throw signInError;
        throw createError;
      }
    }
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
          const { email, password } = options;
          if (!email || !password) throw new AuthApiError('이메일과 비밀번호를 입력해주세요.', 0, 'EMAIL_CREDENTIALS_REQUIRED');
          const credential = await signInOrCreateEmailUser(auth, email, password);
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
        // 취소 코드는 friendlyIdentityError 가 code 를 그대로 보존한다 —
        // 취소/실패 갈래는 호출부(begin · linkProvider) 한 곳에서만 판정한다.
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
    const fcmToken = normalizeFcmToken(await window.MoyeoPush?.currentToken?.().catch(() => null));
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
      // R1: 인가 콜백의 access_denied 는 사용자가 카카오 화면에서 그만둔 것이다.
      // 실패가 아니므로 오류를 던지지 않고 취소 결과로 돌려준다.
      const cancelled = foldCancelled({ code: callbackError }, 'kakao-callback');
      if (cancelled) return cancelled;
      // R4: 제공자가 준 error_description 은 개발자 언어다 — 화면 문구로 쓰지 않는다.
      throw new AuthApiError('로그인을 완료하지 못했어요.', 0, callbackError);
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
        // R1: 리다이렉트로 나갔다가 취소하고 돌아온 경우도 실패가 아니다.
        const cancelled = foldCancelled(error, 'redirect-result');
        if (cancelled) return cancelled;
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
    request,
    getSession: readSession,
    clearSession: clearServiceSession,
    routeForSignupState,
    currentUserId,
    isCancelled: (result) => Boolean(result?.cancelled),
    async begin(provider, options = {}) {
      let result;
      try {
        result = await identityProvider.getFirebaseIdToken(provider, options);
      } catch (error) {
        // R1: 취소를 실패와 갈라내는 유일한 자리. 여기서 접어야 화면이 실패로 그리지 않는다.
        const cancelled = foldCancelled(error, provider);
        if (!cancelled) throw error;
        result = cancelled;
      }
      if (typeof result === 'string') return loginWithIdToken(provider, result);
      if (result?.redirecting) return { redirecting: true, provider };
      // R2: 취소는 로그인 자체를 시작하지 않은 것이다 — 세션도 컨텍스트도 건드리지 않는다.
      if (result?.cancelled) return { cancelled: true, provider };
      return loginWithIdToken(provider, result?.idToken);
    },
    async restoreAuthState() {
      const redirected = await recoverRedirect();
      if (redirected?.linked) return { route: 'auth-methods', linkedProviders: redirected.linkedProviders };
      // R2: 카카오 화면에서 뒤로 갔다 돌아온 것이다. 오류 없이 로그인 화면에 그대로 둔다.
      if (redirected?.cancelled) return { route: 'login', cancelled: true };
      if (redirected) return { route: routeForSignupState(redirected.login.signupState), context: redirected };

      // 만료된 세션으로 돌아온 경우를 기억해 둔다. 다른 신원이 없으면 온보딩이 아니라
      // 로그인 화면으로 보낸다 — 처음 온 사람이 아니라 세션이 끝난 사람이다 (R3).
      let sessionExpired = false;
      const session = readSession();
      if (session?.refreshToken) {
        try {
          const refreshed = getConfig().mockBackend ? session : await refreshSession();
          return { route: routeForSignupState(refreshed.signupState), session: refreshed };
        } catch (error) {
          // 재발급이 거절된 것(만료)과 서버·네트워크가 죽은 것을 갈라 다룬다.
          if (!error?.sessionExpired) throw error;
          sessionExpired = true;
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
      // R3: 로그인 화면으로 보내는 것 자체가 이미 안내다. 오류 배너를 덧붙이지 않는다.
      if (sessionExpired) return { route: 'login', sessionExpired: true };
      return { route: 'onboarding' };
    },
    async resetEmailPassword(email) {
      if (!email) throw new AuthApiError('이메일을 입력해주세요.', 0, 'EMAIL_REQUIRED');
      return identityProvider.sendPasswordResetEmail(email);
    },
    async signup({ nickname, nicknameSelectionToken, gender, birthDate, fcmToken, agreedTermIds = [], travelStyleIds, interestedRegionIds }) {
      let context = readContext();
      if (!context?.idToken && !getConfig().mockIdentity && getConfig().firebase) {
        const user = firebaseAuth().currentUser;
        if (user) context = { ...(context || {}), idToken: await user.getIdToken(true) };
      } else if (context?.idToken && !getConfig().mockIdentity && getConfig().firebase?.apiKey) {
        const user = firebaseAuth().currentUser;
        if (user) context.idToken = await user.getIdToken(true);
      }
      if (!context?.idToken) throw new AuthApiError('로그인을 다시 시작해주세요.', 0, 'AUTH_CONTEXT_MISSING');
      const currentFcmToken = normalizeFcmToken(fcmToken || await window.MoyeoPush?.currentToken?.().catch(() => null));
      // `agreedTermIds` 는 서버 필수 항목이다 — 빠지면 400 40012 로 가입이 막힌다.
      const body = { idToken: context.idToken, nicknameSelectionToken, nickname, gender, birthDate, agreedTermIds };
      // R4: 07 취향 단계에서 고른 **서버 id** 를 여기서 함께 보낸다.
      // 예전에는 고른 값이 어디로도 전송되지 않아 가입과 동시에 조용히 사라졌다.
      // 고르지 않았으면 필드를 아예 넣지 않는다 — 서버는 생략·null·[] 을 모두 "선택 안 함"으로 저장한다.
      // (잘못된 id 는 스타일 40015 · 지역 40014 로 되돌아온다.)
      if (Array.isArray(travelStyleIds) && travelStyleIds.length > 0) body.travelStyleIds = travelStyleIds;
      if (Array.isArray(interestedRegionIds) && interestedRegionIds.length > 0) body.interestedRegionIds = interestedRegionIds;
      if (currentFcmToken) body.fcmToken = currentFcmToken;
      const tokens = getConfig().mockBackend
        ? await mockBackend.signup(body)
        : await rawRequest('/api/v1/auth/signup', { method: 'POST', body });
      saveSession(tokens);
      saveContext({ ...context, login: { ...(context.login || {}), ...tokens, isNewUser: false } });
      return tokens;
    },
    async generateProfileImage() {
      return profileImageStep(() => (getConfig().mockBackend
        ? mockBackend.generateProfileImage()
        : request('/api/v1/users/me/profile-images', { method: 'POST', authenticated: true, timeoutMs: 180000 })));
    },
    async getProfileImages() {
      return profileImageStep(() => (getConfig().mockBackend
        ? mockBackend.getProfileImages()
        : request('/api/v1/users/me/profile-images', { authenticated: true })));
    },
    async selectProfileImage(profileImageId) {
      const result = await profileImageStep(() => (getConfig().mockBackend
        ? mockBackend.selectProfileImage(profileImageId)
        : request('/api/v1/users/me/profile-image', { method: 'PUT', authenticated: true, body: { profileImageId } })));
      saveSession({ signupState: result.signupState });
      if (result.signupState === 'SIGNUP_COMPLETE') clearContext();
      return result;
    },
    async getLinkedProviders() {
      return getConfig().mockBackend ? { providers: ['KAKAO'] } : request('/api/v1/auth/providers', { authenticated: true });
    },
    async linkProvider(provider, options = {}) {
      let result;
      try {
        result = await identityProvider.getFirebaseIdToken(provider, { ...options, intent: 'link' });
      } catch (error) {
        // R2: 연결도 사용자가 그만둘 수 있다. 취소면 목록을 그대로 두고 아무것도 알리지 않는다.
        const cancelled = foldCancelled(error, provider);
        if (!cancelled) throw error;
        result = cancelled;
      }
      if (result?.redirecting) return result;
      if (result?.cancelled) return { cancelled: true };
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
      // TAB-STATE-CANON R4: 탭 보관소를 비운다 — 다른 사용자의 목록·프로필이 남으면 안 된다.
      window.MoyeoTabCache?.clear?.();
      sessionStore().removeItem(REDIRECT_KEY);
      if (!getConfig().mockIdentity && getConfig().firebase && window.firebase) await firebaseAuth().signOut();
    },
  };

  window.MoyeoAuth = api;
  window.MoyeoAuthApiError = AuthApiError;
  if (getConfig().pushTokenRegistrationPath) {
    window.MoyeoPush?.setTokenRegistrar?.((fcmToken) => {
      // R6: 갱신 경로에서도 공백 토큰은 보내지 않는다 — 40016 으로 되돌아온다.
      const token = normalizeFcmToken(fcmToken);
      if (!token) return Promise.resolve(null);
      return request(getConfig().pushTokenRegistrationPath, {
        method: 'POST',
        authenticated: true,
        body: { fcmToken: token },
      });
    });
  }
})();
