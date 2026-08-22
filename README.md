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

지원 예시: `home`, `explore`, `explore-map`, `chat-list`, `chat`, `chat-menu`, `chat-attach`, `feed`, `feed-detail`, `feed-comments`, `feed-write`, `my`, `dex`, `friends`, `settings`, `login`, `email-auth`, `terms`, `course`, `trip`, `create`, `custom-course`, `create-schedule`, `create-people`, `create-detail`, `create-meet`, `create-summary`, `course-edit`, `host-manage`, `trip-confirmed`, `trip-day`, `notif-detail`, `account-delete`, `system-maintenance`, `system-error`, `report`, `blocked`, `course-publish`.

비교 리포트처럼 하단 스크롤 상태를 바로 캡처해야 할 때는 `scroll=bottom` 또는 `scroll=middle`을 함께 붙입니다.

```txt
http://127.0.0.1:5174/?screen=home&theme=dark&scroll=bottom
```

첫 로드에는 CDN의 React/Babel 리소스가 필요합니다. 본문과 스플래시는 저장소에 포함된 LINE Seed Sans KR Regular/Bold를 사용하며 시스템 한글 폰트를 fallback으로 둡니다.

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

## Web FCM 설정

웹 알림은 Firebase Messaging compat SDK와 저장소 루트의 `firebase-messaging-sw.js`를 사용합니다. 서비스 워커 주소와 알림 클릭 주소는 `document.baseURI`/등록 scope를 기준으로 계산하므로 `https://사용자.github.io/저장소명/`처럼 GitHub Pages 하위 경로에서도 저장소 prefix를 유지합니다.

1. Firebase Console에서 이 웹 앱의 Cloud Messaging을 활성화하고 `프로젝트 설정 > 클라우드 메시징 > 웹 푸시 인증서`에서 VAPID 키 쌍을 생성합니다.
2. 로컬 `src/runtime-config.local.js`에는 Firebase Web 앱 설정과 공개 VAPID 키인 `firebaseVapidKey`를 넣습니다. 알림 권한과 서비스 워커는 `localhost` 또는 HTTPS에서만 동작합니다.
3. GitHub Actions에는 `FIREBASE_WEB_API_KEY` Secret과 `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_WEB_APP_ID`, `FIREBASE_WEB_VAPID_KEY` Variables를 등록합니다.
4. 로그인/회원가입 요청에는 얻을 수 있는 경우 `fcmToken`이 함께 전송됩니다. BE에 로그인과 별도의 토큰 갱신 API가 생기면 Repository Variable `MOYEO_FCM_TOKEN_REGISTRATION_PATH`에 `/api/...` 경로를 넣습니다. 비어 있으면 별도 API를 추측해 호출하지 않고 `MoyeoPush.setTokenRegistrar()` 경계만 유지합니다.

설정 화면에서 사용자가 직접 알림을 켤 때만 권한을 요청합니다. 미지원 브라우저, HTTP, 권한 거부, Firebase 설정 누락은 각각 안내 문구로 대체되며 반복해서 권한 창을 띄우지 않습니다. 포그라운드 메시지는 `moyeo:push-message`, 토큰은 `moyeo:push-token`, 상태 변화는 `moyeo:push-state` 이벤트로 앱 UI에 전달됩니다.

## Sentry 설정

Sentry를 사용하려면 로컬 환경변수 `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`, `SENTRY_TRACES_SAMPLE_RATE`를 설정합니다. GitHub Pages에서는 같은 이름의 Repository Variables를 등록합니다. DSN이 비어 있으면 Sentry SDK를 다운로드하거나 초기화하지 않으며, 사용자 식별 정보 전송은 기본적으로 꺼져 있습니다.

## GitHub Pages 배포

이 독립 저장소의 `.github/workflows/deploy-pages.yml`이 웹을 GitHub Pages로 배포합니다. 배포 과정에서 GitHub Actions의 Variables와 Secrets로 `src/runtime-config.js`를 생성합니다.

1. GitHub 저장소의 `Settings > Pages`에서 `Build and deployment` 소스를 `GitHub Actions`로 설정합니다.
2. `main` 또는 `master` 브랜치에 푸시하거나 Actions 탭에서 `Deploy Mobile Web to GitHub Pages`를 수동 실행합니다.
3. 배포가 끝나면 워크플로의 `github-pages` 환경 URL에서 확인합니다.

정적 프로토타입이라 별도 빌드 과정은 없습니다. CDN 리소스를 쓰므로 첫 로드 시 네트워크 연결이 필요합니다.
