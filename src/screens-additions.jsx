// 추가 요청 사항 반영 화면 모음
// (1) 모집 생성 — 당일치기/1박 이상 분기 일정 입력
// (2) 모집 생성 — 집합 장소(위경도) · 집합 시간 지정
// (3) 모집 생성 — 코스 직접 만들기 (커스텀 코스 에디터)
// (4) 모집 생성 — 리뷰 단계에서 코스 출처(등록 코스 차용 / 직접 만든 코스) 확정
// (5) 호스트 경로 관리 — 확정 전까지 수정 가능 / 등록 코스는 잠금 / 확정 후 잠금
// (6) 채팅방 — 공지 이력 페이지
// 참가 신청 상태별 목록은 screens-extra.jsx의 ScreenChatList '신청중' 탭에서 다룬다.
//
// 이 파일은 screens-refined.jsx 뒤에 로드되어 refined의 Phone/Header/Btn/Chip 등을 그대로 사용한다.
//
// 코스 출처 2가지 (서비스 정책)
//   linked : 서비스에 등록된 코스를 그대로 차용 → 경로 수정 불가, 집합 정보만 수정 가능
//   custom : 호스트가 직접 만든 코스 → 여행 확정 전까지 호스트가 자유롭게 수정 가능

// ───────── 공통 소품 ─────────

function AddStepDots({ active = 1 }) {
  const steps = ['코스', '일정', '인원', '세부', '리뷰'];
  const icons = ['map', 'calendar', 'users', 'note', 'star'];
  return (
    <div style={{ padding: '6px 20px 0', display: 'flex', justifyContent: 'space-between' }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: i === active ? T.primary600 : i < active ? T.primary500 : T.text400 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 999,
            border: `1px solid ${i <= active ? T.primary500 : T.line200}`,
            background: i === active ? T.primary50 : RF.card,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={i < active ? 'check' : icons[i]} size={16} color="currentColor" strokeWidth={i < active ? 2.6 : 1.6}/>
          </div>
          <div style={{ fontSize: 10, fontWeight: 800 }}>{s}</div>
        </div>
      ))}
    </div>
  );
}

function AddFieldLabel({ children, required }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 800, color: T.text500, marginBottom: 7, display: 'flex', alignItems: 'center', gap: 4 }}>
      {children}
      {required && <span style={{ color: T.accent500 }}>*</span>}
    </div>
  );
}

// AddFieldBox 와 같은 모양이지만 **사용자가 직접 입력하는** 칸이다.
// 모집 만들기의 이름·참가비처럼 서버에도, 화면기획에도 정답이 없는 값에 쓴다 —
// 미리 채워 두면 그건 목데이터다 (NO-MOCK-CANON R1).
function AddFieldInput({ icon, value, onChange, placeholder, caption, testId, inputMode }) {
  return (
    <div>
      <div style={{
        width: '100%', height: 48, borderRadius: 12,
        border: `1px solid ${T.line200}`, background: RF.card,
        display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px',
      }}>
        {icon && <Icon name={icon} size={17} color={T.text500}/>}
        <input
          data-testid={testId}
          value={value}
          inputMode={inputMode}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1, minWidth: 0, height: 46, border: 0, outline: 'none', background: 'transparent',
            fontSize: 13, fontWeight: value ? 800 : 500, color: T.text900,
            fontFamily: T.fontStack, fontVariantNumeric: 'tabular-nums', padding: 0,
          }}
        />
      </div>
      {caption && <div style={{ fontSize: 11, color: T.text500, marginTop: 6, lineHeight: '16px' }}>{caption}</div>}
    </div>
  );
}

function AddFieldBox({ icon, value, placeholder, caption, onClick, chevron = true, compact = false }) {
  const filled = Boolean(value);
  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        style={{
          width: '100%', height: compact ? 44 : 48, borderRadius: 12,
          border: `1px solid ${T.line200}`, background: RF.card,
          display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px',
          fontFamily: T.fontStack, cursor: onClick ? 'pointer' : 'default', textAlign: 'left',
        }}>
        {icon && <Icon name={icon} size={17} color={T.text500}/>}
        <span style={{
          flex: 1, fontSize: 13, fontWeight: filled ? 800 : 500,
          color: filled ? T.text900 : T.text400,
          fontVariantNumeric: 'tabular-nums',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{value || placeholder}</span>
        {chevron && <Icon name="arrow" size={15} color={T.text400}/>}
      </button>
      {caption && <div style={{ fontSize: 11, color: T.text500, marginTop: 6, lineHeight: '16px' }}>{caption}</div>}
    </div>
  );
}

function AddInfoBanner({ children, tone = 'primary' }) {
  const tones = {
    primary: { bg: T.primary50, bd: T.primary100, fg: T.primary700, icon: 'sparkle' },
    warning: { bg: T.warningBg, bd: T.warningBg, fg: T.warningText, icon: 'clock' },
  };
  const t = tones[tone] || tones.primary;
  return (
    <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: 13, borderRadius: 12, background: t.bg, border: `1px solid ${t.bd}` }}>
      <Icon name={t.icon} size={16} color={t.fg}/>
      <div style={{ flex: 1, fontSize: 12, lineHeight: '18px', color: t.fg }}>{children}</div>
    </div>
  );
}

function AddSegmented({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 14, background: T.bgSubtle, border: `1px solid ${RF.softLine}` }}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            data-testid={`segment-${o.id}`}
            aria-pressed={on}
            onClick={() => onChange(o.id)}
            style={{
              flex: 1, height: 42, borderRadius: 11, cursor: 'pointer', fontFamily: T.fontStack,
              border: `1px solid ${on ? T.primary500 : 'transparent'}`,
              background: on ? RF.card : 'transparent',
              color: on ? T.primary600 : T.text500,
              boxShadow: on ? T.l1 : 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
            }}>
            <span style={{ fontSize: 13, fontWeight: 800 }}>{o.label}</span>
            {o.sub && <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.75 }}>{o.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ───────── 17-2 · 모집 만들기 Step 2 — 일정 (당일치기 / 1박 이상) ─────────
function ScreenCreateSchedule() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const [type, setType] = React.useState('day');
  const day = type === 'day';
  // 로그인 상태에서는 실제로 등록될 일정(오늘 기준 미래 날짜)을 그대로 보여준다.
  // 보이는 값과 보내는 값을 일치시킨다 — 일정이 없으면 칸을 비워 둔다.
  const liveMode = window.MoyeoApi?.live();
  const schedule = React.useMemo(() => (liveMode ? window.MoyeoApi.defaultRoomSchedule() : null), [liveMode]);
  const dateText = (value) => window.MoyeoApi.formatDate(value);
  // 17-4 에서 고른 집합 장소만 보여준다 — 고르기 전에는 기획 좌표를 대신 채우지 않는다.
  const meetDraft = liveMode ? (window.MoyeoApi?.roomDraft?.() || {}) : {};
  const meetPoint = (Number.isFinite(Number(meetDraft.meetingLatitude)) && Number.isFinite(Number(meetDraft.meetingLongitude)))
    ? { lat: Number(meetDraft.meetingLatitude), lng: Number(meetDraft.meetingLongitude) }
    : null;
  const meetingDetails = meetDraft.meetingDetails || '';
  const meetingSummary = meetPoint && schedule
    ? `${schedule.meetingTime} 집합 · ${meetPoint.lat.toFixed(4)}, ${meetPoint.lng.toFixed(4)}`
    : '';
  const goNext = () => {
    window.MoyeoApi?.updateRoomDraft({
      tripType: day ? 'DAY_TRIP' : 'OVERNIGHT',
      ...(schedule || {}),
      // 이 화면에 보이는 집합 정보를 그대로 넘긴다 (17-4 에서 바꿨으면 그 값이 이미 들어 있다).
      meetingDetails,
      ...(meetPoint ? { meetingLatitude: meetPoint.lat, meetingLongitude: meetPoint.lng } : {}),
    });
    nav.go('create-people');
  };

  return (
    <Phone>
      <div data-testid="create-schedule" style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="모집 만들기 (2/5)" left center onBack={nav.back}/>
        <AddStepDots active={1}/>

        <div style={{ position: 'absolute', top: 148, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '0 20px 20px' }}>
          <div style={{ fontSize: 15, fontWeight: 900 }}>일정 정하기</div>
          <div style={{ fontSize: 12, color: T.text500, marginTop: 6 }}>당일치기인지 먼저 골라주세요. 입력하는 항목이 달라져요.</div>

          <div style={{ marginTop: 14 }}>
            <AddSegmented
              value={type}
              onChange={setType}
              options={[
                { id: 'day', label: '당일치기', sub: '시작·종료 시간' },
                { id: 'overnight', label: '1박 이상', sub: '시작·종료 날짜' },
              ]}
            />
          </div>

          {day ? (
            <div style={{ marginTop: 18, display: 'grid', gap: 16 }}>
              <div>
                <AddFieldLabel required>여행 날짜</AddFieldLabel>
                <AddFieldBox icon="calendar" value={schedule ? dateText(schedule.startDate) : '2026. 05. 25 (토)'}/>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <AddFieldLabel required>여행 시작 시간</AddFieldLabel>
                  <AddFieldBox icon="clock" value="08:00" chevron={false}/>
                </div>
                <div>
                  <AddFieldLabel required>여행 종료 시간</AddFieldLabel>
                  <AddFieldBox icon="clock" value="18:00" chevron={false}/>
                </div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 13px',
                borderRadius: 12, background: T.bgSubtle, border: `1px solid ${RF.softLine}`,
              }}>
                <Chip variant="soft">당일치기</Chip>
                <span style={{ fontSize: 12, fontWeight: 800, color: T.text700, fontVariantNumeric: 'tabular-nums' }}>{schedule ? `${dateText(schedule.startDate)} ${schedule.dayTripStartTime} – ${schedule.dayTripEndTime} · 10시간` : ''}</span>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 18, display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <AddFieldLabel required>시작 날짜</AddFieldLabel>
                  <AddFieldBox icon="calendar" value={schedule ? dateText(schedule.startDate) : '05.25 (토)'} chevron={false}/>
                </div>
                <div>
                  <AddFieldLabel required>종료 날짜</AddFieldLabel>
                  <AddFieldBox icon="calendar" value={schedule ? dateText(schedule.endDate) : '05.26 (일)'} chevron={false}/>
                </div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 13px',
                borderRadius: 12, background: T.bgSubtle, border: `1px solid ${RF.softLine}`,
              }}>
                <Chip variant="soft">1박 2일</Chip>
                <span style={{ fontSize: 12, fontWeight: 800, color: T.text700, fontVariantNumeric: 'tabular-nums' }}>{schedule ? `${dateText(schedule.startDate)} ~ ${dateText(schedule.endDate)}` : ''}</span>
              </div>
            </div>
          )}

          <div style={{ marginTop: 22, height: 1, background: RF.softLine }}/>

          <div style={{ marginTop: 20 }}>
            <AddFieldLabel required>모집 마감일</AddFieldLabel>
            <AddFieldBox
              icon="clock"
              value={schedule ? `${dateText(schedule.recruitmentDeadlineDate)} 23:59` : '2026. 05. 22 (목) 23:59'}
              caption="출발 3일 전까지만 선택할 수 있어요. 마감일에 최소 인원을 못 채우면 자동으로 소멸돼요."
            />
          </div>

          <div style={{ marginTop: 20 }}>
            <AddFieldLabel required>집합 장소 · 집합 시간</AddFieldLabel>
            <button
              type="button"
              onClick={() => nav.go('create-meet')}
              style={{
                width: '100%', borderRadius: 12, border: `1px solid ${T.line200}`, background: RF.card,
                padding: 13, display: 'flex', gap: 11, alignItems: 'center', cursor: 'pointer',
                fontFamily: T.fontStack, textAlign: 'left',
              }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: T.primary50, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="pin" size={18} color={T.primary600}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{meetingDetails}</div>
                <div style={{ fontSize: 11, color: T.text500, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{meetingSummary}</div>
              </div>
              <Icon name="arrow" size={15} color={T.text400}/>
            </button>
          </div>

          <div style={{ marginTop: 18 }}>
            <AddInfoBanner>
              여행 시간과 집합 시간은 채팅방 상단과 모집 상세에 그대로 노출돼요. 지도 핀으로 잡은 좌표가 함께 저장돼 길 찾기까지 이어져요.
            </AddInfoBanner>
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

// ───────── 17-3 · 모집 만들기 Step 3 — 인원 ─────────
function ScreenCreatePeople() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const [minimum, setMinimum] = React.useState(3);
  const [capacity, setCapacity] = React.useState(5);
  const Counter = ({ label, value, decrease, increase, canDecrease, canIncrease }) => (
    <div style={{ minHeight: 66, padding: '12px 14px', borderRadius: 12, border: `1px solid ${T.line200}`, background: RF.card, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, fontSize: 13, fontWeight: 800 }}>{label}</div>
      <button type="button" onClick={decrease} disabled={!canDecrease} aria-label={`${label} 줄이기`} style={{ width: 38, height: 38, borderRadius: 999, border: `1px solid ${T.line200}`, background: RF.card, color: T.text700, fontSize: 20, cursor: canDecrease ? 'pointer' : 'default', opacity: canDecrease ? 1 : .35 }}>−</button>
      <div style={{ width: 40, textAlign: 'center', fontSize: 15, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{value}명</div>
      <button type="button" onClick={increase} disabled={!canIncrease} aria-label={`${label} 늘리기`} style={{ width: 38, height: 38, borderRadius: 999, border: `1px solid ${T.line200}`, background: RF.card, color: T.text700, fontSize: 20, cursor: canIncrease ? 'pointer' : 'default', opacity: canIncrease ? 1 : .35 }}>+</button>
    </div>
  );

  return (
    <Phone>
      <div data-testid="create-people" style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="모집 만들기 (3/5)" left center onBack={nav.back}/>
        <AddStepDots active={2}/>
        <div style={{ position: 'absolute', top: 148, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '0 20px 20px' }}>
          <div style={{ fontSize: 15, fontWeight: 900 }}>인원 정하기</div>
          <div style={{ fontSize: 12, color: T.text500, marginTop: 6 }}>최소 출발 인원과 최대 모집 인원을 정해주세요.</div>
          <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
            <Counter label="최소 출발 인원" value={minimum} canDecrease={minimum > 2} canIncrease={minimum < capacity} decrease={() => setMinimum((v) => v - 1)} increase={() => setMinimum((v) => v + 1)}/>
            <Counter label="최대 모집 인원" value={capacity} canDecrease={capacity > Math.max(3, minimum)} canIncrease={capacity < 12} decrease={() => setCapacity((v) => v - 1)} increase={() => setCapacity((v) => v + 1)}/>
            <AddInfoBanner>최소 인원이 모이면 채팅방이 자동으로 열려요. 모집 마감 전까지 정원을 채울 수 있어요.</AddInfoBanner>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8 }}>
          <Btn variant="ghost" onClick={nav.back}>이전</Btn>
          <div style={{ flex: 1 }}><Btn variant="primary" full onClick={() => nav.go('create-meet')}>다음</Btn></div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 17-4 · 모집 만들기 Step 4 — 집합 장소 지정 ─────────
function ScreenCreateMeetPoint() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  // 상세 안내는 호스트가 직접 적는 값이다 — 예시 문구를 미리 채우면 그대로 저장된다.
  const [detail, setDetail] = React.useState('');
  // 지도의 첫 중심은 경북 중앙이다 — 특정 장소(기획의 청송 터미널)를 미리 고른 것처럼 두지 않는다.
  const [point, setPoint] = React.useState({ lat: 36.4, lng: 128.9 });
  // 좌표는 실지도의 드래그 핀만 바꾼다.
  const initialPoint = React.useRef(point);
  // 17-3 · 호스트가 기존 방의 집합 정보를 고치는 진입이면 PUT chat-rooms/{id}/meeting-info 로 저장한다.
  // 여행 확정 전까지만 허용된다(40913). 모집 만들기(2/5) 진입이면 아래 draft 경로가 그대로 남는다.
  const liveMode = window.MoyeoApi?.live();
  const editRoomId = liveMode ? window.MoyeoApi.meetingEditRoomId() : null;
  const [editRoom, setEditRoom] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => {
    if (!editRoomId) return undefined;
    let active = true;
    window.MoyeoApi.roomDetail(editRoomId)
      .then((result) => {
        if (!active || result?.roomId == null) return;
        setEditRoom(result);
        if (result.meetingDetails) setDetail(result.meetingDetails);
        if (result.meetingLatitude != null && result.meetingLongitude != null) {
          const next = { lat: Number(result.meetingLatitude), lng: Number(result.meetingLongitude) };
          initialPoint.current = next;
          setPoint(next);
        }
      })
      .catch(() => { /* 실패 시 기획 목데이터 좌표가 그대로 남는다 */ });
    return () => { active = false; };
  }, [editRoomId]);
  // 17-5 요약이 이어받는 집합 정보. 좌표는 지도 핀이 잡은 값을 그대로 쓴다.
  const confirmPoint = async () => {
    if (editRoom) {
      if (saving) return;
      setSaving(true);
      try {
        // meetingDateTime 은 서버 필수 필드이고 이 화면에 시간 입력 자리가 없어 방의 현재 값을 유지한다.
        await window.MoyeoApi.updateMeetingInfo(editRoomId, window.MoyeoApi.buildMeetingInfoRequest(editRoom, {
          meetingDetails: detail,
          meetingLatitude: point.lat,
          meetingLongitude: point.lng,
        }));
        window.MoyeoApi.selectMeetingEditRoom(null);
        // 이전 화면(여행 경로)으로 돌아가면 그 화면이 다시 조회해 바뀐 집합 정보를 보여준다
        nav.back();
      } catch (_) {
        setSaving(false); // 실패 시 화면을 유지한다 (기획에 오류 문구 자리가 없다)
      }
      return;
    }
    window.MoyeoApi?.updateRoomDraft({
      meetingDetails: detail.trim() || null,
      meetingLatitude: point.lat,
      meetingLongitude: point.lng,
    });
    nav.back();
  };
  const cancelEdit = () => {
    if (editRoomId) window.MoyeoApi.selectMeetingEditRoom(null);
    nav.back();
  };

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        {/* 집합 장소는 일정 단계(2/5)에서 열리는 화면이라 단계 뷰를 그대로 유지한다 */}
        <Header title="모집 만들기 (2/5)" left center onBack={nav.back}/>
        <AddStepDots active={1}/>

        <div style={{ position: 'absolute', top: 148, left: 0, right: 0, bottom: 96, overflow: 'auto' }}>
          <div style={{ padding: '0 20px 14px' }}>
            <div style={{ fontSize: 15, fontWeight: 900 }}>집합 장소 정하기</div>
            <div style={{ fontSize: 12, color: T.text500, marginTop: 6 }}>검색하거나 지도의 핀을 움직여 정확한 위치를 알려주세요.</div>
          </div>
          <div style={{ position: 'relative' }}>
            <MiniMap
              height={244}
              level={4}
              center={initialPoint.current}
              draggablePin
              onPinMove={setPoint}
            />
            {/* 핀은 실제 카카오 지도의 드래그 마커다 — 목업 위에 얹던 가짜 핀 버튼은 지웠다(R4). */}
            <div style={{
              position: 'absolute', left: 14, right: 14, top: 14, height: 42, borderRadius: 12,
              background: T.overlayPanel, border: `1px solid ${T.line200}`, boxShadow: T.l1,
              display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px',
            }}>
              <Icon name="search" size={17} color={T.text500}/>
              <span style={{ fontSize: 13, color: T.text400 }}>장소 검색</span>
            </div>
            <div style={{
              position: 'absolute', left: 14, bottom: 14,
              padding: '7px 11px', borderRadius: 999, background: T.overlayPanel,
              border: `1px solid ${T.line200}`, boxShadow: T.l1,
              fontSize: 11, fontWeight: 800, color: T.text700,
            }}>핀을 끌어 위치를 조정하세요</div>
          </div>

          <div style={{ padding: '18px 20px 20px', display: 'grid', gap: 16 }}>
            {/* 집합 장소 이름은 좌표를 장소명으로 바꿔줄 API 가 없어 두지 않는다(§4) —
                아래 좌표와 상세 안내가 실제로 저장되는 값이다. */}

            <div>
              <AddFieldLabel>상세 안내</AddFieldLabel>
              {/* 추천 칩 선택이 아니라 유저가 자유롭게 입력하는 텍스트 필드다 (changeLog15) */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 9, height: 48, padding: '0 13px', borderRadius: 12, border: `1px solid ${T.line200}`, background: RF.card }}>
                <Icon name="note" size={17} color={T.text500}/>
                <input
                  type="text"
                  value={detail}
                  onChange={(event) => setDetail(event.target.value)}
                  placeholder="만나는 위치를 자세히 남겨주세요 (예: 터미널 정문 앞)"
                  aria-label="집합 장소 상세 안내"
                  data-testid="meeting-detail-input"
                  style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', fontFamily: T.fontStack, fontSize: 13.5, fontWeight: 700, color: T.text900 }}
                />
              </label>
            </div>

            <div>
              <AddFieldLabel>좌표 (자동 저장)</AddFieldLabel>
              <div style={{
                borderRadius: 12, border: `1px solid ${RF.softLine}`, background: T.bgSubtle,
                padding: 13, display: 'grid', gap: 8,
              }}>
                {/* 위경도는 한 줄 — lat/lng를 따로 읽을 일이 없고 줄이 늘면 카드만 커진다 (화면기획·앱과 동일) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <Icon name="map" size={15} color={T.text500}/>
                  <span style={{ flex: 1, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                    <span data-testid="meeting-latitude">{point.lat.toFixed(6)}</span>
                    {', '}
                    <span data-testid="meeting-longitude">{point.lng.toFixed(6)}</span>
                  </span>
                </div>
                <div style={{ height: 1, background: RF.softLine }}/>
                <div style={{ fontSize: 11, color: T.text500, lineHeight: '16px' }}>
                  좌표가 저장되면 채팅방 지도 카드 · 길 찾기 · 근처 모집 추천에 같은 위치가 쓰여요.
                </div>
              </div>
            </div>

            <div>
              <AddFieldLabel required>집합 시간</AddFieldLabel>
              <AddFieldBox
                icon="clock"
                value="07:50"
                chevron={false}
                caption="여행 시작 08:00보다 10분 이른 시간이에요. 출발 시간과 같거나 이르게만 정할 수 있어요."
              />
            </div>

            <AddInfoBanner tone="warning">
              집합 시간 30분 전에 모든 멤버에게 알림이 가고, 채팅방 상단 공지에도 자동으로 올라가요.
            </AddInfoBanner>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8 }}>
          <Btn variant="ghost" onClick={cancelEdit}>이전</Btn>
          <div style={{ flex: 1 }}><Btn variant="primary" full disabled={saving} testId="meeting-confirm" onClick={confirmPoint}>이 위치로 지정</Btn></div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 17-4 · 코스 직접 만들기 (커스텀 코스 에디터) ─────────
function ScreenCustomCourse() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const [query, setQuery] = React.useState('');
  // 에디터는 빈 코스로 시작한다 — 예시 방문지 3곳을 미리 담아두면 사용자가 짜지 않은 코스가 저장된다.
  const [stops, setStops] = React.useState([]);
  // 1박 이상이면 일차가 늘어난다. customCourse 의 방문지마다 dayNumber 가 필수다.
  const [days, setDays] = React.useState(1);
  const [activeDay, setActiveDay] = React.useState(1);

  // ── 방문지 검색 (GET /tourism-contents?keyword=) ──
  // 예전에는 `검색` 이 17-1a 장소 검색 화면으로 넘어가면서 **입력한 검색어를 버렸고**,
  // 담긴 방문지는 사용자가 타이핑한 글자였다. 그래서 contentId 가 없어
  // 17-5 요약이 "직접 만든 코스는 customCourse 를 조립할 수 없다"며 생성을 막고 있었다.
  // 여기서 바로 검색해 **서버 콘텐츠를 고르게** 하면 contentId 가 함께 담긴다.
  const [keyword, setKeyword] = React.useState('');
  const [results, setResults] = React.useState([]);
  const [searchStatus, setSearchStatus] = React.useState('idle');
  React.useEffect(() => {
    if (!keyword) { setResults([]); setSearchStatus('idle'); return undefined; }
    let active = true;
    setSearchStatus('loading');
    window.MoyeoTourism.list({ keyword, size: 20 })
      .then((result) => {
        if (!active) return;
        setResults(result.items || []);
        setSearchStatus('done');
      })
      .catch(() => { if (active) { setResults([]); setSearchStatus('error'); } });
    return () => { active = false; };
  }, [keyword]);
  const runSearch = () => setKeyword(query.trim());

  const addStop = (place) => {
    if (stops.length >= 20) return;
    // 서버 콘텐츠만 담는다 — 검색 결과를 고르지 않으면 담을 방문지가 없다.
    if (!place?.contentId) return;
    setStops((current) => [...current, {
      id: `${place.contentId}-${Date.now()}`,
      contentId: place.contentId,
      name: place.title,
      memo: place.address || '',
      day: activeDay,
      time: '',
    }]);
    setQuery('');
    setKeyword('');
  };
  const removeStop = (id) => setStops((s) => s.filter((x) => x.id !== id));
  // 마지막 일차만 늘리고 줄인다. 중간 일차를 지우면 남은 방문지의 일차가 어긋난다.
  const addDay = () => {
    if (days >= 10) return;
    setDays((d) => d + 1);
    setActiveDay(days + 1);
  };
  // 순서 바꾸기는 **같은 일차 안에서만** 한다 — 일차 경계를 넘기면
  // 방문지의 dayNumber 가 화면에 보이는 자리와 어긋난다.
  const moveStop = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= stops.length) return;
    if (stops[index].day !== stops[target].day) return;
    setStops((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="코스 직접 만들기" left center onBack={nav.back}/>

        <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '0 20px 20px' }}>
          {/* 방문지 좌표가 없으면 지도를 그리지 않는다 — 손으로 그린 지도는 두지 않는다(R4). */}

          <form onSubmit={(event) => { event.preventDefault(); runSearch(); }} style={{ marginTop: 14, height: 42, borderRadius: 11, border: `1px solid ${T.line200}`, display: 'flex', alignItems: 'center', gap: 9, padding: '0 8px 0 13px' }}>
            <Icon name="search" size={17} color={T.text500}/>
            <input data-testid="tourapi-place-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="방문지 검색 (TourAPI · 경북 22개 시·군)" style={{ minWidth: 0, flex: 1, border: 0, outline: 0, background: 'transparent', color: T.text900, fontFamily: T.fontStack, fontSize: 13 }}/>
            {/* type=button — form onSubmit(Enter)과 같은 일을 하되 제출이 두 번 일어나지 않게 한다. */}
            <button type="button" data-testid="custom-course-search" onClick={runSearch} style={{ height: 30, padding: '0 10px', border: 0, borderRadius: 8, background: T.primary50, color: T.primary700, fontFamily: T.fontStack, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>검색</button>
          </form>

          {/* 검색 결과. 고르면 그 방문지가 지금 고른 일차에 담긴다.
              서버가 준 콘텐츠만 그린다 — 결과가 없으면 예시 장소를 대신 두지 않는다(R1). */}
          {searchStatus !== 'idle' && (
            <div data-testid="custom-course-results" style={{ marginTop: 10 }}>
              {searchStatus === 'loading' && <div role="status" style={{ padding: '18px 0', textAlign: 'center', fontSize: 12.5, color: T.text500 }}>불러오는 중이에요…</div>}
              {searchStatus === 'error' && <div role="alert" style={{ padding: '18px 0', textAlign: 'center', fontSize: 12.5, color: T.text500 }}>불러오지 못했어요.</div>}
              {searchStatus === 'done' && results.length === 0 && <div role="status" style={{ padding: '18px 0', textAlign: 'center', fontSize: 12.5, color: T.text500 }}>검색 결과가 없어요</div>}
              {searchStatus === 'done' && results.length > 0 && (
                <div style={{ display: 'grid', gap: 6 }}>
                  <div style={{ fontSize: 11, color: T.text500 }}>고르면 Day {activeDay} 에 담아요</div>
                  {results.map((place) => (
                    <button
                      key={place.contentId}
                      type="button"
                      data-testid={`custom-course-result-${place.contentId}`}
                      disabled={stops.length >= 20}
                      onClick={() => addStop(place)}
                      style={{
                        width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 9,
                        padding: '9px 11px', borderRadius: 11, border: `1px solid ${RF.softLine}`,
                        background: RF.card, fontFamily: T.fontStack, cursor: stops.length >= 20 ? 'default' : 'pointer',
                      }}
                    >
                      <Icon name="plus" size={15} color={T.primary600}/>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: 12.5, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.title}</span>
                        {place.address && <span style={{ display: 'block', fontSize: 10.5, color: T.text500, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.address}</span>}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
            {/* 일차가 둘 이상이면 어느 날에 담을지 골라야 한다. 하루면 고를 것이 없어 이름만 둔다. */}
            {days === 1
              ? <div style={{ fontSize: 13, fontWeight: 900 }}>Day 1</div>
              : (
                <div style={{ display: 'flex', gap: 6 }}>
                  {Array.from({ length: days }, (_, index) => index + 1).map((day) => {
                    const on = day === activeDay;
                    return (
                      <button
                        key={day}
                        type="button"
                        data-testid={`custom-course-day-${day}`}
                        aria-pressed={on}
                        onClick={() => setActiveDay(day)}
                        style={{
                          height: 28, padding: '0 10px', borderRadius: 999, border: 0, cursor: 'pointer',
                          background: on ? T.primary500 : T.primary50, color: on ? '#fff' : T.primary700,
                          fontSize: 12, fontWeight: 900, fontFamily: T.fontStack,
                        }}
                      >Day {day}</button>
                    );
                  })}
                </div>
              )}
            <div data-testid="custom-course-count" style={{ fontSize: 11, color: T.text500, fontVariantNumeric: 'tabular-nums' }}>{stops.length}개 방문지 · 최소 2개 · 최대 20개</div>
          </div>

          <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
            {stops.map((s, i) => (
              <React.Fragment key={s.id}>
              {/* 일차가 바뀌는 자리에 머리글을 둔다 — 어느 방문지가 몇 일차인지 눈으로 보여야 한다. */}
              {days > 1 && (i === 0 || stops[i - 1].day !== s.day) && (
                <div style={{ fontSize: 12, fontWeight: 900, color: T.text700, marginTop: i === 0 ? 0 : 6 }}>Day {s.day}</div>
              )}
              <div style={{
                borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card,
                padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ width: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: T.text400 }}>
                  <Icon name="menu" size={16} color="currentColor"/>
                  <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                    <button type="button" aria-label={`${s.name} 위로 이동`} data-testid={`move-stop-up-${i}`} disabled={i === 0} onClick={() => moveStop(i, -1)} style={{ width: 10, height: 12, padding: 0, border: 0, background: 'transparent', color: T.text400, fontSize: 8, cursor: i === 0 ? 'default' : 'pointer' }}>↑</button>
                    <button type="button" aria-label={`${s.name} 아래로 이동`} data-testid={`move-stop-down-${i}`} disabled={i === stops.length - 1} onClick={() => moveStop(i, 1)} style={{ width: 10, height: 12, padding: 0, border: 0, background: 'transparent', color: T.text400, fontSize: 8, cursor: i === stops.length - 1 ? 'default' : 'pointer' }}>↓</button>
                  </div>
                </div>
                <div style={{
                  width: 26, height: 26, borderRadius: 999, background: T.primary500, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                  /* 번호는 그 일차 안의 순서다 — customCourse 의 sequence 와 같은 값이어야 한다. */
                }}>{stops.slice(0, i).filter((other) => other.day === s.day).length + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: T.primary700, fontVariantNumeric: 'tabular-nums' }}>{s.time}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: T.text500, marginTop: 3 }}>{s.memo}</div>
                </div>
                <button
                  type="button"
                  data-testid={`remove-stop-${i}`}
                  onClick={() => removeStop(s.id)}
                  aria-label={`${s.name} 삭제`}
                  style={{ width: 28, height: 28, borderRadius: 999, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="close" size={15} color={T.text400}/>
                </button>
              </div>
              </React.Fragment>
            ))}
          </div>

          {/* 방문지는 위 검색 결과에서 고른다 — 예전의 자유 입력 `방문지 추가` 는
              contentId 없는 방문지를 만들어 17-5 에서 코스를 조립할 수 없게 했다. */}
          <button
            type="button"
            data-testid="add-course-stop"
            onClick={() => document.querySelector('[data-testid="tourapi-place-search"]')?.focus()}
            disabled={stops.length >= 20}
            style={{
              width: '100%', height: 46, marginTop: 10, borderRadius: 12, cursor: stops.length >= 20 ? 'default' : 'pointer',
              border: `1px dashed ${T.line300}`, background: 'transparent', color: stops.length >= 20 ? T.text400 : T.primary600,
              fontFamily: T.fontStack, fontSize: 13, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
            <Icon name="plus" size={17} color={stops.length >= 20 ? T.text400 : T.primary600}/> {stops.length >= 20 ? '방문지는 최대 20개예요' : '방문지 추가'}
          </button>

          {/* 일차를 늘린다. 서버 호출은 없다 — 초안에 날짜 한 칸이 늘어날 뿐이다. */}
          <button
            type="button"
            data-testid="add-course-day"
            onClick={addDay}
            disabled={days >= 10}
            style={{
              width: '100%', height: 42, marginTop: 8, borderRadius: 12, cursor: days >= 10 ? 'default' : 'pointer',
              border: `1px solid ${T.line200}`, background: RF.card, color: days >= 10 ? T.text400 : T.text700,
              fontFamily: T.fontStack, fontSize: 12, fontWeight: 800,
            }}>{days >= 10 ? '일정은 최대 10일까지예요' : '+ 다음 날 추가 (1박 이상일 때)'}</button>

          <div style={{ marginTop: 16 }}>
            <AddInfoBanner>
              직접 만든 코스는 <b>여행이 확정되기 전까지</b> 호스트가 언제든 고칠 수 있어요. 수정하면 채팅방 멤버 모두에게 알림이 가요.
            </AddInfoBanner>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8 }}>
          <Btn variant="ghost" onClick={nav.back}>취소</Btn>
          <div style={{ flex: 1 }}>
            <Btn variant="primary" full disabled={stops.length < 2} onClick={() => { window.__moyeoCourseSource = 'custom'; nav.go('create-schedule'); }}>이 코스로 계속하기</Btn>
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 20-2 · 공지 이력 ─────────
function ScreenNoticeHistory() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  // 참여 중인 방이면 GET {id}/notices 로 그리고, 호스트면 20-2f 공지 작성 화면으로 보낸다.
  // (고정 토글은 PUT {id}/notices/{noticeId}). 비참여자는 403 → 빈 상태.
  // 방·코스 제목은 부르지 않는다 — 공지 카드에는 제목 자리가 없다(ATTACH-COMPOSER-CANON §2).
  const liveMode = window.MoyeoApi?.live();
  const roomId = liveMode ? window.MoyeoApi.selectedRoomId() : null;
  const [serverNotices, setServerNotices] = React.useState(null);
  const [isHost, setIsHost] = React.useState(false);
  const [noticeBusy, setNoticeBusy] = React.useState(false);
  const [noticeError, setNoticeError] = React.useState('');
  const reloadNotices = React.useCallback(async () => {
    const result = await window.MoyeoApi.roomNotices(roomId);
    if (Array.isArray(result?.pinnedNotices)) setServerNotices(result);
  }, [roomId]);
  React.useEffect(() => {
    if (!liveMode || !roomId) return undefined;
    let active = true;
    window.MoyeoApi.roomNotices(roomId)
      .then((result) => { if (active && Array.isArray(result?.pinnedNotices)) setServerNotices(result); })
      .catch(() => { /* 403(미참여) 이면 목데이터 유지 */ });
    // 공지 작성은 호스트만 — members 응답의 host && me 로 판정한다.
    window.MoyeoApi.roomMembers(roomId)
      .then((result) => { if (active) setIsHost(Boolean((result?.members || []).some((member) => member.me && member.host))); })
      .catch(() => {});
    return () => { active = false; };
  }, [liveMode, roomId]);
  // 상단 고정은 최대 1개다 (ATTACH-COMPOSER-CANON R5-1). 서버가 개수를 막지 않으므로
  // 여기서 지킨다 — 다시 고정하면 이미 고정돼 있던 공지는 풀린다.
  const toggleServerPin = async (notice) => {
    if (noticeBusy) return;
    setNoticeBusy(true);
    setNoticeError('');
    try {
      await window.MoyeoApi.updateRoomNotice(roomId, notice.noticeId, { pinned: !notice.pinned });
      if (!notice.pinned) {
        const others = (serverNotices?.pinnedNotices || []).filter((item) => item.noticeId !== notice.noticeId);
        await Promise.all(others.map((item) => window.MoyeoApi.updateRoomNotice(roomId, item.noticeId, { pinned: false }).catch(() => null)));
      }
      await reloadNotices();
    } catch (error) {
      setNoticeError(error?.message || '고정 상태를 바꾸지 못했어요.');
    }
    setNoticeBusy(false);
  };
  // 서버에 고정이 여러 건 남아 있을 때(과거 데이터) 이 공지를 **그 하나**로 만든다.
  // 이 공지는 이미 pinned 이므로 나머지 고정만 풀면 된다.
  const promoteServerPin = async (notice) => {
    if (noticeBusy) return;
    setNoticeBusy(true);
    setNoticeError('');
    try {
      const others = (serverNotices?.pinnedNotices || []).filter((item) => item.noticeId !== notice.noticeId);
      await Promise.all(others.map((item) => window.MoyeoApi.updateRoomNotice(roomId, item.noticeId, { pinned: false }).catch(() => null)));
      await reloadNotices();
    } catch (error) {
      setNoticeError(error?.message || '고정 상태를 바꾸지 못했어요.');
    }
    setNoticeBusy(false);
  };
  // 서버 공지는 제목이 없다(content 한 필드) — 제목을 지어내지 않고 본문·작성자·시각만 보여준다.
  // demoted = 서버에는 고정으로 남아 있지만 화면에서는 지난 공지로 내린 것(고정 최대 1개 규칙).
  const ServerCard = ({ notice, dim = false, demoted = false }) => (
    <div style={{
      borderRadius: 14, padding: 14,
      background: dim ? T.bgSubtle : T.primary50,
      border: `1px solid ${dim ? RF.softLine : T.primary100}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="note" size={14} color={dim ? T.text500 : T.primary700}/>
        <div style={{ flex: 1 }}/>
        {demoted ? <Chip variant="neutral">지난 공지</Chip> : dim ? <Chip variant="neutral">고정 해제됨</Chip> : <Chip variant="soft">📌 고정</Chip>}
      </div>
      <div style={{ fontSize: 13, lineHeight: '20px', color: T.text900, marginTop: 9, whiteSpace: 'pre-line' }}>{notice.content}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 11, color: T.text500 }}>
        <span>{notice.authorNickname}</span>
        <span style={{ color: T.line300 }}>·</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{window.MoyeoApi.formatDateTime(notice.createdAt)}</span>
        <div style={{ flex: 1 }}/>
        {isHost && (
          <React.Fragment>
            <button type="button" disabled={noticeBusy} onClick={() => (demoted ? promoteServerPin(notice) : toggleServerPin(notice))} style={{ border: 0, background: 'transparent', padding: 0, color: T.primary600, fontWeight: 800, fontSize: 11, fontFamily: T.fontStack, cursor: noticeBusy ? 'default' : 'pointer' }}>{demoted ? '이 공지 고정' : dim ? '다시 고정' : '고정 해제'}</button>
            {/* 20-3a 공지 수정·삭제. 예전에는 이 자리에 갈 곳 없는 링크만 있었다 (정본 §6-1). */}
            <button type="button" data-testid={`notice-edit-${notice.noticeId}`} onClick={() => { window.MoyeoApi.selectNotice(notice); nav.go('notice-edit'); }} style={{ border: 0, background: 'transparent', padding: 0, color: T.primary600, fontWeight: 800, fontSize: 11, fontFamily: T.fontStack, cursor: 'pointer' }}>수정</button>
          </React.Fragment>
        )}
      </div>
    </div>
  );

  if (serverNotices) {
    // 고정은 최대 1개다(ATTACH-COMPOSER-CANON R5-1). 서버가 개수를 막지 않아 **이미 2건 고정된
    // 방이 실제로 있다** — 머리글에 `고정 2 / 최대 1` 이라고 적으면 사용자에게 자기모순으로 읽힌다.
    // 서버 데이터는 건드리지 않고(읽기 화면) 화면에서만 정리한다:
    // 가장 최근 1건만 `📌 고정`, 나머지는 지난 공지로 내린다.
    const newestFirst = (list) => [...list].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    const pinnedSorted = newestFirst(serverNotices.pinnedNotices || []);
    const serverPinned = pinnedSorted.slice(0, 1);
    const demotedPinned = pinnedSorted.slice(1);
    const serverPast = newestFirst([
      ...demotedPinned.map((notice) => ({ notice, demoted: true })),
      ...(serverNotices.unpinnedNotices || []).map((notice) => ({ notice, demoted: false })),
    ].map((row) => ({ ...row, createdAt: row.notice.createdAt })));
    return (
      <Phone>
        <div data-testid="notice-history-live" style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
          <Header title="공지 이력" left center onBack={nav.back}/>
          {/* 공지는 제목이 없다 — 코스·방 제목을 카드 제목 자리에 넣으면 모든 공지 제목이 같아진다
              (ATTACH-COMPOSER-CANON §2). 머리글은 개수만 센다. 고정은 최대 1개다(R5-1). */}
          <div style={{ padding: '0 20px 12px', borderBottom: `1px solid ${RF.softLine}` }}>
            <div style={{ fontSize: 11, color: T.text500, fontVariantNumeric: 'tabular-nums' }}>공지 {serverPinned.length + serverPast.length}개 · 고정 {serverPinned.length}</div>
          </div>
          <div style={{ position: 'absolute', top: 110, left: 0, right: 0, bottom: isHost ? 96 : 0, overflow: 'auto', padding: '16px 20px 24px' }}>
            {noticeError && <div role="alert" style={{ marginBottom: 12, fontSize: 12, color: T.danger }}>{noticeError}</div>}
            {serverPinned.length === 0 && serverPast.length === 0 && (
              <div style={{ padding: '48px 0', textAlign: 'center', fontSize: 13, color: T.text500 }}>아직 등록된 공지가 없어요.</div>
            )}
            {serverPinned.length > 0 && <div style={{ fontSize: 12, fontWeight: 900, color: T.text500 }}>상단 고정 중</div>}
            <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
              {serverPinned.map((notice) => <ServerCard key={notice.noticeId} notice={notice}/>)}
            </div>
            {serverPast.length > 0 && <div style={{ fontSize: 12, fontWeight: 900, color: T.text500, marginTop: 24 }}>지난 공지</div>}
            <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
              {serverPast.map((row) => <ServerCard key={row.notice.noticeId} notice={row.notice} demoted={row.demoted} dim/>)}
            </div>
            <div style={{ fontSize: 11, color: T.text400, lineHeight: '17px', marginTop: 16 }}>
              공지는 호스트만 올릴 수 있고, 상단 고정은 하나만 둘 수 있어요. 새로 고정하면 먼저 고정된 공지가 풀려요. 고정을 해제해도 이력에는 그대로 남아요. 예전에 여러 건이 고정된 방은 가장 최근 하나만 고정으로 보여줘요.
            </div>
          </div>
          {isHost && (
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}` }}>
              <Btn variant="primary" full icon="plus" onClick={() => nav.go('attach-notice')}>새 공지 작성 (호스트)</Btn>
            </div>
          )}
        </div>
      </Phone>
    );
  }

  // 서버 공지를 못 받으면 예시 공지를 그리지 않는다.
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="공지 이력" left center onBack={nav.back}/>
        <div role="status" style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13, lineHeight: '21px' }}>
          {liveMode ? '아직 등록된 공지가 없어요.' : '로그인하면 모집 중인 모임을 볼 수 있어요.'}
        </div>
      </div>
    </Phone>
  );
}
// ───────── 코스 출처 배지 (전 화면 공용) ─────────
function CourseSourceBadge({ source = 'linked', size = 'sm' }) {
  const map = {
    linked: { label: '등록된 코스', icon: 'lock', variant: 'neutral' },
    custom: { label: '호스트 직접 코스', icon: 'note', variant: 'soft' },
  };
  const m = map[source] || map.linked;
  return (
    <Chip variant={m.variant} size={size}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <Icon name={m.icon} size={11} color="currentColor" strokeWidth={2}/>
        {m.label}
      </span>
    </Chip>
  );
}

// ───────── 17-5 · 모집 만들기 Step 5 — 리뷰 & 등록 ─────────
function ScreenCreateSummary({ source }) {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const resolvedSource = source || window.__moyeoCourseSource || 'custom';
  const linked = resolvedSource === 'linked';
  // 로그인 상태에서는 앞 단계에서 모은 값을 그대로 보여주고, 그대로 POST /chat-rooms 로 보낸다.
  // 캡처 모드는 live() 가 false 라 아래 기획 목데이터가 그대로 남는다.
  const liveMode = window.MoyeoApi?.live();
  const draft = liveMode ? window.MoyeoApi.roomDraft() : null;
  const payload = draft ? window.MoyeoApi.buildCreateRoomRequest(draft) : null;
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  // 직접 만든 코스는 방문지에 서버 contentId 가 없어 customCourse 를 조립할 수 없다 → 생성은 등록 코스만.
  const canCreate = Boolean(payload && payload.courseType === 'PUBLIC' && payload.courseId != null);
  const dday = payload
    ? Math.round((new Date(`${payload.recruitmentDeadlineDate}T00:00:00`) - new Date(new Date().toDateString())) / 86400000)
    : null;
  const genderText = { NONE: '성별 제한 없음', MALE_ONLY: '남성만', FEMALE_ONLY: '여성만' }[payload?.genderRestriction] || '성별 제한 없음';
  const summaryRows = payload
    ? [
      ['calendar', '일정', payload.dayTripStartTime
        ? `${window.MoyeoApi.formatDate(payload.startDate)} 당일치기 · ${payload.dayTripStartTime} – ${payload.dayTripEndTime}`
        : `${window.MoyeoApi.formatDate(payload.startDate)} ~ ${window.MoyeoApi.formatDate(payload.endDate)}`],
      payload.meetingDetails
        ? ['pin', '집합', `${window.MoyeoApi.formatTime(String(payload.meetingDateTime).split('T')[1])} ${payload.meetingDetails}`]
        : null,
      // 좌표 줄은 두지 않는다. 숫자쌍은 사용자에게 아무 의미가 없고 집합 장소는 위 '집합' 줄이 말해준다
      // (15 모집 상세에서 같은 이유로 뺐다 — 좌표는 길 찾기의 입력값일 뿐이다).
      // 좌표가 실제로 저장됐는지는 17-3 집합 장소 화면의 '좌표 (자동 저장)' 표시가 알려준다.
      // 최대 인원은 17-4 에서 고르기 전까지 초안에 없다 — 없으면 'undefined명' 을 찍지 말고 최소 인원만 남긴다.
      ['users', '인원', payload.maxParticipants != null
        ? `최소 ${draft.minParticipants || 3}명 · 최대 ${payload.maxParticipants}명`
        : `최소 ${draft.minParticipants || 3}명`],
      ['user', '조건', `${payload.minimumAge != null && payload.maximumAge != null ? `${payload.minimumAge}~${payload.maximumAge}세 · ` : ''}${genderText}`],
      payload.participationFee != null ? ['money', '비용', `1인 ${Number(payload.participationFee).toLocaleString()}원 (예상)`] : null,
      ['clock', '마감', `${window.MoyeoApi.formatDate(payload.recruitmentDeadlineDate)} 23:59${dday != null ? ` · D-${dday}` : ''}`],
    ].filter(Boolean)
    // 초안이 없으면 요약할 값도 없다 — 예시 일정·집합 장소를 대신 보여주지 않는다.
    : [];
  // 등록 성공 시 응답의 roomId 로 15 모집 상세로 이동한다.
  const openRecruitment = async () => {
    if (!canCreate) { nav.go('host-manage'); return; }
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const created = await window.MoyeoApi.createRoom(payload);
      const roomId = created?.roomId;
      if (roomId == null) throw new Error('생성된 모집을 찾지 못했어요.');
      // TAB-STATE-CANON R4: 이 화면이 목록을 바꿨다 — 탭 보관소에서 덜어내
      // 다음 진입에서 한 번만 다시 받게 한다.
      window.MoyeoTabCache?.invalidate?.(window.MoyeoTabCache.ROOM_LIST_KEYS);
      window.MoyeoApi.clearRoomDraft();
      window.MoyeoApi.selectRoom(roomId);
      nav.go('detail');
    } catch (failure) {
      setError(failure?.message || '모집을 열지 못했어요.');
      setSubmitting(false);
    }
  };

  return (
    <Phone>
      <div data-testid={`create-summary-${resolvedSource}`} style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="모집 만들기 (5/5)" left center onBack={nav.back}/>
        <AddStepDots active={4}/>

        <div style={{ position: 'absolute', top: 148, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '0 20px 20px' }}>
          <div style={{ fontSize: 15, fontWeight: 900 }}>이대로 모집을 열까요?</div>
          <div style={{ fontSize: 12, color: T.text500, marginTop: 6 }}>등록 후에도 마감 전까지는 대부분 고칠 수 있어요.</div>

          <div style={{ marginTop: 14, borderRadius: 14, border: `1px solid ${RF.softLine}`, background: RF.card, overflow: 'hidden' }}>
            <div style={{ padding: 14, borderBottom: `1px solid ${RF.softLine}` }}>
              <div style={{ fontSize: 14, fontWeight: 900 }}>{payload?.title || ''}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 6 }}>
                <Icon name="map" size={14} color={T.text500}/><span style={{ flex: 1, fontSize: 12, color: T.text700, fontWeight: 800 }}>{draft?.courseTitle || ''}</span><CourseSourceBadge source={resolvedSource}/>
              </div>
            </div>
            <div style={{ padding: 14, display: 'grid', gap: 10 }}>
              {summaryRows.map((r) => (
                <div key={r[1]} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <Icon name={r[0]} size={16} color={T.text500}/>
                  <span style={{ width: 44, color: T.text500 }}>{r[1]}</span>
                  <span style={{ flex: 1, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{r[2]}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            {linked ? (
              <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: 13, borderRadius: 12, background: T.bgSubtle, border: `1px solid ${RF.softLine}` }}>
                <Icon name="lock" size={16} color={T.text500}/>
                <div style={{ flex: 1, fontSize: 12, lineHeight: '18px', color: T.text700 }}>
                  서비스에 등록된 코스를 그대로 가져왔어요. <b>경로(방문지·순서)는 수정할 수 없고</b>, 일정·집합 장소·인원 조건은 마감 전까지 바꿀 수 있어요.
                </div>
              </div>
            ) : (
              <AddInfoBanner>
                호스트가 직접 만든 코스예요. <b>여행이 확정되기 전까지</b> 방문지·시간·순서를 자유롭게 고칠 수 있고, 수정하면 멤버 모두에게 알림이 가요.
              </AddInfoBanner>
            )}
          </div>

          <div style={{ marginTop: 14, padding: 13, borderRadius: 12, background: T.primary50, border: `1px solid ${T.primary100}`, fontSize: 12, lineHeight: '18px', color: T.primary700 }}>
            최소 3명이 모이면 채팅방이 자동으로 열리고, 마감일까지 못 채우면 자연스럽게 소멸돼요.
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8 }}>
          <Btn variant="ghost" onClick={nav.back}>이전</Btn>
          <div style={{ flex: 1 }}>
            {error && <div role="alert" style={{ fontSize: 11.5, color: T.dangerText, marginBottom: 6, lineHeight: '16px' }}>{error}</div>}
            <Btn variant="primary" full disabled={submitting} testId="create-room-submit" onClick={openRecruitment}>{submitting ? '모집을 여는 중...' : '모집 열기'}</Btn>
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 18-2 · 호스트 경로 관리 (확정 전 수정 / 등록 코스 잠금 / 확정 후 잠금) ─────────
// mode: 'custom' — 직접 만든 코스, 확정 전이라 수정 가능
//       'linked' — 등록된 코스 차용, 경로 수정 불가
//       'locked' — 여행 확정됨, 경로 잠김
function ScreenCourseEdit({ mode = 'custom' }) {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const editable = mode === 'custom';
  // 경로는 서버 코스에서만 온다 — 예시 방문지 4곳을 미리 깔지 않는다.
  const [stops, setStops] = React.useState([]);
  const [saved, setSaved] = React.useState(false);
  const removeStop = (id) => setStops((s) => (s.length <= 2 ? s : s.filter((x) => x.id !== id)));
  const moveStop = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= stops.length) return;
    setStops((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };
  const saveAndNotify = () => {
    setSaved(true);
    window.setTimeout(() => nav.go('chat'), 450);
  };
  // 로그인 상태에서는 GET travel-courses/chat-rooms/{roomId} 의 방문지·시간·좌표로 경로를 대체한다.
  const liveMode = window.MoyeoApi?.live();
  const roomId = liveMode ? window.MoyeoApi.selectedRoomId() : null;
  const [serverCourse, setServerCourse] = React.useState(null);
  const [serverRoom, setServerRoom] = React.useState(null);
  // 집합 정보 수정은 호스트만 가능하다 (멤버 목록의 me·host 로 판정한다).
  const [isHost, setIsHost] = React.useState(false);
  React.useEffect(() => {
    if (!liveMode || !roomId) return undefined;
    let active = true;
    window.MoyeoApi.roomCourse(roomId)
      .then((result) => { if (active && result?.course) setServerCourse(result.course); })
      .catch(() => { /* 실패 시 목데이터 유지 */ });
    window.MoyeoApi.roomDetail(roomId)
      .then((result) => { if (active && result?.roomId != null) setServerRoom(result); })
      .catch(() => {});
    window.MoyeoApi.roomMembers(roomId)
      .then((result) => { if (active) setIsHost(Boolean((result?.members || []).find((member) => member.me)?.host)); })
      .catch(() => { /* 미참여자면 호스트가 아니다 */ });
    return () => { active = false; };
  }, [liveMode, roomId]);
  const openMeetingEdit = () => {
    window.MoyeoApi.selectMeetingEditRoom(roomId);
    nav.go('create-meet');
  };
  const serverPlaces = serverCourse?.places || null;
  // 좌표는 서버 코스가 준 것만 쓴다. 좌표가 없으면 지도를 그리지 않는다(R4).
  const courseRoute = React.useMemo(
    () => (serverPlaces ? window.MoyeoKakaoMap?.routeFromPlaces?.(serverPlaces) : null) || null,
    [serverPlaces],
  );
  // 화면에 그릴 방문지 — 서버 코스에는 메모가 없어 메모 줄을 생략한다.
  const visibleStops = serverPlaces
    ? serverPlaces.map((place) => ({
      id: `${place.dayNumber}-${place.sequence}-${place.contentId}`,
      time: window.MoyeoApi.formatTime(place.visitTime),
      name: place.title,
      memo: '',
    }))
    : stops;
  const serverMode = Boolean(serverPlaces);
  // 서버 코스 저장(PUT travel-courses/chat-rooms/{roomId})은 이번 범위(읽기)에 없어 편집을 열지 않는다.
  const canEdit = editable && !serverMode;

  // 서버 코스가 있으면 방문지 수·일정은 서버 값으로 적는다 (없는 값은 생략).
  const serverMeta = serverMode
    ? [
      serverRoom?.startDate ? `${window.MoyeoApi.formatDate(serverRoom.startDate)}${serverRoom.endDate ? ` - ${window.MoyeoApi.formatDate(serverRoom.endDate)}` : ''}` : null,
      serverRoom ? window.MoyeoApi.tripTypeLabel(serverRoom) : null,
      `방문지 ${visibleStops.length}개`,
      serverRoom?.participantCount != null && serverRoom?.maxParticipants != null ? `${serverRoom.participantCount}/${serverRoom.maxParticipants}명` : null,
    ].filter(Boolean).join(' · ')
    : '';
  const banner = serverMode
    ? {
      icon: 'lock', bg: T.bgSubtle, bd: RF.softLine, fg: T.text700,
      title: '지금은 경로를 확인만 할 수 있어요',
      body: '서버에 등록된 방문지·시간·순서를 그대로 보여드려요. 경로 수정 저장은 아직 연결되지 않았어요.',
    }
    : {
    custom: {
      icon: 'sparkle', bg: T.primary50, bd: T.primary100, fg: T.primary700,
      title: '마감 전까지 경로를 바꿀 수 있어요',
      body: '마감 전이라 방문지·시간·순서를 자유롭게 고칠 수 있어요. 저장하면 채팅방에 변경 내역이 공지로 남아요.',
    },
    linked: {
      icon: 'lock', bg: T.bgSubtle, bd: RF.softLine, fg: T.text700,
      title: '등록된 코스라 경로는 고정이에요',
      body: '서비스에 등록된 코스를 그대로 가져왔어요. 방문지와 순서는 바꿀 수 없고, 집합 장소·시간과 모집 조건만 수정할 수 있어요.',
    },
    locked: {
      icon: 'clock', bg: T.warningBg, bd: T.warningBg, fg: T.warningText,
      title: '여행이 확정돼 경로가 잠겼어요',
      body: '마감일이 지나 인원이 확정됐어요. 지금부터는 경로를 바꿀 수 없어요. 변경이 필요하면 채팅방 공지로 알려주세요.',
    },
  }[mode];

  return (
    <Phone>
      <div data-testid={`course-edit-${mode}`} style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header
          title="여행 경로"
          left
          center
          onBack={nav.back}
          right={canEdit ? <button type="button" onClick={saveAndNotify} style={{ border: 'none', background: 'transparent', color: T.primary600, fontSize: 14, fontWeight: 900, fontFamily: T.fontStack, cursor: 'pointer', padding: '0 4px' }}>저장</button> : <IconButton name="more"/>}
        />

        <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '0 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0 14px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{serverMode ? serverCourse.title : ''}</div>
              <div style={{ fontSize: 11, color: T.text500, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{serverMode ? serverMeta : ''}</div>
            </div>
            <CourseSourceBadge source={serverMode ? (serverCourse.type === 'CUSTOM' ? 'custom' : 'linked') : (mode === 'linked' ? 'linked' : 'custom')}/>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 13, borderRadius: 12, background: banner.bg, border: `1px solid ${banner.bd}` }}>
            <Icon name={banner.icon} size={17} color={banner.fg}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: banner.fg }}>{banner.title}</div>
              <div style={{ fontSize: 12, lineHeight: '18px', color: banner.fg, opacity: 0.9, marginTop: 4 }}>{banner.body}</div>
            </div>
          </div>

          <div style={{ marginTop: 14, borderRadius: 12, overflow: 'hidden', opacity: canEdit ? 1 : 0.92 }}>
            <MiniMap height={150} markers={courseRoute?.markers} polyline={courseRoute?.polyline}/>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 900 }}>Day 1</div>
            {!canEdit && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: T.text500 }}>
                <Icon name="lock" size={12} color={T.text500} strokeWidth={2}/> 수정 불가
              </div>
            )}
          </div>

          <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
            {visibleStops.map((s, i) => (
              <div key={s.id} style={{
                borderRadius: 12, border: `1px solid ${RF.softLine}`,
                background: canEdit ? RF.card : T.bgSubtle,
                padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                {canEdit
                  ? <div style={{ width: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', color: T.text400 }}><Icon name="menu" size={16} color="currentColor"/><div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}><button type="button" aria-label={`${s.name} 위로 이동`} disabled={i === 0} onClick={() => moveStop(i, -1)}>위로</button><button type="button" aria-label={`${s.name} 아래로 이동`} disabled={i === visibleStops.length - 1} onClick={() => moveStop(i, 1)}>아래로</button></div></div>
                  : <div style={{ width: 22, display: 'flex', justifyContent: 'center' }}><Icon name="lock" size={14} color={T.text300} strokeWidth={2}/></div>}
                <div style={{
                  width: 26, height: 26, borderRadius: 999,
                  background: canEdit ? T.primary500 : T.line300, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: canEdit ? T.primary700 : T.text500, fontVariantNumeric: 'tabular-nums' }}>{s.time}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: T.text500, marginTop: 3 }}>{s.memo}</div>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => removeStop(s.id)}
                    aria-label={`${s.name} 삭제`}
                    style={{ width: 28, height: 28, borderRadius: 999, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="close" size={15} color={T.text400}/>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 방문지 추가는 17-4 코스 에디터에서만 한다 — 여기 방문지는 서버 코스 읽기 전용이다 */}

          {/* 집합 정보 수정(17-3)은 호스트 · 확정 전(RECRUITING)만 열린다 — 확정 뒤엔 서버가 40913 을 준다 */}
          {(() => {
            const canEditMeeting = serverMode && isHost && serverRoom?.status === 'RECRUITING';
            const meetingTime = serverMode ? window.MoyeoApi.formatTime(String(serverRoom?.meetingDateTime || '').split('T')[1]) : '';
            // 집합 정보도 서버 값만 쓴다 — 없으면 섹션 자체를 두지 않는다.
            const meetingLine = serverMode
              ? [meetingTime, serverRoom?.meetingDetails].filter(Boolean).join(' · ')
              : '';
            if (!meetingLine && !canEditMeeting) return null;
            return (
              <>
                <div style={{ marginTop: 18, fontSize: 13, fontWeight: 900 }}>집합 정보</div>
                <div style={{ marginTop: 10, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card, padding: 13, display: 'flex', gap: 11, alignItems: 'center' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: T.primary50, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="pin" size={18} color={T.primary600}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{meetingLine}</div>
                    {/* 18-1~3 은 경로를 고치는 화면이고 이 카드는 **참고용 집합 정보**다 —
                        핀을 잡는 화면(18-5)이 아니므로 좌표를 노출하지 않는다. */}
                  </div>
                  {canEditMeeting
                    ? <button type="button" data-testid="meeting-info-edit" onClick={openMeetingEdit} style={{ border: 0, background: 'transparent', padding: 0, fontSize: 12, fontWeight: 800, color: T.primary600, fontFamily: T.fontStack, cursor: 'pointer' }}>수정</button>
                    : serverMode
                      ? <Icon name="lock" size={15} color={T.text400} strokeWidth={2}/>
                      : mode !== 'locked'
                        ? <span style={{ fontSize: 12, fontWeight: 800, color: T.primary600 }}>수정</span>
                        : <Icon name="lock" size={15} color={T.text400} strokeWidth={2}/>}
                </div>
              </>
            );
          })()}
          {mode === 'linked' && (
            <div style={{ fontSize: 11, color: T.text500, marginTop: 8, lineHeight: '17px' }}>
              등록된 코스여도 집합 장소와 시간은 호스트가 정해요. 마감 전까지 언제든 바꿀 수 있어요.
            </div>
          )}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8 }}>
          {/* 서버 코스는 읽기만 연동돼 있어 저장·수정 버튼 대신 채팅방으로 돌아가는 길만 둔다 */}
          {serverMode && (
            <div style={{ flex: 1 }}><Btn variant="secondary" full onClick={() => nav.go('notice-history')}>공지 이력 보기</Btn></div>
          )}
          {!serverMode && mode === 'custom' && (
            <>
              <Btn variant="ghost" onClick={nav.back}>취소</Btn>
              <div style={{ flex: 1 }}><Btn variant="primary" full onClick={saveAndNotify}>{saved ? '변경 내용을 알렸어요' : '저장하고 멤버에게 알리기'}</Btn></div>
            </>
          )}
          {!serverMode && mode === 'linked' && (
            <>
              <Btn variant="ghost" onClick={() => nav.go('create-review')}>코스 바꾸기</Btn>
              <div style={{ flex: 1 }}><Btn variant="primary" full onClick={() => nav.go('create-meet')}>집합 정보 수정</Btn></div>
            </>
          )}
          {!serverMode && mode === 'locked' && (
            <>
              <div style={{ flex: 1 }}><Btn variant="secondary" full onClick={() => nav.go('notice-history')}>공지로 알리기</Btn></div>
              <Btn variant="primary" disabled>경로 수정</Btn>
            </>
          )}
        </div>
      </div>
    </Phone>
  );
}

function ScreenCourseEditLinked() { return <ScreenCourseEdit mode="linked"/>; }
function ScreenCourseEditLocked() { return <ScreenCourseEdit mode="locked"/>; }
function ScreenCreateSummaryLinked() { return <ScreenCreateSummary source="linked"/>; }

Object.assign(window, {
  CourseSourceBadge,
  ScreenCreateSchedule,
  ScreenCreatePeople,
  ScreenCreateMeetPoint,
  ScreenCustomCourse,
  ScreenCreateSummary,
  ScreenCreateSummaryLinked,
  ScreenCourseEdit,
  ScreenCourseEditLinked,
  ScreenCourseEditLocked,
  ScreenNoticeHistory,
});
