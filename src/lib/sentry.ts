import * as Sentry from '@sentry/react';

// Only initialize Sentry if we have a valid DSN
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

export function initSentry() {
  // Check if DSN is provided and valid
  if (sentryDsn && sentryDsn.length > 10) {
    try {
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
      console.log('Sentry initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  } else {
    console.log('Sentry not initialized: No valid DSN provided');
  }
}

export const SentryErrorBoundary = Sentry.ErrorBoundary;
export { Sentry };