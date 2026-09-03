// 탭 전환 상태 보관소 (TAB-STATE-CANON R1~R5).
//
// 왜 필요한가: 라우터가 라우트마다 화면 컴포넌트를 통째로 갈아끼우기 때문에 화면 안의
// useState 가 초기화되고 useEffect 가 다시 돈다. 그래서 하단 탭을 오갈 때마다 조회가
// 다시 나가고, 사용자는 `불러오는 중이에요…` 를 다시 보거나 기본 썸네일이 깜빡이는 걸 본다.
//
// 그래서 데이터를 **탭 바깥**(이 모듈 스코프)에 둔다. 화면은 보관소를 읽기만 하고,
// 보관소는 탭 전환보다 오래 산다.
//
// 보관소에는 **서버에서 받은 값만** 담는다 (NO-MOCK-CANON R1). 캐시가 비었을 때
// 지어낸 값을 그리지 않는다 — 그때는 로딩·빈 상태·오류 중 하나다.
(function bootstrapTabCache(global) {
  // 서버 응답 보관소. key → 마지막으로 받은 값.
  const values = new Map();
  // 진행 중인 요청. 같은 키를 두 화면이 동시에 요청해도 한 번만 나간다.
  const pending = new Map();
  // 캐시가 없는 상태로 실패한 기록. 캐시가 있으면 실패를 기록하지 않는다 —
  // 가진 데이터를 오류로 덮지 않기 위해서다 (R2).
  const failures = new Map();
  // 사용자가 고른 값(필터·세그먼트·탭)과 스크롤 위치. 서버 데이터가 아니라 화면 상태다.
  const uiState = new Map();
  const scrollTops = new Map();

  // 보관소 주인. 다른 사용자의 데이터가 남으면 안 된다 (R4).
  // undefined 는 "아직 확인 안 함", null 은 "미로그인" 이라 서로 구분한다.
  let ownerId;

  function currentOwnerId() {
    try {
      return global.MoyeoAuth?.currentUserId?.() ?? null;
    } catch (_) {
      return null;
    }
  }

  function clearAll() {
    values.clear();
    pending.clear();
    failures.clear();
    uiState.clear();
    scrollTops.clear();
  }

  // 로그아웃·계정 전환을 감지해 보관소를 비운다 (R4).
  // signOut() 이 clear() 를 직접 부르지만, 다른 탭에서 세션이 바뀐 경우까지는 잡지 못한다.
  function syncOwner() {
    const next = currentOwnerId();
    if (ownerId === next) return;
    ownerId = next;
    clearAll();
  }

  // 화면이 읽는 한 컷. 값이 있으면 요청이 도는 중이어도 항상 'ready' 다 —
  // 갱신 중에 로딩 문구로 덮지 않는다 (R2 · R3).
  function snapshot(key) {
    if (values.has(key)) return { status: 'ready', value: values.get(key) };
    if (pending.has(key)) return { status: 'loading', value: undefined };
    if (failures.has(key)) return { status: 'failed', value: undefined };
    return { status: 'idle', value: undefined };
  }

  function load(key, run, accept) {
    if (pending.has(key)) return pending.get(key);
    failures.delete(key);
    const task = Promise.resolve()
      .then(run)
      .then((result) => {
        // accept 는 "이 응답을 보관해도 되는가" 판정이다. 모양이 어긋난 응답으로
        // 보관소를 더럽히면 다음 진입에서 그 값이 그대로 다시 그려진다.
        if (!accept || accept(result)) values.set(key, result);
        return result;
      })
      .catch((error) => {
        if (!values.has(key)) failures.set(key, error);
        throw error;
      })
      .finally(() => {
        pending.delete(key);
      });
    pending.set(key, task);
    return task;
  }

  const cache = {
    has: (key) => values.has(key),
    read: (key) => values.get(key),
    // 그 화면이 바꾼 데이터만 골라 갈아끼운다 (R4 — 찜 토글·신청·글쓰기 등).
    write(key, value) {
      values.set(key, value);
      failures.delete(key);
      return value;
    },
    patch(key, update) {
      if (!values.has(key)) return undefined;
      return cache.write(key, update(values.get(key)));
    },
    drop(key) {
      values.delete(key);
      failures.delete(key);
      pending.delete(key);
    },
    invalidate(keys) {
      (keys || []).forEach((key) => cache.drop(key));
    },
    // 모집 목록이 통째로 바뀌는 동작(모집 만들기·신청·나가기) 뒤에 덜어낼 키.
    // 한 곳에 모아두지 않으면 새 화면이 생길 때마다 문자열이 흩어져 하나씩 빠진다 (R4).
    ROOM_LIST_KEYS: ['my.rooms', 'meeting.waiting', 'explore.rooms'],
    // 피드 목록이 바뀌는 동작(24 글쓰기) 뒤에 덜어낼 키. 탭은 FRIENDS·DISCOVER 둘이고
    // 새로 올린 피드는 공개 범위에 따라 어느 쪽에도 들어갈 수 있어 둘 다 덜어낸다.
    FEED_LIST_KEYS: ['feed.list:FRIENDS', 'feed.list:DISCOVER'],
    snapshot,
    load,
    syncOwner,
    clear: clearAll,
    readUiState: (key, fallback) => (uiState.has(key) ? uiState.get(key) : fallback),
    writeUiState: (key, value) => uiState.set(key, value),
  };

  const React = global.React;

  // 탭 화면이 서버 값을 읽는 표준 경로.
  //
  //  mode 'keep'       — 탐색·모임·피드. 보관소에 값이 있으면 **다시 부르지 않는다** (R3).
  //  mode 'revalidate' — 홈·마이. 가진 값을 즉시 그리고 뒤에서 조용히 갱신한다 (R3).
  //
  // 돌려주는 status 는 화면이 그대로 쓴다:
  //   ready(값 있음) · loading(캐시 없음 · 요청 중) · failed(캐시 없음 · 실패) · idle(아직 안 부름)
  function useTabData(key, run, options = {}) {
    const { enabled = true, mode = 'keep', accept = null } = options;
    const runRef = React.useRef(run);
    runRef.current = run;
    const acceptRef = React.useRef(accept);
    acceptRef.current = accept;
    // 사용자가 명시적으로 누른 "다시 시도" 만 mode 를 무시하고 다시 부른다 (R4).
    const forcedRef = React.useRef(false);

    const [view, setView] = React.useState(() => (enabled && key ? snapshot(key) : { status: 'idle', value: undefined }));
    const [attempt, setAttempt] = React.useState(0);

    React.useEffect(() => {
      if (!enabled || !key) {
        setView({ status: 'idle', value: undefined });
        return undefined;
      }
      syncOwner();
      const forced = forcedRef.current;
      forcedRef.current = false;
      if (cache.has(key) && mode === 'keep' && !forced) {
        // 재진입이다. 보던 상태를 그대로 그리고 조회를 내보내지 않는다.
        setView(snapshot(key));
        return undefined;
      }
      let active = true;
      const task = load(key, () => runRef.current(), acceptRef.current);
      // load() 가 pending 에 올린 **뒤** 찍는다 — 캐시가 없을 때만 'loading' 이 된다.
      setView(snapshot(key));
      const settle = () => { if (active) setView(snapshot(key)); };
      task.then(settle, settle);
      return () => { active = false; };
    }, [key, enabled, mode, attempt]);

    const reload = React.useCallback(() => {
      forcedRef.current = true;
      setAttempt((count) => count + 1);
    }, []);

    // 화면이 바꾼 값(좋아요 토글 등)을 보관소와 화면에 함께 반영한다.
    const replace = React.useCallback((update) => {
      const next = cache.patch(key, update);
      setView(snapshot(key));
      return next;
    }, [key]);

    return { status: view.status, value: view.value, reload, replace };
  }

  // 사용자가 고른 필터·세그먼트·탭. 탭을 떠나도 유지된다 (R3 "선택한 필터가 그대로다").
  function useTabState(key, initialValue) {
    const [value, setValue] = React.useState(() => cache.readUiState(key, initialValue));
    const update = React.useCallback((next) => {
      setValue((current) => {
        const resolved = typeof next === 'function' ? next(current) : next;
        cache.writeUiState(key, resolved);
        return resolved;
      });
    }, [key]);
    return [value, update];
  }

  // 스크롤 위치도 보던 상태의 일부다 (R3). 목록이 캐시에서 즉시 그려지므로
  // ref 가 붙는 시점에 이미 내용이 있어 그 자리로 돌아갈 수 있다.
  function useTabScroll(key) {
    const attach = React.useCallback((node) => {
      if (!node) return;
      const saved = scrollTops.get(key);
      if (saved) node.scrollTop = saved;
    }, [key]);
    const onScroll = React.useCallback((event) => {
      scrollTops.set(key, event.currentTarget.scrollTop);
    }, [key]);
    return { ref: attach, onScroll };
  }

  global.MoyeoTabCache = cache;
  global.useTabData = useTabData;
  global.useTabState = useTabState;
  global.useTabScroll = useTabScroll;
}(window));
