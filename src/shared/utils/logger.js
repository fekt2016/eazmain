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
    // Always log errors, but in production send to error reporting service
    if (isProduction) {
      // TODO: Send to error reporting service (e.g., Sentry)
      // errorReportingService.captureException(new Error(args.join(' ')));
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

