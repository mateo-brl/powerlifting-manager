/**
 * Structured logging utility for Powerlifting Manager
 * Provides consistent logging across the application with log levels and context
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: Record<string, unknown>;
}

// Log levels configuration
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Current minimum log level (can be configured)
// Set to 'error' in production to disable verbose logging
const IS_PRODUCTION = typeof window !== 'undefined' &&
  (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1'));
let currentLogLevel: LogLevel = IS_PRODUCTION ? 'error' : 'info';

// Log history for debugging
const logHistory: LogEntry[] = [];
const MAX_LOG_HISTORY = 500;

/**
 * Sets the minimum log level
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

/**
 * Creates a logger with a specific context
 */
export function createLogger(context: string) {
  const shouldLog = (level: LogLevel): boolean => {
    return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel];
  };

  const formatMessage = (level: LogLevel, message: string): string => {
    const timestamp = new Date().toISOString();
    return `${timestamp} [${level.toUpperCase()}] [${context}] ${message}`;
  };

  const addToHistory = (entry: LogEntry): void => {
    logHistory.unshift(entry);
    if (logHistory.length > MAX_LOG_HISTORY) {
      logHistory.pop();
    }
  };

  const log = (level: LogLevel, message: string, data?: Record<string, unknown>): void => {
    if (!shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const entry: LogEntry = { timestamp, level, context, message, data };
    addToHistory(entry);

    const formattedMessage = formatMessage(level, message);

    switch (level) {
      case 'debug':
        console.debug(formattedMessage, data || '');
        break;
      case 'info':
        console.info(formattedMessage, data || '');
        break;
      case 'warn':
        console.warn(formattedMessage, data || '');
        break;
      case 'error':
        console.error(formattedMessage, data || '');
        break;
    }
  };

  return {
    debug: (message: string, data?: Record<string, unknown>) => log('debug', message, data),
    info: (message: string, data?: Record<string, unknown>) => log('info', message, data),
    warn: (message: string, data?: Record<string, unknown>) => log('warn', message, data),
    error: (message: string, data?: Record<string, unknown>) => log('error', message, data),

    /**
     * Log with timing - useful for performance monitoring
     */
    time: (label: string) => {
      const start = performance.now();
      return {
        end: (data?: Record<string, unknown>) => {
          const duration = performance.now() - start;
          log('debug', `${label} completed in ${duration.toFixed(2)}ms`, {
            ...data,
            durationMs: duration,
          });
        },
      };
    },

    /**
     * Log a function execution with error handling
     */
    async track<T>(
      label: string,
      fn: () => Promise<T>,
      data?: Record<string, unknown>
    ): Promise<T> {
      const timer = this.time(label);
      try {
        const result = await fn();
        timer.end({ ...data, success: true });
        return result;
      } catch (error) {
        log('error', `${label} failed`, {
          ...data,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
  };
}

/**
 * Gets log history for debugging
 */
export function getLogHistory(
  options: {
    limit?: number;
    level?: LogLevel;
    context?: string;
  } = {}
): LogEntry[] {
  let filtered = [...logHistory];

  if (options.level) {
    filtered = filtered.filter(
      (entry) => LOG_LEVELS[entry.level] >= LOG_LEVELS[options.level!]
    );
  }

  if (options.context) {
    filtered = filtered.filter((entry) =>
      entry.context.toLowerCase().includes(options.context!.toLowerCase())
    );
  }

  return filtered.slice(0, options.limit || 50);
}

/**
 * Clears log history
 */
export function clearLogHistory(): void {
  logHistory.length = 0;
}

/**
 * Exports log history as JSON (for debugging/support)
 */
export function exportLogs(): string {
  return JSON.stringify(logHistory, null, 2);
}

// Pre-configured loggers for common contexts
export const appLogger = createLogger('App');
export const competitionLogger = createLogger('Competition');
export const athleteLogger = createLogger('Athlete');
export const attemptLogger = createLogger('Attempt');
export const broadcastLogger = createLogger('Broadcast');
export const dbLogger = createLogger('Database');
