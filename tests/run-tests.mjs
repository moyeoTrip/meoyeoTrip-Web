import assert from "node:assert/strict";
import { createServer } from "node:http";
import { access, readFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import vm from "node:vm";

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const routes = [
  "splash",
  "onboarding",
  "login",
  "email-auth",
  "nickname",
  "profile-image",
  "profile-basic",
  "terms",
  "home",
  "explore",
  "explore-map",
  "search",
  "notifications",
  "course",
  "trip",
  "apply",
  "create",
  "custom-course",
  "create-schedule",
  "create-people",
  "create-detail",
  "create-meet",
  "create-summary",
  "create-summary-linked",
  "course-edit",
  "course-edit-linked",
  "course-edit-locked",
  "meetings",
  "chat-list",
  "chat-list-applied",
  "chat",
  "chat-menu",
  "chat-attach",
  "notice-history",
  "leave-alert",
  "messages",
  "feed",
  "feed-detail",
  "feed-write",
  "profile",
  "my",
  "dex",
  "profile-edit",
  "settings",
  "auth-methods",
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
  home: ["모여트립 in 경북", "이번 주말, 어디로 떠나볼까요?", "인기 코스 TOP 3", "영주 부석사 눈꽃 산책"],
  explore: ["탐색", "어디로 떠나고 싶나요?", "주왕산 & 주산지 힐링 트레킹", "울진 금강송 숲길 워크"],
  "explore-map": ["탐색", "경북"],
  meetings: ["모임", "진행중", "확정", "종료", "울릉도 2박 3일 섬 여행"],
  feed: ["피드", "여행 기록", "울진 금강송 숲길에서 쉬어간 오후"],
  my: ["내 여행", "진행중", "지난여행", "찜한 코스", "영주 부석사 눈꽃 산책"],
  login: ["모여트립에 오신 걸", "환영해요", "카카오 로그인", "이메일로 시작하기", "Google로 계속하기", "Apple로 계속하기"],
  "email-auth": ["이메일로 시작하기", "로그인", "새 계정 만들기", "비밀번호", "비밀번호를 잊으셨나요?"],
  nickname: ["프로필 설정", "어떤 친구로", "시작할까요?", "다른 이름 추천받기", "마음에 들 때까지 새 후보를 받아보세요"],
  "profile-image": ["프로필 설정", "내 친구를 골라주세요", "새 후보 만들기", "이 친구로 시작하기"],
  "profile-basic": ["프로필 설정", "생년월일", "성별", "1998년 4월 12일"],
  terms: ["약관", "동의"],
  splash: ["모여트립 in 경북"],
  "feed-write": ["글쓰기", "여행 기록"],
  "feed-detail": ["피드", "댓글"],
  notifications: ["알림", "울진 금강송 숲길 워크", "영주 부석사 눈꽃 산책"],
  search: ["최근 검색어", "청송 얼음골", "추천 검색 결과", "청송 주왕산 물안개 코스"],
  course: ["코스 일정", "용연폭포 쉼터", "함께 보면 좋은 곳"],
  profile: ["최근 여행 (8)", "울진 금강송 숲길", "영주 부석사 눈꽃"],
  "auth-methods": ["로그인 방식", "카카오", "Google", "이메일", "Apple"],
  create: ["모집 만들기 (1/5)", "코스 선택", "등록된 코스로 떠나기", "코스 직접 만들기", "이 코스로 다음"],
  "custom-course": ["코스 직접 만들기", "방문지 검색", "최소 2개 · 최대 20개", "여행이 확정되기 전까지"],
  "create-schedule": ["모집 만들기 (2/5)", "일정 정하기", "당일치기", "1박 이상", "집합 장소 · 집합 시간", "이전", "다음"],
  "create-people": ["모집 만들기 (3/5)", "몇 명이 모이면 좋을까요?", "최소 인원", "최대 인원", "성별 제한", "이전", "다음"],
  "create-detail": ["모집 만들기 (4/5)", "어떤 여행인지 알려주세요", "여행명", "신청 승인 방식", "이전", "다음"],
  "create-meet": ["모집 만들기 (4/5)", "집합 장소 정하기", "검색하거나 지도의 핀을 움직여 정확한 위치를 알려주세요.", "터미널 정문 앞", "2번 출구", "주차장 입구", "좌표 (자동 저장)", "집합 시간", "근처 모집 추천", "이전", "다음"],
  "create-summary": ["모집 만들기 (5/5)", "이대로 모집을 열까요?", "호스트 직접 코스", "여행이 확정되기 전까지", "이전", "모집 열기"],
  "create-summary-linked": ["모집 만들기 (5/5)", "이대로 모집을 열까요?", "등록된 코스", "경로(방문지·순서)는 수정할 수 없고", "이전", "모집 열기"],
  "course-edit": ["여행 경로", "마감 전까지 경로를 바꿀 수 있어요", "저장하고 멤버에게 알리기"],
  "course-edit-linked": ["여행 경로", "등록된 코스라 경로는 고정이에요", "집합 정보 수정"],
  "course-edit-locked": ["여행 경로", "여행이 확정돼 경로가 잠겼어요", "공지로 알리기"],
  "notice-history": ["공지 이력", "상단 고정 중", "지난 공지", "새 공지 작성 (호스트)"],
  "chat-list-applied": ["신청중", "승인 대기", "대기열 2번", "신청 취소"],
  chat: ["당일치기", "공지 4개", "경로 수정", "호스트가 경로를 수정했어요"],
  "leave-alert": ["호스트가 나가면", "이 모임은 종료돼요", "모임 종료"],
  "chat-menu": ["모임 정보", "동행자", "공지", "공유된 항목"],
  "chat-attach": ["무엇을 공유할까요?", "사진", "장소", "지도", "투표"],
  friends: ["친구 관리", "내 친구", "받은 신청", "보낸 신청"],
  "trip-message": ["함께 걸어준 친구들에게", "한 줄 남겨볼까요?", "도감 카드"],
  report: ["신고하기", "신고 사유", "차단"],
  blocked: ["차단한 사용자", "차단 해제"],
  "course-publish": ["코스 공개", "한 번 공개하면", "코스 공개하기"],
  "trip-confirmed": ["여행이 확정됐어요!", "확정된 여행", "채팅방으로 가기"],
  "trip-day": ["여행 중", "현재 방문지", "위치 공유"],
  "notif-detail": ["채팅 알림", "방해금지", "멘션·답글만"],
  "account-delete": ["계정 탈퇴", "30일", "탈퇴"],
  "system-maintenance": ["잠시 점검 중이에요", "다시 확인"],
  "system-error": ["무언가 살짝", "잘못됐어요", "새로고침"],
  "feed-comments": ["댓글", "함께 간 친구", "댓글을 남겨주세요"],
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
  "celebration/trip-confirmed-light.png",
  "celebration/trip-confirmed-dark.png",
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

function assertIncludes(source, snippets, label) {
  for (const snippet of snippets) {
    assert.ok(source.includes(snippet), `${label} should include ${snippet}`);
  }
}

function assertScriptOrder(html) {
  const expected = [
    "src/tokens.jsx",
    "src/shared.jsx",
    "src/cached-image.jsx",
    "src/auth-api.jsx",
    "src/screens-onboarding.jsx",
    "src/screens-home.jsx",
    "src/screens-chat.jsx",
    "src/screens-system.jsx",
    "src/screens-extra.jsx",
    "src/screens-extra2.jsx",
    "src/screens-refined.jsx",
    "src/screens-additions.jsx",
    "src/screens-additions2.jsx",
    "src/screens-additions3.jsx",
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
  ]);

  const [html, mobileApp, refined, additions, additions2, additions3, shared, cachedImage, prototype, onboarding, authApi, extra, extra2, readme, standaloneWorkflow, devServer, observability] = await Promise.all([
    read("index.html"),
    read("src/mobile-app.jsx"),
    read("src/screens-refined.jsx"),
    read("src/screens-additions.jsx"),
    read("src/screens-additions2.jsx"),
    read("src/screens-additions3.jsx"),
    read("src/shared.jsx"),
    read("src/cached-image.jsx"),
    read("src/prototype.jsx"),
    read("src/screens-onboarding.jsx"),
    read("src/auth-api.jsx"),
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
    "meeting-map-pin",
    "meeting-latitude",
    "meeting-longitude",
    "tourapi-place-search",
    "custom-course-count",
    "move-stop-up-",
    "move-stop-down-",
    "stops.length >= 20",
    "notice-composer",
    "notice-title",
    "notice-body",
    "create-summary-${resolvedSource}",
    "course-edit-${mode}",
    "window.__moyeoCourseSource || 'custom'",
    "nav.go('create-people')",
    "nav.go((window.__moyeoCourseSource || 'custom') === 'linked' ? 'create-summary-linked' : 'create-summary')",
  ], "changeLog01 additions");
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
    "trip-confirmed-light.png",
    "trip-confirmed-dark.png",
    "function ScreenTripDay",
    "function ScreenNotifDetail",
    "function ScreenAccountDelete",
    "function ScreenFeedComments",
  ], "changeLog04 additions");
  assertIncludes(refined, [
    "data-testid={`course-source-${id}`}",
    "등록된 코스는 방문지와 순서가 고정돼요",
    "최소 2개 · 최대 20개",
    "36.435612, 129.057214",
    "chat-notice-history",
    "chat-course-edit",
    "호스트가 경로를 수정했어요",
  ], "changeLog01 refined screens");
  assert.ok(!refined.includes("'추천시기','봄-가을'"), "course detail must remove recommendation season metric");
  assertIncludes(extra, [
    "host-course-edit",
    "data-testid={`meeting-tab-${id}`}",
    "data-testid={`application-${item.id}`}",
    "id: 'waiting'",
    "id: 'queued'",
    "신청 상태에서는 아직 채팅방에 들어갈 수 없어요",
    "function ScreenChatListApplied",
    "호스트가 나가면<br/>이 모임은 종료돼요",
  ], "changeLog01 extra screens");
  assertIncludes(prototype, [
    "'chat-list-applied': window.ScreenChatListApplied",
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
  assertIncludes(devServer, [
    "runtime-config.local.js",
    "FIREBASE_WEB_API_KEY",
    "KAKAO_JAVASCRIPT_KEY",
    "KAKAO_REDIRECT_URI",
    "http.server",
  ], "development server");
  assertIncludes(html, ["react@18.3.1", "@babel/standalone", "firebasejs/12.16.0", "firebase-auth-compat", "kakao_js_sdk/2.8.1", "runtime-config.js", "LINE Seed Sans KR", "LINESeedKR-Rg.woff2", "LINESeedKR-Bd.woff2", "assets/vendor/lucide.js", "observability.js"], "index.html");
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
    "return { route: 'onboarding' };",
  ], "auth-api.jsx");
  assert.ok(!authApi.includes("/api/v1/auth/login/${"), "auth login must not use provider-specific URLs");
  assert.ok(!authApi.includes("/api/v1/auth/signup/${"), "auth signup must not use provider-specific URLs");
  assertIncludes(extra, [
    "auth-login-${provider}",
    "auth-login-welcome-image",
    "assets/login-welcome.webp",
    "assets/login-welcome-night.webp",
    "fetchPriority=\"high\"",
    "provider=\"kakao\"",
    "provider=\"email\"",
    "provider=\"google\"",
    "provider=\"apple\"",
    "ScreenEmailAuth",
    "email-auth-password-confirmation",
    "비밀번호가 서로 같지 않아요",
    "resetEmailPassword",
    "회원 생성 중",
    "MoyeoAuth.signup",
    "KoreanBirthDatePicker",
    "auth-birth-date-dialog",
    "연도 · 월 · 일 순서",
  ], "auth screens");
  assertIncludes(html, ["scrollbar-width: none", "::-webkit-scrollbar", "box-sizing: border-box"], "index CSS");

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
    "leave: 'leave-alert'",
  ], "direct route aliases");
  assertIncludes(additions2, ["nav.go('leave-alert')"], "leave alert entry point");
  assert.ok(!additions2.includes("nav.go('leave')"), "leave action must not target a missing route");
  assertIncludes(mobileApp, [
    "getInitialTheme",
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
    "current={7}",
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
    "새 후보를 하나씩 추가",
    "이전 후보는 그대로 보관",
    "새 후보 만들기",
    "나갔다 돌아와도 후보는 다시 불러와요",
    "profile-image-generating",
    "닉네임에서 여행 친구의 분위기를 찾고 있어요",
    "다른 화면으로 이동해도 완성된 후보는 서버에 보관돼요",
  ], "nickname candidate refresh flow");
  assertIncludes(refined, [
    "title=\"마이\"",
    "name=\"settings\"",
    "my-profile-summary",
    "my-profile-stats",
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
  }
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
  const createWindow = ({ search = "", fetchImpl = fetch, mock = false } = {}) => {
    const localStorage = makeStorage();
    const sessionStorage = makeStorage();
    const window = {
      location: { search, origin: "https://web.example", pathname: "/app/", href: `https://web.example/app/${search}` },
      setTimeout,
      clearTimeout,
      localStorage,
      sessionStorage,
      MOYEO_MOCK_IDENTITY: mock,
      MOYEO_MOCK_AUTH_BACKEND: mock,
      AbortController,
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

async function dumpDom(chrome, baseUrl, params) {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const { stdout } = await run(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--hide-scrollbars",
    "--window-size=393,852",
    "--virtual-time-budget=5200",
    "--dump-dom",
    url.toString(),
  ], { timeout: 18000, maxBuffer: 12 * 1024 * 1024 });
  return stdout;
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
    await mapWithConcurrency(renderCases, 4, async ({ screen, theme }) => {
      const dom = await getDom(screen, theme);
      assert.ok(dom.includes("모여트립 in 경북 · Mobile Web"), `${screen}/${theme} should keep document title`);
      assert.ok(dom.includes("mw-root"), `${screen}/${theme} should render mobile web root`);
      assert.ok(!dom.includes("화면을 찾을 수 없어요"), `${screen}/${theme} should resolve to a screen`);
      assert.ok(dom.includes(`data-moyeo-theme="${theme}"`) || dom.includes(`data-moyeo-theme=${theme}`), `${screen}/${theme} should apply theme`);
    });

    const missingExpectedTexts = [];
    for (const [screen, snippets] of Object.entries(expectedTexts)) {
      const dom = await getDom(screen, "dark");
      for (const snippet of snippets) {
        if (!dom.includes(snippet)) missingExpectedTexts.push(`${screen}: ${snippet}`);
      }
    }
    assert.deepEqual(missingExpectedTexts, [], `browser text contracts drifted:\n${missingExpectedTexts.join("\n")}`);

    const bottomDom = await getDom("home", "dark", { scroll: "bottom" });
    assert.ok(bottomDom.includes("scroll=bottom") || bottomDom.includes("인기 코스 TOP 3"), "home bottom render should stay valid");

    const gatedDom = await dumpDom(chrome, server.baseUrl, { theme: "dark", mockAuth: "1" });
    assertIncludes(gatedDom, ["고민 없이 고르는", "경북 코스", "다음"], "unauthenticated onboarding gate");

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

async function main() {
  await staticTests();
  await authContractTests();
  if (!process.env.MOYEO_SKIP_BROWSER_TESTS) {
    await browserTests();
  }
  console.log("Mobile web tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
