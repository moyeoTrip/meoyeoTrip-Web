// Additional screens to fill gaps in the spec
// Login, Profile Step 3, Terms, Course Detail, Group Create (Step 1, 5),
// Host Mgmt, Chat List, Notifications, Search, Map Explore, Empty States, Special Messages

// ───────── 13 · 로그인 ─────────
function continueAuthFlow(nav, context) {
  if (context?.redirecting) return;
  // AUTH-SILENT-CASES-CANON R2: 사용자가 그만둔 것이다. 다른 화면으로 보내지 않는다.
  if (context?.cancelled) return;
  if (context.login.signupState === 'SIGNUP_COMPLETE') {
    nav.go('home', { replace: true });
  } else if (context.login.signupState === 'PROFILE_IMAGE_REQUIRED') {
    nav.go('prof-2');
  } else {
    nav.go('prof-1');
  }
}

function ScreenLogin() {
  const nav = (window.useNav ? window.useNav() : { go: () => {} });
  const welcomeImage = window.MoyeoImageCache?.themeSource(
    'assets/login-welcome.webp',
    'assets/login-welcome-night.webp',
  ) || 'assets/login-welcome.webp';
  const [loadingProvider, setLoadingProvider] = React.useState('');
  const [error, setError] = React.useState(() => {
    const startupError = window.__moyeoAuthStartupError || '';
    delete window.__moyeoAuthStartupError;
    return startupError;
  });

  const begin = async (provider) => {
    if (loadingProvider) return;
    if (provider === 'email') {
      nav.go('email-auth');
      return;
    }
    setLoadingProvider(provider);
    setError('');
    try {
      const context = await window.MoyeoAuth.begin(provider);
      // 취소면 로딩만 걷고 이 화면에 그대로 머문다 — 오류 문구를 띄우지 않는다 (R1 · R2).
      if (context?.redirecting || context?.cancelled) return;
      continueAuthFlow(nav, context);
    } catch (requestError) {
      setError(requestError?.message || '로그인을 시작하지 못했어요. 다시 시도해주세요.');
    } finally {
      setLoadingProvider('');
    }
  };

  const ProviderButton = ({ provider, background, color, border = 'none', children, icon, fontFamily = T.fontStack }) => (
    <button
      type="button"
      data-testid={`auth-login-${provider}`}
      data-network-action="true"
      disabled={Boolean(loadingProvider)}
      onClick={() => begin(provider)}
      style={{
        height: 52, borderRadius: 12, background, border, position: 'relative', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 15, fontWeight: 600, color,
        fontFamily, cursor: loadingProvider ? 'wait' : 'pointer',
        opacity: loadingProvider && loadingProvider !== provider ? 0.55 : 1,
      }}
    >
      <span aria-hidden="true" style={{ position: 'absolute', left: 66, width: 28, height: 28, display: 'grid', placeItems: 'center' }}>
        {icon}
      </span>
      <span>{loadingProvider === provider ? '로그인 확인 중...' : children}</span>
    </button>
  );
  return (
    <Phone>
      <div data-testid="auth-login-screen" style={{ position: 'absolute', inset: 0, paddingTop: 46, display: 'flex', flexDirection: 'column', background: T.bgBase }}>
        {/* 가입은 7단계 한 흐름이다 — 로그인 방식 선택도 4/7로 위치를 알려준다 */}
        <AuthProgressHeader label="로그인" current={4} showBack onBack={() => nav.back?.()}/>
        <div style={{ flex: 1, minHeight: 0, padding: '10px 18px 28px', overflowY: 'auto' }}>
        <div
          data-testid="auth-login-welcome-image"
          role="img"
          aria-label="반갑게 손을 내밀고 인사하는 모여트립 곰, 토끼, 너구리"
          style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 12, background: T.bgSubtle }}
        >
          <img
            src={welcomeImage}
            alt=""
            loading="eager"
            decoding="async"
            fetchpriority="high"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ marginTop: 22, textAlign: 'left' }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, lineHeight: 1.35, color: T.text900 }}>모여트립에 오신 걸 환영해요</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.5, color: T.text500 }}>마음에 맞는 경북 여행 친구를 만나보세요</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
          <ProviderButton
            provider="kakao" background="#FEE500" color="rgba(0,0,0,0.85)"
            icon={<img src="assets/kakao-mark-official.png" width="25" height="25" alt="" aria-hidden="true" style={{ objectFit: 'contain' }}/>}>
            카카오 로그인
          </ProviderButton>
          <ProviderButton
            provider="google" background="var(--moyeo-google-button-bg)" color="var(--moyeo-google-button-text)"
            border="1px solid var(--moyeo-google-button-border)" fontFamily='"Google Sans", Roboto, Arial, sans-serif'
            icon={<span aria-hidden="true" style={{ width: 19, height: 19, position: 'relative', display: 'block' }}>
              <img className="moyeo-theme-image moyeo-theme-image-light" src="assets/google-g-light-official.png" width="19" height="19" alt="" style={{ position: 'absolute', inset: 0 }}/>
              <img className="moyeo-theme-image moyeo-theme-image-dark" src="assets/google-g-dark-official.png" width="19" height="19" alt="" style={{ position: 'absolute', inset: 0 }}/>
            </span>}
          >Google로 계속하기</ProviderButton>
          <ProviderButton
            provider="email" background={T.bgRaised} color={T.text900} border={`1px solid ${T.line200}`}
            icon={<span aria-hidden="true" style={{ fontSize: 18, color: T.primary600 }}>@</span>}
          >이메일로 시작하기</ProviderButton>
          <ProviderButton
            provider="apple" background={T.text900} color={T.bgBase}
            icon={<span aria-hidden="true" style={{ width: 20, height: 20, position: 'relative', display: 'block' }}>
              <img className="moyeo-theme-image moyeo-theme-image-light" src="assets/apple-mark-white-official.png" width="20" height="20" alt="" style={{ position: 'absolute', inset: 0, objectFit: 'contain' }}/>
              <img className="moyeo-theme-image moyeo-theme-image-dark" src="assets/apple-mark-black-official.png" width="20" height="20" alt="" style={{ position: 'absolute', inset: 0, objectFit: 'contain' }}/>
            </span>}>
            Apple로 계속하기
          </ProviderButton>
          {/* 오류만 알린다 — 신규/기존 분기는 서버가 정하므로 미리 안내하지 않는다 */}
          <div role="status" data-testid="auth-login-status" style={{ minHeight: 18, fontSize: 12, lineHeight: '18px', color: T.danger, textAlign: 'center' }}>
            {error}
          </div>
        </div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 13-1 · 이메일 인증 ─────────
function ScreenEmailAuth() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  // 로그인/새 계정 만들기를 사용자가 먼저 고르지 않는다. 한 번 로그인해 보고 계정이 없으면
  // 그대로 만든다 (auth-api 의 signInOrCreateEmailUser). 소셜 로그인과 같은 흐름이다.
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const canSubmit = /^\S+@\S+\.\S+$/.test(email) && password.length >= 6 && !loading;

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const context = await window.MoyeoAuth.begin('email', { email, password });
      continueAuthFlow(nav, context);
    } catch (requestError) {
      setError(requestError?.message || '이메일 인증을 완료하지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  // 08-H 비밀번호 재설정으로 보낸다. 예전에는 이 자리에서 조용히 메일만 보내고 끝나서,
  // 무엇이 일어났는지·안 오면 어떻게 하는지 알 길이 없었다 (ATTACH-COMPOSER-CANON §6-1).
  // 이미 친 이메일은 그대로 넘겨 두 번 치게 하지 않는다.
  const resetPassword = () => {
    window.MoyeoApi?.selectResetEmail?.(email);
    nav.go('password-reset');
  };

  const fieldStyle = {
    width: '100%', height: 50, borderRadius: 10, border: `1px solid ${T.line200}`,
    background: T.bgRaised, color: T.text900, padding: '0 14px', fontSize: 15, outline: 'none',
  };

  return (
    <Phone>
      <div data-testid="email-auth-screen" style={{ position: 'absolute', inset: 0, padding: '62px 22px 34px', display: 'flex', flexDirection: 'column', background: T.bgBase }}>
        <button type="button" aria-label="뒤로" onClick={() => nav.back()} style={{ width: 44, height: 44, border: 0, background: 'transparent', color: T.text900, display: 'grid', placeItems: 'center', cursor: 'pointer', marginLeft: -10 }}>
          <Icon name="back" size={24}/>
        </button>
        <div style={{ marginTop: 22 }}>
          <h1 style={{ margin: 0, fontSize: 25, lineHeight: 1.35, color: T.text900 }}>이메일로 시작하기</h1>
          <p style={{ margin: '8px 0 0', color: T.text500, fontSize: 14, lineHeight: 1.55 }}>이메일과 비밀번호를 입력하면 로그인하거나 새 계정을 만들어요.</p>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 26 }}>
          <label style={{ display: 'grid', gap: 7, color: T.text700, fontSize: 13, fontWeight: 600 }}>
            이메일
            <input data-testid="email-auth-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" style={fieldStyle}/>
          </label>
          <label style={{ display: 'grid', gap: 7, color: T.text700, fontSize: 13, fontWeight: 600 }}>
            비밀번호
            <input data-testid="email-auth-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="6자 이상 입력" style={fieldStyle}/>
          </label>
          <button data-testid="email-password-reset" type="button" onClick={resetPassword} style={{ alignSelf: 'flex-end', border: 0, padding: '2px 0', background: 'transparent', color: T.primary600, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>비밀번호를 잊으셨나요?</button>
          <button data-testid="email-auth-submit" data-network-action="true" type="submit" disabled={!canSubmit} style={{ height: 50, marginTop: 6, border: 0, borderRadius: 10, background: canSubmit ? T.primary600 : T.bgSubtle, color: canSubmit ? '#fff' : T.text400, fontSize: 15, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'default' }}>
            {loading ? '확인 중...' : '계속하기'}
          </button>
        </form>
        <div role="status" data-testid="email-auth-status" style={{ minHeight: 42, marginTop: 14, color: error ? T.danger : T.primary600, fontSize: 13, lineHeight: 1.5, textAlign: 'center' }}>{error || message}</div>
        <p style={{ margin: 'auto 0 0', color: T.text400, fontSize: 12, lineHeight: 1.55, textAlign: 'center' }}>처음 쓰는 이메일이면 새 계정을 만들고, 가입 진행 단계는 서버 응답에 따라 이어집니다.</p>
      </div>
    </Phone>
  );
}

// ───────── 14 · 프로필 Step 3 (생년월일/성별) ─────────
function KoreanBirthDatePicker({ value, onChange }) {
  // 고르기 전에는 value 가 비어 있다. 피커를 열 때의 시작 위치만 이 날짜로 둔다 —
  // 오늘 날짜에서 시작하면 사용자가 수십 년을 스크롤해야 한다.
  const PICKER_START = { year: 1998, month: 4, day: 12 };
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))
    ? (() => { const [y, m, d] = value.split('-').map(Number); return { year: y, month: m, day: d }; })()
    : null;
  const start = parsed || PICKER_START;
  const { year, month, day } = start;
  const [draft, setDraft] = React.useState(start);
  const [open, setOpen] = React.useState(false);
  const maxYear = new Date().getFullYear();
  const minimumYear = 1900;
  const daysInMonth = (targetYear, targetMonth) => new Date(targetYear, targetMonth, 0).getDate();
  const boundsFor = (field, current) => {
    if (field === 'year') return [minimumYear, maxYear];
    if (field === 'month') return [1, 12];
    return [1, daysInMonth(current.year, current.month)];
  };
  const wrap = (number, [minimum, maximum]) => {
    if (number < minimum) return maximum;
    if (number > maximum) return minimum;
    return number;
  };
  const update = (field, delta) => {
    setDraft((current) => {
      const next = { ...current, [field]: wrap(current[field] + delta, boundsFor(field, current)) };
      next.day = Math.min(next.day, daysInMonth(next.year, next.month));
      return next;
    });
  };
  const confirm = () => {
    onChange(`${draft.year}-${String(draft.month).padStart(2, '0')}-${String(draft.day).padStart(2, '0')}`);
    setOpen(false);
  };
  const WheelColumn = ({ field, label, suffix, width = 1 }) => {
    const bounds = boundsFor(field, draft);
    const current = draft[field];
    return (
      <div style={{ flex: width, minWidth: 0 }}>
        <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: T.text500, marginBottom: 8 }}>{label}</div>
        <button type="button" aria-label={`${label} 이전 값`} onClick={() => update(field, -1)} style={{ width: '100%', height: 30, border: 0, background: 'transparent', display: 'grid', placeItems: 'center', color: T.text400, cursor: 'pointer' }}>
          <span style={{ transform: 'rotate(-90deg)', display: 'block' }}><Icon name="arrow" size={17}/></span>
        </button>
        <div style={{ height: 34, display: 'grid', placeItems: 'center', color: T.text400, fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{wrap(current - 1, bounds)}{suffix}</div>
        <div style={{ height: 52, display: 'grid', placeItems: 'center', borderRadius: 12, background: T.primary50, border: `1.5px solid ${T.primary300}`, color: T.primary700, fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{current}{suffix}</div>
        <div style={{ height: 34, display: 'grid', placeItems: 'center', color: T.text400, fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{wrap(current + 1, bounds)}{suffix}</div>
        <button type="button" aria-label={`${label} 다음 값`} onClick={() => update(field, 1)} style={{ width: '100%', height: 30, border: 0, background: 'transparent', display: 'grid', placeItems: 'center', color: T.text400, cursor: 'pointer' }}>
          <span style={{ transform: 'rotate(90deg)', display: 'block' }}><Icon name="arrow" size={17}/></span>
        </button>
      </div>
    );
  };

  return (
    <>
      <button
        type="button"
        data-testid="auth-birth-date"
        aria-label="생년월일 선택"
        onClick={() => { setDraft({ year, month, day }); setOpen(true); }}
        style={{ width: '100%', minHeight: 58, padding: '0 16px', borderRadius: 14, border: `1px solid ${T.line200}`, background: T.bgRaised, color: T.text900, display: 'flex', alignItems: 'center', gap: 12, fontFamily: T.fontStack, cursor: 'pointer', boxShadow: T.l1 }}
      >
        <span style={{ width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', background: T.primary50, color: T.primary700 }}><Icon name="calendar" size={18}/></span>
        <span style={{ flex: 1, textAlign: 'left', fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: parsed ? T.text900 : T.text400 }}>{parsed ? `${year}년 ${month}월 ${day}일` : '생년월일을 선택해주세요'}</span>
        <Icon name="arrow" size={18} color={T.text400}/>
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="생년월일 선택" data-testid="auth-birth-date-dialog" style={{ position: 'absolute', inset: 0, zIndex: 260, background: T.bgOverlay, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', borderRadius: '22px 22px 0 0', background: T.bgBase, borderTop: `1px solid ${T.line200}`, padding: '10px 20px 30px', boxShadow: T.l3 }}>
            <div style={{ width: 38, height: 4, borderRadius: 999, background: T.line300, margin: '0 auto 16px' }}/>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setOpen(false)} style={{ width: 52, height: 40, border: 0, background: 'transparent', color: T.text500, fontSize: 14, fontWeight: 700, fontFamily: T.fontStack, cursor: 'pointer' }}>취소</button>
              <div style={{ fontSize: 17, fontWeight: 700 }}>생년월일 선택</div>
              <button type="button" data-testid="auth-birth-date-confirm" onClick={confirm} style={{ width: 52, height: 40, border: 0, background: 'transparent', color: T.primary600, fontSize: 14, fontWeight: 700, fontFamily: T.fontStack, cursor: 'pointer' }}>완료</button>
            </div>
            <div style={{ fontSize: 12, color: T.text500, textAlign: 'center', marginTop: 4 }}>연도 · 월 · 일 순서로 선택해 주세요</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginTop: 18 }}>
              <WheelColumn field="year" label="연도" suffix="년" width={1.25}/>
              <WheelColumn field="month" label="월" suffix="월"/>
              <WheelColumn field="day" label="일" suffix="일"/>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// 생년월일 아래 안내 — 공개되는 것은 나이대뿐임을 알려준다.
// 계산 규칙은 iOS `AuthAgeBandNote` · 안드로이드 `ageBandLabel` 과 같다 (0~3 초반 · 4~6 중반 · 그 외 후반).
function ageBandNote(birthDate) {
  const parsed = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate || '');
  if (!parsed) return '나이대만 공개됩니다';
  const born = new Date(Number(parsed[1]), Number(parsed[2]) - 1, Number(parsed[3]));
  if (Number.isNaN(born.getTime())) return '나이대만 공개됩니다';
  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();
  const beforeBirthday = now.getMonth() < born.getMonth()
    || (now.getMonth() === born.getMonth() && now.getDate() < born.getDate());
  if (beforeBirthday) age -= 1;
  if (age < 10) return '나이대만 공개됩니다';
  const remainder = age % 10;
  const phase = remainder <= 3 ? '초반' : (remainder <= 6 ? '중반' : '후반');
  return `나이대만 공개됩니다 (${Math.floor(age / 10) * 10}대 ${phase})`;
}

function ScreenProfileBasic() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  // 고르기 전에는 비어 있다. 미리 채워두면 사용자가 한 번도 고르지 않은 날짜가
  // 본인 생년월일로 저장되고, 연령 확인이 무의미해진다.
  const [birthDate, setBirthDate] = React.useState('');
  // 성별은 사용자가 직접 고르는 값이다 (화면기획·앱과 같이 기본 선택 없음)
  const [gender, setGender] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const nickname = window.__moyeoSelectedNickname || '';

  const submit = async () => {
    if (!birthDate || !gender || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      // 가입 호출은 약관 동의 뒤에 한다 — 서버가 `agreedTermIds` 를 필수로 받는다(없으면 400 40012).
      // 여기서 부르면 사용자가 약관에 동의하기도 전에 계정이 만들어진다.
      window.__moyeoSignupBasics = { gender, birthDate };
      nav.go('prof-4');
    } catch (requestError) {
      setError(requestError?.message || '회원 정보를 저장하지 못했어요. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 46, display: 'flex', flexDirection: 'column', background: T.bgBase }}>
        <AuthProgressHeader label="프로필 설정" current={6} showBack onBack={() => nav.back()}/>
        <div style={{ padding: '8px 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, background: T.bgSubtle, marginBottom: 28 }}>
            <AnimalAvatar kind="deer" size={48} bg={T.primary100}/>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{nickname}</div>
              <div style={{ fontSize: 12, color: T.text500 }}>새 친구가 옆에 앉았어요</div>
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: T.text700, marginBottom: 8 }}>생년월일 <span style={{ color: T.danger }}>*</span></div>
            <KoreanBirthDatePicker value={birthDate} onChange={setBirthDate}/>
            {/* 나이대는 **고른 생년월일**에서 계산한다. 예시로 박아두면 아무것도 고르지 않은 화면에
                "20대 후반" 이 사실처럼 붙는다 — iOS·안드로이드와 같은 규칙으로 맞춘다. */}
            <div style={{ fontSize: 11, color: T.text500, marginTop: 6 }} data-testid="auth-basic-age-band">{ageBandNote(birthDate)}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: T.text700, marginBottom: 8 }}>성별 <span style={{ color: T.danger }}>*</span></div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['F', '여성'], ['M', '남성'], ['N', '선택 안 함']].map(([value, label]) => {
                const selected = gender === value;
                return <button type="button" key={value} data-testid={`auth-gender-${value}`} onClick={() => setGender(value)} style={{ flex: 1, height: 48, borderRadius: 12, background: selected ? T.primary100 : T.bgRaised, border: selected ? `1.5px solid ${T.primary500}` : `1px solid ${T.line200}`, fontSize: 14, fontWeight: selected ? 600 : 500, color: selected ? T.primary700 : T.text700, fontFamily: T.fontStack, cursor: 'pointer' }}>{label}</button>;
              })}
            </div>
          </div>
          <div role="status" style={{ minHeight: 20, marginTop: 14, fontSize: 12, color: error ? T.danger : T.text400, textAlign: 'center' }}>
            {error}
          </div>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ padding: '0 20px 32px', display: 'flex', gap: 8 }}>
          <Btn variant="secondary" onClick={() => nav.back()}>이전</Btn>
          <div style={{ flex: 1 }}><Btn variant="primary" full networkAction disabled={!birthDate || !gender || submitting} onClick={submit} testId="auth-basic-submit">{submitting ? '회원 생성 중...' : '저장하고 다음'}</Btn></div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 06-1 · 여행 취향 (Step 7/8) ─────────
// 여행 스타일과 관심 지역은 항상 한 화면에서 함께 조회·수정한다.
// 가입에서 받은 값은 28 프로필 수정의 "여행 취향" 블록에서 같은 구조로 다시 편집한다.
//
// 후보 목록은 **언제나 서버에서 받는다** — GET /users/me/profile/options.
// 이 API 는 토큰 없이도 200 이라(2026-08-30 직접 확인) 가입 전 단계인 이 화면에서도 부를 수 있다.
// 예전에는 "가입 전엔 못 부른다"는 이유로 서버 시드를 옮겨 적은 거울 표를 들고 있었는데,
// 서버가 시드를 바꾸면 화면이 조용히 어긋나는 구조였다. 그 표는 지웠다(BE 회신 반영 정본 §2-2).

function TasteChip({ label, on, onClick, testId }) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      aria-pressed={on}
      style={{
        height: 38, padding: '0 15px', borderRadius: 999, cursor: 'pointer', fontFamily: T.fontStack,
        fontSize: 13, fontWeight: on ? 700 : 500,
        background: on ? T.primary100 : T.bgRaised,
        border: on ? `1.5px solid ${T.primary500}` : `1px solid ${T.line200}`,
        color: on ? T.primary700 : T.text700,
      }}
    >{label}</button>
  );
}

function ScreenProfileTaste() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  // 로그인(가입을 이미 마친) 상태에서는 후보를 GET users/me/profile/options 로 받고,
  // 저장은 PUT users/me/profile 로 보낸다 (birthDate·gender 는 GET 프로필 값을 그대로 실어 보낸다).
  const liveMode = window.MoyeoApi?.live();
  const [serverOptions, setServerOptions] = React.useState(null);
  const [serverProfile, setServerProfile] = React.useState(null);
  // 아무것도 고르지 않은 상태로 시작한다 — 고르지 않은 취향을 본인 것으로 저장하지 않는다.
  // 라벨이 아니라 **서버 id** 를 담는다. 그래야 가입 요청에 그대로 실을 수 있다.
  const [styleIds, setStyleIds] = React.useState([]);
  const [regionIds, setRegionIds] = React.useState([]);
  const [saving, setSaving] = React.useState(false);
  const [optionsStatus, setOptionsStatus] = React.useState('loading');
  const [reloadKey, setReloadKey] = React.useState(0);

  // 후보 목록. **가입 전에도 부른다** — 이 엔드포인트는 토큰을 요구하지 않는다.
  // 실패하면 후보를 지어내지 않고 다시 시도를 띄운다(NO-MOCK-CANON R1).
  React.useEffect(() => {
    let active = true;
    setOptionsStatus('loading');
    window.MoyeoApi.profileOptions()
      .then((result) => {
        if (!active) return;
        if (!Array.isArray(result?.travelStyles)) { setOptionsStatus('error'); return; }
        setServerOptions(result);
        setOptionsStatus('ready');
      })
      .catch(() => { if (active) setOptionsStatus('error'); });
    return () => { active = false; };
  }, [reloadKey]);

  // 이미 가입을 마친 계정이 취향만 고치러 들어온 경우에만 저장된 값을 미리 칠한다.
  // 이 화면을 URL 로 직접 연 진입(캡처)은 **가입 7/8 단계**를 보여주는 자리다.
  // 저장된 취향을 미리 칠하면 아무도 고르지 않은 단계가 이미 고른 화면으로 찍힌다 —
  // iOS·안드로이드는 둘 다 아무것도 고르지 않은 상태를 그린다.
  React.useEffect(() => {
    if (!liveMode) return undefined;
    if (window.isDirectScreenEntry?.()) return undefined;
    let active = true;
    window.MoyeoApi.myProfile()
      .then((profileResult) => {
        if (!active || !profileResult) return;
        setServerProfile(profileResult);
        setStyleIds((profileResult.travelStyles || []).map((style) => style.id));
        setRegionIds((profileResult.interestedRegions || []).map((region) => region.id));
      })
      .catch(() => { /* 토큰이 없으면(=가입 중) 실패가 정상이다 — 아무것도 칠하지 않는다 */ });
    return () => { active = false; };
  }, [liveMode]);

  // 저장 경로를 가르는 것은 **가입을 마쳤는가**(= 내 프로필을 읽었는가)이지 후보 출처가 아니다.
  const serverMode = Boolean(serverProfile);
  const styleOptions = serverOptions?.travelStyles || [];
  const regionOptions = serverOptions?.interestedRegions || [];
  const toggleId = (list, setList, id) => setList(list.includes(id) ? list.filter((v) => v !== id) : [...list, id]);
  const canContinue = styleIds.length > 0 && regionIds.length > 0 && !saving;
  const goNext = () => {
    // 취향 다음은 약관 동의다. 가입(POST /auth/signup)은 거기서 동의한 termId 와 함께 보낸다.
    // 이미 가입을 마친 사용자가 취향만 고치러 들어온 경우에는 원래 목적지로 돌아간다.
    const next = window.__moyeoPostTasteRoute;
    if (next === 'home') nav.go('home', { replace: true });
    else if (next) nav.go(next);
    else nav.go('terms');
  };
  const submit = async () => {
    if (!serverMode) {
      // R4: 여기서 고른 id 를 약관 화면까지 들고 가 POST /auth/signup 본문에 싣는다.
      // 예전에는 어디로도 보내지 않아 가입과 동시에 조용히 사라졌다.
      window.__moyeoSignupTaste = { travelStyleIds: [...styleIds], interestedRegionIds: [...regionIds] };
      goNext();
      return;
    }
    setSaving(true);
    try {
      await window.MoyeoApi.updateProfile({
        introduction: serverProfile.introduction ?? null,
        travelStyleIds: styleIds,
        interestedRegionIds: regionIds,
        birthDate: serverProfile.birthDate,
        gender: serverProfile.gender,
      });
    } catch (_) { /* 저장 실패해도 가입 흐름은 막지 않는다 */ }
    setSaving(false);
    goNext();
  };
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 46, display: 'flex', flexDirection: 'column', background: T.bgBase }}>
        <AuthProgressHeader label="프로필 설정" current={7} showBack onBack={() => nav.back()}/>
        <div style={{ padding: '8px 20px 0', overflow: 'auto' }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: '30px' }}>어떤 여행을 좋아하세요?</div>
          <div style={{ fontSize: 13, color: T.text500, marginTop: 8, lineHeight: '19px' }}>여행 스타일과 관심 지역을 알려주시면<br/>딱 맞는 모집을 먼저 보여드려요.</div>

          {/* 후보를 못 받으면 칩을 지어내지 않는다 — 로딩/실패만 그린다(R1). */}
          {optionsStatus !== 'ready' && (
            <div role="status" data-testid="auth-taste-options-state" style={{ padding: '48px 0', textAlign: 'center', fontSize: 13, color: T.text500 }}>
              {optionsStatus === 'loading' ? '불러오는 중이에요…' : '불러오지 못했어요.'}
              {optionsStatus === 'error' && (
                <div style={{ marginTop: 12 }}>
                  <Btn variant="secondary" onClick={() => setReloadKey((key) => key + 1)} testId="auth-taste-options-retry">다시 시도</Btn>
                </div>
              )}
            </div>
          )}

          {optionsStatus === 'ready' && (
          <React.Fragment>
          <div style={{ marginTop: 26 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: T.text700, marginBottom: 10 }}>여행 스타일 <span style={{ color: T.danger }}>*</span> <span style={{ color: T.text500, fontWeight: 400 }}>· 1개 이상</span></div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {styleOptions.map((style) => (
                <TasteChip key={style.id} label={style.label} testId={"auth-taste-style-" + style.label} on={styleIds.includes(style.id)} onClick={() => toggleId(styleIds, setStyleIds, style.id)}/>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 26 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: T.text700, marginBottom: 10 }}>관심 지역 <span style={{ color: T.danger }}>*</span> <span style={{ color: T.text500, fontWeight: 400 }}>· 경북 안에서 1곳 이상</span></div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 160, overflow: 'auto' }}>
              {regionOptions.map((region) => (
                <TasteChip key={region.id} label={region.signguName} testId={"auth-taste-region-" + region.signguName} on={regionIds.includes(region.id)} onClick={() => toggleId(regionIds, setRegionIds, region.id)}/>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 22, padding: 12, borderRadius: 12, background: T.bgSubtle, fontSize: 12, color: T.text500, lineHeight: '18px' }}>
            여행 스타일과 관심 지역은 마이 &gt; 프로필 수정에서 언제든 함께 바꿀 수 있어요.
          </div>
          </React.Fragment>
          )}
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ padding: '0 20px 12px', fontSize: 12, color: T.text500, textAlign: 'center' }}>
          여행 스타일 {styleIds.length}개 · 관심 지역 {regionIds.length}곳 선택
        </div>
        <div style={{ padding: '0 20px 32px', display: 'flex', gap: 8 }}>
          <Btn variant="secondary" onClick={() => nav.back()}>이전</Btn>
          <div style={{ flex: 1 }}><Btn variant="primary" full disabled={!canContinue} onClick={submit} testId="auth-taste-submit">{saving ? '저장 중...' : '저장하고 프로필 만들기'}</Btn></div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 15 · 약관 동의 ─────────
// 약관은 **서버가 주는 목록**을 그대로 그린다 (GET /api/v1/terms · 인증 불필요).
// 클라가 약관을 따로 갖지 않는다 — 서버에서 늘거나 줄면 화면도 따라 바뀐다.
// 동의한 termId 는 회원가입 요청의 `agreedTermIds` 로 보낸다(없으면 400 40012).
// "만 18세 이상"은 서버 약관이 아니라 별도 확인이다 — 서버는 birthDate 로 나이를 본다.
function ScreenTerms() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  const [terms, setTerms] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [loadFailed, setLoadFailed] = React.useState(false);
  const [agreedIds, setAgreedIds] = React.useState(new Set());
  const [confirmedAge, setConfirmedAge] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const loadTerms = React.useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const list = await window.MoyeoApi.terms();
      setTerms(Array.isArray(list) ? list : []);
    } catch (requestError) {
      // 임의의 약관을 지어내지 않는다 — 비운 채 다시 불러오기를 띄운다.
      setTerms([]);
      setLoadFailed(true);
      setError(requestError?.message || '약관을 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, []);
  React.useEffect(() => { loadTerms(); }, [loadTerms]);

  const requiredIds = terms.filter((term) => term.required).map((term) => term.termId);
  const requiredReady = terms.length > 0 && confirmedAge && requiredIds.every((id) => agreedIds.has(id));
  const allAgreed = terms.length > 0 && confirmedAge && terms.every((term) => agreedIds.has(term.termId));

  const toggleAll = () => {
    if (submitting) return;
    const turningOff = allAgreed;
    setConfirmedAge(!turningOff);
    setAgreedIds(turningOff ? new Set() : new Set(terms.map((term) => term.termId)));
  };
  const toggleTerm = (termId) => {
    if (submitting) return;
    setAgreedIds((current) => {
      const next = new Set(current);
      if (next.has(termId)) next.delete(termId); else next.add(termId);
      return next;
    });
  };
  const displayTitle = (title) => String(title || '').replace('[필수]', '').replace('[선택]', '').trim();

  const Row = ({ text, hint, checked, onToggle, onOpenDetail, master, testId }) => (
    <div style={{ width: '100%', minHeight: 52, display: 'flex', alignItems: 'center', borderTop: master ? 'none' : `1px solid ${T.line100}` }}>
      <button type="button" onClick={onToggle} data-testid={testId} aria-label={`${text} ${checked ? '동의 해제' : '동의'}`} style={{ flex: 1, alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: 12, padding: '8px 4px', border: 0, background: 'transparent', color: T.text900, textAlign: 'left', fontFamily: T.fontStack, cursor: 'pointer' }}>
        <span style={{ width: 24, height: 24, flexShrink: 0, borderRadius: 6, background: checked ? T.primary500 : 'transparent', border: checked ? 'none' : `1.5px solid ${T.line300}`, display: 'grid', placeItems: 'center' }}>{checked && <Icon name="check" size={16} color="#fff" strokeWidth={2.5}/>}</span>
        <span style={{ flex: 1, fontSize: master ? 16 : 14, fontWeight: master ? 600 : 400 }}>{text} {hint && <span style={{ color: T.text500, fontSize: 12, fontWeight: 400 }}>{hint}</span>}</span>
      </button>
      {onOpenDetail && <button type="button" aria-label={`${text} 내용 보기`} data-testid={`terms-open-${testId}`} onClick={onOpenDetail} style={{ alignSelf: 'stretch', width: 44, border: 0, background: 'transparent', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Icon name="arrow" size={16} color={T.text400}/></button>}
    </div>
  );

  const finish = async () => {
    if (!requiredReady || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const basics = window.__moyeoSignupBasics || {};
      // 07 취향 단계에서 고른 서버 id 다. 가입 요청이 이 값을 싣는 **유일한** 경로이므로
      // 여기서 빠지면 사용자가 고른 취향이 그대로 사라진다.
      const taste = window.__moyeoSignupTaste || {};
      const tokens = await window.MoyeoAuth.signup({
        nickname: window.__moyeoSelectedNickname,
        nicknameSelectionToken: window.__moyeoNicknameSelectionToken,
        gender: basics.gender,
        birthDate: basics.birthDate,
        agreedTermIds: [...agreedIds],
        travelStyleIds: taste.travelStyleIds,
        interestedRegionIds: taste.interestedRegionIds,
      });
      // 서버가 받아 저장했으므로 다음 가입(계정 전환)에 지난 선택이 섞이지 않게 비운다.
      delete window.__moyeoSignupTaste;
      nav.go(tokens.signupState === 'PROFILE_IMAGE_REQUIRED' ? 'prof-2' : 'home', { replace: tokens.signupState !== 'PROFILE_IMAGE_REQUIRED' });
    } catch (requestError) {
      setError(requestError?.message || '회원가입을 완료하지 못했어요. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 60 }}>
        <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center' }}>
          <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="back" size={24}/></div>
        </div>
        <div style={{ padding: '8px 20px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.5px' }}>약관 동의</div>
          <div style={{ fontSize: 13, color: T.text500, marginBottom: 20 }}>모여트립 이용을 위해 동의가 필요해요</div>
          <Row master text="모두 동의" checked={allAgreed} onToggle={toggleAll} testId="auth-terms-all"/>
          <div style={{ height: 1, background: T.line200, margin: '4px 0' }}/>
          <Row text="만 18세 이상" hint="(필수)" checked={confirmedAge} onToggle={() => !submitting && setConfirmedAge((value) => !value)} testId="age"/>
          {terms.map((term) => (
            <Row
              key={term.termId}
              text={displayTitle(term.title)}
              hint={term.required ? '(필수)' : '(선택)'}
              checked={agreedIds.has(term.termId)}
              onToggle={() => toggleTerm(term.termId)}
              onOpenDetail={() => nav.go('terms-detail', { termId: term.termId })}
              testId={String(term.termId)}
            />
          ))}
          {loading && <div style={{ minHeight: 52, display: 'flex', alignItems: 'center', color: T.text500, fontSize: 13 }}>약관을 불러오는 중이에요</div>}
          <div role="status" style={{ minHeight: 20, marginTop: 12, fontSize: 12, color: T.danger, textAlign: 'center' }}>{error}</div>
          {loadFailed && <button type="button" onClick={loadTerms} style={{ width: '100%', height: 44, border: 0, background: 'transparent', color: T.primary600, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>약관 다시 불러오기</button>}
        </div>
        <div style={{ position: 'absolute', bottom: 32, left: 20, right: 20 }}>
          <Btn variant="primary" full disabled={!requiredReady || submitting} onClick={finish} testId="auth-terms-finish">
            {submitting ? '계정을 만들고 있어요...' : '동의하고 시작'}
          </Btn>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 18 · 호스트 관리 ─────────
function ScreenHostManage() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  // 호스트로 로그인한 상태면 GET {id} 상세 · {id}/applications · {id}/members 로 대체하고,
  // 승인은 POST applications/{id}/approve, 거절은 DELETE applications/{id} 로 보낸다.
  // 호스트가 아니면 서버가 403 이라 아래 목데이터가 그대로 남는다.
  const liveMode = window.MoyeoApi?.live();
  const roomId = liveMode ? window.MoyeoApi.selectedRoomId() : null;
  const [room, setRoom] = React.useState(null);
  const [course, setCourse] = React.useState(null);
  const [applications, setApplications] = React.useState(null);
  const [memberList, setMemberList] = React.useState(null);
  const [busyId, setBusyId] = React.useState(null);
  React.useEffect(() => {
    if (!liveMode || !roomId) return undefined;
    let active = true;
    window.MoyeoApi.roomDetail(roomId)
      .then((result) => { if (active && result?.roomId != null) setRoom(result); })
      .catch(() => { /* 실패 시 목데이터 유지 */ });
    // 여행 경로 요약(방문지 수·코스 출처)은 방 상세에 없다 — 15 모집 상세와 같은 엔드포인트를 쓴다.
    window.MoyeoApi.roomCourse(roomId)
      .then((result) => { if (active && result?.course) setCourse(result.course); })
      .catch(() => {});
    window.MoyeoApi.roomApplications(roomId)
      .then((result) => { if (active && Array.isArray(result)) setApplications(result); })
      .catch(() => { /* 호스트가 아니면 403 — 목데이터 유지 */ });
    window.MoyeoApi.roomMembers(roomId)
      .then((result) => { if (active && Array.isArray(result?.members)) setMemberList(result); })
      .catch(() => {});
    return () => { active = false; };
  }, [liveMode, roomId]);
  const serverMode = Boolean(room && applications);
  // 승인은 정원이 차 있으면 대기열로 간다 — 응답의 result(JOINED/WAITLISTED)를 그대로 따른다.
  const answerApplication = async (applicationId, approve) => {
    if (busyId != null) return;
    setBusyId(applicationId);
    try {
      if (approve) await window.MoyeoApi.approveApplication(roomId, applicationId);
      else await window.MoyeoApi.rejectApplication(roomId, applicationId);
      setApplications((current) => (current || []).filter((item) => item.applicationId !== applicationId));
      if (approve) {
        const refreshed = await window.MoyeoApi.roomMembers(roomId).catch(() => null);
        if (Array.isArray(refreshed?.members)) setMemberList(refreshed);
      }
    } catch (_) { /* 실패 시 목록을 유지한다 */ }
    setBusyId(null);
  };
  // 프로필 요약 — 서버는 나이·성별만 준다. 매너 점수·여행 횟수는 신청 응답에 없어 표기하지 않는다.
  const applicantSummary = (applicant) => [
    applicant.age != null ? `${applicant.age}세` : null,
    { M: '남성', F: '여성', MALE: '남성', FEMALE: '여성' }[applicant.gender] || null,
  ].filter(Boolean).join(' · ');
  // 서버 모집을 못 받으면 예시 신청자·동행자를 그리지 않는다.
  if (!serverMode) {
    return (
      <Phone>
        <div style={{ position: 'absolute', inset: 0, paddingTop: 60, background: T.bgSubtle }}>
          <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.bgBase, borderBottom: `1px solid ${T.line100}` }}>
            <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="back" size={24}/></div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>모집 관리</div>
            <span aria-hidden="true" style={{ width: 24, height: 24 }}/>
          </div>
          <div role="status" style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13, lineHeight: '21px' }}>
            {liveMode ? '지금 모집 중인 모임이 없어요.' : '로그인하면 모집 중인 모임을 볼 수 있어요.'}
          </div>
        </div>
      </Phone>
    );
  }

  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 60, background: T.bgSubtle }}>
        <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.bgBase, borderBottom: `1px solid ${T.line100}` }}>
          <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="back" size={24}/></div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>모집 관리</div>
          {/* 우측 상단 더보기(⋯)는 항목이 정의되지 않아 두지 않는다 (앱과 동일) */}
          <span aria-hidden="true" style={{ width: 24, height: 24 }}/>
        </div>
        <div style={{ padding: 20, background: T.bgBase, borderBottom: `1px solid ${T.line100}` }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{room.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 13, color: T.text500, fontVariantNumeric: 'tabular-nums' }}>
            <span>{`${room.participantCount} / ${room.maxParticipants}명`}</span>
            <span style={{ color: T.line300 }}>·</span>
            <Chip variant="accent">D-{room.recruitmentDDay}</Chip>
          </div>
          <button type="button" data-testid="host-course-edit" onClick={() => nav.go('course-edit')} style={{
            width: '100%', marginTop: 14, borderRadius: 12, border: `1px solid ${T.primary100}`, background: T.primary50,
            padding: 12, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: T.fontStack, textAlign: 'left',
          }}>
            <Icon name="map" size={18} color={T.primary600}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* 서버 모드에서는 방문지 수·코스 출처·마감 D-day 를 모두 방의 값으로 쓴다.
                  D-day 는 확정·취소된 방에서 null 로 오므로 그럴 땐 D 표기 없이 문장만 남긴다. */}
              <div style={{ fontSize: 13, fontWeight: 600, color: T.primary700 }}>{course ? `여행 경로 · 방문지 ${course.places?.length || 0}곳` : '여행 경로'}</div>
              <div style={{ fontSize: 11, color: T.primary600, marginTop: 3 }}>
                {course
                  ? `확정 전${room.recruitmentDDay != null ? `(D-${room.recruitmentDDay})` : ''}까지 수정할 수 있어요 · ${course.type === 'CUSTOM' ? '호스트 직접 코스' : '등록된 코스'}`
                  : ''}
              </div>
            </div>
            <Icon name="arrow" size={16} color={T.primary600}/>
          </button>
          {/* 18-4 여행 확정/불발 · 18-5 집합 정보 수정 — 둘 다 호스트만 할 수 있고
              여기가 유일한 진입점이다 (ATTACH-COMPOSER-CANON §6-1).
              확정·불발은 모집 중일 때만 가능하다 (서버 INVALID_CHAT_ROOM_STATUS). */}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {room.status === 'RECRUITING' && (
              <button type="button" data-testid="host-trip-status" onClick={() => nav.go('trip-status')} style={{
                flex: 1, height: 42, borderRadius: 10, border: `1px solid ${T.line200}`, background: 'transparent',
                color: T.text700, fontSize: 13, fontWeight: 700, fontFamily: T.fontStack, cursor: 'pointer',
              }}>여행 확정하기</button>
            )}
            <button type="button" data-testid="host-meeting-edit" onClick={() => nav.go('meeting-edit')} style={{
              flex: 1, height: 42, borderRadius: 10, border: `1px solid ${T.line200}`, background: 'transparent',
              color: T.text700, fontSize: 13, fontWeight: 700, fontFamily: T.fontStack, cursor: 'pointer',
            }}>집합 정보 수정</button>
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text700 }}>승인 대기 ({applications.length})</div>
            <div style={{ fontSize: 11, color: T.text500 }}>48시간 후 자동 거절</div>
          </div>
          {applications.length === 0 && (
            <div style={{ background: T.bgBase, borderRadius: 16, padding: 20, marginBottom: 12, border: `1px solid ${T.line100}`, textAlign: 'center', fontSize: 13, color: T.text500 }}>승인 대기 중인 신청이 없어요.</div>
          )}
          {applications.map((item) => (
            <div key={item.applicationId} data-testid={`host-application-${item.applicationId}`} style={{ background: T.bgBase, borderRadius: 16, padding: 16, marginBottom: 12, border: `1px solid ${T.line100}` }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <ProfileAvatar src={item.applicant?.profileImageUrl} size={48}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{item.applicant?.nickname}</div>
                  {applicantSummary(item.applicant || {}) && (
                    <div style={{ fontSize: 12, color: T.text500, marginTop: 2 }}>{applicantSummary(item.applicant)}</div>
                  )}
                  {item.applicationMessage && (
                    <div style={{ fontSize: 12, color: T.text700, marginTop: 8, padding: 10, background: T.bgSubtle, borderRadius: 10, lineHeight: 1.5 }}>{item.applicationMessage}</div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button type="button" disabled={busyId != null} data-testid={`host-reject-${item.applicationId}`} onClick={() => answerApplication(item.applicationId, false)} style={{ flex: 1, height: 40, borderRadius: 10, border: `1px solid ${T.line200}`, background: 'transparent', fontSize: 13, fontWeight: 600, color: T.text700, fontFamily: T.fontStack, cursor: 'pointer' }}>거절</button>
                <button type="button" disabled={busyId != null} data-testid={`host-approve-${item.applicationId}`} onClick={() => answerApplication(item.applicationId, true)} style={{ flex: 1, height: 40, borderRadius: 10, border: 'none', background: T.primary500, fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: T.fontStack, cursor: 'pointer' }}>승인</button>
              </div>
            </div>
          ))}
          {memberList && (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text700, marginTop: 24, marginBottom: 12 }}>승인된 동행자 ({memberList.participantCount})</div>
              <div style={{ background: T.bgBase, borderRadius: 16, padding: 16, border: `1px solid ${T.line100}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex' }}>
                  {memberList.members.slice(0, 4).map((member, index) => (
                    <div key={member.userId} style={{ marginLeft: index === 0 ? 0 : -10, border: `2px solid ${T.bgBase}`, borderRadius: 999 }}>
                      <ProfileAvatar src={member.profileImageUrl} size={36}/>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: T.text500 }}>본인 외 {Math.max(0, memberList.participantCount - 1)}명</div>
              </div>
            </>
          )}
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 20px 32px', background: T.bgBase, borderTop: `1px solid ${T.line100}` }}>
          <Btn variant="primary" full icon="chat" onClick={() => nav.go('chat')}>채팅방 들어가기</Btn>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 19 · 채팅방 목록 ─────────
function ScreenChatList({ initialTab = 'live' }) {
  const nav = (window.useNav ? window.useNav() : { go: () => {} });
  // 모임은 "보던 상태 유지" 탭이다 (TAB-STATE-CANON R3) — 고른 탭도 목록도 그대로 남는다.
  // 19-1(신청중 바로 진입)은 다른 화면이라 보관 키를 나눈다 —
  // 한 키를 쓰면 앞서 19 에서 고른 탭이 19-1 의 진입 탭을 덮어쓴다.
  const [tab, setTab] = window.useTabState(`meeting.tab:${initialTab}`, initialTab);
  const listScroll = window.useTabScroll('meeting.list');
  // 로그인 상태: GET chat-rooms/my(진행중·확정·종료) + chat-rooms/my-waiting(신청중)으로 대체한다.
  const liveMode = window.MoyeoApi?.live();
  // 마이(my.rooms)와 같은 응답이라 키를 공유한다 — 두 탭이 같은 목록을 두 번 부르지 않는다.
  const roomsData = window.useTabData('my.rooms', () => window.MoyeoApi.myRooms(), {
    enabled: liveMode, mode: 'keep', accept: Array.isArray,
  });
  const waitingData = window.useTabData('meeting.waiting', () => window.MoyeoApi.myWaitingRooms(), {
    enabled: liveMode, mode: 'keep', accept: Array.isArray,
  });
  const serverRooms = roomsData.value || null;
  const serverWaiting = waitingData.value || null;
  const serverMode = Boolean(serverRooms || serverWaiting);
  const serverTabRooms = serverRooms ? {
    live: serverRooms.filter((room) => !room.ended && room.status !== 'CONFIRMED'),
    fixed: serverRooms.filter((room) => !room.ended && room.status === 'CONFIRMED'),
    done: serverRooms.filter((room) => room.ended),
  } : { live: [], fixed: [], done: [] };
  // 채팅이 열린 방이면 채팅방(20)으로, 아직 아니면 모집 상세(15)로 보낸다.
  const openServerRoom = (room) => {
    window.MoyeoApi.selectRoom(room.roomId);
    nav.go(room.chatAvailable ? 'chat' : 'detail');
  };
  // 19-2 참가 신청 취소 확인으로 보낸다. 대기 순번을 잃는 행동이라 확인 없이 바로 실행하면 안 된다
  // (ATTACH-COMPOSER-CANON §6-1). 실제 DELETE 는 19-2 가 부른다.
  const askCancelApplication = (item) => {
    window.MoyeoApi.selectApplication({
      roomId: item.roomId,
      title: item.title,
      waitlistPosition: item.waitlistPosition ?? null,
    });
    nav.go('apply-cancel');
  };
  const ServerRow = ({ room }) => (
    <button type="button" onClick={() => openServerRoom(room)} style={{ width: '100%', minHeight: 84, padding: '14px 20px', display: 'flex', gap: 12, alignItems: 'center', border: 0, borderBottom: `1px solid ${T.line100}`, background: RF.card, cursor: 'pointer', fontFamily: T.fontStack, textAlign: 'left' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, overflow: 'hidden', flexShrink: 0, background: T.primary50 }}>
        {/* 서버가 썸네일을 주지 않은 모임 — 그라디언트 대신 공용 마스코트(1:1)로 채운다 */}
        <img
          src={room.thumbnail || window.MoyeoImageCache.placeholderSources.square}
          alt=""
          loading="lazy"
          onError={(event) => { event.currentTarget.src = window.MoyeoImageCache.placeholderSources.square; }}
          style={{ display: 'block', width: 56, height: 56, objectFit: 'cover' }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <b style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.title}</b>
          {room.unreadMessageCount ? <span style={{ minWidth: 20, height: 20, borderRadius: 999, background: T.accent500, color: '#fff', fontSize: 11, display: 'grid', placeItems: 'center' }}>{room.unreadMessageCount}</span> : null}
        </div>
        <div style={{ fontSize: 12, color: T.text500, marginTop: 3 }}>
          {window.MoyeoApi.formatDate(room.startDate)}{room.endDate ? ` - ${window.MoyeoApi.formatDate(room.endDate)}` : ''}
          {room.participantCount != null && room.maxParticipants != null ? ` · ${room.participantCount}/${room.maxParticipants}명` : ''}
          {room.recruitmentDDay != null ? ` · 마감 D-${room.recruitmentDDay}` : room.ended ? ' · 종료' : ''}
        </div>
        {room.latestMessage?.content && <div style={{ fontSize: 13, color: T.text700, marginTop: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.latestMessage.content}</div>}
      </div>
    </button>
  );
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 60, background: RF.bg, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', flexShrink: 0 }}><div style={{ fontSize: 22, fontWeight: 700 }}>모임</div></div>
        {/* 여행 뒤 남는 특별 메시지 진입 — 앱과 같은 위치·문구 */}
        <button
          type="button"
          data-testid="meeting-special-messages"
          onClick={() => nav.go('trip-message')}
          style={{ height: 54, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 10, border: 0, background: 'transparent', color: T.text900, textAlign: 'left', fontFamily: T.fontStack, cursor: 'pointer', borderBottom: `1px solid ${T.line100}`, flexShrink: 0 }}>
          <span style={{ width: 34, height: 34, borderRadius: 999, background: T.primary100, color: T.primary600, display: 'grid', placeItems: 'center', fontSize: 17, fontWeight: 800 }}>✦</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 15, fontWeight: 800 }}>친구 도감 메시지</span>
            <span style={{ display: 'block', fontSize: 12, color: T.text500, marginTop: 2, fontWeight: 600 }}>여행 뒤 남는 특별 메시지를 모아봐요.</span>
          </span>
          <Icon name="arrow" size={18} color={T.text500}/>
        </button>
        <div role="tablist" aria-label="모임 상태" style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: `1px solid ${T.line100}`, flexShrink: 0 }}>
          {[['live','진행중',serverTabRooms.live.length],['applied','신청중',(serverWaiting || []).length],['fixed','확정',serverTabRooms.fixed.length],['done','종료',serverTabRooms.done.length]].map(([id,label,count]) => {
            const active = tab === id;
            return <button key={id} type="button" role="tab" aria-selected={active} data-testid={`meeting-tab-${id}`} onClick={() => setTab(id)} style={{ minHeight: 48, padding: '10px 0', border: 0, borderBottom: active ? `2px solid ${T.primary500}` : '2px solid transparent', background: 'transparent', color: active ? T.primary600 : T.text500, fontFamily: T.fontStack, cursor: 'pointer' }}><span style={{ fontSize: 13, fontWeight: 700 }}>{label}</span><span style={{ fontSize: 11, marginLeft: 3 }}>{count}</span></button>;
          })}
        </div>
        {/* 탭 바로 아래에서 목록이 시작한다 — 절대 위치 매직넘버는 탭 높이가 바뀌면 유격이 생긴다 */}
        <div ref={listScroll.ref} onScroll={listScroll.onScroll} style={{ flex: 1, minHeight: 0, overflow: 'auto', paddingBottom: 96 }}>
          {serverMode && tab !== 'applied' && (
            serverTabRooms[tab].length === 0
              ? <div style={{ padding: 40, textAlign: 'center', color: T.text500, fontSize: 13 }}>{tab === 'live' ? '진행 중인 모임이 없어요.' : tab === 'fixed' ? '확정된 모임이 없어요.' : '종료된 모임이 없어요.'}</div>
              : serverTabRooms[tab].map((room) => <ServerRow key={room.roomId} room={room}/>)
          )}
          {serverMode && tab === 'applied' && (
            <div>
              {(serverWaiting || []).length === 0 && <div style={{ padding: 40, textAlign: 'center', color: T.text500, fontSize: 13 }}>신청 중인 모임이 없어요.</div>}
              {/* 기획은 신청 상태를 **두 묶음**으로 갈라 소제목을 붙인다 — 승인 대기와 대기열은
                  기다리는 이유가 다르다. 예전에는 세 구현 모두 소제목 없이 한 줄로 이어 붙였다. */}
              {[['호스트 승인을 기다리는 중', (serverWaiting || []).filter((item) => item.applicationStatus !== 'WAITLISTED')],
                ['대기열에 있는 모임', (serverWaiting || []).filter((item) => item.applicationStatus === 'WAITLISTED')]]
                .filter(([, list]) => list.length > 0)
                .map(([sectionTitle, list]) => (
                <React.Fragment key={sectionTitle}>
                  <div style={{ padding: '14px 20px 4px', fontSize: 12, fontWeight: 700, color: T.text500 }}>{sectionTitle}</div>
                  {list.map((item) => {
                const waiting = item.applicationStatus === 'PENDING';
                const badgeBg = waiting ? T.warningBg : T.primary50;
                const badgeFg = waiting ? T.warningText : T.primary700;
                const stateLabel = waiting ? '승인 대기' : item.applicationStatus === 'WAITLISTED' ? (item.waitlistPosition != null ? `대기열 ${item.waitlistPosition}번` : '대기열') : '거절됨';
                return (
                  <div key={item.roomId} data-testid={`application-room-${item.roomId}`} style={{ padding: '16px 20px', display: 'flex', gap: 12, borderBottom: `1px solid ${T.line100}` }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, overflow: 'hidden', flexShrink: 0, background: T.primary50 }}>
                      {/* 신청한 모임 썸네일 — 없거나 실패하면 공용 마스코트(1:1) */}
                      <img
                        src={item.thumbnail || window.MoyeoImageCache.placeholderSources.square}
                        alt=""
                        loading="lazy"
                        onError={(event) => { event.currentTarget.src = window.MoyeoImageCache.placeholderSources.square; }}
                        style={{ display: 'block', width: 56, height: 56, objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <b style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</b>
                        <span style={{ height: 22, padding: '0 9px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', background: badgeBg, color: badgeFg, fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{stateLabel}</span>
                      </div>
                      <div style={{ fontSize: 12, color: T.text500, marginTop: 4 }}>
                        {window.MoyeoApi.formatDate(item.startDate)}{item.endDate ? ` - ${window.MoyeoApi.formatDate(item.endDate)}` : ''} · {window.MoyeoApi.tripTypeLabel(item)}
                        {item.tripType === 'DAY_TRIP' && item.dayTripStartTime ? ` · ${window.MoyeoApi.formatTime(item.dayTripStartTime)}-${window.MoyeoApi.formatTime(item.dayTripEndTime)}` : ''}
                      </div>
                      {item.meetingDetails && <div style={{ fontSize: 12, color: T.text500, marginTop: 2 }}>{item.meetingDetails}</div>}
                      {/* 왜 기다리는지 말해 주는 말풍선. 기획·iOS 에는 있고 웹·안드로이드에는 없었다. */}
                      {item.applicationStatus !== 'REJECTED' && (
                        <div style={{ marginTop: 8, padding: '9px 11px', borderRadius: 10, background: badgeBg, color: badgeFg, fontSize: 12, lineHeight: '18px' }}>
                          {waiting
                            ? '호스트가 확인하면 채팅방이 열려요. 보통 24시간 이내에 응답해요.'
                            : `정원(${item.maxParticipants}명)이 차서 대기 중이에요. 자리가 나면 순서대로 자동 합류돼요.`}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button type="button" data-testid={`cancel-application-room-${item.roomId}`} onClick={() => askCancelApplication(item)} style={{ height: 34, padding: '0 12px', borderRadius: 10, border: `1px solid ${T.line200}`, background: 'transparent', color: T.text700, fontFamily: T.fontStack, cursor: 'pointer' }}>신청 취소</button>
                        <button type="button" onClick={() => openServerRoom({ roomId: item.roomId })} style={{ height: 34, padding: '0 12px', borderRadius: 10, border: `1px solid ${T.line200}`, background: 'transparent', color: T.text700, fontFamily: T.fontStack, cursor: 'pointer' }}>모집 상세</button>
                      </div>
                    </div>
                  </div>
                );
                  })}
                </React.Fragment>
              ))}
              <div style={{ padding: '14px 20px 24px', fontSize: 11, color: T.text400, lineHeight: 1.6 }}>신청 상태에서는 아직 채팅방에 들어갈 수 없어요. 승인되거나 자리가 나면 알림으로 알려드릴게요.</div>
            </div>
          )}
          {/* 목 모임 카드는 없다 — 미로그인이면 로그인 안내만, 로그인했는데 아직 못 받았으면
              로딩 문구만 남는다 (TAB-STATE-CANON R2 · NO-MOCK-CANON §2). */}
          {!serverMode && (
            <TabDataNotice
              status={tab === 'applied' ? waitingData.status : roomsData.status}
              signedOut={!liveMode}
              onRetry={tab === 'applied' ? waitingData.reload : roomsData.reload}
              style={{ padding: 40, textAlign: 'center', fontSize: 13 }}
            />
          )}
        </div>
        <BottomNav active="group"/>
      </div>
    </Phone>
  );
}

function ScreenChatListApplied() { return <ScreenChatList initialTab="applied"/>; }

// ───────── 20 · 알림 센터 ─────────
// 알림 유형 → 아이콘/색 매핑 (로그인 상태 서버 알림용)
const NOTIFICATION_TYPE_STYLES = {
  CHAT_ROOM_CREATED: { icon: 'users', tone: 'primary' },
  CHAT_ROOM_KICKED: { icon: 'warning', tone: 'danger' },
  CHAT_MESSAGE_RECEIVED: { icon: 'chat', tone: 'accent' },
  TRAVEL_COURSE_UPDATED: { icon: 'refresh', tone: 'primary' },
  MEETING_INFO_UPDATED: { icon: 'pin', tone: 'primary' },
  RECRUITMENT_DEADLINE: { icon: 'clock', tone: 'warning' },
  FRIEND_REQUEST: { icon: 'user', tone: 'info' },
  FRIEND_ACCEPTED: { icon: 'user', tone: 'primary' },
  FEED_LIKE: { icon: 'heart', tone: 'accent' },
  MARKETING: { icon: 'sparkle', tone: 'primary' },
};

function ScreenNotifications() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  // 로그인 상태에서는 GET /api/v1/notifications 로 목록을 대체한다.
  const liveMode = window.MoyeoApi?.live();
  const [serverPage, setServerPage] = React.useState(null);
  const loadNotifications = React.useCallback(() => {
    if (!liveMode) return;
    window.MoyeoApi.notifications({ size: 50 })
      .then((result) => { if (Array.isArray(result?.notifications)) setServerPage(result); })
      .catch(() => { /* 실패 시 목데이터 유지 */ });
  }, [liveMode]);
  React.useEffect(() => { loadNotifications(); }, [loadNotifications]);
  const markAllRead = async () => {
    if (!serverPage) return;
    try {
      await window.MoyeoApi.readAllNotifications();
      setServerPage((current) => (current ? {
        ...current,
        unreadCount: 0,
        notifications: current.notifications.map((item) => ({ ...item, read: true })),
      } : current));
    } catch (_) { /* 실패는 조용히 무시 */ }
  };
  const openServerNotification = async (item) => {
    try {
      if (!item.read) {
        await window.MoyeoApi.readNotification(item.notificationId);
        setServerPage((current) => (current ? {
          ...current,
          unreadCount: Math.max(0, (current.unreadCount || 1) - 1),
          notifications: current.notifications.map((n) => (n.notificationId === item.notificationId ? { ...n, read: true } : n)),
        } : current));
      }
      if (item.type === 'CHAT_ROOM_KICKED') {
        const history = await window.MoyeoApi.kickHistory(item.notificationId).catch(() => null);
        if (history) window.MoyeoApi.rememberKickHistory(history);
        nav.go('removal-reason');
        return;
      }
      if (item.chatRoomId != null) {
        window.MoyeoApi.selectRoom(item.chatRoomId);
        nav.go('detail');
      }
    } catch (_) { /* 이동 실패는 조용히 무시 */ }
  };
  // ── FRIEND_REQUEST 알림의 수락·거절 ──
  // 알림의 referenceId 가 곧 친구 요청 id 다(2026-09-02 실서버 확인: 알림 200·199 → requestId 43·42,
  // GET users/me/friend-requests/received 의 requestId 와 같은 값이다).
  // 부르는 API 는 27-2 친구 관리(ScreenFriends)와 같다 — 두 화면이 다르게 동작하면 그게 결함이다.
  // 답한 요청은 서버에서 사라지지만 알림은 그대로 남으므로, 답한 것을 기억해 버튼 대신 결과를 남긴다.
  const [answered, setAnswered] = React.useState({});
  const [answering, setAnswering] = React.useState(null);
  const [answerError, setAnswerError] = React.useState({});
  const answerFriendRequest = async (item, accept) => {
    const requestId = item?.referenceId;
    if (requestId == null || answering != null) return;
    setAnswering(requestId);
    setAnswerError((current) => ({ ...current, [requestId]: '' }));
    try {
      if (accept) await window.MoyeoApi.acceptFriendRequest(requestId);
      else await window.MoyeoApi.rejectFriendRequest(requestId);
      setAnswered((current) => ({ ...current, [requestId]: accept ? 'accepted' : 'rejected' }));
      // 읽지 않은 알림이었으면 답한 것으로 읽음 처리까지 맞춰 준다.
      if (!item.read) {
        await window.MoyeoApi.readNotification(item.notificationId).catch(() => {});
        setServerPage((current) => (current ? {
          ...current,
          unreadCount: Math.max(0, (current.unreadCount || 1) - 1),
          notifications: current.notifications.map((n) => (n.notificationId === item.notificationId ? { ...n, read: true } : n)),
        } : current));
      }
    } catch (error) {
      setAnswerError((current) => ({ ...current, [requestId]: error?.message || '친구 요청을 처리하지 못했어요.' }));
    } finally {
      setAnswering(null);
    }
  };
  const toneColors = {
    primary: { color: T.primary600, bg: T.primary100 },
    accent: { color: T.accent700, bg: T.accent100 },
    warning: { color: T.warningText, bg: T.warningBg },
    danger: { color: T.dangerText, bg: T.dangerBg },
    info: { color: T.info, bg: T.bgSubtle },
  };
  const Item = ({ icon, color, bg, title, time, action, last, onClick, testId }) => (
    <div onClick={onClick} data-testid={testId} style={{ padding: '14px 20px', display: 'flex', gap: 12, borderBottom: last ? 'none' : `1px solid ${T.line100}`, cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ width: 36, height: 36, borderRadius: 999, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={18} color={color}/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: T.text900, lineHeight: 1.5 }}>{title}</div>
        <div style={{ fontSize: 11, color: T.text500, marginTop: 4 }}>{time}</div>
        {action && action.state && (
          <div style={{ fontSize: 11.5, color: T.primary600, fontWeight: 600, marginTop: 8 }}>
            {action.state === 'accepted' ? '친구 신청을 수락했어요' : '친구 신청을 거절했어요'}
          </div>
        )}
        {action && !action.state && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {/* 행 전체가 알림 열기라서 버튼 클릭이 위로 새면 상세로 튄다 — 여기서 끊는다. */}
            <button type="button" data-testid={`notif-friend-reject-${action.requestId}`} disabled={action.busy} onClick={(event) => { event.stopPropagation(); action.onReject(); }} style={{ height: 32, padding: '0 14px', borderRadius: 8, border: `1px solid ${T.line200}`, background: 'transparent', color: T.text700, fontSize: 12, fontWeight: 600, fontFamily: T.fontStack, cursor: action.busy ? 'default' : 'pointer' }}>거절</button>
            <button type="button" data-testid={`notif-friend-accept-${action.requestId}`} disabled={action.busy} onClick={(event) => { event.stopPropagation(); action.onAccept(); }} style={{ height: 32, padding: '0 14px', borderRadius: 8, border: 'none', background: T.primary500, color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: T.fontStack, cursor: action.busy ? 'default' : 'pointer' }}>수락</button>
          </div>
        )}
        {action && action.error && <div role="alert" style={{ fontSize: 11.5, color: T.danger, marginTop: 8 }}>{action.error}</div>}
      </div>
      <Icon name="arrow" size={16} color={T.text400}/>
    </div>
  );
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 60, overflow: 'auto' }}>
        <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="back" size={24}/></div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>알림</div>
          <div onClick={serverPage ? markAllRead : undefined} data-testid="notif-read-all" style={{ fontSize: 12, color: T.primary600, fontWeight: 500, cursor: serverPage ? 'pointer' : 'default' }}>모두 읽음</div>
        </div>
        <div style={{ padding: '8px 20px 12px', display: 'flex', gap: 8 }}>
          <Chip variant="primary" size="md">전체</Chip>
          <Chip variant="neutral" size="md">안읽음 {serverPage ? serverPage.unreadCount : 0}</Chip>
        </div>
        {serverPage ? (
          <>
            {serverPage.notifications.length === 0 && (
              <div style={{ padding: '72px 20px', textAlign: 'center', color: T.text500, fontSize: 13 }}>새 알림이 없어요.</div>
            )}
            {serverPage.notifications.map((item, index) => {
              const style = NOTIFICATION_TYPE_STYLES[item.type] || { icon: 'bell', tone: 'primary' };
              const tone = toneColors[style.tone] || toneColors.primary;
              return (
                <Item
                  key={item.notificationId}
                  icon={style.icon}
                  color={tone.color}
                  bg={tone.bg}
                  title={<span style={{ fontWeight: item.read ? 400 : 700 }}>{item.content}</span>}
                  time={window.MoyeoApi.formatRelative(item.createdAt)}
                  onClick={() => openServerNotification(item)}
                  testId={`notif-${item.notificationId}`}
                  last={index === serverPage.notifications.length - 1}
                  // 친구 신청 알림에만 수락·거절 두 버튼이 붙는다. referenceId 가 요청 id 다.
                  action={item.type === 'FRIEND_REQUEST' && item.referenceId != null ? {
                    requestId: item.referenceId,
                    state: answered[item.referenceId] || null,
                    busy: answering === item.referenceId,
                    error: answerError[item.referenceId] || '',
                    onAccept: () => answerFriendRequest(item, true),
                    onReject: () => answerFriendRequest(item, false),
                  } : null}
                />
              );
            })}
          </>
        ) : (
          /* 목 알림은 없다 — 미로그인이면 로그인 안내만 남는다. */
          <div style={{ padding: '72px 20px', textAlign: 'center', color: T.text500, fontSize: 13 }}>로그인하면 모집 중인 모임을 볼 수 있어요.</div>
        )}
        <div style={{ height: 28 }}/>
      </div>
    </Phone>
  );
}

// ───────── 13-1 · 내보내기 안내 (강퇴 사유 조회) ─────────
// 13 알림 센터의 강퇴 알림을 탭하면 열린다. 호스트가 남긴 사유와 이후 정책을 한 화면에서 보여준다. (changeLog14)
function ScreenRemovalReason() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  // 로그인 상태: 알림 센터에서 조회한 강퇴 이력(GET notifications/{id}/kick-history)을 보여준다.
  //
  // 13 알림을 거치지 않고 이 화면으로 바로 들어오면(라이브 캡처·QA·딥링크) 세션 보관소가 비어 있어
  // `불러오지 못했어요.` 만 찍혔다 — 화면기획대로 그려지는 화면이 실제로는 통째로 오류로 보였다.
  // 근거 API 는 있다: GET /api/v1/chat-rooms/my-kick-histories 가 내 강퇴 이력을 전부 준다
  // (MoyeoApi.myKickHistories — 웹이 이미 갖고 있으면서 호출부만 없었다).
  // 알림에서 넘어온 이력이 있으면 그것을 그대로 쓰고, 없을 때만 목록의 최신 1건으로 채운다.
  const liveMode = window.MoyeoApi?.live();
  const remembered = liveMode ? window.MoyeoApi.recalledKickHistory() : null;
  const [fetched, setFetched] = React.useState(null);
  const [status, setStatus] = React.useState(() => {
    if (!liveMode) return 'signed-out';
    return remembered ? 'live' : 'loading';
  });
  React.useEffect(() => {
    if (!liveMode || remembered) return undefined;
    let active = true;
    setStatus('loading');
    window.MoyeoApi.myKickHistories()
      .then((result) => {
        if (!active) return;
        const list = Array.isArray(result) ? result : (result?.kickHistories || []);
        // 가장 최근 강퇴 1건. 없으면 지어내지 않고 빈 상태로 남긴다.
        const latest = [...list].sort((a, b) => String(b?.kickedAt || '').localeCompare(String(a?.kickedAt || '')))[0] || null;
        setFetched(latest);
        setStatus(latest ? 'live' : 'empty');
      })
      .catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [liveMode, remembered]);
  const kick = remembered || fetched;
  const kickedAtLabel = kick?.kickedAt ? `${window.MoyeoApi.formatRelative(kick.kickedAt)} · 호스트 결정` : '호스트 결정';

  if (kick) {
    return (
      <Phone>
        <div style={{ position: 'absolute', inset: 0, paddingTop: 60, display: 'flex', flexDirection: 'column', background: T.bgBase }}>
          <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="back" size={24}/></div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>내보내기 안내</div>
            <div style={{ width: 24 }}/>
          </div>
          <div style={{ padding: '12px 20px 0', overflow: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 0 22px' }}>
              <div style={{ width: 64, height: 64, borderRadius: 999, background: T.dangerBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="warning" size={30} color={T.dangerText}/>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 14, textAlign: 'center', lineHeight: '26px' }}>{kick.roomTitle}에서<br/>내보내졌어요</div>
              <div style={{ fontSize: 12, color: T.text500, marginTop: 6 }}>{kickedAtLabel}</div>
            </div>
            <div style={{ borderRadius: 14, background: T.bgRaised, border: `1px solid ${T.line100}`, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>호스트가 남긴 사유</div>
              <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: T.bgSubtle, fontSize: 13, color: T.text700, lineHeight: '20px' }}>
                “{kick.reason}”
              </div>
            </div>
            <div style={{ marginTop: 12, borderRadius: 14, background: T.bgRaised, border: `1px solid ${T.line100}`, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>내보내진 뒤에는</div>
              {[
                '이 모임에는 다시 신청할 수 없어요.',
                '채팅방이 내 목록에서 사라져요. 이미 남긴 대화는 모임 채팅방에 그대로 남아요.',
                '다른 모임을 찾고 신청하는 데에는 아무 영향이 없어요.',
              ].map(line => (
                <div key={line} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 4, height: 4, borderRadius: 999, background: T.text500, marginTop: 7, flexShrink: 0 }}/>
                  <div style={{ fontSize: 12.5, color: T.text700, lineHeight: '18px' }}>{line}</div>
                </div>
              ))}
            </div>
            {/* 「내보내진 기록 전체 보기」 버튼은 **웹에만** 있었다 — 기획에도 앱에도 없다.
                4열 비교에서 웹만 항목이 하나 더 있어 눈에 걸렸다 (사용자 지적, 2026-09-09).
                13-2 화면 자체는 남아 있고 라우트로 열 수 있다. */}
          </div>
          <div style={{ flex: 1 }}/>
          <div style={{ padding: '0 20px 32px' }}>
            <Btn variant="primary" full onClick={() => nav.back()} testId="removal-reason-confirm">확인</Btn>
          </div>
        </div>
      </Phone>
    );
  }
  // 강퇴 이력을 못 받으면 모임 이름·사유를 지어내지 않는다.
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 60, display: 'flex', flexDirection: 'column', background: T.bgBase }}>
        <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="back" size={24}/></div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>내보내기 안내</div>
          <div style={{ width: 24 }}/>
        </div>
        <div role="status" data-testid="removal-reason-state" style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13, lineHeight: '21px' }}>
          {status === 'signed-out' && '로그인하면 모집 중인 모임을 볼 수 있어요.'}
          {status === 'loading' && '불러오는 중이에요…'}
          {status === 'empty' && '내보내진 모임이 없어요.'}
          {status === 'error' && '불러오지 못했어요.'}
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ padding: '0 20px 32px' }}>
          <Btn variant="primary" full onClick={() => nav.back()} testId="removal-reason-confirm">확인</Btn>
        </div>
      </div>
    </Phone>
  );
}

// 인기 검색어 한 줄의 **등락** — 서버가 준 값만 쓴다 (2026-09-09 서버 추가).
// `GET /api/v1/search/popular-keywords` 가 `rankTrend`(UP·DOWN·SAME·NEW)와
// `rankChange`(변동 폭. 신규 진입은 null)를 준다. 기준은 **전일 순위**다(API 스펙).
// 낡은 응답처럼 `rankTrend` 가 없으면 **아무것도 그리지 않는다** — 지어내지 않는다(NO-MOCK R1).
function popularRankTrend(row) {
  const step = Math.abs(Number(row && row.rankChange) || 0);
  switch (row && row.rankTrend) {
    case 'UP': return { text: step > 0 ? `▲${step}` : '▲', color: T.accent500, label: `전일 대비 ${step}단계 상승` };
    case 'DOWN': return { text: step > 0 ? `▼${step}` : '▼', color: T.info, label: `전일 대비 ${step}단계 하락` };
    case 'SAME': return { text: '—', color: T.text400, label: '전일과 같은 순위' };
    case 'NEW': return { text: 'NEW', color: T.primary600, label: '새로 진입' };
    default: return null;
  }
}

function ScreenSearch() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  const store = window.MoyeoRecentSearches;
  const inputRef = React.useRef(null);

  const [recent, setRecent] = React.useState(() => store?.read() || []);
  const [draft, setDraft] = React.useState('');

  // ── 인기 검색어 (GET /api/v1/search/popular-keywords?limit=10) ──
  // 순위를 지어낼 수 없어 지웠던 섹션인데, 서버가 집계 API 를 열어 되살렸다.
  // 그리는 값은 서버가 준 rank · keyword · searchCount **뿐**이다.
  // 화면기획의 상승·하락 화살표(▲▼)는 목데이터였다 — 서버가 주지 않으므로 그리지 않는다.
  // 0건(집계 전 · Redis 장애)이면 실패가 아니라 **섹션 자체를 그리지 않는다**. 새 빈 상태 문구를 만들지 않는다.
  const liveMode = Boolean(window.MoyeoApi?.live());
  const [popular, setPopular] = React.useState([]);
  React.useEffect(() => {
    if (!liveMode) return undefined;
    let active = true;
    window.MoyeoApi.popularKeywords(10)
      .then((rows) => { if (active) setPopular(Array.isArray(rows) ? rows : []); })
      .catch(() => { if (active) setPopular([]); });
    return () => { active = false; };
  }, [liveMode]);

  // 캡처에서도 실제 저장소를 그대로 쓴다 — 화면 안에서만 도는 별도 경로를 두지 않는다.
  const rememberSearch = (text) => setRecent(store ? store.add(text) : []);
  const forgetSearch = (text) => setRecent(store ? store.remove(text) : []);
  const forgetAllSearches = () => setRecent(store ? store.clear() : []);

  // 검색어를 확정하면 12-1 검색 결과 화면으로 간다 (ATTACH-COMPOSER-CANON §3).
  // 12 는 "검색어를 넣는 화면"이고, 결과는 코스·모집 탭을 가진 12-1 이 그린다.
  const runSearch = (raw) => {
    const text = (raw || '').trim();
    if (!text) return;
    setDraft(text);
    rememberSearch(text);
    window.MoyeoApi?.selectSearchKeyword?.(text);
    nav.go('search-results');
  };

  const clearDraft = () => {
    setDraft('');
    inputRef.current?.focus();
  };

  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 60 }}>
        <div style={{ padding: '8px 20px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="back" size={24}/></div>
          <form
            onSubmit={(event) => { event.preventDefault(); runSearch(draft); }}
            style={{ flex: 1, height: 44, borderRadius: 12, background: T.bgSubtle, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px' }}
          >
            {/* 돋보기도 그 자리에서 검색을 실행한다. form 의 onSubmit 으로도 같은 일이 일어나지만
                (Enter), 버튼 자신에게 핸들러가 없으면 "눌러도 아무 일 없는 버튼" 감사에 걸리고
                무엇보다 코드를 읽는 사람이 동작을 확인할 수 없다. type=button 으로 두어
                제출이 두 번 일어나지 않게 한다. */}
            <button type="button" aria-label="검색" data-testid="search-submit" data-network-action="true" onClick={() => runSearch(draft)} style={{ padding: 0, border: 0, background: 'transparent', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Icon name="search" size={18} color={T.text500}/>
            </button>
            <input
              ref={inputRef}
              data-testid="search-input"
              type="search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="어디로 떠나고 싶나요?"
              aria-label="검색어"
              style={{ flex: 1, minWidth: 0, height: 40, border: 0, outline: 'none', background: 'transparent', fontSize: 14, color: T.text900, fontFamily: T.fontStack, padding: 0 }}
            />
            {draft && (
              <button type="button" aria-label="검색어 지우기" data-testid="search-clear" onClick={clearDraft} style={{ padding: 0, border: 0, background: 'transparent', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Icon name="close" size={16} color={T.text500}/>
              </button>
            )}
          </form>
          <div onClick={() => nav.back()} style={{ fontSize: 14, color: T.text500, cursor: 'pointer' }}>취소</div>
        </div>
        <div style={{ height: 'calc(100% - 116px)', overflow: 'auto', padding: '12px 20px 44px' }}>
            <React.Fragment>
              {/* 비어 있으면 제목·전체 삭제·칩 영역을 통째로 숨긴다 (기획에 빈 상태 문구가 없다) */}
              {recent.length > 0 && (
                <div data-testid="search-recent">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>최근 검색어</div>
                    <div onClick={forgetAllSearches} data-testid="search-recent-clear" style={{ fontSize: 11, color: T.text500, cursor: 'pointer' }}>전체 삭제</div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {recent.map(s => (
                      <div key={s} onClick={() => runSearch(s)} data-testid={`search-recent-${s}`} style={{ height: 32, padding: '0 12px', borderRadius: 999, border: `1px solid ${T.line200}`, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: T.text700, cursor: 'pointer' }}>
                        {s} <div onClick={(event) => { event.stopPropagation(); forgetSearch(s); }} data-testid={`search-recent-remove-${s}`} style={{ cursor: 'pointer' }}><Icon name="close" size={12} color={T.text400}/></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {recent.length === 0 && (
                <div style={{ padding: popular.length > 0 ? '28px 0' : '48px 0', textAlign: 'center', fontSize: 13, color: T.text500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  {/* iOS 의 `clock.arrow.circlepath` 와 같은 뜻의 아이콘 (2026-09-09 네 표면 통일) */}
                  <Icon name="clock" size={26} color={T.primary500}/>
                  최근 검색어가 없어요.
                </div>
              )}
              {/* 인기 검색어. 0건이면 이 블록이 통째로 사라진다 — 빈 상태 문구를 두지 않는다. */}
              {popular.length > 0 && (
                <div data-testid="search-popular" style={{ marginTop: recent.length > 0 ? 24 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>인기 검색어</div>
                    {/* 등락의 기준 시점을 적는다 — 서버 집계가 **전일 순위 대비**다 (API 스펙) */}
                    <div style={{ fontSize: 11, color: T.text400 }}>전일 대비</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {popular.map((row) => (
                      <button
                        key={`${row.rank}-${row.keyword}`}
                        type="button"
                        data-testid={`search-popular-${row.rank}`}
                        onClick={() => runSearch(row.keyword)}
                        style={{
                          // 글자 크기·간격은 화면기획 12 를 그대로 따른다 (줄 14 · 등락 11 · 간격 16 · 높이 44)
                          display: 'flex', alignItems: 'center', gap: 16, height: 44, padding: 0,
                          border: 0, background: 'transparent', cursor: 'pointer', fontFamily: T.fontStack, textAlign: 'left',
                        }}
                      >
                        {/* 3위까지만 초록으로 물들인다 — 기획이 그렇게 나눈다 */}
                        <span style={{ width: 16, fontSize: 14, fontWeight: 700, color: row.rank <= 3 ? T.primary600 : T.text500, fontVariantNumeric: 'tabular-nums' }}>{row.rank}</span>
                        <span style={{ flex: 1, minWidth: 0, fontSize: 14, color: T.text900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.keyword}</span>
                        {/* 등락. 서버가 `rankTrend` 를 주지 않는 응답이면 이 자리가 빈다 — 지어내지 않는다.
                            검색 횟수(`searchCount`)는 여전히 감춘다: QA 검색이 만든 숫자가 실제 인기와
                            무관해 보였다(사용자 결정 2026-09-09). */}
                        {(() => {
                          const trend = popularRankTrend(row);
                          if (!trend) return null;
                          return (
                            <span
                              data-testid={`search-popular-trend-${row.rank}`}
                              aria-label={trend.label}
                              style={{ fontSize: 11, fontWeight: 700, color: trend.color, fontVariantNumeric: 'tabular-nums' }}
                            >{trend.text}</span>
                          );
                        })()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </React.Fragment>
        </div>
      </div>
    </Phone>
  );
}


// ───────── 23 · 시스템 상태 (Empty/Loading/Error/Offline) ─────────
function ScreenStates() {
  return (
    <div style={{ width: 393, height: 852, background: T.bgSubtle, borderRadius: 24, padding: 16, display: 'grid', gridTemplateRows: 'repeat(4, 1fr)', gap: 12, fontFamily: T.fontStack }}>
      {/* Empty */}
      <div style={{ background: T.bgBase, borderRadius: 16, padding: 16, border: `1px solid ${T.line100}`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: T.primary50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="users" size={28} color={T.primary500}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: T.text500, marginBottom: 2 }}>EMPTY</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>아직 참여한 모임이 없어요</div>
          <div style={{ fontSize: 12, color: T.text500, marginTop: 4 }}>첫 모임을 열어보세요</div>
        </div>
        <button style={{ height: 36, padding: '0 12px', borderRadius: 10, background: T.primary500, color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, fontFamily: T.fontStack }}>+ 만들기</button>
      </div>
      {/* Loading */}
      <div style={{ background: T.bgBase, borderRadius: 16, padding: 16, border: `1px solid ${T.line100}` }}>
        <div style={{ fontSize: 11, color: T.text500, marginBottom: 8 }}>LOADING (Skeleton)</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: T.line100 }}/>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 6 }}>
            <div style={{ height: 12, width: '70%', background: T.line100, borderRadius: 4 }}/>
            <div style={{ height: 10, width: '50%', background: T.line100, borderRadius: 4 }}/>
            <div style={{ height: 10, width: '85%', background: T.line100, borderRadius: 4 }}/>
          </div>
        </div>
      </div>
      {/* Error */}
      <div style={{ background: T.bgBase, borderRadius: 16, padding: 16, border: `1px solid ${T.line100}`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: T.dangerBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>⚠</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: T.text500, marginBottom: 2 }}>ERROR</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>문제가 생겼어요</div>
          <div style={{ fontSize: 12, color: T.text500, marginTop: 4 }}>잠시 후 다시 시도해주세요 <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, color: T.text400 }}>E-503</span></div>
        </div>
        <button style={{ height: 36, padding: '0 12px', borderRadius: 10, background: 'transparent', border: `1px solid ${T.line200}`, fontSize: 12, fontWeight: 600, fontFamily: T.fontStack }}>새로고침</button>
      </div>
      {/* Offline */}
      <div style={{ background: T.warningBg, borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 11, color: T.warningText, fontWeight: 600 }}>OFFLINE</div>
        <div style={{ flex: 1, fontSize: 13, color: T.warningText, fontWeight: 500 }}>인터넷에 연결되어 있지 않아요</div>
        <div style={{ fontSize: 12, color: T.warningText, fontWeight: 600 }}>재시도</div>
      </div>
    </div>
  );
}

// ───────── 21 · 특수 메시지 카드 6종 (장소·만날 위치·투표·정산 메모·사진·시스템) ─────────
//
// ⚠️ 예전 주석은 **틀렸다** — `대응 API 가 없다` 며 화면을 비워 두고 있었다. 6종 전부 API 가 있다:
//   TOURISM_CONTENT   POST /chat-rooms/{roomId}/messages/tourism-contents  { contentId }
//   LOCATION          POST /chat-rooms/{roomId}/messages/locations         (본문 없음 · 방의 집합 좌표)
//   POLL              POST /chat-rooms/{roomId}/messages/polls             { question, options[], anonymous }
//   SETTLEMENT_MEMO   POST /chat-rooms/{roomId}/messages/settlement-memos  { memo }
//   IMAGE             POST /chat-rooms/{roomId}/messages/images            (multipart)
//   SYSTEM            서버가 만든다 (개설·참여·공지 등록·여행 확정 등)
// 읽기는 `GET /chat-rooms/{roomId}/messages` 하나로 끝난다 — 응답의 `type` 으로 종류를 가른다.
//
// 이 화면은 **카드 렌더링 견본**이라, 채팅방(20)과 같은 컴포넌트(SpecialMessageCard ·
// SystemMessageNote)로 그린다. 두 화면이 다르게 생기면 그게 결함이다.
// 서버가 이 방에 주지 않은 종류는 **카드를 그리지 않는다** — 예시로 채우지 않는다(NO-MOCK R1·R3).
const SPECIAL_MESSAGE_KINDS = [
  { type: 'TOURISM_CONTENT', label: '장소' },
  { type: 'LOCATION', label: '지도 · 만남' },
  { type: 'POLL', label: '투표' },
  { type: 'SETTLEMENT_MEMO', label: '정산 메모' },
  { type: 'IMAGE', label: '사진' },
  { type: 'SYSTEM', label: '시스템' },
];

function ScreenSpecialMessages() {
  const liveMode = window.MoyeoApi?.live();
  const roomId = liveMode ? window.MoyeoApi.selectedRoomId() : null;
  const [messages, setMessages] = React.useState(null);
  const [status, setStatus] = React.useState('loading');
  const [reloadKey, setReloadKey] = React.useState(0);
  React.useEffect(() => {
    if (!liveMode || !roomId) return undefined;
    let active = true;
    setStatus('loading');
    window.MoyeoApi.roomMessages(roomId, { limit: 50 })
      .then((result) => {
        if (!active) return;
        if (!Array.isArray(result?.messages)) { setStatus('failed'); return; }
        setMessages(result.messages);
        setStatus('ready');
      })
      .catch(() => { if (active) setStatus('failed'); });
    return () => { active = false; };
  }, [liveMode, roomId, reloadKey]);

  // 투표는 견본에서도 실제로 참여된다 — 채팅방(20)과 같은 엔드포인트를 쓴다.
  // 응답이 갱신된 카드를 그대로 주므로 그 메시지만 바꿔 끼운다.
  const [votingMessageId, setVotingMessageId] = React.useState(null);
  const voteOnPoll = async (message, option) => {
    if (votingMessageId != null || !roomId) return;
    setVotingMessageId(message.messageId);
    try {
      const updated = option.votedByMe
        ? await window.MoyeoApi.cancelPollVote(roomId, message.messageId)
        : await window.MoyeoApi.votePollOption(roomId, message.messageId, option.optionId);
      if (updated?.messageId != null) {
        setMessages((current) => (current || []).map(
          (item) => (item.messageId === updated.messageId ? updated : item),
        ));
      }
    } catch (_) { /* 실패 시 카드를 그대로 둔다 */ }
    setVotingMessageId(null);
  };

  // 종류별로 **가장 최근 한 건**을 견본으로 뽑는다. 없는 종류는 자리 자체가 없다.
  const samples = SPECIAL_MESSAGE_KINDS.map((kind) => {
    const found = (messages || []).filter((message) => message.type === kind.type);
    return { ...kind, message: found.length > 0 ? found[found.length - 1] : null };
  });
  const drawn = samples.filter((kind) => kind.message);
  const missing = samples.filter((kind) => !kind.message).map((kind) => kind.label);

  return (
    <div style={{ width: 393, height: 852, background: T.bgSubtle, borderRadius: 24, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, fontFamily: T.fontStack, overflow: 'auto' }}>
      <div style={{ fontSize: 11, color: T.text500, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>채팅방 · 특수 메시지 6종</div>
      {(!liveMode || status !== 'ready') && (
        <TabDataNotice
          status={status}
          signedOut={!liveMode || !roomId}
          onRetry={() => setReloadKey((value) => value + 1)}
          style={{ padding: '40px 8px', textAlign: 'center', fontSize: 13, lineHeight: '21px' }}
          testId="msgs-notice"
        />
      )}
      {status === 'ready' && drawn.length === 0 && (
        <div role="status" style={{ padding: '40px 8px', textAlign: 'center', color: T.text500, fontSize: 13, lineHeight: '21px' }}>
          아직 대화가 없어요.
        </div>
      )}
      {drawn.map((kind) => (kind.type === 'SYSTEM'
        ? <SystemMessageNote key={kind.type} message={kind.message} style={{ margin: '0 auto' }}/>
        : (
          <div key={kind.type} data-testid={`msgs-sample-${kind.type}`}>
            <div style={{ fontSize: 10.5, color: T.text500, marginBottom: 5, fontVariantNumeric: 'tabular-nums' }}>
              {kind.message.senderNickname}
              {window.MoyeoApi?.formatClock ? ` · ${window.MoyeoApi.formatClock(kind.message.createdAt)}` : ''}
            </div>
            <div style={{ background: T.bgBase, borderRadius: 14, padding: 13, border: `1px solid ${T.line200}` }}>
              <SpecialMessageCard
                message={kind.message}
                voting={votingMessageId === kind.message.messageId}
                onVote={voteOnPoll}
              />
            </div>
          </div>
        )))}
      {status === 'ready' && drawn.length > 0 && missing.length > 0 && (
        // 없는 종류를 예시로 채우지 않는다. 대신 **왜 비었는지**를 적는다 —
        // 카드가 빠진 것과 그 방에 그 메시지가 없는 것은 다르다.
        <div style={{ fontSize: 11, color: T.text500, lineHeight: '17px' }}>
          이 모임에 아직 없는 카드: {missing.join(' · ')}
        </div>
      )}
    </div>
  );
}

// ───────── 31 · 채팅방 나가기 확인 (31-1 참가자 · 호스트) ─────────
//
// **호스트와 참가자는 결과가 전혀 다르다.** 호스트가 나가면 모임이 없어지고,
// 참가자가 나가면 자리가 하나 비어 대기자가 들어온다. 그런데 문구가 호스트 기준으로
// **고정**돼 있어서, 참가자가 이 화면을 보면 자기가 모임을 없애는 것으로 읽혔다 —
// 정작 20-1 사이드 메뉴의 부제는 "나가면 대기 중인 다음 신청자가 자동으로 합류해요"(참가자 관점)였다.
// 그래서 화면을 새로 만들지 않고 **role 로 가른다** (ATTACH-COMPOSER-CANON §6-5).
//
// 근거: DELETE /api/v1/chat-rooms/{roomId}/members/me
//       — "채팅방 나가기 **또는 대기 취소**" (호출자 역할에 따라 결과가 다르다)
// ⚠️ 파괴적 호출이라 QA 방에서 실행해 검증하지 않았다 — 배선만 해 둔다.
// 본문은 없다 — 팝업의 "나가는 이유"는 기획 문구이고 서버가 사유를 받지 않아 전송하지 않는다.
function ScreenLeaveAlert({ role = null }) {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const liveMode = window.MoyeoApi?.live();
  const roomId = liveMode ? window.MoyeoApi.selectedRoomId() : null;
  // 역할은 서버 멤버 목록의 me && host 로 정한다. 지정 role(캡처·프로토타입 진입)이 있으면 그것을 쓴다.
  // 서버가 답하기 전에는 문구를 고르지 않는다 — 잘못된 쪽을 먼저 보여주면 그게 더 나쁘다.
  const [serverIsHost, setServerIsHost] = React.useState(null);
  React.useEffect(() => {
    if (role || !liveMode || !roomId) return undefined;
    let active = true;
    window.MoyeoApi.roomMembers(roomId)
      .then((result) => {
        if (!active) return;
        const me = (result?.members || []).find((member) => member.me);
        setServerIsHost(me ? Boolean(me.host) : false);
      })
      .catch(() => { if (active) setServerIsHost(false); });
    return () => { active = false; };
  }, [role, liveMode, roomId]);
  const isHost = role ? role === 'host' : (serverIsHost ?? true);
  const copy = isHost
    ? {
      title: <React.Fragment>호스트가 나가면<br/>이 모임은 종료돼요</React.Fragment>,
      desc: '승인된 동행자 모두에게 알림이 가고, 채팅방은 14일 동안 읽기 전용으로 유지된 후 사라져요.',
      confirm: '모임 종료',
    }
    : {
      title: <React.Fragment>이 모임에서<br/>나갈까요?</React.Fragment>,
      desc: '내 자리가 비면서 대기 중인 다음 신청자가 자동으로 합류해요. 다시 신청하면 맨 뒤부터예요.',
      confirm: '나가기',
    };
  const [busy, setBusy] = React.useState(false);
  const leave = async () => {
    if (!roomId) { nav.go('chat-list'); return; }
    if (busy) return;
    setBusy(true);
    try {
      await window.MoyeoApi.leaveRoom(roomId);
      // TAB-STATE-CANON R4: 나간 방이 목록에 남으면 안 된다 — 그 키만 덜어낸다.
      window.MoyeoTabCache?.invalidate?.(window.MoyeoTabCache.ROOM_LIST_KEYS);
      window.MoyeoApi.selectRoom(null);
      nav.go('chat-list');
    } catch (_) {
      setBusy(false); // 실패 시 팝업을 닫지 않는다 (기획에 오류 문구 자리가 없다)
    }
  };
  return (
    <div data-testid={isHost ? 'leave-alert-host' : 'leave-alert-member'} style={{ width: 393, height: 852, borderRadius: 24, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.fontStack, overflow: 'hidden' }}>
      {/* 이전 화면(20-1 모임 정보)이 딤 아래에 그대로 깔려 있어야 팝업이 "위에 떠 있다"고 읽힌다 (changeLog14) */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}><ChatMenuBody/></div>
      <div style={{ position: 'absolute', inset: 0, background: T.bgOverlay }}/>
      {/* 중앙 팝업 표면도 시트와 같이 bgRaised — 다크 모드에서 bgBase는 화면 배경과 같은 값이다 */}
      <div style={{ position: 'relative', width: 320, background: T.bgRaised, borderRadius: 20, border: `1px solid ${T.line200}`, padding: 24, boxShadow: T.l3 }}>
        <div style={{ width: 48, height: 48, borderRadius: 999, background: T.dangerBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 22 }}>⚠</div>
        <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4, letterSpacing: '-0.3px' }}>{copy.title}</div>
        <div style={{ fontSize: 13, color: T.text500, marginTop: 10, lineHeight: 1.6 }}>{copy.desc}</div>
        {/* 「나가는 이유」 칸을 두지 않는다.
            `DELETE /chat-rooms/{id}/members/me` 는 **본문을 무시한다** — 사유를 실어 보내도
            200 만 오고 어디에도 남지 않는다(2026-09-09 실서버로 방 244 를 실제로 나가 확인).
            그래서 라벨만 있는 빈 칸이었고, 사용자는 「입력이 안 된다」고 읽었다 (31).
            받아 주는 API 가 생기면 입력으로 만든다 — 요청은 `BE-요청사항-2026-09-04.md` §8-4. */}
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button type="button" data-testid="leave-cancel" onClick={() => nav.back()} style={{ flex: 1, height: 44, borderRadius: 10, border: `1px solid ${T.line200}`, background: 'transparent', fontSize: 14, fontWeight: 600, color: T.text900, fontFamily: T.fontStack, cursor: 'pointer' }}>취소</button>
          <button type="button" data-testid="leave-confirm" disabled={busy} onClick={leave} style={{ flex: 1, height: 44, borderRadius: 10, border: 'none', background: T.danger, color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: T.fontStack, cursor: 'pointer' }}>{copy.confirm}</button>
        </div>
      </div>
    </div>
  );
}

// 31-1 참가자 나가기 — 같은 화면을 역할만 바꿔 연다 (캡처·프로토타입 진입용).
function ScreenLeaveMember() { return <ScreenLeaveAlert role="member"/>; }

Object.assign(window, {
  ScreenLogin, ScreenEmailAuth, ScreenProfileBasic, ScreenProfileTaste, ScreenTerms,
  // ScreenCreateReview 는 여기 있었지만 screens-refined.jsx 가 같은 이름으로 다시 정의해
  // (index.html 에서 뒤에 로드된다) 이 파일 것은 화면에 뜬 적이 없다. 17 create-review 는
  // 코스 출처를 고르는 Step 1 이고, 지운 쪽은 기획 예시가 박힌 Step 5 요약이었다.
  // 실제 Step 5 는 screens-additions.jsx 의 ScreenCreateSummary(create-summary)가 담당한다.
  ScreenHostManage, ScreenChatList, ScreenChatListApplied, ScreenNotifications,
  ScreenRemovalReason, ScreenSearch, ScreenStates, ScreenSpecialMessages, ScreenLeaveAlert, ScreenLeaveMember,
});

// ─── window export ───
Object.assign(window, { ScreenLogin, ScreenEmailAuth, ScreenProfileBasic, ScreenProfileTaste, ScreenTerms, ScreenHostManage, ScreenChatList, ScreenChatListApplied, ScreenNotifications, ScreenRemovalReason, ScreenSearch, ScreenStates, ScreenSpecialMessages, ScreenLeaveAlert, ScreenLeaveMember });
