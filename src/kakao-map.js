// 카카오 지도 JavaScript SDK 동적 로더 + 좌표 유틸.
// index.html 에 정적 <script> 로 SDK 를 넣지 않는다 — 지도가 필요한 화면에서만 lazy 로드한다.
// 키는 runtime-config(.local).js 의 kakaoJavaScriptKey 하나만 쓴다. 코드에 하드코딩 금지.
(function bootstrapMoyeoKakaoMap(global) {
  const SDK_ORIGIN = 'https://dapi.kakao.com/v2/maps/sdk.js';
  const SCRIPT_ID = 'moyeo-kakao-maps-sdk';
  const LOAD_TIMEOUT_MS = 9000;

  // 17-3 집합 장소 기본값. 화면기획의 좌표(청송 시외버스터미널)와 같은 값을 쓴다.
  const MEETING_POINT = { lat: 36.435612, lng: 129.057214, label: '청송 시외버스터미널' };

  // 목데이터 방문지 이름 → 관광 샘플 좌표 매칭용 별칭. 좌표를 새로 만들지 않고 리포에 있는 값만 쓴다.
  const NAME_ALIASES = {
    청송터미널: '청송 시외버스터미널',
    청송시외버스터미널: '청송 시외버스터미널',
    달기약수탕: '달기약수터 백숙거리',
  };

  let loadPromise = null;

  function runtimeConfig() {
    return global.MOYEO_RUNTIME_CONFIG || {};
  }

  function javaScriptKey() {
    return String(runtimeConfig().kakaoJavaScriptKey || '').trim();
  }

  // 캡처·QA 라우트에서는 네트워크 지도를 타지 않는다.
  // 타일 로딩이 비결정적이라 캡처 비교가 깨지고, ?screen= 는 capture-single/QA 캡처의 공통 진입점이다.
  function isCaptureMode() {
    const params = new URLSearchParams(global.location?.search || '');
    // ?liveMap=1 은 개발자용 예외 — 캡처 도구는 이 값을 절대 붙이지 않으므로 캡처는 그대로 결정적이다.
    if (params.get('liveMap') === '1') return false;
    return Boolean(params.get('screen'))
      || Boolean(params.get('route'))
      || params.get('capture') === '1'
      || params.get('uitest') === '1';
  }

  // 실지도를 시도할 수 있는 상태인지. false 면 호출부는 기존 SVG 목업을 그대로 그린다.
  function isAvailable() {
    return Boolean(javaScriptKey()) && !isCaptureMode();
  }

  function loadedNamespace() {
    const maps = global.kakao?.maps;
    return maps && typeof maps.Map === 'function' ? maps : null;
  }

  function injectScript() {
    return new Promise((resolve, reject) => {
      const existing = global.document.getElementById(SCRIPT_ID);
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', () => reject(new Error('KAKAO_MAPS_SCRIPT_ERROR')), { once: true });
        return;
      }
      const script = global.document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.src =`${SDK_ORIGIN}?appkey=${encodeURIComponent(javaScriptKey())}&autoload=false&libraries=services`;
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', () => {
        script.remove();
        reject(new Error('KAKAO_MAPS_SCRIPT_ERROR'));
      }, { once: true });
      global.document.head.appendChild(script);
    });
  }

  // 성공하면 kakao.maps 네임스페이스로 resolve. 키가 없거나 캡처 모드거나 로드 실패면 reject.
  function loadKakaoMaps() {
    if (loadPromise) return loadPromise;
    const ready = loadedNamespace();
    if (ready) {
      loadPromise = Promise.resolve(ready);
      return loadPromise;
    }
    if (isCaptureMode()) return Promise.reject(new Error('KAKAO_MAPS_CAPTURE_MODE'));
    if (!javaScriptKey()) return Promise.reject(new Error('KAKAO_MAPS_KEY_MISSING'));

    loadPromise = new Promise((resolve, reject) => {
      let settled = false;
      const timer = global.setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error('KAKAO_MAPS_LOAD_TIMEOUT'));
      }, LOAD_TIMEOUT_MS);
      const finish = (error, value) => {
        if (settled) return;
        settled = true;
        global.clearTimeout(timer);
        if (error) reject(error);
        else resolve(value);
      };

      injectScript().then(() => {
        // autoload=false 이므로 kakao.maps.load() 로 명시 초기화한다.
        const namespace = global.kakao?.maps;
        if (!namespace || typeof namespace.load !== 'function') {
          finish(new Error('KAKAO_MAPS_NAMESPACE_MISSING'));
          return;
        }
        namespace.load(() => {
          const loaded = loadedNamespace();
          if (loaded) finish(null, loaded);
          else finish(new Error('KAKAO_MAPS_INIT_FAILED'));
        });
      }).catch((error) => finish(error));
    }).catch((error) => {
      // 실패한 약속을 캐시하면 재시도 자체가 막힌다.
      loadPromise = null;
      throw error;
    });

    return loadPromise;
  }

  function normalizeName(value) {
    return String(value || '').replace(/\s+/g, '').toLowerCase();
  }

  function coordPool() {
    const samples = global.MoyeoTourism?.samplePlaces || [];
    return [
      ...samples.map((item) => ({ title: item.title, lat: Number(item.latitude), lng: Number(item.longitude) })),
      { title: MEETING_POINT.label, lat: MEETING_POINT.lat, lng: MEETING_POINT.lng },
    ].filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng) && item.lat !== 0);
  }

  // 방문지 이름으로 좌표를 찾는다. 못 찾으면 null — 호출부는 그 지도를 목업으로 유지한다.
  function placeCoord(name) {
    const raw = normalizeName(name);
    if (!raw) return null;
    const key = normalizeName(NAME_ALIASES[String(name || '').replace(/\s+/g, '')] || name);
    const pool = coordPool();
    const hit = pool.find((item) => {
      const title = normalizeName(item.title);
      return title === key || title.includes(key) || key.includes(title);
    });
    return hit ? { lat: hit.lat, lng: hit.lng, label: hit.title } : null;
  }

  // 이름 배열 → 좌표 배열. 하나라도 못 찾으면 null 을 돌려 지도 전체를 목업으로 남긴다.
  function placeCoords(names) {
    const list = (names || []).map((name, index) => {
      const found = placeCoord(typeof name === 'string' ? name : name?.name);
      return found ? { ...found, label: String(index + 1) } : null;
    });
    if (!list.length || list.some((item) => !item)) return null;
    return list;
  }

  // 기획 18-x 경로 지도의 기본 코스(주왕산 & 주산지 힐링 트레킹) 방문지 순서.
  const DEFAULT_COURSE_STOPS = ['청송 시외버스터미널', '주왕산 국립공원', '주산지', '달기약수탕'];

  // 방문지 이름 배열 → { markers, polyline }. 좌표를 못 찾으면 null (호출부는 목업 유지).
  function routeFromNames(names) {
    const coords = placeCoords(names);
    if (!coords || coords.length < 2) return null;
    return {
      markers: coords,
      polyline: coords.map((item) => ({ lat: item.lat, lng: item.lng })),
    };
  }

  // 서버 코스 방문지(latitude/longitude 를 그대로 가진 객체) → { markers, polyline }.
  // 이름 매칭이 필요한 routeFromNames 와 달리 서버가 준 좌표만 쓴다. 좌표가 2개 미만이면 null.
  function routeFromPlaces(places) {
    const coords = (places || [])
      .map((place, index) => ({
        lat: Number(place?.latitude),
        lng: Number(place?.longitude),
        label: String(index + 1),
      }))
      .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng) && item.lat !== 0 && item.lng !== 0);
    if (coords.length < 2) return null;
    return {
      markers: coords,
      polyline: coords.map((item) => ({ lat: item.lat, lng: item.lng })),
    };
  }

  global.MoyeoKakaoMap = {
    DEFAULT_COURSE_STOPS,
    MEETING_POINT,
    routeFromNames,
    routeFromPlaces,
    isAvailable,
    isCaptureMode,
    javaScriptKey,
    loadKakaoMaps,
    placeCoord,
    placeCoords,
  };
}(window));
