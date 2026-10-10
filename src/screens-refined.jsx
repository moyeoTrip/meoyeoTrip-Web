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
      {/* 이름 없는 아이콘 버튼은 보조기술에 「버튼」으로만 읽힌다 — 앱에서 가장 많이 눌리는
          자리라 이름이 반드시 있어야 한다 (QA ENV-006). 설정 화면만 `aria-label="뒤로"` 였다. */}
      {left && <IconButton name="back" ariaLabel="뒤로" onClick={onBack || nav.back}/>}
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
          <button key={t.id} type="button" aria-label={t.label} aria-current={on ? 'page' : undefined} data-testid={`tab-${t.id}`} onClick={() => handle(t)} style={{
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
            {t.id === 'group' && <span aria-hidden="true" style={{ position: 'absolute', top: 12, right: 26, width: 6, height: 6, borderRadius: 999, background: T.primary500 }}/>}
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

// `place` 는 **서버 예보 지점**(예: 경상북도 포항시)이다. 서버가 `locationName` 을 주지 않으면
// 지명 자리를 비운다 — 예전에는 시안 값으로 떨어지는 폴백이 있어 랜드마크(「경주 첨성대」 등
// 9종)를 **서버가 준 예보 지점인 것처럼** 적었다 (NO-MOCK-CANON R1 · iOS 동일 결함 2026-09-15).
// `WEATHER_HERO_ITEMS[*].place` 는 이제 **일러스트 파일이 무엇을 그렸는지**를 적어 두는 주석용
// 값일 뿐이고, 화면 문자열로는 쓰지 않는다.
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
        {place && <span style={{ opacity: 0.45 }}>·</span>}
        {place && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place}</span>}
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
// `error` 는 실패 **객체**다. 화면 문장은 클라이언트가 status·code 로 고른다 (2026-09-15 결정 ⑩) —
// 서버 errorMessage 를 그대로 올리지 않는다. 403 은 다시 시도해도 달라지지 않으므로
// 그 문구를 주고 「다시 시도」도 거둔다 (QA OFF-020).
function TabDataNotice({ status, signedOut = false, onRetry, style, testId, refreshFailed = false, error = null }) {
  const box = { padding: '18px 4px', fontSize: 12, color: T.text500, ...style };
  const failureText = window.screenErrorText(error, '불러오지 못했어요.');
  const canRetry = Boolean(onRetry) && window.errorAllowsRetry(error);
  if (signedOut) return <div role="status" data-testid={testId} style={box}>로그인하면 모집 중인 모임을 볼 수 있어요.</div>;
  if (status === 'ready') {
    // 목록은 그대로 둔다(R2). 다만 **갱신에 실패했다는 사실**까지 숨기면 사용자가
    // 낡은 목록을 최신으로 오인한다 (QA NAV-013 · OFF-015).
    if (!refreshFailed) return null;
    return (
      <div role="status" data-testid={testId ? `${testId}-stale` : undefined} style={{ ...box, padding: '8px 4px' }}>
        최신 정보를 가져오지 못했어요. 보고 계신 내용은 이전에 받은 거예요. <button type="button" onClick={onRetry} style={{ padding: 0, border: 0, background: 'transparent', color: T.primary600, fontFamily: T.fontStack, fontSize: 'inherit', fontWeight: 900, textDecoration: 'underline', cursor: 'pointer' }}>다시 시도</button>
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div role="status" data-testid={testId} style={box}>
        {failureText}{canRetry && <> <button type="button" onClick={onRetry} style={{ padding: 0, border: 0, background: 'transparent', color: T.primary600, fontFamily: T.fontStack, fontSize: 'inherit', fontWeight: 900, textDecoration: 'underline', cursor: 'pointer' }}>다시 시도</button></>}
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
  // 날씨를 못 받으면 **지어내지 않는다.** 예전에는 `|| 'sunny'` 로 떨어져
  // 폭우에도 「맑음 · 경주 첨성대」 히어로와 「추천」 배지를 그렸다 (W-04).
  const homeWeather = WEATHER_CONDITION_TO_HERO[weather.value?.condition] || null;
  const weatherPlace = weather.value?.locationName || null;
  const weatherItem = homeWeather ? WEATHER_HERO_ITEMS[homeWeather] : null;
  // 배지·배경색은 날씨 상태에서 온다. 상태를 모르면 중립 배경만 남기고 배지는 그리지 않는다.
  const weatherTone = weatherItem ? (WEATHER_HERO_TONE[weatherItem.state] || WEATHER_HERO_TONE.good) : null;
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
  // 코스 구역을 펼친 상태도 보던 상태의 일부다 — 탭을 떠났다 와도 그대로 둔다.
  const [coursesExpanded, setCoursesExpanded] = window.useTabState('home.courses-expanded', false);
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
          right={<IconButton name="bell" ariaLabel="알림" testId="home-notification-bell" onClick={() => nav.go('notif')}/>}
        />
        <div ref={pageScroll.ref} onScroll={pageScroll.onScroll} style={{ height: 'calc(100% - 138px)', overflow: 'auto', padding: '0 18px 96px' }}>
          <div style={{ marginTop: 6, padding: 13, borderRadius: 16, background: weatherTone ? weatherTone.card : 'var(--moyeo-weather-good-card)', color: '#fff', boxShadow: RF.softShadow }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ fontSize: 17, fontWeight: 900 }}>이번 주말, 어디로 떠나볼까요?</div>
              {weatherTone && <span style={{
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
              }}>{weatherTone.badge}</span>}
            </div>
            {weatherItem && <div style={{ fontSize: 12, marginTop: 5, opacity: 0.9 }}>{weatherItem.copy}</div>}
            {homeWeather && <div style={{ marginTop: 12 }}><HeroIllustration weather={homeWeather} place={weatherPlace}/></div>}
            {/* 9가지 날씨를 넘겨보는 칩 줄은 화면기획(프로토타입)에만 둔다.
                제품에서 사용자가 날씨를 바꾸는 것은 의미가 없다 —
                현재 날씨는 히어로 이미지 위의 라벨이 이미 보여준다. */}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 900 }}>지금 떠나기 좋은 코스</div>
            {/* 예전에는 이 버튼이 **탐색 탭(모임 목록)** 으로 갔다 — 거기에는 코스가 한 건도 없어서
                공개 코스를 목록으로 훑을 길이 아예 없었다(W-141). 코스 목록 화면은 아직 없으니
                여기서 가로 캐러셀을 세로 목록으로 펼친다. */}
            <button type="button" data-testid="home-courses-expand" aria-expanded={coursesExpanded} onClick={() => setCoursesExpanded((on) => !on)} style={{ border: 'none', background: 'transparent', color: T.text500, fontSize: 12, fontWeight: 700, fontFamily: T.fontStack, cursor: 'pointer' }}>{coursesExpanded ? '접기 ‹' : '더보기 ›'}</button>
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
          <div style={coursesExpanded
            ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingBottom: 3 }
            : { display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 3 }}>
            {/* 목 코스 카드는 없다 — 서버 목록이 없으면 비었다고 말한다. */}
            {/* 여기는 **코스** 목록이다 — 「모임이 없어요」는 무엇이 없다는 말인지 어긋난다 (W-44). */}
            {publicCourses && publicCourses.length === 0 && (
              <div style={{ padding: '18px 4px', fontSize: 12, color: T.text500 }}>공개된 코스가 아직 없어요.</div>
            )}
            <TabDataNotice status={publicCoursesData.status} refreshFailed={publicCoursesData.refreshFailed} error={publicCoursesData.error} signedOut={!liveMode} onRetry={publicCoursesData.reload}/>
            {publicCourses && publicCourses.map((c) => (
              <div key={c.courseId} onClick={() => openCourse(c.courseId)} style={{ ...(coursesExpanded ? { width: '100%' } : { width: 134, flex: '0 0 auto' }), border: `1px solid ${RF.softLine}`, borderRadius: 12, overflow: 'hidden', background: RF.card, cursor: 'pointer' }}>
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
              <div style={{ padding: '14px 4px', fontSize: 12, color: T.text500 }}>아직 인기 코스를 꼽을 만큼 기록이 모이지 않았어요.</div>
            )}
            <TabDataNotice status={popularCoursesData.status} refreshFailed={popularCoursesData.refreshFailed} error={popularCoursesData.error} signedOut={!liveMode} onRetry={popularCoursesData.reload} style={{ padding: '14px 4px' }}/>
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
        {/* 새 모집은 **빈 초안**에서 시작한다. 예전에는 도중에 이탈한 초안의 집합 상세 안내가
            다음 모집에 그대로 남았다 (W-21) — `clearRoomDraft()` 호출부가 생성 성공 뒤 한 곳뿐이었다. */}
        <button onClick={() => { window.MoyeoApi?.clearRoomDraft?.(); nav.go('create-review'); }} style={{
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
        }} type="button" aria-label="새로 만들기" data-testid="home-create"><Icon name="plus" size={26} color="#fff" strokeWidth={2.4}/></button>
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
// `onToggleFavorite` 를 받으면 하트가 **동작하는 버튼**이 된다. 받지 않으면 예전처럼 상태 표시용
// 아이콘이다 — 「찜한 모집」(29-x)은 카드 위에 자기 해제 버튼을 겹쳐 두기 때문에 그 자리는 그대로 둔다.
// 목록 카드의 하트가 카드 클릭에 먹혀 **찜을 아예 바꿀 수 없었다** (W-25 / QA SEARCH-005).
// 지도 하단 카드(`toggleMapFavorite`)·모집 상세(`detail-favorite`)는 이미 버튼이라 목록만 어긋나 있었다.
function ExploreServerRoomCard({ room, onClick, testId, onToggleFavorite }) {
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
        {/* 목록 응답에 `courseTitle`·`startDate` 가 없는 방이 있다(BE-11). 값이 없으면
            **구분점만 남던** 자리다 — 「 · 섬, 자연」·「3/5명 ·  출발」. 없는 조각은 빼고 잇는다 (W-27). */}
        {(room.courseTitle || room.tags?.length > 0) && (
          <div style={{ marginTop: 6, fontSize: 12, color: T.text500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {[room.courseTitle, room.tags?.length ? room.tags.map((tag) => tag.name).join(', ') : null].filter(Boolean).join(' · ')}
          </div>
        )}
        <div style={{ marginTop: 5, fontSize: 12, color: T.text700, fontWeight: 700 }}>{[
          `${room.participantCount}/${room.maxParticipants}명`,
          window.MoyeoApi.formatDate(room.startDate) ? `${window.MoyeoApi.formatDate(room.startDate)} 출발` : null,
        ].filter(Boolean).join(' · ')}</div>
        {(dayTripTime || meetingText) && (
          <div data-testid={testId ? `${testId}-meeting` : undefined} style={{ marginTop: 4, fontSize: 11, color: T.text500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontVariantNumeric: 'tabular-nums' }}>
            {dayTripTime}{dayTripTime && meetingText ? ' · ' : ''}{meetingText ? `${meetingText} 집합` : ''}
          </div>
        )}
      </div>
      {onToggleFavorite ? (
        <button
          type="button"
          data-testid={testId ? `${testId}-favorite` : undefined}
          aria-label={room.favorite ? '찜 해제' : '찜하기'}
          aria-pressed={Boolean(room.favorite)}
          onClick={(event) => { event.stopPropagation(); onToggleFavorite(room); }}
          style={{ border: 0, background: 'transparent', padding: 6, margin: -6, cursor: 'pointer', lineHeight: 0, flexShrink: 0 }}
        >
          <Icon name="heart" size={20} color={room.favorite ? T.accent500 : T.text700}/>
        </button>
      ) : (
        <Icon name="heart" size={20} color={room.favorite ? T.accent500 : T.text700}/>
      )}
    </div>
  );
}

// 10 탐색이 한 번에 받는 모집 수. 서버 `limit` 기본값과 같은 값을 명시해 둔다 —
// **받은 개수가 이 값보다 적으면 마지막 페이지**라는 판정을 여기서 한다.
const EXPLORE_PAGE_SIZE = 20;

function ScreenExplore() {
  const nav = window.useNav ? window.useNav() : { go: () => {} };
  // 로그인 상태에서는 GET /api/v1/chat-rooms/search 결과로 목록을 대체하고,
  // 상단 카테고리 칩은 GET /api/v1/travel-courses/tags 후보로 대체한다.
  const liveMode = window.MoyeoApi?.live();
  // 탐색은 "보던 상태 유지" 탭이다 (TAB-STATE-CANON R3) — 재진입 시 다시 부르지 않는다.
  const keep = { enabled: liveMode, mode: 'keep' };
  const roomsData = window.useTabData('explore.rooms', () => window.MoyeoApi.searchRooms({ limit: EXPLORE_PAGE_SIZE }), {
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
  // ── 무한 스크롤 (커서 · 2026-09-14 서버 추가) ──
  // 예전에는 첫 20건을 받고 끝이라 21번째 모집부터는 **볼 방법이 아예 없었다.**
  // 커서는 직전 페이지의 마지막 roomId 이고, 받은 개수가 limit 보다 적으면 마지막 페이지다.
  //
  // 커서는 실서버에 배포돼 동작을 확인했다(2026-09-14 · limit=5 로 17건을 4묶음에 이어 받아
  // 순서·건수가 전체 목록과 한 건씩 일치, 마지막 묶음 뒤로는 더 부르지 않았다).
  // 그래도 두 가지 방어를 남긴다 — 서버가 커서를 무시하고 첫 페이지를 다시 주는 상황
  // (롤백·구버전)에서 같은 카드가 두 번 나오거나 무한히 다시 받는 것을 막는다:
  //   (1) 이미 가진 roomId 는 건너뛴다,
  //   (2) 새로 붙은 것이 하나도 없으면 거기서 멈춘다.
  const [atEnd, setAtEnd] = React.useState(false);
  const [moreFailed, setMoreFailed] = React.useState(false);
  const loadingMoreRef = React.useRef(false);
  const reachedEnd = atEnd || (serverRooms != null && serverRooms.length < EXPLORE_PAGE_SIZE);
  const loadMore = React.useCallback(async () => {
    if (loadingMoreRef.current) return;
    const current = roomsData.value;
    if (!Array.isArray(current) || current.length === 0) return;
    const cursor = current[current.length - 1]?.roomId;
    if (cursor == null) return;
    loadingMoreRef.current = true;
    setMoreFailed(false);
    try {
      const page = await window.MoyeoApi.searchRooms({ cursor, limit: EXPLORE_PAGE_SIZE });
      const rows = Array.isArray(page) ? page : [];
      const seen = new Set(current.map((room) => String(room.roomId)));
      const fresh = rows.filter((room) => room?.roomId != null && !seen.has(String(room.roomId)));
      if (fresh.length > 0) roomsData.replace((list) => [...(list || []), ...fresh]);
      if (rows.length < EXPLORE_PAGE_SIZE || fresh.length === 0) setAtEnd(true);
    } catch (_) {
      // 다음 묶음을 못 받았다고 가진 목록을 오류로 덮지 않는다 (TAB-STATE-CANON R2).
      setMoreFailed(true);
    }
    loadingMoreRef.current = false;
  }, [roomsData]);
  const onListScroll = (event) => {
    listScroll.onScroll(event);
    if (reachedEnd || moreFailed || loadingMoreRef.current) return;
    const list = event.currentTarget;
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 120) loadMore();
  };
  // 검색 응답에 tagId 필터가 없으므로 응답에 포함된 room.tags 로 화면에서 걸러낸다.
  const visibleRooms = serverRooms && activeTag
    ? serverRooms.filter((room) => (room.tags || []).some((tag) => tag.tagId === activeTag))
    : serverRooms;
  const openServerRoom = (roomId) => {
    window.MoyeoApi.selectRoom(roomId);
    nav.go('detail');
  };
  // 목록 카드의 하트 (QA SEARCH-005). 지도 카드·모집 상세와 같은 토글 API 를 쓰고,
  // 실패하면 조용히 넘기지 않고 목록 위에 한 줄로 알린다.
  const [favoriteBusyId, setFavoriteBusyId] = React.useState(null);
  const [favoriteNotice, setFavoriteNotice] = React.useState('');
  const toggleRoomFavorite = async (room) => {
    if (favoriteBusyId != null || room?.roomId == null) return;
    setFavoriteBusyId(room.roomId);
    setFavoriteNotice('');
    try {
      const result = await window.MoyeoApi.toggleFavorite(room.roomId);
      const favorite = Boolean(result?.favorite);
      roomsData.replace((list) => (list || []).map((item) => (
        String(item.roomId) === String(room.roomId) ? { ...item, favorite } : item
      )));
    } catch (error) {
      setFavoriteNotice(window.userFacingError(error, '찜을 바꾸지 못했어요.'));
    }
    setFavoriteBusyId(null);
  };
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        {/* 지도로 가는 버튼인데 아이콘이 햄버거(menu)였다 — 무엇이 열릴지 알 수 없었다 (W-100). */}
        <Header title="탐색" right={<IconButton name="map" ariaLabel="지도로 보기" onClick={() => nav.go('explore-map')}/>}/>
        <div style={{ padding: '0 18px' }}>
          <div onClick={() => nav.go('search')} style={{ height: 42, borderRadius: 11, border: `1px solid ${T.line200}`, background: RF.card, boxShadow: '0 2px 7px rgba(15,23,20,0.05)', display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px', cursor: 'pointer' }}>
            <Icon name="search" size={18} color={T.text500}/>
            <span style={{ fontSize: 13, color: T.text400 }}>어디로 떠나고 싶나요?</span>
          </div>
          {/* 태그를 못 받으면 칩을 아예 그리지 않는다. 예전 폴백은 핸들러가 없는 정적 Chip 5개라
              눌러도 아무 일이 없었고, 서버에 없는 이름을 필터인 척 보여줬다 (W-93).
              홈(09)이 이미 같은 규칙이다 — `courseTags && (…)`. */}
          {serverTags && (
            <div style={{ display: 'flex', gap: 8, marginTop: 14, overflowX: 'auto' }}>
              {[{ tagId: null, name: '전체' }, ...serverTags].map((tag) => (
                <button key={tag.tagId ?? 'all'} type="button" data-testid={`explore-tag-${tag.tagId ?? 'all'}`} onClick={() => setActiveTag(tag.tagId)} style={{ height: 32, padding: '0 13px', borderRadius: 999, flexShrink: 0, border: `1px solid ${activeTag === tag.tagId ? T.primary500 : T.line200}`, background: activeTag === tag.tagId ? T.primary50 : RF.card, color: activeTag === tag.tagId ? T.primary700 : T.text700, fontSize: 12.5, fontWeight: 800, fontFamily: T.fontStack, whiteSpace: 'nowrap', cursor: 'pointer' }}>{tag.name}</button>
              ))}
            </div>
          )}
        </div>
        <div ref={listScroll.ref} onScroll={onListScroll} data-testid="explore-list-scroll" style={{ height: 'calc(100% - 214px)', overflow: 'auto', padding: '14px 18px 98px' }}>
          {/* 목데이터 폴백은 없다. 서버 목록이 오기 전에는 아무것도 그리지 않고,
              비어 있으면 비어 있다고 말한다. */}
          {visibleRooms && visibleRooms.length === 0 && (
            <div style={{ padding: '48px 0', textAlign: 'center', color: T.text500, fontSize: 13 }}>지금 모집 중인 모임이 없어요.</div>
          )}
          <TabDataNotice status={roomsData.status} refreshFailed={roomsData.refreshFailed} error={roomsData.error} signedOut={!liveMode} onRetry={roomsData.reload} style={{ padding: '48px 0', textAlign: 'center', fontSize: 13 }}/>
          {(visibleRooms || []).map((room) => (
            <ExploreServerRoomCard key={room.roomId} room={room} testId={`explore-room-${room.roomId}`} onClick={() => openServerRoom(room.roomId)} onToggleFavorite={toggleRoomFavorite}/>
          ))}
          {favoriteNotice && <div role="alert" data-testid="explore-favorite-error" style={{ padding: '4px 0 10px', textAlign: 'center', fontSize: 12, color: T.danger }}>{favoriteNotice}</div>}
          {/* 다음 묶음이 남아 있는 동안만 자리를 남긴다 — 마지막 페이지에는 아무것도 없다.
              23-1 댓글 무한 스크롤과 같은 모양이다. */}
          {serverRooms && serverRooms.length > 0 && !reachedEnd && !moreFailed && (
            <div role="status" data-testid="explore-more" style={{ padding: '16px 0', textAlign: 'center', color: T.text500, fontSize: 12 }}>불러오는 중이에요…</div>
          )}
          {moreFailed && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 0' }}>
              <span role="alert" data-testid="explore-more-failed" style={{ fontSize: 12, color: T.text500 }}>더 불러오지 못했어요.</span>
              <button type="button" onClick={() => { setMoreFailed(false); loadMore(); }} style={{ border: 0, background: 'transparent', fontSize: 12, fontWeight: 800, color: T.primary600, cursor: 'pointer', fontFamily: T.fontStack }}>다시 시도</button>
            </div>
          )}
        </div>
        {/* 새 모집은 빈 초안에서 시작한다 (W-21). */}
        <button type="button" aria-label="모집 만들기" data-testid="explore-create" onClick={() => { window.MoyeoApi?.clearRoomDraft?.(); nav.go('create-review'); }} style={{ position: 'absolute', right: 22, bottom: 96, width: 54, height: 54, borderRadius: 999, border: 'none', background: T.primary500, color: '#fff', boxShadow: '0 10px 22px rgba(45,143,90,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
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
  // 40040 INVALID_MAP_SEARCH_AREA 는 서버 문구를 그대로 쓴다.
  // 그 밖의 실패도 **조용히 넘기지 않는다** — 넘기면 통신 실패가 「지금 모집 중인 모임이 없어요.」로
  // 보여서 빈 결과와 구분되지 않고 복구할 길도 없었다 (QA SEARCH-014).
  const [areaError, setAreaError] = React.useState('');
  const [mapLoadFailed, setMapLoadFailed] = React.useState(false);
  const [mapReloadKey, setMapReloadKey] = React.useState(0);
  React.useEffect(() => {
    if (!liveMode) return undefined;
    let active = true;
    setAreaError('');
    setMapLoadFailed(false);
    // 지도 핀은 검색 응답으로 찍을 수 없다 — 2026-08-26 응답 축소로 집합 좌표가 빠졌다.
    // 경북 전역을 덮는 고정 반경으로 지도 API 를 부른다(BE 요청 §4-2 — 과도한 반경을 보내지 않는다).
    // 2026-08-30 서버가 radiusKm 상한 200km 를 세웠다. 120 은 그 아래라 지금은 걸리지 않지만,
    // 반경·중심이 화면에서 바뀌면 400 40040 이 날 수 있어 처리 경로를 남겨 둔다.
    window.MoyeoApi.mapRooms({ latitude: 36.4, longitude: 128.9, radiusKm: 120 })
      .then((rooms) => { if (active && Array.isArray(rooms)) setServerRooms(rooms); })
      .catch((error) => {
        if (!active) return;
        // `error.message` 를 **그대로** 띄우면 예외 원문이 화면에 샌다 — 연결이 끊긴 순간의
        // `TypeError: Failed to fetch` 나 내부 API 호스트명이 그대로 사용자에게 보인다
        // (안드로이드가 같은 자리에서 `Unable to resolve host "moyeo-trip-api…"` 를 노출했다).
        // `userFacingError` 를 거치면 서버가 준 한국어 사유는 그대로 통과하고, 영문 원문·
        // status 없는 실패는 클라이언트 문구로 바뀐다 (결정 ⑩ 의 소급 금지와 별개다 — 그쪽은
        // 「서버 한국어 문구를 통과시키는 로직을 건드리지 마라」이고, 이건 원문 유출을 막는 것이다).
        if (window.MoyeoApi.isInvalidMapAreaError(error)) setAreaError(window.userFacingError(error, '지도에서 볼 수 있는 범위를 벗어났어요.'));
        else setMapLoadFailed(true);
      });
    return () => { active = false; };
  }, [liveMode, mapReloadKey]);
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
  // 현재 위치 버튼 (W-26)·지도 카드 하트 (W-25) 가 공유하는 안내 줄.
  // 권한을 강요하지 않는다 — 누를 때만 묻고, 거절하면 그렇다고 말한다.
  const [mapCenter, setMapCenter] = React.useState(null);
  const [locating, setLocating] = React.useState(false);
  const [mapNotice, setMapNotice] = React.useState('');
  const goToMyLocation = () => {
    if (locating) return;
    if (!navigator.geolocation) { setMapNotice('이 브라우저는 현재 위치를 알려주지 않아요.'); return; }
    setLocating(true);
    setMapNotice('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setMapNotice('현재 위치를 가져오지 못했어요. 브라우저에서 위치 권한을 허용해 주세요.');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  };
  // 지도 카드의 하트 (W-25). 탐색 목록·상세와 같은 토글 API 를 쓴다.
  const [mapFavoriteBusy, setMapFavoriteBusy] = React.useState(false);
  const toggleMapFavorite = async (room) => {
    if (mapFavoriteBusy || !room?.roomId) return;
    setMapFavoriteBusy(true);
    try {
      const result = await window.MoyeoApi.toggleFavorite(room.roomId);
      const favorite = Boolean(result?.favorite);
      setSelectedRoom((current) => (current && current.roomId === room.roomId ? { ...current, favorite } : current));
      setServerRooms((current) => (current || []).map((item) => (
        String(item.roomId) === String(room.roomId) ? { ...item, favorite } : item
      )));
      window.MoyeoTabCache?.patch?.('explore.rooms', (rooms) => (rooms || []).map((item) => (
        String(item.roomId) === String(room.roomId) ? { ...item, favorite } : item
      )));
    } catch (error) {
      setMapNotice(window.userFacingError(error, '찜을 바꾸지 못했어요.'));
    }
    setMapFavoriteBusy(false);
  };
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, background: RF.mapGreen }}>
        <MiniMap
          center={mapCenter}
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
          {/* 아무 일도 하지 않는 아이콘이라 자리만 채운다 — 이름을 붙여 「버튼」으로 읽히게 두지 않는다. */}
          <Header title="지도 탐색" left center onBack={nav.back} right={<span aria-hidden="true" style={{ width: 40, height: 40, display: 'inline-block' }}/>}/>
        </div>
        {areaError && (
          <div role="alert" data-testid="explore-map-area-error" style={{ position: 'absolute', top: 100, left: 18, right: 18, padding: '11px 13px', borderRadius: 12, background: RF.card, boxShadow: RF.softShadow, fontSize: 12.5, fontWeight: 700, color: T.danger, lineHeight: '18px' }}>
            {areaError}
          </div>
        )}
        {/* 핸들러 없는 div 였다 — 눌러도 아무 일이 없었고 `geolocation` 호출이 웹 소스에 0건이었다 (W-26). */}
        <button
          type="button"
          data-testid="explore-map-my-location"
          aria-label="현재 위치로 이동"
          disabled={locating}
          onClick={goToMyLocation}
          style={{ position: 'absolute', right: 20, top: 530, width: 42, height: 42, borderRadius: 999, border: 0, padding: 0, background: RF.card, boxShadow: RF.softShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: locating ? 'default' : 'pointer' }}>
          <Icon name="myLocation" size={20} color={locating ? T.text400 : T.text700}/>
        </button>
        {mapNotice && (
          <div role="alert" data-testid="explore-map-notice" style={{ position: 'absolute', left: 18, right: 18, top: 580, padding: '9px 12px', borderRadius: 10, background: RF.card, boxShadow: RF.softShadow, fontSize: 11.5, color: T.danger, textAlign: 'center' }}>{mapNotice}</div>
        )}
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
            {/* 하트가 색만 따라가고 핸들러가 없어, 누르면 카드 onClick 이 먹어 상세로 갔다 (W-25). */}
            <button
              type="button"
              data-testid="explore-map-card-favorite"
              aria-label={selectedRoom.favorite ? '찜 해제' : '찜하기'}
              onClick={(event) => { event.stopPropagation(); toggleMapFavorite(selectedRoom); }}
              style={{ border: 0, background: 'transparent', padding: 4, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Icon name="heart" size={20} color={selectedRoom.favorite ? T.accent500 : T.text700}/>
            </button>
          </div>
        ) : (
          <div role={mapLoadFailed ? 'alert' : 'status'} data-testid="explore-map-card" style={{ position: 'absolute', left: 18, right: 18, bottom: 94, borderRadius: 16, background: RF.card, boxShadow: RF.shadow, padding: '20px 14px', textAlign: 'center', color: T.text500, fontSize: 12.5 }}>
            {/* 통신 실패를 「모임이 없어요」로 말하지 않는다 — 둘은 다른 상황이고
                실패에는 다시 해볼 길이 있어야 한다 (QA SEARCH-014). */}
            {!liveMode
              ? '로그인하면 모집 중인 모임을 볼 수 있어요.'
              : mapLoadFailed
                ? <>지도를 불러오지 못했어요. <button type="button" data-testid="explore-map-retry" onClick={() => setMapReloadKey((key) => key + 1)} style={{ padding: 0, border: 0, background: 'transparent', color: T.primary600, fontFamily: T.fontStack, fontSize: 'inherit', fontWeight: 900, textDecoration: 'underline', cursor: 'pointer' }}>다시 시도</button></>
                : '지금 모집 중인 모임이 없어요.'}
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
  // 21-1 장소 상세는 `moyeo.selectedTourismContentId` 를 읽는다(`screens-additions4.jsx` `ScreenPlaceDetail`).
  // 방문지 검색(`place-search`)의 `openDetail` 과 같은 방식으로 담아 보낸다 (W-88).
  const openPlaceDetail = (contentId) => {
    if (contentId == null) return;
    try { window.sessionStorage?.setItem('moyeo.selectedTourismContentId', String(contentId)); } catch (_) { /* 저장 못 해도 아래에서 막는다 */ }
    nav.go('place-detail');
  };
  const courseRoute = React.useMemo(
    () => (course ? window.MoyeoKakaoMap?.routeFromPlaces?.(course.places) : null) || null,
    [course],
  );
  // 14 코스 찜. iOS(`course.detail.favorite`)·안드로이드에는 있고 웹에만 없어서,
  // 코스를 모아 둘 방법이 세 플랫폼 중 웹에서만 없었다 (QA DETAIL-002).
  // 상세 응답이 `favorite`·`favoriteCount` 를 이미 준다(실서버 확인 2026-09-14) — 목록을 따로 받지 않는다.
  const [favoriteBusy, setFavoriteBusy] = React.useState(false);
  const [favoriteError, setFavoriteError] = React.useState('');
  const toggleCourseFavorite = async () => {
    if (favoriteBusy || !course?.courseId) return;
    setFavoriteBusy(true);
    setFavoriteError('');
    try {
      const result = await window.MoyeoApi.toggleCourseFavorite(course.courseId);
      setCourse((current) => (current ? {
        ...current,
        favorite: Boolean(result?.favorite),
        favoriteCount: result?.favoriteCount ?? current.favoriteCount,
      } : current));
    } catch (error) {
      setFavoriteError(window.userFacingError(error, '찜을 바꾸지 못했어요.'));
    }
    setFavoriteBusy(false);
  };
  // 14 "모집 중인 모임 보기" — GET /api/v1/travel-courses/{courseId}/chat-rooms.
  // 모집 마감 전이고 내가 아직 참가하지 않은 방만 온다(ATTACH-COMPOSER-CANON §4).
  // 예전에는 버튼이 15 모집 상세로 바로 튀어서 이 코스와 무관한 방이 열렸다.
  const [courseRooms, setCourseRooms] = React.useState(null);
  const [courseRoomsStatus, setCourseRoomsStatus] = React.useState('idle');
  // 시트 접근성은 공용 훅 한 곳에서 본다 (QA ENV-007 · shared.jsx `useSheetA11y`).
  const courseRoomsSheet = window.useSheetA11y({
    label: '이 코스로 모집 중인 모임',
    onClose: () => { setCourseRoomsStatus('idle'); setCourseRooms(null); },
  });
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
    // 서버가 안 준 수치는 **줄째 뺀다.** 예전에는 `${course.distanceKm}km` 를 무조건 적어
    // 거리가 없는 코스에서 「이동거리 nullkm」이 나왔다 (NO-MOCK-CANON R3 — 값을 지어내지도,
    // 지어낸 자리를 남기지도 않는다). 소요시간도 같은 규칙이다.
    const stats = [
      course.travelTime ? ['clock', '소요시간', course.travelTime] : null,
      course.distanceKm != null ? ['map', '이동거리', `${course.distanceKm}km`] : null,
      // 평점이 없으면(averageRating null) 지어내지 않고 숨긴다
      course.averageRating != null ? ['star', '평점', `${course.averageRating} (${course.ratingCount})`] : null,
    ].filter(Boolean);
    return (
      <Phone>
        <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
          <Header
            title="코스 상세"
            left
            center
            onBack={nav.back}
            right={<IconButton
              name="heart"
              ariaLabel={course.favorite ? '찜 해제' : '찜하기'}
              testId="course-detail-favorite"
              color={course.favorite ? T.accent500 : undefined}
              onClick={toggleCourseFavorite}
            />}
          />
          {favoriteError && <div role="alert" data-testid="course-detail-favorite-error" style={{ padding: '6px 20px', fontSize: 12, color: T.danger }}>{favoriteError}</div>}
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
              {/* 작성자를 눌러 25 공개 프로필로 간다 — 피드 작성자·모집 호스트·동행자 행이 이미 그렇다.
                  여기만 표시 전용이라 「누구의 코스인지」 보고도 그 사람을 볼 수 없었다 (QA DETAIL-007).
                  `creatorUserId` 가 없는 코스(비공개·탈퇴)는 누를 수 없는 줄로 둔다 — 항상 실패할 버튼을 두지 않는다.
                  작성자 프로필 이미지는 2026-09-02 서버 변경으로 상세 응답에 온다. URL 이 있으면 반드시 그 사진이고,
                  닉네임 동물 아바타는 null 일 때만 나온다. 작성자 필드는 **상세 응답에만** 있다(실서버 확인). */}
              {publisherNickname ? (
                <button
                  type="button"
                  data-testid="course-publisher"
                  disabled={course.creatorUserId == null}
                  aria-label={course.creatorUserId != null ? `${publisherNickname} 님의 프로필 보기` : undefined}
                  onClick={() => { if (course.creatorUserId != null) nav.go('public-profile', { params: { userId: course.creatorUserId } }); }}
                  style={{ width: '100%', textAlign: 'left', fontFamily: T.fontStack, color: T.text900, display: 'flex', alignItems: 'center', gap: 9, marginTop: 14, padding: 11, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card, cursor: course.creatorUserId != null ? 'pointer' : 'default' }}
                >
                  <ProfileAvatar src={course.creatorProfileImageUrl} nickname={publisherNickname} size={30}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{publisherNickname} 님이 다녀온 코스</div>
                    {publisherMeta && <div style={{ fontSize: 10.5, color: T.text500, marginTop: 2 }}>{publisherMeta}</div>}
                  </div>
                  <Chip variant="soft" style={{ flexShrink: 0 }}>여행자 코스</Chip>
                </button>
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
                {/* 방문지 행이 눌리지 않아 21-1 장소 상세로 가는 길이 **도달 불가능한 방문지 검색 안**에만
                    있었다 (W-88). 응답의 `contentId` 가 곧 21-1 이 읽는 열쇠다 —
                    `place-search` 가 쓰는 것과 같은 자리(`moyeo.selectedTourismContentId`)에 담아 보낸다.
                    `contentId` 가 없는 방문지는 **누를 수 있는 모양을 주지 않는다.** */}
                {(course.places || []).map((place) => {
                  const openable = place.contentId != null;
                  const inner = (
                    <>
                      <span style={{ width: 24, height: 24, borderRadius: 999, background: T.primary50, color: T.primary700, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>{place.sequence}</span>
                      <div style={{ width: 46, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}><RoomThumb src={place.thumbnail} height={40} shape="square"/></div>
                      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                        <div style={{ fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: T.text900 }}>{place.title}</div>
                        <div style={{ fontSize: 11, color: T.text500, marginTop: 2 }}>{place.dayNumber}일차 · {window.MoyeoApi.formatTime(place.visitTime)}</div>
                      </div>
                      {openable && <Icon name="arrow" size={15} color={T.text400}/>}
                    </>
                  );
                  const boxStyle = { display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card };
                  if (!openable) return <div key={`${place.dayNumber}-${place.sequence}`} style={boxStyle}>{inner}</div>;
                  return (
                    <button
                      key={`${place.dayNumber}-${place.sequence}`}
                      type="button"
                      data-testid={`course-place-${place.contentId}`}
                      aria-label={`${place.title} 장소 상세 보기`}
                      onClick={() => openPlaceDetail(place.contentId)}
                      style={{ ...boxStyle, width: '100%', fontFamily: T.fontStack, cursor: 'pointer' }}>
                      {inner}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 18px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* 버튼 이름대로 **그 코스를 골라 준다.** 예전에는 초안에 아무것도 담지 않고 넘어가서
                「이 코스로」라고 해 놓고 코스 고르기가 빈 상태로 열렸다 (DETAIL-010). */}
            <Btn variant="secondary" testId="course-detail-create" onClick={() => {
              if (course?.courseId != null) {
                // 이전 초안을 먼저 비운다 — 남아 있던 집합 상세가 새 모집에 붙는다 (W-21).
                window.MoyeoApi?.clearRoomDraft?.();
                window.MoyeoApi?.updateRoomDraft?.({
                  courseType: 'PUBLIC',
                  courseId: course.courseId,
                  courseTitle: course.title || '',
                  customCourse: null,
                });
                window.__moyeoCourseSource = 'linked';
              }
              nav.go('create-review');
            }}>이 코스로 모집 만들기</Btn>
            <Btn variant="primary" onClick={openCourseRooms} networkAction testId="course-rooms-open">모집 중인 모임 보기</Btn>
          </div>
          {courseRoomsStatus !== 'idle' && (
            <div {...courseRoomsSheet.rootProps} data-testid="course-rooms-sheet" style={{ position: 'absolute', inset: 0, zIndex: 20, background: T.bgOverlay, display: 'flex', alignItems: 'flex-end' }}>
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
  // 모집(채팅방) 신고 — POST /chat-rooms/{roomId}/reports (204 · 2026-09-14 실서버 확인).
  // 예전에는 접수 API 가 없어 문의 안내를 띄웠다. 이제 실제로 접수한다.
  const [reportOpen, setReportOpen] = React.useState(false);
  // 목 모집 폴백이 없어졌으므로 요청 상태를 그대로 그린다.
  const [status, setStatus] = React.useState(liveMode ? 'loading' : 'signed-out');
  const [reloadKey, setReloadKey] = React.useState(0);
  // 찜 토글 실패를 적는 자리. 10 탐색 목록·지도·14 코스 상세와 **같은 규칙**이다.
  const [favoriteError, setFavoriteError] = React.useState('');
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
    setFavoriteError('');
    try {
      const result = await window.MoyeoApi.toggleFavorite(roomId);
      setRoom((current) => (current ? { ...current, favorite: Boolean(result?.favorite) } : current));
      // TAB-STATE-CANON R4: 탐색 목록의 하트도 같이 맞춘다 — 바뀐 항목만 갈아끼운다.
      window.MoyeoTabCache?.patch?.('explore.rooms', (rooms) => (rooms || []).map((room) => (
        String(room.roomId) === String(roomId) ? { ...room, favorite: Boolean(result?.favorite) } : room
      )));
    } catch (error) {
      // 탐색 목록(10)·지도·코스 상세(14)의 찜은 이미 까닭을 말한다 — 15 모집 상세만 삼키고 있었다.
      // 하트가 그대로면 「안 눌렸다」로 읽혀 사용자가 계속 누른다.
      setFavoriteError(window.screenErrorText(error, '찜을 바꾸지 못했어요.'));
    }
  };
  // 25 공개 프로필로 가는 공통 길 (W-88). 친구 목록(`screens-additions2.jsx`)과 같은 형태다.
  const openProfile = (userId) => {
    if (userId == null) return;
    nav.go('public-profile', { params: { userId } });
  };

  if (room) {
    // 정원이 찼으면 신청은 대기열로 간다 — 그 사실을 **신청 전에** 알린다 (W-95).
    const roomFull = room.participantCount != null && room.maxParticipants != null
      && room.participantCount >= room.maxParticipants;
    // 이미 참여 중이거나 내가 호스트인 방도 `canApply=false` 로 온다(서버 `canApply()` 는
    // 참가자·신청중이면 false). 그래서 「신청 불가」만 적으면 **내 방인데 쫓겨난 것처럼** 보였고
    // 채팅방·모집 관리로 가는 길이 이 화면에 하나도 없었다 (W-87).
    // 응답에 이미 있는 `hostId`·`participants` 로 내 자리를 판정한다.
    const myUserId = window.MoyeoApi.myUserId?.();
    const isHost = myUserId != null && room.hostId != null && String(room.hostId) === String(myUserId);
    const isParticipant = myUserId != null
      && (room.participants || []).some((member) => String(member.userId) === String(myUserId));
    const joined = isHost || isParticipant;
    const statusLabel = { RECRUITING: '진행중', CONFIRMED: '확정', CANCELLED: '취소됨' }[room.status] || room.status;
    // 서버 enum 은 NONE / MALE_ONLY / FEMALE_ONLY 다 (MALE·FEMALE 아님)
    const genderLabel = { NONE: '제한 없음', MALE_ONLY: '남성만', FEMALE_ONLY: '여성만' }[room.genderRestriction] || room.genderRestriction;
    const ageLabel = room.minimumAge == null && room.maximumAge == null
      ? '제한 없음'
      : `${room.minimumAge ?? ''} ~ ${room.maximumAge ?? ''}세`;
    // 신청 버튼을 막는 이유를 **누르기 전에** 한 줄로 말한다.
    // 서버 `canApply === false` 인 경우는 (1) 취소·마감, (2) 이미 참여·신청 중,
    // (3) 성별/연령 조건 미달 셋뿐이다(`ChatRoomService.canApply`). (2)는 `joined` 로 먼저 갈라낸다.
    const applyBlockedReason = (() => {
      if (joined || canApply !== false) return null;
      if (room.status !== 'RECRUITING') return '모집이 끝나서 더는 신청할 수 없어요.';
      const parts = [];
      if (room.minimumAge != null && room.maximumAge != null) parts.push(`만 ${room.minimumAge}~${room.maximumAge}세`);
      else if (room.minimumAge != null) parts.push(`만 ${room.minimumAge}세 이상`);
      else if (room.maximumAge != null) parts.push(`만 ${room.maximumAge}세 이하`);
      if (room.genderRestriction === 'FEMALE_ONLY') parts.push('여성');
      else if (room.genderRestriction === 'MALE_ONLY') parts.push('남성');
      if (parts.length > 0) return `이 모집은 ${parts.join(' ')}만 참여할 수 있어요.`;
      return '지금은 이 모임에 신청할 수 없어요. 모집이 마감됐거나 이미 신청한 모임이에요.';
    })();
    const meetingTime = room.meetingDateTime ? window.MoyeoApi.formatTime(String(room.meetingDateTime).split('T')[1]) : '';
    const infoRows = [
      ['calendar', '일정', `${window.MoyeoApi.formatDate(room.startDate)} · ${window.MoyeoApi.tripTypeLabel(room)}`],
      room.tripType === 'DAY_TRIP' && room.dayTripStartTime
        ? ['clock', '여행 시간', `${window.MoyeoApi.formatTime(room.dayTripStartTime)} - ${window.MoyeoApi.formatTime(room.dayTripEndTime)}`]
        : null,
      room.meetingDetails ? ['pin', '집합', `${meetingTime ? `${meetingTime} ` : ''}${room.meetingDetails}`] : null,
    ].filter(Boolean);
    // 「누르면 바로 들어가는가, 호스트가 볼 때까지 기다리는가」는 **신청 전에** 알아야 하는 정보인데
    // 서버가 주는 `joinApprovalMode` 를 모집 만들기 화면에서만 쓰고 상세에는 그리지 않아,
    // 신청 버튼을 누른 뒤에야 알 수 있었다 (iOS F103 교차 · 실서버 방 261=AUTO · 381=MANUAL 확인).
    // 만들기 화면의 설명은 **호스트에게 하는 말**이라 그대로 쓰지 않고 신청자 관점으로 다시 적는다.
    // MANUAL 문구는 「호스트가 남긴 한마디를…」이 **호스트가 한마디를 남긴 것처럼** 읽혀 고쳤다 —
    // 한마디를 남기는 쪽은 신청자다. 세 플랫폼이 같은 문구로 함께 바꾼다.
    // 모르는 값이면 줄 자체를 그리지 않는다 — 지어내지 않는다.
    const approvalCopy = {
      AUTO: { title: '자동 승인', desc: '조건에 맞으면 신청하는 즉시 합류해요.' },
      MANUAL: { title: '수동 승인', desc: '신청할 때 남긴 한마디를 호스트가 확인하고 수락하면 합류해요.' },
    }[room.joinApprovalMode] || null;
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
              {/* 내가 만든 모집은 서버가 400 `40044` 로 막는다 — 항상 실패하는 버튼을 두지 않는다. */}
              {!isHost && (
                <div style={{ position: 'absolute', top: 58, right: 18 }}>
                  <IconButton name="flag" ariaLabel="이 모임 신고" onClick={() => setReportOpen(true)} bg={T.overlayPanel}/>
                </div>
              )}
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
              {/* 참가자 얼굴이 장식이었다 — 눌러도 아무 일이 없어 이 화면에서 사람에게 가는 길이
                  하나도 없었다 (W-88·W-35). 친구 목록과 같은 방식으로 25 공개 프로필로 보낸다. */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16 }}>
                {(room.participants || []).slice(0, 5).map((member, index) => (
                  <button
                    key={member.userId}
                    type="button"
                    data-testid={`detail-participant-${member.userId}`}
                    aria-label="참가자 프로필 보기"
                    onClick={() => openProfile(member.userId)}
                    style={{ padding: 0, border: 0, background: 'transparent', marginLeft: index ? -8 : 0, lineHeight: 0, cursor: 'pointer' }}>
                    {member.profileImageUrl
                      ? <img src={member.profileImageUrl} alt="" style={{ width: 28, height: 28, borderRadius: 999, border: '2px solid #fff', objectFit: 'cover', background: T.primary50 }}/>
                      : <span style={{ width: 28, height: 28, borderRadius: 999, border: '2px solid #fff', background: T.primary50, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user" size={14} color={T.primary600}/></span>}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, marginBottom: 7 }}>
                  <span>{room.participantCount} / {room.maxParticipants}명</span>
                  {/* 정원이 찼는지는 **응답에 이미 있는 두 숫자**로 알 수 있다. 예전에는
                      `canApply` 만 보고 「신청 가능」이라 적어, 정원이 찬 방도 가능으로 보였고
                      대기열이 된다는 사실을 신청 전에 알 수 없었다 (W-95). */}
                  {joined
                    ? <span style={{ color: T.primary600 }}>{isHost ? '내가 연 모임' : '참여 중'}</span>
                    : roomFull
                      ? <span style={{ color: T.accent500 }}>정원 마감 · 대기열</span>
                      : canApply != null && <span style={{ color: canApply ? T.text400 : T.accent500 }}>{canApply ? '신청 가능' : '신청 불가'}</span>}
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
              {approvalCopy && (
                <div data-testid="detail-join-approval" style={{ marginTop: 10, display: 'flex', gap: 9, alignItems: 'flex-start', padding: 12, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card }}>
                  <Icon name="check" size={15} color={T.primary600}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* 라벨은 iOS·안드로이드 상세와 같은 「신청 승인」이다(「신청 승인 방식」은 만들기 화면 쪽 표현). */}
                    <span style={{ display: 'block', fontSize: 10.5, color: T.text500 }}>신청 승인</span>
                    <b style={{ display: 'block', marginTop: 2, fontSize: 12.5 }}>{approvalCopy.title}</b>
                    <span style={{ display: 'block', marginTop: 3, fontSize: 11.5, lineHeight: '17px', color: T.text500 }}>{approvalCopy.desc}</span>
                  </div>
                </div>
              )}
              {course?.type === 'CUSTOM' && (
                <div style={{ marginTop: 10, display: 'flex', gap: 9, alignItems: 'flex-start', padding: 12, borderRadius: 12, background: T.primary50, border: `1px solid ${T.primary100}` }}>
                  <Icon name="refresh" size={15} color={T.primary700}/>
                  <div style={{ flex: 1, fontSize: 11.5, lineHeight: '17px', color: T.primary700 }}>
                    호스트가 직접 만든 코스예요. 여행이 확정({window.MoyeoApi.formatDate(room.recruitmentDeadlineDate)} 마감)되기 전까지 경로가 바뀔 수 있고, 바뀌면 알림으로 알려드려요.
                  </div>
                </div>
              )}
              {/* 호스트 닉네임·매너 점수는 서버 응답에 없어 프로필 이미지만 보여준다.
                  대신 눌러서 25 공개 프로필로 갈 수 있다 — 예전에는 이 줄이 아무 데도 가지 않았다 (W-88). */}
              <div style={{ marginTop: 18, fontSize: 13, fontWeight: 900 }}>호스트</div>
              <button
                type="button"
                data-testid="detail-host-profile"
                aria-label="호스트 프로필 보기"
                onClick={() => openProfile(room.hostId)}
                disabled={room.hostId == null}
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, width: '100%', padding: 0, border: 0, background: 'transparent', fontFamily: T.fontStack, textAlign: 'left', cursor: room.hostId == null ? 'default' : 'pointer' }}>
                {room.hostProfileImageUrl
                  ? <img src={room.hostProfileImageUrl} alt="" style={{ width: 44, height: 44, borderRadius: 999, objectFit: 'cover', background: T.primary50 }}/>
                  : <span style={{ width: 44, height: 44, borderRadius: 999, background: T.primary50, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user" size={20} color={T.primary600}/></span>}
                <span style={{ flex: 1, fontSize: 12.5, color: T.text500 }}>프로필 보기</span>
                {room.hostId != null && <Icon name="arrow" size={15} color={T.text400}/>}
              </button>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 18px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}` }}>
            {/* 왜 못 누르는지 **버튼 위에서** 말한다 — 눌러야만 알던 실패를 미리 알린다. */}
            {applyBlockedReason && (
              <div data-testid="detail-apply-blocked-reason" style={{ fontSize: 11.5, fontWeight: 800, color: T.accent500, lineHeight: '16px', marginBottom: 8 }}>
                {applyBlockedReason}
              </div>
            )}
            {favoriteError && (
              <div role="alert" data-testid="detail-favorite-error" style={{ fontSize: 11.5, color: T.danger, lineHeight: '16px', marginBottom: 8 }}>{favoriteError}</div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr', gap: 10 }}>
            <button data-testid="detail-favorite" aria-label={room.favorite ? '찜 해제' : '찜하기'} onClick={onToggleFavorite} style={{ width: 52, height: 48, borderRadius: 12, border: `1px solid ${T.line200}`, background: RF.card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name="heart" size={22} color={room.favorite ? T.accent500 : T.text900}/>
            </button>
            {joined
              ? (
                <div style={{ display: 'grid', gridTemplateColumns: isHost ? '1fr 1fr' : '1fr', gap: 10 }}>
                  {isHost && <Btn testId="detail-host-manage" variant="secondary" onClick={() => nav.go('host-manage')}>모집 관리</Btn>}
                  <Btn testId="detail-open-chat" variant="primary" onClick={() => nav.go('chat')}>채팅방 열기</Btn>
                </div>
              )
              : <Btn variant="primary" disabled={canApply === false} onClick={() => nav.go('apply')}>{roomFull ? '대기열로 신청' : '함께 가기 신청'}</Btn>}
            </div>
          </div>
          {reportOpen && (
            <ReportReasonSheet
              testId="room-report-sheet"
              subtitle={`「${room.title}」 모집을 신고해요.`}
              loadReasons={() => window.MoyeoApi.roomReportReasons()}
              submitReport={({ reason, details }) => window.MoyeoApi.reportRoom(roomId, { reason, details })}
              noticeByCode={ROOM_REPORT_NOTICES}
              onClose={() => setReportOpen(false)}
            />
          )}
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
  // 정원이 찬 방이면 이 신청은 **대기열**로 들어간다. 신청 전에 알려야 한다 (W-95).
  const [roomFull, setRoomFull] = React.useState(false);
  React.useEffect(() => {
    if (!liveMode) return undefined;
    let active = true;
    window.MoyeoApi.myProfile()
      .then((result) => { if (active && result?.nickname) setProfile(result); })
      .catch(() => {});
    window.MoyeoApi.roomDetail(roomId)
      .then((detail) => {
        if (!active) return;
        setRoomFull(detail?.participantCount != null && detail?.maxParticipants != null
          && detail.participantCount >= detail.maxParticipants);
      })
      .catch(() => { /* 못 받으면 대기열 안내를 지어내지 않는다 */ });
    return () => { active = false; };
  }, [liveMode, roomId]);
  // 플레이스홀더는 「10자 이상 200자 이하」라고 안내하는데 검증이 없어 3자·공백으로도
  // 신청이 만들어졌다 (W-18). 기획(changeLog11)·앱 구현과 같은 규칙으로 막는다.
  const APPLY_MESSAGE_MIN = 10;
  const trimmedMessage = message.trim();
  const messageTooShort = trimmedMessage.length < APPLY_MESSAGE_MIN;
  const submit = async () => {
    if (!liveMode) { nav.go('chat'); return; }
    if (submitting || messageTooShort) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await window.MoyeoApi.applyToRoom(roomId, trimmedMessage);
      // TAB-STATE-CANON R4: 신청으로 내 모임·신청중 목록이 바뀌었다 — 그 키만 덜어낸다.
      window.MoyeoTabCache?.invalidate?.(window.MoyeoTabCache.ROOM_LIST_KEYS);
      setSubmitting(false);
      nav.go(result?.result === 'JOINED' ? 'chat-list' : 'chat-list-applied');
    } catch (requestError) {
      setSubmitting(false);
      setError(window.userFacingError(requestError, '신청을 완료하지 못했어요. 잠시 후 다시 시도해주세요.'));
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
          {roomFull && (
            <div role="status" data-testid="apply-waitlist-note" style={{ marginTop: 12, padding: 12, borderRadius: 12, background: T.bgSubtle, border: `1px solid ${RF.softLine}`, fontSize: 12, lineHeight: '18px', color: T.text700 }}>
              지금 정원이 다 찼어요. 신청하면 <b>대기열</b>에 들어가고, 자리가 비면 순서대로 합류해요.
            </div>
          )}
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
          {liveMode && messageTooShort && (
            <div role="status" data-testid="apply-message-hint" style={{ marginTop: 10, fontSize: 11.5, color: T.text500, lineHeight: '17px' }}>
              한마디는 10자 이상 적어주세요. ({trimmedMessage.length}/10)
            </div>
          )}
          <Btn variant="primary" full disabled={submitting || (liveMode && messageTooShort)} onClick={submit} style={{ marginTop: 18 }} testId="apply-submit">{submitting ? '신청하는 중...' : '신청하기'}</Btn>
        </div>
      </div>
    </Phone>
  );
}

function ScreenCreateReview() {
  const nav = window.useNav ? window.useNav() : { back: () => {}, go: () => {} };
  // 라우터가 마지막 route 하나만 그려서 「이전」으로 나가면 이 화면이 언마운트된다.
  // 초기값을 상수로 두면 돌아올 때마다 고른 것이 지워진다 — 단계들이 공유하는 초안을 다시 읽는다
  // (iOS 는 단계들이 draft 하나를 공유한다 · 안드 AND-114 의 웹판).
  const [source, setSource] = React.useState(
    () => ((window.MoyeoApi?.roomDraft?.() || {}).courseType === 'CUSTOM' ? 'custom' : 'linked'),
  );
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
  // 초안에 남은 코스 이름이 있으면 그것을 고른 상태로 되살린다 (뒤로 갔다 와도 유지).
  const [picked, setPicked] = React.useState(() => (window.MoyeoApi?.roomDraft?.() || {}).courseTitle || '');
  // 목록이 도착해도 **아무것도 대신 골라 주지 않는다.** 예전에는 초안이 비어 있으면 목록의
  // 첫 코스를 고른 상태로 열어서, 사용자가 고른 적 없는 코스가 선택돼 있었다 —
  // 「이 코스로 모집 만들기」로 들어온 사람이 그대로 「다음」을 누르면 엉뚱한 코스로 모집이
  // 진행됐다(W-125). 초안에 **실제로 고른 코스가 있을 때만** 되살리고, 없으면 빈 상태로 둔다.
  React.useEffect(() => {
    if (!serverCourses) return;
    const saved = (window.MoyeoApi?.roomDraft?.() || {}).courseTitle;
    if (saved) setPicked((current) => (current || saved));
  }, [serverCourses]);
  // 4단계가 읽는 전역도 되살린 값에 맞춘다 — 화면은 「직접 만들기」인데 요약은 등록 코스로 가면 안 된다.
  React.useEffect(() => { window.__moyeoCourseSource = source; }, [source]);
  const chooseSource = (next) => {
    window.__moyeoCourseSource = next;
    setSource(next);
  };
  // 「등록된 코스 검색」은 아이콘과 회색 글자만 있는 장식이었다. 공개 코스가 36개로 늘어
  // 목록을 끝까지 훑는 수밖에 없었다 (안드 AND-113 의 웹판).
  // iOS 와 같은 방식으로 **제목**만 걸러낸다(`Changelog01Screens.swift` RecruitmentSourceView).
  // 서버의 GET /travel-courses/search 는 쓰지 않는다 — 이미 받아 둔 목록이 전부이고,
  // 그 엔드포인트는 호출할 때마다 인기 검색어로 기록된다.
  const [courseQuery, setCourseQuery] = React.useState('');
  const visibleRows = React.useMemo(() => {
    const keyword = courseQuery.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter((row) => String(row[0] || '').toLowerCase().includes(keyword));
  }, [rows, courseQuery]);
  // 상세에서 넘어온 코스가 목록 28번째 줄이면 첫 화면에는 **선택되지 않은 코스만** 보인다 —
  // 사용자는 아무것도 안 고른 것으로 읽고 다시 고르려다 엉뚱한 코스를 누른다(W-142).
  // 목록이 도착하면 고른 줄을 화면 안으로 끌어온다. 사용자가 직접 누른 뒤에는 건드리지 않는다.
  const selectedRowRef = React.useRef(null);
  const scrolledToPick = React.useRef(false);
  React.useEffect(() => {
    if (scrolledToPick.current || !picked || !serverCourses) return;
    const node = selectedRowRef.current;
    if (!node) return;
    scrolledToPick.current = true;
    try { node.scrollIntoView({ block: 'center' }); } catch (_) { /* 구형 브라우저 */ }
  }, [picked, serverCourses, visibleRows.length]);
  // 고른 코스가 없다고 알리는 자리. 아무것도 안 고른 채 「이 코스로 다음」을 누르면 여기에 적는다.
  const [pickError, setPickError] = React.useState('');
  // 다음 단계로 넘기는 값 — 17-5 요약이 그대로 읽어 요청을 만든다.
  // **고른 코스가 없으면 목록 첫 줄로 대신 채우지 않는다** — 예전에는 `|| rows[0]` 이 있어서,
  // 선택 없이 「이 코스로 다음」을 눌러도 조용히 첫 코스로 모집이 만들어졌다(W-125 와 같은 뿌리).
  const rememberCourse = () => {
    const selectedRow = rows.find((row) => row[0] === picked);
    // 고른 코스가 며칠짜리인지 함께 넘긴다 — 2/5 일정 단계가 이것으로 당일치기·1박 이상을
    // 정한다. 예전에는 1박 2일 코스를 골라도 2/5 가 늘 당일치기로 열렸다(W-144).
    const selectedCourse = (serverCourses || []).find((course) => course.title === picked) || null;
    const courseDays = selectedCourse
      ? (selectedCourse.places || []).reduce((max, place) => Math.max(max, place.dayNumber || 1), 1)
      : null;
    window.MoyeoApi?.updateRoomDraft({
      courseType: source === 'custom' ? 'CUSTOM' : 'PUBLIC',
      courseId: source === 'custom' ? null : (selectedRow?.[3] ?? null),
      courseTitle: source === 'custom' ? null : selectedRow?.[0] || null,
      courseDays: source === 'custom' ? null : courseDays,
    });
    return Boolean(selectedRow);
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
                <Icon name="search" size={17} color={T.text500}/>
                <input
                  type="text"
                  value={courseQuery}
                  onChange={(event) => setCourseQuery(event.target.value)}
                  placeholder="등록된 코스 검색"
                  aria-label="등록된 코스 검색"
                  data-testid="create-course-search"
                  style={{
                    flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
                    fontSize: 13, color: T.text900, fontFamily: T.fontStack, padding: 0,
                  }}
                />
              </div>
              <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                {/* 예시 코스는 없다 — 서버 코스가 오기 전에는 비어 있다고 말한다. */}
                {!rows.length && (
                  <div style={{ padding: '28px 4px', textAlign: 'center', fontSize: 12.5, color: T.text500 }}>
                    {liveMode ? '지금 모집 중인 모임이 없어요.' : '로그인하면 모집 중인 모임을 볼 수 있어요.'}
                  </div>
                )}
                {/* 목록은 있는데 검색어에 걸리는 코스가 없을 때는 그렇게 말한다 — 빈 화면으로 두지 않는다. */}
                {Boolean(rows.length) && !visibleRows.length && (
                  <div style={{ padding: '28px 4px', textAlign: 'center', fontSize: 12.5, color: T.text500 }}>
                    「{courseQuery.trim()}」와 맞는 코스가 없어요.
                  </div>
                )}
                {visibleRows.map((row) => {
                  const selected = picked === row[0];
                  return <button type="button" key={row[0]} ref={selected ? selectedRowRef : null} onClick={() => { setPicked(row[0]); setPickError(''); }} style={{ height: 72, width: '100%', borderRadius: 12, cursor: 'pointer', fontFamily: T.fontStack, textAlign: 'left', border: `1px solid ${selected ? T.primary500 : RF.softLine}`, padding: 8, display: 'flex', alignItems: 'center', gap: 10, background: RF.card }}>
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
          {pickError && <div role="alert" data-testid="course-pick-error" style={{ marginBottom: 8, fontSize: 11.5, fontWeight: 800, color: T.danger }}>{pickError}</div>}
          <Btn variant="primary" full onClick={() => {
            window.__moyeoCourseSource = source;
            const chosen = rememberCourse();
            // 등록 코스는 고른 것이 있어야 다음으로 간다 — 빈 채로 넘기면 17-5 에서
            // 「코스를 먼저 골라 주세요」로 막히는데, 그때는 어느 단계로 돌아가야 하는지 알 수 없다.
            if (source !== 'custom' && !chosen) { setPickError('어떤 코스로 떠날지 먼저 골라 주세요.'); return; }
            setPickError('');
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
// ───────── 정산 금액 신고 시트 (2026-09-14) ─────────
//
// 정산 카드의 「금액이 부당해요 · 신고하기」에서 열린다. 대상은 **그 메모를 올린 사람**이고,
// 서버 사유 `UNFAIR_SETTLEMENT`(부당한 정산 요구)가 미리 골라져 있다.
//
// 사유 목록은 **서버가 준다** — GET /api/v1/chat-rooms/member-report-reasons 가 코드와
// 표시 문구를 함께 준다. 클라가 목록을 지어내지 않는다(NO-MOCK R1). 못 받으면 빈 상태로
// 오류와 `다시 시도` 만 남긴다 — 30-2 피드 신고 시트와 같은 규칙이다.
// 서버 오류 코드 → 사용자 문구. 코드마다 **다른 말**을 한다 — 같은 붉은 토스트로 뭉개면
// 「내 댓글이라 안 된다」와 「이미 신고했다」와 「댓글이 사라졌다」가 구분되지 않는다.
// (코드·상황은 실서버 `ErrorCode.kt` 확인 · 2026-09-14)
// 문구는 **정본 REPORT-COPY-CANON 의 표 그대로**다 (2026-09-14). 오류 코드당 한 문장이고,
// 「이미 신고한 …」 4종은 오류가 아니라 안내다(붉게 그리지 않는다 — 시트가 done 으로 받는다).
// 여기서 새 문장을 쓰면 같은 코드가 화면마다 다른 말을 하게 된다.
const COMMENT_REPORT_NOTICES = {
  40046: '본인이 쓴 댓글은 신고할 수 없어요.',
  40922: '이미 신고한 댓글이에요.',
  40422: '삭제된 댓글이에요.',
  40306: '볼 수 없는 피드의 댓글이에요.',
};
const ROOM_REPORT_NOTICES = {
  40044: '본인이 연 모집은 신고할 수 없어요.',
  40920: '이미 신고한 모집이에요.',
};
// 멤버 신고는 **정산 카드에서 들어와도 같은 표**를 쓴다 — 어디서 들어왔느냐로 문장이
// 바뀌면 안 된다. 그래서 SettlementReportSheet 도 이 표를 그대로 쓴다(정본 §2).
const MEMBER_REPORT_NOTICES = {
  40045: '자기 자신은 신고할 수 없어요.',
  40921: '이미 신고한 사용자예요.',
};
// 그 밖의 실패 한 문장. 화면마다 「… 잠시 후 다시 시도해주세요.」가 붙었다 떨어졌다 했다.
const REPORT_SUBMIT_FAILED = '신고를 접수하지 못했어요.';

// ───────── 공용 신고 시트 (댓글 · 모집 · 멤버) — 2026-09-14 ─────────
//
// 30-2 피드 신고 시트와 **같은 결**이다: 사유는 서버가 주고(하드코딩 금지), 상세는 선택 300자,
// 결과는 시트 안에서 말한다.
//
// **대상마다 사유 목록이 다르다** — 피드/댓글은 `/feeds/report-reasons`, 모집은
// `/chat-rooms/report-reasons`, 멤버는 `/chat-rooms/member-report-reasons` 다.
// 그래서 목록을 받아 오는 함수와 보내는 함수를 **쓰는 쪽이 넘긴다.** 이 컴포넌트는 어느
// 목록도 갖지 않는다 (NO-MOCK-CANON R1).
//
// `noticeByCode` 는 서버 오류 코드를 **구분된 안내 문구**로 바꾼다. 「이미 신고했다」·
// 「본인 글이다」처럼 다시 눌러도 달라지지 않는 결과를 붉은 오류 토스트로 뭉뚱그리지 않는다.
function ReportReasonSheet({
  title = '신고 사유를 알려주세요',
  subtitle = '',
  testId = 'report-reason-sheet',
  loadReasons,
  submitReport,
  noticeByCode = {},
  onClose,
}) {
  // 시트 접근성은 공용 훅 한 곳에서 본다 (QA ENV-007 · shared.jsx `useSheetA11y`).
  const sheet = window.useSheetA11y({ label: title, onClose });
  const DETAILS_LIMIT = 300;
  const [reasons, setReasons] = React.useState(null);
  const [failed, setFailed] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);
  const [selected, setSelected] = React.useState(null);
  const [details, setDetails] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  // 더 눌러 봐야 달라지지 않는 결과(접수 완료·이미 신고함·본인 글·없는 댓글·비공개 피드).
  const [done, setDone] = React.useState('');
  React.useEffect(() => {
    let active = true;
    setFailed(false);
    setReasons(null);
    Promise.resolve()
      .then(() => loadReasons())
      .then((list) => {
        if (!active) return;
        const rows = Array.isArray(list) ? list.filter((row) => row && row.reason) : [];
        setReasons(rows.length ? rows : null);
        setFailed(rows.length === 0);
        // 첫 사유를 미리 고른다 — 30-2 피드 신고 시트와 같다.
        if (rows.length) setSelected(String(rows[0].reason));
      })
      .catch(() => { if (active) { setReasons(null); setFailed(true); } });
    return () => { active = false; };
  }, [attempt]);
  const submit = async () => {
    if (!selected || busy || done) return;
    setBusy(true);
    setError('');
    try {
      await submitReport({ reason: selected, details });
      setDone('신고를 접수했어요.');
    } catch (submitError) {
      const notice = noticeByCode[String(submitError?.code || '')];
      if (notice) setDone(notice);
      else setError(window.userFacingError(submitError, REPORT_SUBMIT_FAILED));
    }
    setBusy(false);
  };
  return (
    <div {...sheet.rootProps} data-testid={testId} style={{ position: 'absolute', inset: 0, zIndex: 40 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: T.bgOverlay }}/>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: RF.card, borderRadius: '24px 24px 0 0', padding: '10px 20px 28px', boxShadow: T.l3, maxHeight: '86%', overflowY: 'auto' }}>
        <div style={{ width: 36, height: 4, borderRadius: 999, background: T.line300, margin: '0 auto 14px' }}/>
        <div style={{ fontSize: 16, fontWeight: 900 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11.5, color: T.text500, marginTop: 6, lineHeight: '17px' }}>{subtitle}</div>}
        {!done && (
          <div style={{ display: 'grid', gap: 6, marginTop: 14 }}>
            {reasons === null ? (
              failed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div role="alert" data-testid={`${testId}-reasons-failed`} style={{ flex: 1, fontSize: 12, color: T.danger }}>불러오지 못했어요.</div>
                  <button type="button" onClick={() => setAttempt((n) => n + 1)} style={{ border: 0, background: 'transparent', fontSize: 12, fontWeight: 800, color: T.primary600, cursor: 'pointer', fontFamily: T.fontStack }}>다시 시도</button>
                </div>
              ) : (
                <div role="status" data-testid={`${testId}-reasons-loading`} style={{ fontSize: 12, color: T.text500 }}>불러오는 중이에요…</div>
              )
            ) : reasons.map((row) => {
              const chosen = selected === String(row.reason);
              return (
                <button
                  key={row.reason}
                  type="button"
                  data-testid={`${testId}-reason-${row.reason}`}
                  aria-pressed={chosen}
                  onClick={() => setSelected(String(row.reason))}
                  style={{ minHeight: 46, borderRadius: 11, border: `1.5px solid ${chosen ? T.primary500 : T.line200}`, background: chosen ? T.primary50 : 'transparent', display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', cursor: 'pointer', fontFamily: T.fontStack, textAlign: 'left' }}>
                  <span aria-hidden style={{ width: 18, height: 18, borderRadius: 999, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${chosen ? T.primary500 : T.line300}`, background: chosen ? T.primary500 : 'transparent' }}>
                    {chosen && <Icon name="check" size={12} color="#fff"/>}
                  </span>
                  {/* 표시 문구는 서버 displayName 그대로다 — 클라가 문구를 갖지 않는다. */}
                  <span style={{ flex: 1, fontSize: 13, fontWeight: chosen ? 800 : 700, color: chosen ? T.primary700 : T.text900 }}>{row.displayName}</span>
                </button>
              );
            })}
          </div>
        )}
        {!done && reasons !== null && (
          <>
            <textarea
              data-testid={`${testId}-details`}
              value={details}
              maxLength={DETAILS_LIMIT}
              onChange={(event) => setDetails(event.target.value.slice(0, DETAILS_LIMIT))}
              aria-label="신고 상세"
              placeholder="어떤 점이 문제인지 알려주세요 (선택)"
              style={{ width: '100%', boxSizing: 'border-box', height: 72, marginTop: 12, borderRadius: 12, border: `1px solid ${T.line200}`, padding: 12, fontSize: 13, lineHeight: '19px', fontFamily: T.fontStack, resize: 'none', outline: 'none', background: 'transparent', color: T.text900 }}
            />
            <div style={{ fontSize: 11, color: T.text400, textAlign: 'right', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{details.length} / {DETAILS_LIMIT}</div>
          </>
        )}
        {error && <div role="alert" data-testid={`${testId}-error`} style={{ fontSize: 12, color: T.danger, marginTop: 8 }}>{error}</div>}
        {done && <div role="status" data-testid={`${testId}-done`} style={{ fontSize: 13, color: T.text700, marginTop: 14, lineHeight: '20px' }}>{done}</div>}
        <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
          {!done && <Btn full disabled={!selected || busy} networkAction testId={`${testId}-submit`} onClick={submit}>{busy ? '접수 중...' : '신고하기'}</Btn>}
          <Btn variant="secondary" full onClick={onClose}>{done ? '닫기' : '취소'}</Btn>
        </div>
      </div>
    </div>
  );
}

function SettlementReportSheet({ roomId, memberId, memberName, onClose }) {
  // 시트 접근성은 공용 훅 한 곳에서 본다 (QA ENV-007 · shared.jsx `useSheetA11y`).
  const sheet = window.useSheetA11y({ label: '정산 금액 신고', onClose });
  const [reasons, setReasons] = React.useState(null);
  const [failed, setFailed] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);
  const [selected, setSelected] = React.useState(window.SETTLEMENT_REPORT_REASON);
  const [details, setDetails] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [done, setDone] = React.useState('');
  React.useEffect(() => {
    let active = true;
    setFailed(false);
    window.MoyeoApi.memberReportReasons()
      .then((list) => {
        if (!active) return;
        const rows = Array.isArray(list) ? list.filter((row) => row && row.reason) : [];
        setReasons(rows.length ? rows : null);
        setFailed(rows.length === 0);
      })
      .catch(() => { if (active) { setReasons(null); setFailed(true); } });
    return () => { active = false; };
  }, [attempt]);
  // 서버 목록에 UNFAIR_SETTLEMENT 가 없으면 미리 고른 값을 비운다 —
  // 목록에 없는 코드를 몰래 보내지 않는다.
  React.useEffect(() => {
    if (!reasons) return;
    if (!reasons.some((row) => row.reason === selected)) setSelected(null);
  }, [reasons]);
  const submit = async () => {
    if (!selected || busy || done) return;
    setBusy(true);
    setError('');
    try {
      await window.MoyeoApi.reportMember(roomId, memberId, { reason: selected, details });
      setDone('신고를 접수했어요.');
    } catch (submitError) {
      // 정산 카드에서 들어왔어도 **멤버 신고**다 — 일반 멤버 신고와 **같은 표**를 쓴다.
      // 예전에는 여기만 「… 멤버예요」라고 말해 같은 40921 이 들어온 경로에 따라
      // 다른 문장이 됐다(정본 §발견된 어긋남).
      // 409 전체를 「이미 신고함」으로 뭉개지 않는다 — 40918·40902 도 409 다 (W-102).
      const notice = MEMBER_REPORT_NOTICES[String(submitError?.code || '')];
      if (notice) setDone(notice);
      else setError(window.userFacingError(submitError, REPORT_SUBMIT_FAILED));
    }
    setBusy(false);
  };
  return (
    <div {...sheet.rootProps} data-testid="settlement-report-sheet" style={{ position: 'absolute', inset: 0, zIndex: 40 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: T.bgOverlay }}/>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: RF.card, borderRadius: '24px 24px 0 0', padding: '10px 20px 28px', boxShadow: T.l3, maxHeight: '82%', overflowY: 'auto' }}>
        <div style={{ width: 36, height: 4, borderRadius: 999, background: T.line300, margin: '0 auto 14px' }}/>
        <div style={{ fontSize: 16, fontWeight: 900 }}>신고 사유를 알려주세요</div>
        <div style={{ fontSize: 11.5, color: T.text500, marginTop: 6, lineHeight: '17px' }}>
          {memberName ? `${memberName}님을 신고해요. ` : ''}{window.SETTLEMENT_REPORT_GUIDE}
        </div>
        <div style={{ display: 'grid', gap: 6, marginTop: 14 }}>
          {reasons === null ? (
            failed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div role="alert" data-testid="settlement-report-reasons-failed" style={{ flex: 1, fontSize: 12, color: T.danger }}>불러오지 못했어요.</div>
                <button type="button" onClick={() => setAttempt((n) => n + 1)} style={{ border: 0, background: 'transparent', fontSize: 12, fontWeight: 800, color: T.primary600, cursor: 'pointer', fontFamily: T.fontStack }}>다시 시도</button>
              </div>
            ) : (
              <div role="status" data-testid="settlement-report-reasons-loading" style={{ fontSize: 12, color: T.text500 }}>불러오는 중이에요…</div>
            )
          ) : reasons.map((row) => {
            const chosen = selected === row.reason;
            return (
              <button
                key={row.reason}
                type="button"
                data-testid={`settlement-report-reason-${row.reason}`}
                aria-pressed={chosen}
                onClick={() => setSelected(row.reason)}
                style={{ minHeight: 44, borderRadius: 11, border: `1.5px solid ${chosen ? T.primary500 : T.line200}`, background: chosen ? T.primary50 : 'transparent', display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', cursor: 'pointer', fontFamily: T.fontStack, textAlign: 'left' }}>
                {/* 화면기획은 라디오 대신 초록 체크 원으로 선택을 표시한다 (30-2 와 같은 모양) */}
                <span aria-hidden style={{ width: 18, height: 18, borderRadius: 999, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${chosen ? T.primary500 : T.line300}`, background: chosen ? T.primary500 : 'transparent' }}>
                  {chosen && <Icon name="check" size={12} color="#fff"/>}
                </span>
                {/* 표시 문구는 서버 displayName 그대로다 — 클라가 문구를 갖지 않는다. */}
                <span style={{ flex: 1, fontSize: 13, fontWeight: chosen ? 800 : 700, color: chosen ? T.primary700 : T.text900 }}>{row.displayName}</span>
              </button>
            );
          })}
        </div>
        <textarea
          data-testid="settlement-report-details"
          value={details}
          maxLength={300}
          onChange={(event) => setDetails(event.target.value)}
          placeholder="자세한 내용 (선택 · 300자)"
          style={{ width: '100%', boxSizing: 'border-box', height: 72, marginTop: 12, borderRadius: 12, border: `1px solid ${T.line200}`, padding: 12, fontSize: 13, lineHeight: '19px', fontFamily: T.fontStack, resize: 'none', outline: 'none', background: 'transparent', color: T.text900 }}
        />
        {error && <div role="alert" style={{ fontSize: 12, color: T.danger, marginTop: 8 }}>{error}</div>}
        {done && <div role="status" data-testid="settlement-report-done" style={{ fontSize: 12, color: T.text500, marginTop: 8 }}>{done}</div>}
        <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
          {!done && <Btn full disabled={!selected || busy} onClick={submit}>{busy ? '보내는 중...' : '신고하기'}</Btn>}
          <Btn variant="secondary" full onClick={onClose}>{done ? '닫기' : '취소'}</Btn>
        </div>
      </div>
    </div>
  );
}

function SpecialMessageCard({ message, voting = false, onVote = null, roomId = null, mine = false, onReport = null }) {
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
    // 정산 메모 카드. **금액을 보는 자리가 여기다** — 올린 사람 화면(20-2e)이 아니라
    // 받는 사람이 「얼마 내라」를 읽는 자리라, 신고 안내와 진입점을 여기에 둔다.
    // 자기 자신은 신고할 수 없고(서버 400 `40045`), 방·대상 id 를 모르면 버튼을 두지 않는다 —
    // 눌러도 아무 일이 없는 버튼을 만들지 않는다. 21 견본 화면이 그 경우다.
    const canReport = !mine && roomId != null && message.senderId != null && onReport;
    return (
      <div data-testid={`chat-card-settlement-${message.messageId}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Icon name="money" size={13} color={T.text700}/>
          <span style={{ fontSize: 11, fontWeight: 800, color: T.text500 }}>정산 메모 · 송금 아님</span>
        </div>
        <div style={{ fontSize: 13, lineHeight: '19px', whiteSpace: 'pre-line' }}>{message.content}</div>
        {/* 문구는 iOS·안드로이드와 글자까지 같다 (`window.SETTLEMENT_REPORT_GUIDE`). */}
        <div style={{ fontSize: 10.5, lineHeight: '15px', color: T.text500, marginTop: 9, paddingTop: 9, borderTop: `1px solid ${T.line100}` }}>
          {window.SETTLEMENT_REPORT_GUIDE}
        </div>
        {canReport && (
          <button
            type="button"
            data-testid={`chat-card-settlement-report-${message.messageId}`}
            onClick={() => onReport(message)}
            style={{ marginTop: 7, border: 0, background: 'transparent', padding: 0, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontFamily: T.fontStack }}>
            <Icon name="flag" size={12} color={T.text700}/>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: T.text700 }}>금액이 부당해요 · 신고하기</span>
          </button>
        )}
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

// ── 방 머리말 캐시 (W-99 · 안드 AND-61 과 같은 규칙) ──
// 조회가 실패하면 제목이 빈 헤더만 남아 **내가 어느 방에 들어왔는지조차** 알 수 없었다.
// 마지막으로 성공한 제목·인원을 남겨 두고, 연결이 끊긴 동안에도 그 값으로 헤더를 그린다.
// 담는 값은 서버가 준 것뿐이다 — 없는 값을 지어내지 않는다.
const CHAT_ROOM_HEADER_CACHE_PREFIX = 'moyeo.chatRoomHeader.';
function readChatRoomHeaderCache(roomId) {
  if (roomId == null) return null;
  try {
    const raw = window.localStorage?.getItem(`${CHAT_ROOM_HEADER_CACHE_PREFIX}${roomId}`);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && parsed.title ? parsed : null;
  } catch (_) { return null; }
}
function writeChatRoomHeaderCache(roomId, header) {
  if (roomId == null || !header?.title) return;
  try {
    window.localStorage?.setItem(`${CHAT_ROOM_HEADER_CACHE_PREFIX}${roomId}`, JSON.stringify(header));
  } catch (_) { /* 저장 공간이 없으면 캐시 없이 간다 */ }
}

// ── 20 과거 메시지 잇기 (QA CHAT-015 · 안드 `beforeMessageId` 와 같은 규칙) ──
//
// 서버는 커서를 준다: `GET {id}/messages?limit=50` → 최신 50건 + `hasNext`·`nextId`(그 묶음의
// **가장 오래된** messageId), 이어서 `?beforeMessageId={nextId}` 로 **그보다 오래된** 묶음을 준다.
// 겹치지 않는다(실서버 방 405: 1155~1204 → before=1155 → 836~1154).
// 예전 웹은 `limit: 50` 한 번만 부르고 `hasNext` 를 버려서, 50건이 넘는 방은 그 위 대화로
// 올라갈 길이 화면에 아예 없었다.
const CHAT_PAGE_SIZE = 50;
// 위로 이만큼 남았을 때 다음(더 오래된) 묶음을 부른다. 끝에 닿은 뒤에 부르면 한 박자 늦게 보인다.
const CHAT_OLDER_TRIGGER_PX = 80;
function chatMessageIdValue(message) {
  const value = Number(message?.messageId);
  return Number.isFinite(value) ? value : null;
}
function chatSameMessageIds(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  return a.every((item, index) => String(item?.messageId) === String(b[index]?.messageId));
}
// 앞(위)에 오래된 묶음을 잇는다. **이미 있는 messageId 는 버린다** — 커서가 겹쳐 와도 중복되지 않는다.
function mergeOlderChatMessages(current, older) {
  const list = Array.isArray(current) ? current : [];
  if (!Array.isArray(older) || older.length === 0) return list;
  const seen = new Set(list.map((message) => String(message?.messageId)));
  const fresh = older.filter((message) => message?.messageId != null && !seen.has(String(message.messageId)));
  if (fresh.length === 0) return list;
  return [...fresh, ...list];
}
// 폴링·복귀 따라잡기가 받아 온 **최신 묶음**을 끼워 넣는다.
// 예전에는 목록을 통째로 갈아끼웠다 — 그러면 위로 올려 붙여 둔 지난 묶음이 그때마다 날아간다.
// 받은 묶음이 덮는 구간(min~max)만 그 응답으로 갈고(그 사이에서 지워진 메시지는 그대로 사라진다),
// 그 구간 밖의 것(더 오래된 묶음 · 실시간으로 방금 도착해 응답에는 아직 없는 메시지)은 **그대로 지킨다.**
function mergeRecentChatMessages(current, incoming) {
  if (!Array.isArray(incoming)) return current;
  const list = Array.isArray(current) ? current : [];
  if (list.length === 0) return incoming;
  const bounds = incoming.map(chatMessageIdValue).filter((value) => value != null);
  if (bounds.length === 0) return incoming;
  const min = Math.min(...bounds);
  const max = Math.max(...bounds);
  const older = list.filter((message) => { const value = chatMessageIdValue(message); return value != null && value < min; });
  const newer = list.filter((message) => { const value = chatMessageIdValue(message); return value != null && value > max; });
  const merged = [...older, ...incoming, ...newer];
  return chatSameMessageIds(list, merged) ? list : merged;
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
  // 오늘의 로드맵(20-5 로 가는 길). `GET {id}/roadmap/current` 이 유일한 근거다 —
  // 서버는 방이 CONFIRMED 이고 오늘이 여행 기간 안일 때만 `active=true` 와 방문지를 준다.
  // `active=false` 면 띠를 **아예 그리지 않는다**: 눌러도 빈 20-5 로만 이어지는 컨트롤을
  // 두지 않는다는 기존 판단이고, iOS `ServerRoadmapBar`·안드 `chat-roadmap` 과 같은 조건이다.
  const [roadmap, setRoadmap] = React.useState(null);
  // 조회 실패를 「아직 안 왔다」와 구분한다 — 실패했을 때만 캐시 헤더와 「다시 시도」를 그린다 (W-99).
  const [loadFailed, setLoadFailed] = React.useState(false);
  // 안드로이드는 **어떤 실패든** 「이 모임의 대화를 볼 수 없어요.」로 뭉갰고(권한 문제로 읽혔다),
  // 웹은 그 반대로 **403 까지** 「연결되면 지난 대화를 보여드려요. + 다시 시도」로 뭉갰다 —
  // 몇 번을 눌러도 달라지지 않는 실패에 다시 시도를 붙여 두면 사용자가 계속 누른다 (QA OFF-020).
  // 실패한 까닭을 그대로 들고 있다가 403 만 권한으로 가른다.
  const [loadError, setLoadError] = React.useState(null);
  const [reloadKey, setReloadKey] = React.useState(0);
  // ── 과거 메시지 커서 (CHAT-015) ──
  // `olderCursor` 는 다음에 넘길 `beforeMessageId`(= 마지막 응답의 `nextId`)다.
  // `hasOlder` 가 false 면 **더 부르지 않는다** — 서버가 끝이라고 말한 뒤에는 조르지 않는다.
  const [olderCursor, setOlderCursor] = React.useState(null);
  const [hasOlder, setHasOlder] = React.useState(false);
  const [loadingOlder, setLoadingOlder] = React.useState(false);
  const [olderError, setOlderError] = React.useState('');
  // 403 은 몇 번을 눌러도 달라지지 않는다 — 그때는 「다시 시도」를 두지 않는다.
  const [olderRetryable, setOlderRetryable] = React.useState(true);
  const messageScrollRef = React.useRef(null);
  // 위에 내용을 붙이면 보고 있던 줄이 아래로 밀린다. 붙이기 직전의 scrollHeight·scrollTop 을
  // 여기 담아 두고, 붙은 뒤 늘어난 만큼 더해 **화면이 튀지 않게** 되돌린다.
  const prependAnchorRef = React.useRef(null);
  // 맨 아래를 보고 있었으면 새 메시지가 와도 계속 맨 아래를 본다(실시간 수신과 충돌하지 않게).
  const stickToBottomRef = React.useRef(true);
  const didInitialBottomRef = React.useRef(false);
  // **맨 아래로 따라갈지는 「가장 새 메시지의 id」로만 정한다** (안드 CHAT-015 가 먼저 밟은 함정).
  // 목록 길이로 판단하면, 위에 과거 묶음을 붙여 길이가 늘어난 것을 「새 메시지가 왔다」로 읽고
  // 화면이 맨 아래로 튕긴다 — 스크롤 높이 보정만으로는 그 튐이 잡히지 않는다.
  const newestMessageIdRef = React.useRef(null);
  const cachedHeader = React.useMemo(() => readChatRoomHeaderCache(roomId), [roomId]);
  React.useEffect(() => {
    if (!liveMode || !roomId) return undefined;
    let active = true;
    setLoadFailed(false);
    setLoadError(null);
    // 방이 바뀌면 커서도 처음부터다.
    setOlderCursor(null);
    setHasOlder(false);
    setOlderError('');
    setOlderRetryable(true);
    prependAnchorRef.current = null;
    stickToBottomRef.current = true;
    didInitialBottomRef.current = false;
    newestMessageIdRef.current = null;
    window.MoyeoApi.roomDetail(roomId)
      .then((result) => { if (active && result?.roomId != null) setRoom(result); })
      .catch((error) => { if (active) { setLoadFailed(true); setLoadError((current) => current || error); } });
    window.MoyeoApi.roomMembers(roomId)
      .then((result) => { if (active && Array.isArray(result?.members)) setMemberList(result); })
      .catch((error) => { if (active) { setLoadFailed(true); setLoadError((current) => current || error); } });
    window.MoyeoApi.roomMessages(roomId, { limit: CHAT_PAGE_SIZE })
      .then((result) => {
        if (!active || !Array.isArray(result?.messages)) return;
        setMessages(result.messages);
        // 서버가 「더 있다」고 할 때만 위로 올릴 길을 연다.
        setOlderCursor(result.nextId ?? null);
        setHasOlder(Boolean(result.hasNext) && result.nextId != null);
      })
      .catch((error) => { if (active) { setLoadFailed(true); setLoadError((current) => current || error); } });
    window.MoyeoApi.roomNotices(roomId)
      .then((result) => { if (active && Array.isArray(result?.pinnedNotices)) setNotices(result); })
      .catch(() => { /* 403(미참여) 이면 목데이터 유지 */ });
    window.MoyeoApi.roomCourse(roomId)
      .then((result) => { if (active && result?.course) setCourse(result.course); })
      .catch(() => { /* 코스가 없으면 코스 줄을 숨긴다 */ });
    window.MoyeoApi.roomRoadmap(roomId)
      .then((result) => { if (active) setRoadmap(result?.active && (result.places || []).length ? result : null); })
      .catch(() => { if (active) setRoadmap(null); });
    return () => { active = false; };
  }, [liveMode, roomId, reloadKey]);

  // ── 화면을 열어 둔 동안의 수신 (QA CHAT-013 · CHAT-014) ──
  // 예전에는 마운트 효과 한 번이 전부라, 채팅방을 켜 두고 있어도 **상대 메시지가 영영 안 보였다.**
  // 나가서 다시 들어와야 보였다.
  //
  // 2026-09-14 결정 ⑤: **STOMP 실시간으로 옮긴다.** 사용자 말 그대로 「당연히 실시간인 줄 알았어」다.
  //   구독  /topic/chat-rooms/{roomId}/messages
  //   인증  CONNECT 프레임의 네이티브 `Authorization: Bearer …` 헤더 (`src/stomp-client.js`)
  // 서버가 SUBSCRIBE 도 검사한다 — 참가자가 아닌 방은 거절된다.
  //
  // **폴링은 지우지 않았다.** 결정문대로 연결이 끊기거나 실패하면 폴링으로 떨어지고,
  // 붙으면 폴링을 멈춘다. 재연결은 stomp-client 가 지수 백오프로 한다.
  // 화면 복귀 때는 놓친 메시지를 조회 API 로 한 번 따라잡는다.
  const CHAT_POLL_MS = 5000;
  // 'connected' 면 실시간, 아니면 폴링이 돈다. 화면 아래 안내에도 쓴다 — 조용히 멈추지 않는다.
  const [realtimeStatus, setRealtimeStatus] = React.useState('idle');
  // 폴링·실시간이 함께 쓰는 「목록 갈아끼우기」. 같은 끝 메시지면 state 를 건드리지 않는다(스크롤 안 튀게).
  const applyServerMessages = React.useCallback((incoming) => {
    if (!Array.isArray(incoming)) return;
    // 위로 올려 이어 붙인 지난 묶음을 지우지 않는다 (CHAT-015) — 받은 구간만 갈아 끼운다.
    setMessages((current) => mergeRecentChatMessages(current, incoming));
    // 새 메시지를 읽었으니 모임 목록의 안 읽음 배지도 더는 맞지 않는다 (QA MEET-006).
    window.MoyeoTabCache?.invalidate?.(window.MoyeoTabCache.ROOM_LIST_KEYS);
  }, []);
  const catchUpMessages = React.useCallback(() => {
    if (!roomId) return;
    window.MoyeoApi.roomMessages(roomId, { limit: CHAT_PAGE_SIZE })
      .then((result) => applyServerMessages(result?.messages))
      .catch(() => { /* 한 번 실패했다고 화면을 비우지 않는다 */ });
  }, [roomId, applyServerMessages]);

  // ── 위로 끝까지 올렸을 때 (CHAT-015) ──
  // 한 번에 한 묶음만 부른다. 실패하면 목록을 지우지 않고 「다시 시도」만 띄운다.
  const loadOlderMessages = React.useCallback(() => {
    if (!liveMode || !roomId || !hasOlder || loadingOlder || olderCursor == null) return;
    const node = messageScrollRef.current;
    prependAnchorRef.current = node ? { height: node.scrollHeight, top: node.scrollTop } : null;
    setLoadingOlder(true);
    setOlderError('');
    setOlderRetryable(true);
    window.MoyeoApi.roomMessages(roomId, { beforeMessageId: olderCursor, limit: CHAT_PAGE_SIZE })
      .then((result) => {
        const older = Array.isArray(result?.messages) ? result.messages : [];
        setMessages((current) => mergeOlderChatMessages(current, older));
        setOlderCursor(result?.nextId ?? null);
        setHasOlder(Boolean(result?.hasNext) && result?.nextId != null);
        setLoadingOlder(false);
      })
      .catch((error) => {
        // 위치 보정을 걸어 둔 채 실패하면 다음 갱신에서 엉뚱하게 튄다 — 걸어 둔 것을 거둔다.
        prependAnchorRef.current = null;
        // 결정 ⑩: 화면 문장은 클라이언트가 소유한다. 서버 문구를 그대로 올리지 않는다.
        setOlderError(window.screenErrorText(error, '이전 대화를 불러오지 못했어요.'));
        setOlderRetryable(window.errorAllowsRetry(error));
        setLoadingOlder(false);
      });
  }, [liveMode, roomId, hasOlder, loadingOlder, olderCursor]);

  // 목록이 바뀐 **직후·그려지기 전에** 스크롤을 맞춘다 (`useLayoutEffect` — 튐이 눈에 보이지 않게).
  React.useLayoutEffect(() => {
    const node = messageScrollRef.current;
    if (!node) return;
    const anchor = prependAnchorRef.current;
    if (anchor) {
      prependAnchorRef.current = null;
      // 늘어난 높이만큼 내려 준다 = 보고 있던 줄이 제자리에 남는다.
      node.scrollTop = node.scrollHeight - anchor.height + anchor.top;
      return;
    }
    if (!messages || messages.length === 0) return;
    // 들어오면 최근 대화부터 본다(채팅의 기본). 그 뒤에는 맨 아래에 있을 때만 따라 내려간다.
    const newest = chatMessageIdValue(messages[messages.length - 1]);
    const previousNewest = newestMessageIdRef.current;
    newestMessageIdRef.current = newest;
    if (!didInitialBottomRef.current) {
      didInitialBottomRef.current = true;
      node.scrollTop = node.scrollHeight;
      return;
    }
    // 가장 새 메시지가 그대로면 새로 온 것이 없다 — 화면을 건드리지 않는다.
    if (newest == null || previousNewest == null || newest <= previousNewest) return;
    if (stickToBottomRef.current) node.scrollTop = node.scrollHeight;
    // `room`·`memberList` 도 본다 — 셋이 다 와야 목록이 그려지므로, 메시지가 먼저 와 있던
    // 경우에는 **여기가 붙는 순간**이 첫 렌더다. 메시지만 보면 그 순간을 놓쳐 맨 위에서 열렸다.
  }, [messages, room, memberList]);

  // 첫 묶음이 화면을 다 채우지 못하면 스크롤 이벤트가 영영 안 온다 — 그때는 바로 다음 묶음을 부른다.
  React.useEffect(() => {
    const node = messageScrollRef.current;
    if (!node || !hasOlder || loadingOlder || olderError) return;
    if (node.scrollHeight <= node.clientHeight) loadOlderMessages();
  }, [messages, hasOlder, loadingOlder, olderError, loadOlderMessages]);

  const onMessageScroll = (event) => {
    const node = event.currentTarget;
    stickToBottomRef.current = node.scrollHeight - node.scrollTop - node.clientHeight < CHAT_OLDER_TRIGGER_PX;
    if (olderError) return;
    if (node.scrollTop <= CHAT_OLDER_TRIGGER_PX) loadOlderMessages();
  };

  // ① STOMP 구독
  React.useEffect(() => {
    if (!liveMode || !roomId || !window.MoyeoStomp) { setRealtimeStatus('idle'); return undefined; }
    let active = true;
    const offStatus = window.MoyeoStomp.onStatus((status) => { if (active) setRealtimeStatus(status); });
    const unsubscribe = window.MoyeoStomp.subscribe(`/topic/chat-rooms/${roomId}/messages`, (payload) => {
      if (!active) return;
      // 서버가 보내는 것은 이 방의 메시지 하나다. id 가 같은 것이 이미 있으면 덧붙이지 않는다
      // (내가 보낸 메시지는 POST 응답으로 이미 목록에 들어가 있다).
      const messageId = payload?.messageId;
      if (messageId == null) { catchUpMessages(); return; }
      setMessages((current) => {
        const list = current || [];
        if (list.some((item) => String(item?.messageId) === String(messageId))) return list;
        return [...list, payload];
      });
      window.MoyeoTabCache?.invalidate?.(window.MoyeoTabCache.ROOM_LIST_KEYS);
    });
    return () => { active = false; offStatus(); unsubscribe(); };
  }, [liveMode, roomId, catchUpMessages]);

  // ② 폴백 폴링 — **실시간이 붙어 있지 않을 때만** 돈다.
  // 규칙은 그대로다: 탭이 보일 때만 돌고, 돌아오면 즉시 한 번 당긴다.
  React.useEffect(() => {
    if (!liveMode || !roomId) return undefined;
    if (realtimeStatus === 'connected') return undefined;
    let active = true;
    let timer = null;
    const pull = () => { if (active && !document.hidden) catchUpMessages(); };
    const start = () => { if (timer == null) timer = window.setInterval(pull, CHAT_POLL_MS); };
    const stop = () => { if (timer != null) { window.clearInterval(timer); timer = null; } };
    const onVisibility = () => { if (document.hidden) stop(); else { pull(); start(); } };
    document.addEventListener('visibilitychange', onVisibility);
    if (!document.hidden) start();
    return () => { active = false; stop(); document.removeEventListener('visibilitychange', onVisibility); };
  }, [liveMode, roomId, realtimeStatus, catchUpMessages]);

  // ③ 화면 복귀 따라잡기 — 실시간이든 아니든, 숨어 있는 동안 놓친 것을 한 번 받아온다.
  React.useEffect(() => {
    if (!liveMode || !roomId) return undefined;
    const onVisibility = () => {
      if (document.hidden) return;
      window.MoyeoStomp?.reconnectNow?.();
      catchUpMessages();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [liveMode, roomId, catchUpMessages]);

  // 방에 들어온 순간 그 방의 안 읽음 수는 0 이 된다 — 목록 캐시를 덜어내 재진입 시 배지가 맞게 한다.
  // 예전에는 무효화 지점이 생성·신청·나가기뿐이라, 채팅을 읽고 나와도 **60초 동안** 배지가
  // 옛 숫자 그대로였다 (QA MEET-006).
  React.useEffect(() => {
    if (!liveMode || !roomId) return;
    window.MoyeoTabCache?.invalidate?.(window.MoyeoTabCache.ROOM_LIST_KEYS);
  }, [liveMode, roomId]);

  const serverMode = Boolean(room && memberList && messages);
  // 성공한 머리말만 남긴다 — 다음에 연결이 끊겼을 때 어느 방인지 알아볼 수 있게.
  React.useEffect(() => {
    if (!serverMode) return;
    writeChatRoomHeaderCache(roomId, {
      title: room.title,
      participantCount: memberList.participantCount,
      maxParticipants: memberList.maxParticipants,
    });
  }, [serverMode, roomId, room, memberList]);
  // TAB-STATE-CANON R6: 내 신원은 액세스 토큰에서 즉시 읽는다.
  // 예전에는 멤버 목록 응답의 me 플래그로 판정해서, 그 응답이 오기 전까지
  // 내가 보낸 메시지가 전부 남의 것처럼 왼쪽에 그려졌다가 오른쪽으로 튀었다.
  // 멤버 목록은 닉네임·프로필 이미지처럼 그 목록에만 있는 값에만 계속 쓴다.
  const [sending, setSending] = React.useState(false);
  const [sendError, setSendError] = React.useState('');
  // 정산 카드에서 고른 신고 대상 메시지. null 이면 시트가 닫혀 있다.
  const [settlementReportTarget, setSettlementReportTarget] = React.useState(null);
  const sendServerMessage = async () => {
    const sent = draft;
    const content = sent.trim();
    if (!content || sending) return;
    setSending(true);
    setSendError('');
    try {
      const created = await window.MoyeoApi.sendRoomMessage(roomId, content);
      // 보내는 동안 사용자가 다음 문장을 치고 있을 수 있다. 무조건 비우면 **그 글자가 사라진다**
      // (QA CHAT-012). 보낸 그 문장이 그대로 남아 있을 때만 비운다.
      setDraft((current) => (current === sent ? '' : current));
      // 응답이 생성된 메시지를 그대로 돌려주므로 목록 끝에 붙인다.
      if (created?.messageId != null) setMessages((current) => [...(current || []), created]);
      else applyServerMessages((await window.MoyeoApi.roomMessages(roomId, { limit: CHAT_PAGE_SIZE }))?.messages || []);
    } catch (error) {
      setSendError(window.userFacingError(error, '메시지를 보내지 못했어요.'));
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
      setSendError('');
    } catch (error) {
      // 실패를 카드만 그대로 두고 넘어가면 「눌렸는데 반영이 안 된다」로 읽힌다 (W-43).
      setSendError(window.userFacingError(error, '투표를 반영하지 못했어요.'));
    }
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
              {/* roomId·mine 은 정산 카드의 신고 진입점이 쓴다 — 21 견본 화면에는 방이 없어
                  기본값(null·false)으로 두고, 거기서는 신고 버튼이 그려지지 않는다. */}
              <SpecialMessageCard message={message} voting={votingMessageId === message.messageId} onVote={voteOnPoll} roomId={roomId} mine={me} onReport={setSettlementReportTarget}/>
            </div>
            {time && <div style={{ fontSize: 10, color: T.text400, flexShrink: 0 }}>{time}</div>}
            {/* 내가 보낸 메시지를 지울 길이 화면에 없었다 — 20-6(`message-delete`) 화면은
                완성돼 있는데 `nav.go('message-delete')` 호출부가 0건이었다 (W-37). */}
            {me && room?.status !== 'CANCELLED' && message.content !== '삭제된 메시지입니다' && (
              <button
                type="button"
                data-testid={`chat-message-delete-${message.messageId}`}
                onClick={() => nav.go('message-delete', { params: { messageId: message.messageId } })}
                style={{ border: 0, background: 'transparent', padding: 0, flexShrink: 0, cursor: 'pointer', fontSize: 10, fontWeight: 800, color: T.text400, fontFamily: T.fontStack }}>삭제</button>
            )}
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
    // 서버는 `ChatRoom.canChat()` = `chatClosedDateTime == null && status != CANCELLED` 일 때만
    // 메시지를 받는다(`entity/chat/ChatRoom.kt:238`). 상세 응답(`ChatRoomDetailResponse`)에는
    // `chatClosedDateTime` 이 없어 **CANCELLED 만** 화면에서 알 수 있다 — 그 절반은 여기서 막는다.
    // 예전에는 입력칸·첨부·전송이 모두 살아 있다가 보낸 뒤에야 서버 원문 오류가 떴다 (W-112 · 안드 AND-115).
    const cancelled = room.status === 'CANCELLED';
    return (
      <div data-testid="chat-room-live" style={{ height: '100%', background: RF.bg, paddingTop: 46, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <Header title={room.title} left center onBack={nav.back} right={<IconButton name="more" ariaLabel="모임 메뉴" testId="chat-menu-open" onClick={() => nav.go('chat-menu')}/>}/>
        <div style={{ flexShrink: 0, textAlign: 'center', fontSize: 12, color: T.text500, lineHeight: '18px', paddingBottom: 10, borderBottom: `1px solid ${RF.softLine}`, fontVariantNumeric: 'tabular-nums' }}>
          {memberList.participantCount}/{memberList.maxParticipants}명 · {window.MoyeoApi.formatDate(room.startDate)}
          {dayTripTime ? ` ${dayTripTime}` : ''} · {window.MoyeoApi.tripTypeLabel(room)}
          {/* 불발된 방에 「마감 D-11」이 남으면 모집 중인 방과 구분되지 않는다 (W-112). */}
          {cancelled
            ? <> · <b style={{ color: T.dangerText }}>불발된 모임</b></>
            : room.recruitmentDDay != null && <> · <b style={{ color: T.accent500 }}>마감 D-{room.recruitmentDDay}</b></>}
        </div>
        {conditions.length > 0 && (
          <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', gap: 6, padding: '7px 12px', borderBottom: `1px solid ${RF.softLine}`, background: RF.card }}>
            {conditions.map((condition) => <Chip key={condition} variant="neutral">{condition}</Chip>)}
          </div>
        )}
        {/* 오늘의 로드맵 띠 → 20-5 여행 일정. **웹에만 이 띠가 없었다** —
            그래서 20-5 로 가는 길이 「여행이 확정됐어요」 축하 화면 하나뿐이었고,
            한 번 지나가면 다시 열 수 없었다. iOS `chat.roadmap`·안드 `chat-roadmap` 과
            같은 자리(머리말 아래 · 고정 공지 위)·같은 문구·같은 셰브런을 쓴다. */}
        {roadmap && (() => {
          const places = roadmap.places || [];
          const done = places.filter((place) => place.progress === 'COMPLETED').length;
          const current = roadmap.currentPlace || places.find((place) => place.progress === 'CURRENT') || null;
          const next = roadmap.nextPlace || places.find((place) => place.progress === 'UPCOMING') || null;
          const headline = [
            roadmap.dayNumber != null ? `${roadmap.dayNumber}/${roadmap.totalDays}일차` : null,
            `방문지 ${done}/${places.length}`,
            current?.title || null,
          ].filter(Boolean).join(' · ');
          return (
            <button
              type="button"
              data-testid="chat-roadmap"
              aria-label={`오늘의 여행 일정 보기. ${headline}`}
              onClick={() => nav.go('trip-day')}
              style={{ flexShrink: 0, width: '100%', border: 'none', borderBottom: `1px solid ${T.primary100}`, cursor: 'pointer', background: T.primary50, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, fontFamily: T.fontStack, textAlign: 'left' }}>
              <Icon name="pin" size={15} color={T.primary700}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: T.primary700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{headline}</div>
                <div style={{ fontSize: 10.5, color: T.primary600, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{next ? `다음 ${next.title}` : '오늘의 일정 보기'}</div>
              </div>
              {/* 눌리는 띠라는 것이 보여야 한다 — 네이티브의 chevron 과 같은 자리다. */}
              <Icon name="arrow" size={14} color={T.primary600}/>
            </button>
          );
        })()}
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
        <div ref={messageScrollRef} onScroll={onMessageScroll} data-testid="chat-message-scroll" style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '18px 18px 12px', background: RF.bg }}>
          {messages.length === 0 && (
            <div style={{ padding: '48px 0', textAlign: 'center', fontSize: 13, color: T.text500 }}>아직 대화가 없어요.</div>
          )}
          {/* 위 끝 — 더 오래된 대화가 있는지·불러오는 중인지·못 불러왔는지를 여기서만 말한다 (CHAT-015). */}
          {olderError
            ? (
              <div data-testid="chat-older-error" style={{ padding: '4px 0 14px', textAlign: 'center' }}>
                <div role="alert" style={{ fontSize: 11.5, color: T.danger, marginBottom: 7 }}>{olderError}</div>
                {olderRetryable && (
                  <button
                    type="button"
                    data-testid="chat-older-retry"
                    onClick={() => { setOlderError(''); loadOlderMessages(); }}
                    style={{ height: 32, padding: '0 14px', borderRadius: 10, border: `1px solid ${RF.softLine}`, background: RF.card, color: T.primary600, fontSize: 12, fontWeight: 800, fontFamily: T.fontStack, cursor: 'pointer' }}>다시 시도</button>
                )}
              </div>
            )
            : (hasOlder || loadingOlder) && (
              <div role="status" data-testid="chat-older-loading" style={{ padding: '2px 0 14px', textAlign: 'center', fontSize: 11.5, color: T.text500 }}>
                {loadingOlder ? '이전 대화를 불러오는 중...' : '위로 올리면 이전 대화를 더 볼 수 있어요.'}
              </div>
            )}
          {/* 서버가 끝이라고 한 뒤에만 「여기가 처음」이라고 적는다 — 추측으로 적지 않는다. */}
          {!hasOlder && !loadingOlder && !olderError && messages.length >= CHAT_PAGE_SIZE && (
            <div data-testid="chat-older-end" style={{ padding: '2px 0 14px', textAlign: 'center', fontSize: 11.5, color: T.text400 }}>대화의 처음이에요.</div>
          )}
          {/* 날짜 구분선이 없어 어제 온 메시지와 오늘 온 메시지가 'HH:MM' 만으로 나란히 보였다 (W-38).
              날이 바뀌는 자리에만 한 줄을 넣는다 — iOS·안드로이드 채팅과 같은 모양이다. */}
          {messages.map((message, index) => {
            const dayKey = window.MoyeoApi.chatDayKey(message.createdAt);
            const previousKey = index > 0 ? window.MoyeoApi.chatDayKey(messages[index - 1].createdAt) : '';
            const bubble = message.type === 'SYSTEM'
              ? <SystemMessageNote key={message.messageId} message={message}/>
              : <ServerBubble key={message.messageId} message={message}/>;
            if (!dayKey || dayKey === previousKey) return bubble;
            return (
              <React.Fragment key={`day-${message.messageId}`}>
                <div data-testid="chat-day-divider" style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0 16px' }}>
                  <span style={{ flex: 1, height: 1, background: RF.softLine }}/>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text500 }}>{window.MoyeoApi.formatChatDay(message.createdAt)}</span>
                  <span style={{ flex: 1, height: 1, background: RF.softLine }}/>
                </div>
                {bubble}
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ flexShrink: 0, padding: '10px 14px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}` }}>
          {sendError && <div role="alert" style={{ fontSize: 11.5, color: T.danger, marginBottom: 7 }}>{sendError}</div>}
          {/* 결정 ⑤: 실시간이 끊겼을 때 **조용히 멈추지 않는다.** 폴백 폴링이 돌고 있으니
              「안 된다」가 아니라 「느려질 수 있다」로 적는다. 붙어 있을 때는 아무 말도 하지 않는다. */}
          {serverMode && realtimeStatus === 'waiting' && (
            <div role="status" data-testid="chat-realtime-offline" style={{ fontSize: 11.5, color: T.warningText, marginBottom: 7 }}>
              실시간 연결이 끊겼어요. 다시 연결하는 동안에는 새 메시지가 조금 늦게 보일 수 있어요.
            </div>
          )}
          {/* 왜 못 쓰는지 **미리** 알린다. 14일은 서버가 불발 시 잡는 보관 기한이다
              (`ChatRoom.kt:172` `deletionScheduledDate = now.plusDays(14)`). */}
          {cancelled && (
            <div role="status" data-testid="chat-closed-note" style={{ fontSize: 11.5, color: T.text500, marginBottom: 7, lineHeight: '17px' }}>
              불발된 모임이라 새 글은 쓸 수 없어요. 지난 대화는 14일 동안 볼 수 있어요.
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* 첨부 진입 — 20-2 시트가 사진·장소·지도 공유를 실제로 보낸다 */}
            <button type="button" data-testid="chat-attach" disabled={cancelled} onClick={cancelled ? undefined : () => nav.go('chat-attach')} style={{ width: 38, height: 38, borderRadius: 999, border: `1px solid ${RF.softLine}`, background: cancelled ? T.bgSubtle : RF.card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: cancelled ? 'not-allowed' : 'pointer', flexShrink: 0 }} aria-label="첨부">
              <Icon name="plus" size={18} color={cancelled ? T.text400 : T.text700}/>
            </button>
            <Composer value={draft} onChange={setDraft} onSend={sendServerMessage} readOnly={cancelled} placeholder={cancelled ? '불발된 모임이에요' : (sending ? '보내는 중...' : '메시지 입력')} testId="chat-composer"/>
          </div>
        </div>
        {/* 정산 카드의 「금액이 부당해요 · 신고하기」에서 열린다 — 시트는 방 전체를 덮어야 해서
            카드 안이 아니라 여기(위치 기준이 되는 방 컨테이너)에 그린다. */}
        {settlementReportTarget && (
          <SettlementReportSheet
            roomId={roomId}
            memberId={settlementReportTarget.senderId}
            memberName={settlementReportTarget.senderNickname}
            onClose={() => setSettlementReportTarget(null)}
          />
        )}
      </div>
    );
  }
  // 서버 채팅방을 못 받으면 예시 대화·공지·경로를 그리지 않는다.
  // 다만 **어느 방인지는 알려준다** — 마지막으로 성공한 제목·인원이 있으면 그것으로 헤더를 채운다 (W-99).
  const offlineHeader = loadFailed ? cachedHeader : null;
  // 403 은 「볼 권한이 없다」다 — 다시 시도를 두지 않는다. 그 밖의 실패(연결 끊김·500·점검)는
  // 돌아오면 볼 수 있으므로 다시 시도를 준다. 둘을 한 문구로 뭉개지 않는다.
  const chatForbidden = loadFailed && loadError?.status === 403;
  const chatRetryable = loadFailed && window.errorAllowsRetry(loadError);
  const chatFailureText = chatForbidden
    ? '이 모임의 대화를 볼 수 없어요. 참여 중인 모임인지 확인해 주세요.'
    : window.screenErrorText(loadError, '대화를 불러오지 못했어요. 연결되면 지난 대화를 보여드려요.');
  return (
      <div data-testid="chat-room-unavailable" style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title={offlineHeader?.title || ''} left center onBack={nav.back}/>
        {offlineHeader?.participantCount != null && (
          <div style={{ textAlign: 'center', fontSize: 12, color: T.text500, lineHeight: '18px', paddingBottom: 10, borderBottom: `1px solid ${RF.softLine}`, fontVariantNumeric: 'tabular-nums' }}>
            {offlineHeader.participantCount}{offlineHeader.maxParticipants != null ? `/${offlineHeader.maxParticipants}` : ''}명
          </div>
        )}
        <div role="status" data-testid="chat-room-unavailable-text" style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13, lineHeight: '21px' }}>
          {!liveMode
            ? '로그인하면 모집 중인 모임을 볼 수 있어요.'
            : (loadFailed ? chatFailureText : '참여 중인 모임이 없어요.')}
        </div>
        {liveMode && chatRetryable && (
          <div style={{ textAlign: 'center' }}>
            <button type="button" data-testid="chat-room-retry" onClick={() => setReloadKey((value) => value + 1)} style={{ height: 42, padding: '0 18px', borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card, color: T.primary600, fontSize: 13.5, fontWeight: 800, fontFamily: T.fontStack, cursor: 'pointer' }}>다시 시도</button>
          </div>
        )}
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
  // 로그인 상태에서는 GET /api/v1/feeds 로 목록을 대체한다 (발견=DISCOVER, 친구=FRIENDS).
  // 탭 라벨이 「팔로잉」이었는데 이 서비스에 팔로우 개념이 없다 — 친구 수락 기반이다 (W-104).
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
  // 진행 중 플래그가 없어 3연타면 요청 3건이 겹쳐 나갔다 (W-20). 같은 피드의 요청이
  // 끝나기 전에는 다시 보내지 않는다.
  const [likingFeedId, setLikingFeedId] = React.useState(null);
  // 좋아요 실패를 삼키면 **하트가 그대로**라 「안 눌렸다」로 읽히고, 사용자는 계속 누른다
  // (안드로이드가 목록·상세 둘 다 그랬다 · 교차 확인 2026-09-15). 성공한 뒤에만 하트를 바꾸고,
  // 실패하면 누른 그 카드 자리에 까닭을 남긴다. 결정 ⑩ — 문장은 클라이언트가 소유한다.
  const [likeError, setLikeError] = React.useState({});
  const likeServerFeed = async (event, feedId) => {
    event.stopPropagation();
    if (likingFeedId === feedId) return;
    setLikingFeedId(feedId);
    setLikeError((current) => ({ ...current, [feedId]: '' }));
    try {
      const result = await window.MoyeoApi.likeFeed(feedId);
      // R4: 이 화면이 바꾼 항목만 보관소에서 갈아끼운다 — 목록 전체를 다시 부르지 않는다.
      feedsData.replace((feeds) => (feeds || []).map((feed) => (
        feed.feedId === feedId ? { ...feed, liked: Boolean(result?.liked), likeCount: result?.likeCount ?? feed.likeCount } : feed
      )));
    } catch (error) {
      setLikeError((current) => ({ ...current, [feedId]: window.screenErrorText(error, '좋아요를 바꾸지 못했어요.') }));
    }
    setLikingFeedId(null);
  };
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${RF.softLine}`, gap: 42 }}>
          {[['FRIENDS', '친구'], ['DISCOVER', '발견']].map(([id, t]) => {
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
          <TabDataNotice status={feedsData.status} refreshFailed={feedsData.refreshFailed} error={feedsData.error} signedOut={!liveMode} onRetry={feedsData.reload} style={{ padding: '64px 20px', textAlign: 'center', fontSize: 13, lineHeight: '20px' }}/>
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
              {/* 예전에는 `slice(0, 2)` 로 앞 2장만 나란히 그렸다 — 3장 이상이면 목록에서 볼 길이 없었다.
                  이제 상세와 같은 페이저로 전부 넘겨 본다 (결정 ⑪ · FEED-PHOTO-CANON §2). */}
              {feed.images?.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <FeedCardPhotoPager images={feed.images} height={166} testId={`feed-post-${feed.feedId}-photos`}/>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, fontSize: 12, color: T.text700 }}>
                <button onClick={(event) => likeServerFeed(event, feed.feedId)} aria-label="좋아요" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: 'none', background: 'transparent', padding: 0, fontSize: 12, color: feed.liked ? T.accent500 : T.text700, fontFamily: T.fontStack, cursor: 'pointer' }}>
                  <Icon name="heart" size={17} color={feed.liked ? T.accent500 : T.text700}/>{feed.likeCount}
                </button>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="chat" size={17} color={T.text700}/>{feed.commentCount}</span>
              </div>
              {likeError[feed.feedId] && (
                <div role="alert" data-testid={`feed-post-${feed.feedId}-like-error`} style={{ fontSize: 11.5, color: T.danger, marginTop: 6, lineHeight: '17px' }}>{likeError[feed.feedId]}</div>
              )}
            </div>
          ))}
        </div>
        <BottomNav active="feed"/>
      </div>
    </Phone>
  );
}

/**
 * 22 피드 목록 · 26 내 피드 목록의 사진 영역 (FEED-PHOTO-CANON §2 · 2026-09-15 결정 ⑪).
 *
 * 예전에는 목록에서 **첫 장(또는 앞 2장)만** 그려서 나머지는 상세로 들어가야만 볼 수 있었다.
 * 「대표 사진」이라는 개념이 서버에 없으므로 첫 장이 대표인 것도 아니다 — 그냥 순서의 첫 장이다.
 * 그래서 상세(`FeedDetailPhotoPager`)와 **같은 규칙**으로 목록에서도 넘겨 본다.
 *
 * - 좌우 스크롤 스냅으로 넘긴다. 첫 장부터 시작한다.
 * - 배지는 `현재 / 전체` 이고 **2장 이상일 때만** 그린다 — 넘길 것이 없는데 넘기는 모양을 주지 않는다.
 * - 카드 탭(상세 진입)과 목록 세로 스크롤을 잡아먹지 않는다: 가로 스크롤은 브라우저 기본 동작이라
 *   세로 제스처는 그대로 목록으로 가고, 클릭은 카드의 onClick 으로 그대로 올라간다.
 *   상세처럼 눌러서 크게 보는 동작은 **두지 않는다** — 목록에서 누르면 상세로 가야 한다.
 */
function FeedCardPhotoPager({ images, height = 166, radius = 10, testId }) {
  const [index, setIndex] = React.useState(0);
  const trackRef = React.useRef(null);
  const onScroll = () => {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };
  if (!images || images.length === 0) return null;
  const multiple = images.length > 1;
  return (
    <div data-testid={testId} style={{ position: 'relative', borderRadius: radius, overflow: 'hidden' }}>
      <div
        ref={trackRef}
        onScroll={multiple ? onScroll : undefined}
        style={{
          display: 'flex',
          overflowX: multiple ? 'auto' : 'hidden',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {images.map((image, i) => (
          <img
            key={image.imageId ?? i}
            src={image.imageUrl}
            alt=""
            loading={i === 0 ? 'eager' : 'lazy'}
            style={{ flex: '0 0 100%', scrollSnapAlign: 'start', display: 'block', width: '100%', height, objectFit: 'cover', background: T.primary50 }}
          />
        ))}
      </div>
      {multiple && (
        <span data-testid={testId ? `${testId}-count` : undefined} style={{ position: 'absolute', right: 8, bottom: 8, background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: 999, padding: '4px 7px', fontSize: 10, fontWeight: 900 }}>
          {index + 1}/{images.length}
        </span>
      )}
    </div>
  );
}

// 23 첫 화면에 보여줄 최상위 댓글 수. 세 플랫폼이 같은 3건이다 (PDF-REVIEW-2026-08-31 §F3).
const FEED_DETAIL_COMMENT_PREVIEW = 3;
// 최상위 댓글 하나에 딸려 그리는 대댓글 수. 넘으면 `답글 N개 더 보기` 로 접는다
// (정본 FEED-COMMENT-PREVIEW-CANON · 2026-09-14). 세 플랫폼이 같은 2건이다.
const FEED_DETAIL_REPLY_PREVIEW = 2;

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
                          onToggleLike = null, likeError = '', commentPreview = null }) {
  // 「방문지 N곳」으로 14 코스 상세에 다녀오면 라우터가 이 화면을 통째로 다시 만든다 —
  // 스크롤은 맨 위로 돌아가고, 사용자는 눌렀던 자리를 다시 찾아 내려가야 한다.
  // 탭 화면들이 쓰는 같은 보관소에 피드마다 따로 담아 둔다 (TAB-STATE-CANON R3).
  const bodyScroll = window.useTabScroll(`feed.detail:${feed?.feedId ?? ''}`);
  return (
          <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
            {/* 32 신고 진입점은 **헤더의 `...` 하나다** — 기획·iOS·안드로이드가 모두 그렇다
                (안드 `feed-detail-report` = `MoreHoriz`, iOS `feed.detail.more`).
                웹만 작성자 줄의 깃발을 쓰고 있어 표면이 갈렸다. 헤더로 맞추고 깃발은 뺀다.
                **자기 피드에는 신고를 두지 않는다** — 서버가 400 `40039` 로 거절한다.
                대신 자기 피드에서는 같은 `...` 자리가 23-2 내 피드 액션(수정·삭제)을 연다.
                23-2·23-3·24-7 화면은 이미 만들어져 있었는데 **들어갈 길이 한 군데도 없어서**
                자기가 쓴 기록을 웹에서는 고치지도 지우지도 못했다 (QA FEED-027~033). */}
            <Header
              title=""
              left
              onBack={nav.back}
              right={feed?.author?.userId == null
                ? undefined
                : (String(feed.author.userId) === String(window.MoyeoApi?.myUserId?.() ?? '')
                  ? <IconButton name="more" ariaLabel="수정 · 삭제" testId="feed-detail-actions" onClick={() => nav.go && nav.go('feed-actions')}/>
                  : <IconButton name="more" ariaLabel="신고" testId="feed-detail-report" onClick={() => nav.go && nav.go('report')}/>)}
            />
            <div ref={bodyScroll.ref} onScroll={bodyScroll.onScroll} data-testid="feed-detail-scroll" style={{ height: 'calc(100% - 98px)', overflow: 'auto', padding: '0 18px 84px' }}>
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
              {/* 「방문지 N곳」은 **누를 수 있는 자리**다 (정본 FEED-COMMENT-PREVIEW-CANON 보충 ·
                  2026-09-14). 눌러 14 코스 상세로 가면 지도와 방문지 순서가 보인다.
                  `feed.trip.courseId` 가 이미 응답에 있어 추가 API 가 필요 없다.
                  **courseId 가 없으면 누를 수 있는 모양을 주지 않는다** — 식별자 없이 눌리는
                  자리를 만들지 않는다(코스 상세 작성자 줄에서 이미 같은 판단을 했다 · BE-29). */}
              {feed.trip?.places?.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 16 }}>
                  {feed.trip.courseId != null ? (
                    <button
                      type="button"
                      data-testid="feed-detail-places"
                      aria-label={`방문지 ${feed.trip.places.length}곳 · 코스 상세 보기`}
                      onClick={() => { window.MoyeoApi.selectCourse(feed.trip.courseId); nav.go && nav.go('course'); }}
                      style={{ borderRadius: 10, background: RF.subtle, border: `1px solid ${RF.softLine}`, padding: '12px 6px', textAlign: 'center', cursor: 'pointer', fontFamily: T.fontStack, color: T.text900 }}>
                      <div style={{ fontSize: 10, color: T.text500 }}>방문지</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, marginTop: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 900 }}>{feed.trip.places.length}곳</span>
                        <Icon name="arrow" size={13} color={T.text400}/>
                      </div>
                    </button>
                  ) : (
                    <div data-testid="feed-detail-places" style={{ borderRadius: 10, background: RF.subtle, padding: '12px 6px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: T.text500 }}>방문지</div>
                      <div style={{ fontSize: 13, fontWeight: 900, marginTop: 5 }}>{feed.trip.places.length}곳</div>
                    </div>
                  )}
                </div>
              )}
              {/* 「좋아요 N개 · 댓글 N개」는 **개수 표시만** 한다 — 진입 기능을 뺐다(정본 §규칙).
                  같은 기능을 위아래 두 군데 두지 않는다. 들어가는 길은 댓글 **아래** 한 줄이다. */}
              <div style={{ display: 'flex', gap: 18, marginTop: 18, paddingBottom: 14, borderBottom: `1px solid ${RF.softLine}`, fontSize: 13, color: T.text700 }}>
                <span onClick={onToggleLike} style={{ cursor: 'pointer', color: feed.liked ? T.accent500 : T.text700 }}>좋아요 {feed.likeCount}개</span>
                <span data-testid="feed-detail-comment-count">댓글 {feed.commentCount}개</span>
              </div>
              {likeError && (
                <div role="alert" data-testid="feed-detail-like-error" style={{ fontSize: 11.5, color: T.danger, marginTop: 8, lineHeight: '17px' }}>{likeError}</div>
              )}
              {/* 최상위 댓글 3건 + 각 댓글의 대댓글 2건까지. `replies` 는 이미 응답에 들어 있어
                  추가 호출을 만들지 않는다. 2개를 넘으면 `답글 N개 더 보기` 로 접고, 눌러도
                  그 자리에서 펼치지 않고 23-1 전체 보기로 간다(정본 §규칙). */}
              {commentPreview && commentPreview.length > 0 && (
                <div data-testid="feed-detail-comment-preview">
                  {commentPreview.map((item) => {
                    const replies = Array.isArray(item.replies) ? item.replies : [];
                    const hiddenReplies = Math.max(0, replies.length - FEED_DETAIL_REPLY_PREVIEW);
                    return (
                      <div key={item.commentId} style={{ borderBottom: `1px solid ${RF.softLine}` }}>
                        <FeedCommentRow item={item}/>
                        {replies.slice(0, FEED_DETAIL_REPLY_PREVIEW).map((reply) => (
                          <FeedCommentRow key={reply.commentId} item={reply} reply/>
                        ))}
                        {hiddenReplies > 0 && (
                          <button
                            type="button"
                            data-testid={`feed-detail-more-replies-${item.commentId}`}
                            onClick={() => nav.go && nav.go('feed-comments')}
                            style={{ border: 0, background: 'transparent', padding: '0 0 12px 38px', cursor: 'pointer', fontFamily: T.fontStack, fontSize: 11.5, fontWeight: 800, color: T.text500 }}>
                            답글 {hiddenReplies}개 더 보기
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {/* 진입 줄은 여기 하나뿐이다. **댓글이 몇 개든 항상 그린다** — 최상위 3개 이하라도
                  대댓글이 숨어 있을 수 있어 「3개 이하면 감추자」는 폐기된 안이다(정본).
                  0개일 때만 빼고 그 자리에 `첫 댓글을 남겨보세요.` 를 둔다. */}
              {feed.commentCount > 0 ? (
                <button
                  type="button"
                  data-testid="feed-comments-open"
                  onClick={() => nav.go && nav.go('feed-comments')}
                  style={{ display: 'block', width: '100%', marginTop: 14, padding: '12px 0', border: 0, background: 'transparent', textAlign: 'center', cursor: 'pointer', fontFamily: T.fontStack, fontSize: 12.5, fontWeight: 800, color: T.primary600 }}>
                  댓글 {feed.commentCount}개 전체 보기 →
                </button>
              ) : (
                <div data-testid="feed-detail-comment-empty" style={{ marginTop: 14, padding: '12px 0', textAlign: 'center', fontSize: 12.5, color: T.text500 }}>첫 댓글을 남겨보세요.</div>
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
  const [commentError, setCommentError] = React.useState('');
  // 로그인 상태 + 피드 목록에서 선택해 들어온 경우 GET feeds/{id} 로 대체한다.
  const liveMode = window.MoyeoApi?.live();
  const feedId = liveMode ? window.MoyeoApi.selectedFeedId() : null;
  const [feed, setFeed] = React.useState(null);
  // 404(지워진 피드)·403·500 을 「아직 올라온 피드가 없어요.」로 뭉개던 자리다 —
  // 목록에서 눌러 들어온 화면이라 「없다」는 말이 성립하지 않는다 (W-31).
  const [feedStatus, setFeedStatus] = React.useState('loading');
  const [feedReloadKey, setFeedReloadKey] = React.useState(0);
  React.useEffect(() => {
    if (!liveMode || !feedId) { setFeedStatus('no-target'); return undefined; }
    let active = true;
    setFeedStatus('loading');
    window.MoyeoApi.feedDetail(feedId)
      .then((result) => {
        if (!active) return;
        if (result?.feedId != null) { setFeed(result); setFeedStatus('ready'); }
        else setFeedStatus('gone');
      })
      .catch((error) => {
        if (!active) return;
        // 404 는 지워졌거나 볼 수 없는 글이다 — 통신 실패와 다르게 말한다.
        setFeedStatus(error?.status === 404 ? 'gone' : 'error');
      });
    return () => { active = false; };
  }, [liveMode, feedId, feedReloadKey]);
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
      setCommentError('');
    } catch (error) {
      // 입력만 남기고 아무 말도 하지 않으면 「전송 버튼이 죽었다」로 읽힌다 (W-43).
      setCommentError(window.userFacingError(error, '댓글을 남기지 못했어요.'));
    }
  };
  const [liking, setLiking] = React.useState(false);
  // 목록(22)과 **같은 규칙**이다 — 성공한 뒤에만 하트를 바꾸고, 실패하면 그 자리에 까닭을 적는다.
  // 「한 화면만 고쳐 놓는」 것이 안드로이드가 밟은 함정이라 두 표면을 함께 고친다.
  const [likeError, setLikeError] = React.useState('');
  const toggleServerLike = async () => {
    if (!feed || liking) return;
    setLiking(true);
    setLikeError('');
    try {
      const result = await window.MoyeoApi.likeFeed(feed.feedId);
      setFeed((current) => (current ? { ...current, liked: Boolean(result?.liked), likeCount: result?.likeCount ?? current.likeCount } : current));
    } catch (error) {
      setLikeError(window.screenErrorText(error, '좋아요를 바꾸지 못했어요.'));
    }
    setLiking(false);
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
          likeError={likeError}
          commentPreview={commentPreview}
          composer={(
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 16px 28px', borderTop: `1px solid ${RF.softLine}`, background: RF.card }}>
              {commentError && <div role="alert" data-testid="feed-detail-comment-error" style={{ fontSize: 11.5, color: T.danger, marginBottom: 7 }}>{commentError}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <Composer value={comment} onChange={setComment} onSend={sendComment} placeholder="댓글을 입력하세요..." fontSize={12} inputLabel="댓글 입력" limit={500} testId="feed-detail-composer"/>
              </div>
            </div>
          )}
        />
      </Phone>
    );
  }
  // 피드를 못 받으면 예시 글·사진·통계를 그리지 않는다.
  const feedNotice = !liveMode
    ? '로그인하면 모집 중인 모임을 볼 수 있어요.'
    : ({
      loading: '불러오는 중이에요…',
      gone: '지워졌거나 볼 수 없는 피드예요.',
      error: '피드를 불러오지 못했어요.',
    }[feedStatus] || '아직 올라온 피드가 없어요.');
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title={feedStatus === 'ready' ? '' : '피드'} left center onBack={nav.back}/>
        <div role={feedStatus === 'error' ? 'alert' : 'status'} data-testid="feed-detail-state" style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13, lineHeight: '21px' }}>
          {feedNotice}
        </div>
        {liveMode && feedStatus === 'error' && (
          <div style={{ textAlign: 'center' }}>
            <button type="button" data-testid="feed-detail-retry" onClick={() => setFeedReloadKey((key) => key + 1)} style={{ height: 42, padding: '0 18px', borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card, color: T.primary600, fontSize: 13.5, fontWeight: 800, fontFamily: T.fontStack, cursor: 'pointer' }}>다시 시도</button>
          </div>
        )}
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
          {/* 불발된 방도 `ended` 로 온다 — `ended` 만 보면 여행을 다녀온 방과 구분되지 않는다.
              `status` 를 먼저 본다(안드 `RoomCardDisplay.statusLabel` 과 같은 규칙 · iOS IOS-F130). */}
          {room.status === 'CANCELLED'
            ? <Chip variant="neutral">모집 취소</Chip>
            : room.ended ? <Chip variant="neutral">여행 종료</Chip> : null}
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
  // 네 표면이 **같은 순서**를 쓴다 (26, 사용자 지적 2026-09-09).
  // 예전 주석은 「찜한 모집은 내 여행 탭에 이미 있어서 뺐다」고 적었는데 **그 탭이 없다** —
  // `mySegments` 는 진행중·지난여행 둘뿐이고, `nav.go('favorite-rooms')` 호출부가 0건이라
  // 26-1 화면(완성돼 있다)이 어디서도 열리지 않았다 (W-03).
  const menuRows = [
    { icon: 'heart', title: '찜한 모집', subtitle: '하트를 누른 모집을 모아 봐요', route: 'favorite-rooms' },
    // 찜한 **코스**는 찜한 모집과 다른 것이다. 14 코스 상세에 찜 버튼이 생기면서(QA DETAIL-002)
    // 모아 보는 자리도 함께 열었다 — iOS·안드로이드에는 이미 둘 다 있었다 (QA MY-006).
    { icon: 'map', title: '찜한 코스', subtitle: '하트를 누른 코스를 모아 봐요', route: 'favorite-courses' },
    // 2026-09-14 서버가 `tab=MINE` 을 더해(BE-28) **내 글만** 받을 수 있게 됐다 —
    // 그동안 「내 피드」라 적고 피드 탭 전체로 보내던 것을 진짜 내 글 목록으로 바꾼다 (QA MY-010 · MY-011).
    { icon: 'feed', title: '내 피드', subtitle: '내가 남긴 여행 기록', route: 'my-feeds' },
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
            // 카드를 누르면 **내가 남들에게 어떻게 보이는지**(25 공개 프로필)를 연다 — 카드 모양 그대로다.
            // 고치는 길은 아래 메뉴의 「내 정보 수정」이 이미 맡고 있어, 카드까지 수정으로 보내면
            // 25 로 가는 길이 어디에도 없었다 (QA MY-001).
            // 예전 주석은 「GET /users/me/profile 응답에 userId 가 없다」였는데 **지금은 온다**
            // (실서버 확인 2026-09-14 · `userId: 121`), 그래서 막을 이유가 사라졌다.
            // userId 를 아직 못 읽었으면 예전처럼 수정으로 보낸다 — 빈 화면을 열지 않는다.
            // 로그아웃 상태에서는 **빈 프로필 수정**이 열렸다 — 고칠 프로필이 없다 (W-42).
            onClick={() => {
              if (!liveMode) { nav.go('login'); return; }
              if (myUserId != null) nav.go('public-profile', { params: { userId: myUserId } });
              else nav.go('profile-edit');
            }}
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
          {/* 「지난여행」 탭에서 「참여 중인 모임이 없어요」는 탭 이름과 어긋난다 (W-44). */}
          {serverVisible && serverVisible.length === 0 && (
            <div style={{ padding: '36px 0', textAlign: 'center', color: T.text500, fontSize: 13 }}>
              {selectedSegment === '지난여행' ? '다녀온 여행이 아직 없어요.' : '참여 중인 모임이 없어요.'}
            </div>
          )}
          <TabDataNotice status={roomsData.status} refreshFailed={roomsData.refreshFailed} error={roomsData.error} signedOut={!liveMode} onRetry={roomsData.reload} style={{ padding: '36px 0', textAlign: 'center', fontSize: 13 }}/>
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
  FeedCardPhotoPager,
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
  SettlementReportSheet,
  ReportReasonSheet,
  COMMENT_REPORT_NOTICES,
  ROOM_REPORT_NOTICES,
  MEMBER_REPORT_NOTICES,
  REPORT_SUBMIT_FAILED,
  SystemMessageNote,
  isSpecialMessageCard,
  ScreenFeed,
  ScreenFeedDetail,
  ScreenMyPage,
});
