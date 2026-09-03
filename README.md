# MoyeoTrip Mobile Web

React 기반 모바일 웹 프로토타입입니다. 기존 웹 화면기획의 JSX 컴포넌트와 생성 이미지를 가져와, 실제 모바일 브라우저에서는 전체 화면으로 보이고 PC/태블릿에서는 모바일 비율을 유지한 채 좌우 레터박스가 보이도록 구성했습니다.

## 실행

```sh
npm run dev
```

브라우저에서 엽니다.

```txt
http://127.0.0.1:5174/
```

테스트용 초기 화면은 쿼리로 지정할 수 있습니다.

```txt
http://127.0.0.1:5174/?screen=feed&theme=dark
```

지원 예시: `home`, `explore`, `explore-map`, `chat-list`, `chat`, `chat-menu`, `chat-attach`, `feed`, `feed-detail`, `feed-comments`, `feed-write`, `my`, `dex`, `friends`, `settings`, `login`, `email-auth`, `terms`, `course`, `trip`, `create`, `custom-course`, `create-schedule`, `create-people`, `create-detail`, `create-meet`, `create-summary`, `course-edit`, `host-manage`, `trip-confirmed`, `trip-day`, `notif-detail`, `account-delete`, `system-maintenance`, `system-error`, `report`, `blocked`, `course-publish`, `oss-licenses`, `oss-license-detail`.

비교 리포트처럼 하단 스크롤 상태를 바로 캡처해야 할 때는 `scroll=bottom` 또는 `scroll=middle`을 함께 붙입니다.

```txt
http://127.0.0.1:5174/?screen=home&theme=dark&scroll=bottom
```

첫 로드에는 CDN의 React/Babel 리소스가 필요합니다. 본문과 스플래시는 저장소에 포함된 LINE Seed Sans KR Regular/Bold를 사용하며 시스템 한글 폰트를 fallback으로 둡니다.

## 지도 (카카오 지도 JavaScript SDK)

`src/kakao-map.js`가 `runtime-config(.local).js`의 `kakaoJavaScriptKey`로 `dapi.kakao.com/v2/maps/sdk.js`를 지도 화면에서만 동적 로드합니다(`autoload=false` → `kakao.maps.load()`). 공용 지도 컴포넌트는 `shared.jsx`의 `MiniMap` 하나이고, 좌표(`center` · `markers` · `polyline`)가 있고 SDK 로드가 성공할 때만 실지도를 그립니다. 키가 없거나 좌표가 없거나 로드·인증이 실패하면 기존 SVG 목업 지도로 폴백합니다.

캡처·QA 회귀를 막기 위해 `?screen=`, `?route=`, `?capture=1`, `?uitest=1`에서는 네트워크 지도를 타지 않고 항상 목업을 그립니다. 개발 중에 특정 화면의 실지도를 확인하려면 `?liveMap=1`을 붙입니다(캡처 도구는 이 값을 붙이지 않습니다).

```txt
http://127.0.0.1:5174/?screen=create-meet&theme=light&mockAuth=1&liveMap=1
```

실지도가 보이려면 카카오 개발자 콘솔의 해당 앱에 **플랫폼 › Web › 사이트 도메인**으로 접속 도메인이 등록돼 있어야 합니다. 등록되지 않은 도메인에서는 SDK가 `401 domain mismatched`를 돌려주고 목업 지도로 폴백합니다. 로컬 개발에는 `http://127.0.0.1:5174`, `http://127.0.0.1:5173`, `http://localhost:5173`을 함께 등록하세요.

## 클라이언트 전용 기능 (서버 API 없음)

최근 검색어, 테마, 앱 버전은 서버 API가 없어 클라이언트가 스스로 들고 있습니다. 관련 로직은
`src/client-prefs.js`(plain JS)에 모아 두었고, `tokens.jsx`보다 먼저 동기 실행되므로 첫 페인트 전에 테마가 적용됩니다.

- **최근 검색어** — `localStorage` 키 `moyeo-trip-recent-searches`. 검색 실행 시 공백을 트림해 추가하고, 중복은
  최신순으로 끌어올리며 최대 10개까지만 남깁니다. 칩의 × 는 개별 삭제, `전체 삭제`는 저장소 키를 지웁니다.
  비어 있으면 `최근 검색어` 섹션(제목·전체 삭제·칩)을 통째로 숨기고 `인기 검색어`만 남깁니다.
  인기 검색어는 서버 데이터가 없어 목데이터를 그대로 두고 탭하면 그 키워드로 검색만 실행합니다.
- **테마** — `localStorage` 키 `moyeo-trip-theme`에 `system`(기본) · `light` · `dark` 3상태로 저장합니다.
  `29 설정 › 화면 › 테마` 행을 탭하면 `시스템 기본 → 라이트 → 다크` 순으로 순환하고 즉시 전체 화면에 적용됩니다.
  `system`이면 `prefers-color-scheme` 변경을 런타임에 그대로 따라갑니다.
- **앱 버전** — `src/client-prefs.js`의 `APP_VERSION`이며 `package.json`의 `version`과 같아야 합니다
  (`npm test`가 두 값을 비교합니다). 최신 버전을 알려주는 서버 API가 없어 `(최신)` 표기는 붙이지 않습니다.

캡처·QA 라우트(`?screen=` · `?route=` · `capture=1` · `uitest=1` · `mockAuth=1`)에서는 화면기획의 목데이터
(최근 검색어 5개 · `시스템 기본` · `1.0.4 (최신)`)를 그대로 보여주고 저장소를 건드리지 않습니다. 강제 테마(`?theme=`)는
사용자 설정보다 항상 우선하며 저장되지 않습니다. 개발 중에 실제 동작을 보려면 `?liveData=1`을 붙입니다
(캡처 도구는 이 값을 붙이지 않습니다).

```txt
http://127.0.0.1:5174/?screen=search&liveData=1
```

### 라이브 캡처 (`?liveData=1` + 주입 세션)

번호별 캡처를 **실제 API 데이터로도** 찍을 때 쓰는 경로입니다. 라우팅은 캡처와 똑같이 두고(화면 직접 진입 ·
강제 테마 · 스플래시 스킵 · 지도는 목업) 데이터 차단만 풉니다.

```txt
http://127.0.0.1:5174/?screen=chat&theme=light&capture=1&liveData=1&roomId=22
```

- `mockAuth=1`은 **붙이지 않습니다**. 붙이면 `MoyeoAuth`가 목 백엔드가 되어 `MoyeoApi.live()`가 false입니다.
- 세션은 URL이 아니라 파일로 넘깁니다. 캡처 도구가 `src/capture-session.local.js`(gitignore, 0600)에
  `window.MOYEO_CAPTURE_SESSION = { accessToken: "…" }`를 써 두면 `?liveData=1`일 때만 `src/auth-api.jsx`가
  그 토큰으로 세션을 세웁니다. 형식은 `src/capture-session.example.js`를 참고하세요.
  **파일이 없거나 토큰이 비면 라이브 모드로 들어가지 않고 기존 목데이터 화면이 그대로 나옵니다.**
- 토큰은 메모리에만 둡니다 — `localStorage`에 쓰지 않고 `refreshToken`도 받지 않습니다(401이면 조용히 실패).
- 화면 직접 진입은 앞 화면의 선택 컨텍스트가 없으므로 대상을 쿼리로 지정합니다:
  `roomId` · `courseId` · `feedId` · `contentId` · `memberId`(20-1a·20-1b). 지정하지 않으면 그 화면은
  목데이터를 유지합니다(임의의 대상을 골라주지 않습니다).
- 서버 왕복이 있으므로 캡처 도구의 대기 시간(헤드리스 `--virtual-time-budget`)을 목 캡처보다 넉넉히 줘야
  합니다. 3초대에서는 늦게 도착한 응답(예: 09 홈의 코스 태그, 08-C 약관 원문)이 화면에 못 올라옵니다.


## 탭 전환 상태 보관소 (`src/tab-cache.js`)

정본: 워크스페이스의 `docs/alignment/TAB-STATE-CANON.md`.

라우터가 라우트마다 화면 컴포넌트를 갈아끼우므로 화면 안의 `useState`는 탭을 떠나면 사라집니다. 그대로 두면
하단 탭을 오갈 때마다 조회가 다시 나가고 `불러오는 중이에요…`가 다시 뜹니다. 그래서 탭 데이터를 **탭 바깥**
(모듈 스코프)에 두고 화면은 그 보관소를 읽기만 합니다. 보관소에는 **서버에서 받은 값만** 담습니다
(목데이터로 채우지 않습니다).

- `window.useTabData(key, load, { enabled, mode, accept })` → `{ status, value, reload, replace }`
  - `mode: 'keep'` — 탐색 · 모임 · 피드. 보관소에 값이 있으면 **다시 부르지 않습니다**.
  - `mode: 'revalidate'` — 홈 · 마이. 가진 값을 즉시 그리고 뒤에서 조용히 갱신합니다.
  - `status`는 `ready` · `loading` · `failed` · `idle`이고, **값이 있으면 갱신 중에도 항상 `ready`**입니다
    (로딩·오류가 이전 내용을 덮지 않습니다). 화면의 상태 줄은 `TabDataNotice`가 그립니다.
- `window.useTabState(key, initial)` — 고른 필터 · 세그먼트 · 탭. 탭을 떠났다 와도 그대로입니다.
- `window.useTabScroll(key)` — `{ ref, onScroll }`. 스크롤 위치를 되돌립니다.
- 목록 자체를 바꾸는 동작(모집 만들기 · 신청 · 나가기)은 `MoyeoTabCache.invalidate(MoyeoTabCache.ROOM_LIST_KEYS)`로
  해당 키만 덜어냅니다. 찜 토글처럼 항목 하나만 바뀌는 것은 `MoyeoTabCache.patch(key, update)`입니다.
- 로그아웃 · 계정 전환 시 보관소를 비웁니다. `MoyeoAuth.signOut()`이 `clear()`를 부르고, 훅이 매 진입마다
  `MoyeoAuth.currentUserId()`로 주인이 바뀌었는지 확인합니다.

## 오픈소스 라이선스 화면 (29-4 · 29-4a)

`설정 › 정보 › 오픈소스 라이선스`에서 들어갑니다. 데이터는 서버 호출 없이 `src/oss-licenses.js`에 내장돼 오프라인에서도
열립니다. 정본은 워크스페이스의 `docs/oss/oss-licenses.json`과 `docs/oss/license-texts/`이고, 웹은 그중
**web 플랫폼 항목 7건**과 필요한 전문(Apache-2.0 · MIT)만 담습니다. 항목 수가 플랫폼마다 다른 것은 정상입니다.

의존성(`index.html`의 CDN, `package.json`)을 바꾸는 작업에서는 같은 작업 안에서 정본 JSON과 `src/oss-licenses.js`를
함께 갱신합니다. 라이선스 식별자는 실제 `LICENSE`/POM에서 확인한 값만 쓰고 추정하지 않습니다 — 카카오 SDK는
오픈소스가 아니라 자체 배포 약관이며 전문을 지어내지 않고 라이선스 이름과 원문 URL만 보여줍니다.
`npm test`가 `src/oss-licenses.js`를 정본 JSON과 대조합니다.

## 글꼴 라이선스

LINE Seed Sans KR은 SIL Open Font License 1.1에 따라 개인 및 상업 프로젝트에서 사용할 수 있습니다. 웹에는 용량을 줄이기 위해 WOFF2 Regular/Bold만 번들했으며, 원문 라이선스는 `assets/licenses/LINESeedSansKR-OFL.txt`에 포함했습니다.

화면 아이콘은 저장소에 번들한 Lucide 1.27.0을 사용합니다. 찌그러질 수 있는 임의 픽토그램 대신 동일한 24×24 좌표계와 stroke 규칙을 공유하며, ISC 라이선스 원문은 `assets/licenses/Lucide-ISC.txt`에 포함했습니다.

## 코스와 모집 정책

- `등록된 코스`: 서비스 코스를 그대로 연결하므로 방문지와 순서는 바꿀 수 없습니다. 일정, 집합 장소·시간, 인원 조건은 마감 전까지 수정할 수 있습니다.
- `호스트 직접 코스`: 방문지는 최소 2개, 최대 20개이며 여행 확정 전까지 추가·삭제·순서 변경이 가능합니다. 저장하면 채팅방에 변경 내역이 남고 멤버에게 알림이 갑니다.
- 여행 확정 뒤에는 출처와 관계없이 경로가 잠깁니다. 이후 변경 안내는 채팅방 공지로 전달합니다.
- 당일치기는 여행 날짜와 시작·종료 시간을, 숙박 여행은 시작·종료 날짜를 저장합니다. 집합 시간은 여행 시작 시간과 별도로 관리합니다.
- 집합 장소는 위도·경도를 함께 저장해 모집 상세, 채팅 지도, 길 찾기와 근처 추천에서 같은 좌표를 사용합니다.
- 호스트가 모임을 나가면 다른 멤버에게 권한을 넘기지 않고 모임이 즉시 종료됩니다.

### 관광 콘텐츠 API

일반 실행의 방문지 검색/상세는 각각 `GET /api/v1/tourism-contents`, `GET /api/v1/tourism-contents/{contentId}`를 호출합니다. 목록은 콘텐츠 ID·타입·제목·주소·썸네일·위경도를, 상세는 우편번호·전화번호/안내명·홈페이지·소개·일반/메뉴 이미지까지 구분해 정규화합니다. 배열 또는 `data.content`/`data.items`/`content`/`items` envelope를 허용합니다.

현재 배포 Swagger `/api/v3/api-docs`가 인증 없이 401이고 로컬 BE에도 해당 DTO가 없어 검색 query parameter와 정확한 enum/필드명은 확정할 수 없습니다. 따라서 현재 목록 endpoint 전체를 받은 뒤 검색어와 타입을 클라이언트에서 거릅니다. API 401·미구현·네트워크 오류·스키마 불일치 때에는 오류와 다시 시도를 표시하면서 샘플 데이터를 유지합니다. `?mockAuth=1`, `?capture=1`, `?uitest=1`에서는 처음부터 결정적 샘플을 사용합니다.

## 인증 설정

기본 실행은 배포 API와 실제 Firebase 인증을 사용합니다. `src/runtime-config.example.js`를 참고해 개발 PC에는 Git에서 제외되는 `src/runtime-config.local.js`를 만듭니다.

```html
window.MOYEO_RUNTIME_CONFIG = {
  apiBaseUrl: "https://moyeo-trip-api.jayden-bin.cc",
  firebase: { /* Firebase Web 앱 설정 */ },
  firebaseVapidKey: "Firebase Cloud Messaging 웹 푸시 인증서의 공개 키",
  pushTokenRegistrationPath: "전용 토큰 등록 API가 있을 때만 입력",
  kakaoJavaScriptKey: "카카오 JavaScript 키",
  kakaoRedirectUri: "현재 웹의 정확한 로그인 복귀 URL",
  sentry: {
    dsn: "Sentry 프로젝트 DSN 또는 빈 문자열",
    environment: "development",
    release: "moyeotrip-web@커밋SHA",
    tracesSampleRate: 0
  }
};
```

Firebase Console에서 Email/Password, Google, Apple 제공자를 활성화하고 로컬 및 배포 도메인을 Authorized domains에 등록해야 합니다. 카카오 개발자 콘솔에는 JavaScript SDK 도메인과 정확한 Redirect URI를 등록합니다. 인증 뒤 화면 이동은 로컬 기록이 아니라 BE의 `signupState`를 따르며, 외부 인증 왕복이나 새로고침 뒤에도 서버 상태로 가입 단계를 복구합니다.

화면 기획 및 자동화 테스트에서만 `?mockAuth=1`을 붙여 인증을 모킹할 수 있습니다. 배포 기본값은 목업이 아닙니다.

### 가입 게이트 (409)

서버는 인증이 필요한 일반 API마다 가입 단계와 실제 프로필 이미지 보유 여부를 함께 검증합니다(`docs/alignment/SIGNUP-GATE-CANON.md`).

- `40902` → 회원 정보 입력 단계(`prof-1`), `40918` → 프로필 이미지 단계(`prof-2`)로 되돌립니다. **토큰 문제가 아니므로 재발급하지 않습니다** — `auth-api.jsx`의 `request()`가 401 판정보다 먼저 걸러 `moyeo:signup-gate` 이벤트를 쏘고, `prototype.jsx`의 라우터가 현재 화면을 교체합니다.
- `40919`는 프로필 이미지 3종에서만 나오고 "이미 끝났다"는 뜻이라 오류로 띄우지 않고 홈으로 넘깁니다.
- 07 취향 단계는 가입 전이라 `GET /users/me/profile/options`를 부를 수 없어 `MoyeoApi.SIGNUP_TRAVEL_STYLES`(12종)·`SIGNUP_INTERESTED_REGIONS`(경북 24곳)를 씁니다. 목데이터가 아니라 **서버 시드의 거울인 계약 상수**이며, 서버가 목록을 바꾸면 함께 바꿔야 합니다. 고른 id는 `POST /auth/signup`의 `travelStyleIds`·`interestedRegionIds`로 전송됩니다. 28 프로필 수정은 토큰이 있으므로 서버 응답만 씁니다.

## Web FCM 설정

웹 알림은 Firebase Messaging compat SDK와 저장소 루트의 `firebase-messaging-sw.js`를 사용합니다. 서비스 워커 주소와 알림 클릭 주소는 `document.baseURI`/등록 scope를 기준으로 계산하므로 `https://사용자.github.io/저장소명/`처럼 GitHub Pages 하위 경로에서도 저장소 prefix를 유지합니다.

1. Firebase Console에서 이 웹 앱의 Cloud Messaging을 활성화하고 `프로젝트 설정 > 클라우드 메시징 > 웹 푸시 인증서`에서 VAPID 키 쌍을 생성합니다.
2. 로컬 `src/runtime-config.local.js`에는 Firebase Web 앱 설정과 공개 VAPID 키인 `firebaseVapidKey`를 넣습니다. 알림 권한과 서비스 워커는 `localhost` 또는 HTTPS에서만 동작합니다.
3. GitHub Actions에는 `FIREBASE_WEB_API_KEY` Secret과 `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_WEB_APP_ID`, `FIREBASE_WEB_VAPID_KEY` Variables를 등록합니다.
4. 로그인/회원가입 요청에는 얻을 수 있는 경우 `fcmToken`이 함께 전송됩니다. 토큰이 없거나 공백뿐이면 필드를 생략합니다 — 공백 토큰은 `40016 FCM_TOKEN_BLANK`입니다. 같은 기기에서 계정을 바꿔도 서버가 기존 소유자에게서 토큰을 이관하므로 클라이언트가 삭제 후 재시도하지 않습니다. BE에 로그인과 별도의 토큰 갱신 API가 생기면 Repository Variable `MOYEO_FCM_TOKEN_REGISTRATION_PATH`에 `/api/...` 경로를 넣습니다. 비어 있으면 별도 API를 추측해 호출하지 않고 `MoyeoPush.setTokenRegistrar()` 경계만 유지합니다.

설정 화면에서 사용자가 직접 알림을 켤 때만 권한을 요청합니다. 미지원 브라우저, HTTP, 권한 거부, Firebase 설정 누락은 각각 안내 문구로 대체되며 반복해서 권한 창을 띄우지 않습니다. 포그라운드 메시지는 `moyeo:push-message`, 토큰은 `moyeo:push-token`, 상태 변화는 `moyeo:push-state` 이벤트로 앱 UI에 전달됩니다.

## Sentry 설정

Sentry를 사용하려면 로컬 환경변수 `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`, `SENTRY_TRACES_SAMPLE_RATE`를 설정합니다. GitHub Pages에서는 같은 이름의 Repository Variables를 등록합니다. DSN이 비어 있으면 Sentry SDK를 다운로드하거나 초기화하지 않으며, 사용자 식별 정보 전송은 기본적으로 꺼져 있습니다.

## GitHub Pages 배포

이 독립 저장소의 `.github/workflows/deploy-pages.yml`이 웹을 GitHub Pages로 배포합니다. 배포 과정에서 GitHub Actions의 Variables와 Secrets로 `src/runtime-config.js`를 생성합니다.

1. GitHub 저장소의 `Settings > Pages`에서 `Build and deployment` 소스를 `GitHub Actions`로 설정합니다.
2. `main` 또는 `master` 브랜치에 푸시하거나 Actions 탭에서 `Deploy Mobile Web to GitHub Pages`를 수동 실행합니다.
3. 배포가 끝나면 워크플로의 `github-pages` 환경 URL에서 확인합니다.

정적 프로토타입이라 별도 빌드 과정은 없습니다. CDN 리소스를 쓰므로 첫 로드 시 네트워크 연결이 필요합니다.
