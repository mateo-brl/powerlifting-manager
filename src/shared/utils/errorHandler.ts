/**
 * Centralized error handling utilities for Powerlifting Manager
 */

export type ErrorSeverity = 'critical' | 'error' | 'warning' | 'info';

export interface AppError {
  code: string;
  message: string;
  severity: ErrorSeverity;
  context?: Record<string, unknown>;
  timestamp: Date;
  stack?: string;
}

// Error codes for consistent error handling
export const ErrorCodes = {
  // Database errors
  DB_CONNECTION_FAILED: 'DB_001',
  DB_QUERY_FAILED: 'DB_002',
  DB_MIGRATION_FAILED: 'DB_003',

  // Competition errors
  COMPETITION_NOT_FOUND: 'COMP_001',
  COMPETITION_ALREADY_ACTIVE: 'COMP_002',
  COMPETITION_INVALID_STATE: 'COMP_003',

  // Athlete errors
  ATHLETE_NOT_FOUND: 'ATH_001',
  ATHLETE_DUPLICATE: 'ATH_002',
  ATHLETE_INVALID_DATA: 'ATH_003',

  // Attempt errors
  ATTEMPT_INVALID_WEIGHT: 'ATT_001',
  ATTEMPT_OUT_OF_ORDER: 'ATT_002',
  ATTEMPT_LIMIT_EXCEEDED: 'ATT_003',

  // Weigh-in errors
  WEIGHIN_INVALID_WEIGHT: 'WI_001',
  WEIGHIN_OUTSIDE_CLASS: 'WI_002',

  // WebSocket errors
  WS_CONNECTION_FAILED: 'WS_001',
  WS_BROADCAST_FAILED: 'WS_002',

  // General errors
  UNKNOWN_ERROR: 'GEN_001',
  VALIDATION_ERROR: 'GEN_002',
  NETWORK_ERROR: 'GEN_003',
} as const;

/**
 * Error history for debugging
 */
const errorHistory: AppError[] = [];
const MAX_ERROR_HISTORY = 100;

/**
 * Creates a structured application error
 */
export function createAppError(
  code: string,
  message: string,
  severity: ErrorSeverity = 'error',
  context?: Record<string, unknown>
): AppError {
  const error: AppError = {
    code,
    message,
    severity,
    context,
    timestamp: new Date(),
    stack: new Error().stack,
  };

  // Add to history
  errorHistory.unshift(error);
  if (errorHistory.length > MAX_ERROR_HISTORY) {
    errorHistory.pop();
  }

  return error;
}

/**
 * Logs an error with consistent formatting
 */
export function logError(error: AppError | Error | unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const prefix = context ? `[${context}]` : '[Error]';

  if (error instanceof Error) {
    console.error(`${timestamp} ${prefix} ${error.message}`, {
      name: error.name,
      stack: error.stack,
    });
  } else if (isAppError(error)) {
    const severityEmoji = {
      critical: '💥',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };
    console.error(
      `${timestamp} ${severityEmoji[error.severity]} ${prefix} [${error.code}] ${error.message}`,
      error.context || {}
    );
  } else {
    console.error(`${timestamp} ${prefix}`, error);
  }
}

/**
 * Type guard for AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'severity' in error
  );
}

/**
 * Wraps an async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorCode: string,
  errorMessage: string,
  context?: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const appError = createAppError(
      errorCode,
      errorMessage,
      'error',
      { originalError: error instanceof Error ? error.message : String(error) }
    );
    logError(appError, context);
    return null;
  }
}

/**
 * Gets recent error history for debugging
 */
export function getErrorHistory(limit = 10): AppError[] {
  return errorHistory.slice(0, limit);
}

/**
 * Clears error history
 */
export function clearErrorHistory(): void {
  errorHistory.length = 0;
}

/**
 * User-friendly error messages
 */
export const UserFriendlyMessages: Record<string, { en: string; fr: string }> = {
  [ErrorCodes.DB_CONNECTION_FAILED]: {
    en: 'Unable to connect to database. Please restart the application.',
    fr: 'Impossible de se connecter à la base de données. Veuillez redémarrer l\'application.',
  },
  [ErrorCodes.COMPETITION_NOT_FOUND]: {
    en: 'Competition not found.',
    fr: 'Compétition introuvable.',
  },
  [ErrorCodes.ATHLETE_NOT_FOUND]: {
    en: 'Athlete not found.',
    fr: 'Athlète introuvable.',
  },
  [ErrorCodes.ATTEMPT_INVALID_WEIGHT]: {
    en: 'Invalid weight. Please check the rules.',
    fr: 'Poids invalide. Veuillez vérifier les règles.',
  },
  [ErrorCodes.WEIGHIN_OUTSIDE_CLASS]: {
    en: 'Bodyweight is outside the registered weight class.',
    fr: 'Le poids corporel est en dehors de la catégorie inscrite.',
  },
  [ErrorCodes.NETWORK_ERROR]: {
    en: 'Network error. Please check your connection.',
    fr: 'Erreur réseau. Veuillez vérifier votre connexion.',
  },
  [ErrorCodes.UNKNOWN_ERROR]: {
    en: 'An unexpected error occurred. Please try again.',
    fr: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
  },
};

/**
 * Gets user-friendly message for an error code
 */
export function getUserMessage(code: string, locale: 'en' | 'fr' = 'fr'): string {
  const messages = UserFriendlyMessages[code];
  if (messages) {
    return messages[locale];
  }
  return UserFriendlyMessages[ErrorCodes.UNKNOWN_ERROR][locale];
}
