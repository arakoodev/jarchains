import * as Sentry from '@sentry/node';
import posthog from 'posthog-js';

export class Logger {
    private static instance: Logger;
    private sentryInitialized = false;
    private posthogInitialized = false;

    private constructor() {
        this.initializeSentry();
        this.initializePosthog();
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private initializeSentry() {
        if (process.env.SENTRY_DSN) {
            Sentry.init({
                dsn: process.env.SENTRY_DSN,
                tracesSampleRate: 1.0,
            });
            this.sentryInitialized = true;
        }
    }

    private initializePosthog() {
        if (process.env.POSTHOG_KEY) {
            posthog.init(process.env.POSTHOG_KEY, {
                api_host: process.env.POSTHOG_HOST || 'https://app.posthog.com'
            });
            this.posthogInitialized = true;
        }
    }

    public log(message: string, context?: Record<string, any>) {
        console.log(message, context);
        if (this.sentryInitialized) {
            Sentry.captureMessage(message, {
                level: 'info',
                extra: context
            });
        }
        if (this.posthogInitialized) {
            posthog.capture('log', {
                message,
                ...context
            });
        }
    }

    public error(message: string, error?: Error, context?: Record<string, any>) {
        console.error(message, error, context);
        if (this.sentryInitialized) {
            Sentry.captureException(error || new Error(message), {
                extra: context
            });
        }
        if (this.posthogInitialized) {
            posthog.capture('error', {
                message,
                error: error?.message,
                ...context
            });
        }
    }
}
