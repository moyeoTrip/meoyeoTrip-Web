// 20-2a~20-2f 첨부 작성 화면 6종 + 12-1 검색 결과.
// 정본: docs/alignment/ATTACH-COMPOSER-CANON.md
//
// 20-2 첨부 메뉴의 타일 6개가 전부 21(특수 메시지 견본)로 가고 있어서 "무엇을 어떻게 만드는지"가
// 화면에 없었다. 여기서 6종을 각자의 작성 화면으로 갈라 놓는다.
//
// **목데이터 금지(NO-MOCK-CANON R1).** 이 화면들의 값은 전부 사용자 입력이거나 서버 응답이다.
// 기획 원본(screens-attach.jsx)의 예시 사진·예시 장소·예시 금액은 옮기지 않았다.

// ───────── 공통 골격 (정본 R1) ─────────
// 헤더(뒤로 + 가운데 제목) · 스크롤 본문 · 하단 고정 CTA 한 개.
function AttachFrame({ title, hint, cta, disabled, busy, error, notice, onBack, onSubmit, testId, children }) {
  return (
    <Phone>
      <div data-testid={testId} style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title={title} left center onBack={onBack}/>
        {hint && (
          <div style={{ padding: '0 20px 12px', borderBottom: `1px solid ${RF.softLine}` }}>
            <div style={{ fontSize: 11.5, color: T.text500, lineHeight: '17px' }}>{hint}</div>
          </div>
        )}
        <div style={{ position: 'absolute', top: hint ? 108 : 92, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '16px 20px 20px' }}>
          {children}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}` }}>
          {error && <div role="alert" data-testid={testId ? `${testId}-error` : undefined} style={{ fontSize: 11.5, color: T.danger, marginBottom: 7 }}>{error}</div>}
          {!error && notice && <div role="status" style={{ fontSize: 11.5, color: T.text500, marginBottom: 7 }}>{notice}</div>}
          <Btn variant="primary" full disabled={disabled || busy} onClick={onSubmit} networkAction testId={testId ? `${testId}-submit` : undefined}>
            {busy ? '보내는 중...' : cta}
          </Btn>
        </div>
      </div>
    </Phone>
  );
}

// 미로그인·방 미선택이면 작성 화면을 그리지 않는다 (§2 정본 문구를 그대로 쓴다).
function AttachSignedOut({ title, onBack }) {
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title={title} left center onBack={onBack}/>
        <div role="status" style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13, lineHeight: '21px' }}>
          로그인하면 모집 중인 모임을 볼 수 있어요.
        </div>
      </div>
    </Phone>
  );
}

function AttachFieldLabel({ children, required }) {
  return (
    <div style={{ fontSize: 12.5, fontWeight: 900, margin: '18px 0 8px' }}>
      {children}{required && <span style={{ color: T.danger }}> *</span>}
    </div>
  );
}

function AttachToggleRow({ label, desc, on, onToggle, testId }) {
  return (
    <button type="button" onClick={onToggle} data-testid={testId} style={{
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

function AttachNoteBox({ lines }) {
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

const ATTACH_INPUT_STYLE = {
  width: '100%', height: 44, borderRadius: 12, border: `1px solid ${T.line200}`, padding: '0 12px',
  fontSize: 13, color: T.text900, background: RF.bg, fontFamily: T.fontStack, outline: 'none',
};

// 첨부 작성 화면 공통 컨텍스트 — 로그인 세션과 대상 방.
function useAttachRoom() {
  const liveMode = Boolean(window.MoyeoApi?.live());
  const roomId = liveMode ? window.MoyeoApi.selectedRoomId() : null;
  return { liveMode, roomId, ready: Boolean(liveMode && roomId) };
}

// ───────── 20-2a · 사진 보내기 ─────────
// POST /api/v1/chat-rooms/{roomId}/messages/images (multipart · ≤20MB)
// 최근 사진 그리드는 웹이 갤러리를 읽을 수 없어 두지 않는다 — OS 파일 선택기가 그 자리다.
// (예시 사진을 깔면 그 자체가 목데이터다.)
const ATTACH_IMAGE_MAX_BYTES = 20 * 1024 * 1024;

function ScreenAttachPhoto() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const { ready, roomId } = useAttachRoom();
  const fileInputRef = React.useRef(null);
  const [file, setFile] = React.useState(null);
  const [previewUrl, setPreviewUrl] = React.useState('');
  const [caption, setCaption] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!file) { setPreviewUrl(''); return undefined; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!ready) return <AttachSignedOut title="사진 보내기" onBack={nav.back}/>;

  const pick = (picked) => {
    if (!picked) return;
    if (picked.size > ATTACH_IMAGE_MAX_BYTES) {
      setFile(null);
      setError('사진은 20MB 까지 보낼 수 있어요.');
      return;
    }
    setError('');
    setFile(picked);
  };
  const send = async () => {
    if (!file || busy) return;
    setBusy(true);
    setError('');
    try {
      await window.MoyeoApi.shareRoomImage(roomId, file, caption);
      nav.go('chat');
    } catch (sendError) {
      setError(sendError?.message || '사진을 보내지 못했어요.');
      setBusy(false);
    }
  };
  const sizeText = file ? `${(file.size / (1024 * 1024)).toFixed(1)}MB` : '';

  return (
    <AttachFrame
      testId="attach-photo"
      title="사진 보내기"
      hint="한 번에 1장씩 보내요. 20MB 까지 올릴 수 있어요."
      cta="이 사진 보내기"
      disabled={!file}
      busy={busy}
      error={error}
      onBack={nav.back}
      onSubmit={send}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        data-testid="attach-photo-input"
        onChange={(event) => { pick(event.target.files?.[0]); event.target.value = ''; }}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      />
      {/* 고른 사진을 크게 먼저 — 무엇이 갈지 보고 나서 보낸다 (정본 R2) */}
      {previewUrl ? (
        <div style={{ borderRadius: 14, overflow: 'hidden', position: 'relative', border: `1px solid ${RF.softLine}` }}>
          <img src={previewUrl} alt="" style={{ display: 'block', width: '100%', height: 188, objectFit: 'cover' }}/>
          <div style={{ position: 'absolute', right: 10, bottom: 10, padding: '5px 10px', borderRadius: 999, background: 'rgba(0,0,0,.55)', color: '#fff', fontSize: 10.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{sizeText}</div>
        </div>
      ) : (
        <button type="button" onClick={() => fileInputRef.current?.click()} data-testid="attach-photo-pick" style={{
          width: '100%', height: 188, borderRadius: 14, border: `1px dashed ${T.line300}`, background: T.bgSubtle,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 9,
          cursor: 'pointer', fontFamily: T.fontStack,
        }}>
          <Icon name="camera" size={26} color={T.primary600}/>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.text900 }}>사진 고르기</div>
          <div style={{ fontSize: 11, color: T.text500 }}>기기에 저장된 사진에서 1장을 골라주세요.</div>
        </button>
      )}
      {previewUrl && (
        <button type="button" onClick={() => fileInputRef.current?.click()} style={{ marginTop: 10, width: '100%', height: 40, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card, color: T.primary600, fontSize: 12.5, fontWeight: 800, fontFamily: T.fontStack, cursor: 'pointer' }}>다른 사진 고르기</button>
      )}

      <AttachFieldLabel>같이 보낼 한 줄 (선택)</AttachFieldLabel>
      <input
        type="text"
        data-testid="attach-photo-caption"
        value={caption}
        maxLength={200}
        onChange={(event) => setCaption(event.target.value)}
        placeholder="사진 설명을 적어주세요"
        style={ATTACH_INPUT_STYLE}
      />

      <AttachNoteBox lines={[
        '보낸 사진은 채팅방 사이드 메뉴의 공유 항목에 모여요.',
        '20MB 를 넘으면 보내기 전에 알려드려요.',
      ]}/>
    </AttachFrame>
  );
}

// ───────── 20-2b · 장소 카드 보내기 ─────────
// GET /api/v1/tourism-contents (17-1a 와 같은 목록) → POST .../messages/tourism-contents
// 20-2c 지도와 다르다: 이쪽은 이름·분류·사진이 있는 관광 콘텐츠다 (정본 R3).
function ScreenAttachPlace() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const { ready, roomId } = useAttachRoom();
  const [draft, setDraft] = React.useState('');
  const [keyword, setKeyword] = React.useState('');
  const [status, setStatus] = React.useState('idle');
  const [items, setItems] = React.useState([]);
  const [picked, setPicked] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  const [total, setTotal] = React.useState(null);
  // 들어오자마자 **검색어 없이** 목록을 부른다 — 앱 둘도 그렇게 한다.
  // 예전에는 `keyword` 가 비면 아예 부르지 않아 웹만 빈 화면으로 찍혔다
  // (20-2b, 사용자 지적 2026-09-09). 서버는 keyword 없이도 200 을 준다.
  React.useEffect(() => {
    if (!ready) return undefined;
    let active = true;
    setStatus('loading');
    window.MoyeoTourism.list({ keyword, size: 30 })
      .then((result) => {
        if (!active) return;
        setItems(result.items || []);
        setTotal(Number.isFinite(result.totalElements) ? result.totalElements : null);
        setStatus('done');
      })
      .catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [ready, keyword]);

  if (!ready) return <AttachSignedOut title="장소 카드 보내기" onBack={nav.back}/>;

  // 검색어를 확정한다 — 위 useEffect 가 GET /tourism-contents?keyword= 를 부른다.
  const runSearch = () => { setPicked(null); setKeyword(draft.trim()); };

  const send = async () => {
    if (!picked || busy) return;
    setBusy(true);
    setError('');
    try {
      await window.MoyeoApi.shareRoomTourismContent(roomId, picked.contentId);
      nav.go('chat');
    } catch (sendError) {
      setError(sendError?.message || '장소를 보내지 못했어요.');
      setBusy(false);
    }
  };

  return (
    <AttachFrame
      testId="attach-place"
      title="장소 카드 보내기"
      hint="관광 정보에서 찾은 장소를 카드로 보내요."
      cta="이 장소 보내기"
      disabled={!picked}
      busy={busy}
      error={error}
      onBack={nav.back}
      onSubmit={send}
    >
      <form
        onSubmit={(event) => { event.preventDefault(); runSearch(); }}
        style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42, padding: '0 12px', borderRadius: 12, background: T.bgSubtle, border: `1px solid ${RF.softLine}` }}
      >
        {/* 돋보기도 검색을 실행한다. Enter(form onSubmit)와 같은 일을 하지만 버튼 자신에게
            핸들러가 없으면 동작이 코드에 드러나지 않는다. type=button 이라 제출이 겹치지 않는다. */}
        <button type="button" aria-label="장소 검색" data-testid="attach-place-search" data-network-action="true" onClick={runSearch} style={{ padding: 0, border: 0, background: 'transparent', display: 'flex', cursor: 'pointer' }}>
          <Icon name="search" size={16} color={T.text500}/>
        </button>
        <input
          type="search"
          data-testid="attach-place-keyword"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="장소 이름이나 지역을 검색해보세요"
          aria-label="장소 검색어"
          style={{ flex: 1, minWidth: 0, height: 40, border: 0, outline: 'none', background: 'transparent', fontSize: 13, color: T.text900, fontFamily: T.fontStack, padding: 0 }}
        />
      </form>

      {status === 'loading' && <div role="status" style={{ padding: '32px 0', textAlign: 'center', fontSize: 12.5, color: T.text500 }}>불러오는 중이에요…</div>}
      {status === 'error' && <div role="alert" style={{ padding: '32px 0', textAlign: 'center', fontSize: 12.5, color: T.text500 }}>불러오지 못했어요.</div>}
      {status === 'done' && items.length === 0 && (
        <div role="status" style={{ padding: '32px 0', textAlign: 'center', fontSize: 12.5, color: T.text500 }}>검색 결과가 없어요</div>
      )}
      {status === 'done' && items.length > 0 && (
        <React.Fragment>
          {/* 「몇 곳 있는지」는 서버가 준 전체 개수다 — 한 쪽 분량(30)을 세면 표면마다 숫자가 달라진다. */}
          <div style={{ fontSize: 11.5, color: T.text500, margin: '12px 0 8px' }}>{(total ?? items.length).toLocaleString('ko-KR')}곳을 찾았어요</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {items.map((place) => {
              const active = picked?.contentId === place.contentId;
              return (
                <button
                  key={place.contentId}
                  type="button"
                  data-testid={`attach-place-${place.contentId}`}
                  onClick={() => setPicked(place)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 11, padding: 10, borderRadius: 12, cursor: 'pointer',
                    fontFamily: T.fontStack, textAlign: 'left', width: '100%',
                    background: active ? T.primary50 : RF.card,
                    border: `1px solid ${active ? T.primary100 : RF.softLine}`,
                  }}>
                  <div style={{ width: 46, height: 46, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                    <RoomThumb src={place.thumbnailUrl} height={46} shape="square"/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: T.text900 }}>{place.title}</div>
                    {place.address && <div style={{ fontSize: 11, color: T.text500, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.address}</div>}
                  </div>
                  {active && <Icon name="check" size={17} color={T.primary600}/>}
                </button>
              );
            })}
          </div>
        </React.Fragment>
      )}

      {/* 보내기 전 미리보기 — 21 특수 메시지의 장소 카드와 같은 생김새 (정본 R2) */}
      {picked && (
        <React.Fragment>
          <AttachFieldLabel>이렇게 보내져요</AttachFieldLabel>
          <div data-testid="attach-place-preview" style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${RF.softLine}`, background: RF.card }}>
            <RoomThumb src={picked.thumbnailUrl} height={112}/>
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 13.5, fontWeight: 900 }}>{picked.title}</div>
              {picked.address && <div style={{ fontSize: 11.5, color: T.text500, marginTop: 4 }}>{picked.address}</div>}
            </div>
          </div>
        </React.Fragment>
      )}
    </AttachFrame>
  );
}

// ───────── 20-2c · 만날 위치 보내기 ─────────
// POST /api/v1/chat-rooms/{roomId}/messages/locations — **본문이 없다.**
// 서버가 방에 저장된 집합 좌표를 그대로 카드로 만든다. 그래서 임의의 핀을 찍어 보낼 수는 없고,
// 화면은 "무엇이 갈지"(방의 집합 좌표)를 실지도로 보여주고 확인만 받는다.
// 집합 좌표가 없는 방은 서버가 400 이라 CTA 를 잠근다 — 좌표를 지어내지 않는다 (R4).
function ScreenAttachMap() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const { ready, roomId } = useAttachRoom();
  const [room, setRoom] = React.useState(null);
  const [status, setStatus] = React.useState('loading');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!ready) return undefined;
    let active = true;
    setStatus('loading');
    window.MoyeoApi.roomDetail(roomId)
      .then((result) => {
        if (!active) return;
        if (result?.roomId != null) { setRoom(result); setStatus('done'); }
        else setStatus('error');
      })
      .catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [ready, roomId]);

  if (!ready) return <AttachSignedOut title="만날 위치 보내기" onBack={nav.back}/>;

  const lat = Number(room?.meetingLatitude);
  const lng = Number(room?.meetingLongitude);
  const hasPoint = Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;
  const send = async () => {
    if (!hasPoint || busy) return;
    setBusy(true);
    setError('');
    try {
      await window.MoyeoApi.shareRoomLocation(roomId);
      nav.go('chat');
    } catch (sendError) {
      setError(sendError?.message || '위치를 보내지 못했어요.');
      setBusy(false);
    }
  };

  return (
    <AttachFrame
      testId="attach-map"
      title="만날 위치 보내기"
      hint="모집에 저장된 집합 좌표를 지도 카드로 보내요."
      cta="집합 위치 보내기"
      disabled={!hasPoint}
      busy={busy}
      error={error}
      notice={status === 'done' && !hasPoint ? '집합 좌표가 저장되면 이 카드를 보낼 수 있어요.' : ''}
      onBack={nav.back}
      onSubmit={send}
    >
      {status === 'loading' && <div role="status" style={{ padding: '40px 0', textAlign: 'center', fontSize: 12.5, color: T.text500 }}>불러오는 중이에요…</div>}
      {status === 'error' && <div role="alert" style={{ padding: '40px 0', textAlign: 'center', fontSize: 12.5, color: T.text500 }}>불러오지 못했어요.</div>}
      {status === 'done' && (
        <React.Fragment>
          {/* 좌표가 없으면 지도를 그리지 않는다 (NO-MOCK R4) */}
          {hasPoint && (
            <div data-testid="attach-map-preview" style={{ borderRadius: 14, overflow: 'hidden' }}>
              <MiniMap height={210} level={4} center={{ lat, lng }} markers={[{ lat, lng, label: '' }]}/>
            </div>
          )}
          {hasPoint ? (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: T.bgSubtle, display: 'flex', gap: 9 }}>
              <Icon name="pin" size={15} color={T.primary600}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                {room.meetingDetails && <div style={{ fontSize: 12.5, fontWeight: 700 }}>{room.meetingDetails}</div>}
                <div style={{ fontSize: 10.5, color: T.text500, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{lat.toFixed(6)}, {lng.toFixed(6)}</div>
              </div>
            </div>
          ) : (
            <div role="status" data-testid="attach-map-empty" style={{ padding: '40px 0', textAlign: 'center', fontSize: 12.5, color: T.text500, lineHeight: '19px' }}>
              이 모임에는 아직 집합 좌표가 없어요.<br/>호스트가 집합 장소를 정하면 보낼 수 있어요.
            </div>
          )}

          <AttachNoteBox lines={[
            '받는 사람은 카드를 눌러 지도 앱으로 길찾기를 열 수 있어요.',
            '집합 장소를 바꾸는 건 아니에요. 집합 장소는 호스트가 모집 정보에서 고쳐요.',
          ]}/>
        </React.Fragment>
      )}
    </AttachFrame>
  );
}

// ───────── 20-2d · 투표 만들기 ─────────
// POST /api/v1/chat-rooms/{roomId}/messages/polls — {question, options[2~5], anonymous}
// 정본 R5: 2개까지는 삭제 비활성, 5개에서 추가 비활성, **익명이 기본값**.
// 기획의 "여러 개 고르기" 토글은 서버 요청에 대응 필드가 없어 두지 않았다 (누르면 아무 일도
// 일어나지 않는 스위치가 더 나쁘다). BE 요청 대상이다.
const ATTACH_POLL_MIN_OPTIONS = 2;
const ATTACH_POLL_MAX_OPTIONS = 5;

function ScreenAttachPoll() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const { ready, roomId } = useAttachRoom();
  const [question, setQuestion] = React.useState('');
  const [options, setOptions] = React.useState(['', '']);
  const [anonymous, setAnonymous] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  if (!ready) return <AttachSignedOut title="투표 만들기" onBack={nav.back}/>;

  const filled = options.map((option) => option.trim()).filter(Boolean);
  const unique = new Set(filled).size === filled.length;
  const valid = Boolean(question.trim()) && filled.length >= ATTACH_POLL_MIN_OPTIONS && filled.length === options.length && unique;
  // 함수형 갱신을 쓴다 — 연달아 누르면 닫힌 값이 옛 배열이라 한 번만 반영된다.
  const setOption = (index, value) => setOptions((current) => current.map((item, i) => (i === index ? value : item)));
  const addOption = () => setOptions((current) => (current.length < ATTACH_POLL_MAX_OPTIONS ? [...current, ''] : current));
  const removeOption = (index) => setOptions((current) => (current.length > ATTACH_POLL_MIN_OPTIONS ? current.filter((_, i) => i !== index) : current));
  const send = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError('');
    try {
      await window.MoyeoApi.createRoomPoll(roomId, { question: question.trim(), options: filled, anonymous });
      nav.go('chat');
    } catch (sendError) {
      setError(sendError?.message || '투표를 올리지 못했어요.');
      setBusy(false);
    }
  };

  return (
    <AttachFrame
      testId="attach-poll"
      title="투표 만들기"
      hint="항목은 2~5개까지예요."
      cta="투표 올리기"
      disabled={!valid}
      busy={busy}
      error={error}
      notice={!unique ? '같은 항목을 두 번 넣을 수 없어요.' : ''}
      onBack={nav.back}
      onSubmit={send}
    >
      <div style={{ fontSize: 12.5, fontWeight: 900, marginBottom: 8 }}>무엇을 물어볼까요<span style={{ color: T.danger }}> *</span></div>
      <input
        type="text"
        data-testid="attach-poll-question"
        value={question}
        maxLength={100}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="투표 질문을 적어주세요"
        style={ATTACH_INPUT_STYLE}
      />

      <AttachFieldLabel required>선택 항목</AttachFieldLabel>
      <div style={{ display: 'grid', gap: 8 }}>
        {options.map((option, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 9, height: 44, padding: '0 12px', borderRadius: 12, border: `1px solid ${T.line200}` }}>
            <div style={{ width: 18, height: 18, borderRadius: 999, flexShrink: 0, border: `1.6px solid ${T.line300}` }}/>
            <input
              type="text"
              data-testid={`attach-poll-option-${index}`}
              value={option}
              maxLength={50}
              onChange={(event) => setOption(index, event.target.value)}
              placeholder={`항목 ${index + 1}`}
              style={{ flex: 1, minWidth: 0, height: 42, border: 0, outline: 'none', background: 'transparent', fontSize: 13, color: T.text900, fontFamily: T.fontStack, padding: 0 }}
            />
            {/* 2개까지는 지울 수 없다 — 투표가 성립하지 않는다 (R5) */}
            <button
              type="button"
              onClick={() => removeOption(index)}
              aria-label={`항목 ${index + 1} 삭제`}
              data-testid={`attach-poll-remove-${index}`}
              disabled={options.length <= ATTACH_POLL_MIN_OPTIONS}
              style={{ border: 0, background: 'transparent', padding: 4, cursor: options.length <= ATTACH_POLL_MIN_OPTIONS ? 'default' : 'pointer', opacity: options.length <= ATTACH_POLL_MIN_OPTIONS ? 0.3 : 1 }}>
              <Icon name="close" size={14} color={T.text500}/>
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addOption}
        data-testid="attach-poll-add"
        disabled={options.length >= ATTACH_POLL_MAX_OPTIONS}
        style={{
          marginTop: 8, width: '100%', height: 42, borderRadius: 12, cursor: options.length >= ATTACH_POLL_MAX_OPTIONS ? 'default' : 'pointer',
          border: `1px dashed ${T.line300}`, background: 'transparent', fontFamily: T.fontStack,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          color: options.length >= ATTACH_POLL_MAX_OPTIONS ? T.text400 : T.primary600, fontSize: 12.5, fontWeight: 700,
        }}>
        <Icon name="plus" size={14} color={options.length >= ATTACH_POLL_MAX_OPTIONS ? T.text400 : T.primary600}/>
        {options.length >= ATTACH_POLL_MAX_OPTIONS ? '항목은 5개까지예요' : '항목 추가'}
      </button>

      <div style={{ marginTop: 8, borderTop: `1px solid ${RF.softLine}` }}>
        <AttachToggleRow
          testId="attach-poll-anonymous"
          label="익명 투표"
          desc="누가 무엇을 골랐는지 아무도 못 봐요. 결과 숫자만 보여요."
          on={anonymous}
          onToggle={() => setAnonymous(!anonymous)}
        />
      </div>

      <AttachNoteBox lines={[
        '올린 뒤에는 질문과 항목을 고칠 수 없어요.',
        '멤버가 고른 표는 채팅방 카드에 그대로 남아요.',
      ]}/>
    </AttachFrame>
  );
}

// ───────── 20-2e · 정산 메모 ─────────
// POST /api/v1/chat-rooms/{roomId}/messages/settlement-memos — {memo} 한 필드(≤1000자)
// 정본 R4: **송금이 아니다.** 1인당 금액은 입력이 아니라 계산 결과이고 10원 단위 올림이다.
const ATTACH_SETTLEMENT_DISCLAIMER = '모여트립은 송금을 하지 않아요. 실제 정산은 각자 하셔야 해요.';

function attachSettlementPerPerson(total, people) {
  const amount = Number(total);
  const count = Number(people);
  if (!Number.isFinite(amount) || !Number.isFinite(count) || amount <= 0 || count <= 0) return null;
  return Math.ceil(amount / count / 10) * 10;
}

// 서버로 나가는 것은 memo 문자열 하나다 — 화면의 칸들을 사람이 읽는 한 덩어리로 합친다.
function attachSettlementMemo({ title, total, people, note }) {
  const each = attachSettlementPerPerson(total, people);
  const won = (value) => Number(value).toLocaleString('ko-KR');
  return [
    title.trim(),
    `총 ${won(total)}원 · ${people}명 · 1인당 ${won(each)}원`,
    note.trim(),
    ATTACH_SETTLEMENT_DISCLAIMER,
  ].filter(Boolean).join('\n');
}

function ScreenAttachSettlement() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const { ready, roomId } = useAttachRoom();
  const [title, setTitle] = React.useState('');
  const [total, setTotal] = React.useState('');
  const [people, setPeople] = React.useState(null);
  const [note, setNote] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  // 나눌 인원의 첫 값은 지어내지 않는다 — 방의 실제 참여 인원에서 온다.
  React.useEffect(() => {
    if (!ready) return undefined;
    let active = true;
    window.MoyeoApi.roomMembers(roomId)
      .then((result) => {
        const count = (result?.members || []).length;
        // 최소 2 명이다 — 혼자 나눌 정산은 없다. 방 인원이 1이면 2 로 시작한다
        // (앱 둘도 2 로 시작한다, 20-2e 2026-09-09).
        if (active && count > 0) setPeople((current) => (current == null ? Math.max(2, count) : current));
      })
      .catch(() => { /* 못 받으면 사용자가 직접 넣는다 */ });
    return () => { active = false; };
  }, [ready, roomId]);

  if (!ready) return <AttachSignedOut title="정산 메모" onBack={nav.back}/>;

  const totalNumber = Number(String(total).replace(/[^0-9]/g, ''));
  const each = attachSettlementPerPerson(totalNumber, people);
  const valid = Boolean(title.trim()) && each != null;
  const won = (value) => Number(value).toLocaleString('ko-KR');
  const send = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError('');
    try {
      await window.MoyeoApi.shareRoomSettlementMemo(roomId, attachSettlementMemo({ title, total: totalNumber, people, note }));
      nav.go('chat');
    } catch (sendError) {
      setError(sendError?.message || '정산 메모를 올리지 못했어요.');
      setBusy(false);
    }
  };

  return (
    <AttachFrame
      testId="attach-settlement"
      title="정산 메모"
      hint="얼마를 어떻게 나눌지 적어두는 메모예요. 앱에서 돈이 오가지는 않아요."
      cta="정산 메모 올리기"
      disabled={!valid}
      busy={busy}
      error={error}
      onBack={nav.back}
      onSubmit={send}
    >
      <div style={{ fontSize: 12.5, fontWeight: 900, marginBottom: 8 }}>무엇을 정산하나요<span style={{ color: T.danger }}> *</span></div>
      <input
        type="text"
        data-testid="attach-settlement-title"
        value={title}
        maxLength={80}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="예: 점심 · 달기약수탕 백숙"
        style={ATTACH_INPUT_STYLE}
      />

      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 900, marginBottom: 8 }}>총 금액<span style={{ color: T.danger }}> *</span></div>
          <div style={{ height: 44, borderRadius: 12, border: `1px solid ${T.line200}`, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              type="text"
              inputMode="numeric"
              data-testid="attach-settlement-total"
              value={total}
              onChange={(event) => setTotal(event.target.value.replace(/[^0-9]/g, ''))}
              placeholder="0"
              aria-label="총 금액"
              style={{ flex: 1, minWidth: 0, height: 42, border: 0, outline: 'none', background: 'transparent', fontSize: 13, fontWeight: 800, color: T.text900, fontFamily: T.fontStack, padding: 0, fontVariantNumeric: 'tabular-nums' }}
            />
            <span style={{ color: T.text500, fontSize: 13 }}>원</span>
          </div>
        </div>
        <div style={{ width: 116 }}>
          <div style={{ fontSize: 12.5, fontWeight: 900, marginBottom: 8 }}>나눌 인원<span style={{ color: T.danger }}> *</span></div>
          <div style={{ height: 44, borderRadius: 12, border: `1px solid ${T.line200}`, padding: '0 10px', display: 'flex', alignItems: 'center' }}>
            <button type="button" aria-label="인원 줄이기" data-testid="attach-settlement-people-minus" onClick={() => setPeople((current) => Math.max(1, (current || 1) - 1))} style={{ border: 0, background: 'transparent', padding: 2, cursor: 'pointer', display: 'flex' }}>
              <Icon name="minus" size={14} color={T.text500}/>
            </button>
            <div data-testid="attach-settlement-people" style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{people == null ? '-' : people}</div>
            <button type="button" aria-label="인원 늘리기" data-testid="attach-settlement-people-plus" onClick={() => setPeople((current) => Math.min(100, (current || 0) + 1))} style={{ border: 0, background: 'transparent', padding: 2, cursor: 'pointer', display: 'flex' }}>
              <Icon name="plus" size={14} color={T.primary600}/>
            </button>
          </div>
        </div>
      </div>

      {/* 1인당 금액은 입력이 아니라 계산 결과다 (R4).
          **총액이 비어 있어도 카드를 그린다** — 예전에는 값이 생길 때까지 카드가 없어서
          웹만 「1인당」 줄이 통째로 사라졌다 (20-2e, 사용자 지적 2026-09-09).
          앱 둘은 처음부터 `0원` 으로 자리를 잡아 둔다. */}
      {(
        <div data-testid="attach-settlement-each" style={{ marginTop: 16, borderRadius: 14, padding: 16, background: T.primary50, border: `1px solid ${T.primary100}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="money" size={20} color={T.primary600}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: T.primary700, fontWeight: 700 }}>1인당</div>
            <div style={{ fontSize: 21, fontWeight: 900, color: T.primary700, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{won(each ?? 0)}원</div>
          </div>
          <div style={{ fontSize: 10.5, color: T.text500, textAlign: 'right', lineHeight: '15px' }}>10원 단위로<br/>올림했어요</div>
        </div>
      )}

      <AttachFieldLabel>남길 말 (선택)</AttachFieldLabel>
      <textarea
        data-testid="attach-settlement-note"
        value={note}
        maxLength={500}
        onChange={(event) => setNote(event.target.value)}
        placeholder="예: 계좌는 채팅방에 따로 남길게요."
        style={{ ...ATTACH_INPUT_STYLE, height: 76, padding: 12, lineHeight: '19px', resize: 'none' }}
      />

      <AttachNoteBox lines={[
        ATTACH_SETTLEMENT_DISCLAIMER,
        '계좌번호는 아무나 볼 수 있으니 꼭 필요할 때만 남겨주세요.',
      ]}/>
    </AttachFrame>
  );
}

// ───────── 20-2f · 공지 작성 (호스트) ─────────
// POST /api/v1/chat-rooms/{roomId}/notices — {notice, pinned}
// 정본 §2: **제목 칸이 없다.** 서버 모델도 notice 문자열 하나뿐이다.
// 정본 R5-1: 상단 고정은 **최대 1개**. 서버가 개수를 막지 않으므로 클라가 지킨다 —
// 새 공지를 고정하면 기존 고정 공지를 PUT pinned:false 로 풀어 준다.
const ATTACH_NOTICE_PIN_DESC_FREE = '채팅방 맨 위에 계속 보여요.';
const ATTACH_NOTICE_PIN_DESC_TAKEN = '지금 고정된 공지가 있어요. 이걸 고정하면 그 공지는 풀려요.';

function ScreenAttachNotice() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const { ready, roomId } = useAttachRoom();
  const [body, setBody] = React.useState('');
  const [pinned, setPinned] = React.useState(true);
  const [pinnedNotices, setPinnedNotices] = React.useState([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!ready) return undefined;
    let active = true;
    window.MoyeoApi.roomNotices(roomId)
      .then((result) => { if (active && Array.isArray(result?.pinnedNotices)) setPinnedNotices(result.pinnedNotices); })
      .catch(() => { /* 못 받으면 고정 현황을 지어내지 않는다 */ });
    return () => { active = false; };
  }, [ready, roomId]);

  if (!ready) return <AttachSignedOut title="공지 작성" onBack={nav.back}/>;

  const content = body.trim();
  const send = async () => {
    if (!content || busy) return;
    setBusy(true);
    setError('');
    try {
      await window.MoyeoApi.createRoomNotice(roomId, content, pinned);
      // 고정은 최대 1개다 (R5-1). 서버가 막지 않으므로 기존 고정 공지를 여기서 푼다.
      if (pinned) {
        await Promise.all(pinnedNotices.map((notice) => window.MoyeoApi.updateRoomNotice(roomId, notice.noticeId, { pinned: false }).catch(() => null)));
      }
      nav.go('notice-history');
    } catch (sendError) {
      setError(sendError?.message || '공지를 올리지 못했어요.');
      setBusy(false);
    }
  };

  return (
    <AttachFrame
      testId="attach-notice"
      title="공지 작성"
      hint="공지는 호스트만 올릴 수 있어요."
      cta="공지 올리기"
      disabled={!content}
      busy={busy}
      error={error}
      onBack={nav.back}
      onSubmit={send}
    >
      {/* 제목 입력 칸을 두지 않는다 (정본 §2) */}
      <div style={{ fontSize: 12.5, fontWeight: 900, marginBottom: 8 }}>공지 내용<span style={{ color: T.danger }}> *</span></div>
      <textarea
        data-testid="attach-notice-body"
        value={body}
        maxLength={1000}
        onChange={(event) => setBody(event.target.value)}
        placeholder="멤버에게 알릴 내용을 적어주세요"
        style={{ ...ATTACH_INPUT_STYLE, minHeight: 148, height: 148, padding: 12, lineHeight: '20px', resize: 'none' }}
      />
      <div style={{ textAlign: 'right', marginTop: 6, fontSize: 11, color: T.text400, fontVariantNumeric: 'tabular-nums' }}>{body.length}/1000</div>

      <div style={{ marginTop: 10, borderTop: `1px solid ${RF.softLine}` }}>
        <AttachToggleRow
          testId="attach-notice-pin"
          label="상단에 고정하기"
          desc={pinnedNotices.length > 0 ? ATTACH_NOTICE_PIN_DESC_TAKEN : ATTACH_NOTICE_PIN_DESC_FREE}
          on={pinned}
          onToggle={() => setPinned(!pinned)}
        />
      </div>

      {/* 고정을 켰을 때만 미리보기 — 채팅방 위에 어떻게 얹히는지 보여준다 (R2) */}
      {pinned && content && (
        <div style={{ marginTop: 6 }}>
          <div style={{ fontSize: 12.5, fontWeight: 900, margin: '12px 0 8px' }}>채팅방 맨 위에 이렇게 보여요</div>
          <div data-testid="attach-notice-preview" style={{ borderRadius: 12, padding: 12, background: T.primary50, border: `1px solid ${T.primary100}`, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Icon name="note" size={14} color={T.primary700}/>
            <div style={{ flex: 1, fontSize: 12, color: T.text900, lineHeight: '18px' }}>{content}</div>
            <Chip variant="soft">📌</Chip>
          </div>
        </div>
      )}

      <AttachNoteBox lines={[
        '고정을 해제해도 공지 이력에는 그대로 남아요.',
        '공지를 올리면 방 사람들에게 알림이 가요.',
      ]}/>
    </AttachFrame>
  );
}

// ───────── 12-1 · 검색 결과 ─────────
// GET /api/v1/travel-courses/search?keyword= (코스) · GET /api/v1/chat-rooms/search (모집)
// 정본 R6~R9. 코스 검색은 **제목·태그명**만 매칭한다 — 소개글은 검색 대상이 아니다.
function AttachCourseResultCard({ course, onClick }) {
  const placeCount = course.places?.length || 0;
  return (
    <button
      type="button"
      data-testid={`search-course-${course.courseId}`}
      onClick={onClick}
      style={{
        display: 'flex', gap: 11, padding: 10, borderRadius: 14, width: '100%', textAlign: 'left',
        background: RF.card, border: `1px solid ${RF.softLine}`, cursor: 'pointer', fontFamily: T.fontStack,
      }}>
      <div style={{ width: 74, height: 74, borderRadius: 11, overflow: 'hidden', flexShrink: 0 }}>
        <RoomThumb src={course.thumbnail} height={74} shape="square"/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 900, color: T.text900 }}>{course.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, fontSize: 11, color: T.text500, fontVariantNumeric: 'tabular-nums' }}>
          <Icon name="clock" size={12} color={T.text500}/><span>{course.travelTime}</span>
          <span style={{ color: T.line300 }}>·</span>
          <span>{course.distanceKm}km</span>
          <span style={{ color: T.line300 }}>·</span>
          <span>{placeCount}곳</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 7 }}>
          {(course.tags || []).map((tag) => <Chip key={tag.tagId ?? tag.name} variant="neutral">{tag.name}</Chip>)}
          <div style={{ flex: 1 }}/>
          {/* 평가가 없으면 별점을 지어내지 않는다 (R8) */}
          {course.averageRating == null ? (
            <span style={{ fontSize: 10.5, color: T.text400 }}>평가 없음</span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 800, color: T.text700, fontVariantNumeric: 'tabular-nums' }}>
              <Icon name="star" size={12} color={T.warning}/>
              {course.averageRating}
              <span style={{ color: T.text400, fontWeight: 600 }}>({course.ratingCount})</span>
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function ScreenSearchResults() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const liveMode = Boolean(window.MoyeoApi?.live());
  const keyword = window.MoyeoApi?.selectedSearchKeyword?.() || '';
  const [tab, setTab] = React.useState('course');
  const [courses, setCourses] = React.useState(null);
  const [rooms, setRooms] = React.useState(null);
  const [status, setStatus] = React.useState(liveMode && keyword ? 'loading' : 'idle');

  React.useEffect(() => {
    if (!liveMode || !keyword) return undefined;
    let active = true;
    setStatus('loading');
    Promise.all([
      window.MoyeoApi.searchCourses(keyword).catch(() => null),
      window.MoyeoApi.searchRooms({ keyword }).catch(() => null),
    ]).then(([courseResult, roomResult]) => {
      if (!active) return;
      if (!Array.isArray(courseResult) && !Array.isArray(roomResult)) { setStatus('error'); return; }
      setCourses(Array.isArray(courseResult) ? courseResult : []);
      setRooms(Array.isArray(roomResult) ? roomResult : []);
      setStatus('done');
    });
    return () => { active = false; };
  }, [liveMode, keyword]);

  const Tab = ({ id, label, count }) => (
    <button type="button" onClick={() => setTab(id)} data-testid={`search-results-tab-${id}`} style={{
      flex: 1, height: 42, border: 0, background: 'transparent', cursor: 'pointer', fontFamily: T.fontStack,
      fontSize: 13, fontWeight: tab === id ? 900 : 600,
      color: tab === id ? T.primary700 : T.text500,
      borderBottom: `2px solid ${tab === id ? T.primary500 : 'transparent'}`,
    }}>
      {label}{count == null ? '' : ' '}<span style={{ fontVariantNumeric: 'tabular-nums' }}>{count == null ? '' : count}</span>
    </button>
  );

  const list = tab === 'course' ? courses : rooms;
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        {/* 검색어를 계속 보여준다 — 무엇으로 찾은 결과인지 화면에 남아 있어야 한다 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px 12px' }}>
          <button type="button" onClick={nav.back} aria-label="뒤로" style={{ border: 0, background: 'transparent', padding: 4, cursor: 'pointer' }}>
            <Icon name="back" size={20} color={T.text900}/>
          </button>
          <button
            type="button"
            data-testid="search-results-keyword"
            onClick={() => nav.go('search')}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 12px',
              borderRadius: 999, background: T.bgSubtle, border: `1px solid ${RF.softLine}`,
              cursor: 'pointer', fontFamily: T.fontStack, textAlign: 'left',
            }}>
            <Icon name="search" size={15} color={T.text500}/>
            <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: T.text900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{keyword}</div>
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: `1px solid ${RF.softLine}` }}>
          <Tab id="course" label="코스" count={courses?.length}/>
          <Tab id="room" label="모집" count={rooms?.length}/>
        </div>

        <div data-testid="search-results" style={{ position: 'absolute', top: 142, left: 0, right: 0, bottom: 0, overflow: 'auto', padding: '14px 20px 24px' }}>
          {!liveMode && (
            <div role="status" style={{ padding: '48px 0', textAlign: 'center', color: T.text500, fontSize: 13 }}>로그인하면 모임을 검색할 수 있어요.</div>
          )}
          {liveMode && status === 'loading' && (
            <div role="status" style={{ padding: '48px 0', textAlign: 'center', color: T.text500, fontSize: 13 }}>불러오는 중이에요…</div>
          )}
          {liveMode && status === 'error' && (
            <div role="alert" style={{ padding: '48px 0', textAlign: 'center', color: T.text500, fontSize: 13 }}>불러오지 못했어요.</div>
          )}
          {liveMode && status === 'done' && list && list.length === 0 && (
            <div role="status" style={{ padding: '48px 0', textAlign: 'center', color: T.text500, fontSize: 13 }}>검색 결과가 없어요</div>
          )}
          {liveMode && status === 'done' && tab === 'course' && (courses || []).length > 0 && (
            <div style={{ display: 'grid', gap: 10 }}>
              {courses.map((course) => (
                <AttachCourseResultCard
                  key={course.courseId}
                  course={course}
                  onClick={() => { window.MoyeoApi.selectCourse(course.courseId); nav.go('course'); }}
                />
              ))}
            </div>
          )}
          {liveMode && status === 'done' && tab === 'room' && (rooms || []).length > 0 && (rooms.map((room) => (
            <window.ExploreServerRoomCard
              key={room.roomId}
              room={room}
              testId={`search-result-${room.roomId}`}
              onClick={() => { window.MoyeoApi.selectRoom(room.roomId); nav.go('detail'); }}
            />
          )))}
        </div>
      </div>
    </Phone>
  );
}

Object.assign(window, {
  AttachFrame,
  attachSettlementMemo,
  attachSettlementPerPerson,
  ScreenAttachPhoto,
  ScreenAttachPlace,
  ScreenAttachMap,
  ScreenAttachPoll,
  ScreenAttachSettlement,
  ScreenAttachNotice,
  ScreenSearchResults,
});
