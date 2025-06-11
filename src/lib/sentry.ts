import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  const environment = import.meta.env.VITE_ENVIRONMENT || 'development'

  if (!dsn) {
    console.warn('Sentry DSN not provided, error tracking disabled')
    return
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        )
      })
    ],
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    beforeSend(event) {
      // Filter out development errors
      if (environment === 'development') {
        return null
      }
      return event
    }
  })
}

// Error boundary component
export const SentryErrorBoundary = Sentry.withErrorBoundary