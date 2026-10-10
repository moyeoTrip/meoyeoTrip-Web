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

// ── 실패를 화면에 적을 때 쓰는 한 곳 (W-97 · 안드 UserFacingError.kt 와 같은 규칙) ──
//
// `fetch` 가 연결에 실패하면 `TypeError: Failed to fetch` 를 던진다. 예전에는 화면마다
// `error?.message || '…'` 로 받아 **그 영문 원문을 그대로** 사용자에게 보여줬다.
// 통신이 끊긴 상황에서는 거의 항상 영어가 보였다는 뜻이다.
//
// 판정 기준은 `status` 다. 서버가 한 번이라도 응답했으면 `AuthApiError.status` 가 붙어 있고,
// 그 `message` 는 서버가 준 한국어라 그대로 쓴다. `status` 가 없으면(0 · undefined) 연결 자체가
// 안 된 것이므로 아래 한 문장으로 바꾼다.
//
// @param fallback 이 동작이 실패했을 때 쓸 화면별 문구. 「무엇을」 못 했는지 담는다.
const MOYEO_NETWORK_ERROR_MESSAGE = '인터넷 연결을 확인하고 다시 시도해 주세요.';
// 403·429 는 **사용자가 할 일이 서로 정반대**인데 화면마다 같은 한 문구로 뭉개졌다 (W-29).
// 429 는 기다리면 되고, 403 은 몇 번을 눌러도 달라지지 않는다 — 그 차이만 먼저 가른다.
// (503 점검·404 없음까지 한 번에 가르려다 못 하는 것보다, 자주 부딪히는 둘을 갈라 두는 쪽을 골랐다.)
const MOYEO_TOO_MANY_REQUESTS_MESSAGE = '요청이 너무 잦아요. 잠시 뒤 다시 시도해 주세요.';
const MOYEO_FORBIDDEN_MESSAGE = '이 작업을 할 권한이 없어요. 다시 시도해도 달라지지 않아요.';
// 화면이 정한 문구(「무엇을」 못 했는지)를 앞에 두고 까닭을 잇는다. 둘 중 하나만 있으면 그것만 쓴다.
function joinReason(fallback, reason) {
  const head = String(fallback ?? '').trim();
  return head ? `${head} ${reason}` : reason;
}
function userFacingError(error, fallback) {
  const message = typeof error?.message === 'string' ? error.message.trim() : '';
  // 서버가 준 문구와 클라이언트가 정해 둔 문구는 한국어다 — 그대로 쓴다.
  // (요청 시간 초과처럼 status 가 0 인데도 한국어 문구를 담아 오는 경우가 있다.)
  // 서버가 까닭을 정확히 적어 보냈으면 아래 일반 문구보다 그쪽이 낫다.
  if (message && /[^\x00-\x7F]/.test(message)) return message;
  // status 가 없으면 서버에 닿지도 못한 것이다 — `TypeError: Failed to fetch`.
  if (!error || !error.status) return MOYEO_NETWORK_ERROR_MESSAGE;
  if (error.status === 429) return joinReason(fallback, MOYEO_TOO_MANY_REQUESTS_MESSAGE);
  if (error.status === 403) return joinReason(fallback, MOYEO_FORBIDDEN_MESSAGE);
  // 응답은 받았는데 본문 문구가 없거나 영문이다. 화면이 정한 문구로 바꾼다.
  return fallback;
}

// ── 2026-09-15 결정 ⑩ · 앞으로 쓰는 코드의 오류 문구 ──
//
// 화면 문장은 **클라이언트가 소유한다.** 서버 `errorMessage` 를 그대로 화면에 올리지 않고,
// 갈래가 필요하면 `status`·`code` 로만 가른다. 위의 `userFacingError` 는 서버 문구를 통과시키지만
// 소급해서 바꾸지 않기로 했으므로(결정 ⑩) 그대로 두고, 새 호출부는 이 함수를 쓴다.
//
// @param fallback 화면이 정한 기본 문구. 갈래에 해당하지 않으면 이것을 그대로 쓴다.
// 점검(503)은 서버가 코드 본문을 못 줄 수도 있다 — 게이트웨이가 가로챈 503 은 JSON 이 아니라
// 본문이 비어 있고 status 만 남는다. 그래서 status 를 먼저 보고 code 는 보조로 본다.
const MOYEO_MAINTENANCE_CODE = '50300';
const MOYEO_MAINTENANCE_MESSAGE = '서버를 점검하고 있어요. 잠시 뒤 다시 시도해 주세요.';
function isMaintenanceError(error) {
  if (!error) return false;
  return error.status === 503 || String(error.code ?? '') === MOYEO_MAINTENANCE_CODE;
}
function screenErrorText(error, fallback) {
  if (!error) return fallback;
  if (isMaintenanceError(error)) return MOYEO_MAINTENANCE_MESSAGE;
  // 403 은 몇 번을 눌러도 달라지지 않는다 — 「다시 시도」로 뭉개면 사용자가 계속 누른다 (QA OFF-020).
  if (error.status === 403) return MOYEO_FORBIDDEN_MESSAGE;
  if (error.status === 429) return MOYEO_TOO_MANY_REQUESTS_MESSAGE;
  return fallback;
}
// ── BE-30 공지 동시 수정 · BE-31 확정 최소 인원 (2026-09-15 서버 배포) ──
//
// 둘 다 **코드로 갈라 우리 문장을 쓴다**(결정 ⑩). 서버 `errorMessage`(「다른 사람이 먼저 공지를
// 수정했습니다.」 · 「최소 출발 인원을 채워야 여행을 확정할 수 있습니다.」)를 그대로 올리지 않는다.
// 문장은 iOS·안드로이드와 **글자까지 같아야 한다** — 세 구현이 갈리면 같은 실패가 달리 읽힌다.
const MOYEO_NOTICE_CONFLICT_CODE = '40923';
const MOYEO_NOTICE_CONFLICT_MESSAGE = '다른 사람이 먼저 이 공지를 고쳤어요. 최신 내용을 불러왔으니 확인하고 다시 저장해주세요.';
function isNoticeConflictError(error) {
  return Boolean(error) && String(error.code ?? '') === MOYEO_NOTICE_CONFLICT_CODE;
}
const MOYEO_TRIP_CONFIRM_SHORT_CODE = '40924';
function isTripConfirmShortError(error) {
  return Boolean(error) && String(error.code ?? '') === MOYEO_TRIP_CONFIRM_SHORT_CODE;
}
// 인원 수는 **서버가 준 방 상세의 `minimumParticipants`** 를 쓴다. 못 받았으면 숫자를 지어내지 않고
// 숫자 없는 문장으로 내린다 (NO-MOCK R1 — 근거 없는 값을 화면에 적지 않는다).
function moyeoTripConfirmShortMessage(minimumParticipants) {
  const minimum = Number(minimumParticipants);
  const head = Number.isFinite(minimum) && minimum > 0 ? `최소 출발 인원 ${minimum}명을` : '최소 출발 인원을';
  return `${head} 채워야 여행을 확정할 수 있어요. 동행자를 더 승인한 뒤 다시 시도해주세요.`;
}

// 「다시 시도」를 보여줄 이유가 있는 실패인가. 403 은 재시도가 뜻이 없다.
function errorAllowsRetry(error) {
  return !(error && error.status === 403);
}

// ── 웹 알림 권한(OS 차단) 안내 문구 ──
// 29-2 앱 전체 알림 설정과 20-1c 이 모임 알림이 **같은 문장**을 써야 한다
// (OS-NOTIFICATION-BLOCK-CANON · QA NOTIF-016). 화면마다 적으면 한쪽만 고쳐져 갈라진다.
const MOYEO_PUSH_BLOCK_COPY = {
  // 'prompt' 는 **아직 허용한 적이 없는** 상태다.
  prompt: '탭하면 브라우저에 알림 권한을 요청해요',
  denied: '브라우저 설정에서 알림 권한을 허용해주세요',
  unsupported: '이 브라우저는 웹 알림을 지원하지 않아요',
  insecure: 'HTTPS 환경에서만 웹 알림을 쓸 수 있어요',
  unconfigured: 'Firebase Messaging 설정이 필요해요',
  error: '알림 연결을 확인하지 못했어요. 다시 시도해주세요',
};
// 브라우저 알림 권한 상태를 읽는 공용 훅. 29-2 설정 화면이 쓰던 절차를 그대로 함수로 뺐다.
//
// 정본은 **OS 가 막고 있을 때만** 줄을 그리라고 한다 — 웹에서 그 판단은
// `Notification.permission === 'denied'`(푸시 모듈의 status 'denied') 하나다.
// 아직 물어본 적 없는 'prompt' 나 지원하지 않는 브라우저는 "OS 가 막았다" 가 아니라서
// 20-1c 에서는 그리지 않는다(29-2 는 권한을 요청하는 자리라 그쪽 갈래를 그대로 둔다).
function useMoyeoPushBlock() {
  const [pushStatus, setPushStatus] = React.useState('checking');
  React.useEffect(() => {
    let active = true;
    const updateState = (event) => {
      if (!active) return;
      setPushStatus(event.detail?.status || 'error');
    };
    window.addEventListener('moyeo:push-state', updateState);
    window.MoyeoPush?.capability?.().then((state) => {
      if (!active) return;
      setPushStatus(state?.status || 'unsupported');
    });
    return () => {
      active = false;
      window.removeEventListener('moyeo:push-state', updateState);
    };
  }, []);
  const osBlocked = pushStatus === 'denied';
  return { pushStatus, osBlocked, osBlockedText: osBlocked ? MOYEO_PUSH_BLOCK_COPY.denied : '' };
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
  // 지도 SDK 로드·인증이 실패하면 `live` 만 false 로 두고 **아무 말도 하지 않았다** —
  // 사용자는 회색 사각형만 보고 왜 비었는지, 무엇을 하면 되는지 알 수 없었다 (W-81).
  const [mapError, setMapError] = React.useState(false);
  const [mapRetryKey, setMapRetryKey] = React.useState(0);
  const holderRef = React.useRef(null);
  // 드래그 핀 모드에서는 핀이 움직일 때마다 center prop 이 바뀐다.
  // 그때 지도를 다시 만들면 드래그가 튀므로 최초 좌표만 의존성으로 쓴다.
  const focusKey = (focus && !draggablePin) ? `${focus.lat},${focus.lng}` : 'pin';
  // 지도를 다시 만들지 않고 카메라만 옮기기 위해 인스턴스를 들고 있는다 (아래 재중심 effect).
  const mapRef = React.useRef(null);
  const mapsRef = React.useRef(null);
  const pinRef = React.useRef(null);
  const markerKey = JSON.stringify(markerList);
  const pathKey = JSON.stringify(pathList);

  // 지도 생성 — 실패·인증 오류·타일 미로딩이면 지도 자리를 비운다.
  React.useEffect(() => {
    if (!canTryLive) return undefined;
    let cancelled = false;
    let tileTimer = 0;
    const overlays = [];
    setMapError(false);

    mapApi.loadKakaoMaps().then((maps) => {
      if (cancelled || !holderRef.current) return;
      const map = new maps.Map(holderRef.current, {
        center: new maps.LatLng(focus.lat, focus.lng),
        level,
        draggable: true,
        scrollwheel: false,
      });
      mapRef.current = map;
      mapsRef.current = maps;

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
        pinRef.current = pin;
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
        if (!holderRef.current || !holderRef.current.querySelector('img')) { setLive(false); setMapError(true); }
      }, 2800);
    }).catch(() => {
      if (cancelled) return;
      setLive(false);
      setMapError(true);
    });

    return () => {
      cancelled = true;
      if (tileTimer) window.clearTimeout(tileTimer);
      overlays.forEach((item) => { try { item.setMap(null); } catch (_) { /* 이미 정리됨 */ } });
      mapRef.current = null;
      mapsRef.current = null;
      pinRef.current = null;
      if (holderRef.current) holderRef.current.innerHTML = '';
    };
  }, [canTryLive, focusKey, markerKey, pathKey, level, height, draggablePin, route, mapRetryKey]);

  // 드래그 핀 모드에서도 **밖에서 준 좌표**가 바뀌면 카메라를 그리로 옮긴다.
  // 위 focusKey 가 'pin' 으로 고정돼 있어 지도가 처음 좌표에 영원히 머물렀다 —
  // 18-5 집합 정보 수정은 서버 좌표를 받아 놓고도 기본 좌표(36.4 / 128.9)를 보여 주면서
  // 그 위에 「핀을 끌어 위치를 조정하세요」라고 적었다 (안드 AND-112 의 웹판).
  // 지도를 다시 만들지 않고 setCenter 만 해서 드래그가 튀지 않게 한다.
  const centerKey = focus ? `${focus.lat},${focus.lng}` : '';
  React.useEffect(() => {
    if (!draggablePin || !focus) return;
    const map = mapRef.current;
    const maps = mapsRef.current;
    if (!map || !maps) return;
    // 방금 핀·지도 드래그가 돌려준 좌표면 이미 그 자리다 — 다시 옮기면 드래그가 튄다.
    const at = map.getCenter();
    if (Math.abs(at.getLat() - focus.lat) < 1e-6 && Math.abs(at.getLng() - focus.lng) < 1e-6) return;
    const next = new maps.LatLng(focus.lat, focus.lng);
    map.setCenter(next);
    if (pinRef.current) pinRef.current.setPosition(next);
  }, [draggablePin, centerKey, live]);

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
      {mapError && (
        <div role="alert" data-testid="minimap-error" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 12, lineHeight: '18px', color: T.text500 }}>지도를 불러오지 못했어요.<br/>인터넷 연결을 확인하고 다시 시도해 주세요.</div>
          <button
            type="button"
            data-testid="minimap-retry"
            onClick={() => setMapRetryKey((key) => key + 1)}
            style={{ height: 32, padding: '0 14px', borderRadius: 999, border: `1px solid ${T.line200}`, background: T.bgBase, color: T.primary600, fontSize: 12, fontWeight: 800, fontFamily: T.fontStack, cursor: 'pointer' }}>다시 시도</button>
        </div>
      )}
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
  inputLabel = '메시지 입력', sendLabel = '전송', testId, readOnly = false,
  // 서버 한도다. 채팅 메시지 1000(`SendChatMessageRequest`), 댓글 500(`CreateFeedCommentRequest`).
  // **HTML maxLength 를 쓰지 않는다** — 붙여넣기가 말없이 잘린다. 넘친 만큼을 세어 보여주고
  // 전송만 잠근다 (W-17 · 안드 AND-62 와 같은 규칙).
  limit = 1000,
}) {
  // readOnly 는 **쓸 수 없는 방**(불발 등)에서 쓴다. 쓰게 해 놓고 보낸 뒤에 막으면
  // 다 쓴 글이 그대로 남은 채 서버 원문 오류만 뜬다 (웹 W-112 · 안드 AND-115).
  const text = String(value || '');
  const over = text.length - limit;
  const ready = !readOnly && text.trim().length > 0 && over <= 0;
  return (
    <>
      <span style={{ flex: 1, minWidth: 0, position: 'relative', display: 'block' }}>
        {over > 0 && (
          <span
            role="status"
            data-testid={testId ? `${testId}-over` : undefined}
            style={{
              position: 'absolute', left: 12, bottom: '100%', marginBottom: 4,
              fontSize: 11, fontWeight: 800, color: T.danger, whiteSpace: 'nowrap',
              fontVariantNumeric: 'tabular-nums',
            }}
          >{text.length}/{limit} · {over}자 넘었어요</span>
        )}
        <input
          type="text"
          value={value}
          onChange={(event) => { if (!readOnly) onChange(event.target.value); }}
          placeholder={placeholder}
          aria-label={inputLabel}
          readOnly={readOnly}
          aria-readonly={readOnly || undefined}
          aria-invalid={over > 0 || undefined}
          data-testid={testId ? `${testId}-input` : undefined}
          style={{
            width: '100%', minWidth: 0, height, borderRadius: 999, boxSizing: 'border-box',
            border: `1px solid ${over > 0 ? T.danger : T.line200}`, background: readOnly ? T.bgSubtle : 'transparent',
            padding: '0 14px', fontSize, fontFamily: T.fontStack, color: readOnly ? T.text400 : T.text900, outline: 'none',
            cursor: readOnly ? 'not-allowed' : 'auto',
          }}
        />
      </span>
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

// ── 정산 금액 신고 안내 (2026-09-14 사용자 결정) ──
// 정산은 **서비스가 중개하지 않는 사람 간 거래**다. 서버가 금액을 검증하지 않고, 모여트립이
// 환불·보상을 하지도 않는다. 그래서 「돌려드릴게요」로 읽히는 말을 쓰지 않고 사실만 적는다.
// 신고 사유는 서버 `UNFAIR_SETTLEMENT`(부당한 정산 요구) 로 이어진다.
// **세 표면(웹·iOS·안드로이드) 문구가 글자까지 같아야 한다** — 고칠 때 셋을 함께 고친다.
const SETTLEMENT_REPORT_GUIDE = '금액이 부당하다고 느끼면 신고할 수 있어요. 정산은 멤버끼리 직접 하는 거래라 모여트립이 중개하지 않아요.';
// 안내에서 신고로 이어질 때 미리 골라 두는 서버 사유 코드.
// 목록 자체는 서버(GET /api/v1/chat-rooms/member-report-reasons)가 준다 — 코드 하나만 안다.
const SETTLEMENT_REPORT_REASON = 'UNFAIR_SETTLEMENT';

// ── 이미 처리된 친구 신청 (27-2 친구 관리 · 13 알림 목록 공용) ──
// 같은 API 를 부르는 화면이 둘인데 한쪽만 이 갈래를 알고 있으면 같은 상황에서 다른 말을 한다
// (알림 목록은 「처리하지 못했어요」라고만 해서 사용자가 계속 눌렀다).
// 문구는 클라이언트가 소유한다 — 서버 `errorMessage` 를 그대로 올리지 않는다 (결정 ⑩).
const MOYEO_FRIEND_REQUEST_GONE_CODES = ['40419', '40420'];
const MOYEO_FRIEND_REQUEST_GONE_MESSAGE = '상대가 먼저 처리해서 이 신청은 사라졌어요.';
function isFriendRequestGone(error) {
  return MOYEO_FRIEND_REQUEST_GONE_CODES.includes(String(error?.code ?? ''));
}

// ── 손가락이 닿는 넓이 (QA ENV-009) ──
// 아이콘만 한 버튼은 **보이는 크기가 곧 누를 수 있는 크기**라, 20×16 짜리 순서 이동 화살표처럼
// 작은 것은 실기기에서 자주 빗나간다. 보이는 모양은 그대로 두고 **닿는 넓이만** 넓힌다 —
// 버튼 안에 투명한 조각을 하나 깔면 그 조각을 눌러도 버튼이 눌린다. 레이아웃은 움직이지 않는다.
// (WCAG 2.5.8 최소 24×24 · 애플 HIG 44×44 — 44 로 맞춘다.)
function TouchTarget({ size = 44 }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
        width: size, height: size, borderRadius: 8,
      }}
    />
  );
}

// ── 시트·다이얼로그 접근성 한 곳 (QA ENV-007) ──
//
// 웹에는 시트·모달이 스무 곳 가까이 있는데 **어느 것도** 포커스를 다루지 않았다.
// 열려도 포커스는 `BODY` 에 남고, 닫아도 열었던 버튼으로 돌아오지 않고, Tab 은 시트 뒤의
// 화면으로 새고, 스크린리더는 화면이 바뀐 것조차 알 수 없었다(신고 시트는 `role` 자체가 없었다).
//
// 화면마다 따로 고치면 반드시 갈라진다 — **이 훅 하나**가 네 가지를 함께 책임진다.
//   ① `role="dialog"` · `aria-modal="true"` · 접근 가능한 이름
//   ② 열리면 시트 안 첫 초점 대상으로 이동, 닫히면 **열었던 컨트롤로 복귀**
//   ③ Tab 이 시트 밖으로 새지 않게 가둔다 (Shift+Tab 포함) · `Esc` 로 닫는다
//   ④ 시트 밖 내용은 `inert` + `aria-hidden` — 스크린리더가 읽지 않는다
//
// 쓰는 쪽은 시트 루트에 `{...sheet.rootProps}` 를 펼치기만 한다.
const SHEET_FOCUSABLE_SELECTOR = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])', 'select:not([disabled])',
  'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',');
function sheetFocusables(root) {
  if (!root) return [];
  return Array.from(root.querySelectorAll(SHEET_FOCUSABLE_SELECTOR)).filter((node) => {
    if (node.hasAttribute('aria-hidden') || node.closest('[aria-hidden="true"]')) return false;
    // 화면에 그려지지 않은 것(숨김·접힌 영역)은 Tab 순서에도 없다.
    return Boolean(node.offsetWidth || node.offsetHeight || node.getClientRects().length);
  });
}
// 시트 **밖**을 보조기기에서 감춘다. 루트에서 body 까지 올라가며 형제들만 표시해 두고,
// 닫을 때 손댄 것만 원래대로 되돌린다(원래 `aria-hidden` 이 있던 것을 지우지 않는다).
function hideOutsideSheet(root) {
  const touched = [];
  let node = root;
  while (node && node.parentElement) {
    const parent = node.parentElement;
    Array.from(parent.children).forEach((sibling) => {
      if (sibling === node || sibling.hasAttribute('data-moyeo-sheet-hidden')) return;
      touched.push({ node: sibling, ariaHidden: sibling.getAttribute('aria-hidden'), inert: sibling.hasAttribute('inert') });
      sibling.setAttribute('data-moyeo-sheet-hidden', '');
      sibling.setAttribute('aria-hidden', 'true');
      // `inert` 는 포커스·클릭까지 막는다. 지원하지 않는 브라우저에서는 아래 Tab 가두기가 받는다.
      sibling.inert = true;
    });
    if (parent === document.body) break;
    node = parent;
  }
  return () => touched.forEach(({ node: sibling, ariaHidden, inert }) => {
    sibling.removeAttribute('data-moyeo-sheet-hidden');
    if (ariaHidden == null) sibling.removeAttribute('aria-hidden');
    else sibling.setAttribute('aria-hidden', ariaHidden);
    sibling.inert = inert;
  });
}
// 화면째 바뀌는 시트(`nav.go('report')` 같은 것)는 **열리기 전에 이전 화면이 이미 사라진다** —
// 시트가 마운트되는 시점의 `document.activeElement` 는 벌써 `BODY` 다. 그래서 마지막으로
// 포커스를 받았던 컨트롤을 앱 전체에서 한 곳에 적어 두고, 닫을 때 그리로 돌려준다.
let lastFocusedControl = null;
let lastFocusedControlTestId = null;
function rememberOpener(node) {
  if (!node || node === document.body || typeof node.focus !== 'function') return;
  lastFocusedControl = node;
  lastFocusedControlTestId = node.getAttribute?.('data-testid') || null;
}
if (typeof document !== 'undefined') {
  // **누른 것**을 적는다. 시트를 여는 것은 거의 언제나 사용자가 누른 컨트롤이고,
  // 클릭은 창이 뒤에 있어도 온다(포커스 이벤트는 창이 활성일 때만 온다 — 그것만 믿으면 놓친다).
  document.addEventListener('click', (event) => {
    rememberOpener(event.target?.closest?.(SHEET_FOCUSABLE_SELECTOR));
  }, true);
  document.addEventListener('focusin', (event) => rememberOpener(event.target), true);
}
// @param label      시트 이름. 제목을 그대로 넣는다(`labelledBy` 를 쓰면 생략).
// @param labelledBy 시트 안 제목 요소의 id. 화면에 이미 제목이 있으면 이쪽이 낫다.
// @param onClose    `Esc` 와 딤 탭이 부르는 닫기. 없으면 `Esc` 로 닫지 않는다(닫을 길이 없는 시트).
function useSheetA11y({ label, labelledBy, onClose } = {}) {
  // **콜백 ref** 다. 시트는 조건부로 그려지기도 하고(같은 화면 안의 확인 팝업),
  // 화면이 준비된 뒤에야 그려지기도 한다 — `useRef` + `[]` 로는 "붙는 순간"을 놓쳐
  // 포커스가 영영 안 들어간다. 노드가 붙고 떨어질 때마다 아래 효과가 다시 돈다.
  const [root, setRoot] = React.useState(null);
  const closeRef = React.useRef(onClose);
  closeRef.current = onClose;
  React.useEffect(() => {
    if (!root) return undefined;
    // 열었던 컨트롤. 화면째 바뀌는 시트는 그 노드가 사라지므로 `data-testid` 도 함께 적어 둔다.
    const live = document.activeElement;
    const opener = (live && live !== document.body) ? live : lastFocusedControl;
    const openerTestId = opener?.getAttribute?.('data-testid') || lastFocusedControlTestId;
    const restoreOutside = hideOutsideSheet(root);
    // 시트 안 첫 초점 대상으로. 없으면 시트 자신(tabIndex -1)에 둔다 — 최소한 화면이 바뀐 것은 읽힌다.
    const keepFocusInside = () => {
      if (root.contains(document.activeElement)) return;
      const items = sheetFocusables(root);
      (items[0] || root).focus({ preventScroll: true });
    };
    keepFocusInside();
    // 시트 안이 나중에 다시 그려지면(사유 목록이 뒤늦게 와서 버튼이 통째로 갈리는 경우가 그렇다)
    // 포커스를 쥐고 있던 노드가 사라져 **body 로 떨어진다.** 그때 다시 안으로 데려온다.
    const observer = typeof window.MutationObserver === 'function' ? new window.MutationObserver(keepFocusInside) : null;
    if (observer) observer.observe(root, { childList: true, subtree: true });
    // `inert` 를 모르는 브라우저에서도 시트 밖으로 포커스가 새지 않게 한다.
    const onFocusIn = (event) => { if (!root.contains(event.target)) keepFocusInside(); };
    document.addEventListener('focusin', onFocusIn, true);
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (!closeRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = sheetFocusables(root);
      if (items.length === 0) { event.preventDefault(); root.focus({ preventScroll: true }); return; }
      const head = items[0];
      const tail = items[items.length - 1];
      const current = document.activeElement;
      if (!root.contains(current)) { event.preventDefault(); (event.shiftKey ? tail : head).focus(); return; }
      if (event.shiftKey && current === head) { event.preventDefault(); tail.focus(); }
      else if (!event.shiftKey && current === tail) { event.preventDefault(); head.focus(); }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('focusin', onFocusIn, true);
      if (observer) observer.disconnect();
      restoreOutside();
      // 시트가 화면째였으면 원래 노드는 이미 없다 — 같은 `data-testid` 를 다시 찾아 돌려준다.
      // 그 화면이 다시 그려진 뒤여야 하므로 한 프레임 미룬다.
      const restoreFocus = () => {
        if (opener && opener.isConnected && typeof opener.focus === 'function') { opener.focus({ preventScroll: true }); return true; }
        if (!openerTestId) return true;
        const again = document.querySelector(`[data-testid="${openerTestId}"]`);
        if (!again || typeof again.focus !== 'function') return false;
        again.focus({ preventScroll: true });
        return document.activeElement === again;
      };
      // 화면째 바뀌는 시트는 **이전 화면이 다시 그려지고 서버 응답이 온 뒤에야** 그 버튼이 생긴다.
      // 한 프레임만 기다리면 아직 없어서 포커스가 body 에 남는다 — 잠깐 동안만 몇 번 더 본다.
      const delays = [0, 60, 160, 320, 600];
      const tryRestore = (index) => {
        if (restoreFocus()) return;
        if (index >= delays.length) return;
        window.setTimeout(() => tryRestore(index + 1), delays[index]);
      };
      tryRestore(0);
    };
  }, [root]);
  return {
    ref: setRoot,
    rootProps: {
      ref: setRoot,
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': labelledBy ? undefined : label,
      'aria-labelledby': labelledBy,
      tabIndex: -1,
    },
  };
}

Object.assign(window, { useSheetA11y, MOYEO_FRIEND_REQUEST_GONE_CODES, MOYEO_FRIEND_REQUEST_GONE_MESSAGE, isFriendRequestGone, TouchTarget, Phone, AnimalAvatar, ProgressBar, ImgPlaceholder, MiniMap, BottomNav, Chip, Btn, BearChar, BearGroup, CategoryChip, Composer, isDirectScreenEntry, userFacingError, MOYEO_NETWORK_ERROR_MESSAGE, MOYEO_TOO_MANY_REQUESTS_MESSAGE, MOYEO_FORBIDDEN_MESSAGE, SETTLEMENT_REPORT_GUIDE, SETTLEMENT_REPORT_REASON, screenErrorText, errorAllowsRetry, isMaintenanceError, MOYEO_NOTICE_CONFLICT_CODE, MOYEO_NOTICE_CONFLICT_MESSAGE, isNoticeConflictError, MOYEO_TRIP_CONFIRM_SHORT_CODE, isTripConfirmShortError, moyeoTripConfirmShortMessage, MOYEO_MAINTENANCE_CODE, MOYEO_MAINTENANCE_MESSAGE, MOYEO_PUSH_BLOCK_COPY, useMoyeoPushBlock });
