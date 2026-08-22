// Shared components for 모여트립 — phone shells, character avatars, map, progress

// Phone shell — replicates the iOS frame style but lighter
function Phone({ children, dark = false }) {
  return (
    <div style={{
      width: 393, height: 'var(--mw-logical-h, 852px)', borderRadius: 56,
      background: dark ? '#0E1412' : T.bgBase,
      boxShadow: '0 0 0 12px #0a0a0a, 0 0 0 13px #2a2a2a, 0 30px 80px rgba(0,0,0,0.25)',
      overflow: 'hidden', position: 'relative',
      fontFamily: T.fontStack,
      color: dark ? T.text900 : T.text900,
    }}>
      {children}
    </div>
  );
}

// Animal character avatar — flat, friendly, made of simple shapes per design system rules
// Uses 2 colors max (Primary + Accent + neutral line) — matches §5 style
function AnimalAvatar({ kind = 'deer', size = 80, bg = T.primary50 }) {
  const renders = {
    deer: (
      <g>
        {/* head */}
        <ellipse cx="50" cy="55" rx="26" ry="24" fill="#D9A574"/>
        {/* face */}
        <ellipse cx="50" cy="62" rx="18" ry="14" fill="#F5DCB8"/>
        {/* antlers */}
        <path d="M36 32 L30 18 M36 32 L24 22 M36 32 L34 22" stroke={T.primary600} strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M64 32 L70 18 M64 32 L76 22 M64 32 L66 22" stroke={T.primary600} strokeWidth="3" strokeLinecap="round" fill="none"/>
        {/* ears */}
        <ellipse cx="32" cy="45" rx="6" ry="9" fill="#D9A574" transform="rotate(-20 32 45)"/>
        <ellipse cx="68" cy="45" rx="6" ry="9" fill="#D9A574" transform="rotate(20 68 45)"/>
        {/* eyes */}
        <ellipse cx="42" cy="58" rx="2.5" ry="3" fill={T.text900}/>
        <ellipse cx="58" cy="58" rx="2.5" ry="3" fill={T.text900}/>
        {/* cheeks */}
        <circle cx="38" cy="66" r="3" fill={T.accent300} opacity="0.7"/>
        <circle cx="62" cy="66" r="3" fill={T.accent300} opacity="0.7"/>
        {/* nose */}
        <ellipse cx="50" cy="68" rx="2.5" ry="2" fill={T.text900}/>
        <path d="M50 70 Q47 73 45 73 M50 70 Q53 73 55 73" stroke={T.text900} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      </g>
    ),
    turtle: (
      <g>
        {/* shell */}
        <ellipse cx="50" cy="62" rx="32" ry="22" fill={T.primary500}/>
        <path d="M50 42 L62 56 L56 76 L44 76 L38 56 Z" fill={T.primary600} opacity="0.4"/>
        {/* head */}
        <circle cx="50" cy="38" r="14" fill="#A8D49A"/>
        {/* eyes */}
        <circle cx="46" cy="38" r="2" fill={T.text900}/>
        <circle cx="54" cy="38" r="2" fill={T.text900}/>
        {/* smile */}
        <path d="M46 44 Q50 47 54 44" stroke={T.text900} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
        {/* feet */}
        <ellipse cx="22" cy="68" rx="6" ry="4" fill="#A8D49A"/>
        <ellipse cx="78" cy="68" rx="6" ry="4" fill="#A8D49A"/>
      </g>
    ),
    raccoon: (
      <g>
        {/* head */}
        <ellipse cx="50" cy="54" rx="28" ry="26" fill="#9BA5A8"/>
        {/* ears */}
        <path d="M28 36 L20 22 L34 30 Z" fill="#7A848A"/>
        <path d="M72 36 L80 22 L66 30 Z" fill="#7A848A"/>
        <path d="M28 36 L24 28 L31 32 Z" fill="#3A3F44"/>
        <path d="M72 36 L76 28 L69 32 Z" fill="#3A3F44"/>
        {/* mask */}
        <ellipse cx="40" cy="54" rx="9" ry="7" fill="#3A3F44"/>
        <ellipse cx="60" cy="54" rx="9" ry="7" fill="#3A3F44"/>
        {/* eyes */}
        <circle cx="40" cy="54" r="3" fill="#fff"/>
        <circle cx="60" cy="54" r="3" fill="#fff"/>
        <circle cx="40" cy="54" r="1.8" fill={T.text900}/>
        <circle cx="60" cy="54" r="1.8" fill={T.text900}/>
        {/* muzzle */}
        <ellipse cx="50" cy="68" rx="10" ry="7" fill="#F5F0E8"/>
        <ellipse cx="50" cy="64" rx="2.5" ry="2" fill={T.text900}/>
        <path d="M50 66 Q47 70 45 69 M50 66 Q53 70 55 69" stroke={T.text900} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      </g>
    ),
    bear: (
      <g>
        <ellipse cx="50" cy="56" rx="28" ry="26" fill="#A57E56"/>
        <circle cx="28" cy="36" r="8" fill="#A57E56"/>
        <circle cx="72" cy="36" r="8" fill="#A57E56"/>
        <circle cx="28" cy="36" r="4" fill="#7A5A3E"/>
        <circle cx="72" cy="36" r="4" fill="#7A5A3E"/>
        <ellipse cx="50" cy="64" rx="14" ry="11" fill="#E8C9A0"/>
        <circle cx="42" cy="56" r="2.5" fill={T.text900}/>
        <circle cx="58" cy="56" r="2.5" fill={T.text900}/>
        <ellipse cx="50" cy="62" rx="3" ry="2.5" fill={T.text900}/>
        <path d="M50 65 Q46 70 43 68 M50 65 Q54 70 57 68" stroke={T.text900} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
        <circle cx="36" cy="68" r="3" fill={T.accent300} opacity="0.6"/>
        <circle cx="64" cy="68" r="3" fill={T.accent300} opacity="0.6"/>
      </g>
    ),
    crane: (
      <g>
        <ellipse cx="50" cy="60" rx="22" ry="20" fill="#F5F2EC"/>
        <path d="M50 40 Q40 30 38 20 Q40 16 44 18 Q42 24 48 32" fill="#F5F2EC" stroke="#D8D0C0" strokeWidth="1"/>
        <circle cx="44" cy="22" r="6" fill="#F5F2EC"/>
        <path d="M40 18 Q34 16 32 22" fill={T.accent500} stroke="none"/>
        <circle cx="42" cy="22" r="1.5" fill={T.text900}/>
        <ellipse cx="62" cy="56" rx="14" ry="6" fill="#3A3F44" opacity="0.3"/>
      </g>
    ),
    rabbit: (
      <g>
        {/* ears */}
        <ellipse cx="38" cy="22" rx="6" ry="16" fill="#F5DCD5"/>
        <ellipse cx="62" cy="22" rx="6" ry="16" fill="#F5DCD5"/>
        <ellipse cx="38" cy="22" rx="3" ry="11" fill={T.accent300}/>
        <ellipse cx="62" cy="22" rx="3" ry="11" fill={T.accent300}/>
        {/* head */}
        <ellipse cx="50" cy="58" rx="26" ry="22" fill="#F5DCD5"/>
        <circle cx="42" cy="56" r="3" fill={T.text900}/>
        <circle cx="58" cy="56" r="3" fill={T.text900}/>
        <ellipse cx="50" cy="66" rx="8" ry="6" fill="#fff"/>
        <ellipse cx="50" cy="62" rx="2.5" ry="2" fill={T.accent500}/>
        <path d="M50 65 Q46 70 43 68 M50 65 Q54 70 57 68" stroke={T.text900} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      </g>
    ),
  };
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
    }}>
      <svg width={size * 0.95} height={size * 0.95} viewBox="0 0 100 100">
        {renders[kind]}
      </svg>
    </div>
  );
}

// Progress bar — service signature §4-8
function ProgressBar({ current = 4, max = 8, min = 3 }) {
  const pct = Math.min(current / max, 1) * 100;
  const minPct = (min / max) * 100;
  const fillColor = current >= min ? T.primary500 : T.warning;
  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div style={{
        height: 6, background: T.line100, borderRadius: 999, position: 'relative', overflow: 'visible',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: fillColor, borderRadius: 999, transition: 'width .4s ease-out',
        }}/>
        {/* Min marker */}
        <div style={{
          position: 'absolute', top: -3, left: `${minPct}%`, width: 1.5, height: 12,
          background: T.primary300, transform: 'translateX(-50%)',
        }}/>
        <div style={{
          position: 'absolute', top: -14, left: `${minPct}%`, transform: 'translateX(-50%)',
          width: 14, height: 14, borderRadius: 999, background: T.primary500,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="check" size={10} color="#fff" strokeWidth={2.5}/>
        </div>
      </div>
    </div>
  );
}

// Realistic-feeling landscape placeholder — layered nature SVG, calm muted tones
function ImgPlaceholder({ label, height = 180, hue = 'forest', radius = 16, children, scene }) {
  // Nature scene palettes — calm, photographic, low chroma
  // sky/water/mountain/foreground tones derived from natural Korean landscape photos
  const palettes = {
    forest:  { sky: '#D8E4D2', water: '#7A9580', m1: '#3F5A45', m2: '#2A4030', m3: '#1F3025', fore: '#1A2620' }, // 산·숲 짙은 그린
    autumn:  { sky: '#E8DCC8', water: '#A89060', m1: '#8A6A3A', m2: '#6B4A28', m3: '#4A331C', fore: '#3A2818' }, // 단풍·갈색
    coast:   { sky: '#CDD8DA', water: '#7A95A0', m1: '#4A6068', m2: '#33454C', m3: '#22323A', fore: '#1A262C' }, // 동해 코스트
    sunset:  { sky: '#E8D0B0', water: '#B89878', m1: '#7A5A40', m2: '#5A3F28', m3: '#3F2A18', fore: '#2A1C10' }, // 일몰
    night:   { sky: '#2A3530', water: '#1A2520', m1: '#152018', m2: '#0E1812', m3: '#08120C', fore: '#050A06' }, // 야경
    pebble:  { sky: '#E0DCD2', water: '#B8B0A0', m1: '#8A8070', m2: '#6A6050', m3: '#4A4030', fore: '#3A3020' }, // 한옥·돌담
    hanok:   { sky: '#D8DFD2', water: '#9AAA8A', m1: '#5A4A38', m2: '#3F3022', m3: '#2A1F18', fore: '#1A1208' }, // 한옥마을
  };
  const p = palettes[hue] || palettes.forest;
  return (
    <div style={{
      width: '100%', height, borderRadius: radius, position: 'relative', overflow: 'hidden',
      background: p.sky,
    }}>
      <svg width="100%" height="100%" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
        {/* sky gradient */}
        <defs>
          <linearGradient id={`sky-${hue}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.sky}/>
            <stop offset="100%" stopColor={p.water} stopOpacity="0.4"/>
          </linearGradient>
          <linearGradient id={`water-${hue}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.water} stopOpacity="0.7"/>
            <stop offset="100%" stopColor={p.m2}/>
          </linearGradient>
        </defs>
        <rect width="320" height="200" fill={`url(#sky-${hue})`}/>

        {/* Far mountains */}
        <path d="M0 110 L40 80 L80 95 L130 70 L180 95 L230 75 L280 90 L320 80 L320 130 L0 130 Z" fill={p.m1} opacity="0.8"/>
        {/* Mid mountains */}
        <path d="M0 130 L30 105 L70 120 L110 95 L160 115 L210 100 L260 120 L320 105 L320 145 L0 145 Z" fill={p.m2} opacity="0.85"/>
        {/* Water/lake reflection */}
        <rect x="0" y="140" width="320" height="60" fill={`url(#water-${hue})`}/>
        {/* Water shimmer lines */}
        <path d="M30 158 L80 158 M120 162 L200 162 M230 156 L290 156 M40 172 L100 172 M150 175 L220 175 M250 170 L300 170" stroke={p.sky} strokeWidth="0.6" opacity="0.4"/>

        {/* Foreground hill */}
        <path d="M0 145 Q30 130 60 138 Q100 148 140 140 Q180 132 220 142 Q260 150 320 138 L320 200 L0 200 Z" fill={p.m3}/>
        {/* Trees on foreground */}
        <g opacity="0.9">
          {[20, 45, 75, 110, 145, 185, 225, 265, 295].map((x, i) => (
            <g key={i} transform={`translate(${x} ${150 + (i%3)*3})`}>
              <path d={`M0 0 L-3 -${8 + (i%3)*2} L0 -${10 + (i%3)*2} L3 -${8 + (i%3)*2} Z`} fill={p.fore}/>
            </g>
          ))}
        </g>

        {/* Atmospheric haze */}
        <rect x="0" y="80" width="320" height="40" fill={p.sky} opacity="0.25"/>
      </svg>

      {/* Optional scene-specific overlays */}
      {scene === 'hanok' && (
        <svg width="60%" height="50%" viewBox="0 0 200 100" preserveAspectRatio="xMidYMax meet" style={{ position: 'absolute', bottom: '10%', left: '20%', opacity: 0.95 }}>
          {/* Hanok roof silhouette */}
          <path d="M20 60 Q100 30 180 60 L170 65 Q100 38 30 65 Z" fill="#2A1C10"/>
          <rect x="40" y="65" width="120" height="25" fill="#4A3320"/>
          <rect x="50" y="72" width="20" height="18" fill="#1A1008"/>
          <rect x="90" y="72" width="20" height="18" fill="#1A1008"/>
          <rect x="130" y="72" width="20" height="18" fill="#1A1008"/>
        </svg>
      )}

      {/* subtle grain */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)`,
        backgroundSize: '3px 3px', opacity: 0.5,
      }}/>

      {label && (
        <div style={{
          position: 'absolute', bottom: 10, left: 12,
          fontSize: 10, fontFamily: 'ui-monospace, "SF Mono", monospace',
          color: 'rgba(255,255,255,0.85)', letterSpacing: 0.3, textTransform: 'uppercase',
          textShadow: '0 1px 2px rgba(0,0,0,0.4)',
        }}>{label}</div>
      )}
      {children}
    </div>
  );
}

// Bear character — large illustrated mascot per design ref
// pose: 'standing' | 'small' | 'group' (3 bears)
function BearChar({ size = 160, outfit = 'green' }) {
  const outfits = {
    green:  { jacket: T.primary500, pants: '#3A4A38', hat: T.primary600 },
    yellow: { jacket: '#E8C547', pants: '#5A4A28', hat: '#D9B538' },
    blue:   { jacket: '#5A7A98', pants: '#3A4A58', hat: '#4A6A88' },
    pink:   { jacket: '#E89B9B', pants: '#7A4A4A', hat: '#D88080' },
  };
  const o = outfits[outfit] || outfits.green;
  // Single bear standing/sitting
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: 'block' }}>
      {/* Body */}
      <ellipse cx="100" cy="135" rx="48" ry="42" fill={o.jacket}/>
      {/* Pants */}
      <ellipse cx="100" cy="170" rx="46" ry="22" fill={o.pants}/>
      {/* Arms */}
      <ellipse cx="56" cy="130" rx="14" ry="22" fill={o.jacket} transform="rotate(-15 56 130)"/>
      <ellipse cx="144" cy="130" rx="14" ry="22" fill={o.jacket} transform="rotate(15 144 130)"/>
      {/* Paws */}
      <circle cx="50" cy="148" r="11" fill="#A57E56"/>
      <circle cx="150" cy="148" r="11" fill="#A57E56"/>
      {/* Head */}
      <ellipse cx="100" cy="78" rx="48" ry="44" fill="#A57E56"/>
      {/* Ears */}
      <circle cx="65" cy="42" r="13" fill="#A57E56"/>
      <circle cx="135" cy="42" r="13" fill="#A57E56"/>
      <circle cx="65" cy="42" r="7" fill="#7A5A3E"/>
      <circle cx="135" cy="42" r="7" fill="#7A5A3E"/>
      {/* Hat (optional bucket) */}
      {outfit === 'yellow' && (
        <g>
          <ellipse cx="100" cy="42" rx="50" ry="10" fill={o.hat}/>
          <path d="M58 42 Q60 18 100 18 Q140 18 142 42 Z" fill={o.hat}/>
        </g>
      )}
      {/* Muzzle */}
      <ellipse cx="100" cy="92" rx="22" ry="17" fill="#F0DCB8"/>
      {/* Eyes */}
      <ellipse cx="84" cy="78" rx="4" ry="5" fill="#1A1208"/>
      <ellipse cx="116" cy="78" rx="4" ry="5" fill="#1A1208"/>
      <circle cx="85.5" cy="76" r="1.4" fill="#fff"/>
      <circle cx="117.5" cy="76" r="1.4" fill="#fff"/>
      {/* Nose */}
      <ellipse cx="100" cy="88" rx="4.5" ry="3.5" fill="#1A1208"/>
      {/* Mouth */}
      <path d="M100 92 L100 96 M100 96 Q94 100 90 98 M100 96 Q106 100 110 98" stroke="#1A1208" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* Cheek blush */}
      <circle cx="74" cy="90" r="5" fill="#E89B9B" opacity="0.5"/>
      <circle cx="126" cy="90" r="5" fill="#E89B9B" opacity="0.5"/>
    </svg>
  );
}

// Bear group — 3 bears side by side for hero illustration
function BearGroup({ size = 200 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: -10 }}>
      <div style={{ marginRight: -16, marginBottom: 4 }}><BearChar size={size * 0.7} outfit="yellow"/></div>
      <div style={{ zIndex: 2 }}><BearChar size={size * 0.85} outfit="green"/></div>
      <div style={{ marginLeft: -16, marginBottom: 6 }}><BearChar size={size * 0.7} outfit="blue"/></div>
    </div>
  );
}

// Mini map — illustrative tile
function MiniMap({ height = 200, dark = false, withRoute = true, pins = [1,2,3,4] }) {
  // 지도 색은 테마 토큰을 쓴다 — 다크 모드에서 지도만 밝게 남으면 앱과 어긋난다.
  // dark 를 명시한 호출부(밝은 히어로 위 어두운 지도)는 그대로 고정 색을 쓴다.
  const bg = dark ? '#1A2320' : T.mapBg;
  const land = dark ? '#222C28' : T.mapLand;
  const water = dark ? '#1A2A36' : T.mapWater;
  const route = dark ? T.primary300 : T.primary500;
  return (
    <div style={{ width: '100%', height, borderRadius: 16, overflow: 'hidden', position: 'relative', background: bg }}>
      <svg width="100%" height="100%" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
        <rect width="320" height="200" fill={bg}/>
        {/* land masses */}
        <path d="M0 0 L320 0 L320 60 Q260 70 220 90 Q180 110 140 100 Q100 90 60 110 Q20 130 0 120 Z" fill={land}/>
        <path d="M0 200 L320 200 L320 130 Q280 150 240 140 Q180 130 140 150 Q80 170 40 160 Q20 156 0 162 Z" fill={land}/>
        {/* water */}
        <path d="M-10 60 Q60 100 140 95 Q220 90 320 70 L320 130 Q260 145 200 140 Q120 135 60 150 Q20 160 -10 155 Z" fill={water} opacity="0.5"/>
        {/* roads */}
        <path d="M30 30 Q90 50 150 60 Q210 70 290 50" stroke={dark ? '#323D38' : T.mapRoad} strokeWidth="1.5" fill="none"/>
        <path d="M40 170 Q120 150 200 160 Q260 168 300 180" stroke={dark ? '#323D38' : T.mapRoad} strokeWidth="1.5" fill="none"/>
        {/* route line */}
        {withRoute && (
          <>
            <path d="M50 150 Q90 130 130 110 Q170 95 210 75 Q240 60 270 50" stroke="rgba(0,0,0,0.18)" strokeWidth="5" strokeLinecap="round" fill="none" transform="translate(0,1.5)"/>
            <path d="M50 150 Q90 130 130 110 Q170 95 210 75 Q240 60 270 50" stroke={route} strokeWidth="4" strokeLinecap="round" fill="none"/>
          </>
        )}
        {/* pins */}
        {withRoute && [
          { x: 50, y: 150, n: 1 },
          { x: 130, y: 110, n: 2 },
          { x: 210, y: 75, n: 3 },
          { x: 270, y: 50, n: 4 },
        ].slice(0, pins.length).map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y + 1} r="13" fill="rgba(0,0,0,0.18)"/>
            <circle cx={p.x} cy={p.y} r="13" fill={route}/>
            <text x={p.x} y={p.y + 4} fontSize="11" fontWeight="700" textAnchor="middle" fill="#fff" fontFamily={T.fontStack}>{p.n}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// Bottom navigation
function BottomNav({ active = 'home', dark = false, onChange }) {
  const tabs = [
    { id: 'home',  label: '홈', icon: 'home', route: 'home' },
    { id: 'compass', label: '탐색', icon: 'compass', route: 'explore' },
    { id: 'group', label: '모임', icon: 'users', dot: true, route: 'chat-list' },
    { id: 'feed',  label: '피드', icon: 'feed', route: 'feed' },
    { id: 'my',    label: '마이', icon: 'user', route: 'my' },
  ];
  const bg = dark ? '#1A2320' : '#FFFFFF';
  const inactiveColor = T.text400;
  const activeColor = dark ? T.primary300 : T.primary500;

  // Connect to global router if available
  const nav = (typeof window !== 'undefined' && window.useNav) ? window.useNav() : null;
  const handleTab = (t) => {
    if (onChange) onChange(t.id);
    if (nav && nav.go) nav.go(t.route, { transition: 'tab', replace: true });
  };

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 96,
      background: bg, borderTop: `1px solid ${dark ? '#222B27' : T.line100}`,
      display: 'flex', paddingBottom: 30,
    }}>
      {tabs.map(t => {
        const on = t.id === active;
        return (
          <button key={t.id}
            onClick={() => handleTab(t)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 4, position: 'relative', cursor: 'pointer',
              border: 'none', background: 'transparent', padding: 0, fontFamily: T.fontStack,
            }}>
            <div style={{ position: 'relative' }}>
              <Icon name={t.icon} size={24} color={on ? activeColor : inactiveColor}/>
              {t.dot && (
                <div style={{
                  position: 'absolute', top: -1, right: -2, width: 7, height: 7, borderRadius: 999,
                  background: T.accent500, border: `1.5px solid ${bg}`,
                }}/>
              )}
            </div>
            <div style={{
              fontSize: 11, lineHeight: '14px', fontWeight: 500,
              color: on ? activeColor : inactiveColor,
            }}>{t.label}</div>
            {on && (
              <div style={{
                position: 'absolute', bottom: 28, width: 24, height: 3, borderRadius: 999, background: activeColor,
              }}/>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Pill chip
function Chip({ children, variant = 'neutral', size = 'sm' }) {
  const variants = {
    primary: { bg: T.primary100, fg: T.primary700 },
    accent:  { bg: T.accent100, fg: T.accent700 },
    warning: { bg: T.warningBg, fg: T.warningText },
    danger:  { bg: T.dangerBg, fg: T.dangerText },
    neutral: { bg: T.line100, fg: T.text700 },
  };
  const v = variants[variant];
  const padding = size === 'lg' ? '8px 12px' : size === 'md' ? '6px 10px' : '4px 8px';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding, borderRadius: 8,
      background: v.bg, color: v.fg, fontSize: 12, lineHeight: '16px', fontWeight: 500,
      whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

// Button
function Btn({ children, variant = 'primary', icon, full = false, dark = false, disabled = false, onClick, ariaLabel, testId, networkAction = false }) {
  const unavailable = disabled || (networkAction && window.__moyeoOnline === false);
  const styles = {
    primary: { bg: dark ? T.primary400 : T.primary500, fg: T.textInverse, border: 'transparent' },
    secondary: { bg: 'transparent', fg: dark ? T.text900 : T.text900, border: T.line200 },
    ghost: { bg: 'transparent', fg: dark ? T.primary300 : T.primary600, border: 'transparent' },
    danger: { bg: T.danger, fg: T.textInverse, border: 'transparent' },
    disabled: { bg: T.line100, fg: T.text400, border: 'transparent' },
  };
  const s = unavailable ? styles.disabled : styles[variant];
  return (
    <button
      type="button"
      onClick={unavailable ? undefined : onClick}
      disabled={unavailable}
      aria-label={ariaLabel}
      data-testid={testId}
      data-network-action={networkAction ? 'true' : undefined}
      style={{
      height: 48, padding: '0 20px', borderRadius: 12, border: `1px solid ${s.border}`,
      background: s.bg, color: s.fg, fontSize: 14, fontWeight: 600, fontFamily: T.fontStack,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      width: full ? '100%' : 'auto', cursor: unavailable ? 'default' : 'pointer',
      opacity: unavailable ? 0.72 : 1,
    }}>
      {icon && <Icon name={icon} size={18} color={s.fg}/>}
      {children}
    </button>
  );
}

// Category chip — design ref style (자연·문화·맛집·체험)
function CategoryChip({ label, active = false, onClick }) {
  return (
    <button onClick={onClick} style={{
      height: 34, padding: '0 14px', borderRadius: 999,
      background: active ? T.primary500 : T.bgBase,
      border: active ? `1px solid ${T.primary500}` : `1px solid ${T.line200}`,
      color: active ? '#fff' : T.text700,
      fontSize: 13, fontWeight: active ? 600 : 500, fontFamily: T.fontStack,
      cursor: 'pointer', whiteSpace: 'nowrap',
    }}>{label}</button>
  );
}

Object.assign(window, { Phone, AnimalAvatar, ProgressBar, ImgPlaceholder, MiniMap, BottomNav, Chip, Btn, BearChar, BearGroup, CategoryChip });
