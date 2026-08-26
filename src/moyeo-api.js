// MoyeoTrip 도메인 API 클라이언트.
// window.MoyeoAuth.request()를 감싸는 thin wrapper 모음이다 (토큰 첨부·401 refresh는 auth-api가 처리).
// 화면들은 live()가 true일 때만 서버 데이터로 목데이터를 대체한다 —
// 미로그인이거나 캡처 라우트(?screen= / ?route= / mockAuth / capture / uitest)면 항상 false라
// 기존 프로토타입 화면이 그대로 유지된다 (캡처 회귀 금지).
(function bootstrapMoyeoApi(global) {
  // 캡처·QA 라우트 판정. 지도 모듈(kakao-map.js isCaptureMode)과 같은 기준을 쓴다 —
  // ?screen= / ?route= 는 QA 캡처의 공통 진입점이라 네트워크를 타면 캡처가 비결정적으로 깨진다.
  // ?liveData=1 은 개발자용 예외 — 캡처 도구는 이 값을 절대 붙이지 않는다.
  function deterministicParams() {
    try {
      const params = new URLSearchParams(global.location?.search || '');
      if (params.get('liveData') === '1') return false;
      return params.get('mockAuth') === '1'
        || params.get('capture') === '1'
        || params.get('uitest') === '1'
        || Boolean(params.get('screen'))
        || Boolean(params.get('route'));
    } catch (_) {
      return false;
    }
  }

  // 로그인 세션이 있고, 목/캡처 모드가 아닐 때만 true.
  function live() {
    if (deterministicParams()) return false;
    const auth = global.MoyeoAuth;
    if (!auth?.request) return false;
    try {
      if (auth.getConfig?.().mockBackend) return false;
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

  function request(path, options = {}) {
    return global.MoyeoAuth.request(path, { authenticated: true, ...options });
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

  const api = {
    live,
    deterministicParams,

    // ── 1. 모임 검색·상세 ──
    // 응답은 래핑 객체가 아니라 JSON 배열이다. 항목은 parseSearchRoom 으로 정규화해서 넘긴다.
    searchRooms: ({ keyword, limit } = {}) => request(`/api/v1/chat-rooms/search${query({ keyword, limit })}`)
      .then((rooms) => (Array.isArray(rooms) ? rooms.map((room) => api.parseSearchRoom(room)) : rooms)),
    roomDetail: (roomId) => request(`/api/v1/chat-rooms/${roomId}`),

    // ── 2. 참가 신청·취소·찜 ──
    applyToRoom: (roomId, applicationMessage) => request(`/api/v1/chat-rooms/${roomId}/applications`, {
      method: 'POST', body: { applicationMessage: applicationMessage || null },
    }),
    cancelMyApplication: (roomId) => request(`/api/v1/chat-rooms/${roomId}/applications/me`, { method: 'DELETE' }),
    toggleFavorite: (roomId) => request(`/api/v1/chat-rooms/${roomId}/favorite`, { method: 'POST' }),

    // ── 2-1. 17 모집 만들기 ──
    // multipart 요청이다: request 파트가 application/json, thumbnail 파트는 선택.
    // 성공 응답은 201 { roomId } — 호출부는 그 roomId 로 15 모집 상세로 이동한다.
    createRoom: (payload, thumbnail) => {
      const form = new global.FormData();
      form.append('request', new global.Blob([JSON.stringify(payload)], { type: 'application/json' }));
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
    courseDetail: (courseId) => request(`/api/v1/travel-courses/${courseId}`),

    // ── 4. 약관 ──
    terms: () => request('/api/v1/terms'),
    termDetail: (termId) => request(`/api/v1/terms/${termId}`),

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
    profileOptions: () => request('/api/v1/users/me/profile/options'),

    // ── 7. 친구·차단·도감 ──
    friends: () => request('/api/v1/users/me/friends'),
    removeFriend: (friendId) => request(`/api/v1/users/me/friends/${friendId}`, { method: 'DELETE' }),
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
    feedComments: (feedId) => request(`/api/v1/feeds/${feedId}/comments`),
    likeFeed: (feedId) => request(`/api/v1/feeds/${feedId}/like`, { method: 'POST' }),
    addFeedComment: (feedId, content, parentCommentId) => request(`/api/v1/feeds/${feedId}/comments`, {
      method: 'POST', body: { content, parentCommentId: parentCommentId || null },
    }),

    // ── 9. 내 모임 ──
    myRooms: (filter) => request(`/api/v1/chat-rooms/my${query({ filter })}`),
    myWaitingRooms: () => request('/api/v1/chat-rooms/my-waiting'),
    myKickHistories: () => request('/api/v1/chat-rooms/my-kick-histories'),

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
    // mannerScore 는 1~5 필수라 기획 27-1 에 점수 입력 자리가 생기기 전에는 호출할 수 없다.
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
      return null;
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
    roomMarkers(rooms) {
      return (rooms || [])
        .map((room) => {
          const parsed = api.parseSearchRoom(room);
          if (!parsed?.meetingCoord) return null;
          return {
            lat: parsed.meetingCoord.lat,
            lng: parsed.meetingCoord.lng,
            label: parsed.participantCount == null ? '' : String(parsed.participantCount),
            room: parsed,
          };
        })
        .filter(Boolean);
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
      return time ? `${time} ${details}` : details;
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
