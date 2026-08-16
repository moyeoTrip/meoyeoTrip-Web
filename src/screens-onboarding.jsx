// Onboarding & Profile screens

// Helper: top nav bar
function TopBar({ title, leftIcon = 'back', rightIcons = [], step, transparent = false, dark = false }) {
  return (
    <div style={{
      height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12,
      background: transparent ? 'transparent' : T.bgRaised,
      borderBottom: transparent ? 'none' : `1px solid ${T.line100}`,
      position: 'relative',
    }}>
      {leftIcon && (
        <div style={{ width: 44, height: 44, marginLeft: -12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={leftIcon} size={24} color={dark ? T.text900 : T.text900}/>
        </div>
      )}
      <div style={{ flex: 1, fontSize: 16, fontWeight: 600, color: dark ? T.text900 : T.text900 }}>{title}</div>
      {step && (
        <div style={{ fontSize: 14, fontWeight: 500, color: T.text500 }}>{step}</div>
      )}
      {rightIcons.map((ic, i) => (
        <div key={i} style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: i === rightIcons.length - 1 ? -12 : 0 }}>
          <Icon name={ic} size={24} color={dark ? T.text700 : T.text700}/>
        </div>
      ))}
    </div>
  );
}

function AuthProgressHeader({ label, current, total = 7, showBack = false, onBack, onSkip }) {
  const progress = Math.max(0, Math.min(1, current / total));
  return (
    <div data-testid="auth-progress-header" style={{ padding: '6px 18px 12px', background: T.bgBase }}>
      <div style={{ height: 38, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {showBack ? (
          <button
            type="button"
            aria-label="이전"
            onClick={onBack}
            style={{ width: 38, height: 38, border: 0, padding: 0, background: 'transparent', color: T.text900, display: 'grid', placeItems: 'center', cursor: 'pointer' }}
          >
            <Icon name="back" size={22}/>
          </button>
        ) : (
          <span aria-hidden="true" style={{ width: 38, height: 38 }}/>
        )}
        {onSkip ? (
          <button
            type="button"
            onClick={onSkip}
            style={{ minWidth: 62, height: 38, border: 0, padding: '0 4px', background: 'transparent', color: T.text500, fontSize: 13, fontWeight: 700, fontFamily: T.fontStack, cursor: 'pointer' }}
          >건너뛰기</button>
        ) : (
          <span aria-hidden="true" style={{ width: 38, height: 38 }}/>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 9 }}>
        <span style={{ color: T.primary600, fontSize: 14, fontWeight: 900 }}>{label}</span>
        <span data-testid="auth-progress-step" style={{ color: T.text500, fontSize: 12, fontWeight: 700 }}>{current}/{total}</span>
      </div>
      <div aria-label={`${current}/${total} 단계`} style={{ height: 6, marginTop: 9, borderRadius: 999, overflow: 'hidden', background: T.line100 }}>
        <div style={{ width: `${progress * 100}%`, height: '100%', borderRadius: 999, background: T.primary500, transition: 'width 220ms ease' }}/>
      </div>
    </div>
  );
}

// 1.1 Splash
function ScreenSplash() {
  return (
    <Phone>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: T.bgBase, paddingTop: 0 }}>
        <div style={{
          width: 88, height: 88, borderRadius: 24, background: T.primary50,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: -40, marginTop: -40,
          position: 'relative',
        }}>
          {/* Brand mark — abstract stacked mountains + dot */}
          <svg width="56" height="56" viewBox="0 0 64 64">
            <path d="M8 50 L22 28 L34 44 L46 22 L56 50 Z" fill={T.primary500}/>
            <circle cx="22" cy="20" r="6" fill={T.accent500}/>
          </svg>
        </div>
        <div style={{ height: 40 }}/>
        <div style={{ fontSize: 26, lineHeight: '34px', fontWeight: 700, color: T.text900, letterSpacing: '-0.5px' }}>모여트립 in 경북</div>
        <div style={{ height: 8 }}/>
        <div style={{ fontSize: 14, color: T.text500 }}>동물 친구와 떠나는 여행</div>
        <div style={{ position: 'absolute', bottom: 120, display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: 999, background: i === 1 ? T.primary500 : T.primary200 }}/>
          ))}
        </div>
      </div>
    </Phone>
  );
}

// 1.2 Onboarding card 2
function ScreenOnboarding() {
  const nav = (window.useNav ? window.useNav() : { go: () => {} });
  const requestedPage = Number(new URLSearchParams(window.location.search).get('onboardingPage'));
  const [page, setPage] = React.useState(
    Number.isInteger(requestedPage) && requestedPage >= 1 && requestedPage <= 3
      ? requestedPage - 1
      : 0
  );
  const pages = [
    {
      title: <>고민 없이 고르는<br/>경북 코스</>,
      body: <>날씨와 취향에 맞춰<br/>오늘 떠나기 좋은 코스를 추천해요.</>,
      kind: 'deer',
      active: 0,
      color: T.primary100,
    },
    {
      title: <>3명이 모이면<br/>채팅방이 열려요</>,
      body: <>모집이 확정되면<br/>바로 대화가 시작돼요.</>,
      kind: 'bear',
      active: 1,
      color: T.accent100,
    },
    {
      title: <>여행 뒤엔<br/>자연스럽게 친구로</>,
      body: <>경로 피드와 도감으로<br/>함께한 순간을 남겨요.</>,
      kind: 'rabbit',
      active: 2,
      color: T.primary100,
    },
  ];
  const current = pages[page];
  const next = () => {
    if (page < pages.length - 1) setPage(page + 1);
    else nav.go('login');
  };
  return (
    <Phone>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bgBase, paddingTop: 46 }}>
        <AuthProgressHeader
          label="온보딩"
          current={page + 1}
          showBack={page > 0}
          onBack={() => setPage((value) => Math.max(0, value - 1))}
          onSkip={() => nav.go('login')}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
          {/* Canonical onboarding artwork shared pixel-for-pixel with iOS and Android. */}
          <div
            data-testid="auth-onboarding-illustration"
            data-onboarding-page={page + 1}
            style={{ width: 224, height: 224, position: 'relative', marginBottom: 26, borderRadius: 24, overflow: 'hidden' }}
          >
            <img
              className="moyeo-theme-image moyeo-theme-image-light"
              src={`assets/onboarding-${page + 1}.png?v=20260805`}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
            />
            <img
              className="moyeo-theme-image moyeo-theme-image-dark"
              src={`assets/onboarding-${page + 1}-night.png?v=20260805`}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, lineHeight: '34px', color: T.text900, textAlign: 'center', letterSpacing: '-0.5px' }}>
            {current.title}
          </div>
          <div style={{ height: 16 }}/>
          <div style={{ fontSize: 16, color: T.text500, textAlign: 'center', lineHeight: '24px' }}>
            {current.body}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
          {pages.map((_, i) => (
            <div key={i} style={{ width: i === page ? 24 : 8, height: 8, borderRadius: 999, background: i === page ? T.primary500 : T.line200 }}/>
          ))}
        </div>
        <div style={{ padding: '0 20px 40px' }}>
          <div onClick={next} style={{ cursor: 'pointer' }}><Btn variant="primary" full>{page === pages.length - 1 ? '로그인 시작' : '다음'}</Btn></div>
        </div>
      </div>
    </Phone>
  );
}

// 1.4 Profile setup Step 1 - nickname cards
const NICKNAME_CANDIDATE_BATCHES = [
  ['따스한 사슴 3492', '잔잔한 거북이 1108', '호기심 많은 너구리 9027'],
  ['명랑한 수달 4816', '포근한 여우 7350', '용감한 토끼 2641'],
  ['차분한 두루미 6184', '씩씩한 고슴도치 5739', '다정한 판다 8206'],
  ['산뜻한 다람쥐 4175', '빛나는 부엉이 9362', '느긋한 코알라 2058'],
  ['행복한 해달 7643', '든든한 기린 3819', '수줍은 펭귄 5407'],
];

const DEFAULT_NICKNAME_DESCRIPTION = '함께 천천히 경북을 둘러보는 여행자예요';
const NICKNAME_COLORS = {
  RED: { hex: '#E65B58', label: '빨강' }, ORANGE: { hex: '#ED8A3D', label: '주황' },
  YELLOW: { hex: '#D6A928', label: '노랑' }, GREEN: { hex: '#3D9B63', label: '초록' },
  BLUE: { hex: '#4B7EDB', label: '파랑' }, NAVY: { hex: '#40547A', label: '남색' },
  PURPLE: { hex: '#8A63B8', label: '보라' }, PINK: { hex: '#D96F98', label: '분홍' },
  SKY_BLUE: { hex: '#58A9D6', label: '하늘' }, MINT: { hex: '#55B99A', label: '민트' },
};
const ANIMAL_EMOJIS = {
  사슴: '🦌', 거북이: '🐢', 토끼: '🐰', 여우: '🦊', 수달: '🦦', 다람쥐: '🐿️',
  고양이: '🐱', 강아지: '🐶', 판다: '🐼', 펭귄: '🐧', 돌고래: '🐬', 부엉이: '🦉',
  참새: '🐦', 알파카: '🦙', 코알라: '🐨', 두루미: '🪽', 해달: '🦦',
  고슴도치: '🦔', 너구리: '🦝', 기린: '🦒',
};

function mockNicknameCandidate(nickname, index = 0) {
  const words = nickname.split(' ');
  return {
    nickname,
    adjective: words[0] || '',
    animal: words.at(-2) || '',
    color: Object.keys(NICKNAME_COLORS)[index % Object.keys(NICKNAME_COLORS).length],
    description: DEFAULT_NICKNAME_DESCRIPTION,
  };
}

function nicknameParts(nickname) {
  const match = nickname.match(/^(.*)\s(\d{3,4})$/);
  return match ? { name: match[1], number: match[2] } : { name: nickname, number: '' };
}

async function requestNicknameCandidates(nextBatchIndex) {
  const authConfig = window.MoyeoAuth?.getConfig?.() || {};
  const useRealBackend = !authConfig.mockBackend;
  const apiBase = String(authConfig.baseUrl || 'https://moyeo-trip-api.jayden-bin.cc').replace(/\/$/, '');
  if (useRealBackend) {
    const response = await fetch(`${apiBase}/api/v1/auth/nickname-candidates`, { method: 'POST' });
    if (!response.ok) throw new Error(`nickname candidates: ${response.status}`);
    const payload = await response.json();
    if (!Array.isArray(payload.candidates) || payload.candidates.length !== 3) {
      throw new Error('nickname candidates: invalid response');
    }
    const candidates = payload.candidates.map((candidate) => (
      typeof candidate === 'string'
        ? mockNicknameCandidate(candidate)
        : {
            nickname: candidate?.nickname,
            adjective: candidate?.adjective,
            animal: candidate?.animal,
            color: candidate?.color,
            description: candidate?.description || DEFAULT_NICKNAME_DESCRIPTION,
          }
    ));
    if (candidates.some((candidate) => typeof candidate.nickname !== 'string' || !candidate.nickname.trim())) {
      throw new Error('nickname candidates: invalid candidate');
    }
    return { ...payload, candidates };
  }

  await new Promise((resolve) => window.setTimeout(resolve, 560));
  return {
    selectionToken: `prototype-batch-${nextBatchIndex}`,
    candidates: NICKNAME_CANDIDATE_BATCHES[nextBatchIndex].map(mockNicknameCandidate),
  };
}

function ScreenProfileNickname() {
  const nav = (window.useNav ? window.useNav() : { go: () => {} });
  const [candidates, setCandidates] = React.useState(
    NICKNAME_CANDIDATE_BATCHES[0].map(mockNicknameCandidate)
  );
  const [selectedNickname, setSelectedNickname] = React.useState('');
  const [refreshCount, setRefreshCount] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [refreshError, setRefreshError] = React.useState(false);

  React.useEffect(() => {
    if (window.__moyeoNicknameSelectionToken) return undefined;
    let cancelled = false;
    const loadInitialCandidates = async () => {
      setIsRefreshing(true);
      try {
        const payload = await requestNicknameCandidates(0);
        if (cancelled) return;
        window.__moyeoNicknameSelectionToken = payload.selectionToken;
        setCandidates(payload.candidates);
      } catch (_) {
        if (!cancelled) setRefreshError(true);
      } finally {
        if (!cancelled) setIsRefreshing(false);
      }
    };
    loadInitialCandidates();
    return () => { cancelled = true; };
  }, []);

  const refreshCandidates = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setRefreshError(false);
    const nextBatchIndex = (refreshCount + 1) % NICKNAME_CANDIDATE_BATCHES.length;
    try {
      const payload = await requestNicknameCandidates(nextBatchIndex);
      window.__moyeoNicknameSelectionToken = payload.selectionToken;
      setCandidates(payload.candidates);
      setSelectedNickname('');
      setRefreshCount((count) => count + 1);
    } catch {
      setRefreshError(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Phone>
      <div style={{ height: '100%', background: T.bgBase, paddingTop: 54, display: 'flex', flexDirection: 'column' }}>
        <style>{`
          @keyframes nickname-skeleton { 0% { opacity: .38; } 50% { opacity: .75; } 100% { opacity: .38; } }
          @keyframes nickname-arrive { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
        <AuthProgressHeader label="프로필 설정" current={5} showBack onBack={() => nav.back()}/>
        <div style={{ padding: '20px 20px 0', flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: 24, fontWeight: 700, lineHeight: '32px', color: T.text900, letterSpacing: '-0.5px' }}>
            어떤 친구로<br/>시작할까요?
          </div>
          <div style={{ height: 12 }}/>
          <div style={{ fontSize: 14, color: T.text500, lineHeight: '22px' }}>
            본명 대신 동물 친구로 만나요.<br/>이름을 고르면 캐릭터를 그려드릴게요.
          </div>
          <div style={{ height: 24 }}/>
          {isRefreshing ? [0, 1, 2].map((index) => (
            <div key={index} aria-label="새 닉네임 불러오는 중" style={{
              height: 94, background: T.bgRaised, borderRadius: 16, padding: 14,
              border: `1px solid ${T.line100}`, marginBottom: 12,
              display: 'flex', alignItems: 'center', gap: 14,
              animation: 'nickname-skeleton 900ms ease-in-out infinite',
            }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: T.line100 }}/>
              <div style={{ flex: 1 }}>
                <div style={{ width: '58%', height: 14, borderRadius: 7, background: T.line100 }}/>
                <div style={{ width: 42, height: 11, borderRadius: 6, background: T.line100, marginTop: 9 }}/>
              </div>
            </div>
          )) : candidates.map((candidate, index) => {
            const parts = nicknameParts(candidate.nickname);
            const selected = selectedNickname === candidate.nickname;
            const color = NICKNAME_COLORS[candidate.color] || NICKNAME_COLORS.MINT;
            const animalEmoji = ANIMAL_EMOJIS[candidate.animal] || '🐾';
            return (
              <button
                type="button"
                key={candidate.nickname}
                data-testid={`nickname-option-${index}`}
                aria-pressed={selected}
                onClick={() => setSelectedNickname(candidate.nickname)}
                style={{
                  width: '100%', background: T.bgRaised, borderRadius: 16, padding: 14,
                  border: selected ? `2px solid ${T.primary500}` : `1px solid ${T.line200}`,
                  marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14, position: 'relative',
                  boxShadow: selected ? T.l1 : 'none', cursor: 'pointer', fontFamily: T.fontStack,
                  textAlign: 'left', animation: `nickname-arrive 260ms ease-out ${index * 60}ms both`,
                }}
              >
                <div style={{
                  width: 64, height: 64, borderRadius: 16, background: `${color.hex}2E`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <div style={{ fontSize: 30 }}>{animalEmoji}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: T.text900 }}>{parts.name}</div>
                    {parts.number && <div style={{ fontSize: 13, color: T.text500, fontVariantNumeric: 'tabular-nums' }}>{parts.number}</div>}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.text500, marginLeft: 2 }}>
                      <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 999, background: color.hex }}/>
                      {color.label}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 13, color: T.text500, lineHeight: '18px', marginTop: 4,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {candidate.description}
                  </div>
                </div>
                {selected && (
                  <div style={{
                    width: 24, height: 24, borderRadius: 999, background: T.primary500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon name="check" size={16} color="#fff" strokeWidth={3}/>
                  </div>
                )}
              </button>
            );
          })}
          <div style={{ marginTop: 4 }}>
            <Btn
              variant="secondary"
              full
              icon="refresh"
              disabled={isRefreshing}
              onClick={refreshCandidates}
              ariaLabel="서버에서 다른 닉네임 세 개 추천받기"
              testId="nickname-refresh"
            >
              {isRefreshing ? '새 이름을 받고 있어요...' : '다른 이름 추천받기'}
            </Btn>
          </div>
          <div role="status" style={{ fontSize: 12, color: refreshError ? T.danger : T.text400, textAlign: 'center', marginTop: 10 }}>
            {refreshError
              ? '새 이름을 불러오지 못했어요. 다시 시도해주세요.'
              : '마음에 들 때까지 새 후보를 받아보세요'}
          </div>
        </div>
        <div style={{ padding: '12px 20px 32px', borderTop: `1px solid ${T.line100}` }}>
          <Btn
            variant="primary"
            full
            disabled={!selectedNickname || isRefreshing}
            onClick={() => {
              window.__moyeoSelectedNickname = selectedNickname;
              nav.go('prof-3');
            }}
            testId="nickname-next"
          >다음</Btn>
        </div>
      </div>
    </Phone>
  );
}

function ProfileGenerationWaiting({ nickname }) {
  const messages = [
    '닉네임에서 여행 친구의 분위기를 찾고 있어요',
    '어울리는 표정과 성격을 떠올리고 있어요',
    '여행 친구의 옷과 색을 고르고 있어요',
    '경북 여행에 어울리는 소품을 더하고 있어요',
    '마지막 색을 입히고 있어요',
  ];
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const message = messages[Math.min(Math.floor(elapsed / 4), messages.length - 1)];
  return (
    <div
      role="status"
      data-testid="profile-image-generating"
      aria-label={`프로필 이미지 생성 중, ${message}`}
      style={{
        marginTop: 16, padding: 16, borderRadius: 14, border: `1px solid ${T.line200}`,
        background: T.bgRaised, textAlign: 'center', display: 'grid', gap: 10,
      }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 999, margin: '0 auto', background: T.primary50, display: 'grid', placeItems: 'center' }}>
        <Icon name="sparkle" size={24} color={T.primary500}/>
      </div>
      <div style={{ fontSize: 14, lineHeight: '20px', fontWeight: 700, color: T.text900 }}>{message}</div>
      <div style={{ fontSize: 12, lineHeight: '18px', color: T.text500 }}>
        ‘{nickname}’만의 경북 여행 친구를 만들고 있어요
      </div>
      <div style={{ height: 6, borderRadius: 999, overflow: 'hidden', background: T.line100 }}>
        <div className="profile-generation-progress" style={{ height: '100%', width: '42%', borderRadius: 999, background: T.primary500 }}/>
      </div>
      <div style={{ fontSize: 11, lineHeight: '17px', color: T.text400 }}>
        조금 오래 걸릴 수 있어요. 다른 화면으로 이동해도 완성된 후보는 서버에 보관돼요.
      </div>
      <style>{`@keyframes moyeo-profile-progress { 0% { transform: translateX(-120%); } 100% { transform: translateX(340%); } } .profile-generation-progress { animation: moyeo-profile-progress 1.8s ease-in-out infinite; }`}</style>
    </div>
  );
}

// Step 2 - character generated
function ScreenProfileCharacter() {
  const nav = (window.useNav ? window.useNav() : { go: () => {} });
  const nickname = window.__moyeoSelectedNickname || '선택한 닉네임';
  const [candidates, setCandidates] = React.useState([]);
  const [selectedId, setSelectedId] = React.useState(null);
  const [remaining, setRemaining] = React.useState(3);
  const [loading, setLoading] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState('');
  const prepareStarted = React.useRef(false);

  const generate = React.useCallback(async () => {
    if (loading || remaining === 0) return;
    setLoading(true);
    setIsGenerating(true);
    setError('');
    try {
      const response = await window.MoyeoAuth.generateProfileImage();
      setCandidates((current) => [...current.filter((item) => item.profileImageId !== response.candidate.profileImageId), response.candidate]);
      setSelectedId(response.candidate.profileImageId);
      setRemaining(response.remainingGenerationCount);
    } catch (requestError) {
      setError(requestError?.message || '프로필 이미지를 만들지 못했어요. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
      setLoading(false);
    }
  }, [loading, remaining]);

  React.useEffect(() => {
    if (prepareStarted.current) return undefined;
    prepareStarted.current = true;
    let cancelled = false;
    const prepare = async () => {
      setLoading(true);
      try {
        const response = await window.MoyeoAuth.getProfileImages();
        if (cancelled) return;
        setCandidates(response.candidates || []);
        setRemaining(response.remainingGenerationCount ?? 3);
        const selected = response.candidates?.find((candidate) => candidate.selected);
        if (selected) setSelectedId(selected.profileImageId);
      } catch (requestError) {
        if (!cancelled) setError(requestError?.message || '프로필 이미지 후보를 불러오지 못했어요.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    prepare();
    return () => { cancelled = true; };
  }, []);

  const complete = async () => {
    if (!selectedId || loading) return;
    setLoading(true);
    setError('');
    try {
      const response = await window.MoyeoAuth.selectProfileImage(selectedId);
      if (response.signupState === 'SIGNUP_COMPLETE') nav.go('home', { replace: true });
    } catch (requestError) {
      setError(requestError?.message || '프로필 이미지를 선택하지 못했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Phone>
      <div style={{ height: '100%', background: T.bgBase, paddingTop: 54, display: 'flex', flexDirection: 'column' }}>
        <AuthProgressHeader label="프로필 설정" current={7}/>
        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 24, fontWeight: 700, lineHeight: '32px', color: T.text900, letterSpacing: '-0.5px' }}>
            여행에서 만날<br/>내 친구를 골라주세요
          </div>
          <div style={{ fontSize: 14, lineHeight: '21px', color: T.text500, marginTop: 10 }}>
            {nickname} 닉네임을 바탕으로 새 후보를 하나씩 추가해드려요. 이전 후보는 그대로 보관돼요.
          </div>
          {isGenerating && <ProfileGenerationWaiting nickname={nickname}/>}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', alignContent: 'center', gap: 10 }}>
            {!loading && candidates.length === 0 && (
              <div style={{ gridColumn: '1 / -1', minHeight: 150, borderRadius: 18, border: `1px dashed ${T.line300}`, background: T.bgSubtle, display: 'grid', placeItems: 'center', padding: 20, textAlign: 'center', color: T.text500, fontSize: 14, lineHeight: '21px' }}>
                아래 버튼을 눌러 첫 프로필 이미지를 만들어보세요.
              </div>
            )}
            {candidates.map((candidate) => {
              const selected = candidate.profileImageId === selectedId;
              return (
                <button
                  type="button" key={candidate.profileImageId}
                  data-testid={`profile-image-${candidate.profileImageId}`}
                  aria-label={`프로필 이미지 후보 ${candidate.profileImageId} 선택`}
                  onClick={() => setSelectedId(candidate.profileImageId)}
                  style={{
                    height: 150, borderRadius: 18, border: selected ? `2px solid ${T.primary500}` : `1px solid ${T.line200}`,
                    background: T.bgRaised, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', position: 'relative', overflow: 'hidden',
                  }}
                >
                  {candidate.profileImageUrl
                    ? <CachedImage src={candidate.profileImageUrl} alt="생성된 프로필 후보" fallback={<AnimalAvatar kind={candidate.mockKind || 'deer'} size={92} bg={T.primary50}/>} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}/>
                    : <AnimalAvatar kind={candidate.mockKind || 'deer'} size={92} bg={T.primary50}/>}
                  {selected && <div style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 999, background: T.primary500, display: 'grid', placeItems: 'center' }}><Icon name="check" size={15} color="#fff"/></div>}
                </button>
              );
            })}
            {loading && !isGenerating && candidates.length === 0 && [0, 1, 2].map((index) => <div key={index} style={{ height: 150, borderRadius: 18, background: T.line100, opacity: 0.6 }}/>) }
          </div>
          <Btn variant="secondary" full icon="refresh" disabled={loading || remaining === 0} onClick={generate} testId="profile-image-generate">
            {loading ? '새 후보를 만들고 있어요...' : `새 후보 만들기 (${remaining}회 남음)`}
          </Btn>
          <div role="status" style={{ minHeight: 20, marginTop: 10, fontSize: 12, color: error ? T.danger : T.text400, textAlign: 'center' }}>
            {error || '최대 3개 후보 중 고른 한 장이 최종 프로필이 돼요. 나갔다 돌아와도 후보는 다시 불러와요.'}
          </div>
        </div>
        <div style={{ padding: '12px 20px 32px' }}>
          <Btn variant="primary" full disabled={!selectedId || loading} onClick={complete} testId="profile-image-complete">이 친구로 시작하기</Btn>
        </div>
      </div>
    </Phone>
  );
}

Object.assign(window, { ScreenSplash, ScreenOnboarding, ScreenProfileNickname, ScreenProfileCharacter, TopBar, AuthProgressHeader });

// ─── window export ───
Object.assign(window, { ScreenSplash, ScreenOnboarding, ScreenProfileNickname, ScreenProfileCharacter });
