// Design tokens from 모여트립 in 경북 design system
const MOYEO_THEME_STORAGE_KEY = 'moyeo-trip-theme';

const MOYEO_THEME_CSS = `
:root,
:root[data-moyeo-theme="light"] {
  --moyeo-canvas-bg: #f0eee9;
  --moyeo-canvas-grid: rgba(0,0,0,0.06);
  --moyeo-canvas-title: rgba(40,30,20,0.85);
  --moyeo-canvas-subtitle: rgba(60,50,40,0.6);
  --moyeo-bg-base: #FFFFFF;
  --moyeo-bg-subtle: #F7F8F7;
  --moyeo-bg-raised: #FFFFFF;
  --moyeo-bg-elevated: #FFFFFF;
  --moyeo-line-100: #EEF0EE;
  --moyeo-line-200: #D9DDD9;
  --moyeo-line-300: #B5BCB5;
  --moyeo-text-900: #0F1714;
  --moyeo-text-700: #2F3A35;
  --moyeo-text-500: #5A6761;
  --moyeo-text-400: #8A948E;
  --moyeo-text-300: #B5BCB5;
  --moyeo-status: #111111;
  --moyeo-shadow-l1: 0 1px 2px rgba(15,23,20,0.04);
  --moyeo-shadow-l2: 0 2px 8px rgba(15,23,20,0.06);
  --moyeo-shadow-l3: 0 8px 24px rgba(15,23,20,0.10);
  --moyeo-chat-mine: #E5F4E8;
  --moyeo-map-green: #E4F0E7;
  --moyeo-map-water: #CFE2EA;
  --moyeo-splash-bg: #EFF8EF;
  --moyeo-splash-title: #105C3C;
  --moyeo-splash-subtitle: #0F4D36;
  --moyeo-splash-title-shadow: none;
  --moyeo-splash-overlay: linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 38%);
  --moyeo-weather-good-card: #2D8F5A;
  --moyeo-weather-caution-card: #B87726;
  --moyeo-weather-blocked-card: #355D5C;
  --moyeo-weather-good-pill-bg: rgba(255,255,255,0.92);
  --moyeo-weather-good-pill-fg: #155735;
  --moyeo-weather-caution-pill-bg: #FFF7E8;
  --moyeo-weather-caution-pill-fg: #87530D;
  --moyeo-weather-blocked-pill-bg: #EEF6F4;
  --moyeo-weather-blocked-pill-fg: #254C4B;
  --moyeo-google-button-bg: #FFFFFF;
  --moyeo-google-button-border: #747775;
  --moyeo-google-button-text: #1F1F1F;
  color-scheme: light;
}

:root[data-moyeo-theme="dark"] {
  --moyeo-canvas-bg: #111715;
  --moyeo-canvas-grid: rgba(255,255,255,0.055);
  --moyeo-canvas-title: rgba(245,248,245,0.92);
  --moyeo-canvas-subtitle: rgba(216,226,220,0.68);
  --moyeo-bg-base: #0D1411;
  --moyeo-bg-subtle: #141D19;
  --moyeo-bg-raised: #18231E;
  --moyeo-bg-elevated: #1F2B25;
  --moyeo-line-100: #24332D;
  --moyeo-line-200: #34453D;
  --moyeo-line-300: #506157;
  --moyeo-text-900: #F4F8F5;
  --moyeo-text-700: #D8E2DC;
  --moyeo-text-500: #A7B6AE;
  --moyeo-text-400: #7D8D85;
  --moyeo-text-300: #5F6F67;
  --moyeo-status: #F8FBF8;
  --moyeo-shadow-l1: 0 1px 2px rgba(0,0,0,0.28);
  --moyeo-shadow-l2: 0 8px 18px rgba(0,0,0,0.30);
  --moyeo-shadow-l3: 0 16px 38px rgba(0,0,0,0.38);
  --moyeo-chat-mine: #163B2A;
  --moyeo-map-green: #263B31;
  --moyeo-map-water: #203946;
  --moyeo-splash-bg: #071611;
  --moyeo-splash-title: #E8F7EC;
  --moyeo-splash-subtitle: #BFE8CD;
  --moyeo-splash-title-shadow: 0 2px 18px rgba(0,0,0,0.46);
  --moyeo-splash-overlay: linear-gradient(180deg, rgba(4,12,10,0.30) 0%, rgba(4,12,10,0.02) 42%, rgba(4,12,10,0.18) 100%);
  --moyeo-weather-good-card: #174C37;
  --moyeo-weather-caution-card: #65411B;
  --moyeo-weather-blocked-card: #243E43;
  --moyeo-weather-good-pill-bg: rgba(7,17,14,0.78);
  --moyeo-weather-good-pill-fg: #DCEFE3;
  --moyeo-weather-caution-pill-bg: rgba(38,26,11,0.82);
  --moyeo-weather-caution-pill-fg: #FFE3B2;
  --moyeo-weather-blocked-pill-bg: rgba(8,22,24,0.82);
  --moyeo-weather-blocked-pill-fg: #D7EFEB;
  --moyeo-google-button-bg: #131314;
  --moyeo-google-button-border: #8E918F;
  --moyeo-google-button-text: #E3E3E3;
  color-scheme: dark;
}

html, body {
  background: var(--moyeo-canvas-bg) !important;
  color: var(--moyeo-text-900);
}

.moyeo-theme-toggle {
  position: fixed;
  top: 18px;
  right: 22px;
  z-index: 9999;
  height: 40px;
  border-radius: 999px;
  border: 1px solid var(--moyeo-line-200);
  background: color-mix(in srgb, var(--moyeo-bg-raised) 92%, transparent);
  color: var(--moyeo-text-900);
  box-shadow: var(--moyeo-shadow-l2);
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  backdrop-filter: blur(12px);
}

.moyeo-theme-toggle:focus-visible {
  outline: 2px solid #2D8F5A;
  outline-offset: 3px;
}

.moyeo-theme-image {
  transition: opacity 180ms ease;
}

.moyeo-theme-image-light {
  opacity: 1;
}

.moyeo-theme-image-dark {
  opacity: 0;
}

:root[data-moyeo-theme="dark"] .moyeo-theme-image-light {
  opacity: 0;
}

:root[data-moyeo-theme="dark"] .moyeo-theme-image-dark {
  opacity: 1;
}

.moyeo-login-welcome-light {
  display: block;
}

.moyeo-login-welcome-dark {
  display: none;
}

:root[data-moyeo-theme="dark"] .moyeo-login-welcome-light {
  display: none;
}

:root[data-moyeo-theme="dark"] .moyeo-login-welcome-dark {
  display: block;
}
`;

if (typeof document !== 'undefined' && !document.getElementById('moyeo-theme-styles')) {
  const s = document.createElement('style');
  s.id = 'moyeo-theme-styles';
  s.textContent = MOYEO_THEME_CSS;
  document.head.appendChild(s);
}

function getInitialMoyeoThemeMode() {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage?.getItem(MOYEO_THEME_STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setMoyeoThemeMode(mode) {
  const next = mode === 'dark' ? 'dark' : 'light';
  if (typeof document !== 'undefined') document.documentElement.dataset.moyeoTheme = next;
  if (typeof window !== 'undefined') window.localStorage?.setItem(MOYEO_THEME_STORAGE_KEY, next);
}

const initialMoyeoThemeMode = getInitialMoyeoThemeMode();
setMoyeoThemeMode(initialMoyeoThemeMode);

const T = {
  // Brand Primary - 경북 포레스트
  primary50:  '#F0F8F4',
  primary100: '#DCEFE3',
  primary200: '#B4DDC3',
  primary300: '#7EC49B',
  primary400: '#4FAA74',
  primary500: '#2D8F5A',
  primary600: '#1F7346',
  primary700: '#155735',
  primary800: '#0D3C25',
  primary900: '#061E13',

  // Accent - 선셋 코랄
  accent100: '#FFE4DA',
  accent300: '#FFAE95',
  accent500: '#FF7550',
  accent700: '#B64227',

  // Semantic
  success: '#2D8F5A',
  warning: '#E8A547',
  warningBg: '#FFF1D6',
  warningText: '#A67318',
  danger: '#E85547',
  dangerBg: '#FFDDD8',
  dangerText: '#B73520',
  info: '#4A90E2',

  // Neutrals - Light
  bgBase: 'var(--moyeo-bg-base)',
  bgSubtle: 'var(--moyeo-bg-subtle)',
  bgRaised: 'var(--moyeo-bg-raised)',
  bgOverlay: 'rgba(15,23,20,0.48)',
  line100: 'var(--moyeo-line-100)',
  line200: 'var(--moyeo-line-200)',
  line300: 'var(--moyeo-line-300)',
  text900: 'var(--moyeo-text-900)',
  text700: 'var(--moyeo-text-700)',
  text500: 'var(--moyeo-text-500)',
  text400: 'var(--moyeo-text-400)',
  text300: 'var(--moyeo-text-300)',
  textInverse: '#FFFFFF',

  // Shadow — minimal, very subtle (design ref is mostly flat with line borders)
  l1: 'var(--moyeo-shadow-l1)',
  l2: 'var(--moyeo-shadow-l2)',
  l3: 'var(--moyeo-shadow-l3)',

  // Type
  fontStack: '"Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
};

// Phosphor-style icon set as tiny SVG strings
const Icon = ({ name, size = 24, color = 'currentColor', strokeWidth = 1.6 }) => {
  const paths = {
    back: <path d="M15 6l-6 6 6 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    search: <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></g>,
    bell: <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z"/><path d="M10 21a2 2 0 0 0 4 0"/></g>,
    chat: <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M4 11.5C4 7 7.6 4 12 4s8 3 8 7.5-3.6 7.5-8 7.5c-1 0-2-.2-2.9-.5L5 20l1-3.4c-1.2-1.4-2-3.1-2-5.1Z"/></g>,
    bookmark: <path d="M6 4h12v17l-6-4-6 4V4Z" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round"/>,
    map: <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6Z"/><path d="M9 4v16M15 6v16"/></g>,
    plus: <g stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"><path d="M12 5v14M5 12h14"/></g>,
    home: <path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-9Z" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round"/>,
    compass: <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="m9 15 1.5-4.5L15 9l-1.5 4.5L9 15Z"/></g>,
    users: <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M3 19a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14a5 5 0 0 1 5 5"/></g>,
    feed: <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M9 14h6"/></g>,
    user: <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round"><circle cx="12" cy="9" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></g>,
    check: <path d="m5 12 5 5 9-10" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>,
    star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6L12 17l-5.4 2.8 1-6L3.2 9.5l6.1-.9L12 3Z" fill={color} stroke="none"/>,
    sparkle: <g fill={color}><path d="M12 2l1.4 4.6L18 8l-4.6 1.4L12 14l-1.4-4.6L6 8l4.6-1.4L12 2Z"/><path d="M19 14l.7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z"/></g>,
    pin: <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round"><path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></g>,
    clock: <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></g>,
    calendar: <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></g>,
    phone: <path d="M7 4h4l1.2 4-2.2 1.3a12 12 0 0 0 4.7 4.7l1.3-2.2 4 1.2v4a2 2 0 0 1-2.2 2A15 15 0 0 1 5 6.2 2 2 0 0 1 7 4Z" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>,
    settings: <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-3v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L6.6 16.6l.1-.1A1.7 1.7 0 0 0 7 14.6a1.7 1.7 0 0 0-1.5-1H5v-3h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V4h3v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.1 2.1-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v3h-.2a1.7 1.7 0 0 0-1.2.6Z"/></g>,
    lock: <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></g>,
    share: <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8 11 8-4M8 13l8 4"/></g>,
    sun: <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"/></g>,
    refresh: <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></g>,
    heart: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" fill={color} stroke="none"/>,
    arrow: <path d="m9 6 6 6-6 6" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>,
    close: <g stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18"/></g>,
    camera: <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round"><path d="M4 8h3l2-2h6l2 2h3v11H4V8Z"/><circle cx="12" cy="13" r="3.5"/></g>,
    paperclip: <path d="M21 11l-9 9a5 5 0 0 1-7-7l9-9a3.5 3.5 0 1 1 5 5l-9 9a2 2 0 0 1-3-3l8-8" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>,
    send: <path d="M3 11 21 4l-7 17-3-7-8-3Z" fill={color} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round"/>,
    menu: <g stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></g>,
    more: <g fill={color}><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></g>,
    flag: <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round"><path d="M5 21V4M5 4h12l-2 4 2 4H5"/></g>,
    poll: <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"><path d="M6 19V11M12 19V5M18 19v-9"/></g>,
    money: <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/></g>,
    note: <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round"><path d="M5 4h10l4 4v12H5V4Z"/><path d="M15 4v4h4M8 12h8M8 16h6"/></g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      {paths[name] || null}
    </svg>
  );
};

Object.assign(window, { T, Icon, getInitialMoyeoThemeMode, setMoyeoThemeMode });
