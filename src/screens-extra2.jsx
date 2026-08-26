// Feed Write (5 steps), Dex (도감), Profile Edit, Settings, Public Profile

// ───────── 24-1~24-5 · 피드 글쓰기 (단계별 화면) ─────────
// 5단계를 한 화면에 겹쳐 보여주면 각 단계에서 실제로 무엇을 하는지 검수할 수 없어서
// 단계마다 독립 화면으로 분리했다. 단계 정의는 iOS/Android 구현과 같은 5단계다.
const FEED_WRITE_STEPS = [
  { step: 1, label: 'STEP 1 · 코스 확인', title: '어떤 여행을 기록할까요?', helper: '방문 코스와 함께한 멤버를 먼저 확인해요.' },
  { step: 2, label: 'STEP 2 · 사진 선택', title: '대표 사진을 골라요', helper: '사진과 지도 조합이 피드 첫 화면에 함께 보여요.' },
  { step: 3, label: 'STEP 3 · 사진 & 메모', title: '여행 어땠어요?', helper: '대부분 자동으로 채워졌어요. 한 줄만 남겨주세요.' },
  { step: 4, label: 'STEP 4 · 공개 설정', title: '누구에게 보여줄까요?', helper: '친구에게만 공개하고 경로와 멤버 정보를 함께 보여줘요.' },
  { step: 5, label: 'STEP 5 · 최종 확인', title: '게시 전 마지막 확인이에요', helper: '사진, 경로, 멤버가 한 장의 피드처럼 구성됐어요.' },
];

const FEED_WRITE_MEMBERS = [
  { k: 'deer', n: '따스한 사슴 3492', me: true },
  { k: 'bear', n: '우직한 곰 7821' },
  { k: 'turtle', n: '잔잔한 거북이 9032' },
  { k: 'crane', n: '고요한 두루미 1130' },
];

function FeedWriteCard({ title, children, tone = 'base' }) {
  return (
    <div style={{ background: tone === 'base' ? T.bgBase : T.bgSubtle, border: `1px solid ${T.line100}`, borderRadius: 16, padding: 14, marginBottom: 12 }}>
      {title && <div style={{ fontSize: 12, fontWeight: 800, color: T.text700, marginBottom: 10 }}>{title}</div>}
      {children}
    </div>
  );
}

function FeedWriteMemoCard() {
  return (
    <FeedWriteCard>
      <div style={{ fontSize: 18, fontWeight: 800, color: T.text900 }}>첫 반패키지 단풍 여행</div>
      <div style={{ fontSize: 14, lineHeight: '22px', color: T.text700, marginTop: 8 }}>
        처음 반패키지 여행이었는데 동행분들이 너무 좋으셨어요. 첨성대 야경이 진짜 인생샷...
      </div>
      <div style={{ fontSize: 11, color: T.text400, textAlign: 'right', marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>54 / 500</div>
    </FeedWriteCard>
  );
}

function FeedWritePhotoGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
      <div style={{ height: 110, borderRadius: 12, position: 'relative', overflow: 'hidden' }}>
        <ImgPlaceholder height={110} hue="autumn" radius={12}/>
        <div style={{ position: 'absolute', top: 6, left: 6, padding: '2px 7px', borderRadius: 6, background: T.primary500, color: '#fff', fontSize: 10, fontWeight: 800 }}>대표</div>
      </div>
      <div style={{ height: 110, borderRadius: 12, overflow: 'hidden' }}><ImgPlaceholder height={110} hue="night" radius={12}/></div>
      <div style={{ height: 110, borderRadius: 12, overflow: 'hidden' }}><ImgPlaceholder height={110} hue="sunset" radius={12}/></div>
      <div style={{ height: 110, borderRadius: 12, border: `1.5px dashed ${T.line200}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: T.text500 }}>
        <Icon name="plus" size={18} color={T.text500}/>
        <div style={{ fontSize: 11 }}>사진 추가</div>
      </div>
    </div>
  );
}

function FeedWriteRouteCard() {
  return (
    <FeedWriteCard title="경로 (자동)" tone="subtle">
      <MiniMap height={140} pins={[1, 2, 3, 4]}/>
      <div style={{ fontSize: 11, color: T.text500, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon name="pin" size={11} color={T.primary600}/>
        경주 · 4 stops · 11/8 ~ 11/9
      </div>
    </FeedWriteCard>
  );
}

function FeedWriteMembersCard() {
  return (
    <FeedWriteCard title={`함께 간 멤버 (${FEED_WRITE_MEMBERS.length})`}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {FEED_WRITE_MEMBERS.map((m) => (
          <div key={m.n} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px 6px 6px', borderRadius: 999, background: m.me ? T.primary100 : T.bgSubtle }}>
            <AnimalAvatar kind={m.k} size={24} bg={T.bgBase}/>
            <div style={{ fontSize: 12, fontWeight: 600, color: m.me ? T.primary700 : T.text700 }}>{m.n}{m.me && ' (나)'}</div>
          </div>
        ))}
      </div>
    </FeedWriteCard>
  );
}

function FeedWriteCourseCards() {
  const courses = [
    { t: '경주 감성 힐링 코스', s: '경주 · 1박 2일', on: true, hue: 'autumn' },
    { t: '주왕산 & 주산지 힐링 트레킹', s: '청송 · 당일치기', on: false, hue: 'forest' },
    { t: '안동 하회마을 하루 코스', s: '안동 · 당일치기', on: false, hue: 'hanok' },
  ];
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: T.text900, marginBottom: 10 }}>기록할 코스</div>
      <div style={{ display: 'flex', gap: 10, overflow: 'hidden' }}>
        {courses.map((c) => (
          <div key={c.t} style={{
            width: 168, flexShrink: 0, padding: 10, borderRadius: 16,
            background: c.on ? T.primary50 : T.bgBase,
            border: `1px solid ${c.on ? T.primary500 : T.line100}`,
          }}>
            <div style={{ borderRadius: 10, overflow: 'hidden' }}><ImgPlaceholder height={66} hue={c.hue} radius={10}/></div>
            <div style={{ fontSize: 12, fontWeight: 800, marginTop: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.t}</div>
            <div style={{ fontSize: 11, color: T.text500, marginTop: 3 }}>{c.s}</div>
            <div style={{
              marginTop: 8, height: 24, borderRadius: 999, display: 'inline-flex', alignItems: 'center', padding: '0 10px',
              background: c.on ? T.primary500 : T.primary50, color: c.on ? '#fff' : T.primary700,
              fontSize: 11, fontWeight: 800,
            }}>{c.on ? '선택됨' : '이 코스로 기록'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedWriteMetaCard() {
  const rows = [
    ['map', '코스', '경주 감성 힐링 코스'],
    ['pin', '지역', '경주 · 1박 2일 · 42.6km'],
    ['eye', '공개', '친구만 · 경로지도 포함'],
  ];
  return (
    <FeedWriteCard>
      <div style={{ display: 'grid', gap: 12 }}>
        {rows.map((r) => (
          <div key={r[1]} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
            <Icon name={r[0]} size={15} color={T.text500}/>
            <span style={{ width: 40, color: T.text500, flexShrink: 0 }}>{r[1]}</span>
            <span style={{ flex: 1, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r[2]}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MemberStack size={26} members={['deer', 'bear', 'turtle']}/>
          <span style={{ fontSize: 12.5, fontWeight: 800 }}>함께한 멤버 3명</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['친구만', '경로지도', '경주', '힐링', '야경'].map((tag) => (
            <span key={tag} style={{ height: 26, padding: '0 10px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', background: T.primary50, color: T.primary700, fontSize: 11, fontWeight: 800 }}>{tag}</span>
          ))}
        </div>
      </div>
    </FeedWriteCard>
  );
}

function FeedWriteVisibilityCard() {
  const options = ['전체공개', '친구만', '나만 보기'];
  const selected = '친구만';
  return (
    <FeedWriteCard title="공개 범위">
      <div style={{ display: 'flex', gap: 8 }}>
        {options.map((o) => (
          <span key={o} style={{
            height: 34, padding: '0 12px', borderRadius: 999, display: 'inline-flex', alignItems: 'center',
            background: o === selected ? T.primary500 : T.primary50,
            color: o === selected ? '#fff' : T.primary700,
            fontSize: 12, fontWeight: 800,
          }}>{o}</span>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: T.text500, marginTop: 10, lineHeight: '17px' }}>
        서로 친구인 사람에게만 보여요. 기본값이에요.
      </div>
    </FeedWriteCard>
  );
}

function ScreenFeedWrite({ step = 3 }) {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  const meta = FEED_WRITE_STEPS[Math.min(Math.max(step, 1), 5) - 1];
  const isLast = meta.step === 5;

  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 60, background: T.bgSubtle }}>
        <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.bgBase }}>
          <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="close" size={24}/></div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>피드 글쓰기</div>
          <div style={{ fontSize: 13, color: isLast ? T.primary600 : T.text400, fontWeight: 700 }}>게시</div>
        </div>
        <div style={{ padding: '8px 20px 16px', background: T.bgBase, display: 'flex', gap: 6, borderBottom: `1px solid ${T.line100}` }}>
          {[1, 2, 3, 4, 5].map((i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= meta.step ? T.primary500 : T.line100 }}/>)}
        </div>
        <div style={{ position: 'absolute', top: 132, left: 0, right: 0, bottom: 92, overflow: 'auto', padding: '20px 20px 8px' }}>
          <div style={{ fontSize: 11, color: T.text500, marginBottom: 4, fontWeight: 700, letterSpacing: 0.5 }}>{meta.label}</div>
          <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.3, marginBottom: 4, letterSpacing: '-0.5px' }}>{meta.title}</div>
          <div style={{ fontSize: 13, color: T.text500, marginBottom: 16 }}>{meta.helper}</div>

          {meta.step === 1 && <><FeedWriteCourseCards/><FeedWriteRouteCard/><FeedWriteMembersCard/></>}
          {meta.step === 2 && <><FeedWritePhotoGrid/><FeedWriteRouteCard/></>}
          {meta.step === 3 && <><FeedWriteMemoCard/><FeedWritePhotoGrid/></>}
          {meta.step === 4 && <><FeedWriteVisibilityCard/><FeedWriteMetaCard/></>}
          {meta.step === 5 && <><FeedWriteMemoCard/><FeedWritePhotoGrid/><FeedWriteRouteCard/><FeedWriteMetaCard/></>}
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 20px 32px', background: T.bgBase, borderTop: `1px solid ${T.line100}`, display: 'flex', gap: 8 }}>
          <Btn variant="ghost">이전</Btn>
          <div style={{ flex: 1 }}><Btn variant="primary" full>{isLast ? '게시하기' : `다음 (${meta.step + 1}/5)`}</Btn></div>
        </div>
      </div>
    </Phone>
  );
}

function ScreenFeedWriteStep1() { return <ScreenFeedWrite step={1}/>; }
function ScreenFeedWriteStep2() { return <ScreenFeedWrite step={2}/>; }
function ScreenFeedWriteStep3() { return <ScreenFeedWrite step={3}/>; }
function ScreenFeedWriteStep4() { return <ScreenFeedWrite step={4}/>; }
function ScreenFeedWriteStep5() { return <ScreenFeedWrite step={5}/>; }

// ───────── 27 · 도감 (Friends Dex) ─────────
function ScreenDex() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, openModal: () => {} });
  // 로그인 상태에서는 GET users/me/travel-dex 로 대체한다.
  const liveMode = window.MoyeoApi?.live();
  const [dex, setDex] = React.useState(null);
  React.useEffect(() => {
    if (!liveMode) return undefined;
    let active = true;
    window.MoyeoApi.travelDex()
      .then((result) => { if (active && Array.isArray(result?.companions)) setDex(result); })
      .catch(() => { /* 실패 시 목데이터 유지 */ });
    return () => { active = false; };
  }, [liveMode]);

  if (dex) {
    const companions = dex.companions;
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
              <div style={{ fontSize: 36, fontWeight: 700, color: T.primary700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px' }}>{dex.totalCount}</div>
              <div style={{ fontSize: 15, color: T.text500, fontWeight: 500 }}>마리</div>
              <div style={{ marginLeft: 'auto', fontSize: 11, color: T.text400 }}>최근 동행 순</div>
            </div>
          </div>
          <div style={{ padding: 16, overflow: 'auto', maxHeight: 560 }}>
            {companions.length === 0 ? (
              <div style={{ padding: '56px 20px', textAlign: 'center', color: T.text500, fontSize: 13, lineHeight: '20px' }}>
                아직 도감에 기록된 친구가 없어요.<br/>여행을 다녀오면 함께한 친구가 여기에 남아요.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {companions.map((companion) => (
                  <div
                    key={companion.userId}
                    onClick={() => nav.go('public-profile', { params: { userId: companion.userId, dex: companion } })}
                    style={{ background: T.bgBase, borderRadius: 14, padding: 10, border: `1px solid ${T.line100}`, position: 'relative', cursor: 'pointer' }}>
                    {companion.tripCount >= 2 && <div style={{ position: 'absolute', top: 6, right: 6, padding: '1px 5px', borderRadius: 4, background: T.primary100, color: T.primary700, fontSize: 9, fontWeight: 700 }}>{companion.tripCount}×</div>}
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
                      {companion.profileImageUrl
                        ? <img src={companion.profileImageUrl} alt="" style={{ width: 56, height: 56, borderRadius: 999, objectFit: 'cover', background: T.primary50 }}/>
                        : <span style={{ width: 56, height: 56, borderRadius: 999, background: T.primary50, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user" size={26} color={T.primary600}/></span>}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, textAlign: 'center', lineHeight: 1.3, marginTop: 4, height: 28, overflow: 'hidden' }}>{companion.nickname}</div>
                    <div style={{ fontSize: 10, color: T.text400, textAlign: 'center', marginTop: 2 }}>{window.MoyeoApi.formatRelative(companion.latestTripDate)}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ textAlign: 'center', padding: '20px 0 8px', fontSize: 11, color: T.text400 }}>다음 모임에서 새 친구를 만나보세요 ✨</div>
          </div>
        </div>
      </Phone>
    );
  }
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
                onClick={() => !f.me && nav.go('public-profile')}
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
  return (
    <Phone>
      <ProfileEditBody/>
    </Phone>
  );
}

// 28 본문 — 28-1 여행 취향 편집 시트가 "이전 화면 위에 떠 있다"고 읽히도록 배경으로도 재사용한다 (changeLog14)
function ProfileEditBody() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  // 로그인 상태에서는 GET users/me/profile 로 대체한다.
  const liveMode = window.MoyeoApi?.live();
  const [profile, setProfile] = React.useState(null);
  React.useEffect(() => {
    if (!liveMode) return undefined;
    let active = true;
    window.MoyeoApi.myProfile()
      .then((result) => { if (active && result?.nickname) setProfile(result); })
      .catch(() => { /* 실패 시 목데이터 유지 */ });
    return () => { active = false; };
  }, [liveMode]);
  const genderLabel = profile ? ({ M: '남성', F: '여성', N: '선택 안 함' }[profile.gender] || profile.gender) : '여성';
  const birthLabel = profile?.birthDate ? profile.birthDate.replaceAll('-', '.') : null;
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
      <div style={{ position: 'absolute', inset: 0, paddingTop: 60, background: T.bgSubtle }}>
        <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.bgBase }}>
          <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="back" size={24}/></div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>프로필 수정</div>
          <div style={{ fontSize: 13, color: T.primary600, fontWeight: 600 }}>저장</div>
        </div>
        
        <div style={{ background: T.bgBase, padding: '24px 20px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: `1px solid ${T.line100}` }}>
          <div style={{ position: 'relative' }}>
            {profile
              ? (profile.profileImageUrl
                ? <img src={profile.profileImageUrl} alt="" style={{ width: 96, height: 96, borderRadius: 999, objectFit: 'cover', background: T.primary100 }}/>
                : <span style={{ width: 96, height: 96, borderRadius: 999, background: T.primary100, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user" size={44} color={T.primary600}/></span>)
              : <AnimalAvatar kind="deer" size={96} bg={T.primary100}/>}
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 999, background: T.line200, border: `2px solid ${T.bgBase}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="lock" size={12} color={T.text500}/>
            </div>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 12 }}>{profile ? profile.nickname : '따스한 사슴 3492'}</div>
          <div style={{ fontSize: 11, color: T.text500, marginTop: 4 }}>한 번 정한 친구는 바꿀 수 없어요</div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: T.text500, padding: '20px 20px 8px', letterSpacing: 0.5 }}>공개 프로필</div>
        <div style={{ background: T.bgBase }}>
          <Row label="자기소개" value={profile ? (profile.introduction || '아직 없음') : '느긋한 여행 좋아해요'}/>
          {/* 여행 스타일과 관심 지역은 가입(06-1)과 동일하게 한 블록에서 함께 조회·수정한다.
              블록(칩·+추가 포함)을 탭하면 여행 취향 편집 Bottom Sheet(28-1)가 열린다. */}
          <div
            role="button"
            tabIndex={0}
            aria-label="여행 취향 편집 열기"
            data-testid="profile-taste-block"
            onClick={() => nav.go('profile-taste-edit')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nav.go('profile-taste-edit'); } }}
            style={{ padding: '16px 20px', borderBottom: `1px solid ${T.line100}`, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ flex: 1, fontSize: 14, color: T.text700 }}>여행 취향</div>
              <div style={{ fontSize: 11, color: T.text500 }}>탭해서 바로 수정</div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.text500, marginBottom: 6 }}>여행 스타일</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {(profile ? profile.travelStyles.map((style) => style.label) : ['자연', '사진']).map(styleTag => <Chip key={styleTag} variant="primary" size="sm">{styleTag}</Chip>)}
              <Chip variant="neutral" size="sm">+ 추가</Chip>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.text500, marginBottom: 6 }}>관심 지역</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(profile ? profile.interestedRegions.map((region) => region.signguName) : ['경주', '안동', '포항', '문경']).map(r => <Chip key={r} variant="primary" size="sm">{r}</Chip>)}
              <Chip variant="neutral" size="sm">+ 추가</Chip>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: T.text500, padding: '20px 20px 8px', letterSpacing: 0.5 }}>비공개 정보</div>
        <div style={{ background: T.bgBase }}>
          <Row label="닉네임" value={profile ? profile.nickname : '따스한 사슴 3492'} locked/>
          <Row label="캐릭터" value="고정됨" locked/>
          {(!profile || birthLabel) && <Row label="생년월일" value={profile ? birthLabel : '1998.04.12'}/>}
          <Row label="성별" value={genderLabel}/>
        </div>
      </div>
  );
}

// ───────── 28-1 · 여행 취향 편집 Bottom Sheet ─────────
// 28의 여행 취향 블록(칩·+ 추가)을 탭하면 열린다. 후보·기본값·선택 규칙은 가입 06-1과 동일하며,
// 스타일과 관심 지역을 언제나 한 시트에서 함께 편집한다. 각 1개 이상일 때만 저장이 활성화된다.
// 바텀시트 프레임(딤 배경 + 상단 라운드 24 + 핸들 바)은 신고 시트(30-2)와 같은 관례를 따른다.
function ScreenProfileTasteEdit() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  const STYLES = ['자연', '힐링', '사진', '맛집', '역사', '야경', '트레킹', '카페'];
  const REGIONS = ['경주', '안동', '포항', '문경', '청송', '영주', '울진', '울릉'];
  const [styles, setStyles] = React.useState(['자연', '사진']);
  const [regions, setRegions] = React.useState(['경주', '안동', '포항', '문경']);
  const toggle = (list, setList, value) => setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  // 로그인 상태: 후보는 GET users/me/profile/options(스타일 12종·시군구 24곳, 서버 기준),
  // 현재 선택은 GET users/me/profile, 저장은 PUT users/me/profile 로 연동한다.
  const liveMode = window.MoyeoApi?.live();
  const [serverOptions, setServerOptions] = React.useState(null);
  const [serverProfile, setServerProfile] = React.useState(null);
  const [styleIds, setStyleIds] = React.useState([]);
  const [regionIds, setRegionIds] = React.useState([]);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState('');
  React.useEffect(() => {
    if (!liveMode) return undefined;
    let active = true;
    Promise.all([window.MoyeoApi.profileOptions(), window.MoyeoApi.myProfile()])
      .then(([optionsResult, profileResult]) => {
        if (!active || !Array.isArray(optionsResult?.travelStyles)) return;
        setServerOptions(optionsResult);
        setServerProfile(profileResult);
        setStyleIds((profileResult?.travelStyles || []).map((style) => style.id));
        setRegionIds((profileResult?.interestedRegions || []).map((region) => region.id));
      })
      .catch(() => { /* 실패 시 목데이터 유지 */ });
    return () => { active = false; };
  }, [liveMode]);
  const serverMode = Boolean(serverOptions && serverProfile);
  const toggleId = (list, setList, id) => setList(list.includes(id) ? list.filter((v) => v !== id) : [...list, id]);
  const saveServer = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError('');
    try {
      await window.MoyeoApi.updateProfile({
        introduction: serverProfile.introduction ?? null,
        travelStyleIds: styleIds,
        interestedRegionIds: regionIds,
        birthDate: serverProfile.birthDate,
        gender: serverProfile.gender,
      });
      setSaving(false);
      nav.back();
    } catch (requestError) {
      setSaving(false);
      setSaveError(requestError?.message || '저장하지 못했어요. 잠시 후 다시 시도해주세요.');
    }
  };
  const canSave = serverMode
    ? (styleIds.length > 0 && regionIds.length > 0 && !saving)
    : (styles.length > 0 && regions.length > 0);
  const chip = (label, on, onClick, testId) => (
    <button key={label} type="button" data-testid={testId} onClick={onClick} aria-pressed={on} style={{
      height: 36, padding: '0 14px', borderRadius: 999, cursor: 'pointer', fontFamily: T.fontStack,
      fontSize: 13, fontWeight: on ? 700 : 500,
      background: on ? T.primary100 : T.bgRaised,
      border: on ? `1.5px solid ${T.primary500}` : `1px solid ${T.line200}`,
      color: on ? T.primary700 : T.text700,
    }}>{label}</button>
  );
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {/* 이전 화면(28)이 딤 아래에 그대로 깔려 있어야 시트가 "위에 떠 있다"고 읽힌다 (changeLog14) */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}><ProfileEditBody/></div>
        <div style={{ position: 'absolute', inset: 0, background: T.bgOverlay }}/>

        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: T.bgRaised, borderRadius: '24px 24px 0 0', padding: '10px 20px 32px', boxShadow: T.l3,
        }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: T.line300, margin: '0 auto 14px' }}/>
          <div style={{ fontSize: 17, fontWeight: 700 }}>여행 취향 편집</div>
          <div style={{ fontSize: 12, color: T.text500, marginTop: 4 }}>여행 스타일과 관심 지역은 함께 저장돼요.</div>

          <div style={{ fontSize: 13, fontWeight: 500, color: T.text700, margin: '18px 0 10px' }}>여행 스타일 <span style={{ color: T.danger }}>*</span> <span style={{ color: T.text500, fontWeight: 400 }}>· 1개 이상</span></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {serverMode
              ? serverOptions.travelStyles.map((style) => chip(style.label, styleIds.includes(style.id), () => toggleId(styleIds, setStyleIds, style.id), "taste-edit-style-" + style.label))
              : STYLES.map(style => chip(style, styles.includes(style), () => toggle(styles, setStyles, style), "taste-edit-style-" + style))}
          </div>

          <div style={{ fontSize: 13, fontWeight: 500, color: T.text700, margin: '18px 0 10px' }}>관심 지역 <span style={{ color: T.danger }}>*</span> <span style={{ color: T.text500, fontWeight: 400 }}>· 경북 안에서 1곳 이상</span></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: serverMode ? 132 : undefined, overflow: serverMode ? 'auto' : undefined }}>
            {serverMode
              ? serverOptions.interestedRegions.map((region) => chip(region.signguName, regionIds.includes(region.id), () => toggleId(regionIds, setRegionIds, region.id), "taste-edit-region-" + region.signguName))
              : REGIONS.map(region => chip(region, regions.includes(region), () => toggle(regions, setRegions, region), "taste-edit-region-" + region))}
          </div>

          <div style={{ fontSize: 12, color: T.text500, textAlign: 'center', margin: '18px 0 12px' }}>
            여행 스타일 {serverMode ? styleIds.length : styles.length}개 · 관심 지역 {serverMode ? regionIds.length : regions.length}곳 선택
          </div>
          {saveError && <div role="alert" style={{ fontSize: 12, color: T.danger, textAlign: 'center', marginBottom: 10 }}>{saveError}</div>}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="button" data-testid="taste-edit-cancel" onClick={() => nav.back()} style={{ width: 72, height: 52, border: 0, background: 'transparent', fontSize: 14, fontWeight: 600, color: T.text700, fontFamily: T.fontStack, cursor: 'pointer' }}>취소</button>
            <div style={{ flex: 1 }}><Btn variant="primary" full disabled={!canSave} onClick={serverMode ? saveServer : () => nav.back()} testId="taste-edit-save">{saving ? '저장 중...' : '저장'}</Btn></div>
          </div>
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
  // 로그인 상태: GET users/me/profile(알림 수신 플래그) + notifications/settings(방해금지)로 대체하고,
  // 토글 변경은 PUT notifications/settings 로 저장한다.
  const liveMode = window.MoyeoApi?.live();
  const [serverProfile, setServerProfile] = React.useState(null);
  const [serverDnd, setServerDnd] = React.useState(null);
  React.useEffect(() => {
    if (!liveMode) return undefined;
    let active = true;
    window.MoyeoApi.myProfile()
      .then((result) => { if (active && result?.nickname) setServerProfile(result); })
      .catch(() => {});
    window.MoyeoApi.notificationSettings()
      .then((result) => { if (active && result && typeof result.doNotDisturbEnabled === 'boolean') setServerDnd(result); })
      .catch(() => {});
    return () => { active = false; };
  }, [liveMode]);
  const DAY_ENUMS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const saveNotificationFlags = async (patch) => {
    if (!serverProfile) return;
    const next = { ...serverProfile, ...patch };
    setServerProfile(next);
    try {
      await window.MoyeoApi.updateNotificationSettings({
        chatNotificationMode: next.chatNotificationMode,
        recruitmentDeadlineEnabled: next.recruitmentDeadlineEnabled,
        socialActivityEnabled: next.socialActivityEnabled,
        marketingEnabled: next.marketingEnabled,
        doNotDisturbEnabled: serverDnd?.doNotDisturbEnabled ?? false,
        doNotDisturbStartTime: serverDnd?.doNotDisturbStartTime ?? null,
        doNotDisturbEndTime: serverDnd?.doNotDisturbEndTime ?? null,
        doNotDisturbDays: (serverDnd?.doNotDisturbDays || []).filter((day) => DAY_ENUMS.includes(day)),
      });
    } catch (_) {
      setServerProfile(serverProfile); // 실패 시 원복
    }
  };
  const dndSummary = serverDnd
    ? (serverDnd.doNotDisturbEnabled && serverDnd.doNotDisturbStartTime
      ? `방해금지 ${serverDnd.doNotDisturbStartTime}~${serverDnd.doNotDisturbEndTime}`
      : '방해금지 꺼짐')
    : null;
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );
  const [pushStatus, setPushStatus] = React.useState('checking');
  // 기획(29)의 '채팅 메시지'는 부제 없이 ON이다. 웹은 실제 브라우저 푸시 권한을 쓰므로
  // 사용자가 손쓸 수 있는 차단 상태에서만 부제로 안내하고, 그 외에는 기획과 동일하게 ON·부제 없음으로 둔다.
  const pushBlockedCopy = {
    denied: '브라우저 설정에서 알림 권한을 허용해주세요',
    unsupported: '이 브라우저는 웹 알림을 지원하지 않아요',
    insecure: 'HTTPS 환경에서만 웹 알림을 쓸 수 있어요',
    unconfigured: 'Firebase Messaging 설정이 필요해요',
    error: '알림 연결을 확인하지 못했어요. 다시 시도해주세요',
  };
  const pushBlocked = Object.prototype.hasOwnProperty.call(pushBlockedCopy, pushStatus);
  React.useEffect(() => {
    let active = true;
    const updateState = (event) => {
      if (!active) return;
      setPushStatus(event.detail?.status || 'error');
      setNotificationsEnabled(event.detail?.permission === 'granted');
    };
    window.addEventListener('moyeo:push-state', updateState);
    window.MoyeoPush?.capability?.().then((state) => {
      if (!active) return;
      setPushStatus(state?.status || 'unsupported');
      setNotificationsEnabled(state?.permission === 'granted');
    });
    return () => {
      active = false;
      window.removeEventListener('moyeo:push-state', updateState);
    };
  }, []);
  const enableNotifications = async () => {
    try {
      const token = await window.MoyeoPush?.syncToken({ requestPermission: true, reason: 'settings' });
      const state = await window.MoyeoPush?.capability?.();
      setPushStatus(state?.status || (token ? 'ready' : 'unsupported'));
      setNotificationsEnabled(Boolean(token));
    } catch (_) {
      setPushStatus('error');
      setNotificationsEnabled(false);
    }
  };
  // ── 테마 (29 › 화면 › 테마) ──
  // 저장값은 3상태다: system(기본) · light · dark. 'system' 이면 OS 변경을 즉시 따라간다.
  const captureMode = Boolean(window.MoyeoApi?.deterministicParams?.());
  const [themePreference, setThemePreference] = React.useState(() => window.getMoyeoThemePreference?.() || 'system');
  React.useEffect(() => {
    const sync = (event) => setThemePreference(event.detail?.preference || window.getMoyeoThemePreference?.() || 'system');
    window.addEventListener('moyeo:theme-mode', sync);
    return () => window.removeEventListener('moyeo:theme-mode', sync);
  }, []);
  const themeLabels = window.MOYEO_THEME_PREFERENCE_LABELS || { system: '시스템 기본', light: '라이트', dark: '다크' };
  const themeValue = captureMode ? '시스템 기본' : (themeLabels[themePreference] || '시스템 기본');
  const cycleTheme = () => setThemePreference(window.cycleMoyeoThemeMode?.(themePreference) || 'system');

  // ── 정보 섹션 안내 다이얼로그 ──
  // 문구는 Android(MyMenuScreens.kt)·iOS(MyView.swift)와 같은 값을 쓴다. 새 문구를 만들지 않는다.
  // 버전 본문만 근거 없는 '최신 상태' 주장을 빼고 설치된 버전을 알려준다(캡처 모드는 기획 문구 유지).
  const [infoDialog, setInfoDialog] = React.useState(null);
  const infoDialogs = {
    version: { title: '앱 버전', body: window.MoyeoAppVersion?.dialogBody() },
    contact: { title: '문의하기', body: '채팅, 모집, 결제 문의를 남기는 고객센터로 이어져요.' },
    rate: { title: '앱 평가하기', body: '스토어 평가로 이동하기 전, 모여트립 사용 경험을 한 번 더 확인해요.' },
  };
  const infoDialogSpec = infoDialog ? infoDialogs[infoDialog] : null;

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
          <ToggleRow label="채팅 메시지" on={notificationsEnabled || !pushBlocked} sub={pushBlocked ? pushBlockedCopy[pushStatus] : undefined} onClick={enableNotifications}/>
          <ToggleRow label="모집 마감 임박" on={serverProfile ? serverProfile.recruitmentDeadlineEnabled : true} sub="D-3부터 알려드려요" onClick={serverProfile ? () => saveNotificationFlags({ recruitmentDeadlineEnabled: !serverProfile.recruitmentDeadlineEnabled }) : undefined}/>
          <ToggleRow label="친구 신청·피드 반응" on={serverProfile ? serverProfile.socialActivityEnabled : true} onClick={serverProfile ? () => saveNotificationFlags({ socialActivityEnabled: !serverProfile.socialActivityEnabled }) : undefined}/>
          <ToggleRow label="마케팅 알림" on={serverProfile ? serverProfile.marketingEnabled : false} sub="이벤트·새 코스 소개" onClick={serverProfile ? () => saveNotificationFlags({ marketingEnabled: !serverProfile.marketingEnabled }) : undefined}/>
          <Row label="알림 세부 설정" value={dndSummary || '방해금지 22:30~07:00'} onClick={() => nav.go('notif-detail')} testId="settings-notif-detail"/>
        </Section>

        <Section title="화면">
          {/* 탭하면 시스템 기본 → 라이트 → 다크 순환. 기획에 선택 시트가 없어 순환으로 간다.
              캡처 모드에서는 강제 테마가 사용자 설정보다 우선하므로 값은 기획대로 '시스템 기본' 고정. */}
          <Row label="테마" value={themeValue} onClick={captureMode ? undefined : cycleTheme} testId="settings-theme"/>
          <Row label="언어" value="한국어"/>
        </Section>

        <Section title="계정">
          <Row label="로그인 방식" value="관리" onClick={() => nav.go('auth-methods')} testId="settings-auth-methods"/>
          <Row label="차단한 사용자" value={liveMode ? '관리' : '2명'} onClick={() => nav.go('blocked')} testId="settings-blocked"/>
          <Row label="개인정보 처리방침" onClick={() => nav.go('privacy-settings')} testId="settings-privacy"/>
          <Row label="이용약관" onClick={() => nav.go('terms-settings')} testId="settings-terms"/>
        </Section>

        <Section title="정보">
          {/* 실제 빌드 버전을 보여준다. 최신 버전을 알려주는 서버 API가 없어 '(최신)' 은 붙이지 않는다.
              캡처 모드에서는 기획값 '1.0.4 (최신)' 을 그대로 유지한다. */}
          <Row label="버전" value={window.MoyeoAppVersion?.label()} onClick={() => setInfoDialog('version')} testId="settings-version"/>
          <Row label="문의하기" onClick={() => setInfoDialog('contact')} testId="settings-contact"/>
          <Row label="앱 평가하기" onClick={() => setInfoDialog('rate')} testId="settings-rate"/>
          <Row label="오픈소스 라이선스" onClick={() => nav.go('oss-licenses')} testId="settings-oss-licenses"/>
          <Row label="로그아웃" danger testId="settings-sign-out" onClick={async () => { await window.MoyeoAuth.signOut(); nav.go('login', { replace: true }); }}/>
          <Row label="계정 탈퇴" danger sub="30일 안에는 되살릴 수 있어요" testId="settings-withdraw" onClick={async () => { if (!window.confirm('계정을 즉시 영구 삭제할까요?')) return; await window.MoyeoAuth.withdraw(); nav.go('login', { replace: true }); }}/>
        </Section>
        </div>

        {infoDialogSpec && (
          <div data-testid="settings-info-dialog" role="dialog" aria-modal="true" aria-label={infoDialogSpec.title} style={{ position: 'absolute', inset: 0, background: T.bgOverlay, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 20 }}>
            <div style={{ width: '100%', maxWidth: 320, background: T.bgRaised, borderRadius: 20, padding: 22, boxShadow: T.l3 }}>
              <div style={{ fontSize: 17, fontWeight: 900, lineHeight: '24px' }}>{infoDialogSpec.title}</div>
              <div style={{ fontSize: 12.5, color: T.text500, marginTop: 10, lineHeight: '19px' }}>{infoDialogSpec.body}</div>
              <div style={{ marginTop: 18 }}>
                <Btn variant="primary" full testId="settings-info-dialog-confirm" onClick={() => setInfoDialog(null)}>확인</Btn>
              </div>
            </div>
          </div>
        )}
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

// ───────── 유저 색상 팔레트 ─────────
//
// 서버 NicknameCandidate.color 의 10가지 값.
// 공개 프로필(PublicProfileResponse.nicknameColor)과 받은 평가
// (ReceivedTravelReviewResponse.reviewerNicknameColor)로 내려온다.
// 도감·멤버·동행자 목록 응답에는 없으므로 목록에서는 색을 쓰지 않는다.
const MOYEO_USER_COLORS = {
  RED: '#D9534F', ORANGE: '#E8853A', YELLOW: '#D9A81C', GREEN: '#2D8F5A', BLUE: '#3B7DD8',
  NAVY: '#2F4A86', PURPLE: '#7E5BC4', PINK: '#DE5D97', SKY_BLUE: '#3FA9D6', MINT: '#2FB79A',
};

// 지정색을 그대로 쓰면 프로필 이미지 배경과 붙어버린다. 테마 토큰과 섞어
// 진한 톤(테두리) > 중간 톤(프레임) > 흐린 톤(배경) 3단으로 벌린다.
// 두 번째 색이 테마 변수라 라이트/다크가 자동으로 따라온다.
function userCardPalette(color) {
  const base = MOYEO_USER_COLORS[color] || T.primary500;
  return {
    base,
    border: `color-mix(in oklab, ${base} 76%, ${T.line200})`,
    frame: `color-mix(in oklab, ${base} 44%, ${T.bgRaised})`,
    bgFrom: `color-mix(in oklab, ${base} 22%, ${T.bgRaised})`,
    plate: `color-mix(in oklab, ${base} 10%, ${T.bgRaised})`,
    chipBg: `color-mix(in oklab, ${base} 14%, ${T.bgRaised})`,
    chipText: `color-mix(in oklab, ${base} 66%, ${T.text900})`,
    glow: `color-mix(in oklab, ${base} 52%, transparent)`,
  };
}

// 카드의 세 단계별 트랜지션.
//   rest   손을 뗀 뒤 제자리로 — 천천히(900ms)
//   enter  평평한 상태에서 포인터 위치까지 — 짧게(260ms). 없으면 처음 올릴 때 각도가 튄다.
//   follow 포인터를 따라가는 중 — 트랜지션 없음. 짧게라도 걸면 계속 뒤따라오고,
//          손을 멈춘 뒤에야 남은 보간이 재생되는 것처럼 보인다.
const CARD_MOTION = {
  rest: '900ms cubic-bezier(0.16, 1, 0.3, 1)',
  enter: '260ms cubic-bezier(0.22, 1, 0.36, 1)',
};
function cardMotion(phase, props) {
  if (phase === 'follow') return 'none';
  return props.map((prop) => `${prop} ${CARD_MOTION[phase] || CARD_MOTION.rest}`).join(', ');
}

// 포인터 위치를 CSS 변수로 넘긴다. tokens.jsx 에서 @property 로 타입을 등록해 두었기 때문에
// 각도까지 보간된다 — 등록하지 않으면 손을 떼는 순간 광택만 "툭" 끊긴다.
function holoVars(x, y, phase) {
  return {
    '--moyeo-holo-angle': `${105 + (x - 0.5) * 90}deg`,
    '--moyeo-holo-bx': `${20 + x * 60}%`,
    '--moyeo-holo-by': `${20 + y * 60}%`,
    transition: cardMotion(phase, ['--moyeo-holo-angle', '--moyeo-holo-bx', '--moyeo-holo-by', 'opacity']),
  };
}

// 홀로 포일 — 무지개 띠. 프로필 이미지 "위"에 얹는다.
//
// 뒤에 깔아봤는데, 실제 프로필 이미지가 있으면 이미지가 정사각형을 꽉 채워
// 홀로그램이 완전히 가려졌다(실서버 이미지로 확인). 그래서 위로 올린다.
//
// 블렌드 모드로는 안 된다. 실제 프로필 이미지가 밝은 파스텔 톤이라
// soft-light·overlay·color-dodge 모두 — 참조 구현의 대비 부스트를 넣어도 — 거의 보이지 않았다.
// 그래서 색을 실제로 얹고 알파로 세기를 잡는다. 그림의 형태는 알파가 낮아 그대로 읽힌다.
function ProfileCardFoil({ x = 0.5, y = 0.5, shine = 0.62, phase = 'rest' }) {
  return (
    <div aria-hidden="true" style={{
      ...holoVars(x, y, phase),
      // 곡률을 직접 주지 않는다. 프레임이 2px 보더를 가져서 안쪽 곡률은 12 가 아니라 10 이고,
      // 12 를 주면 모서리가 더 깎여 보더와 사이에 이격이 생긴다.
      // 부모가 overflow: hidden 이라 안쪽 곡선에 정확히 맞춰 잘린다.
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage:
        'repeating-linear-gradient(var(--moyeo-holo-angle),'
        + ' rgba(255,119,115,0.34) 4%, rgba(255,237,140,0.30) 12%, rgba(168,255,150,0.28) 20%,'
        + ' rgba(131,240,247,0.30) 28%, rgba(140,160,255,0.32) 36%, rgba(216,140,255,0.30) 44%,'
        + ' rgba(255,255,255,0.22) 50%, rgba(255,119,115,0.34) 56%)',
      backgroundSize: '320% 320%',
      backgroundPosition: 'var(--moyeo-holo-bx) var(--moyeo-holo-by)',
      filter: 'saturate(1.15)',
      opacity: shine * 0.65,
    }}/>
  );
}

// ───────── 25 · 프로필 (포켓몬 카드형) ─────────
//
// 카드 자체가 그 유저의 프로필이다. 도감·피드 작성자·멤버 시트·친구 목록 등
// "유저를 눌러 자세히 보는" 모든 진입점이 이 화면으로 온다.
//
// 진입점마다 서버가 주는 필드가 다르다. 카드는 받은 값만 채우고 없는 슬롯은 지운다.
//   GET /users/{userId}/profile        닉네임·이미지·색상·소개·취향·평균 매너
//   GET /users/{userId}/travel-reviews 다른 여행자들이 남긴 평가 (여행 제목·시각 없음)
//   nav.params.dex                     도감에서 들어온 경우의 동행 횟수·함께한 여행
// 전체 여행/호스트/피드 횟수는 어떤 응답에도 없다 — 칸을 지운다(지어내지 않는다).
// 프로필 이미지가 없을 때의 아바타. 닉네임의 동물을 따른다 —
// 목데이터의 동물을 그대로 두면 "따스한 기린 2334" 카드에 곰이 뜬다(라이브 캡처에서 발견).
// 일러스트가 있는 6종은 그림으로, 나머지는 온보딩과 같은 이모지로 그린다.
function ProfileCardAvatar({ nickname, fallbackKind = 'bear' }) {
  const avatar = window.MoyeoApi?.avatarForNickname?.(nickname);
  if (avatar?.emoji) {
    return (
      <div aria-hidden="true" style={{ fontSize: 150, lineHeight: 1, userSelect: 'none' }}>{avatar.emoji}</div>
    );
  }
  return <AnimalAvatar kind={avatar?.kind || fallbackKind} size={236} bg="transparent"/>;
}

function ScreenPublicProfile({ initialFlipped = false }) {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {}, params: {} });
  const params = nav.params || {};
  // 인앱 진입은 nav 파라미터, 화면 직접 진입(라이브 캡처·QA)은 ?userId= 로 대상을 받는다.
  const userId = params.userId || window.MoyeoApi?.selectedUserId?.() || null;
  const liveMode = window.MoyeoApi?.live();

  const [profile, setProfile] = React.useState(null);
  const [reviews, setReviews] = React.useState([]);
  React.useEffect(() => {
    if (!liveMode || !userId) return undefined;
    let active = true;
    window.MoyeoApi.publicProfile(userId)
      .then((r) => { if (active && r?.nickname) setProfile(r); })
      .catch(() => {});
    window.MoyeoApi.receivedTravelReviews(userId)
      .then((r) => { if (active && Array.isArray(r)) setReviews(r); })
      .catch(() => {});
    return () => { active = false; };
  }, [liveMode, userId]);

  // 캡처(결정적 파라미터)에서는 기획과 같은 값을 쓴다. 라이브에서는 서버 값만 쓴다.
  const mock = {
    kind: 'bear', nickname: '우직한 곰 7821', nicknameColor: 'ORANGE',
    profileImageUrl: null, mannerRating: 4.8,
    introduction: '사진 찍는 걸 좋아해요. 천천히 걷는 여행을 좋아합니다.',
    travelStyles: ['사진', '자연'],
    // 여행·호스트·피드 횟수는 어떤 서버 응답에도 없다. 캡처 모드에서도 만들지 않는다 —
    // 목데이터라도 지어낸 숫자를 앱 화면에 띄우지 않는다. 기획(25)에는 정의가 남아 있어
    // 그 세 칸에서 기획 캡처와 다른 것은 정상이다.
    tripCount: 2, latestTripTitle: '경주 단풍·야경 모임', latestTripDate: '2026.08.23',
    memories: [
      { tripTitle: '경주 단풍·야경 모임', tripDate: '2026.08.23', oneLineReview: '사진 정말 잘 찍어주셨어요!' },
      { tripTitle: '주왕산 힐링 트레킹', tripDate: '2026.06.14', oneLineReview: null },
    ],
    receivedReviews: [
      { reviewerNickname: '고요한 두루미 1130', reviewerNicknameColor: 'SKY_BLUE', content: '약속 시간을 정확히 지키고 사진도 많이 남겨주셨어요.' },
      { reviewerNickname: '잔잔한 거북이 9032', reviewerNicknameColor: 'MINT', content: '걷는 속도를 계속 맞춰줘서 편했습니다.' },
    ],
  };

  // 목데이터로 떨어지는 것은 서버가 없을 때(캡처·목킹 모드)뿐이다.
  // 로그인 상태에서 조회가 실패했는데 목데이터를 보여주면 남의 프로필을 지어내는 셈이 된다.
  const captureMode = !liveMode || !userId;
  const dex = params.dex || null;
  const subject = profile ? {
    kind: 'bear',
    nickname: profile.nickname,
    nicknameColor: profile.nicknameColor,
    profileImageUrl: profile.profileImageUrl,
    mannerRating: profile.mannerRating,
    introduction: profile.introduction,
    travelStyles: (profile.travelStyles || []).map((v) => v.label || v.name || v),
    // 서버가 주지 않는 값은 넣지 않는다 → 칸이 만들어지지 않는다
    completedTripCount: undefined, hostedTripCount: undefined, feedCount: undefined,
    tripCount: dex?.tripCount ?? null,
    latestTripTitle: dex?.latestTripTitle || null,
    latestTripDate: dex?.latestTripDate || null,
    memories: dex?.memories || [],
    receivedReviews: reviews.map((r) => ({
      reviewerNickname: r.reviewerNickname,
      reviewerNicknameColor: r.reviewerNicknameColor,
      content: r.content,
    })),
  } : (captureMode ? mock : null);

  const pal = userCardPalette(subject?.nicknameColor);

  // 매너 점수는 스트립에 넣지 않는다. 단위가 다르고(점 vs 회), 실제로 매너만 내려오는
  // 진입점(도감·동행자)에서는 한 칸짜리 전체폭 스트립이 남아 어색했다.
  const stats = subject ? [
    subject.completedTripCount != null && ['여행', `${subject.completedTripCount}`],
    subject.hostedTripCount != null && ['호스트', `${subject.hostedTripCount}`],
    subject.feedCount != null && ['피드', `${subject.feedCount}`],
  ].filter(Boolean) : [];

  const REST = { rx: 0, ry: 0, x: 0.5, y: 0.5, scale: 1, shine: 0.62, lift: 0 };
  const [tilt, setTilt] = React.useState({ ...REST, phase: 'rest' });
  const enterTimer = React.useRef(null);
  const [flipped, setFlipped] = React.useState(initialFlipped);
  const cardRef = React.useRef(null);
  const swipeStart = React.useRef(null);

  const onSwipeStart = (x, y) => { swipeStart.current = { x, y }; };
  const onSwipeEnd = (x, y) => {
    const s0 = swipeStart.current;
    swipeStart.current = null;
    if (!s0) return;
    const dx = x - s0.x;
    const dy = y - s0.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) setFlipped((v) => !v);
  };

  const onMove = (clientX, clientY) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (clientY - r.top) / r.height));
    const next = { rx: (0.5 - y) * 20, ry: (x - 0.5) * 20, x, y, scale: 1.02, shine: 0.9, lift: 1 };
    setTilt((t) => {
      if (t.phase !== 'rest') return { ...next, phase: t.phase };
      // 평평한 상태에서 처음 올린 순간이다. 값을 지금 바꾸면 각도가 튄다 —
      // 이 커밋에서는 트랜지션만 260ms 로 바꾸고, 값은 다음 프레임에 넘긴다(reset 과 같은 이유).
      requestAnimationFrame(() => setTilt((cur) => (cur.phase === 'enter' ? { ...next, phase: 'enter' } : cur)));
      clearTimeout(enterTimer.current);
      enterTimer.current = setTimeout(() => {
        setTilt((cur) => (cur.phase === 'enter' ? { ...cur, phase: 'follow' } : cur));
      }, 280);
      return { ...t, phase: 'enter' };
    });
  };

  // 트랜지션과 값을 한 커밋에서 같이 바꾸면 크롬이 "변경 전" 트랜지션으로 처리한다.
  // 따라가는 중에는 트랜지션이 없으니 결과가 즉시 튄다 — 카드도 광택도 "띡" 돌아갔다.
  // 한 프레임 동안 트랜지션만 900ms 로 바꾸고, 다음 프레임에 값을 원위치로 보낸다.
  const reset = () => {
    clearTimeout(enterTimer.current);
    setTilt((t) => ({ ...t, phase: 'rest' }));
    requestAnimationFrame(() => setTilt({ ...REST, phase: 'rest' }));
  };
  React.useEffect(() => () => clearTimeout(enterTimer.current), []);

  const metaRow = (label, value) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <div style={{ fontSize: 10.5, color: T.text500, fontWeight: 700, minWidth: 52 }}>{label}</div>
      <div style={{ fontSize: 11.5, color: T.text900, fontWeight: 700, flex: 1 }}>{value}</div>
    </div>
  );

  const faceShadow = {
    boxShadow: tilt.lift ? '0 22px 44px rgba(0,0,0,0.28)' : '0 10px 26px rgba(0,0,0,0.16)',
    transition: cardMotion(tilt.phase, ['box-shadow']),
  };

  if (!subject) {
    // 라이브에서 아직 못 받았거나 실패한 상태. 값을 지어내지 않고 비워 둔다.
    return (
      <Phone>
        <div style={{ position: 'absolute', inset: 0, paddingTop: 46, background: T.bgSubtle, display: 'flex', flexDirection: 'column' }}>
          <Header title="프로필" left center onBack={nav.back}/>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: T.text500 }}>
            프로필을 불러오지 못했어요
          </div>
        </div>
      </Phone>
    );
  }

  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 46, background: T.bgSubtle, display: 'flex', flexDirection: 'column' }}>
        <Header title="프로필" left center onBack={nav.back}/>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 20px 12px', perspective: 900 }}>
          <div
            ref={cardRef}
            onMouseMove={(e) => onMove(e.clientX, e.clientY)}
            onMouseLeave={reset}
            onMouseDown={(e) => onSwipeStart(e.clientX, e.clientY)}
            onMouseUp={(e) => onSwipeEnd(e.clientX, e.clientY)}
            onTouchStart={(e) => { const t = e.touches[0]; if (t) onSwipeStart(t.clientX, t.clientY); }}
            onTouchMove={(e) => { const t = e.touches[0]; if (t) onMove(t.clientX, t.clientY); }}
            onTouchEnd={(e) => { const t = e.changedTouches[0]; if (t) onSwipeEnd(t.clientX, t.clientY); reset(); }}
            style={{
              position: 'relative', width: 318, transformStyle: 'preserve-3d',
              transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilt.scale})`,
              transition: cardMotion(tilt.phase, ['transform']),
              cursor: 'pointer',
            }}
          >
            <div aria-hidden="true" style={{
              position: 'absolute', inset: -8, borderRadius: 26, background: pal.glow,
              filter: 'blur(22px)', opacity: 0.28 + tilt.lift * 0.22,
              transition: cardMotion(tilt.phase, ['opacity']),
              pointerEvents: 'none',
            }}/>

            {/* 뒤집기 레이어에 filter 를 걸면 3D 컨텍스트가 평면으로 눌려
                backface-visibility 가 무시된다 — 뒷면 대신 앞면이 거울상으로 보인다.
                그림자는 각 면의 box-shadow 로 준다. */}
            <div style={{
              position: 'relative', transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
              {/* ─── 앞면 ─── */}
              <div style={{
                borderRadius: 18, overflow: 'hidden', backfaceVisibility: 'hidden',
                background: `linear-gradient(160deg, ${pal.bgFrom} 0%, ${RF.card} 46%, ${RF.card} 100%)`,
                border: `2px solid ${pal.border}`, ...faceShadow,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px 7px' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 900, color: T.text900, flex: 1, letterSpacing: '-0.2px' }}>
                    {subject.nickname}
                  </div>
                  {subject.tripCount != null && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'baseline', gap: 2, height: 22, padding: '0 9px',
                      borderRadius: 999, background: pal.chipBg, border: `1px solid ${pal.frame}`,
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 900, color: pal.chipText, fontVariantNumeric: 'tabular-nums' }}>
                        {subject.tripCount}
                      </span>
                      <span style={{ fontSize: 9.5, fontWeight: 800, color: pal.chipText }}>회 동행</span>
                    </div>
                  )}
                </div>

                {/* 프로필 이미지는 1:1 이므로 정사각형 프레임에 꽉 채운다 */}
                <div style={{
                  position: 'relative', margin: '0 12px', aspectRatio: '1 / 1', borderRadius: 12, overflow: 'hidden',
                  border: `2px solid ${pal.frame}`, background: pal.plate,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {subject.profileImageUrl
                    ? <img src={subject.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    : <ProfileCardAvatar nickname={subject.nickname} fallbackKind={subject.kind}/>}
                  <ProfileCardFoil x={tilt.x} y={tilt.y} shine={tilt.shine} phase={tilt.phase}/>
                </div>

                <div style={{ padding: '10px 14px 13px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {subject.mannerRating != null && metaRow('매너 점수', `${subject.mannerRating}점`)}
                  {stats.length > 0 && (
                    <div style={{
                      display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
                      borderRadius: 10, overflow: 'hidden',
                      border: `1px solid ${pal.frame}`, background: pal.plate,
                    }}>
                      {stats.map((st, i) => (
                        <div key={st[0]} style={{
                          padding: '6px 0', textAlign: 'center',
                          borderRight: i < stats.length - 1 ? `1px solid ${pal.frame}` : 'none',
                        }}>
                          <div style={{ fontSize: 9, color: T.text500, fontWeight: 800 }}>{st[0]}</div>
                          <div style={{ fontSize: 13, fontWeight: 900, marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>{st[1]}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {subject.latestTripTitle && metaRow('최근 동행', `${subject.latestTripTitle} · ${subject.latestTripDate}`)}

                  {subject.introduction && (
                    <div style={{
                      marginTop: 1, padding: '8px 10px', borderRadius: 9, background: T.bgSubtle,
                      border: `1px solid ${RF.softLine}`, fontSize: 11, lineHeight: '17px', color: T.text700,
                    }}>{subject.introduction}</div>
                  )}

                  {subject.travelStyles.length > 0 && (
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {subject.travelStyles.map((st) => (
                        <span key={st} style={{
                          height: 21, padding: '0 8px', borderRadius: 999, display: 'inline-flex', alignItems: 'center',
                          background: pal.chipBg, color: pal.chipText, border: `1px solid ${pal.frame}`,
                          fontSize: 10, fontWeight: 800,
                        }}>{st}</span>
                      ))}
                    </div>
                  )}

                  {(subject.memories.length > 0 || subject.receivedReviews.length > 0) && (
                    <div style={{
                      marginTop: 2, paddingTop: 8, borderTop: `1px solid ${RF.softLine}`,
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: 10, fontWeight: 800, color: T.text500,
                    }}>
                      <Icon name="arrow" size={12} color={T.text400}/>
                      옆으로 밀면 함께한 여행과 평가를 볼 수 있어요
                    </div>
                  )}
                </div>
              </div>

              {/* ─── 뒷면 ─── */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 18, overflow: 'hidden',
                backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
                background: `linear-gradient(200deg, ${pal.bgFrom} 0%, ${RF.card} 50%, ${RF.card} 100%)`,
                border: `2px solid ${pal.border}`, ...faceShadow,
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px 7px' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 900, color: T.text900, flex: 1, letterSpacing: '-0.2px' }}>
                    {subject.nickname}
                  </div>
                  <div style={{ fontSize: 9.5, fontWeight: 800, color: T.text500 }}>카드 뒷면</div>
                </div>

                <div style={{ flex: 1, overflow: 'auto', padding: '0 14px 12px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {subject.mannerRating != null && (
                    <div style={{
                      display: 'flex', alignItems: 'baseline', gap: 6, padding: '9px 11px', borderRadius: 10,
                      background: pal.chipBg, border: `1px solid ${pal.frame}`,
                    }}>
                      <div style={{ fontSize: 19, fontWeight: 900, color: pal.chipText, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                        {subject.mannerRating}
                      </div>
                      <div style={{ fontSize: 10.5, fontWeight: 800, color: pal.chipText }}>점</div>
                      <div style={{ fontSize: 10, color: T.text500, fontWeight: 700, marginLeft: 'auto' }}>동행자들이 준 평균</div>
                    </div>
                  )}

                  {subject.memories.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: T.text500, marginBottom: 5 }}>함께한 여행</div>
                      {subject.memories.map((m) => (
                        <div key={m.tripTitle} style={{
                          marginBottom: 6, padding: '8px 10px', borderRadius: 9,
                          background: T.bgSubtle, border: `1px solid ${RF.softLine}`,
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: T.text900 }}>
                            {m.tripTitle} <span style={{ color: T.text500, fontWeight: 600 }}>· {m.tripDate}</span>
                          </div>
                          {m.oneLineReview
                            ? <div style={{ fontSize: 10.5, lineHeight: '16px', color: T.text700, marginTop: 3 }}>내 메시지 "{m.oneLineReview}"</div>
                            : <div style={{ fontSize: 10, color: T.text500, marginTop: 3 }}>메시지를 남기지 않았어요</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 받은 게 없으면 섹션을 만들지 않는다.
                      도감의 oneLineReview 는 "내가 남긴" 값이라 여기 섞으면 안 된다. */}
                  {subject.receivedReviews.length > 0 && (
                    <div style={{ paddingTop: 9, borderTop: `1px solid ${RF.softLine}` }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: T.text500, marginBottom: 6 }}>
                        다른 여행자들이 남긴 평가
                      </div>
                      {subject.receivedReviews.map((r) => (
                        <div key={r.reviewerNickname + r.content} style={{ marginBottom: 8, display: 'flex', gap: 7 }}>
                          {/* 강조선은 남긴 사람의 색 — 카드 주인 색과 헷갈리지 않게 */}
                          <div style={{
                            width: 3, borderRadius: 2, flexShrink: 0,
                            background: userCardPalette(r.reviewerNicknameColor).border,
                          }}/>
                          <div>
                            <div style={{ fontSize: 11, lineHeight: '17px', color: T.text700 }}>"{r.content}"</div>
                            <div style={{ fontSize: 9.5, color: T.text500, marginTop: 2, fontWeight: 700 }}>
                              {r.reviewerNickname}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 스와이프로도 뒤집히지만, 뒤집을 수 있다는 걸 알 방법이 필요해 버튼도 둔다 */}
        <div style={{ padding: '0 20px 28px', display: 'flex', gap: 8 }}>
          <Btn variant="ghost" onClick={() => setFlipped((v) => !v)}>{flipped ? '앞면' : '뒤집기'}</Btn>
          {/* DM 기획이 없다 — 여기서 할 수 있는 행동은 친구 신청뿐이다.
              (차단·신고는 20-1a 멤버 액션처럼 대상이 확실한 경로에서만 연다) */}
          <div style={{ flex: 1 }}>
            <Btn variant="primary" full>친구 신청</Btn>
          </div>
        </div>
      </div>
    </Phone>
  );
}


Object.assign(window, {
  ScreenFeedWrite, ScreenFeedWriteStep1, ScreenFeedWriteStep2, ScreenFeedWriteStep3, ScreenFeedWriteStep4, ScreenFeedWriteStep5,
  ScreenDex, ScreenProfileEdit, ProfileEditBody, ScreenProfileTasteEdit, ScreenSettings, ScreenAuthMethods, ScreenPublicProfile,
  MOYEO_USER_COLORS, userCardPalette,
});

// ─── window export ───
Object.assign(window, { ScreenFeedWrite, ScreenFeedWriteStep1, ScreenFeedWriteStep2, ScreenFeedWriteStep3, ScreenFeedWriteStep4, ScreenFeedWriteStep5, ScreenDex, ScreenProfileEdit, ScreenProfileTasteEdit, ScreenSettings, ScreenAuthMethods, ScreenPublicProfile });
