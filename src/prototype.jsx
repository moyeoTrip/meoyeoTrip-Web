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
      login: window.ScreenLogin,
      'email-auth': window.ScreenEmailAuth,
      terms: window.ScreenTerms,
      home: window.ScreenHome,
      explore: window.ScreenExplore,
      'explore-map': window.ScreenExploreMap,
      search: window.ScreenSearch,
      notif: window.ScreenNotifications,
      course: window.ScreenCourseDetail,
      detail: window.ScreenGroupDetail,
      apply: window.ScreenApplySheet,
      'create-review': window.ScreenCreateReview,
      'host-manage': window.ScreenHostManage,
      'chat-list': window.ScreenChatList,
      chat: window.ScreenChatRoom,
      msgs: window.ScreenSpecialMessages,
      feed: window.ScreenFeed,
      'feed-detail': window.ScreenFeedDetail,
      'feed-write': window.ScreenFeedWrite,
      'public-profile': window.ScreenPublicProfile,
      my: window.ScreenMyPage,
      dex: window.ScreenDex,
      'profile-edit': window.ScreenProfileEdit,
      settings: window.ScreenSettings,
      'auth-methods': window.ScreenAuthMethods,
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
          window.__moyeoAuthStartupError = error?.message || '로그인 상태를 확인하지 못했어요.';
          const remainingSplash = Math.max(0, 1800 - (Date.now() - startedAt));
          await new Promise((resolve) => window.setTimeout(resolve, remainingSplash));
          if (!cancelled) setStack(['login']);
        }
      };
      restore();
      return () => { cancelled = true; };
    }, [bootstrapAuth]);

    const go = useCallback((next, opts = {}) => {
      if (!next || next === route) return;
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
      route, stack, go, back, replace, openModal, closeModal, modal,
      toggleLike, isLiked, transition,
    }), [route, stack, go, back, replace, openModal, closeModal, modal, toggleLike, isLiked, transition]);

    return (
      <NavCtx.Provider value={value}>
        {children}
      </NavCtx.Provider>
    );
  }

  function useNav() {
    return useContext(NavCtx) || {
      route: null,
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
