(function () {
  const SCREEN_TO_ROUTE = {
    splash: 'splash',
    onboarding: 'onboarding',
    login: 'login',
    'email-auth': 'email-auth',
    emailAuth: 'email-auth',
    nickname: 'prof-1',
    'prof-1': 'prof-1',
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
    host: 'host-manage',
    'host-manage': 'host-manage',
    meetings: 'chat-list',
    meeting: 'chat-list',
    groups: 'chat-list',
    'chat-list': 'chat-list',
    chatList: 'chat-list',
    chat: 'chat',
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

  function MobileStage({ initial, initialScroll, bootstrapAuth }) {
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
              <window.PrototypePhone initial={initial} bootstrapAuth={bootstrapAuth}/>
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

    React.useEffect(() => {
      window.setMoyeoThemeMode?.(themeMode);
    }, [themeMode]);

    return (
      <div className={`mw-root${captureMode ? ' mw-capture' : ''}`}>
        <MobileStage initial={initial} initialScroll={initialScroll} bootstrapAuth={bootstrapAuth}/>
      </div>
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
})();
