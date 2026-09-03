// 후속 화면이 없던 자리 — 신설 화면 11종.
// 정본: docs/alignment/ATTACH-COMPOSER-CANON.md §6
// 기획 원본: 모여트립 in 경북/screens-gaps.jsx · screens-gaps2.jsx · screens-gaps3.jsx
//
// 첨부 6종(§1)과 같은 유형의 빈칸이다: **화면에 있는 것이 다른 화면의 존재를 암시하는데
// 그 화면이 없다.** 여기 있는 것은 전부 서버 API 가 이미 있고, 호출부만 없었다.
//
//   08-H  password-reset   비밀번호 재설정
//   13-2  kick-history     내보내진 기록
//   18-4  trip-status      여행 확정 / 불발 (호스트)
//   18-5  meeting-edit     집합 정보 수정 (호스트)
//   19-2  apply-cancel     참가 신청 취소 확인
//   20-1c room-notif       이 모임 알림
//   20-3a notice-edit      공지 수정 · 삭제
//   26-1  favorite-rooms   찜한 모집
//   27-4  course-rating    코스 평가 (별점 1~5)
//   27-2a friend-manage    친구 정리 (친구 끊기)
//   29-1a unblock-confirm  차단 해제 확인
//
// **목데이터 금지(NO-MOCK-CANON R1).** 기획 원본의 예시 코스·예시 모임·예시 친구는 옮기지 않았다.
// 값은 전부 서버 응답이거나 사용자 입력이고, 없으면 §2 정본 문구로 빈 상태를 그린다.
// 안내·경고 문구는 기획에서 **글자 그대로** 옮겼다 — 세 플랫폼이 같아야 한다.
//
// screens-attach.jsx 뒤에 로드되어 Phone / Header / Btn / Chip / Icon / RF / T 를 그대로 쓴다.

// ───────── 공통 조각 ─────────

// 되돌리기 어려운 행동을 묻는 시트. 19-2 · 29-1a · 27-2a 가 같은 골격을 쓴다.
// 각자 다른 모양이면 사용자가 "이건 아까 그거랑 다른 건가" 하고 멈칫한다 (기획 ConfirmSheet).
function GapConfirmSheet({
  under, title, desc, lines, cancel = '돌아가기', confirm, danger,
  busy, error, disabled, onCancel, onConfirm, testId,
}) {
  return (
    <Phone>
      <div data-testid={testId} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {/* 이전 화면이 딤 아래에 깔려 있어야 시트가 "위에 떠 있다"고 읽힌다 */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>{under}</div>
        <div style={{ position: 'absolute', inset: 0, background: T.bgOverlay }}/>
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, background: T.bgRaised,
          borderRadius: '24px 24px 0 0', padding: '10px 20px 32px', boxShadow: T.l3,
        }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: T.line300, margin: '0 auto 16px' }}/>
          <div style={{ fontSize: 17, fontWeight: 900 }}>{title}</div>
          {desc && <div style={{ fontSize: 12.5, color: T.text500, marginTop: 6, lineHeight: '19px' }}>{desc}</div>}

          {lines && lines.length > 0 && <GapNoteBox lines={lines}/>}

          {error && (
            <div role="alert" data-testid={testId ? `${testId}-error` : undefined} style={{ marginTop: 12, fontSize: 11.5, color: T.danger }}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <div style={{ flex: 1 }}><Btn variant="secondary" full onClick={onCancel}>{cancel}</Btn></div>
            <div style={{ flex: 1 }}>
              <Btn
                variant={danger ? 'danger' : 'primary'}
                full
                networkAction
                disabled={disabled || busy}
                testId={testId ? `${testId}-confirm` : undefined}
                onClick={onConfirm}
              >
                {busy ? '처리 중...' : confirm}
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </Phone>
  );
}

function GapNoteBox({ lines }) {
  return (
    <div style={{ marginTop: 16, borderRadius: 12, background: T.bgSubtle, padding: 14 }}>
      {lines.map((line) => (
        <div key={line} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
          <div style={{ width: 4, height: 4, borderRadius: 999, background: T.text500, marginTop: 7, flexShrink: 0 }}/>
          <div style={{ fontSize: 11.5, color: T.text700, lineHeight: '17px' }}>{line}</div>
        </div>
      ))}
    </div>
  );
}

// 헤더 + 스크롤 본문 + 하단 고정 CTA 한 개 (정본 R1 · AttachFrame 과 같은 골격).
// CTA 가 없는 열람 화면(26-1 · 13-2 · 20-1c)은 cta 를 넘기지 않는다.
function GapFrame({ title, hint, cta, ctaIcon = 'check', disabled, busy, busyLabel = '저장하는 중...', error, onBack, onSubmit, testId, children }) {
  return (
    <Phone>
      <div data-testid={testId} style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title={title} left center onBack={onBack}/>
        {hint && (
          <div style={{ padding: '0 20px 12px', borderBottom: `1px solid ${RF.softLine}` }}>
            <div style={{ fontSize: 11.5, color: T.text500, lineHeight: '17px' }}>{hint}</div>
          </div>
        )}
        <div style={{ position: 'absolute', top: hint ? 108 : 92, left: 0, right: 0, bottom: cta ? 96 : 0, overflow: 'auto', padding: '16px 20px 24px' }}>
          {children}
        </div>
        {cta && (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}` }}>
            {error && <div role="alert" data-testid={testId ? `${testId}-error` : undefined} style={{ fontSize: 11.5, color: T.danger, marginBottom: 7 }}>{error}</div>}
            <Btn variant="primary" full icon={ctaIcon} disabled={disabled || busy} networkAction testId={testId ? `${testId}-submit` : undefined} onClick={onSubmit}>
              {busy ? busyLabel : cta}
            </Btn>
          </div>
        )}
      </div>
    </Phone>
  );
}

// 로그인·대상이 없으면 화면을 그리지 않는다 (§2 정본 문구를 글자 그대로).
function GapNotice({ title, status, emptyText, onBack, onRetry, testId }) {
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title={title} left center onBack={onBack}/>
        <div role={status === 'error' ? 'alert' : 'status'} data-testid={testId} style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13, lineHeight: '21px' }}>
          {status === 'signed-out' && '로그인하면 모집 중인 모임을 볼 수 있어요.'}
          {status === 'loading' && '불러오는 중이에요…'}
          {/* 0건은 **실패가 아니다.** 예전에 대상이 없으면 무조건 `error` 로 떨어져
              `불러오지 못했어요.` 가 떴다 — 사용자는 앱이 고장 난 줄 안다. */}
          {status === 'empty' && emptyText}
          {status === 'error' && (
            <>
              불러오지 못했어요.{' '}
              {onRetry && (
                <button type="button" onClick={onRetry} style={{ padding: 0, border: 0, background: 'transparent', color: T.primary600, fontFamily: T.fontStack, fontSize: 13, fontWeight: 900, textDecoration: 'underline', cursor: 'pointer' }}>다시 시도</button>
              )}
            </>
          )}
        </div>
      </div>
    </Phone>
  );
}

// 별 1~5. 서버가 받는 값이 정수 1~5 라 반 개는 두지 않는다 (27-4 코스 평가 · 27-1 매너 점수 공용).
function GapStarRating({ value = 0, size = 40, gap = 8, onPick, label, testIdPrefix }) {
  return (
    <div role="radiogroup" aria-label={label} style={{ display: 'flex', gap }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={n === value}
          aria-label={`${n}점`}
          data-testid={testIdPrefix ? `${testIdPrefix}-${n}` : undefined}
          onClick={() => onPick(n)}
          style={{ border: 0, background: 'transparent', padding: 2, cursor: 'pointer', lineHeight: 0 }}
        >
          <Icon name="star" size={size} color={n <= value ? T.warning : T.line300}/>
        </button>
      ))}
    </div>
  );
}

// 방을 대상으로 하는 화면들의 공통 컨텍스트 (첨부 화면의 useAttachRoom 과 같은 관례).
function useGapRoom() {
  const liveMode = Boolean(window.MoyeoApi?.live());
  const roomId = liveMode ? window.MoyeoApi.selectedRoomId() : null;
  return { liveMode, roomId, ready: Boolean(liveMode && roomId) };
}

const GAP_INPUT_STYLE = {
  width: '100%', height: 46, borderRadius: 12, border: `1px solid ${T.line200}`, padding: '0 12px',
  fontSize: 13, color: T.text900, background: RF.bg, fontFamily: T.fontStack, outline: 'none', boxSizing: 'border-box',
};

function GapFieldLabel({ children, required }) {
  return (
    <div style={{ fontSize: 12.5, fontWeight: 900, margin: '18px 0 8px' }}>
      {children}{required && <span style={{ color: T.danger }}> *</span>}
    </div>
  );
}

function GapToggleRow({ label, desc, on, onToggle, testId }) {
  return (
    <button type="button" onClick={onToggle} data-testid={testId} aria-pressed={Boolean(on)} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
      border: 0, background: 'transparent', cursor: 'pointer', fontFamily: T.fontStack, textAlign: 'left',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text900 }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: T.text500, marginTop: 3, lineHeight: '16px' }}>{desc}</div>}
      </div>
      <div style={{ width: 44, height: 26, borderRadius: 999, flexShrink: 0, position: 'relative', background: on ? T.primary500 : T.line300 }}>
        <div style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: 999, background: '#fff', boxShadow: T.l1 }}/>
      </div>
    </button>
  );
}

// ───────── 08-H · 비밀번호 재설정 ─────────
// 08-A 이메일 로그인의 `비밀번호를 잊으셨나요?` 에서 온다. 그 버튼은 지금까지 같은 화면에서
// 조용히 메일만 보내고 끝났다 — 무엇이 일어났는지, 안 오면 어떻게 하는지 알 길이 없었다.
// 근거: Firebase sendPasswordResetEmail (MoyeoAuth.resetEmailPassword)
function ScreenPasswordReset() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  // 08-A 에서 이미 입력한 이메일을 그대로 이어받는다 — 두 번 치게 하지 않는다.
  const [email, setEmail] = React.useState(() => window.MoyeoApi?.selectedResetEmail?.() || '');
  const [sent, setSent] = React.useState(false);
  const [sentTo, setSentTo] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const valid = /^\S+@\S+\.\S+$/.test(email);

  const send = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError('');
    try {
      await window.MoyeoAuth.resetEmailPassword(email);
      setSentTo(email);
      setSent(true);
    } catch (sendError) {
      setError(sendError?.message || '재설정 메일을 보내지 못했어요.');
    }
    setBusy(false);
  };

  return (
    <Phone>
      <div data-testid="password-reset" style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="비밀번호 재설정" left center onBack={nav.back}/>

        <div style={{ position: 'absolute', top: 92, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '20px' }}>
          {!sent ? (
            <React.Fragment>
              <div style={{ fontSize: 17, fontWeight: 900, lineHeight: '25px' }}>
                가입하신 이메일을 알려주세요
              </div>
              <div style={{ fontSize: 12.5, color: T.text500, marginTop: 8, lineHeight: '19px' }}>
                비밀번호를 새로 정할 수 있는 링크를 보내드려요.
              </div>

              <GapFieldLabel>이메일</GapFieldLabel>
              <input
                type="email"
                autoComplete="email"
                data-testid="password-reset-email"
                aria-label="이메일"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                style={{ ...GAP_INPUT_STYLE, height: 48 }}
              />

              <div style={{ marginTop: 16, borderRadius: 12, background: T.bgSubtle, padding: 14 }}>
                <div style={{ fontSize: 11.5, color: T.text700, lineHeight: '17px' }}>
                  카카오로 가입하셨다면 비밀번호가 없어요. 로그인 화면에서 카카오로 다시 들어와 주세요.
                </div>
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {/* 보냈다는 사실만 알리고 화면을 닫지 않는다 — 메일이 안 오면 다시 보낼 곳이 필요하다 */}
              <div style={{
                width: 56, height: 56, borderRadius: 999, background: T.primary50,
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px 0 18px',
              }}>
                <Icon name="send" size={24} color={T.primary600}/>
              </div>
              <div style={{ fontSize: 17, fontWeight: 900, lineHeight: '25px' }}>메일을 보냈어요</div>
              <div data-testid="password-reset-sent" style={{ fontSize: 12.5, color: T.text500, marginTop: 8, lineHeight: '19px' }}>
                {sentTo} 으로 재설정 링크를 보냈어요.<br/>메일함을 확인해 주세요.
              </div>
              <GapNoteBox lines={[
                '링크는 1시간 동안만 쓸 수 있어요.',
                '메일이 안 보이면 스팸함도 확인해 주세요.',
              ]}/>
              <button type="button" onClick={() => { setSent(false); setError(''); }} style={{
                marginTop: 14, border: 0, background: 'transparent', padding: 0, cursor: 'pointer',
                color: T.primary600, fontSize: 13, fontWeight: 800, fontFamily: T.fontStack,
              }}>
                다시 보내기
              </button>
            </React.Fragment>
          )}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}` }}>
          {error && <div role="alert" data-testid="password-reset-error" style={{ fontSize: 11.5, color: T.danger, marginBottom: 7 }}>{error}</div>}
          {!sent
            ? <Btn variant="primary" full disabled={!valid || busy} networkAction testId="password-reset-submit" onClick={send}>{busy ? '보내는 중...' : '재설정 링크 보내기'}</Btn>
            : <Btn variant="secondary" full onClick={() => nav.go('email-auth')}>로그인으로 돌아가기</Btn>}
        </div>
      </div>
    </Phone>
  );
}

// ───────── 27-4 · 코스 평가 ─────────
// 27-1 여행 마무리의 `코스 평가 →` 에서 온다.
//
// **이 화면이 없어서 14 코스 상세의 평점이 영원히 비어 있었다.** 코스 상세는
// averageRating·ratingCount 를 그리는데, 그 값을 만드는 곳이 어디에도 없었다.
//
// 근거: POST /api/v1/travel-courses/chat-rooms/{roomId}/rating  { score: 1~5 }
// 경로 변수가 courseId 가 아니라 **다녀온 방** 이라 대상은 selectedRoomId 다.
// 서버 조건 — "확정된 여행이 끝난 채팅방 참가자만" 평가할 수 있다.
function ScreenCourseRating() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const liveMode = Boolean(window.MoyeoApi?.live());
  const [score, setScore] = React.useState(0);
  const [course, setCourse] = React.useState(null);
  const [status, setStatus] = React.useState(liveMode ? 'loading' : 'idle');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [reloadKey, setReloadKey] = React.useState(0);

  // 서버는 "확정된 여행이 끝난 방의 참가자"만 평가하게 한다. 마지막으로 고른 방이 모집 중이거나
  // 불발(CANCELLED)이면 그대로 400 이 난다 — 27-1 과 같은 판정을 쓴다 (MoyeoApi.completedTripRoomId).
  const [roomId, setRoomId] = React.useState(null);
  React.useEffect(() => {
    if (!liveMode) { setRoomId(null); return undefined; }
    let active = true;
    window.MoyeoApi.completedTripRoomId()
      .then((resolved) => {
        if (!active) return;
        setRoomId(resolved);
        if (!resolved) setStatus('error'); // 다녀온 여행이 없으면 평가할 것이 없다
      })
      .catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [liveMode]);
  const ready = Boolean(liveMode && roomId);

  React.useEffect(() => {
    if (!ready) return undefined;
    let active = true;
    setStatus('loading');
    window.MoyeoApi.roomCourse(roomId)
      .then((result) => {
        if (!active) return;
        setCourse(result?.course || null);
        setStatus('ready');
      })
      // 코스를 못 읽어도 별점은 남길 수 있다 — 무엇을 평가하는지 카드만 빠진다.
      .catch(() => { if (active) setStatus('ready'); });
    return () => { active = false; };
  }, [ready, roomId, reloadKey]);

  // 점수를 고르기 전에는 아무 말도 하지 않는다 — 기본 문구를 띄우면 이미 고른 것처럼 보인다
  const WORDS = ['', '아쉬웠어요', '그저 그랬어요', '괜찮았어요', '좋았어요', '정말 좋았어요'];

  const submit = async () => {
    if (score === 0 || busy) return;
    setBusy(true);
    setError('');
    try {
      await window.MoyeoApi.rateRoomCourse(roomId, score);
      nav.back();
    } catch (submitError) {
      setError(submitError?.message || '평가를 남기지 못했어요.');
      setBusy(false);
    }
  };

  if (status === 'error') return <GapNotice title="코스 평가" status="error" onBack={nav.back} onRetry={() => setReloadKey((key) => key + 1)} testId="course-rating-state"/>;
  if (!ready) return <GapNotice title="코스 평가" status={liveMode ? 'loading' : 'signed-out'} onBack={nav.back} testId="course-rating-state"/>;
  if (status === 'loading') return <GapNotice title="코스 평가" status="loading" onBack={nav.back} testId="course-rating-state"/>;

  const placeCount = course?.places?.length ?? null;

  return (
    <GapFrame
      testId="course-rating"
      title="코스 평가"
      cta={score === 0 ? '별점을 골라주세요' : '평가 남기기'}
      ctaIcon="star"
      disabled={score === 0}
      busy={busy}
      busyLabel="보내는 중..."
      error={error}
      onBack={nav.back}
      onSubmit={submit}
    >
      <div style={{ fontSize: 17, fontWeight: 900, lineHeight: '25px' }}>
        이번 코스, 어떠셨어요?
      </div>
      <div style={{ fontSize: 12.5, color: T.text500, marginTop: 8, lineHeight: '19px' }}>
        남겨주신 점수는 이 코스의 평균 별점에 반영돼요.
      </div>

      {/* 무엇을 평가하는지 — 코스를 먼저 보여준다. 서버가 코스를 안 주면 카드를 그리지 않는다. */}
      {course && (
        <div style={{
          display: 'flex', gap: 11, marginTop: 18, padding: 12, borderRadius: 14,
          background: RF.card, border: `1px solid ${RF.softLine}`,
        }}>
          <div style={{ width: 62, height: 62, borderRadius: 11, overflow: 'hidden', flexShrink: 0 }}>
            <window.RoomThumb src={course.thumbnail} height={62}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 900 }}>{course.title}</div>
            <div style={{ fontSize: 11, color: T.text500, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
              {[
                placeCount != null ? `${placeCount}곳` : null,
                course.distanceKm != null ? `${course.distanceKm}km` : null,
                course.travelTime || null,
              ].filter(Boolean).join(' · ')}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30 }}>
        <GapStarRating value={score} onPick={setScore} label="코스 별점" testIdPrefix="course-rating-star"/>
      </div>
      <div data-testid="course-rating-word" style={{ textAlign: 'center', marginTop: 14, height: 22, fontSize: 14, fontWeight: 800, color: T.text900 }}>
        {WORDS[score]}
      </div>

      <GapNoteBox lines={[
        '점수만 남겨요. 글은 피드에 써주세요.',
        '누가 몇 점을 줬는지는 아무에게도 보이지 않아요.',
        '함께 간 사람들의 점수가 모여 코스 평균이 돼요.',
      ]}/>
    </GapFrame>
  );
}

// ───────── 18-4 · 여행 확정 / 불발 (호스트) ─────────
// 18 모집 관리에서 온다.
//
// **서비스에서 가장 중요한 전환인데 누르는 화면이 없었다.** 참가자가 결과를 보는
// 20-4 확정 모먼트는 있는데, 거기 도달하는 길이 알림뿐이었다 — 즉 확정이 사용자 조작 없이
// 저절로 일어나는 것처럼 그려져 있었다. 불발(CANCELLED)은 더 비어서, 호스트가 접는 화면도 없었다.
//
// 근거: POST /api/v1/chat-rooms/{roomId}/status  { status: CONFIRMED | CANCELLED }
//       최소 인원은 GET /chat-rooms/{roomId} 의 minimumParticipants (실서버 확인).
function ScreenTripStatus() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const { liveMode, roomId, ready } = useGapRoom();
  const [room, setRoom] = React.useState(null);
  const [status, setStatus] = React.useState(ready ? 'loading' : 'idle');
  const [pick, setPick] = React.useState('CONFIRMED');
  const [confirming, setConfirming] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (!ready) return undefined;
    let active = true;
    setStatus('loading');
    window.MoyeoApi.roomDetail(roomId)
      .then((result) => {
        if (!active) return;
        if (result?.roomId == null) { setStatus('error'); return; }
        setRoom(result);
        setStatus('ready');
      })
      .catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [ready, roomId, reloadKey]);

  const apply = async (next) => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await window.MoyeoApi.changeRoomStatus(roomId, next);
      // 방 상태가 바뀌면 목록의 진행중·확정 묶음이 달라진다 (TAB-STATE-CANON R4).
      window.MoyeoTabCache?.invalidate?.(window.MoyeoTabCache.ROOM_LIST_KEYS);
      setConfirming(false);
      nav.go(next === 'CONFIRMED' ? 'trip-confirmed' : 'chat-list');
    } catch (applyError) {
      setError(applyError?.message || (next === 'CONFIRMED' ? '여행을 확정하지 못했어요.' : '불발 처리를 하지 못했어요.'));
      setBusy(false);
    }
  };

  if (!ready) return <GapNotice title="여행 확정하기" status={liveMode ? 'loading' : 'signed-out'} onBack={nav.back} testId="trip-status-state"/>;
  if (status !== 'ready') {
    return <GapNotice title="여행 확정하기" status={status === 'error' ? 'error' : 'loading'} onBack={nav.back} onRetry={() => setReloadKey((key) => key + 1)} testId="trip-status-state"/>;
  }

  const approved = room.participantCount ?? 0;
  const minimum = room.minimumParticipants ?? null;
  // 최소 인원을 서버가 주지 않으면 잠그지 않는다 — 근거 없는 숫자로 호스트를 막지 않는다.
  const enough = minimum == null || approved >= minimum;

  const CONFIRM_LINES = [
    '확정하면 모집이 닫혀요. 다시 열 수 없어요.',
    '대기 중인 신청자에게는 마감 알림이 가요.',
    '여행 날이 되면 채팅방에 진행 위젯이 열려요.',
  ];
  const CANCEL_LINES = [
    '불발 처리하면 채팅방이 닫혀요. 되돌릴 수 없어요.',
    '같은 코스로 다시 모집을 열 수는 있어요.',
    '이미 나눈 대화는 사라져요.',
  ];

  // 확정도 불발도 되돌릴 수 없다 — 두 갈래 모두 확인 단계를 거친다.
  if (confirming) {
    const cancelling = pick === 'CANCELLED';
    return (
      <GapConfirmSheet
        testId="trip-status-confirm"
        under={<div style={{ height: '100%', background: RF.bg }}/>}
        title={cancelling ? '이 모임을 불발 처리할까요?' : '이 인원으로 여행을 확정할까요?'}
        desc={room.title}
        lines={cancelling ? CANCEL_LINES : CONFIRM_LINES}
        cancel="그대로 둘게요"
        confirm={cancelling ? '모집 불발 처리' : '여행 확정하기'}
        danger={cancelling}
        busy={busy}
        error={error}
        onCancel={() => { setConfirming(false); setError(''); }}
        onConfirm={() => apply(pick)}
      />
    );
  }

  const Option = ({ id, icon, title, desc, tone }) => {
    const on = pick === id;
    const accent = tone === 'danger' ? T.danger : T.primary500;
    return (
      <button type="button" data-testid={`trip-status-option-${id}`} aria-pressed={on} onClick={() => setPick(id)} style={{
        width: '100%', textAlign: 'left', display: 'flex', gap: 12, padding: 14, borderRadius: 14,
        cursor: 'pointer', fontFamily: T.fontStack, marginBottom: 10,
        background: on ? (tone === 'danger' ? T.dangerBg : T.primary50) : RF.card,
        border: `1.5px solid ${on ? accent : RF.softLine}`,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: on ? RF.card : T.bgSubtle,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={icon} size={19} color={tone === 'danger' ? T.danger : T.primary600}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: tone === 'danger' ? T.danger : T.text900 }}>{title}</div>
          <div style={{ fontSize: 11.5, color: T.text500, marginTop: 4, lineHeight: '17px' }}>{desc}</div>
        </div>
        {on && <Icon name="check" size={18} color={tone === 'danger' ? T.danger : T.primary600} strokeWidth={3}/>}
      </button>
    );
  };

  return (
    <Phone>
      <div data-testid="trip-status" style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="여행 확정하기" left center onBack={nav.back}/>

        <div style={{ position: 'absolute', top: 92, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '20px' }}>
          {/* 지금 몇 명인지 먼저 — 확정할지 접을지를 정하는 유일한 근거다 */}
          <div style={{
            borderRadius: 14, padding: 16, background: RF.card, border: `1px solid ${RF.softLine}`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <Icon name="users" size={20} color={T.primary600}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 900 }}>승인된 동행자 {approved}명</div>
              <div style={{ fontSize: 11, color: T.text500, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>
                {minimum != null ? `최소 인원 ${minimum}명 · ` : ''}{room.title}
              </div>
            </div>
            {minimum != null && <Chip variant={enough ? 'soft' : 'neutral'}>{enough ? '확정 가능' : '인원 부족'}</Chip>}
          </div>

          <div style={{ fontSize: 12.5, fontWeight: 900, margin: '20px 0 10px' }}>어떻게 할까요?</div>

          <Option
            id="CONFIRMED"
            icon="check"
            title="여행 확정하기"
            desc="더 이상 신청을 받지 않고 이 인원으로 떠나요. 동행자 모두에게 알림이 가요."
          />
          <Option
            id="CANCELLED"
            icon="close"
            title="모집 불발 처리"
            desc="이번 여행을 접어요. 승인된 동행자와 대기 중인 신청자 모두에게 알림이 가요."
            tone="danger"
          />

          <GapNoteBox lines={pick === 'CONFIRMED' ? CONFIRM_LINES : CANCEL_LINES}/>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}` }}>
          {error && <div role="alert" style={{ fontSize: 11.5, color: T.danger, marginBottom: 7 }}>{error}</div>}
          {pick === 'CONFIRMED'
            ? (
              <Btn variant="primary" full icon="check" disabled={!enough} testId="trip-status-submit" onClick={() => setConfirming(true)}>
                {enough ? '여행 확정하기' : `최소 ${minimum}명이 필요해요`}
              </Btn>
            )
            : <Btn variant="danger" full testId="trip-status-submit" onClick={() => setConfirming(true)}>모집 불발 처리</Btn>}
        </div>
      </div>
    </Phone>
  );
}

// ───────── 18-5 · 집합 정보 수정 (호스트) ─────────
// 18 모집 관리에서 온다. 모집을 연 뒤 집합 장소·시간을 고칠 길이 없었다 —
// 18 에서 고칠 수 있는 건 여행 경로뿐이고, 17-3 집합 장소 지정은 모집 **만들기** 단계라
// 이미 만든 모집에는 쓸 수 없다.
//
// 근거: PUT /api/v1/chat-rooms/{roomId}/meeting-info
//       { meetingLatitude, meetingLongitude, meetingDetails, meetingDateTime }
// 좌표는 여기서 찍지 않는다 — 지도로 고르는 화면(17-3)이 이미 있어 그리로 보낸다
// (MoyeoApi.selectMeetingEditRoom 이 그 화면에 "기존 방 수정"이라고 알려준다).
function ScreenMeetingEdit() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const { liveMode, roomId, ready } = useGapRoom();
  const [room, setRoom] = React.useState(null);
  const [status, setStatus] = React.useState(ready ? 'loading' : 'idle');
  const [details, setDetails] = React.useState('');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (!ready) return undefined;
    let active = true;
    setStatus('loading');
    window.MoyeoApi.roomDetail(roomId)
      .then((result) => {
        if (!active) return;
        if (result?.roomId == null) { setStatus('error'); return; }
        setRoom(result);
        setDetails(result.meetingDetails || '');
        const [datePart, timePart] = String(result.meetingDateTime || '').split('T');
        setDate(datePart || result.startDate || '');
        setTime(window.MoyeoApi.formatTime(timePart) || '');
        setStatus('ready');
      })
      .catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [ready, roomId, reloadKey]);

  const save = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      // meetingDateTime 은 서버 필수다. 화면에서 지운 안내 문구는 null 로 보낸다(문구를 지어내지 않는다).
      const body = window.MoyeoApi.buildMeetingInfoRequest(room, {
        meetingDetails: details,
        meetingDateTime: date && time ? `${date}T${time}:00` : room.meetingDateTime,
      });
      await window.MoyeoApi.updateMeetingInfo(roomId, body);
      window.MoyeoTabCache?.invalidate?.(window.MoyeoTabCache.ROOM_LIST_KEYS);
      nav.back();
    } catch (saveError) {
      setError(saveError?.message || '집합 정보를 저장하지 못했어요.');
      setBusy(false);
    }
  };

  if (!ready) return <GapNotice title="집합 정보 수정" status={liveMode ? 'loading' : 'signed-out'} onBack={nav.back} testId="meeting-edit-state"/>;
  if (status !== 'ready') {
    return <GapNotice title="집합 정보 수정" status={status === 'error' ? 'error' : 'loading'} onBack={nav.back} onRetry={() => setReloadKey((key) => key + 1)} testId="meeting-edit-state"/>;
  }

  const hasCoord = room.meetingLatitude != null && room.meetingLongitude != null
    && !(room.meetingLatitude === 0 && room.meetingLongitude === 0);
  const openMapPicker = () => {
    window.MoyeoApi.selectMeetingEditRoom(roomId);
    nav.go('create-meet');
  };

  return (
    <GapFrame
      testId="meeting-edit"
      title="집합 정보 수정"
      cta="집합 정보 저장"
      busy={busy}
      error={error}
      onBack={nav.back}
      onSubmit={save}
    >
      {/* 좌표가 없으면 지도를 그리지 않는다 (NO-MOCK-CANON R4 — 손으로 그린 지도 금지) */}
      {hasCoord && (
        <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${RF.softLine}` }}>
          <MiniMap
            height={168}
            level={4}
            center={{ lat: room.meetingLatitude, lng: room.meetingLongitude }}
            markers={[{ lat: room.meetingLatitude, lng: room.meetingLongitude, label: '' }]}
          />
        </div>
      )}

      <GapFieldLabel>집합 장소</GapFieldLabel>
      <button type="button" data-testid="meeting-edit-place" onClick={openMapPicker} style={{
        ...GAP_INPUT_STYLE, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', textAlign: 'left',
      }}>
        <Icon name="pin" size={15} color={T.text500}/>
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
          {hasCoord ? `${room.meetingLatitude.toFixed(5)}, ${room.meetingLongitude.toFixed(5)}` : '지도에서 집합 위치를 정해주세요'}
        </span>
        <Icon name="arrow" size={14} color={T.text400}/>
      </button>

      <GapFieldLabel>안내 문구</GapFieldLabel>
      <input
        type="text"
        data-testid="meeting-edit-details"
        aria-label="안내 문구"
        value={details}
        maxLength={200}
        onChange={(event) => setDetails(event.target.value)}
        placeholder="시외버스터미널 정문 앞"
        style={GAP_INPUT_STYLE}
      />

      <GapFieldLabel required>집합 일시</GapFieldLabel>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="date"
          data-testid="meeting-edit-date"
          aria-label="집합 날짜"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          style={{ ...GAP_INPUT_STYLE, flex: 1.4 }}
        />
        <input
          type="time"
          data-testid="meeting-edit-time"
          aria-label="집합 시간"
          value={time}
          onChange={(event) => setTime(event.target.value)}
          style={{ ...GAP_INPUT_STYLE, flex: 1 }}
        />
      </div>

      <GapNoteBox lines={[
        '고치면 동행자 모두에게 알림이 가요.',
        '고정 공지에 적어둔 집합 안내는 따로 고쳐주세요.',
      ]}/>
      {/* 방문지(코스 경로)는 이 화면에서 못 고친다 — 코스 편집 API 가 없다 (NO-MOCK-CANON §4) */}
    </GapFrame>
  );
}

// ───────── 20-1c · 이 모임 알림 ─────────
// 20-1 사이드 메뉴의 `알림 설정 · 이 모임의 알림만 끄기` 에서 온다.
//
// **지금까지 전역 방해금지 화면(29-2)으로 갔다.** "이 모임만" 이라고 써놓고 계정 전체 설정을
// 열어주면, 방 하나 끄려던 사람이 모든 알림을 끄게 된다.
// 근거: GET/PUT /api/v1/notifications/settings/chat-rooms/{roomId} → { roomId, enabled }
function ScreenRoomNotification() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const { liveMode, roomId, ready } = useGapRoom();
  const [room, setRoom] = React.useState(null);
  const [on, setOn] = React.useState(null);
  const [status, setStatus] = React.useState(ready ? 'loading' : 'idle');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (!ready) return undefined;
    let active = true;
    setStatus('loading');
    Promise.all([
      window.MoyeoApi.roomNotificationSetting(roomId),
      window.MoyeoApi.roomDetail(roomId).catch(() => null),
    ])
      .then(([setting, detail]) => {
        if (!active) return;
        if (typeof setting?.enabled !== 'boolean') { setStatus('error'); return; }
        setOn(setting.enabled);
        setRoom(detail?.roomId != null ? detail : null);
        setStatus('ready');
      })
      .catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [ready, roomId, reloadKey]);

  const toggle = async () => {
    if (on === null || busy) return;
    const next = !on;
    setBusy(true);
    setError('');
    setOn(next);
    try {
      const result = await window.MoyeoApi.updateRoomNotificationSetting(roomId, next);
      if (typeof result?.enabled === 'boolean') setOn(result.enabled);
    } catch (toggleError) {
      setOn(!next); // 저장 실패 시 이전 상태로 되돌린다 — 껐다고 거짓말하지 않는다
      setError(toggleError?.message || '알림 설정을 저장하지 못했어요.');
    }
    setBusy(false);
  };

  if (!ready) return <GapNotice title="이 모임 알림" status={liveMode ? 'loading' : 'signed-out'} onBack={nav.back} testId="room-notif-state"/>;
  if (status !== 'ready') {
    return <GapNotice title="이 모임 알림" status={status === 'error' ? 'error' : 'loading'} onBack={nav.back} onRetry={() => setReloadKey((key) => key + 1)} testId="room-notif-state"/>;
  }

  return (
    <Phone>
      <div data-testid="room-notif" style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="이 모임 알림" left center onBack={nav.back}/>
        <div style={{ position: 'absolute', top: 92, left: 0, right: 0, bottom: 0, overflow: 'auto', padding: '16px 20px 24px' }}>
          {/* 방 제목·인원은 서버가 줄 때만 그린다 */}
          {room && (
            <div style={{ padding: 14, borderRadius: 14, background: RF.card, border: `1px solid ${RF.softLine}` }}>
              <div style={{ fontSize: 13.5, fontWeight: 900 }}>{room.title}</div>
              <div style={{ fontSize: 11, color: T.text500, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
                동행자 {room.participantCount}명 · {window.MoyeoApi.formatDate(room.startDate)} 출발
              </div>
            </div>
          )}

          <div style={{ marginTop: 8 }}>
            <GapToggleRow
              testId="room-notif-toggle"
              label="이 모임 알림 받기"
              desc={on
                ? '새 메시지와 공지 알림을 받아요.'
                : '이 모임의 알림만 꺼져요. 다른 모임과 앱 전체 알림은 그대로예요.'}
              on={on}
              onToggle={toggle}
            />
          </div>
          {error && <div role="alert" style={{ fontSize: 11.5, color: T.danger }}>{error}</div>}

          <GapNoteBox lines={[
            '꺼도 채팅은 그대로 쌓여요. 들어가면 다 볼 수 있어요.',
            '앱 전체 알림과 방해 금지 시간대는 설정에서 따로 정해요.',
          ]}/>

          <button type="button" data-testid="room-notif-global" onClick={() => nav.go('notif-detail')} style={{
            marginTop: 14, width: '100%', height: 46, borderRadius: 12, cursor: 'pointer',
            border: `1px solid ${RF.softLine}`, background: RF.card, fontFamily: T.fontStack,
            display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px',
          }}>
            <Icon name="bell" size={16} color={T.text700}/>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: 700, color: T.text900 }}>앱 전체 알림 설정</span>
            <Icon name="arrow" size={15} color={T.text400}/>
          </button>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 20-3a · 공지 수정 · 삭제 ─────────
// 20-3 공지 이력의 카드마다 수정 링크가 있는데 **갈 곳이 없었다.**
// 근거: PUT /api/v1/chat-rooms/{roomId}/notices/{noticeId}
//       DELETE /api/v1/chat-rooms/{roomId}/notices/{noticeId}  (전용 엔드포인트다)
function ScreenNoticeEdit() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const { liveMode, roomId, ready } = useGapRoom();
  // 20-3 에서 고른 공지. 없으면 아무 공지도 고르지 않은 상태다 — 임의의 공지를 열지 않는다.
  // 20-3 을 거치지 않는 딥링크·라이브 캡처는 ?roomId=&noticeId= 로 대상을 지정한다.
  const selected = ready ? window.MoyeoApi.selectedNotice() : null;
  const [resolved, setResolved] = React.useState(null);
  const [settled, setSettled] = React.useState(false);
  const [loadFailed, setLoadFailed] = React.useState(false);
  React.useEffect(() => {
    if (!ready || selected?.noticeId) return undefined;
    const noticeId = window.MoyeoApi.selectedNoticeId();
    if (!noticeId) return undefined;
    let active = true;
    window.MoyeoApi.findRoomNotice(roomId, noticeId)
      .then((found) => { if (!active) return; if (found) setResolved(found); setSettled(true); })
      .catch(() => { if (active) { setLoadFailed(true); setSettled(true); } });
    return () => { active = false; };
  }, [ready, roomId, selected?.noticeId]);
  const notice = selected?.noticeId ? selected : resolved;
  const [text, setText] = React.useState(notice?.content || '');
  const [pinned, setPinned] = React.useState(Boolean(notice?.pinned));
  // 딥링크로 늦게 도착한 공지를 초안에 채운다 (먼저 고른 공지가 있으면 건드리지 않는다).
  React.useEffect(() => {
    if (!resolved) return;
    setText(resolved.content || '');
    setPinned(Boolean(resolved.pinned));
  }, [resolved]);
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  if (!ready || !notice?.noticeId) {
    const resolving = ready && !settled && Boolean(window.MoyeoApi.selectedNoticeId());
    return <GapNotice title="공지 수정" status={liveMode ? (resolving ? 'loading' : (loadFailed ? 'error' : 'empty')) : 'signed-out'} emptyText="아직 등록된 공지가 없어요." onBack={nav.back} testId="notice-edit-state"/>;
  }

  const trimmed = text.trim();
  const changed = trimmed !== (notice.content || '').trim() || pinned !== Boolean(notice.pinned);

  const save = async () => {
    if (!trimmed || !changed || busy) return;
    setBusy(true);
    setError('');
    try {
      await window.MoyeoApi.updateRoomNotice(roomId, notice.noticeId, { notice: trimmed, pinned });
      window.MoyeoApi.selectNotice(null);
      nav.back();
    } catch (saveError) {
      setError(saveError?.message || '공지를 수정하지 못했어요.');
      setBusy(false);
    }
  };

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await window.MoyeoApi.deleteRoomNotice(roomId, notice.noticeId);
      window.MoyeoApi.selectNotice(null);
      nav.back();
    } catch (removeError) {
      setError(removeError?.message || '공지를 삭제하지 못했어요.');
      setBusy(false);
    }
  };

  // 삭제는 되돌릴 수 없다 — 반드시 확인 단계를 거친다.
  if (confirmingDelete) {
    return (
      <GapConfirmSheet
        testId="notice-delete-confirm"
        under={<div style={{ height: '100%', background: RF.bg }}/>}
        title="이 공지를 삭제할까요?"
        desc={notice.content}
        lines={['삭제하면 공지 이력에서도 사라져요. 되돌릴 수 없어요.']}
        cancel="그대로 둘게요"
        confirm="공지 삭제"
        danger
        busy={busy}
        error={error}
        onCancel={() => { setConfirmingDelete(false); setError(''); }}
        onConfirm={remove}
      />
    );
  }

  return (
    <GapFrame
      testId="notice-edit"
      title="공지 수정"
      cta="수정 저장"
      disabled={!trimmed || !changed}
      busy={busy}
      error={error}
      onBack={nav.back}
      onSubmit={save}
    >
      {/* 제목 칸은 없다 — 공지는 본문만이다 (ATTACH-COMPOSER-CANON §2) */}
      <div style={{ fontSize: 12.5, fontWeight: 900, marginBottom: 8 }}>공지 내용 <span style={{ color: T.danger }}>*</span></div>
      <textarea
        data-testid="notice-edit-content"
        aria-label="공지 내용"
        value={text}
        maxLength={1000}
        onChange={(event) => setText(event.target.value)}
        style={{
          width: '100%', minHeight: 132, resize: 'none', boxSizing: 'border-box',
          borderRadius: 12, border: `1px solid ${T.line200}`, padding: 12,
          fontSize: 13, lineHeight: '20px', color: T.text900, background: RF.bg, fontFamily: T.fontStack, outline: 'none',
        }}
      />
      <div style={{ textAlign: 'right', marginTop: 6, fontSize: 11, color: T.text400, fontVariantNumeric: 'tabular-nums' }}>{text.length}/1000</div>

      <div style={{ marginTop: 10, borderTop: `1px solid ${RF.softLine}` }}>
        <GapToggleRow
          testId="notice-edit-pin"
          label="상단에 고정하기"
          desc="채팅방 맨 위에 계속 보여요."
          on={pinned}
          onToggle={() => setPinned((value) => !value)}
        />
      </div>

      <div style={{ fontSize: 11, color: T.text400, marginTop: 10, fontVariantNumeric: 'tabular-nums' }}>
        {notice.authorNickname} · {window.MoyeoApi.formatDateTime(notice.createdAt)} 작성
      </div>

      {/* 삭제는 되돌릴 수 없다 — 저장 CTA 와 멀리 떼어 놓는다 */}
      <button type="button" data-testid="notice-edit-delete" onClick={() => setConfirmingDelete(true)} style={{
        marginTop: 24, width: '100%', height: 46, borderRadius: 12, cursor: 'pointer',
        border: `1px solid ${T.line200}`, background: 'transparent', fontFamily: T.fontStack,
        color: T.danger, fontSize: 13, fontWeight: 800,
      }}>
        이 공지 삭제하기
      </button>
      <div style={{ fontSize: 11, color: T.text400, marginTop: 8, lineHeight: '16px' }}>
        삭제하면 공지 이력에서도 사라져요. 되돌릴 수 없어요.
      </div>
    </GapFrame>
  );
}

// ───────── 26-1 · 찜한 모집 ─────────
// 마이 26 의 `찜한 모집` 에서 온다.
// 모집 상세 15와 탐색 10 카드에 하트가 있는데 **모아 보는 곳이 없었다.**
// 26 의 찜한 코스는 **코스**이지 모집이 아니다 — 서로 다른 것이다.
// 근거: GET /api/v1/chat-rooms/my/favorites (SearchChatRoomResponse 배열)
//       POST /api/v1/chat-rooms/{roomId}/favorite (찜 토글)
function ScreenFavoriteRooms() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const liveMode = Boolean(window.MoyeoApi?.live());
  const [rooms, setRooms] = React.useState(null);
  const [status, setStatus] = React.useState(liveMode ? 'loading' : 'signed-out');
  const [busyId, setBusyId] = React.useState(null);
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (!liveMode) { setStatus('signed-out'); return undefined; }
    let active = true;
    setStatus('loading');
    window.MoyeoApi.favoriteRooms()
      .then((result) => {
        if (!active) return;
        if (!Array.isArray(result)) { setStatus('error'); return; }
        setRooms(result);
        setStatus('ready');
      })
      .catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [liveMode, reloadKey]);

  // 찜은 여기서도 풀 수 있어야 한다 — 목록을 정리하는 자리다.
  const unfavorite = async (roomId) => {
    if (busyId != null) return;
    setBusyId(roomId);
    try {
      await window.MoyeoApi.toggleFavorite(roomId);
      setRooms((current) => (current || []).filter((item) => item.roomId !== roomId));
    } catch (_) { /* 실패 시 목록을 그대로 둔다 */ }
    setBusyId(null);
  };

  if (status !== 'ready') {
    return <GapNotice title="찜한 모집" status={status} onBack={nav.back} onRetry={() => setReloadKey((key) => key + 1)} testId="favorite-rooms-state"/>;
  }

  return (
    <Phone>
      <div data-testid="favorite-rooms" style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="찜한 모집" left center onBack={nav.back}/>
        <div style={{ position: 'absolute', top: 92, left: 0, right: 0, bottom: 0, overflow: 'auto', padding: '14px 20px 24px' }}>
          {rooms.length === 0 && (
            <div role="status" style={{ padding: '48px 0', textAlign: 'center', color: T.text500, fontSize: 13 }}>지금 모집 중인 모임이 없어요.</div>
          )}
          <div style={{ display: 'grid', gap: 10 }}>
            {rooms.map((room) => (
              <div key={room.roomId} style={{ position: 'relative' }}>
                <window.ExploreServerRoomCard
                  room={room}
                  testId={`favorite-room-${room.roomId}`}
                  onClick={() => { window.MoyeoApi.selectRoom(room.roomId); nav.go('detail'); }}
                />
                <button
                  type="button"
                  aria-label={`${room.title} 찜 해제`}
                  data-testid={`favorite-room-off-${room.roomId}`}
                  disabled={busyId != null}
                  onClick={() => unfavorite(room.roomId)}
                  style={{ position: 'absolute', right: 12, bottom: 12, border: 0, background: 'transparent', padding: 4, cursor: 'pointer', lineHeight: 0 }}
                >
                  <Icon name="heart" size={19} color={T.primary500}/>
                </button>
              </div>
            ))}
          </div>
          {rooms.length > 0 && (
            <div style={{ fontSize: 11, color: T.text400, marginTop: 14, lineHeight: '17px' }}>
              찜한 모집이 마감되거나 여행이 끝나도 목록에는 남아요. 하트를 다시 누르면 빠져요.
            </div>
          )}
        </div>
      </div>
    </Phone>
  );
}

// ───────── 19-2 · 참가 신청 취소 확인 ─────────
// 19-1 신청중 목록의 `신청 취소` 에서 온다. 지금까지 확인 없이 바로 눌리는 자리였다 —
// 대기열 순번을 잃는 행동이라 되돌릴 수 없다.
// 근거: DELETE /api/v1/chat-rooms/{roomId}/applications/me
function ScreenApplyCancel() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const liveMode = Boolean(window.MoyeoApi?.live());
  const selected = liveMode ? window.MoyeoApi.selectedApplication() : null;
  // 19-1 을 거치지 않는 딥링크·라이브 캡처는 ?roomId= 로 대상을 지정한다.
  const [resolved, setResolved] = React.useState(null);
  const [settled, setSettled] = React.useState(false);
  const [loadFailed, setLoadFailed] = React.useState(false);
  React.useEffect(() => {
    if (!liveMode || selected?.roomId) return undefined;
    let active = true;
    window.MoyeoApi.findMyApplication(window.MoyeoApi.selectedRoomId())
      .then((found) => { if (!active) return; if (found) setResolved(found); setSettled(true); })
      .catch(() => { if (active) { setLoadFailed(true); setSettled(true); } });
    return () => { active = false; };
  }, [liveMode, selected?.roomId]);
  const target = selected?.roomId ? selected : resolved;
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  if (!target?.roomId) {
    // 대상을 찾는 중이면 로딩이다 — 잠깐이라도 오류로 보이면 사용자가 되돌아간다.
    const resolving = liveMode && !settled && Boolean(window.MoyeoApi.selectedRoomId());
    return <GapNotice title="참가 신청 취소" status={liveMode ? (resolving ? 'loading' : (loadFailed ? 'error' : 'empty')) : 'signed-out'} emptyText="신청한 모임이 없어요." onBack={nav.back} testId="apply-cancel-state"/>;
  }

  const cancel = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await window.MoyeoApi.cancelMyApplication(target.roomId);
      // 신청이 사라졌으니 19-1 목록을 다시 읽게 한다 (TAB-STATE-CANON R4).
      window.MoyeoTabCache?.invalidate?.(['meeting.waiting']);
      window.MoyeoApi.selectApplication(null);
      nav.back();
    } catch (cancelError) {
      setError(cancelError?.message || '신청을 취소하지 못했어요.');
      setBusy(false);
    }
  };

  return (
    <GapConfirmSheet
      testId="apply-cancel"
      under={<window.ScreenChatListApplied/>}
      title="참가 신청을 취소할까요?"
      desc={target.title}
      lines={[
        // 대기 순번은 서버가 준 값이 있을 때만 말한다 — 없으면 숫자를 지어내지 않는다.
        target.waitlistPosition != null
          ? `대기 순번 ${target.waitlistPosition}번이 사라져요. 다시 신청하면 맨 뒤부터예요.`
          : '다시 신청하면 맨 뒤부터예요.',
        '호스트에게는 따로 알리지 않아요.',
      ]}
      cancel="그대로 둘게요"
      confirm="신청 취소"
      danger
      busy={busy}
      error={error}
      onCancel={nav.back}
      onConfirm={cancel}
    />
  );
}

// ───────── 29-1a · 차단 해제 확인 ─────────
// 29-1 차단한 사용자의 `차단 해제` 에서 온다.
// 근거: DELETE /api/v1/users/me/blocks/{userId}
function ScreenUnblockConfirm() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const liveMode = Boolean(window.MoyeoApi?.live());
  const selected = liveMode ? window.MoyeoApi.selectedBlockedUser() : null;
  // 29-1 을 거치지 않는 딥링크·라이브 캡처는 ?blockedUserId= 로 대상을 지정한다.
  const [resolved, setResolved] = React.useState(null);
  const [settled, setSettled] = React.useState(false);
  const [loadFailed, setLoadFailed] = React.useState(false);
  React.useEffect(() => {
    if (!liveMode || selected?.userId) return undefined;
    const userId = window.MoyeoApi.selectedBlockedUserId();
    if (!userId) return undefined;
    let active = true;
    window.MoyeoApi.findBlockedUser(userId)
      .then((found) => { if (!active) return; if (found) setResolved(found); setSettled(true); })
      .catch(() => { if (active) { setLoadFailed(true); setSettled(true); } });
    return () => { active = false; };
  }, [liveMode, selected?.userId]);
  const target = selected?.userId ? selected : resolved;
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  if (!target?.userId) {
    const resolving = liveMode && !settled && Boolean(window.MoyeoApi.selectedBlockedUserId());
    return <GapNotice title="차단 해제" status={liveMode ? (resolving ? 'loading' : (loadFailed ? 'error' : 'empty')) : 'signed-out'} emptyText="차단한 사용자가 없어요." onBack={nav.back} testId="unblock-confirm-state"/>;
  }

  const unblock = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await window.MoyeoApi.unblockUser(target.userId);
      window.MoyeoApi.selectBlockedUser(null);
      nav.back();
    } catch (unblockError) {
      setError(unblockError?.message || '차단을 풀지 못했어요.');
      setBusy(false);
    }
  };

  return (
    <GapConfirmSheet
      testId="unblock-confirm"
      under={<window.ScreenBlocked/>}
      title="차단을 풀까요?"
      desc={target.nickname}
      lines={[
        '차단을 풀면 이 사람이 올린 모집과 피드가 다시 보여요.',
        '이 사람도 회원님의 모집과 피드를 볼 수 있어요.',
        '언제든 다시 차단할 수 있어요.',
      ]}
      cancel="그대로 둘게요"
      confirm="차단 해제"
      busy={busy}
      error={error}
      onCancel={nav.back}
      onConfirm={unblock}
    />
  );
}

// ───────── 27-2a · 친구 정리 (친구 끊기) ─────────
// 27-2 친구 관리 '내 친구' 행에서 온다.
// 근거: DELETE /api/v1/users/me/friends/{friendUserId}
//       (경로 변수는 friendshipId 가 아니라 상대 userId 다)
function ScreenFriendManage() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const liveMode = Boolean(window.MoyeoApi?.live());
  const selected = liveMode ? window.MoyeoApi.selectedFriend() : null;
  // 27-2 를 거치지 않는 딥링크·라이브 캡처는 ?friendUserId= 로 대상을 지정한다.
  const [resolved, setResolved] = React.useState(null);
  const [settled, setSettled] = React.useState(false);
  const [loadFailed, setLoadFailed] = React.useState(false);
  React.useEffect(() => {
    if (!liveMode || selected?.userId) return undefined;
    const userId = window.MoyeoApi.selectedFriendUserId();
    if (!userId) return undefined;
    let active = true;
    window.MoyeoApi.findFriend(userId)
      .then((found) => { if (!active) return; if (found) setResolved(found); setSettled(true); })
      .catch(() => { if (active) { setLoadFailed(true); setSettled(true); } });
    return () => { active = false; };
  }, [liveMode, selected?.userId]);
  const friend = selected?.userId ? selected : resolved;
  const [confirming, setConfirming] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  if (!friend?.userId) {
    const resolving = liveMode && !settled && Boolean(window.MoyeoApi.selectedFriendUserId());
    return <GapNotice title="친구" status={liveMode ? (resolving ? 'loading' : (loadFailed ? 'error' : 'empty')) : 'signed-out'} emptyText="아직 함께 여행한 친구가 없어요." onBack={nav.back} testId="friend-manage-state"/>;
  }

  const removeFriend = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await window.MoyeoApi.removeFriend(friend.userId);
      window.MoyeoApi.selectFriend(null);
      nav.back();
    } catch (removeError) {
      setError(removeError?.message || '친구를 끊지 못했어요.');
      setBusy(false);
    }
  };

  // 친구를 끊는 것은 되돌리기 어렵다 — 도감 카드까지 함께 사라진다.
  if (confirming) {
    return (
      <GapConfirmSheet
        testId="friend-remove-confirm"
        under={<window.ScreenFriends/>}
        title="친구를 끊을까요?"
        desc={friend.nickname}
        lines={['친구를 끊으면 서로의 도감 카드에서도 빠져요. 다시 친구가 되면 카드도 돌아와요.']}
        cancel="그대로 둘게요"
        confirm="친구 끊기"
        danger
        busy={busy}
        error={error}
        onCancel={() => { setConfirming(false); setError(''); }}
        onConfirm={removeFriend}
      />
    );
  }

  return (
    <Phone>
      <div data-testid="friend-manage" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}><window.ScreenFriends/></div>
        <div style={{ position: 'absolute', inset: 0, background: T.bgOverlay }}/>
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, background: T.bgRaised,
          borderRadius: '24px 24px 0 0', padding: '10px 20px 32px', boxShadow: T.l3,
        }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: T.line300, margin: '0 auto 14px' }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '4px 0 12px' }}>
            <ProfileAvatar src={friend.profileImageUrl} nickname={friend.nickname} size={44}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{friend.nickname}</div>
              {/* 함께 간 여행 수·친구가 된 날은 친구 목록 응답에 없다 — 지어내지 않는다 (NO-MOCK §4) */}
            </div>
          </div>
          <div style={{ height: 1, background: T.line100 }}/>

          <button type="button" data-testid="friend-manage-profile" onClick={() => { window.MoyeoApi.selectFriend(null); nav.go('public-profile', { params: { userId: friend.userId } }); }} style={{
            width: '100%', height: 54, border: 0, background: 'transparent', display: 'flex',
            alignItems: 'center', gap: 11, fontFamily: T.fontStack, cursor: 'pointer', padding: 0,
          }}>
            <Icon name="feed" size={19} color={T.text700}/>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 600, color: T.text900 }}>프로필 카드 보기</span>
            <Icon name="arrow" size={15} color={T.text400}/>
          </button>
          <div style={{ height: 1, background: T.line100 }}/>

          <button type="button" data-testid="friend-manage-remove" onClick={() => setConfirming(true)} style={{
            width: '100%', height: 54, border: 0, background: 'transparent', display: 'flex',
            alignItems: 'center', gap: 11, fontFamily: T.fontStack, cursor: 'pointer', padding: 0,
          }}>
            <Icon name="close" size={19} color={T.danger}/>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 600, color: T.danger }}>친구 끊기</span>
          </button>
          <div style={{ fontSize: 11, color: T.text400, margin: '6px 0 14px', lineHeight: '16px' }}>
            친구를 끊으면 서로의 도감 카드에서도 빠져요. 다시 친구가 되면 카드도 돌아와요.
          </div>
          <Btn variant="secondary" full onClick={() => { window.MoyeoApi.selectFriend(null); nav.back(); }}>닫기</Btn>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 13-2 · 내보내진 기록 ─────────
// 13-1 내보내기 안내에서 온다. 13-1 은 **가장 최근 한 건**만 보여주는 화면이라
// 두 번 이상 내보내졌으면 지난 사유를 다시 볼 길이 없었다.
// 근거: GET /api/v1/chat-rooms/my-kick-histories (목록)
//       ↔ GET /api/v1/notifications/{notificationId}/kick-history (단건 · 13-1 이 쓰는 것)
function ScreenKickHistory() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const liveMode = Boolean(window.MoyeoApi?.live());
  const [rows, setRows] = React.useState(null);
  const [status, setStatus] = React.useState(liveMode ? 'loading' : 'signed-out');
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (!liveMode) { setStatus('signed-out'); return undefined; }
    let active = true;
    setStatus('loading');
    window.MoyeoApi.myKickHistories()
      .then((result) => {
        if (!active) return;
        const list = Array.isArray(result) ? result : (result?.kickHistories || null);
        if (!Array.isArray(list)) { setStatus('error'); return; }
        setRows([...list].sort((a, b) => String(b?.kickedAt || '').localeCompare(String(a?.kickedAt || ''))));
        setStatus('ready');
      })
      .catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [liveMode, reloadKey]);

  if (status !== 'ready') {
    return <GapNotice title="내보내진 기록" status={status} onBack={nav.back} onRetry={() => setReloadKey((key) => key + 1)} testId="kick-history-state"/>;
  }

  return (
    <Phone>
      <div data-testid="kick-history" style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="내보내진 기록" left center onBack={nav.back}/>
        <div style={{ position: 'absolute', top: 92, left: 0, right: 0, bottom: 0, overflow: 'auto', padding: '16px 20px 24px' }}>
          {rows.length === 0 ? (
            <div role="status" style={{ fontSize: 13, color: T.text500, textAlign: 'center', marginTop: 60 }}>
              내보내진 모임이 없어요.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {rows.map((row) => (
                <div key={row.kickHistoryId} data-testid={`kick-history-${row.kickHistoryId}`} style={{ padding: 14, borderRadius: 14, background: RF.card, border: `1px solid ${RF.softLine}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Icon name="warning" size={14} color={T.danger}/>
                    <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.roomTitle}</div>
                    <span style={{ fontSize: 11, color: T.text400, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{window.MoyeoApi.formatDateTime(row.kickedAt)}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: T.text700, lineHeight: '19px', marginTop: 9 }}>{row.reason}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ fontSize: 11, color: T.text400, marginTop: 16, lineHeight: '17px' }}>
            내보낸 사유는 호스트가 직접 적은 글이에요. 부당하다고 느끼시면 고객센터로 알려주세요.
          </div>
        </div>
      </div>
    </Phone>
  );
}

Object.assign(window, {
  GapStarRating,
  GapNoteBox,
  ScreenPasswordReset,
  ScreenCourseRating,
  ScreenTripStatus,
  ScreenMeetingEdit,
  ScreenRoomNotification,
  ScreenNoticeEdit,
  ScreenFavoriteRooms,
  ScreenApplyCancel,
  ScreenUnblockConfirm,
  ScreenFriendManage,
  ScreenKickHistory,
});
