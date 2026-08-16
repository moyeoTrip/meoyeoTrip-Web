(function () {
  const SCREEN_TO_ROUTE = {
    splash: 'splash',
    onboarding: 'onboarding',
    login: 'login',
    'email-auth': 'email-auth',
    emailAuth: 'email-auth',
    nickname: 'prof-1',
    'prof-1': 'prof-1',
    profileImage: 'prof-2',
    'profile-image': 'prof-2',
    'prof-2': 'prof-2',
    profileBasic: 'prof-3',
    'profile-basic': 'prof-3',
    'prof-3': 'prof-3',
    terms: 'terms',
    home: 'home',
    explore: 'explore',
    'explore-map': 'explore-map',
    exploreMap: 'explore-map',
    map: 'explore-map',
    search: 'search',
    notifications: 'notif',
    notif: 'notif',
    course: 'course',
    trip: 'detail',
    detail: 'detail',
    apply: 'apply',
    create: 'create-review',
    'create-review': 'create-review',
    customCourse: 'custom-course',
    'custom-course': 'custom-course',
    createSchedule: 'create-schedule',
    'create-schedule': 'create-schedule',
    createPeople: 'create-people',
    'create-people': 'create-people',
    createDetail: 'create-detail',
    'create-detail': 'create-detail',
    createMeet: 'create-meet',
    'create-meet': 'create-meet',
    createSummary: 'create-summary',
    'create-summary': 'create-summary',
    createSummaryLinked: 'create-summary-linked',
    'create-summary-linked': 'create-summary-linked',
    courseEdit: 'course-edit',
    'course-edit': 'course-edit',
    courseEditLinked: 'course-edit-linked',
    'course-edit-linked': 'course-edit-linked',
    courseEditLocked: 'course-edit-locked',
    'course-edit-locked': 'course-edit-locked',
    host: 'host-manage',
    'host-manage': 'host-manage',
    meetings: 'chat-list',
    meeting: 'chat-list',
    groups: 'chat-list',
    'chat-list': 'chat-list',
    chatList: 'chat-list',
    chatListApplied: 'chat-list-applied',
    'chat-list-applied': 'chat-list-applied',
    chat: 'chat',
    chatMenu: 'chat-menu',
    'chat-menu': 'chat-menu',
    chatAttach: 'chat-attach',
    'chat-attach': 'chat-attach',
    noticeHistory: 'notice-history',
    'notice-history': 'notice-history',
    leaveAlert: 'leave-alert',
    leave: 'leave-alert',
    'leave-alert': 'leave-alert',
    messages: 'msgs',
    msgs: 'msgs',
    'special-messages': 'msgs',
    specialMessages: 'msgs',
    feed: 'feed',
    'feed-detail': 'feed-detail',
    feedDetail: 'feed-detail',
    'feed-write': 'feed-write',
    feedWrite: 'feed-write',
    profile: 'public-profile',
    'public-profile': 'public-profile',
    my: 'my',
    dex: 'dex',
    'profile-edit': 'profile-edit',
    profileEdit: 'profile-edit',
    settings: 'settings',
    'auth-methods': 'auth-methods',
    authMethods: 'auth-methods',
    friends: 'friends',
    tripMessage: 'trip-message',
    'trip-message': 'trip-message',
    report: 'report',
    blocked: 'blocked',
    coursePublish: 'course-publish',
    'course-publish': 'course-publish',
    tripConfirmed: 'trip-confirmed',
    'trip-confirmed': 'trip-confirmed',
    tripDay: 'trip-day',
    'trip-day': 'trip-day',
    notifDetail: 'notif-detail',
    'notif-detail': 'notif-detail',
    accountDelete: 'account-delete',
    'account-delete': 'account-delete',
    systemMaintenance: 'system-maintenance',
    'system-maintenance': 'system-maintenance',
    systemError: 'system-error',
    'system-error': 'system-error',
    feedComments: 'feed-comments',
    'feed-comments': 'feed-comments',
    auth: 'login',
  };

  const css = `
    :root {
      --mobile-web-stage-w: 393;
      --mobile-web-stage-h: 852;
    }

    .mw-root {
      min-height: 100dvh;
      display: grid;
      place-items: center;
      background:
        linear-gradient(90deg, rgba(15,23,20,0.07) 0 1px, transparent 1px),
        var(--moyeo-canvas-bg);
      background-size: 48px 48px, auto;
      color: var(--moyeo-text-900);
      overflow: hidden;
      padding: 0;
    }

    .mw-letterbox {
      width: min(100vw, calc(100dvh * 393 / 852));
      height: 100dvh;
      position: relative;
      display: grid;
      place-items: center;
    }

    .mw-device-shell {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
      border-radius: 0;
      background: var(--moyeo-bg-base);
      box-shadow: none;
      isolation: isolate;
    }

    .mw-root.mw-capture {
      width: 393px;
      height: 852px;
      min-height: 852px;
      place-items: start;
      padding: 0;
      overflow: hidden;
    }

    .mw-root.mw-capture .mw-letterbox,
    .mw-root.mw-capture .mw-device-shell {
      width: 393px;
      height: 852px;
      max-height: none;
      border-radius: 0;
      border: 0;
      box-shadow: none;
    }

    .mw-stage-scale {
      width: 393px;
      height: var(--mw-logical-h, 852px);
      transform-origin: top left;
      transform: scale(var(--mw-scale, 1));
    }

    .mw-stage-crop {
      width: 393px;
      height: var(--mw-logical-h, 852px);
      overflow: hidden;
      border-radius: 0;
      background: var(--moyeo-bg-base);
    }

    .mw-offline-banner {
      height: 36px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      background: #FFF1D6;
      color: #714B12;
      border-bottom: 1px solid #E8C98C;
      font-size: 12px;
      font-weight: 700;
      position: absolute;
      inset: 0 0 auto;
      z-index: 500;
    }

    :root[data-moyeo-theme="dark"] .mw-offline-banner {
      background: #4B3418;
      color: #FFE3B2;
      border-bottom-color: #70532C;
    }

    .mw-root[data-online="false"] [data-network-action="true"] {
      opacity: 0.42 !important;
      cursor: not-allowed !important;
      filter: saturate(0.35);
    }

    .mw-stage-crop > div > div,
    .mw-stage-crop .moyeo-web-phone,
    .mw-stage-crop [style*="width: 393px"][style*="height: 852px"] {
      border-radius: 0 !important;
      border: 0 !important;
      box-shadow: none !important;
    }

    .mw-root,
    .mw-root *,
    .mw-root *::before,
    .mw-root *::after {
      scrollbar-width: none !important;
      scrollbar-color: transparent transparent !important;
    }

    .mw-root::-webkit-scrollbar,
    .mw-root *::-webkit-scrollbar {
      display: none !important;
      width: 0;
      height: 0;
      background: transparent;
    }

    @media (min-width: 700px) {
      .mw-root {
        padding: 0 24px;
      }

      .mw-device-shell {
        border: 1px solid var(--moyeo-line-200);
        box-shadow: 0 24px 70px rgba(15, 23, 20, 0.18);
      }
    }

  `;

  if (typeof document !== 'undefined' && !document.getElementById('mobile-web-styles')) {
    const style = document.createElement('style');
    style.id = 'mobile-web-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function getInitialRoute() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('screen') || params.get('route');
    if (!raw) return 'splash';
    return SCREEN_TO_ROUTE[raw] || raw;
  }

  function shouldBootstrapAuth() {
    const params = new URLSearchParams(window.location.search);
    return !params.get('screen') && !params.get('route') && params.get('capture') !== '1';
  }

  function getInitialTheme() {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('theme');
    if (requested === 'dark' || requested === 'light') return requested;
    return window.getInitialMoyeoThemeMode?.() || 'light';
  }

  function getInitialScroll() {
    const requested = new URLSearchParams(window.location.search).get('scroll');
    return requested === 'bottom' || requested === 'middle' ? requested : 'top';
  }

  function getCaptureMode() {
    return new URLSearchParams(window.location.search).get('capture') === '1';
  }

  function getInitialOnline() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('offline') === '1') return false;
    return window.navigator.onLine !== false;
  }

  function MobileStage({ initial, initialScroll, bootstrapAuth, online }) {
    const shellRef = React.useRef(null);
    const [scale, setScale] = React.useState(1);
    const [logicalHeight, setLogicalHeight] = React.useState(852);

    React.useLayoutEffect(() => {
      const update = () => {
        const box = shellRef.current?.getBoundingClientRect();
        if (!box) return;
        const nextScale = box.width / 393;
        setScale(nextScale);
        setLogicalHeight(box.height / nextScale);
      };
      update();
      const ro = new ResizeObserver(update);
      if (shellRef.current) ro.observe(shellRef.current);
      window.addEventListener('resize', update);
      return () => {
        ro.disconnect();
        window.removeEventListener('resize', update);
      };
    }, []);

    React.useEffect(() => {
      if (initialScroll === 'top') return undefined;

      const scrollLargestScrollable = () => {
        const candidates = Array.from(document.querySelectorAll('.mw-stage-crop *'))
          .filter((el) => el.scrollHeight > el.clientHeight + 8)
          .sort((a, b) => (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight));
        const target = candidates[0];
        if (!target) return;
        const maxScroll = target.scrollHeight - target.clientHeight;
        target.scrollTop = initialScroll === 'middle' ? Math.floor(maxScroll / 2) : maxScroll;
      };

      const timers = [450, 1000, 1700].map((delay) => window.setTimeout(scrollLargestScrollable, delay));
      return () => timers.forEach((timer) => window.clearTimeout(timer));
    }, [initialScroll, initial]);

    return (
      <main className="mw-letterbox" aria-label="모여트립 모바일 웹">
        <div className="mw-device-shell" ref={shellRef}>
          <div className="mw-stage-scale" style={{ '--mw-scale': scale, '--mw-logical-h': `${logicalHeight}px` }}>
            <div className="mw-stage-crop">
              {!online && (
                <div className="mw-offline-banner" role="status" aria-live="polite">
                  <window.Icon name="warning" size={15}/>
                  오프라인이에요 · 저장된 화면만 볼 수 있어요
                </div>
              )}
              <div style={online ? undefined : { paddingTop: 36, '--mw-logical-h': `${Math.max(640, logicalHeight - 36)}px` }}>
                <window.PrototypePhone initial={initial} bootstrapAuth={bootstrapAuth}/>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  function App() {
    const [themeMode] = React.useState(getInitialTheme);
    const [initial] = React.useState(getInitialRoute);
    const [initialScroll] = React.useState(getInitialScroll);
    const [captureMode] = React.useState(getCaptureMode);
    const [bootstrapAuth] = React.useState(shouldBootstrapAuth);
    const [online, setOnline] = React.useState(getInitialOnline);

    React.useEffect(() => {
      window.setMoyeoThemeMode?.(themeMode);
    }, [themeMode]);

    React.useEffect(() => {
      const update = () => setOnline(window.navigator.onLine !== false);
      window.addEventListener('online', update);
      window.addEventListener('offline', update);
      return () => {
        window.removeEventListener('online', update);
        window.removeEventListener('offline', update);
      };
    }, []);

    React.useEffect(() => {
      window.__moyeoOnline = online;
      const preventNetworkAction = (event) => {
        if (online) return;
        const action = event.target.closest?.('[data-network-action="true"], form button[type="submit"]');
        if (!action) return;
        event.preventDefault();
        event.stopPropagation();
      };
      document.addEventListener('click', preventNetworkAction, true);
      document.addEventListener('submit', preventNetworkAction, true);
      return () => {
        document.removeEventListener('click', preventNetworkAction, true);
        document.removeEventListener('submit', preventNetworkAction, true);
      };
    }, [online]);

    return (
      <div className={`mw-root${captureMode ? ' mw-capture' : ''}`} data-online={online ? 'true' : 'false'}>
        <MobileStage initial={initial} initialScroll={initialScroll} bootstrapAuth={bootstrapAuth} online={online}/>
      </div>
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
})();
