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
import { captureError } from "../services/errorMonitoring";

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

    // In development, keep errors local to console only
    if (!isProduction) return;

    try {
      const [first, ...rest] = args;
      const baseError =
        first instanceof Error ? first : new Error(String(first || 'Unknown error'));

      const hasAdditional = rest && rest.length > 0;

      captureError(baseError, {
        source: 'logger',
        hasAdditionalContext: hasAdditional,
      });
    } catch {
      // Never let monitoring failures break the app
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

