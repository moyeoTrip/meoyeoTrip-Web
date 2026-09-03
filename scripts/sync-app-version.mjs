// `package.json` 의 version 을 화면이 읽는 곳들에 박아 넣는다.
//
// 예전에는 `client-prefs.js` 에 `'0.1.0'` 을 손으로 적어 뒀다. package.json 을 올려도
// 화면은 안 바뀌고, 앱(1.0)과 어긋난 값이 설정 화면에 찍혔다(2026-08-31 사용자 지적).
//
//   node scripts/sync-app-version.mjs          # 맞춘다
//   node scripts/sync-app-version.mjs --check  # 어긋나면 실패 (CI·테스트용)
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const check = process.argv.includes("--check");

const version = JSON.parse(await readFile(path.join(root, "package.json"), "utf8")).version;
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`package.json 의 version 이 x.y.z 형식이 아니다: ${version}`);
  process.exit(1);
}

/** 파일 안의 한 자리를 version 으로 맞춘다. */
const TARGETS = [
  {
    file: "src/runtime-config.js",
    pattern: /(appVersion:\s*')[^']*(')/,
    why: "배포가 덮어쓰기 전의 기본값",
  },
  {
    file: "src/client-prefs.js",
    // 런타임 주입이 없을 때 쓰는 폴백
    pattern: /(MOYEO_RUNTIME_CONFIG\.appVersion\) \|\| ')[^']*(')/,
    why: "런타임 주입이 없을 때의 폴백",
  },
];

let mismatched = 0;
for (const target of TARGETS) {
  const filePath = path.join(root, target.file);
  const text = await readFile(filePath, "utf8");
  const match = text.match(target.pattern);
  if (!match) {
    console.error(`${target.file}: 버전 자리를 찾지 못했다 (${target.why})`);
    process.exit(1);
  }
  const current = match[0].replace(match[1], "").replace(/'$/, "");
  if (current === version) continue;
  mismatched += 1;
  if (check) {
    console.error(`${target.file}: ${current} ≠ package.json ${version}`);
    continue;
  }
  await writeFile(filePath, text.replace(target.pattern, `$1${version}$2`));
  console.log(`${target.file}: ${current} → ${version}`);
}

if (check && mismatched > 0) {
  console.error(`\n버전이 어긋났다. \`npm run sync-version\` 을 돌려라.`);
  process.exit(1);
}
console.log(check ? `버전 일치 (${version})` : `버전 동기화 완료 (${version})`);
