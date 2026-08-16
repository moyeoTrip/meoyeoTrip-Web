(function bootstrapMoyeoObservability() {
  const config = window.MOYEO_RUNTIME_CONFIG?.sentry || {};
  const dsn = typeof config.dsn === 'string' ? config.dsn.trim() : '';

  window.MoyeoObservability = {
    enabled: false,
    captureException(error, context) {
      window.Sentry?.captureException?.(error, context);
    },
    captureMessage(message, level = 'info') {
      window.Sentry?.captureMessage?.(message, level);
    },
  };

  if (!dsn) return;

  import('https://esm.sh/@sentry/browser@10.69.0?bundle')
    .then((Sentry) => {
      Sentry.init({
        dsn,
        environment: config.environment || 'production',
        release: config.release || undefined,
        tracesSampleRate: Number(config.tracesSampleRate || 0),
        sendDefaultPii: false,
      });
      window.Sentry = Sentry;
      window.MoyeoObservability.enabled = true;
    })
    .catch((error) => {
      console.warn('[moyeo] Sentry SDK를 초기화하지 못했습니다.', error);
    });
})();
