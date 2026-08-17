// Feed Write (5 steps), Dex (도감), Profile Edit, Settings, Public Profile

// ───────── 26 · 피드 글쓰기 (5단계 통합 뷰) ─────────
function ScreenFeedWrite() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 60, background: T.bgSubtle }}>
        <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.bgBase }}>
          <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="close" size={24}/></div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>피드 글쓰기</div>
          <div style={{ fontSize: 13, color: T.primary600, fontWeight: 600 }}>게시</div>
        </div>
        <div style={{ padding: '8px 20px 16px', background: T.bgBase, display: 'flex', gap: 6, borderBottom: `1px solid ${T.line100}` }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= 3 ? T.primary500 : T.line100 }}/>)}
        </div>
        <div style={{ padding: 20, overflow: 'auto', maxHeight: 600 }}>
          <div style={{ fontSize: 11, color: T.text500, marginBottom: 4, fontWeight: 600, letterSpacing: 0.5 }}>STEP 3 · 사진 & 메모</div>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, marginBottom: 4, letterSpacing: '-0.5px' }}>여행 어땠어요?</div>
          <div style={{ fontSize: 13, color: T.text500, marginBottom: 16 }}>대부분 자동으로 채워졌어요. 한 줄만 남겨주세요.</div>
          
          <div style={{ background: T.bgBase, borderRadius: 16, padding: 14, marginBottom: 14 }}>
            <input style={{ width: '100%', border: 'none', outline: 'none', fontSize: 18, fontWeight: 700, fontFamily: T.fontStack, padding: 0, background: 'transparent' }} defaultValue="첫 반패키지 단풍 여행" />
            <textarea style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, fontFamily: T.fontStack, marginTop: 8, padding: 0, background: 'transparent', resize: 'none', minHeight: 80, color: T.text700, lineHeight: 1.6 }} defaultValue="처음 반패키지 여행이었는데 동행분들이 너무 좋으셨어요. 첨성대 야경이 진짜 인생샷..." />
            <div style={{ fontSize: 11, color: T.text400, textAlign: 'right' }}>54 / 500</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            <div style={{ height: 110, borderRadius: 12, position: 'relative', overflow: 'hidden' }}>
              <ImgPlaceholder height={110} hue="autumn" radius={12}/>
              <div style={{ position: 'absolute', top: 6, left: 6, padding: '2px 6px', borderRadius: 6, background: T.primary500, color: '#fff', fontSize: 10, fontWeight: 600 }}>대표</div>
            </div>
            <div style={{ height: 110, borderRadius: 12, overflow: 'hidden' }}><ImgPlaceholder height={110} hue="night" radius={12}/></div>
            <div style={{ height: 110, borderRadius: 12, overflow: 'hidden' }}><ImgPlaceholder height={110} hue="sunset" radius={12}/></div>
            <div style={{ height: 110, borderRadius: 12, border: `1.5px dashed ${T.line200}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: T.text500 }}>
              <Icon name="plus" size={18} color={T.text500}/>
              <div style={{ fontSize: 11 }}>사진 추가</div>
            </div>
          </div>

          <div style={{ background: T.bgBase, borderRadius: 16, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text700, marginBottom: 10 }}>경로 (자동)</div>
            <MiniMap height={140} pins={[1,2,3,4]}/>
            <div style={{ fontSize: 11, color: T.text500, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="pin" size={11} color={T.primary600}/>
              경주 · 4 stops · 11/8 ~ 11/9
            </div>
          </div>

          <div style={{ background: T.bgBase, borderRadius: 16, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text700, marginBottom: 10 }}>함께 간 멤버 (4)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { k: 'deer', n: '따스한 사슴 3492', me: true },
                { k: 'bear', n: '우직한 곰 7821' },
                { k: 'turtle', n: '잔잔한 거북이 9032' },
                { k: 'crane', n: '고요한 두루미 1130' },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px 6px 6px', borderRadius: 999, background: m.me ? T.primary100 : T.bgSubtle }}>
                  <AnimalAvatar kind={m.k} size={24} bg={T.bgBase}/>
                  <div style={{ fontSize: 12, fontWeight: 500, color: m.me ? T.primary700 : T.text700 }}>{m.n}{m.me && ' (나)'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 20px 32px', background: T.bgBase, borderTop: `1px solid ${T.line100}`, display: 'flex', gap: 8 }}>
          <Btn variant="ghost">이전</Btn>
          <div style={{ flex: 1 }}><Btn variant="primary" full>다음 (4/5)</Btn></div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 27 · 도감 (Friends Dex) ─────────
function ScreenDex() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, openModal: () => {} });
  const friends = [
    { k: 'deer', n: '따스한 사슴 3492', trips: 3, me: true, last: '2일 전 · 경주' },
    { k: 'bear', n: '우직한 곰 7821', trips: 2, last: '2일 전 · 경주' },
    { k: 'turtle', n: '잔잔한 거북이 9032', trips: 2, last: '2일 전 · 경주' },
    { k: 'crane', n: '고요한 두루미 1130', trips: 1, last: '3주 전 · 안동' },
    { k: 'rabbit', n: '엉뚱한 토끼 1457', trips: 1, last: '3주 전 · 안동' },
    { k: 'raccoon', n: '호기심 많은 너구리 9027', trips: 1, last: '6주 전 · 영주' },
    { k: 'deer', n: '나른한 사슴 6614', trips: 1, last: '8주 전 · 포항' },
    { k: 'bear', n: '느긋한 곰 4408', trips: 1, last: '8주 전 · 포항' },
    { k: 'turtle', n: '평온한 거북이 1175', trips: 2, last: '12주 전 · 울진' },
    { k: 'crane', n: '청아한 두루미 2024', trips: 1, last: '14주 전 · 영덕' },
    { k: 'rabbit', n: '깡총 토끼 5523', trips: 1, last: '14주 전 · 영덕' },
    { k: 'raccoon', n: '말많은 너구리 7791', trips: 1, last: '20주 전 · 문경' },
  ];
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 60, background: T.bgSubtle }}>
        <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.bgBase }}>
          <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="back" size={24}/></div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>친구 도감</div>
          <Icon name="search" size={22}/>
        </div>
        <div style={{ padding: '20px 20px 16px', background: T.bgBase, borderBottom: `1px solid ${T.line100}` }}>
          <div style={{ fontSize: 13, color: T.text500 }}>지금까지 만난 친구</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: T.primary700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px' }}>{friends.length}</div>
            <div style={{ fontSize: 15, color: T.text500, fontWeight: 500 }}>마리</div>
            <div style={{ marginLeft: 'auto', fontSize: 11, color: T.text400 }}>최근 동행 순</div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, overflow: 'auto' }}>
            <Chip variant="primary" size="md">전체 {friends.length}</Chip>
            <Chip variant="neutral" size="md">2회 이상 {friends.filter(f => f.trips >= 2).length}</Chip>
            <Chip variant="neutral" size="md">최근 1개월 {friends.slice(0,3).length}</Chip>
          </div>
        </div>
        <div style={{ padding: 16, overflow: 'auto', maxHeight: 540 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {friends.map((f, i) => (
              <div key={i}
                onClick={() => !f.me && nav.openModal && nav.openModal('friend', f)}
                style={{ background: T.bgBase, borderRadius: 14, padding: 10, border: f.me ? `1.5px solid ${T.primary500}` : `1px solid ${T.line100}`, position: 'relative', cursor: f.me ? 'default' : 'pointer', transition: 'transform 120ms ease, box-shadow 120ms ease' }}
                onMouseEnter={(e) => { if (!f.me) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = T.l1; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                {f.me && <div style={{ position: 'absolute', top: 6, right: 6, padding: '1px 5px', borderRadius: 4, background: T.primary500, color: '#fff', fontSize: 9, fontWeight: 700 }}>나</div>}
                {f.trips >= 2 && !f.me && <div style={{ position: 'absolute', top: 6, right: 6, padding: '1px 5px', borderRadius: 4, background: T.primary100, color: T.primary700, fontSize: 9, fontWeight: 700 }}>{f.trips}×</div>}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
                  <AnimalAvatar kind={f.k} size={56} bg={T.primary50}/>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, textAlign: 'center', lineHeight: 1.3, marginTop: 4, height: 28, overflow: 'hidden' }}>{f.n.split(' ').slice(0,2).join(' ')}</div>
                <div style={{ fontSize: 10, color: T.text400, textAlign: 'center', marginTop: 2 }}>{(f.last || '').split(' · ')[0]}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', padding: '20px 0 8px', fontSize: 11, color: T.text400 }}>다음 모임에서 새 친구를 만나보세요 ✨</div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 28 · 프로필 수정 ─────────
function ScreenProfileEdit() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  const Row = ({ label, value, locked, danger }) => (
    <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.line100}` }}>
      <div style={{ fontSize: 14, color: T.text700 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 14, color: danger ? T.danger : locked ? T.text400 : T.text900, fontWeight: locked ? 400 : 500 }}>{value}</div>
        {locked ? <Icon name="check" size={14} color={T.text400}/> : <Icon name="arrow" size={16} color={T.text400}/>}
      </div>
    </div>
  );
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 60, background: T.bgSubtle }}>
        <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.bgBase }}>
          <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="back" size={24}/></div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>프로필 수정</div>
          <div style={{ fontSize: 13, color: T.primary600, fontWeight: 600 }}>저장</div>
        </div>
        
        <div style={{ background: T.bgBase, padding: '24px 20px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: `1px solid ${T.line100}` }}>
          <div style={{ position: 'relative' }}>
            <AnimalAvatar kind="deer" size={96} bg={T.primary100}/>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 999, background: T.line200, border: `2px solid ${T.bgBase}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="lock" size={12} color={T.text500}/>
            </div>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 12 }}>따스한 사슴 3492</div>
          <div style={{ fontSize: 11, color: T.text500, marginTop: 4 }}>한 번 정한 친구는 바꿀 수 없어요</div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: T.text500, padding: '20px 20px 8px', letterSpacing: 0.5 }}>공개 프로필</div>
        <div style={{ background: T.bgBase }}>
          <Row label="자기소개" value="느긋한 여행 좋아해요"/>
          <Row label="여행 스타일" value="자연 · 사진"/>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.line100}` }}>
            <div style={{ fontSize: 14, color: T.text700, marginBottom: 8 }}>관심 지역</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['경주', '안동', '포항', '문경'].map(r => <Chip key={r} variant="primary" size="sm">{r}</Chip>)}
              <Chip variant="neutral" size="sm">+ 추가</Chip>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: T.text500, padding: '20px 20px 8px', letterSpacing: 0.5 }}>비공개 정보</div>
        <div style={{ background: T.bgBase }}>
          <Row label="닉네임" value="따스한 사슴 3492" locked/>
          <Row label="캐릭터" value="고정됨" locked/>
          <Row label="생년월일" value="1998.04.12"/>
          <Row label="성별" value="여성"/>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 29 · 설정 ─────────
function ScreenSettings() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  const rowBorder = `1px solid ${T.line100}`;
  const Row = ({ label, value, danger, sub, onClick, testId }) => (
    <button type="button" data-testid={testId} onClick={onClick} style={{ width: '100%', minHeight: sub ? 64 : 58, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 0, borderBottom: rowBorder, background: 'transparent', textAlign: 'left', fontFamily: T.fontStack, cursor: onClick ? 'pointer' : 'default' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: danger ? T.danger : T.text900 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: danger ? T.danger : T.text500, opacity: danger ? 0.72 : 1, marginTop: 2, fontWeight: 650 }}>{sub}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {value && <div style={{ fontSize: 12, color: T.text500, fontWeight: 700 }}>{value}</div>}
        <Icon name="arrow" size={16} color={T.text400}/>
      </div>
    </button>
  );
  const Toggle = ({ on }) => (
    <div style={{ width: 44, height: 26, borderRadius: 999, background: on ? T.primary500 : T.line200, position: 'relative', transition: 'background .15s' }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 20 : 2, width: 22, height: 22, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left .15s' }}/>
    </div>
  );
  const ToggleRow = ({ label, on, sub, onClick }) => (
    <button type="button" onClick={onClick} style={{ width: '100%', minHeight: sub ? 64 : 58, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 0, borderBottom: rowBorder, background: 'transparent', textAlign: 'left', fontFamily: T.fontStack, cursor: onClick ? 'pointer' : 'default' }}>
      <div>
        <div style={{ fontSize: 14, color: T.text900, fontWeight: 800 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: T.text500, marginTop: 2, fontWeight: 650 }}>{sub}</div>}
      </div>
      <Toggle on={on}/>
    </button>
  );
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );
  const enableNotifications = async () => {
    const token = await window.MoyeoPush?.currentToken({ requestPermission: true });
    setNotificationsEnabled(Boolean(token));
  };
  const Section = ({ title, children }) => (
    <section style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: T.text500, padding: '0 20px' }}>{title}</div>
      <div style={{ margin: '8px 18px 0', background: T.bgBase, border: `1px solid ${T.line100}`, borderRadius: 12, overflow: 'hidden' }}>
        {children}
      </div>
    </section>
  );
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 46, background: T.bgBase, overflow: 'auto' }}>
        <div style={{ height: 50, padding: '0 10px', display: 'grid', gridTemplateColumns: '34px 1fr 34px', alignItems: 'center', background: T.bgBase, borderBottom: `1px solid ${T.line100}`, position: 'sticky', top: 0, zIndex: 1 }}>
          <button type="button" aria-label="뒤로" onClick={() => nav.back()} style={{ width: 34, height: 34, padding: 0, border: 0, background: 'transparent', color: T.text900, display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Icon name="back" size={20}/></button>
          <div style={{ fontSize: 15, fontWeight: 900, textAlign: 'center' }}>설정</div>
          <span aria-hidden="true" style={{ width: 34, height: 34 }}/>
        </div>

        <div style={{ paddingTop: 14, paddingBottom: 34 }}>
        <Section title="알림">
          <ToggleRow label="채팅 메시지" on={notificationsEnabled} onClick={enableNotifications}/>
          <ToggleRow label="모집 마감 임박" on={true} sub="D-3부터 알려드려요"/>
          <ToggleRow label="친구 신청·피드 반응" on={true}/>
          <ToggleRow label="마케팅 알림" on={false} sub="이벤트·새 코스 소개"/>
        </Section>

        <Section title="화면">
          <Row label="테마" value="시스템 기본"/>
          <Row label="언어" value="한국어"/>
        </Section>

        <Section title="계정">
          <Row label="로그인 방식" value="관리" onClick={() => nav.go('auth-methods')} testId="settings-auth-methods"/>
          <Row label="차단한 사용자" value="2명"/>
          <Row label="개인정보 처리방침"/>
          <Row label="이용약관"/>
        </Section>

        <Section title="정보">
          <Row label="버전" value="1.0.4 (최신)"/>
          <Row label="문의하기"/>
          <Row label="앱 평가하기"/>
          <Row label="로그아웃" danger testId="settings-sign-out" onClick={async () => { await window.MoyeoAuth.signOut(); nav.go('login', { replace: true }); }}/>
          <Row label="계정 탈퇴" danger sub="즉시 영구 삭제" testId="settings-withdraw" onClick={async () => { if (!window.confirm('계정을 즉시 영구 삭제할까요?')) return; await window.MoyeoAuth.withdraw(); nav.go('login', { replace: true }); }}/>
        </Section>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 29-1 · 로그인 방식 관리 ─────────
function ScreenAuthMethods() {
  const nav = (window.useNav ? window.useNav() : { back: () => {} });
  const [providers, setProviders] = React.useState([]);
  const [loadingProvider, setLoadingProvider] = React.useState('');
  const [emailOpen, setEmailOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmation, setConfirmation] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    window.MoyeoAuth.getLinkedProviders()
      .then((result) => { if (active) setProviders(result.providers || []); })
      .catch((requestError) => { if (active) setError(requestError?.message || '로그인 방식을 불러오지 못했어요.'); });
    return () => { active = false; };
  }, []);

  const link = async (provider, options = {}) => {
    if (loadingProvider) return;
    setLoadingProvider(provider);
    setError('');
    try {
      const result = await window.MoyeoAuth.linkProvider(provider, options);
      if (!result?.redirecting) setProviders(result.providers || providers);
    } catch (requestError) {
      setError(requestError?.message || '로그인 방식을 연결하지 못했어요.');
    } finally {
      setLoadingProvider('');
    }
  };

  const themeIcon = (light, dark, size) => (
    <span aria-hidden="true" style={{ width: size, height: size, position: 'relative', display: 'block' }}>
      <img className="moyeo-theme-image moyeo-theme-image-light" src={light} width={size} height={size} alt="" style={{ position: 'absolute', inset: 0, objectFit: 'contain' }}/>
      <img className="moyeo-theme-image moyeo-theme-image-dark" src={dark} width={size} height={size} alt="" style={{ position: 'absolute', inset: 0, objectFit: 'contain' }}/>
    </span>
  );
  const rows = [
    { id: 'kakao', label: '카카오', bg: '#FEE500', color: 'rgba(0,0,0,.85)', icon: <img src="assets/kakao-mark-official.png" width="25" height="25" alt=""/> },
    { id: 'google', label: 'Google', bg: 'var(--moyeo-google-button-bg)', color: 'var(--moyeo-google-button-text)', border: 'var(--moyeo-google-button-border)', icon: themeIcon('assets/google-g-light-official.png', 'assets/google-g-dark-official.png', 19) },
    { id: 'email', label: '이메일', bg: T.bgRaised, color: T.text900, icon: <span aria-hidden="true" style={{ fontSize: 20, color: T.primary600 }}>@</span> },
    { id: 'apple', label: 'Apple', bg: T.text900, color: T.bgBase, icon: themeIcon('assets/apple-mark-white-official.png', 'assets/apple-mark-black-official.png', 21) },
  ];
  const inputStyle = { height: 44, borderRadius: 9, border: `1px solid ${T.line200}`, background: T.bgRaised, color: T.text900, padding: '0 12px', fontSize: 14, fontFamily: T.fontStack };
  const canLinkEmail = /^\S+@\S+\.\S+$/.test(email) && password.length >= 6 && password === confirmation;

  return (
    <Phone>
      <div data-testid="auth-methods-screen" style={{ position: 'absolute', inset: 0, paddingTop: 60, background: T.bgSubtle, overflow: 'auto' }}>
        <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', background: T.bgBase, position: 'sticky', top: 0, zIndex: 2, borderBottom: `1px solid ${T.line100}` }}>
          <button type="button" aria-label="뒤로" onClick={() => nav.back()} style={{ width: 44, height: 44, marginLeft: -12, border: 0, background: 'transparent', color: T.text900 }}><Icon name="back" size={24}/></button>
          <div style={{ fontSize: 16, fontWeight: 800, marginLeft: 4 }}>로그인 방식</div>
        </div>
        <div style={{ padding: '22px 18px 40px' }}>
          <p style={{ margin: '0 2px 18px', color: T.text500, fontSize: 13, lineHeight: 1.55 }}>연결된 로그인 방식으로 같은 계정을 안전하게 이용할 수 있어요.</p>
          <div style={{ display: 'grid', gap: 12 }}>
            {rows.map((item) => {
              const linked = providers.includes(item.id.toUpperCase());
              return (
                <div key={item.id} style={{ padding: 14, borderRadius: 12, border: `1px solid ${T.line200}`, background: T.bgBase }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, display: 'grid', placeItems: 'center', background: item.bg, color: item.color, border: `1px solid ${item.border || 'transparent'}` }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 800 }}>{item.label}</div>
                      <div style={{ marginTop: 3, fontSize: 12, color: linked ? T.primary600 : T.text500 }}>{linked ? '연결됨' : '연결되지 않음'}</div>
                    </div>
                    {!linked && (
                      <button type="button" data-testid={`link-provider-${item.id}`} disabled={Boolean(loadingProvider)} onClick={() => item.id === 'email' ? setEmailOpen((open) => !open) : link(item.id)} style={{ minWidth: 76, height: 38, padding: '0 14px', borderRadius: 9, border: 0, background: T.primary500, color: '#fff', fontSize: 13, fontWeight: 800, fontFamily: T.fontStack }}>
                        {loadingProvider === item.id ? '연결 중' : '연결하기'}
                      </button>
                    )}
                  </div>
                  {item.id === 'email' && !linked && emailOpen && (
                    <form onSubmit={(event) => { event.preventDefault(); if (canLinkEmail) link('email', { email, password, mode: 'signup' }); }} style={{ display: 'grid', gap: 9, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.line100}` }}>
                      <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="새 이메일" style={inputStyle}/>
                      <input type="password" required minLength="6" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="새 비밀번호 (6자 이상)" style={inputStyle}/>
                      <input type="password" required minLength="6" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="비밀번호 확인" style={inputStyle}/>
                      <button type="submit" disabled={!canLinkEmail || loadingProvider === 'email'} style={{ height: 42, border: 0, borderRadius: 9, background: canLinkEmail ? T.primary500 : T.line100, color: canLinkEmail ? '#fff' : T.text400, fontWeight: 800, fontFamily: T.fontStack }}>새 이메일 연결</button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
          <div role="status" style={{ minHeight: 20, marginTop: 14, color: error ? T.danger : T.text500, fontSize: 12, textAlign: 'center' }}>{error}</div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 30 · 공개 프로필 ─────────
function ScreenPublicProfile() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  const recentTrips = [
    { hue: 'autumn', n: '경주 1박2일', d: '2026.04', meta: '첨성대 · 월정교' },
    { hue: 'coast', n: '포항 동해 드라이브', d: '2026.02', meta: '영일대 · 호미곶' },
    { hue: 'forest', n: '주왕산 단풍 트레킹', d: '2025.10', meta: '주왕산 · 주산지' },
    { hue: 'hanok', n: '안동 하회마을 산책', d: '2025.09', meta: '하회마을 · 부용대' },
    { hue: 'coast', n: '울릉도 섬 여행', d: '2025.07', meta: '도동항 · 해안 산책로' },
    { hue: 'forest', n: '울진 금강송 숲길', d: '2025.05', meta: '금강송 · 왕피천' },
    { hue: 'autumn', n: '문경 새재 고갯길', d: '2024.11', meta: '제1관문 · 오픈세트장' },
    { hue: 'coast', n: '영주 부석사 눈꽃', d: '2024.12', meta: '부석사 · 소백산' },
  ];
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 60, background: T.bgSubtle, overflow: 'auto' }}>
        <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.bgBase }}>
          <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="back" size={24}/></div>
          <Icon name="more" size={24}/>
        </div>
        <div style={{ background: T.bgBase, padding: '24px 20px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: `1px solid ${T.line100}` }}>
          <AnimalAvatar kind="bear" size={96} bg={T.primary100}/>
          <div style={{ fontSize: 19, fontWeight: 700, marginTop: 12, letterSpacing: '-0.3px' }}>우직한 곰 7821</div>
          <div style={{ fontSize: 13, color: T.text500, marginTop: 4 }}>30대 초반 · 남성</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, padding: '12px 20px', background: T.bgSubtle, borderRadius: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="star" size={14} color={T.warning}/>
                <div style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>4.9</div>
              </div>
              <div style={{ fontSize: 11, color: T.text500, marginTop: 2 }}>매너점수</div>
            </div>
            <div style={{ width: 1, height: 28, background: T.line200 }}/>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>8</div>
              <div style={{ fontSize: 11, color: T.text500, marginTop: 2 }}>여행 횟수</div>
            </div>
            <div style={{ width: 1, height: 28, background: T.line200 }}/>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>6</div>
              <div style={{ fontSize: 11, color: T.text500, marginTop: 2 }}>친구</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, width: '100%' }}>
            <button style={{ flex: 1, height: 44, borderRadius: 12, border: `1px solid ${T.line200}`, background: 'transparent', fontSize: 14, fontWeight: 600, fontFamily: T.fontStack }}>친구 신청</button>
            <button style={{ flex: 1, height: 44, borderRadius: 12, border: 'none', background: T.primary500, color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: T.fontStack, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icon name="chat" size={16} color="#fff"/> 메시지
            </button>
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>한 줄 소개</div>
          <div style={{ fontSize: 14, color: T.text700, lineHeight: 1.6, padding: 14, background: T.bgBase, borderRadius: 12 }}>"여행에서 만나는 작은 우연을 좋아합니다. 사진 잘 찍어드릴 수 있어요."</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 24, marginBottom: 10 }}>최근 여행 ({recentTrips.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentTrips.map((t, i) => (
              <div key={i} style={{ background: T.bgBase, borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden' }}><ImgPlaceholder height={56} hue={t.hue} radius={12}/></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{t.n}</div>
                  <div style={{ fontSize: 11, color: T.text500, marginTop: 2 }}>{t.d} · {t.meta}</div>
                </div>
                <Icon name="arrow" size={16} color={T.text400}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Phone>
  );
}

Object.assign(window, {
  ScreenFeedWrite, ScreenDex, ScreenProfileEdit, ScreenSettings, ScreenAuthMethods, ScreenPublicProfile,
});

// ─── window export ───
Object.assign(window, { ScreenFeedWrite, ScreenDex, ScreenProfileEdit, ScreenSettings, ScreenAuthMethods, ScreenPublicProfile });
