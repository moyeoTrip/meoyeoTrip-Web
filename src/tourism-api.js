(function bootstrapMoyeoTourism(global) {
  const DEFAULT_BASE_URL = 'https://moyeo-trip-api.jayden-bin.cc';
  const SESSION_KEY = 'moyeo.auth.session';
  const SAMPLE_PLACES = [
    { contentId: 'CT2864117', type: 'spot', title: '주왕산국립공원', address: '경상북도 청송군 부동면 공원길 226', hue: 'forest', latitude: 36.3931, longitude: 129.1728 },
    { contentId: 'CT2871004', type: 'spot', title: '주산지', address: '경상북도 청송군 부동면 주산지길 259', hue: 'coast', latitude: 36.3494, longitude: 129.1436 },
    { contentId: 'CT2299341', type: 'food', title: '달기약수터 백숙거리', address: '경상북도 청송군 청송읍 약수길 5', hue: 'autumn', latitude: 36.4278, longitude: 129.0489 },
    { contentId: 'CT2740882', type: 'stay', title: '청송 솔기온천 한옥스테이', address: '경상북도 청송군 청송읍 금월로 273', hue: 'hanok', latitude: 36.4361, longitude: 129.0573 },
    { contentId: 'CT2510773', type: 'spot', title: '청송 객주문학관', address: '경상북도 청송군 진보면 청송로 6359', hue: 'pebble', latitude: 36.4739, longitude: 129.0093 },
  ];
  const SAMPLE_DETAIL = {
    ...SAMPLE_PLACES[2],
    postalCode: '37411',
    phoneNumber: '054-873-7777',
    phoneName: '달기약수터 관리사무소',
    homepage: 'https://cheongsong.go.kr/tour',
    description: '탄산이 섞인 달기약수로 끓여내는 백숙이 유명한 거리예요. 산행 뒤 늦은 점심 자리로 많이 찾으며, 예약제로 운영하는 곳은 방문 전에 전화 확인이 필요해요.',
    images: [null, null, null, null, null, null, null, null],
    menuImages: [null, null, null, null],
  };

  class TourismApiError extends Error {
    constructor(message, status = 0, code = '') {
      super(message);
      this.name = 'TourismApiError';
      this.status = status;
      this.code = code;
    }
  }

  function runtimeConfig() {
    return global.MOYEO_RUNTIME_CONFIG || {};
  }

  function apiBaseUrl() {
    return String(global.MOYEO_API_BASE_URL || runtimeConfig().apiBaseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
  }

  function accessToken() {
    try {
      return JSON.parse(global.localStorage?.getItem(SESSION_KEY) || 'null')?.accessToken || '';
    } catch (_) {
      return '';
    }
  }

  async function request(path, { timeoutMs = 15000 } = {}) {
    const controller = global.AbortController ? new global.AbortController() : null;
    const timer = controller ? global.setTimeout(() => controller.abort(), timeoutMs) : null;
    const token = accessToken();
    try {
      const response = await fetch(`${apiBaseUrl()}${path}`, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: controller?.signal,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new TourismApiError(
          payload?.message || payload?.errorMessage || `관광 정보를 불러오지 못했어요. (${response.status})`,
          response.status,
          payload?.code || '',
        );
      }
      return payload;
    } catch (error) {
      if (error instanceof TourismApiError) throw error;
      if (error?.name === 'AbortError') throw new TourismApiError('관광 정보 요청 시간이 초과됐어요.', 0, 'TIMEOUT');
      throw new TourismApiError(error?.message || '관광 정보에 연결할 수 없어요.', 0, 'NETWORK');
    } finally {
      if (timer) global.clearTimeout(timer);
    }
  }

  function contentType(value) {
    const normalized = String(value || '').toUpperCase();
    if (['FOOD', 'RESTAURANT', 'DINING', '39'].some((item) => normalized.includes(item))) return 'food';
    if (['STAY', 'ACCOMMODATION', 'LODGING', '32'].some((item) => normalized.includes(item))) return 'stay';
    return 'spot';
  }

  function firstValue(source, keys, fallback = '') {
    for (const key of keys) {
      if (source?.[key] !== undefined && source[key] !== null && source[key] !== '') return source[key];
    }
    return fallback;
  }

  function stringArray(value) {
    if (!Array.isArray(value)) return [];
    return value.map((item) => typeof item === 'string' ? item : firstValue(item, ['url', 'imageUrl', 'originalUrl', 'thumbnailUrl'])).filter(Boolean);
  }

  function normalizeListItem(item = {}, index = 0) {
    return {
      contentId: String(firstValue(item, ['contentId', 'id', 'tourismContentId'], `tourism-${index}`)),
      type: contentType(firstValue(item, ['contentType', 'type', 'category', 'contentTypeId'])),
      title: String(firstValue(item, ['title', 'name'], '이름 없는 장소')),
      address: String(firstValue(item, ['address', 'addr1', 'roadAddress'])),
      thumbnailUrl: String(firstValue(item, ['thumbnailUrl', 'thumbnail', 'firstImage', 'imageUrl'])),
      latitude: Number(firstValue(item, ['latitude', 'lat', 'mapY'], 0)),
      longitude: Number(firstValue(item, ['longitude', 'lng', 'mapX'], 0)),
      hue: 'forest',
    };
  }

  function listItems(payload) {
    const data = payload?.data ?? payload;
    const items = Array.isArray(data)
      ? data
      : data?.content || data?.items || data?.results || payload?.content || payload?.items || [];
    if (!Array.isArray(items)) throw new TourismApiError('관광 목록 응답 형식을 확인할 수 없어요.', 200, 'SCHEMA_MISMATCH');
    return items.map(normalizeListItem);
  }

  function normalizeDetail(payload) {
    const item = payload?.data ?? payload;
    if (!item || Array.isArray(item) || typeof item !== 'object') {
      throw new TourismApiError('관광 상세 응답 형식을 확인할 수 없어요.', 200, 'SCHEMA_MISMATCH');
    }
    return {
      ...normalizeListItem(item),
      postalCode: String(firstValue(item, ['postalCode', 'zipCode', 'zipcode'])),
      phoneNumber: String(firstValue(item, ['phoneNumber', 'telephone', 'tel'])),
      phoneName: String(firstValue(item, ['phoneName', 'contactName', 'telephoneName', 'telName'])),
      homepage: String(firstValue(item, ['homepage', 'homepageUrl', 'website'])),
      description: String(firstValue(item, ['description', 'overview', 'introduction', 'detail'])),
      images: stringArray(firstValue(item, ['images', 'generalImages', 'imageUrls'], [])),
      menuImages: stringArray(firstValue(item, ['menuImages', 'menuImageUrls'], [])),
    };
  }

  function usesDeterministicSamples() {
    const params = new URLSearchParams(global.location?.search || '');
    return params.get('mockAuth') === '1' || params.get('capture') === '1' || params.get('uitest') === '1';
  }

  async function list() {
    return listItems(await request('/api/v1/tourism-contents'));
  }

  async function detail(contentId) {
    if (!contentId) throw new TourismApiError('관광 콘텐츠 ID가 필요해요.', 0, 'CONTENT_ID_REQUIRED');
    return normalizeDetail(await request(`/api/v1/tourism-contents/${encodeURIComponent(contentId)}`));
  }

  global.MoyeoTourism = {
    TourismApiError,
    detail,
    list,
    normalizeDetail,
    normalizeListItem,
    sampleDetail: SAMPLE_DETAIL,
    samplePlaces: SAMPLE_PLACES,
    usesDeterministicSamples,
  };
}(window));
