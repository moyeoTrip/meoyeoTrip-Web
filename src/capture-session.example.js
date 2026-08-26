// 라이브 캡처 세션 주입 파일의 형식 예시다.
// 캡처 도구가 이 형식으로 src/capture-session.local.js (gitignore) 를 쓰고, 캡처가 끝나면 지운다.
//
// ?liveData=1 이 붙은 실행에서만 src/auth-api.jsx 가 이 토큰으로 서비스 세션을 세운다.
// 플래그가 없으면 이 파일이 있어도 무시되고 기존 목데이터 화면이 그대로 나온다.
//
// 규칙:
//  · accessToken 만 넣는다. refreshToken 은 넣지 않는다 — 401 이면 조용히 실패하는 쪽이 안전하고,
//    refresh 응답을 localStorage 에 쓰는 경로를 아예 막는다.
//  · 토큰을 URL·커밋·로그에 남기지 않는다. 이 파일과 프로세스 인자·환경변수까지만이다.
//  · 파일 권한은 0600 으로 만든다.
window.MOYEO_CAPTURE_SESSION = {
  accessToken: 'MOYEO_SERVICE_ACCESS_TOKEN',
  // 선택. 없으면 SIGNUP_COMPLETE 로 본다.
  signupState: 'SIGNUP_COMPLETE',
};
