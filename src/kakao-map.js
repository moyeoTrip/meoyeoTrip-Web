// 카카오 지도 JavaScript SDK 동적 로더 + 좌표 유틸.
// index.html 에 정적 <script> 로 SDK 를 넣지 않는다 — 지도가 필요한 화면에서만 lazy 로드한다.
// 키는 runtime-config(.local).js 의 kakaoJavaScriptKey 하나만 쓴다. 코드에 하드코딩 금지.
(function bootstrapMoyeoKakaoMap(global) {
  const SDK_ORIGIN = 'https://dapi.kakao.com/v2/maps/sdk.js';
  const SCRIPT_ID = 'moyeo-kakao-maps-sdk';
  const LOAD_TIMEOUT_MS = 9000;

  let loadPromise = null;

  function runtimeConfig() {
    return global.MOYEO_RUNTIME_CONFIG || {};
  }

  function javaScriptKey() {
    return String(runtimeConfig().kakaoJavaScriptKey || '').trim();
  }

  // 캡처·QA 라우트에서는 네트워크 지도를 타지 않는다.
  // 타일 로딩이 비결정적이라 캡처 비교가 깨지고, ?screen= 는 capture-single/QA 캡처의 공통 진입점이다.
  // 데이터를 갈아끼우는 분기가 아니다 — 지도를 못 그리면 그 자리는 비어 있고, 가짜 지도를 대신 넣지 않는다.
  function isCaptureMode() {
    const params = new URLSearchParams(global.location?.search || '');
    // ?liveMap=1 은 개발자용 예외.
    if (params.get('liveMap') === '1') return false;
    // **라이브 캡처(?liveData=1)도 예외다.** 실데이터를 보려고 찍는 캡처에서 지도만 비어 있으면
    // "지도가 실제로 그려지는지"를 확인할 수 없다.
    if (params.get('liveData') === '1') return false;
    return Boolean(params.get('screen'))
      || Boolean(params.get('route'))
      || params.get('capture') === '1'
      || params.get('uitest') === '1';
  }

  // 실지도를 시도할 수 있는 상태인지. false 면 호출부는 지도를 그리지 않는다.
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

  // 서버 코스 방문지(latitude/longitude 를 그대로 가진 객체) → { markers, polyline }.
  // 좌표는 서버가 준 값만 쓴다 — 이름으로 표본 좌표를 찾아 붙이던 경로는 지웠다.
  // 좌표가 2개 미만이면 null 이고, 호출부는 지도를 아예 그리지 않는다.
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

  // 15 모집 상세 `길 찾기` — 집합 좌표를 지도 앱으로 넘긴다. 서버 호출은 없다.
  // 카카오 지도 link/to 는 앱이 깔려 있으면 앱이, 없으면 웹 지도가 받는다.
  // iOS 는 같은 자리에서 Apple 지도(maps.apple.com?daddr=)를 여는데, 플랫폼 기본 지도가
  // 다른 것이므로 문구·동작 불일치가 아니다. 좌표가 없으면 null 이고 호출부는 버튼을 두지 않는다.
  function directionsUrl(latitude, longitude, name) {
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return null;
    // link/to/{이름},{위도},{경도} — 이름에 쉼표가 있으면 경로가 깨지므로 지운다.
    const label = String(name || '집합 장소').replace(/,/g, ' ').trim() || '집합 장소';
    return `https://map.kakao.com/link/to/${encodeURIComponent(label)},${lat},${lng}`;
  }

  global.MoyeoKakaoMap = {
    directionsUrl,
    routeFromPlaces,
    isAvailable,
    isCaptureMode,
    javaScriptKey,
    loadKakaoMaps,
  };
}(window));
