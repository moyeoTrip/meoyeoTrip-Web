// Global router/prototype layer for 모여트립
// Exposes window.useNav() returning {go, back, openModal, closeModal, route, modal, like, isLiked}
// And window.PrototypePhone — a wrapper that gives any artboard a navigable router context.

(function () {
  const { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } = React;

  const NavCtx = createContext(null);

  // Map of route key → screen component (filled in once all screens are loaded)
  function getScreens() {
    return {
      splash: window.ScreenSplash,
      onboarding: window.ScreenOnboarding,
      'prof-1': window.ScreenProfileNickname,
      'prof-2': window.ScreenProfileCharacter,
      'prof-3': window.ScreenProfileBasic,
      'prof-4': window.ScreenProfileTaste,
      login: window.ScreenLogin,
      'email-auth': window.ScreenEmailAuth,
      terms: window.ScreenTerms,
      'terms-detail': window.ScreenTermsDetail,
      'terms-history': window.ScreenTermsHistory,
      'terms-privacy': window.ScreenTermsPrivacy,
      'terms-marketing': window.ScreenTermsMarketing,
      'terms-settings': window.ScreenTermsSettings,
      'privacy-settings': window.ScreenPrivacySettings,
      'marketing-settings': window.ScreenMarketingSettings,
      home: window.ScreenHome,
      explore: window.ScreenExplore,
      'explore-map': window.ScreenExploreMap,
      search: window.ScreenSearch,
      'search-results': window.ScreenSearchResults,   // 12-1 검색 결과 (코스·모집)
      notif: window.ScreenNotifications,
      'removal-reason': window.ScreenRemovalReason,
      course: window.ScreenCourseDetail,
      detail: window.ScreenGroupDetail,
      apply: window.ScreenApplySheet,
      'create-review': window.ScreenCreateReview,
      'custom-course': window.ScreenCustomCourse,
      'place-search': window.ScreenPlaceSearch,
      'place-detail': window.ScreenPlaceDetail,
      'create-schedule': window.ScreenCreateSchedule,
      'create-people': window.ScreenCreatePeople,
      // 17-4a · 17-4b 캡처용 — 인원수별 멘트 변형 3단계 중 양 끝을 열어 둔다.
      // 기본값(17-4 · 최대 5명 → 단체 사진 멘트)은 위 create-people 이 그대로 담당한다.
      'create-people-small': () => React.createElement(window.ScreenCreatePeople, { initialMax: 4 }),
      'create-people-large': () => React.createElement(window.ScreenCreatePeople, { initialMax: 10 }),
      'create-detail': window.ScreenCreateDetail,
      'create-meet': window.ScreenCreateMeetPoint,
      'create-summary': window.ScreenCreateSummary,
      'create-summary-linked': window.ScreenCreateSummaryLinked,
      'course-edit': window.ScreenCourseEdit,
      'course-edit-custom': window.ScreenCourseEdit,
      'course-edit-linked': window.ScreenCourseEditLinked,
      'course-edit-locked': window.ScreenCourseEditLocked,
      'host-manage': window.ScreenHostManage,
      'chat-list': window.ScreenChatList,
      'chat-list-applied': window.ScreenChatListApplied,
      chat: window.ScreenChatRoom,
      'chat-menu': window.ScreenChatMenu,
      'member-actions': window.ScreenMemberActions,
      'member-remove': window.ScreenMemberRemove,
      'chat-attach': window.ScreenChatAttach,
      // 20-2a~20-2f 첨부 작성 화면 (ATTACH-COMPOSER-CANON §1)
      'attach-photo': window.ScreenAttachPhoto,
      'attach-place': window.ScreenAttachPlace,
      'attach-map': window.ScreenAttachMap,
      'attach-poll': window.ScreenAttachPoll,
      'attach-settlement': window.ScreenAttachSettlement,
      'attach-notice': window.ScreenAttachNotice,
      'notice-history': window.ScreenNoticeHistory,
      // 20-3a 공지 수정 · 삭제 (호스트)
      'notice-edit': window.ScreenNoticeEdit,
      // 20-1c 이 모임 알림 (전역 방해금지 29-2 와 다른 화면이다)
      'room-notif': window.ScreenRoomNotification,
      'leave-alert': window.ScreenLeaveAlert,
      // 31-1 참가자 나가기 — 같은 화면을 역할만 바꿔 연다 (ATTACH-COMPOSER-CANON §6-5)
      'leave-member': window.ScreenLeaveMember,
      // ATTACH-COMPOSER-CANON §6 신설 화면
      'password-reset': window.ScreenPasswordReset,     // 08-H 비밀번호 재설정
      'kick-history': window.ScreenKickHistory,         // 13-2 내보내진 기록
      'trip-status': window.ScreenTripStatus,           // 18-4 여행 확정 / 불발 (호스트)
      'meeting-edit': window.ScreenMeetingEdit,         // 18-5 집합 정보 수정 (호스트)
      'apply-cancel': window.ScreenApplyCancel,         // 19-2 참가 신청 취소 확인
      'favorite-rooms': window.ScreenFavoriteRooms,     // 26-1 찜한 모집
      'favorite-courses': window.ScreenFavoriteCourses, // 26 찜한 코스
      'my-feeds': window.ScreenMyFeeds,                 // 26-2 내 피드
      'course-rating': window.ScreenCourseRating,       // 27-4 코스 평가
      'friend-manage': window.ScreenFriendManage,       // 27-2a 친구 정리
      'unblock-confirm': window.ScreenUnblockConfirm,   // 29-1a 차단 해제 확인
      states: window.ScreenStates,
      msgs: window.ScreenSpecialMessages,
      feed: window.ScreenFeed,
      'feed-detail': window.ScreenFeedDetail,
      'feed-write': window.ScreenFeedWrite,
      'feed-write-1': window.ScreenFeedWriteStep1,   // 24-1 코스 확인
      'feed-write-2': window.ScreenFeedWriteStep2,   // 24-2 사진 선택
      'feed-write-3': window.ScreenFeedWriteStep3,   // 24-3 사진과 메모
      'feed-write-4': window.ScreenFeedWriteStep4,   // 24-4 공개 설정
      'feed-write-5': window.ScreenFeedWriteStep5,   // 24-5 최종 확인
      'public-profile': window.ScreenPublicProfile,
      // 25-1 캡처용 — 뒤집힌 상태로 진입한다 (실사용 기본값은 앞면)
      'public-profile-back': () => React.createElement(window.ScreenPublicProfile, { initialFlipped: true }),
      my: window.ScreenMyPage,
      dex: window.ScreenDex,
      friends: window.ScreenFriends,
      'trip-message': window.ScreenTripMessage,
      report: window.ScreenReportSheet,
      blocked: window.ScreenBlocked,
      'course-publish': window.ScreenCoursePublish,
      'trip-confirmed': window.ScreenTripConfirmed,
      'trip-day': window.ScreenTripDay,
      'notif-detail': window.ScreenNotifDetail,
      'account-delete': window.ScreenAccountDelete,
      'system-maintenance': window.ScreenSystemMaintenance,
      'system-error': window.ScreenSystemError,
      'feed-comments': window.ScreenFeedComments,

      // 내가 만든 것을 되돌리는 화면들 (screens-edit-delete.jsx).
      // 서버 계약: `docs/api/BACKEND_REQUEST_CHANGES_2026-09-04.md` (2026-09-04 BE 회신).
      // 프로필 이미지 삭제는 **없다** — 회신 §7 대로 API 가 없고 기획에도 없다.
      'feed-actions': window.ScreenFeedActions,               // 23-2 내 피드 수정·삭제 시트
      'feed-delete': window.ScreenFeedDelete,                 // 23-3 피드 삭제 확인
      'feed-edit': window.ScreenFeedEdit,                     // 24-6 피드 수정 (본문만)
      'comment-edit': window.ScreenCommentEdit,               // 23-1a 내 댓글 수정·삭제
      'recruit-edit': window.ScreenRecruitEdit,               // 18-6 모집 내용 수정 (호스트)
      'course-title-edit': window.ScreenCourseTitleEdit,      // 18-7 코스 이름·소개 수정
      'message-delete': window.ScreenMessageDelete,           // 20-6 내 채팅 메시지 삭제
      'profile-edit': window.ScreenProfileEdit,
      'profile-taste-edit': window.ScreenProfileTasteEdit,
      settings: window.ScreenSettings,
      'auth-methods': window.ScreenAuthMethods,
      // 29-5 계정 연결 — 웹은 이미 GET/POST /auth/providers 로 그리는 화면(auth-methods)이 있다.
      // 기획 번호(29-5 · account-providers)로도 열 수 있게 같은 화면을 건다 (화면을 두 벌 만들지 않는다).
      'account-providers': window.ScreenAuthMethods,
      'oss-licenses': window.ScreenOssLicenses,             // 29-4 오픈소스 라이선스 목록
      'oss-license-detail': window.ScreenOssLicenseDetail,  // 29-4a 라이선스 전문
    };
  }

  // Tab → route mapping for the bottom nav
  const TAB_ROUTES = {
    home: 'home',
    explore: 'explore',
    map: 'explore-map',
    chat: 'chat-list',
    my: 'my',
  };

  function PrototypeRoot({ initial = 'home', bootstrapAuth = false, children }) {
    const [stack, setStack] = useState([initial]);
    const [modal, setModal] = useState(null); // {kind, data}
    const [likes, setLikes] = useState({});   // id → bool
    const [transition, setTransition] = useState(null); // 'forward' | 'back' | null

    const route = stack[stack.length - 1];

    useEffect(() => {
      if (!bootstrapAuth) return undefined;
      let cancelled = false;
      const startedAt = Date.now();
      const restore = async () => {
        try {
          const result = await window.MoyeoAuth.restoreAuthState();
          const remainingSplash = Math.max(0, 1800 - (Date.now() - startedAt));
          await new Promise((resolve) => window.setTimeout(resolve, remainingSplash));
          if (!cancelled) setStack([result.route || 'login']);
        } catch (error) {
          // AUTH-SILENT-CASES-CANON R3: 세션 만료로 돌아온 것은 오류가 아니다.
          // 로그인 화면으로 보내는 것 자체가 안내이므로 배너를 남기지 않는다.
          // 네트워크·서버 실패(§3)는 그대로 알린다.
          if (!error?.sessionExpired) {
            window.__moyeoAuthStartupError = window.userFacingError(error, '로그인 상태를 확인하지 못했어요.');
          }
          const remainingSplash = Math.max(0, 1800 - (Date.now() - startedAt));
          await new Promise((resolve) => window.setTimeout(resolve, remainingSplash));
          if (!cancelled) setStack(['login']);
        }
      };
      restore();
      return () => { cancelled = true; };
    }, [bootstrapAuth]);

    // 가입 게이트(409 40902·40918)는 auth-api 가 이벤트로 올려보낸다 —
    // 라우터가 React 컨텍스트라 API 계층이 직접 화면을 바꿀 수 없기 때문이다.
    // 지금 화면을 **교체**한다: 뒤로 가기로 다시 막힌 화면에 돌아가면 같은 409 를 또 맞는다.
    useEffect(() => {
      const onSignupGate = (event) => {
        const next = event.detail?.route;
        if (!next) return;
        setStack((s) => (s[s.length - 1] === next ? s : [...s.slice(0, -1), next]));
      };
      window.addEventListener('moyeo:signup-gate', onSignupGate);
      return () => window.removeEventListener('moyeo:signup-gate', onSignupGate);
    }, []);

    // 서버 점검(503 · 50300)도 같은 관례로 받는다 (QA OFF-013).
    // 만들어만 두고 어디서도 열리지 않던 38 점검 안내 화면의 유일한 진입점이다.
    // **교체**한다 — 점검 중에 뒤로 가면 같은 503 을 다시 맞을 뿐이다.
    // 이미 점검 화면이면 아무것도 하지 않는다(다시 쌓이거나 되돌아가는 길이 사라지지 않게).
    useEffect(() => {
      const onMaintenance = (event) => {
        const next = event.detail?.route || 'system-maintenance';
        setStack((s) => (s[s.length - 1] === next ? s : [...s.slice(0, -1), next]));
      };
      window.addEventListener('moyeo:server-maintenance', onMaintenance);
      return () => window.removeEventListener('moyeo:server-maintenance', onMaintenance);
    }, []);

    const [params, setParams] = useState({});

    // 라우트는 문자열 하나뿐이라 화면에 값을 넘길 방법이 없었다.
    // 프로필 카드처럼 "누구의" 화면인지가 필요한 경우를 위해 opts.params 를 실어 보낸다.
    // 다음 go 까지만 유효하다(프로필은 말단 화면이라 충분하다).
    // opts.exitFlow: 여러 단계를 거치는 흐름(모집 만들기 5단계 등)을 **끝낼 때** 쓴다.
    // 스택 맨 위에 쌓여 있던 그 흐름의 화면들을 덜어내고 결과 화면을 얹는다 —
    // 예전에는 모집을 만든 뒤 뒤로 가면 이미 비워진 초안으로 5/5 리뷰가 다시 열렸고,
    // 또 뒤로 가면 빈 4/5 가 나와 새로고침해야 빠져나올 수 있었다(CREATE-071).
    const go = useCallback((next, opts = {}) => {
      if (!next || next === route) return;
      setParams(opts.params || {});
      setTransition(opts.transition || 'forward');
      setStack((s) => {
        let base = opts.replace ? s.slice(0, -1) : s;
        if (opts.exitFlow) {
          while (base.length > 1 && String(base[base.length - 1]).startsWith(opts.exitFlow)) {
            base = base.slice(0, -1);
          }
        }
        return [...base, next];
      });
      setTimeout(() => setTransition(null), 320);
    }, [route]);

    const replace = useCallback((next) => {
      setStack((s) => [...s.slice(0, -1), next]);
    }, []);

    const back = useCallback(() => {
      setStack((s) => {
        if (s.length <= 1) return s;
        setTransition('back');
        setTimeout(() => setTransition(null), 320);
        return s.slice(0, -1);
      });
    }, []);

    // 브라우저 뒤로가기가 **사이트를 통째로 벗어났다** (W-28) — 화면 스택이 React state 뿐이라
    // 히스토리에 항목이 하나도 쌓이지 않았기 때문이다. 모집을 만들다가 뒤로 가면 앱에서 튕겨 나갔다.
    // 항목을 하나 쌓아 두고, 뒤로가기가 들어오면 그 항목을 다시 채운 뒤 앱 뒤로가기를 수행한다.
    // 루트 화면에서는 다시 쌓지 않는다 — 그때는 사이트를 떠나는 것이 맞다.
    const stackRef = useRef(stack);
    stackRef.current = stack;
    useEffect(() => {
      if (!window.history?.pushState) return undefined;
      window.history.pushState({ moyeoApp: 1 }, '');
      const onPop = () => {
        if (stackRef.current.length <= 1) return;
        window.history.pushState({ moyeoApp: 1 }, '');
        back();
      };
      window.addEventListener('popstate', onPop);
      return () => window.removeEventListener('popstate', onPop);
    }, [back]);

    const openModal = useCallback((kind, data) => setModal({ kind, data }), []);
    const closeModal = useCallback(() => setModal(null), []);

    const toggleLike = useCallback((id) => {
      setLikes((prev) => ({ ...prev, [id]: !prev[id] }));
    }, []);
    const isLiked = useCallback((id, fallback = false) => (id in likes ? likes[id] : fallback), [likes]);

    const value = useMemo(() => ({
      route, stack, params, go, back, replace, openModal, closeModal, modal,
      toggleLike, isLiked, transition,
    }), [route, stack, params, go, back, replace, openModal, closeModal, modal, toggleLike, isLiked, transition]);

    return (
      <NavCtx.Provider value={value}>
        {children}
      </NavCtx.Provider>
    );
  }

  function useNav() {
    return useContext(NavCtx) || {
      route: null,
      params: {},
      go: () => {},
      back: () => {},
      replace: () => {},
      openModal: () => {},
      closeModal: () => {},
      toggleLike: () => {},
      isLiked: () => false,
      modal: null,
      transition: null,
    };
  }

  // Renders the active screen with a slide transition over the previous one
  function ScreenStage() {
    const { route, transition } = useNav();
    const Screens = getScreens();
    const Cur = Screens[route];

    const stageStyle = {
      width: 393,
      height: 'var(--mw-logical-h, 852px)',
      position: 'relative',
      perspective: 1000,
    };

    // 화면 전환 애니메이션이 **인라인 스타일**이라 `@media (prefers-reduced-motion: reduce)` 가
    // 닿지 않았다 — 모션 감소를 켠 사용자에게도 매번 슬라이드가 돌았다 (W-82).
    // 인라인 스타일은 CSS 로 끌 수 없으므로 여기서 직접 본다.
    const reduceMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animStyle = {
      width: '100%',
      height: '100%',
      animation: reduceMotion
        ? 'none'
        : transition === 'forward'
        ? 'mt-slide-in 320ms cubic-bezier(0.22, 1, 0.36, 1)'
        : transition === 'back'
        ? 'mt-slide-back 320ms cubic-bezier(0.22, 1, 0.36, 1)'
        : transition === 'tab'
        ? 'mt-tab-switch 220ms ease-out'
        : 'none',
    };

    return (
      <div style={stageStyle}>
        <style>{`
          @keyframes mt-slide-in {
            from { transform: translateX(24px); opacity: 0.0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
          @keyframes mt-slide-back {
            from { transform: translateX(-16px); opacity: 0.4; }
            to   { transform: translateX(0);     opacity: 1; }
          }
          @keyframes mt-tab-switch {
            from { transform: scale(0.985); opacity: 0.28; }
            to   { transform: scale(1);     opacity: 1; }
          }
          /* 25 프로필 카드 — "옆으로 밀 수 있다"를 알리는 절제된 유도.
             폭 3px, 두 번 왕복하고 제자리에서 멈춘다. 들여다보는 화면이라 계속 움직이지 않는다. */
          @keyframes mt-swipe-hint {
            0%, 100% { transform: translateX(0); }
            50%      { transform: translateX(3px); }
          }
          @media (prefers-reduced-motion: reduce) {
            [data-swipe-hint] { animation: none !important; }
          }
        `}</style>
        <div style={animStyle} key={route}>
          {Cur ? <Cur/> : <div style={{ padding: 40, fontFamily: T.fontStack, color: T.text500 }}>화면을 찾을 수 없어요: {route}</div>}
        </div>
        <ModalLayer/>
      </div>
    );
  }

  // 모달 층. 예전에는 27 도감의 「친구 상세」 시트를 여기서 그렸는데, 그 시트는
  // **호출부가 하나도 없는 죽은 UI**였고(`openModal('friend', …)` 를 부르는 곳이 없다)
  // 안에 든 수치는 서버 값이 아니라 동행 횟수에 4·2 를 곱해 **지어낸 것**이었다
  // (「공유 사진 N장」 · 「피드 댓글 N개」 — NO-MOCK-CANON R1). 2026-09-15 에 지웠다.
  // `openModal` 자체는 nav 계약의 일부라 남긴다 — 새 모달이 생기면 여기에 갈래를 더한다.
  function ModalLayer() {
    return null;
  }

  // The artboard wrapper — wraps a single phone into an interactive router stage
  function PrototypePhone({ initial = 'home', bootstrapAuth = false }) {
    return (
      <PrototypeRoot initial={initial} bootstrapAuth={bootstrapAuth}>
        <ScreenStage/>
      </PrototypeRoot>
    );
  }

  Object.assign(window, {
    PrototypeRoot,
    PrototypePhone,
    useNav,
    PROTO_TAB_ROUTES: TAB_ROUTES,
  });
})();
