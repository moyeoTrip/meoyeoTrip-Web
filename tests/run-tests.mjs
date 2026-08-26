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
  "notifications",
  "removal-reason",
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
  "course-edit-custom",
  "meetings",
  "chat-list",
  "chat-list-applied",
  "chat",
  "chat-menu",
  "member-actions",
  "member-remove",
  "chat-attach",
  "notice-history",
  "leave-alert",
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
  home: ["모여트립 in 경북", "이번 주말, 어디로 떠나볼까요?", "인기 코스 TOP 3", "영주 부석사 눈꽃 산책"],
  explore: ["탐색", "어디로 떠나고 싶나요?", "주왕산 & 주산지 힐링 트레킹", "울진 금강송 숲길 워크"],
  "explore-map": ["탐색", "경북"],
  meetings: ["모임", "진행중", "확정", "종료", "울릉도 2박 3일 섬 여행"],
  feed: ["피드", "여행 기록", "울릉도는 천천히 움직여야 보여요"],
  // 기획 26의 activeTrips는 4건이고 slice가 없다 — 진행중 목록은 포항·영덕이 마지막이다
  my: ["내 여행", "4개", "진행중", "지난여행", "찜한 코스", "모여트립이", "자연 속에서 힐링하는 걸 좋아해요!", "포항·영덕 동해 드라이브"],
  login: ["모여트립에 오신 걸", "환영해요", "카카오 로그인", "이메일로 시작하기", "Google로 계속하기", "Apple로 계속하기"],
  "email-auth": ["이메일로 시작하기", "로그인", "새 계정 만들기", "비밀번호", "비밀번호를 잊으셨나요?"],
  nickname: ["프로필 설정", "어떤 친구로", "시작할까요?", "다른 이름 추천받기", "마음에 들 때까지 새 후보를 받아보세요"],
  "profile-image": ["프로필 설정", "내 친구를 골라주세요", "새 후보 만들기", "이 친구로 시작하기"],
  "profile-basic": ["프로필 설정", "생년월일", "성별", "1998년 4월 12일", "저장하고 다음"],
  "prof-4": ["프로필 설정", "7/8", "어떤 여행을 좋아하세요?", "여행 스타일", "관심 지역", "저장하고 프로필 만들기"],
  "profile-edit": ["프로필 수정", "여행 취향", "탭해서 바로 수정", "여행 스타일", "관심 지역"],
  "profile-taste-edit": ["여행 취향 편집", "여행 스타일과 관심 지역은 함께 저장돼요.", "취소", "저장"],
  terms: ["약관", "동의"],
  "terms-detail": ["이용약관", "필수", "동의하고 돌아가기", "최소 인원(3명)", "제6조 (계정과 닉네임)"],
  "terms-privacy": ["개인정보 처리방침", "필수", "보관 기간", "동의하고 돌아가기"],
  "terms-location": ["위치정보 이용 동의", "선택", "이 항목에 동의하기"],
  "terms-marketing": ["마케팅 정보 수신 동의", "선택", "이 항목에 동의하기"],
  "terms-settings": ["이용약관", "필수", "이전 판본"],
  "place-search": ["방문지 검색", "관광지", "주왕산국립공원", "코스에 반영"],
  "place-detail": ["달기약수터 백숙거리", "우편번호 37411", "메뉴판 4", "이 장소를 코스에 담기"],
  splash: ["모여트립 in 경북"],
  "onb-1": ["온보딩", "1/8", "고민 없이 고르는", "경북 코스"],
  "onb-2": ["온보딩", "2/8", "3명이 모이면", "채팅방이 열려요"],
  "onb-3": ["온보딩", "3/8", "여행 뒤엔", "자연스럽게 친구로"],
  "feed-write": ["피드 글쓰기", "STEP 3"],
  "feed-write-1": ["피드 글쓰기", "STEP 1 · 코스 확인", "기록할 코스", "경로 (자동)"],
  "feed-write-2": ["피드 글쓰기", "STEP 2 · 사진 선택", "대표", "사진 추가"],
  "feed-write-3": ["피드 글쓰기", "STEP 3 · 사진 & 메모", "여행 어땠어요?"],
  "feed-write-4": ["피드 글쓰기", "STEP 4 · 공개 설정", "공개 범위", "친구만"],
  "feed-write-5": ["피드 글쓰기", "STEP 5 · 최종 확인", "게시하기"],
  "feed-detail": ["피드", "댓글"],
  notifications: ["알림", "여행이 확정됐어요 🎉", "경주 단풍·야경", "친구 요청", "감포 바다 일출 모임", "사유 확인"],
  "removal-reason": ["내보내기 안내", "호스트가 남긴 사유", "내보내진 뒤에는", "호스트 결정", "이미 남긴 대화는 모임 채팅방에 그대로 남아요"],
  "member-actions": ["친구 요청하기", "내보내기", "내보내기는 호스트에게만 보여요", "호기심 많은 너구리 9027"],
  "member-remove": ["멤버 내보내기", "내보내는 사유", "호기심 많은 너구리 9027", "0/200", "취소", "내보내기", "이미 남긴 대화는 채팅방에 그대로 남아요"],
  // 추천 검색 결과 섹션은 화면기획에 없어 삭제했고, 인기 검색어는 5개로 제한한다
  search: ["최근 검색어", "인기 검색어", "주왕산", "문경 새재"],
  course: ["코스 상세", "숲속여행자 님이 다녀온 코스", "여행자 코스", "코스 미리보기"],
  // 기획 25는 커버·이름·지표 3칸·소개·메뉴 3줄로 끝난다 — "최근 여행" 섹션은 기획에 없어 삭제했다
  // 25 는 프로필 카드다. 관리 진입점(차단한 사용자 등)은 마이로 옮겼다.
  // DM 기획이 없어 프로필 카드에는 "메시지" 버튼을 두지 않는다.
  profile: ["프로필", "우직한 곰 7821", "회 동행", "매너", "뒤집기", "친구 신청"],
  "profile-back": ["카드 뒷면", "동행자들이 준 평균", "함께한 여행", "다른 여행자들이 남긴 평가"],
  "auth-methods": ["로그인 방식", "카카오", "Google", "이메일", "Apple"],
  create: ["모집 만들기 (1/5)", "코스 선택", "등록된 코스로 떠나기", "코스 직접 만들기", "이 코스로 다음"],
  "custom-course": ["코스 직접 만들기", "방문지 검색", "최소 2개 · 최대 20개", "여행이 확정되기 전까지"],
  "create-schedule": ["모집 만들기 (2/5)", "일정 정하기", "당일치기", "1박 이상", "집합 장소 · 집합 시간", "이전", "다음"],
  "create-people": ["모집 만들기 (3/5)", "몇 명이 모이면 좋을까요?", "최소 인원", "최대 인원", "20~100세", "성별 제한", "이전", "다음"],
  "create-detail": ["모집 만들기 (4/5)", "어떤 여행인지 알려주세요", "모집 이름 (채팅방 이름)", "주왕산 &amp; 주산지 힐링 트레킹", "신청 승인 방식", "이전", "다음"],
  "create-meet": ["모집 만들기 (2/5)", "집합 장소 정하기", "검색하거나 지도의 핀을 움직여 정확한 위치를 알려주세요.", "상세 안내", "터미널 정문 앞", "좌표 (자동 저장)", "집합 시간", "근처 모집 추천", "이전", "이 위치로 지정"],
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
  "trip-day": ["여행 중", "현재 방문지", "다음 일정"],
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

function assertScriptOrder(html) {
  const expected = [
    "src/tokens.jsx",
    "src/shared.jsx",
    "src/cached-image.jsx",
    "src/push-notifications.js",
    "src/auth-api.jsx",
    "src/tourism-api.js",
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
    "src/screens-additions4.jsx",
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

  const [html, mobileApp, refined, additions, additions2, additions3, additions4, shared, cachedImage, pushNotifications, serviceWorker, prototype, onboarding, authApi, tourismApi, extra, extra2, readme, standaloneWorkflow, devServer, observability] = await Promise.all([
    read("index.html"),
    read("src/mobile-app.jsx"),
    read("src/screens-refined.jsx"),
    read("src/screens-additions.jsx"),
    read("src/screens-additions2.jsx"),
    read("src/screens-additions3.jsx"),
    read("src/screens-additions4.jsx"),
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
    "삭제되는 정보와 30일 복구 대기 정책을 확인했어요.",
    "disabled={!reason || !deleteAcknowledged}",
    "function ScreenFeedComments",
  ], "changeLog04 additions");
  assertIncludes(additions4, [
    "function ScreenPlaceSearch",
    "function ScreenPlaceDetail",
    "function ScreenTermsDetail",
    "doc=\"marketing\"",
    "from=\"settings\"",
    "current.postalCode",
    "메뉴판 탭은 음식점 콘텐츠에서만",
  ], "changeLog06-07 additions");
  assertIncludes(additions2, ["모집 이름 (채팅방 이름)", "20~100세", "1인 45,000원", "마감 D-3"], "changeLog06 recruitment details");
  assertIncludes(extra, ["terms-open-${itemKey}", "detailRoute=\"terms-detail\"", "detailRoute=\"terms-marketing\""], "terms row entry separation");
  assertIncludes(extra2, ["privacy-settings", "terms-settings"], "settings terms entries");
  assertIncludes(prototype, ["'place-search': window.ScreenPlaceSearch", "'terms-marketing': window.ScreenTermsMarketing"], "changeLog06-07 routes");
  assertIncludes(mobileApp, ["'onb-1': 'onboarding'", "'place-detail': 'place-detail'", "'terms-settings': 'terms-settings'"], "design artboard route aliases");
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
  assertIncludes(refined, [
    "숲속여행자 님이 다녀온 코스",
    "2026.05.25 여행 후 공개 · 이 코스로 떠난 모임 3",
    "여행자 코스",
  ], "course detail source attribution");
  assert.ok(!refined.includes("<div style={{ fontSize: 15, fontWeight: 900, marginTop: 24, marginBottom: 10 }}>코스 일정</div>"), "course detail must not duplicate the itinerary already represented by the route preview");
  assert.ok(!refined.includes("<div style={{ fontSize: 15, fontWeight: 900, marginTop: 24, marginBottom: 10 }}>함께 보면 좋은 곳</div>"), "course detail must not add planning-only nearby recommendations");
  assert.ok(!refined.includes("영주 부석사 눈길은 조용해서 더 좋았어요"), "feed mock data must stay aligned with the six planning feed cards");
  assert.ok(!refined.includes("울진 금강송 숲길에서 쉬어간 오후"), "feed mock data must stay aligned with the six planning feed cards");
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
  ], "auth-api.jsx");
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
    "usesDeterministicSamples",
  ], "tourism API client");
  assertIncludes(additions4, [
    "window.MoyeoTourism.list({ keyword, contentTypeId: typeFilter, size: 30 })",
    "window.MoyeoTourism.detail(selectedId)",
    "예시 장소를 대신 보여드려요",
    "예시 상세를 대신 보여드려요",
    "PlaceImage",
    // TourAPI 원본 이미지 호스트는 CORS 를 안 줘서 CachedImage(fetch) 로는 못 읽는다
    "function RemotePlaceImage",
  ], "live tourism screens");
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
    "1.0.4 (최신)",
  ], "client-only preferences");
  assert.ok(
    !tokens.includes("localStorage?.setItem(MOYEO_THEME_STORAGE_KEY"),
    "tokens.jsx must not persist the resolved system theme (that bug locked the app out of OS changes)",
  );
  assertIncludes(tokens, ["window.applyMoyeoTheme(window.getInitialMoyeoThemeMode())"], "theme applied before first paint");
  assertIncludes(extra, [
    "SEARCH_CAPTURE_RECENT",
    "MoyeoRecentSearches",
    "data-testid=\"search-input\"",
    "data-testid=\"search-submit\"",
    "data-testid=\"search-clear\"",
    "data-testid=\"search-recent-clear\"",
    "window.MoyeoApi.searchRooms({ keyword })",
    "window.MOYEO_EXPLORE_ROOMS",
    "window.ExploreRoomCard",
  ], "12 search is interactive");
  assert.ok(!extra.includes("<div style={{ fontSize: 14, color: T.text900 }}>경주 단풍</div>"), "12 search must not keep the static search field");
  assertIncludes(refined, ["MOYEO_EXPLORE_ROOMS", "function ExploreRoomCard", "function ExploreServerRoomCard"], "explore cards are reusable");
  assertIncludes(extra2, [
    "testId=\"settings-theme\"",
    "testId=\"settings-version\"",
    "testId=\"settings-contact\"",
    "testId=\"settings-rate\"",
    "testId=\"settings-oss-licenses\"",
    "채팅, 모집, 결제 문의를 남기는 고객센터로 이어져요.",
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
  assertIncludes(additions2, [
    "MoyeoApi.shareRoomImage(roomId, file)",
    "MoyeoApi.shareRoomTourismContent(roomId, contentId)",
    "MoyeoApi.shareRoomLocation(roomId)",
    "chat-attach-image-input",
    "MoyeoApi.roomNotificationSetting(roomId)",
    "MoyeoApi.updateRoomNotificationSetting(roomId, next)",
    "chat-menu-room-alarm",
    "MoyeoApi.roomCompanions(roomId)",
    "MoyeoApi.kickRoomMember(roomId, member.userId, reason)",
    "MoyeoApi.reviewCompanion(roomId, item.userId",
    "companion-review-",
  ], "20-2 첨부 전송 · 20-1 방별 알림 · 27-1 동행자");
  // 투표 개최·정산 메모는 입력 화면이 화면기획에 없어 카드 스펙 보드로 남긴다 (새 화면을 만들지 않는다).
  assert.ok(
    additions2.includes("사진: () => fileInputRef.current?.click()")
      && !additions2.includes("createRoomPoll(")
      && !additions2.includes("shareRoomSettlementMemo("),
    "투표·정산은 기획에 입력 자리가 없어 화면에서 호출하지 않는다",
  );
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

  // ── 캡처 라우트 판정은 그대로다 (약화 금지) ──
  window.location.search = "?mockAuth=1";
  assert.equal(tourism.usesDeterministicSamples(), true);
  window.location.search = "?screen=place-search";
  assert.equal(tourism.usesDeterministicSamples(), true);
  window.location.search = "?route=place-detail";
  assert.equal(tourism.usesDeterministicSamples(), true);
  window.location.search = "?capture=1";
  assert.equal(tourism.usesDeterministicSamples(), true);
  window.location.search = "?uitest=1";
  assert.equal(tourism.usesDeterministicSamples(), true);
  window.location.search = "?screen=place-search&liveData=1";
  assert.equal(tourism.usesDeterministicSamples(), false, "liveData=1 은 개발자용 예외");
  window.location.search = "";
  assert.equal(tourism.usesDeterministicSamples(), false);
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
  assert.equal(api.meetingText(rooms[0]), "08:30 안동역 1번 출구 앞");
  assert.equal(rooms[1].recruitmentDDay, 0, "D-0 은 null 이 아니다");

  // 좌표가 한쪽만 있으면 마커에서 제외한다.
  assert.equal(rooms[1].meetingCoord, null);
  assert.equal(rooms[1].meetingLongitude, null);
  const markers = api.roomMarkers(rooms);
  assert.equal(markers.length, 2, "좌표가 한쪽만 있는 항목은 마커에서 빠진다");
  assert.equal([...markers].map((marker) => marker.room.roomId).join(","), "1,3");
  assert.equal(markers[0].lat, 36.576);
  assert.equal(markers[0].lng, 128.97);
  assert.equal(markers[0].label, "4", "마커 라벨은 기획 11 처럼 모집 인원이다");
  assert.equal(markers[0].room.roomId, 1);
  assert.equal(api.roomMarkers([{ meetingLatitude: 36.5, meetingLongitude: null }]).length, 0);
  assert.equal(api.roomMarkers([{ meetingLatitude: null, meetingLongitude: 128.9 }]).length, 0);
  assert.equal(api.roomMarkers([{ meetingLatitude: 0, meetingLongitude: 0 }]).length, 0);
  assert.equal(api.roomMarkers(null).length, 0);

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

  // 캡처 라우트는 절대 네트워크를 타지 않는다 (deterministicParams 판정 유지).
  for (const search of ["?screen=explore", "?route=explore", "?capture=1", "?uitest=1", "?mockAuth=1"]) {
    window.location.search = search;
    assert.equal(api.deterministicParams(), true, `${search} must stay deterministic`);
    assert.equal(api.live(), false, `${search} must not use live data`);
  }
  window.location.search = "?screen=explore&liveData=1";
  assert.equal(api.deterministicParams(), false, "?liveData=1 은 개발자용 예외다");
  assert.equal(api.live(), true);
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
    const window = {
      location: { search, origin: "https://web.example", pathname: "/app/", href: `https://web.example/app/${search}` },
      setTimeout,
      clearTimeout,
      localStorage,
      sessionStorage,
      MOYEO_MOCK_IDENTITY: mock,
      MOYEO_MOCK_AUTH_BACKEND: mock,
      MOYEO_CAPTURE_SESSION: captureSession,
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

    // 캡처 회귀 — 클라이언트 전용 기능이 켜져도 화면기획의 목데이터가 그대로 나와야 한다.
    // NOTE: --dump-dom 은 Babel standalone 이 <head> 에 심는 컴파일 결과까지 담아서 전체 문서 대상
    // 문자열 검사는 렌더 결과를 증명하지 못한다. 그래서 #root 서브트리로 범위를 좁혀서 본다.
    const rootOf = (dom) => {
      const start = dom.indexOf('<div id="root">');
      assert.ok(start !== -1, "rendered root should exist");
      // Babel standalone 이 컴파일 결과를 #root 뒤 <script> 로도 심으므로 첫 script 앞에서 끊는다.
      const end = dom.indexOf("<script", start);
      return end === -1 ? dom.slice(start) : dom.slice(start, end);
    };
    for (const theme of ["light", "dark"]) {
      assertIncludes(rootOf(await getDom("search", theme)), [
        "최근 검색어",
        "전체 삭제",
        "경주",
        "단풍",
        "황리단길",
        "안동 한옥",
        "주왕산",
        "인기 검색어",
        'value="경주 단풍"',
      ], `12 search capture mock data (${theme})`);
      assertIncludes(rootOf(await getDom("settings", theme)), [
        "테마",
        "시스템 기본",
        "1.0.4 (최신)",
        "문의하기",
        "앱 평가하기",
        "오픈소스 라이선스",
      ], `29 settings capture mock data (${theme})`);
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
    // ?liveData=1 은 캡처 판정을 끄는 기존 개발자 예외라 실제 저장소 기반 동작을 볼 수 있다.
    const emptyRecent = rootOf(await dumpDom(chrome, server.baseUrl, { screen: "search", theme: "light", liveData: "1" }));
    assert.ok(!emptyRecent.includes("최근 검색어"), "empty recent searches must hide the whole section");
    assert.ok(emptyRecent.includes("인기 검색어"), "popular searches stay visible when recent searches are empty");
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

  const captureVersion = createWindow();
  captureVersion.window.MoyeoApi = { deterministicParams: () => true };
  assert.equal(captureVersion.window.MoyeoAppVersion.label(), "1.0.4 (최신)", "캡처 모드는 기획값을 유지한다");
  assert.equal(captureVersion.window.MoyeoAppVersion.dialogBody(), "현재 설치된 버전은 1.0.4이며 최신 상태예요.");
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
