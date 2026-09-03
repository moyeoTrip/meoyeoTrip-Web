// changeLog02 §1-4에서 "다음 순번"으로 남겨둔 화면들
//
// (1) 여행 확정 모먼트 · 여행 날 채팅방 위젯   — 04 §4.5·4.6
// (2) 알림 세부 설정 (방해금지 시간대)        — 06 §6.5
// (3) 계정 탈퇴 플로우                        — 06 §6.4
// (4) 시스템 화면 3종 (업데이트·점검·오류)     — 06 §6.9
// (5) 피드 댓글 전체 보기                      — 05 §5.2

// 확정된 여행 카드의 3행. 서버가 주지 않는 값(집합 안내·최소 인원)은 줄째로 빼거나 표기를 줄인다 —
// 문구를 지어내지 않는다.
function confirmedRows(room) {
  const dayTripTime = window.MoyeoApi.dayTripTimeText(room);
  const meeting = window.MoyeoApi.meetingText(room);
  return [
    ['calendar', `${window.MoyeoApi.formatDate(room.startDate)} ${window.MoyeoApi.tripTypeLabel(room)}${dayTripTime ? ` · ${dayTripTime}` : ''}`],
    meeting ? ['pin', meeting] : null,
    // '충족' 은 실제로 최소 인원을 넘겼을 때만 붙인다 — 미달인 방에 붙이면 화면이 사실과 다른 말을 한다.
    ['users', `${room.participantCount}명${room.minimumParticipants != null
      ? ` · 최소 ${room.minimumParticipants}명${room.participantCount >= room.minimumParticipants ? ' 충족' : ''}`
      : ''}`],
  ].filter(Boolean);
}

// 참여자 아바타 스택. 서버는 프로필 이미지만 주므로(캐릭터 종류가 없다) 4명까지 얼굴을 겹치고 나머지는 +N 이다.
function ParticipantStack({ participants = [], size = 30 }) {
  const shown = participants.slice(0, 4);
  const more = participants.length - shown.length;
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {shown.map((participant, index) => (
        <div key={participant.userId ?? index} style={{ marginLeft: index ? -8 : 0, border: '2px solid #fff', borderRadius: 999, overflow: 'hidden', display: 'flex' }}>
          <ProfileAvatar src={participant.profileImageUrl} size={size}/>
        </div>
      ))}
      {more > 0 && (
        <div style={{
          marginLeft: -8, width: size, height: size, borderRadius: 999, border: '2px solid #fff',
          background: T.line100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: T.text500, fontSize: 11, fontWeight: 800,
        }}>+{more}</div>
      )}
    </div>
  );
}

// ───────── 34 · 여행 확정 모먼트 ─────────
// 마감일에 인원이 충족된 순간. 서비스에서 confetti를 쓰는 유일한 자리.
function ScreenTripConfirmed() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  // 로그인 상태에서는 GET chat-rooms/{id} 로 확정된 방의 값을 그대로 보여준다.
  // 확정 모먼트 화면이라 status 가 CONFIRMED 인 방에서만 대체한다 — 모집 중인 방의 값으로
  // "여행이 확정됐어요!" 를 그리면 화면이 거짓말을 한다. 캡처 모드는 live() 가 false 라 목데이터가 남는다.
  const liveMode = window.MoyeoApi?.live();
  const roomId = liveMode ? window.MoyeoApi.selectedRoomId() : null;
  const [room, setRoom] = React.useState(null);
  React.useEffect(() => {
    if (!liveMode || !roomId) return undefined;
    let active = true;
    window.MoyeoApi.roomDetail(roomId)
      .then((result) => { if (active && result?.status === 'CONFIRMED') setRoom(result); })
      .catch(() => { /* 실패 시 목데이터 유지 */ });
    return () => { active = false; };
  }, [liveMode, roomId]);
  const [themeMode, setThemeMode] = React.useState(
    () => document.documentElement.dataset.moyeoTheme === 'dark' ? 'dark' : 'light'
  );
  React.useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => setThemeMode(root.dataset.moyeoTheme === 'dark' ? 'dark' : 'light');
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['data-moyeo-theme'] });
    return () => observer.disconnect();
  }, []);
  // 조각 배치는 4플랫폼 공통 규칙이다 (docs/alignment/MOCKDATA-CANON.md 의 confetti 항목).
  // 무리수의 소수부를 쓰면 값이 고르게 퍼지면서도 규칙이 눈에 띄지 않는다 —
  // 격자처럼 줄 서지 않고, 네 플랫폼이 같은 그림을 그린다(스크린샷 재현성).
  const frac = (value) => value - Math.floor(value);
  const confetti = Array.from({ length: 30 }, (_, i) => ({
    left: 2 + frac(i * 0.6180339887) * 96,
    // 상단이 아니라 **화면 전체 높이**에 흩뿌린다. 위에서 떨어져 이 자리에 내려앉는다.
    top: 4 + frac(0.5 + i * 0.3819660113) * 88,
    size: 5 + (i % 4) * 2,
    color: [T.primary500, T.accent500, T.primary300, T.warning][i % 4],
    rot: frac(i * 0.7548776662) * 360,
    drift: -42 + frac(i * 0.7548776662) * 84,
    // 떨어지는 거리·시간·시작 시점을 조각마다 달리해 한 덩어리로 움직이지 않게 한다.
    rise: 180 + frac(i * 0.9142135624) * 260,
    duration: 1.5 + frac(i * 0.4142135624) * 1.2,
    delay: frac(i * 0.2360679775) * 520,
  }));
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative', overflow: 'hidden' }}>
        <Header title={room ? (room.courseTitle || room.title) : ''} left center onBack={nav.back}/>

        {/* confetti — prefers-reduced-motion에서는 페이드만 (디자인 시스템 §7-3) */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {confetti.map((c, i) => (
            <div key={i} className="moyeo-confetti-piece" style={{
              position: 'absolute', left: `${c.left}%`, top: `${c.top}%`,
              width: c.size, height: c.size * 0.5, borderRadius: 2,
              background: c.color,
              '--confetti-drift': `${c.drift}px`,
              '--confetti-spin': `${c.rot + 220}deg`,
              '--confetti-rise': `${c.rise}px`,
              '--confetti-duration': `${c.duration}s`,
              '--confetti-delay': `${c.delay}ms`,
            }}/>
          ))}
        </div>

        <div style={{ position: 'absolute', top: 92, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '0 20px', textAlign: 'center' }}>
          <div style={{ margin: '18px auto 0', width: 252, height: 142, position: 'relative', overflow: 'hidden', borderRadius: 18 }}>
            <img
              className="moyeo-trip-confirmed-hero"
              src={`assets/celebration/trip-confirmed-${themeMode}.webp`}
              alt="여행 확정을 함께 축하하는 모여트립 곰, 토끼, 너구리 캐릭터"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, lineHeight: '31px', marginTop: 18 }}>여행이 확정됐어요!</div>
          <div style={{ fontSize: 13, color: T.text500, marginTop: 8, lineHeight: '20px' }}>
            {/* 인원·마감일은 서버 모임에서만 온다 — 예시 숫자를 대신 적지 않는다 */}
            {room
              ? <>{room.recruitmentDeadlineDate ? `${window.MoyeoApi.formatDate(room.recruitmentDeadlineDate)} 마감까지 ` : ''}<b style={{ color: T.primary600 }}>{room.participantCount}명</b>이 모였어요.<br/>이제 함께 떠나기만 하면 돼요.</>
              : '이제 함께 떠나기만 하면 돼요.'}
          </div>

          <div style={{
            marginTop: 20,
            borderRadius: 16,
            border: `1px solid color-mix(in srgb, ${T.primary500} 32%, ${RF.softLine})`,
            background: `color-mix(in srgb, ${T.primary500} 12%, ${RF.card})`,
            padding: 16,
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: T.primary500 }}/>
              <div style={{ fontSize: 12, fontWeight: 900, color: T.primary500 }}>확정된 여행</div>
            </div>
            {(room ? confirmedRows(room) : []).map((r) => (
              <div key={r[1]} style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 8, fontSize: 12.5, color: T.text900, fontWeight: 700 }}>
                <Icon name={r[0]} size={15} color={T.primary600}/>{r[1]}
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
              {room
                ? <ParticipantStack participants={room.participants} size={30}/>
                : <MemberStack size={30} members={['bear','deer','rabbit','turtle']} more={1}/>}
            </div>
          </div>

          <div style={{ marginTop: 14, padding: 13, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card, display: 'flex', alignItems: 'center', gap: 11, textAlign: 'left' }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: T.bgSubtle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="camera" size={18} color={T.text700}/>
            </div>
            <div style={{ flex: 1, fontSize: 12, color: T.text700, lineHeight: '17px' }}>
              확정 카드를 이미지로 저장해 공유할 수 있어요
            </div>
            <Icon name="share" size={17} color={T.text500}/>
          </div>

          <div style={{ fontSize: 11, color: T.text400, marginTop: 14, lineHeight: '17px' }}>
            확정 이후에는 경로가 잠겨요. 변경이 필요하면 채팅방 공지로 알려주세요.
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}` }}>
          <Btn variant="primary" full onClick={() => nav.go('trip-day')}>채팅방으로 가기</Btn>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 35 · 여행 날 채팅방 (진행 위젯) ─────────
function ScreenTripDay() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  // 참여 중인 방이면 GET {id}/roadmap/current 로 진행 위젯(방문지 스텝·현재/다음 일정)을 받는다.
  // active 가 false 거나 places 가 비면 서버가 진행 상황을 주지 않는 것이므로 빈 상태를 그린다.
  const liveMode = window.MoyeoApi?.live();
  const roomId = liveMode ? window.MoyeoApi.selectedRoomId() : null;
  const [roadmap, setRoadmap] = React.useState(null);
  const [roadmapRoom, setRoadmapRoom] = React.useState(null);
  React.useEffect(() => {
    if (!liveMode || !roomId) return undefined;
    let active = true;
    window.MoyeoApi.roomRoadmap(roomId)
      .then((result) => { if (active && result?.active && (result.places || []).length) setRoadmap(result); })
      .catch(() => { /* 403(미참여) 이면 빈 상태로 남는다 */ });
    window.MoyeoApi.roomDetail(roomId)
      .then((result) => { if (active && result?.roomId != null) setRoadmapRoom(result); })
      .catch(() => {});
    return () => { active = false; };
  }, [liveMode, roomId]);
  // 진행 상황은 서버 로드맵에서만 온다 — 예시 방문지·대화를 대신 그리지 않는다.
  const stops = roadmap ? roadmap.places.map((place) => place.title) : [];
  // 서버는 방문지별 progress(COMPLETED/CURRENT/UPCOMING)를 준다 — 완료 개수가 곧 진행 단계다.
  const current = roadmap
    ? Math.max(1, roadmap.places.filter((place) => place.progress === 'COMPLETED').length + (roadmap.places.some((place) => place.progress === 'CURRENT') ? 1 : 0))
    : 0;

  if (!roadmap) {
    return (
      <Phone>
        <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
          <Header title="" left center onBack={nav.back}/>
          <div role="status" style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13, lineHeight: '21px' }}>
            {liveMode ? '참여 중인 모임이 없어요.' : '로그인하면 모집 중인 모임을 볼 수 있어요.'}
          </div>
        </div>
      </Phone>
    );
  }

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header
          title={roadmapRoom?.title || ''}
          left center onBack={nav.back}
          right={<><IconButton name="search"/><IconButton name="menu" onClick={() => nav.go('chat-menu')}/></>}
        />
        <div style={{ textAlign: 'center', fontSize: 12, color: T.text500, paddingBottom: 10, borderBottom: `1px solid ${RF.softLine}`, fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ color: T.primary600, fontWeight: 900 }}>여행 중</span>
          {roadmapRoom?.participantCount != null ? ` · ${roadmapRoom.participantCount}명` : ''}
          {roadmap.dayNumber != null ? ` · ${roadmap.dayNumber}/${roadmap.totalDays}일차` : ''}
        </div>

        {/* 여행 진행 위젯 — 여행 시작일 당일에만 상단 고정 */}
        <div style={{ padding: '12px 16px', background: T.primary50, borderBottom: `1px solid ${T.primary100}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="pin" size={15} color={T.primary700}/>
            <div style={{ flex: 1, fontSize: 12.5, fontWeight: 900, color: T.primary700 }}>
              현재 방문지 {current}/{stops.length} · {stops[current - 1] || ''}
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: T.primary600 }}>코스 전체 →</span>
          </div>
          {/* 방문지 진행 스텝 */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
            {stops.map((s, i) => (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 999,
                    background: i < current ? T.primary500 : 'transparent',
                    border: `1.5px solid ${i < current ? T.primary500 : T.primary200}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {i < current
                      ? <Icon name="check" size={11} color="#fff" strokeWidth={3}/>
                      : <span style={{ fontSize: 9, fontWeight: 900, color: T.primary600 }}>{i + 1}</span>}
                  </div>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: i < current ? T.primary700 : T.text500, whiteSpace: 'nowrap' }}>{s}</span>
                </div>
                {i < stops.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < current - 1 ? T.primary500 : T.primary200, margin: '0 4px', marginBottom: 14 }}/>
                )}
              </React.Fragment>
            ))}
          </div>
          {roadmap.nextPlace && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 11.5, color: T.primary700 }}>
              <Icon name="clock" size={13} color={T.primary600}/>
              다음 일정 · <b>{window.MoyeoApi.formatClock(roadmap.nextPlace.scheduledAt)} {roadmap.nextPlace.title}</b>
            </div>
          )}
        </div>

        {/* 여행 날 대화는 채팅방(20)이 그린다 — 예시 대화·장소 카드는 두지 않는다. */}
        <div style={{ height: 'calc(100% - 274px)', overflow: 'auto', padding: '16px 18px 86px', background: T.chatCanvas }}>
          <div style={{ width: 'fit-content', margin: '0 auto', background: T.systemMsg, color: T.primary700, borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 800 }}>
            오늘 여행이 시작됐어요 🎒
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 36 · 알림 세부 설정 (방해금지) ─────────
function ScreenNotifDetail() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const [mode, setMode] = React.useState('all');
  const [dnd, setDnd] = React.useState(true);
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const [onDays, setOnDays] = React.useState(['월', '화', '수', '목', '금']);
  const [dndTimes, setDndTimes] = React.useState({ start: '22:30', end: '07:00' });
  // 로그인 상태: GET users/me/profile(채팅 알림 방식) + notifications/settings(방해금지)로 채우고,
  // 변경 즉시 PUT notifications/settings 로 저장한다.
  const liveMode = window.MoyeoApi?.live();
  const serverStateRef = React.useRef(null);
  const DAY_MAP = { 월: 'MONDAY', 화: 'TUESDAY', 수: 'WEDNESDAY', 목: 'THURSDAY', 금: 'FRIDAY', 토: 'SATURDAY', 일: 'SUNDAY' };
  const DAY_MAP_REVERSE = Object.fromEntries(Object.entries(DAY_MAP).map(([ko, en]) => [en, ko]));
  const MODE_MAP = { ALL: 'all', MENTIONS_AND_REPLIES: 'mention', NONE: 'off' };
  const MODE_MAP_REVERSE = { all: 'ALL', mention: 'MENTIONS_AND_REPLIES', off: 'NONE' };
  React.useEffect(() => {
    if (!liveMode) return undefined;
    let active = true;
    Promise.all([window.MoyeoApi.myProfile(), window.MoyeoApi.notificationSettings()])
      .then(([profile, settings]) => {
        if (!active || !profile?.chatNotificationMode) return;
        serverStateRef.current = { profile, settings };
        setMode(MODE_MAP[profile.chatNotificationMode] || 'all');
        setDnd(Boolean(settings?.doNotDisturbEnabled));
        setOnDays((settings?.doNotDisturbDays || []).map((day) => DAY_MAP_REVERSE[day]).filter(Boolean));
        if (settings?.doNotDisturbStartTime) setDndTimes({ start: settings.doNotDisturbStartTime, end: settings.doNotDisturbEndTime || '' });
      })
      .catch(() => { /* 실패 시 목데이터 유지 */ });
    return () => { active = false; };
  }, [liveMode]);
  const saveServer = async (next) => {
    const server = serverStateRef.current;
    if (!server) return;
    const merged = {
      mode: next.mode ?? mode,
      dnd: next.dnd ?? dnd,
      onDays: next.onDays ?? onDays,
    };
    try {
      await window.MoyeoApi.updateNotificationSettings({
        chatNotificationMode: MODE_MAP_REVERSE[merged.mode] || 'ALL',
        recruitmentDeadlineEnabled: server.profile.recruitmentDeadlineEnabled,
        socialActivityEnabled: server.profile.socialActivityEnabled,
        marketingEnabled: server.profile.marketingEnabled,
        doNotDisturbEnabled: merged.dnd,
        doNotDisturbStartTime: merged.dnd ? (dndTimes.start || null) : null,
        doNotDisturbEndTime: merged.dnd ? (dndTimes.end || null) : null,
        doNotDisturbDays: merged.onDays.map((day) => DAY_MAP[day]).filter(Boolean),
      });
    } catch (_) { /* 저장 실패는 조용히 무시 — 다음 진입 시 서버 값으로 되돌아온다 */ }
  };
  const chooseMode = (nextMode) => { setMode(nextMode); if (liveMode) saveServer({ mode: nextMode }); };
  const toggleDnd = () => { const next = !dnd; setDnd(next); if (liveMode) saveServer({ dnd: next }); };
  const toggleDay = (day, on) => {
    const next = on ? onDays.filter((x) => x !== day) : [...onDays, day];
    setOnDays(next);
    if (liveMode) saveServer({ onDays: next });
  };

  const Toggle = ({ on, onClick }) => (
    <button type="button" onClick={onClick} style={{
      width: 44, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0,
      background: on ? T.primary500 : T.line200, display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start', alignItems: 'center',
    }}>
      <span style={{ width: 22, height: 22, borderRadius: 999, background: '#fff', boxShadow: T.l1 }}/>
    </button>
  );

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="채팅 알림" left center onBack={nav.back}/>

        <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 0, overflow: 'auto', paddingBottom: 28 }}>
          <div style={{ padding: '4px 20px 14px', fontSize: 12, color: T.text500, lineHeight: '18px' }}>
            모임이 여러 개면 알림이 금방 쌓여요. 받고 싶은 만큼만 켜두세요.
          </div>

          <div style={{ padding: '0 20px', display: 'grid', gap: 8 }}>
            {[
              { id: 'all', title: '모든 메시지', desc: '모임의 모든 대화를 알려드려요' },
              { id: 'mention', title: '멘션·답글만', desc: '나를 부르거나 내 메시지에 답할 때만' },
              { id: 'off', title: '받지 않기', desc: '앱을 열었을 때만 확인해요' },
            ].map((o) => {
              const on = mode === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => chooseMode(o.id)}
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
                    <div style={{ fontSize: 11.5, color: T.text500, marginTop: 3 }}>{o.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ height: 8, background: T.bgSubtle, margin: '18px 0 0' }}/>

          {/* 방해금지 시간대 */}
          <div style={{ padding: '16px 20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 900 }}>방해금지 시간대</div>
                <div style={{ fontSize: 11.5, color: T.text500, marginTop: 3 }}>이 시간엔 소리·진동 없이 조용히 쌓여요</div>
              </div>
              <Toggle on={dnd} onClick={toggleDnd}/>
            </div>

            {dnd && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                  <div>
                    <AddFieldLabel>시작</AddFieldLabel>
                    <AddFieldBox icon="clock" value={dndTimes.start} chevron={false}/>
                  </div>
                  <div>
                    <AddFieldLabel>종료</AddFieldLabel>
                    <AddFieldBox icon="clock" value={dndTimes.end} chevron={false}/>
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <AddFieldLabel>요일</AddFieldLabel>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {days.map((d) => {
                      const on = onDays.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleDay(d, on)}
                          style={{
                            flex: 1, height: 38, borderRadius: 10, cursor: 'pointer', fontFamily: T.fontStack,
                            fontSize: 12.5, fontWeight: 800,
                            border: `1px solid ${on ? T.primary500 : T.line200}`,
                            background: on ? T.primary50 : RF.card,
                            color: on ? T.primary700 : T.text500,
                          }}>{d}</button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ marginTop: 12, fontSize: 11, color: T.text500, lineHeight: '17px' }}>
                  집합 30분 전 알림처럼 <b>여행 당일 안내는 방해금지 시간에도</b> 전달돼요.
                </div>
              </>
            )}
          </div>

          {/* 모임별 알림은 여기서 다루지 않는다 — 각 채팅방 설정에서 그 방의 알림을 켜고 끈다 */}
        </div>
      </div>
    </Phone>
  );
}

// ───────── 37 · 계정 탈퇴 ─────────
function ScreenAccountDelete() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const [reason, setReason] = React.useState('');
  const [deleteAcknowledged, setDeleteAcknowledged] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);
  const [withdrawing, setWithdrawing] = React.useState(false);
  // 로그인 상태에서는 DELETE /api/v1/users/me 실호출로 연결한다 (검증 시 실행 금지 — QA 계정 보호).
  const liveMode = window.MoyeoApi?.live();
  // 참여 중인 여행은 마이·모임 탭과 같은 보관소('my.rooms')를 읽는다 —
  // 탈퇴 화면에 들어왔다고 같은 목록을 다시 부르지 않는다 (TAB-STATE-CANON R3).
  const roomsData = window.useTabData('my.rooms', () => window.MoyeoApi.myRooms(), {
    enabled: liveMode, mode: 'keep', accept: Array.isArray,
  });
  // 종료된 방은 정리할 것이 없다. D-day 는 서버가 준 값만 붙인다(없으면 제목만).
  const joinedTrips = React.useMemo(() => (roomsData.value || [])
    .filter((room) => !room.ended)
    .map((room) => ({
      roomId: room.roomId,
      label: room.recruitmentDDay != null && room.recruitmentDDay >= 0
        ? `${room.title} · D-${room.recruitmentDDay}`
        : room.title,
    })), [roomsData.value]);
  const confirmWithdraw = async () => {
    if (!liveMode) { nav.go('login'); return; }
    if (withdrawing) return;
    setWithdrawing(true);
    try {
      await window.MoyeoAuth.withdraw();
      nav.go('login', { replace: true });
    } catch (_) {
      setWithdrawing(false);
    }
  };
  const reasons = [
    '여행을 자주 가지 않게 됐어요',
    '마음에 드는 모집이 없어요',
    '불쾌한 경험이 있었어요',
    '알림이 너무 많아요',
    '기타',
  ];

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="계정 탈퇴" left center onBack={nav.back}/>

        <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '10px 20px 20px' }}>
          {/* 참여 중인 여행 경고 — 근거는 GET chat-rooms/my 다(안드로이드 AccountDeleteScreen 과 같은 조회).
              어떤 여행을 먼저 정리해야 하는지 이 화면에서 알아야 한다. 목록이 비면 카드도 사라진다. */}
          {joinedTrips.length > 0 && (
            <div data-testid="account-delete-joined-trips" style={{ padding: 14, borderRadius: 14, background: T.warningBg, display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="users" size={16} color={T.warningText}/>
                <span style={{ fontSize: 13, fontWeight: 900, color: T.warningText }}>참여 중인 여행이 {joinedTrips.length}개 있어요</span>
              </div>
              <div style={{ fontSize: 11.5, lineHeight: '17px', color: T.warningText }}>탈퇴하면 동행자들에게 갑자기 빈자리가 생겨요. 나가기 처리를 먼저 해주세요.</div>
              {joinedTrips.map((trip) => (
                <button
                  key={trip.roomId}
                  type="button"
                  onClick={() => { window.MoyeoApi.selectRoom(trip.roomId); nav.go('detail'); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: 11, borderRadius: 10,
                    border: 0, background: RF.card, color: T.text900, fontFamily: T.fontStack, textAlign: 'left', cursor: 'pointer',
                  }}>
                  <Icon name="calendar" size={13} color={T.warningText}/>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trip.label}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 900, color: T.warningText, flexShrink: 0 }}>관리 →</span>
                </button>
              ))}
            </div>
          )}

          <div style={{ fontSize: 13, fontWeight: 900, marginTop: 22 }}>떠나는 이유를 알려주세요</div>
          <div style={{ fontSize: 11.5, color: T.text500, marginTop: 5 }}>서비스를 고치는 데만 쓰여요. (필수)</div>
          <div style={{ marginTop: 12, display: 'grid', gap: 6 }}>
            {reasons.map((r) => {
              const on = reason === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  style={{
                    height: 46, borderRadius: 11, cursor: 'pointer', fontFamily: T.fontStack, textAlign: 'left',
                    border: `1px solid ${on ? T.primary500 : RF.softLine}`,
                    background: on ? T.primary50 : RF.card,
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
                  <span style={{ fontSize: 13, fontWeight: on ? 800 : 600, color: on ? T.primary700 : T.text900 }}>{r}</span>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 18, padding: 14, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: T.bgSubtle }}>
            <div style={{ fontSize: 12.5, fontWeight: 900, marginBottom: 8 }}>탈퇴하면 이렇게 돼요</div>
            {[
              '피드·도감·친구·여행 기록이 모두 삭제돼요',
              '내가 공개한 여행자 코스는 남지만 닉네임은 지워져요',
              '30일 안에 다시 로그인하면 계정을 되살릴 수 있어요',
              '30일이 지나면 완전히 삭제되고 되돌릴 수 없어요',
            ].map((t) => (
              <div key={t} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 7, fontSize: 11.5, color: T.text700, lineHeight: '17px' }}>
                <span style={{ width: 4, height: 4, borderRadius: 999, background: T.text400, marginTop: 6, flexShrink: 0 }}/>
                {t}
              </div>
            ))}
          </div>

          <button
            type="button"
            role="checkbox"
            aria-checked={deleteAcknowledged}
            onClick={() => setDeleteAcknowledged((value) => !value)}
            style={{
              width: '100%', marginTop: 12, padding: '12px 13px', borderRadius: 12,
              border: `1px solid ${deleteAcknowledged ? T.dangerText : RF.softLine}`,
              background: deleteAcknowledged ? T.dangerBg : RF.card,
              display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left',
              color: T.text900, fontFamily: T.fontStack, cursor: 'pointer',
            }}>
            <span style={{
              width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
              border: `1.5px solid ${deleteAcknowledged ? T.dangerText : T.line300}`,
              background: deleteAcknowledged ? T.dangerText : 'transparent',
              display: 'grid', placeItems: 'center',
            }}>
              {deleteAcknowledged && <Icon name="check" size={13} color="#fff" strokeWidth={3}/>}
            </span>
            <span style={{ fontSize: 12, lineHeight: '18px', fontWeight: 700 }}>
              삭제 범위와 30일 대기 정책을 확인했어요
            </span>
          </button>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8 }}>
          <Btn variant="ghost" onClick={nav.back}>돌아가기</Btn>
          <div style={{ flex: 1 }}>
            <Btn variant="danger" full disabled={!reason || !deleteAcknowledged} onClick={() => setConfirm(true)}>탈퇴하기</Btn>
          </div>
        </div>

        {confirm && (
          <div style={{ position: 'absolute', inset: 0, background: T.bgOverlay, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ width: '100%', maxWidth: 320, background: RF.card, borderRadius: 20, padding: 22, boxShadow: T.l3 }}>
              <div style={{ width: 44, height: 44, borderRadius: 999, background: T.dangerBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon name="close" size={21} color={T.dangerText} strokeWidth={2.4}/>
              </div>
              <div style={{ fontSize: 17, fontWeight: 900, lineHeight: '24px' }}>정말 탈퇴할까요?</div>
              <div style={{ fontSize: 12.5, color: T.text500, marginTop: 10, lineHeight: '19px' }}>
                {liveMode
                  ? <>도감 친구와 여행 기록이 모두 사라져요. 30일이 지나면 되돌릴 수 없어요.</>
                  : <>도감에 모은 친구 <b>12마리</b>와 여행 기록 <b>8개</b>가 사라져요. 30일이 지나면 되돌릴 수 없어요.</>}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                <Btn variant="ghost" onClick={() => setConfirm(false)}>취소</Btn>
                <div style={{ flex: 1 }}><Btn variant="danger" full disabled={withdrawing} onClick={confirmWithdraw}>{withdrawing ? '탈퇴 처리 중...' : '탈퇴할게요'}</Btn></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Phone>
  );
}

// ───────── 38 · 시스템 화면 (점검 · 오류) ─────────
// mode: 'maintenance' | 'error'
// 강제 업데이트 화면은 도입하지 않기로 했다 (2026-08-17 결정) — 스토어 업데이트를 막지 않는다.
function ScreenSystemNotice({ mode = 'maintenance' }) {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const spec = {
    maintenance: {
      icon: 'settings', tone: T.warningText, bg: T.warningBg,
      title: '잠시 점검 중이에요',
      body: '더 안정적인 서비스를 위해 정비하고 있어요.',
      list: ['예상 종료 · 오늘 오전 4:00', '점검 중에는 모집·채팅이 열리지 않아요'],
      primary: '지금 확인',
      secondary: null,
      caption: '10분마다 자동으로 다시 확인해요',
    },
    error: {
      icon: 'refresh', tone: T.dangerText, bg: T.dangerBg,
      title: '무언가 살짝\n잘못됐어요',
      body: '잠시 후 다시 시도해주세요. 계속 이러면 문의해주세요.',
      list: [],
      primary: '새로고침',
      secondary: '돌아가기',
      caption: 'ERR-500 · 2026-08-17 14:22',
    },
  }[mode];

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', textAlign: 'center' }}>
          <div style={{ width: 92, height: 92, borderRadius: 999, background: spec.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={spec.icon} size={40} color={spec.tone}/>
          </div>
          <div style={{ fontSize: 21, fontWeight: 900, lineHeight: '30px', marginTop: 22, whiteSpace: 'pre-line' }}>{spec.title}</div>
          <div style={{ fontSize: 13, color: T.text500, marginTop: 10, lineHeight: '20px' }}>{spec.body}</div>

          {spec.list.length > 0 && (
            <div style={{ width: '100%', marginTop: 20, padding: 14, borderRadius: 12, background: T.bgSubtle, border: `1px solid ${RF.softLine}`, textAlign: 'left' }}>
              {spec.list.map((t) => (
                <div key={t} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 6, fontSize: 12, color: T.text700, lineHeight: '18px' }}>
                  <span style={{ width: 4, height: 4, borderRadius: 999, background: T.text400, marginTop: 7, flexShrink: 0 }}/>
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '0 20px 34px' }}>
          <Btn variant="primary" full onClick={() => nav.go('home')}>{spec.primary}</Btn>
          {spec.secondary && (
            <div style={{ marginTop: 8 }}><Btn variant="ghost" full onClick={nav.back}>{spec.secondary}</Btn></div>
          )}
          <div style={{ textAlign: 'center', fontSize: 11, color: T.text400, marginTop: 12, fontVariantNumeric: 'tabular-nums' }}>{spec.caption}</div>
        </div>
      </div>
    </Phone>
  );
}

function ScreenSystemMaintenance() { return <ScreenSystemNotice mode="maintenance"/>; }
function ScreenSystemError() { return <ScreenSystemNotice mode="error"/>; }

// ───────── 39 · 피드 댓글 전체 보기 ─────────
// 23 피드 상세와 23-1 이 같은 댓글 한 줄을 쓴다 — 두 화면이 각자 그리면 아바타·시각 표기가 갈린다.
// 프로필 이미지는 ProfileAvatar 를 쓴다(없으면 닉네임 아바타로 떨어진다 · 다른 화면과 같다).
function FeedCommentRow({ item, reply = false }) {
  const size = reply ? 26 : 34;
  return (
    <div style={{ display: 'flex', gap: 10, padding: reply ? '10px 0 10px 38px' : '12px 0' }}>
      <ProfileAvatar src={item.author?.profileImageUrl} nickname={item.author?.nickname} size={size}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12.5, fontWeight: 800 }}>{item.author?.nickname}</span>
          <span style={{ fontSize: 10.5, color: T.text400 }}>{window.MoyeoApi.formatRelative(item.createdAt)}</span>
        </div>
        <div style={{ fontSize: 13, lineHeight: '20px', marginTop: 5 }}>{item.content}</div>
      </div>
    </div>
  );
}

// 23-1 이 한 번에 받는 최상위 댓글 수. 서버 기본값(20)과 같은 값을 명시해 둔다 —
// 서버는 1~50 으로 보정하므로 이 값을 바꿔도 응답 모양은 같다.
const FEED_COMMENTS_PAGE_SIZE = 20;

// ───────── 23-1 · 댓글 전체 보기 (커서 페이지네이션) ─────────
//
// GET /feeds/{id}/comments 는 2026-09-02 부터 `{comments, nextId}` 를 준다(예전엔 배열이었다).
// 커서는 GET /feeds 와 같은 방식이다 — 마지막 묶음의 `nextId` 를 다음 요청의
// `beforeCommentId` 로 넘기고, `nextId` 가 null 이면 마지막 페이지다.
// 최상위 댓글은 최신 ID 부터 오고 `replies` 는 각 최상위 댓글 안에 들어 있다
// (대댓글은 페이지네이션 대상이 아니라 더 받을 것이 없다).
function ScreenFeedComments() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  // 기획 23-1과 같이 입력이 비어 있으면 전송은 비활성이다.
  const [comment, setComment] = React.useState('');
  // 로그인 상태 + 선택된 피드가 있으면 GET feeds/{id}/comments 로 대체하고, 작성은 POST 실연동한다.
  const liveMode = window.MoyeoApi?.live();
  const feedId = liveMode ? window.MoyeoApi.selectedFeedId() : null;
  const [serverComments, setServerComments] = React.useState(null);
  // 다음 묶음의 커서. null 이면 마지막 페이지다. undefined 는 "아직 첫 묶음도 안 받았다".
  const [nextId, setNextId] = React.useState(undefined);
  const [loadingMore, setLoadingMore] = React.useState(false);
  // 헤더의 총 댓글 수는 피드 상세의 commentCount 를 쓴다 — 받아 온 묶음의 길이를 쓰면
  // 무한 스크롤 중에 "댓글 20" 처럼 총 개수를 틀리게 말한다(23 의 `댓글 N개` 와도 갈린다).
  const [commentCount, setCommentCount] = React.useState(null);
  const scrollRef = React.useRef(null);

  // 첫 묶음. beforeCommentId 없이 부른다.
  const loadFirstPage = React.useCallback(() => {
    if (!liveMode || !feedId) return;
    window.MoyeoApi.feedComments(feedId, { limit: FEED_COMMENTS_PAGE_SIZE })
      .then((result) => {
        if (!Array.isArray(result?.comments)) return;
        setServerComments(result.comments);
        setNextId(result.nextId ?? null);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
      })
      .catch(() => { /* 실패 시 이미 그린 목록을 유지한다 */ });
  }, [liveMode, feedId]);
  React.useEffect(() => { loadFirstPage(); }, [loadFirstPage]);
  React.useEffect(() => {
    if (!liveMode || !feedId) return;
    window.MoyeoApi.feedDetail(feedId)
      .then((feed) => { if (typeof feed?.commentCount === 'number') setCommentCount(feed.commentCount); })
      .catch(() => { /* 총 개수를 못 받으면 헤더에 숫자를 지어내지 않는다 */ });
  }, [liveMode, feedId]);

  // 다음 묶음. 스크롤이 끝에 닿을 때만 부른다 — 한 번에 전부 받지 않는다.
  const loadMore = React.useCallback(() => {
    if (!feedId || loadingMore || !nextId) return;
    setLoadingMore(true);
    window.MoyeoApi.feedComments(feedId, { beforeCommentId: nextId, limit: FEED_COMMENTS_PAGE_SIZE })
      .then((result) => {
        if (!Array.isArray(result?.comments)) return;
        // 같은 커서로 두 번 받아도 목록이 겹치지 않게 ID 로 걸러 붙인다.
        setServerComments((current) => {
          const seen = new Set((current || []).map((item) => item.commentId));
          return [...(current || []), ...result.comments.filter((item) => !seen.has(item.commentId))];
        });
        setNextId(result.nextId ?? null);
      })
      .catch(() => { /* 실패하면 커서를 그대로 두고 다음 스크롤에서 다시 시도한다 */ })
      .then(() => setLoadingMore(false));
  }, [feedId, loadingMore, nextId]);

  const onListScroll = (event) => {
    const list = event.currentTarget;
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 120) loadMore();
  };
  // 받은 묶음이 화면을 다 채우지 못하면 스크롤이 생기지 않아 다음 묶음을 부를 계기가 없다 —
  // 그러면 `불러오는 중이에요…` 가 영원히 남는다. 스크롤이 없을 때는 여기서 이어 받는다.
  React.useEffect(() => {
    const list = scrollRef.current;
    if (!list || !nextId || loadingMore) return;
    if (list.scrollHeight <= list.clientHeight) loadMore();
  }, [nextId, loadingMore, serverComments, loadMore]);

  const sendServerComment = async () => {
    if (!comment.trim()) return;
    try {
      await window.MoyeoApi.addFeedComment(feedId, comment.trim());
      setComment('');
      // 새 댓글은 가장 큰 ID 라 목록 맨 위에 온다. 뒤 묶음의 커서는 그대로 유효하지만
      // 받아 둔 묶음 사이에 끼워 넣을 자리를 클라가 계산하면 순서가 어긋난다 —
      // **첫 묶음부터 다시 받아** 맨 위로 올린다(23 의 commentCount 도 같이 다시 읽는다).
      setNextId(undefined);
      loadFirstPage();
      setCommentCount((current) => (typeof current === 'number' ? current + 1 : current));
    } catch (_) { /* 실패 시 입력 유지 */ }
  };

  if (serverComments) {
    return (
      <Phone>
        <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
          <Header title={commentCount == null ? '댓글' : `댓글 ${commentCount}`} left center onBack={nav.back}/>
          <div ref={scrollRef} onScroll={onListScroll} data-testid="feed-comments-scroll" style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 78, overflow: 'auto', padding: '0 18px 16px' }}>
            {serverComments.length === 0 && (
              <div style={{ padding: '56px 0', textAlign: 'center', color: T.text500, fontSize: 13 }}>아직 댓글이 없어요. 첫 댓글을 남겨보세요!</div>
            )}
            {serverComments.map((item) => (
              <div key={item.commentId} style={{ borderBottom: `1px solid ${RF.softLine}` }}>
                <FeedCommentRow item={item}/>
                {(item.replies || []).map((reply) => <FeedCommentRow key={reply.commentId} item={reply} reply/>)}
              </div>
            ))}
            {/* 다음 묶음이 있는 동안만 자리를 남긴다 — 마지막 페이지(nextId null)에는 아무것도 없다. */}
            {nextId && (
              <div role="status" data-testid="feed-comments-more" style={{ padding: '16px 0', textAlign: 'center', color: T.text500, fontSize: 12 }}>불러오는 중이에요…</div>
            )}
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 14px 24px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Composer value={comment} onChange={setComment} onSend={sendServerComment} placeholder="댓글을 남겨주세요" height={40} buttonSize={36} iconSize={16} inputLabel="댓글 입력" testId="feed-comments-composer"/>
          </div>
        </div>
      </Phone>
    );
  }
  // 서버 댓글을 못 받으면 예시 댓글을 그리지 않는다.
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="댓글" left center onBack={nav.back}/>
        <div role="status" style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13, lineHeight: '21px' }}>
          {liveMode ? '아직 댓글이 없어요.' : '로그인하면 모집 중인 모임을 볼 수 있어요.'}
        </div>
      </div>
    </Phone>
  );
}

Object.assign(window, {
  ScreenTripConfirmed,
  ScreenTripDay,
  ScreenNotifDetail,
  ScreenAccountDelete,
  ScreenSystemNotice,
  ScreenSystemMaintenance,
  ScreenSystemError,
  ScreenFeedComments,
});
