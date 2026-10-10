
// 같은 일차 안의 n 번째 방문지의 기본 시각. 10:00 부터 2시간 30분씩 벌리고 21:00 에서 멈춘다.
function defaultStopTime(order) {
  const minutes = Math.min(10 * 60 + (order - 1) * 150, 21 * 60);
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}
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
// notice: 입력을 버린 사실을 알리는 한 줄. caption 자리에 붉게 대신 그린다 (W-15).
function AddFieldInput({ icon, value, onChange, placeholder, caption, testId, inputMode, notice, noticeTestId }) {
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
      {notice
        ? <div role="status" data-testid={noticeTestId} style={{ fontSize: 11, color: T.danger, marginTop: 6, lineHeight: '16px' }}>{notice}</div>
        : caption && <div style={{ fontSize: 11, color: T.text500, marginTop: 6, lineHeight: '16px' }}>{caption}</div>}
    </div>
  );
}

/**
 * 값 하나를 보여주는 칸.
 *
 * `pick` 을 주면 **날짜·시간을 실제로 고를 수 있다** — 칸 위에 투명한 네이티브 입력을 덮는다.
 * 앱 둘은 예전부터 선택기를 열 수 있었는데(iOS `RecruitmentFieldEditors` · 안드 필드 시트)
 * 웹은 값만 그리고 있어서 **필수 항목인 일정을 사용자가 바꿀 수 없었다** (2026-09-10).
 * 겉모습(글꼴·자릿수 표기)은 그대로 두려고 입력을 투명하게 덮는다 — 네이티브 위젯의
 * 지역 표기가 화면에 드러나면 네 표면 비교가 어긋난다.
 */
function AddFieldBox({ icon, value, placeholder, caption, onClick, chevron = true, compact = false, pick = null }) {
  const filled = Boolean(value);
  const height = compact ? 44 : 48;
  const boxStyle = {
    width: '100%', height, borderRadius: 12,
    border: `1px solid ${T.line200}`, background: RF.card,
    display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px',
    fontFamily: T.fontStack, cursor: (onClick || pick) ? 'pointer' : 'default', textAlign: 'left',
  };
  const label = (
    <>
      {icon && <Icon name={icon} size={17} color={T.text500}/>}
      <span style={{
        flex: 1, fontSize: 13, fontWeight: filled ? 800 : 500,
        color: filled ? T.text900 : T.text400,
        fontVariantNumeric: 'tabular-nums',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{value || placeholder}</span>
      {chevron && <Icon name="arrow" size={15} color={T.text400}/>}
    </>
  );
  return (
    <div>
      {pick ? (
        <div style={{ position: 'relative' }}>
          <div style={boxStyle}>{label}</div>
          <input
            type={pick.type}
            value={pick.value}
            min={pick.min}
            max={pick.max}
            onChange={(event) => pick.onChange(event.target.value)}
            aria-label={pick.label}
            data-testid={pick.testId}
            style={{
              position: 'absolute', inset: 0, width: '100%', height,
              opacity: 0, border: 0, padding: 0, margin: 0, cursor: 'pointer',
              fontFamily: T.fontStack,
            }}
          />
        </div>
      ) : (
        <button type="button" onClick={onClick} style={boxStyle}>{label}</button>
      )}
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

// 'YYYY-MM-DD' 한 칸을 날짜로 읽는다. **형식이 어긋나면 null 이다** —
// `input[type=date]` 를 키보드로 치면 「202611-12-28」처럼 연도가 6자리인 값이 그대로 나오는데,
// `new Date()` 는 이런 문자열을 Invalid Date 로 돌려주고 화면은 원문을 그대로 그렸다(W-135).
function parseDayValue(text) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(text || ''))) return null;
  const date = new Date(`${text}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  // '2026-02-31' 처럼 넘치는 날짜는 Date 가 3월로 굴려 준다 — 되돌려 보고 걸러낸다.
  const back = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return back === text ? date : null;
}

// 모집 만들기 2/5 가 서버로 보내기 전에 스스로 보는 일정 규칙.
// 서버(`CreateChatRoomRequest`)는 지난 날짜·마감일 역전을 거절하는데, 예전에는 화면이 아무것도
// 검사하지 않아 잘못된 값이 3/5 까지 그대로 넘어갔다(W-135).
// 서버가 받는 최대 여행 일수 (`ChatRoom.kt` `require(days <= 30)`).
const ROOM_MAX_TRIP_DAYS = 30;

function roomScheduleError(schedule, overnight, now = new Date()) {
  if (!schedule) return '';
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = parseDayValue(schedule.startDate);
  if (!start) return '여행 시작 날짜를 다시 골라 주세요. 연‧월‧일이 모두 채워져야 해요.';
  if (start < today) return '지난 날짜로는 모집을 열 수 없어요. 오늘 이후로 골라 주세요.';
  if (overnight) {
    const end = parseDayValue(schedule.endDate);
    if (!end) return '여행 종료 날짜를 다시 골라 주세요. 연‧월‧일이 모두 채워져야 해요.';
    if (end <= start) return '종료 날짜는 시작 날짜보다 뒤여야 해요. 당일치기라면 위에서 「당일치기」를 골라 주세요.';
    // 서버는 총 일수 30일까지만 받는다 (`ChatRoom.kt` `require(days <= 30)`).
    // 화면에서 막지 않으면 2027-03-01 같은 값이 5/5 에서야 서버 오류로 튕긴다 (W-96).
    const maxEnd = new Date(start.getFullYear(), start.getMonth(), start.getDate() + (ROOM_MAX_TRIP_DAYS - 1));
    if (end > maxEnd) return `여행은 최대 ${ROOM_MAX_TRIP_DAYS}일까지 정할 수 있어요. 종료 날짜를 앞당겨 주세요.`;
  } else {
    // 당일치기는 시작·종료 시각이 **둘 다** 있어야 하고 시작이 더 앞서야 한다
    // (`ChatRoom.kt` `require(dayTripStartTime != null && dayTripEndTime != null && dayTripStartTime < dayTripEndTime)`).
    const from = schedule.dayTripStartTime;
    const to = schedule.dayTripEndTime;
    if (!from || !to) return '당일치기는 시작·종료 시각을 모두 골라 주세요.';
    if (String(from) >= String(to)) return '종료 시각은 시작 시각보다 뒤여야 해요.';
  }
  const deadline = parseDayValue(schedule.recruitmentDeadlineDate);
  if (!deadline) return '모집 마감일을 다시 골라 주세요. 연‧월‧일이 모두 채워져야 해요.';
  if (deadline < today) return '모집 마감일이 지난 날짜예요. 오늘 이후로 골라 주세요.';
  const limit = new Date(start.getFullYear(), start.getMonth(), start.getDate() - 3);
  if (deadline > limit) return '모집 마감일은 여행 시작 3일 전까지만 정할 수 있어요.';
  return '';
}

// ───────── 17-2 · 모집 만들기 Step 2 — 일정 (당일치기 / 1박 이상) ─────────
function ScreenCreateSchedule() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  // 로그인 상태에서는 실제로 등록될 일정(오늘 기준 미래 날짜)을 그대로 보여준다.
  // 보이는 값과 보내는 값을 일치시킨다 — 일정이 없으면 칸을 비워 둔다.
  const liveMode = window.MoyeoApi?.live();
  const defaults = React.useMemo(() => (liveMode ? window.MoyeoApi.defaultRoomSchedule() : null), [liveMode]);
  // 고른 코스가 며칠짜리인지는 1/5 가 초안에 적어 준다(`courseDays`).
  // 사용자가 아직 고르지 않았을 때의 **첫 기본값**으로만 쓴다 — 한 번 고른 뒤에는 그 값이 이긴다.
  const courseDays = Number((window.MoyeoApi?.roomDraft?.() || {}).courseDays) || 0;
  const [type, setType] = React.useState(() => {
    const saved = window.MoyeoApi?.roomDraft?.() || {};
    if (saved.tripType) return saved.tripType === 'OVERNIGHT' ? 'overnight' : 'day';
    return Number(saved.courseDays) > 1 ? 'overnight' : 'day';
  });
  const day = type === 'day';
  // **사용자가 고른 값이 우선이다.** 기본값은 첫 진입에 채워 두는 값일 뿐이고,
  // 예전에는 이 화면이 값을 그리기만 해서 **일정을 아예 바꿀 수 없었다** (2026-09-10).
  // 초기값은 초안에서 되살린다 — 17-3 집합 장소로 나갔다 오면 라우터가 이 화면을 다시 마운트해서,
  // 빈 state 로 시작하던 예전에는 날짜·시각·마감일이 조용히 기본값으로 되돌아갔다 (W-116 · AND-114 의 웹판).
  // 담겨 있는 값만 가져온다 — 초안에 기본값을 섞지 않는다(그 성질은 defaults 가 대신한다).
  const [picked, setPicked] = React.useState(() => {
    const saved = window.MoyeoApi?.roomDraft?.() || {};
    const restored = {};
    ['startDate', 'endDate', 'recruitmentDeadlineDate', 'dayTripStartTime', 'dayTripEndTime', 'meetingTime']
      .forEach((key) => { if (saved[key]) restored[key] = saved[key]; });
    return restored;
  });
  const schedule = React.useMemo(() => {
    if (!defaults) return null;
    const base = { ...defaults, ...picked };
    // 종료 날짜도 코스 기간에 맞춘다 — 1박 2일 코스에 하루짜리 기본값을 주면 또 손으로 고쳐야 한다.
    if (courseDays > 1 && !picked.endDate && base.startDate) {
      const start = new Date(`${base.startDate}T00:00:00`);
      if (!Number.isNaN(start.getTime())) {
        start.setDate(start.getDate() + courseDays - 1);
        base.endDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
      }
    }
    return base;
  }, [defaults, picked, courseDays]);
  // 고른 즉시 초안에도 적는다 — 「다음」에서만 내보내면 17-3 으로 갔다 오는 순간 사라진다 (W-116).
  const setField = (key) => (value) => {
    if (!value) return;
    setPicked((current) => ({ ...current, [key]: value }));
    window.MoyeoApi?.updateRoomDraft?.({ [key]: value });
  };
  const chooseType = (next) => {
    setType(next);
    window.MoyeoApi?.updateRoomDraft?.({ tripType: next === 'day' ? 'DAY_TRIP' : 'OVERNIGHT' });
  };
  // 서버 규칙: 모집 마감일은 **출발 3일 전까지**다(화면 안내와 같은 값을 입력에도 건다).
  const deadlineLimit = React.useMemo(() => {
    if (!schedule?.startDate) return undefined;
    const start = new Date(`${schedule.startDate}T00:00:00`);
    if (Number.isNaN(start.getTime())) return undefined;
    start.setDate(start.getDate() - 3);
    return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
  }, [schedule]);
  const dateText = (value) => window.MoyeoApi.formatDate(value);
  // 당일치기 요약의 「10시간」은 고른 시각으로 계산한다 — 값을 바꿔도 숫자가 그대로면 거짓말이 된다.
  const dayTripHours = React.useMemo(() => {
    if (!schedule) return null;
    const toMinutes = (text) => {
      const [hour, minute] = String(text || '').split(':').map(Number);
      return Number.isFinite(hour) && Number.isFinite(minute) ? hour * 60 + minute : null;
    };
    const from = toMinutes(schedule.dayTripStartTime);
    const to = toMinutes(schedule.dayTripEndTime);
    if (from == null || to == null || to <= from) return null;
    return Math.round(((to - from) / 60) * 10) / 10;
  }, [schedule]);
  // 1박 이상 요약 칩이 **문구 그대로 「1박 2일」** 이었다 — 3박 4일 여행도 1박 2일로 보였다 (W-117).
  // 서버(`tripNights`·`tripDays`)와 같게 시작·종료 날짜 차이로 센다.
  const nightsLabel = React.useMemo(() => {
    if (!schedule?.startDate || !schedule?.endDate) return null;
    const start = new Date(`${schedule.startDate}T00:00:00`);
    const end = new Date(`${schedule.endDate}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    const nights = Math.round((end.getTime() - start.getTime()) / 86400000);
    return nights >= 1 ? `${nights}박 ${nights + 1}일` : null;
  }, [schedule]);
  // 17-4 에서 고른 집합 장소만 보여준다 — 고르기 전에는 기획 좌표를 대신 채우지 않는다.
  const meetDraft = liveMode ? (window.MoyeoApi?.roomDraft?.() || {}) : {};
  const meetPoint = (Number.isFinite(Number(meetDraft.meetingLatitude)) && Number.isFinite(Number(meetDraft.meetingLongitude)))
    ? { lat: Number(meetDraft.meetingLatitude), lng: Number(meetDraft.meetingLongitude) }
    : null;
  const meetingDetails = meetDraft.meetingDetails || '';
  // **위경도는 적지 않는다** — 17-2 는 핀을 찍는 화면이 아니다(`changeLog20` §2-3 ·
  // 사용자 지시 「좌표 미노출」). 좌표는 그대로 저장돼 채팅방 지도 카드·길 찾기에 쓰인다.
  // 아직 고르지 않았으면 iOS 와 **같은 문구**로 다음 단계를 가리킨다 — 예전에는 빈 칸이라
  // 무엇을 눌러야 하는지 알 수 없었다 (2026-09-10).
  const meetingSummary = meetPoint && schedule ? `${schedule.meetingTime} 집합` : '';
  // 「다음 단계에서 정해요」는 **3/5 인원**을 가리키는 말로 읽히는데, 집합 장소는 이 줄을
  // 눌러 바로 가는 화면이다(푸터 「다음」도 같은 곳으로 간다). 무엇을 해야 하는지로 고친다 (QA-09).
  const meetingPlaceholder = '탭해서 집합 장소를 정해요';
  // 잘못된 일정은 **여기서 멈춘다** — 3/5 로 넘어간 뒤 5/5 에서 서버 오류로 만나면
  // 어느 칸이 문제인지 알 수 없다.
  const scheduleError = roomScheduleError(schedule, !day);
  const goNext = () => {
    if (scheduleError) return;
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
              onChange={chooseType}
              options={[
                { id: 'day', label: '당일치기', sub: '시작·종료 시간' },
                { id: 'overnight', label: '1박 이상', sub: '시작·종료 날짜' },
              ]}
            />
            {courseDays > 1 && (
              <div style={{ fontSize: 11, color: T.text500, marginTop: 7, lineHeight: '16px' }}>
                고른 코스는 {courseDays - 1}박 {courseDays}일 일정이에요. 필요하면 다르게 정해도 돼요.
              </div>
            )}
          </div>

          {day ? (
            <div style={{ marginTop: 18, display: 'grid', gap: 16 }}>
              <div>
                <AddFieldLabel required>여행 날짜</AddFieldLabel>
                <AddFieldBox
                  icon="calendar"
                  value={schedule ? dateText(schedule.startDate) : '2026. 05. 25 (토)'}
                  pick={schedule ? { type: 'date', value: schedule.startDate, onChange: setField('startDate'), label: '여행 날짜', testId: 'create-schedule-start-date' } : null}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <AddFieldLabel required>여행 시작 시간</AddFieldLabel>
                  <AddFieldBox
                    icon="clock"
                    value={schedule ? schedule.dayTripStartTime : '08:00'}
                    chevron={false}
                    pick={schedule ? { type: 'time', value: schedule.dayTripStartTime, onChange: setField('dayTripStartTime'), label: '여행 시작 시간', testId: 'create-schedule-start-time' } : null}
                  />
                </div>
                <div>
                  <AddFieldLabel required>여행 종료 시간</AddFieldLabel>
                  <AddFieldBox
                    icon="clock"
                    value={schedule ? schedule.dayTripEndTime : '18:00'}
                    chevron={false}
                    pick={schedule ? { type: 'time', value: schedule.dayTripEndTime, onChange: setField('dayTripEndTime'), label: '여행 종료 시간', testId: 'create-schedule-end-time' } : null}
                  />
                </div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 13px',
                borderRadius: 12, background: T.bgSubtle, border: `1px solid ${RF.softLine}`,
              }}>
                <Chip variant="soft">당일치기</Chip>
                <span style={{ fontSize: 12, fontWeight: 800, color: T.text700, fontVariantNumeric: 'tabular-nums' }}>{schedule ? `${dateText(schedule.startDate)} ${schedule.dayTripStartTime} – ${schedule.dayTripEndTime}${dayTripHours != null ? ` · ${dayTripHours}시간` : ''}` : ''}</span>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 18, display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <AddFieldLabel required>시작 날짜</AddFieldLabel>
                  <AddFieldBox
                    icon="calendar"
                    value={schedule ? dateText(schedule.startDate) : '05.25 (토)'}
                    chevron={false}
                    pick={schedule ? { type: 'date', value: schedule.startDate, onChange: setField('startDate'), label: '시작 날짜', testId: 'create-schedule-start-date' } : null}
                  />
                </div>
                <div>
                  <AddFieldLabel required>종료 날짜</AddFieldLabel>
                  <AddFieldBox
                    icon="calendar"
                    value={schedule ? dateText(schedule.endDate) : '05.26 (일)'}
                    chevron={false}
                    pick={schedule ? { type: 'date', value: schedule.endDate, min: schedule.startDate, onChange: setField('endDate'), label: '종료 날짜', testId: 'create-schedule-end-date' } : null}
                  />
                </div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 13px',
                borderRadius: 12, background: T.bgSubtle, border: `1px solid ${RF.softLine}`,
              }}>
                {/* 날짜가 아직 말이 안 되면(종료 ≤ 시작) 박수를 지어내지 않고 「1박 이상」만 적는다. */}
                <Chip variant="soft">{nightsLabel || '1박 이상'}</Chip>
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
              pick={schedule ? { type: 'date', value: schedule.recruitmentDeadlineDate, max: deadlineLimit, onChange: setField('recruitmentDeadlineDate'), label: '모집 마감일', testId: 'create-schedule-deadline' } : null}
            />
          </div>

          {/* 무엇이 잘못됐는지 칸 바로 아래에서 말해 준다 — 「다음」은 이 글이 사라져야 눌린다 */}
          {scheduleError && (
            <div role="alert" data-testid="create-schedule-error" style={{ marginTop: 14, fontSize: 11.5, fontWeight: 800, color: T.danger, lineHeight: '17px' }}>{scheduleError}</div>
          )}

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
                <div style={{ fontSize: 13, fontWeight: meetingDetails ? 800 : 500, color: meetingDetails ? T.text900 : T.text400 }}>
                  {meetingDetails || meetingPlaceholder}
                </div>
                {meetingSummary && <div style={{ fontSize: 11, color: T.text500, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{meetingSummary}</div>}
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
          <div style={{ flex: 1 }}><Btn variant="primary" full disabled={Boolean(scheduleError)} onClick={goNext}>다음</Btn></div>
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
      <button type="button" onClick={decrease} disabled={!canDecrease} aria-label={`${label} 줄이기`} style={{ width: 44, height: 44, borderRadius: 999, border: `1px solid ${T.line200}`, background: RF.card, color: T.text700, fontSize: 20, cursor: canDecrease ? 'pointer' : 'default', opacity: canDecrease ? 1 : .35 }}>−</button>
      <div style={{ width: 40, textAlign: 'center', fontSize: 15, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{value}명</div>
      <button type="button" onClick={increase} disabled={!canIncrease} aria-label={`${label} 늘리기`} style={{ width: 44, height: 44, borderRadius: 999, border: `1px solid ${T.line200}`, background: RF.card, color: T.text700, fontSize: 20, cursor: canIncrease ? 'pointer' : 'default', opacity: canIncrease ? 1 : .35 }}>+</button>
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
  // 초안에 이미 적어 둔 값이 있으면 그것부터 되살린다(단계를 오가며 지워지지 않게).
  const savedDraft = window.MoyeoApi?.roomDraft?.() || {};
  const [detail, setDetail] = React.useState(() => savedDraft.meetingDetails || '');
  // 지도의 첫 중심은 경북 중앙이다 — 특정 장소(기획의 청송 터미널)를 미리 고른 것처럼 두지 않는다.
  const [point, setPoint] = React.useState(() => (
    Number.isFinite(Number(savedDraft.meetingLatitude)) && Number.isFinite(Number(savedDraft.meetingLongitude))
      ? { lat: Number(savedDraft.meetingLatitude), lng: Number(savedDraft.meetingLongitude) }
      : { lat: 36.4, lng: 128.9 }
  ));
  // 좌표는 실지도의 드래그 핀과 **장소 검색 결과**가 바꾼다.
  const initialPoint = React.useRef(point);
  // 지도 카메라를 옮길 때만 바뀌는 값이다 — 핀을 끌 때마다 바꾸면 드래그가 튄다.
  const [mapCenter, setMapCenter] = React.useState(initialPoint.current);
  // 17-3 · 호스트가 기존 방의 집합 정보를 고치는 진입이면 PUT chat-rooms/{id}/meeting-info 로 저장한다.
  // 여행 확정 전까지만 허용된다(40913). 모집 만들기(2/5) 진입이면 아래 draft 경로가 그대로 남는다.
  const liveMode = window.MoyeoApi?.live();
  const editRoomId = liveMode ? window.MoyeoApi.meetingEditRoomId() : null;
  const [editRoom, setEditRoom] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  // 집합 시간은 **호스트가 고르는 값**이다. 예전에는 「07:50」 글자만 그려 두고 입력 자리가 없어
  // 화면에서는 바꿀 수 없는 채로 폼 기본값이 그대로 저장됐다(CREATE-037).
  // 모집 만들기 진입이면 초안 값을, 기존 방을 고치는 진입이면 방의 실제 집합 시각을 채운다.
  const meetDraft = liveMode ? savedDraft : {};
  const scheduleDefaults = React.useMemo(() => (liveMode ? window.MoyeoApi.defaultRoomSchedule() : null), [liveMode]);
  const [meetingTime, setMeetingTime] = React.useState(
    () => meetDraft.meetingTime || scheduleDefaults?.meetingTime || '',
  );
  // 기존 방을 고칠 때 유지해야 하는 집합 **날짜**. 이 화면은 날짜를 묻지 않는다(18-5 가 묻는다).
  const [editMeetingDate, setEditMeetingDate] = React.useState('');
  React.useEffect(() => {
    if (!editRoomId) return undefined;
    let active = true;
    window.MoyeoApi.roomDetail(editRoomId)
      .then((result) => {
        if (!active || result?.roomId == null) return;
        setEditRoom(result);
        if (result.meetingDetails) setDetail(result.meetingDetails);
        // 방에 저장된 집합 일시를 그대로 읽어 온다 — 읽지 않으면 07:50 으로 덮어쓸 위험이 있다(W-134).
        const [datePart, timePart] = String(result.meetingDateTime || '').split('T');
        if (datePart) setEditMeetingDate(datePart);
        const savedTime = window.MoyeoApi.formatTime(timePart);
        if (savedTime) setMeetingTime(savedTime);
        if (result.meetingLatitude != null && result.meetingLongitude != null) {
          const next = { lat: Number(result.meetingLatitude), lng: Number(result.meetingLongitude) };
          initialPoint.current = next;
          setPoint(next);
          setMapCenter(next);
        }
      })
      .catch(() => { /* 실패 시 기획 목데이터 좌표가 그대로 남는다 */ });
    return () => { active = false; };
  }, [editRoomId]);
  // 안내는 **이 방·이 초안의 실제 여행 시작 시각**으로 적는다 — 08:00 은 폼 기본값일 뿐이다.
  // 1박 이상 여행에는 「여행 시작 시간」 자체가 없다 — 없는 시각을 기준으로 말하지 않는다.
  const draftOvernight = meetDraft.tripType
    ? meetDraft.tripType === 'OVERNIGHT'
    : Number(meetDraft.courseDays) > 1;
  const tripStartTime = editRoom
    ? window.MoyeoApi.formatTime(editRoom.dayTripStartTime)
    : (draftOvernight ? '' : (meetDraft.dayTripStartTime || scheduleDefaults?.dayTripStartTime || ''));
  const meetingLate = Boolean(tripStartTime && meetingTime && meetingTime > tripStartTime);
  // ── 집합 장소 검색 (GET /tourism-contents?keyword=) ──
  // 예전에는 지도 위에 「장소 검색」이라고 **글자만** 얹혀 있어 눌러도 포커스조차 잡히지 않았다(W-136).
  // 17-4 코스 에디터가 쓰는 것과 같은 검색이고, 고른 장소의 좌표로 핀을 옮긴다.
  const [placeQuery, setPlaceQuery] = React.useState('');
  const [placeKeyword, setPlaceKeyword] = React.useState('');
  const [placeResults, setPlaceResults] = React.useState([]);
  const [placeStatus, setPlaceStatus] = React.useState('idle');
  const [placeRetryKey, setPlaceRetryKey] = React.useState(0);
  React.useEffect(() => {
    if (!placeKeyword) { setPlaceResults([]); setPlaceStatus('idle'); return undefined; }
    let active = true;
    setPlaceStatus('loading');
    window.MoyeoTourism.list({ keyword: placeKeyword, size: 10 })
      .then((result) => {
        if (!active) return;
        // 좌표가 없는 콘텐츠는 핀을 옮길 수 없어 고를 수 없다.
        setPlaceResults((result.items || []).filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude) && item.latitude !== 0));
        setPlaceStatus('done');
      })
      .catch(() => { if (active) { setPlaceResults([]); setPlaceStatus('error'); } });
    return () => { active = false; };
  }, [placeKeyword, placeRetryKey]);
  // 검색으로 고른 장소 이름을 상세 안내에 넣어 두면, 그 뒤 **핀을 끌었을 때 좌표만 바뀌고
  // 이름은 그대로 남는다** — 「강구항」을 고르고 핀을 산으로 끌면 좌표는 산인데 안내는 강구항이다.
  // 틀린 값을 그대로 저장하게 되므로, 우리가 채워 넣은 이름은 핀이 그 자리를 떠나면 지우고
  // 무엇이 지워졌는지 적는다 (iOS 와 같은 방식).
  const autoDetailRef = React.useRef(null); // { title, lat, lng }
  const [pinMovedNote, setPinMovedNote] = React.useState('');
  const pickPlace = (place) => {
    const next = { lat: Number(place.latitude), lng: Number(place.longitude) };
    setPoint(next);
    setMapCenter(next);
    setPinMovedNote('');
    // 상세 안내가 비어 있을 때만 고른 장소 이름을 넣어 준다 — 적어 둔 문구를 덮지 않는다.
    setDetail((current) => {
      if (current.trim()) return current;
      autoDetailRef.current = { title: place.title, lat: next.lat, lng: next.lng };
      return place.title;
    });
    setPlaceResults([]);
    setPlaceKeyword('');
    setPlaceQuery('');
  };
  // 핀을 끌면 좌표를 옮기고, 우리가 채운 장소 이름이 더는 맞지 않으면 지운다.
  const movePin = (next) => {
    setPoint(next);
    const auto = autoDetailRef.current;
    if (!auto) return;
    const moved = Math.abs(auto.lat - next.lat) > 0.0005 || Math.abs(auto.lng - next.lng) > 0.0005;
    if (!moved) return;
    setDetail((current) => {
      if (current.trim() !== String(auto.title || '').trim()) return current;
      setPinMovedNote(`핀을 옮겨서 「${auto.title}」 안내를 지웠어요. 새 위치에 맞는 안내를 적어주세요.`);
      autoDetailRef.current = null;
      return '';
    });
  };
  // 17-5 요약이 이어받는 집합 정보. 좌표는 지도 핀이 잡은 값을 그대로 쓴다.
  const confirmPoint = async () => {
    if (editRoom) {
      if (saving) return;
      setSaving(true);
      try {
        // meetingDateTime 은 서버 필수 필드다. 날짜는 방의 값을 그대로 두고 시각만 이 화면에서 고친다.
        const meetingDate = editMeetingDate || String(editRoom.meetingDateTime || '').split('T')[0];
        await window.MoyeoApi.updateMeetingInfo(editRoomId, window.MoyeoApi.buildMeetingInfoRequest(editRoom, {
          meetingDetails: detail,
          meetingLatitude: point.lat,
          meetingLongitude: point.lng,
          ...(meetingDate && meetingTime ? { meetingDateTime: `${meetingDate}T${meetingTime}:00` } : {}),
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
      ...(meetingTime ? { meetingTime } : {}),
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
              center={mapCenter}
              draggablePin
              onPinMove={movePin}
            />
            {/* 핀은 실제 카카오 지도의 드래그 마커다 — 목업 위에 얹던 가짜 핀 버튼은 지웠다(R4). */}
            <div style={{
              position: 'absolute', left: 14, right: 14, top: 14, borderRadius: 12,
              background: T.overlayPanel, border: `1px solid ${T.line200}`, boxShadow: T.l1,
              overflow: 'hidden',
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px', height: 42 }}>
                <Icon name="search" size={17} color={T.text500}/>
                <input
                  type="search"
                  value={placeQuery}
                  onChange={(event) => setPlaceQuery(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); setPlaceKeyword(placeQuery.trim()); } }}
                  placeholder="장소 검색"
                  aria-label="집합 장소 검색"
                  data-testid="meeting-place-search"
                  style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', fontFamily: T.fontStack, fontSize: 13, fontWeight: 700, color: T.text900 }}
                />
                <button
                  type="button"
                  data-testid="meeting-place-search-submit"
                  onClick={() => setPlaceKeyword(placeQuery.trim())}
                  disabled={!placeQuery.trim()}
                  style={{ border: 0, background: 'transparent', padding: 0, fontFamily: T.fontStack, fontSize: 12, fontWeight: 900, color: placeQuery.trim() ? T.primary600 : T.text400, cursor: placeQuery.trim() ? 'pointer' : 'default' }}>검색</button>
              </label>
              {placeKeyword && (
                <div data-testid="meeting-place-results" style={{ borderTop: `1px solid ${T.line200}`, maxHeight: 168, overflow: 'auto' }}>
                  {placeStatus === 'loading' && <div style={{ padding: '11px 13px', fontSize: 12, color: T.text500 }}>찾는 중이에요…</div>}
                  {placeStatus === 'error' && <div role="alert" style={{ padding: '11px 13px', fontSize: 12, color: T.danger }}>장소를 불러오지 못했어요.{' '}<button type="button" data-testid="meeting-place-search-retry" onClick={() => setPlaceRetryKey((key) => key + 1)} style={{ padding: 0, border: 0, background: 'transparent', color: 'inherit', fontFamily: T.fontStack, fontSize: 12, fontWeight: 900, textDecoration: 'underline', cursor: 'pointer' }}>다시 시도</button></div>}
                  {placeStatus === 'done' && placeResults.length === 0 && <div style={{ padding: '11px 13px', fontSize: 12, color: T.text500 }}>검색 결과가 없어요.</div>}
                  {placeResults.map((place) => (
                    <button
                      key={place.contentId}
                      type="button"
                      onClick={() => pickPlace(place)}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left', padding: '10px 13px',
                        border: 0, borderTop: `1px solid ${T.line100}`, background: 'transparent',
                        fontFamily: T.fontStack, cursor: 'pointer',
                      }}>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: T.text900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.title}</div>
                      {place.address && <div style={{ fontSize: 11, color: T.text500, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.address}</div>}
                    </button>
                  ))}
                </div>
              )}
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
              {pinMovedNote && (
                <div role="status" data-testid="meeting-pin-moved-note" style={{ marginTop: 7, fontSize: 11.5, lineHeight: '17px', color: T.warningText }}>{pinMovedNote}</div>
              )}
            </div>

            {/* 좌표는 **사용자에게 보여주지 않는다** — 지도 핀으로 위치를 알 수 있고
                위경도 숫자는 읽을 일이 없다 (사용자 결정, 2026-09-09).
                값 자체는 그대로 저장돼 채팅방 지도 카드·길 찾기에 쓰인다. */}

            <div>
              <AddFieldLabel required>집합 시간</AddFieldLabel>
              <AddFieldBox
                icon="clock"
                value={meetingTime}
                chevron={false}
                pick={{ type: 'time', value: meetingTime, onChange: (value) => { if (value) setMeetingTime(value); }, label: '집합 시간', testId: 'meeting-time-input' }}
                caption={tripStartTime
                  ? `여행 시작 ${tripStartTime}보다 이르거나 같은 시간으로 정해 주세요.`
                  : '여행 첫날 모이는 시각이에요.'}
              />
              {meetingLate && (
                <div data-testid="meeting-time-warning" style={{ fontSize: 11.5, fontWeight: 800, color: T.warningText, marginTop: 6, lineHeight: '16px' }}>
                  여행 시작 {tripStartTime}보다 늦은 시간이에요. 그대로 두면 출발 뒤에 모이게 돼요.
                </div>
              )}
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
  // 코스 제목·태그는 **서버 필수**다(`CreateCustomCourseRequest.required = [places, tagIds, title]`).
  // 예전에는 이 화면에 둘 다 없어서 `draft.customCourse` 를 조립할 수 없었고, 17-5 요약이
  // 「등록 코스만 생성 가능」이라며 막은 뒤 **오류 없이 다른 화면으로 넘어갔다** —
  // 사용자는 직접 만든 코스로 모집을 한 건도 열 수 없었다(QA 2026-09-12).
  const [courseTitle, setCourseTitle] = React.useState('');
  const [tagIds, setTagIds] = React.useState([]);
  const tagsData = window.useTabData('create.course-tags', () => window.MoyeoApi.courseTags(), {
    accept: (result) => Array.isArray(result) && result.length > 0,
  });
  const courseTags = tagsData.value || null;
  const toggleTag = (tagId) => setTagIds((current) => (
    current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId]
  ));

  // 1박 이상이면 일차가 늘어난다. customCourse 의 방문지마다 dayNumber 가 필수다.
  const [days, setDays] = React.useState(1);
  const [activeDay, setActiveDay] = React.useState(1);

  // ── `?courseId=81` 로 들어오면 **그 코스를 불러온 상태**로 에디터를 연다 ──
  // roomId·feedId 와 같은 딥링크 관례다(`selectedCourseId`). 담기는 값은 서버가 준
  // 방문지 이름·방문 시각·일차뿐이고 클라이언트가 지어내는 문자열은 없다.
  // 등록 코스를 출발점으로 고쳐 쓰는 진입이라 17-2(코스 연동)와 다르다 — 여기서 고친 코스는
  // 새 커스텀 코스가 된다. 불러오지 못하면 빈 에디터 그대로 둔다.
  const liveMode = Boolean(window.MoyeoApi?.live());
  const startingCourseId = liveMode ? window.MoyeoApi.selectedCourseId() : null;
  React.useEffect(() => {
    if (!startingCourseId) return undefined;
    let active = true;
    window.MoyeoApi.courseDetail(startingCourseId)
      .then((course) => {
        if (!active) return;
        const places = Array.isArray(course?.places) ? course.places : [];
        const loaded = places.map((place, index) => ({
          id: `${place.contentId}-${index}`,
          contentId: place.contentId,
          name: place.title,
          memo: '',
          day: place.dayNumber || 1,
          time: String(place.visitTime || '').slice(0, 5),
          // 좌표를 함께 담아 위 지도에 올린다 — 기획·iOS·안드로이드는 이 자리에 경로를 그린다.
          latitude: place.latitude,
          longitude: place.longitude,
        }));
        if (loaded.length) {
          setStops(loaded);
          setDays(loaded.reduce((max, stop) => Math.max(max, stop.day), 1));
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [startingCourseId]);


  // 담긴 방문지의 좌표 → 지도 마커·경로. 좌표가 없는 방문지는 `routeFromPlaces` 가 걸러낸다.
  const stopRoute = React.useMemo(
    () => (window.MoyeoKakaoMap?.routeFromPlaces?.(stops) || null),
    [stops],
  );

  // ── 방문지 검색 (GET /tourism-contents?keyword=) ──
  // 예전에는 `검색` 이 17-1a 장소 검색 화면으로 넘어가면서 **입력한 검색어를 버렸고**,
  // 담긴 방문지는 사용자가 타이핑한 글자였다. 그래서 contentId 가 없어
  // 17-5 요약이 "직접 만든 코스는 customCourse 를 조립할 수 없다"며 생성을 막고 있었다.
  // 여기서 바로 검색해 **서버 콘텐츠를 고르게** 하면 contentId 가 함께 담긴다.
  const [keyword, setKeyword] = React.useState('');
  const [results, setResults] = React.useState([]);
  const [searchStatus, setSearchStatus] = React.useState('idle');
  // 실패에는 **다시 해볼 수단**이 있어야 한다. 검색어가 그대로라 setKeyword 로는 effect 가
  // 다시 돌지 않아서, 재시도 키를 따로 둔다 (W-91).
  const [searchRetryKey, setSearchRetryKey] = React.useState(0);
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
  }, [keyword, searchRetryKey]);
  const runSearch = () => setKeyword(query.trim());
  const retrySearch = () => setSearchRetryKey((key) => key + 1);

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
      // 검색 결과의 좌표를 그대로 담는다 — 두 곳 이상 모이면 위에 실지도 경로가 그려진다.
      latitude: place.latitude,
      longitude: place.longitude,
      // 서버는 `customCourse.places[].visitTime` 을 **필수**로 요구한다.
      // 담는 순서대로 하루에 걸쳐 벌린다 — 예전에는 무엇을 담아도 `17:00` 이라
      // 하루 일정이 전부 같은 시각으로 저장됐다 (W-109 · iOS F121, 2026-09-12).
      time: defaultStopTime(stops.filter((stop) => stop.day === activeDay).length + 1),
    }]);
    setQuery('');
    setKeyword('');
  };
  const removeStop = (id) => setStops((s) => s.filter((x) => x.id !== id));
  const setStopTime = (id, time) => setStops((s) => s.map((stop) => (stop.id === id ? { ...stop, time } : stop)));
  // 같은 일차 안에서 시각이 순서를 거스르는 날. 막지는 않고 알려만 준다 —
  // 되짚어 가는 일정도 있을 수 있어 판단은 호스트에게 맡긴다.
  const outOfOrderDays = Array.from({ length: days }, (_, index) => index + 1).filter((day) => {
    const times = stops.filter((stop) => stop.day === day).map((stop) => stop.time);
    return times.join() !== [...times].sort().join();
  });
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
      // 방문 시각은 자리에 남긴다 — 객체째 바꾸면 시각까지 따라가 역순 일정이 만들어진다
      // (18-1 여행 경로와 같은 규칙 · iOS IOS-F142).
      next[index] = { ...current[target], time: current[index].time };
      next[target] = { ...current[index], time: current[target].time };
      return next;
    });
  };
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="코스 직접 만들기" left center onBack={nav.back}/>

        <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '0 20px 20px' }}>
          {/* 담긴 방문지의 좌표로 실지도 경로를 그린다 — 기획·iOS·안드로이드도 이 자리에 지도를 둔다.
              좌표가 두 곳 미만이면 `routeFromPlaces` 가 null 을 주고 지도 자리를 아예 비운다
              (손으로 그린 지도는 두지 않는다 · 정본 R4). */}
          {stopRoute && (
            <div style={{ marginTop: 14, borderRadius: 12, overflow: 'hidden' }}>
              <MiniMap height={150} markers={stopRoute.markers} polyline={stopRoute.polyline}/>
            </div>
          )}

          <form onSubmit={(event) => { event.preventDefault(); runSearch(); }} style={{ marginTop: 14, height: 42, borderRadius: 11, border: `1px solid ${T.line200}`, display: 'flex', alignItems: 'center', gap: 9, padding: '0 8px 0 13px' }}>
            <Icon name="search" size={17} color={T.text500}/>
            <input data-testid="tourapi-place-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="방문지 검색" style={{ minWidth: 0, flex: 1, border: 0, outline: 0, background: 'transparent', color: T.text900, fontFamily: T.fontStack, fontSize: 13 }}/>
            {/* 검색어를 지우려면 백스페이스를 길게 눌러야 했다 — 전용 방문지 검색 화면(21)에는 이미 있는 것이
                이 인라인 검색칸에만 없었다 (QA PLACE-002). */}
            {query && (
              <button type="button" aria-label="검색어 지우기" data-testid="custom-course-search-clear" onClick={() => setQuery('')} style={{ position: 'relative', width: 24, height: 24, border: 0, padding: 0, background: 'transparent', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name="close" size={14} color={T.text400}/>
                <window.TouchTarget size={36}/>
              </button>
            )}
            {/* type=button — form onSubmit(Enter)과 같은 일을 하되 제출이 두 번 일어나지 않게 한다. */}
            <button type="button" data-testid="custom-course-search" onClick={runSearch} style={{ height: 30, padding: '0 10px', border: 0, borderRadius: 8, background: T.primary50, color: T.primary700, fontFamily: T.fontStack, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>검색</button>
          </form>

          {/* 검색 결과. 고르면 그 방문지가 지금 고른 일차에 담긴다.
              서버가 준 콘텐츠만 그린다 — 결과가 없으면 예시 장소를 대신 두지 않는다(R1). */}
          {searchStatus !== 'idle' && (
            <div data-testid="custom-course-results" style={{ marginTop: 10 }}>
              {searchStatus === 'loading' && <div role="status" style={{ padding: '18px 0', textAlign: 'center', fontSize: 12.5, color: T.text500 }}>불러오는 중이에요…</div>}
              {searchStatus === 'error' && <div role="alert" style={{ padding: '18px 0', textAlign: 'center', fontSize: 12.5, color: T.text500 }}>불러오지 못했어요.{' '}<button type="button" data-testid="custom-course-search-retry" onClick={retrySearch} style={{ padding: 0, border: 0, background: 'transparent', color: T.primary600, fontFamily: T.fontStack, fontSize: 12.5, fontWeight: 900, textDecoration: 'underline', cursor: 'pointer' }}>다시 시도</button></div>}
              {searchStatus === 'done' && results.length === 0 && <div role="status" style={{ padding: '18px 0', textAlign: 'center', fontSize: 12.5, color: T.text500 }}>검색 결과가 없어요</div>}
              {searchStatus === 'done' && results.length > 0 && (
                <div style={{ display: 'grid', gap: 6 }}>
                  <div style={{ fontSize: 11, color: T.text500 }}>고르면 Day {activeDay} 에 담아요</div>
                  {/* 결과 줄은 **담기**다(그게 이 화면의 일이다). 다만 이름과 주소만 보고 담아야 해서
                      「여기가 맞나」를 확인할 길이 없었다 — 21-1 장소 상세로 가는 「상세」를 따로 둔다
                      (QA PLACE-005). 담기와 보기를 한 줄에 섞지 않고 버튼을 나눈다. */}
                  {results.map((place) => (
                    <div key={place.contentId} style={{ display: 'flex', alignItems: 'stretch', gap: 6 }}>
                      <button
                        type="button"
                        data-testid={`custom-course-result-${place.contentId}`}
                        disabled={stops.length >= 20}
                        onClick={() => addStop(place)}
                        style={{
                          flex: 1, minWidth: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 9,
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
                      <button
                        type="button"
                        data-testid={`custom-course-result-detail-${place.contentId}`}
                        aria-label={`${place.title} 자세히 보기`}
                        onClick={() => {
                          try { window.sessionStorage?.setItem('moyeo.selectedTourismContentId', String(place.contentId)); } catch (_) { return; }
                          nav.go('place-detail');
                        }}
                        style={{
                          flexShrink: 0, padding: '0 11px', borderRadius: 11, border: `1px solid ${RF.softLine}`,
                          background: RF.card, color: T.primary600, fontFamily: T.fontStack, fontSize: 11.5, fontWeight: 800, cursor: 'pointer',
                        }}
                      >상세</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 코스 제목·태그 — 서버가 둘 다 필수로 받는다. 없으면 모집을 만들 수 없다. */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: T.text700, marginBottom: 6 }}>코스 제목 *</div>
            <input
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value.slice(0, 100))}
              placeholder="예: 울진 바다 따라 걷는 하루"
              data-testid="custom-course-title"
              style={{
                width: '100%', height: 44, borderRadius: 10, padding: '0 12px', boxSizing: 'border-box',
                border: `1px solid ${T.line200}`, background: T.bgBase, color: T.text900,
                fontFamily: T.fontStack, fontSize: 14,
              }}
            />
            <div style={{ fontSize: 11, color: T.text500, marginTop: 4, textAlign: 'right' }}>{courseTitle.length}/100</div>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: T.text700, marginBottom: 6 }}>코스 태그 * (1개 이상)</div>
            {courseTags
              ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {courseTags.map((tag) => {
                    const on = tagIds.includes(tag.tagId);
                    return (
                      <button
                        key={tag.tagId}
                        type="button"
                        aria-pressed={on}
                        data-testid={`custom-course-tag-${tag.tagId}`}
                        onClick={() => toggleTag(tag.tagId)}
                        style={{
                          height: 30, padding: '0 12px', borderRadius: 999, cursor: 'pointer',
                          border: on ? 0 : `1px solid ${T.line200}`,
                          background: on ? T.primary500 : 'transparent', color: on ? '#fff' : T.text700,
                          fontSize: 12, fontWeight: 800, fontFamily: T.fontStack,
                        }}
                      >{tag.name}</button>
                    );
                  })}
                </div>
              )
              // 태그를 못 받으면 **지어내지 않는다** — 고를 수 없다는 사실을 그대로 알린다.
              // 서버가 태그 1개 이상을 요구하므로 여기서 막히면 「계속하기」가 영영 안 눌린다 —
              // 까닭과 함께 **다시 부를 길**도 같이 둔다 (안드는 태그 줄이 통째로 사라져 까닭이 없었다).
              : (
                <div role="alert" data-testid="custom-course-tags-error" style={{ fontSize: 12, color: T.text500 }}>
                  태그를 불러오지 못했어요. 잠시 후{' '}
                  <button type="button" data-testid="custom-course-tags-retry" onClick={tagsData.reload} style={{ padding: 0, border: 0, background: 'transparent', color: T.primary600, fontFamily: T.fontStack, fontSize: 12, fontWeight: 900, textDecoration: 'underline', cursor: 'pointer' }}>다시 시도</button>
                  해 주세요.
                </div>
              )}
          </div>

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
            <div data-testid="custom-course-count" style={{ fontSize: 11, color: T.text500, fontVariantNumeric: 'tabular-nums' }}>{stops.length}개 방문지 · 최소 2개</div>
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
                {/* 순서 이동 버튼은 **눈에 보여야** 한다 — 18-1 이 같은 자리에서 1×1 로 숨겨 둬
                    화면 낭독기에만 잡히고 마우스로는 누를 수가 없었다(W-126). 여기도 같은 꼴이었다. */}
                <div style={{ width: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <button type="button" aria-label={`${s.name} 위로 이동`} data-testid={`move-stop-up-${i}`} disabled={i === 0} onClick={() => moveStop(i, -1)} style={moveButtonStyle(i === 0)}>↑<window.TouchTarget/></button>
                  <button type="button" aria-label={`${s.name} 아래로 이동`} data-testid={`move-stop-down-${i}`} disabled={i === stops.length - 1} onClick={() => moveStop(i, 1)} style={moveButtonStyle(i === stops.length - 1)}>↓<window.TouchTarget/></button>
                </div>
                <div style={{
                  width: 26, height: 26, borderRadius: 999, background: T.primary500, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                  /* 번호는 그 일차 안의 순서다 — customCourse 의 sequence 와 같은 값이어야 한다. */
                }}>{stops.slice(0, i).filter((other) => other.day === s.day).length + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <input
                      type="time"
                      value={s.time}
                      onChange={(event) => setStopTime(s.id, event.target.value)}
                      aria-label={`${s.name} 방문 시각`}
                      data-testid={`stop-time-${i}`}
                      style={{
                        width: 106, height: 26, padding: '0 5px', borderRadius: 7,
                        border: `1px solid ${T.line200}`, background: 'transparent',
                        fontSize: 12, fontWeight: 800, color: T.primary700,
                        fontVariantNumeric: 'tabular-nums', fontFamily: T.fontStack, flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: T.text500, marginTop: 3 }}>{s.memo}</div>
                </div>
                <button
                  type="button"
                  data-testid={`remove-stop-${i}`}
                  onClick={() => removeStop(s.id)}
                  aria-label={`${s.name} 삭제`}
                  style={{ position: 'relative', width: 28, height: 28, borderRadius: 999, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="close" size={15} color={T.text400}/>
                  <window.TouchTarget/>
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

          {outOfOrderDays.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <AddInfoBanner>
                {outOfOrderDays.map((day) => `Day ${day}`).join(' · ')} 의 방문 시각이 순서와 어긋나요.
                되짚어 가는 일정이면 그대로 두셔도 돼요.
              </AddInfoBanner>
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <AddInfoBanner>
              직접 만든 코스는 <b>여행이 확정되기 전까지</b> 호스트가 언제든 고칠 수 있어요. 수정하면 채팅방 멤버 모두에게 알림이 가요.
            </AddInfoBanner>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8 }}>
          <Btn variant="ghost" onClick={nav.back}>취소</Btn>
          <div style={{ flex: 1 }}>
            <Btn
              variant="primary"
              full
              disabled={stops.length < 2 || !courseTitle.trim() || tagIds.length === 0}
              onClick={() => {
                window.__moyeoCourseSource = 'custom';
                // **여기서 초안에 담는다.** 예전에는 전역 플래그만 세우고 넘어가서
                // `draft.customCourse` 가 끝까지 비어 있었고, 17-5 가 조용히 생성을 포기했다.
                // 일차·순서는 서버가 1부터 세고 `sequence` 는 **그 일차 안의 순서**다.
                const byDay = {};
                const places = stops
                  .filter((stop) => stop.contentId != null)
                  .map((stop) => {
                    const day = stop.day || 1;
                    byDay[day] = (byDay[day] || 0) + 1;
                    return {
                      contentId: Number(stop.contentId),
                      dayNumber: day,
                      sequence: byDay[day],
                      visitTime: stop.time || defaultStopTime(byDay[day]),
                    };
                  });
                window.MoyeoApi?.updateRoomDraft?.({
                  courseType: 'CUSTOM',
                  courseId: null,
                  courseTitle: courseTitle.trim(),
                  customCourse: {
                    title: courseTitle.trim(),
                    description: null,
                    places,
                    tagIds,
                  },
                });
                nav.go('create-schedule');
              }}
            >이 코스로 계속하기</Btn>
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
  // 403(미참여)·500 이 모두 같은 길로 떨어져 「아직 등록된 공지가 없어요.」가 됐다 (W-30).
  const [noticeStatus, setNoticeStatus] = React.useState(liveMode ? 'loading' : 'signed-out');
  const [noticeReloadKey, setNoticeReloadKey] = React.useState(0);
  React.useEffect(() => {
    if (!liveMode || !roomId) { setNoticeStatus(liveMode ? 'no-target' : 'signed-out'); return undefined; }
    let active = true;
    setNoticeStatus('loading');
    window.MoyeoApi.roomNotices(roomId)
      .then((result) => {
        if (!active) return;
        if (Array.isArray(result?.pinnedNotices)) { setServerNotices(result); setNoticeStatus('ready'); }
        else setNoticeStatus('error');
      })
      .catch((error) => {
        if (!active) return;
        // 403 은 「이 방 사람이 아니다」이고 500 은 조회 실패다 — 같은 문구로 뭉개지 않는다.
        setNoticeStatus(error?.status === 403 ? 'forbidden' : 'error');
      });
    // 공지 작성은 호스트만 — members 응답의 host && me 로 판정한다.
    window.MoyeoApi.roomMembers(roomId)
      .then((result) => { if (active) setIsHost(Boolean((result?.members || []).some((member) => member.me && member.host))); })
      .catch(() => {});
    return () => { active = false; };
  }, [liveMode, roomId, noticeReloadKey]);
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
      setNoticeError(window.userFacingError(error, '고정 상태를 바꾸지 못했어요.'));
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
      setNoticeError(window.userFacingError(error, '고정 상태를 바꾸지 못했어요.'));
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
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{window.MoyeoApi.formatNoticeTime(notice.createdAt)}</span>
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
  const noticeNotice = !liveMode
    ? '로그인하면 모집 중인 모임을 볼 수 있어요.'
    : ({
      loading: '불러오는 중이에요…',
      forbidden: '이 모임의 참여자만 공지를 볼 수 있어요.',
      error: '공지를 불러오지 못했어요.',
    }[noticeStatus] || '아직 등록된 공지가 없어요.');
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="공지 이력" left center onBack={nav.back}/>
        <div role={noticeStatus === 'error' ? 'alert' : 'status'} data-testid="notice-history-state" style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13, lineHeight: '21px' }}>
          {noticeNotice}
        </div>
        {liveMode && noticeStatus === 'error' && (
          <div style={{ textAlign: 'center' }}>
            <button type="button" data-testid="notice-history-retry" onClick={() => setNoticeReloadKey((key) => key + 1)} style={{ height: 42, padding: '0 18px', borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card, color: T.primary600, fontSize: 13.5, fontWeight: 800, fontFamily: T.fontStack, cursor: 'pointer' }}>다시 시도</button>
          </div>
        )}
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
  // 대표 사진은 **서버 필수**다. 안 고르면 예전처럼 내장 자리표시자를 올리지 않고 막는다.
  // 고른 사진은 초안(메모리)에 담아 두고 처음 값으로 되살린다 — 「이전」으로 4/5 에 갔다 오면
  // 이 화면이 다시 마운트돼서, 화면 state 에만 두던 예전에는 사진만 조용히 사라졌다(W-127).
  const [thumbnailFile, setThumbnailFile] = React.useState(() => window.MoyeoApi?.roomThumbnail?.() || null);
  const [thumbnailPreview, setThumbnailPreview] = React.useState('');
  const thumbnailInputRef = React.useRef(null);

  // 고른 파일의 미리보기 URL 은 반드시 되돌려준다 — 안 하면 고를 때마다 샌다.
  React.useEffect(() => {
    if (!thumbnailFile) { setThumbnailPreview(''); return undefined; }
    const url = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnailFile]);
  const [error, setError] = React.useState('');
  // 등록 코스는 `courseId`, 직접 만든 코스는 `customCourse`(방문지 2개 이상 + 태그 1개 이상)가 있어야 한다.
  // 예전에는 **등록 코스만** 허용했다 — 17-1a 가 초안에 `customCourse` 를 담지 않아 조립할 값이
  // 없었기 때문이다. 이제 17-1a 가 담으므로 직접 만든 코스도 그대로 만들 수 있다(QA 2026-09-12).
  const customPlaces = payload?.customCourse?.places;
  // 2/5 는 집합 장소를 **필수(*)** 로 적어 두는데 조건은 코스만 봤다 — 비워 둔 채로도 모집이
  // 열렸고, 서버가 좌표를 nullable 로 받아 그대로 저장됐다. 그러면 모집 상세·채팅방의
  // 집합 지도와 길 찾기가 통째로 빈다 (W-121). 화면이 필수라고 말했으면 여기서 지킨다.
  const hasMeetingPoint = Number.isFinite(Number(payload?.meetingLatitude))
    && Number.isFinite(Number(payload?.meetingLongitude));
  const canCreate = Boolean(
    payload && hasMeetingPoint && (
      (payload.courseType === 'PUBLIC' && payload.courseId != null)
      || (payload.courseType === 'CUSTOM'
        && Array.isArray(customPlaces) && customPlaces.length >= 2
        && Array.isArray(payload.customCourse.tagIds) && payload.customCourse.tagIds.length > 0
        && String(payload.customCourse.title || '').trim() !== '')
    ),
  );
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
    // 서버는 `thumbnail` 파트를 **필수**로 받는다(빼면 400 `40041`).
    // 예전에는 안 고르면 내장 「이미지 없음」 그림을 대신 올려서, 실사용자 목록에
    // 회색 자리표시자 카드가 그대로 올라갔다 — 진짜 사진과 구분이 안 된다 (2026-09-13).
    if (!thumbnailFile) {
      setError('대표 사진을 한 장 골라 주세요. 목록에 이 사진이 보여요.');
      return;
    }
    // **조용히 다른 화면으로 넘어가지 않는다.** 예전에는 여기서 `nav.go('host-manage')` 로 빠져
    // 사용자에게는 「모집이 만들어진 것처럼」 보였다 — 실제로는 아무것도 만들어지지 않았다.
    if (!canCreate) {
      setError(!hasMeetingPoint
        ? '집합 장소를 먼저 정해 주세요. 2/5 일정 화면의 「집합 장소 · 집합 시간」에서 지도로 고를 수 있어요.'
        : (payload?.courseType === 'CUSTOM'
          ? '직접 만든 코스는 방문지 2개 이상과 코스 제목·태그가 필요해요. 코스 단계에서 채워 주세요.'
          : '코스를 먼저 골라 주세요.'));
      return;
    }
    if (submitting) return;
    // 제목은 **서버 필수**(`@NotBlank`)다. 비어 있으면 400 을 받고 「모집을 열지 못했어요」만
    // 남는다 — 무엇이 모자란지 말해준다. 안드로이드는 같은 검사를 예전부터 한다
    // (`RecruitmentDraftStore.validationError`). 2026-09-10.
    if (!String(payload.title || '').trim()) {
      setError('모집 이름을 입력해 주세요. 이전 단계에서 적을 수 있어요.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const created = await window.MoyeoApi.createRoom(payload, thumbnailFile);
      const roomId = created?.roomId;
      if (roomId == null) throw new Error('생성된 모집을 찾지 못했어요.');
      // TAB-STATE-CANON R4: 이 화면이 목록을 바꿨다 — 탭 보관소에서 덜어내
      // 다음 진입에서 한 번만 다시 받게 한다.
      window.MoyeoTabCache?.invalidate?.(window.MoyeoTabCache.ROOM_LIST_KEYS);
      window.MoyeoApi.clearRoomDraft();
      window.MoyeoApi.selectRoom(roomId);
      // 만들기 5단계는 여기서 끝난다 — 스택에 남겨 두면 뒤로 갔을 때 **비워진 초안으로**
      // 5/5 리뷰가 다시 열리고, 또 뒤로 가면 빈 4/5 가 나온다(CREATE-071).
      nav.go('detail', { exitFlow: 'create-' });
    } catch (failure) {
      setError(window.userFacingError(failure, '모집을 열지 못했어요.'));
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

          {/* 대표 사진 — 서버 필수 파트다. 18-6 모집 내용 수정과 같은 배치로 그린다. */}
          <div style={{ fontSize: 12.5, fontWeight: 900, margin: '18px 0 8px' }}>
            대표 사진 <span style={{ color: T.danger }}>*</span>
          </div>
          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/*"
            data-testid="create-room-thumbnail-input"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              setThumbnailFile(file);
              // 초안에도 담아 둔다 — 「이전」으로 나갔다 와도 같은 사진이 남아 있어야 한다(W-127).
              window.MoyeoApi?.setRoomThumbnail?.(file);
              // 사진이 없다고 띄운 경고는 사진을 고른 순간 지운다 — 조건을 채웠는데도
              // 빨간 글씨가 남아 있으면 계속 뭔가 잘못된 것처럼 보인다(W-128).
              if (file) setError('');
              event.target.value = '';
            }}
            style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
          />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {thumbnailPreview
              ? <img src={thumbnailPreview} alt="" style={{ width: 92, height: 68, borderRadius: 10, objectFit: 'cover', border: `1px solid ${RF.softLine}` }}/>
              : <div style={{ width: 92, height: 68, borderRadius: 10, border: `1px dashed ${T.line200}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="camera" size={18} color={T.text400}/></div>}
            <div style={{ flex: 1 }}>
              <Btn onClick={() => thumbnailInputRef.current?.click()} testId="create-room-thumbnail-pick">
                {thumbnailFile ? '사진 바꾸기' : '사진 고르기'}
              </Btn>
              <div style={{ fontSize: 11, color: T.text400, marginTop: 6, lineHeight: '16px' }}>
                {thumbnailFile ? '목록에 이 사진이 보여요' : '모집 목록과 상세에 이 사진이 보여요'}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, padding: 13, borderRadius: 12, background: T.primary50, border: `1px solid ${T.primary100}`, fontSize: 12, lineHeight: '18px', color: T.primary700 }}>
            {/* 「3명」은 화면에 박아 둔 숫자였다 — 최소 인원을 4명으로 정해도 3명이라고 적혔다.
                3/5 에서 고른 값(`minParticipants`)을 그대로 말한다. */}
            최소 {draft?.minParticipants || 3}명이 모이면 채팅방이 자동으로 열리고, 마감일까지 못 채우면 자연스럽게 소멸돼요.
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

// 서버 `ChatRoomService.MIN_PLACES_PER_DAY` 와 같은 값이다
// (`validateCustomCourseSchedule` 이 일차마다 이만큼을 요구한다).
const MIN_PLACES_PER_DAY = 2;

/** 코스 하나에 담을 수 있는 방문지 수 상한 — 17-4 코스 에디터와 같은 값이다. */
const MAX_ROUTE_STOPS = 20;

// 저장 전에 서버 `ChatRoomService.validateCustomCourseSchedule` 과 **같은 것을 본다** —
// 1일차부터 여행 마지막 일차까지 빠짐없이, 일차마다 2곳 이상.
// 여기에 `UpdateTravelCourseRequest.places` 의 `@Size(min = 2)` 까지 더한다.
// 서버가 거절하면 오류 원문만 남아 무엇이 모자란지 알 수 없어, 보내기 전에 한국어로 말해 준다.
// 안드로이드 `data/courses/RoomCourseEdit.kt` 와 같은 검사다.
function roomCourseScheduleError(places, tripDays) {
  if (places.length < MIN_PLACES_PER_DAY) return '방문지는 2곳 이상이어야 해요.';
  const countByDay = places.reduce((acc, place) => {
    const day = place.dayNumber || 1;
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
  for (let day = 1; day <= tripDays; day += 1) {
    const count = countByDay[day] || 0;
    if (count < MIN_PLACES_PER_DAY) return `${day}일차 방문지가 ${count}곳이에요. 일차마다 2곳 이상 남겨 주세요.`;
  }
  const beyond = Object.keys(countByDay).map(Number).filter((day) => day > tripDays).sort((a, b) => a - b)[0];
  if (beyond != null) return `여행은 ${tripDays}일인데 ${beyond}일차 방문지가 있어요. 모집 조건에서 일정을 늘려 주세요.`;
  return '';
}

// 18-1 여행 경로 수정이 `PATCH /travel-courses/chat-rooms/{roomId}` 로 되돌려 보낼 방문지 목록.
// `sequence` 는 **그 일차 안의 순번**이다(BE `CustomCoursePlaceRequest.sequence` —
// 「같은 일차 안의 방문 순서. 1부터 시작합니다.」). 전역 순번으로 보내면 거절당한다.
// 화면에서 방문지를 지우거나 순서를 바꾸면 읽어 온 `sequence` 에 구멍이 나거나 값이 겹치는데,
// 서버는 같은 일차 안에 겹치는 `sequence` 를 거절한다(`hasUniqueSequencesEveryDay`).
// 그래서 보내기 직전에 일차별로 다시 매긴다. 목록은 일차·순서대로 정렬돼 있어야 한다.
function toCoursePlaceEdits(places) {
  const sequenceByDay = {};
  return places.map((place) => {
    const day = place.dayNumber || 1;
    const sequence = (sequenceByDay[day] || 0) + 1;
    sequenceByDay[day] = sequence;
    return {
      contentId: Number(place.contentId),
      dayNumber: day,
      sequence,
      // 서버 `CustomCoursePlaceRequest.visitTime` 은 **필수**라 빈 값으로는 보낼 수 없다.
      // 응답 쪽 `visitTime` 은 nullable 이므로, 비어 있으면 17-4 에디터가 쓰는 기본 시각을
      // 그 일차의 순번대로 채운다(`HH:mm` — 18-7 저장과 같은 꼴).
      visitTime: String(place.visitTime || '').slice(0, 5) || defaultStopTime(sequence),
    };
  });
}

// 18-1 방문지 순서 이동 버튼 꼴. 끝자리(위로 갈 곳이 없는 첫 방문지 등)는 눌리지 않는 것이
// 색으로도 보여야 한다 — 예전 숨은 버튼은 활성·비활성이 똑같이 안 보였다.
function moveButtonStyle(disabled) {
  return {
    // 보이는 크기는 그대로 두고 `TouchTarget` 으로 닿는 넓이만 44 로 넓힌다 (QA ENV-009).
    position: 'relative',
    width: 20, height: 16, padding: 0, borderRadius: 5,
    border: `1px solid ${disabled ? T.line100 : T.line200}`, background: 'transparent',
    color: disabled ? T.text300 : T.text700, fontSize: 10, lineHeight: '14px',
    fontFamily: T.fontStack, cursor: disabled ? 'default' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
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
  // 서버 코스를 고치는 중인 방문지 목록. 읽어 온 것을 그대로 담고, 저장할 때만 되돌려 보낸다.
  const [serverStops, setServerStops] = React.useState(null);
  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState('');
  // 저장한 뒤 서버 값을 다시 읽어 화면과 서버를 맞추기 위한 열쇠다.
  const [reloadKey, setReloadKey] = React.useState(0);
  // ── 방문지 추가 (GET /tourism-contents?keyword=) ──
  // 서버는 등록된 관광 콘텐츠(`contentId`)만 받는다 — 그래서 **빈 방문지를 만들지 않고**
  // 검색에서 고른 곳만 담는다(17-4 코스 에디터와 같은 규칙 · 정본 NO-MOCK R1).
  // 어느 일차에 담는지는 **누른 자리**가 말한다 — 순서 바꾸기가 일차 경계를 넘지 못하므로
  // 담은 뒤에 날을 옮길 수 없다.
  const [addingDay, setAddingDay] = React.useState(null);
  const [addQuery, setAddQuery] = React.useState('');
  const [addKeyword, setAddKeyword] = React.useState('');
  const [addResults, setAddResults] = React.useState([]);
  const [addStatus, setAddStatus] = React.useState('idle');
  const [addRetryKey, setAddRetryKey] = React.useState(0);
  React.useEffect(() => {
    if (!addKeyword) { setAddResults([]); setAddStatus('idle'); return undefined; }
    let active = true;
    setAddStatus('loading');
    window.MoyeoTourism.list({ keyword: addKeyword, size: 20 })
      .then((result) => { if (active) { setAddResults(result.items || []); setAddStatus('done'); } })
      .catch(() => { if (active) { setAddResults([]); setAddStatus('error'); } });
    return () => { active = false; };
  }, [addKeyword, addRetryKey]);
  const closeAddPanel = () => {
    setAddingDay(null);
    setAddQuery('');
    setAddKeyword('');
    setAddResults([]);
    setAddStatus('idle');
  };
  // 고른 방문지를 그 일차의 **맨 뒤**에 꽂는다 — 목록의 위아래가 곧 저장될 `sequence` 다.
  const addServerStop = (day, place) => {
    if (!place?.contentId) return;
    setServerStops((current) => {
      const list = current || [];
      if (list.length >= MAX_ROUTE_STOPS) return list;
      const inserted = {
        contentId: place.contentId,
        dayNumber: day,
        sequence: list.filter((stop) => (stop.dayNumber || 1) === day).length + 1,
        // 서버 `CustomCoursePlaceRequest.visitTime` 은 **필수**다.
        visitTime: defaultStopTime(list.filter((stop) => (stop.dayNumber || 1) === day).length + 1),
        title: place.title,
        thumbnail: place.thumbnail || null,
        latitude: place.latitude,
        longitude: place.longitude,
      };
      const lastOfDay = list.map((stop) => (stop.dayNumber || 1)).lastIndexOf(day);
      const at = lastOfDay >= 0
        ? lastOfDay + 1
        : (() => {
          const after = list.findIndex((stop) => (stop.dayNumber || 1) > day);
          return after >= 0 ? after : list.length;
        })();
      return [...list.slice(0, at), inserted, ...list.slice(at)];
    });
    setDirty(true);
    setSaveError('');
    closeAddPanel();
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
      .then((result) => {
        if (!active || !result?.course) return;
        setServerCourse(result.course);
        // 일차·순서대로 세워 둔다 — 화면의 위아래가 곧 저장될 `sequence` 다.
        setServerStops([...(result.course.places || [])].sort(
          (a, b) => (a.dayNumber - b.dayNumber) || (a.sequence - b.sequence),
        ));
        setDirty(false);
        setSaveError('');
      })
      .catch(() => { /* 실패 시 목데이터 유지 */ });
    window.MoyeoApi.roomDetail(roomId)
      .then((result) => { if (active && result?.roomId != null) setServerRoom(result); })
      .catch(() => {});
    window.MoyeoApi.roomMembers(roomId)
      .then((result) => { if (active) setIsHost(Boolean((result?.members || []).find((member) => member.me)?.host)); })
      .catch(() => { /* 미참여자면 호스트가 아니다 */ });
    return () => { active = false; };
  }, [liveMode, roomId, reloadKey]);
  // 집합 정보는 **18-5 집합 정보 수정**에서 고친다. 예전에는 모집 **만들기** 2/5(17-3 집합 장소)로
  // 보내서 단계 표시·「이 위치로 지정」이 붙은 화면이 열렸고, 집합 시간 자리에는 방의 실제 값이
  // 아니라 폼 기본값 07:50 이 보였다(W-134). 18-5 는 방의 집합 날짜·시각·안내를 그대로 읽어 온다.
  const openMeetingEdit = () => {
    window.MoyeoApi.selectMeetingEditRoom(null);
    nav.go('meeting-edit');
  };
  const serverPlaces = serverStops;
  // 좌표는 서버 코스가 준 것만 쓴다. 좌표가 없으면 지도를 그리지 않는다(R4).
  const courseRoute = React.useMemo(
    () => (serverPlaces ? window.MoyeoKakaoMap?.routeFromPlaces?.(serverPlaces) : null) || null,
    [serverPlaces],
  );
  // 화면에 그릴 방문지 — 서버 코스에는 메모가 없어 메모 줄을 생략한다.
  // `index` 는 편집 대상을 가리키는 자리다. `id` 에 `sequence` 를 쓰면 지우거나 순서를 바꾸는
  // 중에 값이 겹쳐 같은 key 가 두 번 나오므로 자리로 구분한다.
  const visibleStops = serverPlaces
    ? serverPlaces.map((place, index) => ({
      id: `${place.dayNumber}-${place.contentId}-${index}`,
      index,
      day: place.dayNumber || 1,
      time: window.MoyeoApi.formatTime(place.visitTime),
      name: place.title,
      memo: '',
    }))
    // 목업 모드는 일차 구분이 없어 모두 1일차로 둔다(기존 화면 그대로다).
    : stops.map((stop, index) => ({ ...stop, index, day: 1 }));
  const serverMode = Boolean(serverPlaces);
  // 서버가 받아 주는 조건 그대로다 — BE `ChatRoomService.updateRoomCourse` 는
  // `status == RECRUITING` · `course.type == CUSTOM` · `course.owner == 호스트` 셋이 다 맞아야 200 이다.
  // 코스 주인은 응답에 없지만, 이 방의 CUSTOM 코스는 호스트가 만든 것이라 호스트 본인 여부로 본다
  // (18-7 코스 이름 수정이 이미 같은 조건을 쓴다). 하나라도 어긋나면 고칠 수 있는 척하지 않는다.
  // 로그인 상태에서는 응답이 오기 전까지 `serverMode` 가 false 라 **프로토타입 편집 UI**
  // (시각 입력·저장 버튼)가 먼저 보였다가 읽기 전용으로 뒤집혔다 (W-83).
  // 권한을 모르는 동안에는 편집 가능한 척하지 않는다.
  const canEdit = liveMode
    ? (serverMode && isHost && serverRoom?.status === 'RECRUITING' && serverCourse?.type === 'CUSTOM')
    : editable;

  // 방문지를 지우는 것은 화면에 보이는 자리로 한다. 목업 모드는 예전처럼 2곳 아래로 못 줄인다.
  const removeStopAt = (index) => {
    if (serverMode) {
      setServerStops((current) => current.filter((_, at) => at !== index));
      setDirty(true);
      setSaveError('');
      return;
    }
    setStops((current) => (current.length <= MIN_PLACES_PER_DAY ? current : current.filter((_, at) => at !== index)));
  };
  // 순서 바꾸기는 **같은 일차 안에서만** 한다 — 일차 경계를 넘기면 방문지의 dayNumber 가
  // 화면에 보이는 자리와 어긋난다(17-4 코스 에디터와 같은 규칙).
  const moveStopAt = (index, direction) => {
    const target = index + direction;
    const list = serverMode ? serverStops : stops;
    if (target < 0 || target >= list.length) return;
    if ((list[index].dayNumber || 1) !== (list[target].dayNumber || 1)) return;
    // **방문 시각은 자리에 남는다.** 객체를 통째로 바꾸면 시각까지 따라 움직여서,
    // 순서만 바꿨을 뿐인데 「1번 14:30 → 2번 10:50」 처럼 되짚어 가는 일정이 만들어졌다
    // (iOS IOS-F142 와 같은 메커니즘 · W-145 의 뿌리). 자리에 매인 것은 시각이고,
    // 옮기는 것은 방문지다 — 서버 `sequence` 도 자리 순서로 다시 매겨 보낸다.
    const swap = (current) => {
      const next = [...current];
      const here = current[index];
      const there = current[target];
      // 서버 코스는 `visitTime`, 목업 목록은 `time` 으로 같은 값을 들고 있다.
      next[index] = { ...there, visitTime: here.visitTime, time: here.time };
      next[target] = { ...here, visitTime: there.visitTime, time: there.time };
      return next;
    };
    if (serverMode) {
      setServerStops(swap);
      setDirty(true);
      setSaveError('');
      return;
    }
    setStops(swap);
  };
  // 방문 시각 고치기 — 순서·삭제 말고도 실제로 할 수 있는 편집이 있어야 한다(W-126).
  // 일차마다 방문지가 딱 2곳인 코스는 지울 수도 없고(「일차마다 2곳 이상」에 걸린다)
  // 순서를 바꿔도 두 곳뿐이라, 시각이 유일하게 의미 있는 편집인 경우가 있다.
  // 서버 `CustomCoursePlaceRequest.visitTime` 은 **필수**라 빈 값은 받지 않는다 —
  // 입력칸을 비우는 중간 상태는 무시하고 값이 들어올 때만 반영한다.
  const setStopTimeAt = (index, value) => {
    if (!serverMode || !value) return;
    setServerStops((current) => current.map((place, at) => (at === index ? { ...place, visitTime: value } : place)));
    setDirty(true);
    setSaveError('');
  };

  // 같은 일차 안에서 방문 시각이 순서를 거스르는 날. **막지 않고 알려만 준다** —
  // 되짚어 가는 일정도 있어 판단은 호스트 몫이다(17-4 코스 에디터와 같은 규칙 · W-145).
  // 예전에는 이 화면에만 안내가 없어 오후 → 오전으로 되돌아가는 경로가 아무 말 없이 저장됐다.
  const outOfOrderDays = React.useMemo(() => {
    if (!serverPlaces) return [];
    const days = [...new Set(serverPlaces.map((place) => place.dayNumber || 1))].sort((a, b) => a - b);
    return days.filter((day) => {
      const times = serverPlaces.filter((place) => (place.dayNumber || 1) === day)
        .map((place) => window.MoyeoApi.formatTime(place.visitTime) || '');
      return times.join() !== [...times].sort().join();
    });
  }, [serverPlaces]);

  // 서버 코스 저장 — `places` 는 필수(최소 2개)이고 `sequence` 는 일차 안의 순번이다.
  // 이름·소개는 보내지 않는다: PATCH 는 생략한 필드를 그대로 두고(BE `TravelCourse.updateInformation`
  // 이 null 을 무시한다), 이름은 18-7 이 고친다.
  const saveServerCourse = async () => {
    if (saving || !serverStops) return;
    // 여행 일수는 모임 상세에서만 온다 — 못 읽었으면 서버 규칙을 검사할 수 없어 보내지 않는다.
    const tripDays = serverRoom?.tripDays;
    if (!tripDays) { setSaveError('모임 정보를 아직 읽지 못했어요. 잠시 뒤 다시 시도해 주세요.'); return; }
    const blocked = roomCourseScheduleError(serverStops, tripDays);
    if (blocked) { setSaveError(blocked); return; }
    setSaving(true);
    setSaveError('');
    try {
      await window.MoyeoApi.updateRoomCourse(roomId, { places: toCoursePlaceEdits(serverStops) });
      setDirty(false);
      setReloadKey((key) => key + 1); // 저장된 값을 다시 읽어 화면과 서버를 맞춘다
    } catch (error) {
      setSaveError(window.userFacingError(error, '경로를 저장하지 못했어요.'));
    }
    setSaving(false);
  };

  // 서버 코스가 있으면 방문지 수·일정은 서버 값으로 적는다 (없는 값은 생략).
  const serverMeta = serverMode
    ? [
      serverRoom?.startDate ? `${window.MoyeoApi.formatDate(serverRoom.startDate)}${serverRoom.endDate ? ` - ${window.MoyeoApi.formatDate(serverRoom.endDate)}` : ''}` : null,
      serverRoom ? window.MoyeoApi.tripTypeLabel(serverRoom) : null,
      `방문지 ${visibleStops.length}개`,
      serverRoom?.participantCount != null && serverRoom?.maxParticipants != null ? `${serverRoom.participantCount}/${serverRoom.maxParticipants}명` : null,
    ].filter(Boolean).join(' · ')
    : '';
  // 안내는 **지금 이 방에서 실제로 할 수 있는 것**만 말한다 — 예전 배너는 커스텀 코스에까지
  // 「확인만 할 수 있어요」라고 해서 1/5 단계·18-7 안내와 정면으로 어긋났다.
  const banner = serverMode
    ? (canEdit
      ? {
        icon: 'sparkle', bg: T.primary50, bd: T.primary100, fg: T.primary700,
        title: '마감 전까지 경로를 바꿀 수 있어요',
        // 배너는 **여기서 실제로 되는 것만** 말한다. 예전에는 「방문지와 순서를 고칠 수 있어요」라고
        // 적어 놓고 순서 이동 버튼이 1×1 로 숨겨져 눌리지도 않았고, 방문지를 새로 넣는 길도 없어서
        // 일차마다 2곳인 코스는 가능한 편집이 0개였다(W-126).
        // **「방문지를 새로 넣는 건 여기서 못 해요」는 이제 거짓이다** — 그 뒤 「Day N 방문지 추가」가
        // 생겼고 2026-09-14 실서버로 추가·저장이 되는 것을 확인했다(방 407). 안내가 화면보다
        // 뒤처져 있어서, 바로 아래 있는 버튼을 두고 못 한다고 말하고 있었다.
        body: '직접 만든 코스예요. 방문지를 더하거나 지우고, 순서와 방문 시각도 바꿀 수 있어요. 저장하면 멤버 모두에게 알림이 가요.',
      }
      // **잠금 조건은 그대로 `status !== 'RECRUITING'` 이다** — 확정된 방도 불발된 방도 경로를 못 고친다.
      // 갈라지는 건 문구뿐이다. 예전에는 불발된 방에도 「여행이 확정돼 잠겼어요」라고 말해
      // 접은 모임을 확정된 모임으로 읽게 했다(안드 AND-119 와 같은 결함).
      : serverRoom && serverRoom.status !== 'RECRUITING'
        ? (serverRoom.status === 'CANCELLED'
          ? {
            icon: 'lock', bg: T.warningBg, bd: T.warningBg, fg: T.warningText,
            title: '불발된 모임이라 경로가 잠겼어요',
            body: '이 모임은 불발 처리돼 채팅방이 닫혔어요. 경로는 더 바꿀 수 없어요. 같은 코스로 새 모집을 열 수는 있어요.',
          }
          : {
            icon: 'clock', bg: T.warningBg, bd: T.warningBg, fg: T.warningText,
            title: '여행이 확정돼 경로가 잠겼어요',
            body: '모집이 끝나 인원이 확정됐어요. 지금부터는 경로를 바꿀 수 없어요. 변경이 필요하면 채팅방 공지로 알려주세요.',
          })
        : serverCourse?.type === 'CUSTOM'
          ? {
            icon: 'lock', bg: T.bgSubtle, bd: RF.softLine, fg: T.text700,
            title: '경로는 호스트만 고칠 수 있어요',
            body: '호스트가 직접 만든 코스예요. 방문지·순서는 호스트가 마감 전까지 바꿀 수 있어요.',
          }
          : {
            icon: 'lock', bg: T.bgSubtle, bd: RF.softLine, fg: T.text700,
            title: '등록된 코스라 경로는 고정이에요',
            body: '서비스에 등록된 코스를 그대로 가져왔어요. 방문지와 순서는 바꿀 수 없고, 집합 장소·시간과 모집 조건만 수정할 수 있어요.',
          })
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
          right={canEdit ? <button type="button" data-testid="course-route-save" disabled={serverMode && (!dirty || saving)} onClick={serverMode ? saveServerCourse : saveAndNotify} style={{ border: 'none', background: 'transparent', color: serverMode && (!dirty || saving) ? T.text400 : T.primary600, fontSize: 14, fontWeight: 900, fontFamily: T.fontStack, cursor: 'pointer', padding: '0 4px' }}>{serverMode && saving ? '저장 중...' : '저장'}</button>
            /* 고칠 수 없는 방에는 **아무것도 두지 않는다** — 예전에는 이 자리에 ⋯ 버튼이
               `onClick`·`aria-label` 없이 남아 있어서, 눌러도 아무 일이 없고 화면 낭독기에는
               이름 없는 버튼으로 잡혔다(W-143). 여기서 열 메뉴가 아직 없다. */
            : null}
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

          {/* 일차마다 머리글을 두고 그 아래에 그 일차 방문지만 그린다. 예전에는 「Day 1」 하나에
              2일차 방문지까지 쏟아 넣고 번호도 통번호라, 2일차 첫 방문지가 화면엔 「3」인데
              서버엔 `sequence 1` 로 저장돼 어긋나 보였다. 17-4 코스 에디터와 같은 꼴이다. */}
          {/* 방문지가 하나도 없으면 그릴 일차가 없다 — 머리글 줄만 예전처럼 남긴다
              (18-2·18-3 잠금 화면은 이 줄의 「수정 불가」로 상태를 읽는다) */}
          {visibleStops.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 900 }}>Day 1</div>
              {!canEdit && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: T.text500 }}>
                  <Icon name="lock" size={12} color={T.text500} strokeWidth={2}/> 수정 불가
                </div>
              )}
            </div>
          )}
          {/* 여행 일수를 알면 **1일차부터 마지막 일차까지 빠짐없이** 그린다 — 서버가 그렇게
              요구하고(`validateCustomCourseSchedule`), 방문지를 다 지워 비어 버린 일차에도
              「방문지 추가」가 남아 있어야 다시 채울 수 있다. */}
          {[...new Set([
            ...visibleStops.map((stop) => stop.day),
            ...Array.from({ length: (serverMode && serverRoom?.tripDays) || 0 }, (_, i) => i + 1),
          ])].sort((a, b) => a - b).map((day) => {
            const dayStops = visibleStops.filter((stop) => stop.day === day);
            return (
              <React.Fragment key={`course-edit-day-${day}`}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 900 }}>Day {day}</div>
                  {!canEdit && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: T.text500 }}>
                      <Icon name="lock" size={12} color={T.text500} strokeWidth={2}/> 수정 불가
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                  {dayStops.map((s, orderInDay) => (
                    <div key={s.id} style={{
                      borderRadius: 12, border: `1px solid ${RF.softLine}`,
                      background: canEdit ? RF.card : T.bgSubtle,
                      padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      {/* 순서 이동 버튼은 **눈에 보여야** 한다 — 예전에는 ≡ 아이콘 옆 1×1 로 숨겨 둬서
                          화면 낭독기에만 잡히고 마우스로는 누를 수가 없었다. 끌어서 옮기는 기능도 없어
                          호스트에게는 「아무 일도 안 일어나는 버튼」이었다(W-126). */}
                      {canEdit
                        ? <div style={{ width: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <button type="button" aria-label={`${s.name} 위로 이동`} data-testid={`course-route-move-up-${s.index}`} disabled={orderInDay === 0} onClick={() => moveStopAt(s.index, -1)} style={moveButtonStyle(orderInDay === 0)}>↑</button>
                          <button type="button" aria-label={`${s.name} 아래로 이동`} data-testid={`course-route-move-down-${s.index}`} disabled={orderInDay === dayStops.length - 1} onClick={() => moveStopAt(s.index, 1)} style={moveButtonStyle(orderInDay === dayStops.length - 1)}>↓</button>
                        </div>
                        : <div style={{ width: 22, display: 'flex', justifyContent: 'center' }}><Icon name="lock" size={14} color={T.text300} strokeWidth={2}/></div>}
                      <div style={{
                        width: 26, height: 26, borderRadius: 999,
                        background: canEdit ? T.primary500 : T.line300, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 800, fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                      }}>{/* 번호는 일차별 1부터다 — 서버 `sequence` 가 그 일차 안의 순번이다 */}{orderInDay + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          {/* 방문 시각은 17-4 코스 에디터와 같은 `input[type=time]` 로 고친다 */}
                          {canEdit && serverMode
                            ? <input
                              type="time"
                              value={s.time}
                              onChange={(event) => setStopTimeAt(s.index, event.target.value)}
                              aria-label={`${s.name} 방문 시각`}
                              data-testid={`course-route-stop-time-${s.index}`}
                              style={{
                                width: 106, height: 26, padding: '0 5px', borderRadius: 7,
                                border: `1px solid ${T.line200}`, background: 'transparent',
                                fontSize: 12, fontWeight: 800, color: T.primary700,
                                fontVariantNumeric: 'tabular-nums', fontFamily: T.fontStack, flexShrink: 0,
                              }}
                            />
                            : <span style={{ fontSize: 12, fontWeight: 800, color: canEdit ? T.primary700 : T.text500, fontVariantNumeric: 'tabular-nums' }}>{s.time}</span>}
                          <span style={{ fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                        </div>
                        <div style={{ fontSize: 11, color: T.text500, marginTop: 3 }}>{s.memo}</div>
                      </div>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => removeStopAt(s.index)}
                          aria-label={`${s.name} 삭제`}
                          style={{ position: 'relative', width: 28, height: 28, borderRadius: 999, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="close" size={15} color={T.text400}/>
                          <window.TouchTarget/>
                        </button>
                      )}
                    </div>
                  ))}
                  {canEdit && serverMode && (
                    addingDay === day
                      ? (
                        <div data-testid={`course-route-add-panel-${day}`} style={{ borderRadius: 12, border: `1px solid ${T.line200}`, background: RF.card, padding: 11 }}>
                          <form onSubmit={(event) => { event.preventDefault(); setAddKeyword(addQuery.trim()); }} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon name="search" size={16} color={T.text500}/>
                            <input
                              value={addQuery}
                              onChange={(event) => setAddQuery(event.target.value)}
                              aria-label={`Day ${day} 에 더할 방문지 검색`}
                              data-testid={`course-route-add-query-${day}`}
                              placeholder="지역이나 장소 이름"
                              style={{ minWidth: 0, flex: 1, border: 0, outline: 0, background: 'transparent', color: T.text900, fontFamily: T.fontStack, fontSize: 13 }}
                            />
                            <button type="submit" data-testid={`course-route-add-search-${day}`} style={{ height: 28, padding: '0 10px', border: 0, borderRadius: 8, background: T.primary50, color: T.primary700, fontFamily: T.fontStack, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>검색</button>
                            <button type="button" onClick={closeAddPanel} aria-label="방문지 추가 닫기" style={{ border: 0, background: 'transparent', padding: 4, cursor: 'pointer', display: 'flex' }}><Icon name="close" size={15} color={T.text400}/></button>
                          </form>
                          {addStatus === 'loading' && <div role="status" style={{ padding: '14px 0', textAlign: 'center', fontSize: 12, color: T.text500 }}>불러오는 중이에요…</div>}
                          {addStatus === 'error' && <div role="alert" style={{ padding: '14px 0', textAlign: 'center', fontSize: 12, color: T.text500 }}>불러오지 못했어요.{' '}<button type="button" data-testid={`course-route-add-retry-${day}`} onClick={() => setAddRetryKey((key) => key + 1)} style={{ padding: 0, border: 0, background: 'transparent', color: T.primary600, fontFamily: T.fontStack, fontSize: 12, fontWeight: 900, textDecoration: 'underline', cursor: 'pointer' }}>다시 시도</button></div>}
                          {addStatus === 'done' && addResults.length === 0 && <div role="status" style={{ padding: '14px 0', textAlign: 'center', fontSize: 12, color: T.text500 }}>검색 결과가 없어요</div>}
                          {addStatus === 'done' && addResults.length > 0 && (
                            <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                              {addResults.map((place) => (
                                <button
                                  key={place.contentId}
                                  type="button"
                                  data-testid={`course-route-add-result-${place.contentId}`}
                                  onClick={() => addServerStop(day, place)}
                                  style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 10, border: `1px solid ${RF.softLine}`, background: RF.card, fontFamily: T.fontStack, cursor: 'pointer' }}
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
                      )
                      : (
                        <button
                          type="button"
                          data-testid={`course-route-add-place-${day}`}
                          disabled={(serverStops || []).length >= MAX_ROUTE_STOPS}
                          onClick={() => { closeAddPanel(); setAddingDay(day); }}
                          style={{
                            width: '100%', height: 44, borderRadius: 12, border: `1px dashed ${T.line300}`,
                            background: 'transparent', color: (serverStops || []).length >= MAX_ROUTE_STOPS ? T.text400 : T.primary600,
                            fontFamily: T.fontStack, fontSize: 12.5, fontWeight: 800,
                            cursor: (serverStops || []).length >= MAX_ROUTE_STOPS ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          }}
                        >
                          <Icon name="plus" size={15} color={(serverStops || []).length >= MAX_ROUTE_STOPS ? T.text400 : T.primary600}/>
                          {(serverStops || []).length >= MAX_ROUTE_STOPS ? `방문지는 최대 ${MAX_ROUTE_STOPS}개예요` : `Day ${day} 방문지 추가`}
                        </button>
                      )
                  )}
                </div>
              </React.Fragment>
            );
          })}

          {/* 저장 전에 서버 규칙(일차마다 2곳 이상 · 마지막 일차까지 빠짐없이)에 걸린 까닭을 그대로 적는다 */}
          {canEdit && serverMode && saveError && (
            <div data-testid="course-route-save-error" style={{ marginTop: 10, fontSize: 11.5, fontWeight: 800, color: T.danger, lineHeight: '17px' }}>{saveError}</div>
          )}
          {canEdit && serverMode && outOfOrderDays.length > 0 && (
            <div data-testid="course-route-order-notice" style={{ marginTop: 12 }}>
              <AddInfoBanner>
                {outOfOrderDays.map((day) => `Day ${day}`).join(' · ')} 의 방문 시각이 순서와 어긋나요.
                되짚어 가는 일정이면 그대로 두셔도 돼요.
              </AddInfoBanner>
            </div>
          )}
          {canEdit && serverMode && (
            <div style={{ marginTop: 8, fontSize: 11, color: T.text500, lineHeight: '17px' }}>
              방문지는 일차마다 2곳 이상, 모두 합쳐 {MAX_ROUTE_STOPS}곳까지 담을 수 있어요. 코스 이름과 소개는 「코스 이름 수정」에서 바꿔요.
            </div>
          )}

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
          {/* 고칠 수 있는 방이면 저장 버튼을 함께 둔다 — 고친 내용이 없으면 눌리지 않는다 */}
          {serverMode && (
            <div style={{ flex: 1 }}><Btn variant="secondary" full onClick={() => nav.go('notice-history')}>공지 이력 보기</Btn></div>
          )}
          {serverMode && canEdit && (
            <div style={{ flex: 1 }}><Btn variant="primary" full disabled={!dirty || saving} onClick={saveServerCourse}>{saving ? '저장 중...' : '경로 저장'}</Btn></div>
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
