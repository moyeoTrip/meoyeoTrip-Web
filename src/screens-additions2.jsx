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
// initialMax 는 17-4a(4명 이하) · 17-4b(9명 이상) 캡처 진입용 초기값이다.
// 실사용 진입(17-4)은 값을 주지 않아 기본 5명 그대로다 — 멘트 규칙은 한 벌만 쓴다.
function ScreenCreatePeople({ initialMax = 5 }) {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const initialMaxValue = Math.min(20, Math.max(4, Math.floor(Number(initialMax) || 5)));
  const [min, setMin] = React.useState(3);
  const [max, setMax] = React.useState(initialMaxValue);
  const [gender, setGender] = React.useState('all');
  // 17-5 요약이 이어받는 값. 서버 요청에는 최소 인원 필드가 없어 최대 인원·성별 제한만 보낸다.
  const goNext = () => {
    window.MoyeoApi?.updateRoomDraft({
      minParticipants: min,
      maxParticipants: max,
      genderRestriction: { all: 'NONE', female: 'FEMALE_ONLY', male: 'MALE_ONLY' }[gender] || 'NONE',
      minimumAge: 25,
      maximumAge: 35,
    });
    nav.go('create-detail');
  };

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
          <div style={{ flex: 1 }}><Btn variant="primary" full onClick={goNext}>다음</Btn></div>
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
  // 모집 이름·소개글·참가비는 **사용자가 직접 채우는 값**이다. 미리 넣어 두면 그건 목데이터다.
  // 안드로이드·iOS 도 빈 폼으로 시작한다 (NO-MOCK-CANON R1).
  const [intro, setIntro] = React.useState('');
  const [roomTitle, setRoomTitle] = React.useState('');
  const [fee, setFee] = React.useState('');
  // Step 1 에서 고른 코스 이름. 로그인 상태에서는 서버 코스 제목이 들어온다.
  const liveMode = window.MoyeoApi?.live();
  const courseTitle = (liveMode && window.MoyeoApi.roomDraft().courseTitle) || '';
  // 17-5 요약이 이어받는 값. 이 화면에 보이는 문구·금액을 그대로 요청에 싣는다.
  const goNext = () => {
    window.MoyeoApi?.updateRoomDraft({
      title: roomTitle.trim(),
      description: intro.trim() || null,
      // 비워 두면 참가비 없음이다 — 임의의 금액을 넣지 않는다.
      participationFee: fee.trim() ? Number(fee.replace(/[^0-9]/g, '')) : null,
      joinApprovalMode: approval === 'manual' ? 'MANUAL' : 'AUTO',
    });
    nav.go((window.__moyeoCourseSource || 'custom') === 'linked' ? 'create-summary-linked' : 'create-summary');
  };

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
              <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 800, color: T.text500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{courseTitle}</span>
              <Icon name="lock" size={14} color={T.text400}/>
            </div>
            <div style={{ fontSize: 11, color: T.text500, marginTop: 6 }}>Step 1에서 고른 코스 이름이에요. 여기서는 바꿀 수 없어요.</div>
          </div>

          <div style={{ marginTop: 20 }}>
            <AddFieldLabel required>모집 이름 (채팅방 이름)</AddFieldLabel>
            <AddFieldInput
              icon="users"
              value={roomTitle}
              onChange={setRoomTitle}
              placeholder="예) 느긋하게 걷는 청송 하루"
              testId="create-detail-title"
              caption="어떤 사람들과 어떻게 가고 싶은지를 담아요. 채팅방 이름으로도 쓰여요."
            />
          </div>

          <div style={{ marginTop: 20 }}>
            <AddFieldLabel>소개글</AddFieldLabel>
            <textarea
              data-testid="create-detail-intro"
              value={intro}
              onChange={(event) => setIntro(event.target.value.slice(0, 500))}
              placeholder="어떤 여행이 될지 한두 줄로 알려주세요."
              style={{
                width: '100%', minHeight: 96, borderRadius: 12, border: `1px solid ${T.line200}`,
                background: RF.card, padding: 13, fontSize: 13, lineHeight: '20px', color: T.text900,
                fontFamily: T.fontStack, resize: 'none', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <div style={{ textAlign: 'right', fontSize: 11, color: T.text400, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>{intro.length}/500</div>
          </div>

          <div style={{ marginTop: 12 }}>
            <AddFieldLabel>예상 1인당 비용</AddFieldLabel>
            {/* 코스별 예상 비용을 주는 API가 없다 — "보통 4~5만원" 같은 근거 없는 안내를 하지 않는다. */}
            <AddFieldInput
              icon="money"
              value={fee}
              onChange={(next) => setFee(next.replace(/[^0-9]/g, ''))}
              placeholder="비워 두면 참가비 없음"
              inputMode="numeric"
              testId="create-detail-fee"
              caption="1인당 예상 비용이에요. 정하지 않았으면 비워 두세요."
            />
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
          <div style={{ flex: 1 }}><Btn variant="primary" full onClick={goNext}>다음</Btn></div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 20-1 · 채팅방 사이드 메뉴 ─────────
function ScreenChatMenu() {
  return (
    <Phone>
      <ChatMenuBody/>
    </Phone>
  );
}

// 20-1 본문 — 20-1a/20-1b 시트와 31 모임 종료 경고가 "이전 화면 위에 떠 있다"고
// 읽히도록 배경으로도 재사용한다 (changeLog14)
function ChatMenuBody() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  // 참여 중인 방이면 GET {id} 상세 · {id}/members · {id}/notices · 코스로 대체한다 (비참여자는 403 → 목데이터 유지).
  const liveMode = window.MoyeoApi?.live();
  const roomId = liveMode ? window.MoyeoApi.selectedRoomId() : null;
  const [room, setRoom] = React.useState(null);
  const [memberList, setMemberList] = React.useState(null);
  const [notices, setNotices] = React.useState(null);
  // 접수 API 가 없는 신고를 누른 자리에서 안내한다 (정본 REPORT-CANON §3)
  const [reportNoticeOpen, setReportNoticeOpen] = React.useState(false);
  const [course, setCourse] = React.useState(null);
  // 방별 알림 설정 · 동행자 매너 점수 — 서버가 값을 안 주면 null 로 남겨 표기를 숨긴다.
  const [roomAlarm, setRoomAlarm] = React.useState(null);
  const [companions, setCompanions] = React.useState(null);
  const [alarmBusy, setAlarmBusy] = React.useState(false);
  React.useEffect(() => {
    if (!liveMode || !roomId) return undefined;
    let active = true;
    window.MoyeoApi.roomDetail(roomId)
      .then((result) => { if (active && result?.roomId != null) setRoom(result); })
      .catch(() => { /* 실패 시 목데이터 유지 */ });
    window.MoyeoApi.roomMembers(roomId)
      .then((result) => { if (active && Array.isArray(result?.members)) setMemberList(result); })
      .catch(() => { /* 403(미참여) 이면 목데이터 유지 */ });
    window.MoyeoApi.roomNotices(roomId)
      .then((result) => { if (active && Array.isArray(result?.pinnedNotices)) setNotices(result); })
      .catch(() => { /* 403(미참여) 이면 공지 수를 숨긴다 */ });
    window.MoyeoApi.roomCourse(roomId)
      .then((result) => { if (active && result?.course) setCourse(result.course); })
      .catch(() => { /* 코스가 없으면 코스 줄을 숨긴다 */ });
    // 이 모임의 알림만 끄기 — 별도 설정이 없으면 서버 기본값이 켜짐이다.
    window.MoyeoApi.roomNotificationSetting(roomId)
      .then((result) => { if (active && typeof result?.enabled === 'boolean') setRoomAlarm(result.enabled); })
      .catch(() => { /* 실패 시 토글을 숨긴다 (근거 없는 상태를 그리지 않는다) */ });
    // 동행자 매너 점수는 멤버 목록에 없고 완료 여행의 companions 에만 있다.
    // 여행 전 방은 "아직 여행 전"(40915/403)이라 조용히 건너뛴다 — 권한 오류가 아니다.
    window.MoyeoApi.roomCompanions(roomId)
      .then((result) => { if (active && Array.isArray(result)) setCompanions(result); })
      .catch((error) => {
        // "아직 여행 전"은 오류가 아니다 — 매너 표기만 빠진다. 그 외 실패는 관측에 남긴다.
        if (!window.MoyeoApi.isBeforeTripError(error)) window.MoyeoObservability?.captureException?.(error);
      });
    return () => { active = false; };
  }, [liveMode, roomId]);
  const serverMode = Boolean(room && memberList);
  const toggleRoomAlarm = async () => {
    if (roomAlarm === null || alarmBusy) return;
    const next = !roomAlarm;
    setAlarmBusy(true);
    setRoomAlarm(next);
    try {
      const result = await window.MoyeoApi.updateRoomNotificationSetting(roomId, next);
      if (typeof result?.enabled === 'boolean') setRoomAlarm(result.enabled);
    } catch (_) {
      setRoomAlarm(!next); // 저장 실패 시 이전 상태로 되돌린다
    }
    setAlarmBusy(false);
  };
  const mannerByUserId = React.useMemo(() => {
    const map = new Map();
    (companions || []).forEach((item) => { if (item?.mannerRating != null) map.set(item.userId, item.mannerRating); });
    return map;
  }, [companions]);
  const RoomAlarmToggle = () => (
    <button
      type="button"
      data-testid="chat-menu-room-alarm"
      aria-label="이 모임 알림"
      aria-pressed={Boolean(roomAlarm)}
      onClick={(event) => { event.stopPropagation(); toggleRoomAlarm(); }}
      style={{
        width: 40, height: 24, borderRadius: 999, border: 0, padding: 2, flexShrink: 0, cursor: 'pointer',
        background: roomAlarm ? T.primary500 : T.line200,
        display: 'flex', alignItems: 'center', justifyContent: roomAlarm ? 'flex-end' : 'flex-start',
      }}>
      <span style={{ width: 20, height: 20, borderRadius: 999, background: '#fff' }}/>
    </button>
  );
  const openMemberActions = (member) => {
    window.MoyeoApi.selectMember({ userId: member.userId, nickname: member.nickname, profileImageUrl: member.profileImageUrl });
    nav.go('member-actions');
  };
  // rightAction 은 행과 별개로 눌리는 컨트롤(방별 알림 토글)이다 —
  // 버튼 안에 버튼을 넣으면 마크업이 깨지므로 행 위에 겹쳐 놓는다.
  const Row = ({ icon, label, sub, onClick, danger, right, rightAction }) => (
    <div style={{ position: 'relative' }}>
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
        {rightAction ? <span aria-hidden style={{ width: 40, height: 24, flexShrink: 0 }}/> : (right || <Icon name="arrow" size={15} color={T.text400}/>)}
      </button>
      {rightAction && <div style={{ position: 'absolute', right: 20, top: 14 }}>{rightAction}</div>}
    </div>
  );

  if (serverMode) {
    // 20-2 공지 이력과 같은 규칙: 고정은 최대 1개다(R5-1). 서버에 2건 남은 방이 있어
    // 날것을 그대로 세면 `고정 2` 처럼 규칙과 모순되게 읽힌다 — 표시상 1로 묶는다.
    const rawPinned = notices?.pinnedNotices?.length || 0;
    const pinnedCount = Math.min(rawPinned, 1);
    const noticeCount = rawPinned + (notices?.unpinnedNotices?.length || 0);
    const dayTripTime = room.tripType === 'DAY_TRIP' && room.dayTripStartTime
      ? `${window.MoyeoApi.formatTime(room.dayTripStartTime)} – ${window.MoyeoApi.formatTime(room.dayTripEndTime)}`
      : '';
    const meetingTime = room.meetingDateTime ? window.MoyeoApi.formatTime(String(room.meetingDateTime).split('T')[1]) : '';
    const conditions = [
      room.participationFee != null ? (Number(room.participationFee) > 0 ? `1인 ${Number(room.participationFee).toLocaleString()}원` : '참가비 없음') : null,
      room.recruitmentDDay != null ? `마감 D-${room.recruitmentDDay}` : null,
      room.minimumAge != null && room.maximumAge != null ? `${room.minimumAge}~${room.maximumAge}세` : null,
      { NONE: '성별 무관', MALE_ONLY: '남성만', FEMALE_ONLY: '여성만' }[room.genderRestriction] || null,
    ].filter(Boolean);
    return (
      <div data-testid="chat-menu-live" style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="모임 정보" left center onBack={nav.back}/>
        <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 0, overflow: 'auto', paddingBottom: 24 }}>
          <div style={{ padding: '4px 20px 16px', borderBottom: `8px solid ${T.bgSubtle}` }}>
            <div style={{ fontSize: 15, fontWeight: 900 }}>{room.title}</div>
            {course && <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, fontSize: 12, color: T.text500 }}><Icon name="map" size={13} color={T.text500}/><b>{course.title}</b></div>}
            <div style={{ fontSize: 12, color: T.text500, marginTop: 5, fontVariantNumeric: 'tabular-nums' }}>
              {window.MoyeoApi.formatDate(room.startDate)}{room.endDate ? ` - ${window.MoyeoApi.formatDate(room.endDate)}` : ''} {window.MoyeoApi.tripTypeLabel(room)}{dayTripTime ? ` · ${dayTripTime}` : ''}
            </div>
            {room.meetingDetails && (
              <div style={{ fontSize: 12, color: T.text500, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{meetingTime ? `${meetingTime} ` : ''}{room.meetingDetails} 집합</div>
            )}
            {conditions.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {conditions.map((condition) => <Chip key={condition} variant={condition.startsWith('마감') ? 'accent' : 'neutral'}>{condition}</Chip>)}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Btn variant="secondary" style={{ height: 40, flex: 1 }} onClick={() => nav.go('detail')}>모집 상세</Btn>
              {course && <Btn variant="secondary" style={{ height: 40, flex: 1 }} onClick={() => nav.go('course-edit')}>여행 경로</Btn>}
            </div>
          </div>

          <div style={{ padding: '16px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 900 }}>동행자 <span style={{ color: T.text400, fontVariantNumeric: 'tabular-nums' }}>{memberList.participantCount}</span></div>
            <span style={{ fontSize: 11.5, color: T.text500 }}>최대 {memberList.maxParticipants}명{memberList.waitlistCount ? ` · 대기 ${memberList.waitlistCount}명` : ''}</span>
          </div>
          <div style={{ padding: '0 20px' }}>
            {memberList.members.map((member) => (
              <div key={member.userId} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0' }}>
                {member.profileImageUrl
                  ? <img src={member.profileImageUrl} alt="" style={{ width: 38, height: 38, borderRadius: 999, objectFit: 'cover', background: T.primary50 }}/>
                  : <span style={{ width: 38, height: 38, borderRadius: 999, background: T.primary50, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user" size={19} color={T.primary600}/></span>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.nickname}</div>
                  {/* 멤버 목록에는 매너 점수가 없다 — 완료 여행이면 companions 의 mannerRating 으로 채우고,
                      값이 null 이면(현재 서버 상태) 여행 횟수만 적는다 */}
                  <div style={{ fontSize: 11, color: T.text500, marginTop: 2 }}>
                    {mannerByUserId.has(member.userId) ? `매너 ${mannerByUserId.get(member.userId)} · ` : ''}여행 {member.completedTripCount}회
                  </div>
                </div>
                {member.host
                  ? <Chip variant="soft">호스트</Chip>
                  : member.me
                    ? <Chip variant="neutral">나</Chip>
                    : <IconButton name="more" size={18} onClick={() => openMemberActions(member)}/>}
              </div>
            ))}
          </div>

          <div style={{ height: 8, background: T.bgSubtle, margin: '16px 0 8px' }}/>

          <Row icon="note" label="공지" sub={notices ? `고정 ${pinnedCount}개 · 전체 ${noticeCount}개` : null} onClick={() => nav.go('notice-history')}/>
          {/* 토글은 이 방의 알림만 끈다 (PUT notifications/settings/chat-rooms/{roomId}).
              행 자체는 20-1c 이 모임 알림으로 이어진다 — 예전에는 전역 방해금지(29-2)로 갔다.
              "이 모임만"이라고 써놓고 계정 전체 설정을 열면, 방 하나 끄려던 사람이 모든 알림을 끈다
              (ATTACH-COMPOSER-CANON §6-1). 서버 값을 못 읽으면 토글만 숨긴다. */}
          <Row icon="bell" label="알림 설정" sub="이 모임의 알림만 끄기" onClick={() => nav.go('room-notif')} rightAction={roomAlarm === null ? null : <RoomAlarmToggle/>}/>
          {/* 채팅방·멤버 신고는 접수 API 가 없다 — 30-2 시트(피드 전용)로 보내지 않고
              누른 자리에서 문의 안내를 띄운다 (정본 REPORT-CANON §3).
              차단은 20-1a 멤버 액션에서 한다(대상이 확실한 자리). */}
          <Row icon="flag" label="신고 · 문의" sub="부적절한 대화는 GitHub 이슈나 이메일로 알려주세요" onClick={() => setReportNoticeOpen(true)}/>

          <div style={{ height: 8, background: T.bgSubtle, margin: '8px 0' }}/>

          <Row icon="close" label="채팅방 나가기" sub="나가면 대기 중인 다음 신청자가 자동으로 합류해요" danger onClick={() => nav.go('leave-alert')}/>
        </div>
        {reportNoticeOpen && <ReportUnsupportedDialog onClose={() => setReportNoticeOpen(false)}/>}
      </div>
    );
  }

  // 서버 모임 정보를 못 받으면 예시 모임·동행자를 그리지 않는다.
  return (
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="모임 정보" left center onBack={nav.back}/>
        <div role="status" style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13, lineHeight: '21px' }}>
          {liveMode ? '참여 중인 모임이 없어요.' : '로그인하면 모집 중인 모임을 볼 수 있어요.'}
        </div>
      </div>
  );
}
// 20-1a·20-1b 가 대상 멤버를 정하는 방법.
// 기본은 20-1 사이드 메뉴에서 고른 멤버(sessionStorage)이고, 그 컨텍스트 없이 바로 들어온
// 딥링크·라이브 캡처에서는 ?roomId=&memberId= 로 지정한 멤버를 방 멤버 목록에서 찾는다.
// 둘 다 없으면 null 이라 화면기획 목데이터가 그대로 남는다 — 임의의 멤버를 골라주지 않는다.
function useTargetRoomMember(liveMode) {
  const selected = liveMode ? window.MoyeoApi.selectedMember() : null;
  const [resolved, setResolved] = React.useState(null);
  React.useEffect(() => {
    if (!liveMode || selected?.userId) return undefined;
    const roomId = window.MoyeoApi.selectedRoomId();
    const memberId = window.MoyeoApi.selectedMemberId();
    if (!roomId || !memberId) return undefined;
    let active = true;
    window.MoyeoApi.findRoomMember(roomId, memberId)
      .then((member) => { if (active && member) setResolved(member); });
    return () => { active = false; };
  }, [liveMode, selected?.userId]);
  return selected?.userId ? selected : resolved;
}

// ───────── 20-1a · 멤버 액션 (친구 요청 · 내보내기) ─────────
// 20-1 사이드 메뉴의 멤버 ⋯ 를 탭하면 열린다. 누구나 친구 요청을 보낼 수 있고,
// 내보내기는 호스트에게만 보인다. 내보내기를 고르면 20-1b 사유 입력 시트로 이어진다. (changeLog14)
function ScreenMemberActions() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  // 20-1에서 고른 멤버가 있으면 그 멤버에게 POST users/me/friend-requests/{userId} 를 보낸다.
  const liveMode = window.MoyeoApi?.live();
  const member = useTargetRoomMember(liveMode);
  const [requestState, setRequestState] = React.useState('idle');
  const [requestError, setRequestError] = React.useState('');
  // 멤버 신고는 접수 API 가 없다 — 누른 자리에서 문의 안내를 띄운다 (정본 REPORT-CANON §3).
  const [reportNoticeOpen, setReportNoticeOpen] = React.useState(false);
  // 차단은 신고와 분리한다. 대상이 확실한 이 자리에서 바로 보낸다
  // (POST users/me/blocks/{userId} · 안드로이드 멤버 액션 onBlock 이 정본).
  const [blockState, setBlockState] = React.useState('idle');
  const [blockMessage, setBlockMessage] = React.useState('');
  const [blockError, setBlockError] = React.useState('');
  const blockMember = async () => {
    if (!member?.userId || blockState !== 'idle') return;
    setBlockState('sending');
    setBlockError('');
    try {
      await window.MoyeoApi.blockUser(member.userId);
      setBlockState('done');
      // 성공 문구는 안드로이드와 글자까지 같다.
      setBlockMessage(`${member.nickname}님을 차단했어요.`);
    } catch (error) {
      setBlockState('idle');
      setBlockError(error?.message || '차단하지 못했어요. 잠시 후 다시 시도해주세요.');
    }
  };
  const sendFriendRequest = async () => {
    if (!member?.userId || requestState !== 'idle') return;
    setRequestState('sending');
    setRequestError('');
    try {
      await window.MoyeoApi.sendFriendRequest(member.userId);
      setRequestState('sent');
    } catch (error) {
      setRequestState('idle');
      setRequestError(error?.message || '친구 요청을 보내지 못했어요.');
    }
  };
  const friendLabel = requestState === 'sent' ? '친구 요청을 보냈어요' : requestState === 'sending' ? '보내는 중...' : '친구 요청하기';
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {/* 이전 화면(20-1)이 딤 아래에 그대로 깔려 있어야 시트가 "위에 떠 있다"고 읽힌다 (changeLog14) */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}><ChatMenuBody/></div>
        {/* 여기에 23 피드 상세를 배경으로 깔았던 코드가 있었다 — **잘못이었다.**
            20-1a 는 채팅 멤버 목록에서 열리는 시트이고(위의 `ChatMenuBody` 가 그 배경이다)
            피드와 무관하다. 피드 신고 시트는 30-2/32 로 따로 있다 (정본 REPORT-CANON §3).
            그 코드는 이 화면에 없는 `feed` 를 참조해 **화면 전체가 렌더되지 않았다**. */}
        <div style={{ position: 'absolute', inset: 0, background: T.bgOverlay }}/>
        <div data-testid="member-actions-sheet" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: T.bgRaised, borderRadius: '24px 24px 0 0', padding: '10px 20px 32px', boxShadow: T.l3 }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: T.line300, margin: '0 auto 14px' }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '4px 0 12px' }}>
            {member
              ? (member.profileImageUrl
                ? <img src={member.profileImageUrl} alt="" style={{ width: 44, height: 44, borderRadius: 999, objectFit: 'cover', background: T.primary50 }}/>
                : <span style={{ width: 44, height: 44, borderRadius: 999, background: T.primary50, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user" size={22} color={T.primary600}/></span>)
              : <AnimalAvatar kind="raccoon" size={44} bg={T.primary50}/>}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>{member?.nickname || ''}</div>
              {/* 서버 멤버 응답에는 매너 점수·합류 시각이 없어 목데이터에서만 보조 줄을 둔다 */}
              {!member && <div style={{ fontSize: 11.5, color: T.text500, marginTop: 2 }}>매너 4.8 · 여행 8회 · 어제 합류</div>}
            </div>
          </div>
          <div style={{ height: 1, background: T.line100 }}/>
          <button type="button" data-testid="member-actions-friend" disabled={requestState !== 'idle'} onClick={member ? sendFriendRequest : undefined} style={{ width: '100%', height: 54, border: 0, background: 'transparent', display: 'flex', alignItems: 'center', gap: 11, fontFamily: T.fontStack, cursor: requestState === 'idle' ? 'pointer' : 'default', padding: 0 }}>
            <Icon name="user" size={19} color={T.text700}/>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 600, color: requestState === 'sent' ? T.primary600 : T.text900 }}>{friendLabel}</span>
            {requestState === 'idle' && <Icon name="arrow" size={15} color={T.text400}/>}
          </button>
          {requestError && <div role="alert" style={{ fontSize: 11.5, color: T.danger, paddingBottom: 8 }}>{requestError}</div>}
          <div style={{ height: 1, background: T.line100 }}/>
          {/* 호스트에게만 보이는 행 — 멤버 시점 시안에서는 이 행이 없다 */}
          <button type="button" data-testid="member-actions-remove" onClick={() => nav.go('member-remove')} style={{ width: '100%', height: 54, border: 0, background: 'transparent', display: 'flex', alignItems: 'center', gap: 11, fontFamily: T.fontStack, cursor: 'pointer', padding: 0 }}>
            <Icon name="warning" size={19} color={T.danger}/>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 600, color: T.danger }}>내보내기</span>
            <Icon name="arrow" size={15} color={T.text400}/>
          </button>
          <div style={{ fontSize: 11, color: T.text400, margin: '6px 0 14px' }}>내보내기는 호스트에게만 보여요.</div>
          {/* 차단(POST users/me/blocks/{userId})은 대상이 확실한 이 경로에서만 열어둔다.
              신고는 멤버 접수 API 가 없어 30-2 시트(피드 전용)로 보내지 않고 문의 안내를 띄운다. */}
          {member && (
            <>
              <div style={{ height: 1, background: T.line100 }}/>
              <button type="button" data-testid="member-actions-block" disabled={blockState !== 'idle'} onClick={blockMember} style={{ width: '100%', height: 54, border: 0, background: 'transparent', display: 'flex', alignItems: 'center', gap: 11, fontFamily: T.fontStack, cursor: blockState === 'idle' ? 'pointer' : 'default', padding: 0 }}>
                <Icon name="close" size={19} color={T.danger}/>
                <span style={{ flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 600, color: blockState === 'done' ? T.text500 : T.danger }}>
                  {blockState === 'done' ? '차단했어요' : blockState === 'sending' ? '차단 중...' : '차단하기'}
                </span>
                {blockState === 'idle' && <Icon name="arrow" size={15} color={T.text400}/>}
              </button>
              {blockMessage && <div role="status" data-testid="member-actions-block-done" style={{ fontSize: 11.5, color: T.text500, paddingBottom: 8 }}>{blockMessage}</div>}
              {blockError && <div role="alert" style={{ fontSize: 11.5, color: T.danger, paddingBottom: 8 }}>{blockError}</div>}
              <div style={{ height: 1, background: T.line100 }}/>
              <button type="button" data-testid="member-actions-report" onClick={() => setReportNoticeOpen(true)} style={{ width: '100%', height: 54, border: 0, background: 'transparent', display: 'flex', alignItems: 'center', gap: 11, fontFamily: T.fontStack, cursor: 'pointer', padding: 0 }}>
                <Icon name="flag" size={19} color={T.text700}/>
                <span style={{ flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 600, color: T.text900 }}>신고 · 문의</span>
                <Icon name="arrow" size={15} color={T.text400}/>
              </button>
              <div style={{ height: 12 }}/>
            </>
          )}
          <Btn variant="secondary" full onClick={() => nav.back()}>닫기</Btn>
        </div>
        {reportNoticeOpen && <ReportUnsupportedDialog onClose={() => setReportNoticeOpen(false)}/>}
      </div>
    </Phone>
  );
}

// ───────── 20-1b · 멤버 내보내기 (호스트 · 사유 입력) ─────────
// 20-1a 멤버 액션 시트의 "내보내기"에서 이어진다. 사유는 자유 서술 하나만 받고(카테고리 없음),
// 입력 전에는 내보내기가 비활성이다. 사유는 상대에게 알림(13)으로 그대로 전달되고,
// 상대는 13-1 내보내기 안내에서 이 사유를 본다. (changeLog14)
function ScreenMemberRemove() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const [reason, setReason] = React.useState('');
  // ⚠️ 파괴적 호출이라 QA 방에서 실행해 검증하지 않았다 — 배선만 해 둔다.
  // DELETE chat-rooms/{roomId}/members/{memberId} 는 본문에 사유(1~500자)가 필수다.
  const liveMode = window.MoyeoApi?.live();
  const roomId = liveMode ? window.MoyeoApi.selectedRoomId() : null;
  const member = useTargetRoomMember(liveMode);
  const [busy, setBusy] = React.useState(false);
  const canSubmit = reason.trim().length >= 10 && !busy;
  const submit = async () => {
    if (!roomId || !member?.userId) { nav.back(); return; }
    setBusy(true);
    try {
      await window.MoyeoApi.kickRoomMember(roomId, member.userId, reason);
      window.MoyeoApi.selectMember(null);
      nav.go('chat-menu');
    } catch (_) {
      setBusy(false); // 실패 시 시트를 닫지 않는다 (기획에 오류 문구 자리가 없다)
    }
  };
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {/* 이전 화면(20-1)이 딤 아래에 그대로 깔려 있어야 시트가 "위에 떠 있다"고 읽힌다 (changeLog14) */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}><ChatMenuBody/></div>
        <div style={{ position: 'absolute', inset: 0, background: T.bgOverlay }}/>
        <div data-testid="member-remove-sheet" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: T.bgRaised, borderRadius: '24px 24px 0 0', padding: '10px 20px 32px', boxShadow: T.l3 }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: T.line300, margin: '0 auto 14px' }}/>
          <div style={{ fontSize: 17, fontWeight: 700 }}>멤버 내보내기</div>
          <div style={{ fontSize: 12, color: T.text500, marginTop: 4 }}>내보낸 자리는 대기 큐에서 자동으로 채워져요.</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 16, padding: 12, borderRadius: 12, background: T.bgSubtle }}>
            {member?.userId
              ? <ProfileAvatar src={member.profileImageUrl} size={40}/>
              : <AnimalAvatar kind="raccoon" size={40} bg={T.primary50}/>}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{member?.nickname || ''}</div>
              {/* 매너 점수·합류 시각은 서버 멤버 목록에 없다 — 서버 모드에서는 표기하지 않는다 */}
              {!member?.userId && <div style={{ fontSize: 11, color: T.text500, marginTop: 2 }}>매너 4.8 · 여행 8회 · 어제 합류</div>}
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, margin: '18px 0 8px' }}>내보내는 사유 <span style={{ color: T.danger }}>*</span></div>
          <textarea
            data-testid="member-remove-reason"
            value={reason}
            maxLength={200}
            onChange={(event) => setReason(event.target.value)}
            placeholder="사유를 남겨주세요. 상대에게 알림으로 그대로 전달돼요. (10자 이상)"
            style={{ width: '100%', height: 84, resize: 'none', borderRadius: 12, border: `1px solid ${T.line200}`, background: 'transparent', padding: 12, fontSize: 13, color: T.text900, lineHeight: '20px', fontFamily: T.fontStack, boxSizing: 'border-box' }}
          />
          <div style={{ textAlign: 'right', fontSize: 11, color: T.text400, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{reason.length}/200</div>

          <div style={{ marginTop: 10, borderRadius: 12, background: T.bgSubtle, padding: 14 }}>
            {[
              '내보내면 이 모임에 다시 신청할 수 없어요.',
              '내보내는 즉시 채팅방에서 제외돼요. 이미 남긴 대화는 채팅방에 그대로 남아요.',
              '사유는 상대에게 알림으로 전달돼요.',
            ].map(line => (
              <div key={line} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 4, height: 4, borderRadius: 999, background: T.text500, marginTop: 7, flexShrink: 0 }}/>
                <div style={{ fontSize: 12, color: T.text700, lineHeight: '17px' }}>{line}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 18 }}>
            <button type="button" data-testid="member-remove-cancel" onClick={() => nav.back()} style={{ width: 72, height: 52, border: 0, background: 'transparent', fontSize: 14, fontWeight: 600, color: T.text700, fontFamily: T.fontStack, cursor: 'pointer' }}>취소</button>
            {/* 진입 상태는 사유가 비어 있으므로 비활성이다 (changeLog12 진입 상태 원칙) */}
            <div style={{ flex: 1 }}><Btn variant="danger" full disabled={!canSubmit} testId="member-remove-submit" onClick={submit}>내보내기</Btn></div>
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 20-2 · 첨부 메뉴 (작성 화면 6종 진입) ─────────
// 타일 6개는 각자의 작성 화면(20-2a~20-2f)으로 간다 — ATTACH-COMPOSER-CANON §0·§1.
// 예전에는 여섯 개가 전부 21(특수 메시지 견본)로 가서 "무엇을 어떻게 만드는지"가 화면에 없었고,
// 사진·장소·지도만 시트에서 바로 전송돼 미리보기 없이 나갔다(정본 R2 위반).
function ScreenChatAttach() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const items = [
    { icon: 'camera', label: '사진', desc: '최대 20MB · 1장씩 전송', route: 'attach-photo' },
    { icon: 'pin', label: '장소', desc: '관광 정보에서 찾기', route: 'attach-place' },
    { icon: 'map', label: '지도', desc: '만날 위치 핀 공유', route: 'attach-map' },
    { icon: 'poll', label: '투표', desc: '2~5개 · 익명 기본', route: 'attach-poll' },
    { icon: 'money', label: '정산', desc: '메모용 · 송금 아님', route: 'attach-settlement' },
    { icon: 'note', label: '메모', desc: '상단 고정 공지 (호스트)', route: 'attach-notice' },
  ];
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative', overflow: 'hidden' }}>
        {/* 이전 화면(20 채팅방)이 딤 아래에 그대로 깔려 있어야 시트가 "위에 떠 있다"고 읽힌다 (changeLog14) */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}><ChatRoomBody/></div>
        <div style={{ position: 'absolute', inset: 0, background: T.bgOverlay }}/>

        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: T.bgRaised, borderRadius: '24px 24px 0 0', padding: '10px 20px 32px',
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
                data-testid={`chat-attach-${it.label}`}
                onClick={() => nav.go(it.route)}
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
  // 로그인 상태: GET friends + friend-requests/received·sent 로 대체, 수락/거절/취소 실연동.
  const liveMode = window.MoyeoApi?.live();
  const [serverData, setServerData] = React.useState(null);
  React.useEffect(() => {
    if (!liveMode) return undefined;
    let active = true;
    Promise.all([
      window.MoyeoApi.friends(),
      window.MoyeoApi.receivedFriendRequests(),
      window.MoyeoApi.sentFriendRequests(),
    ])
      .then(([friendsResult, receivedResult, sentResult]) => {
        if (!active || !Array.isArray(friendsResult?.friends)) return;
        setServerData({
          mine: friendsResult.friends,
          received: receivedResult?.requests || [],
          sent: sentResult?.requests || [],
        });
      })
      .catch(() => { /* 실패 시 목데이터 유지 */ });
    return () => { active = false; };
  }, [liveMode]);
  const answerRequest = async (requestId, accept) => {
    try {
      if (accept) await window.MoyeoApi.acceptFriendRequest(requestId);
      else await window.MoyeoApi.rejectFriendRequest(requestId);
      setServerData((current) => (current ? { ...current, received: current.received.filter((item) => item.requestId !== requestId) } : current));
      if (accept) window.MoyeoApi.friends().then((result) => {
        setServerData((current) => (current ? { ...current, mine: result?.friends || current.mine } : current));
      }).catch(() => {});
    } catch (_) { /* 실패 시 목록 유지 */ }
  };
  const cancelSent = async (requestId) => {
    try {
      await window.MoyeoApi.cancelFriendRequest(requestId);
      setServerData((current) => (current ? { ...current, sent: current.sent.filter((item) => item.requestId !== requestId) } : current));
    } catch (_) { /* 실패 시 목록 유지 */ }
  };
  // 27-2a 친구 정리 시트로 보낸다. 친구를 끊으면 도감 카드까지 함께 사라지므로
  // 행 안의 즉석 확인이 아니라 별도 화면에서 묻는다 (ATTACH-COMPOSER-CANON §6-5).
  // 실제 DELETE users/me/friends/{friendUserId} 는 27-2a 가 부른다.
  const openFriendManage = (item) => {
    window.MoyeoApi.selectFriend({
      userId: item.user?.userId,
      nickname: item.user?.nickname,
      profileImageUrl: item.user?.profileImageUrl || null,
    });
    nav.go('friend-manage');
  };
  const ServerAvatar = ({ src, size = 44 }) => (
    src
      ? <img src={src} alt="" style={{ width: size, height: size, borderRadius: 999, objectFit: 'cover', background: T.primary50 }}/>
      : <span style={{ width: size, height: size, borderRadius: 999, background: T.primary50, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user" size={Math.round(size * 0.5)} color={T.primary600}/></span>
  );

  if (serverData) {
    const list = serverData[tab] || [];
    return (
      <Phone>
        <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
          <Header title="친구 관리" left center onBack={nav.back} right={<IconButton name="search"/>}/>
          <div style={{ padding: '0 20px', display: 'flex', gap: 20, borderBottom: `1px solid ${RF.softLine}` }}>
            {[
              { id: 'mine', label: '내 친구', count: serverData.mine.length },
              { id: 'received', label: '받은 신청', count: serverData.received.length },
              { id: 'sent', label: '보낸 신청', count: serverData.sent.length },
            ].map((t) => {
              const on = t.id === tab;
              return (
                <button key={t.id} type="button" onClick={() => setTab(t.id)} style={{ padding: '12px 0', marginBottom: -1, border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: on ? `2px solid ${T.primary500}` : '2px solid transparent', fontFamily: T.fontStack }}>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: on ? T.primary600 : T.text500 }}>{t.label}</span>
                  <span style={{ fontSize: 12, color: on ? T.primary500 : T.text400, marginLeft: 4, fontVariantNumeric: 'tabular-nums' }}>{t.count}</span>
                </button>
              );
            })}
          </div>
          <div style={{ position: 'absolute', top: 126, left: 0, right: 0, bottom: 0, overflow: 'auto', padding: '6px 0 24px' }}>
            {tab === 'received' && serverData.received.length > 0 && (
              <div style={{ padding: '10px 20px 4px', fontSize: 11.5, color: T.text500 }}>거절해도 상대방에게는 알려지지 않아요.</div>
            )}
            {list.length === 0 && (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13 }}>
                {tab === 'mine' ? '아직 친구가 없어요. 여행에서 만난 친구에게 신청해보세요!' : tab === 'received' ? '받은 친구 신청이 없어요.' : '보낸 친구 신청이 없어요.'}
              </div>
            )}
            {tab === 'mine' && serverData.mine.map((item) => (
              <div key={item.friendshipId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px' }}>
                <ServerAvatar src={item.user?.profileImageUrl}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.user?.nickname}</div>
                  {item.lastActive && <div style={{ fontSize: 11.5, color: T.text500, marginTop: 3 }}>{item.lastActive} 접속</div>}
                </div>
                <IconButton name="more" size={18} ariaLabel={`${item.user?.nickname} 친구 정리`} onClick={() => openFriendManage(item)}/>
              </div>
            ))}
            {tab === 'received' && serverData.received.map((item) => (
              <div key={item.requestId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px' }}>
                <ServerAvatar src={item.user?.profileImageUrl}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.user?.nickname}</div>
                  <div style={{ fontSize: 11.5, color: T.text500, marginTop: 3 }}>{window.MoyeoApi.formatRelative(item.requestedAt)} 신청</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" onClick={() => answerRequest(item.requestId, false)} style={{ height: 34, padding: '0 12px', borderRadius: 10, border: `1px solid ${T.line200}`, background: 'transparent', color: T.text700, fontSize: 12, fontWeight: 800, fontFamily: T.fontStack, cursor: 'pointer' }}>거절</button>
                  <button type="button" onClick={() => answerRequest(item.requestId, true)} style={{ height: 34, padding: '0 14px', borderRadius: 10, border: 'none', background: T.primary500, color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: T.fontStack, cursor: 'pointer' }}>수락</button>
                </div>
              </div>
            ))}
            {tab === 'sent' && serverData.sent.map((item) => (
              <div key={item.requestId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px' }}>
                <ServerAvatar src={item.user?.profileImageUrl}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.user?.nickname}</div>
                  <div style={{ fontSize: 11.5, color: T.text500, marginTop: 3 }}>{window.MoyeoApi.formatRelative(item.requestedAt)} 신청 · 수락 대기 중</div>
                </div>
                <button type="button" onClick={() => cancelSent(item.requestId)} style={{ height: 34, padding: '0 12px', borderRadius: 10, border: `1px solid ${T.line200}`, background: 'transparent', color: T.text700, fontSize: 12, fontWeight: 800, fontFamily: T.fontStack, cursor: 'pointer' }}>신청 취소</button>
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
  // 서버 친구 목록을 못 받으면 예시 친구를 그리지 않는다.
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="친구 관리" left center onBack={nav.back}/>
        <div role="status" style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13, lineHeight: '21px' }}>
          로그인하면 모집 중인 모임을 볼 수 있어요.
        </div>
      </div>
    </Phone>
  );
}
// ───────── 27-3 · 여행 후 한 줄 메시지 (도감 카드 뒷면) ─────────
function ScreenTripMessage() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  // 동행자는 서버 응답에서만 온다 — 예시 동행자에게 한 줄을 남기게 하지 않는다.
  const presets = ['덕분에 즐거웠어요', '사진 고마워요!', '다음에도 잘 부탁드려요'];
  // 완료한 여행이면 GET chat-rooms/{id}/companions 로 동행자·이미 남긴 한줄평을 대체한다.
  // 여행 전 방은 "아직 여행 전"(40915/403)이라 동행자 목록이 비어 있다 — 권한 오류가 아니다.
  const liveMode = window.MoyeoApi?.live();
  // 대상 방은 **다녀온 여행**이어야 한다 (`ended && status === 'CONFIRMED'`).
  // 예전에는 마지막으로 고른 방을 그대로 썼는데, 그 방이 모집 중이거나 불발(CANCELLED)이면
  // companions 가 409 라 화면이 통째로 비었다 — "동행자가 없다"로 잘못 읽힌다.
  // MoyeoApi.completedTripRoomId 가 고른 방을 검사하고, 아니면 가장 최근에 다녀온 여행으로 바꾼다.
  const [roomId, setRoomId] = React.useState(null);
  React.useEffect(() => {
    if (!liveMode) { setRoomId(null); return undefined; }
    let active = true;
    window.MoyeoApi.completedTripRoomId()
      .then((resolved) => {
        if (!active) return;
        setRoomId(resolved);
        // 다녀온 여행이 하나도 없으면 로딩을 끝내고 빈 상태로 남긴다.
        if (!resolved) setCompanionsState('empty');
      })
      .catch(() => { if (active) { setRoomId(null); setCompanionsState('failed'); } });
    return () => { active = false; };
  }, [liveMode]);
  const [companions, setCompanions] = React.useState(null);
  const [drafts, setDrafts] = React.useState({});
  // 매너 점수 초안 — userId → 1~5. 서버가 이미 받은 점수가 있으면 그 값으로 시작한다.
  const [scores, setScores] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState('');
  // 목록이 없을 때 무엇을 그릴지 정하는 상태다. 예전에는 상태 없이 목록만 그려서,
  // 동행자가 없으면 27-1 에서 이 섹션이 통째로 사라졌다.
  // 로그인 상태면 방을 찾는 동안에도 '불러오는 중'이다 — 잠깐이라도 '친구가 없어요'가 뜨면
  // 사용자는 그것을 사실로 읽는다.
  const [companionsState, setCompanionsState] = React.useState(liveMode ? 'loading' : 'empty');
  const [reloadKey, setReloadKey] = React.useState(0);
  React.useEffect(() => {
    if (!liveMode) { setCompanionsState('empty'); return undefined; }
    // 아직 방을 찾는 중이면(null) 로딩을 유지한다. 다녀온 여행이 하나도 없으면 빈 상태다.
    if (!roomId) return undefined;
    let active = true;
    setCompanionsState('loading');
    window.MoyeoApi.roomCompanions(roomId)
      .then((result) => {
        if (!active) return;
        if (!Array.isArray(result)) { setCompanionsState('failed'); return; }
        setCompanions(result);
        setDrafts(Object.fromEntries(result.map((item) => [item.userId, item.oneLineReview || ''])));
        setScores(Object.fromEntries(result.map((item) => [item.userId, item.mannerScore || 0])));
        setCompanionsState(result.length ? 'ready' : 'empty');
      })
      .catch((error) => {
        if (!active) return;
        // 여행 전 방은 동행자가 아직 없는 것이지 오류가 아니다 — 빈 상태로 남긴다.
        const beforeTrip = window.MoyeoApi.isBeforeTripError(error);
        if (!beforeTrip) window.MoyeoObservability?.captureException?.(error);
        setCompanionsState(beforeTrip ? 'empty' : 'failed');
      });
    return () => { active = false; };
  }, [liveMode, roomId, reloadKey]);
  const serverMode = Array.isArray(companions) && companions.length > 0;
  // PUT companions/{userId}/review 는 { mannerScore: 1~5, oneLineReview } 를 받는다.
  // mannerScore 가 **필수**인데 예전 27-1 에는 별점 UI 가 한 픽셀도 없어서, 이미 점수가 있는
  // 동행자(재편집)만 저장하고 첫 평가는 화면에만 남겼다 — 그래서 앱 곳곳의 `매너 4.7` 을
  // 만드는 사람이 아무도 없었다. 2026-08-30 기획에 별점이 생겨 이제 이 화면이 값을 만든다
  // (ATTACH-COMPOSER-CANON §6-2).
  //
  // 점수를 안 고른 동행자는 **보내지 않는다** — 서버가 1~5 만 받고, 기본 점수를 채워 보내면
  // 사용자가 매기지 않은 매너 점수가 상대에게 남는다.
  const saveReviews = async () => {
    if (!serverMode || saving) { nav.go('dex'); return; }
    setSaving(true);
    setSaveError('');
    const savable = companions.filter((item) => {
      const score = scores[item.userId] || 0;
      if (score < 1) return false;
      const reviewChanged = (drafts[item.userId] || '') !== (item.oneLineReview || '');
      const scoreChanged = score !== (item.mannerScore || 0);
      return reviewChanged || scoreChanged;
    });
    let failed = 0;
    for (const item of savable) {
      try {
        await window.MoyeoApi.reviewCompanion(roomId, item.userId, {
          mannerScore: scores[item.userId],
          oneLineReview: drafts[item.userId] || null,
        });
      } catch (_) { failed += 1; }
    }
    setSaving(false);
    // 조용히 넘어가면 "남겼다"고 착각한다 — 실패한 사람 수를 말하고 화면에 머문다.
    if (failed > 0) { setSaveError(`${failed}명에게는 남기지 못했어요. 다시 시도해주세요.`); return; }
    nav.go('dex');
  };

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="여행 마무리" left center onBack={nav.back}/>

        <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '10px 20px 20px' }}>
          <div style={{ fontSize: 17, fontWeight: 900, lineHeight: '25px' }}>함께 걸어준 친구들에게<br/>한 줄 남겨볼까요?</div>
          {/* 기획 27-1 의 안내 문구를 그대로 옮긴다 — 매너 점수가 어디에 쓰이는지 말해야
              사람들이 점수를 매긴다 (ATTACH-COMPOSER-CANON §6-2). */}
          <div style={{ fontSize: 12, color: T.text500, marginTop: 8, lineHeight: '18px' }}>
            매너 점수는 <b>다음 모임의 호스트</b>가 보고, 한 줄 메시지는 상대방의 <b>도감 카드 뒷면</b>에 적혀요.
          </div>

          {serverMode && (
          <div data-testid="trip-message-live" style={{ marginTop: 16, display: 'grid', gap: 10 }}>
            {companions.map((mate) => {
              const draft = drafts[mate.userId] || '';
              const score = scores[mate.userId] || 0;
              const done = mate.reviewed && draft === (mate.oneLineReview || '') && score === (mate.mannerScore || 0);
              return (
                <div key={mate.userId} style={{
                  borderRadius: 14, border: `1px solid ${done ? T.primary100 : RF.softLine}`,
                  background: done ? T.primary50 : RF.card, padding: 13,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ProfileAvatar src={mate.profileImageUrl} size={40}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mate.nickname}</div>
                      <div style={{ fontSize: 11, color: T.text500, marginTop: 2 }}>{mate.reviewed ? '메시지를 남겼어요' : '아직 안 남겼어요'}</div>
                    </div>
                    {done && <Icon name="check" size={17} color={T.primary600} strokeWidth={3}/>}
                  </div>
                  {/* 매너 점수 — PUT companions/{userId}/review 의 mannerScore (1~5, 필수).
                      고르기 전에는 `눌러서 매겨요` 라고만 적는다 — 기본 점수를 채워두면
                      이미 매긴 것처럼 보이고, 매기지 않은 점수가 상대에게 남는다. */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 11 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: T.text700 }}>매너 점수</span>
                    <window.GapStarRating
                      value={score}
                      size={19}
                      gap={2}
                      label={`${mate.nickname} 매너 점수`}
                      testIdPrefix={`companion-manner-${mate.userId}`}
                      onPick={(next) => setScores((current) => ({ ...current, [mate.userId]: next }))}
                    />
                    <div style={{ flex: 1 }}/>
                    <span style={{ fontSize: 11, color: T.text400 }}>{score ? `${score}점` : '눌러서 매겨요'}</span>
                  </div>
                  <textarea
                    value={draft}
                    maxLength={40}
                    data-testid={`companion-review-${mate.userId}`}
                    onChange={(event) => setDrafts((current) => ({ ...current, [mate.userId]: event.target.value }))}
                    placeholder="한 줄 메시지를 남겨주세요 (최대 40자)"
                    aria-label={`${mate.nickname} 한 줄 메시지`}
                    style={{
                      width: '100%', marginTop: 10, minHeight: 44, resize: 'none', boxSizing: 'border-box',
                      borderRadius: 10, padding: '11px 12px',
                      border: `1px solid ${done ? T.primary100 : T.line200}`,
                      background: done ? RF.card : T.bgSubtle,
                      fontSize: 12.5, lineHeight: '18px', color: T.text900, fontFamily: T.fontStack,
                    }}
                  />
                  {!draft && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                      {presets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setDrafts((current) => ({ ...current, [mate.userId]: preset }))}
                          style={{
                            height: 28, padding: '0 10px', borderRadius: 999, display: 'inline-flex', alignItems: 'center',
                            border: `1px solid ${T.line200}`, background: RF.card, color: T.text700, fontSize: 11.5, fontWeight: 700,
                            fontFamily: T.fontStack, cursor: 'pointer',
                          }}>{preset}</button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
          {/* 동행자 목록이 비거나 아직 안 왔을 때 화면에서 섹션이 통째로 사라지면
              "동행자가 없는 것"과 "못 불러온 것"을 구분할 수 없다.
              안드로이드 TripMessageScreen 과 같은 문구로 상태를 남긴다. */}
          {!serverMode && (
          <div role="status" data-testid="trip-message-companions-state" style={{ marginTop: 16, padding: '28px 20px', borderRadius: 14, border: `1px solid ${RF.softLine}`, background: RF.card, textAlign: 'center', fontSize: 12.5, lineHeight: '20px', color: T.text500 }}>
            {companionsState === 'loading' && '불러오는 중이에요…'}
            {companionsState === 'empty' && '아직 함께 여행한 친구가 없어요.'}
            {companionsState === 'failed' && (
              <>불러오지 못했어요. <button type="button" onClick={() => setReloadKey((key) => key + 1)} style={{ padding: 0, border: 0, background: 'transparent', color: T.primary600, fontFamily: T.fontStack, fontSize: 12.5, fontWeight: 900, textDecoration: 'underline', cursor: 'pointer' }}>다시 시도</button></>
            )}
          </div>
          )}

          <div style={{ marginTop: 16 }}>
            <AddInfoBanner>
              메시지를 남기면 서로의 도감 카드가 완성돼요. 가끔 도감을 펼쳐 보면 그날의 여행이 다시 떠올라요.
            </AddInfoBanner>
          </div>

          {/* 27-4 코스 평가 — 14 코스 상세가 보여주는 평점을 만드는 **유일한** 자리다.
              여기서 권하지 않으면 아무도 평가하지 않아 평점이 영원히 비어 있다
              (막다른 길을 고치면서 새 막다른 길을 만든 적이 있다 — 정본 §6-4). */}
          <button type="button" data-testid="trip-message-course-rating" onClick={() => nav.go('course-rating')} style={{
            width: '100%', marginTop: 14, padding: 13, borderRadius: 12, border: `1px solid ${RF.softLine}`,
            background: RF.card, display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer',
            fontFamily: T.fontStack, textAlign: 'left',
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: T.primary50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="star" size={18} color={T.primary600}/>
            </div>
            <div style={{ flex: 1, fontSize: 12, color: T.text700, lineHeight: '17px' }}>
              다녀온 <b>코스</b>는 어떠셨어요?
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, color: T.primary600 }}>코스 평가 →</span>
          </button>

          <div style={{ marginTop: 10, padding: 13, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card, display: 'flex', alignItems: 'center', gap: 11 }}>
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

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}` }}>
          {saveError && <div role="alert" data-testid="trip-message-error" style={{ fontSize: 11.5, color: T.danger, marginBottom: 7 }}>{saveError}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" onClick={() => nav.go('dex')}>나중에</Btn>
            <div style={{ flex: 1 }}><Btn variant="primary" full disabled={saving} networkAction testId="trip-message-save" onClick={saveReviews}>메시지 남기고 도감 보기</Btn></div>
          </div>
        </div>
      </div>
    </Phone>
  );
}

/**
 * 접수 API 가 없는 신고(멤버·채팅방·댓글)를 **누른 자리에서** 안내한다.
 * 화면을 옮기지 않는다 — 문의 버튼은 29 설정 안에 있어서 거기로 보내면 하려던 일에서 멀어진다.
 * 문구·버튼은 네 표면이 같은 것을 쓴다 (정본 `docs/alignment/REPORT-CANON.md` §3).
 */
function ReportUnsupportedDialog({ onClose }) {
  const contact = window.MOYEO_CONTACT || {};
  const btn = {
    height: 44, borderRadius: 12, border: `1px solid ${T.line200}`, display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 13.5, fontWeight: 800,
    color: T.text900, textDecoration: 'none', background: 'transparent', cursor: 'pointer',
    fontFamily: T.fontStack,
  };
  return (
    <div role="dialog" aria-label="신고를 접수하지 못해요" data-testid="report-unsupported" style={{ position: 'absolute', inset: 0, zIndex: 40 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: T.bgOverlay }}/>
      <div style={{
        position: 'absolute', left: 24, right: 24, top: '50%', transform: 'translateY(-50%)',
        background: RF.card, borderRadius: 18, padding: '20px 18px 16px', boxShadow: T.l3,
      }}>
        <div style={{ fontSize: 15, fontWeight: 900 }}>신고를 접수하지 못해요</div>
        <div style={{ fontSize: 12.5, color: T.text500, marginTop: 8, lineHeight: '19px' }}>
          멤버·채팅방 신고는 아직 앱에서 받지 못해요. GitHub 이슈나 이메일로 알려주시면 확인할게요.
        </div>
        <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
          <a href={contact.issuesUrl} target="_blank" rel="noreferrer" data-testid="report-unsupported-issues" style={btn}>GitHub 이슈로 문의</a>
          <a href={`mailto:${contact.email}`} data-testid="report-unsupported-email" style={btn}>이메일로 문의</a>
          <button type="button" onClick={onClose} style={{ ...btn, border: 0, color: T.text500 }}>닫기</button>
        </div>
      </div>
    </div>
  );
}

// ───────── 30-2 · 피드 신고 시트 ─────────
//
// **피드 전용이다** (정본 `docs/alignment/REPORT-CANON.md`).
// 서버가 받는 신고는 피드뿐이다 — POST /api/v1/feeds/{feedId}/reports → 204 (2026-09-03 실측).
// 멤버·채팅방·댓글은 접수 API 가 없어 [ReportUnsupportedDialog] 로 그 자리에서 안내한다.
//
// 예전 이 시트는 사유 6종을 직접 갖고 있었고(`스팸 · 도박` 등 **서버 문구와 다른 라벨**이었다)
// 접수는 하지 않은 채 "신고 접수는 아직 서버에서 받지 않아 차단만 반영돼요" 라고 적었다 —
// 피드에 대해서는 거짓이라 걷어냈다.
function ScreenReportSheet() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const liveMode = window.MoyeoApi?.live();
  // 진입은 23 피드 상세의 신고 버튼이다 — 대상 피드는 selectFeed 로 정해져 있다.
  const feedId = liveMode ? window.MoyeoApi.selectedFeedId() : null;
  const DETAILS_LIMIT = 300;
  // 사유는 서버가 코드와 표시 문구를 함께 준다 (GET /feeds/report-reasons).
  // 못 받으면 사유를 지어내지 않고 상태만 그린다 (NO-MOCK-CANON R1).
  const [reasons, setReasons] = React.useState(null);
  const [feed, setFeed] = React.useState(null);
  const [status, setStatus] = React.useState('loading');
  const [reloadKey, setReloadKey] = React.useState(0);
  const [reason, setReason] = React.useState('');
  const [details, setDetails] = React.useState('');
  const [block, setBlock] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');
  // 신고와 차단은 **따로** 끝난다 — 신고가 204 여도 차단은 실패할 수 있다 (정본 §2).
  const [result, setResult] = React.useState(null);

  React.useEffect(() => {
    if (!liveMode) { setStatus('signed-out'); return undefined; }
    if (!feedId) { setStatus('no-target'); return undefined; }
    let active = true;
    setStatus('loading');
    Promise.all([window.MoyeoApi.feedReportReasons(), window.MoyeoApi.feedDetail(feedId)])
      .then(([list, detail]) => {
        if (!active) return;
        if (!Array.isArray(list) || list.length === 0 || detail?.feedId == null) { setStatus('error'); return; }
        setReasons(list);
        setFeed(detail);
        setReason(String(list[0].reason));
        // 자기 피드는 서버가 400 `40039` 로 거절한다. 버튼도 두지 않지만(23), 딥링크로 들어오면 여기서 막는다.
        const mine = window.MoyeoApi.myUserId?.();
        setStatus(mine != null && String(detail.author?.userId) === String(mine) ? 'own-feed' : 'ready');
      })
      .catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [liveMode, feedId, reloadKey]);

  const submit = async () => {
    if (!feed || !reason || submitting) return;
    setSubmitting(true);
    setSubmitError('');
    let reported = 'done';
    try {
      await window.MoyeoApi.reportFeed(feed.feedId, { reason, details });
    } catch (error) {
      // 409 `40917` 은 이미 신고한 피드다 — 붉은 오류가 아니라 안내다 (정본 §2).
      if (error?.status === 409) {
        reported = 'already';
      } else if (String(error?.code) === '40039' || error?.status === 403) {
        // 자기 피드다(400 `40039` · 정본이 처음 403 이라 적었던 그 자리). 다른 400 —
        // 예컨대 상세 301자 `40000` — 은 사유·입력 문제라 오류 문구로 남긴다.
        setSubmitting(false);
        setStatus('own-feed');
        return;
      } else {
        setSubmitting(false);
        setSubmitError(error?.message || '신고를 접수하지 못했어요. 잠시 후 다시 시도해주세요.');
        return;
      }
    }
    // 차단은 신고와 별개 요청이다 (POST users/me/blocks/{작성자 userId}).
    const authorId = feed.author?.userId;
    let blocked = 'skipped';
    let blockError = '';
    if (block && authorId != null) {
      try {
        await window.MoyeoApi.blockUser(authorId);
        blocked = 'done';
      } catch (error) {
        blocked = 'failed';
        blockError = error?.message || '차단하지 못했어요. 잠시 후 다시 시도해주세요.';
      }
    }
    setSubmitting(false);
    setResult({ reported, blocked, blockError });
  };

  // 컴포넌트가 아니라 **함수**다 — 렌더마다 새 컴포넌트 타입을 만들면 그 안의
  // textarea 가 매 입력마다 다시 마운트되어 포커스가 튄다.
  const sheet = (children) => (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, position: 'relative', overflow: 'hidden' }}>
        {/* 시트가 "이전 화면 위에 떠 있다"고 읽히도록 딤만 깐다 — 진입이 23 피드 상세이므로
            예전처럼 채팅방 본문을 배경으로 깔면 엉뚱한 화면이 뒤에 보인다. */}
        <div style={{ position: 'absolute', inset: 0, background: T.bgOverlay }}/>
        <div data-testid="report-sheet" style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: T.bgRaised, borderRadius: '24px 24px 0 0', padding: '10px 20px 32px', boxShadow: T.l3,
        }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: T.line300, margin: '0 auto 16px' }}/>
          <div style={{ fontSize: 15, fontWeight: 900 }}>신고 사유를 알려주세요</div>
          {children}
        </div>
      </div>
    </Phone>
  );

  // 접수·차단 결과 — 서버 정책 문구는 적지 않는다 (정본 §4).
  if (result) {
    return (
      sheet(<>
        <div data-testid="report-result" style={{ fontSize: 13, color: T.text700, marginTop: 14, lineHeight: '20px' }}>
          {result.reported === 'already' ? '이미 신고한 피드예요.' : '신고를 접수했어요.'}
        </div>
        {result.blocked === 'done' && (
          <div style={{ fontSize: 13, color: T.text700, marginTop: 6, lineHeight: '20px' }}>{feed.author?.nickname}님을 차단했어요.</div>
        )}
        {result.blocked === 'failed' && (
          <div role="alert" style={{ fontSize: 12.5, color: T.danger, marginTop: 6, lineHeight: '19px' }}>{result.blockError}</div>
        )}
        <div style={{ marginTop: 18 }}><Btn variant="secondary" full onClick={nav.back}>닫기</Btn></div>
      </>)
    );
  }

  if (status !== 'ready') {
    return (
      sheet(<>
        <div role="status" style={{ fontSize: 13, color: T.text500, marginTop: 16, lineHeight: '21px' }}>
          {status === 'loading' && '불러오는 중이에요…'}
          {status === 'signed-out' && '로그인하면 모집 중인 모임을 볼 수 있어요.'}
          {status === 'own-feed' && '내가 쓴 피드는 신고할 수 없어요.'}
          {status === 'no-target' && '불러오지 못했어요.'}
          {status === 'error' && (
            <>불러오지 못했어요. <button type="button" onClick={() => setReloadKey((key) => key + 1)} style={{ padding: 0, border: 0, background: 'transparent', color: T.primary600, fontFamily: T.fontStack, fontSize: 13, fontWeight: 900, textDecoration: 'underline', cursor: 'pointer' }}>다시 시도</button></>
          )}
        </div>
        <div style={{ marginTop: 18 }}><Btn variant="secondary" full onClick={nav.back}>닫기</Btn></div>
      </>)
    );
  }

  return (
    sheet(<>
      {/* 어떤 피드를 신고하는지 — 서버에서 받은 그 피드다 */}
      <div style={{ marginTop: 12, padding: 11, borderRadius: 10, background: T.bgSubtle, border: `1px solid ${RF.softLine}`, display: 'flex', gap: 9, alignItems: 'center' }}>
        <Icon name="feed" size={15} color={T.text500}/>
        <div style={{ flex: 1, fontSize: 12, color: T.text700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          해당 피드 · <span style={{ color: T.text500 }}>{feed.author?.nickname}{feed.content ? ` · ${feed.content}` : ''}</span>
        </div>
      </div>

      <div style={{ marginTop: 14, display: 'grid', gap: 6 }}>
        {reasons.map((item) => {
          const on = reason === String(item.reason);
          return (
            <button
              key={item.reason}
              type="button"
              onClick={() => setReason(String(item.reason))}
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
              {/* 서버 displayName 을 그대로 쓴다 — 화면이 라벨을 따로 갖지 않는다 */}
              <span style={{ fontSize: 13, fontWeight: on ? 800 : 600, color: on ? T.primary700 : T.text900 }}>{item.displayName}</span>
            </button>
          );
        })}
      </div>

      {/* 상세는 선택이고 서버 한도가 300자다 — 화면에서 그 한도를 지킨다 */}
      <div style={{ marginTop: 12 }}>
        <textarea
          value={details}
          onChange={(event) => setDetails(event.target.value.slice(0, DETAILS_LIMIT))}
          placeholder="어떤 점이 문제인지 알려주세요 (선택)"
          aria-label="신고 상세"
          data-testid="report-details"
          maxLength={DETAILS_LIMIT}
          rows={3}
          style={{
            width: '100%', resize: 'none', borderRadius: 11, padding: '11px 13px',
            border: `1px solid ${RF.softLine}`, background: RF.bg, color: T.text900,
            fontSize: 13, lineHeight: '19px', fontFamily: T.fontStack, boxSizing: 'border-box',
          }}/>
        <div style={{ fontSize: 11, color: T.text400, textAlign: 'right', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
          {details.length} / {DETAILS_LIMIT}
        </div>
      </div>

      <button
        type="button"
        data-testid="report-block-toggle"
        onClick={() => setBlock((value) => !value)}
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

      {submitError && <div role="alert" data-testid="report-error" style={{ fontSize: 11.5, color: T.danger, marginTop: 8 }}>{submitError}</div>}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <Btn variant="ghost" onClick={nav.back}>취소</Btn>
        <div style={{ flex: 1 }}><Btn variant="danger" full disabled={submitting} networkAction testId="report-submit" onClick={submit}>{submitting ? '접수 중...' : '신고하기'}</Btn></div>
      </div>
    </>)
  );
}


// ───────── 29-2 · 차단한 사용자 ─────────
function ScreenBlocked() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  // 로그인 상태: GET users/me/blocks 로 대체, 차단 해제는 DELETE blocks/{userId} 실연동.
  const liveMode = window.MoyeoApi?.live();
  const [serverBlocked, setServerBlocked] = React.useState(null);
  // 예전에는 실패하면 "목데이터 유지"였고, 그 목록의 `차단 해제` 는 눌러도 아무 일이 없었다
  // (담긴 사람이 지어낸 값이라 풀 대상이 없었다). NO-MOCK-CANON R1 대로
  // 빈 상태·로딩·오류·미로그인 넷 중 하나를 그린다.
  const [status, setStatus] = React.useState(liveMode ? 'loading' : 'signed-out');
  const loadBlocks = React.useCallback(() => {
    if (!liveMode) return undefined;
    let active = true;
    setStatus('loading');
    window.MoyeoApi.blocks()
      .then((result) => {
        if (!active) return;
        setServerBlocked(Array.isArray(result) ? result : []);
        setStatus('done');
      })
      .catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [liveMode]);
  React.useEffect(() => loadBlocks(), [loadBlocks]);
  // 29-1a 차단 해제 확인으로 보낸다. 화면 마지막 줄이 "해제 전에 한 번 더 확인해요" 라고
  // 약속하는데 실제로는 바로 풀렸다 (ATTACH-COMPOSER-CANON §6-1). 실제 DELETE 는 29-1a 가 부른다.
  const askUnblock = (item) => {
    window.MoyeoApi.selectBlockedUser({ userId: item.userId, nickname: item.nickname });
    nav.go('unblock-confirm');
  };

  const list = serverBlocked || [];
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="차단한 사용자" left center onBack={nav.back}/>
        <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 0, overflow: 'auto', paddingBottom: 24 }}>
          <div style={{ margin: '10px 20px 14px', padding: 13, borderRadius: 12, background: T.bgSubtle, border: `1px solid ${RF.softLine}`, fontSize: 11.5, lineHeight: '17px', color: T.text700 }}>
            차단하면 그 사람이 <b>만들었거나 참여한 모집</b>이 홈·탐색·코스 상세에서 모두 숨겨져요. 상대방에게는 알려지지 않아요.
          </div>
          <div data-testid="blocked-state">
            {status === 'signed-out' && (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13 }}>로그인하면 모집 중인 모임을 볼 수 있어요.</div>
            )}
            {status === 'loading' && (
              <div role="status" style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13 }}>불러오는 중이에요…</div>
            )}
            {status === 'error' && (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13 }}>
                <div role="alert">불러오지 못했어요.</div>
                <button type="button" data-testid="blocked-retry" onClick={loadBlocks} style={{ marginTop: 12, height: 36, padding: '0 14px', borderRadius: 10, border: `1px solid ${T.line200}`, background: 'transparent', color: T.primary600, fontSize: 12.5, fontWeight: 800, fontFamily: T.fontStack, cursor: 'pointer' }}>다시 시도</button>
              </div>
            )}
            {status === 'done' && list.length === 0 && (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13 }}>차단한 사용자가 없어요.</div>
            )}
          </div>
          {status === 'done' && list.map((item) => (
              <div key={item.userId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px' }}>
                {item.profileImageUrl
                  ? <img src={item.profileImageUrl} alt="" style={{ width: 42, height: 42, borderRadius: 999, objectFit: 'cover', background: T.bgSubtle }}/>
                  : <span style={{ width: 42, height: 42, borderRadius: 999, background: T.bgSubtle, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user" size={20} color={T.text500}/></span>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800 }}>{item.nickname}</div>
                  <div style={{ fontSize: 11, color: T.text500, marginTop: 3 }}>{window.MoyeoApi.formatRelative(item.blockedAt)} 차단</div>
                </div>
                <button type="button" data-testid={`unblock-${item.userId}`} onClick={() => askUnblock(item)} style={{ height: 32, padding: '0 12px', borderRadius: 10, border: `1px solid ${T.line200}`, background: 'transparent', color: T.text700, fontSize: 12, fontWeight: 800, fontFamily: T.fontStack, cursor: 'pointer' }}>차단 해제</button>
              </div>
          ))}
          {/* 목록이 있을 때만 남기는 안내다 — 풀 대상이 없는 화면에서 "해제 전에 확인해요" 는 말이 안 된다. */}
          {status === 'done' && list.length > 0 && (
            <div style={{ margin: '16px 20px 0', fontSize: 11, color: T.text400, lineHeight: '17px' }}>
              차단을 해제하면 서로의 모집·피드를 다시 볼 수 있어요. 해제 전에 한 번 더 확인해요.
            </div>
          )}
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
  // 미리보기에 들어가는 코스 이름·작성자는 서버 값만 쓴다 — 기획 예시 코스를 박아두지 않는다.
  const liveMode = window.MoyeoApi?.live();
  const [profile, setProfile] = React.useState(null);
  React.useEffect(() => {
    if (!liveMode) return undefined;
    let active = true;
    window.MoyeoApi.myProfile()
      .then((result) => { if (active && result?.nickname) setProfile(result); })
      .catch(() => { /* 실패하면 작성자 줄을 익명으로 둔다 */ });
    return () => { active = false; };
  }, [liveMode]);
  const authorAvatar = window.MoyeoApi?.avatarForNickname?.(profile?.nickname);

  // 공개 대상 코스 — **다녀온 여행**의 코스다 (27-1·27-4 와 같은 판정).
  // 예전에는 코스를 부르지도 않고 모집 만들기 초안의 제목만 보여줬고,
  // `공개할게요` 는 화면만 넘겼다 — **서버를 한 번도 부르지 않았다**(iOS 도 같은 결함이었다).
  // 근거: POST /api/v1/travel-courses/{courseId}/publication { title, description, showCreatorNickname }
  const [course, setCourse] = React.useState(null);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [publishBusy, setPublishBusy] = React.useState(false);
  const [publishError, setPublishError] = React.useState('');
  React.useEffect(() => {
    if (!liveMode) return undefined;
    let active = true;
    window.MoyeoApi.completedTripRoomId()
      .then((roomId) => (roomId ? window.MoyeoApi.roomCourse(roomId) : null))
      .then((result) => {
        if (!active || !result?.course) return;
        setCourse(result.course);
        setTitle(result.course.title || '');
        setDescription(result.course.description || '');
      })
      .catch(() => { /* 코스를 못 읽으면 제목·소개를 비워 둔다 (지어내지 않는다) */ });
    return () => { active = false; };
  }, [liveMode]);
  const courseTitle = title;
  // 제목·소개는 서버가 **둘 다 필수**로 받는다. 하나라도 비면 보내지 않는다.
  const canPublish = Boolean(course?.courseId) && title.trim() && description.trim();
  const publish = async () => {
    if (!canPublish || publishBusy) return;
    setPublishBusy(true);
    setPublishError('');
    try {
      await window.MoyeoApi.publishCourse(course.courseId, {
        title: title.trim(), description: description.trim(), showCreatorNickname: credit,
      });
      window.MoyeoApi.selectCourse(course.courseId);
      setConfirm(false);
      nav.go('course');
    } catch (error) {
      setPublishError(error?.message || '코스를 공개하지 못했어요.');
      setPublishBusy(false);
    }
  };
  const publishInputStyle = {
    width: '100%', borderRadius: 12, border: `1px solid ${T.line200}`, padding: '12px',
    fontSize: 13, color: T.text900, background: RF.bg, fontFamily: T.fontStack, outline: 'none', boxSizing: 'border-box',
  };

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
              {/* 서버 코스 썸네일. 없으면 RoomThumb 이 공용 자리표시자를 그린다 (NO-MOCK R4) */}
              <window.RoomThumb src={course?.thumbnail} height={132}/>
              <span style={{
                position: 'absolute', left: 12, bottom: 12, height: 26, padding: '0 10px', borderRadius: 999,
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: T.overlayPanel, color: T.primary700, fontSize: 11, fontWeight: 900,
              }}>
                <Icon name="user" size={12} color={T.primary700} strokeWidth={2}/> 여행자 코스
              </span>
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 900 }}>{courseTitle}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10 }}>
                {authorAvatar?.kind
                  ? <AnimalAvatar kind={authorAvatar.kind} size={22} bg={T.primary50}/>
                  : <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: 999, background: T.primary50, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, lineHeight: 1 }}>{authorAvatar?.emoji || '🐾'}</span>}
                <span style={{ fontSize: 11.5, color: T.text700, fontWeight: 700 }}>{credit && profile?.nickname ? `${profile.nickname} 님이 다녀온 코스` : '익명 여행자가 다녀온 코스'}</span>
              </div>
            </div>
          </div>

          {/* 제목·소개는 서버가 둘 다 **필수**로 받는다 — 읽기 전용 상자로 두면 공개 자체가 불가능하다 */}
          <div style={{ marginTop: 18 }}>
            <AddFieldLabel required>코스 이름</AddFieldLabel>
            <input
              type="text"
              data-testid="course-publish-title"
              aria-label="코스 이름"
              value={title}
              maxLength={100}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="공개할 코스 이름"
              style={{ ...publishInputStyle, height: 46 }}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <AddFieldLabel required>한 줄 소개</AddFieldLabel>
            <textarea
              data-testid="course-publish-description"
              aria-label="한 줄 소개"
              value={description}
              maxLength={500}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="다녀온 사람만 쓸 수 있는 한 줄이 코스의 값어치예요."
              style={{ ...publishInputStyle, minHeight: 76, resize: 'none', lineHeight: '20px' }}
            />
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
          <div style={{ flex: 1 }}><Btn variant="primary" full disabled={!canPublish} testId="course-publish-open" onClick={() => setConfirm(true)}>코스 공개하기</Btn></div>
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
              {publishError && <div role="alert" data-testid="course-publish-error" style={{ marginTop: 12, fontSize: 11.5, color: T.danger, lineHeight: '17px' }}>{publishError}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                <Btn variant="ghost" onClick={() => { setConfirm(false); setPublishError(''); }}>취소</Btn>
                <div style={{ flex: 1 }}><Btn variant="primary" full disabled={publishBusy} networkAction testId="course-publish-confirm" onClick={publish}>{publishBusy ? '공개하는 중...' : '공개할게요'}</Btn></div>
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
  ChatMenuBody,
  ScreenMemberActions,
  ScreenMemberRemove,
  ScreenChatAttach,
  ScreenFriends,
  ScreenTripMessage,
  ScreenReportSheet,
  // 15 모집 상세(screens-refined)가 먼저 로드되므로 그 쪽은 window 로 참조한다.
  ReportUnsupportedDialog,
  ScreenBlocked,
  ScreenCoursePublish,
});
