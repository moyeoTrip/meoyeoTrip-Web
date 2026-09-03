(function () {
  const SCREEN_TO_ROUTE = {
    splash: 'splash',
    onboarding: 'onboarding',
    'onb-1': 'onboarding',
    'onb-2': 'onboarding',
    'onb-3': 'onboarding',
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
    profileTaste: 'prof-4',
    'profile-taste': 'prof-4',
    'prof-4': 'prof-4',
    terms: 'terms',
    'terms-detail': 'terms-detail',
    'terms-privacy': 'terms-privacy',
    'terms-location': 'terms-location',
    'terms-marketing': 'terms-marketing',
    'terms-settings': 'terms-settings',
    'privacy-settings': 'privacy-settings',
    'location-settings': 'location-settings',
    'marketing-settings': 'marketing-settings',
    home: 'home',
    explore: 'explore',
    'explore-map': 'explore-map',
    exploreMap: 'explore-map',
    map: 'explore-map',
    search: 'search',
    // 12-1 검색 결과
    searchResults: 'search-results',
    'search-results': 'search-results',
    notifications: 'notif',
    notif: 'notif',
    removalReason: 'removal-reason',
    'removal-reason': 'removal-reason',
    course: 'course',
    trip: 'detail',
    detail: 'detail',
    apply: 'apply',
    create: 'create-review',
    'create-review': 'create-review',
    customCourse: 'custom-course',
    'custom-course': 'custom-course',
    placeSearch: 'place-search',
    'place-search': 'place-search',
    placeDetail: 'place-detail',
    'place-detail': 'place-detail',
    createSchedule: 'create-schedule',
    'create-schedule': 'create-schedule',
    createPeople: 'create-people',
    'create-people': 'create-people',
    // 17-4a · 17-4b — 인원수별 멘트 변형 (캡처 전용 진입, 실사용 기본값은 create-people)
    createPeopleSmall: 'create-people-small',
    'create-people-small': 'create-people-small',
    createPeopleLarge: 'create-people-large',
    'create-people-large': 'create-people-large',
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
    courseEditCustom: 'course-edit-custom',
    'course-edit-custom': 'course-edit-custom',
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
    memberActions: 'member-actions',
    'member-actions': 'member-actions',
    memberRemove: 'member-remove',
    'member-remove': 'member-remove',
    chatAttach: 'chat-attach',
    'chat-attach': 'chat-attach',
    // 20-2a~20-2f 첨부 작성 화면
    attachPhoto: 'attach-photo',
    'attach-photo': 'attach-photo',
    attachPlace: 'attach-place',
    'attach-place': 'attach-place',
    attachMap: 'attach-map',
    'attach-map': 'attach-map',
    attachPoll: 'attach-poll',
    'attach-poll': 'attach-poll',
    attachSettlement: 'attach-settlement',
    'attach-settlement': 'attach-settlement',
    attachNotice: 'attach-notice',
    'attach-notice': 'attach-notice',
    noticeHistory: 'notice-history',
    'notice-history': 'notice-history',
    noticeEdit: 'notice-edit',
    'notice-edit': 'notice-edit',
    roomNotif: 'room-notif',
    'room-notif': 'room-notif',
    leaveAlert: 'leave-alert',
    leave: 'leave-alert',
    'leave-alert': 'leave-alert',
    // 31-1 참가자 나가기 (31 은 호스트 문구)
    leaveMember: 'leave-member',
    'leave-member': 'leave-member',
    // ATTACH-COMPOSER-CANON §6 신설 화면
    passwordReset: 'password-reset',
    'password-reset': 'password-reset',
    kickHistory: 'kick-history',
    'kick-history': 'kick-history',
    tripStatus: 'trip-status',
    'trip-status': 'trip-status',
    meetingEdit: 'meeting-edit',
    'meeting-edit': 'meeting-edit',
    applyCancel: 'apply-cancel',
    'apply-cancel': 'apply-cancel',
    favoriteRooms: 'favorite-rooms',
    'favorite-rooms': 'favorite-rooms',
    courseRating: 'course-rating',
    'course-rating': 'course-rating',
    friendManage: 'friend-manage',
    'friend-manage': 'friend-manage',
    unblockConfirm: 'unblock-confirm',
    'unblock-confirm': 'unblock-confirm',
    accountProviders: 'account-providers',
    'account-providers': 'account-providers',
    states: 'states',
    messages: 'msgs',
    msgs: 'msgs',
    'special-messages': 'msgs',
    specialMessages: 'msgs',
    feed: 'feed',
    'feed-detail': 'feed-detail',
    feedDetail: 'feed-detail',
    'feed-write': 'feed-write',
    feedWrite: 'feed-write',
    'feed-write-1': 'feed-write-1',
    'feed-write-2': 'feed-write-2',
    'feed-write-3': 'feed-write-3',
    'feed-write-4': 'feed-write-4',
    'feed-write-5': 'feed-write-5',
    profile: 'public-profile',
    'public-profile': 'public-profile',
    // 25-1 · 카드 뒷면 (캡처 전용 진입 — 실사용 기본값은 앞면)
    'profile-back': 'public-profile-back',
    'public-profile-back': 'public-profile-back',
    my: 'my',
    dex: 'dex',
    'profile-edit': 'profile-edit',
    profileEdit: 'profile-edit',
    profileTasteEdit: 'profile-taste-edit',
    'profile-taste-edit': 'profile-taste-edit',
    settings: 'settings',
    'auth-methods': 'auth-methods',
    authMethods: 'auth-methods',
    // 29-4 · 29-4a 오픈소스 라이선스 (changeLog17)
    'oss-licenses': 'oss-licenses',
    ossLicenses: 'oss-licenses',
    'oss-license-detail': 'oss-license-detail',
    ossLicenseDetail: 'oss-license-detail',
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

    /* ── 캡처 중에는 애니메이션·전환을 멈춘다 ──
       두 가지 이유가 있다.
       (1) **결정성** — 같은 화면을 두 번 찍으면 같은 픽셀이 나와야 비교가 성립한다.
           스켈레톤 반짝임·프로그레스 흐름이 살아 있으면 매번 다른 프레임이 찍힌다.
       (2) **속도** — 헤드리스 Chrome 의 --virtual-time-budget 은 애니메이션 프레임에
           맞춰 가상 시간을 흘리므로, 끊임없이 도는 애니메이션이 있으면 예산 15초를
           실시간으로도 거의 다 쓴다. 멈추면 예산이 즉시 소진돼 캡처가 훨씬 빨라진다.
       capture=1 일 때만 걸린다 — 실사용 화면은 그대로다.
       (이 주석은 템플릿 리터럴 안이다 — 백틱을 쓰면 문자열이 끊긴다.) */
    .mw-root[data-capture="true"] *,
    .mw-root[data-capture="true"] *::before,
    .mw-root[data-capture="true"] *::after {
      animation-play-state: paused !important;
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
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

  // 캡처의 강제 테마(?theme=)는 사용자 설정보다 우선하고 저장하지 않는다.
  // 강제 테마가 없으면 사용자 설정(system/light/dark)을 적용하고 OS 변경을 따라간다.
  function getForcedTheme() {
    return window.getForcedMoyeoTheme?.() || null;
  }

  function getInitialScroll() {
    const requested = new URLSearchParams(window.location.search).get('scroll');
    return requested === 'bottom' || requested === 'middle' ? requested : 'top';
  }

  function getCaptureMode() {
    return new URLSearchParams(window.location.search).get('capture') === '1';
  }

  // 스크롤 페이지 캡처. 화면 안쪽 컨테이너가 스크롤되므로 페이지 전체 캡처로는 아래를 볼 수 없다.
  function getCapturePage() {
    const raw = Number(new URLSearchParams(window.location.search).get('page') || '1');
    return Number.isFinite(raw) && raw > 1 ? Math.min(Math.floor(raw), 5) : 1;
  }

  function getInitialOnline() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('offline') === '1') return false;
    return window.navigator.onLine !== false;
  }

  function MobileStage({ initial, initialScroll, capturePage = 1, bootstrapAuth, online }) {
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
      if (initialScroll === 'top' && capturePage === 1) return undefined;

      const scrollLargestScrollable = () => {
        // **실제로 스크롤되는 요소**를 먼저 고른다. `scrollHeight > clientHeight` 만 보면
        // 카카오 지도 내부 div(overflow:visible · clientHeight 0 · scrollHeight 340)가
        // 넘침 폭이 커서 1등으로 뽑히고, 그걸 스크롤해 봐도 화면은 그대로다 —
        // 21 특수 메시지 견본이 실제로 그렇게 2페이지째를 1페이지와 똑같이 찍었다.
        const overflowing = Array.from(document.querySelectorAll('.mw-stage-crop *'))
          .filter((el) => el.scrollHeight > el.clientHeight + 8);
        const byOverflow = (a, b) => (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight);
        const scrollable = overflowing.filter(
          (el) => ['auto', 'scroll'].includes(window.getComputedStyle(el).overflowY),
        );
        // auto/scroll 이 하나도 없으면 예전 규칙으로 돌아간다(overflow:hidden 을 scrollTop 으로
        // 밀던 화면이 있을 수 있다). 지도 내부만 빼면 된다.
        const candidates = (scrollable.length > 0
          ? scrollable
          : overflowing.filter((el) => !el.closest('[data-moyeo-map]'))).sort(byOverflow);
        const target = candidates[0];
        if (!target) {
          window.__moyeoScrollPages = 1;
          return;
        }
        const maxScroll = target.scrollHeight - target.clientHeight;
        const step = Math.max(target.clientHeight - 40, 1);
        window.__moyeoScrollPages = Math.min(Math.ceil(maxScroll / step) + 1, 5);
        if (capturePage > 1) {
          target.scrollTop = Math.min(maxScroll, step * (capturePage - 1));
          return;
        }
        target.scrollTop = initialScroll === 'middle' ? Math.floor(maxScroll / 2) : maxScroll;
      };

      const timers = [450, 1000, 1700].map((delay) => window.setTimeout(scrollLargestScrollable, delay));
      return () => timers.forEach((timer) => window.clearTimeout(timer));
    }, [initialScroll, initial, capturePage]);

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
    const [forcedTheme] = React.useState(getForcedTheme);
    const [initial] = React.useState(getInitialRoute);
    const [initialScroll] = React.useState(getInitialScroll);
    const [captureMode] = React.useState(getCaptureMode);
    const [bootstrapAuth] = React.useState(shouldBootstrapAuth);
    const [online, setOnline] = React.useState(getInitialOnline);

    React.useEffect(() => {
      if (forcedTheme) {
        window.applyMoyeoTheme?.(forcedTheme);
        return undefined;
      }
      return window.watchMoyeoThemeMode?.();
    }, [forcedTheme]);

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
      <div className={`mw-root${captureMode ? ' mw-capture' : ''}`} data-online={online ? 'true' : 'false'} data-capture={captureMode ? 'true' : 'false'}>
        <MobileStage initial={initial} initialScroll={initialScroll} capturePage={getCapturePage()} bootstrapAuth={bootstrapAuth} online={online}/>
      </div>
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
})();
