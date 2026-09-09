import assert from "node:assert/strict";
import { createServer } from "node:http";
import { access, mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { execFile, spawn } from "node:child_process";
import path from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import vm from "node:vm";

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const routes = [
  "splash",
  "onboarding",
  "onb-1",
  "onb-2",
  "onb-3",
  "login",
  "email-auth",
  "nickname",
  "profile-image",
  "profile-basic",
  "prof-1",
  "prof-2",
  "prof-3",
  "prof-4",
  "profile-taste",
  "profile-taste-edit",
  "terms",
  "terms-detail",
  "terms-privacy",
  "terms-location",
  "terms-marketing",
  "terms-settings",
  "place-search",
  "place-detail",
  "home",
  "explore",
  "explore-map",
  "search",
  "search-results",
  "notifications",
  "removal-reason",
  "course",
  "trip",
  "apply",
  "create",
  "custom-course",
  "create-schedule",
  "create-people",
  "create-people-small",
  "create-people-large",
  "create-detail",
  "create-meet",
  "create-summary",
  "create-summary-linked",
  "course-edit",
  "course-edit-linked",
  "course-edit-locked",
  "course-edit-custom",
  "meetings",
  "chat-list",
  "chat-list-applied",
  "chat",
  "chat-menu",
  "member-actions",
  "member-remove",
  "chat-attach",
  "attach-photo",
  "attach-place",
  "attach-map",
  "attach-poll",
  "attach-settlement",
  "attach-notice",
  "notice-history",
  "notice-edit",
  "room-notif",
  "leave-alert",
  "leave-member",
  "password-reset",
  "kick-history",
  "trip-status",
  "meeting-edit",
  "apply-cancel",
  "favorite-rooms",
  "course-rating",
  "friend-manage",
  "unblock-confirm",
  "account-providers",
  "messages",
  "feed",
  "feed-detail",
  "feed-write",
  "feed-write-1",
  "feed-write-2",
  "feed-write-3",
  "feed-write-4",
  "feed-write-5",
  "profile",
  "profile-back",
  "my",
  "dex",
  "profile-edit",
  "settings",
  "auth-methods",
  "oss-licenses",
  "oss-license-detail",
  "friends",
  "trip-message",
  "report",
  "blocked",
  "course-publish",
  "trip-confirmed",
  "trip-day",
  "notif-detail",
  "account-delete",
  "system-maintenance",
  "system-error",
  "feed-comments",
  "auth",
  "special-messages",
];

const expectedTexts = {
  home: ["모여트립 in 경북", "이번 주말, 어디로 떠나볼까요?", "지금 떠나기 좋은 코스", "인기 코스 TOP 3", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  explore: ["탐색", "어디로 떠나고 싶나요?", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  "explore-map": ["지도 탐색", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  meetings: ["모임", "진행중", "확정", "종료", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  feed: ["피드", "발견", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  // 목 여행 카드는 없다 — 미로그인 마이는 로그인 안내만 남는다 (찜한 코스 탭도 조회 API 가 없어 지웠다)
  my: ["내 여행", "0개", "진행중", "지난여행", "로그인하면 모집 중인 모임을 볼 수 있어요.", "친구 도감"],
  login: ["모여트립에 오신 걸", "환영해요", "카카오 로그인", "이메일로 시작하기", "Google로 계속하기", "Apple로 계속하기"],
  "email-auth": ["이메일로 시작하기", "비밀번호", "비밀번호를 잊으셨나요?", "계속하기"],
  // 후보는 서버에서만 온다 — 받지 못하면 예시 닉네임 대신 오류 안내가 남는다
  nickname: ["프로필 설정", "어떤 친구로", "시작할까요?", "다른 이름 추천받기", "새 이름을 불러오지 못했어요."],
  "profile-image": ["프로필 설정", "내 친구를 골라주세요", "새 후보 만들기", "이 친구로 시작하기"],
  // 생년월일은 고르기 전까지 비어 있다 — 미리 채우면 사용자가 고르지 않은 날짜가 저장되고
  // 연령 확인이 무의미해진다. 진입 상태에서는 안내 문구가 보여야 한다.
  "profile-basic": ["프로필 설정", "생년월일", "성별", "생년월일을 선택해주세요", "저장하고 다음"],
  "prof-4": ["프로필 설정", "7/8", "어떤 여행을 좋아하세요?", "여행 스타일", "관심 지역", "저장하고 프로필 만들기"],
  "profile-edit": ["프로필 수정", "여행 취향", "탭해서 바로 수정", "여행 스타일", "관심 지역"],
  "profile-taste-edit": ["여행 취향 편집", "여행 스타일과 관심 지역은 함께 저장돼요.", "취소", "저장"],
  terms: ["약관", "동의"],
  "terms-detail": ["이용약관", "필수", "동의하고 돌아가기", "최소 인원(3명)", "제6조 (계정과 닉네임)"],
  "terms-privacy": ["개인정보 처리방침", "필수", "보관 기간", "동의하고 돌아가기"],
  "terms-location": ["위치정보 이용 동의", "선택", "이 항목에 동의하기"],
  "terms-marketing": ["마케팅 정보 수신 동의", "선택", "이 항목에 동의하기"],
  "terms-settings": ["이용약관", "필수", "이전 판본"],
  "place-search": ["방문지 검색", "관광지", "코스에 반영"],
  // 표본 상세를 지웠으므로 contentId 없이 열면 오류 상태만 남는다
  "place-detail": ["방문지", "불러오지 못했어요."],
  splash: ["모여트립 in 경북"],
  "onb-1": ["온보딩", "1/8", "고민 없이 고르는", "경북 코스"],
  "onb-2": ["온보딩", "2/8", "3명이 모이면", "채팅방이 열려요"],
  "onb-3": ["온보딩", "3/8", "여행 뒤엔", "자연스럽게 친구로"],
  "feed-write": ["피드 글쓰기", "STEP 3"],
  // 24-1 후보는 GET /chat-rooms/my (ended · CONFIRMED) 다 — 미로그인이면 후보가 없고
  // 경로 지도·멤버 칩도 그릴 근거가 없다. 예전엔 "경로 (자동)" 빈 카드를 늘 그려서
  // 데이터가 없어도 있는 것처럼 보였다.
  "feed-write-1": ["피드 글쓰기", "STEP 1 · 코스 확인", "기록할 코스", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  "feed-write-2": ["피드 글쓰기", "STEP 2 · 사진 선택", "대표", "사진 추가"],
  "feed-write-3": ["피드 글쓰기", "STEP 3 · 사진 &amp; 메모", "여행 어땠어요?"],
  "feed-write-4": ["피드 글쓰기", "STEP 4 · 공개 설정", "공개 범위", "친구만"],
  "feed-write-5": ["피드 글쓰기", "STEP 5 · 최종 확인", "게시하기"],
  "feed-detail": ["로그인하면 모집 중인 모임을 볼 수 있어요."],
  notifications: ["알림", "모두 읽음", "안읽음 0", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  "removal-reason": ["내보내기 안내", "로그인하면 모집 중인 모임을 볼 수 있어요.", "확인"],
  "member-actions": ["친구 요청하기", "내보내기", "내보내기는 호스트에게만 보여요"],
  "member-remove": ["멤버 내보내기", "내보내는 사유", "0/200", "취소", "내보내기", "이미 남긴 대화는 채팅방에 그대로 남아요"],
  // 추천 검색 결과 섹션은 화면기획에 없어 삭제했다. 인기 검색어는 조회 API 가 없어 섹션 자체를 두지 않는다.
  search: ["최근 검색어가 없어요."],
  course: ["코스 상세", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  // 기획 25는 커버·이름·지표 3칸·소개·메뉴 3줄로 끝난다 — "최근 여행" 섹션은 기획에 없어 삭제했다
  // 25 는 프로필 카드다. 관리 진입점(차단한 사용자 등)은 마이로 옮겼다.
  // DM 기획이 없어 프로필 카드에는 "메시지" 버튼을 두지 않는다.
  profile: ["프로필", "불러오지 못했어요."],
  "profile-back": ["프로필", "불러오지 못했어요."],
  "auth-methods": ["로그인 방식", "카카오", "Google", "이메일", "Apple"],
  create: ["모집 만들기 (1/5)", "코스 선택", "등록된 코스로 떠나기", "코스 직접 만들기", "이 코스로 다음"],
  "custom-course": ["코스 직접 만들기", "방문지 검색", "최소 2개 · 최대 20개", "여행이 확정되기 전까지"],
  "create-schedule": ["모집 만들기 (2/5)", "일정 정하기", "당일치기", "1박 이상", "집합 장소 · 집합 시간", "이전", "다음"],
  "create-people": ["모집 만들기 (3/5)", "몇 명이 모이면 좋을까요?", "최소 인원", "최대 인원", "20~100세", "성별 제한", "이전", "다음"],
  // 17-4a · 17-4b — 인원수별 멘트 3단계 중 양 끝. 기본값(17-4)은 위 단체 사진 멘트다.
  "create-people-small": ["모집 만들기 (3/5)", "4명", "3 / 4명 · 최소 충족", "말 트기 좋은 작은 그룹이에요"],
  "create-people-large": ["모집 만들기 (3/5)", "10명", "3 / 10명 · 최소 충족", "9명 이상은 친목이 쉽지 않을 수 있어요"],
  "create-detail": ["모집 만들기 (4/5)", "어떤 여행인지 알려주세요", "모집 이름 (채팅방 이름)", "신청 승인 방식", "이전", "다음"],
  "create-meet": ["모집 만들기 (2/5)", "집합 장소 정하기", "검색하거나 지도의 핀을 움직여 정확한 위치를 알려주세요.", "상세 안내", "좌표 (자동 저장)", "집합 시간", "근처 모집 추천", "이전", "이 위치로 지정"],
  "create-summary": ["모집 만들기 (5/5)", "이대로 모집을 열까요?", "호스트 직접 코스", "여행이 확정되기 전까지", "이전", "모집 열기"],
  "create-summary-linked": ["모집 만들기 (5/5)", "이대로 모집을 열까요?", "등록된 코스", "경로(방문지·순서)는 수정할 수 없고", "이전", "모집 열기"],
  "course-edit": ["여행 경로", "마감 전까지 경로를 바꿀 수 있어요", "저장하고 멤버에게 알리기"],
  "course-edit-linked": ["여행 경로", "등록된 코스라 경로는 고정이에요", "집합 정보 수정"],
  "course-edit-locked": ["여행 경로", "여행이 확정돼 경로가 잠겼어요", "공지로 알리기"],
  "notice-history": ["공지 이력", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  "chat-list-applied": ["신청중", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  chat: ["로그인하면 모집 중인 모임을 볼 수 있어요."],
  "leave-alert": ["호스트가 나가면", "이 모임은 종료돼요", "모임 종료"],
  "chat-menu": ["모임 정보", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  "chat-attach": ["무엇을 공유할까요?", "사진", "장소", "지도", "투표"],
  // 첨부 작성 6종은 방이 정해져야 열린다 — 미로그인은 §2 정본 문구만 남는다.
  "attach-photo": ["사진 보내기", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  "attach-place": ["장소 카드 보내기", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  "attach-map": ["만날 위치 보내기", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  "attach-poll": ["투표 만들기", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  "attach-settlement": ["정산 메모", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  "attach-notice": ["공지 작성", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  "search-results": ["코스", "모집", "로그인하면 모임을 검색할 수 있어요."],
  // ATTACH-COMPOSER-CANON §6 신설 화면 — 대상(방·친구·공지)이 정해져야 열리므로
  // 미로그인에서는 §2 정본 문구만 남는다. 08-H 만 세션 없이도 쓰는 화면이다.
  "password-reset": ["비밀번호 재설정", "가입하신 이메일을 알려주세요", "재설정 링크 보내기"],
  "course-rating": ["코스 평가", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  "trip-status": ["여행 확정하기", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  "meeting-edit": ["집합 정보 수정", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  "room-notif": ["이 모임 알림", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  "notice-edit": ["공지 수정", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  "favorite-rooms": ["찜한 모집", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  "apply-cancel": ["참가 신청 취소", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  "unblock-confirm": ["차단 해제", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  "friend-manage": ["로그인하면 모집 중인 모임을 볼 수 있어요."],
  "kick-history": ["내보내진 기록", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  // 31-1 참가자 나가기 — 31(호스트)과 문구가 갈린다 (정본 §6-5)
  "leave-member": ["이 모임에서", "나갈까요?", "나가기"],
  "account-providers": ["로그인 방식", "카카오", "Google", "이메일", "Apple"],
  friends: ["친구 관리", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  "trip-message": ["함께 걸어준 친구들에게", "한 줄 남겨볼까요?", "도감 카드"],
  // 30-2 는 **피드 전용 실제 접수**다 (정본 REPORT-CANON §2). 사유 6종을 서버에서 받고
  // 대상 피드가 정해져야 열리므로, 미로그인에서는 §2 정본 문구만 남는다 —
  // 예전 기대값(신고하기·차단)은 하드코딩 사유와 차단 전용 시트의 잔재였다.
  report: ["신고 사유", "로그인하면 모집 중인 모임을 볼 수 있어요."],
  blocked: ["차단한 사용자", "차단 해제"],
  "course-publish": ["코스 공개", "한 번 공개한 코스는", "코스 공개하기"],
  "trip-confirmed": ["여행이 확정됐어요!", "확정된 여행", "채팅방으로 가기"],
  "trip-day": ["로그인하면 모집 중인 모임을 볼 수 있어요."],
  "notif-detail": ["채팅 알림", "방해금지", "멘션·답글만"],
  "account-delete": ["계정 탈퇴", "30일", "탈퇴"],
  "system-maintenance": ["잠시 점검 중이에요", "다시 확인"],
  "system-error": ["무언가 살짝", "잘못됐어요", "새로고침"],
  "feed-comments": ["댓글", "로그인하면 모집 중인 모임을 볼 수 있어요."],
};

const requiredAssets = [
  "login-welcome.webp",
  "login-welcome-night.webp",
  "splash-generated.webp",
  "splash-generated-night.webp",
  "weather-sunny-cheomseongdae.webp",
  "weather-sunny-cheomseongdae-night.webp",
  "weather-cloudy-bulguksa.webp",
  "weather-cloudy-bulguksa-night.webp",
  "weather-rain-hahoe.webp",
  "weather-rain-hahoe-night.webp",
  "weather-snow-buseoksa.webp",
  "weather-snow-buseoksa-night.webp",
  "weather-fog-seokguram.webp",
  "weather-fog-seokguram-night.webp",
  "weather-wind-homigot.webp",
  "weather-wind-homigot-night.webp",
  "weather-heavy-rain-woljeonggyo.webp",
  "weather-heavy-rain-woljeonggyo-night.webp",
  "weather-heatwave-dosan.webp",
  "weather-heatwave-dosan-night.webp",
  "weather-dust-donggung-wolji.webp",
  "weather-dust-donggung-wolji-night.webp",
  "kakao-login-ko-official.png",
  "google-g-official.png",
  "apple-continue-black-ko-official.png",
  "apple-continue-white-ko-official.png",
  "kakao-mark-official.png",
  "google-g-light-official.png",
  "google-g-dark-official.png",
  "apple-mark-black-official.png",
  "apple-mark-white-official.png",
  "onboarding-1.webp",
  "onboarding-1-night.webp",
  "onboarding-2.webp",
  "onboarding-2-night.webp",
  "onboarding-3.webp",
  "onboarding-3-night.webp",
  "celebration/trip-confirmed-light.webp",
  "celebration/trip-confirmed-dark.webp",
  "fonts/LINESeedKR-Rg.woff2",
  "fonts/LINESeedKR-Bd.woff2",
  "licenses/LINESeedSansKR-OFL.txt",
  "licenses/Lucide-ISC.txt",
  "vendor/lucide.js",
];

async function fileExists(relativePath) {
  await access(path.join(root, relativePath));
}

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

// vm 컨텍스트가 만든 배열/객체는 realm 이 달라 deepStrictEqual 이 실패한다 — 값만 비교한다.
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertIncludes(source, snippets, label) {
  for (const snippet of snippets) {
    assert.ok(source.includes(snippet), `${label} should include ${snippet}`);
  }
}

// 목데이터를 지운 자리를 지킨다 — 폴백이 슬그머니 돌아오면 여기서 걸린다.
function assertExcludes(source, snippets, label) {
  for (const snippet of snippets) {
    assert.ok(!source.includes(snippet), `${label} must not include ${snippet}`);
  }
}

function assertScriptOrder(html) {
  const expected = [
    "src/tokens.jsx",
    "src/shared.jsx",
    "src/cached-image.jsx",
    // 탭 보관소는 화면 모듈보다 먼저 로드돼야 한다 (TAB-STATE-CANON R1).
    "src/tab-cache.js",
    "src/push-notifications.js",
    "src/auth-api.jsx",
    "src/tourism-api.js",
    "src/screens-onboarding.jsx",
    "src/screens-extra.jsx",
    "src/screens-extra2.jsx",
    "src/screens-refined.jsx",
    "src/screens-additions.jsx",
    "src/screens-additions2.jsx",
    "src/screens-additions3.jsx",
    "src/screens-additions4.jsx",
    "src/screens-attach.jsx",
    "src/screens-gaps.jsx",
    "src/prototype.jsx",
    "src/mobile-app.jsx",
  ];
  let cursor = -1;
  for (const item of expected) {
    const next = html.indexOf(item);
    assert.ok(next > cursor, `${item} should be loaded after previous screen modules`);
    cursor = next;
  }
}

async function staticTests() {
  await Promise.all([
    fileExists("index.html"),
    fileExists("package.json"),
    fileExists("README.md"),
    fileExists(".nojekyll"),
    fileExists(".github/workflows/deploy-pages.yml"),
    // 라이브 캡처 세션 파일의 형식 예시. 실제 토큰 파일(.local.js)은 gitignore 라 없을 수 있다.
    fileExists("src/capture-session.example.js"),
  ]);

  // 라이브 캡처 세션 파일은 절대 커밋되지 않아야 한다 (토큰이 리포에 남는다).
  const gitignore = await read(".gitignore");
  assertIncludes(gitignore, ["src/runtime-config.local.js", "src/capture-session.local.js"], ".gitignore");
  const captureSessionExample = await read("src/capture-session.example.js");
  assertIncludes(captureSessionExample, ["window.MOYEO_CAPTURE_SESSION", "accessToken", "liveData=1"], "capture session example");
  assert.ok(
    !/^\s*refreshToken\s*:/m.test(captureSessionExample),
    "예시 파일은 refreshToken 필드를 넣지 않는다 (refresh 응답이 localStorage 로 새는 경로를 막는다)",
  );

  const [html, mobileApp, refined, additions, additions2, additions3, additions4, attach, gaps, api, shared, cachedImage, pushNotifications, serviceWorker, prototype, onboarding, authApi, tourismApi, extra, extra2, readme, standaloneWorkflow, devServer, observability] = await Promise.all([
    read("index.html"),
    read("src/mobile-app.jsx"),
    read("src/screens-refined.jsx"),
    read("src/screens-additions.jsx"),
    read("src/screens-additions2.jsx"),
    read("src/screens-additions3.jsx"),
    read("src/screens-additions4.jsx"),
    read("src/screens-attach.jsx"),
    read("src/screens-gaps.jsx"),
    read("src/moyeo-api.js"),
    read("src/shared.jsx"),
    read("src/cached-image.jsx"),
    read("src/push-notifications.js"),
    read("firebase-messaging-sw.js"),
    read("src/prototype.jsx"),
    read("src/screens-onboarding.jsx"),
    read("src/auth-api.jsx"),
    read("src/tourism-api.js"),
    read("src/screens-extra.jsx"),
    read("src/screens-extra2.jsx"),
    read("README.md"),
    read(".github/workflows/deploy-pages.yml"),
    read("scripts/dev-server.mjs"),
    read("src/observability.js"),
  ]);

  assertScriptOrder(html);
  assertIncludes(additions, [
    "function ScreenCreateSchedule",
    "function ScreenCreatePeople",
    "function ScreenCreateMeetPoint",
    "function ScreenCustomCourse",
    "function ScreenNoticeHistory",
    "function ScreenCreateSummary",
    "function ScreenCourseEdit",
    "data-testid={`segment-${o.id}`}",
    // 좌표 칸(`meeting-latitude`·`meeting-longitude`)은 **없앴다** — 위경도 숫자는
    // 사용자가 읽을 값이 아니다(사용자 결정 2026-09-09, 17-3). 값 자체는 지도 핀이 잡아
    // 그대로 저장되고 채팅방 지도 카드·길 찾기에 쓰인다. 그래서 이 두 표식도 함께 지운다.
    "tourapi-place-search",
    "custom-course-count",
    "move-stop-up-",
    "move-stop-down-",
    "stops.length >= 20",
    // 공지 작성 시트는 20-2f 공지 작성 화면으로 옮겼다 (ATTACH-COMPOSER-CANON §2·R5-1) —
    // 작성 화면이 두 벌이면 문구·고정 규칙이 갈린다.
    "nav.go('attach-notice')",
    "create-summary-${resolvedSource}",
    "course-edit-${mode}",
    "window.__moyeoCourseSource || 'custom'",
    "nav.go('create-people')",
  ], "changeLog01 additions");
  assertIncludes(
    additions2,
    ["nav.go((window.__moyeoCourseSource || 'custom') === 'linked' ? 'create-summary-linked' : 'create-summary')"],
    "linked summary routing"
  );
  assertIncludes(additions2, [
    "function ScreenCreatePeople",
    "function ScreenCreateDetail",
    "function ScreenChatMenu",
    "function ScreenFriends",
    "function ScreenTripMessage",
    "function ScreenCoursePublish",
  ], "changeLog02-03 additions");
  assertIncludes(additions3, [
    "function ScreenTripConfirmed",
    "moyeo-confetti-piece",
    "trip-confirmed-${themeMode}.webp",
    "new MutationObserver(syncTheme)",
    "function ScreenTripDay",
    "function ScreenNotifDetail",
    "function ScreenAccountDelete",
    // 안드로이드·iOS 와 글자 그대로 같은 확인 문구를 쓴다
    "삭제 범위와 30일 대기 정책을 확인했어요",
    "disabled={!reason || !deleteAcknowledged}",
    "function ScreenFeedComments",
  ], "changeLog04 additions");
  assertIncludes(additions4, [
    "function ScreenPlaceSearch",
    "function ScreenPlaceDetail",
    "function ScreenTermsDetail",
    // 17-1a "지도에서 보기" — 안드로이드와 같은 실지도 순번 마커. 예전엔 버튼만 있고 지도가 없었다.
    "ariaLabel=\"지도에서 보기\"",
    "place-search-map",
    "<MiniMap height={150} markers={mapMarkers}/>",
    "doc=\"marketing\"",
    "from=\"settings\"",
    "current.postalCode",
    "메뉴판 탭은 음식점 콘텐츠에서만",
  ], "changeLog06-07 additions");
  // 모집 이름·소개글·참가비는 사용자가 채우는 빈 폼이다 — 값을 미리 넣어 두면 목데이터다.
  assertIncludes(additions2, [
    "모집 이름 (채팅방 이름)",
    "20~100세",
    "create-detail-title",
    "create-detail-intro",
    "create-detail-fee",
  ], "changeLog06 recruitment details");
  assertExcludes(additions2, ["1인 45,000원", "45,000원", "30대끼리 느긋하게 힐링 여행가요~"], "17-5 has no prefilled mock values");
  // 약관은 서버 목록(GET /api/v1/terms)으로 그린다 — 항목을 클라가 하드코딩하지 않는다.
  // 동의한 termId 는 회원가입 요청의 agreedTermIds 로 나가야 한다(없으면 서버가 400 40012).
  assertIncludes(extra, [
    "terms-open-${testId}",
    "window.MoyeoApi.terms()",
    "agreedTermIds: [...agreedIds]",
    "nav.go('terms-detail', { termId: term.termId })",
  ], "server-driven terms agreement");
  assertIncludes(extra2, ["privacy-settings", "terms-settings"], "settings terms entries");
  assertIncludes(prototype, ["'place-search': window.ScreenPlaceSearch", "'terms-marketing': window.ScreenTermsMarketing"], "changeLog06-07 routes");
  assertIncludes(mobileApp, ["'onb-1': 'onboarding'", "'place-detail': 'place-detail'", "'terms-settings': 'terms-settings'"], "design artboard route aliases");
  assertIncludes(refined, [
  ], "changeLog01 refined screens");
  assert.ok(!refined.includes("'추천시기','봄-가을'"), "course detail must remove recommendation season metric");
  // 코스 상세·모집 상세·채팅방의 기획 목데이터는 지웠다 — 서버 값이 없으면 빈 상태만 남는다.
  assertExcludes(refined, [
  ], "refined screens have no planning mock data");
  assert.ok(!refined.includes("<div style={{ fontSize: 15, fontWeight: 900, marginTop: 24, marginBottom: 10 }}>코스 일정</div>"), "course detail must not duplicate the itinerary already represented by the route preview");
  assert.ok(!refined.includes("<div style={{ fontSize: 15, fontWeight: 900, marginTop: 24, marginBottom: 10 }}>함께 보면 좋은 곳</div>"), "course detail must not add planning-only nearby recommendations");
  assert.ok(!refined.includes("영주 부석사 눈길은 조용해서 더 좋았어요"), "feed mock data must stay aligned with the six planning feed cards");
  assert.ok(!refined.includes("울진 금강송 숲길에서 쉬어간 오후"), "feed mock data must stay aligned with the six planning feed cards");
  assertIncludes(extra, [
    "host-course-edit",
    "data-testid={`meeting-tab-${id}`}",
    // 목 배열의 인덱스가 아니라 서버 방 id 가 기준이다.
    "data-testid={`application-room-${item.roomId}`}",
    "function ScreenChatListApplied",
  ], "changeLog01 extra screens");
  // 위 화면들의 값은 이제 서버 응답에서 온다 — 목 문자열이 되살아나면 여기서 걸린다.
  assertExcludes(extra, [
    "숲속여행자",
    "주왕산 & 주산지 힐링 트레킹",
    "청송 시외버스터미널",
    "36.435612, 129.057214",
    "id: 'waiting'",
    "id: 'queued'",
  ], "changeLog01 extra screens have no mock data");
  assertIncludes(prototype, [
    "'chat-list-applied': window.ScreenChatListApplied",
    "'course-edit-custom': window.ScreenCourseEdit",
    "'leave-alert': window.ScreenLeaveAlert",
  ], "changeLog01 routes");
  assert.ok(!refined.includes("회원가입 로그인 체험"), "home must not restore the removed auth experience button");
  assert.ok(!refined.includes("회원가입 · 로그인 체험"), "home must not restore the removed auth experience entry");
  assert.ok(!prototype.includes("system-update"), "forced update route must stay removed");
  assert.ok(!mobileApp.includes("ScreenOffline"), "web must not render the native full-screen offline states");
  assertIncludes(readme, [
    "방문지는 최소 2개, 최대 20개",
    "여행 확정 뒤에는 출처와 관계없이 경로가 잠깁니다",
    "호스트가 모임을 나가면 다른 멤버에게 권한을 넘기지 않고 모임이 즉시 종료됩니다",
  ], "changeLog01 README policy");
  assertIncludes(cachedImage, [
    "moyeo-images-v1",
    "MOYEO_IMAGE_MAX_ATTEMPTS = 3",
    "moyeoImageFileName",
    "cache.match",
    "cache.put",
    "force-cache",
    "function CachedImage",
    "preloadMoyeoImages",
    "moyeoThemeImageSource",
  ], "cached image loader");
  assertIncludes(pushNotifications, [
    "Notification.requestPermission",
    "firebase.messaging",
    "instance.getToken({",
    "vapidKey: config().firebaseVapidKey",
    "serviceWorkerRegistration: registration",
    "moyeo:push-message",
    "moyeo:push-state",
    "moyeo:push-token",
    "setTokenRegistrar",
    "syncToken",
    "document.baseURI",
    "STATUS.DENIED",
    "STATUS.UNSUPPORTED",
    "notification-center",
  ], "FCM browser client");
  assertIncludes(serviceWorker, [
    "firebase-messaging-compat.js",
    "onBackgroundMessage",
    "notificationclick",
    "clients.openWindow",
    "self.registration.scope",
  ], "FCM service worker");
  assertIncludes(devServer, [
    "runtime-config.local.js",
    "FIREBASE_WEB_API_KEY",
    "FIREBASE_WEB_VAPID_KEY",
    "MOYEO_FCM_TOKEN_REGISTRATION_PATH",
    "KAKAO_JAVASCRIPT_KEY",
    "KAKAO_REDIRECT_URI",
    "http.server",
  ], "development server");
  assertIncludes(html, ["react@18.3.1", "@babel/standalone", "firebasejs/12.16.0", "firebase-auth-compat", "firebase-messaging-compat", "push-notifications.js", "kakao_js_sdk/2.8.1", "runtime-config.js", "src/capture-session.local.js", "LINE Seed Sans KR", "LINESeedKR-Rg.woff2", "LINESeedKR-Bd.woff2", "assets/vendor/lucide.js", "observability.js"], "index.html");
  assertIncludes(authApi, [
    "/api/v1/auth/login",
    "/api/v1/auth/signup",
    "/api/v1/auth/refresh",
    "/api/v1/auth/firebase/kakao/authorization-code/custom-token",
    "/api/v1/auth/providers",
    "/api/v1/users/me/profile-images",
    "/api/v1/users/me/profile-image",
    "nicknameSelectionToken",
    "window.MOYEO_MOCK_AUTH_BACKEND === true",
    "timeoutMs: 180000",
    "restoreAuthState",
    "signInWithRedirect",
    "getRedirectResult",
    "loginBody.fcmToken",
    "currentFcmToken",
    "pushTokenRegistrationPath",
    "setTokenRegistrar",
    "return { route: 'onboarding' };",
    // 가입 게이트 (docs/alignment/SIGNUP-GATE-CANON.md R1·R2·R4·R6)
    "SIGNUP_GATE_STATES",
    "40902",
    "40918",
    "PROFILE_IMAGE_ALREADY_SET = '40919'",
    "moyeo:signup-gate",
    "body.travelStyleIds = travelStyleIds",
    "body.interestedRegionIds = interestedRegionIds",
    "normalizeFcmToken",
  ], "auth-api.jsx");
  // 게이트 판정이 401 판정 뒤로 밀리면 40902·40918 이 재발급 경로로 새어 무한 재시도가 된다.
  assert.ok(
    authApi.indexOf("const gateState = signupGateState(error);") < authApi.indexOf("error?.status !== 401"),
    "가입 게이트 판정은 401 재발급 판정보다 먼저 와야 한다",
  );
  assertIncludes(prototype, ["moyeo:signup-gate"], "가입 게이트 이벤트를 라우터가 받는다");
  assert.ok(!authApi.includes("/api/v1/auth/login/${"), "auth login must not use provider-specific URLs");
  assert.ok(!authApi.includes("/api/v1/auth/signup/${"), "auth signup must not use provider-specific URLs");
  assertIncludes(tourismApi, [
    "/api/v1/tourism-contents",
    "normalizeListItem",
    "normalizeDetail",
    "thumbnailUrl",
    "postalCode",
    "menuImages",
    "contentImages",
    "parseHomepage",
    "totalElements",
    "SCHEMA_MISMATCH",
  ], "tourism API client");
  // 관광 표본과 캡처 분기는 지웠다 — 서버 응답만이 근거다.
  assertExcludes(tourismApi, [
    "SAMPLE_PLACES",
    "SAMPLE_DETAIL",
    "samplePlaces",
    "sampleDetail",
    "usesDeterministicSamples",
  ], "tourism API client has no samples");
  assertIncludes(additions4, [
    "window.MoyeoTourism.list({ keyword, contentTypeId: typeFilter, size: 30 })",
    "window.MoyeoTourism.detail(selectedId)",
    "PlaceImage",
    // TourAPI 원본 이미지 호스트는 CORS 를 안 줘서 CachedImage(fetch) 로는 못 읽는다
    "function RemotePlaceImage",
    // 빈 상태 문구는 docs/alignment/NO-MOCK-CANON.md §2 정본을 글자 그대로 쓴다
    "불러오는 중이에요…",
    "불러오지 못했어요.",
    "검색 결과가 없어요",
  ], "live tourism screens");
  // 17-1a·17-1b 는 표본 폴백 없이 빈 상태로 끝낸다.
  assertExcludes(additions4, [
    "예시 장소를 대신 보여드려요",
    "예시 상세를 대신 보여드려요",
    "MoyeoTourism.samplePlaces",
    "MoyeoTourism.sampleDetail",
    "usesDeterministicSamples",
  ], "tourism screens have no sample fallback");
  // 17-1a 검색은 서버 keyword 로만 거른다 — 클라이언트 제목/주소 재필터는 이중 필터라 금지
  assert.ok(
    !additions4.includes("const matchesQuery ="),
    "place search must not re-filter live results on the client",
  );
  assertIncludes(extra, [
    "auth-login-${provider}",
    "auth-login-welcome-image",
    "assets/login-welcome.webp",
    "assets/login-welcome-night.webp",
    "fetchpriority=\"high\"",
    "provider=\"kakao\"",
    "provider=\"email\"",
    "provider=\"google\"",
    "provider=\"apple\"",
    "ScreenEmailAuth",
    // 로그인/새 계정 만들기를 사용자가 먼저 고르지 않는다 — 한 번 시도하고 계정이 없으면 만든다.
    // (Firebase Email Enumeration Protection 때문에 계정 없음과 비밀번호 오류가 구분되지 않아,
    //  가입 시도의 EMAIL_EXISTS 로 가린다. auth-api 의 signInOrCreateEmailUser)
    "'계속하기'",
    // 재설정 메일은 08-H(screens-gaps.jsx)가 보낸다 — 08-A 는 그 화면으로 보내기만 한다.
    "nav.go('password-reset')",
    "회원 생성 중",
    "MoyeoAuth.signup",
    "KoreanBirthDatePicker",
    "auth-birth-date-dialog",
    "연도 · 월 · 일 순서",
  ], "auth screens");
  assertIncludes(gaps, ["MoyeoAuth.resetEmailPassword", "password-reset-sent"], "08-H 비밀번호 재설정");
  assertIncludes(authApi, [
    "signInOrCreateEmailUser",
    "auth/email-already-in-use",
    "agreedTermIds",
  ], "email sign-in falls back to account creation");
  assertIncludes(html, ["scrollbar-width: none", "::-webkit-scrollbar", "box-sizing: border-box"], "index CSS");

  // 클라이언트 전용 기능 — 최근 검색어(12) · 테마 3상태(29) · 앱 버전(29) · 오픈소스 라이선스(29-4)
  const [clientPrefs, ossLicenses, additions5, tokens] = await Promise.all([
    read("src/client-prefs.js"),
    read("src/oss-licenses.js"),
    read("src/screens-additions5.jsx"),
    read("src/tokens.jsx"),
  ]);
  assertIncludes(html, [
    "src/client-prefs.js",
    "src/oss-licenses.js",
    "src/screens-additions5.jsx",
    "src/screens-attach.jsx",
  ], "client-only modules are loaded");
  // client-prefs 는 tokens.jsx 보다 먼저 실행돼야 첫 페인트 전에 테마가 적용된다
  assert.ok(
    html.indexOf("src/client-prefs.js") < html.indexOf("src/tokens.jsx"),
    "client-prefs.js should load before tokens.jsx",
  );
  assertIncludes(clientPrefs, [
    "moyeo-trip-recent-searches",
    "RECENT_SEARCHES_LIMIT = 10",
    "moyeo-trip-theme",
    "['system', 'light', 'dark']",
    "moyeo:theme-mode",
    "function cycleMoyeoThemeMode",
    "function watchMoyeoThemeMode",
    // 버전은 캡처에서도 실제 배포 버전이다 — 화면기획 값(1.0.4)을 덮어씌우지 않는다.
    "const APP_VERSION =",
  ], "client-only preferences");
  assert.ok(
    !tokens.includes("localStorage?.setItem(MOYEO_THEME_STORAGE_KEY"),
    "tokens.jsx must not persist the resolved system theme (that bug locked the app out of OS changes)",
  );
  assertIncludes(tokens, ["window.applyMoyeoTheme(window.getInitialMoyeoThemeMode())"], "theme applied before first paint");
  assertIncludes(extra, [
    "MoyeoRecentSearches",
    "data-testid=\"search-input\"",
    "data-testid=\"search-submit\"",
    "data-testid=\"search-clear\"",
    "data-testid=\"search-recent-clear\"",
    // 검색어를 확정하면 12-1 검색 결과 화면으로 간다 (ATTACH-COMPOSER-CANON §3)
    "window.MoyeoApi?.selectSearchKeyword?.(text)",
    "nav.go('search-results')",
  ], "12 search hands the keyword to 12-1");
  // 목데이터는 남아 있으면 안 된다 — 검색 결과·최근 검색어 모두 실제 근거만 쓴다.
  assertExcludes(extra, [
    "SEARCH_CAPTURE_RECENT",
    "SEARCH_POPULAR",
    "MOYEO_EXPLORE_ROOMS",
    "ExploreRoomCard",
  ], "12 search has no mock fallback");
  assert.ok(!extra.includes("<div style={{ fontSize: 14, color: T.text900 }}>경주 단풍</div>"), "12 search must not keep the static search field");
  // 인기 검색어 — 서버 집계 API 가 생겨 되살린 섹션 (BE 회신 반영 정본 §2-1).
  // 검색 횟수(`searchCount`)는 **감췄다** — QA 검색이 만든 숫자(「주왕산 326」)가 그대로
  // 보여 실제 인기와 무관해 보였다(사용자 결정). 등락은 서버가 열어줬다(2026-09-09):
  // `rankTrend`(UP·DOWN·SAME·NEW) · `rankChange`(변동 폭, 신규는 null), 기준은 **전일 순위**.
  assertIncludes(extra, [
    "window.MoyeoApi.popularKeywords(10)",
    "popular.length > 0 &&",
    "search-popular",
    "{row.rank}",
    "{row.keyword}",
  ], "12 인기 검색어는 서버가 준 rank·keyword 를 그린다");
  // 등락은 **서버 필드에서만** 나와야 한다. 화살표 글자가 있는 것으로는 부족하다 —
  // 예전에는 이 자리를 클라가 지어낸 `up: true` 목데이터가 채웠다(R1 위반).
  assertIncludes(extra, [
    "row.rankTrend",
    "row.rankChange",
    "case 'UP':",
    "case 'DOWN':",
    "case 'SAME':",
    "case 'NEW':",
    // 낡은 응답(등락 없음)에서는 아무것도 그리지 않는다
    "default: return null;",
    "popularRankTrend(row)",
    "전일 대비",
  ], "12 인기 검색어의 등락은 서버 rankTrend·rankChange 에서만 나온다");
  // 0건이면 빈 상태 문구가 아니라 섹션이 사라진다. 그리는 블록만 떼어 본다.
  const popularStart = extra.indexOf('data-testid="search-popular"');
  const popularBlock = extra.slice(popularStart, extra.indexOf("</React.Fragment>", popularStart));
  assert.ok(popularBlock.length > 200, "인기 검색어 블록을 찾지 못했다");
  assertExcludes(popularBlock, ["인기 검색어가 없어요", "up: true", "up: false"], "12 인기 검색어에 지어낸 순위 변동·빈 상태 문구가 없다");
  // ── 07 취향 · 28 취향 편집 (SIGNUP-GATE-CANON R4·R5) ──
  // 06-1 은 **가입 전에도** 후보 API 를 부른다 — profile/options 는 토큰 없이 200 이다(2026-08-30 확인).
  // 고른 id 는 그대로 가입 요청까지 들고 간다.
  assertIncludes(extra, [
    "window.MoyeoApi.profileOptions()",
    "window.__moyeoSignupTaste = { travelStyleIds: [...styleIds], interestedRegionIds: [...regionIds] }",
    "travelStyleIds: taste.travelStyleIds",
    "interestedRegionIds: taste.interestedRegionIds",
    "불러오는 중이에요…",
    "불러오지 못했어요.",
  ], "07 취향은 서버 후보를 받아 서버 id 를 가입 요청까지 나른다");
  // 서버 목록과 어긋난 옛 후보(앱이 지어낸 8종·8곳)도, 서버 시드를 옮겨 적은 거울 표도 없다.
  assertExcludes(extra, [
    "TASTE_STYLES",
    "TASTE_REGIONS",
    "SIGNUP_TRAVEL_STYLES",
    "SIGNUP_INTERESTED_REGIONS",
  ], "07 취향에 지어낸 후보도 하드코딩 거울 표도 없다");
  // 28 은 로그인 뒤라 서버 후보만 쓴다 — 못 받으면 빈 상태로 끝낸다(§2 정본 문구).
  assertIncludes(extra2, [
    "window.MoyeoApi.profileOptions()",
    "불러오는 중이에요…",
    "불러오지 못했어요.",
  ], "28 취향 편집은 서버 후보만 쓴다");
  assertExcludes(extra2, [
    "const STYLES = [",
    "const REGIONS = [",
    "React.useState(['자연', '사진'])",
  ], "28 취향 편집에 목 후보·목 선택이 없다");
  assertIncludes(refined, ["function ExploreServerRoomCard"], "explore uses the server card only");
  assertExcludes(refined, ["MOYEO_EXPLORE_ROOMS", "function ExploreRoomCard"], "10 explore has no mock room list");
  assertIncludes(extra2, [
    "testId=\"settings-theme\"",
    "testId=\"settings-version\"",
    "testId=\"settings-contact\"",
    "testId=\"settings-rate\"",
    "testId=\"settings-oss-licenses\"",
    // 문의 문구는 "고객센터로 이어져요" 에서 바뀌었다 — 고객센터가 없는 개념이라
    // GitHub 이슈·이메일 두 갈래로 갈랐다(screens-extra2 infoDialogs.contact).
    // 이 단언이 옛 문구에 남아 있어 화면 쪽 결정과 어긋나 있었다.
    "버그 제보나 기능 제안은 GitHub 이슈로, 그 밖의 문의는 이메일로 보내주세요.",
    "스토어 평가로 이동하기 전, 모여트립 사용 경험을 한 번 더 확인해요.",
    "window.cycleMoyeoThemeMode",
  ], "29 settings client-only rows");
  assert.ok(!extra2.includes('<Row label="버전" value="1.0.4 (최신)"/>'), "version row must read the real build version outside capture mode");
  // 29 정보 섹션 순서: 앱 평가하기 → 오픈소스 라이선스 → 로그아웃 (changeLog17 §2)
  assert.ok(
    extra2.indexOf('label="앱 평가하기"') < extra2.indexOf('label="오픈소스 라이선스"')
      && extra2.indexOf('label="오픈소스 라이선스"') < extra2.indexOf('label="로그아웃"'),
    "오픈소스 라이선스 row must sit between 앱 평가하기 and 로그아웃",
  );
  assertIncludes(additions5, [
    "function ScreenOssLicenses",
    "function ScreenOssLicenseDetail",
    "모여트립은 아래 오픈소스 소프트웨어의 도움을 받아 만들었어요.",
    "사용 중인 오픈소스",
    "오픈소스 라이선스가 아닌 자체 배포 SDK는 해당 사업자의 약관을 따라요.",
    "원문 확인 · ",
    "window.MoyeoOssLicenses",
  ], "29-4 · 29-4a screens");
  assertIncludes(ossLicenses, ["카카오 지도 SDK 이용약관", "Apache License", "moyeo.selectedOssLicense"], "embedded OSS data");
  assertIncludes(prototype, [
    "'oss-licenses': window.ScreenOssLicenses",
    "'oss-license-detail': window.ScreenOssLicenseDetail",
  ], "changeLog17 routes");
  assertIncludes(mobileApp, ["'oss-licenses': 'oss-licenses'", "'oss-license-detail': 'oss-license-detail'"], "changeLog17 route aliases");

  // ── 17-4a · 17-4b 인원수별 멘트 변형 ──
  // 라우트는 prototype(화면 표) 과 mobile-app(?screen= 별칭) 두 곳에 다 있어야 한다.
  // 한 곳만 있으면 캔버스에는 보이는데 캡처·PDF 에서 조용히 빠진다.
  assertIncludes(additions2, ["function ScreenCreatePeople({ initialMax = 5 })"], "17-4a·b 초기 최대 인원 prop");
  assertIncludes(prototype, [
    "'create-people-small': () => React.createElement(window.ScreenCreatePeople, { initialMax: 4 })",
    "'create-people-large': () => React.createElement(window.ScreenCreatePeople, { initialMax: 10 })",
  ], "17-4a·17-4b routes");
  assertIncludes(mobileApp, [
    "'create-people-small': 'create-people-small'",
    "'create-people-large': 'create-people-large'",
  ], "17-4a·17-4b route aliases");

  // ── 목데이터 → 실데이터: 20-2 첨부 · 투표 · 방별 알림 · 집합 정보 · 동행자 · 승인/거절 ──
  assertIncludes(refined, [
    "chat-card-poll-",
    "chat-card-location-",
    "chat-card-tourism-",
    "chat-card-settlement-",
    "poll-option-",
    "MoyeoApi.cancelPollVote(roomId, message.messageId)",
    "MoyeoApi.votePollOption(roomId, message.messageId, option.optionId)",
    "MoyeoApi.pollPercent(poll, option)",
  ], "20 채팅방 특수 메시지 카드·투표 참여");
  // ── 21 특수 메시지 6종은 20 과 **같은 카드 컴포넌트**로 그린다 ──
  // 예전 21 은 `대응 API 가 없다` 는 틀린 주석과 함께 하드코딩된 빈 화면이었다.
  // 6종 전부 API 가 있다 — 다시 비워 두거나 예시 카드를 지어내면 안 된다.
  assertIncludes(refined, [
    "function SpecialMessageCard({ message, voting = false, onVote = null })",
    "function SystemMessageNote({ message, style })",
    "function isSpecialMessageCard(message)",
    "  SpecialMessageCard,",
    "  SystemMessageNote,",
  ], "20 · 21 공용 특수 메시지 카드");
  assertIncludes(extra, [
    "const SPECIAL_MESSAGE_KINDS = [",
    "{ type: 'TOURISM_CONTENT', label: '장소' }",
    "{ type: 'LOCATION', label: '지도 · 만남' }",
    "{ type: 'POLL', label: '투표' }",
    "{ type: 'SETTLEMENT_MEMO', label: '정산 메모' }",
    "{ type: 'IMAGE', label: '사진' }",
    "{ type: 'SYSTEM', label: '시스템' }",
    "MoyeoApi.roomMessages(roomId, { limit: 50 })",
    "<SpecialMessageCard",
    "<SystemMessageNote",
    "data-testid={`msgs-sample-${kind.type}`}",
  ], "21 특수 메시지 6종은 실제 서버 메시지로 그린다");
  assert.ok(
    !extra.includes("20-2 특수 메시지 6종은 대응 API 가 없다"),
    "21 특수 메시지에 `대응 API 가 없다` 는 틀린 주석이 되돌아오면 안 된다",
  );
  // 캡처 스크롤 대상은 **실제 스크롤 컨테이너**여야 한다. 카카오 지도 내부 div 를 고르면
  // 2페이지째가 1페이지와 똑같이 찍혀 아래 카드가 조용히 빠진다.
  assertIncludes(mobileApp, [
    "['auto', 'scroll'].includes(window.getComputedStyle(el).overflowY)",
    "!el.closest('[data-moyeo-map]')",
  ], "캡처 스크롤 대상 선택");
  // 사진·장소·지도 전송은 20-2a~20-2c 작성 화면으로 옮겼다 (미리보기 없이 바로 나가면 정본 R2 위반).
  assertIncludes(additions2, [
    "MoyeoApi.roomNotificationSetting(roomId)",
    "MoyeoApi.updateRoomNotificationSetting(roomId, next)",
    "chat-menu-room-alarm",
    "MoyeoApi.roomCompanions(roomId)",
    "MoyeoApi.kickRoomMember(roomId, member.userId, reason)",
    "MoyeoApi.reviewCompanion(roomId, item.userId",
    "companion-review-",
  ], "20-2 첨부 전송 · 20-1 방별 알림 · 27-1 동행자");
  // 20-2 첨부 메뉴의 타일 6개는 전부 자기 작성 화면으로 간다 (ATTACH-COMPOSER-CANON §0).
  // 예전에는 여섯 개가 전부 21(특수 메시지 견본)로 갔고, 투표·정산은 입력 자리 자체가 없었다.
  assertIncludes(additions2, [
    "route: 'attach-photo'",
    "route: 'attach-place'",
    "route: 'attach-map'",
    "route: 'attach-poll'",
    "route: 'attach-settlement'",
    "route: 'attach-notice'",
    "onClick={() => nav.go(it.route)}",
  ], "20-2 첨부 타일 6개는 각자의 작성 화면으로 간다");
  assert.ok(
    !additions2.includes("nav.go('msgs')"),
    "첨부 타일이 21 특수 메시지 견본으로 되돌아가면 안 된다 (ATTACH-COMPOSER-CANON §0)",
  );
  // 작성 화면 6종 — 전송은 전부 서버 엔드포인트로 간다 (목 전송 없음).
  assertIncludes(attach, [
    "function ScreenAttachPhoto",
    "function ScreenAttachPlace",
    "function ScreenAttachMap",
    "function ScreenAttachPoll",
    "function ScreenAttachSettlement",
    "function ScreenAttachNotice",
    "function ScreenSearchResults",
    "MoyeoApi.shareRoomImage(roomId, file, caption)",
    "MoyeoApi.shareRoomTourismContent(roomId, picked.contentId)",
    "MoyeoApi.shareRoomLocation(roomId)",
    "MoyeoApi.createRoomPoll(roomId, { question: question.trim(), options: filled, anonymous })",
    "MoyeoApi.shareRoomSettlementMemo(roomId,",
    "MoyeoApi.createRoomNotice(roomId, content, pinned)",
    // 20-2b 는 30개를 받는다 — 앱 둘과 같은 크기다. 예전에는 20개였고, 검색어가 비면
    // 아예 부르지 않아 웹만 빈 화면으로 찍혔다 (사용자 지적 2026-09-09).
    "MoyeoTourism.list({ keyword, size: 30 })",
    "MoyeoApi.searchCourses(keyword)",
  ], "20-2a~20-2f · 12-1 은 서버 엔드포인트만 쓴다");
  // R4 정산은 송금이 아니다 · R5 투표는 2~5개 · 익명 기본
  assertIncludes(attach, [
    "모여트립은 송금을 하지 않아요. 실제 정산은 각자 하셔야 해요.",
    "Math.ceil(amount / count / 10) * 10",
    "ATTACH_POLL_MIN_OPTIONS = 2",
    "ATTACH_POLL_MAX_OPTIONS = 5",
    "React.useState(true)",
  ], "정산·투표 규칙 (ATTACH-COMPOSER-CANON R4·R5)");
  // §2 공지는 제목이 없다 — 작성 화면에도, 이력 카드에도 제목 자리를 두지 않는다.
  assert.ok(
    !attach.includes("공지 제목") && !attach.includes("notice-title"),
    "20-2f 공지 작성에는 제목 입력 칸이 없다 (ATTACH-COMPOSER-CANON §2)",
  );
  assert.ok(
    !additions.includes("{serverCourse?.title || serverRoom?.title || '공지'}"),
    "20-3 공지 이력에 코스·방 제목을 카드 제목 자리로 쓰면 모든 공지 제목이 같아진다 (§2)",
  );
  // R5-1 상단 고정은 최대 1개. "최대 3" 표기가 되돌아오면 안 된다.
  assertIncludes(attach, [
    "채팅방 맨 위에 계속 보여요.",
    "지금 고정된 공지가 있어요. 이걸 고정하면 그 공지는 풀려요.",
    "MoyeoApi.updateRoomNotice(roomId, notice.noticeId, { pinned: false })",
  ], "20-2f 고정은 최대 1개 (ATTACH-COMPOSER-CANON R5-1)");
  // 머리글에 `고정 2 / 최대 1` 처럼 모순된 숫자를 쓰지 않는다 (2026-08-31 사용자 지적).
  // 서버에 고정이 여러 건 남아 있어도 화면에서는 가장 최근 1건만 고정으로 보여준다.
  assertIncludes(additions, [
    "고정 {serverPinned.length}</div>",
    "상단 고정은 하나만 둘 수 있어요",
    "가장 최근 하나만 고정으로 보여줘요",
    "const serverPinned = pinnedSorted.slice(0, 1);",
  ], "20-3 머리글·안내는 고정 1개 기준");
  assertExcludes(additions, ["고정 {serverPinned.length} / 최대 1"], "20-3 머리글에 `/ 최대 1` 같은 모순 표기를 남기지 않는다");
  assertExcludes(additions, ["최대 3", "고정은 최대 3개까지예요"], "고정 최대 3 표기가 되돌아오면 안 된다");
  // R6~R9 검색 결과는 코스이고, 평가가 없으면 별점을 지어내지 않는다.
  assertIncludes(attach, [
    "course.averageRating == null",
    "평가 없음",
    "검색 결과가 없어요",
  ], "12-1 검색 결과 (ATTACH-COMPOSER-CANON R6~R9)");
  // §4 14 코스 상세 · 모집 중인 모임 보기 — 코스로 열린 모집을 실제로 부른다.
  assertIncludes(refined, [
    "MoyeoApi.courseChatRooms(course.courseId)",
    "course-rooms-open",
    "course-rooms-sheet",
    "지금 모집 중인 모임이 없어요.",
  ], "14 모집 중인 모임 보기 (ATTACH-COMPOSER-CANON §4)");
  assertIncludes(api, [
    "/api/v1/travel-courses/search",
    "/api/v1/travel-courses/${courseId}/chat-rooms",
  ], "12-1 · 14 근거 API");
  // 13-1 내보내기 안내 — 알림을 거치지 않고 들어와도 내 강퇴 이력으로 채운다.
  assertIncludes(extra, [
    "window.MoyeoApi.myKickHistories()",
    "removal-reason-state",
  ], "13-1 은 my-kick-histories 로도 채워진다");
  assertIncludes(additions, [
    "MoyeoApi.meetingEditRoomId()",
    "MoyeoApi.updateMeetingInfo(editRoomId, window.MoyeoApi.buildMeetingInfoRequest(editRoom",
    "meeting-info-edit",
    "MoyeoApi.selectMeetingEditRoom(roomId)",
  ], "17-3 집합 정보 수정(호스트)");
  assertIncludes(extra, [
    "MoyeoApi.roomApplications(roomId)",
    "MoyeoApi.approveApplication(roomId, applicationId)",
    "MoyeoApi.rejectApplication(roomId, applicationId)",
    "host-application-",
    "MoyeoApi.leaveRoom(roomId)",
  ], "18 승인·거절 · 20-1 나가기");

  // ── ATTACH-COMPOSER-CANON §6 신설 화면 11종 + 기존 화면에 더한 것 ──
  assertIncludes(api, [
    "/api/v1/chat-rooms/my/favorites",                          // 26-1 찜한 모집
    "/api/v1/travel-courses/me/favorites",                      // 26 찜한 코스
    "/api/v1/travel-courses/chat-rooms/${roomId}/rating",       // 27-4 코스 평가
    "deleteRoomNotice",                                         // 20-3a 공지 삭제 (전용 엔드포인트)
  ], "§6 신설 화면의 근거 API");
  // 12-2 태그로 모임 찾기는 **없는 기능**이다 (2026-08-31 사용자 확인) — 화면·라우트·호출부 전부 없다.
  // API 두 개가 있는 것만 보고 만들어낸 화면이었고, 서버가 그 API 를 지운 이유가 기능이 없기 때문이었다.
  assertExcludes(gaps, [
    "ScreenTagSearch",
    "roomsByCourseTagName",
    "태그로 찾기",
  ], "12-2 태그로 찾기 화면은 없다");
  assertExcludes(extra, [
    "search-tag-entry",
    "태그로 모임 찾기",
  ], "12 검색에 태그로 모임 찾기 진입 행은 없다");
  assertExcludes(refined, [
    "selectCourseTag",
    "nav.go('tag-search')",
  ], "14 코스 상세의 태그 칩은 표시 전용이다");
  assertExcludes(api, [
    "/api/v1/chat-rooms/search/course-tags/",
    "roomsByCourseTagName",
  ], "삭제된 course-tags 호출부는 없다");
  // 태그 **표시**용 GET /travel-courses/tags 는 남는다 (09 홈 필터 칩 · 10 탐색).
  assertIncludes(api, ["/api/v1/travel-courses/tags"], "코스 태그 목록은 표시용으로 남는다");
  // 40040 INVALID_MAP_SEARCH_AREA — radiusKm 상한 200km (BE 회신 §3-3). 웹은 120 고정이라
  // 지금은 안 걸리지만 처리 경로는 있어야 한다. 문구는 서버 errorMessage 를 그대로 쓴다.
  assertIncludes(api, ["isInvalidMapAreaError", "'40040'"], "40040 은 전용 분기로 판별한다");
  assertIncludes(refined, [
    "window.MoyeoApi.isInvalidMapAreaError(error)",
    "setAreaError(error.message)",
    "explore-map-area-error",
  ], "10-1 지도는 40040 을 오류 문구로 그린다");
  // 27-1 매너 점수 — 별점 입력이 생기기 전에는 mannerScore 를 만드는 사람이 아무도 없었다 (§6-2).
  assertIncludes(additions2, [
    "GapStarRating",
    "companion-manner-",
    "mannerScore: scores[item.userId]",
    "매너 점수는 <b>다음 모임의 호스트</b>가 보고",
    "trip-message-course-rating",
  ], "27-1 매너 점수 별점 + 27-4 진입점");
  // 안 매긴 매너 점수를 앱이 지어내면 안 된다 — 점수를 매긴 동행자만 보낸다.
  assertIncludes(additions2, ["if (score < 1) return false;"], "매기지 않은 매너 점수는 보내지 않는다");
  assertExcludes(additions2, ["MANNER_SCORE_DEFAULT"], "매너 점수 기본값을 두지 않는다");
  // 27-1 · 27-4 가 고르는 방은 **다녀온 여행**이어야 한다.
  // `ended` 만 보면 불발(CANCELLED) 방이 걸려 companions 가 409 를 주고 화면이 빈다.
  assertIncludes(api, [
    "return Boolean(room?.ended) && room?.status === 'CONFIRMED';",
    "completedTripRoomId",
  ], "다녀온 여행 판정은 ended && CONFIRMED");
  assertIncludes(additions2, ["MoyeoApi.completedTripRoomId()"], "27-1 은 다녀온 여행만 연다");
  assertIncludes(gaps, ["MoyeoApi.completedTripRoomId()"], "27-4 는 다녀온 여행만 연다");
  // 27-3 코스 공개 — `공개할게요` 가 화면만 넘기고 서버를 안 불렀다 (iOS 도 같은 결함이었다).
  assertIncludes(api, ["/api/v1/travel-courses/${courseId}/publication"], "27-3 코스 공개 API");
  assertIncludes(additions2, [
    "MoyeoApi.publishCourse(course.courseId",
    "course-publish-title",
    "course-publish-description",
    "course-publish-confirm",
  ], "27-3 은 실제로 코스를 공개한다");
  // DELETE /users/me/friends/{...} 의 경로 변수는 friendshipId 가 아니라 상대 userId 다.
  assertIncludes(api, ["removeFriend: (friendUserId)"], "친구 끊기 경로 변수는 상대 userId");
  // 되돌릴 수 없는 동작은 반드시 확인 단계를 거친다 (신청 취소 · 차단 해제 · 친구 끊기 · 공지 삭제).
  assertIncludes(extra, ["askCancelApplication", "nav.go('apply-cancel')"], "19-2 참가 신청 취소 확인");
  assertIncludes(additions2, ["askUnblock", "nav.go('unblock-confirm')"], "29-1a 차단 해제 확인");
  assertIncludes(additions2, ["openFriendManage", "nav.go('friend-manage')"], "27-2a 친구 정리");
  assertIncludes(gaps, ["notice-delete-confirm", "MoyeoApi.deleteRoomNotice"], "20-3a 공지 삭제 확인");
  assertExcludes(extra, ["cancelServerApplication"], "19-1 은 확인 없이 바로 취소하지 않는다");
  // 18-4 확정/불발 — 최소 인원은 서버 값(minimumParticipants)으로만 잠근다 (숫자를 지어내지 않는다).
  assertIncludes(gaps, [
    "room.minimumParticipants",
    "MoyeoApi.changeRoomStatus(roomId, next)",
    "trip-status-confirm",
  ], "18-4 여행 확정 / 불발");
  assertIncludes(extra, ["host-trip-status", "host-meeting-edit"], "18 모집 관리에서 18-4 · 18-5 로 간다");
  // 20-1c — "이 모임만" 이라고 써놓고 전역 방해금지(29-2)로 보내면 안 된다.
  assertIncludes(additions2, ["label=\"알림 설정\" sub=\"이 모임의 알림만 끄기\" onClick={() => nav.go('room-notif')}"], "20-1c 이 모임 알림");
  // 31-1 — 화면을 새로 만들지 않고 role 로 가른다.
  assertIncludes(extra, [
    "이 모임에서<br/>나갈까요?",
    "confirm: '나가기'",
    "confirm: '모임 종료'",
    "ScreenLeaveMember",
  ], "31-1 참가자 나가기 (역할별 문구)");
  // 08-A 의 '비밀번호를 잊으셨나요?' 는 08-H 로 간다 (같은 화면에서 조용히 메일만 보내지 않는다).
  assertIncludes(extra, ["nav.go('password-reset')"], "08-H 비밀번호 재설정 진입");
  // 코스 썸네일은 상대 경로다 — moyeo-api 한 곳에서만 CDN 절대 URL 로 바꾼다 (§2-9).
  assertIncludes(api, ["moyeo-trip-cdn.jayden-bin.cc", "MEDIA_KEY_PATTERN", "normalizeMedia"], "코스 썸네일 CDN 정규화");
  assertExcludes(refined, ["moyeo-trip-cdn"], "CDN 접두사를 화면마다 흩지 않는다");
  assertExcludes(gaps, ["moyeo-trip-cdn"], "CDN 접두사를 화면마다 흩지 않는다");

  // ── §4-1 섹션 누락: API 가 있는데 웹만 안 그리던 섹션들 ──
  // 14 코스 상세 · 여행자 코스(작성자) — GET travel-courses/{id} 의 creatorNickname 계열을 쓴다.
  assertIncludes(refined, [
    "course.creatorNickname",
    "course.creatorTravelStartDate",
    "course.chatRoomCount",
    "님이 다녀온 코스",
    "여행 후 공개",
    "이 코스로 떠난 모임 ",
    "course-publisher",
  ], "14 코스 상세 · 여행자 코스 카드 (안드로이드 CoursePublisherRow 와 같은 줄)");
  // 14 작성자 프로필 이미지 (2026-09-02 서버 추가) — 이미지가 있으면 반드시 이미지다.
  // 닉네임에서 뽑은 동물 아바타로 떨어지는 것은 creatorProfileImageUrl 이 null 일 때뿐이다.
  assertIncludes(refined, [
    "<ProfileAvatar src={course.creatorProfileImageUrl} nickname={publisherNickname} size={30}/>",
  ], "14 코스 상세 작성자 아바타는 creatorProfileImageUrl 을 그린다");
  assert.ok(
    !/<ProfileAvatar nickname=\{publisherNickname\}/.test(refined),
    "14 작성자 아바타가 이미지 없이 닉네임만 쓰던 코드로 되돌아가면 안 된다 (고양이 이모지 재발)",
  );
  // 이미지 로딩은 다른 화면과 같은 CachedImage 를 쓴다 — 아바타는 실패했을 때만 나오는 fallback 이다.
  assertIncludes(refined, ["<CachedImage src={src} alt=\"\" fallback={nicknameAvatar}"], "ProfileAvatar 는 CachedImage 로 그린다");
  // creatorProfileImageUrl 도 이미지 필드 정규화 한 곳을 지난다 (§2-9).
  assertIncludes(api, ["creatorProfileImageUrl"], "이미지 필드 정규화 목록에 creatorProfileImageUrl 이 있다");

  // ── 23 · 23-1 피드 댓글 · 커서 페이지네이션 (2026-09-02 서버 변경) ──
  // 응답이 배열에서 `{comments, nextId}` 로 바뀌었다 — 배열로 다루면 댓글이 0건으로 보인다.
  assertIncludes(api, [
    "feedComments: (feedId, { beforeCommentId, limit } = {}) => request(`/api/v1/feeds/${feedId}/comments${query({ beforeCommentId, limit })}`)",
  ], "댓글 조회는 feeds 와 같은 방식으로 커서를 넘긴다");
  assert.ok(
    !/feedComments\(feedId\)\s*\n?\s*\.then\(\(result\) => \{ if \(Array\.isArray\(result\)\)/.test(additions3),
    "댓글 응답을 배열로 다루던 코드가 되돌아오면 안 된다 (댓글이 0건으로 보인다)",
  );
  // 23 은 댓글 3건만 보여주고 나머지는 23-1 로 넘긴다 (PDF-REVIEW-2026-08-31 §F1·F3).
  assertIncludes(refined, [
    "const FEED_DETAIL_COMMENT_PREVIEW = 3;",
    "window.MoyeoApi.feedComments(feedId, { limit: FEED_DETAIL_COMMENT_PREVIEW })",
    "feed-detail-comment-preview",
    "댓글 {feed.commentCount}개 모두 보기 →",
    "feed-comments-open",
  ], "23 피드 상세 · 댓글 일부(3건) + `댓글 N개 모두 보기 →`");
  // 23-1 은 무한 스크롤로 다음 묶음을 받는다 — 한 번에 전부 받지 않는다.
  assertIncludes(additions3, [
    "window.MoyeoApi.feedComments(feedId, { beforeCommentId: nextId, limit: FEED_COMMENTS_PAGE_SIZE })",
    "setNextId(result.nextId ?? null)",
    "list.scrollTop + list.clientHeight >= list.scrollHeight - 120",
    "feed-comments-scroll",
  ], "23-1 댓글 전체 보기 · 커서 무한 스크롤");
  // 두 화면이 같은 댓글 한 줄을 쓴다 — 각자 그리면 아바타·시각 표기가 갈린다.
  assertIncludes(additions3, ["function FeedCommentRow("], "23 과 23-1 이 같은 댓글 행 컴포넌트를 쓴다");
  // 29-3 계정 탈퇴 · 참여 중인 여행 경고 — GET chat-rooms/my 가 근거다.
  assertIncludes(additions3, [
    "window.useTabData('my.rooms', () => window.MoyeoApi.myRooms()",
    "참여 중인 여행이 ",
    "탈퇴하면 동행자들에게 갑자기 빈자리가 생겨요. 나가기 처리를 먼저 해주세요.",
    "account-delete-joined-trips",
  ], "29-3 계정 탈퇴 · 참여 중인 여행 경고");
  assert.ok(
    !additions3.includes("참여 중인 모임 경고는 조회 API 가 없어 두지 않는다"),
    "조회 API 는 있다 — 섹션을 지운 근거 주석이 되돌아오면 안 된다",
  );
  // 27-1 여행 마무리 · 동행자가 없거나 못 받았을 때도 자리를 남긴다.
  assertIncludes(additions2, [
    "trip-message-companions-state",
    "아직 함께 여행한 친구가 없어요.",
  ], "27-1 동행자 목록 빈 상태 (안드로이드 trip-message-empty 와 같은 문구)");
  // 31 나가기 안내 문구는 세 플랫폼이 글자 그대로 같다.
  assert.ok(
    extra.includes("채팅방은 14일 동안 읽기 전용으로 유지된 후 사라져요.") && !extra.includes("read-only로 유지된"),
    "31 나가기 안내는 안드로이드·iOS 와 같은 '읽기 전용' 표기를 쓴다",
  );

  for (const route of routes) {
    assert.ok(mobileApp.includes(route), `mobile-app route map should include ${route}`);
  }
  assertIncludes(mobileApp, [
    "profileImage: 'prof-2'",
    "'profile-image': 'prof-2'",
    "'prof-2': 'prof-2'",
    "profileBasic: 'prof-3'",
    "'profile-basic': 'prof-3'",
    "'prof-3': 'prof-3'",
    "profileTaste: 'prof-4'",
    "'profile-taste': 'prof-4'",
    "'prof-4': 'prof-4'",
    "profileTasteEdit: 'profile-taste-edit'",
    "'profile-taste-edit': 'profile-taste-edit'",
    "leave: 'leave-alert'",
  ], "direct route aliases");
  assertIncludes(additions2, ["nav.go('leave-alert')"], "leave alert entry point");
  assert.ok(!additions2.includes("nav.go('leave')"), "leave action must not target a missing route");
  assertIncludes(mobileApp, [
    "getForcedTheme",
    "window.applyMoyeoTheme?.(forcedTheme)",
    "window.watchMoyeoThemeMode?.()",
    "getInitialScroll",
    "scrollLargestScrollable",
    "mw-letterbox",
    "mw-device-shell",
    "display: none",
    "window.PrototypePhone",
    "mw-offline-banner",
    "data-network-action",
    "border-radius: 0",
    ".mw-stage-crop .moyeo-web-phone",
  ], "mobile-app.jsx");

  assertIncludes(mobileApp, [
    "height: 100dvh",
    "const nextScale = box.width / 393",
    "setLogicalHeight(box.height / nextScale)",
    "width: min(100vw, calc(100dvh * 393 / 852))",
  ], "letterbox sizing");
  assert.ok(!mobileApp.includes("mw-theme-button"), "production web should not render the visual QA theme button");
  assertIncludes(observability, [
    "@sentry/browser@10.69.0",
    "if (!dsn) return",
    "sendDefaultPii: false",
    "tracesSampleRate",
  ], "Sentry safe scaffold");
  assert.ok(!standaloneWorkflow.includes("SENTRY_AUTH_TOKEN"), "static web deploy must not expose a Sentry auth token");
  assert.ok(!observability.includes("beforeSend(event)"), "Sentry must not add payload mutation that could re-enable PII");

  assertIncludes(refined, [
    "assets/splash-generated.webp",
    "assets/splash-generated-night.webp",
    "weather-sunny-cheomseongdae",
    "weather-heavy-rain-woljeonggyo",
    "data-weather-hero-image=\"active\"",
  ], "refined screens");
  assertIncludes(refined, [
    "moyeo-web-phone",
    "padding: '10px 8px 30px'",
    "height: 96",
  ], "web phone frame spacing");
  assertIncludes(shared, [
    "transition: 'tab'",
    "replace: true",
    "height: 96",
  ], "shared bottom navigation");
  assertIncludes(await read("src/tokens.jsx"), [
    "window.lucide?.icons",
    "ChartNoAxesColumnIncreasing",
    "TriangleAlert",
  ], "Lucide icon adapter");
  assertIncludes(prototype, [
    "transition === 'tab'",
    "mt-tab-switch",
  ], "tab transition animation");
  assertIncludes(onboarding, [
    "auth-progress-header",
    "auth-progress-step",
    "label=\"온보딩\"",
    "current={page + 1}",
    "current={5}",
    "current={8}",
    "/api/v1/auth/nickname-candidates",
    "nickname-refresh",
    "nickname-next",
    "다른 이름 추천받기",
    "setSelectedNickname('')",
    "animal: candidate?.animal",
    "color: candidate?.color",
    "ANIMAL_EMOJIS",
    "NICKNAME_COLORS",
    "{animalEmoji}",
    "{color.label}",
    "description: candidate?.description || DEFAULT_NICKNAME_DESCRIPTION",
    "{candidate.description}",
    "후보를 하나씩 추가해요",
    "이전에 만든 후보는 사라지지 않아요",
    "새 후보 만들기",
    "profile-image-generating",
    "닉네임에서 여행 친구의 분위기를 찾고 있어요",
    "다른 화면으로 이동해도 완성된 후보는 서버에 보관돼요",
  ], "nickname candidate refresh flow");
  assertIncludes(refined, [
    "title=\"마이\"",
    "name=\"settings\"",
    "my-profile-summary",
    "my-hub-menu",
    "친구 도감",
    "고객센터",
  ], "my page parity");
  assertIncludes(extra2, [
    "gridTemplateColumns: '34px 1fr 34px'",
    "textAlign: 'center'",
  ], "settings header parity");
  assert.ok(!refined.includes("9:41"), "refined phone frame should not render a fake status bar time");
  assert.ok(!shared.includes("9:41"), "shared phone frame should not render a fake status bar time");

  assertIncludes(readme, [
    "screen=feed&theme=dark",
    "scroll=bottom",
    "GitHub Pages",
    "GitHub Actions",
  ], "README");

  assertIncludes(standaloneWorkflow, [
    "actions/checkout@v6",
    "actions/setup-node@v6",
    "node-version: 24",
    "actions/configure-pages@v6",
    "actions/upload-pages-artifact@v5",
    "actions/deploy-pages@v5",
    "path: .",
  ], "Standalone Pages workflow");

  for (const asset of requiredAssets) {
    const info = await stat(path.join(root, "assets", asset));
    const minimumBytes = asset.includes("-mark-") ? 512 : 1024;
    assert.ok(info.size > minimumBytes, `${asset} should be a non-empty image asset`);
    if (asset.startsWith("celebration/")) {
      assert.ok(info.size < 150_000, `${asset} should remain web-optimized`);
    }
  }
}

async function pushContractTests() {
  const source = await read("src/push-notifications.js");

  function createPushWindow({ permission = "default", supported = true, secure = true } = {}) {
    const events = [];
    const registrations = [];
    const notifications = [];
    let foregroundHandler = null;
    const Notification = {
      permission,
      async requestPermission() {
        this.permission = "granted";
        return this.permission;
      },
    };
    const registration = {
      async showNotification(title, options) { notifications.push({ title, options }); },
    };
    const navigator = {
      serviceWorker: {
        async register(url, options) {
          registrations.push({ url: String(url), options });
          return registration;
        },
      },
    };
    const messagingInstance = {
      async getToken(options) {
        assert.equal(options.vapidKey, "test-vapid-key");
        assert.equal(options.serviceWorkerRegistration, registration);
        return "web-fcm-token";
      },
      onMessage(handler) { foregroundHandler = handler; },
    };
    const messaging = () => messagingInstance;
    messaging.isSupported = () => supported;
    const window = {
      MOYEO_RUNTIME_CONFIG: {
        firebase: {
          apiKey: "api-key",
          authDomain: "project.firebaseapp.com",
          projectId: "project",
          messagingSenderId: "1234",
          appId: "app-id",
        },
        firebaseVapidKey: "test-vapid-key",
      },
      PushManager: function PushManager() {},
      Notification,
      isSecureContext: secure,
      firebase: {
        apps: [],
        initializeApp(options) { this.apps.push(options); },
        messaging,
      },
      dispatchEvent(event) { events.push(event); },
      addEventListener() {},
    };
    const document = { baseURI: "https://example.test/repository/", visibilityState: "visible" };
    class CustomEvent {
      constructor(type, init = {}) { this.type = type; this.detail = init.detail; }
    }
    vm.runInNewContext(source, {
      window,
      navigator,
      Notification,
      document,
      CustomEvent,
      URL,
      JSON,
      String,
      Boolean,
      Promise,
      Object,
      btoa,
    });
    return { window, events, registrations, notifications, getForegroundHandler: () => foregroundHandler };
  }

  const ready = createPushWindow();
  assert.equal((await ready.window.MoyeoPush.capability()).status, "prompt");
  assert.equal(await ready.window.MoyeoPush.currentToken({ requestPermission: true }), "web-fcm-token");
  assert.equal(ready.registrations.length, 1);
  const workerUrl = new URL(ready.registrations[0].url);
  assert.equal(workerUrl.pathname, "/repository/firebase-messaging-sw.js");
  assert.equal(ready.registrations[0].options.scope, "/repository/");

  let registeredToken = null;
  ready.window.MoyeoPush.setTokenRegistrar(async (token, metadata) => {
    registeredToken = { token, metadata };
  });
  await ready.window.MoyeoPush.syncToken({ reason: "test" });
  assert.equal(registeredToken.token, "web-fcm-token");
  assert.equal(registeredToken.metadata.reason, "test");

  await ready.window.MoyeoPush.initialize();
  await ready.getForegroundHandler()({ data: { title: "새 모집", screen: "meetings" } });
  assert.ok(ready.events.some((event) => event.type === "moyeo:push-message"));
  assert.equal(ready.notifications.length, 0, "visible foreground messages should be handled in-app without duplicate system notifications");

  const denied = createPushWindow({ permission: "denied" });
  assert.equal((await denied.window.MoyeoPush.capability()).status, "denied");
  assert.equal(await denied.window.MoyeoPush.currentToken({ requestPermission: true }), null);

  const unsupported = createPushWindow({ supported: false });
  assert.equal((await unsupported.window.MoyeoPush.capability()).status, "unsupported");
  const insecure = createPushWindow({ secure: false });
  assert.equal((await insecure.window.MoyeoPush.capability()).status, "insecure");
}

async function tourismContractTests() {
  const source = await read("src/tourism-api.js");
  const requests = [];
  const responses = [];
  const window = {
    MOYEO_RUNTIME_CONFIG: { apiBaseUrl: "https://api.example.test" },
    location: { search: "" },
    localStorage: { getItem: () => JSON.stringify({ accessToken: "access-token" }) },
    sessionStorage: { getItem: () => null, setItem() {} },
    AbortController,
    setTimeout,
    clearTimeout,
  };
  const fetchImpl = async (url, options) => {
    requests.push({ url: String(url), options });
    return new Response(JSON.stringify(responses.shift()), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  vm.runInNewContext(source, {
    window,
    fetch: fetchImpl,
    Response,
    URLSearchParams,
    encodeURIComponent,
    Error,
    JSON,
    String,
    Number,
    Boolean,
    Array,
    Object,
  });
  const tourism = window.MoyeoTourism;

  // ── 목록: 실제 응답은 { items, page, size, totalElements, totalPages } ──
  responses.push({
    items: [{
      contentId: 77,
      contentTypeId: 39,
      title: "실제 식당",
      address1: "경상북도 청송군",
      address2: null,
      thumbnail: "https://cdn.example/thumb.webp",
      latitude: 36.4,
      longitude: 129.1,
    }],
    page: 0,
    size: 30,
    totalElements: 21,
    totalPages: 1,
  });
  const list = await tourism.list({ keyword: "  주왕산  ", contentTypeId: 39, size: 30 });
  assert.equal(list.items[0].contentId, "77");
  assert.equal(list.items[0].type, "food");
  assert.equal(list.items[0].thumbnailUrl, "https://cdn.example/thumb.webp");
  assert.equal(list.items[0].address, "경상북도 청송군", "address2 가 null 이면 주소를 이어붙이지 않는다");
  // 건수 표기는 클라가 센 값이 아니라 서버의 totalElements 를 쓴다
  assert.equal(list.totalElements, 21);
  assert.equal(list.items.length, 1);
  // 검색어는 서버로 넘긴다(앞뒤 공백 제거) · contentTypeId 와 함께 보낼 수 있다
  assert.equal(
    requests[0].url,
    "https://api.example.test/api/v1/tourism-contents?keyword=%EC%A3%BC%EC%99%95%EC%82%B0&contentTypeId=39&size=30",
  );
  assert.equal(requests[0].options.headers.Authorization, "Bearer access-token");

  // 검색어가 비면 keyword 파라미터를 아예 보내지 않는다 (= 전체 조회)
  responses.push({ items: [], page: 0, size: 30, totalElements: 3098, totalPages: 104 });
  const all = await tourism.list({ keyword: "   ", size: 30 });
  assert.equal(requests[1].url, "https://api.example.test/api/v1/tourism-contents?size=30");
  assert.equal(all.totalElements, 3098);

  // totalElements 가 없는 응답이면 받은 건수로 대체한다
  responses.push({ items: [{ contentId: 5, title: "무제" }] });
  const noTotal = await tourism.list();
  assert.equal(noTotal.totalElements, 1);
  assert.equal(requests[2].url, "https://api.example.test/api/v1/tourism-contents");

  responses.push({ items: "not-an-array" });
  await assert.rejects(() => tourism.list(), (error) => error.code === "SCHEMA_MISMATCH");

  // ── 상세: zipcode / telephone / homepage / contentImages / menuImages ──
  responses.push({
    contentId: 2832919,
    contentTypeId: 39,
    title: "청하누",
    address1: "경상북도 청송군 주왕산로 440",
    address2: null,
    zipcode: "37437",
    telephone: null,
    telephoneName: null,
    homepage: '<a href="https://www.instagram.com/cheonghanoo__csyy/" target="_blank" title="새창 : 청하누 인스타그램으로 이동">https://www.instagram.com/cheonghanoo__csyy/</a>',
    overview: "청하누는 한우구이 전문점이다.",
    thumbnail: "https://cdn.example/thumb.webp",
    latitude: 36.38,
    longitude: 129.1,
    contentImages: [{ contentId: 2832919, imageName: "외관", originalImageUrl: "https://cdn.example/a.webp", serialNumber: "1", copyrightType: "Type3" }],
    menuImages: [{ contentId: 2832919, imageName: null, originalImageUrl: "https://cdn.example/menu.webp", serialNumber: "2", copyrightType: "Type3" }],
  });
  const detail = await tourism.detail("2832919");
  assert.equal(requests[4].url, "https://api.example.test/api/v1/tourism-contents/2832919");
  assert.equal(detail.type, "food", "contentTypeId 39 는 음식점(메뉴판 탭)");
  assert.equal(detail.postalCode, "37437");
  assert.equal(detail.description, "청하누는 한우구이 전문점이다.");
  // null 필드는 지어내지 않고 빈 값으로 남긴다 — 화면이 그 줄을 숨긴다
  assert.equal(detail.phoneNumber, "");
  assert.equal(detail.phoneName, "");
  // homepage 앵커 태그는 URL 만 뽑는다 (마크업이 화면에 노출되면 안 된다)
  assert.equal(detail.homepage, "https://www.instagram.com/cheonghanoo__csyy/");
  assert.ok(!detail.homepage.includes("<"));
  assert.equal(detail.images[0], "https://cdn.example/a.webp", "contentImages 는 originalImageUrl 을 쓴다");
  assert.equal(detail.menuImages[0], "https://cdn.example/menu.webp");

  // 사진이 하나도 없는 상세도 그대로 빈 배열이다 (자리표시자를 지어내지 않는다)
  responses.push({
    contentId: 2899234, contentTypeId: 39, title: "주왕산청솔식당", address1: "경상북도 청송군 주왕산면 공원길 164",
    address2: null, zipcode: "37437", telephone: null, telephoneName: null, homepage: null,
    overview: "산채 더덕구이 정식", thumbnail: null, latitude: 36.39, longitude: 129.14,
    contentImages: [], menuImages: [],
  });
  const bare = await tourism.detail(2899234);
  assert.deepEqual(plain(bare.images), []);
  assert.deepEqual(plain(bare.menuImages), []);
  assert.equal(bare.homepage, "");
  assert.equal(bare.thumbnailUrl, "");

  await assert.rejects(() => tourism.detail(""), (error) => error.code === "CONTENT_ID_REQUIRED");

  // ── homepage 파싱 단위 케이스 ──
  const homepage = tourism.parseHomepage;
  assert.equal(homepage(null), null);
  assert.equal(homepage(""), null);
  assert.equal(homepage("   "), null);
  assert.equal(homepage("https://cheongsong.go.kr/tour"), "https://cheongsong.go.kr/tour", "태그 없는 URL 은 그대로");
  assert.equal(homepage("www.nadrifood.com"), "www.nadrifood.com");
  // 실제 응답에는 href 뒤 공백이 빠진 것도 있다
  assert.equal(
    homepage('<a href="http://instagram.com/goof.ff_sangju_"target="_blank" title="새창 : 구프커피">http://instagram.com/goof.ff_sangju_</a>'),
    "http://instagram.com/goof.ff_sangju_",
  );
  assert.equal(homepage("<a href='http://죽도시장맛집.한국' target='_blank'>http://죽도시장맛집.한국</a>"), "http://죽도시장맛집.한국");
  assert.equal(
    homepage('<a href="https://www.instagram.com/gyo_dong/?igsh=MXI0eDk1N2lpbmhveA%3D%3D#" target="_blank">https://www.instagram.com/gyo_dong/</a>'),
    "https://www.instagram.com/gyo_dong/?igsh=MXI0eDk1N2lpbmhveA%3D%3D#",
  );
  assert.equal(homepage("<a href=\"https://a.test/?x=1&amp;y=2\">a</a>"), "https://a.test/?x=1&y=2", "HTML 엔티티는 되돌린다");
  // href 가 없으면 표시 텍스트에서 URL 을 찾는다
  assert.equal(homepage("<a>https://only-text.test</a>"), "https://only-text.test");
  // URL 로 볼 수 없으면 null — 화면은 그 줄을 숨긴다 (문구를 지어내지 않는다)
  assert.equal(homepage("<a href=\"mailto:a@b.test\">메일</a>"), null);
  assert.equal(homepage("<a>홈페이지 준비중</a>"), null);
  assert.equal(homepage("전화문의"), null);

  // ── 세션은 auth-api(MoyeoAuth) 가 정본이다 ──
  // 라이브 캡처 세션은 메모리에만 있어 localStorage 에 없다. 예전엔 여기만 읽어서
  // /tourism-contents 가 401 로 떨어졌고 17-1a 목록·17-1b 상세가 통째로 오류로 찍혔다.
  window.MoyeoAuth = { getSession: () => ({ accessToken: "memory-capture-token" }) };
  responses.push({ items: [], page: 0, size: 30, totalElements: 0, totalPages: 0 });
  await tourism.list();
  assert.equal(
    requests[requests.length - 1].options.headers.Authorization,
    "Bearer memory-capture-token",
    "메모리 세션(라이브 캡처)의 토큰도 실어 보낸다",
  );
  // MoyeoAuth 가 토큰을 못 주면 저장소로 떨어진다
  window.MoyeoAuth = { getSession: () => null };
  responses.push({ items: [], page: 0, size: 30, totalElements: 0, totalPages: 0 });
  await tourism.list();
  assert.equal(requests[requests.length - 1].options.headers.Authorization, "Bearer access-token");
  delete window.MoyeoAuth;

  // ── 캡처 라우트를 봐도 표본으로 갈아끼우지 않는다 (되돌아오면 여기서 걸린다) ──
  for (const search of ["?mockAuth=1", "?screen=place-search", "?route=place-detail", "?capture=1", "?uitest=1", ""]) {
    window.location.search = search;
    assert.equal(tourism.usesDeterministicSamples, undefined, `${search} 에서도 표본 분기는 없어야 한다`);
    assert.equal(tourism.samplePlaces, undefined);
    assert.equal(tourism.sampleDetail, undefined);
  }
}

// 2026-08-24 서버 패치로 검색 응답에 붙은 9필드 파싱 + 17 모집 만들기 요청 조립
async function moyeoApiContractTests() {
  const source = await read("src/moyeo-api.js");
  const requests = [];
  const searchRows = [
    {
      roomId: 1,
      title: "안동 역사 여행",
      thumbnail: "https://cdn.example/a.png",
      tripType: "DAY_TRIP",
      startDate: "2026-09-12",
      endDate: null,
      dayTripStartTime: "09:00:00",
      dayTripEndTime: "18:00:00",
      recruitmentDeadlineDate: "2026-09-09",
      recruitmentDDay: 15,
      status: "RECRUITING",
      favorite: true,
      meetingLatitude: 36.576,
      meetingLongitude: 128.97,
      meetingDetails: "안동역 1번 출구 앞",
      meetingDateTime: "2026-09-12T08:30:00",
      participantCount: 4,
      maxParticipants: 5,
      courseTitle: "안동 역사·야경 코스",
      tags: [{ tagId: 1, name: "섬" }],
    },
    {
      // 숙박 방 — 당일 여행 시간이 둘 다 null 이고 집합 안내도 미정(null)이다.
      roomId: 2,
      title: "울릉도 2박 3일",
      tripType: "OVERNIGHT",
      startDate: "2026-10-01",
      endDate: "2026-10-03",
      dayTripStartTime: null,
      dayTripEndTime: null,
      recruitmentDeadlineDate: "2026-09-28",
      recruitmentDDay: 0,
      status: "CONFIRMED",
      favorite: false,
      // 좌표가 한쪽만 왔다 → 마커에서 제외된다.
      meetingLatitude: 37.4844,
      meetingLongitude: null,
      meetingDetails: null,
      meetingDateTime: "2026-10-01T07:00:00",
      participantCount: 3,
      maxParticipants: 5,
      courseTitle: "울릉 해안 코스",
      tags: [],
    },
    {
      // 문서 포맷(HH:mm)도 그대로 받는다.
      roomId: 3,
      title: "문경 새재 단풍",
      tripType: "DAY_TRIP",
      startDate: "2026-11-01",
      dayTripStartTime: "08:30",
      dayTripEndTime: "17:05",
      recruitmentDeadlineDate: "2026-10-29",
      recruitmentDDay: 7,
      status: "RECRUITING",
      favorite: false,
      meetingLatitude: 36.7,
      meetingLongitude: 128.1,
      meetingDetails: "   ",
      meetingDateTime: "2026-11-01T07:40:00",
      participantCount: 2,
      maxParticipants: 5,
      courseTitle: "문경 단풍 코스",
      tags: [],
    },
  ];
  // 완료 여행 동행자 — mannerRating 은 필드만 있고 값이 null 이다(서버 현황). 빈 한줄평은 null 로 접힌다.
  const companionRows = [
    {
      companionRecordId: 44,
      userId: 61,
      nickname: "따스한 사슴 3492",
      profileImageUrl: null,
      mannerRating: null,
      mannerScore: 5,
      oneLineReview: "약속 시간을 잘 지켜요",
      reviewed: true,
    },
    {
      companionRecordId: 45,
      userId: 62,
      nickname: "잔잔한 거북이 9032",
      profileImageUrl: "https://cdn.example/b.png",
      mannerRating: "4.8",
      mannerScore: null,
      oneLineReview: "   ",
      reviewed: false,
    },
  ];
  const window = {
    location: { search: "" },
    localStorage: { getItem: () => JSON.stringify({ accessToken: "access-token" }) },
    sessionStorage: (() => {
      const values = new Map();
      return {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
        removeItem: (key) => values.delete(key),
      };
    })(),
    MoyeoAuth: {
      // TAB-STATE-CANON R6 — 내 신원은 토큰에서 동기로 온다 (멤버 목록 응답이 아니다).
      currentUserId: () => "62",
      request: async (path, options) => {
        requests.push({ path, options });
        if (path.startsWith("/api/v1/chat-rooms/search")) return searchRows;
        if (path === "/api/v1/chat-rooms") return { roomId: 41 };
        if (path === "/api/v1/chat-rooms/21/companions") return companionRows;
        if (path === "/api/v1/notifications/settings/chat-rooms/21") {
          return { roomId: 21, enabled: options?.method === "PUT" ? options.body.enabled : true };
        }
        return {};
      },
      getSession: () => ({ accessToken: "access-token" }),
      getConfig: () => ({ mockBackend: false }),
    },
    FormData: class {
      constructor() { this.parts = []; }
      append(name, value) { this.parts.push([name, value]); }
    },
    Blob: class {
      constructor(chunks, options) { this.chunks = chunks; this.type = options?.type; }
    },
  };
  vm.runInNewContext(source, {
    window,
    URLSearchParams,
    JSON,
    String,
    Number,
    Boolean,
    Array,
    Object,
    Date,
    Math,
    RegExp,
    Error,
  });
  const api = window.MoyeoApi;

  // 9필드 파싱 — 배열 응답이 그대로 오고 항목마다 정규화된다.
  const rooms = await api.searchRooms({ keyword: "안동" });
  assert.equal(requests[0].path, "/api/v1/chat-rooms/search?keyword=%EC%95%88%EB%8F%99");
  assert.equal(requests[0].options.authenticated, true);
  assert.equal(rooms.length, 3);
  assert.equal(rooms[0].favorite, true);
  assert.equal(rooms[0].recruitmentDDay, 15);
  assert.equal(rooms[0].status, "RECRUITING");
  assert.equal(JSON.stringify(rooms[0].meetingCoord), '{"lat":36.576,"lng":128.97}');
  assert.equal(rooms[0].meetingDetails, "안동역 1번 출구 앞");

  // 'HH:mm:ss'(실제 응답) 과 'HH:mm'(문서) 두 포맷 모두 'HH:mm' 로 표시한다.
  assert.equal(rooms[0].dayTripStartTime, "09:00");
  assert.equal(rooms[0].dayTripEndTime, "18:00");
  assert.equal(api.dayTripTimeText(rooms[0]), "09:00 - 18:00");
  assert.equal(rooms[2].dayTripStartTime, "08:30");
  assert.equal(api.dayTripTimeText(rooms[2]), "08:30 - 17:05");
  assert.equal(api.formatTime("09:00:00"), "09:00");
  assert.equal(api.formatTime("09:00"), "09:00");
  assert.equal(api.formatTime("9:05:30"), "09:05");
  assert.equal(api.formatTime(null), "");

  // null 처리 — 숙박 방은 당일 여행 시간이 없고 집합 안내가 미정이면 표기가 비어야 한다.
  assert.equal(rooms[1].dayTripStartTime, null);
  assert.equal(rooms[1].dayTripEndTime, null);
  assert.equal(api.dayTripTimeText(rooms[1]), "");
  assert.equal(rooms[1].meetingDetails, null);
  assert.equal(api.meetingText(rooms[1]), "");
  assert.equal(rooms[2].meetingDetails, null, "빈 문자열 집합 안내도 null 로 접힌다");
  assert.equal(api.meetingText(rooms[2]), "");
  // 구분자는 안드로이드·iOS 와 같은 " · " 다.
  assert.equal(api.meetingText(rooms[0]), "08:30 · 안동역 1번 출구 앞");
  assert.equal(rooms[1].recruitmentDDay, 0, "D-0 은 null 이 아니다");

  // 좌표가 한쪽만 있으면 마커에서 제외한다.
  assert.equal(rooms[1].meetingCoord, null);
  assert.equal(rooms[1].meetingLongitude, null);
  const markers = api.roomMarkers(rooms);
  assert.equal(markers.length, 2, "좌표가 한쪽만 있는 항목은 마커에서 빠진다");
  assert.equal([...markers].map((marker) => marker.room.roomId).join(","), "1,3");
  // 같은 자리(0.1도 이내)의 모집은 하나로 묶이고 숫자가 올라간다.
  const clustered = api.roomMarkers([
    { roomId: 7, meetingLatitude: 36.576, meetingLongitude: 128.97 },
    { roomId: 8, meetingLatitude: 36.578, meetingLongitude: 128.972 },
  ]);
  assert.equal(clustered.length, 1, "가까운 모집은 한 마커로 묶인다");
  assert.equal(clustered[0].label, "2");
  assert.equal(clustered[0].room.roomId, 7, "카드에는 묶음의 첫 모집을 쓴다");
  assert.equal(markers[0].lat, 36.576);
  assert.equal(markers[0].lng, 128.97);
  assert.equal(markers[0].label, "1", "마커 라벨은 기획 11 처럼 그 자리의 모집 수다");
  assert.equal(markers[0].room.roomId, 1);
  assert.equal(api.roomMarkers([{ meetingLatitude: 36.5, meetingLongitude: null }]).length, 0);
  assert.equal(api.roomMarkers([{ meetingLatitude: null, meetingLongitude: 128.9 }]).length, 0);
  assert.equal(api.roomMarkers([{ meetingLatitude: 0, meetingLongitude: 0 }]).length, 0);
  assert.equal(api.roomMarkers(null).length, 0);

  // ── 내 메시지 판정은 토큰의 userId 로 한다 (TAB-STATE-CANON R6) ──
  // 멤버 목록(GET members)의 me 플래그를 기다리지 않으므로 첫 프레임부터 정렬이 맞는다.
  assert.equal(api.myUserId(), "62");
  assert.equal(api.sentByMe({ senderId: 62 }), true, "숫자 senderId 도 문자열 userId 와 맞춰 본다");
  assert.equal(api.sentByMe({ senderId: "62" }), true);
  assert.equal(api.sentByMe({ senderId: 63 }), false);
  assert.equal(api.sentByMe({ senderId: null }), false);
  assert.equal(api.sentByMe(null), false);

  // 상태 배지 — 15 모집 상세와 같은 표를 쓰고 모르는 값은 표기하지 않는다.
  assert.equal(api.statusLabel("RECRUITING"), "진행중");
  assert.equal(api.statusLabel("CONFIRMED"), "확정");
  assert.equal(api.statusLabel("CANCELLED"), "취소됨");
  assert.equal(api.statusLabel(null), "");

  // 17 모집 만들기 — 당일치기는 endDate 없이 시간 필드를, 숙박은 endDate 만 보낸다 (에러코드 40008).
  const dayTrip = api.buildCreateRoomRequest({
    courseType: "PUBLIC",
    courseId: 21,
    tripType: "DAY_TRIP",
    startDate: "2026-09-08",
    endDate: "2026-09-09",
    recruitmentDeadlineDate: "2026-09-05",
    meetingTime: "07:50",
    dayTripStartTime: "08:00",
    dayTripEndTime: "18:00",
    title: "30대끼리 느긋하게 힐링 여행가요~",
    maxParticipants: 5,
    meetingDetails: "터미널 정문 앞",
    meetingLatitude: 36.435612,
    meetingLongitude: 129.057214,
    joinApprovalMode: "MANUAL",
  });
  assert.equal(dayTrip.tripType, "DAY_TRIP");
  assert.equal(dayTrip.endDate, undefined);
  assert.equal(dayTrip.dayTripStartTime, "08:00");
  assert.equal(dayTrip.dayTripEndTime, "18:00");
  assert.equal(dayTrip.meetingDateTime, "2026-09-08T07:50:00");
  assert.equal(dayTrip.courseType, "PUBLIC");
  assert.equal(dayTrip.courseId, 21);
  assert.equal(dayTrip.customCourse, undefined);
  assert.equal(dayTrip.joinApprovalMode, "MANUAL");

  const overnight = api.buildCreateRoomRequest({
    courseType: "PUBLIC",
    courseId: 21,
    tripType: "OVERNIGHT",
    startDate: "2026-09-08",
    endDate: "2026-09-09",
    recruitmentDeadlineDate: "2026-09-05",
    title: "울릉도 2박 3일",
    maxParticipants: 5,
  });
  assert.equal(overnight.endDate, "2026-09-09");
  assert.equal(overnight.dayTripStartTime, undefined);
  assert.equal(overnight.dayTripEndTime, undefined);
  assert.equal(overnight.genderRestriction, "NONE");
  assert.equal(overnight.joinApprovalMode, "AUTO");

  // 서버가 안 주는/사용자가 안 넣은 값은 null 로 보낸다 (빈 문구를 지어내지 않는다).
  assert.equal(overnight.meetingDetails, null);
  assert.equal(overnight.meetingLatitude, null);
  assert.equal(overnight.participationFee, null);

  // 기본 일정은 오늘 기준 미래 날짜다 — 기획 목데이터(지난 날짜)로는 서버가 방을 만들어주지 않는다.
  const schedule = api.defaultRoomSchedule(new Date(2026, 7, 25));
  assert.equal(schedule.startDate, "2026-09-08");
  assert.equal(schedule.endDate, "2026-09-09");
  assert.equal(schedule.recruitmentDeadlineDate, "2026-09-05");

  // 요청은 multipart 다: request 파트가 application/json.
  const created = await api.createRoom(dayTrip);
  assert.equal(created.roomId, 41);
  const createCall = requests.find((entry) => entry.path === "/api/v1/chat-rooms");
  assert.equal(createCall.options.method, "POST");
  assert.equal(createCall.options.body.parts[0][0], "request");
  assert.equal(createCall.options.body.parts[0][1].type, "application/json");
  assert.equal(JSON.parse(createCall.options.body.parts[0][1].chunks[0]).courseId, 21);

  // 5단계가 이어받는 입력값은 세션에 쌓인다.
  api.updateRoomDraft({ courseType: "PUBLIC", courseId: 21 });
  api.updateRoomDraft({ maxParticipants: 6 });
  assert.equal(JSON.stringify(api.roomDraft()), '{"courseType":"PUBLIC","courseId":21,"maxParticipants":6}');
  api.clearRoomDraft();
  assert.equal(JSON.stringify(api.roomDraft()), "{}");

  // ── 20-2 첨부 5종 · 엔드포인트가 갈려 있고 본문 규칙이 서로 다르다 ──
  const call = (path, method) => requests.find((entry) => entry.path === path && (!method || entry.options.method === method));

  // 사진만 multipart 다. 캡션이 비면 파트를 아예 넣지 않는다.
  await api.shareRoomImage(21, { name: "photo.jpg" });
  const imageCall = call("/api/v1/chat-rooms/21/messages/images", "POST");
  assert.equal(imageCall.options.body.parts.length, 1, "캡션이 없으면 image 파트만 보낸다");
  assert.equal(imageCall.options.body.parts[0][0], "image");
  await api.shareRoomImage(21, { name: "photo.jpg" }, "  주산지 물안개  ");
  const captionParts = requests.filter((entry) => entry.path === "/api/v1/chat-rooms/21/messages/images").pop().options.body.parts;
  assert.equal(captionParts.length, 2);
  assert.equal(captionParts[1][0], "caption");
  assert.equal(captionParts[1][1], "주산지 물안개", "캡션은 트림해서 보낸다");

  // 집합 위치 공유는 본문이 없다 — 서버가 방에 저장된 좌표를 카드로 만든다.
  await api.shareRoomLocation(21);
  const locationCall = call("/api/v1/chat-rooms/21/messages/locations", "POST");
  assert.equal(locationCall.options.body, undefined, "locations 는 본문을 보내지 않는다");

  await api.shareRoomTourismContent(21, "126508");
  assert.equal(call("/api/v1/chat-rooms/21/messages/tourism-contents").options.body.contentId, 126508);

  // 질문 필드명은 title 이 아니라 question 이고, 익명이 기본값이다.
  await api.createRoomPoll(21, { question: " 점심 메뉴는? ", options: ["한식", "카페"] });
  const pollCall = call("/api/v1/chat-rooms/21/messages/polls");
  assert.equal(pollCall.options.body.question, "점심 메뉴는?");
  assert.equal(pollCall.options.body.options.join(","), "한식,카페");
  assert.equal(pollCall.options.body.anonymous, true);

  await api.shareRoomSettlementMemo(21, " 점심 45,000원 / 5명 ");
  assert.equal(call("/api/v1/chat-rooms/21/messages/settlement-memos").options.body.memo, "점심 45,000원 / 5명");

  // 투표 참여·취소
  await api.votePollOption(21, 1024, 23);
  assert.equal(call("/api/v1/chat-rooms/21/messages/1024/poll-options/23/vote").options.method, "PUT");
  await api.cancelPollVote(21, 1024);
  assert.equal(call("/api/v1/chat-rooms/21/messages/1024/vote").options.method, "DELETE");

  // 투표 카드 비율 — 서버는 표 수만 준다. 아무도 안 골랐으면 0 이고 나눗셈이 터지지 않는다.
  const poll = { totalVoteCount: 4, options: [{ optionId: 1, voteCount: 3, votedByMe: true }, { optionId: 2, voteCount: 1, votedByMe: false }] };
  assert.equal(api.pollPercent(poll, poll.options[0]), 75);
  assert.equal(api.pollPercent(poll, poll.options[1]), 25);
  assert.equal(api.pollPercent({ totalVoteCount: 0, options: [] }, { voteCount: 0 }), 0);
  assert.equal(api.pollPercent(null, null), 0);
  assert.equal(api.myPollOptionId(poll), 1);
  assert.equal(api.myPollOptionId({ options: [{ optionId: 9, votedByMe: false }] }), null);
  assert.equal(api.myPollOptionId(null), null);

  // 방별 알림 설정 — 별도 설정이 없으면 서버 기본값이 켜짐이다.
  assert.equal((await api.roomNotificationSetting(21)).enabled, true);
  assert.equal((await api.updateRoomNotificationSetting(21, false)).enabled, false);
  assert.equal(call("/api/v1/notifications/settings/chat-rooms/21", "PUT").options.body.enabled, false);

  // 17-3 집합 정보 수정 — meetingDateTime 은 필수라 화면에 시간 입력 자리가 없으면 방의 현재 값을 유지한다.
  const meetingRoom = {
    meetingLatitude: 36.576,
    meetingLongitude: 128.97,
    meetingDetails: "안동역 1번 출구 앞",
    meetingDateTime: "2026-09-12T08:30:00",
  };
  const movedMeeting = api.buildMeetingInfoRequest(meetingRoom, { meetingLatitude: 36.4, meetingLongitude: 129.05, meetingDetails: " 터미널 정문 앞 " });
  assert.equal(movedMeeting.meetingLatitude, 36.4);
  assert.equal(movedMeeting.meetingLongitude, 129.05);
  assert.equal(movedMeeting.meetingDetails, "터미널 정문 앞");
  assert.equal(movedMeeting.meetingDateTime, "2026-09-12T08:30:00", "집합 시각은 방의 현재 값을 그대로 유지한다");
  // 사용자가 상세 안내를 지우면 null 로 보낸다 (빈 문구를 지어내지 않는다).
  assert.equal(api.buildMeetingInfoRequest(meetingRoom, { meetingDetails: "   " }).meetingDetails, null);
  // 좌표가 없는 방은 null 을 그대로 보낸다.
  assert.equal(api.buildMeetingInfoRequest({ meetingDateTime: "2026-09-12T08:30:00" }).meetingLatitude, null);
  await api.updateMeetingInfo(21, movedMeeting);
  assert.equal(call("/api/v1/chat-rooms/21/meeting-info").options.method, "PUT");

  // 동행자 — 배열 응답이고 mannerRating 은 값이 없으면 null 이다(표기를 숨긴다).
  const companions = await api.roomCompanions(21);
  assert.equal(companions.length, 2);
  assert.equal(companions[0].mannerRating, null, "값 없는 매너 점수는 null 로 접힌다");
  assert.equal(companions[0].mannerScore, 5);
  assert.equal(companions[0].oneLineReview, "약속 시간을 잘 지켜요");
  assert.equal(companions[0].reviewed, true);
  assert.equal(companions[1].mannerRating, 4.8, "문자열 매너 점수는 숫자로 정규화된다");
  assert.equal(companions[1].oneLineReview, null, "빈 한줄평은 null 이다");
  assert.equal(companions[1].reviewed, false);

  // "아직 여행 전"은 권한 오류가 아니다 — 배포 서버 409 40915 · 로컬 소스 403 을 모두 같게 본다.
  assert.equal(api.isBeforeTripError({ status: 409, code: 40915 }), true);
  assert.equal(api.isBeforeTripError({ status: 409, code: "40915" }), true);
  assert.equal(api.isBeforeTripError({ status: 403 }), true);
  assert.equal(api.isBeforeTripError({ status: 500 }), false);
  assert.equal(api.isBeforeTripError(null), false);

  // 동행자 평가 — 경로 변수는 companionRecordId 가 아니라 상대 userId 다.
  await api.reviewCompanion(21, 61, { mannerScore: 5, oneLineReview: "  " });
  const reviewCall = call("/api/v1/chat-rooms/21/companions/61/review");
  assert.equal(reviewCall.options.method, "PUT");
  assert.equal(reviewCall.options.body.mannerScore, 5);
  assert.equal(reviewCall.options.body.oneLineReview, null);

  // 18 승인·거절 — 거절은 DELETE applications/{id} 다 (별도 reject 경로가 아니다).
  await api.approveApplication(21, 30);
  assert.equal(call("/api/v1/chat-rooms/21/applications/30/approve").options.method, "POST");
  await api.rejectApplication(21, 30);
  assert.equal(call("/api/v1/chat-rooms/21/applications/30", "DELETE").options.method, "DELETE");

  // 나가기·내보내기 (파괴적 — 실호출 검증은 하지 않았다). 강퇴는 본문에 사유가 필수다.
  await api.leaveRoom(21);
  assert.equal(call("/api/v1/chat-rooms/21/members/me").options.method, "DELETE");
  await api.kickRoomMember(21, 62, "  반복적인 약속 불이행  ");
  const kickCall = call("/api/v1/chat-rooms/21/members/62");
  assert.equal(kickCall.options.method, "DELETE");
  assert.equal(kickCall.options.body.reason, "반복적인 약속 불이행");

  // 17-3 진입 컨텍스트 — 모집 만들기(2/5)와 같은 화면을 쓰므로 세션 값으로 구분한다.
  assert.equal(api.meetingEditRoomId(), null);
  api.selectMeetingEditRoom(21);
  assert.equal(api.meetingEditRoomId(), "21");
  api.selectMeetingEditRoom(null);
  assert.equal(api.meetingEditRoomId(), null);

  // 캡처 라우트라고 목데이터로 떨어지지 않는다 — 세션이 있으면 어디서든 실데이터다.
  // 예전에는 ?screen= 만 붙어도 목데이터가 강제돼, 스크린샷이 실제 앱이 아니라 프로토타입을 찍었다.
  for (const search of ["?screen=explore", "?route=explore", "?capture=1", "?uitest=1", "?mockAuth=1"]) {
    window.location.search = search;
    assert.equal(api.live(), true, `${search} 도 세션이 있으면 실데이터를 쓴다`);
  }
  assert.equal(typeof api.deterministicParams, "undefined", "목/실 분기 스위치는 제거됐다");

  // ── 가입 전 취향 후보는 **서버에서 받는다** (SIGNUP-GATE-CANON R4, 2026-08-30 정정) ──
  // 예전에는 "가입 전엔 토큰이 없어 못 부른다"는 이유로 서버 시드를 옮겨 적은 거울 표를 들고 있었다.
  // profile/options 가 토큰 없이 200 인 것이 확인돼 표를 지웠다 — 되돌아오면 이 단언이 잡는다.
  assert.equal(typeof api.SIGNUP_TRAVEL_STYLES, "undefined", "가입 전 스타일 거울 표는 제거됐다");
  assert.equal(typeof api.SIGNUP_INTERESTED_REGIONS, "undefined", "가입 전 지역 거울 표는 제거됐다");

  // 12-2 태그로 모임 찾기는 없는 기능이다 (2026-08-31) — 태그별 모임 검색 호출부는 양쪽 다 없다.
  assert.equal(typeof api.roomsByCourseTag, "undefined", "삭제된 course-tags 호출부는 없다");
  assert.equal(typeof api.roomsByCourseTagName, "undefined", "태그로 모임 찾기 호출부는 없다");
  assert.equal(typeof api.selectCourseTag, "undefined", "태그 이어받기 보관소도 없다");
  assert.equal(typeof api.courseTags, "function", "코스 태그 목록(표시용)은 남는다");
}

async function authContractTests() {
  const source = await read("src/auth-api.jsx");
  const makeStorage = () => {
    const values = new Map();
    return {
      values,
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    };
  };
  const createWindow = ({ search = "", fetchImpl = fetch, mock = false, captureSession } = {}) => {
    const localStorage = makeStorage();
    const sessionStorage = makeStorage();
    // 가입 게이트(409)는 라우터가 React 컨텍스트라 이벤트로 올라온다 —
    // 최소한의 이벤트 타깃만 흉내내어 어디로 보내는지 확인한다.
    const signupGateEvents = [];
    const window = {
      location: { search, origin: "https://web.example", pathname: "/app/", href: `https://web.example/app/${search}` },
      setTimeout,
      clearTimeout,
      localStorage,
      sessionStorage,
      signupGateEvents,
      CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
      dispatchEvent: (event) => { signupGateEvents.push(event); return true; },
      MOYEO_MOCK_IDENTITY: mock,
      MOYEO_MOCK_AUTH_BACKEND: mock,
      MOYEO_CAPTURE_SESSION: captureSession,
      AbortController,
      // 액세스 토큰 페이로드를 읽는 데 쓴다 (TAB-STATE-CANON R6).
      atob: (text) => Buffer.from(text, "base64").toString("binary"),
      console: { debug() {} },
    };
    vm.runInNewContext(source, { window, URL, URLSearchParams, fetch: fetchImpl, Response, Error, JSON, Math, String, Promise, Date, Uint8Array });
    return window;
  };

  const window = createWindow({ search: "?mockAuth=1", mock: true });

  const login = await window.MoyeoAuth.begin("kakao");
  assert.equal(login.login.signupState, "USER_INFO_REQUIRED");
  const signup = await window.MoyeoAuth.signup({
    nickname: "따스한 사슴 3492",
    nicknameSelectionToken: "selection-token",
    gender: "F",
    birthDate: "1998-04-12",
  });
  assert.equal(signup.signupState, "PROFILE_IMAGE_REQUIRED");
  assert.equal(window.MoyeoAuth.getSession().accessToken, "mock-access-token");

  const generated = [];
  for (let index = 0; index < 3; index += 1) generated.push(await window.MoyeoAuth.generateProfileImage());
  assert.deepEqual(generated.map((item) => item.remainingGenerationCount), [2, 1, 0]);
  const restoredCandidates = await window.MoyeoAuth.getProfileImages();
  assert.equal(restoredCandidates.candidates.length, 3, "generated profile candidates should accumulate and restore");
  assert.equal(
    JSON.stringify(restoredCandidates.candidates.map((candidate) => candidate.profileImageId)),
    JSON.stringify(generated.map((item) => item.candidate.profileImageId)),
    "generating a new candidate must not replace earlier candidates",
  );
  const selectedProfile = await window.MoyeoAuth.selectProfileImage(restoredCandidates.candidates[1].profileImageId);
  assert.equal(selectedProfile.selectedImage.profileImageId, restoredCandidates.candidates[1].profileImageId);
  assert.equal(selectedProfile.signupState, "SIGNUP_COMPLETE");
  await assert.rejects(() => window.MoyeoAuth.generateProfileImage(), /최대 3번/);

  window.localStorage.setItem("moyeo.auth.session", JSON.stringify({
    accessToken: "stale-access-token",
    refreshToken: "stale-refresh-token",
    signupState: "SIGNUP_COMPLETE",
  }));
  window.location.search = "?authUser=profile";
  const resumed = await window.MoyeoAuth.begin("apple");
  assert.equal(resumed.login.signupState, "PROFILE_IMAGE_REQUIRED");
  assert.equal(window.MoyeoAuth.getSession().signupState, "PROFILE_IMAGE_REQUIRED");

  let capturedIdentityRequest;
  let resetEmail;
  window.MoyeoAuth.setIdentityProvider({
    async getFirebaseIdToken(provider, options) {
      capturedIdentityRequest = { provider, options };
      return `injected-${provider}-token`;
    },
    async sendPasswordResetEmail(email) {
      resetEmail = email;
    },
  });
  window.location.search = "";
  const emailLogin = await window.MoyeoAuth.begin("email", {
    email: "traveler@example.com",
    password: "secret12",
    mode: "signup",
  });
  assert.equal(emailLogin.login.providerType, "EMAIL");
  assert.deepEqual(capturedIdentityRequest, {
    provider: "email",
    options: { email: "traveler@example.com", password: "secret12", mode: "signup" },
  });
  const googleLogin = await window.MoyeoAuth.begin("google");
  assert.equal(googleLogin.login.providerType, "GOOGLE");
  await window.MoyeoAuth.resetEmailPassword("traveler@example.com");
  assert.equal(resetEmail, "traveler@example.com");

  const requests = [];
  const queued = [
    { accessToken: null, refreshToken: null, isNewUser: true, signupState: "USER_INFO_REQUIRED", providerType: "GOOGLE" },
    { accessToken: "access-1", refreshToken: "refresh-1", signupState: "PROFILE_IMAGE_REQUIRED" },
    { errorMessage: "만료됨", code: "UNAUTHORIZED", status: 401 },
    { accessToken: "access-2", refreshToken: "refresh-2", signupState: "PROFILE_IMAGE_REQUIRED" },
    { candidates: [], generationCount: 0, remainingGenerationCount: 3, signupState: "PROFILE_IMAGE_REQUIRED" },
  ];
  const realFetch = async (url, options = {}) => {
    const item = queued.shift();
    requests.push({ url: String(url), options, body: options.body ? JSON.parse(options.body) : undefined });
    return new Response(JSON.stringify(item), {
      status: item.status || 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  const realWindow = createWindow({ fetchImpl: realFetch });
  assert.equal(realWindow.MoyeoAuth.getConfig().mockIdentity, false, "real identity must be the default");
  assert.equal(realWindow.MoyeoAuth.getConfig().mockBackend, false, "real backend must be the default");
  realWindow.MoyeoAuth.setIdentityProvider({
    async getFirebaseIdToken() { return { idToken: "firebase-google-id" }; },
    async sendPasswordResetEmail() {},
  });
  const realLogin = await realWindow.MoyeoAuth.begin("google");
  assert.equal(realLogin.login.signupState, "USER_INFO_REQUIRED");
  assert.equal(requests[0].url, "https://moyeo-trip-api.jayden-bin.cc/api/v1/auth/login");
  assert.deepEqual(requests[0].body, { idToken: "firebase-google-id" });

  const realSignup = await realWindow.MoyeoAuth.signup({
    nickname: "따스한 사슴 3492",
    nicknameSelectionToken: "selection-token",
    gender: "F",
    birthDate: "1998-04-12",
  });
  assert.equal(realSignup.signupState, "PROFILE_IMAGE_REQUIRED");
  assert.equal(requests[1].url, "https://moyeo-trip-api.jayden-bin.cc/api/v1/auth/signup");
  assert.equal(requests[1].body.nicknameSelectionToken, "selection-token");

  const restored = await realWindow.MoyeoAuth.getProfileImages();
  assert.equal(restored.remainingGenerationCount, 3);
  assert.equal(requests[2].options.headers.Authorization, "Bearer access-1");
  assert.equal(requests[3].url, "https://moyeo-trip-api.jayden-bin.cc/api/v1/auth/refresh");
  assert.deepEqual(requests[3].body, { refreshToken: "refresh-1" });
  assert.equal(requests[4].options.headers.Authorization, "Bearer access-2");
  assert.equal(realWindow.MoyeoAuth.getSession().refreshToken, "refresh-2");

  // ── 라이브 캡처 세션 주입 (src/capture-session.local.js) ──
  // 계약: ?liveData=1 일 때만 쓰고, 토큰은 URL·localStorage 에 남기지 않는다.
  const captureToken = { accessToken: "live-capture-access-token" };

  // 플래그가 없으면 파일이 있어도 무시한다 — 목 캡처 경로가 100% 그대로여야 한다.
  for (const search of ["", "?screen=home", "?screen=home&theme=dark&capture=1", "?mockAuth=1"]) {
    const ignored = createWindow({ search, captureSession: captureToken });
    assert.equal(ignored.MoyeoAuth.getSession(), null, `${search || "(no query)"} 에서는 주입 세션을 쓰지 않는다`);
  }

  // 파일이 없거나 토큰이 비면 라이브 모드로 들어가지 않는다.
  for (const injected of [undefined, {}, { accessToken: "" }, { accessToken: "   " }]) {
    const noToken = createWindow({ search: "?screen=home&liveData=1", captureSession: injected });
    assert.equal(noToken.MoyeoAuth.getSession(), null, "빈 토큰은 세션을 세우지 않는다");
  }

  // ?liveData=1 + 토큰 → 세션이 선다. signupState 기본값은 SIGNUP_COMPLETE 다.
  const liveRequests = [];
  const liveWindow = createWindow({
    search: "?screen=home&theme=dark&capture=1&liveData=1",
    captureSession: { accessToken: "  live-capture-access-token  " },
    fetchImpl: async (url, options = {}) => {
      liveRequests.push({ url: String(url), options });
      return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
    },
  });
  assert.equal(liveWindow.MoyeoAuth.getSession().accessToken, "live-capture-access-token", "주입 토큰은 트림해서 쓴다");
  assert.equal(liveWindow.MoyeoAuth.getSession().signupState, "SIGNUP_COMPLETE");
  assert.equal(liveWindow.MoyeoAuth.getSession().refreshToken, undefined, "refreshToken 은 주입하지 않는다");
  await liveWindow.MoyeoAuth.request("/api/v1/chat-rooms/my", { authenticated: true });
  assert.equal(liveRequests[0].options.headers.Authorization, "Bearer live-capture-access-token");
  // 토큰이 브라우저 저장소로 새지 않는다.
  assert.equal(liveWindow.localStorage.values.size, 0, "라이브 캡처 세션은 localStorage 에 남지 않는다");

  // 401 이어도 refresh 를 시도하지 않는다(refreshToken 이 없다) — 조용히 실패하고 저장소도 건드리지 않는다.
  const expiredWindow = createWindow({
    search: "?screen=home&liveData=1",
    captureSession: captureToken,
    fetchImpl: async () => new Response(JSON.stringify({ errorMessage: "만료됨", code: "UNAUTHORIZED" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    }),
  });
  await assert.rejects(() => expiredWindow.MoyeoAuth.request("/api/v1/chat-rooms/my", { authenticated: true }));
  assert.equal(expiredWindow.localStorage.values.size, 0, "401 이어도 저장소에 쓰지 않는다");
  expiredWindow.MoyeoAuth.clearSession();
  assert.equal(expiredWindow.MoyeoAuth.getSession(), null);
  assert.equal(expiredWindow.localStorage.values.size, 0);

  // 주입 세션은 localStorage 의 기존 세션보다 우선한다 (캡처 프로필에 남은 값에 흔들리지 않는다).
  const overriding = createWindow({ search: "?screen=home&liveData=1", captureSession: captureToken });
  overriding.localStorage.setItem("moyeo.auth.session", JSON.stringify({ accessToken: "stale", refreshToken: "stale" }));
  assert.equal(overriding.MoyeoAuth.getSession().accessToken, "live-capture-access-token");

  // ── 가입 게이트 409 (SIGNUP-GATE-CANON R1) ──
  // 40902·40918 은 토큰 문제가 아니다. 재발급 경로로 새면 원인이 그대로인 채 무한히 돈다.
  // 서버가 code 를 숫자로 주는 경우까지 함께 확인한다.
  for (const [code, signupState, route] of [
    [40902, "USER_INFO_REQUIRED", "prof-1"],
    ["40918", "PROFILE_IMAGE_REQUIRED", "prof-2"],
  ]) {
    const gateCalls = [];
    const gateWindow = createWindow({
      fetchImpl: async (url) => {
        gateCalls.push(String(url));
        return new Response(JSON.stringify({ code, errorMessage: "가입이 끝나지 않았습니다." }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      },
    });
    gateWindow.localStorage.setItem("moyeo.auth.session", JSON.stringify({
      accessToken: "access-1", refreshToken: "refresh-1", signupState: "SIGNUP_COMPLETE",
    }));
    await assert.rejects(() => gateWindow.MoyeoAuth.request("/api/v1/chat-rooms/my", { authenticated: true }));
    assert.equal(gateCalls.length, 1, `${code} 는 토큰 재발급·재요청을 하지 않는다`);
    assert.equal(gateWindow.MoyeoAuth.getSession().signupState, signupState);
    assert.equal(gateWindow.signupGateEvents.at(-1).type, "moyeo:signup-gate");
    assert.equal(gateWindow.signupGateEvents.at(-1).detail.route, route, "해당 가입 단계로 되돌린다");
  }

  // ── 40919 는 오류가 아니다 (R2) ──
  // 프로필 이미지 3종에서만 나오고, "이미 끝났다"는 뜻이라 조용히 다음 화면으로 넘겨야 한다.
  const doneWindow = createWindow({
    fetchImpl: async () => new Response(
      JSON.stringify({ code: 40919, errorMessage: "이미 프로필 이미지 설정을 완료했습니다." }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    ),
  });
  doneWindow.localStorage.setItem("moyeo.auth.session", JSON.stringify({
    accessToken: "access-1", refreshToken: "refresh-1", signupState: "PROFILE_IMAGE_REQUIRED",
  }));
  for (const call of [
    () => doneWindow.MoyeoAuth.generateProfileImage(),
    () => doneWindow.MoyeoAuth.getProfileImages(),
    () => doneWindow.MoyeoAuth.selectProfileImage(1),
  ]) {
    assert.equal((await call()).signupState, "SIGNUP_COMPLETE", "40919 는 던지지 않고 완료로 접힌다");
  }
  assert.equal(doneWindow.signupGateEvents.length, 0, "40919 는 가입 단계로 되돌리지 않는다");
  assert.equal(doneWindow.MoyeoAuth.getSession().signupState, "SIGNUP_COMPLETE");

  // ── 가입 요청이 취향 id 를 싣는다 (R4) · 공백 FCM 토큰은 싣지 않는다 (R6) ──
  const signupCalls = [];
  const tasteWindow = createWindow({
    fetchImpl: async (url, options = {}) => {
      signupCalls.push({ url: String(url), body: options.body ? JSON.parse(options.body) : undefined });
      return new Response(
        JSON.stringify({ accessToken: "access-1", refreshToken: "refresh-1", signupState: "PROFILE_IMAGE_REQUIRED" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    },
  });
  tasteWindow.MoyeoAuth.setIdentityProvider({
    async getFirebaseIdToken() { return { idToken: "firebase-google-id" }; },
    async sendPasswordResetEmail() {},
  });
  await tasteWindow.MoyeoAuth.begin("google");
  await tasteWindow.MoyeoAuth.signup({
    nickname: "따스한 사슴 3492",
    nicknameSelectionToken: "selection-token",
    gender: "F",
    birthDate: "1998-04-12",
    agreedTermIds: [1, 2],
    travelStyleIds: [1, 3],
    interestedRegionIds: [1, 17],
    fcmToken: "   ",
  });
  const tasteBody = signupCalls.at(-1).body;
  assert.deepEqual(tasteBody.travelStyleIds, [1, 3], "07 에서 고른 스타일 id 가 가입 요청에 실린다");
  assert.deepEqual(tasteBody.interestedRegionIds, [1, 17], "07 에서 고른 지역 id 가 가입 요청에 실린다");
  assert.equal("fcmToken" in tasteBody, false, "공백만 있는 FCM 토큰은 40016 이라 필드를 생략한다");

  await tasteWindow.MoyeoAuth.signup({
    nickname: "따스한 사슴 3492",
    nicknameSelectionToken: "selection-token",
    gender: "F",
    birthDate: "1998-04-12",
    agreedTermIds: [1],
    fcmToken: "fcm-registration-token",
  });
  const bareBody = signupCalls.at(-1).body;
  assert.equal("travelStyleIds" in bareBody, false, "고르지 않았으면 필드를 생략한다");
  assert.equal("interestedRegionIds" in bareBody, false, "고르지 않았으면 필드를 생략한다");
  assert.equal(bareBody.fcmToken, "fcm-registration-token");

  // ── 내 신원은 액세스 토큰에서 즉시 읽는다 (TAB-STATE-CANON R6) ──
  // 멤버 목록의 me 플래그를 기다리면 내 메시지가 남의 것처럼 왼쪽에 그려졌다가 튄다.
  const jwtWith = (payload) => `header.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.signature`;
  const identityWindow = createWindow();
  const setAccessToken = (accessToken) => identityWindow.localStorage.setItem(
    "moyeo.auth.session",
    JSON.stringify({ accessToken }),
  );
  assert.equal(identityWindow.MoyeoAuth.currentUserId(), null, "세션이 없으면 신원도 없다");
  setAccessToken(jwtWith({ userId: "62", sub: "firebase-uid" }));
  assert.equal(identityWindow.MoyeoAuth.currentUserId(), "62", "토큰 페이로드의 userId 를 동기로 읽는다");
  setAccessToken(jwtWith({ userId: 62 }));
  assert.equal(identityWindow.MoyeoAuth.currentUserId(), "62", "숫자로 실려 와도 문자열로 통일한다");
  setAccessToken(jwtWith({ userId: "62", nickname: "따스한 사슴" }));
  assert.equal(identityWindow.MoyeoAuth.currentUserId(), "62", "한글 클레임이 섞여도 페이로드를 읽는다");
  for (const broken of ["", "not-a-jwt", "a.b", "header.@@@.signature", jwtWith({ sub: "only" })]) {
    setAccessToken(broken);
    assert.equal(identityWindow.MoyeoAuth.currentUserId(), null, `손상된 토큰(${broken}) 은 던지지 않고 신원 없음이다`);
  }

  // ── 취소는 실패와 다른 값이다 (AUTH-SILENT-CASES-CANON R1 · R2) ──
  // 웹의 취소 신호 3종. 어느 것이든 서버를 부르지 않고 조용히 취소로 접힌다.
  for (const code of ["auth/popup-closed-by-user", "auth/cancelled-popup-request"]) {
    const cancelWindow = createWindow({
      fetchImpl: async () => { throw new Error("취소했는데 서버를 불렀다"); },
    });
    cancelWindow.MoyeoAuth.setIdentityProvider({
      async getFirebaseIdToken() {
        const error = new Error("popup closed by user");
        error.code = code;
        throw error;
      },
      async sendPasswordResetEmail() {},
    });
    const cancelled = await cancelWindow.MoyeoAuth.begin("kakao");
    assert.equal(cancelled.cancelled, true, `${code} 는 취소로 갈라진다`);
    assert.equal(cancelled.login, undefined, "취소는 로그인 컨텍스트를 만들지 않는다");
    assert.equal(cancelWindow.MoyeoAuth.getSession(), null, "취소는 세션을 건드리지 않는다");
    const cancelledLink = await cancelWindow.MoyeoAuth.linkProvider("google");
    assert.equal(cancelledLink.cancelled, true, "로그인 방식 연결에서도 취소는 실패가 아니다");
  }
  // 취소가 아닌 실패는 계속 오류다 (§3) — 취소로 접히지 않고 그대로 던져진다.
  const failWindow = createWindow();
  failWindow.MoyeoAuth.setIdentityProvider({
    async getFirebaseIdToken() {
      const error = new Error("network down");
      error.code = "auth/network-request-failed";
      throw error;
    },
    async sendPasswordResetEmail() {},
  });
  await assert.rejects(() => failWindow.MoyeoAuth.begin("google"), /network down/);
  await assert.rejects(() => failWindow.MoyeoAuth.linkProvider("google"), /network down/);

  // 카카오 인가 콜백의 error=access_denied — 로그인 화면 그대로, 오류 없음.
  const deniedWindow = createWindow({
    search: "?error=access_denied&error_description=User%20denied",
  });
  const denied = await deniedWindow.MoyeoAuth.restoreAuthState();
  assert.equal(denied.route, "login", "취소하고 돌아오면 로그인 화면을 유지한다");
  assert.equal(denied.cancelled, true);
  // 취소가 아닌 인가 오류는 그대로 오류이고, 제공자 원문을 사용자 문구로 쓰지 않는다 (R4).
  const badCallback = createWindow({ search: "?error=invalid_request&error_description=bad%20client" });
  await assert.rejects(() => badCallback.MoyeoAuth.restoreAuthState(), (error) => {
    assert.equal(error.message, "로그인을 완료하지 못했어요.");
    assert.ok(!error.message.includes("bad client"));
    return true;
  });

  // ── 세션 만료는 오류가 아니다 (AUTH-SILENT-CASES-CANON R3 · R4) ──
  const refreshRejected = (url) => (String(url).endsWith("/api/v1/auth/refresh")
    ? new Response(JSON.stringify({ code: 40001, errorMessage: "유효하지 않은 RefreshToken 입니다." }), {
      status: 400, headers: { "Content-Type": "application/json" },
    })
    : new Response(JSON.stringify({ code: "UNAUTHORIZED", errorMessage: "만료됨" }), {
      status: 401, headers: { "Content-Type": "application/json" },
    }));
  const deadSession = JSON.stringify({ accessToken: "access-1", refreshToken: "dead", signupState: "SIGNUP_COMPLETE" });

  const expiredStartup = createWindow({ fetchImpl: async (url) => refreshRejected(url) });
  expiredStartup.localStorage.setItem("moyeo.auth.session", deadSession);
  const expiredRoute = await expiredStartup.MoyeoAuth.restoreAuthState();
  assert.equal(expiredRoute.route, "login", "만료된 세션은 온보딩이 아니라 로그인 화면으로 되돌린다");
  assert.equal(expiredRoute.sessionExpired, true, "호출부가 배너를 띄우지 않도록 만료를 따로 알린다");
  assert.equal(expiredStartup.MoyeoAuth.getSession(), null, "만료된 세션은 지운다");

  // 서버 원문(`유효하지 않은 RefreshToken 입니다.`)이 사용자 문구로 새지 않는다.
  const expiredRequest = createWindow({ fetchImpl: async (url) => refreshRejected(url) });
  expiredRequest.localStorage.setItem("moyeo.auth.session", deadSession);
  const expiredFailure = await expiredRequest.MoyeoAuth
    .request("/api/v1/chat-rooms/my", { authenticated: true })
    .then(() => null, (error) => error);
  assert.ok(expiredFailure, "만료된 세션의 요청은 실패한다");
  assert.equal(expiredFailure.sessionExpired, true);
  assert.equal(expiredFailure.code, "SESSION_EXPIRED");
  assert.equal(expiredFailure.message, "로그인이 필요해요.");
  assert.ok(!expiredFailure.message.includes("RefreshToken"), "서버 원문을 사용자 문구로 쓰지 않는다 (R4)");

  // 5xx·연결 실패는 만료가 아니다 (§3) — 계속 오류로 보여주고 세션도 지우지 않는다.
  const flakyServer = createWindow({
    fetchImpl: async (url) => (String(url).endsWith("/api/v1/auth/refresh")
      ? new Response(JSON.stringify({ errorMessage: "서버 오류" }), { status: 503, headers: { "Content-Type": "application/json" } })
      : new Response(JSON.stringify({ code: "UNAUTHORIZED" }), { status: 401, headers: { "Content-Type": "application/json" } })),
  });
  flakyServer.localStorage.setItem("moyeo.auth.session", deadSession);
  const flakyFailure = await flakyServer.MoyeoAuth
    .request("/api/v1/chat-rooms/my", { authenticated: true })
    .then(() => null, (error) => error);
  assert.ok(flakyFailure, "5xx 는 그대로 실패다");
  assert.equal(flakyFailure.sessionExpired, undefined, "서버가 죽은 것은 세션 만료가 아니다");
  assert.equal(flakyServer.MoyeoAuth.getSession().refreshToken, "dead", "잠깐의 서버 장애로 로그아웃시키지 않는다");
}

// ── 탭 전환 상태 보관소 (TAB-STATE-CANON R1 · R2 · R4) ──
async function tabCacheTests() {
  const source = await read("src/tab-cache.js");
  let userId = null;
  const window = { MoyeoAuth: { currentUserId: () => userId } };
  vm.runInNewContext(source, { window, Promise, Date, Map, Set, Object, String, Boolean, Array });
  const cache = window.MoyeoTabCache;

  // 캐시가 없으면 idle → loading → ready 로만 간다. 값이 생기면 요청이 도는 중에도 ready 다.
  assert.equal(cache.snapshot("explore.rooms").status, "idle");
  let resolveRooms;
  const roomsResponse = new Promise((resolve) => { resolveRooms = resolve; });
  const first = cache.load("explore.rooms", () => roomsResponse, Array.isArray);
  assert.equal(cache.snapshot("explore.rooms").status, "loading");
  // 같은 키를 동시에 요청해도 한 번만 나간다.
  assert.equal(cache.load("explore.rooms", () => assert.fail("중복 요청이 나갔다")), first);
  resolveRooms([{ roomId: 1 }]);
  await first;
  assert.equal(cache.snapshot("explore.rooms").status, "ready");
  assert.equal(cache.read("explore.rooms").length, 1);

  // 갱신이 실패해도 가진 데이터를 오류로 덮지 않는다 (R2).
  await cache.load("explore.rooms", () => Promise.reject(new Error("끊김"))).catch(() => {});
  assert.equal(cache.snapshot("explore.rooms").status, "ready", "캐시가 있으면 실패가 화면을 덮지 않는다");
  assert.equal(cache.read("explore.rooms").length, 1);

  // 캐시가 없는데 실패하면 실패 상태를 보여준다 (조용히 삼키지 않는다).
  await cache.load("feed.list:DISCOVER", () => Promise.reject(new Error("끊김"))).catch(() => {});
  assert.equal(cache.snapshot("feed.list:DISCOVER").status, "failed");

  // 모양이 어긋난 응답은 보관하지 않는다 — 다음 진입에서 그대로 다시 그려지면 안 된다.
  await cache.load("my.rooms", () => Promise.resolve({ notAnArray: true }), Array.isArray);
  assert.equal(cache.has("my.rooms"), false);

  // 그 화면이 바꾼 항목만 갈아끼운다 (R4).
  cache.patch("explore.rooms", (rooms) => rooms.map((room) => ({ ...room, favorite: true })));
  assert.equal(cache.read("explore.rooms")[0].favorite, true);

  // 계정이 바뀌면 보관소를 비운다 — 다른 사용자의 데이터가 남으면 안 된다 (R4).
  userId = "62";
  cache.syncOwner();
  assert.equal(cache.has("explore.rooms"), false, "계정 전환 시 보관소를 비운다");
  await cache.load("explore.rooms", () => Promise.resolve([{ roomId: 9 }]), Array.isArray);
  cache.writeUiState("explore.tag", 3);
  assert.equal(cache.readUiState("explore.tag", null), 3);
  userId = null;
  cache.syncOwner();
  assert.equal(cache.has("explore.rooms"), false, "로그아웃 시 보관소를 비운다");
  assert.equal(cache.readUiState("explore.tag", null), null, "고른 필터도 함께 지운다");
}

function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".jsx")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

async function startServer() {
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://127.0.0.1");
      const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
      const filePath = path.normalize(path.join(root, pathname));
      if (!filePath.startsWith(root)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      await access(filePath);
      response.writeHead(200, { "Content-Type": contentType(filePath) });
      createReadStream(filePath).pipe(response);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return {
    baseUrl: `http://127.0.0.1:${port}/`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

async function findChrome() {
  const candidates = [
    process.env.CHROME_BIN,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "google-chrome-stable",
    "google-chrome",
    "chromium-browser",
    "chromium",
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await run(candidate, ["--version"], { timeout: 4000 });
      return candidate;
    } catch {
      // Try next candidate.
    }
  }
  return null;
}

// budgetMs: 스플래시(1800ms) + 세션 복원을 기다려야 하는 진입 게이트는 기본 예산으로는
// 렌더가 끝나기 전에 덤프된다. 화면 수가 늘어 머신이 바빠질수록 더 자주 걸린다.
async function dumpDom(chrome, baseUrl, params, budgetMs = 5200) {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  // **실행마다 프로필을 격리한다.** 이 함수는 `mapWithConcurrency` 로 병렬 호출되는데,
  // `--user-data-dir` 이 없으면 Chrome 인스턴스들이 **기본 프로필 하나를 함께 쓴다.**
  // 그러면 임의의 화면에서 `SIGTRAP` 으로 죽어(매번 다른 화면이라 코드 탓으로 오해했다)
  // 테스트 전체가 실패한다 — 2026-09-07 에 `prof-1`·`search` 에서 번갈아 재현했다.
  // 격리 프로필로 같은 명령을 돌리면 통과한다.
  const profile = await mkdtemp(path.join(tmpdir(), "moyeo-web-test-chrome-"));
  try {
    const stdout = await dumpDomOnce(chrome, [
      "--headless=new",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--no-sandbox",
      "--no-first-run",
      `--user-data-dir=${profile}`,
      "--hide-scrollbars",
      "--window-size=393,852",
      `--virtual-time-budget=${budgetMs}`,
      "--dump-dom",
      url.toString(),
      // 제한 시간은 **기동 시간**을 감당해야 한다. 에뮬레이터·시뮬레이터·캡처가 함께 도는
      // 기계에서는 Chrome 이 뜨는 데만 20초가 넘어 「받은 길이 0」으로 끊겼다 (2026-09-09).
    ], Math.max(45000, budgetMs + 30000));
    return stdout;
  } finally {
    await rm(profile, { recursive: true, force: true });
  }
}

/**
 * `--dump-dom` 한 번. **DOM 을 다 받은 순간 프로세스를 죽인다.**
 *
 * ⚠️ 헤드리스 Chrome 은 DOM 을 다 뱉고도 끝나지 않는다 — macOS 에서
 * `CVDisplayLinkCreateWithCGDisplay failed` 를 반복하며 0% CPU 로 살아남는다.
 * `execFile` 로 종료를 기다리면 **모든 화면이 제한 시간(18초)을 꽉 채워** 이 묶음이
 * 30분을 넘겼다(2026-09-09 실측: 같은 묶음이 이 수정 뒤 몇 분으로 줄었다).
 * `</html>` 이 보이면 렌더가 끝난 것이므로 그 자리에서 끊는다.
 */
function dumpDomOnce(chrome, chromeArgs, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(chrome, chromeArgs, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let settled = false;
    const finish = (value, error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.kill("SIGKILL");
      if (error) reject(error);
      else resolve(value);
    };
    const timer = setTimeout(
      () => finish(null, new Error(
        `Chrome 이 ${timeoutMs}ms 안에 DOM 을 내놓지 않았다 (${chromeArgs[chromeArgs.length - 1]}, 받은 길이 ${out.length})`,
      )),
      timeoutMs,
    );
    child.stdout.on("data", (chunk) => {
      out += chunk;
      if (out.includes("</html>")) finish(out);
    });
    child.on("error", (error) => finish(null, error));
    child.on("close", () => finish(out));
  });
}

async function mapWithConcurrency(items, concurrency, task) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await task(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

// 화면에 실제로 그려진 것만 본다. Babel standalone 이 컴파일 결과를 #root 뒤 <script> 로도
// 심기 때문에, 원본 DOM 을 그대로 훑으면 "소스에 그 문자열이 있다"까지 통과해 버린다 —
// 목데이터를 지우고도 계약이 초록으로 남던 이유가 이것이었다.
function rootOf(dom) {
  const start = dom.indexOf('<div id="root">');
  assert.ok(start !== -1, "rendered root should exist");
  const end = dom.indexOf("<script", start);
  return end === -1 ? dom.slice(start) : dom.slice(start, end);
}

async function browserTests() {
  const chrome = await findChrome();
  if (!chrome) {
    if (process.env.MOYEO_REQUIRE_BROWSER_TESTS) {
      throw new Error("Chrome executable was not found for browser tests");
    }
    console.warn("[skip] Chrome executable was not found; browser smoke tests skipped.");
    return;
  }

  const server = await startServer();
  try {
    const domCache = new Map();
    const getDom = async (screen, theme = "dark", extra = {}) => {
      const key = JSON.stringify({ screen, theme, ...extra });
      if (!domCache.has(key)) {
        domCache.set(key, await dumpDom(chrome, server.baseUrl, { screen, theme, mockAuth: "1", ...extra }));
      }
      return domCache.get(key);
    };
    const renderCases = routes.flatMap((screen) => ["light", "dark"].map((theme) => ({ screen, theme })));
    // 병렬도를 환경변수로 낮출 수 있게 둔다. 이 머신에서 Chrome 이 4개 동시 실행에서
    // 매달리는 일이 있었다 (2026-09-07: SIGTRAP 뒤 프로필을 격리했더니 대신 멈췄다).
    // 기본값은 그대로 4 다 — 느린 머신에서만 `MOYEO_TEST_CONCURRENCY=2` 로 내린다.
    const renderConcurrency = Number(process.env.MOYEO_TEST_CONCURRENCY || 4);
    await mapWithConcurrency(renderCases, renderConcurrency, async ({ screen, theme }) => {
      const dom = await getDom(screen, theme);
      assert.ok(dom.includes("모여트립 in 경북 · Mobile Web"), `${screen}/${theme} should keep document title`);
      assert.ok(dom.includes("mw-root"), `${screen}/${theme} should render mobile web root`);
      assert.ok(!dom.includes("화면을 찾을 수 없어요"), `${screen}/${theme} should resolve to a screen`);
      assert.ok(dom.includes(`data-moyeo-theme="${theme}"`) || dom.includes(`data-moyeo-theme=${theme}`), `${screen}/${theme} should apply theme`);
    });

    const missingExpectedTexts = [];
    for (const [screen, snippets] of Object.entries(expectedTexts)) {
      const dom = rootOf(await getDom(screen, "dark"));
      for (const snippet of snippets) {
        if (!dom.includes(snippet)) missingExpectedTexts.push(`${screen}: ${snippet}`);
      }
    }
    assert.deepEqual(missingExpectedTexts, [], `browser text contracts drifted:\n${missingExpectedTexts.join("\n")}`);

    // 렌더된 화면에 화면기획 목데이터가 한 글자도 남지 않아야 한다 (docs/alignment/NO-MOCK-CANON.md).
    // 소스 grep 은 지워진 척을 잡지 못한다 — 실제로 그려진 것만 본다.
    const MOCK_MARKERS = [
      "주왕산", "주산지", "달기약수", "청송 시외버스터미널", "숲속여행자", "따스한 사슴",
      "우직한 곰", "엉뚱한 토끼", "잔잔한 거북이", "고요한 두루미", "호기심 많은 너구리",
      "울릉도 2박", "포항·영덕", "경주 감성", "경주 단풍", "안동 하회마을", "문경 새재",
      "영주 부석사", "감포", "36.435612", "45,000원", "1.0.4",
    ];
    const renderedMockHits = [];
    for (const screen of routes) {
      const rendered = rootOf(await getDom(screen, "dark"));
      for (const marker of MOCK_MARKERS) {
        if (rendered.includes(marker)) renderedMockHits.push(`${screen}: ${marker}`);
      }
    }
    assert.deepEqual(renderedMockHits, [], `목데이터가 화면에 다시 나타났다:\n${renderedMockHits.join("\n")}`);

    const bottomDom = await getDom("home", "dark", { scroll: "bottom" });
    assert.ok(bottomDom.includes("scroll=bottom") || bottomDom.includes("인기 코스 TOP 3"), "home bottom render should stay valid");

    const gatedDom = await dumpDom(chrome, server.baseUrl, { theme: "dark", mockAuth: "1" }, 12000);
    assertIncludes(gatedDom, ["고민 없이 고르는", "경북 코스", "다음"], "unauthenticated onboarding gate");

    // 캡처 회귀 — 캡처 라우트에서도 **목데이터가 나오면 안 된다.**
    // NOTE: --dump-dom 은 Babel standalone 이 <head> 에 심는 컴파일 결과까지 담아서 전체 문서 대상
    // 문자열 검사는 렌더 결과를 증명하지 못한다. 그래서 #root 서브트리로 범위를 좁혀서 본다.
    for (const theme of ["light", "dark"]) {
      // 12 검색 — 저장된 최근 검색어가 없으면 빈 상태다. 기획 목데이터를 끼워 넣지 않는다.
      const searchRoot = rootOf(await getDom("search", theme));
      assertIncludes(searchRoot, [
        'placeholder="어디로 떠나고 싶나요?"',
        "최근 검색어가 없어요.",
      ], `12 search empty state (${theme})`);
      assertExcludes(searchRoot, [
        "인기 검색어",
        "황리단길",
        'value="경주 단풍"',
      ], `12 search has no mock data (${theme})`);
      assertIncludes(rootOf(await getDom("settings", theme)), [
        "테마",
        "문의하기",
        "앱 평가하기",
        "오픈소스 라이선스",
      ], `29 settings rows (${theme})`);
      assertExcludes(rootOf(await getDom("settings", theme)), [
        "1.0.4",
      ], `29 settings shows the real version (${theme})`);
      assertIncludes(rootOf(await getDom("oss-licenses", theme)), [
        "오픈소스 라이선스",
        "모여트립은 아래 오픈소스 소프트웨어의 도움을 받아 만들었어요.",
        "사용 중인 오픈소스",
        "7개",
        "Firebase JavaScript SDK",
        "Apache-2.0",
        "Kakao Maps JavaScript SDK",
        "카카오 지도 SDK 이용약관",
        "오픈소스 라이선스가 아닌 자체 배포 SDK는 해당 사업자의 약관을 따라요.",
      ], `29-4 oss licenses (${theme})`);
      assertIncludes(rootOf(await getDom("oss-license-detail", theme)), [
        "라이선스 전문",
        "React",
        "18.3.1",
        "MIT",
        "원문 확인 · https://github.com/facebook/react",
        "Permission is hereby granted",
      ], `29-4a license text (${theme})`);
    }
    // 최근 검색어 섹션이 비면 제목·전체 삭제·칩 영역을 통째로 숨긴다 (기획에 빈 상태 문구가 없다).
    const emptyRecent = rootOf(await dumpDom(chrome, server.baseUrl, { screen: "search", theme: "light" }));
    assert.ok(!emptyRecent.includes("전체 삭제"), "empty recent searches must hide the whole section");
    assert.ok(emptyRecent.includes('placeholder="어디로 떠나고 싶나요?"'), "12 search must render a real input");

    const offlineDom = await getDom("login", "dark", { offline: "1" });
    assertIncludes(offlineDom, [
      "mw-offline-banner",
      "오프라인이에요 · 저장된 화면만 볼 수 있어요",
      'data-online="false"',
      'data-network-action="true"',
    ], "web offline contract");
  } finally {
    await server.close();
  }
}

// 최근 검색어 · 테마 3상태 · 앱 버전 — 서버가 없는 클라이언트 전용 로직
async function clientPrefsTests() {
  const source = await read("src/client-prefs.js");

  const createWindow = ({ search = "", stored = {}, systemDark = false } = {}) => {
    const values = new Map(Object.entries(stored));
    const themeListeners = [];
    const events = [];
    const documentElement = { dataset: {} };
    const window = {
      location: { search },
      document: { documentElement },
      localStorage: {
        getItem: (key) => (values.has(key) ? values.get(key) : null),
        setItem: (key, value) => values.set(key, String(value)),
        removeItem: (key) => values.delete(key),
      },
      matchMedia: (query) => ({
        matches: query.includes("dark") ? systemDark : false,
        addEventListener: (_type, handler) => themeListeners.push(handler),
        removeEventListener: () => {},
      }),
      dispatchEvent: (event) => events.push(event),
    };
    class CustomEvent {
      constructor(type, init = {}) { this.type = type; this.detail = init.detail; }
    }
    window.CustomEvent = CustomEvent;
    vm.runInNewContext(source, { window, URLSearchParams, JSON, Set, Array, Object, String, Boolean, Number });
    return {
      window,
      root: documentElement,
      values,
      events,
      setSystemDark(next) { systemDark = next; },
      fireSystemChange() { themeListeners.forEach((handler) => handler()); },
    };
  };

  // ── 최근 검색어: add · dedupe · limit 10 · remove · clear ──
  const search = createWindow();
  const store = search.window.MoyeoRecentSearches;
  assert.equal(store.KEY, "moyeo-trip-recent-searches");
  assert.equal(store.LIMIT, 10);
  assert.deepEqual(plain(store.read()), []);

  assert.deepEqual(plain(store.add("  경주  ")), ["경주"], "저장 전에 공백을 트림한다");
  assert.deepEqual(plain(store.add("   ")), ["경주"], "빈 문자열은 무시한다");
  assert.deepEqual(plain(store.add("")), ["경주"], "빈 문자열은 무시한다");
  assert.deepEqual(plain(store.add("단풍")), ["단풍", "경주"], "최신 검색어가 앞에 온다");
  assert.deepEqual(plain(store.add("경주")), ["경주", "단풍"], "중복은 최신순으로 끌어올린다");
  assert.deepEqual(
    JSON.parse(search.values.get("moyeo-trip-recent-searches")),
    ["경주", "단풍"],
    "localStorage 에 즉시 반영된다",
  );

  for (let index = 1; index <= 10; index += 1) store.add(`키워드${index}`);
  const filled = plain(store.read());
  assert.equal(filled.length, 10, "최대 10개까지만 남는다");
  assert.deepEqual(filled, ["키워드10", "키워드9", "키워드8", "키워드7", "키워드6", "키워드5", "키워드4", "키워드3", "키워드2", "키워드1"]);
  assert.ok(!filled.includes("경주"), "초과분은 오래된 것부터 버린다");

  assert.deepEqual(store.remove("키워드5").includes("키워드5"), false, "개별 삭제가 저장소에 반영된다");
  assert.equal(store.read().length, 9);
  assert.deepEqual(store.remove("없는 검색어").length, 9, "없는 값을 지우면 목록이 그대로다");
  assert.deepEqual(plain(store.clear()), [], "전체 삭제");
  assert.deepEqual(plain(store.read()), []);
  assert.equal(search.values.has("moyeo-trip-recent-searches"), false, "전체 삭제는 저장소 키를 지운다");

  // 손상된 저장값에도 화면이 죽지 않는다
  const broken = createWindow({ stored: { "moyeo-trip-recent-searches": "{ not json" } });
  assert.deepEqual(plain(broken.window.MoyeoRecentSearches.read()), []);
  const dirty = createWindow({ stored: { "moyeo-trip-recent-searches": JSON.stringify(["경주", 7, "", "경주", " 단풍 "]) } });
  assert.deepEqual(plain(dirty.window.MoyeoRecentSearches.read()), ["경주", "단풍"]);

  // ── 테마 3상태 해석 ──
  const fresh = createWindow({ systemDark: true });
  assert.equal(fresh.window.getMoyeoThemePreference(), "system", "저장값이 없으면 system");
  assert.equal(fresh.window.resolveMoyeoThemeMode("system"), "dark", "system 은 OS 값을 따른다");
  assert.equal(fresh.window.resolveMoyeoThemeMode("light"), "light");
  assert.equal(fresh.window.resolveMoyeoThemeMode("dark"), "dark");
  assert.equal(fresh.window.resolveMoyeoThemeMode("nonsense"), "dark", "알 수 없는 값은 system 취급");
  assert.equal(fresh.root.dataset.moyeoTheme, undefined, "모듈 로드만으로 DOM 을 건드리지 않는다");
  assert.equal(
    fresh.values.has("moyeo-trip-theme"),
    false,
    "최초 로드에서 시스템 값을 light/dark 로 저장해버리지 않는다",
  );

  // 기존에 저장된 light/dark 는 사용자의 명시적 선택으로 존중한다
  const explicitLight = createWindow({ stored: { "moyeo-trip-theme": "light" }, systemDark: true });
  assert.equal(explicitLight.window.getMoyeoThemePreference(), "light");
  assert.equal(explicitLight.window.getInitialMoyeoThemeMode(), "light");

  // 캡처의 강제 테마는 사용자 설정보다 우선하고 저장하지 않는다
  const forced = createWindow({ search: "?screen=settings&theme=dark", stored: { "moyeo-trip-theme": "light" } });
  assert.equal(forced.window.getForcedMoyeoTheme(), "dark");
  assert.equal(forced.window.getInitialMoyeoThemeMode(), "dark");
  assert.equal(forced.values.get("moyeo-trip-theme"), "light", "강제 테마는 사용자 설정을 덮어쓰지 않는다");

  // 시스템 기본 → 라이트 → 다크 → 시스템 기본 순환
  const cycling = createWindow({ systemDark: true });
  assert.equal(cycling.window.cycleMoyeoThemeMode("system"), "light");
  assert.equal(cycling.values.get("moyeo-trip-theme"), "light");
  assert.equal(cycling.root.dataset.moyeoTheme, "light");
  assert.equal(cycling.window.cycleMoyeoThemeMode("light"), "dark");
  assert.equal(cycling.root.dataset.moyeoTheme, "dark");
  assert.equal(cycling.window.cycleMoyeoThemeMode("dark"), "system");
  assert.equal(cycling.values.get("moyeo-trip-theme"), "system", "system 도 3상태로 저장된다");
  assert.equal(cycling.root.dataset.moyeoTheme, "dark", "system 이면 OS 값을 적용한다");
  assert.deepEqual(
    cycling.events.map((event) => event.type),
    ["moyeo:theme-mode", "moyeo:theme-mode", "moyeo:theme-mode"],
    "변경은 이벤트로 알려 화면이 즉시 반영한다",
  );

  // system 일 때 OS 설정이 런타임에 바뀌면 즉시 따라간다
  const watching = createWindow({ systemDark: false });
  const stop = watching.window.watchMoyeoThemeMode();
  assert.equal(watching.root.dataset.moyeoTheme, "light");
  watching.setSystemDark(true);
  watching.fireSystemChange();
  assert.equal(watching.root.dataset.moyeoTheme, "dark", "system 이면 OS 변경을 즉시 반영한다");
  watching.window.setMoyeoThemeMode("light");
  watching.setSystemDark(false);
  watching.fireSystemChange();
  assert.equal(watching.root.dataset.moyeoTheme, "light");
  watching.setSystemDark(true);
  watching.fireSystemChange();
  assert.equal(watching.root.dataset.moyeoTheme, "light", "명시적 선택은 OS 변경에 흔들리지 않는다");
  assert.equal(typeof stop, "function");
  stop();

  // ── 앱 버전 ──
  const packageJson = JSON.parse(await read("package.json"));
  assert.equal(
    fresh.window.MOYEO_APP_VERSION,
    packageJson.version,
    "client-prefs 의 앱 버전은 package.json 의 version 과 같아야 한다",
  );
  assert.equal(fresh.window.MoyeoAppVersion.label(), packageJson.version, "실행 중에는 '(최신)' 을 붙이지 않는다");
  assert.equal(fresh.window.MoyeoAppVersion.dialogBody(), `현재 설치된 버전은 ${packageJson.version}이에요.`);

  // 캡처 모드에서도 실제 배포 버전이다 — 스크린샷이 있지도 않은 버전(1.0.4)을 말하면 안 된다.
  const captureVersion = createWindow();
  captureVersion.window.MoyeoApi = { deterministicParams: () => true };
  assert.equal(captureVersion.window.MoyeoAppVersion.label(), packageJson.version, "캡처에서도 실제 버전이다");
  assert.equal(
    captureVersion.window.MoyeoAppVersion.dialogBody(),
    `현재 설치된 버전은 ${packageJson.version}이에요.`,
  );
}

// 29-4 · 29-4a 데이터는 워크스페이스 정본(docs/oss/oss-licenses.json)의 web 항목과 같아야 한다
async function ossLicenseTests() {
  const source = await read("src/oss-licenses.js");
  const window = {
    location: { search: "" },
    sessionStorage: {
      values: new Map(),
      getItem(key) { return this.values.has(key) ? this.values.get(key) : null; },
      setItem(key, value) { this.values.set(key, String(value)); },
      removeItem(key) { this.values.delete(key); },
    },
  };
  vm.runInNewContext(source, { window, URLSearchParams, Object, String, Array });
  const oss = window.MoyeoOssLicenses;

  assert.equal(oss.items.length, 7, "웹 플랫폼 항목은 7건이다 (changeLog17)");
  assert.deepEqual(plain(oss.items.map((item) => item.name)), [
    "React",
    "React DOM",
    "Babel Standalone",
    "Firebase JavaScript SDK",
    "Sentry JavaScript SDK",
    "Kakao JavaScript SDK",
    "Kakao Maps JavaScript SDK",
  ]);
  // 라이선스 식별자는 추정하지 않는다 — 카카오 SDK 는 오픈소스가 아니고 전문도 없다
  const kakaoMaps = oss.findItem("Kakao Maps JavaScript SDK");
  assert.equal(kakaoMaps.license, "카카오 지도 SDK 이용약관");
  assert.equal(oss.licenseText(kakaoMaps), null, "전문이 없는 자체 배포 SDK는 전문을 지어내지 않는다");
  assert.ok(kakaoMaps.note.includes("카카오 자체 배포 약관"));

  const firebase = oss.findItem("Firebase JavaScript SDK");
  assert.equal(firebase.license, "Apache-2.0");
  assert.ok(oss.licenseText(firebase).includes("Apache License"));
  assert.ok(oss.licenseText(firebase).includes("Version 2.0, January 2004"));
  assert.ok(oss.licenseText(oss.findItem("React")).startsWith("Permission is hereby granted"));
  // MIT 전문은 저작권 줄이 빠진 본문 템플릿이다 (저작권 표기를 지어내지 않는다)
  assert.ok(!oss.licenseText(oss.findItem("React")).includes("Copyright (c)"));

  assert.equal(oss.selected().name, "React", "선택이 없으면 목록의 첫 항목 (결정적)");
  oss.select("Sentry JavaScript SDK");
  assert.equal(oss.selected().name, "Sentry JavaScript SDK");
  window.location.search = "?screen=oss-license-detail&ossLicense=Alamofire";
  assert.equal(oss.selected().name, "React", "다른 플랫폼 항목을 요구하면 첫 항목으로 폴백한다");
  window.location.search = "?ossLicense=Babel%20Standalone";
  assert.equal(oss.selected().name, "Babel Standalone", "딥링크 쿼리가 sessionStorage 보다 우선");

  // 정본과 다르면 실패한다 — 화면 데이터가 조용히 낡는 것을 막는다
  const canonPath = path.resolve(root, "..", "docs", "oss", "oss-licenses.json");
  let canon = null;
  try {
    canon = JSON.parse(await readFile(canonPath, "utf8"));
  } catch {
    console.warn("[skip] docs/oss/oss-licenses.json 을 찾지 못해 정본 대조를 건너뜁니다.");
  }
  if (canon) {
    assert.deepEqual(
      plain(oss.items.map(({ name, version, license, licenseTextId, url }) => ({ name, version, license, licenseTextId: licenseTextId || null, url }))),
      canon.platforms.web.map(({ name, version, license, licenseTextId, url }) => ({ name, version, license, licenseTextId: licenseTextId || null, url })),
      "src/oss-licenses.js 는 docs/oss/oss-licenses.json 의 web 항목과 같아야 한다",
    );
    assert.equal(oss.updatedAt, canon.updatedAt);
  }
}

async function main() {
  await staticTests();
  await clientPrefsTests();
  await ossLicenseTests();
  await authContractTests();
  await tabCacheTests();
  await moyeoApiContractTests();
  await pushContractTests();
  await tourismContractTests();
  if (!process.env.MOYEO_SKIP_BROWSER_TESTS) {
    await browserTests();
  }
  console.log("Mobile web tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
