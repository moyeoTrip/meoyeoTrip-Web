// 서버가 관여하지 않는 클라이언트 전용 상태 — 최근 검색어(12) · 테마(29) · 앱 버전(29).
// 세 항목 모두 서버 API가 없어 클라이언트가 스스로 들고 있는다.
// plain JS 로 두는 이유: text/babel 스크립트보다 먼저 동기 실행되므로 tokens.jsx 가 첫 페인트 전에
// 테마를 적용할 수 있고, 단위 테스트에서 vm 으로 그대로 실행할 수 있다.
(function bootstrapMoyeoClientPrefs(global) {
  // ───────── 최근 검색어 ─────────
  const RECENT_SEARCHES_KEY = 'moyeo-trip-recent-searches';
  const RECENT_SEARCHES_LIMIT = 10;

  function storage() {
    try {
      return global.localStorage || null;
    } catch (_) {
      return null;
    }
  }

  // 저장된 값이 손상돼 있어도 화면이 죽지 않게 항상 문자열 배열로 정규화한다.
  function normalizeRecentSearches(list) {
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    const result = [];
    list.forEach((item) => {
      if (typeof item !== 'string') return;
      const keyword = item.trim();
      if (!keyword || seen.has(keyword)) return;
      seen.add(keyword);
      result.push(keyword);
    });
    return result.slice(0, RECENT_SEARCHES_LIMIT);
  }

  function readRecentSearches() {
    const store = storage();
    if (!store) return [];
    try {
      return normalizeRecentSearches(JSON.parse(store.getItem(RECENT_SEARCHES_KEY) || '[]'));
    } catch (_) {
      return [];
    }
  }

  function writeRecentSearches(list) {
    const next = normalizeRecentSearches(list);
    const store = storage();
    if (store) {
      try { store.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next)); } catch (_) { /* storage unavailable */ }
    }
    return next;
  }

  // 공백 트림 · 빈 문자열 무시 · 중복은 최신순으로 끌어올림 · 최대 10개(오래된 것부터 버림)
  function addRecentSearch(keyword) {
    const trimmed = typeof keyword === 'string' ? keyword.trim() : '';
    if (!trimmed) return readRecentSearches();
    const rest = readRecentSearches().filter((item) => item !== trimmed);
    return writeRecentSearches([trimmed, ...rest]);
  }

  function removeRecentSearch(keyword) {
    const trimmed = typeof keyword === 'string' ? keyword.trim() : '';
    if (!trimmed) return readRecentSearches();
    return writeRecentSearches(readRecentSearches().filter((item) => item !== trimmed));
  }

  function clearRecentSearches() {
    const store = storage();
    if (store) {
      try { store.removeItem(RECENT_SEARCHES_KEY); } catch (_) { /* storage unavailable */ }
    }
    return [];
  }

  // ───────── 테마 설정 (29 설정 › 화면 › 테마) ─────────
  // 저장값은 3상태다: 'system'(기본) · 'light' · 'dark'.
  // 이전 구현은 최초 로드에서 시스템 값을 light/dark 로 해석해 그대로 저장해버려서
  // 그 뒤로는 OS 변경을 따라가지 못했다. 이제 '적용'(applyMoyeoTheme)과
  // '사용자 설정 저장'(setMoyeoThemeMode)을 분리해 system 상태를 보존한다.
  const THEME_STORAGE_KEY = 'moyeo-trip-theme';
  const THEME_PREFERENCES = ['system', 'light', 'dark'];
  const THEME_PREFERENCE_LABELS = { system: '시스템 기본', light: '라이트', dark: '다크' };

  // 사용자가 명시적으로 고른 값만 저장된다. 예전에 저장된 'light'/'dark' 는
  // 사용자의 선택으로 존중하고, 그 밖의 값(없음·손상)은 'system' 으로 본다.
  function getMoyeoThemePreference() {
    const store = storage();
    if (!store) return 'system';
    try {
      const saved = store.getItem(THEME_STORAGE_KEY);
      return THEME_PREFERENCES.includes(saved) ? saved : 'system';
    } catch (_) {
      return 'system';
    }
  }

  function getMoyeoSystemTheme() {
    return global.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // 3상태 설정 → 실제 적용 테마('light' | 'dark')
  function resolveMoyeoThemeMode(preference) {
    const wanted = THEME_PREFERENCES.includes(preference) ? preference : 'system';
    if (wanted === 'light' || wanted === 'dark') return wanted;
    return getMoyeoSystemTheme();
  }

  // 캡처의 강제 테마(?theme=light|dark). 사용자 설정보다 항상 우선하고 저장하지 않는다.
  function getForcedMoyeoTheme() {
    try {
      const requested = new URLSearchParams(global.location?.search || '').get('theme');
      return requested === 'dark' || requested === 'light' ? requested : null;
    } catch (_) {
      return null;
    }
  }

  // 화면에만 적용한다 (저장하지 않는다).
  function applyMoyeoTheme(resolved) {
    const next = resolved === 'dark' ? 'dark' : 'light';
    const root = global.document?.documentElement;
    if (root) root.dataset.moyeoTheme = next;
    return next;
  }

  function notifyThemeChange(preference, resolved) {
    if (typeof global.CustomEvent !== 'function' || typeof global.dispatchEvent !== 'function') return;
    global.dispatchEvent(new global.CustomEvent('moyeo:theme-mode', { detail: { preference, resolved } }));
  }

  // 사용자 설정 저장 + 즉시 적용. 'system' 도 그대로 저장한다.
  function setMoyeoThemeMode(mode) {
    const preference = THEME_PREFERENCES.includes(mode) ? mode : 'system';
    const store = storage();
    if (store) {
      try { store.setItem(THEME_STORAGE_KEY, preference); } catch (_) { /* storage unavailable */ }
    }
    notifyThemeChange(preference, applyMoyeoTheme(resolveMoyeoThemeMode(preference)));
    return preference;
  }

  // 시스템 기본 → 라이트 → 다크 → 시스템 기본 순환 (기획에 테마 선택 UI가 없어 순환으로 간다)
  function cycleMoyeoThemeMode(current) {
    const from = THEME_PREFERENCES.includes(current) ? current : getMoyeoThemePreference();
    return setMoyeoThemeMode(THEME_PREFERENCES[(THEME_PREFERENCES.indexOf(from) + 1) % THEME_PREFERENCES.length]);
  }

  // 저장된 설정을 적용하고 OS 변경을 즉시 따라간다. 정리 함수를 돌려준다.
  function watchMoyeoThemeMode() {
    applyMoyeoTheme(resolveMoyeoThemeMode(getMoyeoThemePreference()));
    const media = global.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media?.addEventListener) return () => {};
    const onSystemChange = () => {
      const preference = getMoyeoThemePreference();
      if (preference !== 'system') return;
      notifyThemeChange(preference, applyMoyeoTheme(getMoyeoSystemTheme()));
    };
    media.addEventListener('change', onSystemChange);
    return () => media.removeEventListener('change', onSystemChange);
  }

  // 기존 이름 유지 — 지금 적용해야 하는 테마('light' | 'dark')를 돌려준다.
  function getInitialMoyeoThemeMode() {
    return getForcedMoyeoTheme() || resolveMoyeoThemeMode(getMoyeoThemePreference());
  }

  // ───────── 앱 버전 ─────────
  // **단일 출처는 `package.json` 의 `version`** 이다 (tests/run-tests.mjs 가 두 값을 비교한다).
  //
  // 예전에는 여기에 `'0.1.0'` 을 손으로 적어 뒀다. 그래서 package.json 을 올려도 화면은 안 바뀌고,
  // 앱(1.0)과도 어긋난 값이 설정 화면에 찍혔다(2026-08-31 사용자 지적).
  //
  // 이제 배포가 `runtime-config.js` 에 `appVersion` 을 넣어 주면 그 값을 쓴다.
  // 없으면 `scripts/sync-app-version.mjs` 가 package.json 에서 박아 둔 기본값을 쓴다 —
  // 어느 쪽이든 사람이 두 곳을 맞출 필요가 없다.
  const APP_VERSION =
    (global.MOYEO_RUNTIME_CONFIG && global.MOYEO_RUNTIME_CONFIG.appVersion) || '1.0.0';
  // 캡처에서도 실제 배포 버전을 그대로 보여준다 — 화면기획 값(1.0.4)을 덮어씌우면
  // 스크린샷이 있지도 않은 버전을 말하게 된다.
  // 최신 버전을 알려주는 서버 API가 없어 '(최신)' 은 붙이지 않는다.
  function versionLabel() {
    return APP_VERSION;
  }

  function versionDialogBody() {
    return `현재 설치된 버전은 ${APP_VERSION}이에요.`;
  }

  Object.assign(global, {
    MOYEO_THEME_STORAGE_KEY: THEME_STORAGE_KEY,
    MOYEO_THEME_PREFERENCES: THEME_PREFERENCES,
    MOYEO_THEME_PREFERENCE_LABELS: THEME_PREFERENCE_LABELS,
    getMoyeoThemePreference,
    getMoyeoSystemTheme,
    resolveMoyeoThemeMode,
    getForcedMoyeoTheme,
    applyMoyeoTheme,
    setMoyeoThemeMode,
    cycleMoyeoThemeMode,
    watchMoyeoThemeMode,
    getInitialMoyeoThemeMode,
  });

  global.MOYEO_APP_VERSION = APP_VERSION;
  global.MoyeoRecentSearches = {
    KEY: RECENT_SEARCHES_KEY,
    LIMIT: RECENT_SEARCHES_LIMIT,
    normalize: normalizeRecentSearches,
    read: readRecentSearches,
    add: addRecentSearch,
    remove: removeRecentSearch,
    clear: clearRecentSearches,
  };
  global.MoyeoAppVersion = {
    version: APP_VERSION,
    label: versionLabel,
    dialogBody: versionDialogBody,
  };
}(window));
