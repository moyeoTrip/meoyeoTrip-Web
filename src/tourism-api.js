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

  // 상세 응답의 contentImages / menuImages 는 {originalImageUrl, imageName, serialNumber, ...} 객체 배열이다.
  function stringArray(value) {
    if (!Array.isArray(value)) return [];
    return value.map((item) => typeof item === 'string' ? item : firstValue(item, ['url', 'imageUrl', 'originalImageUrl', 'originalUrl', 'thumbnailUrl'])).filter(Boolean);
  }

  const HTML_ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&nbsp;': ' ' };
  function decodeEntities(text) {
    return String(text).replace(/&(?:amp|lt|gt|quot|#39|apos|nbsp);/g, (match) => HTML_ENTITIES[match] || match);
  }

  // homepage 는 TourAPI 원본이라 앵커 태그가 통째로 온다 —
  //   <a href="https://..." target="_blank" title="새창 : …">https://…</a>
  // 태그를 그대로 그리면 화면에 마크업이 노출되므로 href(없으면 표시 텍스트)만 뽑는다.
  // URL 로 보이지 않으면 null 을 돌려주고, 화면은 그 줄을 숨긴다 (문구를 지어내지 않는다).
  function parseHomepage(value) {
    const raw = String(value ?? '').trim();
    if (!raw) return null;
    const isUrl = (text) => /^(https?:\/\/|www\.)\S+$/i.test(text);
    if (raw.includes('<')) {
      const href = /href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(raw);
      const candidate = decodeEntities(href?.[1] ?? href?.[2] ?? href?.[3] ?? '').trim();
      if (isUrl(candidate)) return candidate;
      // href 가 없거나 URL 이 아니면 태그를 걷어낸 표시 텍스트를 본다
      const text = decodeEntities(raw.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
      return isUrl(text) ? text : null;
    }
    return isUrl(raw) ? raw : null;
  }

  function normalizeListItem(item = {}, index = 0) {
    return {
      contentId: String(firstValue(item, ['contentId', 'id', 'tourismContentId'], `tourism-${index}`)),
      contentTypeId: Number(firstValue(item, ['contentTypeId'], 0)) || null,
      type: contentType(firstValue(item, ['contentType', 'type', 'category', 'contentTypeId'])),
      title: String(firstValue(item, ['title', 'name'], '이름 없는 장소')),
      // 서버 목록은 address1(지번/도로명) + address2(상세)로 나뉘어 온다
      address: [firstValue(item, ['address', 'address1', 'addr1', 'roadAddress']), firstValue(item, ['address2'])]
        .filter(Boolean).join(' ').trim(),
      thumbnailUrl: String(firstValue(item, ['thumbnailUrl', 'thumbnail', 'firstImage', 'imageUrl'])),
      latitude: Number(firstValue(item, ['latitude', 'lat', 'mapY'], 0)),
      longitude: Number(firstValue(item, ['longitude', 'lng', 'mapX'], 0)),
      hue: 'forest',
    };
  }

  // 목록 응답: { items, page, size, totalElements, totalPages }.
  // totalElements 는 페이지가 아니라 검색 전체 건수라 화면 건수 표기는 이 값을 쓴다
  // (클라가 센 값은 한 페이지 분량뿐이다).
  function normalizeList(payload) {
    const data = payload?.data ?? payload;
    const items = Array.isArray(data)
      ? data
      : data?.items || data?.content || data?.results || payload?.items || payload?.content || [];
    if (!Array.isArray(items)) throw new TourismApiError('관광 목록 응답 형식을 확인할 수 없어요.', 200, 'SCHEMA_MISMATCH');
    const total = Number(firstValue(data, ['totalElements', 'totalCount', 'total'], items.length));
    return {
      items: items.map(normalizeListItem),
      totalElements: Number.isFinite(total) ? total : items.length,
      page: Number(firstValue(data, ['page', 'number'], 0)) || 0,
      size: Number(firstValue(data, ['size'], items.length)) || items.length,
      totalPages: Number(firstValue(data, ['totalPages'], 1)) || 1,
    };
  }

  function normalizeDetail(payload) {
    const item = payload?.data ?? payload;
    if (!item || Array.isArray(item) || typeof item !== 'object') {
      throw new TourismApiError('관광 상세 응답 형식을 확인할 수 없어요.', 200, 'SCHEMA_MISMATCH');
    }
    // 서버가 null 로 주는 값(대부분의 항목에서 telephone·telephoneName·homepage)은 '' 로 남겨
    // 화면이 그 줄 자체를 숨긴다 — 안내 문구로 채우지 않는다.
    return {
      ...normalizeListItem(item),
      postalCode: String(firstValue(item, ['postalCode', 'zipCode', 'zipcode'])).trim(),
      phoneNumber: String(firstValue(item, ['phoneNumber', 'telephone', 'tel'])).trim(),
      phoneName: String(firstValue(item, ['phoneName', 'contactName', 'telephoneName', 'telName'])).trim(),
      homepage: parseHomepage(firstValue(item, ['homepage', 'homepageUrl', 'website'])) || '',
      description: String(firstValue(item, ['description', 'overview', 'introduction', 'detail'])).trim(),
      images: stringArray(firstValue(item, ['contentImages', 'images', 'generalImages', 'imageUrls'], [])),
      menuImages: stringArray(firstValue(item, ['menuImages', 'menuImageUrls'], [])),
    };
  }

  // 캡처·QA 라우트 판정 — moyeo-api.deterministicParams / kakao-map.isCaptureMode 와 같은 기준.
  function usesDeterministicSamples() {
    const params = new URLSearchParams(global.location?.search || '');
    if (params.get('liveData') === '1') return false;
    return params.get('mockAuth') === '1'
      || params.get('capture') === '1'
      || params.get('uitest') === '1'
      || Boolean(params.get('screen'))
      || Boolean(params.get('route'));
  }

  function query(params = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
    });
    const text = search.toString();
    return text ? `?${text}` : '';
  }

  // 2026-08-25 서버 패치로 keyword 검색이 생겼다 — 제목·기본주소·상세주소를 서버가 매칭한다.
  // 클라이언트에서 다시 거르지 않는다(이중 필터 금지). 빈 검색어는 파라미터를 아예 보내지 않아
  // 전체 조회가 된다. contentTypeId 와 함께 보낼 수 있다.
  async function list({ keyword, contentTypeId, page, size } = {}) {
    return normalizeList(await request(`/api/v1/tourism-contents${query({ keyword: String(keyword ?? '').trim(), contentTypeId, page, size })}`));
  }

  // GET /api/v1/tourism-contents/types — 17-1a 유형 필터 후보 (관광지·문화시설·축제공연행사·레포츠·숙박·쇼핑·음식점)
  async function types() {
    const payload = await request('/api/v1/tourism-contents/types');
    const items = Array.isArray(payload) ? payload : (payload?.data ?? payload?.items);
    if (!Array.isArray(items)) throw new TourismApiError('관광 유형 응답 형식을 확인할 수 없어요.', 200, 'SCHEMA_MISMATCH');
    return items
      .map((item) => ({
        contentTypeId: Number(firstValue(item, ['contentTypeId', 'id'], 0)),
        contentTypeName: String(firstValue(item, ['contentTypeName', 'name'])),
      }))
      .filter((item) => item.contentTypeId && item.contentTypeName);
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
    normalizeList,
    normalizeListItem,
    parseHomepage,
    sampleDetail: SAMPLE_DETAIL,
    samplePlaces: SAMPLE_PLACES,
    types,
    usesDeterministicSamples,
  };
}(window));
