// 화면 감사(2026-08-17)에서 드러난 빈칸을 메우는 화면 모음
//
// (1) 모집 생성 Step 3 인원 / Step 4 세부 — 5단계 중 비어 있던 두 칸
// (2) 채팅방 사이드 메뉴 · 첨부 메뉴 — 특수 메시지 6종의 유일한 진입 경로
// (3) 친구 관리 — 도감과 별개인 '친구 신청/수락' 관계 화면
// (4) 여행 후 한 줄 메시지 — 도감 카드 뒷면을 채우는 시그니처 모먼트
// (5) 신고 시트 — 4개 진입점 공통
//
// screens-additions.jsx 뒤에 로드되어 Phone/Header/Btn/Chip/AddStepDots 등을 그대로 쓴다.

// ───────── 17-6 · 모집 만들기 Step 3 — 인원 ─────────
function ScreenCreatePeople() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const [min, setMin] = React.useState(3);
  const [max, setMax] = React.useState(5);
  const [gender, setGender] = React.useState('all');

  const mood = max <= 4
    ? { text: '말 트기 좋은 작은 그룹이에요', tone: 'ok' }
    : max <= 8
      ? { text: '단체 사진 예쁘게 나오는 최적 인원이에요', tone: 'ok' }
      : { text: '9명 이상은 친목이 쉽지 않을 수 있어요', tone: 'warn' };

  const Stepper = ({ label, value, onMinus, onPlus, hint }) => (
    <div>
      <AddFieldLabel required>{label}</AddFieldLabel>
      <div style={{
        height: 48, borderRadius: 12, border: `1px solid ${T.line200}`, background: RF.card,
        display: 'flex', alignItems: 'center', padding: '0 8px', gap: 8,
      }}>
        <button type="button" onClick={onMinus} style={{ width: 32, height: 32, borderRadius: 999, border: `1px solid ${T.line200}`, background: RF.card, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="minus" size={15} color={T.text700}/>
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{value}명</div>
        <button type="button" onClick={onPlus} style={{ width: 32, height: 32, borderRadius: 999, border: 'none', background: T.primary500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="plus" size={15} color="#fff"/>
        </button>
      </div>
      {hint && <div style={{ fontSize: 11, color: T.text500, marginTop: 6 }}>{hint}</div>}
    </div>
  );

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="모집 만들기 (3/5)" left center onBack={nav.back}/>
        <AddStepDots active={2}/>

        <div style={{ position: 'absolute', top: 148, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '0 20px 20px' }}>
          <div style={{ fontSize: 15, fontWeight: 900 }}>몇 명이 모이면 좋을까요?</div>
          <div style={{ fontSize: 12, color: T.text500, marginTop: 6 }}>최소 인원은 3명부터예요. 낯선 사람과 단둘이 되는 일은 생기지 않아요.</div>

          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Stepper
              label="최소 인원"
              value={min}
              onMinus={() => setMin((v) => Math.max(3, v - 1))}
              onPlus={() => setMin((v) => Math.min(max - 1, v + 1))}
              hint="3명 미만은 선택할 수 없어요"
            />
            <Stepper
              label="최대 인원"
              value={max}
              onMinus={() => setMax((v) => Math.max(min + 1, v - 1))}
              onPlus={() => setMax((v) => Math.min(20, v + 1))}
              hint="최대 20명까지"
            />
          </div>

          {/* 인원 프로그레스바 미리보기 — 서비스 시그니처 컴포넌트 그대로 */}
          <div style={{ marginTop: 16, padding: 14, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, marginBottom: 9 }}>
              <span>모집 카드에는 이렇게 보여요</span>
              <span style={{ color: T.text400, fontVariantNumeric: 'tabular-nums' }}>{min} / {max}명 · 최소 충족</span>
            </div>
            <ProgressBar current={min} max={max} min={min}/>
            <div style={{
              marginTop: 14, fontSize: 12, fontWeight: 800,
              color: mood.tone === 'warn' ? T.warningText : T.primary700,
            }}>{mood.text}</div>
          </div>

          <div style={{ marginTop: 22 }}>
            <AddFieldLabel>성별 제한</AddFieldLabel>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { id: 'all', label: '제한 없음' },
                { id: 'female', label: '여성만' },
                { id: 'male', label: '남성만' },
              ].map((g) => {
                const on = gender === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGender(g.id)}
                    style={{
                      flex: 1, height: 42, borderRadius: 12, cursor: 'pointer', fontFamily: T.fontStack,
                      fontSize: 13, fontWeight: 800,
                      border: `1px solid ${on ? T.primary500 : T.line200}`,
                      background: on ? T.primary50 : RF.card,
                      color: on ? T.primary700 : T.text700,
                    }}>{g.label}</button>
                );
              })}
            </div>
            {gender !== 'all' && (
              <div style={{ fontSize: 11, color: T.text500, marginTop: 7 }}>수락되는 인원은 같은 성별로 한정돼요.</div>
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <AddFieldLabel>나이대 제한</AddFieldLabel>
            <AddFieldBox icon="users" value="25 ~ 35세" chevron caption="최소·최대 모두 20~100세 사이에서 정할 수 있어요. 조건에 맞지 않는 사용자에게는 신청 버튼이 비활성으로 보여요."/>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8 }}>
          <Btn variant="ghost" onClick={nav.back}>이전</Btn>
          <div style={{ flex: 1 }}><Btn variant="primary" full onClick={() => nav.go('create-detail')}>다음</Btn></div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 17-7 · 모집 만들기 Step 4 — 세부 정보 ─────────
function ScreenCreateDetail() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const [approval, setApproval] = React.useState('auto');
  // 키워드 추천 칩은 스펙아웃 — 자동 추출 근거가 없어 화면기획에서 삭제됐다
  const [intro] = React.useState('느긋하게 걷고 사진 많이 찍는 여행이에요. 처음이셔도 편하게 오세요!');

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="모집 만들기 (4/5)" left center onBack={nav.back}/>
        <AddStepDots active={3}/>

        <div style={{ position: 'absolute', top: 148, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '0 20px 20px' }}>
          <div style={{ fontSize: 15, fontWeight: 900 }}>어떤 여행인지 알려주세요</div>
          <div style={{ fontSize: 12, color: T.text500, marginTop: 6 }}>신청 전에 가장 많이 읽는 부분이에요.</div>

          <div style={{ marginTop: 16 }}>
            <AddFieldLabel>코스</AddFieldLabel>
            <div style={{ height: 48, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: T.bgSubtle, display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px' }}>
              <Icon name="map" size={17} color={T.text400}/>
              <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 800, color: T.text500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>주왕산 &amp; 주산지 힐링 트레킹</span>
              <Icon name="lock" size={14} color={T.text400}/>
            </div>
            <div style={{ fontSize: 11, color: T.text500, marginTop: 6 }}>Step 1에서 고른 코스 이름이에요. 여기서는 바꿀 수 없어요.</div>
          </div>

          <div style={{ marginTop: 20 }}>
            <AddFieldLabel required>모집 이름 (채팅방 이름)</AddFieldLabel>
            <AddFieldBox icon="users" value="30대끼리 느긋하게 힐링 여행가요~" chevron={false} caption="어떤 사람들과 어떻게 가고 싶은지를 담아요. 채팅방 이름으로도 쓰여요."/>
          </div>

          <div style={{ marginTop: 20 }}>
            <AddFieldLabel>소개글</AddFieldLabel>
            <div style={{
              minHeight: 96, borderRadius: 12, border: `1px solid ${T.line200}`, background: RF.card,
              padding: 13, fontSize: 13, lineHeight: '20px', color: T.text900,
            }}>{intro}</div>
            <div style={{ textAlign: 'right', fontSize: 11, color: T.text400, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>{intro.length}/500</div>
          </div>

          <div style={{ marginTop: 12 }}>
            <AddFieldLabel>예상 1인당 비용</AddFieldLabel>
            <AddFieldBox icon="money" value="45,000원" chevron={false} caption="TourAPI 기준 이 코스는 보통 4~5만원 내외예요. 참고용으로만 보여줘요."/>
          </div>

          <div style={{ marginTop: 20 }}>
            <AddFieldLabel required>신청 승인 방식</AddFieldLabel>
            <div style={{ display: 'grid', gap: 8 }}>
              {[
                { id: 'auto', title: '자동 승인', desc: '조건에 맞으면 바로 합류해요. 모임이 빨리 채워져요.' },
                { id: 'manual', title: '수동 승인', desc: '한마디와 매너 점수를 보고 호스트가 직접 수락해요.' },
              ].map((o) => {
                const on = approval === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setApproval(o.id)}
                    style={{
                      width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: T.fontStack,
                      borderRadius: 12, padding: 13, display: 'flex', gap: 11, alignItems: 'flex-start',
                      border: `1.5px solid ${on ? T.primary500 : RF.softLine}`,
                      background: on ? T.primary50 : RF.card,
                    }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 999, marginTop: 1, flexShrink: 0,
                      border: `1.5px solid ${on ? T.primary500 : T.line300}`,
                      background: on ? T.primary500 : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {on && <Icon name="check" size={12} color="#fff" strokeWidth={3}/>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: on ? T.primary700 : T.text900 }}>{o.title}</div>
                      <div style={{ fontSize: 11.5, color: T.text500, marginTop: 4, lineHeight: '17px' }}>{o.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            {approval === 'manual' && (
              <div style={{ marginTop: 10 }}>
                <AddInfoBanner tone="warning">48시간 안에 응답하지 않은 신청은 자동으로 거절돼요. 신청자에게 이유는 보이지 않아요.</AddInfoBanner>
              </div>
            )}
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8 }}>
          <Btn variant="ghost" onClick={nav.back}>이전</Btn>
          {/* 등록된 코스로 만든 모집은 링크된 요약(17-7)으로 간다 */}
          <div style={{ flex: 1 }}><Btn variant="primary" full onClick={() => nav.go((window.__moyeoCourseSource || 'custom') === 'linked' ? 'create-summary-linked' : 'create-summary')}>다음</Btn></div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 20-3 · 채팅방 사이드 메뉴 ─────────
function ScreenChatMenu() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const members = [
    { k: 'bear', n: '숲속여행자', role: '호스트' },
    { k: 'deer', n: '따스한 사슴 3492', role: '나' },
    { k: 'rabbit', n: '엉뚱한 토끼 1457', role: null },
    { k: 'turtle', n: '잔잔한 거북이 9032', role: null },
    { k: 'raccoon', n: '호기심 많은 너구리 9027', role: null },
  ];
  const Row = ({ icon, label, sub, onClick, danger, right }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%', height: 52, border: 'none', background: 'transparent', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 11, padding: '0 20px', fontFamily: T.fontStack, textAlign: 'left',
      }}>
      <Icon name={icon} size={19} color={danger ? T.danger : T.text700}/>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: danger ? T.danger : T.text900 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: T.text500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right || <Icon name="arrow" size={15} color={T.text400}/>}
    </button>
  );

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="모임 정보" left center onBack={nav.back}/>

        <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 0, overflow: 'auto', paddingBottom: 24 }}>
          {/* 모임 요약 */}
          <div style={{ padding: '4px 20px 16px', borderBottom: `8px solid ${T.bgSubtle}` }}>
            <div style={{ fontSize: 15, fontWeight: 900 }}>30대끼리 느긋하게 힐링 여행가요~</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, fontSize: 12, color: T.text500 }}><Icon name="map" size={13} color={T.text500}/><b>주왕산 &amp; 주산지 힐링 트레킹</b></div>
            <div style={{ fontSize: 12, color: T.text500, marginTop: 5, fontVariantNumeric: 'tabular-nums' }}>5/25(토) 당일치기 · 08:00 – 18:00</div>
            <div style={{ fontSize: 12, color: T.text500, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>07:50 청송 시외버스터미널 정문 앞 집합</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {['1인 45,000원', '마감 D-3', '25~35세', '성별 무관'].map((condition) => <Chip key={condition} variant={condition === '마감 D-3' ? 'accent' : 'neutral'}>{condition}</Chip>)}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Btn variant="secondary" style={{ height: 40, flex: 1 }} onClick={() => nav.go('detail')}>모집 상세</Btn>
              <Btn variant="secondary" style={{ height: 40, flex: 1 }} onClick={() => nav.go('course-edit')}>여행 경로</Btn>
            </div>
          </div>

          {/* 동행자 */}
          <div style={{ padding: '16px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 900 }}>동행자 <span style={{ color: T.text400, fontVariantNumeric: 'tabular-nums' }}>{members.length}</span></div>
            <span style={{ fontSize: 11.5, color: T.text500 }}>최대 5명 · 대기 1명</span>
          </div>
          <div style={{ padding: '0 20px' }}>
            {members.map((m) => (
              <div key={m.n} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0' }}>
                <AnimalAvatar kind={m.k} size={38} bg={T.primary50}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.n}</div>
                  <div style={{ fontSize: 11, color: T.text500, marginTop: 2 }}>매너 4.8 · 여행 8회</div>
                </div>
                {m.role
                  ? <Chip variant={m.role === '호스트' ? 'soft' : 'neutral'}>{m.role}</Chip>
                  : <IconButton name="more" size={18}/>}
              </div>
            ))}
            <div style={{ fontSize: 11, color: T.text400, marginTop: 6, lineHeight: '17px' }}>
              호스트는 멤버 우측 ⋯ 에서 <b>내보내기</b>를 할 수 있어요 (사유 선택 필수). 내보낸 자리는 대기 큐에서 자동으로 채워져요.
            </div>
          </div>

          <div style={{ height: 8, background: T.bgSubtle, margin: '16px 0 8px' }}/>

          <Row icon="note" label="공지" sub="고정 2개 · 전체 4개" onClick={() => nav.go('notice-history')}/>
          <Row icon="camera" label="공유된 항목" sub="사진 12 · 장소 4 · 투표 2" onClick={() => nav.go('msgs')}/>
          <Row icon="bell" label="알림 설정" sub="이 모임의 알림만 끄기" onClick={() => nav.go('notif-detail')} right={<div style={{ width: 40, height: 24, borderRadius: 999, background: T.primary500, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: 2 }}><div style={{ width: 20, height: 20, borderRadius: 999, background: '#fff' }}/></div>}/>
          <Row icon="flag" label="신고 · 차단" sub="부적절한 대화나 멤버를 신고해요" onClick={() => nav.go('report')}/>

          <div style={{ height: 8, background: T.bgSubtle, margin: '8px 0' }}/>

          <Row icon="close" label="채팅방 나가기" sub="나가면 대기 중인 다음 신청자가 자동으로 합류해요" danger onClick={() => nav.go('leave-alert')}/>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 20-4 · 첨부 메뉴 (특수 메시지 진입) ─────────
function ScreenChatAttach() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const items = [
    { icon: 'camera', label: '사진', desc: '최대 20MB · 1장씩 전송' },
    { icon: 'pin', label: '장소', desc: 'TourAPI 장소 카드' },
    { icon: 'map', label: '지도', desc: '만날 위치 핀 공유' },
    { icon: 'poll', label: '투표', desc: '2~5개 · 익명 기본' },
    { icon: 'money', label: '정산', desc: '메모용 · 송금 아님' },
    { icon: 'note', label: '메모', desc: '상단 고정 공지 (호스트)' },
  ];
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: T.bgOverlay }}/>
        {/* 딤 뒤로 비치는 채팅 버블 실루엣 */}
        <div style={{ position: 'absolute', top: 92, left: 0, right: 0, bottom: 300, opacity: 0.22, pointerEvents: 'none', padding: '0 18px', display: 'grid', gap: 12, alignContent: 'start' }}>
          {[{ w: 168, me: false }, { w: 132, me: true }, { w: 196, me: false }, { w: 108, me: true }].map((b, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: b.me ? 'flex-end' : 'flex-start' }}>
              <div style={{ width: b.w, height: 38, borderRadius: 16, background: b.me ? T.primary500 : T.line300 }}/>
            </div>
          ))}
        </div>

        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: RF.card, borderRadius: '24px 24px 0 0', padding: '10px 20px 32px',
          boxShadow: T.l3,
        }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: T.line300, margin: '0 auto 18px' }}/>
          <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 4 }}>무엇을 공유할까요?</div>
          <div style={{ fontSize: 11.5, color: T.text500 }}>일반 메시지와 달리 카드로 크게 보여요.</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
            {items.map((it) => (
              <button
                key={it.label}
                type="button"
                onClick={() => nav.go('msgs')}
                style={{
                  height: 104, borderRadius: 14, border: `1px solid ${RF.softLine}`, background: RF.bg,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7,
                  cursor: 'pointer', fontFamily: T.fontStack, padding: 8,
                }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: T.primary50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={it.icon} size={21} color={T.primary600}/>
                </div>
                <div style={{ fontSize: 12, fontWeight: 800 }}>{it.label}</div>
                <div style={{ fontSize: 9.5, color: T.text500, textAlign: 'center', lineHeight: '13px' }}>{it.desc}</div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <Btn variant="ghost" full onClick={nav.back}>닫기</Btn>
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 27-2 · 친구 관리 ─────────
function ScreenFriends() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const [tab, setTab] = React.useState('mine');
  const mine = [
    { k: 'bear', n: '우직한 곰 7821', sub: '함께 여행 3회 · 어제 접속' },
    { k: 'rabbit', n: '엉뚱한 토끼 1457', sub: '함께 여행 1회 · 3일 전 접속' },
    { k: 'turtle', n: '잔잔한 거북이 9032', sub: '함께 여행 2회 · 오늘 접속' },
  ];
  const received = [
    { k: 'raccoon', n: '호기심 많은 너구리 9027', sub: '포항·영덕 드라이브에서 만났어요' },
    { k: 'crane', n: '고요한 두루미 1130', sub: '경주 단풍·야경에서 만났어요' },
  ];
  const sent = [
    { k: 'deer', n: '따스한 사슴 3492', sub: '어제 신청 · 수락 대기 중' },
  ];
  const list = tab === 'mine' ? mine : tab === 'received' ? received : sent;

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="친구 관리" left center onBack={nav.back} right={<IconButton name="search"/>}/>

        <div style={{ padding: '0 20px', display: 'flex', gap: 20, borderBottom: `1px solid ${RF.softLine}` }}>
          {[
            { id: 'mine', label: '내 친구', count: mine.length },
            { id: 'received', label: '받은 신청', count: received.length },
            { id: 'sent', label: '보낸 신청', count: sent.length },
          ].map((t) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                style={{
                  padding: '12px 0', marginBottom: -1, border: 'none', background: 'transparent', cursor: 'pointer',
                  borderBottom: on ? `2px solid ${T.primary500}` : '2px solid transparent', fontFamily: T.fontStack,
                }}>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: on ? T.primary600 : T.text500 }}>{t.label}</span>
                <span style={{ fontSize: 12, color: on ? T.primary500 : T.text400, marginLeft: 4, fontVariantNumeric: 'tabular-nums' }}>{t.count}</span>
              </button>
            );
          })}
        </div>

        <div style={{ position: 'absolute', top: 126, left: 0, right: 0, bottom: 0, overflow: 'auto', padding: '6px 0 24px' }}>
          {tab === 'received' && (
            <div style={{ padding: '10px 20px 4px', fontSize: 11.5, color: T.text500 }}>
              거절해도 상대방에게는 알려지지 않아요.
            </div>
          )}
          {list.map((f) => (
            <div key={f.n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px' }}>
              <div onClick={() => nav.go('public-profile')} style={{ cursor: 'pointer' }}>
                <AnimalAvatar kind={f.k} size={44} bg={T.primary50}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.n}</div>
                <div style={{ fontSize: 11.5, color: T.text500, marginTop: 3 }}>{f.sub}</div>
              </div>
              {tab === 'mine' && <IconButton name="more" size={18}/>}
              {tab === 'received' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" style={{ height: 34, padding: '0 12px', borderRadius: 10, border: `1px solid ${T.line200}`, background: 'transparent', color: T.text700, fontSize: 12, fontWeight: 800, fontFamily: T.fontStack, cursor: 'pointer' }}>거절</button>
                  <button type="button" style={{ height: 34, padding: '0 14px', borderRadius: 10, border: 'none', background: T.primary500, color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: T.fontStack, cursor: 'pointer' }}>수락</button>
                </div>
              )}
              {tab === 'sent' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', height: 30, padding: '0 11px', borderRadius: 999, background: T.line100, color: T.text500, fontSize: 11.5, fontWeight: 800 }}>요청 중</span>
              )}
            </div>
          ))}

          <div style={{ margin: '18px 20px 0', padding: 13, borderRadius: 12, background: T.primary50, border: `1px solid ${T.primary100}`, display: 'flex', gap: 9, alignItems: 'flex-start' }}>
            <Icon name="bookmark" size={16} color={T.primary700}/>
            <div style={{ flex: 1, fontSize: 11.5, lineHeight: '17px', color: T.primary700 }}>
              함께 여행한 친구는 <b>친구가 아니어도 도감에 남아요.</b> 친구 신청은 피드를 구독하고 싶을 때만 하면 돼요.
              <span onClick={() => nav.go('dex')} style={{ display: 'block', marginTop: 6, fontWeight: 800, cursor: 'pointer' }}>도감 열어보기 →</span>
            </div>
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 27-3 · 여행 후 한 줄 메시지 (도감 카드 뒷면) ─────────
function ScreenTripMessage() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const mates = [
    { k: 'bear', n: '우직한 곰 7821', done: true, msg: '핑크뮬리 사진 잘 찍어주셔서 고마워요!' },
    { k: 'rabbit', n: '엉뚱한 토끼 1457', done: false, msg: '' },
    { k: 'turtle', n: '잔잔한 거북이 9032', done: false, msg: '' },
  ];
  const presets = ['덕분에 즐거웠어요', '사진 고마워요!', '다음에도 잘 부탁드려요'];

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="여행 마무리" left center onBack={nav.back}/>

        <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '10px 20px 20px' }}>
          <div style={{ fontSize: 17, fontWeight: 900, lineHeight: '25px' }}>함께 걸어준 친구들에게<br/>한 줄 남겨볼까요?</div>
          <div style={{ fontSize: 12, color: T.text500, marginTop: 8, lineHeight: '18px' }}>
            남긴 메시지는 상대방의 <b>도감 카드 뒷면</b>에 적혀요. 안 남겨도 카드는 그대로 모여요.
          </div>

          <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
            {mates.map((m) => (
              <div key={m.n} style={{
                borderRadius: 14, border: `1px solid ${m.done ? T.primary100 : RF.softLine}`,
                background: m.done ? T.primary50 : RF.card, padding: 13,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AnimalAvatar kind={m.k} size={40} bg={m.done ? RF.card : T.primary50}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.n}</div>
                    <div style={{ fontSize: 11, color: T.text500, marginTop: 2 }}>{m.done ? '메시지를 남겼어요' : '아직 안 남겼어요'}</div>
                  </div>
                  {m.done && <Icon name="check" size={17} color={T.primary600} strokeWidth={3}/>}
                </div>
                <div style={{
                  marginTop: 10, minHeight: 44, borderRadius: 10, padding: '11px 12px',
                  border: `1px solid ${m.done ? T.primary100 : T.line200}`,
                  background: m.done ? RF.card : T.bgSubtle,
                  fontSize: 12.5, lineHeight: '18px',
                  color: m.done ? T.text900 : T.text400,
                }}>{m.msg || '한 줄 메시지를 남겨주세요 (최대 40자)'}</div>
                {!m.done && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {presets.map((p) => (
                      <span key={p} style={{
                        height: 28, padding: '0 10px', borderRadius: 999, display: 'inline-flex', alignItems: 'center',
                        border: `1px solid ${T.line200}`, background: RF.card, color: T.text700, fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                      }}>{p}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <AddInfoBanner>
              메시지를 남기면 서로의 도감 카드가 완성돼요. 가끔 도감을 펼쳐 보면 그날의 여행이 다시 떠올라요.
            </AddInfoBanner>
          </div>

          <div style={{ marginTop: 14, padding: 13, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card, display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: T.primary50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="feed" size={18} color={T.primary600}/>
            </div>
            <div style={{ flex: 1, fontSize: 12, color: T.text700, lineHeight: '17px' }}>
              경로가 담긴 <b>피드</b>도 이어서 써볼까요?
            </div>
            <span onClick={() => nav.go('feed-write')} style={{ fontSize: 12, fontWeight: 800, color: T.primary600, cursor: 'pointer' }}>피드 쓰기 →</span>
          </div>

          {/* 호스트에게만 — 다녀온 코스를 다른 여행자에게 열어두는 선택. 한 번만 조용히 권한다 */}
          <div style={{ marginTop: 10, padding: 13, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card, display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: T.primary50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="map" size={18} color={T.primary600}/>
            </div>
            <div style={{ flex: 1, fontSize: 12, color: T.text700, lineHeight: '17px' }}>
              이 <b>코스</b>를 다른 여행자에게 열어둘 수도 있어요
            </div>
            <span onClick={() => nav.go('course-publish')} style={{ fontSize: 12, fontWeight: 800, color: T.primary600, cursor: 'pointer' }}>코스 공개 →</span>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8 }}>
          <Btn variant="ghost" onClick={() => nav.go('dex')}>나중에</Btn>
          <div style={{ flex: 1 }}><Btn variant="primary" full onClick={() => nav.go('dex')}>메시지 남기고 도감 보기</Btn></div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 30-2 · 신고 시트 (4개 진입점 공통) ─────────
function ScreenReportSheet() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const [reason, setReason] = React.useState('harass');
  const [block, setBlock] = React.useState(true);
  const reasons = [
    { id: 'spam', label: '스팸 · 도박' },
    { id: 'harass', label: '성희롱 · 불쾌한 언행' },
    { id: 'money', label: '돈거래 유도' },
    { id: 'fake', label: '허위 정보' },
    { id: 'bad', label: '부적절한 내용' },
    { id: 'etc', label: '기타' },
  ];

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: T.bgOverlay }}/>

        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: RF.card, borderRadius: '24px 24px 0 0', padding: '10px 20px 32px', boxShadow: T.l3,
        }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: T.line300, margin: '0 auto 16px' }}/>
          <div style={{ fontSize: 15, fontWeight: 900 }}>신고 사유를 알려주세요</div>

          {/* 진입점에 따라 이 미리보기 영역만 달라진다 */}
          <div style={{ marginTop: 12, padding: 11, borderRadius: 10, background: T.bgSubtle, border: `1px solid ${RF.softLine}`, display: 'flex', gap: 9, alignItems: 'center' }}>
            <Icon name="chat" size={15} color={T.text500}/>
            <div style={{ flex: 1, fontSize: 12, color: T.text700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              해당 메시지 · <span style={{ color: T.text500 }}>“계좌로 먼저 보내주시면…”</span>
            </div>
          </div>

          <div style={{ marginTop: 14, display: 'grid', gap: 6 }}>
            {reasons.map((r) => {
              const on = reason === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setReason(r.id)}
                  style={{
                    height: 46, borderRadius: 11, cursor: 'pointer', fontFamily: T.fontStack, textAlign: 'left',
                    border: `1px solid ${on ? T.primary500 : RF.softLine}`,
                    background: on ? T.primary50 : RF.bg,
                    display: 'flex', alignItems: 'center', gap: 10, padding: '0 13px',
                  }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 999,
                    border: `1.5px solid ${on ? T.primary500 : T.line300}`,
                    background: on ? T.primary500 : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {on && <Icon name="check" size={11} color="#fff" strokeWidth={3}/>}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: on ? 800 : 600, color: on ? T.primary700 : T.text900 }}>{r.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setBlock((v) => !v)}
            style={{
              width: '100%', marginTop: 12, height: 46, borderRadius: 11, cursor: 'pointer', fontFamily: T.fontStack,
              border: `1px solid ${RF.softLine}`, background: RF.bg, display: 'flex', alignItems: 'center', gap: 10, padding: '0 13px',
            }}>
            <div style={{
              width: 18, height: 18, borderRadius: 5,
              border: `1.5px solid ${block ? T.primary500 : T.line300}`,
              background: block ? T.primary500 : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {block && <Icon name="check" size={11} color="#fff" strokeWidth={3}/>}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text900 }}>이 유저를 차단할게요</span>
          </button>
          {block && (
            <div style={{ fontSize: 11, color: T.text500, marginTop: 7, lineHeight: '16px' }}>
              차단하면 이 유저가 만들었거나 참여한 모집이 홈·탐색에서 모두 숨겨져요.
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Btn variant="ghost" onClick={nav.back}>취소</Btn>
            <div style={{ flex: 1 }}><Btn variant="danger" full onClick={nav.back}>신고하기</Btn></div>
          </div>
          <div style={{ fontSize: 11, color: T.text400, textAlign: 'center', marginTop: 10 }}>24시간 이내에 검토해 드릴게요.</div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 29-2 · 차단한 사용자 ─────────
function ScreenBlocked() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const blocked = [
    { k: 'raccoon', n: '말많은 너구리 7791', at: '2026.07.28 차단', why: '채팅방에서 신고와 함께 차단' },
    { k: 'crane', n: '청아한 두루미 2024', at: '2026.06.02 차단', why: '프로필에서 차단' },
  ];
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="차단한 사용자" left center onBack={nav.back}/>
        <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 0, overflow: 'auto', paddingBottom: 24 }}>
          <div style={{ margin: '10px 20px 14px', padding: 13, borderRadius: 12, background: T.bgSubtle, border: `1px solid ${RF.softLine}`, fontSize: 11.5, lineHeight: '17px', color: T.text700 }}>
            차단하면 그 사람이 <b>만들었거나 참여한 모집</b>이 홈·탐색·코스 상세에서 모두 숨겨져요. 상대방에게는 알려지지 않아요.
          </div>
          {blocked.map((b) => (
            <div key={b.n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px' }}>
              <AnimalAvatar kind={b.k} size={42} bg={T.bgSubtle}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800 }}>{b.n}</div>
                <div style={{ fontSize: 11, color: T.text500, marginTop: 3 }}>{b.at} · {b.why}</div>
              </div>
              <button type="button" style={{ height: 32, padding: '0 12px', borderRadius: 10, border: `1px solid ${T.line200}`, background: 'transparent', color: T.text700, fontSize: 12, fontWeight: 800, fontFamily: T.fontStack, cursor: 'pointer' }}>차단 해제</button>
            </div>
          ))}
          <div style={{ margin: '16px 20px 0', fontSize: 11, color: T.text400, lineHeight: '17px' }}>
            차단을 해제하면 서로의 모집·피드를 다시 볼 수 있어요. 해제 전에 한 번 더 확인해요.
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 33 · 여행 코스 공개 (유저 코스 → 다른 여행자에게) ─────────
// 코스 프리셋은 서비스 큐레이션만이 아니라 "다녀온 사람이 남긴 코스"로도 쌓인다.
// 공개는 호스트의 선택이고 언제든 할 수 있지만, 한 번 공개하면 되돌리기 어렵다.
// 공개하지 않는 선택도 조용히 존중한다 — 재촉하는 문구나 반복 알림을 두지 않는다.
function ScreenCoursePublish() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const [confirm, setConfirm] = React.useState(false);
  const [credit, setCredit] = React.useState(true);

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="코스 공개" left center onBack={nav.back}/>

        <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '10px 20px 20px' }}>
          <div style={{ fontSize: 17, fontWeight: 900, lineHeight: '25px' }}>이번 여행 코스,<br/>다른 여행자에게도 열어둘까요?</div>
          <div style={{ fontSize: 12, color: T.text500, marginTop: 8, lineHeight: '18px' }}>
            공개하면 탐색과 코스 목록에 올라가고, 다른 사람이 이 코스로 모집을 열 수 있어요.
          </div>

          {/* 공개했을 때 다른 유저에게 보이는 모습 그대로 */}
          <div style={{ fontSize: 12, fontWeight: 900, color: T.text500, marginTop: 18, marginBottom: 8 }}>공개하면 이렇게 보여요</div>
          <div style={{ borderRadius: 16, border: `1px solid ${RF.softLine}`, background: RF.card, overflow: 'hidden' }}>
            <div style={{ position: 'relative' }}>
              <Photo hue="forest" height={132} radius={0}/>
              <span style={{
                position: 'absolute', left: 12, bottom: 12, height: 26, padding: '0 10px', borderRadius: 999,
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: T.overlayPanel, color: T.primary700, fontSize: 11, fontWeight: 900,
              }}>
                <Icon name="user" size={12} color={T.primary700} strokeWidth={2}/> 여행자 코스
              </span>
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 900 }}>주왕산 &amp; 주산지 힐링 트레킹</div>
              <div style={{ fontSize: 11.5, color: T.text500, marginTop: 5 }}>청송 · 당일 6.2km · 방문지 4</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10 }}>
                <AnimalAvatar kind="bear" size={22} bg={T.primary50}/>
                <span style={{ fontSize: 11.5, color: T.text700, fontWeight: 700 }}>{credit ? '숲속여행자 님이 다녀온 코스' : '익명 여행자가 다녀온 코스'}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <AddFieldLabel required>코스 이름</AddFieldLabel>
            <AddFieldBox icon="note" value="주왕산 & 주산지 힐링 트레킹" chevron={false}/>
          </div>

          <div style={{ marginTop: 16 }}>
            <AddFieldLabel>한 줄 소개</AddFieldLabel>
            <AddFieldBox icon="sparkle" value="기암절벽과 주산지 물안개를 천천히 걷는 코스" chevron={false} caption="다녀온 사람만 쓸 수 있는 한 줄이 코스의 값어치예요."/>
          </div>

          <button
            type="button"
            onClick={() => setCredit((v) => !v)}
            style={{
              width: '100%', marginTop: 16, borderRadius: 12, cursor: 'pointer', fontFamily: T.fontStack, textAlign: 'left',
              border: `1px solid ${RF.softLine}`, background: RF.card, display: 'flex', alignItems: 'center', gap: 10, padding: 13,
            }}>
            <div style={{
              width: 18, height: 18, borderRadius: 5, flexShrink: 0,
              border: `1.5px solid ${credit ? T.primary500 : T.line300}`,
              background: credit ? T.primary500 : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {credit && <Icon name="check" size={11} color="#fff" strokeWidth={3}/>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>내 닉네임을 함께 보여주기</div>
              <div style={{ fontSize: 11, color: T.text500, marginTop: 3 }}>끄면 익명 여행자 코스로 올라가요.</div>
            </div>
          </button>

          <div style={{ marginTop: 16, padding: 13, borderRadius: 12, background: T.warningBg, border: `1px solid ${T.warningBg}`, display: 'flex', gap: 9, alignItems: 'flex-start' }}>
            <Icon name="lock" size={16} color={T.warningText}/>
            <div style={{ flex: 1, fontSize: 12, lineHeight: '18px', color: T.warningText }}>
              한 번 공개한 코스는 <b>다시 내릴 수 없어요.</b> 다른 여행자가 이 코스로 모집을 열거나 찜해둘 수 있기 때문이에요.
            </div>
          </div>

          <div style={{ marginTop: 14, fontSize: 11.5, color: T.text500, lineHeight: '18px' }}>
            공개는 <b>지난 여행</b>에서 언제든 다시 열 수 있어요.
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8 }}>
          <Btn variant="ghost" onClick={nav.back}>지금은 안 할래요</Btn>
          <div style={{ flex: 1 }}><Btn variant="primary" full onClick={() => setConfirm(true)}>코스 공개하기</Btn></div>
        </div>

        {/* 2단계 확인 — 되돌리기 어려운 액션 */}
        {confirm && (
          <div style={{ position: 'absolute', inset: 0, background: T.bgOverlay, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ width: '100%', maxWidth: 320, background: RF.card, borderRadius: 20, padding: 22, boxShadow: T.l3 }}>
              <div style={{ width: 44, height: 44, borderRadius: 999, background: T.warningBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon name="lock" size={21} color={T.warningText}/>
              </div>
              <div style={{ fontSize: 17, fontWeight: 900, lineHeight: '24px' }}>한 번 공개하면<br/>다시 내릴 수 없어요</div>
              <div style={{ fontSize: 12.5, color: T.text500, marginTop: 10, lineHeight: '19px' }}>
                공개한 코스는 비공개로 되돌릴 수 없어요. 다른 여행자가 이 코스로 모집을 열거나 찜해두기 때문이에요. 정말 공개할까요?
              </div>
              <div style={{ marginTop: 14, padding: 11, borderRadius: 10, background: T.bgSubtle, fontSize: 11.5, color: T.text700, lineHeight: '17px' }}>
                코스명 · 경로 · 한 줄 소개가 공개돼요. <b>채팅 내용과 사진은 공개되지 않아요.</b>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                <Btn variant="ghost" onClick={() => setConfirm(false)}>취소</Btn>
                <div style={{ flex: 1 }}><Btn variant="primary" full onClick={() => nav.go('course')}>공개할게요</Btn></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Phone>
  );
}

Object.assign(window, {
  ScreenCreatePeople,
  ScreenCreateDetail,
  ScreenChatMenu,
  ScreenChatAttach,
  ScreenFriends,
  ScreenTripMessage,
  ScreenReportSheet,
  ScreenBlocked,
  ScreenCoursePublish,
});
