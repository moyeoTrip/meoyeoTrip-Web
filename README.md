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

지원 예시: `home`, `explore`, `explore-map`, `chat-list`, `chat`, `feed`, `feed-detail`, `feed-write`, `my`, `dex`, `profile`, `settings`, `login`, `email-auth`, `terms`, `course`, `trip`.

비교 리포트처럼 하단 스크롤 상태를 바로 캡처해야 할 때는 `scroll=bottom` 또는 `scroll=middle`을 함께 붙입니다.

```txt
http://127.0.0.1:5174/?screen=home&theme=dark&scroll=bottom
```

첫 로드에는 CDN의 React/Babel/Pretendard 리소스가 필요합니다.

## 인증 설정

기본 실행은 배포 API와 실제 Firebase 인증을 사용합니다. `src/runtime-config.example.js`를 참고해 개발 PC에는 Git에서 제외되는 `src/runtime-config.local.js`를 만듭니다.

```html
window.MOYEO_RUNTIME_CONFIG = {
  apiBaseUrl: "https://moyeo-trip-api.jayden-bin.cc",
  firebase: { /* Firebase Web 앱 설정 */ },
  kakaoJavaScriptKey: "카카오 JavaScript 키",
  kakaoRedirectUri: "현재 웹의 정확한 로그인 복귀 URL"
};
```

Firebase Console에서 Email/Password, Google, Apple 제공자를 활성화하고 로컬 및 배포 도메인을 Authorized domains에 등록해야 합니다. 카카오 개발자 콘솔에는 JavaScript SDK 도메인과 정확한 Redirect URI를 등록합니다. 인증 뒤 화면 이동은 로컬 기록이 아니라 BE의 `signupState`를 따르며, 외부 인증 왕복이나 새로고침 뒤에도 서버 상태로 가입 단계를 복구합니다.

화면 기획 및 자동화 테스트에서만 `?mockAuth=1`을 붙여 인증을 모킹할 수 있습니다. 배포 기본값은 목업이 아닙니다.

## GitHub Pages 배포

이 독립 저장소의 `.github/workflows/deploy-pages.yml`이 웹을 GitHub Pages로 배포합니다. 배포 과정에서 GitHub Actions의 Variables와 Secrets로 `src/runtime-config.js`를 생성합니다.

1. GitHub 저장소의 `Settings > Pages`에서 `Build and deployment` 소스를 `GitHub Actions`로 설정합니다.
2. `main` 또는 `master` 브랜치에 푸시하거나 Actions 탭에서 `Deploy Mobile Web to GitHub Pages`를 수동 실행합니다.
3. 배포가 끝나면 워크플로의 `github-pages` 환경 URL에서 확인합니다.

정적 프로토타입이라 별도 빌드 과정은 없습니다. CDN 리소스를 쓰므로 첫 로드 시 네트워크 연결이 필요합니다.
