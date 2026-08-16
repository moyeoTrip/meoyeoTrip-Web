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
        .moyeo-web-phone [style*="top: 54px"],
        .moyeo-web-phone [style*="top: 60px"] {
          top: 18px !important;
        }
      `}</style>
      {children}
    </div>
  );
}

function IconButton({ name, onClick, dark = false, bg = 'transparent', color, size = 22, ariaLabel }) {
  return (
    <button type="button" aria-label={ariaLabel} onClick={onClick} style={{
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

function Chip({ children, variant = 'neutral', size = 'sm', style }) {
  const variants = {
    primary: { bg: T.primary500, fg: '#fff', bd: T.primary500 },
    soft: { bg: T.primary50, fg: T.primary700, bd: T.primary100 },
    neutral: { bg: RF.card, fg: T.text700, bd: T.line200 },
    accent: { bg: '#FFF1EA', fg: T.accent700, bd: '#FFE0D1' },
    danger: { bg: T.dangerBg, fg: T.dangerText, bd: T.dangerBg },
  };
  const v = variants[variant] || variants.neutral;
  return (
    <span style={{
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

function Photo({ hue = 'forest', height = 120, radius = 12, overlay = false, children }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: radius, height, background: T.primary50 }}>
      <ImgPlaceholder hue={hue} height={height} radius={0}/>
      {overlay && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0.48))' }}/>}
      {children}
    </div>
  );
}

function RouteMap({ height = 150, compact = false }) {
  return (
    <div style={{ height, borderRadius: 12, overflow: 'hidden', position: 'relative', background: RF.mapGreen }}>
      <MiniMap height={height} pins={compact ? [1,2,3] : [1,2,3,4]}/>
      <svg width="100%" height="100%" viewBox="0 0 320 200" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.22 }}>
        <path d="M0 150 Q80 120 160 150 T320 138" fill="none" stroke="#fff" strokeWidth="10"/>
      </svg>
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

function HeroIllustration({ weather = 'sunny' }) {
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
        fetchPriority="high"
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
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.place}</span>
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
          fetchPriority="high"
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

function ScreenHome() {
  const nav = window.useNav ? window.useNav() : { go: () => {} };
  const [homeWeather, setHomeWeather] = React.useState('sunny');
  const weatherItem = WEATHER_HERO_ITEMS[homeWeather] || WEATHER_HERO_ITEMS.sunny;
  const weatherTone = WEATHER_HERO_TONE[weatherItem.state] || WEATHER_HERO_TONE.good;
  const courses = [
    { title: '주왕산 & 주산지 힐링 트레킹', meta: '청송', people: '2/5명', hue: 'forest' },
    { title: '안동 하회마을 하루 코스', meta: '안동', people: '3/6명', hue: 'hanok' },
    { title: '경주 감성 힐링 코스', meta: '경주', people: '4/6명', hue: 'autumn' },
    { title: '포항·영덕 동해 드라이브', meta: '포항', people: '6/6명', hue: 'coast' },
    { title: '문경 새재 단풍 트레킹', meta: '문경', people: '2/5명', hue: 'autumn' },
    { title: '영주 부석사 눈꽃 산책', meta: '영주', people: '4/5명', hue: 'coast' },
  ];
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header
          title="모여트립 in 경북"
          right={<IconButton name="bell" onClick={() => nav.go('notif')}/>}
        />
        <div style={{ height: 'calc(100% - 138px)', overflow: 'auto', padding: '0 18px 96px' }}>
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
            <div style={{ marginTop: 12 }}><HeroIllustration weather={homeWeather}/></div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto', paddingBottom: 1 }}>
              {WEATHER_HERO_ORDER.map((key) => {
                const item = WEATHER_HERO_ITEMS[key];
                const on = key === homeWeather;
                return (
                  <button key={key} onClick={() => setHomeWeather(key)} style={{
                    height: 27,
                    padding: '0 10px',
                    borderRadius: 999,
                    border: `1px solid ${on ? '#fff' : 'rgba(255,255,255,0.34)'}`,
                    background: on ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.10)',
                    color: on ? weatherTone.card : '#fff',
                    fontSize: 11,
                    fontWeight: 900,
                    fontFamily: T.fontStack,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}>{item.label}</button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 900 }}>지금 떠나기 좋은 코스</div>
            <button onClick={() => nav.go('explore')} style={{ border: 'none', background: 'transparent', color: T.text500, fontSize: 12, fontWeight: 700, fontFamily: T.fontStack, cursor: 'pointer' }}>더보기 ›</button>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 3 }}>
            {courses.map((c, i) => (
              <div key={c.title} onClick={() => nav.go(i === 0 ? 'course' : 'detail')} style={{ width: 134, flex: '0 0 auto', border: `1px solid ${RF.softLine}`, borderRadius: 12, overflow: 'hidden', background: RF.card, cursor: 'pointer' }}>
                <Photo hue={c.hue} height={92} radius={0}>
                  {i === 0 && <Chip variant="primary" style={{ position: 'absolute' }}>진행중</Chip>}
                </Photo>
                <div style={{ padding: 10 }}>
                  <div style={{ height: 34, fontSize: 12, fontWeight: 800, lineHeight: '17px', overflow: 'hidden' }}>{c.title}</div>
                  <div style={{ marginTop: 8, fontSize: 11, color: T.text500, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="pin" size={11} color={T.text500}/>
                    {c.people}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 22, fontSize: 16, fontWeight: 900 }}>인기 코스 TOP 3</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {[
              ['1', '주왕산 단풍 물길', '청송 · 자연'],
              ['2', '안동 하회마을 산책', '안동 · 문화'],
              ['3', '울릉도 2박 3일 섬 여행', '울릉 · 힐링'],
            ].map((r) => (
              <div key={r[0]} style={{ height: 48, borderRadius: 12, border: `1px solid ${RF.softLine}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px', background: RF.card }}>
                <div style={{ width: 24, height: 24, borderRadius: 999, background: T.primary50, color: T.primary700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>{r[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{r[1]}</div>
                  <div style={{ fontSize: 11, color: T.text500, marginTop: 1 }}>{r[2]}</div>
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

function ScreenExplore() {
  const nav = window.useNav ? window.useNav() : { go: () => {} };
  const rows = [
    { title: '주왕산 & 주산지 힐링 트레킹', area: '청송 · 자연', people: '2/5명', hue: 'forest', liked: true, status: '진행중' },
    { title: '안동 하회마을 하루 코스', area: '안동 · 역사, 문화', people: '3/6명', hue: 'autumn', liked: false, status: '진행중' },
    { title: '울릉도 2박 3일 섬 여행', area: '울릉 · 자연, 힐링', people: '1/5명', hue: 'coast', liked: false, status: '진행중' },
    { title: '경주 역사 감성 여행', area: '경주 · 역사', people: '4/6명', hue: 'hanok', liked: false, status: '진행중' },
    { title: '포항·영덕 동해 드라이브', area: '포항 · 바다, 로컬푸드', people: '6/6명', hue: 'coast', liked: true, status: '출발확정' },
    { title: '문경 새재 단풍 트레킹', area: '문경 · 산책, 단풍', people: '2/5명', hue: 'autumn', liked: false, status: '마감임박' },
    { title: '영주 부석사 눈꽃 산책', area: '영주 · 사찰, 겨울', people: '4/5명', hue: 'coast', liked: false, status: '진행중' },
    { title: '울진 금강송 숲길 워크', area: '울진 · 숲길, 치유', people: '3/6명', hue: 'forest', liked: false, status: '진행중' },
  ];
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
            {['전체', '자연', '역사', '체험', '힐링'].map((c, i) => <Chip key={c} variant={i === 0 ? 'primary' : 'neutral'} size="md">{c}</Chip>)}
          </div>
        </div>
        <div style={{ height: 'calc(100% - 214px)', overflow: 'auto', padding: '14px 18px 98px' }}>
          {rows.map((r) => (
            <div key={r.title} onClick={() => nav.go('detail')} style={{ height: 94, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card, padding: 9, display: 'flex', gap: 11, alignItems: 'center', marginBottom: 10, cursor: 'pointer' }}>
              <div style={{ width: 102, height: 74, borderRadius: 9, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                <Photo hue={r.hue} height={74} radius={0} overlay>
                  <span style={{ position: 'absolute', left: 7, bottom: 7, background: T.primary600, color: '#fff', borderRadius: 6, padding: '3px 6px', fontSize: 10, fontWeight: 800 }}>{r.status}</span>
                </Photo>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 900, lineHeight: '19px' }}>{r.title}</div>
                <div style={{ marginTop: 6, fontSize: 12, color: T.text500 }}>{r.area}</div>
                <div style={{ marginTop: 5, fontSize: 12, color: T.text700, fontWeight: 700 }}>{r.people}</div>
              </div>
              <Icon name="heart" size={20} color={r.liked ? T.accent500 : T.text700}/>
            </div>
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
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, background: '#E9F3E7' }}>
        <MiniMap height={852} withRoute={false} pins={[]}/>
        <svg width="393" height="852" viewBox="0 0 393 852" style={{ position: 'absolute', inset: 0 }}>
          <path d="M0 180 Q85 130 166 180 T393 150 L393 852 L0 852 Z" fill="#DCEAD5" opacity="0.55"/>
          <path d="M265 0 Q336 154 393 216 L393 852 L316 852 Q324 601 292 450 T265 0 Z" fill="#BFDCE8" opacity="0.8"/>
          {[
            { x: 73, y: 337, n: 1 },
            { x: 196, y: 300, n: 6 },
            { x: 306, y: 302, n: 2 },
            { x: 142, y: 455, n: 2 },
            { x: 267, y: 475, n: 2 },
          ].map((p) => (
            <g key={`${p.x}-${p.y}`}>
              <circle cx={p.x} cy={p.y + 2} r="16" fill="rgba(0,0,0,0.12)"/>
              <circle cx={p.x} cy={p.y} r="15" fill={T.primary500}/>
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontFamily={T.fontStack} fontSize="11" fontWeight="900" fill="#fff">{p.n}</text>
            </g>
          ))}
          {[
            { x: 264, y: 196, h: 'forest' },
            { x: 84, y: 513, h: 'autumn' },
            { x: 331, y: 432, h: 'hanok' },
          ].map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="26" fill="#fff"/>
              <circle cx={p.x} cy={p.y} r="23" fill={i === 0 ? '#7EA15E' : i === 1 ? '#A47740' : '#506A47'}/>
            </g>
          ))}
        </svg>
        <div style={{ position: 'absolute', top: 46, left: 0, right: 0 }}>
          <Header title="지도 탐색" left center onBack={nav.back} right={<IconButton name="menu"/>}/>
        </div>
        <div style={{ position: 'absolute', right: 20, top: 530, width: 42, height: 42, borderRadius: 999, background: RF.card, boxShadow: RF.softShadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="pin" size={20} color={T.text700}/>
        </div>
        <div onClick={() => nav.go('detail')} style={{ position: 'absolute', left: 18, right: 18, bottom: 94, height: 96, borderRadius: 16, background: RF.card, boxShadow: RF.shadow, padding: 10, display: 'flex', gap: 12, cursor: 'pointer' }}>
          <div style={{ width: 84, borderRadius: 10, overflow: 'hidden' }}><Photo hue="forest" height={76} radius={0}/></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 900 }}>주왕산 & 주산지 힐링 트레킹</div>
            <div style={{ fontSize: 11, color: T.text500, marginTop: 5 }}>청송 · 자연</div>
            <div style={{ fontSize: 12, color: T.text700, fontWeight: 800, marginTop: 5 }}>2/5명</div>
          </div>
          <Icon name="heart" size={20} color={T.text700}/>
        </div>
        <BottomNav active="compass"/>
      </div>
    </Phone>
  );
}

function ScreenCourseDetail() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const itinerary = [
    { time: '08:00', title: '청송 시외버스터미널', desc: '모임 확인과 간단한 코스 브리핑' },
    { time: '09:20', title: '주왕산 단풍 물길', desc: '폭포길과 기암절벽을 따라 천천히 걷기' },
    { time: '11:40', title: '용연폭포 쉼터', desc: '사진을 남기고 따뜻한 차로 쉬어가기' },
    { time: '13:10', title: '청송 로컬 점심', desc: '사과 막걸리와 산채 정식 추천' },
    { time: '15:00', title: '주산지 물안개길', desc: '왕버들과 호수 풍경을 보는 짧은 산책' },
    { time: '17:30', title: '청송 시외버스터미널', desc: '여행 기록 정리 후 해산' },
  ];
  const nearby = [
    ['절골계곡', '가볍게 이어 걷기 좋은 숲길'],
    ['객주문학관', '비 오는 날 대체 실내 코스'],
    ['청송 사과카페', '짧은 휴식과 로컬 간식'],
  ];
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="코스 상세" left center onBack={nav.back} right={<><IconButton name="share"/><IconButton name="heart"/></>}/>
        <div style={{ height: 'calc(100% - 148px)', overflow: 'auto', paddingBottom: 96 }}>
          <Photo hue="forest" height={174} radius={0}/>
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 0 }}>주왕산 & 주산지 힐링 트레킹</div>
            <div style={{ display: 'flex', gap: 7, marginTop: 12 }}>
              <Chip variant="soft">자연</Chip>
              <Chip variant="soft">히든명소</Chip>
              <Chip variant="soft">추천</Chip>
            </div>
            <div style={{ fontSize: 13, color: T.text700, lineHeight: '21px', marginTop: 14 }}>
              기암절벽과 맑은 주산지의 풍경을 함께 즐기는 힐링 코스예요.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 18 }}>
              {[
                ['clock', '소요시간', '2시간'],
                ['map', '이동거리', '6.2km'],
                ['star', '평점', '4.8'],
              ].map((s) => (
                <div key={s[1]} style={{ textAlign: 'center', color: T.text700 }}>
                  <Icon name={s[0]} size={18} color={T.text500}/>
                  <div style={{ fontSize: 10, color: T.text500, marginTop: 6 }}>{s[1]}</div>
                  <div style={{ fontSize: 12, fontWeight: 900, marginTop: 3 }}>{s[2]}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 15, fontWeight: 900, marginTop: 28, marginBottom: 10 }}>코스 미리보기</div>
            <RouteMap height={146}/>
            <div style={{ fontSize: 15, fontWeight: 900, marginTop: 24, marginBottom: 10 }}>코스 일정</div>
            <div style={{ border: `1px solid ${RF.softLine}`, borderRadius: 12, overflow: 'hidden', background: RF.card }}>
              {itinerary.map((item, index) => (
                <div key={item.time} style={{ display: 'grid', gridTemplateColumns: '52px 1fr', gap: 10, padding: '12px 12px', borderBottom: index < itinerary.length - 1 ? `1px solid ${RF.softLine}` : 'none' }}>
                  <div style={{ fontSize: 11, color: T.text500, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{item.time}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 900 }}>{item.title}</div>
                    <div style={{ marginTop: 3, fontSize: 11.5, lineHeight: '17px', color: T.text500 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 15, fontWeight: 900, marginTop: 24, marginBottom: 10 }}>함께 보면 좋은 곳</div>
            <div style={{ display: 'grid', gap: 9, paddingBottom: 8 }}>
              {nearby.map((item) => (
                <div key={item[0]} style={{ minHeight: 52, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card, padding: '10px 12px' }}>
                  <div style={{ fontSize: 13, fontWeight: 900 }}>{item[0]}</div>
                  <div style={{ marginTop: 3, fontSize: 11.5, color: T.text500 }}>{item[1]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 18px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Btn variant="secondary" onClick={() => nav.go('create-review')}>이 코스로 모집 만들기</Btn>
          <Btn variant="primary" onClick={() => nav.go('detail')}>모집 중인 모임 보기</Btn>
        </div>
      </div>
    </Phone>
  );
}

function ScreenGroupDetail() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {}, toggleLike: () => {}, isLiked: () => false };
  const liked = nav.isLiked('group-ref', false);
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, background: RF.bg }}>
        <Photo hue="forest" height={284} radius={0} overlay>
          <div style={{ position: 'absolute', top: 58, left: 18 }}>
            <IconButton name="back" onClick={nav.back} bg="rgba(255,255,255,0.92)"/>
          </div>
          <div style={{ position: 'absolute', top: 58, right: 18 }}>
            <IconButton name="refresh" bg="rgba(255,255,255,0.92)"/>
          </div>
          <span style={{ position: 'absolute', left: 20, bottom: 20, color: '#fff', fontSize: 12, fontWeight: 800 }}>진행중</span>
        </Photo>
        <div style={{
          position: 'absolute',
          top: 246,
          left: 0,
          right: 0,
          bottom: 86,
          background: RF.card,
          borderRadius: '24px 24px 0 0',
          padding: '24px 20px 18px',
          overflow: 'auto',
        }}>
          <h1 style={{ margin: 0, fontSize: 23, lineHeight: '31px', fontWeight: 900, letterSpacing: 0 }}>주왕산 & 주산지 힐링 트레킹</h1>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: T.text500 }}>청송 · 자연, 트레킹</span>
            {window.CourseSourceBadge ? <window.CourseSourceBadge source="custom"/> : null}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
            <MemberStack members={['bear','rabbit','raccoon']} more={2}/>
            <div style={{ fontSize: 12, color: T.text500 }}>최소 3명 이상</div>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, marginBottom: 7 }}>
              <span>2 / 5명</span>
              <span style={{ color: T.text400 }}>신청 가능</span>
            </div>
            <ProgressBar current={2} max={5}/>
          </div>
          <div style={{ marginTop: 18, border: `1px solid ${RF.softLine}`, borderRadius: 12, padding: 14, display: 'grid', gap: 10 }}>
            {[
              ['calendar', '일정', '2026.05.25 (토) · 당일치기'],
              ['clock', '여행 시간', '08:00 - 18:00'],
              ['pin', '집합', '07:50 청송 시외버스터미널 정문 앞'],
            ].map((r) => (
              <div key={r[1]} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <Icon name={r[0]} size={16} color={T.text500}/>
                <span style={{ width: 66, color: T.text500, flexShrink: 0 }}>{r[1]}</span>
                <span style={{ flex: 1, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{r[2]}</span>
              </div>
            ))}
            <div style={{ height: 1, background: RF.softLine }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="map" size={16} color={T.text500}/>
              <span style={{ flex: 1, fontSize: 11.5, color: T.text500, fontVariantNumeric: 'tabular-nums' }}>36.435612, 129.057214</span>
              <button type="button" style={{ border: 0, background: 'transparent', padding: 0, fontSize: 12, fontWeight: 800, color: T.primary600, fontFamily: T.fontStack, cursor: 'pointer' }}>길 찾기</button>
            </div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 9, alignItems: 'flex-start', padding: 12, borderRadius: 12, background: T.primary50, border: `1px solid ${T.primary100}` }}>
            <Icon name="refresh" size={15} color={T.primary700}/>
            <div style={{ flex: 1, fontSize: 11.5, lineHeight: '17px', color: T.primary700 }}>
              호스트가 직접 만든 코스예요. 여행이 확정(5/22 마감)되기 전까지 경로가 바뀔 수 있고, 바뀌면 알림으로 알려드려요.
            </div>
          </div>
          <div style={{ marginTop: 18, fontSize: 13, fontWeight: 900 }}>호스트</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <AnimalAvatar kind="bear" size={44} bg={T.primary50}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 900 }}>숲속여행자</div>
              <div style={{ fontSize: 11, color: T.text500, marginTop: 3 }}>매너 점수 4.8점</div>
            </div>
            <Icon name="arrow" size={16} color={T.text400}/>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 18px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'grid', gridTemplateColumns: '52px 1fr', gap: 10 }}>
          <button onClick={() => nav.toggleLike('group-ref')} style={{ width: 52, height: 48, borderRadius: 12, border: `1px solid ${T.line200}`, background: RF.card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="heart" size={22} color={liked ? T.accent500 : T.text900}/>
          </button>
          <Btn variant="primary" onClick={() => nav.go('apply')}>함께 가기 신청</Btn>
        </div>
      </div>
    </Phone>
  );
}

function ScreenApplySheet() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, background: '#111' }}>
        <Photo hue="forest" height={330} radius={0} overlay>
          <div style={{ position: 'absolute', top: 58, left: 18 }}>
            <IconButton name="back" onClick={nav.back} bg="rgba(255,255,255,0.88)"/>
          </div>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.44)' }}/>
        </Photo>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: RF.card, borderRadius: '24px 24px 0 0', padding: '20px 20px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 18, fontWeight: 900 }}>함께 가기 신청</div>
            <IconButton name="close" onClick={nav.back}/>
          </div>
          <div style={{ fontSize: 13, fontWeight: 900, marginTop: 18 }}>한마디를 남겨주세요!</div>
          <div style={{ marginTop: 10, height: 112, borderRadius: 12, border: `1px solid ${T.line200}`, padding: 14, color: T.text400, fontSize: 13, lineHeight: '20px' }}>
            간단한 인사나 기대하는 마음을<br/>남겨주세요 😊 (최대 100자)
            <div style={{ textAlign: 'right', marginTop: 30, fontSize: 11 }}>0/100</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 900, marginTop: 18 }}>내 소개 카드</div>
          <div style={{ marginTop: 10, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: '#FFFDF7', padding: 12, display: 'flex', gap: 12 }}>
            <AnimalAvatar kind="bear" size={54} bg={T.primary50}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 900 }}>모여트립이</div>
              <div style={{ fontSize: 12, color: T.text700, lineHeight: '18px', marginTop: 4 }}>자연 속에서 힐링하는 걸 좋아해요!<br/>사진 찍는 것도 좋아합니다</div>
            </div>
          </div>
          <Btn variant="primary" full onClick={() => nav.go('chat')} style={{ marginTop: 18 }}>신청하기</Btn>
        </div>
      </div>
    </Phone>
  );
}

function ScreenCreateReview() {
  const nav = window.useNav ? window.useNav() : { back: () => {}, go: () => {} };
  const [source, setSource] = React.useState('linked');
  const [picked, setPicked] = React.useState('주왕산·주산지 힐링 트레킹');
  const rows = [
    ['주왕산·주산지 힐링 트레킹', '청송 · 당일 6.2km · 방문지 4', 'forest'],
    ['안동 하회마을 하루여행', '안동 · 당일 8.1km · 방문지 5', 'hanok'],
    ['경주 감성 야경 코스', '경주 · 1박 2일 · 방문지 6', 'autumn'],
  ];
  const chooseSource = (next) => {
    window.__moyeoCourseSource = next;
    setSource(next);
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
            <SourceCard id="linked" icon="map" title="등록된 코스로 떠나기" desc="TourAPI·경북나드리 기반으로 검증된 동선을 그대로 가져와요." note="경로 수정 불가 · 집합 정보만 설정"/>
            <SourceCard id="custom" icon="note" title="코스 직접 만들기" desc="방문지와 시간을 내가 짜요. 저장하면 다른 여행자에게도 코스로 노출돼요." note="여행 확정 전까지 수정 가능"/>
          </div>
          {source === 'linked' ? (
            <div style={{ marginTop: 20 }}>
              <div style={{ height: 42, borderRadius: 11, border: `1px solid ${T.line200}`, display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px' }}>
                <Icon name="search" size={17} color={T.text500}/><span style={{ fontSize: 13, color: T.text400 }}>등록된 코스 검색</span>
              </div>
              <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                {rows.map((row) => {
                  const selected = picked === row[0];
                  return <button type="button" key={row[0]} onClick={() => setPicked(row[0])} style={{ height: 72, width: '100%', borderRadius: 12, cursor: 'pointer', fontFamily: T.fontStack, textAlign: 'left', border: `1px solid ${selected ? T.primary500 : RF.softLine}`, padding: 8, display: 'flex', alignItems: 'center', gap: 10, background: RF.card }}>
                    <div style={{ width: 54, borderRadius: 9, overflow: 'hidden' }}><Photo hue={row[2]} height={54} radius={0}/></div>
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
            nav.go(source === 'custom' ? 'custom-course' : 'create-schedule');
          }}>{source === 'custom' ? '코스 만들러 가기' : '이 코스로 다음'}</Btn>
        </div>
      </div>
    </Phone>
  );
}

function ScreenChatRoom() {
  const nav = window.useNav ? window.useNav() : { back: () => {} };
  const Bubble = ({ me, children, time }) => (
    <div style={{ display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
      {!me && <AnimalAvatar kind="bear" size={30} bg={T.primary50}/>}
      <div>
        {!me && <div style={{ fontSize: 10, color: T.text500, margin: '0 0 4px 2px' }}>숲속여행자</div>}
        <div style={{ display: 'flex', flexDirection: me ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 6 }}>
          <div style={{ maxWidth: 244, background: me ? 'var(--moyeo-chat-mine)' : RF.card, border: me ? 'none' : `1px solid ${RF.softLine}`, borderRadius: me ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '10px 13px', fontSize: 13, lineHeight: '19px', color: T.text900 }}>
            {children}
          </div>
          {time && <div style={{ fontSize: 10, color: T.text400 }}>{time}</div>}
        </div>
      </div>
    </div>
  );
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="주왕산 & 주산지 힐링 트레킹" left center onBack={nav.back} right={<><IconButton name="phone"/><IconButton name="more"/></>}/>
        <div style={{ textAlign: 'center', fontSize: 12, color: T.text500, lineHeight: '18px', paddingBottom: 10, borderBottom: `1px solid ${RF.softLine}`, fontVariantNumeric: 'tabular-nums' }}>
          2/5명 · 5/25(토) 08:00-18:00 · 당일치기
        </div>
        <button type="button" data-testid="chat-notice-history" onClick={() => nav.go('notice-history')} style={{ width: '100%', border: 'none', borderBottom: `1px solid ${T.primary100}`, cursor: 'pointer', background: T.primary50, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, fontFamily: T.fontStack, textAlign: 'left' }}>
          <Icon name="note" size={15} color={T.primary700}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: T.primary700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>07:50 청송 시외버스터미널 정문 앞 집합</div>
            <div style={{ fontSize: 10.5, color: T.primary600, marginTop: 2 }}>공지 4개 · 고정 2 · 이력 보기</div>
          </div>
          <Icon name="arrow" size={14} color={T.primary600}/>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 16px', borderBottom: `1px solid ${RF.softLine}`, background: RF.card }}>
          <Icon name="map" size={15} color={T.text500}/>
          <div style={{ flex: 1, minWidth: 0, fontSize: 12, color: T.text700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>방문지 4곳 · <b>호스트 직접 코스</b></div>
          <button type="button" data-testid="chat-course-edit" onClick={() => nav.go('course-edit')} style={{ border: `1px solid ${T.primary200}`, background: T.primary50, color: T.primary700, borderRadius: 999, height: 26, padding: '0 10px', fontSize: 11, fontWeight: 800, fontFamily: T.fontStack, cursor: 'pointer' }}>경로 수정</button>
        </div>
        <div style={{ height: 'calc(100% - 268px)', overflow: 'auto', padding: '18px 18px 86px', background: RF.bg }}>
          <div style={{ width: 'fit-content', margin: '0 auto 14px', background: '#E7F3E7', color: T.primary700, borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 800 }}>모여트립이님이 모임에 참여했어요.</div>
          <div style={{ width: 'fit-content', margin: '0 auto 20px', background: '#E7F3E7', color: T.primary700, borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 800 }}>숲속여행자님이 모임을 개설했어요.</div>
          <Bubble time="09:30">안녕하세요! 좋은 하루 보내세요 😊</Bubble>
          <div style={{ height: 14 }}/>
          <Bubble me time="09:31">안녕하세요! 잘 부탁드려요!</Bubble>
          <div style={{ height: 14 }}/>
          <Bubble time="09:32">저도 함께하게 되어 반갑습니다~</Bubble>
          <div style={{ height: 16 }}/>
          <div style={{ margin: '0 auto 6px', maxWidth: 292, background: T.primary50, border: `1px solid ${T.primary100}`, borderRadius: 12, padding: '11px 13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="refresh" size={14} color={T.primary700}/><div style={{ fontSize: 12, fontWeight: 900, color: T.primary700 }}>호스트가 경로를 수정했어요</div></div>
            <div style={{ fontSize: 11.5, color: T.text700, lineHeight: '17px', marginTop: 6 }}>3번째 방문지가 <b>주산지 → 달기약수탕</b>으로 바뀌었어요. 여행 확정(5/22) 전까지는 경로가 바뀔 수 있어요.</div>
            <button type="button" onClick={() => nav.go('course-edit')} style={{ border: 0, background: 'transparent', padding: 0, fontSize: 11, fontWeight: 800, color: T.primary600, marginTop: 8, fontFamily: T.fontStack, cursor: 'pointer' }}>바뀐 경로 보기</button>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 14px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, height: 42, borderRadius: 999, border: `1px solid ${RF.softLine}`, display: 'flex', alignItems: 'center', padding: '0 14px', color: T.text400, fontSize: 13 }}>메시지 입력</div>
          <button style={{ width: 38, height: 38, borderRadius: 999, border: 'none', background: T.primary500, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="send" size={17} color="#fff"/>
          </button>
        </div>
      </div>
    </Phone>
  );
}

function ScreenFeed() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, toggleLike: () => {}, isLiked: () => false };
  const feedItems = [
    { kind: 'bear', author: '숲속여행자', time: '2시간 전', title: '주왕산 & 주산지 힐링 트레킹', subtitle: '청송', hue: 'forest', likes: 128, comments: 18 },
    { kind: 'rabbit', author: '토끼여행자', time: '5시간 전', title: '안동 하회마을, 잊지 못할 하루', subtitle: '#한옥산책 #가을여행', hue: 'hanok', likes: 128, comments: 18 },
    { kind: 'crane', author: '고요한 두루미 1130', time: '어제', title: '경주 역사 감성 여행', subtitle: '#경주 #야경 #월정교', hue: 'autumn', likes: 56, comments: 12 },
    { kind: 'rabbit', author: '달빛 토끼 6142', time: '2일 전', title: '포항 바다와 시장을 한 번에', subtitle: '#포항 #바다 #드라이브', hue: 'coast', likes: 73, comments: 9 },
    { kind: 'deer', author: '초록 여우 5824', time: '3일 전', title: '문경새재 길은 천천히 걸을수록 좋아요', subtitle: '#문경 #단풍 #숲길', hue: 'forest', likes: 64, comments: 7 },
    { kind: 'turtle', author: '잔잔한 거북이 9032', time: '2주 전', title: '울릉도는 천천히 움직여야 보여요', subtitle: '#울릉 #섬여행 #해안산책', hue: 'coast', likes: 89, comments: 16 },
    { kind: 'bear', author: '우직한 곰 7821', time: '3주 전', title: '영주 부석사 눈길은 조용해서 더 좋았어요', subtitle: '#영주 #부석사 #눈꽃', hue: 'coast', likes: 42, comments: 8 },
    { kind: 'deer', author: '따스한 사슴 3492', time: '한 달 전', title: '울진 금강송 숲길에서 쉬어간 오후', subtitle: '#울진 #금강송 #치유여행', hue: 'forest', likes: 51, comments: 6 },
  ];
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${RF.softLine}`, gap: 42 }}>
          {['팔로잉', '발견'].map((t, i) => (
            <button key={t} style={{ border: 'none', background: 'transparent', height: 52, color: i === 1 ? T.text900 : T.text500, fontSize: 14, fontWeight: 900, fontFamily: T.fontStack, borderBottom: i === 1 ? `2px solid ${T.primary500}` : '2px solid transparent' }}>{t}</button>
          ))}
        </div>
        <div style={{ height: 'calc(100% - 134px)', overflow: 'auto', padding: '14px 16px 96px', background: RF.card }}>
          {feedItems.map((item) => (
            <div key={item.title} onClick={() => nav.go('feed-detail')} style={{ borderBottom: `1px solid ${RF.softLine}`, paddingBottom: 18, marginBottom: 18, cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <AnimalAvatar kind={item.kind} size={34} bg={T.primary50}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 900 }}>{item.author}</div>
                  <div style={{ fontSize: 10, color: T.text500, marginTop: 2 }}>{item.time}</div>
                </div>
                <Icon name="more" size={18} color={T.text500}/>
              </div>
              <div style={{ fontSize: 15, fontWeight: 900, marginTop: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
              <div style={{ fontSize: 12, color: T.text500, marginTop: 5 }}>{item.subtitle}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginTop: 12, borderRadius: 10, overflow: 'hidden' }}>
                <Photo hue={item.hue} height={166} radius={0}/>
                <RouteMap height={166} compact/>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, fontSize: 12, color: T.text700 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="heart" size={17} color={T.text700}/>{item.likes}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="chat" size={17} color={T.text700}/>{item.comments}</span>
                <button onClick={(e) => { e.stopPropagation(); nav.go('feed-write'); }} style={{ marginLeft: 'auto', width: 34, height: 34, borderRadius: 999, border: `1px solid ${RF.softLine}`, background: RF.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="plus" size={17} color={T.text700}/>
                </button>
              </div>
            </div>
          ))}
        </div>
        <BottomNav active="feed"/>
      </div>
    </Phone>
  );
}

function ScreenFeedDetail() {
  const nav = window.useNav ? window.useNav() : { back: () => {} };
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="" left onBack={nav.back} right={<IconButton name="more"/>}/>
        <div style={{ height: 'calc(100% - 98px)', overflow: 'auto', padding: '0 18px 84px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <AnimalAvatar kind="bear" size={34} bg={T.primary50}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 900 }}>숲속여행자</div>
              <div style={{ fontSize: 10, color: T.text500, marginTop: 2 }}>2시간 전</div>
            </div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 900, marginTop: 14 }}>주왕산 & 주산지 힐링 트레킹</div>
          <div style={{ fontSize: 12, color: T.text500, marginTop: 5 }}>청송</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginTop: 14, borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
            <Photo hue="forest" height={198} radius={0}/>
            <RouteMap height={198}/>
            <span style={{ position: 'absolute', right: 8, top: 8, background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: 999, padding: '4px 7px', fontSize: 10, fontWeight: 900 }}>1/10</span>
          </div>
          <div style={{ fontSize: 13, lineHeight: '21px', marginTop: 14 }}>정말 아름다운 코스였어요! 함께해주신 분들 감사해요 😊</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 16 }}>
            {[
              ['이동 거리', '12.4km'],
              ['소요 시간', '4시간 30분'],
              ['방문지', '5곳'],
            ].map((s) => (
              <div key={s[0]} style={{ borderRadius: 10, background: RF.subtle, padding: '12px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: T.text500 }}>{s[0]}</div>
                <div style={{ fontSize: 13, fontWeight: 900, marginTop: 5 }}>{s[1]}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 18, paddingBottom: 14, borderBottom: `1px solid ${RF.softLine}`, fontSize: 13, color: T.text700 }}>
            <span>좋아요 128개</span>
            <span>댓글 18</span>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 16px 28px', borderTop: `1px solid ${RF.softLine}`, background: RF.card, display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, height: 42, borderRadius: 999, border: `1px solid ${RF.softLine}`, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 12, color: T.text400 }}>댓글을 입력하세요...</div>
          <button style={{ width: 38, height: 38, borderRadius: 999, border: 'none', background: '#2F91C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="send" size={17} color="#fff"/>
          </button>
        </div>
      </div>
    </Phone>
  );
}

function ScreenMyPage() {
  const nav = window.useNav ? window.useNav() : { go: () => {} };
  const mySegments = ['진행중', '지난여행', '찜한 코스'];
  const initialSegment = (() => {
    const requested = new URLSearchParams(window.location.search).get('myTab');
    return mySegments.includes(requested) ? requested : '진행중';
  })();
  const [selectedSegment, setSelectedSegment] = React.useState(initialSegment);
  const activeTrips = [
    { title: '주왕산 & 주산지 힐링 트레킹', date: '2024.05.25 (토)', place: '청송 시외버스터미널', people: '2/5명', current: 2, max: 5, dday: 'D-2', hue: 'forest', members: ['bear', 'deer'] },
    { title: '안동 하회마을 하루여행', date: '2024.05.21 (화)', place: '안동터미널 대합실', people: '1/4명', current: 1, max: 4, dday: 'D-5', hue: 'hanok', members: ['bear'] },
    { title: '경주 단풍·야경 1박 2일', date: '11월 8일 토요일 14:00', place: '경주역 2번 출구', people: '5/6명', current: 5, max: 6, dday: 'D-1', hue: 'autumn', members: ['bear', 'deer', 'turtle'], more: 2 },
    { title: '포항·영덕 동해 드라이브', date: '6월 15일 토요일 09:30', place: '포항역 광장', people: '6/6명', current: 6, max: 6, dday: 'D-1', hue: 'coast', members: ['bear', 'deer', 'turtle'], more: 3 },
    { title: '문경 새재 단풍 트레킹', date: '10월 19일 토요일 08:40', place: '문경새재 제1관문', people: '2/5명', current: 2, max: 5, dday: 'D-7', hue: 'autumn', members: ['rabbit', 'bear'] },
    { title: '영주 부석사 눈꽃 산책', date: '12월 14일 토요일 11:00', place: '부석사 주차장', people: '4/5명', current: 4, max: 5, dday: 'D-9', hue: 'coast', members: ['crane', 'deer', 'turtle'] },
  ];
  const pastTrips = [
    { title: '경주 역사 감성 여행', summary: '월정교 야경과 첨성대 단풍길을 함께 걸었어요.', meta: '2024.04.12 (금) · 여행 기록', badge: '경주', hue: 'hanok' },
    { title: '안동 하회마을 하루 코스', summary: '하회마을 골목과 부용대 전망을 천천히 둘러봤어요.', meta: '2024.03.22 (토) · 여행 기록', badge: '안동', hue: 'autumn' },
    { title: '울릉도 2박 3일 섬 여행', summary: '해안 산책로와 섬마을 풍경을 여유롭게 남겼어요.', meta: '2024.02.18 (일) · 여행 기록', badge: '울릉', hue: 'coast' },
    { title: '문경 새재 단풍 트레킹', summary: '완만한 고갯길과 단풍 숲길을 함께 걸었어요.', meta: '2023.11.04 (토) · 여행 기록', badge: '문경', hue: 'autumn' },
    { title: '포항·영덕 동해 드라이브', summary: '해안 도로와 바다 전망 카페를 따라 느긋하게 움직였어요.', meta: '2023.09.16 (토) · 여행 기록', badge: '포항', hue: 'coast' },
    { title: '울진 금강송 숲길 워크', summary: '짧은 숲길과 조용한 쉼터를 중심으로 천천히 걸었어요.', meta: '2023.07.29 (토) · 여행 기록', badge: '울진', hue: 'forest' },
  ];
  const savedCourses = [
    { title: '울릉도 2박 3일 섬 여행', summary: '바다 전망과 짧은 트레킹, 섬마을 산책을 묶은 여유로운 일정이에요.', meta: '2박 3일 · 12.4km', badge: '울릉', hue: 'coast' },
    { title: '경주 역사 감성 여행', summary: '첨성대와 월정교, 동궁과 월지 야경까지 이어지는 경주 감성 코스예요.', meta: '5시간 · 7.3km', badge: '경주', hue: 'hanok' },
    { title: '포항·영덕 동해 드라이브', summary: '해안 도로와 바다 전망 카페, 시장 먹거리를 가볍게 잇는 코스예요.', meta: '4시간 · 9.1km', badge: '포항', hue: 'coast' },
    { title: '문경 새재 단풍 트레킹', summary: '완만한 고갯길과 단풍 숲길을 천천히 걷는 가을 산책 코스예요.', meta: '3시간 · 5.6km', badge: '문경', hue: 'autumn' },
    { title: '영주 부석사 눈꽃 산책', summary: '부석사의 겨울 능선과 짧은 산책길을 안전하게 둘러보는 코스예요.', meta: '2시간 · 3.8km', badge: '영주', hue: 'coast' },
    { title: '울진 금강송 숲길 워크', summary: '금강송 숲길과 쉬어갈 수 있는 쉼터를 중심으로 한 치유 코스예요.', meta: '3시간 · 4.9km', badge: '울진', hue: 'forest' },
  ];
  const thumb = (hue) => (
    <div style={{ width: 96, height: 86, borderRadius: 9, overflow: 'hidden', flexShrink: 0 }}>
      <Photo hue={hue} height={86} radius={0}/>
    </div>
  );
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
  const Trip = ({ title, date, place, people, current, max, dday, hue, members, more }) => (
    <div onClick={() => nav.go('detail')} style={{ ...cardStyle, minHeight: 144 }}>
      {thumb(hue)}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 15, fontWeight: 900, lineHeight: '20px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
          <Chip variant="danger">{dday}</Chip>
        </div>
        <div style={{ fontSize: 12.5, color: T.text500, marginTop: 5, fontWeight: 700 }}>{date}</div>
        <div style={{ fontSize: 11.5, color: T.text500, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{place}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 9 }}>
          <div style={{ flex: 1 }}><ProgressBar current={current} max={max}/></div>
          <span style={{ fontSize: 12.5, color: T.text700, fontWeight: 900 }}>{people}</span>
          <MemberStack size={22} members={members} more={more}/>
        </div>
      </div>
    </div>
  );
  const SummaryTrip = ({ title, summary, meta, badge, hue }) => (
    <div onClick={() => nav.go('course')} style={{ ...cardStyle, minHeight: 136 }}>
      {thumb(hue)}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 15, fontWeight: 900, lineHeight: '20px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
          <Chip variant="primary">{badge}</Chip>
        </div>
        <div style={{ fontSize: 12.5, color: T.text500, lineHeight: '18px', marginTop: 5 }}>{summary}</div>
        <div style={{ fontSize: 11.5, color: T.text700, marginTop: 5, fontWeight: 800 }}>{meta}</div>
      </div>
    </div>
  );
  const visibleCards = selectedSegment === '진행중' ? activeTrips.slice(0, 5) : selectedSegment === '지난여행' ? pastTrips : savedCourses;
  const menuRows = [
    { icon: 'feed', title: '내 피드', subtitle: '내가 기록한 경북 여행', route: 'feed' },
    { icon: 'users', title: '친구 도감', subtitle: '12마리 · 최근 동행 순', route: 'dex' },
    { icon: 'chat', title: '고객센터', subtitle: '문의와 신고 내역' },
  ];
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="마이" right={<IconButton name="settings" ariaLabel="설정" onClick={() => nav.go('settings')}/>}/>
        <div data-testid="my-scroll" style={{ height: 'calc(100% - 152px)', overflow: 'auto', padding: '8px 18px 128px' }}>
          <button
            type="button"
            data-testid="my-profile-summary"
            onClick={() => nav.go('public-profile')}
            style={{ width: '100%', minHeight: 94, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card, padding: 12, display: 'flex', alignItems: 'center', gap: 12, color: T.text900, textAlign: 'left', fontFamily: T.fontStack, cursor: 'pointer' }}
          >
            <AnimalAvatar kind="bear" size={58} bg={T.primary50}/>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 16, lineHeight: '21px', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>다정한 곰 1001</span>
              <span style={{ display: 'block', marginTop: 4, fontSize: 12.5, lineHeight: '18px', color: T.text500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>혼자 떠나도 같이 웃을 수 있는 여행을 좋아해요.</span>
              <span style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <Chip variant="primary">여행 12</Chip>
                <Chip variant="danger">매너 4.7</Chip>
              </span>
            </span>
            <Icon name="arrow" size={17} color={T.text400}/>
          </button>

          <div data-testid="my-profile-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 10 }}>
            {[['12', '여행'], ['4.7', '매너'], ['8', '피드']].map(([value, label]) => (
              <div key={label} style={{ height: 54, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card, display: 'grid', placeItems: 'center', alignContent: 'center', gap: 3 }}>
                <div style={{ fontSize: 16, lineHeight: '20px', fontWeight: 900 }}>{value}</div>
                <div style={{ fontSize: 11.5, color: T.text500, fontWeight: 700 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 10 }}>
            <div style={{ fontSize: 18, lineHeight: '24px', fontWeight: 900 }}>내 여행</div>
            <div style={{ fontSize: 12, color: T.primary600, fontWeight: 900 }}>{activeTrips.slice(0, 5).length}개</div>
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
          {visibleCards.map((item) => (
            selectedSegment === '진행중'
              ? <Trip key={item.title} {...item}/>
              : <SummaryTrip key={item.title} {...item}/>
          ))}
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

function ScreenPublicProfile() {
  const nav = window.useNav ? window.useNav() : { go: () => {} };
  const recentTrips = [
    { hue: 'hanok', title: '경주 역사 감성 여행', meta: '2026.04 · 첨성대 · 월정교' },
    { hue: 'coast', title: '포항·영덕 동해 드라이브', meta: '2026.02 · 호미곶 · 영일대' },
    { hue: 'forest', title: '주왕산 단풍 트레킹', meta: '2025.10 · 주왕산 · 주산지' },
    { hue: 'autumn', title: '안동 하회마을 산책', meta: '2025.09 · 하회마을 · 부용대' },
    { hue: 'coast', title: '울릉도 섬 여행', meta: '2025.07 · 도동항 · 해안 산책로' },
    { hue: 'forest', title: '울진 금강송 숲길', meta: '2025.05 · 금강송 · 왕피천' },
    { hue: 'autumn', title: '문경 새재 고갯길', meta: '2024.11 · 제1관문 · 단풍길' },
    { hue: 'coast', title: '영주 부석사 눈꽃', meta: '2024.12 · 부석사 · 소백산' },
  ];
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <div style={{ height: 'calc(100% - 82px)', overflow: 'auto', paddingBottom: 100 }}>
          <div style={{ height: 188, position: 'relative', background: 'linear-gradient(180deg, #C9E9C9 0%, #EAF4E5 100%)' }}>
            <svg width="393" height="188" viewBox="0 0 393 188" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
              <path d="M0 140 Q58 104 109 124 T215 122 T319 125 T393 104 L393 188 L0 188 Z" fill="#8FC482" opacity="0.55"/>
            </svg>
            <div style={{ position: 'absolute', right: 18, top: 14 }}><IconButton name="settings" onClick={() => nav.go('settings')}/></div>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: -44, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <AnimalAvatar kind="bear" size={86} bg="#F4E1B8"/>
              <div style={{ fontSize: 19, fontWeight: 900, marginTop: 8 }}>모여트립이</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3, fontSize: 12, color: T.text700, fontWeight: 800 }}>
                매너 점수 4.7점 <Icon name="star" size={13} color={T.warning}/>
              </div>
            </div>
          </div>
          <div style={{ padding: '62px 18px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderRadius: 14, border: `1px solid ${RF.softLine}`, overflow: 'hidden' }}>
              {[
                ['여행', '12'],
                ['피드', '8'],
                ['팔로워', '24'],
                ['팔로잉', '18'],
              ].map((s, i) => (
                <div key={s[0]} style={{ padding: '13px 0', textAlign: 'center', borderRight: i < 3 ? `1px solid ${RF.softLine}` : 'none' }}>
                  <div style={{ fontSize: 11, color: T.text500 }}>{s[0]}</div>
                  <div style={{ fontSize: 15, fontWeight: 900, marginTop: 3 }}>{s[1]}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, borderRadius: 12, border: `1px solid ${RF.softLine}`, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 900 }}>소개</div>
              <div style={{ fontSize: 12, color: T.text700, lineHeight: '20px', marginTop: 8 }}>자연과 여행을 사랑합니다 🌿<br/>새로운 사람들과 함께하는 여행이 좋아요!</div>
            </div>
            <div style={{ marginTop: 12, borderTop: `1px solid ${RF.softLine}` }}>
              {[
                ['feed', '내 정보 수정', 'profile-edit'],
                ['users', '친구 관리', 'dex'],
                ['close', '차단한 사용자', 'settings'],
              ].map((r) => (
                <button key={r[1]} onClick={() => nav.go(r[2])} style={{ height: 54, width: '100%', border: 'none', borderBottom: `1px solid ${RF.softLine}`, background: RF.card, display: 'flex', alignItems: 'center', gap: 12, fontFamily: T.fontStack, cursor: 'pointer' }}>
                  <Icon name={r[0]} size={19} color={T.text700}/>
                  <span style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: 800, color: T.text900 }}>{r[1]}</span>
                  <Icon name="arrow" size={15} color={T.text400}/>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 900 }}>최근 여행 ({recentTrips.length})</div>
              <span style={{ fontSize: 12, color: T.primary600, fontWeight: 900 }}>전체 보기</span>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {recentTrips.map((trip) => (
                <div key={trip.title} style={{ height: 68, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card, padding: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 54, height: 52, borderRadius: 9, overflow: 'hidden', flexShrink: 0 }}>
                    <Photo hue={trip.hue} height={52} radius={0}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.title}</div>
                    <div style={{ marginTop: 3, fontSize: 11, color: T.text500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.meta}</div>
                  </div>
                  <Icon name="arrow" size={15} color={T.text400}/>
                </div>
              ))}
            </div>
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
  Btn,
  Chip,
  ProgressBar,
  BottomNav,
  Photo,
  RouteMap,
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
  ScreenFeed,
  ScreenFeedDetail,
  ScreenMyPage,
  ScreenPublicProfile,
});
