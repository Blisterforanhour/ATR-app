import * as Sentry from '@sentry/react';

// Only initialize Sentry if we have a valid DSN
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

// Check if DSN is provided and not a placeholder value
if (sentryDsn && sentryDsn !== 'your_sentry_dsn' && sentryDsn.startsWith('https://')) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.VITE_ENVIRONMENT || 'development',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: import.meta.env.VITE_ENVIRONMENT === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
} else {
  console.log('Sentry not initialized: No valid DSN provided');
}

export { Sentry };