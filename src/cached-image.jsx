const MOYEO_IMAGE_CACHE_NAME = 'moyeo-images-v1';
const MOYEO_IMAGE_MAX_ATTEMPTS = 3;
const moyeoImageMemoryCache = new Map();
const moyeoImagePreloadCache = new Map();

// ── CDN 이 CORS 를 허용하지 않는다 ──
//
// `fetchMoyeoImage` 는 cross-origin `fetch()` 로 이미지를 받아 Cache Storage 에 넣는다.
// 그런데 `moyeo-trip-cdn.jayden-bin.cc` 는 **`Access-Control-Allow-Origin` 을 주지 않고**
// preflight(OPTIONS)에 403 을 낸다. 브라우저에서 실측한 결과:
//
//   fetch(url)           → TypeError: Failed to fetch   (CORS 차단)
//   new Image().src=url  → OK 1024x1024                 (CORS 불필요)
//
// 그래서 CDN 이미지 **전부**가 fetch 경로에서 실패해 마스코트/아바타 폴백으로 떨어졌다
// (07 프로필 후보가 사슴 아바타로, 14 코스 상세의 작성자 프로필이 고양이 이모지로 찍혔다).
// **폴백을 그리면 "이미지가 없음"과 구분이 안 된다** — 평범한 `<img src>` 로 직접 그린다.
// 브라우저 HTTP 캐시는 그대로 동작하므로 캐싱도 유지된다(Cache Storage 만 못 쓴다).
//
// 한 번 차단을 확인하면 이후 이미지는 fetch 를 건너뛴다. 안 그러면 이미지마다
// 3회 재시도(300·600ms 대기)를 하고 나서야 폴백해 표시가 눈에 띄게 늦어진다.
// 서버가 ACAO 를 주면 이 플래그는 켜지지 않고 예전 경로가 그대로 살아난다.
let moyeoImageCorsBlocked = false;

function moyeoThemeImageSource(lightSource, darkSource) {
  const requested = new URLSearchParams(window.location.search).get('theme');
  const theme = requested === 'light' || requested === 'dark'
    ? requested
    : document.documentElement.dataset.moyeoTheme || window.getInitialMoyeoThemeMode?.() || 'light';
  return theme === 'dark' ? darkSource : lightSource;
}

function preloadMoyeoImages(...sources) {
  return sources.filter(Boolean).map((source) => {
    if (moyeoImagePreloadCache.has(source)) return moyeoImagePreloadCache.get(source);
    const pending = new Promise((resolve) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = async () => {
        try {
          await image.decode?.();
        } catch (_) {
          // A loaded image is still usable when explicit decoding is unsupported.
        }
        resolve(source);
      };
      image.onerror = () => resolve(null);
      image.src = source;
    });
    moyeoImagePreloadCache.set(source, pending);
    return pending;
  });
}

function moyeoImageFileName(source) {
  try {
    const url = new URL(source, window.location.href);
    return decodeURIComponent(url.pathname.split('/').filter(Boolean).at(-1) || 'image');
  } catch (_) {
    return String(source || 'image').split('/').at(-1).split('?')[0] || 'image';
  }
}

/** Cache Storage 에 이미 있으면 blob URL 을 준다. 네트워크를 타지 않는다. */
async function matchCachedMoyeoImage(source) {
  if (!source || !('caches' in window)) return '';
  try {
    const cache = await window.caches.open(MOYEO_IMAGE_CACHE_NAME);
    const cached = await cache.match(moyeoImageCacheRequest(source));
    if (!cached) return '';
    return URL.createObjectURL(await cached.blob());
  } catch (_) {
    return '';
  }
}

class MoyeoImageCorsError extends Error {
  constructor(source) {
    super(`image fetch blocked by CORS: ${source}`);
    this.name = 'MoyeoImageCorsError';
  }
}

function isCrossOriginImage(source) {
  try {
    return new URL(source, window.location.href).origin !== window.location.origin;
  } catch (_) {
    return false;
  }
}

function moyeoImageCacheRequest(source) {
  const fileName = moyeoImageFileName(source);
  return new Request(new URL(`/__moyeo_image_cache__/${encodeURIComponent(fileName)}`, window.location.origin));
}

async function fetchMoyeoImage(source, maxAttempts = MOYEO_IMAGE_MAX_ATTEMPTS) {
  if (!source) throw new Error('image source is empty');
  // 이미 CORS 차단이 확인된 오리진이면 재시도 비용을 치르지 않고 바로 <img> 경로로 보낸다.
  if (moyeoImageCorsBlocked && isCrossOriginImage(source)) {
    throw new MoyeoImageCorsError(source);
  }
  const cacheKey = moyeoImageFileName(source);
  if (moyeoImageMemoryCache.has(cacheKey)) return moyeoImageMemoryCache.get(cacheKey);

  const pending = (async () => {
    const cache = 'caches' in window ? await window.caches.open(MOYEO_IMAGE_CACHE_NAME) : null;
    const cacheRequest = moyeoImageCacheRequest(source);
    const cachedResponse = cache ? await cache.match(cacheRequest) : null;
    if (cachedResponse) return URL.createObjectURL(await cachedResponse.blob());

    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const response = await fetch(source, { cache: 'force-cache' });
        if (!response.ok) throw new Error(`image request failed: ${response.status}`);
        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) throw new Error('image response has an invalid content type');
        if (cache) {
          await cache.put(cacheRequest, new Response(blob, { headers: { 'Content-Type': blob.type } }));
        }
        return URL.createObjectURL(blob);
      } catch (error) {
        lastError = error;
        // `TypeError: Failed to fetch` 는 CORS 차단의 신호다. 같은 오리진의 다음 이미지는
        // 재시도해도 결과가 같으니 플래그를 세워 두고 바로 포기한다.
        if (error instanceof TypeError && isCrossOriginImage(source)) {
          moyeoImageCorsBlocked = true;
          throw new MoyeoImageCorsError(source);
        }
        if (attempt < maxAttempts) {
          await new Promise((resolve) => window.setTimeout(resolve, 300 * attempt));
        }
      }
    }
    throw lastError || new Error('image request failed');
  })();

  moyeoImageMemoryCache.set(cacheKey, pending);
  try {
    return await pending;
  } catch (error) {
    moyeoImageMemoryCache.delete(cacheKey);
    throw error;
  }
}

// 이미지가 필수인 자리에 실제 이미지가 없을 때 쓰는 공용 플레이스홀더.
// 관광 데이터는 이미지가 간헐적으로 비어 있는데(한국관광공사 원본에 없는 콘텐츠가 있다),
// 화면기획은 이미지가 항상 있다고 보고 그려져 있다. 빈 자리를 그대로 두면 카드가 깨져 보인다.
// 앱·웹은 WEBP 를 쓴다 — 원본은 화면기획에 둔다.
const MOYEO_PLACEHOLDER_SOURCES = {
  square: 'assets/placeholder-square.webp',
  landscape: 'assets/placeholder-landscape.webp',
};

// ── 왜 `<img src>` 를 먼저 그리는가 ──
//
// 예전에는 **모든 이미지를 `fetch()` + blob 왕복 뒤로 미뤘다.** 그 사이에는 `fallback`
// (마스코트·동물 아바타)이 그려지므로 실사용에서 **아바타가 번쩍인 뒤 사진으로 갈렸고**,
// 캡처에서는 그 창에 스크린샷이 찍혔다. 07 후보 3장 중 **가장 큰 세 번째만 결정적으로**
// 아바타로 찍힌 것이 그 증거다(헤드리스 Chrome 의 `--virtual-time-budget` 은 가상 시간을
// 최대한 빨리 소진해 실제 네트워크가 따라오지 못한다).
//
// 그래서 순서를 뒤집었다:
//   ① Cache Storage 에 있으면 그 blob 을 쓴다 (오프라인·재방문에 강하다)
//   ② 없으면 **원본 URL 을 `<img src>` 로 곧바로 그린다** — 브라우저 HTTP 캐시가 캐싱을
//      맡고, `<img>` 는 CORS 가 필요 없으며 Chrome 의 로드 완료 판정에 포함된다.
//   ③ 동시에 백그라운드로 Cache Storage 를 채운다 (실패는 무시한다)
//   ④ `<img>` 까지 실패하면 그때 비로소 `fallback` — 즉 폴백은 **정말 이미지가 없을 때만**
//      나온다. 이게 "이미지 없음"과 "폴백이 그려짐"을 구분 가능하게 하는 유일한 방법이다.
function CachedImage({ src, alt = '', fallback = null, fallbackShape = null, onLoad, onError, ...props }) {
  // Cache Storage 에서 찾은 blob URL. 없으면 원본 URL 을 그대로 쓴다.
  const [cachedSource, setCachedSource] = React.useState('');
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setCachedSource('');
    setFailed(false);
    if (!src) return undefined;

    (async () => {
      const cached = await matchCachedMoyeoImage(src);
      if (cancelled) return;
      if (cached) {
        setCachedSource(cached);
        return;
      }
      // 캐시에 없으면 <img src> 가 이미 그려지고 있다. 다음 방문을 위해 조용히 채운다.
      fetchMoyeoImage(src).catch(() => {});
    })();

    return () => { cancelled = true; };
  }, [src]);

  const placeholderSource = fallbackShape ? MOYEO_PLACEHOLDER_SOURCES[fallbackShape] : null;
  if ((failed || !src) && placeholderSource) {
    return <img {...props} src={placeholderSource} alt={alt} onLoad={onLoad}/>;
  }
  if (failed || !src) return fallback;
  return (
    <img
      {...props}
      src={cachedSource || src}
      alt={alt}
      onLoad={onLoad}
      onError={(event) => {
        // 여기까지 왔으면 정말 이미지가 없는 것이다.
        setFailed(true);
        onError?.(event);
      }}
    />
  );
}

Object.assign(window, {
  CachedImage,
  MoyeoImageCache: {
    fetch: fetchMoyeoImage,
    fileName: moyeoImageFileName,
    maxAttempts: MOYEO_IMAGE_MAX_ATTEMPTS,
    placeholderSources: MOYEO_PLACEHOLDER_SOURCES,
    preload: preloadMoyeoImages,
    themeSource: moyeoThemeImageSource,
  },
});
