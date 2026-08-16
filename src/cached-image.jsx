const MOYEO_IMAGE_CACHE_NAME = 'moyeo-images-v1';
const MOYEO_IMAGE_MAX_ATTEMPTS = 3;
const moyeoImageMemoryCache = new Map();
const moyeoImagePreloadCache = new Map();

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

function moyeoImageCacheRequest(source) {
  const fileName = moyeoImageFileName(source);
  return new Request(new URL(`/__moyeo_image_cache__/${encodeURIComponent(fileName)}`, window.location.origin));
}

async function fetchMoyeoImage(source, maxAttempts = MOYEO_IMAGE_MAX_ATTEMPTS) {
  if (!source) throw new Error('image source is empty');
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

function CachedImage({ src, alt = '', fallback = null, onLoad, onError, ...props }) {
  const [resolvedSource, setResolvedSource] = React.useState('');
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setResolvedSource('');
    setFailed(false);
    fetchMoyeoImage(src)
      .then((nextSource) => {
        if (!cancelled) setResolvedSource(nextSource);
      })
      .catch((error) => {
        if (cancelled) return;
        setFailed(true);
        onError?.(error);
      });
    return () => { cancelled = true; };
  }, [src]);

  if (failed || !resolvedSource) return fallback;
  return <img {...props} src={resolvedSource} alt={alt} onLoad={onLoad}/>;
}

Object.assign(window, {
  CachedImage,
  MoyeoImageCache: {
    fetch: fetchMoyeoImage,
    fileName: moyeoImageFileName,
    maxAttempts: MOYEO_IMAGE_MAX_ATTEMPTS,
    preload: preloadMoyeoImages,
    themeSource: moyeoThemeImageSource,
  },
});
