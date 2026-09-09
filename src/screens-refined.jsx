// Refined visual pass based on the latest service mockups.
// This file intentionally overrides selected shared components and key screens
// while keeping the earlier planning screens available as fallback.

var RF = {
  bg: T.bgBase,
  subtle: T.bgSubtle,
  card: T.bgRaised,
  line: T.line200,
  softLine: T.line100,
  shadow: T.l3,
  softShadow: T.l2,
  mapGreen: 'var(--moyeo-map-green)',
  mapWater: 'var(--moyeo-map-water)',
};

function Phone({ children, dark = false }) {
  return (
    <div className="moyeo-web-phone" style={{
      width: 393,
      height: 'var(--mw-logical-h, 852px)',
      borderRadius: 34,
      background: dark ? '#111A16' : RF.bg,
      border: `1px solid ${dark ? '#26332D' : '#E3E7E4'}`,
      boxShadow: '0 18px 48px rgba(15, 23, 20, 0.12)',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: T.fontStack,
      color: dark ? '#fff' : T.text900,
    }}>
      <style>{`
        .moyeo-web-phone [style*="padding-top: 46px"],
        .moyeo-web-phone [style*="padding-top: 54px"],
        .moyeo-web-phone [style*="padding-top: 60px"] {
          padding-top: 18px !important;
        }
        /* 상태바 오프셋을 top 으로 주는 화면은 **선택자로 고치지 않는다.**
           [style*="top: 46px"] 는 "padding-top: 46px" 까지 부분 일치해
           paddingTop 을 쓰는 화면 전부를 18px 아래로 밀어 버린다.
           11 지도 탐색처럼 배경이 헤더 위로 보이는 화면("상단이 뚫렸다")은
           그 화면에서 top 을 0 으로 두는 쪽이 맞다 — 웹은 가릴 상태바가 없다. */
      `}</style>
      {children}
    </div>
  );
}

function IconButton({ name, onClick, dark = false, bg = 'transparent', color, size = 22, ariaLabel, testId }) {
  return (
    <button type="button" aria-label={ariaLabel} data-testid={testId} onClick={onClick} style={{
      width: 40,
      height: 40,
      borderRadius: 999,
      border: 'none',
      background: bg,
      color: color || (dark ? '#fff' : T.text900),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      cursor: 'pointer',
      fontFamily: T.fontStack,
    }}>
      <Icon name={name} size={size} color="currentColor"/>
    </button>
  );
}

function Header({ title, left = false, right, center = false, onBack, border = false }) {
  const nav = window.useNav ? window.useNav() : { back: () => {}, go: () => {} };
  return (
    <div style={{
      height: 56,
      padding: '0 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: RF.bg,
      borderBottom: border ? `1px solid ${RF.softLine}` : 'none',
      flexShrink: 0,
    }}>
      {left && <IconButton name="back" onClick={onBack || nav.back}/>}
      <div style={{
        flex: 1,
        textAlign: center ? 'center' : 'left',
        fontSize: center ? 15 : 21,
        fontWeight: 800,
        letterSpacing: 0,
        color: T.text900,
      }}>{title}</div>
      <div style={{ minWidth: right ? 'auto' : 40, display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
        {right}
      </div>
    </div>
  );
}

function Btn({ children, variant = 'primary', icon, full = false, disabled = false, onClick, style, ariaLabel, testId }) {
  const styles = {
    primary: { bg: T.primary500, fg: '#fff', border: T.primary500 },
    secondary: { bg: RF.card, fg: T.primary600, border: T.primary500 },
    soft: { bg: T.primary50, fg: T.primary700, border: T.primary100 },
    ghost: { bg: 'transparent', fg: T.text700, border: 'transparent' },
    danger: { bg: T.danger, fg: '#fff', border: T.danger },
  };
  const s = disabled ? { bg: T.line100, fg: T.text400, border: T.line100 } : styles[variant];
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      data-testid={testId}
      style={{
      height: 48,
      borderRadius: 12,
      border: `1px solid ${s.border}`,
      background: s.bg,
      color: s.fg,
      fontSize: 14,
      fontWeight: 800,
      fontFamily: T.fontStack,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      width: full ? '100%' : 'auto',
      padding: '0 18px',
      cursor: disabled ? 'default' : 'pointer',
      boxShadow: variant === 'primary' ? '0 8px 18px rgba(45, 143, 90, 0.18)' : 'none',
      ...(style || {}),
    }}>
      {icon && <Icon name={icon} size={18} color={s.fg}/>}
      {children}
    </button>
  );
}

function Chip({ children, variant = 'neutral', size = 'sm', style, testId }) {
  const variants = {
    primary: { bg: T.primary500, fg: '#fff', bd: T.primary500 },
    soft: { bg: T.primary50, fg: T.primary700, bd: T.primary100 },
    neutral: { bg: RF.card, fg: T.text700, bd: T.line200 },
    accent: { bg: '#FFF1EA', fg: T.accent700, bd: '#FFE0D1' },
    danger: { bg: T.dangerBg, fg: T.dangerText, bd: T.dangerBg },
  };
  const v = variants[variant] || variants.neutral;
  return (
    <span data-testid={testId} style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: size === 'md' ? 28 : 24,
      padding: size === 'md' ? '0 10px' : '0 8px',
      borderRadius: 999,
      background: v.bg,
      color: v.fg,
      border: `1px solid ${v.bd}`,
      fontSize: size === 'md' ? 12 : 11,
      lineHeight: 1,
      fontWeight: 700,
      whiteSpace: 'nowrap',
      ...(style || {}),
    }}>{children}</span>
  );
}

function ProgressBar({ current = 2, max = 5 }) {
  return (
    <div style={{ height: 5, borderRadius: 999, background: T.line100, overflow: 'hidden', width: '100%' }}>
      <div style={{ height: '100%', width: `${Math.min(100, (current / max) * 100)}%`, borderRadius: 999, background: T.primary500 }}/>
    </div>
  );
}

function BottomNav({ active = 'home', onChange }) {
  const nav = typeof window !== 'undefined' && window.useNav ? window.useNav() : null;
  const tabs = [
    { id: 'home', label: '홈', icon: 'home', route: 'home' },
    { id: 'compass', label: '탐색', icon: 'search', route: 'explore' },
    { id: 'group', label: '모임', icon: 'users', route: 'chat-list' },
    { id: 'feed', label: '피드', icon: 'feed', route: 'feed' },
    { id: 'my', label: '마이', icon: 'user', route: 'my' },
  ];
  const handle = (t) => {
    if (onChange) onChange(t.id);
    if (nav && nav.go) nav.go(t.route, { transition: 'tab', replace: true });
  };
  return (
    <div style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 96,
      padding: '10px 8px 30px',
      borderTop: `1px solid ${RF.softLine}`,
      background: RF.card,
      display: 'flex',
      zIndex: 70,
    }}>
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button key={t.id} onClick={() => handle(t)} style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            color: on ? T.primary600 : T.text500,
            fontFamily: T.fontStack,
            cursor: 'pointer',
            position: 'relative',
          }}>
            {t.id === 'group' && <span style={{ position: 'absolute', top: 12, right: 26, width: 6, height: 6, borderRadius: 999, background: T.primary500 }}/>}
            <Icon name={t.icon} size={22} color="currentColor" strokeWidth={on ? 2.3 : 1.6}/>
            <span style={{ fontSize: 11, fontWeight: on ? 800 : 600 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// 서버 이미지가 아직 없거나 실패했을 때의 빈 썸네일 자리 — 그 자체가 사진인 척하지 않는다.
function Photo({ height = 120, radius = 12, overlay = false, shape = 'landscape', children }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: radius, height, background: T.bgSubtle }}>
      <ImgPlaceholder height={height} radius={0} shape={shape}/>
      {overlay && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0.48))' }}/>}
      {children}
    </div>
  );
}

function MemberStack({ size = 28, members = ['bear', 'rabbit', 'raccoon'], more }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {members.map((k, i) => (
        <div key={`${k}-${i}`} style={{ marginLeft: i ? -8 : 0, border: '2px solid #fff', borderRadius: 999, overflow: 'hidden' }}>
          <AnimalAvatar kind={k} size={size} bg={T.primary50}/>
        </div>
      ))}
      {more && (
        <div style={{
          marginLeft: -8,
          width: size,
          height: size,
          borderRadius: 999,
          border: '2px solid #fff',
          background: T.line100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: T.text500,
          fontSize: 11,
          fontWeight: 800,
        }}>+{more}</div>
      )}
    </div>
  );
}

function MascotFriend({ kind = 'bear', coat = T.primary500, size = 92, lift = 0 }) {
  return (
    <div style={{ width: size, height: size * 1.18, position: 'relative', transform: `translateY(${lift}px)`, flexShrink: 0 }}>
      <div style={{
        position: 'absolute',
        left: size * 0.23,
        right: size * 0.23,
        bottom: size * 0.04,
        height: size * 0.44,
        borderRadius: `${size * 0.16}px ${size * 0.16}px ${size * 0.22}px ${size * 0.22}px`,
        background: coat,
        boxShadow: 'inset 0 -8px 0 rgba(0,0,0,0.08)',
      }}/>
      <div style={{
        position: 'absolute',
        left: size * 0.1,
        bottom: size * 0.05,
        width: size * 0.28,
        height: size * 0.12,
        borderRadius: 999,
        background: '#6E5A3E',
      }}/>
      <div style={{
        position: 'absolute',
        right: size * 0.1,
        bottom: size * 0.05,
        width: size * 0.28,
        height: size * 0.12,
        borderRadius: 999,
        background: '#6E5A3E',
      }}/>
      <div style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)' }}>
        <AnimalAvatar kind={kind} size={size * 0.68} bg="transparent"/>
      </div>
      <div style={{
        position: 'absolute',
        left: size * 0.24,
        top: size * 0.5,
        width: size * 0.15,
        height: size * 0.28,
        borderRadius: 999,
        background: coat,
        transform: 'rotate(18deg)',
      }}/>
      <div style={{
        position: 'absolute',
        right: size * 0.2,
        top: size * 0.49,
        width: size * 0.15,
        height: size * 0.3,
        borderRadius: 999,
        background: coat,
        transform: 'rotate(-24deg)',
      }}/>
    </div>
  );
}

function MascotGroup({ size = 150 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: -8 }}>
      <div style={{ marginRight: -16 }}><MascotFriend kind="bear" coat="#E0B64B" size={size * 0.6} lift={4}/></div>
      <div style={{ zIndex: 2 }}><MascotFriend kind="rabbit" coat="#F2C84B" size={size * 0.66} lift={0}/></div>
      <div style={{ marginLeft: -16 }}><MascotFriend kind="raccoon" coat="#5F7F99" size={size * 0.6} lift={5}/></div>
    </div>
  );
}

const WEATHER_HERO_ITEMS = {
  sunny: {
    label: '맑음',
    state: 'good',
    place: '경주 첨성대',
    copy: '햇살 좋은 날, 걷기 좋은 코스를 추천해드려요',
    assets: {
      light: 'assets/weather-sunny-cheomseongdae.webp',
      dark: 'assets/weather-sunny-cheomseongdae-night.webp',
    },
  },
  cloudy: {
    label: '구름',
    state: 'good',
    place: '경주 불국사',
    copy: '선선한 날씨에 역사 산책 코스를 추천해드려요',
    assets: {
      light: 'assets/weather-cloudy-bulguksa.webp',
      dark: 'assets/weather-cloudy-bulguksa-night.webp',
    },
  },
  rain: {
    label: '비',
    state: 'caution',
    place: '안동 하회마을',
    copy: '우산과 실내 동선을 챙겨 여유로운 코스를 골라드려요',
    assets: {
      light: 'assets/weather-rain-hahoe.webp',
      dark: 'assets/weather-rain-hahoe-night.webp',
    },
  },
  snow: {
    label: '눈',
    state: 'caution',
    place: '영주 부석사',
    copy: '눈길 이동이 짧고 쉬어가기 좋은 코스를 먼저 보여드려요',
    assets: {
      light: 'assets/weather-snow-buseoksa.webp',
      dark: 'assets/weather-snow-buseoksa-night.webp',
    },
  },
  fog: {
    label: '안개',
    state: 'caution',
    place: '경주 석굴암',
    copy: '시야가 흐린 날엔 가까운 코스와 안전한 이동을 우선해요',
    assets: {
      light: 'assets/weather-fog-seokguram.webp',
      dark: 'assets/weather-fog-seokguram-night.webp',
    },
  },
  wind: {
    label: '강풍',
    state: 'blocked',
    place: '포항 호미곶',
    copy: '바람이 강한 날엔 해안 코스 대신 대체 코스를 추천해요',
    assets: {
      light: 'assets/weather-wind-homigot.webp',
      dark: 'assets/weather-wind-homigot-night.webp',
    },
  },
  heavyRain: {
    label: '폭우',
    state: 'blocked',
    place: '경주 월정교',
    copy: '오늘은 무리하지 말고 실내형 코스를 먼저 확인해보세요',
    assets: {
      light: 'assets/weather-heavy-rain-woljeonggyo.webp',
      dark: 'assets/weather-heavy-rain-woljeonggyo-night.webp',
    },
  },
  heatwave: {
    label: '폭염',
    state: 'blocked',
    place: '안동 도산서원',
    copy: '더위가 심한 날엔 짧은 동선과 그늘 많은 장소를 추천해요',
    assets: {
      light: 'assets/weather-heatwave-dosan.webp',
      dark: 'assets/weather-heatwave-dosan-night.webp',
    },
  },
  dust: {
    label: '미세먼지',
    state: 'blocked',
    place: '경주 동궁과 월지',
    copy: '공기가 탁한 날엔 실내 휴식과 짧은 이동 코스를 우선해요',
    assets: {
      light: 'assets/weather-dust-donggung-wolji.webp',
      dark: 'assets/weather-dust-donggung-wolji-night.webp',
    },
  },
};

const WEATHER_HERO_ORDER = ['sunny', 'cloudy', 'rain', 'snow', 'fog', 'wind', 'heavyRain', 'heatwave', 'dust'];

// 서버 `GyeongbukWeatherResponse.condition` 의 9가지 값 → 히어로 시안 키.
// 1:1 로 맞아떨어져서 별도 보정이 필요 없다.
const WEATHER_CONDITION_TO_HERO = {
  SUNNY: 'sunny',
  CLOUDY: 'cloudy',
  RAIN: 'rain',
  SNOW: 'snow',
  FOG: 'fog',
  STRONG_WIND: 'wind',
  HEAVY_RAIN: 'heavyRain',
  HEAT_WAVE: 'heatwave',
  FINE_DUST: 'dust',
};

const WEATHER_HERO_TONE = {
  good: {
    badge: '추천',
    card: 'var(--moyeo-weather-good-card)',
    pillBg: 'var(--moyeo-weather-good-pill-bg)',
    pillFg: 'var(--moyeo-weather-good-pill-fg)',
  },
  caution: {
    badge: '주의',
    card: 'var(--moyeo-weather-caution-card)',
    pillBg: 'var(--moyeo-weather-caution-pill-bg)',
    pillFg: 'var(--moyeo-weather-caution-pill-fg)',
  },
  blocked: {
    badge: '대체 추천',
    card: 'var(--moyeo-weather-blocked-card)',
    pillBg: 'var(--moyeo-weather-blocked-pill-bg)',
    pillFg: 'var(--moyeo-weather-blocked-pill-fg)',
  },
};

// `place` 를 넘기면 그 값으로 지명을 덮는다. 서버 날씨는 예보 지점(예: 경상북도 포항시)을
// 함께 주므로, 시안에 박힌 랜드마크 대신 실제 예보 지점을 보여줘야 맞다.
function HeroIllustration({ weather = 'sunny', place = null }) {
  const item = WEATHER_HERO_ITEMS[weather] || WEATHER_HERO_ITEMS.sunny;
  const tone = WEATHER_HERO_TONE[item.state] || WEATHER_HERO_TONE.good;
  const imageSource = window.MoyeoImageCache?.themeSource(item.assets.light, item.assets.dark) || item.assets.light;
  const imageStyle = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center bottom',
    display: 'block',
  };
  return (
    <div style={{ position: 'relative', height: 144, borderRadius: 16, overflow: 'hidden', background: 'var(--moyeo-bg-subtle)' }}>
      <img
        data-weather-hero-image="active"
        src={imageSource}
        alt=""
        loading="eager"
        decoding="async"
        fetchpriority="high"
        style={imageStyle}
      />
      <div style={{
        position: 'absolute',
        left: 10,
        bottom: 10,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        maxWidth: 'calc(100% - 20px)',
        height: 26,
        padding: '0 9px',
        borderRadius: 999,
        background: tone.pillBg,
        color: tone.pillFg,
        fontSize: 11,
        fontWeight: 900,
        boxShadow: '0 4px 12px rgba(15,23,20,0.14)',
      }}>
        <span>{item.label}</span>
        <span style={{ opacity: 0.45 }}>·</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place || item.place}</span>
      </div>
    </div>
  );
}

function ScreenSplash() {
  const splashSource = window.MoyeoImageCache?.themeSource(
    'assets/splash-generated.webp',
    'assets/splash-generated-night.webp',
  ) || 'assets/splash-generated.webp';

  React.useEffect(() => {
    const themeSource = window.MoyeoImageCache?.themeSource;
    window.MoyeoImageCache?.preload(
      themeSource?.('assets/login-welcome.webp', 'assets/login-welcome-night.webp'),
      themeSource?.('assets/weather-sunny-cheomseongdae.webp', 'assets/weather-sunny-cheomseongdae-night.webp'),
      themeSource?.('assets/onboarding-1.webp', 'assets/onboarding-1-night.webp'),
    );
  }, []);

  const splashImageStyle = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center bottom',
    display: 'block',
  };
  return (
    <Phone>
      <div style={{ height: '100%', paddingTop: 46, background: 'var(--moyeo-splash-bg)', position: 'relative', overflow: 'hidden' }}>
        <img
          src={splashSource}
          alt=""
          loading="eager"
          decoding="async"
          fetchpriority="high"
          style={splashImageStyle}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'var(--moyeo-splash-overlay)' }}/>
        <div style={{ position: 'relative', height: '100%' }}>
          <div style={{ position: 'absolute', top: 156, left: 0, right: 0, textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--moyeo-splash-title)', letterSpacing: 0, textShadow: 'var(--moyeo-splash-title-shadow)' }}>모여트립 in 경북</div>
            <div style={{ marginTop: 10, fontSize: 14, fontWeight: 800, color: 'var(--moyeo-splash-subtitle)', textShadow: 'var(--moyeo-splash-title-shadow)' }}>경상북도 특화 반패키지 매칭 플랫폼</div>
          </div>
        </div>
      </div>
    </Phone>
  );
}

// 캐시가 없을 때만 나오는 상태 줄 (TAB-STATE-CANON R2).
// 캐시가 있으면(status==='ready') 아무것도 그리지 않는다 — 갱신 중에도 이전 내용을 덮지 않는다.
// 문구는 NO-MOCK-CANON §2 표 그대로다. 새 문구를 만들지 않는다.
function TabDataNotice({ status, signedOut = false, onRetry, style, testId }) {
  const box = { padding: '18px 4px', fontSize: 12, color: T.text500, ...style };
  if (signedOut) return <div role="status" data-testid={testId} style={box}>로그인하면 모집 중인 모임을 볼 수 있어요.</div>;
  if (status === 'ready') return null;
  if (status === 'failed') {
    return (
      <div role="status" data-testid={testId} style={box}>
        불러오지 못했어요. <button type="button" onClick={onRetry} style={{ padding: 0, border: 0, background: 'transparent', color: T.primary600, fontFamily: T.fontStack, fontSize: 'inherit', fontWeight: 900, textDecoration: 'underline', cursor: 'pointer' }}>다시 시도</button>
      </div>
    );
  }
  return <div role="status" data-testid={testId} style={box}>불러오는 중이에요…</div>;
}

function ScreenHome() {
  const nav = window.useNav ? window.useNav() : { go: () => {} };
  // 로그인 상태에서는 GET travel-courses/public · /popular · /tags 로 코스 섹션을 대체한다.
  const liveMode = window.MoyeoApi?.live();
  // 홈은 "가진 것을 보여주며 뒤에서 갱신" 탭이다 (TAB-STATE-CANON R3).
  // 값은 탭 바깥 보관소에 있으므로 재진입해도 이전 내용이 즉시 그려지고,
  // 갱신 응답이 오면 조용히 바뀐다 — 그 사이 로딩 문구로 덮지 않는다.
  const revalidate = { enabled: liveMode, mode: 'revalidate' };
  // 09 히어로의 날씨. 로그인 상태에서는 서버가 정한다 — 사용자가 고르는 값이 아니다.
  const weather = window.useTabData('home.weather', () => window.MoyeoApi.gyeongbukWeather(), {
    ...revalidate, accept: (result) => Boolean(result?.condition),
  });
  const homeWeather = WEATHER_CONDITION_TO_HERO[weather.value?.condition] || 'sunny';
  const weatherPlace = weather.value?.locationName || null;
  const weatherItem = WEATHER_HERO_ITEMS[homeWeather] || WEATHER_HERO_ITEMS.sunny;
  const weatherTone = WEATHER_HERO_TONE[weatherItem.state] || WEATHER_HERO_TONE.good;
  // 고른 태그도 보던 상태의 일부다 — 탭을 떠났다 와도 그대로다.
  const [activeTagId, setActiveTagId] = window.useTabState('home.course-tag', null);
  // 태그 칩을 고르면 GET travel-courses/public?tagId= 로 다시 받는다.
  // 태그별로 키가 갈리므로 앞서 본 태그로 돌아가면 즉시 그려진다.
  const publicCoursesData = window.useTabData(
    `home.public-courses:${activeTagId ?? 'all'}`,
    () => window.MoyeoApi.publicCourses(activeTagId || undefined),
    { ...revalidate, accept: Array.isArray },
  );
  const popularCoursesData = window.useTabData('home.popular-courses', () => window.MoyeoApi.popularCourses(), {
    ...revalidate, accept: Array.isArray,
  });
  const courseTagsData = window.useTabData('home.course-tags', () => window.MoyeoApi.courseTags(), {
    ...revalidate, accept: (result) => Array.isArray(result) && result.length > 0,
  });
  const publicCourses = publicCoursesData.value || null;
  const popularCourses = popularCoursesData.value || null;
  const courseTags = courseTagsData.value || null;
  const pageScroll = window.useTabScroll('home.scroll');
  const openCourse = (courseId) => {
    window.MoyeoApi.selectCourse(courseId);
    nav.go('course');
  };
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header
          title="모여트립 in 경북"
          right={<IconButton name="bell" onClick={() => nav.go('notif')}/>}
        />
        <div ref={pageScroll.ref} onScroll={pageScroll.onScroll} style={{ height: 'calc(100% - 138px)', overflow: 'auto', padding: '0 18px 96px' }}>
          <div style={{ marginTop: 6, padding: 13, borderRadius: 16, background: weatherTone.card, color: '#fff', boxShadow: RF.softShadow }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ fontSize: 17, fontWeight: 900 }}>이번 주말, 어디로 떠나볼까요?</div>
              <span style={{
                height: 24,
                padding: '0 8px',
                borderRadius: 999,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.18)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 900,
                whiteSpace: 'nowrap',
              }}>{weatherTone.badge}</span>
            </div>
            <div style={{ fontSize: 12, marginTop: 5, opacity: 0.9 }}>{weatherItem.copy}</div>
            <div style={{ marginTop: 12 }}><HeroIllustration weather={homeWeather} place={weatherPlace}/></div>
            {/* 9가지 날씨를 넘겨보는 칩 줄은 화면기획(프로토타입)에만 둔다.
                제품에서 사용자가 날씨를 바꾸는 것은 의미가 없다 —
                현재 날씨는 히어로 이미지 위의 라벨이 이미 보여준다. */}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 900 }}>지금 떠나기 좋은 코스</div>
            <button onClick={() => nav.go('explore')} style={{ border: 'none', background: 'transparent', color: T.text500, fontSize: 12, fontWeight: 700, fontFamily: T.fontStack, cursor: 'pointer' }}>더보기 ›</button>
          </div>
          {courseTags && (
            <div data-testid="home-course-tags" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8 }}>
              {[{ tagId: null, name: '전체' }, ...courseTags].map((tag) => {
                const on = activeTagId === tag.tagId;
                return (
                  <button key={tag.tagId ?? 'all'} type="button" onClick={() => setActiveTagId(tag.tagId)} style={{ height: 28, padding: '0 11px', borderRadius: 999, border: `1px solid ${on ? T.primary500 : T.line200}`, background: on ? T.primary50 : RF.card, color: on ? T.primary700 : T.text700, fontSize: 11.5, fontWeight: 800, fontFamily: T.fontStack, whiteSpace: 'nowrap', cursor: 'pointer' }}>{tag.name}</button>
                );
              })}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 3 }}>
            {/* 목 코스 카드는 없다 — 서버 목록이 없으면 비었다고 말한다. */}
            {publicCourses && publicCourses.length === 0 && (
              <div style={{ padding: '18px 4px', fontSize: 12, color: T.text500 }}>지금 모집 중인 모임이 없어요.</div>
            )}
            <TabDataNotice status={publicCoursesData.status} signedOut={!liveMode} onRetry={publicCoursesData.reload}/>
            {publicCourses && publicCourses.map((c) => (
              <div key={c.courseId} onClick={() => openCourse(c.courseId)} style={{ width: 134, flex: '0 0 auto', border: `1px solid ${RF.softLine}`, borderRadius: 12, overflow: 'hidden', background: RF.card, cursor: 'pointer' }}>
                <RoomThumb src={c.thumbnail} height={92}/>
                <div style={{ padding: 10 }}>
                  <div style={{ height: 34, fontSize: 12, fontWeight: 800, lineHeight: '17px', overflow: 'hidden' }}>{c.title}</div>
                  <div style={{ marginTop: 8, fontSize: 11, color: T.text500, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="pin" size={11} color={T.text500}/>
                    방문지 {c.places?.length || 0}곳
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 22, fontSize: 16, fontWeight: 900 }}>인기 코스 TOP 3</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {popularCourses && popularCourses.length === 0 && (
              <div style={{ padding: '14px 4px', fontSize: 12, color: T.text500 }}>지금 모집 중인 모임이 없어요.</div>
            )}
            <TabDataNotice status={popularCoursesData.status} signedOut={!liveMode} onRetry={popularCoursesData.reload} style={{ padding: '14px 4px' }}/>
            {popularCourses && popularCourses.slice(0, 3).map((c, index) => (
              <div key={c.courseId} onClick={() => openCourse(c.courseId)} style={{ height: 48, borderRadius: 12, border: `1px solid ${RF.softLine}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px', background: RF.card, cursor: 'pointer' }}>
                <div style={{ width: 24, height: 24, borderRadius: 999, background: T.primary50, color: T.primary700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>{index + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: T.text500, marginTop: 1 }}>{c.tags?.length ? c.tags.map((tag) => tag.name).join(', ') : c.travelTime}</div>
                </div>
                <Icon name="arrow" size={15} color={T.text400}/>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => nav.go('create-review')} style={{
          position: 'absolute',
          right: 20,
          bottom: 96,
          width: 54,
          height: 54,
          borderRadius: 999,
          border: 'none',
          background: T.primary500,
          color: '#fff',
          boxShadow: '0 10px 22px rgba(45,143,90,0.28)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}><Icon name="plus" size={26} color="#fff" strokeWidth={2.4}/></button>
        <BottomNav active="home"/>
      </div>
    </Phone>
  );
}

// 서버 썸네일이 있으면 사진, 없으면 기존 플레이스홀더를 쓴다
// shape: 이미지가 없거나 실패했을 때 채울 마스코트 플레이스홀더의 비율('landscape' | 'square').
// 서버가 썸네일을 주지 않거나 이미지 요청이 실패해도 카드 자리는 비워둘 수 없다 —
// 화면기획의 카드는 사진을 전제로 그려져 있다.
function RoomThumb({ src, height, overlay = false, shape = 'landscape', children }) {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => { setFailed(false); }, [src]);
  const source = !src || failed ? window.MoyeoImageCache.placeholderSources[shape] : src;
  return (
    <div style={{ position: 'relative', overflow: 'hidden', height, background: T.primary50 }}>
      <img
        src={source}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        style={{ display: 'block', width: '100%', height, objectFit: 'cover' }}
      />
      {overlay && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0.48))' }}/>}
      {children}
    </div>
  );
}

// 10 탐색의 목록 카드. 12 검색 결과가 같은 컴포넌트를 재사용한다 (새 카드 디자인을 만들지 않는다).
// 카드 높이는 94 를 최소로 두고 제목이 길면 늘어난다.
function ExploreServerRoomCard({ room, onClick, testId }) {
  const statusLabel = window.MoyeoApi.statusLabel(room.status);
  const dayTripTime = window.MoyeoApi.dayTripTimeText(room);
  const meetingText = window.MoyeoApi.meetingText(room);
  return (
    <div data-testid={testId} onClick={onClick} style={{ minHeight: 94, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card, padding: 9, display: 'flex', gap: 11, alignItems: 'center', marginBottom: 10, cursor: 'pointer' }}>
      <div style={{ width: 102, height: 74, borderRadius: 9, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
        <RoomThumb src={room.thumbnail} height={74} overlay>
          {statusLabel && (
            <span data-testid={testId ? `${testId}-status` : undefined} style={{ position: 'absolute', left: 7, bottom: 7, background: T.primary600, color: '#fff', borderRadius: 6, padding: '3px 6px', fontSize: 10, fontWeight: 800 }}>{statusLabel}</span>
          )}
          {room.recruitmentDDay != null && (
            <span data-testid={testId ? `${testId}-dday` : undefined} style={{ position: 'absolute', right: 7, top: 7, background: T.accent500, color: '#fff', borderRadius: 6, padding: '3px 6px', fontSize: 10, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>D-{room.recruitmentDDay}</span>
          )}
        </RoomThumb>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 900, lineHeight: '19px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{room.title}</div>
        <div style={{ marginTop: 6, fontSize: 12, color: T.text500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {room.courseTitle}{room.tags?.length ? ` · ${room.tags.map((tag) => tag.name).join(', ')}` : ''}
        </div>
        <div style={{ marginTop: 5, fontSize: 12, color: T.text700, fontWeight: 700 }}>{room.participantCount}/{room.maxParticipants}명 · {window.MoyeoApi.formatDate(room.startDate)} 출발</div>
        {(dayTripTime || meetingText) && (
          <div data-testid={testId ? `${testId}-meeting` : undefined} style={{ marginTop: 4, fontSize: 11, color: T.text500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontVariantNumeric: 'tabular-nums' }}>
            {dayTripTime}{dayTripTime && meetingText ? ' · ' : ''}{meetingText ? `${meetingText} 집합` : ''}
          </div>
        )}
      </div>
      <Icon name="heart" size={20} color={room.favorite ? T.accent500 : T.text700}/>
    </div>
  );
}

function ScreenExplore() {
  const nav = window.useNav ? window.useNav() : { go: () => {} };
  // 로그인 상태에서는 GET /api/v1/chat-rooms/search 결과로 목록을 대체하고,
  // 상단 카테고리 칩은 GET /api/v1/travel-courses/tags 후보로 대체한다.
  const liveMode = window.MoyeoApi?.live();
  // 탐색은 "보던 상태 유지" 탭이다 (TAB-STATE-CANON R3) — 재진입 시 다시 부르지 않는다.
  const keep = { enabled: liveMode, mode: 'keep' };
  const roomsData = window.useTabData('explore.rooms', () => window.MoyeoApi.searchRooms(), {
    ...keep, accept: Array.isArray,
  });
  const tagsData = window.useTabData('explore.tags', () => window.MoyeoApi.courseTags(), {
    ...keep, accept: (tags) => Array.isArray(tags) && tags.length > 0,
  });
  // 고른 칩과 스크롤 위치도 보던 상태다 — 탭을 떠났다 와도 그대로 남는다.
  const [activeTag, setActiveTag] = window.useTabState('explore.tag', null);
  const listScroll = window.useTabScroll('explore.list');
  const serverRooms = roomsData.value || null;
  const serverTags = tagsData.value || null;
  // 검색 응답에 tagId 필터가 없으므로 응답에 포함된 room.tags 로 화면에서 걸러낸다.
  const visibleRooms = serverRooms && activeTag
    ? serverRooms.filter((room) => (room.tags || []).some((tag) => tag.tagId === activeTag))
    : serverRooms;
  const openServerRoom = (roomId) => {
    window.MoyeoApi.selectRoom(roomId);
    nav.go('detail');
  };
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="탐색" right={<IconButton name="menu" onClick={() => nav.go('explore-map')}/>}/>
        <div style={{ padding: '0 18px' }}>
          <div onClick={() => nav.go('search')} style={{ height: 42, borderRadius: 11, border: `1px solid ${T.line200}`, background: RF.card, boxShadow: '0 2px 7px rgba(15,23,20,0.05)', display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px', cursor: 'pointer' }}>
            <Icon name="search" size={18} color={T.text500}/>
            <span style={{ fontSize: 13, color: T.text400 }}>어디로 떠나고 싶나요?</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, overflowX: 'auto' }}>
            {serverTags
              ? [{ tagId: null, name: '전체' }, ...serverTags].map((tag) => (
                <button key={tag.tagId ?? 'all'} type="button" data-testid={`explore-tag-${tag.tagId ?? 'all'}`} onClick={() => setActiveTag(tag.tagId)} style={{ height: 32, padding: '0 13px', borderRadius: 999, flexShrink: 0, border: `1px solid ${activeTag === tag.tagId ? T.primary500 : T.line200}`, background: activeTag === tag.tagId ? T.primary50 : RF.card, color: activeTag === tag.tagId ? T.primary700 : T.text700, fontSize: 12.5, fontWeight: 800, fontFamily: T.fontStack, whiteSpace: 'nowrap', cursor: 'pointer' }}>{tag.name}</button>
              ))
              : ['전체', '자연', '역사', '체험', '힐링'].map((c, i) => <Chip key={c} variant={i === 0 ? 'primary' : 'neutral'} size="md">{c}</Chip>)}
          </div>
        </div>
        <div ref={listScroll.ref} onScroll={listScroll.onScroll} style={{ height: 'calc(100% - 214px)', overflow: 'auto', padding: '14px 18px 98px' }}>
          {/* 목데이터 폴백은 없다. 서버 목록이 오기 전에는 아무것도 그리지 않고,
              비어 있으면 비어 있다고 말한다. */}
          {visibleRooms && visibleRooms.length === 0 && (
            <div style={{ padding: '48px 0', textAlign: 'center', color: T.text500, fontSize: 13 }}>지금 모집 중인 모임이 없어요.</div>
          )}
          <TabDataNotice status={roomsData.status} signedOut={!liveMode} onRetry={roomsData.reload} style={{ padding: '48px 0', textAlign: 'center', fontSize: 13 }}/>
          {(visibleRooms || []).map((room) => (
            <ExploreServerRoomCard key={room.roomId} room={room} testId={`explore-room-${room.roomId}`} onClick={() => openServerRoom(room.roomId)}/>
          ))}
        </div>
        <button onClick={() => nav.go('create-review')} style={{ position: 'absolute', right: 22, bottom: 96, width: 54, height: 54, borderRadius: 999, border: 'none', background: T.primary500, color: '#fff', boxShadow: '0 10px 22px rgba(45,143,90,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="plus" size={26} color="#fff" strokeWidth={2.4}/>
        </button>
        <BottomNav active="compass"/>
      </div>
    </Phone>
  );
}

function ScreenExploreMap() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const [selectedRoom, setSelectedRoom] = React.useState(null);
  // 마커는 서버 모집 좌표만 쓴다. 관광 표본 좌표에 기획의 인원 숫자를 얹던 가짜 핀은 지웠다.
  const liveMode = window.MoyeoApi?.live();
  const [serverRooms, setServerRooms] = React.useState(null);
  // 40040 INVALID_MAP_SEARCH_AREA 일 때만 문구를 띄운다. 그 밖의 실패는 예전처럼 조용히 넘긴다.
  const [areaError, setAreaError] = React.useState('');
  React.useEffect(() => {
    if (!liveMode) return undefined;
    let active = true;
    setAreaError('');
    // 지도 핀은 검색 응답으로 찍을 수 없다 — 2026-08-26 응답 축소로 집합 좌표가 빠졌다.
    // 경북 전역을 덮는 고정 반경으로 지도 API 를 부른다(BE 요청 §4-2 — 과도한 반경을 보내지 않는다).
    // 2026-08-30 서버가 radiusKm 상한 200km 를 세웠다. 120 은 그 아래라 지금은 걸리지 않지만,
    // 반경·중심이 화면에서 바뀌면 400 40040 이 날 수 있어 처리 경로를 남겨 둔다.
    window.MoyeoApi.mapRooms({ latitude: 36.4, longitude: 128.9, radiusKm: 120 })
      .then((rooms) => { if (active && Array.isArray(rooms)) setServerRooms(rooms); })
      .catch((error) => {
        if (!active) return;
        // 문구는 서버 errorMessage 를 그대로 쓴다 — 클라가 새 문구를 지어내지 않는다.
        if (window.MoyeoApi.isInvalidMapAreaError(error)) setAreaError(error.message);
      });
    return () => { active = false; };
  }, [liveMode]);
  const markers = React.useMemo(
    () => (serverRooms ? window.MoyeoApi.roomMarkers(serverRooms) : []),
    [serverRooms],
  );
  React.useEffect(() => {
    if (markers.length) setSelectedRoom((current) => current || markers[0].room);
  }, [markers]);
  const openSelected = () => {
    if (!selectedRoom) return;
    window.MoyeoApi.selectRoom(selectedRoom.roomId);
    nav.go('detail');
  };
  const roomDayTripTime = selectedRoom ? window.MoyeoApi.dayTripTimeText(selectedRoom) : '';
  const roomMeetingText = selectedRoom ? window.MoyeoApi.meetingText(selectedRoom) : '';
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, background: RF.mapGreen }}>
        <MiniMap
          height={852}
          // 카카오 JS SDK 의 level 은 모바일 SDK 의 zoomLevel 과 척도가 반대다.
          // 네이티브 zoomLevel 9(경북 전역)와 같은 범위가 되도록 JS level 11 을 쓴다.
          level={11}
          markers={markers}
          onMarkerSelect={(item) => setSelectedRoom(item.room)}
        />
        {/* 앱은 상태바(46) 아래에 헤더를 띄우지만 웹에는 상태바가 없다.
            46 을 그대로 두면 그 자리에 **지도가 그대로 보인다** — 사용자가 "상단이 뚫렸다"고 지적한 지점이다.
            헤더를 맨 위에 붙인다. */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
          <Header title="지도 탐색" left center onBack={nav.back} right={<IconButton name="menu"/>}/>
        </div>
        {areaError && (
          <div role="alert" data-testid="explore-map-area-error" style={{ position: 'absolute', top: 100, left: 18, right: 18, padding: '11px 13px', borderRadius: 12, background: RF.card, boxShadow: RF.softShadow, fontSize: 12.5, fontWeight: 700, color: T.danger, lineHeight: '18px' }}>
            {areaError}
          </div>
        )}
        <div style={{ position: 'absolute', right: 20, top: 530, width: 42, height: 42, borderRadius: 999, background: RF.card, boxShadow: RF.softShadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="myLocation" size={20} color={T.text700}/>
        </div>
        {/* 고른 모임이 없으면 카드 자리에 빈 상태만 둔다 — 예시 모임을 깔지 않는다. */}
        {selectedRoom ? (
          <div onClick={openSelected} data-testid="explore-map-card" style={{ position: 'absolute', left: 18, right: 18, bottom: 94, height: 96, borderRadius: 16, background: RF.card, boxShadow: RF.shadow, padding: 10, display: 'flex', gap: 12, cursor: 'pointer' }}>
            <div style={{ width: 84, borderRadius: 10, overflow: 'hidden' }}>
              <RoomThumb src={selectedRoom.thumbnail} height={76}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedRoom.title}</div>
              {/* 집합 안내가 null 이면 코스 이름만 남긴다 — "미정" 같은 문구를 지어내지 않는다 */}
              <div style={{ fontSize: 11, color: T.text500, marginTop: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{roomMeetingText || selectedRoom.courseTitle}</div>
              <div style={{ fontSize: 12, color: T.text700, fontWeight: 800, marginTop: 5, fontVariantNumeric: 'tabular-nums' }}>
                {selectedRoom.participantCount}/{selectedRoom.maxParticipants}명{roomDayTripTime ? ` · ${roomDayTripTime}` : ''}
              </div>
            </div>
            <Icon name="heart" size={20} color={selectedRoom.favorite ? T.accent500 : T.text700}/>
          </div>
        ) : (
          <div role="status" data-testid="explore-map-card" style={{ position: 'absolute', left: 18, right: 18, bottom: 94, borderRadius: 16, background: RF.card, boxShadow: RF.shadow, padding: '20px 14px', textAlign: 'center', color: T.text500, fontSize: 12.5 }}>
            {liveMode ? '지금 모집 중인 모임이 없어요.' : '로그인하면 모집 중인 모임을 볼 수 있어요.'}
          </div>
        )}
        <BottomNav active="compass"/>
      </div>
    </Phone>
  );
}

function ScreenCourseDetail() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  // 로그인 상태에서는 선택된 공개 코스(GET travel-courses/{id}) 또는 선택된 모임의 코스로 대체한다.
  const liveMode = window.MoyeoApi?.live();
  const [course, setCourse] = React.useState(null);
  // 목 코스 폴백이 없어졌으므로 요청 상태를 화면에 그대로 드러낸다.
  const [status, setStatus] = React.useState(liveMode ? 'loading' : 'signed-out');
  const [reloadKey, setReloadKey] = React.useState(0);
  React.useEffect(() => {
    if (!liveMode) return undefined;
    let active = true;
    setStatus('loading');
    const courseId = window.MoyeoApi.selectedCourseId();
    const load = courseId
      ? window.MoyeoApi.courseDetail(courseId)
      : window.MoyeoApi.roomCourse(window.MoyeoApi.selectedRoomId() || '1').then((result) => result?.course);
    load
      .then((result) => {
        if (!active) return;
        if (result?.courseId != null) { setCourse(result); setStatus('live'); }
        else setStatus('error');
      })
      .catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [liveMode, reloadKey]);
  const courseRoute = React.useMemo(
    () => (course ? window.MoyeoKakaoMap?.routeFromPlaces?.(course.places) : null) || null,
    [course],
  );
  // 14 "모집 중인 모임 보기" — GET /api/v1/travel-courses/{courseId}/chat-rooms.
  // 모집 마감 전이고 내가 아직 참가하지 않은 방만 온다(ATTACH-COMPOSER-CANON §4).
  // 예전에는 버튼이 15 모집 상세로 바로 튀어서 이 코스와 무관한 방이 열렸다.
  const [courseRooms, setCourseRooms] = React.useState(null);
  const [courseRoomsStatus, setCourseRoomsStatus] = React.useState('idle');
  const openCourseRooms = () => {
    if (!course?.courseId || courseRoomsStatus === 'loading') return;
    setCourseRoomsStatus('loading');
    setCourseRooms(null);
    window.MoyeoApi.courseChatRooms(course.courseId)
      .then((rooms) => {
        setCourseRooms(Array.isArray(rooms) ? rooms : []);
        setCourseRoomsStatus('done');
      })
      .catch(() => setCourseRoomsStatus('error'));
  };

  if (course) {
    // "2026.08.28 여행 후 공개 · 이 코스로 떠난 모임 1" — 서버가 안 준 항목은 빼고 이어 붙인다.
    // 안드로이드 serverCoursePublisherMeta() 와 같은 규칙이다(0 같은 자리표시자를 만들지 않는다).
    const publisherNickname = String(course.creatorNickname || '').trim();
    const publisherMeta = [
      course.creatorTravelStartDate ? `${String(course.creatorTravelStartDate).replace(/-/g, '.')} 여행 후 공개` : null,
      course.chatRoomCount != null ? `이 코스로 떠난 모임 ${course.chatRoomCount}` : null,
    ].filter(Boolean).join(' · ');
    const stats = [
      ['clock', '소요시간', course.travelTime],
      ['map', '이동거리', `${course.distanceKm}km`],
      // 평점이 없으면(averageRating null) 지어내지 않고 숨긴다
      course.averageRating != null ? ['star', '평점', `${course.averageRating} (${course.ratingCount})`] : null,
    ].filter(Boolean);
    return (
      <Phone>
        <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
          <Header title="코스 상세" left center onBack={nav.back}/>
          <div style={{ height: 'calc(100% - 148px)', overflow: 'auto', paddingBottom: 96 }}>
            <RoomThumb src={course.thumbnail} height={174}/>
            <div style={{ padding: '20px 20px 0' }}>
              <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 0 }}>{course.title}</div>
              {/* 태그 칩은 **표시 전용**이다 — 태그로 모임을 찾는 기능은 없다(2026-08-31 사용자 확인).
                  GET /travel-courses/tags 가 살아 있는 것은 태그를 **보여주기** 위한 것이고,
                  태그별 모임 검색 API(GET /chat-rooms/search/course-tags/{tagId})는 서버가 지웠다. */}
              {course.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 7, marginTop: 12, flexWrap: 'wrap' }}>
                  {course.tags.map((tag) => (
                    <Chip key={tag.tagId} variant="soft" testId={`course-tag-${tag.tagId}`}>{tag.name}</Chip>
                  ))}
                </div>
              )}
              {/* 14 "○○ 님이 다녀온 코스" — GET travel-courses/{id} 가 주는 작성자·여행일·모임 수를 쓴다.
                  안드로이드 CoursePublisherRow · iOS CoursePublishingSource 와 같은 줄이다.
                  작성자를 안 준 코스(비공개·방 코스)는 예전의 코스 출처 줄로 남는다. */}
              {publisherNickname ? (
                <div data-testid="course-publisher" style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 14, padding: 11, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card }}>
                  {/* 작성자 프로필 이미지는 2026-09-02 서버 변경으로 상세 응답에 온다.
                      URL 이 있으면 반드시 그 사진이다 — 닉네임 동물 아바타는 null 일 때만 나온다
                      (비공개·탈퇴·이미지 없음). 작성자 필드는 **상세 응답에만** 있고
                      public·popular·favorites 목록 응답에는 없다(실서버 확인) — 이 줄이 유일한 자리다. */}
                  <ProfileAvatar src={course.creatorProfileImageUrl} nickname={publisherNickname} size={30}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{publisherNickname} 님이 다녀온 코스</div>
                    {publisherMeta && <div style={{ fontSize: 10.5, color: T.text500, marginTop: 2 }}>{publisherMeta}</div>}
                  </div>
                  <Chip variant="soft" style={{ flexShrink: 0 }}>여행자 코스</Chip>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 14, padding: 11, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card }}>
                  <span style={{ width: 30, height: 30, borderRadius: 999, background: T.primary50, display: 'grid', placeItems: 'center' }}><Icon name="map" size={15} color={T.primary600}/></span>
                  <div style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 800 }}>{course.type === 'CUSTOM' ? '호스트가 직접 만든 코스' : '등록된 공개 코스'}</div>
                </div>
              )}
              {course.description && (
                <div style={{ fontSize: 13, color: T.text700, lineHeight: '21px', marginTop: 14 }}>{course.description}</div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 8, marginTop: 18 }}>
                {/* `textAlign: center` 는 **텍스트만** 가운데로 보낸다 — 아이콘은 블록이라
                    왼쪽에 남아 세 칸의 아이콘이 다 왼쪽으로 쏠려 보였다
                    (사용자 지적, 2026-09-09). flex 로 감싸 아이콘도 가운데에 둔다. */}
                {stats.map((s) => (
                  <div key={s[1]} style={{ textAlign: 'center', color: T.text700, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Icon name={s[0]} size={18} color={T.text500}/>
                    <div style={{ fontSize: 10, color: T.text500, marginTop: 6 }}>{s[1]}</div>
                    <div style={{ fontSize: 12, fontWeight: 900, marginTop: 3 }}>{s[2]}</div>
                  </div>
                ))}
              </div>
              {/* 서버가 준 방문지 좌표만으로 경로를 그린다. 좌표가 모자라면 지도를 아예 두지 않는다. */}
              {courseRoute && (
                <>
                  <div style={{ fontSize: 15, fontWeight: 900, marginTop: 28, marginBottom: 10 }}>코스 미리보기</div>
                  <div style={{ borderRadius: 12, overflow: 'hidden' }}>
                    <MiniMap height={146} markers={courseRoute.markers} polyline={courseRoute.polyline}/>
                  </div>
                </>
              )}
              <div style={{ fontSize: 15, fontWeight: 900, marginTop: 28, marginBottom: 10 }}>방문지 {course.places?.length || 0}곳</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {(course.places || []).map((place) => (
                  <div key={`${place.dayNumber}-${place.sequence}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card }}>
                    <span style={{ width: 24, height: 24, borderRadius: 999, background: T.primary50, color: T.primary700, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>{place.sequence}</span>
                    <div style={{ width: 46, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}><RoomThumb src={place.thumbnail} height={40} shape="square"/></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{place.title}</div>
                      <div style={{ fontSize: 11, color: T.text500, marginTop: 2 }}>{place.dayNumber}일차 · {window.MoyeoApi.formatTime(place.visitTime)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 18px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Btn variant="secondary" onClick={() => nav.go('create-review')}>이 코스로 모집 만들기</Btn>
            <Btn variant="primary" onClick={openCourseRooms} networkAction testId="course-rooms-open">모집 중인 모임 보기</Btn>
          </div>
          {courseRoomsStatus !== 'idle' && (
            <div data-testid="course-rooms-sheet" style={{ position: 'absolute', inset: 0, zIndex: 20, background: T.bgOverlay, display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ width: '100%', maxHeight: '72%', display: 'flex', flexDirection: 'column', borderRadius: '18px 18px 0 0', background: RF.card, borderTop: `1px solid ${RF.softLine}`, padding: '16px 18px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <b style={{ flex: 1, fontSize: 15 }}>이 코스로 모집 중인 모임</b>
                  <IconButton name="close" ariaLabel="닫기" onClick={() => { setCourseRoomsStatus('idle'); setCourseRooms(null); }}/>
                </div>
                <div style={{ flex: 1, minHeight: 0, overflow: 'auto', marginTop: 12 }}>
                  {courseRoomsStatus === 'loading' && <div role="status" style={{ padding: '36px 0', textAlign: 'center', fontSize: 13, color: T.text500 }}>불러오는 중이에요…</div>}
                  {courseRoomsStatus === 'error' && <div role="alert" style={{ padding: '36px 0', textAlign: 'center', fontSize: 13, color: T.text500 }}>불러오지 못했어요.</div>}
                  {courseRoomsStatus === 'done' && (courseRooms || []).length === 0 && (
                    <div role="status" style={{ padding: '36px 0', textAlign: 'center', fontSize: 13, color: T.text500 }}>지금 모집 중인 모임이 없어요.</div>
                  )}
                  {courseRoomsStatus === 'done' && (courseRooms || []).map((room) => (
                    <ExploreServerRoomCard
                      key={room.roomId}
                      room={room}
                      testId={`course-room-${room.roomId}`}
                      onClick={() => { window.MoyeoApi.selectRoom(room.roomId); nav.go('detail'); }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Phone>
    );
  }
  // 코스를 못 받으면 제목·소요시간·경로를 지어내지 않는다 — 상태만 남긴다.
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="코스 상세" left center onBack={nav.back}/>
        <div role="status" style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13, lineHeight: '21px' }}>
          {status === 'loading' && '불러오는 중이에요…'}
          {status === 'signed-out' && '로그인하면 모집 중인 모임을 볼 수 있어요.'}
          {status === 'error' && (
            <>불러오지 못했어요. <button type="button" onClick={() => setReloadKey((key) => key + 1)} style={{ padding: 0, border: 0, background: 'transparent', color: T.primary600, fontFamily: T.fontStack, fontSize: 13, fontWeight: 900, textDecoration: 'underline', cursor: 'pointer' }}>다시 시도</button></>
          )}
        </div>
      </div>
    </Phone>
  );
}

function ScreenGroupDetail() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {}, toggleLike: () => {}, isLiked: () => false };
  // 로그인 상태에서는 GET chat-rooms/{id} + join-eligibility + 코스 정보로 화면을 채운다.
  const liveMode = window.MoyeoApi?.live();
  const roomId = liveMode ? (window.MoyeoApi.selectedRoomId() || '1') : null;
  const [room, setRoom] = React.useState(null);
  const [course, setCourse] = React.useState(null);
  const [canApply, setCanApply] = React.useState(null);
  // 모집(채팅방) 신고는 접수 API 가 없다 — 30-2 시트(피드 전용)로 보내지 않고
  // 누른 자리에서 문의 안내를 띄운다 (정본 REPORT-CANON §3).
  const [reportNoticeOpen, setReportNoticeOpen] = React.useState(false);
  // 목 모집 폴백이 없어졌으므로 요청 상태를 그대로 그린다.
  const [status, setStatus] = React.useState(liveMode ? 'loading' : 'signed-out');
  const [reloadKey, setReloadKey] = React.useState(0);
  React.useEffect(() => {
    if (!liveMode || !roomId) return undefined;
    let active = true;
    setStatus('loading');
    // 참가 가능 여부는 상세의 canApply 로 온다. 예전 /join-eligibility 는 서버에서 삭제됐다
    // (실측 404 · code 40402). 모집 상태·마감·기존 신청·성별/나이 제한이 모두 반영된 값이다.
    window.MoyeoApi.roomDetail(roomId)
      .then((detail) => {
        if (!active) return;
        if (detail?.roomId == null) { setStatus('error'); return; }
        setRoom(detail);
        setStatus('live');
        if (typeof detail.canApply === 'boolean') setCanApply(detail.canApply);
      })
      .catch(() => { if (active) setStatus('error'); });
    window.MoyeoApi.roomCourse(roomId)
      .then((result) => { if (active && result?.course) setCourse(result.course); })
      .catch(() => {});
    return () => { active = false; };
  }, [liveMode, roomId, reloadKey]);
  const onToggleFavorite = async () => {
    try {
      const result = await window.MoyeoApi.toggleFavorite(roomId);
      setRoom((current) => (current ? { ...current, favorite: Boolean(result?.favorite) } : current));
      // TAB-STATE-CANON R4: 탐색 목록의 하트도 같이 맞춘다 — 바뀐 항목만 갈아끼운다.
      window.MoyeoTabCache?.patch?.('explore.rooms', (rooms) => (rooms || []).map((room) => (
        String(room.roomId) === String(roomId) ? { ...room, favorite: Boolean(result?.favorite) } : room
      )));
    } catch (_) { /* 찜 실패는 조용히 무시 */ }
  };

  if (room) {
    const statusLabel = { RECRUITING: '진행중', CONFIRMED: '확정', CANCELLED: '취소됨' }[room.status] || room.status;
    // 서버 enum 은 NONE / MALE_ONLY / FEMALE_ONLY 다 (MALE·FEMALE 아님)
    const genderLabel = { NONE: '제한 없음', MALE_ONLY: '남성만', FEMALE_ONLY: '여성만' }[room.genderRestriction] || room.genderRestriction;
    const ageLabel = room.minimumAge == null && room.maximumAge == null
      ? '제한 없음'
      : `${room.minimumAge ?? ''} ~ ${room.maximumAge ?? ''}세`;
    const meetingTime = room.meetingDateTime ? window.MoyeoApi.formatTime(String(room.meetingDateTime).split('T')[1]) : '';
    const infoRows = [
      ['calendar', '일정', `${window.MoyeoApi.formatDate(room.startDate)} · ${window.MoyeoApi.tripTypeLabel(room)}`],
      room.tripType === 'DAY_TRIP' && room.dayTripStartTime
        ? ['clock', '여행 시간', `${window.MoyeoApi.formatTime(room.dayTripStartTime)} - ${window.MoyeoApi.formatTime(room.dayTripEndTime)}`]
        : null,
      room.meetingDetails ? ['pin', '집합', `${meetingTime ? `${meetingTime} ` : ''}${room.meetingDetails}`] : null,
    ].filter(Boolean);
    const summaryCells = [
      room.participationFee != null ? ['money', '예상 비용', `1인 ${Number(room.participationFee).toLocaleString()}원`] : null,
      ['clock', '모집 마감', `D-${room.recruitmentDDay} · ${window.MoyeoApi.formatDate(room.recruitmentDeadlineDate)}`],
      ['users', '나이대', ageLabel],
      ['user', '성별', genderLabel],
    ].filter(Boolean);
    return (
      <Phone>
        <div style={{ position: 'absolute', inset: 0, background: RF.bg }}>
          {/* 앱(iOS·안드로이드)처럼 **히어로까지 함께** 스크롤된다 — 예전에는 이미지가 상단에 고정돼
              2쪽에도 사진이 남아 있었다(사용자 지적, 2026-08-31). 스크롤 컨테이너를 이미지 위로 올려
              이미지를 스크롤 흐름 안에 넣었다. 뒤로·신고 버튼도 이미지와 함께 올라간다(앱 동작).
              하단 CTA 는 앱과 같이 계속 고정이다. */}
          <div data-testid="detail-scroll" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 86, overflow: 'auto' }}>
            <RoomThumb src={room.thumbnail} height={284} overlay>
              <div style={{ position: 'absolute', top: 58, left: 18 }}>
                <IconButton name="back" onClick={nav.back} bg={T.overlayPanel}/>
              </div>
              <div style={{ position: 'absolute', top: 58, right: 18 }}>
                <IconButton name="flag" ariaLabel="신고" onClick={() => setReportNoticeOpen(true)} bg={T.overlayPanel}/>
              </div>
              <span style={{ position: 'absolute', left: 20, bottom: 20, color: '#fff', fontSize: 12, fontWeight: 800 }}>{statusLabel}</span>
            </RoomThumb>
            {/* 히어로 아래 38px 을 덮어 올라가는 카드. 예전 top: 246 절대 배치와 같은 위치다. */}
            <div style={{ position: 'relative', marginTop: -38, minHeight: 'calc(100% - 246px)', background: RF.card, borderRadius: '24px 24px 0 0', padding: '24px 20px 18px' }}>
              <h1 style={{ margin: 0, fontSize: 23, lineHeight: '31px', fontWeight: 900, letterSpacing: 0 }}>{room.title}</h1>
              {room.description && <div style={{ marginTop: 8, fontSize: 13, color: T.text500, lineHeight: '19px' }}>{room.description}</div>}
              {course && (
                <button type="button" onClick={() => nav.go('course')} style={{ width: '100%', marginTop: 12, padding: 12, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card, color: T.text900, display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', fontFamily: T.fontStack, cursor: 'pointer' }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: T.primary50, display: 'grid', placeItems: 'center' }}><Icon name="map" size={17} color={T.primary600}/></span>
                  <span style={{ flex: 1 }}>
                    <b style={{ display: 'block', fontSize: 13 }}>{course.title}</b>
                    <span style={{ display: 'block', marginTop: 3, fontSize: 11, color: T.text500 }}>방문지 {course.places?.length || 0}곳 · {course.type === 'CUSTOM' ? '호스트 직접 코스' : '등록된 코스'}</span>
                  </span>
                  <Icon name="arrow" size={15} color={T.text400}/>
                </button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16 }}>
                {(room.participants || []).slice(0, 5).map((member, index) => (
                  member.profileImageUrl
                    ? <img key={member.userId} src={member.profileImageUrl} alt="" style={{ width: 28, height: 28, borderRadius: 999, border: '2px solid #fff', marginLeft: index ? -8 : 0, objectFit: 'cover', background: T.primary50 }}/>
                    : <span key={member.userId} style={{ width: 28, height: 28, borderRadius: 999, border: '2px solid #fff', marginLeft: index ? -8 : 0, background: T.primary50, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user" size={14} color={T.primary600}/></span>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, marginBottom: 7 }}>
                  <span>{room.participantCount} / {room.maxParticipants}명</span>
                  {canApply != null && <span style={{ color: canApply ? T.text400 : T.accent500 }}>{canApply ? '신청 가능' : '신청 불가'}</span>}
                </div>
                <ProgressBar current={room.participantCount} max={room.maxParticipants}/>
              </div>
              <div style={{ marginTop: 18, border: `1px solid ${RF.softLine}`, borderRadius: 12, padding: 14, display: 'grid', gap: 10 }}>
                {infoRows.map((r) => (
                  <div key={r[1]} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <Icon name={r[0]} size={16} color={T.text500}/>
                    <span style={{ width: 66, color: T.text500, flexShrink: 0 }}>{r[1]}</span>
                    <span style={{ flex: 1, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{r[2]}</span>
                  </div>
                ))}
                {room.meetingLatitude != null && room.meetingLongitude != null && (
                  <>
                    <div style={{ height: 1, background: RF.softLine }}/>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Icon name="map" size={16} color={T.text500}/>
                      {/* 15 는 읽는 화면이다 — 좌표는 길 찾기의 입력값이지 사용자에게 보일 값이 아니다.
                          기획도 이 자리에 집합 장소 이름을 둔다. */}
                      <span style={{ flex: 1, fontSize: 11.5, color: T.text500 }}>{room.meetingDetails || '집합 위치'}</span>
                      {/* 집합 좌표를 지도 앱으로 넘긴다. 서버 호출은 없다.
                          좌표는 링크에만 실리고 화면에는 그대로 적지 않는다(위 주석). */}
                      <a
                        href={window.MoyeoKakaoMap.directionsUrl(room.meetingLatitude, room.meetingLongitude, room.meetingDetails)}
                        target="_blank"
                        rel="noreferrer noopener"
                        data-testid="detail-directions"
                        style={{ border: 0, background: 'transparent', padding: 0, fontSize: 12, fontWeight: 800, color: T.primary600, fontFamily: T.fontStack, cursor: 'pointer', textDecoration: 'none' }}
                      >길 찾기</a>
                    </div>
                  </>
                )}
              </div>
              <div style={{ marginTop: 10, border: `1px solid ${RF.softLine}`, borderRadius: 12, padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {summaryCells.map((item) => <div key={item[1]} style={{ display: 'flex', gap: 8 }}><Icon name={item[0]} size={15} color={T.text500}/><span><span style={{ display: 'block', fontSize: 10.5, color: T.text500 }}>{item[1]}</span><b style={{ display: 'block', marginTop: 3, fontSize: 12 }}>{item[2]}</b></span></div>)}
              </div>
              {course?.type === 'CUSTOM' && (
                <div style={{ marginTop: 10, display: 'flex', gap: 9, alignItems: 'flex-start', padding: 12, borderRadius: 12, background: T.primary50, border: `1px solid ${T.primary100}` }}>
                  <Icon name="refresh" size={15} color={T.primary700}/>
                  <div style={{ flex: 1, fontSize: 11.5, lineHeight: '17px', color: T.primary700 }}>
                    호스트가 직접 만든 코스예요. 여행이 확정({window.MoyeoApi.formatDate(room.recruitmentDeadlineDate)} 마감)되기 전까지 경로가 바뀔 수 있고, 바뀌면 알림으로 알려드려요.
                  </div>
                </div>
              )}
              {/* 호스트 닉네임·매너 점수는 서버 응답에 없어 프로필 이미지만 보여준다 */}
              <div style={{ marginTop: 18, fontSize: 13, fontWeight: 900 }}>호스트</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                {room.hostProfileImageUrl
                  ? <img src={room.hostProfileImageUrl} alt="호스트 프로필" style={{ width: 44, height: 44, borderRadius: 999, objectFit: 'cover', background: T.primary50 }}/>
                  : <span style={{ width: 44, height: 44, borderRadius: 999, background: T.primary50, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user" size={20} color={T.primary600}/></span>}
                <div style={{ flex: 1 }}/>
              </div>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 18px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'grid', gridTemplateColumns: '52px 1fr', gap: 10 }}>
            <button data-testid="detail-favorite" aria-label={room.favorite ? '찜 해제' : '찜하기'} onClick={onToggleFavorite} style={{ width: 52, height: 48, borderRadius: 12, border: `1px solid ${T.line200}`, background: RF.card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name="heart" size={22} color={room.favorite ? T.accent500 : T.text900}/>
            </button>
            <Btn variant="primary" disabled={canApply === false} onClick={() => nav.go('apply')}>함께 가기 신청</Btn>
          </div>
          {reportNoticeOpen && window.ReportUnsupportedDialog
            && React.createElement(window.ReportUnsupportedDialog, { onClose: () => setReportNoticeOpen(false) })}
        </div>
      </Phone>
    );
  }

  // 모집을 못 받으면 제목·인원·집합 장소를 지어내지 않는다 — 상태만 남긴다.
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="모집 상세" left center onBack={nav.back}/>
        <div role="status" style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13, lineHeight: '21px' }}>
          {status === 'loading' && '불러오는 중이에요…'}
          {status === 'signed-out' && '로그인하면 모집 중인 모임을 볼 수 있어요.'}
          {status === 'error' && (
            <>불러오지 못했어요. <button type="button" onClick={() => setReloadKey((key) => key + 1)} style={{ padding: 0, border: 0, background: 'transparent', color: T.primary600, fontFamily: T.fontStack, fontSize: 13, fontWeight: 900, textDecoration: 'underline', cursor: 'pointer' }}>다시 시도</button></>
          )}
        </div>
      </div>
    </Phone>
  );
}

function ScreenApplySheet() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  // 로그인 상태에서는 실제 신청 폼: 내 프로필 카드(GET profile) + POST {roomId}/applications
  const liveMode = window.MoyeoApi?.live();
  const roomId = liveMode ? (window.MoyeoApi.selectedRoomId() || '1') : null;
  const [profile, setProfile] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    if (!liveMode) return undefined;
    let active = true;
    window.MoyeoApi.myProfile()
      .then((result) => { if (active && result?.nickname) setProfile(result); })
      .catch(() => {});
    return () => { active = false; };
  }, [liveMode]);
  const submit = async () => {
    if (!liveMode) { nav.go('chat'); return; }
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await window.MoyeoApi.applyToRoom(roomId, message.trim() || null);
      // TAB-STATE-CANON R4: 신청으로 내 모임·신청중 목록이 바뀌었다 — 그 키만 덜어낸다.
      window.MoyeoTabCache?.invalidate?.(window.MoyeoTabCache.ROOM_LIST_KEYS);
      setSubmitting(false);
      nav.go(result?.result === 'JOINED' ? 'chat-list' : 'chat-list-applied');
    } catch (requestError) {
      setSubmitting(false);
      setError(requestError?.message || '신청을 완료하지 못했어요. 잠시 후 다시 시도해주세요.');
    }
  };
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, background: '#111' }}>
        <Photo hue="forest" height={330} radius={0} overlay>
          <div style={{ position: 'absolute', top: 58, left: 18 }}>
            <IconButton name="back" onClick={nav.back} bg={T.overlayPanel}/>
          </div>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.44)' }}/>
        </Photo>
        {/* 16 신청 시트는 이미 코스 히어로 사진 위에 떠 있다 — 표면만 bgRaised + l3로 다른 시트와 통일한다 (changeLog14) */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: T.bgRaised, borderRadius: '24px 24px 0 0', padding: '20px 20px 32px', boxShadow: T.l3 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 18, fontWeight: 900 }}>함께 가기 신청</div>
            <IconButton name="close" onClick={nav.back}/>
          </div>
          <div style={{ fontSize: 13, fontWeight: 900, marginTop: 18 }}>한마디를 남겨주세요!</div>
          {liveMode ? (
            <div style={{ marginTop: 10, borderRadius: 12, border: `1px solid ${T.line200}`, padding: '12px 14px 10px' }}>
              <textarea
                value={message}
                maxLength={200}
                onChange={(event) => setMessage(event.target.value)}
                aria-label="신청 한마디"
                data-testid="apply-message"
                placeholder={'간단한 인사나 기대하는 마음을\n남겨주세요 😊 (10자 이상 200자 이하)'}
                style={{ width: '100%', height: 74, border: 0, outline: 0, resize: 'none', background: 'transparent', color: T.text900, fontFamily: T.fontStack, fontSize: 13, lineHeight: '20px' }}
              />
              <div style={{ textAlign: 'right', fontSize: 11, color: T.text400 }}>{message.length}/200</div>
            </div>
          ) : (
            <div style={{ marginTop: 10, height: 112, borderRadius: 12, border: `1px solid ${T.line200}`, padding: 14, color: T.text400, fontSize: 13, lineHeight: '20px' }}>
              간단한 인사나 기대하는 마음을<br/>남겨주세요 😊 (10자 이상 200자 이하)
              <div style={{ textAlign: 'right', marginTop: 30, fontSize: 11 }}>0/200</div>
            </div>
          )}
          <div style={{ fontSize: 13, fontWeight: 900, marginTop: 18 }}>내 소개 카드</div>
          <div style={{ marginTop: 10, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: T.bgSubtle, padding: 12, display: 'flex', gap: 12 }}>
            {profile
              ? (profile.profileImageUrl
                ? <img src={profile.profileImageUrl} alt="" style={{ width: 54, height: 54, borderRadius: 999, objectFit: 'cover', background: T.primary50 }}/>
                : <span style={{ width: 54, height: 54, borderRadius: 999, background: T.primary50, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user" size={24} color={T.primary600}/></span>)
              : <AnimalAvatar kind="bear" size={54} bg={T.primary50}/>}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 900 }}>{profile ? profile.nickname : '모여트립이'}</div>
              {profile
                ? (profile.introduction && <div style={{ fontSize: 12, color: T.text700, lineHeight: '18px', marginTop: 4 }}>{profile.introduction}</div>)
                : <div style={{ fontSize: 12, color: T.text700, lineHeight: '18px', marginTop: 4 }}>자연 속에서 힐링하는 걸 좋아해요!<br/>사진 찍는 것도 좋아합니다</div>}
            </div>
          </div>
          {error && <div role="alert" style={{ marginTop: 12, fontSize: 12, color: T.dangerText, lineHeight: '17px' }}>{error}</div>}
          <Btn variant="primary" full disabled={submitting} onClick={submit} style={{ marginTop: 18 }} testId="apply-submit">{submitting ? '신청하는 중...' : '신청하기'}</Btn>
        </div>
      </div>
    </Phone>
  );
}

function ScreenCreateReview() {
  const nav = window.useNav ? window.useNav() : { back: () => {}, go: () => {} };
  const [source, setSource] = React.useState('linked');
  // 로그인 상태에서는 등록된 코스 목록을 GET travel-courses/public 으로 대체한다 —
  // 17-5 에서 POST /chat-rooms 에 실제 courseId 를 실어 보내려면 서버 코스여야 한다.
  const liveMode = window.MoyeoApi?.live();
  const [serverCourses, setServerCourses] = React.useState(null);
  React.useEffect(() => {
    if (!liveMode) return undefined;
    let active = true;
    window.MoyeoApi.publicCourses()
      .then((courses) => { if (active && Array.isArray(courses) && courses.length) setServerCourses(courses); })
      .catch(() => { /* 실패하면 코스 목록이 비어 있다 — 예시 코스를 고르게 하지 않는다 */ });
    return () => { active = false; };
  }, [liveMode]);
  // 고를 수 있는 코스는 서버가 준 것뿐이다. 없는 코스를 골라 모집을 만들면 courseId 가 없다.
  const rows = (serverCourses || []).map((course) => [
    course.title,
    [course.travelTime, course.distanceKm != null ? `${course.distanceKm}km` : null, `방문지 ${course.places?.length || 0}`].filter(Boolean).join(' · '),
    course.thumbnail,
    course.courseId,
  ]);
  const [picked, setPicked] = React.useState('');
  // 서버 코스로 바뀌면 첫 코스를 고른 상태로 맞춘다.
  React.useEffect(() => {
    if (serverCourses) setPicked(serverCourses[0].title);
  }, [serverCourses]);
  const chooseSource = (next) => {
    window.__moyeoCourseSource = next;
    setSource(next);
  };
  // 다음 단계로 넘기는 값 — 17-5 요약이 그대로 읽어 요청을 만든다.
  const rememberCourse = () => {
    const selectedRow = rows.find((row) => row[0] === picked) || rows[0];
    window.MoyeoApi?.updateRoomDraft({
      courseType: source === 'custom' ? 'CUSTOM' : 'PUBLIC',
      courseId: source === 'custom' ? null : (selectedRow?.[3] ?? null),
      courseTitle: source === 'custom' ? null : selectedRow?.[0] || null,
    });
  };
  const SourceCard = ({ id, title, desc, note, icon }) => {
    const selected = source === id;
    return (
      <button type="button" data-testid={`course-source-${id}`} aria-pressed={selected} onClick={() => chooseSource(id)} style={{
        width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: T.fontStack,
        borderRadius: 14, padding: 13, display: 'flex', gap: 11, alignItems: 'flex-start',
        border: `1.5px solid ${selected ? T.primary500 : RF.softLine}`,
        background: selected ? T.primary50 : RF.card,
      }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: selected ? T.primary500 : T.bgSubtle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={19} color={selected ? '#fff' : T.text500}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: selected ? T.primary700 : T.text900 }}>{title}</span>
            {selected && <Icon name="check" size={15} color={T.primary600} strokeWidth={3}/>}
          </div>
          <div style={{ fontSize: 11.5, color: T.text500, marginTop: 4, lineHeight: '17px' }}>{desc}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 7, fontSize: 11, fontWeight: 800, color: selected ? T.primary600 : T.text400 }}>
            <Icon name={id === 'linked' ? 'lock' : 'refresh'} size={12} color="currentColor" strokeWidth={2}/>{note}
          </div>
        </div>
      </button>
    );
  };
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="모집 만들기 (1/5)" left center onBack={nav.back}/>
        <div style={{ padding: '6px 20px 0', display: 'flex', justifyContent: 'space-between' }}>
          {['코스','일정','인원','세부','리뷰'].map((s, i) => (
            <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: i === 0 ? T.primary600 : T.text400 }}>
              <div style={{ width: 34, height: 34, borderRadius: 999, border: `1px solid ${i === 0 ? T.primary500 : T.line200}`, background: i === 0 ? T.primary50 : RF.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={i === 0 ? 'map' : i === 1 ? 'calendar' : i === 2 ? 'users' : i === 3 ? 'note' : 'star'} size={16} color="currentColor"/>
              </div>
              <div style={{ fontSize: 10, fontWeight: 800 }}>{s}</div>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', top: 148, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '0 20px 20px' }}>
          <div style={{ fontSize: 15, fontWeight: 900 }}>코스 선택</div>
          <div style={{ fontSize: 12, color: T.text500, marginTop: 6 }}>등록된 코스를 그대로 써도 되고, 직접 짜도 돼요.</div>
          <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
            <SourceCard id="linked" icon="map" title="등록된 코스로 떠나기" desc="검증된 동선을 그대로 가져와요." note="경로 수정 불가 · 집합 정보만 설정"/>
            <SourceCard id="custom" icon="note" title="코스 직접 만들기" desc="방문지와 시간을 내가 짜요. 저장하면 다른 여행자에게도 코스로 노출돼요." note="여행 확정 전까지 수정 가능"/>
          </div>
          {source === 'linked' ? (
            <div style={{ marginTop: 20 }}>
              <div style={{ height: 42, borderRadius: 11, border: `1px solid ${T.line200}`, display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px' }}>
                <Icon name="search" size={17} color={T.text500}/><span style={{ fontSize: 13, color: T.text400 }}>등록된 코스 검색</span>
              </div>
              <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                {/* 예시 코스는 없다 — 서버 코스가 오기 전에는 비어 있다고 말한다. */}
                {!rows.length && (
                  <div style={{ padding: '28px 4px', textAlign: 'center', fontSize: 12.5, color: T.text500 }}>
                    {liveMode ? '지금 모집 중인 모임이 없어요.' : '로그인하면 모집 중인 모임을 볼 수 있어요.'}
                  </div>
                )}
                {rows.map((row) => {
                  const selected = picked === row[0];
                  return <button type="button" key={row[0]} onClick={() => setPicked(row[0])} style={{ height: 72, width: '100%', borderRadius: 12, cursor: 'pointer', fontFamily: T.fontStack, textAlign: 'left', border: `1px solid ${selected ? T.primary500 : RF.softLine}`, padding: 8, display: 'flex', alignItems: 'center', gap: 10, background: RF.card }}>
                    <div style={{ width: 54, borderRadius: 9, overflow: 'hidden' }}><RoomThumb src={row[2]} height={54} shape="square"/></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row[0]}</div>
                      <div style={{ fontSize: 11, color: T.text500, marginTop: 4 }}>{row[1]}</div>
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: 999, border: `1px solid ${selected ? T.primary500 : T.line200}`, background: selected ? T.primary500 : RF.card, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {selected && <Icon name="check" size={14} color="#fff" strokeWidth={3}/>}
                    </div>
                  </button>;
                })}
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 9, alignItems: 'flex-start', padding: 13, borderRadius: 12, background: T.bgSubtle, border: `1px solid ${RF.softLine}` }}>
                <Icon name="lock" size={16} color={T.text500}/><div style={{ flex: 1, fontSize: 12, lineHeight: '18px', color: T.text700 }}>등록된 코스는 방문지와 순서가 고정돼요. 대신 일정·집합 장소·인원 조건은 마감 전까지 자유롭게 바꿀 수 있어요.</div>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 20 }}>
              <div style={{ borderRadius: 14, border: `1px dashed ${T.line300}`, background: RF.card, padding: 16, textAlign: 'center' }}>
                <div style={{ width: 46, height: 46, borderRadius: 999, background: T.primary50, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}><Icon name="pin" size={22} color={T.primary600}/></div>
                <div style={{ fontSize: 13, fontWeight: 900, marginTop: 10 }}>내 경로를 그려볼까요?</div>
                <div style={{ fontSize: 12, color: T.text500, marginTop: 6, lineHeight: '18px' }}>방문지를 검색해 순서대로 담고, 시간만 적으면 끝이에요.<br/>최소 2개 · 최대 20개</div>
                <div style={{ marginTop: 12 }}><Btn variant="secondary" full icon="plus" onClick={() => nav.go('custom-course')}>코스 만들기 시작</Btn></div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 9, alignItems: 'flex-start', padding: 13, borderRadius: 12, background: T.primary50, border: `1px solid ${T.primary100}` }}>
                <Icon name="refresh" size={16} color={T.primary700}/><div style={{ flex: 1, fontSize: 12, lineHeight: '18px', color: T.primary700 }}>직접 만든 코스는 <b>여행이 확정되기 전까지</b> 호스트가 언제든 고칠 수 있어요. 수정하면 멤버 모두에게 알림이 가요.</div>
              </div>
            </div>
          )}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}` }}>
          <Btn variant="primary" full onClick={() => {
            window.__moyeoCourseSource = source;
            rememberCourse();
            nav.go(source === 'custom' ? 'custom-course' : 'create-schedule');
          }}>{source === 'custom' ? '코스 만들러 가기' : '이 코스로 다음'}</Btn>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 20 · 21 공용 · 특수 메시지 카드 ─────────
// 21 「특수 메시지 6종」은 채팅방(20)과 **같은 카드**를 그려야 한다 — 두 화면이 다르게 생기면 그게 결함이다.
// 그래서 카드를 ChatRoomBody 안의 클로저에서 꺼내 모듈 수준으로 올려 두 화면이 함께 쓴다.
// (예전 21 에는 `대응 API 가 없다` 는 틀린 주석과 함께 빈 화면만 있었다 — 6종 전부 API 가 있다.)
// voting/onVote 가 없으면 투표 버튼은 눌러도 아무 일이 없다 — 카드 모양은 같게 둔다.
function SpecialMessageCard({ message, voting = false, onVote = null }) {
  if (message.imageUrl) {
    return <img src={message.imageUrl} alt={message.content || ''} style={{ display: 'block', maxWidth: 220, borderRadius: 10 }}/>;
  }
  if (message.tourismContent) {
    const place = message.tourismContent;
    return (
      <div data-testid={`chat-card-tourism-${message.messageId}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
          <Icon name="pin" size={13} color={T.primary600}/>
          <span style={{ fontSize: 11, fontWeight: 800, color: T.primary700 }}>장소</span>
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 800 }}>{place.title}</div>
        {place.address && <div style={{ fontSize: 11.5, color: T.text500, marginTop: 3, lineHeight: '17px' }}>{place.address}</div>}
        <div style={{ marginTop: 8, borderRadius: 10, overflow: 'hidden' }}><RoomThumb src={place.thumbnail} height={80}/></div>
      </div>
    );
  }
  if (message.location) {
    const spot = message.location;
    return (
      <div data-testid={`chat-card-location-${message.messageId}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
          <Icon name="map" size={13} color={T.accent700}/>
          <span style={{ fontSize: 11, fontWeight: 800, color: T.accent700 }}>만날 위치</span>
        </div>
        {/* 기획 21 「지도·만남」 카드의 지도. 좌표가 있으면 **실제 카카오 지도**만 그린다(NO-MOCK R4) —
            좌표가 없거나 지도를 못 쓰면 MiniMap 이 스스로 아무것도 그리지 않는다.
            자리·높이·순서는 iOS `ChatSpecialMessageCard.locationCard` 와 같다(지도 → 이름 → 좌표). */}
        <div style={{ marginBottom: 7 }}>
          <MiniMap
            height={110}
            level={4}
            center={{ lat: Number(spot.latitude), lng: Number(spot.longitude) }}
            markers={[{ lat: Number(spot.latitude), lng: Number(spot.longitude), label: '' }]}
          />
        </div>
        {/* 좌표는 지도를 그리는 입력값이지 사용자에게 보일 값이 아니다 — 기획에도 없다.
            위에 실제 지도가 있으니 좌표 줄은 중복이기도 하다. */}
        <div style={{ fontSize: 13.5, fontWeight: 800 }}>{spot.name || message.content}</div>
      </div>
    );
  }
  if (message.poll) {
    const poll = message.poll;
    const busy = voting;
    return (
      <div data-testid={`chat-card-poll-${message.messageId}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
          <Icon name="poll" size={13} color={T.primary600}/>
          <span style={{ fontSize: 11, fontWeight: 800, color: T.primary700 }}>투표</span>
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 800, lineHeight: '19px' }}>{poll.question}</div>
        <div style={{ display: 'grid', gap: 6, marginTop: 9 }}>
          {(poll.options || []).map((option) => {
            const percent = window.MoyeoApi.pollPercent(poll, option);
            return (
              <button
                key={option.optionId}
                type="button"
                disabled={busy}
                data-testid={`poll-option-${message.messageId}-${option.optionId}`}
                onClick={() => (onVote ? onVote(message, option) : undefined)}
                style={{
                  position: 'relative', width: '100%', minHeight: 36, padding: '7px 10px', overflow: 'hidden',
                  borderRadius: 9, border: `1px solid ${option.votedByMe ? T.primary500 : T.line200}`,
                  background: option.votedByMe ? T.primary50 : RF.card, cursor: busy ? 'default' : 'pointer',
                  fontFamily: T.fontStack, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                }}>
                <span aria-hidden style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${percent}%`, background: T.primary100, opacity: 0.55 }}/>
                <span style={{ position: 'relative', flex: 1, minWidth: 0, fontSize: 12, fontWeight: option.votedByMe ? 800 : 700, color: T.text900 }}>{option.text}</span>
                <span style={{ position: 'relative', fontSize: 11, fontWeight: 800, color: T.text500, fontVariantNumeric: 'tabular-nums' }}>{option.voteCount}</span>
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 10.5, color: T.text500, marginTop: 7, fontVariantNumeric: 'tabular-nums' }}>
          {poll.totalVoteCount}명 참여{poll.anonymous ? ' · 익명' : ''}
        </div>
      </div>
    );
  }
  if (message.type === 'SETTLEMENT_MEMO') {
    return (
      <div data-testid={`chat-card-settlement-${message.messageId}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Icon name="money" size={13} color={T.text700}/>
          <span style={{ fontSize: 11, fontWeight: 800, color: T.text500 }}>정산 메모 · 송금 아님</span>
        </div>
        <div style={{ fontSize: 13, lineHeight: '19px', whiteSpace: 'pre-line' }}>{message.content}</div>
      </div>
    );
  }
  return message.content;
}

// 카드형(넓고 흰 표면)으로 그려야 하는 메시지인지. 일반 텍스트 버블과 표면이 다르다.
function isSpecialMessageCard(message) {
  return Boolean(message && (message.imageUrl || message.tourismContent || message.location
    || message.poll || message.type === 'SETTLEMENT_MEMO'));
}

// SYSTEM 메시지(여행 확정·참여·공지 등록 등)는 서버가 만든다. 중앙 정렬 알림 줄이다.
function SystemMessageNote({ message, style }) {
  return (
    <div data-testid={`chat-card-system-${message.messageId}`} style={{ width: 'fit-content', maxWidth: '90%', margin: '0 auto 14px', background: T.systemMsg, color: T.primary700, borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 800, whiteSpace: 'pre-line', textAlign: 'center', ...style }}>{message.content}</div>
  );
}

function ScreenChatRoom() {
  return (
    <Phone>
      <ChatRoomBody/>
    </Phone>
  );
}

// 20 본문 — 20-2 첨부 메뉴·32 신고 시트가 "이전 화면 위에 떠 있다"고 읽히도록 배경으로도 재사용한다 (changeLog14)
function ChatRoomBody() {
  const nav = window.useNav ? window.useNav() : { back: () => {} };
  // 기획 20과 같이 진입 시 입력이 비어 있으면 전송은 비활성이다.
  const [draft, setDraft] = React.useState('');
  // 참여 중인 방이면 GET {id}/members · messages · notices · {id} 상세 · 코스로 대체하고,
  // 텍스트 전송은 POST {id}/messages 로 보낸다. 비참여자는 403 이라 아래 목데이터가 그대로 남는다.
  const liveMode = window.MoyeoApi?.live();
  const roomId = liveMode ? window.MoyeoApi.selectedRoomId() : null;
  const [room, setRoom] = React.useState(null);
  const [memberList, setMemberList] = React.useState(null);
  const [notices, setNotices] = React.useState(null);
  const [messages, setMessages] = React.useState(null);
  const [course, setCourse] = React.useState(null);
  React.useEffect(() => {
    if (!liveMode || !roomId) return undefined;
    let active = true;
    window.MoyeoApi.roomDetail(roomId)
      .then((result) => { if (active && result?.roomId != null) setRoom(result); })
      .catch(() => { /* 실패 시 목데이터 유지 */ });
    window.MoyeoApi.roomMembers(roomId)
      .then((result) => { if (active && Array.isArray(result?.members)) setMemberList(result); })
      .catch(() => { /* 403(미참여) 이면 목데이터 유지 */ });
    window.MoyeoApi.roomMessages(roomId, { limit: 50 })
      .then((result) => { if (active && Array.isArray(result?.messages)) setMessages(result.messages); })
      .catch(() => { /* 403(미참여) 이면 목데이터 유지 */ });
    window.MoyeoApi.roomNotices(roomId)
      .then((result) => { if (active && Array.isArray(result?.pinnedNotices)) setNotices(result); })
      .catch(() => { /* 403(미참여) 이면 목데이터 유지 */ });
    window.MoyeoApi.roomCourse(roomId)
      .then((result) => { if (active && result?.course) setCourse(result.course); })
      .catch(() => { /* 코스가 없으면 코스 줄을 숨긴다 */ });
    return () => { active = false; };
  }, [liveMode, roomId]);
  const serverMode = Boolean(room && memberList && messages);
  // TAB-STATE-CANON R6: 내 신원은 액세스 토큰에서 즉시 읽는다.
  // 예전에는 멤버 목록 응답의 me 플래그로 판정해서, 그 응답이 오기 전까지
  // 내가 보낸 메시지가 전부 남의 것처럼 왼쪽에 그려졌다가 오른쪽으로 튀었다.
  // 멤버 목록은 닉네임·프로필 이미지처럼 그 목록에만 있는 값에만 계속 쓴다.
  const [sending, setSending] = React.useState(false);
  const [sendError, setSendError] = React.useState('');
  const sendServerMessage = async () => {
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setSendError('');
    try {
      const created = await window.MoyeoApi.sendRoomMessage(roomId, content);
      setDraft('');
      // 응답이 생성된 메시지를 그대로 돌려주므로 목록 끝에 붙인다.
      if (created?.messageId != null) setMessages((current) => [...(current || []), created]);
      else setMessages((await window.MoyeoApi.roomMessages(roomId, { limit: 50 }))?.messages || []);
    } catch (error) {
      setSendError(error?.message || '메시지를 보내지 못했어요.');
    }
    setSending(false);
  };
  // 투표 참여·취소 — PUT poll-options/{optionId}/vote · DELETE vote.
  // 두 응답 모두 갱신된 투표 카드를 그대로 주므로 그 메시지만 교체한다.
  const [votingMessageId, setVotingMessageId] = React.useState(null);
  const replaceMessage = (updated) => setMessages((current) => (current || []).map(
    (message) => (message.messageId === updated.messageId ? updated : message),
  ));
  const voteOnPoll = async (message, option) => {
    if (votingMessageId != null) return;
    setVotingMessageId(message.messageId);
    try {
      // 이미 고른 선택지를 다시 누르면 취소다 (기획 20 투표 카드의 유일한 취소 경로).
      const updated = option.votedByMe
        ? await window.MoyeoApi.cancelPollVote(roomId, message.messageId)
        : await window.MoyeoApi.votePollOption(roomId, message.messageId, option.optionId);
      if (updated?.messageId != null) replaceMessage(updated);
    } catch (_) { /* 실패 시 카드를 그대로 둔다 */ }
    setVotingMessageId(null);
  };
  const ServerBubble = ({ message }) => {
    const me = window.MoyeoApi.sentByMe(message);
    const sender = memberList?.members?.find((member) => member.userId === message.senderId);
    const time = window.MoyeoApi.formatClock(message.createdAt);
    // 카드형 메시지는 일반 버블보다 넓고 흰 표면을 쓴다 — 내 카드도 초록 말풍선에 넣으면 카드가 안 읽힌다.
    const card = isSpecialMessageCard(message);
    return (
      <div style={{ display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end', marginBottom: 14 }}>
        {!me && <ProfileAvatar src={sender?.profileImageUrl} size={30}/>}
        <div style={card ? { minWidth: 0, flex: '0 1 268px' } : undefined}>
          {!me && <div style={{ fontSize: 10, color: T.text500, margin: '0 0 4px 2px' }}>{message.senderNickname}</div>}
          <div style={{ display: 'flex', flexDirection: me ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ maxWidth: card ? 268 : 244, flex: card ? 1 : undefined, minWidth: 0, background: (me && !card) ? 'var(--moyeo-chat-mine)' : RF.card, border: (me && !card) ? 'none' : `1px solid ${RF.softLine}`, borderRadius: card ? 14 : (me ? '16px 16px 4px 16px' : '16px 16px 16px 4px'), padding: card ? 13 : '10px 13px', fontSize: 13, lineHeight: '19px', color: T.text900, whiteSpace: card ? 'normal' : 'pre-line' }}>
              <SpecialMessageCard message={message} voting={votingMessageId === message.messageId} onVote={voteOnPoll}/>
            </div>
            {time && <div style={{ fontSize: 10, color: T.text400, flexShrink: 0 }}>{time}</div>}
          </div>
        </div>
      </div>
    );
  };

  if (serverMode) {
    // 20-2 공지 이력과 같은 규칙: 고정은 최대 1개다(R5-1). 서버에 2건 남은 방이 있어
    // 날것을 그대로 세면 `고정 2` 처럼 규칙과 모순되게 읽힌다 — 표시상 1로 묶는다.
    const rawPinned = notices?.pinnedNotices?.length || 0;
    const pinnedCount = Math.min(rawPinned, 1);
    const noticeCount = rawPinned + (notices?.unpinnedNotices?.length || 0);
    const latestPinned = notices?.pinnedNotices?.[0] || room.latestPinnedNotice || null;
    const conditions = [
      room.participationFee != null ? (Number(room.participationFee) > 0 ? `1인 ${Number(room.participationFee).toLocaleString()}원` : '참가비 없음') : null,
      room.minimumAge != null && room.maximumAge != null ? `${room.minimumAge}~${room.maximumAge}세` : null,
      { NONE: '성별 무관', MALE_ONLY: '남성만', FEMALE_ONLY: '여성만' }[room.genderRestriction] || null,
    ].filter(Boolean);
    const dayTripTime = room.tripType === 'DAY_TRIP' && room.dayTripStartTime
      ? `${window.MoyeoApi.formatTime(room.dayTripStartTime)}-${window.MoyeoApi.formatTime(room.dayTripEndTime)}`
      : '';
    return (
      <div data-testid="chat-room-live" style={{ height: '100%', background: RF.bg, paddingTop: 46, display: 'flex', flexDirection: 'column' }}>
        <Header title={room.title} left center onBack={nav.back} right={<IconButton name="more" onClick={() => nav.go('chat-menu')}/>}/>
        <div style={{ flexShrink: 0, textAlign: 'center', fontSize: 12, color: T.text500, lineHeight: '18px', paddingBottom: 10, borderBottom: `1px solid ${RF.softLine}`, fontVariantNumeric: 'tabular-nums' }}>
          {memberList.participantCount}/{memberList.maxParticipants}명 · {window.MoyeoApi.formatDate(room.startDate)}
          {dayTripTime ? ` ${dayTripTime}` : ''} · {window.MoyeoApi.tripTypeLabel(room)}
          {room.recruitmentDDay != null && <> · <b style={{ color: T.accent500 }}>마감 D-{room.recruitmentDDay}</b></>}
        </div>
        {conditions.length > 0 && (
          <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', gap: 6, padding: '7px 12px', borderBottom: `1px solid ${RF.softLine}`, background: RF.card }}>
            {conditions.map((condition) => <Chip key={condition} variant="neutral">{condition}</Chip>)}
          </div>
        )}
        {noticeCount > 0 && (
          <button type="button" data-testid="chat-notice-history" onClick={() => nav.go('notice-history')} style={{ flexShrink: 0, width: '100%', border: 'none', borderBottom: `1px solid ${T.primary100}`, cursor: 'pointer', background: T.primary50, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, fontFamily: T.fontStack, textAlign: 'left' }}>
            <Icon name="note" size={15} color={T.primary700}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: T.primary700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{latestPinned?.content || '공지 이력 보기'}</div>
              <div style={{ fontSize: 10.5, color: T.primary600, marginTop: 2 }}>공지 {noticeCount}개 · 고정 {pinnedCount} · 이력 보기</div>
            </div>
            <Icon name="arrow" size={14} color={T.primary600}/>
          </button>
        )}
        {course && (
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 9, padding: '9px 16px', borderBottom: `1px solid ${RF.softLine}`, background: RF.card }}>
            <Icon name="map" size={15} color={T.text500}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <b style={{ display: 'block', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</b>
              <span style={{ display: 'block', marginTop: 2, fontSize: 10.5, color: T.text500 }}>방문지 {course.places?.length || 0}곳 · {course.type === 'CUSTOM' ? '호스트 직접 코스' : '등록된 코스'}</span>
            </div>
            <button type="button" data-testid="chat-course-edit" onClick={() => nav.go('course-edit')} style={{ border: `1px solid ${T.primary200}`, background: T.primary50, color: T.primary700, borderRadius: 999, height: 26, padding: '0 10px', fontSize: 11, fontWeight: 800, fontFamily: T.fontStack, cursor: 'pointer' }}>경로 보기</button>
          </div>
        )}
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '18px 18px 12px', background: RF.bg }}>
          {messages.length === 0 && (
            <div style={{ padding: '48px 0', textAlign: 'center', fontSize: 13, color: T.text500 }}>아직 대화가 없어요.</div>
          )}
          {messages.map((message) => (message.type === 'SYSTEM'
            ? <SystemMessageNote key={message.messageId} message={message}/>
            : <ServerBubble key={message.messageId} message={message}/>))}
        </div>
        <div style={{ flexShrink: 0, padding: '10px 14px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}` }}>
          {sendError && <div role="alert" style={{ fontSize: 11.5, color: T.danger, marginBottom: 7 }}>{sendError}</div>}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* 첨부 진입 — 20-2 시트가 사진·장소·지도 공유를 실제로 보낸다 */}
            <button type="button" data-testid="chat-attach" onClick={() => nav.go('chat-attach')} style={{ width: 38, height: 38, borderRadius: 999, border: `1px solid ${RF.softLine}`, background: RF.card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }} aria-label="첨부">
              <Icon name="plus" size={18} color={T.text700}/>
            </button>
            <Composer value={draft} onChange={setDraft} onSend={sendServerMessage} placeholder={sending ? '보내는 중...' : '메시지 입력'} testId="chat-composer"/>
          </div>
        </div>
      </div>
    );
  }
  // 서버 채팅방을 못 받으면 예시 대화·공지·경로를 그리지 않는다.
  return (
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="" left center onBack={nav.back}/>
        <div role="status" style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13, lineHeight: '21px' }}>
          {liveMode ? '참여 중인 모임이 없어요.' : '로그인하면 모집 중인 모임을 볼 수 있어요.'}
        </div>
      </div>
  );
}

// 서버 프로필 이미지가 있으면 사진, 없으면 닉네임의 동물을 따른다.
// 화면마다 kind 를 고정하면(예전 kind="bear") "따스한 사슴" 계정에 곰이 뜬다 —
// 닉네임 → 동물 표는 MoyeoApi.avatarForNickname 하나만 쓴다.
function ProfileAvatar({ src, nickname, size = 34 }) {
  const avatar = window.MoyeoApi?.avatarForNickname?.(nickname);
  // 이미지가 없을 때(또는 정말 못 불러왔을 때) 그리는 닉네임 아바타.
  const nicknameAvatar = (() => {
    if (avatar?.kind) return <AnimalAvatar kind={avatar.kind} size={size} bg={T.primary50}/>;
    if (avatar?.emoji) {
      return <span aria-hidden="true" style={{ width: size, height: size, borderRadius: 999, background: T.primary50, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: Math.round(size * 0.56), lineHeight: 1 }}>{avatar.emoji}</span>;
    }
    return <span style={{ width: size, height: size, borderRadius: 999, background: T.primary50, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="user" size={Math.round(size * 0.5)} color={T.primary600}/></span>;
  })();
  // **이미지가 있으면 반드시 이미지다.** 다른 화면과 같은 CachedImage 로 그리고,
  // 닉네임 아바타는 URL 이 없거나 이미지가 정말 실패했을 때만 나온다
  // (CachedImage 는 <img src> 를 먼저 그려서 아바타가 번쩍이지 않는다).
  if (!src) return nicknameAvatar;
  return <CachedImage src={src} alt="" fallback={nicknameAvatar} style={{ width: size, height: size, borderRadius: 999, objectFit: 'cover', background: T.primary50, flexShrink: 0 }}/>;
}

function ScreenFeed() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, toggleLike: () => {}, isLiked: () => false };
  // 로그인 상태에서는 GET /api/v1/feeds 로 목록을 대체한다 (발견=DISCOVER, 팔로잉=FRIENDS)
  const liveMode = window.MoyeoApi?.live();
  // 피드는 "보던 상태 유지" 탭이다 (TAB-STATE-CANON R3) — 고른 탭도, 목록도 그대로 남는다.
  const [feedTab, setFeedTab] = window.useTabState('feed.tab', 'DISCOVER');
  const listScroll = window.useTabScroll(`feed.list:${feedTab}`);
  const feedsData = window.useTabData(
    `feed.list:${feedTab}`,
    () => window.MoyeoApi.feeds({ tab: feedTab }).then((result) => result?.feeds),
    { enabled: liveMode, mode: 'keep', accept: Array.isArray },
  );
  const serverFeeds = feedsData.value || null;
  const openFeed = (feedId) => {
    window.MoyeoApi.selectFeed(feedId);
    nav.go('feed-detail');
  };
  // 32 신고 시트는 대상 피드를 알아야 한다 — 상세로 갈 때와 같은 방식으로 먼저 고른다.
  const openFeedReport = (feedId) => {
    window.MoyeoApi.selectFeed(feedId);
    nav.go('report');
  };
  const likeServerFeed = async (event, feedId) => {
    event.stopPropagation();
    try {
      const result = await window.MoyeoApi.likeFeed(feedId);
      // R4: 이 화면이 바꾼 항목만 보관소에서 갈아끼운다 — 목록 전체를 다시 부르지 않는다.
      feedsData.replace((feeds) => (feeds || []).map((feed) => (
        feed.feedId === feedId ? { ...feed, liked: Boolean(result?.liked), likeCount: result?.likeCount ?? feed.likeCount } : feed
      )));
    } catch (_) { /* 실패는 조용히 무시 */ }
  };
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${RF.softLine}`, gap: 42 }}>
          {[['FRIENDS', '팔로잉'], ['DISCOVER', '발견']].map(([id, t]) => {
            const on = feedTab === id;
            return (
              <button key={t} onClick={() => setFeedTab(id)} style={{ border: 'none', background: 'transparent', height: 52, color: on ? T.text900 : T.text500, fontSize: 14, fontWeight: 900, fontFamily: T.fontStack, borderBottom: on ? `2px solid ${T.primary500}` : '2px solid transparent', cursor: 'pointer' }}>{t}</button>
            );
          })}
        </div>
        <div ref={listScroll.ref} onScroll={listScroll.onScroll} style={{ height: 'calc(100% - 134px)', overflow: 'auto', padding: '14px 16px 96px', background: RF.card }}>
          {/* 목 피드 카드는 없다 — 서버 목록이 비면 비었다고 말한다. */}
          {serverFeeds && serverFeeds.length === 0 && (
            <div style={{ padding: '64px 20px', textAlign: 'center', color: T.text500, fontSize: 13, lineHeight: '20px' }}>아직 올라온 피드가 없어요.</div>
          )}
          <TabDataNotice status={feedsData.status} signedOut={!liveMode} onRetry={feedsData.reload} style={{ padding: '64px 20px', textAlign: 'center', fontSize: 13, lineHeight: '20px' }}/>
          {serverFeeds && serverFeeds.map((feed) => (
            <div key={feed.feedId} onClick={() => openFeed(feed.feedId)} style={{ borderBottom: `1px solid ${RF.softLine}`, paddingBottom: 18, marginBottom: 18, cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                {/* 작성자를 누르면 프로필 카드(25). 카드 전체는 피드 상세로 가므로 전파를 막는다 */}
                <div
                  onClick={(e) => { e.stopPropagation(); if (feed.author?.userId) nav.go('public-profile', { params: { userId: feed.author.userId } }); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, cursor: 'pointer' }}>
                  <ProfileAvatar src={feed.author?.profileImageUrl} nickname={feed.author?.nickname} size={34}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 900 }}>{feed.author?.nickname}</div>
                    <div style={{ fontSize: 10, color: T.text500, marginTop: 2 }}>{window.MoyeoApi.formatRelative(feed.createdAt)}</div>
                  </div>
                </div>
                {/* 32 피드 신고 시트 진입점 — 웹에는 아예 없었다(기획 28·iOS 에는 있다).
                    **자기 피드에는 두지 않는다** — 서버가 400 `40039` 로 거절한다.
                    카드 전체는 피드 상세로 가므로 전파를 막는다. */}
                {feed.author?.userId != null
                  && String(feed.author.userId) !== String(window.MoyeoApi?.myUserId?.() ?? '') && (
                  <button
                    type="button"
                    aria-label="더보기"
                    data-testid={`feed-post-${feed.feedId}-more`}
                    onClick={(e) => { e.stopPropagation(); openFeedReport(feed.feedId); }}
                    style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'inline-flex' }}
                  >
                    <Icon name="more" size={18} color={T.text500}/>
                  </button>
                )}
              </div>
              {feed.trip?.courseTitle && <div style={{ fontSize: 15, fontWeight: 900, marginTop: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{feed.trip.courseTitle}</div>}
              {feed.content && <div style={{ fontSize: 12, color: T.text700, marginTop: 5, lineHeight: '18px' }}>{feed.content}</div>}
              {feed.images?.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: feed.images.length > 1 ? '1fr 1fr' : '1fr', gap: 2, marginTop: 12, borderRadius: 10, overflow: 'hidden' }}>
                  {feed.images.slice(0, 2).map((image) => (
                    <img key={image.imageId} src={image.imageUrl} alt="" loading="lazy" style={{ display: 'block', width: '100%', height: 166, objectFit: 'cover', background: T.primary50 }}/>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, fontSize: 12, color: T.text700 }}>
                <button onClick={(event) => likeServerFeed(event, feed.feedId)} aria-label="좋아요" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: 'none', background: 'transparent', padding: 0, fontSize: 12, color: feed.liked ? T.accent500 : T.text700, fontFamily: T.fontStack, cursor: 'pointer' }}>
                  <Icon name="heart" size={17} color={feed.liked ? T.accent500 : T.text700}/>{feed.likeCount}
                </button>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="chat" size={17} color={T.text700}/>{feed.commentCount}</span>
              </div>
            </div>
          ))}
        </div>
        <BottomNav active="feed"/>
      </div>
    </Phone>
  );
}

// 23 첫 화면에 보여줄 최상위 댓글 수. 세 플랫폼이 같은 3건이다 (PDF-REVIEW-2026-08-31 §F3).
const FEED_DETAIL_COMMENT_PREVIEW = 3;

/**
 * 23 피드 상세의 사진 영역 (기획 `FeedDetailPhotos` 정본과 같은 규칙).
 *
 * 예전에는 `slice(0, 2)` 로 앞 2장만 그리고 배지에 고정 `1/{총개수}` 를 얹었다 —
 * 사진이 4장이면 2장은 볼 방법이 없는데 배지는 페이저가 있는 것처럼 말했다.
 *
 * 1. 전체를 좌우로 넘긴다 (스크롤 스냅).
 * 2. 배지는 **지금 위치**를 가리킨다.
 * 3. 누르면 전체화면으로 크게 본다.
 */
function FeedDetailPhotoPager({ images, height = 198 }) {
  const [index, setIndex] = React.useState(0);
  const [zoomed, setZoomed] = React.useState(null);
  const trackRef = React.useRef(null);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  if (!images || images.length === 0) return null;
  const zoomedImage = zoomed == null ? null : images[zoomed];
  return (
    <div data-testid="feed-detail-photos" style={{ position: 'relative', marginTop: 14, borderRadius: 10, overflow: 'hidden' }}>
      <div
        ref={trackRef}
        onScroll={onScroll}
        style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {images.map((image, i) => (
          <div
            key={image.imageId ?? i}
            onClick={() => setZoomed(i)}
            style={{ flex: '0 0 100%', scrollSnapAlign: 'start', cursor: 'zoom-in' }}
          >
            <img
              src={image.imageUrl}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              style={{ display: 'block', width: '100%', height, objectFit: 'cover', background: T.primary50 }}
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <span data-testid="feed-detail-photo-count" style={{ position: 'absolute', right: 8, top: 8, background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: 999, padding: '4px 7px', fontSize: 10, fontWeight: 900 }}>
          {index + 1}/{images.length}
        </span>
      )}
      {zoomedImage && (
        <div
          role="dialog"
          aria-label="사진 크게 보기"
          data-testid="feed-detail-photo-viewer"
          onClick={() => setZoomed(null)}
          style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', zIndex: 60 }}
        >
          <img src={zoomedImage.imageUrl} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}/>
          <button
            type="button"
            aria-label="닫기"
            onClick={(e) => { e.stopPropagation(); setZoomed(null); }}
            style={{ position: 'absolute', right: 12, top: 12, width: 36, height: 36, borderRadius: 999, border: 'none', background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 15, fontWeight: 900, cursor: 'pointer' }}
          >
            ✕
          </button>
          {images.length > 1 && (
            <span style={{ position: 'absolute', bottom: 24, color: '#fff', fontSize: 13, fontWeight: 900 }}>{zoomed + 1}/{images.length}</span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 23 본문 — 30-2 신고 시트가 "이 화면 위에 떠 있다"고 읽히도록 배경으로도 쓴다.
 * 시트가 채팅방 신고이던 시절엔 채팅방을 깔았다 (정본 REPORT-CANON).
 * `feed` 를 못 받았으면 시트는 배경 없이 딤만 둔다 — 엉뚱한 화면을 깔지 않는다.
 */
function FeedDetailBody({ feed, nav, visibilityLabel, composer = null,
                          onToggleLike = null, commentPreview = null }) {
  return (
          <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
            {/* 32 신고 진입점은 **헤더의 `...` 하나다** — 기획·iOS·안드로이드가 모두 그렇다
                (안드 `feed-detail-report` = `MoreHoriz`, iOS `feed.detail.more`).
                웹만 작성자 줄의 깃발을 쓰고 있어 표면이 갈렸다. 헤더로 맞추고 깃발은 뺀다.
                **자기 피드에는 두지 않는다** — 서버가 400 `40039` 로 거절한다. */}
            <Header
              title=""
              left
              onBack={nav.back}
              right={feed?.author?.userId != null
                && String(feed.author.userId) !== String(window.MoyeoApi?.myUserId?.() ?? '')
                ? <IconButton name="more" ariaLabel="신고" testId="feed-detail-report" onClick={() => nav.go && nav.go('report')}/>
                : undefined}
            />
            <div style={{ height: 'calc(100% - 98px)', overflow: 'auto', padding: '0 18px 84px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div
                  onClick={() => { if (feed.author?.userId) nav.go('public-profile', { params: { userId: feed.author.userId } }); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, cursor: 'pointer' }}>
                  <ProfileAvatar src={feed.author?.profileImageUrl} size={34}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 900 }}>{feed.author?.nickname}</div>
                    <div style={{ fontSize: 10, color: T.text500, marginTop: 2 }}>{window.MoyeoApi.formatRelative(feed.createdAt)}</div>
                  </div>
                </div>
                {visibilityLabel && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 24, padding: '0 9px', borderRadius: 999, background: T.bgSubtle, border: `1px solid ${RF.softLine}`, color: T.text500, fontSize: 10.5, fontWeight: 800 }}>
                    <Icon name="users" size={12} color={T.text500}/> {visibilityLabel}
                  </span>
                )}
                {/* 신고는 헤더의 `...` 하나로 모았다 — 여기 깃발까지 두면 같은 화면에 둘이 된다. */}
              </div>
              {feed.trip?.courseTitle && <div style={{ fontSize: 15, fontWeight: 900, marginTop: 14 }}>{feed.trip.courseTitle}</div>}
              {feed.trip?.startDate && <div style={{ fontSize: 12, color: T.text500, marginTop: 5 }}>{window.MoyeoApi.formatDate(feed.trip.startDate)}{feed.trip.endDate ? ` - ${window.MoyeoApi.formatDate(feed.trip.endDate)}` : ''}</div>}
              <FeedDetailPhotoPager images={feed.images} height={198}/>
              {feed.content && <div style={{ fontSize: 13, lineHeight: '21px', marginTop: 14 }}>{feed.content}</div>}
              {feed.trip?.places?.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 16 }}>
                  <div style={{ borderRadius: 10, background: RF.subtle, padding: '12px 6px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: T.text500 }}>방문지</div>
                    <div style={{ fontSize: 13, fontWeight: 900, marginTop: 5 }}>{feed.trip.places.length}곳</div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 18, marginTop: 18, paddingBottom: 14, borderBottom: `1px solid ${RF.softLine}`, fontSize: 13, color: T.text700 }}>
                <span onClick={onToggleLike} style={{ cursor: 'pointer', color: feed.liked ? T.accent500 : T.text700 }}>좋아요 {feed.likeCount}개</span>
                <span data-testid="feed-comments-open" onClick={() => nav.go && nav.go('feed-comments')} style={{ cursor: 'pointer', fontWeight: 800, color: T.primary600 }}>댓글 {feed.commentCount}개 모두 보기 →</span>
              </div>
              {/* 댓글 일부(3건). 나머지는 위의 `댓글 N개 모두 보기 →` 로 23-1 에서 무한 스크롤로 본다. */}
              {commentPreview && commentPreview.length > 0 && (
                <div data-testid="feed-detail-comment-preview">
                  {commentPreview.map((item) => (
                    <div key={item.commentId} style={{ borderBottom: `1px solid ${RF.softLine}` }}>
                      <FeedCommentRow item={item}/>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* 입력창은 화면이 넘겨준다. 배경으로 깔릴 때는 없다 — 댓글 상태는 화면 것이다. */}
            {composer}
          </div>
  );
}

function ScreenFeedDetail() {
  const nav = window.useNav ? window.useNav() : { back: () => {} };
  // 댓글 입력이 비어 있으면 전송은 비활성이다.
  const [comment, setComment] = React.useState('');
  // 로그인 상태 + 피드 목록에서 선택해 들어온 경우 GET feeds/{id} 로 대체한다.
  const liveMode = window.MoyeoApi?.live();
  const feedId = liveMode ? window.MoyeoApi.selectedFeedId() : null;
  const [feed, setFeed] = React.useState(null);
  React.useEffect(() => {
    if (!liveMode || !feedId) return undefined;
    let active = true;
    window.MoyeoApi.feedDetail(feedId)
      .then((result) => { if (active && result?.feedId != null) setFeed(result); })
      .catch(() => {});
    return () => { active = false; };
  }, [liveMode, feedId]);
  // 23 은 댓글 **일부만** 보여주고 나머지는 23-1 로 넘긴다 (PDF-REVIEW-2026-08-31 §F1·F3 ·
  // 안드로이드가 정본). 첫 화면 3건은 서버 커서로 잘라 받는다 — 전부 받아 화면에서만 자르지 않는다.
  // 대댓글은 첫 화면에서 접는다(§F3) — replies 는 23-1 에서 펼친다.
  const [commentPreview, setCommentPreview] = React.useState(null);
  const loadCommentPreview = React.useCallback(() => {
    if (!liveMode || !feedId) return;
    window.MoyeoApi.feedComments(feedId, { limit: FEED_DETAIL_COMMENT_PREVIEW })
      .then((result) => { if (Array.isArray(result?.comments)) setCommentPreview(result.comments); })
      .catch(() => { /* 댓글을 못 받으면 예시 댓글을 그리지 않는다 */ });
  }, [liveMode, feedId]);
  React.useEffect(() => { loadCommentPreview(); }, [loadCommentPreview]);
  const sendComment = async () => {
    if (!comment.trim()) return;
    if (!liveMode || !feed) { setComment(''); return; }
    try {
      await window.MoyeoApi.addFeedComment(feed.feedId, comment.trim());
      setComment('');
      setFeed((current) => (current ? { ...current, commentCount: (current.commentCount || 0) + 1 } : current));
      // 새 댓글은 ID 가 가장 커서 첫 묶음 맨 위에 온다 — 첫 묶음을 다시 받아 방금 쓴 댓글을 보여준다.
      loadCommentPreview();
    } catch (_) { /* 실패 시 입력 유지 */ }
  };
  const toggleServerLike = async () => {
    if (!feed) return;
    try {
      const result = await window.MoyeoApi.likeFeed(feed.feedId);
      setFeed((current) => (current ? { ...current, liked: Boolean(result?.liked), likeCount: result?.likeCount ?? current.likeCount } : current));
    } catch (_) { /* 실패는 조용히 무시 */ }
  };

  if (feed) {
    const visibilityLabel = { FRIENDS: '친구만', PUBLIC: '전체 공개', PRIVATE: '나만 보기' }[feed.visibility] || feed.visibility;
    return (
      <Phone>
        <FeedDetailBody
          feed={feed}
          nav={nav}
          visibilityLabel={visibilityLabel}
          onToggleLike={toggleServerLike}
          commentPreview={commentPreview}
          composer={(
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 16px 28px', borderTop: `1px solid ${RF.softLine}`, background: RF.card, display: 'flex', gap: 8 }}>
              <Composer value={comment} onChange={setComment} onSend={sendComment} placeholder="댓글을 입력하세요..." fontSize={12} inputLabel="댓글 입력" testId="feed-detail-composer"/>
            </div>
          )}
        />
      </Phone>
    );
  }
  // 피드를 못 받으면 예시 글·사진·통계를 그리지 않는다.
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="" left center onBack={nav.back}/>
        <div role="status" style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13, lineHeight: '21px' }}>
          {liveMode ? '아직 올라온 피드가 없어요.' : '로그인하면 모집 중인 모임을 볼 수 있어요.'}
        </div>
      </div>
    </Phone>
  );
}

function ScreenMyPage() {
  const nav = window.useNav ? window.useNav() : { go: () => {} };
  // 로그인 상태: GET users/me/profile + chat-rooms/my + travel-dex 로 화면을 채운다.
  // 찜은 **코스와 모집 두 가지**다. 모집은 26-1 찜한 모집(GET chat-rooms/my/favorites)으로 열고,
  // 코스는 GET travel-courses/me/favorites 가 있다 — 예전 주석의 "조회 API 가 없다"는 틀린 말이었다
  // (NO-MOCK-CANON §4-1 · 실서버 200 확인).
  const liveMode = window.MoyeoApi?.live();
  // 마이도 홈과 같이 "가진 것을 보여주며 뒤에서 갱신" 이다 (TAB-STATE-CANON R3).
  // 프로필 이미지·썸네일이 캐시에서 즉시 그려지므로 재진입 때 기본 이미지로 깜빡이지 않는다 (R5).
  const revalidate = { enabled: liveMode, mode: 'revalidate' };
  const profileData = window.useTabData('my.profile', () => window.MoyeoApi.myProfile(), {
    ...revalidate, accept: (result) => Boolean(result?.nickname),
  });
  const roomsData = window.useTabData('my.rooms', () => window.MoyeoApi.myRooms(), {
    ...revalidate, accept: Array.isArray,
  });
  const dexData = window.useTabData('my.travel-dex', () => window.MoyeoApi.travelDex(), {
    ...revalidate, accept: (result) => typeof result?.totalCount === 'number',
  });
  const profile = profileData.value || null;
  const serverRooms = roomsData.value || null;
  const dexCount = dexData.value?.totalCount ?? null;
  // 여행 횟수·매너 점수·피드 수는 **공개 프로필**이 준다
  // (`GET /users/{userId}/profile` → `completedTripCount` · `mannerRating` · `feedCount`).
  // `GET /users/me/profile` 에는 이 셋이 없어서 예전에는 「서버에 없다」고 적고 줄을 숨겼는데,
  // 그 응답에 `userId` 가 생겨 내 공개 프로필을 부를 수 있다 — 앱 둘은 이미 이 줄을 그린다
  // (2026-09-09 실서버: `{"mannerRating":4.6,"completedTripCount":8,"feedCount":2}`).
  const myUserId = profile?.userId ?? null;
  const statsData = window.useTabData(
    myUserId ? `my.public-profile.${myUserId}` : 'my.public-profile',
    () => (myUserId ? window.MoyeoApi.publicProfile(myUserId) : Promise.resolve(null)),
    { ...revalidate, enabled: Boolean(liveMode && myUserId), accept: (result) => Boolean(result?.userId) },
  );
  const stats = statsData.value || null;
  // 서버가 주지 않은 값은 **그 칸을 만들지 않는다** — 0 으로 채우면 없는 실적을 있는 것처럼 보인다.
  const statCells = [
    stats?.completedTripCount != null && { label: '여행', value: `${stats.completedTripCount}` },
    stats?.mannerRating != null && { label: '매너', value: stats.mannerRating.toFixed(1) },
    stats?.feedCount != null && { label: '피드', value: `${stats.feedCount}` },
  ].filter(Boolean);
  // 세그먼트는 "내 여행"의 진행중·지난여행이다. 찜은 여행이 아니라 별도 목록이라
  // 여기 섞지 않고 아래 메뉴의 26-1 찜한 모집으로 뺐다.
  const mySegments = ['진행중', '지난여행'];
  const initialSegment = (() => {
    const requested = new URLSearchParams(window.location.search).get('myTab');
    return mySegments.includes(requested) ? requested : '진행중';
  })();
  const [selectedSegment, setSelectedSegment] = window.useTabState('my.segment', initialSegment);
  const listScroll = window.useTabScroll('my.scroll');
  const cardStyle = {
    borderRadius: 12,
    border: `1px solid ${RF.softLine}`,
    background: RF.card,
    padding: 12,
    display: 'flex',
    gap: 14,
    marginBottom: 14,
    cursor: 'pointer',
  };
  // 로그인 상태에서는 서버 내 채팅방 목록으로 대체 (진행중=!ended, 지난여행=ended)
  const serverVisible = serverRooms
    ? serverRooms.filter((room) => (selectedSegment === '진행중' ? !room.ended : room.ended))
    : null;
  // 채팅이 열린 방이면 채팅방(20)으로, 아직 아니면 모집 상세(15)로 보낸다.
  const openServerRoom = (room) => {
    window.MoyeoApi.selectRoom(room.roomId);
    nav.go(room.chatAvailable ? 'chat' : 'detail');
  };
  const ServerTrip = ({ room }) => (
    <div onClick={() => openServerRoom(room)} style={{ ...cardStyle, minHeight: 108 }}>
      <div style={{ width: 96, height: 86, borderRadius: 9, overflow: 'hidden', flexShrink: 0 }}>
        <RoomThumb src={room.thumbnail} height={86}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 15, fontWeight: 900, lineHeight: '20px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{room.title}</div>
          {room.recruitmentDDay != null && <Chip variant="danger">D-{room.recruitmentDDay}</Chip>}
          {room.ended && <Chip variant="neutral">종료</Chip>}
        </div>
        <div style={{ fontSize: 12.5, color: T.text500, marginTop: 5, fontWeight: 700 }}>
          {window.MoyeoApi.formatDate(room.startDate)}{room.endDate ? ` - ${window.MoyeoApi.formatDate(room.endDate)}` : ''}
        </div>
        {room.description && <div style={{ fontSize: 11.5, color: T.text500, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{room.description}</div>}
        {room.participantCount != null && room.maxParticipants != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 9 }}>
            <div style={{ flex: 1 }}><ProgressBar current={room.participantCount} max={room.maxParticipants}/></div>
            <span style={{ fontSize: 12.5, color: T.text700, fontWeight: 900 }}>{room.participantCount}/{room.maxParticipants}명</span>
          </div>
        )}
      </div>
    </div>
  );
  // 네 표면이 **같은 다섯 줄·같은 순서**를 쓴다 (26, 사용자 지적 2026-09-09).
  // 「찜한 모집」은 위 「내 여행」 탭에 이미 있어서 메뉴에서 뺐다 — 한 화면에 두 번 두지 않는다.
  const menuRows = [
    { icon: 'feed', title: '내 피드', subtitle: '내가 기록한 경북 여행', route: 'feed' },
    { icon: 'users', title: '친구 도감', subtitle: `${dexCount ?? 0}마리 · 최근 동행 순`, route: 'dex' },
    // 25 가 프로필 카드로 바뀌면서 그 안에 있던 관리 진입점을 여기로 옮겼다.
    // 옮기지 않으면 28 프로필 수정·27-2 친구 관리가 어디서도 열리지 않는다.
    { icon: 'feed', title: '내 정보 수정', subtitle: '프로필과 여행 취향을 관리해요', route: 'profile-edit' },
    { icon: 'users', title: '친구 관리', subtitle: '친구 신청과 수락을 관리해요', route: 'friends' },
    // 웹에는 고객센터 화면이 없고 문의 창구는 29 설정 안에 있다 — 거기로 보낸다.
    // 신고 내역 화면은 없다(정본 REPORT-CANON §1).
    { icon: 'chat', title: '고객센터', subtitle: 'GitHub 이슈 · 이메일로 문의해요', route: 'settings' },
  ];
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="마이" right={<IconButton name="settings" ariaLabel="설정" onClick={() => nav.go('settings')}/>}/>
        <div data-testid="my-scroll" ref={listScroll.ref} onScroll={listScroll.onScroll} style={{ height: 'calc(100% - 152px)', overflow: 'auto', padding: '8px 18px 128px' }}>
          <button
            type="button"
            data-testid="my-profile-summary"
            // 내 카드로 열지 못한다 — GET /users/me/profile 응답에 userId 가 없어
            // 공개 프로필 API 를 내 계정으로 호출할 수 없다. BE 에 userId·nicknameColor
            // 노출을 요청했고, 생기면 여기서 내 카드를 연다.
            onClick={() => nav.go('profile-edit')}
            style={{ width: '100%', minHeight: 94, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card, padding: 12, display: 'flex', alignItems: 'center', gap: 12, color: T.text900, textAlign: 'left', fontFamily: T.fontStack, cursor: 'pointer' }}
          >
            <ProfileAvatar src={profile?.profileImageUrl} nickname={profile?.nickname} size={58}/>
            <span style={{ flex: 1, minWidth: 0 }}>
              {/* 닉네임·소개는 서버 프로필에서만 온다 — 미로그인이면 예시 이름 대신 로그인 안내를,
                  로그인했는데 아직 못 받았으면 로딩 문구를 둔다 (TAB-STATE-CANON R2). */}
              {profile
                ? <span style={{ display: 'block', fontSize: 16, lineHeight: '21px', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.nickname}</span>
                : <span style={{ display: 'block', fontSize: 13, lineHeight: '19px', color: T.text500 }}>{liveMode ? '불러오는 중이에요…' : '로그인하면 모집 중인 모임을 볼 수 있어요.'}</span>}
              {profile?.introduction && (
                <span style={{ display: 'block', marginTop: 4, fontSize: 12.5, lineHeight: '18px', color: T.text500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.introduction}</span>
              )}
            </span>
            <Icon name="arrow" size={17} color={T.text400}/>
          </button>

          {/* 여행 · 매너 · 피드 — 기획·iOS·안드로이드와 같은 세 칸이다.
              서버가 주지 않은 칸은 그리지 않는다(값을 0 으로 지어내지 않는다). */}
          {statCells.length > 0 && (
            <div data-testid="my-profile-stats" style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {statCells.map((cell) => (
                <div
                  key={cell.label}
                  style={{
                    flex: 1, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card,
                    padding: '10px 0', textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 17, lineHeight: '22px', fontWeight: 900, color: T.primary600, fontVariantNumeric: 'tabular-nums' }}>{cell.value}</div>
                  <div style={{ fontSize: 11, lineHeight: '16px', color: T.text500, marginTop: 2 }}>{cell.label}</div>
                </div>
              ))}
            </div>
          )}


          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 10 }}>
            <div style={{ fontSize: 18, lineHeight: '24px', fontWeight: 900 }}>내 여행</div>
            <div style={{ fontSize: 12, color: T.primary600, fontWeight: 900 }}>{(serverVisible || []).length}개</div>
          </div>
          <div style={{ display: 'flex', gap: 6, padding: 4, borderRadius: 999, background: RF.subtle, marginBottom: 10 }}>
            {mySegments.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedSegment(t)}
                style={{ flex: 1, height: 36, borderRadius: 999, border: 'none', background: selectedSegment === t ? RF.card : 'transparent', color: selectedSegment === t ? T.primary600 : T.text500, boxShadow: selectedSegment === t ? RF.softShadow : 'none', fontSize: 13, fontWeight: 900, fontFamily: T.fontStack, cursor: 'pointer' }}
              >
                {t}
              </button>
            ))}
          </div>
          {/* 목 여행 카드는 없다 — 서버 목록이 비면 비었다고 말하고, 미로그인이면 로그인 안내를 둔다. */}
          {serverVisible && serverVisible.length === 0 && (
            <div style={{ padding: '36px 0', textAlign: 'center', color: T.text500, fontSize: 13 }}>참여 중인 모임이 없어요.</div>
          )}
          <TabDataNotice status={roomsData.status} signedOut={!liveMode} onRetry={roomsData.reload} style={{ padding: '36px 0', textAlign: 'center', fontSize: 13 }}/>
          {(serverVisible || []).map((room) => <ServerTrip key={room.roomId} room={room}/>)}
          <div style={{ marginTop: 20, fontSize: 18, lineHeight: '24px', fontWeight: 900 }}>메뉴</div>
          <div data-testid="my-hub-menu" style={{ marginTop: 10, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card, overflow: 'hidden' }}>
            {menuRows.map((item, index) => (
              <button
                type="button"
                key={item.title}
                onClick={() => item.route && nav.go(item.route)}
                style={{ width: '100%', minHeight: 62, padding: '0 14px', border: 0, borderBottom: index < menuRows.length - 1 ? `1px solid ${RF.softLine}` : 'none', background: 'transparent', color: T.text900, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', fontFamily: T.fontStack, cursor: item.route ? 'pointer' : 'default' }}
              >
                <span style={{ width: 34, height: 34, borderRadius: 999, background: T.primary50, display: 'grid', placeItems: 'center', color: T.primary600 }}><Icon name={item.icon} size={17} color="currentColor"/></span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 13.5, lineHeight: '18px', fontWeight: 900 }}>{item.title}</span>
                  <span style={{ display: 'block', marginTop: 2, fontSize: 11.5, lineHeight: '16px', color: T.text500 }}>{item.subtitle}</span>
                </span>
                <Icon name="arrow" size={16} color={T.text400}/>
              </button>
            ))}
          </div>
        </div>
        <BottomNav active="my"/>
      </div>
    </Phone>
  );
}

Object.assign(window, {
  RF,
  Phone,
  IconButton,
  Header,
  ExploreServerRoomCard,
  RoomThumb,
  TabDataNotice,
  Btn,
  Chip,
  ProgressBar,
  BottomNav,
  Photo,
  MemberStack,
  MascotFriend,
  MascotGroup,
  ScreenSplash,
  ScreenHome,
  ScreenExplore,
  ScreenExploreMap,
  ScreenCourseDetail,
  ScreenGroupDetail,
  ScreenApplySheet,
  ScreenCreateReview,
  ScreenChatRoom,
  ChatRoomBody,
  SpecialMessageCard,
  SystemMessageNote,
  isSpecialMessageCard,
  ScreenFeed,
  ScreenFeedDetail,
  ScreenMyPage,
});
