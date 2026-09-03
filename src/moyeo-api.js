// MoyeoTrip 도메인 API 클라이언트.
// window.MoyeoAuth.request()를 감싸는 thin wrapper 모음이다 (토큰 첨부·401 refresh는 auth-api가 처리).
//
// **목데이터 폴백은 없다.** 세션이 있으면 서버 값을 그리고, 없거나 실패하면 빈 상태를 그린다.
// 예전에는 캡처 라우트(?screen= / ?route= / mockAuth / capture / uitest)를 만나면 무조건
// 목데이터로 떨어뜨렸다 — 그래서 스크린샷이 실제 앱이 아니라 프로토타입을 찍고 있었다.
(function bootstrapMoyeoApi(global) {
  // 로그인 세션이 있으면 true. 캡처 라우트도 예외가 아니다.
  function live() {
    const auth = global.MoyeoAuth;
    if (!auth?.request) return false;
    try {
      return Boolean(auth.getSession?.()?.accessToken);
    } catch (_) {
      return false;
    }
  }

  function query(params = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
    });
    const text = search.toString();
    return text ? `?${text}` : '';
  }

  // ── 이미지 주소 정규화 (한 곳에서만 한다) ──
  //
  // `travel-courses` 계열은 썸네일을 **상대 경로**로 준다: `tourism/image/….webp`.
  // 그대로 <img src> 에 넣으면 웹 앱 자신의 경로(`/tourism/image/…`)를 찾아가 404 라
  // 14 코스 상세·09 홈 인기 코스·27-4 코스 평가의 썸네일이 통째로 안 떴다.
  // `chat-room/thumbnail/…` 계열은 이미 절대 URL 로 오므로 **그대로 통과**해야 한다.
  //
  // 화면마다 붙이면 새 화면이 생길 때마다 빠진다 — 그래서 응답을 받는 이 한 곳에서 붙인다.
  // 서버에는 절대 URL 로 통일해 달라고 요청해 뒀다(BE 요청 §2-9). 서버가 바꾸면 이미 절대
  // URL 인 값은 이 함수를 그대로 통과하므로 여기를 지우지 않아도 된다.
  const MEDIA_BASE_URL = String(
    global.MOYEO_RUNTIME_CONFIG?.mediaBaseUrl || 'https://moyeo-trip-cdn.jayden-bin.cc'
  ).replace(/\/+$/, '');
  // 이미지 주소가 담기는 필드 이름. 서버 응답의 관례를 그대로 적는다.
  // creatorProfileImageUrl(14 코스 상세 작성자)은 실서버가 절대 URL 로 주므로 그대로 통과하지만,
  // 이미지 필드는 한 곳에서만 정규화한다는 규칙을 지키려고 여기 함께 적어 둔다.
  const MEDIA_KEY_PATTERN = /^(thumbnail|imageUrl|profileImageUrl|creatorProfileImageUrl|coverImageUrl|photoUrl)$/;

  function mediaUrl(value) {
    if (typeof value !== 'string') return value;
    const text = value.trim();
    if (!text) return value;
    // 이미 절대 URL(http/https)이거나 data:·blob: 이면 손대지 않는다.
    if (/^(https?:|data:|blob:)/i.test(text)) return value;
    return `${MEDIA_BASE_URL}/${text.replace(/^\/+/, '')}`;
  }

  // 응답 JSON 을 훑어 이미지 필드만 절대 URL 로 바꾼다. 배열·중첩 객체(places[].thumbnail 등)도 따라간다.
  function normalizeMedia(node) {
    if (Array.isArray(node)) {
      node.forEach(normalizeMedia);
      return node;
    }
    if (!node || typeof node !== 'object') return node;
    Object.entries(node).forEach(([key, value]) => {
      if (typeof value === 'string') {
        if (MEDIA_KEY_PATTERN.test(key)) node[key] = mediaUrl(value);
      } else if (value && typeof value === 'object') {
        normalizeMedia(value);
      }
    });
    return node;
  }

  function request(path, options = {}) {
    return global.MoyeoAuth.request(path, { authenticated: true, ...options }).then(normalizeMedia);
  }

  // 화면 간 선택 컨텍스트 (tourism-api의 moyeo.selectedTourismContentId 관례를 따른다)
  function remember(key, value) {
    try {
      if (value === undefined || value === null) global.sessionStorage?.removeItem(key);
      else global.sessionStorage?.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch (_) { /* storage unavailable */ }
  }
  function recall(key, json = false) {
    try {
      const raw = global.sessionStorage?.getItem(key);
      if (!raw) return null;
      return json ? JSON.parse(raw) : raw;
    } catch (_) {
      return null;
    }
  }
  // 딥링크·QA 진입용 쿼리 파라미터 우선 (17-1b 의 ?contentId= 관례와 같다).
  function queryParam(name) {
    try {
      return new URLSearchParams(global.location?.search || '').get(name) || null;
    } catch (_) {
      return null;
    }
  }

  // ── 응답 값 정규화 유틸 ──
  // 서버가 안 주는 값은 null 로 남긴다. 화면은 null 을 보고 표기 자체를 숨긴다(문구를 지어내지 않는다).
  function numberOrNull(value) {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  function textOrNull(value) {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    return text || null;
  }
  // 시각 문자열 → 'HH:mm'. 문서는 'HH:mm' 인데 실제 응답은 'HH:mm:ss' 라 두 포맷을 모두 받는다.
  function clockText(value) {
    const text = textOrNull(value);
    if (!text) return null;
    const match = /^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(text);
    if (!match) return null;
    return `${match[1].padStart(2, '0')}:${match[2]}`;
  }

  // 24 피드 글쓰기 초안. 고른 사진(File)이 들어가 직렬화할 수 없어 메모리에만 둔다 (api.feedDraft 참고).
  let feedDraftState = {};

  const api = {
    live,

    // 내 userId. 액세스 토큰 페이로드에서 **동기로** 읽는다 (TAB-STATE-CANON R6).
    // GET chat-rooms/{id}/members 의 me 플래그를 기다리면 그 응답이 오기 전까지
    // 내가 보낸 메시지가 남의 것처럼 왼쪽에 그려졌다가 오른쪽으로 튄다.
    // 문자열이다 — 비교하는 쪽에서 senderId 도 문자열로 맞춰야 한다(sentByMe 를 쓰면 된다).
    myUserId: () => global.MoyeoAuth?.currentUserId?.() ?? null,
    // 이 메시지가 내가 보낸 것인가. 서버 userId 는 숫자로도 문자열로도 오므로 형을 맞춰 비교한다.
    sentByMe(message) {
      const mine = api.myUserId();
      if (mine == null || message?.senderId == null) return false;
      return String(message.senderId) === mine;
    },

    // ── 1. 모임 검색·상세 ──
    // 응답은 래핑 객체가 아니라 JSON 배열이다. 항목은 parseSearchRoom 으로 정규화해서 넘긴다.
    searchRooms: ({ keyword, limit } = {}) => request(`/api/v1/chat-rooms/search${query({ keyword, limit })}`)
      .then((rooms) => (Array.isArray(rooms) ? rooms.map((room) => api.parseSearchRoom(room)) : rooms)),
    // 12 검색 · 인기 검색어. 응답은 [{ rank, keyword, searchCount }] 배열이다.
    // 서버가 모임 통합 검색 + 공개 코스 검색의 입력을 누적 집계한다(limit 은 1~20 으로 보정).
    // **상승·하락은 서버가 주지 않는다** — 화면기획의 ▲▼ 는 목데이터였다(NO-MOCK-CANON R1).
    // 토큰이 필요하다(토큰 없이 부르면 401 40100 — 직접 확인). Redis 집계가 비면 [] 라 실패가 아니다.
    popularKeywords: (limit = 10) => request(`/api/v1/search/popular-keywords${query({ limit })}`)
      .then((rows) => (Array.isArray(rows) ? rows : [])),
    // 지도 반경 조회 — 지도 핀은 이걸로 찍는다.
    // 응답 항목 모양은 검색과 같아 같은 정규화를 쓴다.
    mapRooms: ({ latitude, longitude, radiusKm }) =>
      request(`/api/v1/chat-rooms/map${query({ latitude, longitude, radiusKm })}`)
        .then((rooms) => (Array.isArray(rooms) ? rooms.map((room) => api.parseSearchRoom(room)) : rooms)),
    // 지도 조회 범위 오류. 서버가 2026-08-30 에 `radiusKm` 상한 **200km** 를 세웠고,
    // 상한을 넘거나 위경도가 범위를 벗어나면 400 `40040 INVALID_MAP_SEARCH_AREA` 를 준다.
    // 웹은 경북 전역용 120km 고정이라 지금은 걸리지 않지만, 반경이 화면에서 조절되는 날
    // 이 분기가 없으면 "불러오지 못했어요."로 뭉개진다. 문구는 서버 errorMessage 를 그대로 쓴다.
    isInvalidMapAreaError(error) {
      return String(error?.code ?? '') === '40040';
    },
    roomDetail: (roomId) => request(`/api/v1/chat-rooms/${roomId}`),

    // ── 2. 참가 신청·취소·찜 ──
    applyToRoom: (roomId, applicationMessage) => request(`/api/v1/chat-rooms/${roomId}/applications`, {
      method: 'POST', body: { applicationMessage: applicationMessage || null },
    }),
    cancelMyApplication: (roomId) => request(`/api/v1/chat-rooms/${roomId}/applications/me`, { method: 'DELETE' }),
    toggleFavorite: (roomId) => request(`/api/v1/chat-rooms/${roomId}/favorite`, { method: 'POST' }),
    // 26-1 찜한 모집. 응답은 SearchChatRoomResponse 배열이라 10 탐색 카드와 같은 모양이다.
    // 하트는 눌리는데 모아 보는 곳이 없어서 이 호출부가 세 플랫폼 모두 비어 있었다.
    favoriteRooms: () => request('/api/v1/chat-rooms/my/favorites')
      .then((rooms) => (Array.isArray(rooms) ? rooms.map((room) => api.parseSearchRoom(room)) : rooms)),
    // 26 찜한 코스. 응답은 LikedTravelCourseResponse 배열(courseId·title·description·thumbnail·tags).
    favoriteCourses: () => request('/api/v1/travel-courses/me/favorites'),
    // ── 2-1. 17 모집 만들기 ──
    // multipart 요청이다: request 파트가 application/json, thumbnail 파트가 바이너리다.
    // 2026-08-26 서버 변경으로 **thumbnail 이 필수**다 — 빼면 400 `40041`,
    // 이미지가 아니거나 20MB 초과면 400 `40042`. 서버가 저장 전에 비율 유지 FHD 축소 + WebP 변환을
    // 직접 하므로(2026-08-29 안내) 클라에서 리사이즈·변환하지 않는다.
    // ("채팅방 썸네일 이미지는 필수입니다"). 실서버로 확인했다.
    // 17 모집 만들기에는 아직 사진 선택 단계가 없어서, 사진이 없으면 공용 플레이스홀더를 올린다.
    // 성공 응답은 201 { roomId } — 호출부는 그 roomId 로 15 모집 상세로 이동한다.
    createRoom: async (payload, thumbnail) => {
      const form = new global.FormData();
      form.append('request', new global.Blob([JSON.stringify(payload)], { type: 'application/json' }));
      const file = thumbnail || await api.defaultRoomThumbnail();
      if (file) form.append('thumbnail', file);
      return request('/api/v1/chat-rooms', { method: 'POST', body: form });
    },
    // 사진이 없을 때 올리는 기본 썸네일. 카드형 목록에 쓰이는 16:9 쪽이다.
    // 가져오지 못하면 null 을 돌려주고, 서버가 400 으로 알려주게 둔다 — 조용히 성공한 척하지 않는다.
    defaultRoomThumbnail: async () => {
      try {
        const response = await global.fetch('assets/placeholder-landscape.webp');
        if (!response.ok) return null;
        const blob = await response.blob();
        return new global.File([blob], 'placeholder-landscape.webp', { type: 'image/webp' });
      } catch (_) {
        return null;
      }
    },
    // 방 상태 전이 (RECRUITING / CONFIRMED / CANCELLED). 호스트만 가능하고 204 를 준다.
    changeRoomStatus: (roomId, status) => request(`/api/v1/chat-rooms/${roomId}/status`, {
      method: 'POST', body: { status },
    }),

    // ── 3. 여행 코스 ──
    publicCourses: (tagId) => request(`/api/v1/travel-courses/public${query({ tagId })}`),
    popularCourses: () => request('/api/v1/travel-courses/public/popular'),
    courseTags: () => request('/api/v1/travel-courses/tags'),
    roomCourse: (roomId) => request(`/api/v1/travel-courses/chat-rooms/${roomId}`),
    courseDetail: (courseId) => request(`/api/v1/travel-courses/${courseId}`),
    // 12-1 검색 결과 · 코스. 서버는 **제목에 포함되거나 태그명이 일치**하는 공개 코스만 준다 —
    // 소개글(description)은 검색 대상이 아니다(ATTACH-COMPOSER-CANON R6, 실서버 확인).
    // 응답은 TravelCourseInformationResponse 배열이다.
    searchCourses: (keyword) => request(`/api/v1/travel-courses/search${query({ keyword })}`),
    // 14 코스 상세 · "모집 중인 모임 보기". 모집 마감 전이고 내가 아직 참가하지 않은 방만 준다.
    // 응답은 SearchChatRoomResponse 배열이라 11 탐색 카드와 같은 모양이다(정본 §4).
    courseChatRooms: (courseId) => request(`/api/v1/travel-courses/${courseId}/chat-rooms`)
      .then((rooms) => (Array.isArray(rooms) ? rooms.map((room) => api.parseSearchRoom(room)) : rooms)),
    // 27-4 코스 평가. 경로 변수는 courseId 가 아니라 **다녀온 방의 roomId** 다 —
    // 서버가 그 방의 코스를 찾아 점수를 붙인다(같은 코스라도 방마다 한 번씩 평가한다).
    // 점수는 정수 1~5 필수. 서버 조건은 "확정된 여행이 끝난 방의 참가자"(아니면 TRAVEL_COURSE_RATING_NOT_ALLOWED).
    // 이 호출부가 없어서 14 코스 상세의 averageRating·ratingCount 를 만드는 사람이 아무도 없었다.
    rateRoomCourse: (roomId, score) => request(`/api/v1/travel-courses/chat-rooms/${roomId}/rating`, {
      method: 'POST', body: { score: numberOrNull(score) },
    }),
    // 27-3 코스 공개. **제목·소개가 둘 다 필수**다(빈 문자열이면 400).
    // 서버 조건: 코스 주인이 나이고, type 이 CUSTOM 이며, 그 코스로 **호스트로서 다녀온 여행**이 있어야 한다
    // (아니면 TRAVEL_COURSE_PUBLICATION_NOT_ALLOWED). 이미 공개된 코스를 다시 부르면 400 이다.
    // 응답은 { courseId, publicationStatus }.
    // 정본에 "여행자 코스 등록 API 없음" 이라고 적혀 있었지만 **틀린 말이었다** (NO-MOCK-CANON §4 정정).
    publishCourse: (courseId, { title, description, showCreatorNickname = true } = {}) => request(
      `/api/v1/travel-courses/${courseId}/publication`,
      { method: 'POST', body: { title: textOrNull(title), description: textOrNull(description), showCreatorNickname: Boolean(showCreatorNickname) } },
    ),

    // ── 4. 약관 ──
    // 약관은 서버가 공개로 열어둔 엔드포인트다(SecurityConfig 허용 목록, 토큰 없이 200).
    // 가입 중에는 아직 서비스 토큰이 없으므로 인증 없이 부른다 —
    // authenticated:true 로 두면 약관 화면이 "로그인이 필요해요"로 막혀 가입 자체가 불가능해진다.
    terms: () => request('/api/v1/terms', { authenticated: false }),
    termDetail: (termId) => request(`/api/v1/terms/${termId}`, { authenticated: false }),

    // ── 5. 알림 ──
    notifications: ({ lastId, size, unreadOnly } = {}) => request(`/api/v1/notifications${query({ lastId, size, unreadOnly })}`),
    readNotification: (notificationId) => request(`/api/v1/notifications/${notificationId}/read`, { method: 'PUT' }),
    readAllNotifications: () => request('/api/v1/notifications/read-all', { method: 'PUT' }),
    notificationSettings: () => request('/api/v1/notifications/settings'),
    updateNotificationSettings: (body) => request('/api/v1/notifications/settings', { method: 'PUT', body }),
    kickHistory: (notificationId) => request(`/api/v1/notifications/${notificationId}/kick-history`),

    // ── 6. 프로필 ──
    myProfile: () => request('/api/v1/users/me/profile'),
    updateProfile: (body) => request('/api/v1/users/me/profile', { method: 'PUT', body }),
    // 후보 목록(여행 스타일 12 · 경북 관심 지역 24)을 준다.
    // **토큰이 없어도 200 이다**(2026-08-30 직접 확인) — 서버 시드 그대로라 사용자별 값이 아니다.
    // 그래서 authenticated:false 로 부른다. 06-1 여행 취향은 **가입 전 단계**라 토큰이 없는데,
    // authenticated:true 면 여기서 401 이 나 화면이 후보를 못 그렸다. 그 때문에 두었던
    // 하드코딩 거울 표(SIGNUP_TRAVEL_STYLES · SIGNUP_INTERESTED_REGIONS)는 지웠다 —
    // 서버가 시드를 바꾸면 화면이 따라 바뀌는 게 원래 의도였다(BE 회신 반영 정본 §2-2).
    profileOptions: () => request('/api/v1/users/me/profile/options', { authenticated: false }),

    // ── 7. 친구·차단·도감 ──
    friends: () => request('/api/v1/users/me/friends'),
    // ⚠️ 경로 변수는 friendshipId 가 **아니라** 상대 userId 다
    // (FriendController `@DeleteMapping("/friends/{friendUserId}")` — 직접 확인).
    // 호출부가 없던 동안 드러나지 않던 부류의 실수라 이름을 서버와 같게 맞춰 둔다.
    removeFriend: (friendUserId) => request(`/api/v1/users/me/friends/${friendUserId}`, { method: 'DELETE' }),
    receivedFriendRequests: () => request('/api/v1/users/me/friend-requests/received'),
    sentFriendRequests: () => request('/api/v1/users/me/friend-requests/sent'),
    sendFriendRequest: (userId) => request(`/api/v1/users/me/friend-requests/${userId}`, { method: 'POST' }),
    acceptFriendRequest: (requestId) => request(`/api/v1/users/me/friend-requests/${requestId}/accept`, { method: 'POST' }),
    rejectFriendRequest: (requestId) => request(`/api/v1/users/me/friend-requests/${requestId}/reject`, { method: 'POST' }),
    cancelFriendRequest: (requestId) => request(`/api/v1/users/me/friend-requests/${requestId}`, { method: 'DELETE' }),
    blocks: () => request('/api/v1/users/me/blocks'),
    blockUser: (userId) => request(`/api/v1/users/me/blocks/${userId}`, { method: 'POST' }),
    unblockUser: (userId) => request(`/api/v1/users/me/blocks/${userId}`, { method: 'DELETE' }),
    travelDex: () => request('/api/v1/users/me/travel-dex'),

    // ── 09 홈 날씨 ──
    // 응답: {condition, locationName, fallbackApplied, forecastAt, temperatureCelsius,
    //        humidityPercent, windSpeedMetersPerSecond, precipitationMillimeters, pm10, pm25}
    // 2026-08-25 실측에서 숫자 필드는 전부 null 이다 — 지금 쓸 수 있는 값은 condition 과 locationName 뿐.
    gyeongbukWeather: () => request('/api/v1/weather/gyeongbuk'),
    // 다른 사용자의 공개 프로필. nicknameColor 가 여기서만 내려온다
    // (도감·멤버·동행자 목록 응답에는 없다).
    publicProfile: (userId) => request(`/api/v1/users/${userId}/profile`),
    // 다른 여행자들이 그 사용자에게 남긴 평가. 응답에 여행 제목·작성 시각은 없다.
    receivedTravelReviews: (userId) => request(`/api/v1/users/${userId}/travel-reviews`),

    // ── 8. 피드 ──
    feeds: ({ tab, beforeFeedId, limit } = {}) => request(`/api/v1/feeds${query({ tab, beforeFeedId, limit })}`),
    feedDetail: (feedId) => request(`/api/v1/feeds/${feedId}`),
    // ── 23-1 댓글 목록 · ID 커서 페이지네이션 (2026-09-02 서버 변경) ──
    // 응답이 **배열에서 객체로** 바뀌었다: `{comments: [...], nextId}`.
    // 배열로 다루면 댓글이 0건으로 보인다 — feeds 와 같은 `{목록, nextId}` 모양이므로
    // 호출부도 feeds 와 같은 방식으로 커서를 넘긴다(새 관례를 만들지 않는다).
    //   beforeCommentId — 이 ID 보다 **작은** 최상위 댓글. 첫 요청에서는 생략한다.
    //   limit           — 최상위 댓글 수(기본 20 · 서버가 1~50 으로 보정)
    // 최상위 댓글은 최신 ID 부터 오고, `replies` 는 각 최상위 댓글 안에 그대로 들어 있다
    // (대댓글은 페이지네이션 대상이 아니다). 마지막 페이지면 `nextId` 가 null 이다.
    feedComments: (feedId, { beforeCommentId, limit } = {}) => request(`/api/v1/feeds/${feedId}/comments${query({ beforeCommentId, limit })}`),
    // ── 24 피드 글쓰기 → POST /feeds ──
    // **multipart/form-data 다.** request 파트가 application/json, images 파트가 사진 1~10장이다.
    // application/json 으로 보내면 서버가 500 을 낸다 — createRoom 과 같은 규칙이다.
    // 사진은 **필수**다(스펙 required: images). 한 장도 없으면 부르지 않고 호출부가 막는다 —
    // 공용 플레이스홀더를 올리면 "이미지 없음" 그림이 남의 피드 사진으로 올라간다.
    createFeed: (payload, images = []) => {
      const form = new global.FormData();
      form.append('request', new global.Blob([JSON.stringify(payload)], { type: 'application/json' }));
      images.forEach((file) => form.append('images', file));
      return request('/api/v1/feeds', { method: 'POST', body: form });
    },
    // ── 피드 신고 (2026-08-26 신설) ──
    // 사유 코드와 표시 문구를 서버가 함께 준다 — 클라가 문구를 따로 갖지 않는다.
    feedReportReasons: () => request('/api/v1/feeds/report-reasons'),
    // 204 No Content. details 는 선택이고 최대 300자다.
    // 서로 다른 이용자의 신고 3건이 모이면 서버가 visibility=PRIVATE·hiddenByReports=true 로 바꾼다.
    // 오류(2026-09-03 실서버 재확인): 본인 피드 **400** `40039`("본인이 작성한 피드는 신고할 수 없습니다"),
    // 중복 신고 409 `40917`("이미 신고한 피드입니다"), 없는 피드 404.
    // `details` 301자는 400 `40000`(`size must be between 0 and 300`)이라 화면에서 300자로 자른다.
    // 정본이 처음 403 이라 적었던 자리가 이 400 `40039` 다 — 화면은 코드로 갈라 본다.
    reportFeed: (feedId, { reason, details } = {}) => request(`/api/v1/feeds/${feedId}/reports`, {
      method: 'POST',
      body: details && details.trim() ? { reason, details: details.trim().slice(0, 300) } : { reason },
    }),
    likeFeed: (feedId) => request(`/api/v1/feeds/${feedId}/like`, { method: 'POST' }),
    addFeedComment: (feedId, content, parentCommentId) => request(`/api/v1/feeds/${feedId}/comments`, {
      method: 'POST', body: { content, parentCommentId: parentCommentId || null },
    }),

    // ── 9. 내 모임 ──
    myRooms: (filter) => request(`/api/v1/chat-rooms/my${query({ filter })}`),
    myWaitingRooms: () => request('/api/v1/chat-rooms/my-waiting'),
    myKickHistories: () => request('/api/v1/chat-rooms/my-kick-histories'),

    // ── 9-1. "다녀온 여행" 판정 (27-1 여행 마무리 · 27-4 코스 평가) ──
    // `ended` 만 보면 **불발(CANCELLED) 방**이 걸린다. 실서버 내 방 목록에서 가장 최근 ended 방이
    // CANCELLED 라, 27-1 이 그 방을 잡으면 companions 가 409 를 주고 화면이 통째로 비었다
    // (안드로이드가 먼저 잡은 결함 · 2026-08-30). 다녀온 여행은 `ended && status === 'CONFIRMED'` 다.
    // 서버 조건도 같다 — rateCourse 는 hasCompletedTrip 을, reviewCompanion 은 완료 여행을 요구한다.
    isCompletedTrip(room) {
      return Boolean(room?.ended) && room?.status === 'CONFIRMED';
    },
    // 지금 고른 방이 다녀온 여행이면 그대로, 아니면 가장 최근에 다녀온 여행으로 바꾼다.
    // 다녀온 여행이 하나도 없으면 null 이다 — 아무 방이나 골라주지 않는다.
    async completedTripRoomId(preferredRoomId = api.selectedRoomId()) {
      const rooms = await api.myRooms().catch(() => null);
      if (!Array.isArray(rooms)) return null;
      const completed = rooms.filter((room) => api.isCompletedTrip(room));
      if (preferredRoomId != null
        && completed.some((room) => String(room.roomId) === String(preferredRoomId))) {
        return String(preferredRoomId);
      }
      // 종료일(없으면 시작일) 내림차순 — 가장 최근에 다녀온 여행이 먼저다.
      const latest = [...completed].sort((a, b) => String(b.endDate || b.startDate || '')
        .localeCompare(String(a.endDate || a.startDate || '')))[0];
      return latest ? String(latest.roomId) : null;
    },

    // 하단 `모임` 탭 알림 점 — 참여 중인 방에 **읽지 않은 메시지가 있을 때만** true.
    // 근거는 `GET /chat-rooms/my` 의 `unreadMessageCount` 하나뿐이다.
    // 목록을 못 받으면 false — 모르는 상태를 "알림 있음" 으로 보이면 안 된다.
    // 예전에는 세 표면이 이 점을 **조건 없이 항상** 켰다(사용자가 iOS 에서 지적).
    async hasMeetingAlert() {
      const rooms = await api.myRooms().catch(() => null);
      if (!Array.isArray(rooms)) return false;
      return rooms.some((room) => Number(room?.unreadMessageCount || 0) > 0);
    },

    // ── 10. 회원 탈퇴 — window.MoyeoAuth.withdraw()를 그대로 쓴다 (실호출 주의) ──

    // ── 11. 방 내부 읽기·쓰기 ──
    // 참여 중인 방만 200이고 비참여자는 403이다. 403이면 화면은 목데이터를 그대로 유지한다.
    roomMembers: (roomId) => request(`/api/v1/chat-rooms/${roomId}/members`),
    roomNotices: (roomId) => request(`/api/v1/chat-rooms/${roomId}/notices`),
    roomMessages: (roomId, { beforeMessageId, limit } = {}) => request(`/api/v1/chat-rooms/${roomId}/messages${query({ beforeMessageId, limit })}`),
    roomRoadmap: (roomId) => request(`/api/v1/chat-rooms/${roomId}/roadmap/current`),
    // 텍스트 메시지 전송. 사진·장소·투표·정산·관광 장소는 엔드포인트가 따로다 (아래 12번).
    sendRoomMessage: (roomId, content, { mentionedUserIds = [], replyToMessageId = null } = {}) => request(`/api/v1/chat-rooms/${roomId}/messages`, {
      method: 'POST', body: { content, mentionedUserIds, replyToMessageId },
    }),
    // 공지 등록 — 호스트만. 고정은 서버 정책상 최대 3개.
    createRoomNotice: (roomId, notice, pinned) => request(`/api/v1/chat-rooms/${roomId}/notices`, {
      method: 'POST', body: { notice, pinned: Boolean(pinned) },
    }),
    // 공지 수정·고정 토글. notice·pinned 를 모두 null 로 보내면 서버가 삭제한다.
    updateRoomNotice: (roomId, noticeId, { notice = null, pinned = null } = {}) => request(`/api/v1/chat-rooms/${roomId}/notices/${noticeId}`, {
      method: 'PUT', body: { notice, pinned },
    }),
    // 공지 삭제는 **전용 엔드포인트**다 (PUT 에 null 을 넣는 것이 아니다 — 백엔드 ChatRoomController 확인).
    // 되돌릴 수 없다: 20-3a 는 확인 단계를 거친 뒤에만 부른다.
    deleteRoomNotice: (roomId, noticeId) => request(`/api/v1/chat-rooms/${roomId}/notices/${noticeId}`, { method: 'DELETE' }),

    // ── 12. 20-2 첨부 시트 · 특수 메시지 5종 ──
    // 엔드포인트가 5개로 갈려 있고 본문 규칙이 서로 다르다.
    // 사진만 multipart 다: image 파트가 파일(≤20MB · image/*), caption 파트는 선택이다.
    // 캡션이 비면 파트를 아예 넣지 않는다 — 서버가 빈 캡션 대신 '사진'을 본문으로 채운다.
    shareRoomImage: (roomId, image, caption) => {
      const form = new global.FormData();
      form.append('image', image);
      const text = textOrNull(caption);
      if (text) form.append('caption', text);
      return request(`/api/v1/chat-rooms/${roomId}/messages/images`, { method: 'POST', body: form });
    },
    // 관광 장소 카드. contentId 는 숫자만 유효하다 (TourAPI 샘플의 'CT…' 형식은 서버에 없다).
    shareRoomTourismContent: (roomId, contentId) => request(`/api/v1/chat-rooms/${roomId}/messages/tourism-contents`, {
      method: 'POST', body: { contentId: numberOrNull(contentId) },
    }),
    // 집합 위치 공유는 **본문이 없다** — 서버가 방에 저장된 집합 좌표·안내를 그대로 카드로 만든다.
    // 집합 좌표가 없는 방은 400 이다.
    shareRoomLocation: (roomId) => request(`/api/v1/chat-rooms/${roomId}/messages/locations`, { method: 'POST' }),
    // 투표 개최. 질문 필드명은 title 이 아니라 question 이고 선택지는 2~5개·중복 금지다.
    createRoomPoll: (roomId, { question, options = [], anonymous = true } = {}) => request(`/api/v1/chat-rooms/${roomId}/messages/polls`, {
      method: 'POST', body: { question: textOrNull(question), options, anonymous: Boolean(anonymous) },
    }),
    // 정산 메모 (송금 기능 없음 · 최대 1000자)
    shareRoomSettlementMemo: (roomId, memo) => request(`/api/v1/chat-rooms/${roomId}/messages/settlement-memos`, {
      method: 'POST', body: { memo: textOrNull(memo) },
    }),
    // 투표 참여 — 이미 다른 선택지를 골랐으면 서버가 기존 표를 옮긴다(중복 투표가 아니다).
    votePollOption: (roomId, messageId, optionId) => request(`/api/v1/chat-rooms/${roomId}/messages/${messageId}/poll-options/${optionId}/vote`, { method: 'PUT' }),
    // 투표 취소. 두 응답 모두 갱신된 메시지(투표 카드)를 그대로 돌려준다.
    cancelPollVote: (roomId, messageId) => request(`/api/v1/chat-rooms/${roomId}/messages/${messageId}/vote`, { method: 'DELETE' }),

    // 투표 카드 표시 유틸 — 서버가 비율을 주지 않아 표 수로 계산한다. 아무도 안 골랐으면 0 이다.
    pollPercent(poll, option) {
      const total = numberOrNull(poll?.totalVoteCount) || 0;
      const count = numberOrNull(option?.voteCount) || 0;
      if (total <= 0) return 0;
      return Math.round((count / total) * 100);
    },
    // 내가 고른 선택지. 없으면 null 이다 (취소 버튼을 숨기는 판정에 쓴다).
    myPollOptionId(poll) {
      const mine = (poll?.options || []).find((option) => option?.votedByMe);
      return mine ? mine.optionId : null;
    },

    // ── 13. 방별 알림 설정 (20-1 "이 모임의 알림만 끄기") ──
    // 별도 설정이 없으면 서버 기본값은 켜짐이고, PUT 응답도 { roomId, enabled } 다.
    roomNotificationSetting: (roomId) => request(`/api/v1/notifications/settings/chat-rooms/${roomId}`),
    updateRoomNotificationSetting: (roomId, enabled) => request(`/api/v1/notifications/settings/chat-rooms/${roomId}`, {
      method: 'PUT', body: { enabled: Boolean(enabled) },
    }),

    // ── 14. 17-3 집합 정보 수정 (호스트 · 여행 확정 전까지) ──
    updateMeetingInfo: (roomId, body) => request(`/api/v1/chat-rooms/${roomId}/meeting-info`, { method: 'PUT', body }),
    // 요청 본문 조립. meetingDateTime 은 **필수** 라 화면에 시간 입력 자리가 없으면 방의 현재 값을 그대로 유지한다.
    // 좌표·상세 안내는 nullable 이라 사용자가 지운 값은 null 로 보낸다(문구를 지어내지 않는다).
    buildMeetingInfoRequest(room = {}, patch = {}) {
      const pick = (key) => (Object.prototype.hasOwnProperty.call(patch, key) ? patch[key] : room[key]);
      return {
        meetingLatitude: numberOrNull(pick('meetingLatitude')),
        meetingLongitude: numberOrNull(pick('meetingLongitude')),
        meetingDetails: textOrNull(pick('meetingDetails')),
        meetingDateTime: textOrNull(pick('meetingDateTime')),
      };
    },

    // ── 15. 동행자 (20-1 동행자 · 27-1 여행 마무리) ──
    // 응답은 래핑 객체가 아니라 JSON 배열이다. 완료한 여행만 200 이다.
    roomCompanions: (roomId) => request(`/api/v1/chat-rooms/${roomId}/companions`)
      .then((list) => (Array.isArray(list) ? list.map((item) => api.parseCompanion(item)) : list)),
    parseCompanion(raw) {
      if (!raw || typeof raw !== 'object') return raw;
      return {
        ...raw,
        // mannerRating 은 필드만 있고 값이 null 이다 — null 이면 화면이 매너 표기를 숨긴다.
        mannerRating: numberOrNull(raw.mannerRating),
        mannerScore: numberOrNull(raw.mannerScore),
        oneLineReview: textOrNull(raw.oneLineReview),
        reviewed: Boolean(raw.reviewed),
      };
    },
    // "아직 여행 전"이라 동행자를 읽을 수 없는 상태. 권한 오류가 아니다 —
    // 배포 서버는 409 40915, 로컬 소스는 403 을 준다. 기획에 문구가 없어 화면은 섹션을 숨긴다.
    isBeforeTripError(error) {
      if (!error) return false;
      if (String(error.code ?? '') === '40915') return true;
      return error.status === 403 || error.status === 409;
    },
    // ⚠️ 경로 변수는 companionRecordId 가 아니라 **상대 userId** 다
    // (서버 reviewCompanion 이 participant 존재 여부로 검증한다 — API 리포트와 스펙 설명이 다르다).
    // mannerScore 는 1~5 필수다. 예전에는 기획 27-1 에 점수 입력 자리가 없어 호출할 수가 없었는데,
    // 2026-08-30 기획(ATTACH-COMPOSER-CANON §6-2)에 별점이 생겨 이제 화면이 값을 만든다.
    reviewCompanion: (roomId, companionUserId, { mannerScore, oneLineReview = null } = {}) => request(
      `/api/v1/chat-rooms/${roomId}/companions/${companionUserId}/review`,
      { method: 'PUT', body: { mannerScore: numberOrNull(mannerScore), oneLineReview: textOrNull(oneLineReview) } },
    ),

    // ── 16. 18 모집 관리 · 참가 신청 승인·거절 (호스트) ──
    roomApplications: (roomId) => request(`/api/v1/chat-rooms/${roomId}/applications`),
    approveApplication: (roomId, applicationId) => request(`/api/v1/chat-rooms/${roomId}/applications/${applicationId}/approve`, { method: 'POST' }),
    rejectApplication: (roomId, applicationId) => request(`/api/v1/chat-rooms/${roomId}/applications/${applicationId}`, { method: 'DELETE' }),

    // ── 17. 나가기·내보내기 (파괴적 — QA 데이터 보호를 위해 실호출로 검증하지 않았다) ──
    leaveRoom: (roomId) => request(`/api/v1/chat-rooms/${roomId}/members/me`, { method: 'DELETE' }),
    // 사유는 필수(1~500자)이고 강퇴 이력에 비공개로 저장된다.
    kickRoomMember: (roomId, memberId, reason) => request(`/api/v1/chat-rooms/${roomId}/members/${memberId}`, {
      method: 'DELETE', body: { reason: textOrNull(reason) },
    }),

    // 화면 간 선택 컨텍스트
    selectRoom: (roomId) => remember('moyeo.selectedRoomId', roomId == null ? null : String(roomId)),
    selectedRoomId: () => queryParam('roomId') || recall('moyeo.selectedRoomId'),
    selectFeed: (feedId) => remember('moyeo.selectedFeedId', feedId == null ? null : String(feedId)),
    // ?feedId= 딥링크 진입을 roomId·courseId 와 같은 관례로 받는다.
    // 라이브 캡처는 세션 컨텍스트 없이 화면으로 바로 들어가므로 이 값이 없으면 23·23-1 이 목데이터로 남는다.
    selectedFeedId: () => queryParam('feedId') || recall('moyeo.selectedFeedId'),
    // 12 검색 → 12-1 검색 결과로 넘기는 검색어. ?keyword= 딥링크도 같은 관례로 받는다.
    selectSearchKeyword: (keyword) => remember('moyeo.searchKeyword', keyword == null ? null : String(keyword)),
    selectedSearchKeyword: () => queryParam('keyword') || recall('moyeo.searchKeyword') || '',
    selectCourse: (courseId) => remember('moyeo.selectedCourseId', courseId == null ? null : String(courseId)),
    selectedCourseId: () => queryParam('courseId') || recall('moyeo.selectedCourseId'),
    rememberKickHistory: (history) => remember('moyeo.kickHistory', history),
    recalledKickHistory: () => recall('moyeo.kickHistory', true),
    // 20-1 사이드 메뉴에서 고른 멤버 — 20-1a 멤버 액션·30-2 신고 시트가 이어받는다
    selectMember: (member) => remember('moyeo.selectedMember', member || null),
    selectedMember: () => recall('moyeo.selectedMember', true),
    // ?memberId= 딥링크 진입(roomId·courseId·feedId 와 같은 관례). 20-1 을 거치지 않고 20-1a·20-1b 로
    // 바로 들어오는 라이브 캡처·QA 에서 대상 멤버를 지정한다. 없으면 아무도 고르지 않은 상태다 —
    // 임의의 멤버를 골라주지 않는다(내보내기가 달린 화면이다).
    selectedMemberId: () => queryParam('memberId'),
    // ?userId= 딥링크 진입. 25 프로필 카드는 인앱에서 nav 파라미터로 대상을 받는데,
    // 화면으로 바로 들어오는 라이브 캡처·QA 에는 그 값이 없다. 없으면 null 이라
    // 호출부가 기존 목데이터를 그대로 유지한다 — 아무나 골라주지 않는다.
    selectedUserId: () => queryParam('userId'),
    // 서버 닉네임은 "형용사 동물 숫자" 형식이다. 프로필 이미지가 없을 때 아바타를 여기서 끌어온다.
    // 목데이터의 동물을 그대로 두면 "따스한 기린"인데 곰이 뜬다 — 실제 라이브 캡처에서 나온 상태다.
    // 일러스트는 6종뿐이라 없는 동물은 온보딩과 같은 이모지로 떨어진다.
    avatarForNickname(nickname) {
      const illustrations = { 사슴: 'deer', 거북이: 'turtle', 너구리: 'raccoon', 곰: 'bear', 두루미: 'crane', 토끼: 'rabbit' };
      const emojis = {
        사슴: '🦌', 거북이: '🐢', 토끼: '🐰', 여우: '🦊', 수달: '🦦', 다람쥐: '🐿️',
        고양이: '🐱', 강아지: '🐶', 판다: '🐼', 펭귄: '🐧', 돌고래: '🐬', 부엉이: '🦉',
        참새: '🐦', 알파카: '🦙', 코알라: '🐨', 두루미: '🪽', 해달: '🦦',
        고슴도치: '🦔', 너구리: '🦝', 기린: '🦒', 곰: '🐻',
      };
      const words = String(nickname || '').trim().split(/\s+/);
      // 끝이 숫자면 그 앞이 동물, 아니면 마지막 낱말이 동물이다.
      const animal = /^\d+$/.test(words.at(-1) || '') ? words.at(-2) : words.at(-1);
      if (!animal) return null;
      if (illustrations[animal]) return { kind: illustrations[animal] };
      if (emojis[animal]) return { emoji: emojis[animal] };
      // 서버가 주는 20종은 위 표가 모두 덮는다(실서버 표본 135회, 2026-08-29).
      // 서버가 동물을 새로 추가하면 발자국으로 떨어진다 — 빈 색 판만 남기면 깨진 것처럼 보인다.
      // 안드로이드·iOS 도 같은 값을 쓴다.
      return { emoji: '🐾' };
    },
    // ?memberId= 를 방 멤버 목록에서 찾아 준다. 못 찾으면 null 이라 호출부는 기존 목데이터를 유지한다.
    findRoomMember(roomId, memberId) {
      if (roomId == null || memberId == null) return Promise.resolve(null);
      return api.roomMembers(roomId)
        .then((result) => (result?.members || []).find((item) => String(item.userId) === String(memberId)) || null)
        .catch(() => null);
    },
    // 17-3 집합 장소 화면은 17 모집 만들기(2/5)와 같은 화면이다.
    // 기존 방의 집합 정보를 고치는 진입(호스트)인지 이 값으로 구분한다 — 없으면 모집 만들기 흐름이다.
    selectMeetingEditRoom: (roomId) => remember('moyeo.meetingEditRoomId', roomId == null ? null : String(roomId)),
    meetingEditRoomId: () => recall('moyeo.meetingEditRoomId'),

    // ── 후속 화면이 이어받는 대상 (ATTACH-COMPOSER-CANON §6) ──
    // 확인 시트·수정 화면은 "무엇을" 다루는지가 정해져야 열린다. 대상이 없으면 화면은
    // 안내만 남기고 아무것도 지우지 않는다 — 임의의 항목을 골라주지 않는다.
    // 20-3a 공지 수정·삭제가 이어받는 공지 한 건
    selectNotice: (notice) => remember('moyeo.selectedNotice', notice || null),
    selectedNotice: () => recall('moyeo.selectedNotice', true),
    // 29-1a 차단 해제 확인이 이어받는 차단 상대
    selectBlockedUser: (user) => remember('moyeo.selectedBlockedUser', user || null),
    selectedBlockedUser: () => recall('moyeo.selectedBlockedUser', true),
    // 27-2a 친구 정리가 이어받는 친구
    selectFriend: (friend) => remember('moyeo.selectedFriend', friend || null),
    selectedFriend: () => recall('moyeo.selectedFriend', true),
    // 19-2 참가 신청 취소 확인이 이어받는 신청 건 (roomId · 제목 · 대기 순번)
    selectApplication: (application) => remember('moyeo.selectedApplication', application || null),
    selectedApplication: () => recall('moyeo.selectedApplication', true),
    // 딥링크·라이브 캡처 진입 — 앞 화면을 거치지 않으면 보관소가 비어 있다.
    // memberId·userId 와 같은 관례로 ?파라미터를 받아 서버 목록에서 대상을 찾아 준다.
    // 못 찾으면 null 이라 화면은 안내만 남긴다 — 아무 항목이나 골라주지 않는다.
    selectedNoticeId: () => queryParam('noticeId'),
    findRoomNotice(roomId, noticeId) {
      if (roomId == null || noticeId == null) return Promise.resolve(null);
      return api.roomNotices(roomId)
        .then((result) => [...(result?.pinnedNotices || []), ...(result?.unpinnedNotices || [])]
          .find((item) => String(item.noticeId) === String(noticeId)) || null)
        .catch(() => null);
    },
    selectedFriendUserId: () => queryParam('friendUserId'),
    findFriend(friendUserId) {
      if (friendUserId == null) return Promise.resolve(null);
      return api.friends()
        .then((result) => {
          const match = (result?.friends || []).find((item) => String(item.user?.userId) === String(friendUserId));
          return match ? { userId: match.user.userId, nickname: match.user.nickname, profileImageUrl: match.user.profileImageUrl || null } : null;
        })
        .catch(() => null);
    },
    selectedBlockedUserId: () => queryParam('blockedUserId'),
    findBlockedUser(userId) {
      if (userId == null) return Promise.resolve(null);
      return api.blocks()
        .then((result) => (Array.isArray(result) ? result : []).find((item) => String(item.userId) === String(userId)) || null)
        .catch(() => null);
    },
    // 19-2 는 ?roomId= 만으로도 열린다 — 신청 목록에서 그 방의 대기 순번을 찾아 온다.
    findMyApplication(roomId) {
      if (roomId == null) return Promise.resolve(null);
      return api.myWaitingRooms()
        .then((result) => {
          const match = (Array.isArray(result) ? result : []).find((item) => String(item.roomId) === String(roomId));
          return match ? { roomId: match.roomId, title: match.title, waitlistPosition: match.waitlistPosition ?? null } : null;
        })
        .catch(() => null);
    },

    // 08-A → 08-H 로 넘기는 이메일. 이미 친 주소를 한 번 더 치게 하지 않는다.
    selectResetEmail: (email) => remember('moyeo.resetEmail', email == null ? null : String(email)),
    selectedResetEmail: () => recall('moyeo.resetEmail') || '',

    // ── 17 모집 만들기 5단계가 이어받는 입력값 ──
    // 단계 화면들이 각자 고른 값(코스·일정 유형·인원·승인 방식·집합 장소)을 여기에 쌓고,
    // 17-5 요약이 그대로 읽어 요청을 조립한다.
    roomDraft: () => recall('moyeo.roomDraft', true) || {},
    updateRoomDraft(patch) {
      const next = { ...api.roomDraft(), ...(patch || {}) };
      remember('moyeo.roomDraft', next);
      return next;
    },
    clearRoomDraft: () => remember('moyeo.roomDraft', null),

    // ── 24 피드 글쓰기 5단계가 이어받는 입력값 ──
    // roomDraft 와 달리 **세션 저장소를 쓰지 않는다**: 고른 사진이 File 객체라 JSON 으로 담기지 않는다.
    // 단계 이동은 nav.go 라 페이지가 다시 뜨지 않으므로 메모리에 남아 있다.
    // 새로고침하면 비는데, 그때는 빈 초안으로 다시 시작하는 것이 맞다 —
    // 사용자가 쓴 적 없는 본문이나 사진을 복원해 그대로 게시하면 안 된다.
    feedDraft: () => feedDraftState,
    updateFeedDraft(patch) {
      feedDraftState = { ...feedDraftState, ...(patch || {}) };
      return feedDraftState;
    },
    clearFeedDraft() {
      feedDraftState = {};
      return feedDraftState;
    },

    // 17-2 일정 기본값. 기획 목데이터(출발 · 마감 D-3 · 08:00–18:00 · 07:50 집합)의 구조는 그대로 두고,
    // 지난 날짜는 서버가 거절하므로 오늘 기준 미래 날짜로 계산한다.
    defaultRoomSchedule(now = new Date()) {
      const isoDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const shift = (days) => {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        date.setDate(date.getDate() + days);
        return date;
      };
      const start = shift(14);
      return {
        startDate: isoDate(start),
        endDate: isoDate(shift(15)),
        recruitmentDeadlineDate: isoDate(shift(11)),
        dayTripStartTime: '08:00',
        dayTripEndTime: '18:00',
        meetingTime: '07:50',
      };
    },

    // 17-5 → POST /chat-rooms 요청 본문. 서버 규칙을 여기서 지킨다:
    //  · courseType 은 필수. PUBLIC 이면 courseId, CUSTOM 이면 customCourse 를 함께 보낸다.
    //  · 당일치기(DAY_TRIP)는 endDate 를 **보내지 않고** dayTripStartTime·dayTripEndTime 을 보낸다.
    //  · 1박 이상(OVERNIGHT)은 endDate 만 보내고 시간 필드는 보내지 않는다 (상호배타 · 에러코드 40008).
    buildCreateRoomRequest(draft = {}) {
      const schedule = { ...api.defaultRoomSchedule(), ...draft };
      const dayTrip = draft.tripType !== 'OVERNIGHT';
      const payload = {
        title: draft.title,
        description: draft.description ?? null,
        maxParticipants: draft.maxParticipants,
        tripType: dayTrip ? 'DAY_TRIP' : 'OVERNIGHT',
        startDate: schedule.startDate,
        recruitmentDeadlineDate: schedule.recruitmentDeadlineDate,
        meetingLatitude: numberOrNull(draft.meetingLatitude),
        meetingLongitude: numberOrNull(draft.meetingLongitude),
        meetingDetails: textOrNull(draft.meetingDetails),
        meetingDateTime: `${schedule.startDate}T${clockText(schedule.meetingTime) || '07:50'}:00`,
        participationFee: numberOrNull(draft.participationFee),
        genderRestriction: draft.genderRestriction || 'NONE',
        minimumAge: numberOrNull(draft.minimumAge),
        maximumAge: numberOrNull(draft.maximumAge),
        joinApprovalMode: draft.joinApprovalMode || 'AUTO',
        courseType: draft.courseType === 'CUSTOM' ? 'CUSTOM' : 'PUBLIC',
      };
      if (dayTrip) {
        payload.dayTripStartTime = clockText(schedule.dayTripStartTime) || '08:00';
        payload.dayTripEndTime = clockText(schedule.dayTripEndTime) || '18:00';
      } else {
        payload.endDate = schedule.endDate;
      }
      if (payload.courseType === 'CUSTOM') payload.customCourse = draft.customCourse || null;
      else payload.courseId = numberOrNull(draft.courseId);
      return payload;
    },

    // ── 검색 응답 정규화 (2026-08-24 서버 패치로 9필드 추가) ──
    // favorite·recruitmentDDay·status·meetingDateTime 은 항상 오고,
    // 집합 좌표·집합 안내·당일 여행 시간은 nullable 이다. null 이면 화면이 표기를 숨긴다.
    parseSearchRoom(raw) {
      if (!raw || typeof raw !== 'object') return raw;
      const lat = numberOrNull(raw.meetingLatitude);
      const lng = numberOrNull(raw.meetingLongitude);
      return {
        ...raw,
        favorite: Boolean(raw.favorite),
        recruitmentDDay: numberOrNull(raw.recruitmentDDay),
        status: textOrNull(raw.status),
        meetingLatitude: lat,
        meetingLongitude: lng,
        // 11 탐색 지도 마커는 위·경도가 **둘 다** 있을 때만 찍는다. 한쪽만 오면 제외한다.
        meetingCoord: (lat !== null && lng !== null && !(lat === 0 && lng === 0)) ? { lat, lng } : null,
        meetingDetails: textOrNull(raw.meetingDetails),
        meetingDateTime: textOrNull(raw.meetingDateTime),
        dayTripStartTime: clockText(raw.dayTripStartTime),
        dayTripEndTime: clockText(raw.dayTripEndTime),
      };
    },
    // 검색 결과 → 11 탐색 지도 마커. 좌표가 둘 다 있는 항목만 남기고 라벨은 기획 11 처럼 모집 인원이다.
    // 화면기획 11의 지역 묶음 마커. 원 안 숫자는 **그 자리의 모집 수**다(참가 인원이 아니다).
    // 소수점 첫째 자리(≈10km)로 묶는다 — 안드로이드 meetingClusters()·iOS mapMarkers() 와 같은 규칙.
    roomMarkers(rooms) {
      const order = [];
      const groups = new Map();
      (rooms || []).forEach((room) => {
        const parsed = api.parseSearchRoom(room);
        if (!parsed?.meetingCoord) return;
        const key = `${parsed.meetingCoord.lat.toFixed(1)},${parsed.meetingCoord.lng.toFixed(1)}`;
        if (!groups.has(key)) { groups.set(key, []); order.push(key); }
        groups.get(key).push(parsed);
      });
      return order.map((key) => {
        const group = groups.get(key);
        return {
          lat: group.reduce((sum, item) => sum + item.meetingCoord.lat, 0) / group.length,
          lng: group.reduce((sum, item) => sum + item.meetingCoord.lng, 0) / group.length,
          label: String(group.length),
          // 카드에 그릴 값은 묶음의 첫 모집이다(안드로이드·iOS 와 같은 선택 규칙).
          room: group[0],
        };
      });
    },
    // 모집 상태 배지 문구. 15 모집 상세와 같은 표를 쓴다
    // (10 탐색 목록에 실제로 오는 값은 MOCKDATA-CANON 과 같은 진행중·확정 두 가지다).
    statusLabel(status) {
      return { RECRUITING: '진행중', CONFIRMED: '확정', CANCELLED: '취소됨' }[status] || '';
    },
    // 당일 여행 시간 'HH:mm - HH:mm'. 숙박이면 서버가 둘 다 null 로 주므로 빈 문자열이다(표기 숨김).
    dayTripTimeText(room) {
      const start = clockText(room?.dayTripStartTime);
      const end = clockText(room?.dayTripEndTime);
      if (!start || !end) return '';
      return `${start} - ${end}`;
    },
    // 집합 안내 '08:30 안동역 1번 출구 앞'. meetingDetails 가 null 이면 빈 문자열이다(표기 숨김).
    meetingText(room) {
      const details = textOrNull(room?.meetingDetails);
      if (!details) return '';
      const time = clockText(String(room?.meetingDateTime || '').split('T')[1]);
      // 구분자는 안드로이드·iOS 와 같은 " · " 다. 세 플랫폼이 같은 문구를 쓴다.
      return time ? `${time} · ${details}` : details;
    },

    // 표시 유틸 — 서버 날짜/시간을 화면 문구로
    formatDate(dateText) {
      if (!dateText) return '';
      const date = new Date(`${dateText}T00:00:00`);
      if (Number.isNaN(date.getTime())) return String(dateText);
      const week = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} (${week})`;
    },
    // 'HH:mm:ss'(실제 응답) 과 'HH:mm'(문서) 를 모두 받아 화면 표기용 'HH:mm' 로 만든다.
    formatTime(timeText) {
      if (!timeText) return '';
      return clockText(timeText) || String(timeText).slice(0, 5);
    },
    // ISO 일시 → 'HH:MM' (채팅 말풍선 시간)
    formatClock(dateTimeText) {
      if (!dateTimeText) return '';
      const then = new Date(dateTimeText);
      if (Number.isNaN(then.getTime())) return '';
      return `${String(then.getHours()).padStart(2, '0')}:${String(then.getMinutes()).padStart(2, '0')}`;
    },
    // ISO 일시 → 'YYYY.MM.DD HH:MM' (공지 이력 작성 시각)
    formatDateTime(dateTimeText) {
      if (!dateTimeText) return '';
      const then = new Date(dateTimeText);
      if (Number.isNaN(then.getTime())) return String(dateTimeText);
      const date = `${then.getFullYear()}.${String(then.getMonth() + 1).padStart(2, '0')}.${String(then.getDate()).padStart(2, '0')}`;
      return `${date} ${String(then.getHours()).padStart(2, '0')}:${String(then.getMinutes()).padStart(2, '0')}`;
    },
    formatRelative(dateTimeText) {
      if (!dateTimeText) return '';
      const then = new Date(dateTimeText);
      if (Number.isNaN(then.getTime())) return String(dateTimeText);
      const diffMs = Date.now() - then.getTime();
      const minutes = Math.floor(diffMs / 60000);
      if (minutes < 1) return '방금 전';
      if (minutes < 60) return `${minutes}분 전`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}시간 전`;
      const days = Math.floor(hours / 24);
      if (days === 1) return '어제';
      if (days < 7) return `${days}일 전`;
      return `${then.getFullYear()}.${String(then.getMonth() + 1).padStart(2, '0')}.${String(then.getDate()).padStart(2, '0')}`;
    },
    tripTypeLabel(room) {
      if (!room) return '';
      if (room.tripType === 'DAY_TRIP') return '당일치기';
      const nights = room.tripNights;
      const days = room.tripDays;
      if (nights != null && days != null) return `${nights}박 ${days}일`;
      return '숙박';
    },
  };

  global.MoyeoApi = api;
}(window));
