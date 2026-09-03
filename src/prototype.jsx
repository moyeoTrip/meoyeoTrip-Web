// Global router/prototype layer for 모여트립
// Exposes window.useNav() returning {go, back, openModal, closeModal, route, modal, like, isLiked}
// And window.PrototypePhone — a wrapper that gives any artboard a navigable router context.

(function () {
  const { createContext, useContext, useState, useCallback, useMemo, useEffect } = React;

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
      'terms-privacy': window.ScreenTermsPrivacy,
      'terms-location': window.ScreenTermsLocation,
      'terms-marketing': window.ScreenTermsMarketing,
      'terms-settings': window.ScreenTermsSettings,
      'privacy-settings': window.ScreenPrivacySettings,
      'location-settings': window.ScreenLocationSettings,
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
            window.__moyeoAuthStartupError = error?.message || '로그인 상태를 확인하지 못했어요.';
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

    const [params, setParams] = useState({});

    // 라우트는 문자열 하나뿐이라 화면에 값을 넘길 방법이 없었다.
    // 프로필 카드처럼 "누구의" 화면인지가 필요한 경우를 위해 opts.params 를 실어 보낸다.
    // 다음 go 까지만 유효하다(프로필은 말단 화면이라 충분하다).
    const go = useCallback((next, opts = {}) => {
      if (!next || next === route) return;
      setParams(opts.params || {});
      setTransition(opts.transition || 'forward');
      setStack((s) => (opts.replace ? [...s.slice(0, -1), next] : [...s, next]));
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

    const animStyle = {
      width: '100%',
      height: '100%',
      animation: transition === 'forward'
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

  // Modal layer — currently handles 'friend' detail
  function ModalLayer() {
    const { modal, closeModal } = useNav();
    if (!modal) return null;

    if (modal.kind === 'friend') {
      const f = modal.data || {};
      return (
        <div onClick={closeModal} style={{
          position: 'absolute', inset: 0, background: 'rgba(15,23,20,0.55)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 200, animation: 'mt-fade-in 200ms ease', borderRadius: 56, overflow: 'hidden',
        }}>
          <style>{`
            @keyframes mt-fade-in { from { opacity: 0; } to { opacity: 1; } }
            @keyframes mt-sheet-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
          `}</style>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: '100%', background: T.bgBase, borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: '24px 24px 32px', animation: 'mt-sheet-up 280ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 999, background: T.line200, margin: '0 auto 20px' }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <AnimalAvatar kind={f.k || 'deer'} size={64} bg={T.primary50}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px' }}>{f.n}</div>
                <div style={{ fontSize: 12, color: T.text500, marginTop: 4 }}>마지막 동행 · {f.last}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: T.primary700, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{f.trips}</div>
                <div style={{ fontSize: 10, color: T.text500, marginTop: 2 }}>회 동행</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 20, padding: '14px 4px', borderTop: `1px solid ${T.line100}`, borderBottom: `1px solid ${T.line100}` }}>
              <Stat label="함께 간 곳" value={`${f.trips}곳`}/>
              <Stat label="공유 사진" value={`${(f.trips || 1) * 4}장`}/>
              <Stat label="피드 댓글" value={`${(f.trips || 1) * 2}개`}/>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <Btn variant="ghost" full>프로필 보기</Btn>
              <div style={{ flex: 1 }}><Btn variant="primary" full>다음에 또 만나기</Btn></div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  function Stat({ label, value }) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text900, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
        <div style={{ fontSize: 11, color: T.text500, marginTop: 2 }}>{label}</div>
      </div>
    );
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
