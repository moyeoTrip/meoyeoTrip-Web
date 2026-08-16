// changeLog02 §1-4에서 "다음 순번"으로 남겨둔 화면들
//
// (1) 여행 확정 모먼트 · 여행 날 채팅방 위젯   — 04 §4.5·4.6
// (2) 알림 세부 설정 (방해금지 시간대)        — 06 §6.5
// (3) 계정 탈퇴 플로우                        — 06 §6.4
// (4) 시스템 화면 3종 (업데이트·점검·오류)     — 06 §6.9
// (5) 피드 댓글 전체 보기                      — 05 §5.2

// ───────── 34 · 여행 확정 모먼트 ─────────
// 마감일에 인원이 충족된 순간. 서비스에서 confetti를 쓰는 유일한 자리.
function ScreenTripConfirmed() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const confetti = Array.from({ length: 18 }, (_, i) => ({
    left: (i * 37) % 96,
    top: 6 + ((i * 53) % 34),   // 상단 40% 안쪽 — 본문 텍스트와 겹치지 않게
    size: 6 + (i % 3) * 3,
    color: [T.primary500, T.accent500, T.primary300, T.warning][i % 4],
    rot: (i * 47) % 180,
    drift: -34 + ((i * 29) % 72),
    delay: (i % 6) * 54,
  }));
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative', overflow: 'hidden' }}>
        <Header title="주왕산 & 주산지 힐링 트레킹" left center onBack={nav.back}/>

        {/* confetti — prefers-reduced-motion에서는 페이드만 (디자인 시스템 §7-3) */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {confetti.map((c, i) => (
            <div key={i} className="moyeo-confetti-piece" style={{
              position: 'absolute', left: `${c.left}%`, top: `${c.top}%`,
              width: c.size, height: c.size * 0.5, borderRadius: 2,
              background: c.color,
              '--confetti-drift': `${c.drift}px`,
              '--confetti-spin': `${c.rot + 220}deg`,
              '--confetti-delay': `${c.delay}ms`,
            }}/>
          ))}
        </div>

        <div style={{ position: 'absolute', top: 92, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '0 20px', textAlign: 'center' }}>
          <div style={{ margin: '18px auto 0', width: 252, height: 142, position: 'relative', overflow: 'hidden', borderRadius: 18 }}>
            <img
              className="moyeo-theme-image moyeo-theme-image-light moyeo-trip-confirmed-hero"
              src="assets/celebration/trip-confirmed-light.png"
              alt="여행 확정을 함께 축하하는 모여트립 곰, 토끼, 너구리 캐릭터"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <img
              className="moyeo-theme-image moyeo-theme-image-dark moyeo-trip-confirmed-hero"
              src="assets/celebration/trip-confirmed-dark.png"
              alt=""
              aria-hidden="true"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, lineHeight: '31px', marginTop: 18 }}>여행이 확정됐어요!</div>
          <div style={{ fontSize: 13, color: T.text500, marginTop: 8, lineHeight: '20px' }}>
            5월 22일 마감까지 <b style={{ color: T.primary600 }}>5명</b>이 모였어요.<br/>이제 함께 떠나기만 하면 돼요.
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
            {[
              ['calendar', '5/25(토) 당일치기 · 08:00 – 18:00'],
              ['pin', '07:50 청송 시외버스터미널 정문 앞'],
              ['users', '5명 · 최소 3명 충족'],
            ].map((r) => (
              <div key={r[1]} style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 8, fontSize: 12.5, color: T.text900, fontWeight: 700 }}>
                <Icon name={r[0]} size={15} color={T.primary600}/>{r[1]}
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
              <MemberStack size={30} members={['bear','deer','rabbit','turtle']} more={1}/>
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

// ───────── 35 · 여행 날 채팅방 (진행 위젯 · 위치 공유) ─────────
function ScreenTripDay() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const [share, setShare] = React.useState(true);
  const stops = ['청송터미널', '주왕산', '주산지', '달기약수탕'];
  const current = 2; // 1-indexed

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header
          title="주왕산 & 주산지 힐링 트레킹"
          left center onBack={nav.back}
          right={<><IconButton name="search"/><IconButton name="menu" onClick={() => nav.go('chat-menu')}/></>}
        />
        <div style={{ textAlign: 'center', fontSize: 12, color: T.text500, paddingBottom: 10, borderBottom: `1px solid ${RF.softLine}`, fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ color: T.primary600, fontWeight: 900 }}>여행 중</span> · 5명 · 오늘 08:00 출발
        </div>

        {/* 여행 진행 위젯 — 여행 시작일 당일에만 상단 고정 */}
        <div style={{ padding: '12px 16px', background: T.primary50, borderBottom: `1px solid ${T.primary100}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="pin" size={15} color={T.primary700}/>
            <div style={{ flex: 1, fontSize: 12.5, fontWeight: 900, color: T.primary700 }}>
              현재 방문지 {current}/{stops.length} · {stops[current - 1]}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 11.5, color: T.primary700 }}>
            <Icon name="clock" size={13} color={T.primary600}/>
            다음 일정 · <b>14:00 주산지</b> 왕버들 산책로
          </div>
        </div>

        {/* 실시간 위치 공유 — 여행 날에만, 기본 옵트인 필요 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: `1px solid ${RF.softLine}`, background: RF.card }}>
          <Icon name="map" size={15} color={share ? T.primary600 : T.text500}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800 }}>{share ? '3명이 위치를 공유 중이에요' : '위치 공유 꺼짐'}</div>
            <div style={{ fontSize: 10.5, color: T.text500, marginTop: 2 }}>여행이 끝나면 자동으로 꺼져요</div>
          </div>
          <button
            type="button"
            onClick={() => setShare((v) => !v)}
            aria-label="위치 공유 토글"
            style={{
              width: 44, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 2,
              background: share ? T.primary500 : T.line200,
              display: 'flex', justifyContent: share ? 'flex-end' : 'flex-start', alignItems: 'center',
            }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, background: '#fff', boxShadow: T.l1 }}/>
          </button>
        </div>

        <div style={{ height: 'calc(100% - 336px)', overflow: 'auto', padding: '16px 18px 86px', background: T.chatCanvas }}>
          <div style={{ width: 'fit-content', margin: '0 auto 14px', background: T.systemMsg, color: T.primary700, borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 800 }}>
            오늘 여행이 시작됐어요 🎒
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 14 }}>
            <AnimalAvatar kind="rabbit" size={30} bg={T.primary50}/>
            <div>
              <div style={{ fontSize: 10, color: T.text500, margin: '0 0 4px 2px' }}>엉뚱한 토끼 1457</div>
              <div style={{ maxWidth: 244, background: RF.card, border: `1px solid ${RF.softLine}`, borderRadius: '16px 16px 16px 4px', padding: '10px 13px', fontSize: 13, lineHeight: '19px' }}>
                주왕산 3폭포 도착! 생각보다 사람 적어요 👍
              </div>
            </div>
          </div>
          {/* 장소 카드 — 첨부 메뉴의 '장소' */}
          <div style={{ maxWidth: 268, marginLeft: 38, borderRadius: 14, border: `1px solid ${RF.softLine}`, background: RF.card, overflow: 'hidden', marginBottom: 14 }}>
            <MiniMap height={92} pins={[1]}/>
            <div style={{ padding: 11 }}>
              <div style={{ fontSize: 12.5, fontWeight: 900 }}>주산지 주차장</div>
              <div style={{ fontSize: 11, color: T.text500, marginTop: 3 }}>14:00 도착 예정 · 차로 22분</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.primary600, marginTop: 8 }}>길 찾기 →</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ maxWidth: 244, background: 'var(--moyeo-chat-mine)', borderRadius: '16px 16px 4px 16px', padding: '10px 13px', fontSize: 13, lineHeight: '19px' }}>
              저는 주차장에서 기다릴게요~
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 14px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="button" onClick={() => nav.go('chat-attach')} aria-label="첨부 메뉴 열기" style={{ width: 38, height: 38, borderRadius: 999, border: `1px solid ${RF.softLine}`, background: RF.card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <Icon name="plus" size={19} color={T.text700}/>
          </button>
          <div style={{ flex: 1, height: 42, borderRadius: 999, border: `1px solid ${RF.softLine}`, display: 'flex', alignItems: 'center', padding: '0 14px', color: T.text400, fontSize: 13 }}>메시지 입력</div>
          <button style={{ width: 38, height: 38, borderRadius: 999, border: 'none', background: T.primary500, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="send" size={17} color="#fff"/>
          </button>
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
                  onClick={() => setMode(o.id)}
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
              <Toggle on={dnd} onClick={() => setDnd((v) => !v)}/>
            </div>

            {dnd && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                  <div>
                    <AddFieldLabel>시작</AddFieldLabel>
                    <AddFieldBox icon="clock" value="22:30" chevron={false}/>
                  </div>
                  <div>
                    <AddFieldLabel>종료</AddFieldLabel>
                    <AddFieldBox icon="clock" value="07:00" chevron={false}/>
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
                          onClick={() => setOnDays((v) => (on ? v.filter((x) => x !== d) : [...v, d]))}
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

          <div style={{ height: 8, background: T.bgSubtle, margin: '18px 0 0' }}/>

          {/* 방별 음소거 */}
          <div style={{ padding: '16px 20px 0' }}>
            <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 4 }}>모임별 알림</div>
            {[
              { n: '주왕산 & 주산지 힐링 트레킹', on: true, hue: 'forest' },
              { n: '포항·영덕 동해 드라이브', on: false, hue: 'coast' },
              { n: '안동 하회마을 한옥체험', on: true, hue: 'hanok' },
            ].map((room) => (
              <div key={room.n} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 0', borderBottom: `1px solid ${RF.softLine}` }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                  <Photo hue={room.hue} height={34} radius={0}/>
                </div>
                <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{room.n}</div>
                <Toggle on={room.on}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 37 · 계정 탈퇴 ─────────
function ScreenAccountDelete() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const [reason, setReason] = React.useState('');
  const [confirm, setConfirm] = React.useState(false);
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
          {/* 참여 중인 모임이 있으면 먼저 정리하도록 */}
          <div style={{ borderRadius: 14, border: `1px solid ${T.warningBg}`, background: T.warningBg, padding: 14 }}>
            <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <Icon name="users" size={17} color={T.warningText}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: T.warningText }}>참여 중인 여행이 2개 있어요</div>
                <div style={{ fontSize: 11.5, color: T.warningText, marginTop: 5, lineHeight: '17px' }}>
                  탈퇴하면 동행자들에게 갑자기 빈자리가 생겨요. 나가기 처리를 먼저 해주세요.
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              {['주왕산 & 주산지 힐링 트레킹 · D-2', '포항·영덕 동해 드라이브 · D-9'].map((t) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 11px', borderRadius: 10, background: RF.card, fontSize: 12, fontWeight: 700 }}>
                  <Icon name="calendar" size={14} color={T.text500}/>
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: T.primary600 }}>관리 →</span>
                </div>
              ))}
            </div>
          </div>

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
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8 }}>
          <Btn variant="ghost" onClick={nav.back}>돌아가기</Btn>
          <div style={{ flex: 1 }}>
            <Btn variant="danger" full disabled={!reason} onClick={() => setConfirm(true)}>탈퇴하기</Btn>
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
                도감에 모은 친구 <b>12마리</b>와 여행 기록 <b>8개</b>가 사라져요. 30일이 지나면 되돌릴 수 없어요.
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                <Btn variant="ghost" onClick={() => setConfirm(false)}>취소</Btn>
                <div style={{ flex: 1 }}><Btn variant="danger" full onClick={() => nav.go('login')}>탈퇴할게요</Btn></div>
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
function ScreenFeedComments() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const comments = [
    { k: 'rabbit', n: '엉뚱한 토끼 1457', t: '2시간 전', c: '이날 진짜 좋았어요! 주산지 물안개 사진 저도 올릴게요 📷', likes: 4, mate: true, replies: [
      { k: 'bear', n: '숲속여행자', t: '1시간 전', c: '토끼님 사진이 훨씬 잘 나왔어요 ㅎㅎ', author: true },
    ] },
    { k: 'turtle', n: '잔잔한 거북이 9032', t: '3시간 전', c: '달기약수탕 백숙 진짜 맛있었죠', likes: 2, mate: true, replies: [] },
    { k: 'crane', n: '고요한 두루미 1130', t: '5시간 전', c: '이 코스 저도 가보고 싶네요. 당일치기로 충분할까요?', likes: 1, mate: false, replies: [
      { k: 'bear', n: '숲속여행자', t: '4시간 전', c: '네 08시 출발이면 여유로워요!', author: true },
    ] },
  ];

  const Comment = ({ c, reply = false }) => (
    <div style={{ display: 'flex', gap: 10, padding: reply ? '10px 0 10px 38px' : '12px 0' }}>
      <AnimalAvatar kind={c.k} size={reply ? 26 : 34} bg={T.primary50}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12.5, fontWeight: 800 }}>{c.n}</span>
          {c.author && <Chip variant="soft">작성자</Chip>}
          {c.mate && <Chip variant="neutral">함께 간 친구</Chip>}
          <span style={{ fontSize: 10.5, color: T.text400 }}>{c.t}</span>
        </div>
        <div style={{ fontSize: 13, lineHeight: '20px', marginTop: 5 }}>{c.c}</div>
        <div style={{ display: 'flex', gap: 14, marginTop: 7, fontSize: 11, color: T.text500, fontWeight: 700 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="heart" size={13} color={T.text400}/>{c.likes || ''}
          </span>
          <span>답글 달기</span>
        </div>
      </div>
    </div>
  );

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="댓글 18" left center onBack={nav.back}/>

        <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 78, overflow: 'auto', padding: '0 18px 16px' }}>
          {/* 어떤 피드의 댓글인지 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0 12px', borderBottom: `1px solid ${RF.softLine}` }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
              <Photo hue="forest" height={40} radius={0}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>주왕산 &amp; 주산지 힐링 트레킹</div>
              <div style={{ fontSize: 11, color: T.text500, marginTop: 2 }}>숲속여행자 · 좋아요 128</div>
            </div>
          </div>

          {comments.map((c) => (
            <div key={c.n} style={{ borderBottom: `1px solid ${RF.softLine}` }}>
              <Comment c={c}/>
              {c.replies.map((r) => <Comment key={r.c} c={r} reply/>)}
            </div>
          ))}

          <div style={{ textAlign: 'center', fontSize: 11, color: T.text400, padding: '16px 0 4px' }}>
            함께 간 친구의 댓글이 먼저 보여요
          </div>
        </div>

        {/* 댓글 입력 */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 14px 24px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8, alignItems: 'center' }}>
          <AnimalAvatar kind="deer" size={32} bg={T.primary50}/>
          <div style={{ flex: 1, height: 40, borderRadius: 999, border: `1px solid ${RF.softLine}`, display: 'flex', alignItems: 'center', padding: '0 14px', color: T.text400, fontSize: 13 }}>댓글을 남겨주세요</div>
          <button style={{ width: 36, height: 36, borderRadius: 999, border: 'none', background: T.primary500, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="send" size={16} color="#fff"/>
          </button>
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
