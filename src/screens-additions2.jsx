// 모집 연령 조건으로 고를 수 있는 범위.
//
// **하한은 가입 최소 연령과 같은 값에서 파생한다** — 서버도 그렇게 정의한다
// (`ChatRoom.MINIMUM_CONDITION_AGE = AgePolicy.MINIMUM_SIGNUP_AGE`).
// 조건 하한이 가입 연령보다 높으면 **그 나이로 가입한 사람이 연령 조건이 걸린 모집에
// 영영 들어갈 수 없다** — 2026-09-14 BE-06 으로 20 → 19 가 됐다.
// `MINIMUM_SIGNUP_AGE` 는 screens-extra.jsx 가 정의하고 index.html 이 이 파일보다 먼저 싣는다.
const ROOM_MIN_CONDITION_AGE = MINIMUM_SIGNUP_AGE;
const ROOM_MAX_CONDITION_AGE = 100;

// 만 나이 한 칸. 숫자만 남기고, 지우는 도중 빈 값은 그대로 둔다 —
// 여기서 곧바로 하한값으로 되돌리면 한 글자도 지울 수 없다.
function AgeInput({ value, onChange, label, testId }) {
  return (
    <div style={{
      flex: 1, height: 44, borderRadius: 12, border: `1px solid ${T.line200}`,
      display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', boxSizing: 'border-box',
    }}>
      <input
        type="text"
        inputMode="numeric"
        value={value === null ? '' : String(value)}
        onChange={(event) => {
          const digits = event.target.value.replace(/[^0-9]/g, '').slice(0, 3);
          onChange(digits === '' ? null : Number(digits));
        }}
        aria-label={label}
        data-testid={testId}
        style={{
          flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
          fontSize: 13, fontWeight: 800, color: T.text900, fontFamily: T.fontStack,
          textAlign: 'right', fontVariantNumeric: 'tabular-nums', padding: 0,
        }}
      />
      <span style={{ fontSize: 12, color: T.text400 }}>세</span>
    </div>
  );
}

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
  // 뒤로 갔다 오면 라우터가 이 화면을 다시 마운트한다. 상수로 시작하면 그때마다 고른 인원·조건이
  // 지워졌다 — 단계들이 공유하는 초안을 다시 읽어 초기값으로 쓴다 (안드 AND-114 의 웹판).
  // 초안에 없는 값(첫 진입)만 화면 기본값으로 시작한다.
  const saved = window.MoyeoApi?.roomDraft?.() || {};
  const [min, setMin] = React.useState(() => Number(saved.minParticipants) || 3);
  const [max, setMax] = React.useState(() => Number(saved.maxParticipants) || initialMaxValue);
  const [gender, setGender] = React.useState(
    () => ({ NONE: 'all', FEMALE_ONLY: 'female', MALE_ONLY: 'male' }[saved.genderRestriction] || 'all'),
  );
  // 나이 제한은 **기본이 「제한 없음」**이다. 예전에는 고를 수단이 없는 채로 `25 ~ 35세` 를
  // 하드코딩해 보내서, 웹에서 만든 모든 모집이 호스트가 정한 적 없는 나이 제한을 달고
  // 다른 나이대 신청자를 막았다 (2026-09-12 감사).
  const [ageLimited, setAgeLimited] = React.useState(() => saved.minimumAge != null || saved.maximumAge != null);
  const [minAge, setMinAge] = React.useState(() => (saved.minimumAge != null ? Number(saved.minimumAge) : ROOM_MIN_CONDITION_AGE));
  const [maxAge, setMaxAge] = React.useState(() => (saved.maximumAge != null ? Number(saved.maximumAge) : ROOM_MAX_CONDITION_AGE));
  const ageInvalid = ageLimited
    && (minAge < ROOM_MIN_CONDITION_AGE || maxAge > ROOM_MAX_CONDITION_AGE || minAge > maxAge);
  // 17-5 요약이 이어받는 값. 최소 인원도 **서버 필수 필드**(`minimumParticipants`)로 함께 나간다.
  // 서버는 나이 둘 다 nullable 이고 [ROOM_MIN_CONDITION_AGE]~[ROOM_MAX_CONDITION_AGE] 만
  // 받는다 — 제한을 걸지 않으면 보내지 않는다.
  const draftPatch = {
    minParticipants: min,
    maxParticipants: max,
    genderRestriction: { all: 'NONE', female: 'FEMALE_ONLY', male: 'MALE_ONLY' }[gender] || 'NONE',
    minimumAge: ageLimited ? minAge : null,
    maximumAge: ageLimited ? maxAge : null,
  };
  // **「다음」에서만 내보내면 「이전」으로 나갈 때 그대로 사라진다.** 화면에 보이는 값을 바로 초안에 적어
  // 돌아왔을 때 같은 값이 보이게 한다 (위 초기값 복원과 한 쌍이다).
  React.useEffect(() => {
    window.MoyeoApi?.updateRoomDraft?.(draftPatch);
  }, [min, max, gender, ageLimited, minAge, maxAge]);
  const goNext = () => {
    if (ageInvalid) return;
    window.MoyeoApi?.updateRoomDraft(draftPatch);
    nav.go('create-detail');
  };

  const mood = max <= 4
    ? { text: '말 트기 좋은 작은 그룹이에요', tone: 'ok' }
    : max <= 8
      ? { text: '단체 사진 예쁘게 나오는 최적 인원이에요', tone: 'ok' }
      : { text: '9명 이상은 친목이 쉽지 않을 수 있어요', tone: 'warn' };

  // 한계에 닿은 버튼은 **눌리지 않는 것처럼 보여야** 한다. 예전에는 `disabled` 도 안내도 없이
  // 그냥 아무 일이 안 일어나서, 왜 더 못 줄이는지 알 수 없었다(CREATE-045).
  const Stepper = ({ label, value, onMinus, onPlus, hint, canMinus = true, canPlus = true, testId }) => (
    <div>
      <AddFieldLabel required>{label}</AddFieldLabel>
      <div style={{
        height: 48, borderRadius: 12, border: `1px solid ${T.line200}`, background: RF.card,
        display: 'flex', alignItems: 'center', padding: '0 8px', gap: 8,
      }}>
        <button type="button" onClick={onMinus} disabled={!canMinus} aria-label={`${label} 줄이기`} data-testid={testId ? `${testId}-minus` : undefined} style={{ width: 32, height: 32, borderRadius: 999, border: `1px solid ${T.line200}`, background: RF.card, cursor: canMinus ? 'pointer' : 'default', opacity: canMinus ? 1 : 0.35, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="minus" size={15} color={T.text700}/>
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{value}명</div>
        <button type="button" onClick={onPlus} disabled={!canPlus} aria-label={`${label} 늘리기`} data-testid={testId ? `${testId}-plus` : undefined} style={{ width: 32, height: 32, borderRadius: 999, border: 'none', background: T.primary500, cursor: canPlus ? 'pointer' : 'default', opacity: canPlus ? 1 : 0.35, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            {/* 서버 규칙 그대로다(`ChatRoom.init`): 최대는 3~20, 최소는 3 이상 **최대 이하**.
                최소=최대(3/3 같은 정원 딱 맞추기)도 서버가 받는데 화면이 `최소+1` 로 막고 있었다(W-58·CREATE-045). */}
            <Stepper
              label="최소 인원"
              value={min}
              testId="create-people-min"
              canMinus={min > 3}
              canPlus={min < max}
              onMinus={() => setMin((v) => Math.max(3, v - 1))}
              onPlus={() => setMin((v) => Math.min(max, v + 1))}
              hint={min <= 3 ? '3명 미만은 선택할 수 없어요' : '최대 인원까지 올릴 수 있어요'}
            />
            <Stepper
              label="최대 인원"
              value={max}
              testId="create-people-max"
              canMinus={max > Math.max(3, min)}
              canPlus={max < 20}
              onMinus={() => setMax((v) => Math.max(Math.max(3, min), v - 1))}
              onPlus={() => setMax((v) => Math.min(20, v + 1))}
              hint={max <= Math.max(3, min) ? `최소 인원 ${min}명보다 적게는 못 정해요` : '최대 20명까지'}
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
            <div style={{ display: 'flex', gap: 8 }}>
              {[[false, '제한 없음'], [true, '직접 정하기']].map(([value, label]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setAgeLimited(value)}
                  data-testid={`create-people-age-${value ? 'custom' : 'none'}`}
                  style={{
                    flex: 1, height: 42, borderRadius: 12, cursor: 'pointer', fontFamily: T.fontStack,
                    fontSize: 13, fontWeight: 800,
                    border: `1px solid ${ageLimited === value ? T.primary500 : T.line200}`,
                    background: ageLimited === value ? T.primary50 : RF.card,
                    color: ageLimited === value ? T.primary700 : T.text700,
                  }}>{label}</button>
              ))}
            </div>
            {ageLimited && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                <AgeInput value={minAge} onChange={setMinAge} label="최소 나이" testId="create-people-age-min"/>
                <span style={{ fontSize: 13, color: T.text400 }}>~</span>
                <AgeInput value={maxAge} onChange={setMaxAge} label="최대 나이" testId="create-people-age-max"/>
              </div>
            )}
            <div style={{ fontSize: 11, color: ageInvalid ? T.danger : T.text500, marginTop: 7, lineHeight: '16px' }}>
              {ageInvalid
                ? `최소·최대 모두 ${ROOM_MIN_CONDITION_AGE}~${ROOM_MAX_CONDITION_AGE}세 사이여야 하고, 최소가 최대보다 클 수 없어요.`
                : ageLimited
                  ? `최소·최대 모두 ${ROOM_MIN_CONDITION_AGE}~${ROOM_MAX_CONDITION_AGE}세 사이에서 정할 수 있어요. 조건에 맞지 않는 사용자에게는 신청 버튼이 비활성으로 보여요.`
                  : '나이와 상관없이 누구나 신청할 수 있어요.'}
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8 }}>
          <Btn variant="ghost" onClick={nav.back}>이전</Btn>
          <div style={{ flex: 1 }}><Btn variant="primary" full disabled={ageInvalid} onClick={goNext}>다음</Btn></div>
        </div>
      </div>
    </Phone>
  );
}

// 모집 이름 한도. **18-6 모집 내용 수정의 `RECRUIT_TITLE_LIMIT` 과 같은 값**이어야 한다 —
// 예전에는 만들 때는 한도가 없고 고칠 때는 24자라, 25자 이상으로 지은 제목은 나중에 한 글자도
// 고칠 수 없었다.
// 2026-09-14 결정 ②: 화면 한도를 **서버와 같은 100자**로 올린다. 24 로 좁혀 두는 바람에
// 25자 넘는 제목의 모집은 한 글자도 안 고쳤는데 저장이 거절됐다(ROUND-2026-09-14-DECISIONS ②).
// 서버 `CreateChatRoomRequest.title` 은 `@Size(max = 100)` 이다.
// 넘친 글자는 자르지 않는다 — 카운터로 보여주고 다음 단계로 못 가게 한다(18-7 과 같은 방식).
const ROOM_TITLE_LIMIT = 100;
// 27-3 코스 공개의 코스 이름 한도. 서버 `PublishTravelCourseRequest.title` 의 `@Size(max = 100)` 과
// 같은 값이다. 예전에는 24 였는데, 그 값을 정한 이유가 「18-7 코스 이름 수정이 24자라서」였다.
// 18-7 이 100 으로 올라간 뒤에도 여기만 24 로 남아, 100자로 만든 코스 이름이 공개 화면에서만
// 잘렸다. 2026-09-15 결정 ⑨로 **세 화면·세 플랫폼 모두 100** 이다.
const COURSE_PUBLISH_TITLE_LIMIT = 100;
// 참가비 자릿수 상한. 정산 메모(SETTLEMENT_TOTAL_MAX_DIGITS)와 같은 9 자리다.
const PARTICIPATION_FEE_MAX_DIGITS = 9;
// 소개글 한도. 서버 값 그대로다 (`CreateChatRoomRequest.description` `@Size(max = 500)`).
const ROOM_INTRO_LIMIT = 500;

// ───────── 17-7 · 모집 만들기 Step 4 — 세부 정보 ─────────
function ScreenCreateDetail() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  // 3/5 로 갔다 돌아오면 라우터가 이 화면을 다시 마운트한다. 빈 문자열로 시작하던 탓에
  // 호스트가 공들여 쓴 모집 이름·소개글·비용이 말없이 사라졌다 (안드 AND-114 의 웹판, 웹은 범위가 더 넓다).
  // **초안에 있는 값만** 되살린다 — 목데이터를 미리 채우는 것이 아니라, 사용자가 직접 쓴 값을 돌려주는 것이다
  // (NO-MOCK-CANON R1 은 그대로 지켜진다). iOS 는 단계들이 draft 하나를 공유해 이 문제가 없다.
  const saved = window.MoyeoApi?.roomDraft?.() || {};
  const [approval, setApproval] = React.useState(() => (saved.joinApprovalMode === 'MANUAL' ? 'manual' : 'auto'));
  // 키워드 추천 칩은 스펙아웃 — 자동 추출 근거가 없어 화면기획에서 삭제됐다
  const [intro, setIntro] = React.useState(() => saved.description || '');
  const [roomTitle, setRoomTitle] = React.useState(() => saved.title || '');
  const [fee, setFee] = React.useState(() => (saved.participationFee != null ? String(saved.participationFee) : ''));
  // 예전에는 `replace(/[^0-9]/g, '')` 한 줄이라 `1234.56` 이 `123456`(100 배)으로,
  // `-500` 이 `500` 으로 **말없이** 바뀌었다. 버린 글자와 상한을 칸 아래에 적는다 (W-15).
  const [feeNotice, setFeeNotice] = React.useState('');
  const changeFee = (next) => {
    const digits = next.replace(/[^0-9]/g, '');
    if (digits.length !== next.length) setFeeNotice('숫자만 넣을 수 있어요. 쉼표·소수점 없이 원 단위로 적어주세요.');
    else if (digits.length > PARTICIPATION_FEE_MAX_DIGITS) setFeeNotice(`참가비는 ${PARTICIPATION_FEE_MAX_DIGITS}자리까지 넣을 수 있어요.`);
    else setFeeNotice('');
    setFee(digits.slice(0, PARTICIPATION_FEE_MAX_DIGITS));
  };
  // Step 1 에서 고른 코스 이름. 로그인 상태에서는 서버 코스 제목이 들어온다.
  const liveMode = window.MoyeoApi?.live();
  const courseTitle = (liveMode && window.MoyeoApi.roomDraft().courseTitle) || '';
  // 17-5 요약이 이어받는 값. 이 화면에 보이는 문구·금액을 그대로 요청에 싣는다.
  const draftPatch = {
    title: roomTitle.trim(),
    description: intro.trim() || null,
    // 비워 두면 참가비 없음이다 — 임의의 금액을 넣지 않는다.
    participationFee: fee.trim() ? Number(fee.replace(/[^0-9]/g, '')) : null,
    joinApprovalMode: approval === 'manual' ? 'MANUAL' : 'AUTO',
  };
  // **「다음」에서만 내보내면 「이전」으로 나갈 때 그대로 사라진다.** 이 화면이 AND-114 의 재현 지점이다 —
  // 한 글자 칠 때마다 초안에 적어 두고, 위에서 그 초안을 초기값으로 다시 읽는다.
  React.useEffect(() => {
    window.MoyeoApi?.updateRoomDraft?.(draftPatch);
  }, [roomTitle, intro, fee, approval]);
  // 넘친 글자는 **말없이 자르지 않는다** — 카운터로 넘친 만큼을 보여주고 다음으로 못 가게 한다
  // (18-6 모집 내용 수정이 이미 같은 방식이다).
  const titleOver = roomTitle.trim().length > ROOM_TITLE_LIMIT;
  // 제목은 **필수**다(서버 `CreateChatRoomRequest` 도 비워 두면 받지 않는다). 예전에는
  // `titleOver` 만 봐서 **빈 제목으로도 「다음」이 활성**이었고, 5/5 에서 서버 오류로 튕겼다 (W-90).
  const titleEmpty = roomTitle.trim().length === 0;
  const introOver = intro.length > ROOM_INTRO_LIMIT;
  const goNext = () => {
    if (titleOver || titleEmpty || introOver) return;
    window.MoyeoApi?.updateRoomDraft(draftPatch);
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
            <div data-testid="create-detail-title-count" style={{ textAlign: 'right', fontSize: 11, color: titleOver ? T.danger : T.text400, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>{roomTitle.trim().length}/{ROOM_TITLE_LIMIT}</div>
            {titleOver && (
              <div role="alert" style={{ fontSize: 11.5, fontWeight: 800, color: T.danger, marginTop: 4, lineHeight: '16px' }}>
                모집 이름이 {roomTitle.trim().length}자예요. {ROOM_TITLE_LIMIT}자까지만 저장할 수 있어요 — 먼저 줄여 주세요.
              </div>
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <AddFieldLabel>소개글</AddFieldLabel>
            <textarea
              data-testid="create-detail-intro"
              value={intro}
              onChange={(event) => setIntro(event.target.value)}
              placeholder="어떤 여행이 될지 한두 줄로 알려주세요."
              style={{
                width: '100%', minHeight: 96, borderRadius: 12, border: `1px solid ${T.line200}`,
                background: RF.card, padding: 13, fontSize: 13, lineHeight: '20px', color: T.text900,
                fontFamily: T.fontStack, resize: 'none', outline: 'none', boxSizing: 'border-box',
              }}
            />
            {/* 넘친 글자를 `slice(0, 500)` 으로 말없이 버리고 있었다 — 붙여넣은 소개글이
                조용히 잘렸다. 자르지 않고 넘친 만큼을 적고 「다음」을 잠근다 (W-17 · W-90). */}
            <div data-testid="create-detail-intro-count" style={{ textAlign: 'right', fontSize: 11, color: introOver ? T.danger : T.text400, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>{intro.length}/{ROOM_INTRO_LIMIT}{introOver ? ` · ${intro.length - ROOM_INTRO_LIMIT}자 넘었어요` : ''}</div>
          </div>

          <div style={{ marginTop: 12 }}>
            <AddFieldLabel>예상 1인당 비용</AddFieldLabel>
            {/* 코스별 예상 비용을 주는 API가 없다 — "보통 4~5만원" 같은 근거 없는 안내를 하지 않는다. */}
            <AddFieldInput
              icon="money"
              value={fee}
              onChange={changeFee}
              placeholder="비워 두면 참가비 없음"
              inputMode="numeric"
              testId="create-detail-fee"
              caption="정하지 않았으면 비워 두세요. 참고용으로만 보여줘요."
              notice={feeNotice}
              noticeTestId="create-detail-fee-notice"
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
          <div style={{ flex: 1 }}><Btn variant="primary" full disabled={titleOver || titleEmpty || introOver} onClick={goNext}>다음</Btn></div>
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
  // 모집(채팅방) 신고 시트. 2026-09-14 실서버 확인으로 접수 API 가 생겨
  // 「문의로 안내」(`ReportUnsupportedDialog`)에서 실제 접수로 바꿨다.
  const [reportOpen, setReportOpen] = React.useState(false);
  const [course, setCourse] = React.useState(null);
  // 방별 알림 설정 · 동행자 매너 점수 — 서버가 값을 안 주면 null 로 남겨 표기를 숨긴다.
  const [roomAlarm, setRoomAlarm] = React.useState(null);
  const [companions, setCompanions] = React.useState(null);
  const [alarmBusy, setAlarmBusy] = React.useState(false);
  // **불러오는 중과 0건은 다르다** — 조회가 끝나기 전에 「참여 중인 모임이 없어요.」를 먼저 그리면
  // 느린 회선에서는 방이 사라진 것처럼 읽힌다(W-139).
  const [loading, setLoading] = React.useState(Boolean(liveMode && roomId));
  React.useEffect(() => {
    if (!liveMode || !roomId) { setLoading(false); return undefined; }
    let active = true;
    setLoading(true);
    const detailTask = window.MoyeoApi.roomDetail(roomId)
      .then((result) => { if (active && result?.roomId != null) setRoom(result); })
      .catch(() => { /* 실패 시 목데이터 유지 */ });
    const membersTask = window.MoyeoApi.roomMembers(roomId)
      .then((result) => { if (active && Array.isArray(result?.members)) setMemberList(result); })
      .catch(() => { /* 403(미참여) 이면 목데이터 유지 */ });
    // 이 화면이 열리는 조건은 방 상세 + 멤버 목록 둘이다 — 둘이 끝나면 로딩이 끝난다.
    Promise.all([detailTask, membersTask]).then(() => { if (active) setLoading(false); });
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
    // 불발된 방(서버 `ChatRoomStatus.CANCELLED`)은 더 이상 모집도 채팅도 되지 않는다
    // (`ChatRoom.kt:238` `canChat()`). 이 화면은 그 사실을 어디에도 적지 않았다 (W-112).
    const cancelled = room.status === 'CANCELLED';
    const conditions = [
      room.participationFee != null ? (Number(room.participationFee) > 0 ? `1인 ${Number(room.participationFee).toLocaleString()}원` : '참가비 없음') : null,
      // 불발된 방에 「마감 D-11」을 남기면 아직 모집 중인 것처럼 읽힌다.
      (!cancelled && room.recruitmentDDay != null) ? `마감 D-${room.recruitmentDDay}` : null,
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
                {/* 동행자 행이 눌리지 않아 채팅방에서 사람에게 가는 길이 없었다 (W-88·W-35).
                    이름·사진 자리만 버튼으로 둔다 — 행 전체를 버튼으로 만들면 오른쪽 ⋯ 가 버튼 안의 버튼이 된다.
                    내 카드로 가 봐야 할 일이 없어 나는 제외한다. */}
                <button
                  type="button"
                  data-testid={`member-profile-${member.userId}`}
                  aria-label={`${member.nickname || '동행자'} 프로필 보기`}
                  disabled={Boolean(member.me)}
                  onClick={() => nav.go('public-profile', { params: { userId: member.userId } })}
                  style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 11, border: 0, background: 'transparent', padding: 0, textAlign: 'left', fontFamily: T.fontStack, cursor: member.me ? 'default' : 'pointer' }}>
                {member.profileImageUrl
                  ? <img src={member.profileImageUrl} alt="" style={{ width: 38, height: 38, borderRadius: 999, objectFit: 'cover', background: T.primary50 }}/>
                  : <span style={{ width: 38, height: 38, borderRadius: 999, background: T.primary50, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user" size={19} color={T.primary600}/></span>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: T.text900 }}>{member.nickname}</div>
                  {/* 멤버 목록에는 매너 점수가 없다 — 완료 여행이면 companions 의 mannerRating 으로 채우고,
                      값이 null 이면(현재 서버 상태) 여행 횟수만 적는다 */}
                  <div style={{ fontSize: 11, color: T.text500, marginTop: 2 }}>
                    {mannerByUserId.has(member.userId) ? `매너 ${mannerByUserId.get(member.userId)} · ` : ''}여행 {member.completedTripCount}회
                  </div>
                </div>
                </button>
                {member.host
                  ? <Chip variant="soft">호스트</Chip>
                  : member.me
                    ? <Chip variant="neutral">나</Chip>
                    : <IconButton name="more" size={18} onClick={() => openMemberActions(member)}/>}
              </div>
            ))}
          </div>

          <div style={{ height: 8, background: T.bgSubtle, margin: '16px 0 8px' }}/>

          {/* 18 모집 관리 — **호스트만.** 웹에는 이 화면으로 가는 앱 내 진입점이 **아예 없었다**(W-05).
              화면과 서버 동작은 멀쩡한데 길이 없어서, 호스트가 신청 승인·여행 확정·집합 정보 수정·
              모집 내용 수정을 하나도 할 수 없었다. 안드로이드도 같은 자리에 두었다.
              불발(CANCELLED)된 방에서는 감춘다 — 승인할 신청도 확정할 여행도 남아 있지 않은데
              이 줄만 그대로 있어서 모집 중인 방과 구분되지 않았다 (W-112). */}
          {cancelled ? (
            /* 누를 곳이 아니라 상태 안내다 — 눌리지 않는 행(버튼)을 두지 않는다. */
            <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 20px' }}>
              <Icon name="close" size={19} color={T.dangerText}/>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.dangerText }}>불발된 모임</div>
                <div style={{ fontSize: 11, color: T.text500, marginTop: 2 }}>새 글은 쓸 수 없고, 지난 대화는 14일 동안 볼 수 있어요</div>
              </div>
            </div>
          ) : memberList.members.some((member) => member.host && member.me) && (
            <Row
              icon="users"
              label="모집 관리"
              sub="신청 승인 · 여행 확정 · 모집 내용 수정"
              onClick={() => nav.go('host-manage')}
            />
          )}
          <Row icon="note" label="공지" sub={notices ? `고정 ${pinnedCount}개 · 전체 ${noticeCount}개` : null} onClick={() => nav.go('notice-history')}/>
          {/* 토글은 이 방의 알림만 끈다 (PUT notifications/settings/chat-rooms/{roomId}).
              행 자체는 20-1c 이 모임 알림으로 이어진다 — 예전에는 전역 방해금지(29-2)로 갔다.
              "이 모임만"이라고 써놓고 계정 전체 설정을 열면, 방 하나 끄려던 사람이 모든 알림을 끈다
              (ATTACH-COMPOSER-CANON §6-1). 서버 값을 못 읽으면 토글만 숨긴다. */}
          <Row icon="bell" label="알림 설정" sub="이 모임의 알림만 끄기" onClick={() => nav.go('room-notif')} rightAction={roomAlarm === null ? null : <RoomAlarmToggle/>}/>
          {/* 모집(채팅방) 신고 — POST /chat-rooms/{roomId}/reports (204).
              사유는 `/chat-rooms/report-reasons` 가 준다 (피드·멤버와 **다른 목록**이다).
              내가 만든 모집은 서버가 400 `40044` 로 막으므로 호스트에게는 줄을 두지 않는다 —
              항상 실패하는 버튼을 두지 않는다는 30-2 와 같은 규칙이다.
              차단은 20-1a 멤버 액션에서 한다(대상이 확실한 자리) — 신고와 섞지 않는다. */}
          {!memberList.members.some((member) => member.host && member.me) && (
            <Row icon="flag" label="이 모임 신고" sub="부적절한 모집 내용을 알려주세요" onClick={() => setReportOpen(true)}/>
          )}

          <div style={{ height: 8, background: T.bgSubtle, margin: '8px 0' }}/>

          {/* 불발된 방에는 채울 자리도 대기자도 없다 — 그 안내를 그대로 두면 거짓말이 된다 (W-112). */}
          {/* 호스트에게 「대기 중인 다음 신청자가 자동으로 합류해요」라고 말하면 안 된다 —
              호스트가 나가면 합류가 아니라 **모임이 끝난다**. 확인 화면(`leave-alert`)은 이미
              호스트·참가자를 갈라 말하는데(`screens-extra.jsx` 「호스트가 나가면 이 모임은 종료돼요」)
              그 앞의 이 줄만 참가자 기준이라 서로 반대되는 말을 했다 (QA MEET-017).
              안드로이드가 이미 같은 모양이다(`ChangeLogScreens.kt` `if (amHost) "호스트가 나가면 이 모임은 종료돼요"`) —
              **라벨은 두 쪽 모두 「채팅방 나가기」로 두고 보조 문구만 가른다.** iOS 는 아직 고정 문구다. */}
          <Row
            icon="close"
            label="채팅방 나가기"
            sub={cancelled
              ? '나가면 지난 대화를 더 볼 수 없어요'
              : (memberList.members.some((member) => member.host && member.me)
                ? '호스트가 나가면 이 모임은 종료돼요'
                : '나가면 대기 중인 다음 신청자가 자동으로 합류해요')}
            danger
            onClick={() => nav.go('leave-alert')}
          />
        </div>
        {reportOpen && window.ReportReasonSheet && React.createElement(window.ReportReasonSheet, {
          testId: 'room-report-sheet',
          subtitle: `「${room.title}」 모집을 신고해요.`,
          loadReasons: () => window.MoyeoApi.roomReportReasons(),
          submitReport: ({ reason, details }) => window.MoyeoApi.reportRoom(roomId, { reason, details }),
          noticeByCode: window.ROOM_REPORT_NOTICES,
          onClose: () => setReportOpen(false),
        })}
      </div>
    );
  }

  // 서버 모임 정보를 못 받으면 예시 모임·동행자를 그리지 않는다.
  return (
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="모임 정보" left center onBack={nav.back}/>
        <div role="status" style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13, lineHeight: '21px' }}>
          {loading ? '불러오는 중이에요…' : liveMode ? '참여 중인 모임이 없어요.' : '로그인하면 모집 중인 모임을 볼 수 있어요.'}
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
  // 멤버 신고 시트 — POST /chat-rooms/{roomId}/members/{memberId}/reports (204).
  // 2026-09-14 실서버 확인으로 접수 API 가 생겨 문의 안내에서 실제 접수로 바꿨다.
  const [reportOpen, setReportOpen] = React.useState(false);
  const reportRoomId = liveMode ? window.MoyeoApi.selectedRoomId() : null;
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
      setBlockError(window.userFacingError(error, '차단하지 못했어요. 잠시 후 다시 시도해주세요.'));
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
      setRequestError(window.userFacingError(error, '친구 요청을 보내지 못했어요.'));
    }
  };
  // 시트 접근성은 공용 훅 한 곳에서 본다 (QA ENV-007 · shared.jsx `useSheetA11y`).
  const sheet = window.useSheetA11y({ label: '멤버 메뉴', onClose: nav.back });
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
        <div {...sheet.rootProps} data-testid="member-actions-sheet" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: T.bgRaised, borderRadius: '24px 24px 0 0', padding: '10px 20px 32px', boxShadow: T.l3 }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: T.line300, margin: '0 auto 14px' }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '4px 0 12px' }}>
            {member
              ? (member.profileImageUrl
                ? <img src={member.profileImageUrl} alt="" style={{ width: 44, height: 44, borderRadius: 999, objectFit: 'cover', background: T.primary50 }}/>
                : <span style={{ width: 44, height: 44, borderRadius: 999, background: T.primary50, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user" size={22} color={T.primary600}/></span>)
              : <AnimalAvatar kind="raccoon" size={44} bg={T.primary50}/>}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>{member?.nickname || ''}</div>
              {/* 매너 점수·합류 시각은 서버 멤버 응답에 없다 — 없으면 **빈 자리로 둔다**(NO-MOCK R1·R2).
                  예전에는 member 가 없을 때 「매너 4.8 · 여행 8회 · 어제 합류」라는 지어낸 값을 그렸다. */}
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
              <button type="button" data-testid="member-actions-report" disabled={reportRoomId == null} onClick={() => setReportOpen(true)} style={{ width: '100%', height: 54, border: 0, background: 'transparent', display: 'flex', alignItems: 'center', gap: 11, fontFamily: T.fontStack, cursor: reportRoomId == null ? 'default' : 'pointer', padding: 0 }}>
                <Icon name="flag" size={19} color={T.text700}/>
                <span style={{ flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 600, color: T.text900 }}>신고하기</span>
                <Icon name="arrow" size={15} color={T.text400}/>
              </button>
              <div style={{ height: 12 }}/>
            </>
          )}
          <Btn variant="secondary" full onClick={() => nav.back()}>닫기</Btn>
        </div>
        {/* 멤버 사유 목록은 피드·모집과 **다르다** — `/chat-rooms/member-report-reasons` 를 쓴다.
            차단은 위의 「차단하기」로 **따로** 보낸다 (정본 §2 결론 유지). */}
        {reportOpen && member && reportRoomId != null && window.ReportReasonSheet
          && React.createElement(window.ReportReasonSheet, {
            testId: 'member-report-sheet',
            subtitle: `${member.nickname || '이 사용자'}님을 신고해요.`,
            loadReasons: () => window.MoyeoApi.memberReportReasons(),
            submitReport: ({ reason, details }) => window.MoyeoApi.reportMember(reportRoomId, member.userId, { reason, details }),
            noticeByCode: window.MEMBER_REPORT_NOTICES,
            onClose: () => setReportOpen(false),
          })}
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
  // 시트 접근성은 공용 훅 한 곳에서 본다 (QA ENV-007 · shared.jsx `useSheetA11y`).
  const sheet = window.useSheetA11y({ label: '멤버 내보내기', onClose: nav.back });
  const [reason, setReason] = React.useState('');
  // ⚠️ 파괴적 호출이라 QA 방에서 실행해 검증하지 않았다 — 배선만 해 둔다.
  // DELETE chat-rooms/{roomId}/members/{memberId} 는 본문에 사유(1~500자)가 필수다.
  const liveMode = window.MoyeoApi?.live();
  const roomId = liveMode ? window.MoyeoApi.selectedRoomId() : null;
  const member = useTargetRoomMember(liveMode);
  const [busy, setBusy] = React.useState(false);
  // 실패를 말하지 않으면 호스트는 「눌렀는데 아무 일도 없다」로 읽는다 (QA CHAT-038).
  // 기획에 오류 문구 자리가 없다는 이유로 조용히 넘기던 자리다 — 되돌릴 수 없는 조작일수록
  // 성공·실패를 분명히 말해야 한다.
  const [submitError, setSubmitError] = React.useState('');
  const canSubmit = reason.trim().length >= 10 && !busy;
  const submit = async () => {
    if (!roomId || !member?.userId) { nav.back(); return; }
    setBusy(true);
    try {
      await window.MoyeoApi.kickRoomMember(roomId, member.userId, reason);
      window.MoyeoApi.selectMember(null);
      nav.go('chat-menu');
    } catch (error) {
      // 시트를 닫지 않고 사유 입력도 그대로 남긴다 — 다시 누르면 된다.
      setSubmitError(window.userFacingError(error, '내보내지 못했어요.'));
      setBusy(false);
    }
  };
  return (
    <Phone>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {/* 이전 화면(20-1)이 딤 아래에 그대로 깔려 있어야 시트가 "위에 떠 있다"고 읽힌다 (changeLog14) */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}><ChatMenuBody/></div>
        <div style={{ position: 'absolute', inset: 0, background: T.bgOverlay }}/>
        <div {...sheet.rootProps} data-testid="member-remove-sheet" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: T.bgRaised, borderRadius: '24px 24px 0 0', padding: '10px 20px 32px', boxShadow: T.l3 }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: T.line300, margin: '0 auto 14px' }}/>
          <div style={{ fontSize: 17, fontWeight: 700 }}>멤버 내보내기</div>
          <div style={{ fontSize: 12, color: T.text500, marginTop: 4 }}>내보낸 자리는 대기 큐에서 자동으로 채워져요.</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 16, padding: 12, borderRadius: 12, background: T.bgSubtle }}>
            {member?.userId
              ? <ProfileAvatar src={member.profileImageUrl} size={40}/>
              : <AnimalAvatar kind="raccoon" size={40} bg={T.primary50}/>}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{member?.nickname || ''}</div>
              {/* 매너 점수·합류 시각은 서버 멤버 목록에 없다 — 어느 경우에도 지어내지 않는다(NO-MOCK R1·R2). */}
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

          {submitError && (
            <div role="alert" data-testid="member-remove-error" style={{ marginTop: 12, padding: '11px 13px', borderRadius: 12, border: `1px solid ${T.danger}`, fontSize: 12.5, lineHeight: '19px', color: T.danger }}>{submitError}</div>
          )}

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
  // 시트 접근성은 공용 훅 한 곳에서 본다 (QA ENV-007 · shared.jsx `useSheetA11y`).
  const sheet = window.useSheetA11y({ label: '무엇을 공유할까요?', onClose: nav.back });
  // 공지는 **호스트만** 올릴 수 있다(서버가 403 으로 막는다). 예전에는 참가자에게도 타일이
  // 보여서, 눌러 다 쓰고 올린 뒤에야 거절당했다 (W-19). 같은 파일의 20-1 멤버 목록이
  // 이미 `members.some(m => m.host && m.me)` 로 호스트를 가릴 줄 안다 — 같은 근거를 쓴다.
  const liveMode = window.MoyeoApi?.live();
  const roomId = liveMode ? window.MoyeoApi.selectedRoomId() : null;
  // null = 아직 모른다. 모르는 동안에는 타일을 그리지 않는다(있다가 사라지는 편이 더 나쁘다).
  const [isHost, setIsHost] = React.useState(liveMode && roomId ? null : false);
  React.useEffect(() => {
    if (!liveMode || !roomId) return undefined;
    let active = true;
    window.MoyeoApi.roomMembers(roomId)
      .then((result) => { if (active) setIsHost(Boolean((result?.members || []).some((member) => member.me && member.host))); })
      .catch(() => { if (active) setIsHost(false); });
    return () => { active = false; };
  }, [liveMode, roomId]);
  const items = [
    { icon: 'camera', label: '사진', desc: '최대 20MB · 1장씩 전송', route: 'attach-photo' },
    { icon: 'pin', label: '장소', desc: '관광 정보에서 찾기', route: 'attach-place' },
    { icon: 'map', label: '지도', desc: '만날 위치 핀 공유', route: 'attach-map' },
    { icon: 'poll', label: '투표', desc: '2~5개 · 익명 기본', route: 'attach-poll' },
    { icon: 'money', label: '정산', desc: '메모용 · 송금 아님', route: 'attach-settlement' },
    ...(isHost === true ? [{ icon: 'note', label: '메모', desc: '상단 고정 공지 (호스트)', route: 'attach-notice' }] : []),
  ];
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative', overflow: 'hidden' }}>
        {/* 이전 화면(20 채팅방)이 딤 아래에 그대로 깔려 있어야 시트가 "위에 떠 있다"고 읽힌다 (changeLog14) */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}><ChatRoomBody/></div>
        <div style={{ position: 'absolute', inset: 0, background: T.bgOverlay }}/>

        <div {...sheet.rootProps} data-testid="chat-attach-sheet" style={{
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
  // 「닉네임으로 찾기」 검색창은 **없다** (BE-05 · 2026-09-14 결정 B안).
  // 서버에 사용자 검색 API 를 만들지 않기로 했다 — 친구는 도감에서만 신청한다.
  // 예전 검색창은 **이미 친구인 목록만** 좁혀서 모르는 사람을 아무리 쳐도 늘 0건이었다.
  // 동작하는 것처럼 보이는데 결과가 없는 것이 제일 나쁜 상태라 들어냈고,
  // 대신 친구를 어떻게 만드는지 안내 한 줄을 둔다.
  // 로그인 상태: GET friends + friend-requests/received·sent 로 대체, 수락/거절/취소 실연동.
  const liveMode = window.MoyeoApi?.live();
  const [serverData, setServerData] = React.useState(null);
  // 수락·거절·취소가 실패했을 때 사용자에게 하는 말. 예전에는 세 갈래 모두 `catch (_) {}` 로
  // **아무 말 없이 삼켰다** — 상대가 먼저 처리해 버린 신청의 버튼을 눌러도 화면이 그대로여서
  // 눌리지 않은 것처럼 보였다 (QA SOCIAL-010).
  const [requestError, setRequestError] = React.useState('');
  const loadFriendLists = React.useCallback(() => Promise.all([
    window.MoyeoApi.friends(),
    window.MoyeoApi.receivedFriendRequests(),
    window.MoyeoApi.sentFriendRequests(),
  ]).then(([friendsResult, receivedResult, sentResult]) => {
    if (!Array.isArray(friendsResult?.friends)) return false;
    setServerData({
      mine: friendsResult.friends,
      received: receivedResult?.requests || [],
      sent: sentResult?.requests || [],
    });
    return true;
  }), []);
  React.useEffect(() => {
    if (!liveMode) return undefined;
    let active = true;
    loadFriendLists()
      .then(() => { if (!active) setServerData((current) => current); })
      .catch(() => { /* 캐시가 없으면 빈 상태로 남는다 — 지어내지 않는다 */ });
    return () => { active = false; };
  }, [liveMode, loadFriendLists]);
  // 상대가 먼저 처리해 그 신청이 이미 사라진 경우. 서버 코드로만 가른다
  // (2026-09-15 결정 ⑩ — 서버 `errorMessage` 를 화면에 그대로 올리지 않는다).
  //   40419 FRIEND_REQUEST_NOT_FOUND · 40420 FRIENDSHIP_NOT_FOUND · 40030 ALREADY_FRIEND
  const FRIEND_REQUEST_GONE_CODES = window.MOYEO_FRIEND_REQUEST_GONE_CODES;
  const ALREADY_FRIEND_CODE = '40030';
  const reportRequestFailure = (error, fallback) => {
    const code = String(error?.code ?? '');
    if (code === ALREADY_FRIEND_CODE) {
      setRequestError('이미 친구가 됐어요. 목록을 새로 불러왔어요.');
      loadFriendLists().catch(() => {});
      return;
    }
    if (FRIEND_REQUEST_GONE_CODES.includes(code)) {
      setRequestError(`${window.MOYEO_FRIEND_REQUEST_GONE_MESSAGE} 목록을 새로 불러왔어요.`);
      loadFriendLists().catch(() => {});
      return;
    }
    setRequestError(window.screenErrorText(error, fallback));
  };
  const answerRequest = async (requestId, accept) => {
    setRequestError('');
    try {
      if (accept) await window.MoyeoApi.acceptFriendRequest(requestId);
      else await window.MoyeoApi.rejectFriendRequest(requestId);
      setServerData((current) => (current ? { ...current, received: current.received.filter((item) => item.requestId !== requestId) } : current));
      if (accept) window.MoyeoApi.friends().then((result) => {
        setServerData((current) => (current ? { ...current, mine: result?.friends || current.mine } : current));
      }).catch(() => {});
    } catch (error) {
      reportRequestFailure(error, accept ? '친구 신청을 수락하지 못했어요.' : '친구 신청을 거절하지 못했어요.');
    }
  };
  const cancelSent = async (requestId) => {
    setRequestError('');
    try {
      await window.MoyeoApi.cancelFriendRequest(requestId);
      setServerData((current) => (current ? { ...current, sent: current.sent.filter((item) => item.requestId !== requestId) } : current));
    } catch (error) {
      reportRequestFailure(error, '친구 신청을 취소하지 못했어요.');
    }
  };
  // 27-2a 친구 정리 시트로 보낸다. 친구를 끊으면 도감 카드까지 함께 사라지므로
  // 행 안의 즉석 확인이 아니라 별도 화면에서 묻는다 (ATTACH-COMPOSER-CANON §6-5).
  // 실제 DELETE users/me/friends/{friendUserId} 는 27-2a 가 부른다.
  // 친구 프로필로 가는 길이 「친구 정리」 시트 안에만 있었다 — 목록에서 이름을 눌러도
  // 아무 일이 없어서, 프로필을 보려면 정리 메뉴를 먼저 열어야 했다(안드 AND-121 과 같은 계열).
  // 이름 줄 자체를 눌러 프로필(공개 프로필)로 간다. ⋯ 의 「친구 정리」는 그대로 둔다.
  const openFriendProfile = (item) => {
    const userId = item.user?.userId;
    if (userId == null) return;
    nav.go('public-profile', { params: { userId } });
  };
  // 이름·사진을 감싸는 눌림 영역. 행을 통째로 button 으로 만들면 안의 수락·거절 버튼이
  // button 안의 button 이 되므로 이름 줄만 버튼으로 둔다.
  const FriendIdentity = ({ item, sub }) => (
    <button
      type="button"
      data-testid={`friend-profile-${item.user?.userId ?? 'unknown'}`}
      onClick={() => openFriendProfile(item)}
      disabled={item.user?.userId == null}
      aria-label={`${item.user?.nickname || '친구'} 프로필 보기`}
      style={{
        flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 12,
        border: 0, background: 'transparent', padding: 0, textAlign: 'left',
        fontFamily: T.fontStack, cursor: item.user?.userId == null ? 'default' : 'pointer',
      }}>
      <ServerAvatar src={item.user?.profileImageUrl}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: T.text900 }}>{item.user?.nickname}</div>
        {sub && <div style={{ fontSize: 11.5, color: T.text500, marginTop: 3 }}>{sub}</div>}
      </div>
    </button>
  );

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
    const mineList = serverData.mine;
    const receivedList = serverData.received;
    const sentList = serverData.sent;
    const list = { mine: mineList, received: receivedList, sent: sentList }[tab] || [];
    return (
      <Phone>
        <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
          <Header
            title="친구 관리"
            left
            center
            onBack={nav.back}
          />
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
          {/* 검색창을 들어낸 자리 — 친구를 어떻게 만드는지 한 줄로 알려 준다.
              이 안내가 없으면 사용자는 친구를 늘릴 길을 아예 찾지 못한다. */}
          <div data-testid="friends-how-to-add" style={{ padding: '10px 20px 2px', fontSize: 11.5, lineHeight: '17px', color: T.text500 }}>
            함께 여행한 사람은 친구 도감에서 신청할 수 있어요.
          </div>
          <div style={{ position: 'absolute', top: 158, left: 0, right: 0, bottom: 0, overflow: 'auto', padding: '6px 0 24px' }}>
            {/* 수락·거절·취소가 실패했을 때 같은 자리에서 알린다. 조용히 삼키면 버튼이
                눌리지 않은 것으로 읽힌다 (QA SOCIAL-010). */}
            {requestError && (
              <div role="alert" data-testid="friends-request-error" style={{ margin: '4px 20px 8px', padding: '10px 12px', borderRadius: 10, border: `1px solid ${T.danger}`, fontSize: 12, lineHeight: '18px', color: T.danger }}>{requestError}</div>
            )}
            {tab === 'received' && receivedList.length > 0 && (
              <div style={{ padding: '10px 20px 4px', fontSize: 11.5, color: T.text500 }}>거절해도 상대방에게는 알려지지 않아요.</div>
            )}
            {list.length === 0 && (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: T.text500, fontSize: 13 }}>
                {tab === 'mine' ? '아직 친구가 없어요. 여행에서 만난 친구에게 신청해보세요!' : tab === 'received' ? '받은 친구 신청이 없어요.' : '보낸 친구 신청이 없어요.'}
              </div>
            )}
            {tab === 'mine' && mineList.map((item) => (
              <div key={item.friendshipId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px' }}>
                <FriendIdentity item={item} sub={item.lastActive ? `${item.lastActive} 접속` : ''}/>
                <IconButton name="more" size={18} ariaLabel={`${item.user?.nickname} 친구 정리`} onClick={() => openFriendManage(item)}/>
              </div>
            ))}
            {tab === 'received' && receivedList.map((item) => (
              <div key={item.requestId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px' }}>
                {/* 받은 신청도 수락 전에 상대가 누구인지 볼 수 있어야 한다 */}
                <FriendIdentity item={item} sub={`${window.MoyeoApi.formatRelative(item.requestedAt)} 신청`}/>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" onClick={() => answerRequest(item.requestId, false)} style={{ height: 34, padding: '0 12px', borderRadius: 10, border: `1px solid ${T.line200}`, background: 'transparent', color: T.text700, fontSize: 12, fontWeight: 800, fontFamily: T.fontStack, cursor: 'pointer' }}>거절</button>
                  <button type="button" onClick={() => answerRequest(item.requestId, true)} style={{ height: 34, padding: '0 14px', borderRadius: 10, border: 'none', background: T.primary500, color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: T.fontStack, cursor: 'pointer' }}>수락</button>
                </div>
              </div>
            ))}
            {tab === 'sent' && sentList.map((item) => (
              <div key={item.requestId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px' }}>
                <FriendIdentity item={item} sub={`${window.MoyeoApi.formatRelative(item.requestedAt)} 신청 · 수락 대기 중`}/>
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
  // 여행 요약의 `coursePublicationAvailable`. 서버가 아직 이 필드를 안 주면 true 로 본다.
  // 로그인 전(프로토타입 모드)에는 판정할 방이 없으므로 예전처럼 그대로 둔다.
  const [canPublishCourse, setCanPublishCourse] = React.useState(!liveMode);
  React.useEffect(() => {
    if (!liveMode) { setRoomId(null); setCanPublishCourse(true); return undefined; }
    let active = true;
    window.MoyeoApi.completedTripRoom()
      .then((room) => {
        if (!active) return;
        const resolved = room ? String(room.roomId) : null;
        setRoomId(resolved);
        // 이미 공개한 코스면 서버가 `coursePublicationAvailable: false` 를 준다 —
        // 그때는 「코스 공개 →」 줄을 두지 않는다. 눌러 봐야 409 로 막히는 길이다.
        setCanPublishCourse(Boolean(room) && window.MoyeoApi.canPublishCourse(room));
        // 다녀온 여행이 하나도 없으면 로딩을 끝내고 빈 상태로 남긴다.
        if (!resolved) setCompanionsState('empty');
      })
      .catch(() => { if (active) { setRoomId(null); setCanPublishCourse(false); setCompanionsState('failed'); } });
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
            <span onClick={() => nav.go('feed-write-1')} style={{ fontSize: 12, fontWeight: 800, color: T.primary600, cursor: 'pointer' }}>피드 쓰기 →</span>
          </div>

          {/* 호스트에게만 — 다녀온 코스를 다른 여행자에게 열어두는 선택. 한 번만 조용히 권한다.
              이미 공개한 코스면 서버가 `coursePublicationAvailable: false` 를 주고, 그때는 줄을 지운다. */}
          {canPublishCourse && (
          <div data-testid="trip-message-course-publish" style={{ marginTop: 10, padding: 13, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card, display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: T.primary50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="map" size={18} color={T.primary600}/>
            </div>
            <div style={{ flex: 1, fontSize: 12, color: T.text700, lineHeight: '17px' }}>
              이 <b>코스</b>를 다른 여행자에게 열어둘 수도 있어요
            </div>
            <span onClick={() => nav.go('course-publish')} style={{ fontSize: 12, fontWeight: 800, color: T.primary600, cursor: 'pointer' }}>코스 공개 →</span>
          </div>
          )}
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

// ───────── 30-2 · 피드 신고 시트 ─────────
//
// **피드 전용이다** (정본 `docs/alignment/REPORT-CANON.md`).
// 서버가 받는 신고는 피드뿐이다 — POST /api/v1/feeds/{feedId}/reports → 204 (2026-09-03 실측).
// 멤버·모집·댓글 신고도 2026-09-14 부터 서버가 받는다 — 대상마다 사유 목록·엔드포인트가
// 다르므로 공용 [ReportReasonSheet](screens-refined.jsx)가 그쪽을 맡는다.
//
// 예전 이 시트는 사유 6종을 직접 갖고 있었고(`스팸 · 도박` 등 **서버 문구와 다른 라벨**이었다)
// 접수는 하지 않은 채 "신고 접수는 아직 서버에서 받지 않아 차단만 반영돼요" 라고 적었다 —
// 피드에 대해서는 거짓이라 걷어냈다.
function ScreenReportSheet() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  // 시트 접근성은 공용 훅 한 곳에서 본다 (QA ENV-007 · shared.jsx `useSheetA11y`).
  const reportSheet = window.useSheetA11y({ label: '신고 사유를 알려주세요', onClose: nav.back });
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
  // 차단은 **되돌릴 수 없는 부수 효과**다(보낸 친구 신청까지 조용히 취소된다 — W-36).
  // 사용자가 켠 적 없는 값을 기본으로 박지 않는다 (W-101).
  const [block, setBlock] = React.useState(false);
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
      // 409 는 40917 만이 아니다 — 40918(프로필 이미지 필요)·40902(추가 정보 필요)도 409 다.
      // 코드를 보지 않고 409 전체를 「이미 신고함」으로 뭉개면 실패를 성공처럼 알린다 (W-102).
      if (String(error?.code) === '40917') {
        reported = 'already';
      } else if (String(error?.code) === '40039' || error?.status === 403) {
        // 자기 피드다(400 `40039` · 정본이 처음 403 이라 적었던 그 자리). 다른 400 —
        // 예컨대 상세 301자 `40000` — 은 사유·입력 문제라 오류 문구로 남긴다.
        setSubmitting(false);
        setStatus('own-feed');
        return;
      } else {
        setSubmitting(false);
        // 실패 기본 문구는 한 문장이다 — 화면마다 「잠시 후 다시 시도해주세요.」가
        // 붙었다 떨어졌다 하던 자리다 (정본 REPORT-COPY-CANON §발견된 어긋남).
        setSubmitError(window.userFacingError(error, window.REPORT_SUBMIT_FAILED));
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
        blockError = window.userFacingError(error, '차단하지 못했어요. 잠시 후 다시 시도해주세요.');
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
        <div {...reportSheet.rootProps} data-testid="report-sheet" style={{
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
          {/* 40039 — 정본 표의 문장 그대로다. */}
          {status === 'own-feed' && '본인이 쓴 피드는 신고할 수 없어요.'}
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
          {/* 친구 관계 정리는 되돌릴 수 없다 — 체크 전에 알아야 한다 (W-36). */}
          {' '}주고받은 친구 신청은 취소되고, 친구였다면 친구 관계도 끊어져요.
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
            {/* 차단은 친구 관계까지 정리한다 — 눌러 보고 나서야 알게 되면 늦다 (W-36). */}
            {' '}<b>주고받은 친구 신청은 취소되고, 친구였다면 친구 관계도 끊어져요.</b>
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
  // 시트 접근성은 공용 훅 한 곳에서 본다 (QA ENV-007 · shared.jsx `useSheetA11y`).
  const publishConfirmSheet = window.useSheetA11y({
    label: '코스 공개 확인',
    onClose: () => { setConfirm(false); setPublishError(''); },
  });
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
  // 자격이 없으면(다녀온 여행이 없다) 화면이 **정상 레이아웃 그대로** 열리고 CTA 만 비활성이라,
  // 왜 못 누르는지 알 수 없었다 (W-69). 「없다」·「못 받았다」·「아직」을 갈라 말한다.
  const [publishStatus, setPublishStatus] = React.useState(liveMode ? 'loading' : 'signed-out');
  React.useEffect(() => {
    if (!liveMode) { setPublishStatus('signed-out'); return undefined; }
    let active = true;
    setPublishStatus('loading');
    // 공개 자격은 **서버가 정한다** — 여행 요약의 `coursePublicationAvailable` 이고,
    // 이미 공개한 코스에는 false 로 온다 (2026-09-14 서버 추가). 예전에는 이 값을 아무도
    // 읽지 않아, 이미 공개된 코스에도 「코스 공개하기」가 평소와 똑같이 보이고
    // 누르면 서버 409 원문이 떴다 (QA AFTER-026).
    let publicationClosed = false;
    window.MoyeoApi.completedTripRoom()
      .then((room) => {
        publicationClosed = Boolean(room) && !window.MoyeoApi.canPublishCourse(room);
        return room ? window.MoyeoApi.roomCourse(String(room.roomId)) : null;
      })
      .then((result) => {
        if (!active) return;
        if (!result?.course) { setPublishStatus('not-eligible'); return; }
        setCourse(result.course);
        setTitle(result.course.title || '');
        setDescription(result.course.description || '');
        setPublishStatus(publicationClosed ? 'already-published' : 'ready');
      })
      .catch(() => { if (active) setPublishStatus('error'); });
    return () => { active = false; };
  }, [liveMode]);
  const courseTitle = title;
  // 제목·소개는 서버가 **둘 다 필수**로 받는다. 하나라도 비면 보내지 않는다.
  const alreadyPublished = publishStatus === 'already-published';
  const canPublish = Boolean(course?.courseId) && !alreadyPublished && title.trim() && description.trim();
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
      setPublishError(window.userFacingError(error, '코스를 공개하지 못했어요.'));
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
          {publishStatus !== 'ready' && (
            <div role={publishStatus === 'error' ? 'alert' : 'status'} data-testid="course-publish-state" style={{ marginTop: 14, padding: 13, borderRadius: 12, background: T.bgSubtle, border: `1px solid ${RF.softLine}`, fontSize: 12.5, lineHeight: '19px', color: T.text700 }}>
              {publishStatus === 'signed-out' && '로그인하면 모집 중인 모임을 볼 수 있어요.'}
              {publishStatus === 'loading' && '불러오는 중이에요…'}
              {publishStatus === 'not-eligible' && '공개할 수 있는 코스는 여행을 마친 모임의 코스예요. 다녀온 여행이 생기면 여기서 공개할 수 있어요.'}
              {publishStatus === 'already-published' && '이미 공개한 코스예요. 코스 상세에서 다른 여행자에게 보이는 모습을 볼 수 있어요.'}
              {publishStatus === 'error' && '공개할 코스를 불러오지 못했어요.'}
            </div>
          )}

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
          {/* 이름은 **100자**까지다 — 서버 `PublishTravelCourseRequest.title` 의 `@Size(max = 100)` 과 같은 값이다.
              예전에는 24 였다. 모집 제목이 같은 이유로 24 였다가 2026-09-15 결정으로 100 이 되었고
              (`docs/alignment/ROUND-2026-09-14-DECISIONS.md` ⑨), 코스 이름도 같은 규칙을 따른다:
              **화면이 서버보다 좁게 막지 않는다.** 여기서 공개한 이름을 다시 여는 18-7 도 100 이다. */}
          <div style={{ marginTop: 18 }}>
            <AddFieldLabel required>코스 이름</AddFieldLabel>
            <input
              type="text"
              data-testid="course-publish-title"
              aria-label="코스 이름"
              value={title}
              maxLength={COURSE_PUBLISH_TITLE_LIMIT}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="공개할 코스 이름"
              style={{ ...publishInputStyle, height: 46 }}
            />
            {/* 남은 글자 수는 iOS `Changelog02To05Screens.titleLimit` · 안드 `COURSE_PUBLISH_TITLE_MAX` 와
                같은 문구로 보여 준다 — 세 플랫폼에서 같은 자리에 같은 말이 뜨게 한다. */}
            <div data-testid="course-publish-title-count" style={{ fontSize: 11, color: T.text400, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
              {title.length}/{COURSE_PUBLISH_TITLE_LIMIT} · 공개 코스 목록에 이 이름이 보여요
            </div>
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
          {/* 이미 공개한 코스면 공개 버튼 자체를 두지 않는다 — 눌러 봐야 서버가 409 로 막는다
              (「코스 공개하기」를 그대로 내주던 것이 QA AFTER-026 의 결함이다). */}
          {alreadyPublished ? (
            <div style={{ flex: 1 }}><Btn variant="ghost" full onClick={nav.back}>돌아가기</Btn></div>
          ) : (
            <>
              <Btn variant="ghost" onClick={nav.back}>지금은 안 할래요</Btn>
              <div style={{ flex: 1 }}><Btn variant="primary" full disabled={!canPublish} testId="course-publish-open" onClick={() => setConfirm(true)}>코스 공개하기</Btn></div>
            </>
          )}
        </div>

        {/* 2단계 확인 — 되돌리기 어려운 액션 */}
        {confirm && (
          <div {...publishConfirmSheet.rootProps} data-testid="course-publish-confirm-dialog" style={{ position: 'absolute', inset: 0, background: T.bgOverlay, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
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
  ScreenBlocked,
  ScreenCoursePublish,
});
