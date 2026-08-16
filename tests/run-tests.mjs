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
  "meetings",
  "chat-list",
  "chat",
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
  terms: ["약관", "동의"],
  splash: ["모여트립 in 경북"],
  "feed-write": ["글쓰기", "여행 기록"],
  "feed-detail": ["피드", "댓글"],
  notifications: ["알림", "울진 금강송 숲길 워크", "영주 부석사 눈꽃 산책"],
  search: ["최근 검색어", "청송 얼음골", "추천 검색 결과", "청송 주왕산 물안개 코스"],
  course: ["코스 일정", "용연폭포 쉼터", "함께 보면 좋은 곳"],
  profile: ["최근 여행 (8)", "울진 금강송 숲길", "영주 부석사 눈꽃"],
  "auth-methods": ["로그인 방식", "카카오", "Google", "이메일", "Apple"],
};

const requiredAssets = [
  "login-welcome.png",
  "login-welcome-night.png",
  "splash-generated.png",
  "splash-generated-night.png",
  "weather-sunny-cheomseongdae.png",
  "weather-sunny-cheomseongdae-night.png",
  "weather-cloudy-bulguksa.png",
  "weather-cloudy-bulguksa-night.png",
  "weather-rain-hahoe.png",
  "weather-rain-hahoe-night.png",
  "weather-snow-buseoksa.png",
  "weather-snow-buseoksa-night.png",
  "weather-fog-seokguram.png",
  "weather-fog-seokguram-night.png",
  "weather-wind-homigot.png",
  "weather-wind-homigot-night.png",
  "weather-heavy-rain-woljeonggyo.png",
  "weather-heavy-rain-woljeonggyo-night.png",
  "weather-heatwave-dosan.png",
  "weather-heatwave-dosan-night.png",
  "weather-dust-donggung-wolji.png",
  "weather-dust-donggung-wolji-night.png",
  "kakao-login-ko-official.png",
  "google-g-official.png",
  "apple-continue-black-ko-official.png",
  "apple-continue-white-ko-official.png",
  "kakao-mark-official.png",
  "google-g-light-official.png",
  "google-g-dark-official.png",
  "apple-mark-black-official.png",
  "apple-mark-white-official.png",
  "onboarding-1.png",
  "onboarding-1-night.png",
  "onboarding-2.png",
  "onboarding-2-night.png",
  "onboarding-3.png",
  "onboarding-3-night.png",
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

  const [html, mobileApp, refined, shared, cachedImage, prototype, onboarding, authApi, extra, extra2, readme, standaloneWorkflow, devServer] = await Promise.all([
    read("index.html"),
    read("src/mobile-app.jsx"),
    read("src/screens-refined.jsx"),
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
  ]);

  assertScriptOrder(html);
  assertIncludes(cachedImage, [
    "moyeo-images-v1",
    "MOYEO_IMAGE_MAX_ATTEMPTS = 3",
    "moyeoImageFileName",
    "cache.match",
    "cache.put",
    "force-cache",
    "function CachedImage",
  ], "cached image loader");
  assertIncludes(devServer, [
    "runtime-config.local.js",
    "FIREBASE_WEB_API_KEY",
    "KAKAO_JAVASCRIPT_KEY",
    "KAKAO_REDIRECT_URI",
    "http.server",
  ], "development server");
  assertIncludes(html, ["react@18.3.1", "@babel/standalone", "firebasejs/12.16.0", "firebase-auth-compat", "kakao_js_sdk/2.8.1", "runtime-config.js", "Pretendard"], "index.html");
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
    "assets/login-welcome.png",
    "assets/login-welcome-night.png",
    "moyeo-login-welcome-light",
    "moyeo-login-welcome-dark",
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
    "출생 연도",
  ], "auth screens");
  assertIncludes(html, ["scrollbar-width: none", "::-webkit-scrollbar", "box-sizing: border-box"], "index CSS");

  for (const route of routes) {
    assert.ok(mobileApp.includes(route), `mobile-app route map should include ${route}`);
  }
  assertIncludes(mobileApp, [
    "getInitialTheme",
    "getInitialScroll",
    "scrollLargestScrollable",
    "mw-letterbox",
    "mw-device-shell",
    "display: none",
    "window.PrototypePhone",
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

  assertIncludes(refined, [
    "assets/splash-generated.png",
    "assets/splash-generated-night.png",
    "weather-sunny-cheomseongdae",
    "weather-heavy-rain-woljeonggyo",
    "data-weather-hero-image=\"dark\"",
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
    for (const screen of routes) {
      for (const theme of ["light", "dark"]) {
        const dom = await dumpDom(chrome, server.baseUrl, { screen, theme, mockAuth: "1" });
        assert.ok(dom.includes("모여트립 in 경북 · Mobile Web"), `${screen}/${theme} should keep document title`);
        assert.ok(dom.includes("mw-root"), `${screen}/${theme} should render mobile web root`);
        assert.ok(!dom.includes("화면을 찾을 수 없어요"), `${screen}/${theme} should resolve to a screen`);
        assert.ok(dom.includes(`data-moyeo-theme="${theme}"`) || dom.includes(`data-moyeo-theme=${theme}`), `${screen}/${theme} should apply theme`);
      }
    }

    for (const [screen, snippets] of Object.entries(expectedTexts)) {
      const dom = await dumpDom(chrome, server.baseUrl, { screen, theme: "dark", mockAuth: "1" });
      assertIncludes(dom, snippets, `${screen} browser render`);
    }

    const bottomDom = await dumpDom(chrome, server.baseUrl, { screen: "home", theme: "dark", scroll: "bottom", mockAuth: "1" });
    assert.ok(bottomDom.includes("scroll=bottom") || bottomDom.includes("인기 코스 TOP 3"), "home bottom render should stay valid");

    const gatedDom = await dumpDom(chrome, server.baseUrl, { theme: "dark", mockAuth: "1" });
    assertIncludes(gatedDom, ["고민 없이 고르는", "경북 코스", "다음"], "unauthenticated onboarding gate");
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
