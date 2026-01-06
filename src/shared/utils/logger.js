/**
 * Production-safe logger utility
 * 
 * Behavior:
 * - Development: All levels log to console
 * - Production: debug/info no-op, warn/error remain active
 * 
 * Usage:
 *   import logger from './shared/utils/logger';
 *   logger.debug('Debug message');
 *   logger.info('Info message');
 *   logger.warn('Warning message');
 *   logger.error('Error message');
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

class Logger {
  /**
   * Debug level - only in development
   * No-op in production
   */
  debug(...args) {
    if (isDevelopment) {
      console.debug(...args);
    }
  }

  /**
   * Info level - only in development
   * No-op in production
   */
  info(...args) {
    if (isDevelopment) {
      console.info(...args);
    }
  }

  /**
   * Warning level - always active (dev and production)
   * In production, warnings are still logged for monitoring
   */
  warn(...args) {
    console.warn(...args);
  }

  /**
   * Error level - always active (dev and production)
   * In production, errors are logged and should be sent to error reporting service
   */
  error(...args) {
    console.error(...args);
    
    // In production, also send to error reporting service (when implemented)
    if (isProduction) {
      // TODO: Send to error reporting service (e.g., Sentry)
      // errorReportingService.captureException(new Error(args.join(' ')));
    }
  }

  /**
   * Log level - alias for info (for backward compatibility)
   * Only in development
   */
  log(...args) {
    if (isDevelopment) {
      console.log(...args);
    }
  }
}

export const logger = new Logger();
export default logger;

