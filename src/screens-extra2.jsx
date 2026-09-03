// Feed Write (5 steps), Dex (도감), Profile Edit, Settings, Public Profile

// ───────── 문의 창구 ─────────
// 네 표면이 **같은 값**을 쓴다. 여기만 고치면 되도록 한 곳에 모은다.
//   iOS      MoyeoContact.swift
//   안드로이드 MoyeoContact.kt
//   기획      모여트립 in 경북/shared.jsx
const MOYEO_CONTACT = {
  issuesUrl: 'https://github.com/moyeoTrip/moyeoTrip-BACKEND/issues',
  email: 'konempty.dev@gmail.com',
};

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

// 24-1~24-5 가 쓰는 서버 데이터 한 벌.
//
// 예전 주석은 "다녀온 여행 조회 API 가 있어야 채울 수 있다 — 없으면 비운다"였는데
// **틀린 말이었다**. 2026-09-02 실서버로 세 개를 다 호출해 확인했다:
//   GET /chat-rooms/my                      → 내 모임 전부(ended·status 포함)
//   GET /travel-courses/chat-rooms/{roomId} → 그 방의 코스(제목·소요시간·거리·방문지 좌표)
//   GET /chat-rooms/{roomId}/companions     → 함께 간 멤버(완료한 여행만 200)
//
// ⚠️ "다녀온 여행"은 `ended && status === 'CONFIRMED'` 다 (MoyeoApi.isCompletedTrip 과 같은 규칙).
//    `ended` 만 보면 **불발(CANCELLED) 방**이 후보로 들어온다 — 안드로이드가 지금 그 상태라
//    24-1 첫 카드가 "검증용 방 0825"(CANCELLED)로 찍힌다. 따라하지 않는다.
function useFeedWriteTrip() {
  const liveMode = window.MoyeoApi?.live();
  // trips: [{ room, course, tripRoom }] — tripRoom 은 roomCourse 가 주는 일정 정보(tripType·startDate).
  const [state, setState] = React.useState({ status: liveMode ? 'loading' : 'signed-out', trips: [] });
  const [roomId, setRoomId] = React.useState(null);
  const [companions, setCompanions] = React.useState(null);

  React.useEffect(() => {
    if (!liveMode) return undefined;
    let active = true;
    setState({ status: 'loading', trips: [] });
    window.MoyeoApi.myRooms()
      .then(async (rooms) => {
        const completed = (Array.isArray(rooms) ? rooms : [])
          .filter((room) => window.MoyeoApi.isCompletedTrip(room))
          // 가장 최근에 다녀온 여행이 먼저다 (종료일이 없으면 시작일).
          .sort((a, b) => String(b.endDate || b.startDate || '').localeCompare(String(a.endDate || a.startDate || '')));
        const details = await Promise.all(completed.map((room) => window.MoyeoApi.roomCourse(room.roomId)
          .then((result) => result || null)
          .catch(() => null)));
        if (!active) return;
        const trips = completed.map((room, index) => ({
          room,
          course: details[index]?.course || null,
          tripRoom: details[index]?.room || null,
        }));
        // 앞 화면에서 고른 방이 다녀온 여행이면 그것을, 아니면 가장 최근 것을 연다.
        // 고른 방을 맨 앞에 둔다 — 뒤에 묻히면 가로 목록 밖으로 밀려 "아무것도 안 골랐다"로 보인다.
        const preferred = window.MoyeoApi.selectedRoomId();
        const picked = trips.find((trip) => String(trip.room.roomId) === String(preferred)) || trips[0] || null;
        const ordered = picked ? [picked, ...trips.filter((trip) => trip !== picked)] : trips;
        setState({ status: 'done', trips: ordered });
        setRoomId(picked ? String(picked.room.roomId) : null);
      })
      .catch(() => { if (active) setState({ status: 'error', trips: [] }); });
    return () => { active = false; };
  }, [liveMode]);

  React.useEffect(() => {
    if (!liveMode || !roomId) { setCompanions(null); return undefined; }
    let active = true;
    setCompanions(null);
    window.MoyeoApi.roomCompanions(roomId)
      .then((list) => { if (active && Array.isArray(list)) setCompanions(list); })
      // 아직 여행 전이면 409 다 — 없는 동행자를 지어내지 않고 섹션을 0명으로 둔다.
      .catch(() => {});
    return () => { active = false; };
  }, [liveMode, roomId]);

  const selected = state.trips.find((trip) => String(trip.room.roomId) === String(roomId)) || null;
  const places = selected?.course?.places || null;
  // 좌표는 서버 코스가 준 것만 쓴다. 2곳 미만이면 null 이고 호출부는 지도를 그리지 않는다(R4).
  const route = React.useMemo(
    () => (places ? window.MoyeoKakaoMap?.routeFromPlaces?.(places) : null) || null,
    [places],
  );
  return {
    status: state.status,
    trips: state.trips,
    roomId,
    select: setRoomId,
    trip: selected,
    course: selected?.course || null,
    tripRoom: selected?.tripRoom || null,
    route,
    companions,
  };
}

// "2026.08.28 · 당일치기" — 후보 카드에서 같은 코스로 떠난 여행 둘을 구분하는 줄이다.
// 서버가 안 준 값은 자리를 비운다.
function feedWriteTripMeta(trip) {
  const startDate = trip?.tripRoom?.startDate || trip?.room?.startDate || '';
  return [
    startDate ? String(startDate).replace(/-/g, '.') : null,
    trip?.tripRoom ? window.MoyeoApi.tripTypeLabel(trip.tripRoom) : null,
  ].filter(Boolean).join(' · ');
}

function FeedWriteCard({ title, children, tone = 'base' }) {
  return (
    <div style={{ background: tone === 'base' ? T.bgBase : T.bgSubtle, border: `1px solid ${T.line100}`, borderRadius: 16, padding: 14, marginBottom: 12 }}>
      {title && <div style={{ fontSize: 12, fontWeight: 800, color: T.text700, marginBottom: 10 }}>{title}</div>}
      {children}
    </div>
  );
}

// 제목·메모는 사용자가 쓰는 값이다 — 예시 후기를 미리 채우면 그대로 게시된다.
// 본문은 POST /feeds 의 request.content 로 그대로 실린다 (최대 500자).
function FeedWriteMemoCard({ value = '', onChange }) {
  return (
    <FeedWriteCard>
      <textarea
        data-testid="feed-write-memo"
        value={value}
        maxLength={500}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder="여행 어땠는지 한 줄 남겨주세요."
        style={{ width: '100%', minHeight: 66, resize: 'vertical', border: 0, outline: 'none', background: 'transparent', fontSize: 14, lineHeight: '22px', color: T.text900, fontFamily: T.fontStack, padding: 0 }}
      />
      <div style={{ fontSize: 11, color: T.text400, textAlign: 'right', marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>{value.length} / 500</div>
    </FeedWriteCard>
  );
}

// 사진은 사용자가 고른 것만 들어간다 — 자리표시자 3장을 "고른 사진"처럼 깔지 않는다.
// POST /feeds 는 images 파트를 **필수**로 받는다(1~10장) — 여기서 고른 파일이 그대로 올라간다.
function FeedWritePhotoGrid({ files = [], onAdd, onRemove }) {
  const inputRef = React.useRef(null);
  // 고른 파일의 미리보기 URL. 파일이 바뀔 때마다 만들고, 떠날 때 반드시 되돌려준다(누수 방지).
  const previews = React.useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  React.useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);
  const full = files.length >= 10;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
      {files.map((file, index) => (
        <div key={`${file.name}-${file.lastModified}-${index}`} style={{ position: 'relative', height: 110, borderRadius: 12, overflow: 'hidden', background: T.bgSubtle }}>
          <img src={previews[index]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          <button
            type="button"
            aria-label={`사진 ${index + 1} 삭제`}
            data-testid={`feed-write-photo-remove-${index}`}
            onClick={() => onRemove?.(index)}
            style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 999, border: 0, background: 'rgba(0,0,0,0.55)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
          >
            <Icon name="close" size={13} color="#fff"/>
          </button>
        </div>
      ))}
      {!full && (
        <button
          type="button"
          data-testid="feed-write-photo-add"
          onClick={() => inputRef.current?.click()}
          style={{ height: 110, borderRadius: 12, border: `1.5px dashed ${T.line200}`, background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: T.text500, fontFamily: T.fontStack, cursor: 'pointer' }}
        >
          <Icon name="plus" size={18} color={T.text500}/>
          <div style={{ fontSize: 11 }}>사진 추가</div>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        data-testid="feed-write-photo-input"
        onChange={(event) => {
          onAdd?.(Array.from(event.target.files || []));
          // 같은 파일을 다시 고를 수 있게 비운다.
          event.target.value = '';
        }}
        style={{ display: 'none' }}
      />
    </div>
  );
}

// 경로 지도는 코스 좌표가 있어야 그린다 — 좌표가 2곳 미만이면 카드를 아예 두지 않는다(R4).
// 좌표 문자열을 화면에 적지 않는다: 기획에 없고, 사용자에게 아무 의미가 없다.
function FeedWriteRouteCard({ course, route }) {
  if (!route) return null;
  const caption = [
    `방문지 ${(course?.places || []).length}곳`,
    course?.distanceKm != null ? `${course.distanceKm}km` : null,
  ].filter(Boolean).join(' · ');
  return (
    <FeedWriteCard title="경로 (자동)" tone="subtle">
      <div style={{ borderRadius: 12, overflow: 'hidden' }}>
        <MiniMap height={140} markers={route.markers} polyline={route.polyline}/>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 11, color: T.text500 }}>
        <Icon name="pin" size={12} color={T.primary600}/>
        <span>{caption}</span>
      </div>
    </FeedWriteCard>
  );
}

// 함께 간 멤버는 GET /chat-rooms/{roomId}/companions 가 근거다.
// 0명이면 (0) 으로 둔다 — 혼자 다녀온 여행이 실제로 있다(방 101). 예시 멤버를 지어내지 않는다.
function FeedWriteMembersCard({ companions }) {
  if (!Array.isArray(companions)) return null;
  return (
    <FeedWriteCard title={`함께 간 멤버 (${companions.length})`}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {companions.map((mate) => (
          <div key={mate.userId} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px 6px 6px', borderRadius: 999, background: T.bgSubtle }}>
            {mate.profileImageUrl
              ? <img src={mate.profileImageUrl} alt="" style={{ width: 24, height: 24, borderRadius: 999, objectFit: 'cover', background: T.primary50 }}/>
              : <span style={{ width: 24, height: 24, borderRadius: 999, background: T.primary50, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user" size={13} color={T.primary600}/></span>}
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text700 }}>{mate.nickname}</div>
          </div>
        ))}
      </div>
    </FeedWriteCard>
  );
}

// 기록할 코스 후보 = 내가 **다녀온 여행**(ended · CONFIRMED)과 그 방에 붙은 코스다.
function FeedWriteCourseCards({ status, trips, roomId, onSelect }) {
  const notice = {
    'signed-out': '로그인하면 모집 중인 모임을 볼 수 있어요.',
    loading: '불러오는 중이에요…',
    error: '불러오지 못했어요.',
    done: trips.length ? null : '아직 다녀온 여행 기록이 없어요.',
  }[status];
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: T.text900, marginBottom: 10 }}>기록할 코스</div>
      {notice && <div role="status" data-testid="feed-write-course-empty" style={{ fontSize: 12, color: T.text500 }}>{notice}</div>}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none' }}>
        {trips.map((trip) => {
          const on = String(trip.room.roomId) === String(roomId);
          return (
            <div
              key={trip.room.roomId}
              data-testid={`feed-write-trip-${trip.room.roomId}`}
              onClick={() => onSelect(String(trip.room.roomId))}
              style={{
                width: 168, flexShrink: 0, padding: 10, borderRadius: 16, cursor: 'pointer',
                background: on ? T.primary50 : T.bgBase,
                border: `1px solid ${on ? T.primary500 : T.line100}`,
              }}>
              <div style={{ borderRadius: 10, overflow: 'hidden' }}>
                <RoomThumb src={trip.course?.thumbnail || trip.room.thumbnail} height={66}/>
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, marginTop: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.course?.title || trip.room.title}</div>
              <div style={{ fontSize: 11, color: T.text500, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{feedWriteTripMeta(trip)}</div>
              <div style={{
                marginTop: 8, height: 24, borderRadius: 999, display: 'inline-flex', alignItems: 'center', padding: '0 10px',
                background: on ? T.primary500 : T.primary50, color: on ? '#fff' : T.primary700,
                fontSize: 11, fontWeight: 800,
              }}>{on ? '선택됨' : '이 코스로 기록'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 24-4 · 24-5 요약 카드. 코스·일정은 고른 여행의 서버 코스에서 온다 — 예시 값을 적지 않는다(§4).
function FeedWriteMetaCard({ course, route, companions }) {
  const schedule = [
    course?.travelTime || null,
    course?.distanceKm != null ? `${course.distanceKm}km` : null,
  ].filter(Boolean).join(' · ');
  const rows = [
    course?.title ? ['map', '코스', course.title] : null,
    schedule ? ['pin', '일정', schedule] : null,
    ['eye', '공개', route ? '친구만 · 경로지도 포함' : '친구만'],
  ].filter(Boolean);
  // 태그는 공개 설정(실제 화면 상태)과 고른 코스의 서버 태그만 쓴다.
  const tags = ['친구만', route ? '경로지도' : null, ...(course?.tags || []).map((tag) => tag.name)].filter(Boolean);
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
        {/* 함께한 멤버 수는 companions 응답이 근거다 — 못 받았으면 줄을 두지 않는다. */}
        {Array.isArray(companions) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
            <Icon name="users" size={15} color={T.text500}/>
            <span style={{ width: 40, color: T.text500, flexShrink: 0 }}>멤버</span>
            <span style={{ flex: 1, fontWeight: 800 }}>함께한 멤버 {companions.length}명</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {tags.map((tag) => (
            <span key={tag} style={{ height: 26, padding: '0 10px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', background: T.primary50, color: T.primary700, fontSize: 11, fontWeight: 800 }}>{tag}</span>
          ))}
        </div>
      </div>
    </FeedWriteCard>
  );
}

// 공개 범위는 POST /feeds 의 request.visibility 로 실린다 (PUBLIC · FRIENDS · PRIVATE).
const FEED_VISIBILITY_OPTIONS = [
  { id: 'PUBLIC', label: '전체공개', hint: '모여트립을 쓰는 누구나 볼 수 있어요.' },
  { id: 'FRIENDS', label: '친구만', hint: '서로 친구인 사람에게만 보여요. 기본값이에요.' },
  { id: 'PRIVATE', label: '나만 보기', hint: '나만 볼 수 있어요. 나중에 공개로 바꿀 수 있어요.' },
];

function FeedWriteVisibilityCard({ value = 'FRIENDS', onChange }) {
  const selected = FEED_VISIBILITY_OPTIONS.find((o) => o.id === value) || FEED_VISIBILITY_OPTIONS[1];
  return (
    <FeedWriteCard title="공개 범위">
      <div style={{ display: 'flex', gap: 8 }}>
        {FEED_VISIBILITY_OPTIONS.map((o) => {
          const on = o.id === selected.id;
          return (
            <button
              key={o.id}
              type="button"
              data-testid={`feed-write-visibility-${o.id}`}
              aria-pressed={on}
              onClick={() => onChange?.(o.id)}
              style={{
                height: 34, padding: '0 12px', borderRadius: 999, border: 0, cursor: 'pointer',
                background: on ? T.primary500 : T.primary50,
                color: on ? '#fff' : T.primary700,
                fontSize: 12, fontWeight: 800, fontFamily: T.fontStack,
              }}
            >{o.label}</button>
          );
        })}
      </div>
      <div style={{ fontSize: 11.5, color: T.text500, marginTop: 10, lineHeight: '17px' }}>{selected.hint}</div>
    </FeedWriteCard>
  );
}

// 24-1 ~ 24-5 는 각각 라우트가 따로 있어서(feed-write-1 … feed-write-5) 단계마다 화면이 새로 뜬다.
// 본문·사진·공개 범위는 그래서 컴포넌트 state 가 아니라 MoyeoApi 초안(메모리)에 쌓는다.
const FEED_WRITE_ROUTES = ['feed-write-1', 'feed-write-2', 'feed-write-3', 'feed-write-4', 'feed-write-5'];

function ScreenFeedWrite({ step = 3 }) {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  const meta = FEED_WRITE_STEPS[Math.min(Math.max(step, 1), 5) - 1];
  const isLast = meta.step === 5;
  const feed = useFeedWriteTrip();

  // 초안을 화면 상태로 끌어와 입력이 바로 보이게 하고, 바뀔 때마다 초안에도 남긴다.
  const liveMode = Boolean(window.MoyeoApi?.live());
  const [draft, setDraft] = React.useState(() => (window.MoyeoApi?.feedDraft?.() || {}));
  const patchDraft = (patch) => setDraft(window.MoyeoApi.updateFeedDraft(patch));
  const content = draft.content || '';
  const visibility = draft.visibility || 'FRIENDS';
  const photos = draft.images || [];

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  // 사진은 서버가 1~10장만 받는다. 10장을 넘겨 고르면 넘치는 만큼은 담지 않고 그 이유를 말해준다.
  const addPhotos = (files) => {
    const room = 10 - photos.length;
    if (room <= 0) { setError('사진은 최대 10장까지 올릴 수 있어요.'); return; }
    const images = files.filter((file) => file.type.startsWith('image/'));
    setError(images.length > room ? '사진은 최대 10장까지 올릴 수 있어요.' : '');
    patchDraft({ images: [...photos, ...images.slice(0, room)] });
  };
  const removePhoto = (index) => {
    setError('');
    patchDraft({ images: photos.filter((_, i) => i !== index) });
  };

  // 게시 조건: 기록할 완료 여행(chatRoomId)과 사진 1장 이상. 둘 다 서버가 요구하는 값이다.
  const roomId = feed.roomId;
  const canPublish = Boolean(liveMode && roomId && photos.length > 0);

  const goStep = (next) => {
    if (next < 1 || next > 5) return;
    nav.go(FEED_WRITE_ROUTES[next - 1]);
  };

  const publish = async () => {
    if (submitting) return;
    if (!canPublish) {
      // 왜 못 누르는지 말해준다 — 조용히 아무 일도 안 하면 고친 게 아니다.
      setError(!roomId ? '기록할 여행을 먼저 골라주세요.' : '사진을 한 장 이상 골라주세요.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const created = await window.MoyeoApi.createFeed({
        chatRoomId: Number(roomId),
        content: content.trim(),
        visibility,
      }, photos);
      // TAB-STATE-CANON R4: 피드 목록이 바뀌었다 — 다음 진입에서 한 번만 다시 받게 한다.
      window.MoyeoTabCache?.invalidate?.(window.MoyeoTabCache.FEED_LIST_KEYS);
      window.MoyeoApi.clearFeedDraft();
      const feedId = created?.feedId;
      if (feedId != null) window.MoyeoApi.selectFeed?.(feedId);
      nav.go('feed');
    } catch (failure) {
      setError(failure?.message || '피드를 올리지 못했어요.');
      setSubmitting(false);
    }
  };

  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 60, background: T.bgSubtle }}>
        <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.bgBase }}>
          <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><Icon name="close" size={24}/></div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>피드 글쓰기</div>
          {/* 마지막 단계에서만 누를 수 있는 헤더 `게시` — 하단 `게시하기` 와 같은 일을 한다. */}
          {isLast
            ? <button type="button" data-testid="feed-write-publish-header" disabled={submitting} onClick={publish} style={{ border: 0, background: 'transparent', padding: 0, fontSize: 13, color: T.primary600, fontWeight: 700, fontFamily: T.fontStack, cursor: submitting ? 'default' : 'pointer' }}>게시</button>
            : <span style={{ fontSize: 13, color: T.text400, fontWeight: 700 }}>게시</span>}
        </div>
        <div style={{ padding: '8px 20px 16px', background: T.bgBase, display: 'flex', gap: 6, borderBottom: `1px solid ${T.line100}` }}>
          {[1, 2, 3, 4, 5].map((i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= meta.step ? T.primary500 : T.line100 }}/>)}
        </div>
        <div style={{ position: 'absolute', top: 132, left: 0, right: 0, bottom: 92, overflow: 'auto', padding: '20px 20px 8px' }}>
          <div style={{ fontSize: 11, color: T.text500, marginBottom: 4, fontWeight: 700, letterSpacing: 0.5 }}>{meta.label}</div>
          <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.3, marginBottom: 4, letterSpacing: '-0.5px' }}>{meta.title}</div>
          <div style={{ fontSize: 13, color: T.text500, marginBottom: 16 }}>{meta.helper}</div>

          {meta.step === 1 && (
            <>
              <FeedWriteCourseCards status={feed.status} trips={feed.trips} roomId={feed.roomId} onSelect={feed.select}/>
              <FeedWriteRouteCard course={feed.course} route={feed.route}/>
              <FeedWriteMembersCard companions={feed.companions}/>
            </>
          )}
          {meta.step === 2 && <><FeedWritePhotoGrid files={photos} onAdd={addPhotos} onRemove={removePhoto}/><FeedWriteRouteCard course={feed.course} route={feed.route}/></>}
          {meta.step === 3 && <><FeedWriteMemoCard value={content} onChange={(value) => patchDraft({ content: value })}/><FeedWritePhotoGrid files={photos} onAdd={addPhotos} onRemove={removePhoto}/></>}
          {meta.step === 4 && <><FeedWriteVisibilityCard value={visibility} onChange={(value) => patchDraft({ visibility: value })}/><FeedWriteMetaCard course={feed.course} route={feed.route} companions={feed.companions}/></>}
          {meta.step === 5 && (
            <>
              <FeedWriteMemoCard value={content} onChange={(value) => patchDraft({ content: value })}/>
              <FeedWritePhotoGrid files={photos} onAdd={addPhotos} onRemove={removePhoto}/>
              <FeedWriteRouteCard course={feed.course} route={feed.route}/>
              <FeedWriteMetaCard course={feed.course} route={feed.route} companions={feed.companions}/>
            </>
          )}
          {error && <div role="alert" style={{ fontSize: 12, color: T.danger, marginTop: 4 }}>{error}</div>}
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 20px 32px', background: T.bgBase, borderTop: `1px solid ${T.line100}`, display: 'flex', gap: 8 }}>
          {/* 1단계에서는 앞 단계가 없다 — 글쓰기를 닫는다(헤더 X 와 같은 일). */}
          <Btn variant="ghost" disabled={submitting} onClick={() => (meta.step === 1 ? nav.back() : goStep(meta.step - 1))} testId="feed-write-prev">이전</Btn>
          <div style={{ flex: 1 }}>
            <Btn variant="primary" full disabled={submitting} onClick={() => (isLast ? publish() : goStep(meta.step + 1))} testId="feed-write-next">
              {isLast ? (submitting ? '올리는 중...' : '게시하기') : `다음 (${meta.step + 1}/5)`}
            </Btn>
          </div>
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
  // 도감은 서버 동행 기록에서만 온다 — 예시 친구 12마리를 그리지 않는다.
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 46, background: T.bgSubtle }}>
        <Header title="친구 도감" left center onBack={nav.back}/>
        <div role="status" style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13, lineHeight: '21px' }}>
          로그인하면 모집 중인 모임을 볼 수 있어요.
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
      .catch(() => { /* 실패하면 프로필 칸을 비워 둔다 — 예시 프로필로 채우지 않는다 */ });
    return () => { active = false; };
  }, [liveMode]);
  const genderLabel = profile ? ({ M: '남성', F: '여성', N: '선택 안 함' }[profile.gender] || profile.gender) : '';
  // 프로필 이미지가 없으면 닉네임의 동물을 따른다 — 화면마다 동물을 고정하지 않는다(R5).
  const avatar = window.MoyeoApi?.avatarForNickname?.(profile?.nickname);
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
            {profile?.profileImageUrl
              ? <img src={profile.profileImageUrl} alt="" style={{ width: 96, height: 96, borderRadius: 999, objectFit: 'cover', background: T.primary100 }}/>
              : avatar?.kind
                ? <AnimalAvatar kind={avatar.kind} size={96} bg={T.primary100}/>
                : avatar?.emoji
                  ? <span aria-hidden="true" style={{ width: 96, height: 96, borderRadius: 999, background: T.primary100, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 54, lineHeight: 1 }}>{avatar.emoji}</span>
                  : <span style={{ width: 96, height: 96, borderRadius: 999, background: T.primary100, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user" size={44} color={T.primary600}/></span>}
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 999, background: T.line200, border: `2px solid ${T.bgBase}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="lock" size={12} color={T.text500}/>
            </div>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 12 }}>{profile?.nickname || ''}</div>
          <div style={{ fontSize: 11, color: T.text500, marginTop: 4 }}>한 번 정한 친구는 바꿀 수 없어요</div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: T.text500, padding: '20px 20px 8px', letterSpacing: 0.5 }}>공개 프로필</div>
        <div style={{ background: T.bgBase }}>
          <Row label="자기소개" value={profile?.introduction || ''}/>
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
              {(profile?.travelStyles || []).map((style) => <Chip key={style.label} variant="primary" size="sm">{style.label}</Chip>)}
              <Chip variant="neutral" size="sm">+ 추가</Chip>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.text500, marginBottom: 6 }}>관심 지역</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(profile?.interestedRegions || []).map((region) => <Chip key={region.signguName} variant="primary" size="sm">{region.signguName}</Chip>)}
              <Chip variant="neutral" size="sm">+ 추가</Chip>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: T.text500, padding: '20px 20px 8px', letterSpacing: 0.5 }}>비공개 정보</div>
        <div style={{ background: T.bgBase }}>
          <Row label="닉네임" value={profile?.nickname || ''} locked/>
          <Row label="캐릭터" value="고정됨" locked/>
          {birthLabel && <Row label="생년월일" value={birthLabel}/>}
          {genderLabel && <Row label="성별" value={genderLabel}/>}
        </div>
      </div>
  );
}

// ───────── 28-1 · 여행 취향 편집 Bottom Sheet ─────────
// 28의 여행 취향 블록(칩·+ 추가)을 탭하면 열린다. 선택 규칙도 후보의 출처도 가입 06-1과 같다 —
// 둘 다 GET /users/me/profile/options 만 쓴다(2026-08-30부터 이 API 는 토큰 없이도 200이라
// 가입 전 화면도 같은 곳에서 받는다). 거울 표는 세 플랫폼 모두에서 지웠다.
// 스타일과 관심 지역을 언제나 한 시트에서 함께 편집한다. 각 1개 이상일 때만 저장이 활성화된다.
// 바텀시트 프레임(딤 배경 + 상단 라운드 24 + 핸들 바)은 신고 시트(30-2)와 같은 관례를 따른다.
function ScreenProfileTasteEdit() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  // 후보는 GET users/me/profile/options, 현재 선택은 GET users/me/profile,
  // 저장은 PUT users/me/profile 이다. 하드코딩 후보 표는 없다 —
  // 서버가 목록을 바꾸면 이 화면도 06-1도 바로 따라간다.
  const [serverOptions, setServerOptions] = React.useState(null);
  const [serverProfile, setServerProfile] = React.useState(null);
  const [styleIds, setStyleIds] = React.useState([]);
  const [regionIds, setRegionIds] = React.useState([]);
  const [status, setStatus] = React.useState('loading');
  const [reloadKey, setReloadKey] = React.useState(0);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState('');
  React.useEffect(() => {
    let active = true;
    setStatus('loading');
    Promise.resolve()
      .then(() => Promise.all([window.MoyeoApi.profileOptions(), window.MoyeoApi.myProfile()]))
      .then(([optionsResult, profileResult]) => {
        if (!active) return;
        if (!Array.isArray(optionsResult?.travelStyles)) { setStatus('error'); return; }
        setServerOptions(optionsResult);
        setServerProfile(profileResult);
        setStyleIds((profileResult?.travelStyles || []).map((style) => style.id));
        setRegionIds((profileResult?.interestedRegions || []).map((region) => region.id));
        setStatus('ready');
      })
      // 후보를 받지 못하면 임의의 후보를 그리지 않는다 — 고르는 순간 서버에 없는 id 를 보내게 된다.
      .catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [reloadKey]);
  const serverMode = status === 'ready' && Boolean(serverOptions && serverProfile);
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
  const canSave = serverMode && styleIds.length > 0 && regionIds.length > 0 && !saving;
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
            {serverMode && serverOptions.travelStyles.map((style) => chip(style.label, styleIds.includes(style.id), () => toggleId(styleIds, setStyleIds, style.id), "taste-edit-style-" + style.label))}
          </div>

          <div style={{ fontSize: 13, fontWeight: 500, color: T.text700, margin: '18px 0 10px' }}>관심 지역 <span style={{ color: T.danger }}>*</span> <span style={{ color: T.text500, fontWeight: 400 }}>· 경북 안에서 1곳 이상</span></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 132, overflow: 'auto' }}>
            {serverMode && serverOptions.interestedRegions.map((region) => chip(region.signguName, regionIds.includes(region.id), () => toggleId(regionIds, setRegionIds, region.id), "taste-edit-region-" + region.signguName))}
          </div>

          <div role="status" style={{ fontSize: 12, color: T.text500, textAlign: 'center', margin: '18px 0 12px' }}>
            {status === 'loading' && '불러오는 중이에요…'}
            {status === 'error' && (
              <>불러오지 못했어요. <button type="button" data-testid="taste-edit-retry" onClick={() => setReloadKey((key) => key + 1)} style={{ padding: 0, border: 0, background: 'transparent', color: T.primary600, fontFamily: T.fontStack, fontSize: 12, fontWeight: 900, textDecoration: 'underline', cursor: 'pointer' }}>다시 시도</button></>
            )}
            {serverMode && `여행 스타일 ${styleIds.length}개 · 관심 지역 ${regionIds.length}곳 선택`}
          </div>
          {saveError && <div role="alert" style={{ fontSize: 12, color: T.danger, textAlign: 'center', marginBottom: 10 }}>{saveError}</div>}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="button" data-testid="taste-edit-cancel" onClick={() => nav.back()} style={{ width: 72, height: 52, border: 0, background: 'transparent', fontSize: 14, fontWeight: 600, color: T.text700, fontFamily: T.fontStack, cursor: 'pointer' }}>취소</button>
            <div style={{ flex: 1 }}><Btn variant="primary" full disabled={!canSave} onClick={saveServer} testId="taste-edit-save">{saving ? '저장 중...' : '저장'}</Btn></div>
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
  const [themePreference, setThemePreference] = React.useState(() => window.getMoyeoThemePreference?.() || 'system');
  React.useEffect(() => {
    const sync = (event) => setThemePreference(event.detail?.preference || window.getMoyeoThemePreference?.() || 'system');
    window.addEventListener('moyeo:theme-mode', sync);
    return () => window.removeEventListener('moyeo:theme-mode', sync);
  }, []);
  const themeLabels = window.MOYEO_THEME_PREFERENCE_LABELS || { system: '시스템 기본', light: '라이트', dark: '다크' };
  // 캡처에서도 실제 저장된 테마 설정을 보여준다 — 값을 '시스템 기본' 으로 고정하지 않는다.
  const themeValue = themeLabels[themePreference] || '시스템 기본';
  const cycleTheme = () => setThemePreference(window.cycleMoyeoThemeMode?.(themePreference) || 'system');

  // ── 정보 섹션 안내 다이얼로그 ──
  // 문구는 Android(MyMenuScreens.kt)·iOS(MyView.swift)와 같은 값을 쓴다. 새 문구를 만들지 않는다.
  // 버전 본문은 근거 없는 '최신 상태' 주장을 빼고 실제 설치된 버전을 알려준다.
  const [infoDialog, setInfoDialog] = React.useState(null);
  const infoDialogs = {
    version: { title: '앱 버전', body: window.MoyeoAppVersion?.dialogBody() },
    // 문의는 **두 갈래**다 — 버그·기능 제안은 GitHub 이슈, 그 밖은 이메일.
    // 예전 문구는 "고객센터로 이어져요" 였는데 고객센터는 존재하지 않는 개념이다.
    contact: {
      title: '문의하기',
      body: '버그 제보나 기능 제안은 GitHub 이슈로, 그 밖의 문의는 이메일로 보내주세요.',
      links: [
        { label: 'GitHub 이슈로 문의', href: MOYEO_CONTACT.issuesUrl, testId: 'settings-contact-issues' },
        { label: '이메일로 문의', href: `mailto:${MOYEO_CONTACT.email}`, testId: 'settings-contact-email' },
      ],
    },
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
          <Row label="테마" value={themeValue} onClick={cycleTheme} testId="settings-theme"/>
          <Row label="언어" value="한국어"/>
        </Section>

        <Section title="계정">
          <Row label="로그인 방식" value="관리" onClick={() => nav.go('auth-methods')} testId="settings-auth-methods"/>
          <Row label="차단한 사용자" value="관리" onClick={() => nav.go('blocked')} testId="settings-blocked"/>
          <Row label="개인정보 처리방침" onClick={() => nav.go('privacy-settings')} testId="settings-privacy"/>
          <Row label="이용약관" onClick={() => nav.go('terms-settings')} testId="settings-terms"/>
        </Section>

        <Section title="정보">
          {/* 실제 빌드 버전을 보여준다. 최신 버전을 알려주는 서버 API가 없어 '(최신)' 은 붙이지 않는다. */}
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
              {infoDialogSpec.links && (
                <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
                  {infoDialogSpec.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                      rel="noreferrer"
                      data-testid={link.testId}
                      style={{
                        height: 44, borderRadius: 12, border: `1px solid ${T.line200}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13.5, fontWeight: 800, color: T.text900, textDecoration: 'none',
                      }}
                    >{link.label}</a>
                  ))}
                </div>
              )}
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
      // 취소(R1·R2)와 리다이렉트는 아직 아무 일도 일어나지 않은 상태다 — 목록을 그대로 둔다.
      if (!result?.redirecting && !result?.cancelled) setProviders(result.providers || providers);
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
          {/* 29-5 계정 연결. 안드로이드 MyMenuScreens · iOS MyView 와 **글자 그대로** 같은 문구를 쓴다
              (ATTACH-COMPOSER-CANON §6-1 — 웹만 다른 문장을 쓰고 있었다). */}
          <p style={{ margin: '0 2px 18px', color: T.text500, fontSize: 13, lineHeight: 1.55 }}>어느 방법으로든 같은 계정으로 들어와요. 하나를 더 연결해두면 한쪽을 못 쓰게 돼도 들어올 수 있어요.</p>
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
          {/* 마지막 하나는 끊을 수 없다 — 끊으면 아무 방법으로도 못 들어온다.
              (서버에 연결 해제 API 자체가 없다 — GET·POST /auth/providers 뿐이다.) */}
          <div style={{ marginTop: 16, borderRadius: 12, background: T.bgSubtle, padding: 14 }}>
            <div style={{ fontSize: 11.5, color: T.text700, lineHeight: '17px' }}>
              마지막 하나 남은 로그인 방식은 끊을 수 없어요. 계정을 아예 지우려면 설정에서 탈퇴해 주세요.
            </div>
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
  // 받아오는 중과 실패를 구분한다. 하나로 묶어 두면 **적재 중에 「불러오지 못했어요」**
  // 가 뜨고, 캡처가 그 순간을 찍으면 성한 화면이 실패로 기록된다.
  const [status, setStatus] = React.useState('loading');
  const [reloadKey, setReloadKey] = React.useState(0);
  React.useEffect(() => {
    if (!liveMode || !userId) { setStatus('no-target'); return undefined; }
    let active = true;
    setStatus('loading');
    window.MoyeoApi.publicProfile(userId)
      .then((r) => {
        if (!active) return;
        if (r?.nickname) { setProfile(r); setStatus('ready'); }
        else setStatus('failed');
      })
      .catch(() => { if (active) setStatus('failed'); });
    // 평가는 없어도 카드를 그린다 — 실패로 보지 않는다.
    window.MoyeoApi.receivedTravelReviews(userId)
      .then((r) => { if (active && Array.isArray(r)) setReviews(r); })
      .catch(() => {});
    return () => { active = false; };
  }, [liveMode, userId, reloadKey]);

  // 25 에서 할 수 있는 행동은 친구 신청뿐이다 (POST users/me/friend-requests/{userId}).
  // 20-1a ScreenMemberActions 와 같은 API·같은 상태 전이·같은 실패 문구를 쓴다 —
  // 두 화면이 다르게 동작하면 그게 결함이다.
  // 자기에게 친구 신청을 걸 수는 없다 — 내 카드에서는 그 버튼을 그리지 않는다.
  const isMe = userId != null
    && String(userId) === String(window.MoyeoApi?.myUserId?.() ?? '');
  const [requestState, setRequestState] = React.useState('idle');
  const [requestError, setRequestError] = React.useState('');
  const sendFriendRequest = async () => {
    if (!userId || requestState !== 'idle') return;
    setRequestState('sending');
    setRequestError('');
    try {
      await window.MoyeoApi.sendFriendRequest(userId);
      setRequestState('sent');
    } catch (error) {
      setRequestState('idle');
      setRequestError(error?.message || '친구 요청을 보내지 못했어요.');
    }
  };

  // 프로필 카드는 서버 값만 쓴다 — 못 받으면 카드를 그리지 않는다.
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
    completedTripCount: undefined, feedCount: undefined,
    tripCount: dex?.tripCount ?? null,
    latestTripTitle: dex?.latestTripTitle || null,
    latestTripDate: dex?.latestTripDate || null,
    memories: dex?.memories || [],
    receivedReviews: reviews.map((r) => ({
      reviewerNickname: r.reviewerNickname,
      reviewerNicknameColor: r.reviewerNicknameColor,
      content: r.content,
    })),
  } : null;

  const pal = userCardPalette(subject?.nicknameColor);

  // 매너 점수는 스트립에 넣지 않는다. 단위가 다르고(점 vs 회), 실제로 매너만 내려오는
  // 진입점(도감·동행자)에서는 한 칸짜리 전체폭 스트립이 남아 어색했다.
  const stats = subject ? [
    subject.completedTripCount != null && ['여행', `${subject.completedTripCount}`],
    subject.feedCount != null && ['피드', `${subject.feedCount}`],
  ].filter(Boolean) : [];

  const REST = { rx: 0, ry: 0, x: 0.5, y: 0.5, scale: 1, shine: 0.62, lift: 0 };
  const [tilt, setTilt] = React.useState({ ...REST, phase: 'rest' });
  const enterTimer = React.useRef(null);
  // 뒤집힘을 **부호 있는 반회전 수**로 센다 — 부호가 방향이다.
  // `Bool` 이던 동안에는 어느 쪽으로 밀어도 늘 같은 방향으로 돌았다.
  const [flipTurns, setFlipTurns] = React.useState(initialFlipped ? 1 : 0);
  const flipped = Math.abs(flipTurns) % 2 === 1;
  const cardRef = React.useRef(null);
  const swipeStart = React.useRef(null);

  const onSwipeStart = (x, y) => { swipeStart.current = { x, y }; };
  const onSwipeEnd = (x, y) => {
    const s0 = swipeStart.current;
    swipeStart.current = null;
    if (!s0) return;
    const dx = x - s0.x;
    const dy = y - s0.y;
    // 스와이프한 방향으로 돈다 — 왼쪽으로 밀면 왼쪽으로 넘어간다.
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) setFlipTurns((v) => v + (dx < 0 ? -1 : 1));
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
    // 값을 지어내지 않고 비워 둔다. 다만 **받아오는 중과 실패를 다르게 말한다** —
    // 적재 중에 "못했어요" 라고 하면 성한 화면이 실패로 읽힌다(캡처도 그렇게 찍힌다).
    return (
      <Phone>
        <div style={{ position: 'absolute', inset: 0, paddingTop: 46, background: T.bgSubtle, display: 'flex', flexDirection: 'column' }}>
          <Header title="프로필" left center onBack={nav.back}/>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: T.text500, textAlign: 'center', padding: '0 24px' }}>
            {status === 'loading' && '불러오는 중이에요…'}
            {status === 'no-target' && '불러오지 못했어요.'}
            {status === 'failed' && (
              <span>
                불러오지 못했어요.{' '}
                <button
                  type="button"
                  onClick={() => setReloadKey((k) => k + 1)}
                  style={{ padding: 0, border: 0, background: 'transparent', color: T.primary600, fontFamily: T.fontStack, fontSize: 13, fontWeight: 900, textDecoration: 'underline', cursor: 'pointer' }}
                >
                  다시 시도
                </button>
              </span>
            )}
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
              transform: `rotateY(${flipTurns * 180}deg)`,
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

                  {/* 뒷면에 볼 것이 하나라도 있을 때만 안내한다 — 매너 점수만 있어도 볼 것이 있다. */}
                  {(subject.mannerRating != null || subject.memories.length > 0 || subject.receivedReviews.length > 0) && (
                    <div style={{
                      marginTop: 2, paddingTop: 8, borderTop: `1px solid ${RF.softLine}`,
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: 10, fontWeight: 800, color: T.text500,
                    }}>
                      {/* 캡처에서는 끈다 — 움직이는 중간을 찍으면 같은 아트보드가 회차마다 달라진다. */}
                      <span
                        data-swipe-hint
                        style={{
                          display: 'inline-flex',
                          animation: new URLSearchParams(window.location.search).get('capture') === '1'
                            ? 'none'
                            : 'mt-swipe-hint 0.62s ease-in-out 2',
                        }}
                      >
                        <Icon name="arrow" size={12} color={T.text400}/>
                      </span>
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

                  {/* 평가 칸은 **0건이어도 그린다** — 제목만 남고 아래가 비면 고장으로 읽힌다.
                      뒷면에 다른 내용이 하나라도 있을 때만이다.
                      도감의 oneLineReview 는 "내가 남긴" 값이라 여기 섞으면 안 된다. */}
                  {(subject.receivedReviews.length > 0
                    || subject.mannerRating != null
                    || subject.memories.length > 0) && (
                    <div style={{ paddingTop: 9, borderTop: `1px solid ${RF.softLine}` }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: T.text500, marginBottom: 6 }}>
                        다른 여행자들이 남긴 평가
                      </div>
                      {subject.receivedReviews.length === 0 && (
                        <div
                          data-testid="profile-back-no-reviews"
                          style={{ fontSize: 10.5, lineHeight: '15px', fontWeight: 600, color: T.text500, marginBottom: 8, whiteSpace: 'pre-line' }}
                        >
                          {'아직 받은 한줄평이 없어요.\n함께 여행하면 서로 한줄평을 남길 수 있어요.'}
                        </div>
                      )}
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
                  {/* 매너 점수도 함께한 여행도 평가도 없으면 뒷면이 통째로 비어 있었다 —
                      뒤집어 봤는데 아무것도 없으면 고장으로 읽힌다. */}
                  {subject.mannerRating == null
                    && subject.memories.length === 0
                    && subject.receivedReviews.length === 0 && (
                    <div
                      data-testid="profile-back-empty"
                      style={{
                        fontSize: 11, lineHeight: '16px', fontWeight: 600, color: T.text500,
                        textAlign: 'center', whiteSpace: 'pre-line',
                        // 한 줄이 위에 붙어 있으면 카드가 여전히 비어 보인다 — 남은 자리 가운데 놓는다.
                        minHeight: 190, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {'아직 함께한 여행과 평가가 없어요.\n함께 여행하면 기록과 한줄평이 여기 쌓여요.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 스와이프로도 뒤집히지만, 뒤집을 수 있다는 걸 알 방법이 필요해 버튼도 둔다 */}
        <div style={{ padding: '0 20px 28px', display: 'flex', gap: 8 }}>
          {/* 버튼에는 방향이 없다 — 오른쪽으로 돈다. */}
          <Btn variant="ghost" onClick={() => setFlipTurns((v) => v + 1)}>카드 뒤집기</Btn>
          {/* DM 기획이 없다 — 여기서 할 수 있는 행동은 친구 신청뿐이다.
              (차단·신고는 20-1a 멤버 액션처럼 대상이 확실한 경로에서만 연다)
              20-1a ScreenMemberActions 와 **같은 API·같은 상태 문구**를 쓴다. */}
          {!isMe && (
            <div style={{ flex: 1 }}>
              <Btn variant="primary" full disabled={!userId || requestState !== 'idle'} onClick={userId ? sendFriendRequest : undefined} testId="public-profile-friend">
                {requestState === 'sent' ? '친구 요청을 보냈어요' : requestState === 'sending' ? '보내는 중...' : '친구 신청'}
              </Btn>
            </div>
          )}
        </div>
        {requestError && <div role="alert" style={{ fontSize: 11.5, color: T.danger, padding: '0 20px 20px', textAlign: 'center' }}>{requestError}</div>}
      </div>
    </Phone>
  );
}


Object.assign(window, {
  ScreenFeedWrite, ScreenFeedWriteStep1, ScreenFeedWriteStep2, ScreenFeedWriteStep3, ScreenFeedWriteStep4, ScreenFeedWriteStep5,
  ScreenDex, ScreenProfileEdit, ProfileEditBody, ScreenProfileTasteEdit, ScreenSettings, ScreenAuthMethods, ScreenPublicProfile,
  MOYEO_USER_COLORS, userCardPalette,
  // 30-2 밖의 신고 진입점(20-1 채팅방 메뉴 · 20-1a 멤버 액션 · 15 모집 상세)이
  // 같은 문의 창구를 쓰도록 window 로 올린다 (정본 REPORT-CANON §3).
  MOYEO_CONTACT,
});

// ─── window export ───
Object.assign(window, { ScreenFeedWrite, ScreenFeedWriteStep1, ScreenFeedWriteStep2, ScreenFeedWriteStep3, ScreenFeedWriteStep4, ScreenFeedWriteStep5, ScreenDex, ScreenProfileEdit, ScreenProfileTasteEdit, ScreenSettings, ScreenAuthMethods, ScreenPublicProfile });
