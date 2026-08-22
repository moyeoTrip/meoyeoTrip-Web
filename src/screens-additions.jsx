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
                <AddFieldBox icon="calendar" value="2026. 05. 25 (토)"/>
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
                <span style={{ fontSize: 12, fontWeight: 800, color: T.text700, fontVariantNumeric: 'tabular-nums' }}>5/25(토) 08:00 – 18:00 · 10시간</span>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 18, display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <AddFieldLabel required>시작 날짜</AddFieldLabel>
                  <AddFieldBox icon="calendar" value="05.25 (토)" chevron={false}/>
                </div>
                <div>
                  <AddFieldLabel required>종료 날짜</AddFieldLabel>
                  <AddFieldBox icon="calendar" value="05.26 (일)" chevron={false}/>
                </div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 13px',
                borderRadius: 12, background: T.bgSubtle, border: `1px solid ${RF.softLine}`,
              }}>
                <Chip variant="soft">1박 2일</Chip>
                <span style={{ fontSize: 12, fontWeight: 800, color: T.text700, fontVariantNumeric: 'tabular-nums' }}>5/25(토) ~ 5/26(일)</span>
              </div>
            </div>
          )}

          <div style={{ marginTop: 22, height: 1, background: RF.softLine }}/>

          <div style={{ marginTop: 20 }}>
            <AddFieldLabel required>모집 마감일</AddFieldLabel>
            <AddFieldBox
              icon="clock"
              value="2026. 05. 22 (목) 23:59"
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
                <div style={{ fontSize: 13, fontWeight: 800 }}>청송 시외버스터미널 앞</div>
                <div style={{ fontSize: 11, color: T.text500, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>07:50 집합 · 36.4356, 129.0572</div>
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
          <div style={{ flex: 1 }}><Btn variant="primary" full onClick={() => nav.go('create-people')}>다음</Btn></div>
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
  const [detail, setDetail] = React.useState('터미널 정문 앞');
  const [point, setPoint] = React.useState({ lat: 36.435612, lng: 129.057214 });
  const nudgePoint = () => setPoint((current) => ({
    lat: Number((current.lat + 0.000121).toFixed(6)),
    lng: Number((current.lng - 0.000094).toFixed(6)),
  }));

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
            <MiniMap height={244} withRoute={false}/>
            <button type="button" onClick={nudgePoint} aria-label="지도 핀 위치 조정" data-testid="meeting-map-pin" style={{
              position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -100%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', border: 0, background: 'transparent', padding: 0, cursor: 'pointer',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 999, background: T.primary500,
                border: `3px solid ${T.avatarRing}`, boxShadow: T.l2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="pin" size={20} color="#fff"/>
              </div>
              <div style={{ width: 2, height: 12, background: T.primary500 }}/>
              <div style={{ width: 12, height: 4, borderRadius: 999, background: 'rgba(15,23,20,0.25)' }}/>
            </button>
            <div style={{
              position: 'absolute', left: 14, right: 14, top: 14, height: 42, borderRadius: 12,
              background: T.overlayPanel, border: `1px solid ${T.line200}`, boxShadow: T.l1,
              display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px',
            }}>
              <Icon name="search" size={17} color={T.text500}/>
              <span style={{ fontSize: 13, color: T.text400 }}>장소 검색 (TourAPI)</span>
            </div>
            <div style={{
              position: 'absolute', left: 14, bottom: 14,
              padding: '7px 11px', borderRadius: 999, background: T.overlayPanel,
              border: `1px solid ${T.line200}`, boxShadow: T.l1,
              fontSize: 11, fontWeight: 800, color: T.text700,
            }}>핀을 끌어 위치를 조정하세요</div>
          </div>

          <div style={{ padding: '18px 20px 20px', display: 'grid', gap: 16 }}>
            <div>
              <AddFieldLabel required>집합 장소</AddFieldLabel>
              <AddFieldBox icon="pin" value="청송 시외버스터미널" chevron={false}/>
            </div>

            <div>
              <AddFieldLabel>상세 안내</AddFieldLabel>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 8 }}>
                {['터미널 정문 앞', '2번 출구', '주차장 입구'].map((p) => (
                  <button
                    key={p}
                    data-testid={`meeting-detail-${p}`}
                    type="button"
                    onClick={() => setDetail(p)}
                    style={{
                      height: 30, padding: '0 11px', borderRadius: 999, cursor: 'pointer', fontFamily: T.fontStack,
                      fontSize: 12, fontWeight: 700,
                      border: `1px solid ${detail === p ? T.primary500 : T.line200}`,
                      background: detail === p ? T.primary50 : RF.card,
                      color: detail === p ? T.primary700 : T.text700,
                    }}>{p}</button>
                ))}
              </div>
              <AddFieldBox icon="note" value={detail} chevron={false}/>
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
          <Btn variant="ghost" onClick={nav.back}>이전</Btn>
          <div style={{ flex: 1 }}><Btn variant="primary" full onClick={nav.back}>이 위치로 지정</Btn></div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 17-4 · 코스 직접 만들기 (커스텀 코스 에디터) ─────────
function ScreenCustomCourse() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const [query, setQuery] = React.useState('');
  const [stops, setStops] = React.useState([
    { id: 1, time: '09:00', name: '청송 시외버스터미널', memo: '집합 장소' },
    { id: 2, time: '10:30', name: '주왕산 국립공원', memo: '대전사 ~ 제3폭포' },
    { id: 3, time: '14:00', name: '주산지', memo: '왕버들 산책로' },
  ]);
  const pool = [
    { time: '16:30', name: '청송 얼음골', memo: '여름 인기 코스' },
    { time: '17:20', name: '달기약수탕', memo: '백숙 거리' },
    { time: '18:00', name: '청송 객주문학관', memo: '실내 대체 코스' },
  ];

  const addStop = () => {
    if (stops.length >= 20) return;
    const normalized = query.trim();
    const next = normalized
      ? { time: '16:30', name: normalized, memo: 'TourAPI 검색 결과' }
      : pool[(stops.length - 3 + pool.length) % pool.length];
    setStops((current) => [...current, { id: Date.now(), ...next }]);
    setQuery('');
  };
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

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="코스 직접 만들기" left center onBack={nav.back}/>

        <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '0 20px 20px' }}>
          <div style={{ marginTop: 14, borderRadius: 12, overflow: 'hidden' }}>
            <MiniMap height={160} pins={stops.slice(0, 4).map((_, i) => i + 1)}/>
          </div>

          <form onSubmit={(event) => { event.preventDefault(); nav.go('place-search'); }} style={{ marginTop: 14, height: 42, borderRadius: 11, border: `1px solid ${T.line200}`, display: 'flex', alignItems: 'center', gap: 9, padding: '0 8px 0 13px' }}>
            <Icon name="search" size={17} color={T.text500}/>
            <input data-testid="tourapi-place-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="방문지 검색 (TourAPI · 경북 22개 시·군)" style={{ minWidth: 0, flex: 1, border: 0, outline: 0, background: 'transparent', color: T.text900, fontFamily: T.fontStack, fontSize: 13 }}/>
            <button type="submit" style={{ height: 30, border: 0, borderRadius: 8, background: T.primary50, color: T.primary700, fontFamily: T.fontStack, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>검색</button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 900 }}>Day 1</div>
            <div data-testid="custom-course-count" style={{ fontSize: 11, color: T.text500, fontVariantNumeric: 'tabular-nums' }}>{stops.length}개 방문지 · 최소 2개 · 최대 20개</div>
          </div>

          <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
            {stops.map((s, i) => (
              <div key={s.id} style={{
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
                }}>{i + 1}</div>
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
            ))}
          </div>

          <button
            type="button"
            data-testid="add-course-stop"
            onClick={addStop}
            disabled={stops.length >= 20}
            style={{
              width: '100%', height: 46, marginTop: 10, borderRadius: 12, cursor: 'pointer',
              border: `1px dashed ${T.line300}`, background: 'transparent', color: stops.length >= 20 ? T.text400 : T.primary600,
              fontFamily: T.fontStack, fontSize: 13, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
            <Icon name="plus" size={17} color={stops.length >= 20 ? T.text400 : T.primary600}/> {stops.length >= 20 ? '방문지는 최대 20개예요' : '방문지 추가'}
          </button>

          <button
            type="button"
            style={{
              width: '100%', height: 42, marginTop: 8, borderRadius: 12, cursor: 'pointer',
              border: `1px solid ${T.line200}`, background: RF.card, color: T.text700,
              fontFamily: T.fontStack, fontSize: 12, fontWeight: 800,
            }}>+ 다음 날 추가 (1박 이상일 때)</button>

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
  const [composing, setComposing] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [pinNew, setPinNew] = React.useState(true);
  const [pinned, setPinned] = React.useState([
    {
      title: '집합 장소 · 시간',
      body: '5/25(토) 07:50 청송 시외버스터미널 정문 앞\n08:00 정각에 출발해요. 늦으면 채팅방에 남겨주세요!',
      author: '숲속여행자 (호스트)',
      at: '5월 20일 오후 2:14',
      map: true,
    },
    {
      title: '준비물',
      body: '편한 운동화, 얇은 바람막이, 물 500ml 정도면 충분해요.',
      author: '숲속여행자 (호스트)',
      at: '5월 21일 오전 10:02',
    },
  ]);

  const [past, setPast] = React.useState([
    { title: '주차 안내', body: '터미널 공영주차장 이용하시면 돼요 (하루 3,000원)', author: '숲속여행자 (호스트)', at: '5월 18일 오후 7:30' },
    { title: '점심 메뉴 투표 결과', body: '달기약수탕 백숙으로 정해졌어요 🍲', author: '숲속여행자 (호스트)', at: '5월 17일 오후 9:12' },
  ]);
  const publishNotice = () => {
    if (!title.trim() || !body.trim()) return;
    const notice = {
      title: title.trim(), body: body.trim(), author: '숲속여행자 (호스트)', at: '방금 전',
    };
    if (pinNew) setPinned((current) => [notice, ...current].slice(0, 3));
    else setPast((current) => [notice, ...current]);
    setTitle('');
    setBody('');
    setComposing(false);
  };

  const Card = ({ n, dim = false }) => (
    <div style={{
      borderRadius: 14, padding: 14,
      background: dim ? T.bgSubtle : T.primary50,
      border: `1px solid ${dim ? RF.softLine : T.primary100}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="note" size={14} color={dim ? T.text500 : T.primary700}/>
        <div style={{ flex: 1, fontSize: 12, fontWeight: 900, color: dim ? T.text700 : T.primary700 }}>{n.title}</div>
        {dim
          ? <Chip variant="neutral">고정 해제됨</Chip>
          : <Chip variant="soft">📌 고정</Chip>}
      </div>
      <div style={{ fontSize: 13, lineHeight: '20px', color: T.text900, marginTop: 9, whiteSpace: 'pre-line' }}>{n.body}</div>
      {n.map && (
        <div style={{ marginTop: 10, borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
          <MiniMap height={92} withRoute={false}/>
          <div style={{
            position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -60%)',
            width: 30, height: 30, borderRadius: 999, background: T.primary500, border: `2.5px solid ${T.avatarRing}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.l2,
          }}>
            <Icon name="pin" size={16} color="#fff"/>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 11, color: T.text500 }}>
        <span>{n.author}</span>
        <span style={{ color: T.line300 }}>·</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{n.at}</span>
        <div style={{ flex: 1 }}/>
        <span style={{ color: T.primary600, fontWeight: 800, cursor: 'pointer' }}>{dim ? '다시 고정' : '수정'}</span>
      </div>
    </div>
  );

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        {/* 우측 상단 더보기(⋯)는 항목이 정의되지 않아 두지 않는다 (앱과 동일) */}
        <Header title="공지 이력" left center onBack={nav.back}/>

        <div style={{ padding: '0 20px 12px', borderBottom: `1px solid ${RF.softLine}` }}>
          <div style={{ fontSize: 13, fontWeight: 900 }}>주왕산 &amp; 주산지 힐링 트레킹</div>
          <div style={{ fontSize: 11, color: T.text500, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>공지 4개 · 고정 2 / 최대 3</div>
        </div>

        <div style={{ position: 'absolute', top: 126, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '16px 20px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: T.text500 }}>상단 고정 중</div>
          <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
            {pinned.map((n) => <Card key={n.title} n={n}/>)}
          </div>

          <div style={{ fontSize: 12, fontWeight: 900, color: T.text500, marginTop: 24 }}>지난 공지</div>
          <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
            {past.map((n) => <Card key={n.title} n={n} dim/>)}
          </div>

          <div style={{ fontSize: 11, color: T.text400, lineHeight: '17px', marginTop: 16 }}>
            공지는 호스트만 올릴 수 있고, 고정은 최대 3개까지예요. 고정을 해제해도 이력에는 그대로 남아요.
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}` }}>
          <Btn variant="primary" full icon="plus" onClick={() => setComposing(true)}>새 공지 작성 (호스트)</Btn>
        </div>
        {composing && (
          <div data-testid="notice-composer" style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(2,12,9,0.62)', display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ width: '100%', borderRadius: '18px 18px 0 0', background: RF.card, borderTop: `1px solid ${RF.softLine}`, padding: '18px 20px 30px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}><b style={{ flex: 1, fontSize: 16 }}>새 공지 작성</b><IconButton name="close" onClick={() => setComposing(false)}/></div>
              <label style={{ display: 'grid', gap: 6, marginTop: 16, fontSize: 12, fontWeight: 800 }}>제목<input data-testid="notice-title" value={title} maxLength={30} onChange={(event) => setTitle(event.target.value)} placeholder="공지 제목" style={{ height: 44, borderRadius: 10, border: `1px solid ${T.line200}`, background: RF.bg, color: T.text900, padding: '0 12px', fontFamily: T.fontStack }}/></label>
              <label style={{ display: 'grid', gap: 6, marginTop: 12, fontSize: 12, fontWeight: 800 }}>내용<textarea data-testid="notice-body" value={body} maxLength={300} onChange={(event) => setBody(event.target.value)} placeholder="멤버에게 알릴 내용을 적어주세요" style={{ minHeight: 100, resize: 'none', borderRadius: 10, border: `1px solid ${T.line200}`, background: RF.bg, color: T.text900, padding: 12, fontFamily: T.fontStack, lineHeight: 1.5 }}/></label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '12px 0 16px', fontSize: 12, color: T.text700 }}><input data-testid="notice-pin" type="checkbox" checked={pinNew} onChange={(event) => setPinNew(event.target.checked)}/>채팅방 상단에 고정하기 (최대 3개)</label>
              <Btn variant="primary" full disabled={!title.trim() || !body.trim()} onClick={publishNotice}>공지 올리기</Btn>
            </div>
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
              <div style={{ fontSize: 14, fontWeight: 900 }}>30대끼리 느긋하게 힐링 여행가요~</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 6 }}>
                <Icon name="map" size={14} color={T.text500}/><span style={{ flex: 1, fontSize: 12, color: T.text700, fontWeight: 800 }}>주왕산 &amp; 주산지 힐링 트레킹</span><CourseSourceBadge source={resolvedSource}/>
              </div>
            </div>
            <div style={{ padding: 14, display: 'grid', gap: 10 }}>
              {[
                ['calendar', '일정', '5/25(토) 당일치기 · 08:00 – 18:00'],
                ['pin', '집합', '07:50 청송 시외버스터미널 정문 앞'],
                ['map', '좌표', '36.435612, 129.057214'],
                ['users', '인원', '최소 3명 · 최대 5명 · 성별 제한 없음'],
                ['users', '조건', '25~35세 · 성별 무관'],
                ['money', '비용', '1인 예상 45,000원'],
                ['clock', '마감', '5/22(목) 23:59'],
              ].map((r) => (
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
          <div style={{ flex: 1 }}><Btn variant="primary" full onClick={() => nav.go('host-manage')}>모집 열기</Btn></div>
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
  const [stops, setStops] = React.useState([
    { id: 1, time: '09:00', name: '청송 시외버스터미널', memo: '집합 장소' },
    { id: 2, time: '10:30', name: '주왕산 국립공원', memo: '대전사 ~ 제3폭포' },
    { id: 3, time: '14:00', name: '주산지', memo: '왕버들 산책로' },
    { id: 4, time: '16:30', name: '달기약수탕', memo: '늦은 점심' },
  ]);
  const [saved, setSaved] = React.useState(false);
  const removeStop = (id) => setStops((s) => (s.length <= 2 ? s : s.filter((x) => x.id !== id)));
  const addStop = () => setStops((current) => current.length >= 20 ? current : [...current, { id: Date.now(), time: '17:30', name: '청송 객주문학관', memo: '비 올 때 대체 코스' }]);
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

  const banner = {
    custom: {
      icon: 'sparkle', bg: T.primary50, bd: T.primary100, fg: T.primary700,
      title: '마감 전까지 경로를 바꿀 수 있어요',
      body: '5/22(목) 마감 전이라 방문지·시간·순서를 자유롭게 고칠 수 있어요. 저장하면 채팅방에 변경 내역이 공지로 남아요.',
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
          right={editable ? <button type="button" onClick={saveAndNotify} style={{ border: 'none', background: 'transparent', color: T.primary600, fontSize: 14, fontWeight: 900, fontFamily: T.fontStack, cursor: 'pointer', padding: '0 4px' }}>저장</button> : <IconButton name="more"/>}
        />

        <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '0 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0 14px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>주왕산 &amp; 주산지 힐링 트레킹</div>
              <div style={{ fontSize: 11, color: T.text500, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>5/25(토) 당일치기 · 방문지 {stops.length}개 · 2/5명</div>
            </div>
            <CourseSourceBadge source={mode === 'linked' ? 'linked' : 'custom'}/>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 13, borderRadius: 12, background: banner.bg, border: `1px solid ${banner.bd}` }}>
            <Icon name={banner.icon} size={17} color={banner.fg}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: banner.fg }}>{banner.title}</div>
              <div style={{ fontSize: 12, lineHeight: '18px', color: banner.fg, opacity: 0.9, marginTop: 4 }}>{banner.body}</div>
            </div>
          </div>

          <div style={{ marginTop: 14, borderRadius: 12, overflow: 'hidden', opacity: editable ? 1 : 0.92 }}>
            <MiniMap height={150} pins={stops.slice(0, 4).map((_, i) => i + 1)}/>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 900 }}>Day 1</div>
            {!editable && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: T.text500 }}>
                <Icon name="lock" size={12} color={T.text500} strokeWidth={2}/> 수정 불가
              </div>
            )}
          </div>

          <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
            {stops.map((s, i) => (
              <div key={s.id} style={{
                borderRadius: 12, border: `1px solid ${RF.softLine}`,
                background: editable ? RF.card : T.bgSubtle,
                padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                {editable
                  ? <div style={{ width: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', color: T.text400 }}><Icon name="menu" size={16} color="currentColor"/><div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}><button type="button" aria-label={`${s.name} 위로 이동`} disabled={i === 0} onClick={() => moveStop(i, -1)}>위로</button><button type="button" aria-label={`${s.name} 아래로 이동`} disabled={i === stops.length - 1} onClick={() => moveStop(i, 1)}>아래로</button></div></div>
                  : <div style={{ width: 22, display: 'flex', justifyContent: 'center' }}><Icon name="lock" size={14} color={T.text300} strokeWidth={2}/></div>}
                <div style={{
                  width: 26, height: 26, borderRadius: 999,
                  background: editable ? T.primary500 : T.line300, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: editable ? T.primary700 : T.text500, fontVariantNumeric: 'tabular-nums' }}>{s.time}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: T.text500, marginTop: 3 }}>{s.memo}</div>
                </div>
                {editable && (
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

          {editable && (
            <button
              type="button"
              onClick={addStop}
              disabled={stops.length >= 20}
              style={{
                width: '100%', height: 46, marginTop: 10, borderRadius: 12, cursor: 'pointer',
                border: `1px dashed ${T.line300}`, background: 'transparent', color: T.primary600,
                fontFamily: T.fontStack, fontSize: 13, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
              <Icon name="plus" size={17} color={T.primary600}/> {stops.length >= 20 ? '방문지는 최대 20개예요' : '방문지 추가'}
            </button>
          )}

          <div style={{ marginTop: 18, fontSize: 13, fontWeight: 900 }}>집합 정보</div>
          <div style={{ marginTop: 10, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card, padding: 13, display: 'flex', gap: 11, alignItems: 'center' }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: T.primary50, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="pin" size={18} color={T.primary600}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>07:50 · 청송 시외버스터미널 정문 앞</div>
              <div style={{ fontSize: 11, color: T.text500, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>36.435612, 129.057214</div>
            </div>
            {mode !== 'locked'
              ? <span style={{ fontSize: 12, fontWeight: 800, color: T.primary600 }}>수정</span>
              : <Icon name="lock" size={15} color={T.text400} strokeWidth={2}/>}
          </div>
          {mode === 'linked' && (
            <div style={{ fontSize: 11, color: T.text500, marginTop: 8, lineHeight: '17px' }}>
              등록된 코스여도 집합 장소와 시간은 호스트가 정해요. 마감 전까지 언제든 바꿀 수 있어요.
            </div>
          )}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8 }}>
          {mode === 'custom' && (
            <>
              <Btn variant="ghost" onClick={nav.back}>취소</Btn>
              <div style={{ flex: 1 }}><Btn variant="primary" full onClick={saveAndNotify}>{saved ? '변경 내용을 알렸어요' : '저장하고 멤버에게 알리기'}</Btn></div>
            </>
          )}
          {mode === 'linked' && (
            <>
              <Btn variant="ghost" onClick={() => nav.go('create-review')}>코스 바꾸기</Btn>
              <div style={{ flex: 1 }}><Btn variant="primary" full onClick={() => nav.go('create-meet')}>집합 정보 수정</Btn></div>
            </>
          )}
          {mode === 'locked' && (
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
