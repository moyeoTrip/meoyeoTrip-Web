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

  // ── 닉네임 동물 표 (NO-MOCK-CANON R5 · 웹의 유일한 정본) ──
  // 정본은 안드로이드 `ui/components/MoyeoNicknameAnimal.kt` 의 20종 + `🐾` 폴백이고,
  // iOS `mascotEmoji(forNickname:)` · 웹이 같은 표를 쓴다. **화면마다 따로 만들지 않는다.**
  const MOYEO_ANIMAL_ILLUSTRATIONS = { 사슴: 'deer', 거북이: 'turtle', 너구리: 'raccoon', 곰: 'bear', 두루미: 'crane', 토끼: 'rabbit' };
  const MOYEO_ANIMAL_EMOJIS = {
    사슴: '🦌', 거북이: '🐢', 토끼: '🐰', 여우: '🦊', 수달: '🦦', 다람쥐: '🐿️',
    고양이: '🐱', 강아지: '🐶', 판다: '🐼', 펭귄: '🐧', 돌고래: '🐬', 부엉이: '🦉',
    참새: '🐦', 알파카: '🦙', 코알라: '🐨', 두루미: '🪽', 해달: '🦦',
    고슴도치: '🦔', 너구리: '🦝', 기린: '🦒', 곰: '🐻',
  };

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
  // 17-5 에서 고른 모집 대표 사진(File). roomDraft 와 같은 이유로 세션 저장소에 못 담는다
  // (api.roomThumbnail 참고).
  let roomThumbnailState = null;

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
    //
    // ── 커서 페이지네이션 (2026-09-14 서버 추가) ──
    //   cursor — **직전 페이지 마지막 roomId**. 생략하면 첫 페이지다.
    //   limit  — 한 묶음 크기(기본 20).
    // 받은 개수가 limit 보다 **적으면 마지막 페이지**다 — 별도의 nextId 가 없다
    // (피드·댓글의 `{목록, nextId}` 와 모양이 다르니 호출부가 개수로 판정한다).
    //
    // 실서버 확인(2026-09-14): limit=5 로 408·406·405·401·385 → cursor=385 → 364·361·352·341·323
    // → … 이어 붙인 순서가 limit=20 전체 목록(17건)과 한 건씩 일치한다(건너뜀·중복 없음).
    // 호출부(10 탐색)는 그래도 **이미 가진 roomId 를 건너뛰는** 방어를 남긴다 —
    // 서버가 커서를 무시하고 첫 페이지를 다시 주면 같은 카드가 중복되기 때문이다.
    searchRooms: ({ keyword, cursor, limit } = {}) => request(`/api/v1/chat-rooms/search${query({ keyword, cursor, limit })}`)
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
    // 37 탈퇴 사유 목록. `[{reason, displayName}]` — 화면 문구를 서버가 준다.
    // 웹이 같은 다섯 줄을 하드코딩하고 있었다(약관을 하드코딩하던 것과 같은 문제다) —
    // 실서버 확인(2026-09-14 · 200, 5건). 고른 사유는 `DELETE /users/me` 본문으로 보낸다.
    withdrawalReasons: () => request('/api/v1/users/me/withdrawal-reasons'),
    // 26 찜한 코스. 응답은 LikedTravelCourseResponse 배열(courseId·title·description·thumbnail·tags).
    favoriteCourses: () => request('/api/v1/travel-courses/me/favorites'),
    // 14 코스 상세의 찜 토글. 모집 찜(`toggleFavorite`)과 같은 모양으로 `{ favorite, favoriteCount }` 를 준다.
    // 실서버 확인(2026-09-14 · 코스 176 에 두 번 눌러 true/1 → false/0, 원상복구).
    // iOS(`CourseDetailView.swift` `course.detail.favorite`)·안드로이드(`CourseDetailScreen.kt`)에는
    // 이미 있고 **웹에만 없었다** (QA DETAIL-002).
    toggleCourseFavorite: (courseId) => request(`/api/v1/travel-courses/${courseId}/favorite`, { method: 'POST' }),
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
      // 사진은 **호출부가 고른 것만** 올린다. 예전에는 없으면 내장 「이미지 없음」 그림을
      // 대신 올려서, 실사용자 목록에 회색 자리표시자 카드가 진짜 사진인 양 올라갔다
      // (BE-07·BE-21 의 원인, 2026-09-13). 없으면 서버가 400 `40041` 로 알려주게 둔다.
      if (thumbnail) form.append('thumbnail', thumbnail);
      return request('/api/v1/chat-rooms', { method: 'POST', body: form });
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
    // 18-1 경로 수정 · 18-7 이름·소개 수정 — 같은 엔드포인트다 (`PATCH`).
    // 2026-09-04 BE 회신 §5 로 `title`·`description` 선택 필드가 붙었다.
    // **생략하면 기존 값을 유지하는 부분 수정**이라 PUT 이 아니라 PATCH 다.
    // `places` 만 보내던 예전 호출도 그대로 동작한다.
    // 조건: 호스트가 직접 만든 `CUSTOM` 코스이고 **여행 확정 전**일 때만.
    // 저장되면 방에 시스템 메시지가 남고 참가자에게 알림이 간다.
    updateRoomCourse: (roomId, { title, description, places } = {}) => request(`/api/v1/travel-courses/chat-rooms/${roomId}`, {
      method: 'PATCH',
      body: {
        // 안 보낸 것과 빈 문자열은 다르다 — 빈 제목은 서버가 400 으로 막는다.
        ...(title === undefined || title === null ? {} : { title }),
        ...(description === undefined || description === null ? {} : { description }),
        ...(places ? { places } : {}),
      },
    }),
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
    // 종류(code)로 **현재 판본**을 받는다. 설정 화면은 termId 를 알 수 없다 —
    // termId 는 판본이 바뀔 때마다 새로 발급되므로 「이 종류의 약관」을 가리킬 수 없다.
    // 제목 문자열로 찾던 예전 방식은 처리방침 자리에 가입 동의서를 열었다 (QA BE-03).
    termLatest: (code) => request(`/api/v1/terms/latest/${code}`, { authenticated: false }),
    termHistory: (code) => request(`/api/v1/terms/history/${code}`, { authenticated: false }),

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
    // tab: FRIENDS · DISCOVER · **MINE**. MINE 은 2026-09-14 서버가 추가한 것으로
    // (BE-28) **공개 범위와 무관하게 내가 쓴 것만** 준다 — 「내 피드」 화면이 그릴 것이 없어
    // 피드 탭 전체로 떨어지던 문제를 위한 값이다. 실서버 확인: qa02 로 부르면 자기 글 2건
    // (FRIENDS 1 · PUBLIC 1)만 오고, 글이 없는 qa01 은 0건이다 (QA MY-010 · MY-011).
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
    // ── 멤버 신고 (BE-12 · 2026-09-14 실서버 확인) ──
    // 정본 `REPORT-CANON.md` §1 은 "사용자 신고 API 없음"이라고 적고 있었지만, 서버에 생겼다 —
    // `/api-docs` 의 `POST /api/v1/chat-rooms/{roomId}/members/{memberId}/reports` 가 그것이다.
    // 사유 목록도 서버가 코드와 표시 문구를 함께 준다. 클라가 목록을 갖지 않는다.
    // 실서버 사유 8종: HARASSMENT · MONEY_TRANSACTION_SOLICITATION · UNFAIR_SETTLEMENT ·
    // INAPPROPRIATE_BEHAVIOR · IMPERSONATION · NO_SHOW · SPAM · OTHER.
    memberReportReasons: () => request('/api/v1/chat-rooms/member-report-reasons'),
    // 204 No Content. details 는 선택이고 최대 300자다.
    // 오류: 자기 자신 신고 400 `40045`, 중복 신고 409, 참가자가 아니면 403.
    reportMember: (roomId, memberId, { reason, details } = {}) => request(
      `/api/v1/chat-rooms/${roomId}/members/${memberId}/reports`,
      {
        method: 'POST',
        body: details && details.trim() ? { reason, details: details.trim().slice(0, 300) } : { reason },
      },
    ),
    // ── 모집(채팅방) 신고 (BE-12 · 2026-09-14 실서버 확인) ──
    // 멤버 사유 목록과 **다른 목록**이다 — 대상마다 엔드포인트가 따로 있다.
    // 실서버 사유 6종: SPAM · INAPPROPRIATE_CONTENT · MONEY_TRANSACTION_SOLICITATION ·
    // FALSE_INFORMATION · COMMERCIAL_PURPOSE · OTHER.
    roomReportReasons: () => request('/api/v1/chat-rooms/report-reasons'),
    // 204 No Content. details 는 선택이고 최대 300자다.
    // 오류: 본인이 개설한 모집 400 `40044`, 중복 신고 409 `40920`.
    reportRoom: (roomId, { reason, details } = {}) => request(`/api/v1/chat-rooms/${roomId}/reports`, {
      method: 'POST',
      body: details && details.trim() ? { reason, details: details.trim().slice(0, 300) } : { reason },
    }),
    // ── 피드 신고 (2026-08-26 신설) ──
    // 사유 코드와 표시 문구를 서버가 함께 준다 — 클라가 문구를 따로 갖지 않는다.
    feedReportReasons: () => request('/api/v1/feeds/report-reasons'),
    // ── 피드 댓글 신고 (BE-12 · 2026-09-14 실서버 확인) ──
    // 사유 목록은 **피드 신고와 같은** `/api/v1/feeds/report-reasons` 를 쓴다(서버가 같은 enum 을 쓴다).
    // 204 No Content. details 는 선택이고 최대 300자다.
    // 오류: 본인 댓글 400 `40046` · 중복 409 `40922` · 없는 댓글 404 `40422` ·
    //       비공개 피드 403 `40306` · details 301자 400 `40000`.
    reportFeedComment: (feedId, commentId, { reason, details } = {}) => request(
      `/api/v1/feeds/${feedId}/comments/${commentId}/reports`,
      {
        method: 'POST',
        body: details && details.trim() ? { reason, details: details.trim().slice(0, 300) } : { reason },
      },
    ),
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

    // ── 수정·삭제 (2026-09-04 BE 회신으로 열렸다) ──
    // 정본 `docs/api/BACKEND_REQUEST_CHANGES_2026-09-04.md` · 2026-09-07 실서버로 존재 확인.
    //
    // 피드 수정은 **본문만** 받는다 (`{ content }`). 사진도 공개 범위도 이 API 로 못 바꾼다 —
    // 사진은 기존 첨부가 유지되고, 공개 범위는 댓글 쓴 사람이 갑자기 못 보게 되는 것을 막으려
    // 생성 때 정한 값을 그대로 둔다. 그래서 24-6 화면에는 그 둘의 편집 UI 를 두지 않는다.
    // 작성자 본인만 된다. 없는 피드는 404 `40417`.
    updateFeed: (feedId, content) => request(`/api/v1/feeds/${feedId}`, {
      method: 'PUT', body: { content },
    }),
    // 204 No Content. 사진·댓글·좋아요·신고 관계가 함께 정리되고, 커밋 뒤 이미지 파일도 지워진다.
    // **되돌릴 수 없다** — 23-3 확인 단계를 거친 뒤에만 부른다.
    deleteFeed: (feedId) => request(`/api/v1/feeds/${feedId}`, { method: 'DELETE' }),
    // 댓글은 공백 불가 · **최대 500자**다(신고 details 의 300자와 다르다 — 헷갈리기 쉽다).
    // 없는 댓글은 404 `40422`.
    updateFeedComment: (feedId, commentId, content) => request(`/api/v1/feeds/${feedId}/comments/${commentId}`, {
      method: 'PUT', body: { content },
    }),
    // 최상위 댓글을 지우면 **달린 답글도 함께** 사라진다 — 화면이 그 사실을 먼저 알려야 한다.
    deleteFeedComment: (feedId, commentId) => request(`/api/v1/feeds/${feedId}/comments/${commentId}`, {
      method: 'DELETE',
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
    //
    // **요약 객체를 그대로 돌려준다.** 27-4·33 이 판정에 쓰는 값(`myCourseRating` ·
    // `coursePublicationAvailable`)이 이 응답(MyChatRoomSummaryResponse)에만 있어서,
    // id 만 돌려주면 화면이 같은 목록을 한 번 더 불러야 한다.
    async completedTripRoom(preferredRoomId = api.selectedRoomId()) {
      const rooms = await api.myRooms().catch(() => null);
      if (!Array.isArray(rooms)) return null;
      const completed = rooms.filter((room) => api.isCompletedTrip(room));
      if (preferredRoomId != null) {
        const preferred = completed.find((room) => String(room.roomId) === String(preferredRoomId));
        if (preferred) return preferred;
      }
      // 종료일(없으면 시작일) 내림차순 — 가장 최근에 다녀온 여행이 먼저다.
      return [...completed].sort((a, b) => String(b.endDate || b.startDate || '')
        .localeCompare(String(a.endDate || a.startDate || '')))[0] || null;
    },
    async completedTripRoomId(preferredRoomId = api.selectedRoomId()) {
      const room = await api.completedTripRoom(preferredRoomId);
      return room ? String(room.roomId) : null;
    },

    // ── 9-2. 여행 요약이 주는 두 판정값 (2026-09-14 서버 추가) ──
    // 둘 다 **없는 키로 올 수 있다**(배포 전). 없는 값을 「평가함」·「공개 불가」로 읽으면
    // 화면이 거짓말을 하므로, 모를 때는 예전과 같이 굴게 둔다.
    //
    // myCourseRating — 27-4 에서 **내가 이 방에 준 별**. 아직 평가 전이면 null 이다.
    // 이 값이 없던 동안에는 재진입하면 별이 비어 보여, 이미 평가한 사람이 다시 매겼다
    // (서버가 갱신이라 조용히 덮였다 · QA AFTER-016).
    myCourseRating(room) {
      const score = Number(room?.myCourseRating);
      if (!Number.isFinite(score)) return null;
      const rounded = Math.round(score);
      return rounded >= 1 && rounded <= 5 ? rounded : null;
    },
    // coursePublicationAvailable — 33 코스 공개 자격. **이미 공개한 코스에는 false** 다.
    // 키가 아예 없으면(배포 전) 막지 않는다 — 공개할 수 있는 코스까지 닫히면 더 나쁘다.
    canPublishCourse(room) {
      return room?.coursePublicationAvailable !== false;
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
    //
    // BE-30: `expectedUpdatedAt`(선택)에 **내가 읽은 공지의 `updatedAt`** 을 실으면, 그 사이 남이
    // 먼저 고쳤을 때 서버가 409 `40923` 으로 거절한다(안 실으면 예전처럼 마지막 쓰기가 이긴다).
    // **값이 없으면 키를 아예 뺀다** — null 은 검사하지 않는 것과 같지만 없는 키가 뜻이 분명하다.
    updateRoomNotice: (roomId, noticeId, { notice = null, pinned = null, expectedUpdatedAt = null } = {}) => request(`/api/v1/chat-rooms/${roomId}/notices/${noticeId}`, {
      method: 'PUT', body: { notice, pinned, ...(expectedUpdatedAt ? { expectedUpdatedAt } : {}) },
    }),
    // 공지 삭제는 **전용 엔드포인트**다 (PUT 에 null 을 넣는 것이 아니다 — 백엔드 ChatRoomController 확인).
    // 되돌릴 수 없다: 20-3a 는 확인 단계를 거친 뒤에만 부른다.
    deleteRoomNotice: (roomId, noticeId) => request(`/api/v1/chat-rooms/${roomId}/notices/${noticeId}`, { method: 'DELETE' }),
    // 내 메시지 삭제 — 204 No Content. 참가자가 **자기 메시지만** 지울 수 있다
    // (시스템 메시지·남의 메시지는 안 된다). 행을 지우지 않고 본문을
    // `삭제된 메시지입니다` 로 바꾸므로 **id·보낸 사람·보낸 시각·답글 관계는 그대로 남는다.**
    // 없는 메시지는 404 `40423`.
    deleteRoomMessage: (roomId, messageId) => request(`/api/v1/chat-rooms/${roomId}/messages/${messageId}`, {
      method: 'DELETE',
    }),
    // 18-6 모집 내용 수정 — **multipart/form-data · PATCH** 다.
    // request 파트가 application/json, 새 대표 사진은 선택적 `thumbnail` 파일 파트다.
    // 썸네일을 생략하면 기존 값을 유지하므로 PUT 이 아니라 PATCH 다(비우는 길은 없다).
    // **모집 중인 방의 호스트만** 된다 — 남의 방은 403 `40307`, 없는 방은 404 `40405`.
    // 최대 인원을 현재 참가자 수보다 작게 줄일 수 없다.
    // 저장되면 방에 `호스트가 모집 정보를 수정했어요.` 시스템 메시지가 남는다.
    updateRoom: (roomId, payload, thumbnail = null) => {
      const form = new global.FormData();
      form.append('request', new global.Blob([JSON.stringify(payload)], { type: 'application/json' }));
      if (thumbnail) form.append('thumbnail', thumbnail);
      return request(`/api/v1/chat-rooms/${roomId}`, { method: 'PATCH', body: form });
    },

    // ── 12. 20-2 첨부 시트 · 특수 메시지 5종 ──
    // 엔드포인트가 5개로 갈려 있고 본문 규칙이 서로 다르다.
    // 사진만 multipart 다: image 파트가 파일(≤20MB · image/*), caption 파트는 선택이다.
    // 캡션이 비면 파트를 아예 넣지 않는다 — 서버가 빈 캡션 대신 '사진'을 본문으로 채운다.
    //
    // **캡션은 반드시 Blob 으로 넣는다.** 서버가 `@RequestPart("caption") caption: String?` 로 받는데,
    // 브라우저 FormData 의 평문 파트에는 Content-Type 이 붙지 않아 Spring 이
    // `application/octet-stream` 으로 보고 String 변환기를 못 찾는다 — 설명을 넣으면
    // **항상 400 `40033`** 이었다 (W-01, 2026-09-13 실서버로 재현·확인).
    // `text/plain` 을 붙이면 같은 요청이 201 로 통과한다.
    shareRoomImage: (roomId, image, caption) => {
      const form = new global.FormData();
      form.append('image', image);
      const text = textOrNull(caption);
      if (text) form.append('caption', new global.Blob([text], { type: 'text/plain;charset=utf-8' }));
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
    // 대기열 — 정원이 찬 방에서 호스트가 승인하면 멤버가 아니라 이 줄에 선다
    // (`ApprovalResult.WAITLISTED`). `position` 1 이 자리가 나면 자동 합류할 사람이다.
    // 호스트가 아니면 403, 없는 방이면 404 — 화면은 그 실패를 목록 없음으로 되돌리지 않는다.
    roomWaitlist: (roomId) => request(`/api/v1/chat-rooms/${roomId}/applications/waitlist`),
    // 거절 기록 — 호스트가 거절한 신청이 최신순으로 쌓인다.
    // 응답: [{applicationId, applicationMessage, applicant, appliedAt, rejectedAt}]
    // 실서버 확인(2026-09-14 · `GET /chat-rooms/351/applications/rejected` → 200 `[]`).
    // 예전에 이 자리를 「조회 API 자체가 없다」고 적었는데 **틀린 말이었다** — 화면에 없는 것을
    // 서버에 없는 것으로 옮겨 적은 것이다. 적기 전에 실서버로 불러 본다 (QA HOST-010).
    roomRejectedApplications: (roomId) => request(`/api/v1/chat-rooms/${roomId}/applications/rejected`),

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
      const animal = api.animalFromNickname(nickname);
      if (!animal) return null;
      if (MOYEO_ANIMAL_ILLUSTRATIONS[animal]) return { kind: MOYEO_ANIMAL_ILLUSTRATIONS[animal] };
      // 서버가 주는 20종은 표가 모두 덮는다(실서버 표본 135회, 2026-08-29).
      // 서버가 동물을 새로 추가하면 발자국으로 떨어진다 — 빈 색 판만 남기면 깨진 것처럼 보인다.
      // 안드로이드·iOS 도 같은 값을 쓴다.
      return { emoji: api.mascotEmojiForAnimal(animal) };
    },
    // 닉네임에서 동물 낱말만 떼어 낸다. 끝이 숫자면 그 앞이 동물, 아니면 마지막 낱말이 동물이다.
    animalFromNickname(nickname) {
      const words = String(nickname || '').trim().split(/\s+/);
      return (/^\d+$/.test(words.at(-1) || '') ? words.at(-2) : words.at(-1)) || null;
    },
    // 동물 → 이모지. **이 표가 웹의 유일한 정본이다** (NO-MOCK-CANON R5).
    // 예전에는 07 닉네임 고르기(`screens-onboarding.jsx`)가 자기 표를 따로 들고 있었고
    // 거기에는 `곰` 이 빠져 있어, 서버가 「곰」 닉네임을 주면 온보딩만 발자국으로 떨어졌다.
    mascotEmojiForAnimal(animal) {
      return MOYEO_ANIMAL_EMOJIS[animal] || '🐾';
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
          // `lastActive` 까지 들고 온다 — 27-2a 시트의 부제가 iOS·안드로이드와 같은 근거여야 한다
          // (앱 둘은 「4일 전 접속」을 적는데 웹만 닉네임뿐이었다).
          return match ? {
            userId: match.user.userId,
            nickname: match.user.nickname,
            profileImageUrl: match.user.profileImageUrl || null,
            lastActive: match.lastActive || null,
            introduction: match.user.introduction || null,
          } : null;
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
    // **그대로 돌려준다.** 기본값을 여기서 섞으면 「담은 것만 들어 있다」는 성질이 깨지고
    // `clearRoomDraft()` 뒤에도 값이 남는다(계약 테스트가 그것을 지킨다).
    // 날짜 기본값은 **읽는 쪽**(일정 단계·요약 조립)에서 채운다.
    roomDraft: () => recall('moyeo.roomDraft', true) || {},
    updateRoomDraft(patch) {
      const next = { ...api.roomDraft(), ...(patch || {}) };
      remember('moyeo.roomDraft', next);
      return next;
    },
    clearRoomDraft() {
      roomThumbnailState = null; // 사진도 함께 버린다 — 다음 모집에 지난 사진이 붙으면 안 된다
      return remember('moyeo.roomDraft', null);
    },

    // 17-5 대표 사진. `roomDraft` 와 달리 **세션 저장소를 쓰지 않는다**: File 객체라 JSON 으로
    // 담기지 않는다(피드 초안과 같은 이유). 단계 이동은 nav.go 라 페이지가 다시 뜨지 않으므로
    // 메모리에 남아 있다 — 예전에는 5/5 화면 state 에만 있어서 「이전」 한 번에 사라졌다(W-127).
    // 새로고침하면 비는데, 그때는 다시 고르게 하는 것이 맞다(고른 적 없는 사진을 올리지 않는다).
    roomThumbnail: () => roomThumbnailState,
    setRoomThumbnail(file) {
      roomThumbnailState = file || null;
      return roomThumbnailState;
    },

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
    // 여행 날짜·모집 마감일의 **폼 기본값 정본** — 출발 2주 뒤 · 마감 출발 3일 전.
    // iOS `RecruitmentDraft.defaultStartDate` · 안드 `defaultTravelDate()` 가 같은 규칙을 쓴다.
    // 예전에는 앱 둘만 날짜를 비워 둬서 17-6 요약의 「마감」이 앱에서만 비었다
    // (사용자 지적 2026-09-09).
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
        // **서버 필수**다 — `@NotNull` + `@Min(3)`. 빠뜨리면 400 「minimumParticipants 필드는
        // 필수입니다.」로 모집 생성이 통째로 막힌다(2026-09-10 실서버 스펙으로 확인).
        // 17-4 가 초안에 `minParticipants` 를 넣어 준다. 그 단계를 건너뛴 진입에서는
        // 화면이 보여주는 기본값(3)과 같은 값을 쓴다 — 화면과 요청을 어긋나게 두지 않는다.
        minimumParticipants: Math.max(3, Number(draft.minParticipants) || 3),
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
        // 범위를 벗어난 값(999 등)도 거른다 — `new maps.LatLng(999, 999)` 하나가 섞이면
        // 카카오 SDK 가 던지면서 **그 화면의 마커가 전부 사라진다** (W-24).
        meetingCoord: (lat !== null && lng !== null && !(lat === 0 && lng === 0)
          && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) ? { lat, lng } : null,
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
    // ISO 일시 → 'YYYY.MM.DD' (날짜만 · 13-2 강퇴 이력 목록)
    //
    // 강퇴는 **자리가 둘이고 기대값이 반대**다 (정본 RELATIVE-TIME-CANON 「강퇴는 자리가 둘이다」):
    // 통지 줄(내게 일어난 일 한 줄)은 상대 시각(`어제 · 호스트 결정`)이고, **이력 목록**(여러 건을
    // 훑는 표)은 기록을 대조하는 자리라 **절대 날짜, 날짜까지만**이다. 웹만 `formatDateTime` 을
    // 써서 `2026.09.12 17:11` 로 시:분이 붙어 있었다(2026-09-14 검증에서 발견).
    //
    // formatDate 를 쓰지 않는 이유: 그쪽은 `2026.09.12 (토)` 로 요일을 붙인다. 네이티브 둘은
    // 요일을 붙이지 않는다. 그리고 **문자열 앞 10자를 그대로 자른다**
    // (iOS `KickHistoryView.kickedAtText` · 안드 `row.kickedAt.take(10).replace('-','.')`).
    // Date 로 파싱해 지역 시간대로 옮기면 자정 근처에서 하루가 밀려 세 플랫폼이 다른 날짜를 낸다 —
    // 같은 방식으로 자른다.
    formatDateOnly(dateTimeText) {
      if (!dateTimeText) return '';
      const text = String(dateTimeText);
      const datePart = text.split('T')[0];
      return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart.replace(/-/g, '.') : text;
    },
    // ISO 일시 → 'YYYY.MM.DD HH:MM' (공지 이력 작성 시각)
    formatDateTime(dateTimeText) {
      if (!dateTimeText) return '';
      const then = new Date(dateTimeText);
      if (Number.isNaN(then.getTime())) return String(dateTimeText);
      const date = `${then.getFullYear()}.${String(then.getMonth() + 1).padStart(2, '0')}.${String(then.getDate()).padStart(2, '0')}`;
      return `${date} ${String(then.getHours()).padStart(2, '0')}:${String(then.getMinutes()).padStart(2, '0')}`;
    },
    // 공지 작성 시각 — 「8월 29일 오후 1:02」.
    // 기획(`5월 20일 오후 2:14`)·iOS(`ServerDateTime.noticeTimeText`)·
    // 안드로이드(`moyeoNoticeTime`)가 같은 꼴을 쓴다. 예전에는 웹만 `2026.08.29 13:02`
    // 라서 같은 카드가 표면마다 다른 시각 표기로 찍혔다 (20-3, 2026-09-09).
    formatNoticeTime(dateTimeText) {
      if (!dateTimeText) return '';
      const then = new Date(dateTimeText);
      if (Number.isNaN(then.getTime())) return String(dateTimeText);
      const hour24 = then.getHours();
      const meridiem = hour24 < 12 ? '오전' : '오후';
      const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
      const minute = String(then.getMinutes()).padStart(2, '0');
      return `${then.getMonth() + 1}월 ${then.getDate()}일 ${meridiem} ${hour12}:${minute}`;
    },
    // 채팅 날짜 구분선. 말풍선에는 'HH:MM' 만 있어서 어제 온 메시지와 오늘 온 메시지가
    // 같은 시각으로 나란히 보였다 — 며칠 전 약속을 오늘 것으로 읽게 된다 (W-38).
    // 같은 날인지 가르는 열쇠(chatDayKey)와 구분선 문구(formatChatDay)를 함께 둔다.
    chatDayKey(dateTimeText) {
      if (!dateTimeText) return '';
      const then = new Date(dateTimeText);
      if (Number.isNaN(then.getTime())) return '';
      return `${then.getFullYear()}-${then.getMonth() + 1}-${then.getDate()}`;
    },
    formatChatDay(dateTimeText) {
      if (!dateTimeText) return '';
      const then = new Date(dateTimeText);
      if (Number.isNaN(then.getTime())) return '';
      const today = new Date();
      const sameDay = (a, b) => a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
      const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      if (sameDay(then, today)) return '오늘';
      if (sameDay(then, yesterday)) return '어제';
      const week = ['일', '월', '화', '수', '목', '금', '토'][then.getDay()];
      return `${then.getFullYear()}년 ${then.getMonth() + 1}월 ${then.getDate()}일 (${week})`;
    },
    // 「이 글이 언제 쓰였나」 — 세 플랫폼이 **같은 문자열**을 낸다 (정본 RELATIVE-TIME-CANON).
    //
    // 예전에는 7일이 넘으면 `2026.09.07` 같은 절대 날짜로 떨어졌다. 사용자 결정(2026-09-14)으로
    // `N개월 전`·`N년 전`까지 상대 시각을 이어 간다 — 절대 날짜로 떨어지지 않는다.
    //
    // 전부 **버림(floor)** 이다: 90분은 `2시간 전`이 아니라 `1시간 전`.
    // `개월` = 경과 일수 / 30, `년` = 경과 일수 / 365 — **달력 계산이 아니다.**
    // 세 플랫폼이 같은 값을 내는 것이 정확한 달수보다 중요하다(정본 명시).
    //
    // 년으로 넘어가는 경계는 `365일`이지 `12개월`이 아니다. 정본 표본이
    // `364일 → 12개월 전` · `365일 → 1년 전` 로 못 박혀 있어, days/30 이 12 가 되는
    // 360일에 년으로 넘기면 `360~364일` 이 `0년 전`이 된다.
    //
    // 미래 시각(시계 오차 등)은 `방금 전`이다 — 「-3분 전」 같은 문자열을 만들지 않는다.
    // 파싱 실패는 받은 문자열을 그대로 돌려준다(지어내지 않는다).
    formatRelative(dateTimeText) {
      if (!dateTimeText) return '';
      const then = new Date(dateTimeText);
      if (Number.isNaN(then.getTime())) return String(dateTimeText);
      const diffMs = Date.now() - then.getTime();
      if (diffMs < 0) return '방금 전';
      const minutes = Math.floor(diffMs / 60000);
      if (minutes < 1) return '방금 전';
      if (minutes < 60) return `${minutes}분 전`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}시간 전`;
      const days = Math.floor(hours / 24);
      if (days === 1) return '어제';
      if (days < 30) return `${days}일 전`;
      if (days < 365) return `${Math.floor(days / 30)}개월 전`;
      return `${Math.floor(days / 365)}년 전`;
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
