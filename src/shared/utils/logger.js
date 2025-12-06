/**
 * Production-safe logger utility
 * Removes console logs in production builds
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

class Logger {
  log(...args) {
    if (isDevelopment) {
      console.log(...args);
    }
  }

  error(...args) {
    // In production, only send to error reporting service (don't log to console)
    if (isProduction) {
      // TODO: Send to error reporting service (e.g., Sentry)
      // errorReportingService.captureException(new Error(args.join(' ')));
      // Do NOT log to console in production to prevent leaking sensitive data
      return;
    }
    console.error(...args);
  }

  warn(...args) {
    if (isDevelopment) {
      console.warn(...args);
    }
  }

  debug(...args) {
    if (isDevelopment) {
      console.debug(...args);
    }
  }

  info(...args) {
    if (isDevelopment) {
      console.info(...args);
    }
  }
}

export const logger = new Logger();
export default logger;

