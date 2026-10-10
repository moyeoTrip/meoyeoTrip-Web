// 내가 만든 것을 되돌리는 화면들 — 수정 · 삭제 (웹 구현)
//
// 기획 정본: `모여트립 in 경북/screens-edit-delete.jsx`
// 서버 계약: `docs/api/BACKEND_REQUEST_CHANGES_2026-09-04.md` (2026-09-04 BE 회신)
// 2026-09-07 실서버로 6종 전부 존재·권한·검증을 확인했다.
//
//   23-2  내 피드 액션 시트          PUT/DELETE /feeds/{id}
//   23-3  피드 삭제 확인             DELETE /feeds/{id} → 204
//   24-6  피드 수정 (**본문만**)     PUT /feeds/{id} { content }
//   23-1a 내 댓글 수정 · 삭제        PUT/DELETE /feeds/{id}/comments/{cid}
//   18-6  모집 내용 수정 (호스트)    PATCH /chat-rooms/{id} (multipart)
//   18-7  코스 이름 · 소개 수정      PATCH /travel-courses/chat-rooms/{id}
//   20-6  내 채팅 메시지 삭제        DELETE /chat-rooms/{id}/messages/{mid} → 204
//
// **프로필 이미지 삭제 화면은 없다** — BE 회신 §7 대로 회원가입에서 한 번 고르면 바꿀 수
// 없는 것이 기획이고 API 도 없다. 화면을 만들면 죽은 버튼이 된다.
//
// 라이브가 아니거나 대상이 없으면 `GapNotice` 로 빈 상태를 낸다 — 목데이터를 지어내지 않는다.

// 라이브 + 대상 피드가 준비됐는지. `useGapRoom` 과 같은 모양으로 맞춘다(새 관례를 만들지 않는다).
function useEditFeed() {
  const liveMode = Boolean(window.MoyeoApi?.live());
  const feedId = liveMode ? window.MoyeoApi.selectedFeedId() : null;
  return { liveMode, feedId, ready: Boolean(liveMode && feedId) };
}

function useEditRoom() {
  const liveMode = Boolean(window.MoyeoApi?.live());
  const roomId = liveMode ? window.MoyeoApi.selectedRoomId() : null;
  return { liveMode, roomId, ready: Boolean(liveMode && roomId) };
}

// 내 피드를 읽어온다. 남의 피드면 수정·삭제를 낼 수 없다(서버도 403 으로 막는다).
function useMyFeed(feedId, ready) {
  const [feed, setFeed] = React.useState(null);
  const [state, setState] = React.useState('loading');
  React.useEffect(() => {
    if (!ready) return undefined;
    let active = true;
    setState('loading');
    Promise.all([window.MoyeoApi.feedDetail(feedId), window.MoyeoApi.myProfile()])
      .then(([detail, me]) => {
        if (!active) return;
        const mine = Number(detail?.author?.userId) === Number(me?.userId);
        setFeed(mine ? detail : null);
        setState(mine ? 'ready' : 'empty');
      })
      .catch(() => { if (active) setState('error'); });
    return () => { active = false; };
  }, [feedId, ready]);
  return { feed, state };
}

// 되돌릴 수 없는 동작의 확인 시트 — 23-3 · 20-6 이 같은 골격을 쓴다.
// 기획과 같은 구조여야 "지우는 건 다 이렇게 생겼다"고 학습된다.
function DestructiveConfirmSheet({ backdrop, title, preview, previewIcon, consequences, cta, busy, error, onCancel, onConfirm, testId }) {
  // 시트 접근성은 공용 훅 한 곳에서 본다 (QA ENV-007 · shared.jsx `useSheetA11y`).
  const sheet = window.useSheetA11y({ label: typeof title === 'string' ? title : '확인', onClose: onCancel });
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>{backdrop}</div>
        <div style={{ position: 'absolute', inset: 0, background: T.bgOverlay }}/>

        <div {...sheet.rootProps} data-testid={testId} style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: RF.card, borderRadius: '24px 24px 0 0', padding: '10px 20px 32px', boxShadow: T.l3,
        }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: T.line300, margin: '0 auto 16px' }}/>
          <div style={{ fontSize: 15, fontWeight: 900, color: T.text900 }}>{title}</div>

          {preview && (
            <div style={{ marginTop: 12, padding: 11, borderRadius: 10, background: T.bgSubtle, border: `1px solid ${RF.softLine}`, display: 'flex', gap: 9, alignItems: 'center' }}>
              <Icon name={previewIcon || 'feed'} size={15} color={T.text500}/>
              <div style={{ flex: 1, fontSize: 12, color: T.text700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{preview}</div>
            </div>
          )}

          {/* **색은 회색이다.** 이 앱의 확인 시트는 예전부터 전부 `bgSubtle` 이었다
              (19-2 신청 취소 · 29-3 탈퇴 · iOS `AttachNoteBox` · 안드 `GapConfirmSheet`).
              여기만 경고색으로 두면 4열 비교에서 웹만 달라 보인다. */}
          <div style={{ marginTop: 14, padding: '12px 13px', borderRadius: 10, background: T.bgSubtle, border: `1px solid ${RF.softLine}` }}>
            {consequences.map((line) => (
              <div key={line} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginTop: 2 }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: T.text400, marginTop: 6, flexShrink: 0 }}/>
                <div style={{ flex: 1, fontSize: 12, lineHeight: '18px', color: T.text700 }}>{line}</div>
              </div>
            ))}
          </div>

          {error && <div role="alert" style={{ marginTop: 10, fontSize: 11.5, color: T.danger, fontWeight: 700 }}>{error}</div>}

          <div style={{ marginTop: 18, display: 'flex', gap: 9 }}>
            <div style={{ flex: 1 }}>
              {/* 취소는 **외곽선**이다 — 파괴 버튼(빨강) 옆에서 녹색 primary 면 무엇이 주된
                  동작인지 헷갈린다. iOS `MoyeoConfirmSheet` · 안드 `GapConfirmSheet` 가
                  그렇게 그리고 있었고 기획·웹만 녹색이었다 (픽셀 대조로 확인, 2026-09-09). */}
              <Btn variant="secondary" full onClick={onCancel}>그대로 둘게요</Btn>
            </div>
            <div style={{ flex: 1 }}>
              <button type="button" onClick={onConfirm} disabled={busy} style={{
                width: '100%', height: 48, borderRadius: 12, cursor: busy ? 'default' : 'pointer',
                border: 'none', background: T.danger, color: '#fff', opacity: busy ? 0.72 : 1,
                fontFamily: T.fontStack, fontSize: 14, fontWeight: 800,
              }}>{busy ? '지우는 중이에요…' : cta}</button>
            </div>
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 23-2 · 내 피드 액션 시트 (수정 · 삭제) ─────────
// 남의 피드에서는 이 자리에 32 신고 시트가 열린다(정본 REPORT-CANON).
// 내 피드에는 신고가 없다 — 자기 글은 신고할 수 없다(서버가 400 `40039` 로 막는다).
function ScreenFeedActions() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  // 시트 접근성은 공용 훅 한 곳에서 본다 (QA ENV-007 · shared.jsx `useSheetA11y`).
  const sheet = window.useSheetA11y({ label: '내가 쓴 여행 기록', onClose: nav.back });
  const { liveMode, feedId, ready } = useEditFeed();
  const { feed, state } = useMyFeed(feedId, ready);

  if (!ready || state !== 'ready') {
    return <GapNotice title="내 여행 기록" status={liveMode ? (ready ? state : 'empty') : 'signed-out'} emptyText="내가 쓴 기록만 수정하거나 지울 수 있어요." onBack={nav.back} testId="feed-actions-state"/>;
  }

  const photos = (feed.images || []).length;
  const Item = ({ icon, label, desc, danger, onClick, testId }) => (
    <button type="button" onClick={onClick} data-testid={testId} style={{
      width: '100%', display: 'flex', gap: 11, alignItems: 'flex-start', textAlign: 'left',
      padding: '13px 4px', background: 'transparent', border: 'none', cursor: 'pointer',
      fontFamily: T.fontStack, borderTop: `1px solid ${RF.softLine}`,
    }}>
      <Icon name={icon} size={17} color={danger ? T.danger : T.text700}/>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: danger ? T.danger : T.text900 }}>{label}</div>
        <div style={{ fontSize: 11.5, color: T.text400, marginTop: 3, lineHeight: '17px' }}>{desc}</div>
      </div>
    </button>
  );

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}><ScreenFeedDetail/></div>
        <div style={{ position: 'absolute', inset: 0, background: T.bgOverlay }}/>

        <div {...sheet.rootProps} data-testid="feed-actions-sheet" style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: RF.card, borderRadius: '24px 24px 0 0', padding: '10px 20px 32px', boxShadow: T.l3,
        }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: T.line300, margin: '0 auto 16px' }}/>
          <div style={{ fontSize: 15, fontWeight: 900, color: T.text900 }}>내가 쓴 여행 기록</div>
          <div style={{ fontSize: 11.5, color: T.text400, marginTop: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            “{feed.content || ''}” · 사진 {photos}장
          </div>

          <div style={{ marginTop: 14 }}>
            <Item icon="edit" label="수정하기" desc="글을 다시 쓸 수 있어요. 사진은 바꿀 수 없어요." onClick={() => nav.go('feed-edit')} testId="feed-actions-edit"/>
            {/* 삭제는 한 단계 더 물어본다 — 시트에서 바로 지우면 되돌릴 방법이 없다 */}
            <Item icon="trash" label="삭제하기" desc="되돌릴 수 없어요. 한 번 더 확인해요." danger onClick={() => nav.go('feed-delete')} testId="feed-actions-delete"/>
          </div>

          <div style={{ marginTop: 16 }}><Btn variant="secondary" full onClick={() => nav.back()}>닫기</Btn></div>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 23-3 · 피드 삭제 확인 ─────────
function ScreenFeedDelete() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const { liveMode, feedId, ready } = useEditFeed();
  const { feed, state } = useMyFeed(feedId, ready);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  if (!ready || state !== 'ready') {
    return <GapNotice title="여행 기록 삭제" status={liveMode ? (ready ? state : 'empty') : 'signed-out'} emptyText="내가 쓴 기록만 지울 수 있어요." onBack={nav.back} testId="feed-delete-state"/>;
  }

  const photos = (feed.images || []).length;
  const remove = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await window.MoyeoApi.deleteFeed(feedId);
      window.MoyeoApi.selectFeed(null);
      nav.go('feed');
    } catch (deleteError) {
      setError(window.userFacingError(deleteError, '기록을 지우지 못했어요.'));
      setBusy(false);
    }
  };

  return (
    <DestructiveConfirmSheet
      testId="feed-delete-sheet"
      backdrop={<ScreenFeedDetail/>}
      title="이 여행 기록을 삭제할까요?"
      previewIcon="feed"
      preview={`“${feed.content || ''}” · 사진 ${photos}장`}
      consequences={[
        `사진 ${photos}장과 글이 함께 사라져요.`,
        `달린 댓글 ${feed.commentCount || 0}개와 좋아요도 같이 없어져요.`,
        '되돌릴 수 없어요.',
        '내가 쓴 기록만 지울 수 있어요.',
      ]}
      cta="삭제하기"
      busy={busy}
      error={error}
      onCancel={() => nav.back()}
      onConfirm={remove}
    />
  );
}

// ───────── 24-6 · 피드 수정 ─────────
// **본문만 고친다.** 서버가 받는 것이 `{ content }` 하나다 (BE 회신 §2).
// 사진은 이 API 로 교체하지 않고 기존 첨부가 유지된다. 공개 범위도 못 바꾼다 —
// 댓글 쓴 사람이 갑자기 피드를 못 보게 되는 것을 막으려는 정책이다.
// 그래서 사진 편집 UI 를 두지 않는다. 두면 **죽은 버튼**이 된다.
function ScreenFeedEdit() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const { liveMode, feedId, ready } = useEditFeed();
  const { feed, state } = useMyFeed(feedId, ready);
  const [body, setBody] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  // 서버 `UpdateFeedRequest.content` 가 **max 500** 이다. 1,000 으로 안내하면
// 그 사이 길이는 카운터가 초록불인 채 저장 순간 400 이 나고 글을 잃는다.
// 피드 **작성** 화면은 이미 500 으로 맞다 — 수정 화면만 틀렸었다 (2026-09-12 감사).
const LIMIT = 500;

  React.useEffect(() => { if (feed) setBody(feed.content || ''); }, [feed]);

  if (!ready || state !== 'ready') {
    return <GapNotice title="여행 기록 수정" status={liveMode ? (ready ? state : 'empty') : 'signed-out'} emptyText="내가 쓴 기록만 수정할 수 있어요." onBack={nav.back} testId="feed-edit-state"/>;
  }

  const trimmed = body.trim();
  const changed = trimmed !== (feed.content || '').trim();
  const photos = (feed.images || []).length;
  // 공개 범위 세 값(PUBLIC · FRIENDS · PRIVATE)을 두 갈래로만 갈라서, **친구만 공개한 기록이
  // 「전체 공개」로 적혀 있었다.** 못 바꾸는 값을 틀리게 적으면 사용자는 자기 글이 누구에게
  // 보이는지 잘못 안다(2026-09-14 QA FEED-029 에서 잡았다 — 피드 102 는 FRIENDS 인데 전체 공개로 찍혔다).
  // 문구는 24-4 공개 설정(FEED_VISIBILITY)이 쓰는 말을 그대로 쓴다.
  const VISIBILITY_LABEL = { PUBLIC: '전체공개', FRIENDS: '친구만', PRIVATE: '나만 보기' };
  const visibilityText = VISIBILITY_LABEL[feed.visibility] || '전체공개';

  const save = async () => {
    if (!trimmed || !changed || busy) return;
    setBusy(true);
    setError('');
    try {
      await window.MoyeoApi.updateFeed(feedId, trimmed);
      nav.back();
    } catch (saveError) {
      setError(window.userFacingError(saveError, '기록을 수정하지 못했어요.'));
      setBusy(false);
    }
  };

  const LockedRow = ({ icon, title, reason }) => (
    <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '11px 13px', borderTop: `1px solid ${RF.softLine}` }}>
      <Icon name={icon} size={15} color={T.text400}/>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: T.text700 }}>{title}</div>
        <div style={{ fontSize: 11, color: T.text400, marginTop: 3, lineHeight: '16px' }}>{reason}</div>
      </div>
      <Icon name="lock" size={13} color={T.text400}/>
    </div>
  );

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="여행 기록 수정" left center onBack={nav.back}/>

        <div style={{ position: 'absolute', top: 92, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '16px 20px 20px' }}>
          <div style={{ fontSize: 12.5, fontWeight: 900, marginBottom: 8, color: T.text900 }}>
            글 <span style={{ color: T.danger }}>*</span>
          </div>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value.slice(0, LIMIT))}
            aria-label="여행 기록 글"
            data-testid="feed-edit-body"
            style={{
              width: '100%', minHeight: 148, borderRadius: 12, border: `1px solid ${T.line200}`,
              padding: 12, fontSize: 13, lineHeight: '20px', color: T.text900,
              fontFamily: T.fontStack, resize: 'none', background: 'transparent', boxSizing: 'border-box',
            }}
          />
          <div style={{ textAlign: 'right', marginTop: 6, fontSize: 11, color: T.text400, fontVariantNumeric: 'tabular-nums' }}>
            {body.length}/{LIMIT.toLocaleString('ko-KR')}
          </div>

          {/* 못 고치는 것은 감추지 않고 이유를 적는다 — 감추면 "왜 없지?" 로 남는다 */}
          <div style={{ marginTop: 14, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: T.bgSubtle, overflow: 'hidden' }}>
            <div style={{ fontSize: 11.5, fontWeight: 900, color: T.text700, padding: '11px 13px 2px' }}>여기서 못 바꾸는 것</div>
            <LockedRow icon="image" title={`사진 ${photos}장`} reason="사진은 바꿀 수 없어요. 다시 올리려면 기록을 지우고 새로 써요."/>
            <LockedRow icon="lock" title={`공개 범위 · ${visibilityText}`} reason="댓글 쓴 분이 갑자기 못 보게 되지 않도록 처음 정한 값을 그대로 둬요."/>
            <LockedRow icon="map" title={feed.tripTitle || feed.courseTitle || '연결된 여행'} reason="어느 여행의 기록인지는 바꿀 수 없어요."/>
          </div>

          {error && <div role="alert" style={{ marginTop: 10, fontSize: 11.5, color: T.danger, fontWeight: 700 }}>{error}</div>}

          {/* 삭제는 저장 CTA 와 멀리 떼어 놓는다 (20-3a 와 같은 규칙) */}
          <button type="button" onClick={() => nav.go('feed-delete')} data-testid="feed-edit-delete" style={{
            marginTop: 24, width: '100%', height: 46, borderRadius: 12, cursor: 'pointer',
            border: `1px solid ${T.line200}`, background: 'transparent', fontFamily: T.fontStack,
            color: T.danger, fontSize: 13, fontWeight: 800,
          }}>
            이 기록 삭제하기
          </button>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}` }}>
          <Btn variant="primary" full disabled={!trimmed || !changed || busy} onClick={save}>
            {busy ? '저장하는 중이에요…' : '수정 저장'}
          </Btn>
        </div>
      </div>
    </Phone>
  );
}

/** 내가 쓴 댓글 중 가장 최근 것. 답글도 후보다(서버가 최상위를 최신순으로 준다). */
function newestOwnComment(comments, myId) {
  for (const comment of comments) {
    if (Number(comment.author?.userId) === myId) return comment;
    const reply = newestOwnComment(comment.replies || [], myId);
    if (reply) return reply;
  }
  return null;
}

// 목록에서 고르고 온 댓글을 최상위·답글 어느 쪽에서든 찾는다 (W-37).
function findComment(comments, commentId) {
  for (const comment of comments) {
    if (String(comment.commentId) === String(commentId)) return comment;
    const reply = findComment(comment.replies || [], commentId);
    if (reply) return reply;
  }
  return null;
}

// ───────── 23-1a · 내 댓글 수정 · 삭제 ─────────
// 댓글은 **그 자리에서** 고친다 — 별 화면으로 보내면 어느 댓글을 고치는지 잃는다.
// 서버 한도는 **500자**다(신고 details 의 300자와 다르다).
// 최상위 댓글을 지우면 **달린 답글도 함께** 사라진다 — 먼저 알려야 한다.
function ScreenCommentEdit() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const { liveMode, feedId, ready } = useEditFeed();
  const [threads, setThreads] = React.useState(null);
  const [meId, setMeId] = React.useState(null);
  const [state, setState] = React.useState('loading');
  const [editingId, setEditingId] = React.useState(null);
  const [draft, setDraft] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [reloadToken, setReloadToken] = React.useState(0);
  const LIMIT = 500;

  React.useEffect(() => {
    if (!ready) return undefined;
    let active = true;
    setState('loading');
    Promise.all([window.MoyeoApi.feedComments(feedId, { limit: 100 }), window.MoyeoApi.myProfile()])
      .then(([page, me]) => {
        if (!active) return;
        const list = page?.comments || [];
        setThreads(list);
        const mineId = Number(me?.userId);
        setMeId(mineId);
        setState(list.length ? 'ready' : 'empty');
        // 이 화면(`comment-edit`)은 이름 그대로 **댓글을 고치러 오는 자리**다.
        // 인앱에서는 목록에서 「수정·삭제」를 눌러 대상을 들고 오지만, 라우트로 바로 열면
        // 대상이 없다 — 그때는 **내 가장 최근 댓글**을 편집 상태로 연다(기획 23-1a 와 같은 상태).
        setEditingId((current) => {
          if (current) return current;
          // 목록(23-1)에서 「수정 · 삭제」를 눌러 왔으면 그 댓글을 연다 (W-37).
          const requested = nav.params?.commentId;
          if (requested != null) {
            const picked = findComment(list, requested);
            if (picked) { setDraft(picked.content || ''); return picked.commentId; }
          }
          const mine = newestOwnComment(list, mineId);
          if (!mine) return current;
          setDraft(mine.content || '');
          return mine.commentId;
        });
      })
      .catch(() => { if (active) setState('error'); });
    return () => { active = false; };
  }, [feedId, ready, reloadToken]);

  if (!ready || (state !== 'ready')) {
    return <GapNotice title="댓글" status={liveMode ? (ready ? state : 'empty') : 'signed-out'} emptyText="아직 댓글이 없어요." onBack={nav.back} onRetry={() => setReloadToken((n) => n + 1)} testId="comment-edit-state"/>;
  }

  const save = async (commentId) => {
    const trimmed = draft.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError('');
    try {
      await window.MoyeoApi.updateFeedComment(feedId, commentId, trimmed);
      setEditingId(null);
      setBusy(false);
      setReloadToken((n) => n + 1);
    } catch (saveError) {
      setError(window.userFacingError(saveError, '댓글을 수정하지 못했어요.'));
      setBusy(false);
    }
  };

  const remove = async (commentId) => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await window.MoyeoApi.deleteFeedComment(feedId, commentId);
      setEditingId(null);
      setBusy(false);
      setReloadToken((n) => n + 1);
    } catch (deleteError) {
      setError(window.userFacingError(deleteError, '댓글을 지우지 못했어요.'));
      setBusy(false);
    }
  };

  const Bubble = ({ comment, depth }) => {
    const author = comment.author || {};
    const mine = Number(author.userId) === meId;
    const editing = editingId === comment.commentId;
    const replies = comment.replies || [];
    return (
      <div style={{ marginLeft: depth * 24 }}>
        <div style={{ display: 'flex', gap: 9, padding: '13px 0', borderBottom: editing ? 'none' : `1px solid ${RF.softLine}` }}>
          <ProfileAvatar src={author.profileImageUrl} nickname={author.nickname} size={depth ? 26 : 34}/>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: T.text900 }}>{author.nickname || ''}</div>
              <div style={{ fontSize: 10.5, color: T.text400 }}>{window.MoyeoApi.formatRelative(comment.createdAt)}</div>
              {editing && <div style={{ fontSize: 10.5, color: T.primary500, fontWeight: 800 }}>수정 중</div>}
            </div>

            {editing ? (
              <>
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value.slice(0, LIMIT))}
                  aria-label="댓글 수정"
                  data-testid="comment-edit-input"
                  style={{
                    width: '100%', marginTop: 7, minHeight: 62, borderRadius: 12,
                    border: `1px solid ${T.primary500}`, padding: 11, background: RF.card,
                    fontSize: 13, lineHeight: '19px', color: T.text900,
                    fontFamily: T.fontStack, resize: 'none', boxSizing: 'border-box',
                  }}
                />
                <div style={{ textAlign: 'right', marginTop: 6, fontSize: 11, color: T.text400, fontVariantNumeric: 'tabular-nums' }}>
                  {draft.length}/{LIMIT.toLocaleString('ko-KR')}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 9, alignItems: 'center' }}>
                  <button type="button" onClick={() => save(comment.commentId)} disabled={busy || !draft.trim()} data-testid="comment-edit-save" style={{
                    height: 36, padding: '0 14px', borderRadius: 10, cursor: 'pointer',
                    border: 'none', background: T.primary500, color: '#fff', opacity: busy || !draft.trim() ? 0.72 : 1,
                    fontFamily: T.fontStack, fontSize: 12.5, fontWeight: 800,
                  }}>수정 저장</button>
                  <button type="button" onClick={() => setEditingId(null)} style={{
                    height: 36, padding: '0 14px', borderRadius: 10, cursor: 'pointer',
                    border: `1px solid ${T.line200}`, background: 'transparent', color: T.text700,
                    fontFamily: T.fontStack, fontSize: 12.5, fontWeight: 700,
                  }}>취소</button>
                  <div style={{ flex: 1 }}/>
                  <button type="button" onClick={() => remove(comment.commentId)} disabled={busy} data-testid="comment-edit-delete" style={{
                    height: 36, padding: '0 12px', borderRadius: 10, cursor: 'pointer',
                    border: 'none', background: 'transparent', color: T.danger,
                    fontFamily: T.fontStack, fontSize: 12.5, fontWeight: 800,
                  }}>삭제</button>
                </div>
                <div style={{ fontSize: 11, color: T.text400, marginTop: 7, lineHeight: '16px' }}>
                  삭제하면 바로 사라져요.
                  {depth === 0 && replies.length > 0 && <> <b style={{ color: T.text700 }}>이 댓글에 달린 답글 {replies.length}개도 함께</b> 없어져요.</>}
                  {' '}되돌릴 수 없어요.
                </div>
                {error && <div role="alert" style={{ marginTop: 7, fontSize: 11.5, color: T.danger, fontWeight: 700 }}>{error}</div>}
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, lineHeight: '19px', color: T.text700, marginTop: 3 }}>{comment.content || ''}</div>
                {/* 내 댓글에만 수정 진입점을 낸다 — 남의 댓글은 서버가 403 으로 막는다.
                    「수정 · 삭제」를 회색 한 덩어리로 두면 버튼으로 안 보인다 —
                    두 낱말로 갈라 각자의 색을 준다 (23-1a, 사용자 지적 2026-09-09). */}
                {mine && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 5 }}>
                    <button type="button" onClick={() => { setEditingId(comment.commentId); setDraft(comment.content || ''); setError(''); }} data-testid="comment-edit-open" style={{
                      padding: 0, border: 0, background: 'transparent', cursor: 'pointer',
                      color: T.primary600, fontFamily: T.fontStack, fontSize: 11.5, fontWeight: 800,
                    }}>수정</button>
                    <button type="button" onClick={() => { setEditingId(comment.commentId); setDraft(comment.content || ''); setError(''); }} data-testid="comment-delete-open" style={{
                      padding: 0, border: 0, background: 'transparent', cursor: 'pointer',
                      color: T.danger, fontFamily: T.fontStack, fontSize: 11.5, fontWeight: 800,
                    }}>삭제</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {replies.map((reply) => <Bubble key={reply.commentId} comment={reply} depth={depth + 1}/>)}
      </div>
    );
  };

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="댓글" left center onBack={nav.back}/>
        <div style={{ position: 'absolute', top: 92, left: 0, right: 0, bottom: 0, overflow: 'auto', padding: '4px 20px 24px' }}>
          {threads.map((comment) => <Bubble key={comment.commentId} comment={comment} depth={0}/>)}
        </div>
      </div>
    </Phone>
  );
}

// ───────── 18-6 · 모집 내용 수정 (호스트) ─────────
// `PATCH /chat-rooms/{roomId}` (multipart · BE 회신 §4).
// 18-5 집합 정보 수정과 **다른 화면**이다 — 그쪽은 `PUT .../meeting-info` 다.
// **모집 중인 방의 호스트만** 되고, 확정한 뒤에는 아무것도 못 고친다.
// 18-6 모집 제목 화면 한도. 서버 `UpdateChatRoomRequest.title` 은 `@Size(max = 100)` 이다.
// 2026-09-14 결정 ②: 화면을 24 로 좁혀 두던 것을 **서버와 같은 100** 으로 맞춘다 —
// 25자 넘는 제목의 모집은 제목을 건드리지 않아도 저장이 막혔다(ROUND-2026-09-14-DECISIONS ②).
// **서버에서 읽어 온 값은 자르지 않는다.** 자르고 저장하면 사용자가 건드린 적 없는 제목이
// 짧아진 채로 덮어써진다 — 그래서 넘친 상태는 그대로 두고 저장만 막는다(W-129).
const RECRUIT_TITLE_LIMIT = 100;

function ScreenRecruitEdit() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const { liveMode, roomId, ready } = useEditRoom();
  const [room, setRoom] = React.useState(null);
  const [state, setState] = React.useState('loading');
  const [form, setForm] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  // 이 방의 코스가 직접 만든(CUSTOM) 것인지. 18-7 로 가는 버튼을 낼지 여기서 갈린다.
  // 방 상세에는 코스 **제목**만 있어 코스 조회로 따로 읽는다.
  const [courseType, setCourseType] = React.useState(null);
  // 새 대표 사진. 고르지 않으면 보내지 않아 **서버가 지금 사진을 그대로 둔다**(PATCH 규칙).
  const [thumbnailFile, setThumbnailFile] = React.useState(null);
  const [thumbnailPreview, setThumbnailPreview] = React.useState('');
  const fileInputRef = React.useRef(null);

  // 고른 파일의 미리보기 URL 은 반드시 되돌려준다 — 안 하면 탭을 옮길 때마다 새다.
  React.useEffect(() => {
    if (!thumbnailFile) { setThumbnailPreview(''); return undefined; }
    const url = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnailFile]);

  React.useEffect(() => {
    if (!ready) return undefined;
    let active = true;
    setState('loading');
    Promise.all([window.MoyeoApi.roomDetail(roomId), window.MoyeoApi.myProfile()])
      .then(([detail, me]) => {
        if (!active) return;
        const host = Number(detail?.hostId) === Number(me?.userId);
        const recruiting = detail?.status === 'RECRUITING';
        setRoom(detail);
        setForm({
          title: detail?.title || '',
          description: detail?.description || '',
          tripType: detail?.tripType || 'DAY_TRIP',
          minimumParticipants: detail?.minimumParticipants ?? null,
          maxParticipants: detail?.maxParticipants ?? null,
          startDate: detail?.startDate || null,
          endDate: detail?.endDate || null,
          recruitmentDeadlineDate: detail?.recruitmentDeadlineDate || null,
          dayTripStartTime: detail?.dayTripStartTime || null,
          dayTripEndTime: detail?.dayTripEndTime || null,
          participationFee: detail?.participationFee ?? 0,
        });
        setState(host && recruiting ? 'ready' : 'empty');
      })
      .catch(() => { if (active) setState('error'); });
    // 코스 종류는 있으면 쓰고 없으면 없는 대로 둔다 — 못 읽었다고 이 화면을 막지는 않는다.
    window.MoyeoApi.roomCourse(roomId)
      .then((result) => { if (active && result?.course) setCourseType(result.course.type || null); })
      .catch(() => {});
    return () => { active = false; };
  }, [roomId, ready]);

  if (!ready || state !== 'ready') {
    return <GapNotice title="모집 내용 수정" status={liveMode ? (ready ? state : 'empty') : 'signed-out'} emptyText="모집 중인 내 모임만 수정할 수 있어요." onBack={nav.back} testId="recruit-edit-state"/>;
  }

  const patch = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  // 날짜·인원·참가비를 고칠 수 있게 되면서 **틀린 값도 들어올 수 있게 됐다.**
  // 서버가 400 으로 돌려보내기 전에 같은 규칙으로 여기서 먼저 잡고, 어디가 틀렸는지 한국어로 말한다.
  const validate = () => {
    if (!form.title.trim()) return '모집 제목을 적어 주세요.';
    // 만들 때는 한도가 없어서 24자가 넘는 제목으로 열린 모집이 있다. 그런 제목을 여기서
    // 말없이 잘라 저장하면 사용자가 고친 적 없는 이름이 짧아진다 — 대신 저장을 막고 알린다.
    if (form.title.length > RECRUIT_TITLE_LIMIT) {
      return `모집 제목이 ${form.title.length}자예요. ${RECRUIT_TITLE_LIMIT}자까지만 저장할 수 있어요 — 먼저 줄여 주세요.`;
    }
    // 소개 500자는 서버 한도 그대로다(`UpdateChatRoomRequest.description` @Size(max = 500)).
    if (form.description.length > 500) {
      return `소개가 ${form.description.length}자예요. 500자까지만 저장할 수 있어요 — 먼저 줄여 주세요.`;
    }
    if (!form.startDate) return '여행 날짜를 정해 주세요.';
    if (!form.recruitmentDeadlineDate) return '모집 마감일을 정해 주세요.';
    if (form.recruitmentDeadlineDate > form.startDate) return '모집 마감일은 여행 날짜보다 앞이어야 해요.';
    if (form.tripType === 'DAY_TRIP') {
      if (!form.dayTripStartTime || !form.dayTripEndTime) return '당일치기는 시작·종료 시각을 정해 주세요.';
      if (form.dayTripStartTime >= form.dayTripEndTime) return '종료 시각은 시작 시각보다 뒤여야 해요.';
    } else if (!form.endDate) {
      return '1박 이상이면 종료 날짜를 정해 주세요.';
    } else if (form.endDate <= form.startDate) {
      return '종료 날짜는 여행 시작 날짜보다 뒤여야 해요.';
    }
    const min = form.minimumParticipants;
    const max = form.maxParticipants;
    if (min === null || max === null) return '인원을 정해 주세요.';
    if (min < 3 || max < 3) return '인원은 3명부터 정할 수 있어요.';
    if (min > max) return '최소 인원이 최대 인원보다 많아요.';
    if (max < (room.participantCount ?? 0)) return `이미 ${room.participantCount}명이 참여 중이라 최대 인원을 그보다 적게 줄일 수 없어요.`;
    return '';
  };

  const save = async () => {
    if (busy) return;
    const invalid = validate();
    if (invalid) { setError(invalid); return; }
    setBusy(true);
    setError('');
    try {
      // 여행 유형에 따라 **반대쪽 값은 반드시 비워 보낸다** — 서버가 둘 다 차 있으면 거절한다.
      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        endDate: form.tripType === 'OVERNIGHT' ? form.endDate : null,
        dayTripStartTime: form.tripType === 'DAY_TRIP' ? form.dayTripStartTime : null,
        dayTripEndTime: form.tripType === 'DAY_TRIP' ? form.dayTripEndTime : null,
        participationFee: form.participationFee ?? 0,
      };
      await window.MoyeoApi.updateRoom(roomId, payload, thumbnailFile);
      // 제목·대표 사진·일정이 바뀌면 목록 카드의 내용도 바뀐다 — 탭 보관소를 덜어내지 않으면
      // 모임 목록이 옛 제목을 그대로 들고 있다(W-140 · TAB-STATE-CANON R4).
      window.MoyeoTabCache?.invalidate?.(window.MoyeoTabCache.ROOM_LIST_KEYS);
      nav.back();
    } catch (saveError) {
      setError(window.userFacingError(saveError, '모집 정보를 수정하지 못했어요.'));
      setBusy(false);
    }
  };

  // 입력값은 한도를 넘겨도 **자르지 않는다** — 넘친 글자를 말없이 지우면 무엇이 저장됐는지
  // 알 수 없고, 서버에서 읽어 온 긴 제목이 사용자가 건드리지도 않은 채 짧아진다(W-129).
  // 넘친 것은 카운터가 빨갛게 말하고 `validate()` 가 저장을 막는다.
  const FieldBox = ({ label, value, hint, required, locked, lockReason, multiline, onChange, testId, limit }) => (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 12.5, fontWeight: 900, marginBottom: 7, color: T.text900, display: 'flex', gap: 6, alignItems: 'center' }}>
        {label}
        {required && <span style={{ color: T.danger }}>*</span>}
        {locked && <Icon name="lock" size={13} color={T.text400}/>}
      </div>
      {locked || !onChange ? (
        <div style={{
          minHeight: multiline ? 92 : 46, borderRadius: 12, padding: multiline ? 12 : '13px 12px',
          border: `1px solid ${locked ? RF.softLine : T.line200}`,
          background: locked ? T.bgSubtle : 'transparent',
          fontSize: 13, lineHeight: '20px', color: locked ? T.text500 : T.text900,
        }}>{value}</div>
      ) : multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} data-testid={testId} style={{
          width: '100%', minHeight: 92, borderRadius: 12, border: `1px solid ${T.line200}`, padding: 12,
          fontSize: 13, lineHeight: '20px', color: T.text900, fontFamily: T.fontStack,
          resize: 'none', background: 'transparent', boxSizing: 'border-box',
        }}/>
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} data-testid={testId} style={{
          width: '100%', height: 46, borderRadius: 12, border: `1px solid ${T.line200}`, padding: '0 12px',
          fontSize: 13, color: T.text900, fontFamily: T.fontStack, background: 'transparent', boxSizing: 'border-box',
        }}/>
      )}
      {/* 글자 수는 네 표면이 같은 자리(입력창 아래 우측)에 그린다.
          한도를 넘긴 값(서버에서 그대로 읽어 온 긴 제목)은 「29/24」처럼 그려질 수밖에 없는데,
          예전에는 회색이라 정상으로 보였다 — 넘친 것은 빨갛게 적고 무엇을 해야 하는지 말한다. */}
      {limit && !locked && (() => {
        const length = String(value || '').length;
        const over = length > limit;
        return (
          <div style={{ textAlign: 'right', marginTop: 5, fontSize: 11, color: over ? T.danger : T.text400, fontWeight: over ? 800 : 400, fontVariantNumeric: 'tabular-nums' }}>
            {length}/{limit.toLocaleString('ko-KR')}{over ? ` · ${length - limit}자 넘었어요` : ''}
          </div>
        );
      })()}
      {(hint || lockReason) && (
        <div style={{ fontSize: 11, color: T.text400, marginTop: 6, lineHeight: '16px' }}>{lockReason || hint}</div>
      )}
    </div>
  );

  // 라벨·필수 표시·안내문만 FieldBox 와 똑같이 그리고, **안은 호출부가 채운다.**
  // 날짜·시각·인원처럼 입력 요소가 여러 개인 칸에 쓴다.
  const FieldGroup = ({ label, required, hint, children }) => (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 12.5, fontWeight: 900, marginBottom: 7, color: T.text900, display: 'flex', gap: 6, alignItems: 'center' }}>
        {label}
        {required && <span style={{ color: T.danger }}>*</span>}
      </div>
      {children}
      {hint && <div style={{ fontSize: 11, color: T.text400, marginTop: 6, lineHeight: '16px' }}>{hint}</div>}
    </div>
  );

  const boxStyle = {
    flex: 1, height: 46, borderRadius: 12, border: `1px solid ${T.line200}`, padding: '0 12px',
    fontSize: 13, color: T.text900, fontFamily: T.fontStack, background: 'transparent', boxSizing: 'border-box',
  };

  // 서버는 `2026-10-24` 꼴을 받는다 — `<input type="date">` 의 값이 그대로 그 꼴이다.
  const DateInput = ({ value, onChange, label, testId }) => (
    <input type="date" value={value || ''} onChange={(event) => onChange(event.target.value || null)}
      aria-label={label} data-testid={testId} style={boxStyle}/>
  );

  // 서버는 `09:00:00` 꼴을 받는데 `<input type="time">` 은 `09:00` 을 준다 — 초를 붙여 보낸다.
  const TimeInput = ({ value, onChange, label, testId }) => (
    <input type="time" value={String(value || '').slice(0, 5)}
      onChange={(event) => onChange(event.target.value ? `${event.target.value}:00` : null)}
      aria-label={label} data-testid={testId} style={boxStyle}/>
  );

  // 숫자만 남긴다. 지우는 도중(빈 값)에는 null 로 두고 저장할 때 막는다 —
  // 여기서 곧바로 0 이나 최솟값으로 되돌리면 한 글자도 지울 수 없다.
  // **아래 한도는 여기서 막지 않는다.** 최소 인원 3명인데 「12」를 치려면 먼저 「1」을 지나야 하고,
  // 그때 3으로 끌어올리면 두 자리 수를 아예 입력할 수 없다. 하한은 저장할 때 `validate()` 가 본다.
  const NumberInput = ({ value, onChange, label, suffix, max, testId }) => (
    <div style={{ ...boxStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
      <input
        type="text"
        inputMode="numeric"
        value={value === null || value === undefined ? '' : String(value)}
        onChange={(event) => {
          const digits = event.target.value.replace(/[^0-9]/g, '').slice(0, String(max).length);
          if (digits === '') { onChange(null); return; }
          onChange(Math.min(Number(digits), max));
        }}
        aria-label={label}
        data-testid={testId}
        style={{
          flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
          fontSize: 13, color: T.text900, fontFamily: T.fontStack, textAlign: 'right',
          fontVariantNumeric: 'tabular-nums', padding: 0,
        }}
      />
      <span style={{ fontSize: 12, color: T.text400 }}>{suffix}</span>
    </div>
  );

  // 날짜는 「2026.10.24 (토)」 꼴이다 — 기획이 그렇게 쓴다.
  // 예전에는 서버 값(`2026-10-24`)을 그대로 찍어 요일이 없고 구분자도 달랐다 (18-6, 2026-09-09).
  const dateText = (value) => (value ? window.MoyeoApi.formatDate(value) : '');
  const scheduleText = form.tripType === 'DAY_TRIP'
    ? `${dateText(form.startDate)} · ${String(form.dayTripStartTime || '').slice(0, 5)} – ${String(form.dayTripEndTime || '').slice(0, 5)}`
    : `${dateText(form.startDate)} – ${dateText(form.endDate)}`;

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="모집 내용 수정" left center onBack={nav.back}/>

        <div style={{ position: 'absolute', top: 92, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '12px 20px 20px' }}>
          <div style={{ padding: '11px 13px', borderRadius: 10, background: T.bgSubtle, border: `1px solid ${RF.softLine}`, fontSize: 11.5, color: T.text500, lineHeight: '17px' }}>
            <b style={{ color: T.text700 }}>모집 중</b>이라 아직 고칠 수 있어요.
            여행을 확정하면 더는 고칠 수 없어요 — 이미 신청한 분의 약속이 달라지니까요.
          </div>

          <FieldBox label="모집 제목" required limit={RECRUIT_TITLE_LIMIT} value={form.title} onChange={(value) => patch('title', value)} hint={`${RECRUIT_TITLE_LIMIT}자까지 · 모임 목록과 홈에 이 이름이 보여요`} testId="recruit-edit-title"/>
          <FieldBox label="소개" multiline limit={500} value={form.description} onChange={(value) => patch('description', value)} hint="500자까지" testId="recruit-edit-description"/>

          {/* 대표 사진 — 서버는 선택 `thumbnail` 파일 파트를 받는다 (BE 회신 §4).
              **고르지 않으면 보내지 않아** 지금 사진이 그대로 남는다. 비우는 길은 없다. */}
          <div style={{ fontSize: 12.5, fontWeight: 900, margin: '18px 0 8px', color: T.text900 }}>대표 사진</div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            data-testid="recruit-edit-thumbnail-input"
            onChange={(event) => { setThumbnailFile(event.target.files?.[0] || null); event.target.value = ''; }}
            style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
          />
          {/* 안내 문구는 두지 않는다 — 안 바꾸면 그대로라는 건 설명할 필요가 없고,
              새로 고른 건 미리보기 위 배지로 보인다. */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 104, height: 78, flexShrink: 0, borderRadius: 12, overflow: 'hidden', border: `1px solid ${RF.softLine}` }}>
              {thumbnailPreview
                ? <img src={thumbnailPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
                : room.thumbnail
                  ? <CachedImage src={room.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
                  : <ImgPlaceholder hue="forest" height={78} radius={0}/>}
              {thumbnailFile && (
                <span style={{
                  position: 'absolute', left: 6, bottom: 6, padding: '2px 7px', borderRadius: 6,
                  background: T.primary500, color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '-0.2px',
                }}>새 사진</span>
              )}
            </div>
            <Btn variant="secondary" icon="camera" onClick={() => fileInputRef.current?.click()} testId="recruit-edit-thumbnail-pick">사진 바꾸기</Btn>
          </div>

          <div style={{ fontSize: 12.5, fontWeight: 900, margin: '18px 0 8px', color: T.text900 }}>
            여행 유형 <span style={{ color: T.danger }}>*</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['DAY_TRIP', '당일치기'], ['OVERNIGHT', '1박 이상']].map(([id, label]) => (
              <button key={id} type="button" onClick={() => patch('tripType', id)} style={{
                flex: 1, height: 44, borderRadius: 12, cursor: 'pointer', fontFamily: T.fontStack,
                border: `1px solid ${form.tripType === id ? T.primary500 : T.line200}`,
                background: form.tripType === id ? T.primary50 : 'transparent',
                color: form.tripType === id ? T.primary700 : T.text700,
                fontSize: 13, fontWeight: form.tripType === id ? 900 : 700,
              }}>{label}</button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: T.text400, marginTop: 6 }}>당일치기는 시작·종료 시각을, 1박 이상은 종료 날짜를 받아요</div>

          {/* 날짜·인원·참가비는 **서버가 받는 값**이다 (`PUT /chat-rooms/{roomId}` 의
              startDate·endDate·recruitmentDeadlineDate·min/maxParticipants·participationFee).
              예전에는 입력처럼 생긴 상자에 요약 문구만 찍어 놓고 `onChange` 를 주지 않아
              **필수(*) 표시와 규칙 안내까지 달린 채 아무것도 고칠 수 없었다** (W-106, 2026-09-12). */}
          <FieldGroup label="여행 날짜" required hint={form.tripType === 'DAY_TRIP' ? '모집 마감일보다 뒤여야 해요' : '종료 날짜는 시작 날짜보다 뒤여야 해요'}>
            <div style={{ display: 'flex', gap: 8 }}>
              <DateInput value={form.startDate} onChange={(value) => patch('startDate', value)} label="여행 시작 날짜" testId="recruit-edit-start-date"/>
              {form.tripType === 'OVERNIGHT' && (
                <DateInput value={form.endDate} onChange={(value) => patch('endDate', value)} label="여행 종료 날짜" testId="recruit-edit-end-date"/>
              )}
            </div>
            {form.tripType === 'DAY_TRIP' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <TimeInput value={form.dayTripStartTime} onChange={(value) => patch('dayTripStartTime', value)} label="시작 시각" testId="recruit-edit-start-time"/>
                <TimeInput value={form.dayTripEndTime} onChange={(value) => patch('dayTripEndTime', value)} label="종료 시각" testId="recruit-edit-end-time"/>
              </div>
            )}
            <div style={{ fontSize: 11, color: T.text400, marginTop: 6 }}>지금 설정: {scheduleText}</div>
          </FieldGroup>

          <FieldGroup label="모집 마감일" required hint="여행 날짜보다 앞이어야 해요">
            <DateInput value={form.recruitmentDeadlineDate} onChange={(value) => patch('recruitmentDeadlineDate', value)} label="모집 마감일" testId="recruit-edit-deadline"/>
            <div style={{ fontSize: 11, color: T.text400, marginTop: 6 }}>지금 설정: {dateText(form.recruitmentDeadlineDate) || '없음'}</div>
          </FieldGroup>

          <FieldGroup label="인원" required hint={`최대 인원은 지금 참여 중인 ${room.participantCount ?? 0}명보다 적게 줄일 수 없어요 · 3~20명`}>
            <div style={{ display: 'flex', gap: 8 }}>
              <NumberInput value={form.minimumParticipants} onChange={(value) => patch('minimumParticipants', value)} label="최소 인원" suffix="명" max={20} testId="recruit-edit-min-participants"/>
              <NumberInput value={form.maxParticipants} onChange={(value) => patch('maxParticipants', value)} label="최대 인원" suffix="명" max={20} testId="recruit-edit-max-participants"/>
            </div>
          </FieldGroup>

          <FieldGroup label="참가비" hint="0원이면 “무료”로 보여요">
            <NumberInput value={form.participationFee} onChange={(value) => patch('participationFee', value)} label="1인 참가비" suffix="원" max={9999999} testId="recruit-edit-fee"/>
          </FieldGroup>

          {/* 2026-09-15 결정 ⑫ — 예전 문구 「코스 자체는 여기서 못 바꿔요」는
              「여기서는 못 한다 = 다른 데서는 된다」로 읽혀 사용자가 있지도 않은 화면을 찾게 했다.
              서버 `UpdateChatRoomRequest` 에 `courseId` 가 없다 — 코스는 방을 만들 때만 붙는다.
              코스를 **교체**하는 것과 코스의 **내용을 고치는** 것은 다르므로 뒷문장으로 갈라 둔다. */}
          <FieldBox
            label="연결된 코스"
            locked
            value={`${room.courseTitle || '연결된 코스 없음'}`}
            lockReason="모집을 만든 뒤에는 코스를 바꿀 수 없어요. 방문지 순서는 「여행 경로」에서 고쳐요."
          />
          {/* 코스 이름·소개를 고치는 화면(18-7)은 만들어져 있는데 **앱 어디에도 여는 곳이 없었다**
              — 그런데 이 화면이 사용자에게 「18-7 에서 고쳐요」라고 내부 화면 번호까지 보여 줬다 (W-108).
              단, 18-7 은 **직접 만든 코스만** 받는다. 등록 코스 방에서는 눌러도
              「직접 만든 코스만, 여행 확정 전에 고칠 수 있어요.」 한 줄짜리 빈 화면이 열렸다
              (W-123 · HOST-025). 죽은 버튼을 두지 않되 왜 없는지는 적는다 —
              iOS `RecruitEditCourseSections.swift` 와 같은 처리다. */}
          <div style={{ marginTop: 10 }}>
            {courseType === 'CUSTOM' ? (
              <Btn onClick={() => nav.go('course-title-edit')} testId="recruit-edit-open-course-title">코스 이름·소개 고치기</Btn>
            ) : courseType ? (
              <div data-testid="recruit-edit-course-title-locked" style={{ fontSize: 11, color: T.text400, lineHeight: '16px' }}>
                등록된 코스를 그대로 쓰는 모임이라 코스 이름·소개는 고칠 수 없어요.
              </div>
            ) : null}
          </div>

          <div style={{ marginTop: 16, padding: '11px 13px', borderRadius: 10, background: T.bgSubtle, border: `1px solid ${RF.softLine}`, display: 'flex', gap: 9, alignItems: 'flex-start' }}>
            <Icon name="chat" size={15} color={T.text400}/>
            <div style={{ flex: 1, fontSize: 11.5, color: T.text500, lineHeight: '17px' }}>
              저장하면 채팅방에 <b style={{ color: T.text700 }}>“호스트가 모집 정보를 수정했어요.”</b>가 남고 참여자에게 알려요.
            </div>
          </div>

          {error && <div role="alert" style={{ marginTop: 10, fontSize: 11.5, color: T.danger, fontWeight: 700 }}>{error}</div>}

          {/* 방 삭제는 없다 — 취소로 갈음한다 (BE 회신 §4). 지어내지 않고 있는 길만 안내한다 */}
          <div style={{ marginTop: 22, padding: '13px', borderRadius: 12, border: `1px solid ${T.line200}` }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: T.text900 }}>모집을 그만두려면</div>
            <div style={{ fontSize: 11.5, color: T.text400, marginTop: 5, lineHeight: '17px' }}>
              모집을 <b style={{ color: T.text700 }}>취소</b>하면 참여자에게 알림이 가고 채팅방은 읽기 전용으로 남아요.
              방을 아예 지우는 건 없어요.
            </div>
            <div style={{ marginTop: 10 }}>
              <button type="button" onClick={() => nav.go('trip-status')} style={{
                width: '100%', height: 44, borderRadius: 12, cursor: 'pointer',
                border: `1px solid ${T.line200}`, background: 'transparent', fontFamily: T.fontStack,
                color: T.danger, fontSize: 13, fontWeight: 800,
              }}>모집 취소하기</button>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}` }}>
          <Btn variant="primary" full disabled={busy} onClick={save}>
            {busy ? '저장하는 중이에요…' : '수정 저장'}
          </Btn>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 18-7 · 코스 이름 · 소개 수정 ─────────
// `PATCH /travel-courses/chat-rooms/{roomId}` — 기존 요청에 `title`·`description` 선택
// 필드가 추가됐다 (BE 회신 §5). 이름을 고칠 길이 없어서 `27-3 검증용 커스텀 코스 모임`
// 같은 이름이 홈에 걸려 있었다.
// **호스트가 직접 만든 CUSTOM 코스이고, 여행 확정 전일 때만** 고칠 수 있다.
function ScreenCourseTitleEdit() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const { liveMode, roomId, ready } = useEditRoom();
  const [course, setCourse] = React.useState(null);
  const [state, setState] = React.useState('loading');
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  // 코스 제목 한도는 **100** 이다 — 서버 `UpdateTravelCourseRequest.title` `maxLength: 100`
  // (실서버 `/api-docs` 확인 2026-09-14)이고 17-1 코스 만들기도 `100` 으로 센다.
  // 여기만 24 라서, 25자 넘는 코스 이름은 한 글자도 안 고쳤는데 저장이 막혔다 (QA HOST-026).
  // (18-6 **모집 제목**의 24 와 다른 값이다 — 그쪽은 모집 제목이고 이건 코스 제목이다.)
  const TITLE_LIMIT = 100;
  // 서버 `UpdateTravelCourseRequest.description` 도 **max 500** 이다.
  const DESC_LIMIT = 500;

  React.useEffect(() => {
    if (!ready) return undefined;
    let active = true;
    setState('loading');
    Promise.all([window.MoyeoApi.roomCourse(roomId), window.MoyeoApi.roomDetail(roomId), window.MoyeoApi.myProfile()])
      .then(([payload, room, me]) => {
        if (!active) return;
        // 응답은 `{room, course}` 다 — **`course` 를 꺼내야** type·title 이 보인다.
        // 벗기지 않아 `detail.type` 이 늘 undefined 였고, 그래서 조건이 항상 거짓이라
        // 웹만 「직접 만든 코스만…」 빈 화면으로 찍혔다 (18-7, 사용자 지적 2026-09-09).
        const detail = payload?.course ?? payload;
        const host = Number(room?.hostId) === Number(me?.userId);
        const custom = detail?.type === 'CUSTOM';
        const beforeConfirm = room?.status === 'RECRUITING';
        setCourse(detail);
        setTitle(detail?.title || '');
        setDescription(detail?.description || '');
        setState(host && custom && beforeConfirm ? 'ready' : 'empty');
      })
      .catch(() => { if (active) setState('error'); });
    return () => { active = false; };
  }, [roomId, ready]);

  if (!ready || state !== 'ready') {
    return <GapNotice title="코스 이름 수정" status={liveMode ? (ready ? state : 'empty') : 'signed-out'} emptyText="직접 만든 코스만, 여행 확정 전에 고칠 수 있어요." onBack={nav.back} testId="course-title-edit-state"/>;
  }

  const trimmed = title.trim();
  const titleOver = title.length > TITLE_LIMIT;
  const save = async () => {
    if (!trimmed || busy) return;
    if (titleOver) {
      setError(`코스 이름이 ${title.length}자예요. ${TITLE_LIMIT}자까지만 저장할 수 있어요 — 먼저 줄여 주세요.`);
      return;
    }
    setBusy(true);
    setError('');
    try {
      // `places` 는 **선택이 아니라 필수**다(최소 2개). 제목·소개만 보내면 서버가 400 `40033` 을 낸다 —
      // 이 화면은 방문지를 바꾸지 않으므로 **지금 방문지를 그대로 되돌려 보낸다** (W-115, 2026-09-13).
      // 서버는 응답의 `visitTime` 을 **nullable** 로 주면서 요청에서는 **필수**(`LocalTime`)로 받는다.
      // 시각이 빈 방문지를 그대로 되돌려 보내면 400 이라, 코스를 만들 때와 같은 규칙으로 채운다
      // (10:00 부터 2시간 30분씩). 호스트가 정한 시각이 있으면 그것을 그대로 쓴다.
      const places = (course.places || []).map((place) => ({
        contentId: Number(place.contentId),
        dayNumber: place.dayNumber,
        sequence: place.sequence,
        visitTime: String(place.visitTime || '').slice(0, 5) || defaultStopTime(place.sequence || 1),
      }));
      if (places.length < 2) {
        setError('방문지가 2곳 이상이어야 코스를 고칠 수 있어요.');
        setBusy(false);
        return;
      }
      // 제목은 항상 보내고(빈 값은 서버가 400), 소개는 비었으면 보내지 않아 기존 값을 남긴다.
      await window.MoyeoApi.updateRoomCourse(roomId, {
        places,
        title: trimmed,
        ...(description.trim() ? { description: description.trim() } : {}),
      });
      // 목록 카드에는 코스 이름도 함께 적힌다 — 같은 이유로 보관소를 덜어낸다(W-140).
      window.MoyeoTabCache?.invalidate?.(window.MoyeoTabCache.ROOM_LIST_KEYS);
      nav.back();
    } catch (saveError) {
      setError(window.userFacingError(saveError, '코스 이름을 수정하지 못했어요.'));
      setBusy(false);
    }
  };

  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="코스 이름 수정" left center onBack={nav.back}/>

        <div style={{ position: 'absolute', top: 92, left: 0, right: 0, bottom: 96, overflow: 'auto', padding: '16px 20px 20px' }}>
          {/* 고칠 수 있는 화면이 열렸으면 고칠 수 있는 것이다 — 왜 열렸는지는 설명하지 않는다.
              못 고치는 경우는 위의 `GapNotice` 빈 화면이 이미 이유를 말한다. */}
          <div style={{ fontSize: 12.5, fontWeight: 900, marginBottom: 7, color: T.text900 }}>
            코스 이름 <span style={{ color: T.danger }}>*</span>
          </div>
          {/* **자르지 않는다.** 서버는 100자까지 받으므로 불러온 이름이 24자를 넘을 수 있고,
              `slice()` 로 자르면 사용자가 손대지도 않은 이름이 잘려 저장된다 (W-124).
              대신 넘쳤다는 것을 아래 카운터가 말하고 저장을 막는다 — 18-6 과 같은 규칙이다. */}
          <input value={title} onChange={(event) => setTitle(event.target.value)} aria-label="코스 이름" data-testid="course-title-edit-title" style={{
            width: '100%', height: 46, borderRadius: 12, border: `1px solid ${T.line200}`, padding: '0 12px',
            fontSize: 13, color: T.text900, fontFamily: T.fontStack, background: 'transparent', boxSizing: 'border-box',
          }}/>
          <div style={{ fontSize: 11, color: titleOver ? T.danger : T.text400, marginTop: 6 }}>
            {titleOver
              ? `${title.length}/${TITLE_LIMIT} · ${title.length - TITLE_LIMIT}자 넘었어요`
              : `${title.length}/${TITLE_LIMIT} · 모임 목록과 홈에 이 이름이 보여요`}
          </div>

          <div style={{ fontSize: 12.5, fontWeight: 900, margin: '18px 0 7px', color: T.text900 }}>코스 소개</div>
          <textarea value={description} onChange={(event) => setDescription(event.target.value.slice(0, DESC_LIMIT))} aria-label="코스 소개" data-testid="course-title-edit-description" style={{
            width: '100%', minHeight: 96, borderRadius: 12, border: `1px solid ${T.line200}`, padding: 12,
            fontSize: 13, lineHeight: '20px', color: T.text900, fontFamily: T.fontStack,
            resize: 'none', background: 'transparent', boxSizing: 'border-box',
          }}/>
          <div style={{ fontSize: 11, color: T.text400, marginTop: 6 }}>500자까지 · 비워 두면 지금 소개가 그대로 남아요</div>

          {/* 방문지·순서를 어디서 고치는지는 바로 아래 버튼 이름이 말한다 */}
          <div style={{ marginTop: 18 }}>
            <Btn full icon="map" onClick={() => nav.go('course-edit')}>여행 경로 수정으로 가기</Btn>
          </div>

          {error && <div role="alert" style={{ marginTop: 12, fontSize: 11.5, color: T.danger, fontWeight: 700 }}>{error}</div>}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}` }}>
          <Btn variant="primary" full disabled={busy || !trimmed} onClick={save}>
            {busy ? '저장하는 중이에요…' : '수정 저장'}
          </Btn>
        </div>
      </div>
    </Phone>
  );
}

// ───────── 20-6 · 내 채팅 메시지 삭제 ─────────
// 길게 눌러 여는 시트다. **내 메시지에만** 열린다 — 시스템 메시지·남의 메시지는 서버가 막는다.
// 행을 지우지 않고 본문을 `삭제된 메시지입니다` 로 바꾸므로
// **id·보낸 사람·보낸 시각·답글 관계는 그대로 남는다.**
function ScreenMessageDelete() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const { liveMode, roomId, ready } = useEditRoom();
  const [message, setMessage] = React.useState(null);
  const [state, setState] = React.useState('loading');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!ready) return undefined;
    let active = true;
    setState('loading');
    Promise.all([window.MoyeoApi.roomMessages(roomId, { limit: 50 }), window.MoyeoApi.myProfile()])
      .then(([page, me]) => {
        if (!active) return;
        const list = page?.messages || [];
        // 채팅방에서 그 말풍선의 「삭제」를 눌러 왔으면 **그 메시지**를 연다 (W-37).
        // 라우트로 바로 열면 대상이 없다 — 그때만 내가 보낸 가장 최근 일반 메시지로 떨어진다.
        const requested = nav.params?.messageId;
        const picked = requested != null
          ? list.find((item) => String(item?.messageId) === String(requested) && item?.type !== 'SYSTEM')
          : null;
        // 내가 보낸 **일반** 메시지 중 가장 최근 것. 시스템 메시지는 지울 수 없다.
        const mine = picked
          || list.find((item) => Number(item?.senderId) === Number(me?.userId) && item?.type !== 'SYSTEM');
        setMessage(mine || null);
        setState(mine ? 'ready' : 'empty');
      })
      .catch(() => { if (active) setState('error'); });
    return () => { active = false; };
  }, [roomId, ready]);

  if (!ready || state !== 'ready') {
    return <GapNotice title="메시지 삭제" status={liveMode ? (ready ? state : 'empty') : 'signed-out'} emptyText="내가 보낸 메시지만 지울 수 있어요." onBack={nav.back} testId="message-delete-state"/>;
  }

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await window.MoyeoApi.deleteRoomMessage(roomId, message.messageId);
      nav.go('chat');
    } catch (deleteError) {
      setError(window.userFacingError(deleteError, '메시지를 지우지 못했어요.'));
      setBusy(false);
    }
  };

  const time = String(message.createdAt || '').slice(11, 16);
  return (
    <DestructiveConfirmSheet
      testId="message-delete-sheet"
      backdrop={<ChatRoomBody/>}
      title="이 메시지를 삭제할까요?"
      previewIcon="chat"
      preview={`“${message.content || ''}” · ${time}`}
      consequences={[
        '모두에게서 사라지고 “삭제된 메시지입니다”만 남아요.',
        '사진·위치·투표도 내용만 사라지고 자리는 남아요.',
        '보낸 시각과 이 메시지에 달린 답글은 그대로예요.',
        '되돌릴 수 없어요.',
      ]}
      cta="삭제하기"
      busy={busy}
      error={error}
      onCancel={() => nav.back()}
      onConfirm={remove}
    />
  );
}

Object.assign(window, {
  DestructiveConfirmSheet,
  ScreenFeedActions,
  ScreenFeedDelete,
  ScreenFeedEdit,
  ScreenCommentEdit,
  ScreenRecruitEdit,
  ScreenCourseTitleEdit,
  ScreenMessageDelete,
});
