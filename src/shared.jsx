// Shared components for 모여트립 — phone shells, character avatars, map, progress

// 화면을 URL 로 **직접** 연 진입이다 (`?screen=` · `?route=` — 캡처와 프로토타입 전용 경로).
// 이때는 앞 단계가 없으므로, 가입 단계 화면이 서버 상태만 보고 다음 화면으로 넘겨서는 안 된다.
// 넘겨 버리면 그 자리에 홈이 찍혀 대조 자료가 통째로 거짓이 된다 (07 이 실제로 그랬다).
// iOS 의 authPreview 직접 라우트가 같은 규칙이다 — 단계 화면을 그대로 그리고 이동하지 않는다.
function isDirectScreenEntry() {
  if (typeof window === 'undefined' || !window.location) return false;
  const params = new URLSearchParams(window.location.search);
  return Boolean(params.get('screen') || params.get('route'));
}

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

// 서버 이미지가 없을 때의 빈 썸네일. 산·물·나무를 그리던 풍경 SVG(hue 팔레트)는 지웠다 —
// 자리표시자가 사진처럼 보이면 "이 콘텐츠에 사진이 없다"는 사실이 화면에서 사라진다.
// 빈 자리는 앱 공용 플레이스홀더 에셋 하나로 통일한다(PlaceImage 와 같은 그림).
function ImgPlaceholder({ height = 180, radius = 16, shape = 'landscape', children }) {
  const source = window.MoyeoImageCache?.placeholderSources?.[shape];
  return (
    <div style={{
      width: '100%', height, borderRadius: radius, position: 'relative', overflow: 'hidden',
      background: T.bgSubtle,
    }}>
      {source && <img src={source} alt="" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}/>}
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

// 지도 마커·경로선 시각 언어는 기획을 따른다 — 순번은 초록 원 + 흰 숫자, 경로선은 초록 실선.
// CustomOverlay 에 문자열을 넘기면 getContent() 로 DOM 을 못 잡아 클릭을 붙일 수 없으니 노드로 만든다.
function moyeoMarkerNode(label, route, onClick) {
  const text = label === undefined || label === null ? '' : String(label);
  const size = text.length > 2 ? 34 : 30;
  const node = document.createElement('div');
  node.style.cssText = `width:${size}px;height:${size}px;border-radius:999px;background:${route};`
    + 'border:2.5px solid #fff;box-shadow:0 2px 6px rgba(15,23,20,0.28);display:flex;align-items:center;'
    + `justify-content:center;color:#fff;font-weight:900;font-size:11px;font-family:${T.fontStack};`
    + `cursor:${onClick ? 'pointer' : 'default'};`;
  node.textContent = text;
  if (onClick) node.addEventListener('click', onClick);
  return node;
}

// 17-3 집합 장소용 드래그 핀. 기획의 초록 원 + 흰 핀 글리프 + 꼬리를 그대로 SVG 로 만든다.
function moyeoPinDataUri(route) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="62" viewBox="0 0 48 62">`
    + `<ellipse cx="24" cy="58" rx="7" ry="2.5" fill="rgba(15,23,20,0.25)"/>`
    + `<rect x="23" y="42" width="2" height="14" fill="${route}"/>`
    + `<circle cx="24" cy="22" r="19" fill="${route}" stroke="#fff" stroke-width="3"/>`
    + `<path d="M24 13a6 6 0 0 0-6 6c0 4.2 6 10 6 10s6-5.8 6-10a6 6 0 0 0-6-6zm0 8.2a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4z" fill="#fff"/>`
    + `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Mini map — 좌표가 있고 SDK 로드가 되면 카카오 실지도, 아니면 아래 SVG 목업.
// 이름·기존 props 를 그대로 유지해 호출부 8곳 이상을 건드리지 않는다.
// 실제 카카오 지도만 그린다. 좌표가 없거나 SDK 를 쓸 수 없으면 아무것도 그리지 않는다 —
// 손으로 그린 지도는 실제 위치와 무관해서, 비어 있는 것보다 더 잘못된 정보를 준다.
function MiniMap({
  height = 200,
  center = null, markers = null, polyline = null, level = 6,
  draggablePin = false, onPinMove = null, onMarkerSelect = null,
}) {
  // 지도 색은 테마 토큰을 쓴다 — 다크 모드에서 지도만 밝게 남으면 앱과 어긋난다.
  const bg = T.mapBg;
  const route = T.primary500;

  const markerList = React.useMemo(() => (markers || []).filter((m) => m && Number.isFinite(m.lat) && Number.isFinite(m.lng)), [markers]);
  const pathList = React.useMemo(() => (polyline || []).filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng)), [polyline]);
  const focus = (center && Number.isFinite(center.lat) && Number.isFinite(center.lng)) ? center : (markerList[0] || pathList[0] || null);

  // 키가 없거나 캡처 모드(?screen= 등)면 실지도를 시도하지 않는다 — 캡처 회귀 방지.
  const mapApi = typeof window !== 'undefined' ? window.MoyeoKakaoMap : null;
  const canTryLive = Boolean(focus) && Boolean(mapApi?.isAvailable?.());
  const [live, setLive] = React.useState(false);
  const holderRef = React.useRef(null);
  // 드래그 핀 모드에서는 핀이 움직일 때마다 center prop 이 바뀐다.
  // 그때 지도를 다시 만들면 드래그가 튀므로 최초 좌표만 의존성으로 쓴다.
  const focusKey = (focus && !draggablePin) ? `${focus.lat},${focus.lng}` : 'pin';
  const markerKey = JSON.stringify(markerList);
  const pathKey = JSON.stringify(pathList);

  // 지도 생성 — 실패·인증 오류·타일 미로딩이면 지도 자리를 비운다.
  React.useEffect(() => {
    if (!canTryLive) return undefined;
    let cancelled = false;
    let tileTimer = 0;
    const overlays = [];

    mapApi.loadKakaoMaps().then((maps) => {
      if (cancelled || !holderRef.current) return;
      const map = new maps.Map(holderRef.current, {
        center: new maps.LatLng(focus.lat, focus.lng),
        level,
        draggable: true,
        scrollwheel: false,
      });

      if (pathList.length >= 2) {
        const line = new maps.Polyline({
          path: pathList.map((p) => new maps.LatLng(p.lat, p.lng)),
          strokeWeight: 5,
          strokeColor: route,
          strokeOpacity: 0.95,
          strokeStyle: 'solid',
        });
        line.setMap(map);
        overlays.push(line);
      }

      markerList.forEach((item, index) => {
        const overlay = new maps.CustomOverlay({
          position: new maps.LatLng(item.lat, item.lng),
          content: moyeoMarkerNode(
            item.label === undefined ? index + 1 : item.label,
            route,
            onMarkerSelect ? () => onMarkerSelect(item, index) : null,
          ),
          yAnchor: 0.5,
          xAnchor: 0.5,
          clickable: Boolean(onMarkerSelect),
          // 방문지가 가까워 겹칠 때 앞 순번(집합 장소)이 위에 오게 한다.
          zIndex: markerList.length - index,
        });
        overlay.setMap(map);
        overlays.push(overlay);
      });

      if (draggablePin) {
        const pin = new maps.Marker({
          position: new maps.LatLng(focus.lat, focus.lng),
          draggable: true,
          image: new maps.MarkerImage(moyeoPinDataUri(route), new maps.Size(48, 62), { offset: new maps.Point(24, 58) }),
        });
        pin.setMap(map);
        overlays.push(pin);
        maps.event.addListener(pin, 'dragend', () => {
          const at = pin.getPosition();
          map.panTo(at);
          if (onPinMove) onPinMove({ lat: Number(at.getLat().toFixed(6)), lng: Number(at.getLng().toFixed(6)) });
        });
        // 지도를 움직여도 핀은 중앙을 따라간다 — 기획의 "핀을 끌어 위치를 조정하세요"와 같은 결과.
        maps.event.addListener(map, 'dragend', () => {
          const at = map.getCenter();
          pin.setPosition(at);
          if (onPinMove) onPinMove({ lat: Number(at.getLat().toFixed(6)), lng: Number(at.getLng().toFixed(6)) });
        });
      }

      if (markerList.length > 1 || pathList.length > 1) {
        const bounds = new maps.LatLngBounds();
        [...markerList, ...pathList].forEach((p) => bounds.extend(new maps.LatLng(p.lat, p.lng)));
        // 낮은 지도(150px 경로 미리보기)에서 여백이 크면 과하게 축소된다 — 높이에 맞춘다.
        const pad = Math.max(10, Math.min(40, Math.round(height / 6)));
        map.setBounds(bounds, pad, pad, pad, pad);
      }

      setLive(true);
      // 도메인 미등록 등 인증 실패는 스크립트 로드로는 잡히지 않는다.
      // 타일 이미지가 하나도 안 붙으면 지도가 아니라 빈 사각형이므로 live 를 내린다.
      tileTimer = window.setTimeout(() => {
        if (cancelled) return;
        if (!holderRef.current || !holderRef.current.querySelector('img')) setLive(false);
      }, 2800);
    }).catch(() => {
      if (!cancelled) setLive(false);
    });

    return () => {
      cancelled = true;
      if (tileTimer) window.clearTimeout(tileTimer);
      overlays.forEach((item) => { try { item.setMap(null); } catch (_) { /* 이미 정리됨 */ } });
      if (holderRef.current) holderRef.current.innerHTML = '';
    };
  }, [canTryLive, focusKey, markerKey, pathKey, level, height, draggablePin, route]);

  // 지도를 못 그리는 상태(좌표 없음 · 키 없음 · 캡처 라우트)면 자리 자체를 만들지 않는다.
  if (!canTryLive) return null;

  return (
    // isolation: 카카오 지도 내부 z-index 가 헤더·하단 카드 위로 올라오지 않게 스택 컨텍스트를 가둔다.
    <div style={{ width: '100%', height, borderRadius: 16, overflow: 'hidden', position: 'relative', background: bg, isolation: 'isolate', zIndex: 0 }}>
      <div
        ref={holderRef}
        data-moyeo-map="kakao"
        data-moyeo-map-live={live ? 'true' : 'false'}
        style={{ position: 'absolute', inset: 0, opacity: live ? 1 : 0, pointerEvents: live ? 'auto' : 'none' }}
      />
    </div>
  );
}

// Bottom navigation
function BottomNav({ active = 'home', dark = false, onChange }) {
  const tabs = [
    { id: 'home',  label: '홈', icon: 'home', route: 'home' },
    { id: 'compass', label: '탐색', icon: 'compass', route: 'explore' },
    // `dot` 은 아래 useEffect 가 서버에서 받아 켠다 — 여기서 true 로 박으면 안 된다.
    { id: 'group', label: '모임', icon: 'users', route: 'chat-list' },
    { id: 'feed',  label: '피드', icon: 'feed', route: 'feed' },
    { id: 'my',    label: '마이', icon: 'user', route: 'my' },
  ];
  // 모임 탭 알림 점 — 읽지 않은 메시지가 있을 때만 켠다.
  // 예전에는 `dot: true` 가 박혀 있어 알림이 하나도 없어도 계속 떠 있었다.
  const [hasMeetingAlert, setHasMeetingAlert] = React.useState(false);
  React.useEffect(() => {
    let alive = true;
    window.MoyeoApi?.hasMeetingAlert?.()
      .then((value) => { if (alive) setHasMeetingAlert(Boolean(value)); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

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
              {t.id === 'group' && hasMeetingAlert && (
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


// 메시지·댓글 입력줄 — 기획(20 · 20-5 · 23 · 23-1)과 같이 입력이 비어 있으면 전송이 비활성이다.
// 비활성은 T.line200 배경 + T.text400 아이콘, 활성은 T.primary500 배경 + 흰 아이콘.
function Composer({
  value, onChange, onSend, placeholder,
  height = 42, fontSize = 13, buttonSize = 38, iconSize = 17,
  inputLabel = '메시지 입력', sendLabel = '전송', testId,
}) {
  const ready = String(value || '').trim().length > 0;
  return (
    <>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={inputLabel}
        data-testid={testId ? `${testId}-input` : undefined}
        style={{
          flex: 1, minWidth: 0, height, borderRadius: 999,
          border: `1px solid ${T.line200}`, background: 'transparent',
          padding: '0 14px', fontSize, fontFamily: T.fontStack, color: T.text900, outline: 'none',
        }}
      />
      <button
        type="button"
        disabled={!ready}
        onClick={ready ? onSend : undefined}
        aria-label={sendLabel}
        data-testid={testId ? `${testId}-send` : undefined}
        style={{
          width: buttonSize, height: buttonSize, borderRadius: 999, border: 'none', padding: 0, flexShrink: 0,
          background: ready ? T.primary500 : T.line200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: ready ? 'pointer' : 'not-allowed', fontFamily: T.fontStack,
        }}
      >
        <Icon name="send" size={iconSize} color={ready ? '#fff' : T.text400}/>
      </button>
    </>
  );
}

Object.assign(window, { Phone, AnimalAvatar, ProgressBar, ImgPlaceholder, MiniMap, BottomNav, Chip, Btn, BearChar, BearGroup, CategoryChip, Composer, isDirectScreenEntry });
