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

  const api = {
    live,
    deterministicParams,

    // ── 1. 모임 검색·상세 ──
    searchRooms: ({ keyword, limit } = {}) => request(`/api/v1/chat-rooms/search${query({ keyword, limit })}`),
    roomDetail: (roomId) => request(`/api/v1/chat-rooms/${roomId}`),
    joinEligibility: (roomId) => request(`/api/v1/chat-rooms/${roomId}/join-eligibility`),

    // ── 2. 참가 신청·취소·찜 ──
    applyToRoom: (roomId, applicationMessage) => request(`/api/v1/chat-rooms/${roomId}/applications`, {
      method: 'POST', body: { applicationMessage: applicationMessage || null },
    }),
    cancelMyApplication: (roomId) => request(`/api/v1/chat-rooms/${roomId}/applications/me`, { method: 'DELETE' }),
    toggleFavorite: (roomId) => request(`/api/v1/chat-rooms/${roomId}/favorite`, { method: 'POST' }),

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
    // 텍스트 메시지 전송 (사진·장소·투표·정산 등 특수 메시지는 별도 엔드포인트라 아직 연결하지 않는다)
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

    // 화면 간 선택 컨텍스트
    selectRoom: (roomId) => remember('moyeo.selectedRoomId', roomId == null ? null : String(roomId)),
    selectedRoomId: () => queryParam('roomId') || recall('moyeo.selectedRoomId'),
    selectFeed: (feedId) => remember('moyeo.selectedFeedId', feedId == null ? null : String(feedId)),
    selectedFeedId: () => recall('moyeo.selectedFeedId'),
    selectCourse: (courseId) => remember('moyeo.selectedCourseId', courseId == null ? null : String(courseId)),
    selectedCourseId: () => queryParam('courseId') || recall('moyeo.selectedCourseId'),
    rememberKickHistory: (history) => remember('moyeo.kickHistory', history),
    recalledKickHistory: () => recall('moyeo.kickHistory', true),
    // 20-1 사이드 메뉴에서 고른 멤버 — 20-1a 멤버 액션·30-2 신고 시트가 이어받는다
    selectMember: (member) => remember('moyeo.selectedMember', member || null),
    selectedMember: () => recall('moyeo.selectedMember', true),

    // 표시 유틸 — 서버 날짜/시간을 화면 문구로
    formatDate(dateText) {
      if (!dateText) return '';
      const date = new Date(`${dateText}T00:00:00`);
      if (Number.isNaN(date.getTime())) return String(dateText);
      const week = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} (${week})`;
    },
    formatTime(timeText) {
      if (!timeText) return '';
      return String(timeText).slice(0, 5);
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
