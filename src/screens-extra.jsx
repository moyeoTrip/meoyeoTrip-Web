// Additional screens to fill gaps in the spec
// Login, Profile Step 3, Terms, Course Detail, Group Create (Step 1, 5),
// Host Mgmt, Chat List, Notifications, Search, Map Explore, Empty States, Special Messages

// ───────── 13 · 로그인 ─────────
function continueAuthFlow(nav, context) {
  if (context?.redirecting) return;
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
      if (context?.redirecting) return;
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
      <div data-testid="auth-login-screen" style={{ position: 'absolute', inset: 0, padding: '66px 18px 28px', overflowY: 'auto', background: T.bgBase }}>
        <div
          data-testid="auth-login-welcome-image"
          role="img"
          aria-label="반갑게 손을 내밀고 인사하는 모여트립 곰, 토끼, 너구리"
          style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 12, background: T.bgSubtle }}
        >
          <img
            className="moyeo-login-welcome-light"
            src="assets/login-welcome.png"
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <img
            className="moyeo-login-welcome-dark"
            src="assets/login-welcome-night.png"
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ marginTop: 22, textAlign: 'left' }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, lineHeight: 1.35, color: T.text900 }}>모여트립에 오신 걸 환영해요</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.5, color: T.text500 }}>30초 안에 시작할 수 있어요</p>
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
          <div role="status" data-testid="auth-login-status" style={{ minHeight: 18, fontSize: 12, lineHeight: '18px', color: error ? T.danger : T.text400, textAlign: 'center' }}>
            {error || '로그인 후 신규 회원만 프로필 설정을 이어가요.'}
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 13-1 · 이메일 인증 ─────────
function ScreenEmailAuth() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  const [mode, setMode] = React.useState('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordConfirmation, setPasswordConfirmation] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const passwordsMatch = mode !== 'signup' || password === passwordConfirmation;
  const canSubmit = /^\S+@\S+\.\S+$/.test(email) && password.length >= 6 && passwordsMatch && !loading;

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const context = await window.MoyeoAuth.begin('email', { email, password, mode });
      continueAuthFlow(nav, context);
    } catch (requestError) {
      setError(requestError?.message || '이메일 인증을 완료하지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setMessage('');
    setError('');
    try {
      await window.MoyeoAuth.resetEmailPassword(email);
      setMessage('비밀번호 재설정 메일을 보냈어요.');
    } catch (requestError) {
      setError(requestError?.message || '재설정 메일을 보내지 못했어요.');
    }
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
          <p style={{ margin: '8px 0 0', color: T.text500, fontSize: 14, lineHeight: 1.55 }}>가입했던 이메일로 로그인하거나 새 계정을 만들어요.</p>
        </div>
        <div role="tablist" aria-label="이메일 인증 방식" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: 4, marginTop: 26, borderRadius: 10, background: T.bgSubtle }}>
          {[['login', '로그인'], ['signup', '새 계정 만들기']].map(([value, label]) => (
            <button key={value} type="button" role="tab" aria-selected={mode === value} data-testid={`email-mode-${value}`} onClick={() => { setMode(value); setPasswordConfirmation(''); setError(''); setMessage(''); }} style={{ height: 40, border: 0, borderRadius: 8, background: mode === value ? T.bgRaised : 'transparent', color: mode === value ? T.primary600 : T.text500, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{label}</button>
          ))}
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 22 }}>
          <label style={{ display: 'grid', gap: 7, color: T.text700, fontSize: 13, fontWeight: 600 }}>
            이메일
            <input data-testid="email-auth-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" style={fieldStyle}/>
          </label>
          <label style={{ display: 'grid', gap: 7, color: T.text700, fontSize: 13, fontWeight: 600 }}>
            비밀번호
            <input data-testid="email-auth-password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="6자 이상 입력" style={fieldStyle}/>
          </label>
          {mode === 'signup' && (
            <label style={{ display: 'grid', gap: 7, color: T.text700, fontSize: 13, fontWeight: 600 }}>
              비밀번호 확인
              <input data-testid="email-auth-password-confirmation" type="password" autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} placeholder="한 번 더 입력" style={fieldStyle}/>
              {passwordConfirmation && !passwordsMatch && <span data-testid="email-auth-password-mismatch" style={{ color: T.danger, fontSize: 12 }}>비밀번호가 서로 같지 않아요.</span>}
            </label>
          )}
          {mode === 'login' && (
            <button data-testid="email-password-reset" type="button" onClick={resetPassword} style={{ alignSelf: 'flex-end', border: 0, padding: '2px 0', background: 'transparent', color: T.primary600, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>비밀번호를 잊으셨나요?</button>
          )}
          <button data-testid="email-auth-submit" type="submit" disabled={!canSubmit} style={{ height: 50, marginTop: 6, border: 0, borderRadius: 10, background: canSubmit ? T.primary600 : T.bgSubtle, color: canSubmit ? '#fff' : T.text400, fontSize: 15, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'default' }}>
            {loading ? '확인 중...' : mode === 'signup' ? '계정 만들고 계속하기' : '로그인'}
          </button>
        </form>
        <div role="status" data-testid="email-auth-status" style={{ minHeight: 42, marginTop: 14, color: error ? T.danger : T.primary600, fontSize: 13, lineHeight: 1.5, textAlign: 'center' }}>{error || message}</div>
        <p style={{ margin: 'auto 0 0', color: T.text400, fontSize: 12, lineHeight: 1.55, textAlign: 'center' }}>이메일 인증 후에도 가입 진행 단계는 서버 응답에 따라 이어집니다.</p>
      </div>
    </Phone>
  );
}

// ───────── 14 · 프로필 Step 3 (생년월일/성별) ─────────
function KoreanBirthDatePicker({ value, onChange }) {
  const [year, month, day] = value.split('-').map(Number);
  const currentYear = new Date().getFullYear();
  const daysInMonth = new Date(year, month, 0).getDate();
  const selectStyle = {
    flex: 1, minWidth: 0, height: 54, border: 0, borderRadius: 10,
    padding: '0 10px', background: T.bgRaised, color: T.text900,
    fontSize: 15, fontWeight: 600, fontFamily: T.fontStack,
  };
  const update = (nextYear, nextMonth, nextDay) => {
    const maxDay = new Date(nextYear, nextMonth, 0).getDate();
    const safeDay = Math.min(nextDay, maxDay);
    onChange(`${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`);
  };

  return (
    <div data-testid="auth-birth-date" aria-label="생년월일" style={{
      display: 'flex', gap: 8, padding: 8, borderRadius: 14,
      border: `1.5px solid ${T.primary500}`, background: T.bgBase,
      boxShadow: `0 0 0 4px ${T.primary50}`,
    }}>
      <select aria-label="출생 연도" value={year} onChange={(event) => update(Number(event.target.value), month, day)} style={{ ...selectStyle, flex: 1.35 }}>
        {Array.from({ length: currentYear - 1900 + 1 }, (_, index) => currentYear - index).map((item) => <option key={item} value={item}>{item}년</option>)}
      </select>
      <select aria-label="출생 월" value={month} onChange={(event) => update(year, Number(event.target.value), day)} style={selectStyle}>
        {Array.from({ length: 12 }, (_, index) => index + 1).map((item) => <option key={item} value={item}>{item}월</option>)}
      </select>
      <select aria-label="출생 일" value={day} onChange={(event) => update(year, month, Number(event.target.value))} style={selectStyle}>
        {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((item) => <option key={item} value={item}>{item}일</option>)}
      </select>
    </div>
  );
}

function ScreenProfileBasic() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  const [birthDate, setBirthDate] = React.useState('1998-04-12');
  const [gender, setGender] = React.useState('F');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const nickname = window.__moyeoSelectedNickname || '선택한 닉네임';

  const submit = async () => {
    if (!birthDate || !gender || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const tokens = await window.MoyeoAuth.signup({
        nickname,
        nicknameSelectionToken: window.__moyeoNicknameSelectionToken,
        gender,
        birthDate,
      });
      if (tokens.signupState === 'PROFILE_IMAGE_REQUIRED') nav.go('prof-2');
      else nav.go('home', { replace: true });
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
            <div style={{ fontSize: 11, color: T.text500, marginTop: 6 }}>나이대만 공개됩니다 (20대 후반)</div>
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
            {error || '저장 후 프로필 이미지 만들기를 이어가요.'}
          </div>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ padding: '0 20px 32px', display: 'flex', gap: 8 }}>
          <Btn variant="secondary" onClick={() => nav.back()}>이전</Btn>
          <div style={{ flex: 1 }}><Btn variant="primary" full disabled={!birthDate || !gender || submitting} onClick={submit} testId="auth-basic-submit">{submitting ? '회원 생성 중...' : '저장하고 프로필 만들기'}</Btn></div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 15 · 약관 동의 ─────────
function ScreenTerms() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  const [agreed, setAgreed] = React.useState(new Set());
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const requiredKeys = ['age', 'service', 'privacy'];
  const allKeys = [...requiredKeys, 'location', 'marketing'];
  const requiredReady = requiredKeys.every((key) => agreed.has(key));
  const Row = ({ itemKey, required, text, master }) => {
    const checked = master ? allKeys.every((key) => agreed.has(key)) : agreed.has(itemKey);
    const toggle = () => {
      if (submitting) return;
      if (master) {
        setAgreed(checked ? new Set() : new Set(allKeys));
        return;
      }
      setAgreed((current) => {
        const next = new Set(current);
        if (next.has(itemKey)) next.delete(itemKey); else next.add(itemKey);
        return next;
      });
    };
    return (
    <button type="button" onClick={toggle} style={{ width: '100%', height: 52, display: 'flex', alignItems: 'center', gap: 12, padding: '0 4px', border: 'none', borderTop: master ? 'none' : `1px solid ${T.line100}`, background: 'transparent', fontFamily: T.fontStack, cursor: 'pointer' }}>
      <div style={{ width: 24, height: 24, borderRadius: 6, background: checked ? T.primary500 : 'transparent', border: checked ? 'none' : `1.5px solid ${T.line300}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {checked && <Icon name="check" size={16} color="#fff" strokeWidth={2.5}/>}
      </div>
      <div style={{ flex: 1, fontSize: master ? 16 : 14, fontWeight: master ? 600 : 400, color: T.text900 }}>
        {text} {required && !master && <span style={{ color: T.text500, fontSize: 12, fontWeight: 400 }}>(필수)</span>}
        {!required && !master && <span style={{ color: T.text500, fontSize: 12, fontWeight: 400 }}>(선택)</span>}
      </div>
      {!master && <Icon name="arrow" size={16} color={T.text400}/>}
    </button>
  );
  };
  const finish = async () => {
    if (!requiredReady || submitting) return;
    setSubmitting(true);
    setError('');
    window.setTimeout(() => {
      setSubmitting(false);
      nav.back();
    }, 240);
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
          <Row master text="모두 동의"/>
          <div style={{ height: 1, background: T.line200, margin: '4px 0' }}/>
          <Row itemKey="age" required text="만 14세 이상"/>
          <Row itemKey="service" required text="이용약관 동의"/>
          <Row itemKey="privacy" required text="개인정보 처리방침"/>
          <Row itemKey="location" required={false} text="위치정보 이용"/>
          <Row itemKey="marketing" required={false} text="마케팅 정보 수신"/>
          <div role="status" style={{ minHeight: 20, marginTop: 12, fontSize: 12, color: error ? T.danger : T.text400, textAlign: 'center' }}>
            {error || '선택 동의 항목은 나중에 설정에서 바꿀 수 있어요.'}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 32, left: 20, right: 20 }}>
          <Btn variant="primary" full disabled={!requiredReady || submitting} onClick={finish} testId="auth-terms-finish">
            {submitting ? '저장 중...' : '동의 저장'}
          </Btn>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 16 · 코스 상세 ─────────
function ScreenCourseDetail() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  const itinerary = [
    { day: 'Day 1 · 11/8 (토)', items: [
      { time: '10:00', name: '불국사', desc: '천년 고찰 단풍길' },
      { time: '13:00', name: '첨성대', desc: '경주의 상징, 가을 사진' },
      { time: '16:30', name: '황리단길', desc: '느긋한 카페와 골목 산책' },
      { time: '19:00', name: '월정교', desc: '물 위로 비치는 야경 포인트' },
    ] },
    { day: 'Day 2 · 11/9 (일)', items: [
      { time: '09:30', name: '동궁과 월지', desc: '아침 산책과 연못 풍경' },
      { time: '12:00', name: '경주 교촌마을', desc: '한옥 골목과 점심 코스' },
      { time: '14:30', name: '감포 바다 산책', desc: '동해 바람을 느끼는 마무리' },
      { time: '17:00', name: '경주역', desc: '일정 정리와 귀가' },
    ] },
  ];
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <ImgPlaceholder height={280} hue="autumn" radius={0} label="course hero"/>
        <div style={{ position: 'absolute', top: 60, left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}><div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="back" size={20}/></div></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="share" size={18}/></div>
            <div style={{ width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="bookmark" size={18}/></div>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 240, left: 0, right: 0, bottom: 88, background: T.bgBase, borderRadius: '24px 24px 0 0', padding: '24px 20px', overflow: 'auto' }}>
          <div style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 8, background: T.primary100, color: T.primary700, fontSize: 12, fontWeight: 500, marginBottom: 8 }}>경주</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.3 }}>경주 1박 2일<br/>단풍·야경 코스</div>
          <div style={{ fontSize: 13, color: T.text500, marginTop: 6 }}>가을 주말, 한옥에서 보내는 차분한 이틀</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 16, background: T.bgSubtle, borderRadius: 16, marginTop: 16 }}>
            <div><div style={{ fontSize: 11, color: T.text500 }}>일정</div><div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>2일</div></div>
            <div><div style={{ fontSize: 11, color: T.text500 }}>방문지</div><div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>4개</div></div>
            <div><div style={{ fontSize: 11, color: T.text500 }}>총 이동</div><div style={{ fontSize: 14, fontWeight: 600, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>120 km</div></div>
            <div><div style={{ fontSize: 11, color: T.text500 }}>1인 예상</div><div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>15만원</div></div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>코스 일정</div>
          {itinerary.map((group) => (
            <React.Fragment key={group.day}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.primary700, margin: '16px 0 8px' }}>{group.day}</div>
              {group.items.map((s) => (
                <div key={`${group.day}-${s.time}-${s.name}`} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: `1px solid ${T.line100}` }}>
                  <div style={{ width: 50, fontSize: 12, color: T.text500, fontVariantNumeric: 'tabular-nums', paddingTop: 2 }}>{s.time}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: T.text500, marginTop: 2 }}>{s.desc}</div>
                  </div>
                  <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden' }}><ImgPlaceholder height={56} hue="autumn" radius={12}/></div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 20px 32px', background: T.bgBase, borderTop: `1px solid ${T.line100}` }}>
          <Btn variant="primary" full icon="plus">이 코스로 모집 만들기</Btn>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 17 · 모집 생성 Step 5 (리뷰) ─────────
function ScreenCreateReview() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 60 }}>
        <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="back" size={24}/></div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>새 모집 만들기</div>
          <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="close" size={24}/></div>
        </div>
        <div style={{ padding: '8px 20px 16px', display: 'flex', gap: 6 }}>
          {[0,1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: T.primary500 }}/>)}
        </div>
        <div style={{ padding: '8px 20px 20px', overflow: 'auto', maxHeight: 600 }}>
          <div style={{ fontSize: 13, color: T.text500, marginBottom: 4 }}>마지막이에요 (5/5)</div>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.5px' }}>이대로 모집을<br/>열어볼까요?</div>
          <div style={{ marginTop: 24, padding: 20, borderRadius: 16, background: T.bgSubtle, fontSize: 14, lineHeight: 1.7, color: T.text700 }}>
            <span style={{ color: T.primary700, fontWeight: 600 }}>경주 1박 2일 단풍·야경 코스</span>로<br/>
            <span style={{ color: T.text900, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>11/8(토)~11/9(일)</span>에 떠나요.<br/><br/>
            최소 <span style={{ fontWeight: 600 }}>3명</span> · 최대 <span style={{ fontWeight: 600 }}>8명</span> · 25~35세<br/>
            성별 제한 없음 · <span style={{ color: T.primary700 }}>자동 승인</span>
          </div>
          <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: T.primary50, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Icon name="sparkle" size={18} color={T.primary600}/>
            <div style={{ fontSize: 12, color: T.primary700, lineHeight: 1.5 }}>마감까지 인원이 채워지면 자동으로 채팅방이 만들어져요. 미달 시엔 자연스럽게 소멸돼요.</div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 20px 32px', background: T.bgBase, borderTop: `1px solid ${T.line100}`, display: 'flex', gap: 8 }}>
          <Btn variant="ghost">이전</Btn>
          <div style={{ flex: 1 }}><Btn variant="primary" full>모집 열기</Btn></div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 18 · 호스트 관리 ─────────
function ScreenHostManage() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 60, background: T.bgSubtle }}>
        <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.bgBase, borderBottom: `1px solid ${T.line100}` }}>
          <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="back" size={24}/></div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>모집 관리</div>
          <Icon name="more" size={24}/>
        </div>
        <div style={{ padding: 20, background: T.bgBase, borderBottom: `1px solid ${T.line100}` }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>경주 단풍·야경 1박2일</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 13, color: T.text500, fontVariantNumeric: 'tabular-nums' }}>
            <span>4 / 8명</span>
            <span style={{ color: T.line300 }}>·</span>
            <Chip variant="accent">D-3</Chip>
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text700 }}>승인 대기 (2)</div>
            <div style={{ fontSize: 11, color: T.text500 }}>48시간 후 자동 거절</div>
          </div>
          <div style={{ background: T.bgBase, borderRadius: 16, padding: 16, marginBottom: 12, border: `1px solid ${T.line100}` }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <AnimalAvatar kind="bear" size={48} bg={T.primary50}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>우직한 곰 7821</div>
                <div style={{ fontSize: 12, color: T.text500, marginTop: 2, display: 'flex', gap: 6, alignItems: 'center' }}>
                  31세 · 남성 <span style={{ color: T.line300 }}>·</span> 매너 <Icon name="star" size={12} color={T.warning}/> 4.9 <span style={{ color: T.line300 }}>·</span> 여행 8회
                </div>
                <div style={{ fontSize: 12, color: T.text700, marginTop: 8, padding: 10, background: T.bgSubtle, borderRadius: 10, lineHeight: 1.5 }}>
                  "단풍 보러 가요. 사진 좋아해서 풍경 잘 담아드릴 수 있어요!"
                </div>
              </div>
              <Icon name="more" size={20} color={T.text500}/>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button style={{ flex: 1, height: 40, borderRadius: 10, border: `1px solid ${T.line200}`, background: 'transparent', fontSize: 13, fontWeight: 600, color: T.text700, fontFamily: T.fontStack }}>거절</button>
              <button style={{ flex: 1, height: 40, borderRadius: 10, border: 'none', background: T.primary500, fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: T.fontStack }}>승인</button>
            </div>
          </div>
          <div style={{ background: T.bgBase, borderRadius: 16, padding: 14, marginBottom: 16, border: `1px solid ${T.line100}`, display: 'flex', gap: 12, alignItems: 'center' }}>
            <AnimalAvatar kind="raccoon" size={40} bg={T.primary50}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>호기심 많은 너구리 9027</div>
              <div style={{ fontSize: 11, color: T.text500, marginTop: 2 }}>26세 · 여성 · 매너 4.7</div>
            </div>
            <Icon name="arrow" size={16} color={T.text400}/>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text700, marginTop: 24, marginBottom: 12 }}>승인된 동행자 (4)</div>
          <div style={{ background: T.bgBase, borderRadius: 16, padding: 16, border: `1px solid ${T.line100}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex' }}>
              {['deer', 'turtle', 'rabbit', 'crane'].map((k, i) => (
                <div key={i} style={{ marginLeft: i === 0 ? 0 : -10, border: `2px solid ${T.bgBase}`, borderRadius: 999 }}>
                  <AnimalAvatar kind={k} size={36} bg={T.primary50}/>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: T.text500 }}>본인 외 3명</div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 20px 32px', background: T.bgBase, borderTop: `1px solid ${T.line100}` }}>
          <Btn variant="primary" full icon="chat">채팅방 들어가기</Btn>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 19 · 채팅방 목록 ─────────
function ScreenChatList() {
  const nav = (window.useNav ? window.useNav() : { go: () => {} });
  const Row = ({ hue, name, time, count, last, status, unread }) => (
    <div onClick={() => nav.go('chat')} style={{ height: 88, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center', borderBottom: `1px solid ${T.line100}`, cursor: 'pointer' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, overflow: 'hidden' }}><ImgPlaceholder height={56} hue={hue} radius={16}/></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
            {unread && <div style={{ width: 6, height: 6, borderRadius: 999, background: T.accent500, flexShrink: 0 }}/>}
          </div>
          <div style={{ fontSize: 11, color: T.text400, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{time}</div>
        </div>
        <div style={{ fontSize: 12, color: T.text500, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{count} <span style={{ color: T.line300, margin: '0 4px' }}>·</span> {status}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, gap: 8 }}>
          <div style={{ fontSize: 13, color: T.text700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{last}</div>
          {unread && <div style={{ minWidth: 20, height: 20, borderRadius: 999, background: T.accent500, color: '#fff', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>{unread}</div>}
        </div>
      </div>
    </div>
  );
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 60 }}>
        <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>모임</div>
        </div>
        <div style={{ padding: '0 20px', display: 'flex', gap: 24, borderBottom: `1px solid ${T.line100}` }}>
          {[
            { id: 'a', label: '진행중', count: 3, on: true },
            { id: 'b', label: '확정', count: 1 },
            { id: 'c', label: '종료', count: 8 },
          ].map(t => (
            <div key={t.id} style={{ padding: '12px 0', borderBottom: t.on ? `2px solid ${T.primary500}` : 'none', marginBottom: -1 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: t.on ? T.primary600 : T.text500 }}>{t.label}</span>
              <span style={{ fontSize: 12, color: T.text400, marginLeft: 4, fontVariantNumeric: 'tabular-nums' }}>{t.count}</span>
            </div>
          ))}
        </div>
        <div style={{ overflow: 'auto', maxHeight: 600 }}>
          <Row kind="a" hue="autumn" name="경주 단풍·야경" time="3:42" count="4/8명" status="마감 D-3" last="우직한 곰: 내일 오후 2시 만나요" unread={3}/>
          <Row kind="b" hue="coast" name="포항·영덕 동해 드라이브" time="1:20" count="6/6명" status="확정 ✓" last="잔잔한 거북이: 오늘 사진 올릴게요" unread={null}/>
          <Row kind="c" hue="forest" name="안동 하회마을 한옥체험" time="어제" count="3/4명" status="확정 ✓" last="고요한 두루미: 내일 출발이에요!" unread={1}/>
          <Row kind="d" hue="sunset" name="문경 새재 단풍 트레킹" time="월" count="2/5명" status="마감 D-1" last="시스템: 모집이 마감 임박입니다" unread={null}/>
          <Row kind="e" hue="forest" name="주왕산 & 주산지 힐링 트레킹" time="09:32" count="2/5명" status="마감 D-1" last="숲속여행자: 주산지 물안개 시간에 맞춰 출발해요." unread={null}/>
          <Row kind="f" hue="coast" name="영주 부석사 눈꽃 산책" time="어제" count="4/5명" status="마감 D-2" last="느긋한 토끼: 눈길이라 이동 시간을 조금 더 잡을게요" unread={null}/>
          <Row kind="g" hue="autumn" name="울진 금강송 숲길 워크" time="수" count="3/6명" status="모집중" last="초록 여우: 숲길 입구 주차 위치 공유했어요" unread={2}/>
          <Row kind="h" hue="coast" name="울릉도 2박 3일 섬 여행" time="지난주" count="5/6명" status="종료" last="시스템: 여행 기록을 남겨보세요" unread={null}/>
        </div>
        <BottomNav active="group"/>
      </div>
    </Phone>
  );
}

// ───────── 20 · 알림 센터 ─────────
function ScreenNotifications() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  const todayItems = [
    { icon: 'users', color: T.primary600, bg: T.primary100, title: <><b>경주 단풍·야경</b> 모임이 만들어졌어요 ✨</>, time: '방금 전' },
    { icon: 'chat', color: T.accent700, bg: T.accent100, title: <>우직한 곰 7821님이 <b>메시지</b>를 보냈어요</>, time: '1시간 전' },
    { icon: 'clock', color: T.warningText, bg: T.warningBg, title: <>마감 <b>D-1</b> · 현재 4/8명이에요</>, time: '3시간 전' },
    { icon: 'pin', color: T.primary600, bg: T.primary100, title: <><b>주왕산</b> 모임의 집결지가 업데이트됐어요</>, time: '5시간 전' },
  ];
  const yesterdayItems = [
    { icon: 'user', color: T.info, bg: '#E8F1FB', title: <>엉뚱한 토끼 1457님이 <b>친구 요청</b>을 보냈어요</>, time: '어제 오후 4시', action: true },
    { icon: 'heart', color: T.accent500, bg: T.accent100, title: <><b>3명</b>이 내 피드에 좋아요를 눌렀어요</>, time: '어제 오전 11시' },
    { icon: 'sparkle', color: T.primary600, bg: T.primary100, title: <>내 취향에 맞는 <b>울진 금강송 숲길 워크</b>가 열렸어요</>, time: '어제 오전 9시' },
  ];
  const olderItems = [
    { icon: 'bookmark', color: T.primary600, bg: T.primary100, title: <><b>영주 부석사 눈꽃 산책</b> 찜한 코스가 모집을 시작했어요</>, time: '2일 전' },
    { icon: 'feed', color: T.info, bg: '#E8F1FB', title: <>지난 <b>포항·영덕 동해 드라이브</b> 기록을 남겨보세요</>, time: '3일 전' },
    { icon: 'users', color: T.primary600, bg: T.primary100, title: <>새 친구 2명이 <b>친구 도감</b>에 추가됐어요</>, time: '4일 전' },
  ];
  const Item = ({ icon, color, bg, title, time, action, last }) => (
    <div style={{ padding: '14px 20px', display: 'flex', gap: 12, borderBottom: last ? 'none' : `1px solid ${T.line100}` }}>
      <div style={{ width: 36, height: 36, borderRadius: 999, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={18} color={color}/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: T.text900, lineHeight: 1.5 }}>{title}</div>
        <div style={{ fontSize: 11, color: T.text500, marginTop: 4 }}>{time}</div>
        {action && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button style={{ height: 32, padding: '0 14px', borderRadius: 8, border: `1px solid ${T.line200}`, background: 'transparent', fontSize: 12, fontWeight: 600, fontFamily: T.fontStack }}>거절</button>
            <button style={{ height: 32, padding: '0 14px', borderRadius: 8, border: 'none', background: T.primary500, color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: T.fontStack }}>수락</button>
          </div>
        )}
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
          <div style={{ fontSize: 12, color: T.primary600, fontWeight: 500 }}>모두 읽음</div>
        </div>
        <div style={{ padding: '8px 20px 12px', display: 'flex', gap: 8 }}>
          <Chip variant="primary" size="md">전체</Chip>
          <Chip variant="neutral" size="md">안읽음 4</Chip>
        </div>
        <div style={{ padding: '8px 20px 4px', fontSize: 11, fontWeight: 600, color: T.text500, letterSpacing: 0.5 }}>오늘</div>
        {todayItems.map((item) => <Item key={`${item.time}-${String(item.title)}`} {...item}/>)}
        <div style={{ padding: '12px 20px 4px', fontSize: 11, fontWeight: 600, color: T.text500, letterSpacing: 0.5 }}>어제</div>
        {yesterdayItems.map((item) => <Item key={`${item.time}-${String(item.title)}`} {...item}/>)}
        <div style={{ padding: '12px 20px 4px', fontSize: 11, fontWeight: 600, color: T.text500, letterSpacing: 0.5 }}>지난 알림</div>
        {olderItems.map((item, index) => <Item key={`${item.time}-${String(item.title)}`} {...item} last={index === olderItems.length - 1}/>)}
        <div style={{ height: 28 }}/>
      </div>
    </Phone>
  );
}

// ───────── 21 · 검색 ─────────
function ScreenSearch() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  const recent = ['경주', '단풍', '황리단길', '안동 한옥', '주왕산', '월정교 야경', '문경 새재', '포항 바다'];
  const popular = [
    { n: 1, w: '주왕산', up: true },
    { n: 2, w: '안동 한옥마을', up: true },
    { n: 3, w: '경주 야경', up: false },
    { n: 4, w: '포항 호미곶', up: true },
    { n: 5, w: '문경 새재', up: false },
    { n: 6, w: '영주 부석사', up: true },
    { n: 7, w: '울진 금강송', up: true },
    { n: 8, w: '청송 얼음골', up: false },
    { n: 9, w: '울릉도 산책', up: true },
    { n: 10, w: '봉화 분천역', up: false },
  ];
  const recommendations = [
    { title: '경주 단풍·야경 1박 2일', meta: '첨성대 · 월정교 · 동궁과 월지' },
    { title: '청송 주왕산 물안개 코스', meta: '주왕산 · 주산지 · 절골계곡' },
    { title: '안동 하회마을 한옥 하루', meta: '하회마을 · 부용대 · 월영교' },
  ];
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 60 }}>
        <div style={{ padding: '8px 20px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="back" size={24}/></div>
          <div style={{ flex: 1, height: 44, borderRadius: 12, background: T.bgSubtle, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px' }}>
            <Icon name="search" size={18} color={T.text500}/>
            <div style={{ fontSize: 14, color: T.text900 }}>경주 단풍</div>
            <div style={{ flex: 1 }}/>
            <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="close" size={16} color={T.text500}/></div>
          </div>
          <div style={{ fontSize: 14, color: T.text500 }}>취소</div>
        </div>
        <div style={{ height: 'calc(100% - 116px)', overflow: 'auto', padding: '12px 20px 44px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>최근 검색어</div>
            <div style={{ fontSize: 11, color: T.text500 }}>전체 삭제</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {recent.map(s => (
              <div key={s} style={{ height: 32, padding: '0 12px', borderRadius: 999, border: `1px solid ${T.line200}`, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: T.text700 }}>
                {s} <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="close" size={12} color={T.text400}/></div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 28, marginBottom: 12 }}>인기 검색어</div>
          {popular.map(r => (
            <div key={r.n} style={{ height: 44, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: r.n <= 3 ? T.primary600 : T.text500, width: 16, fontVariantNumeric: 'tabular-nums' }}>{r.n}</div>
              <div style={{ flex: 1, fontSize: 14 }}>{r.w}</div>
              <div style={{ fontSize: 11, color: r.up ? T.accent500 : T.text400 }}>{r.up ? '▲' : '—'}</div>
            </div>
          ))}
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 26, marginBottom: 12 }}>추천 검색 결과</div>
          {recommendations.map((item) => (
            <div key={item.title} onClick={() => nav.go('detail')} style={{ height: 68, borderRadius: 12, border: `1px solid ${T.line100}`, background: T.bgBase, display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px', marginBottom: 10, cursor: 'pointer' }}>
              <div style={{ width: 36, height: 36, borderRadius: 999, background: T.primary50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="pin" size={16} color={T.primary600}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                <div style={{ fontSize: 11, color: T.text500, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.meta}</div>
              </div>
              <Icon name="arrow" size={15} color={T.text400}/>
            </div>
          ))}
        </div>
      </div>
    </Phone>
  );
}

// ───────── 22 · 탐색 지도 뷰 ─────────
function ScreenExploreMap() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', inset: 0, background: '#EEF4F0' }}>
          <MiniMap height={852} withRoute={false} pins={[]}/>
          {/* Multi pins for explore */}
          <svg width="100%" height="100%" viewBox="0 0 393 852" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {[
              { x: 80, y: 320, n: 4 },
              { x: 180, y: 280, n: 6 },
              { x: 270, y: 380, n: 3 },
              { x: 140, y: 460, n: 8 },
              { x: 230, y: 520, n: 5, on: true },
              { x: 310, y: 460, n: 2 },
            ].map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y + 2} r={p.on ? 18 : 16} fill="rgba(0,0,0,0.18)"/>
                {p.on && <circle cx={p.x} cy={p.y} r="22" fill="none" stroke={T.accent500} strokeWidth="3"/>}
                <circle cx={p.x} cy={p.y} r={p.on ? 18 : 16} fill={T.primary500}/>
                <text x={p.x} y={p.y + 4} fontSize="11" fontWeight="700" textAnchor="middle" fill="#fff" fontFamily={T.fontStack}>{p.n}</text>
              </g>
            ))}
          </svg>
        </div>
        <div style={{ position: 'absolute', top: 60, left: 16, right: 16, display: 'flex', gap: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: T.bgBase, boxShadow: T.l2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="back" size={20}/></div></div>
          <div style={{ flex: 1, height: 40, borderRadius: 999, background: T.bgBase, boxShadow: T.l2, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px' }}>
            <Icon name="search" size={16} color={T.text500}/>
            <div style={{ fontSize: 13 }}>경북 전체</div>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 116, left: 16, right: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['지역', '일정', '인원', '성별'].map(c => (
            <div key={c} style={{ padding: '6px 12px', borderRadius: 999, background: T.bgBase, boxShadow: T.l1, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              {c} <Icon name="arrow" size={12} color={T.text500}/>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', right: 16, top: 320, width: 40, height: 40, borderRadius: 999, background: T.bgBase, boxShadow: T.l2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="pin" size={20} color={T.primary600}/>
        </div>
        <div style={{ position: 'absolute', left: 12, right: 12, bottom: 100, height: 124, borderRadius: 16, background: T.bgBase, boxShadow: T.l2, padding: 12, display: 'flex', gap: 12 }}>
          <div style={{ width: 100, borderRadius: 12, overflow: 'hidden' }}><ImgPlaceholder height={100} hue="autumn" radius={12}/></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <Chip variant="accent">D-3</Chip>
              <div style={{ fontSize: 11, color: T.text500 }}>4/8명</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8, lineHeight: 1.3 }}>경주 단풍·야경 1박2일</div>
            <div style={{ fontSize: 11, color: T.text500, marginTop: 4 }}>고요한 두루미 1130</div>
            <div style={{ marginTop: 10 }}><ProgressBar current={4} max={8} min={3}/></div>
          </div>
        </div>
        <div style={{ position: 'absolute', left: '50%', bottom: 36, transform: 'translateX(-50%)', height: 44, padding: '0 18px', borderRadius: 999, background: '#1A2320', color: '#fff', display: 'flex', alignItems: 'center', gap: 8, boxShadow: T.l2 }}>
          <Icon name="feed" size={16} color="#fff"/>
          <span style={{ fontSize: 13, fontWeight: 600 }}>리스트 보기</span>
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

// ───────── 24 · 특수 메시지 카드 (장소·지도·정산·메모·투표 결과·시스템) ─────────
function ScreenSpecialMessages() {
  return (
    <div style={{ width: 393, height: 852, background: T.bgSubtle, borderRadius: 24, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, fontFamily: T.fontStack, overflow: 'auto' }}>
      <div style={{ fontSize: 11, color: T.text500, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>채팅방 · 특수 메시지 6종</div>
      {/* Place */}
      <div style={{ background: T.bgBase, borderRadius: 16, padding: 14, border: `1px solid ${T.line200}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Icon name="pin" size={14} color={T.primary600}/>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.primary700 }}>장소</div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>동궁과 월지</div>
        <div style={{ fontSize: 12, color: T.text500, marginTop: 2 }}>경북 경주시 원화로 102</div>
        <div style={{ marginTop: 10, height: 80, borderRadius: 10, overflow: 'hidden' }}><ImgPlaceholder height={80} hue="night" radius={10}/></div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: T.text500 }}>
          <span><Icon name="clock" size={11} color={T.text500}/> 09:00–22:00</span>
          <span>지도 보기 →</span>
        </div>
      </div>
      {/* Map pin */}
      <div style={{ background: T.bgBase, borderRadius: 16, padding: 14, border: `1px solid ${T.line200}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Icon name="map" size={14} color={T.accent700}/>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.accent700 }}>11/8 14:00 만남</div>
        </div>
        <MiniMap height={120} pins={[1]}/>
        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>경주역 2번 출구</div>
        <div style={{ fontSize: 12, color: T.primary600, marginTop: 4 }}>길 찾기 →</div>
      </div>
      {/* Settlement */}
      <div style={{ background: T.bgBase, borderRadius: 16, padding: 14, border: `1px solid ${T.line200}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Icon name="money" size={14} color={T.text700}/>
          <div style={{ fontSize: 12, color: T.text500 }}>우직한 곰 7821님이 결제했어요</div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>한옥스테이 1박</div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 6 }}>
          <div style={{ fontSize: 12, color: T.text500 }}>120,000원 · 4명</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.primary700, fontVariantNumeric: 'tabular-nums' }}>1인 30,000원</div>
        </div>
      </div>
      {/* Notice */}
      <div style={{ background: T.primary50, borderRadius: 16, padding: 14, border: `1px solid ${T.primary100}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Icon name="note" size={14} color={T.primary700}/>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.primary700 }}>공지 · 호스트</div>
        </div>
        <div style={{ fontSize: 13, color: T.text900, lineHeight: 1.6 }}>집합: 경주역 2번 출구<br/>시간: 11/8 (토) 14:00<br/>함께 출발하면 좋아요 🙌</div>
      </div>
      {/* System: 여행 확정 */}
      <div style={{ background: T.primary100, borderRadius: 16, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="sparkle" size={20} color={T.primary600}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.primary700 }}>여행이 확정됐어요!</div>
          <div style={{ fontSize: 11, color: T.primary700, opacity: 0.8, marginTop: 2 }}>좋은 여행 되세요 ✨</div>
        </div>
      </div>
      {/* System: 마감 미달 소멸 */}
      <div style={{ background: T.warningBg, borderRadius: 16, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 18 }}>🍃</div>
        <div style={{ fontSize: 12, color: T.warningText, lineHeight: 1.5 }}>아쉬운 모임이에요. 다음에 또 봐요!<br/><span style={{ opacity: 0.7 }}>14일 후 채팅방이 사라져요</span></div>
      </div>
    </div>
  );
}

// ───────── 25 · 모임 나가기 Alert ─────────
function ScreenLeaveAlert() {
  return (
    <div style={{ width: 393, height: 852, background: 'rgba(15,23,20,0.48)', borderRadius: 24, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.fontStack, overflow: 'hidden' }}>
      {/* dimmed bg hint */}
      <div style={{ position: 'absolute', inset: 0, background: T.bgSubtle, opacity: 0.4 }}/>
      <div style={{ position: 'relative', width: 320, background: T.bgBase, borderRadius: 20, padding: 24, boxShadow: T.l3 }}>
        <div style={{ width: 48, height: 48, borderRadius: 999, background: T.dangerBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 22 }}>⚠</div>
        <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4, letterSpacing: '-0.3px' }}>호스트가 나가면<br/>이 모임은 종료돼요</div>
        <div style={{ fontSize: 13, color: T.text500, marginTop: 10, lineHeight: 1.6 }}>승인된 4명에게 알림이 가고, 채팅방은 14일 동안 read-only로 유지된 후 사라져요.</div>
        <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: T.bgSubtle, fontSize: 12, color: T.text700 }}>
          <div style={{ fontSize: 11, color: T.text500, marginBottom: 6 }}>나가는 이유 (필수)</div>
          <div style={{ fontSize: 13 }}>일정 변동으로 어렵게 됐어요...</div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button style={{ flex: 1, height: 44, borderRadius: 10, border: `1px solid ${T.line200}`, background: 'transparent', fontSize: 14, fontWeight: 600, color: T.text900, fontFamily: T.fontStack }}>취소</button>
          <button style={{ flex: 1, height: 44, borderRadius: 10, border: 'none', background: T.danger, color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: T.fontStack }}>모임 종료</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  ScreenLogin, ScreenEmailAuth, ScreenProfileBasic, ScreenTerms, ScreenCourseDetail,
  ScreenCreateReview, ScreenHostManage, ScreenChatList, ScreenNotifications,
  ScreenSearch, ScreenExploreMap, ScreenStates, ScreenSpecialMessages, ScreenLeaveAlert,
});

// ─── window export ───
Object.assign(window, { ScreenLogin, ScreenEmailAuth, ScreenProfileBasic, ScreenTerms, ScreenCourseDetail, ScreenCreateReview, ScreenHostManage, ScreenChatList, ScreenNotifications, ScreenSearch, ScreenExploreMap, ScreenStates, ScreenSpecialMessages, ScreenLeaveAlert });
