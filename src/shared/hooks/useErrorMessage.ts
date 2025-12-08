import { message, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { getUserMessage, ErrorCodes, logError, createAppError } from '../utils/errorHandler';

interface UseErrorMessageReturn {
  showError: (errorCode: string, details?: string) => void;
  showSuccess: (messageKey: string, defaultMessage?: string) => void;
  showWarning: (messageKey: string, defaultMessage?: string) => void;
  showInfo: (messageKey: string, defaultMessage?: string) => void;
  handleError: (error: unknown, context?: string) => void;
}

/**
 * Hook for showing user-friendly error messages with i18n support
 */
export function useErrorMessage(): UseErrorMessageReturn {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'fr' ? 'fr' : 'en';

  const showError = useCallback((errorCode: string, details?: string) => {
    const userMessage = getUserMessage(errorCode, locale);

    notification.error({
      message: t('common.error'),
      description: details ? `${userMessage}\n\n${details}` : userMessage,
      duration: 5,
      placement: 'topRight',
    });
  }, [locale, t]);

  const showSuccess = useCallback((messageKey: string, defaultMessage?: string) => {
    const msg = t(messageKey, defaultMessage || messageKey);
    message.success(msg);
  }, [t]);

  const showWarning = useCallback((messageKey: string, defaultMessage?: string) => {
    const msg = t(messageKey, defaultMessage || messageKey);
    message.warning(msg);
  }, [t]);

  const showInfo = useCallback((messageKey: string, defaultMessage?: string) => {
    const msg = t(messageKey, defaultMessage || messageKey);
    message.info(msg);
  }, [t]);

  const handleError = useCallback((error: unknown, context?: string) => {
    // Log the error
    logError(error, context);

    // Determine error code
    let errorCode: string = ErrorCodes.UNKNOWN_ERROR;
    let details: string | undefined;

    if (error instanceof Error) {
      details = error.message;

      // Try to determine specific error type
      const msg = error.message.toLowerCase();
      if (msg.includes('network') || msg.includes('fetch')) {
        errorCode = ErrorCodes.NETWORK_ERROR;
      } else if (msg.includes('database') || msg.includes('sqlite')) {
        errorCode = ErrorCodes.DB_QUERY_FAILED;
      } else if (msg.includes('not found')) {
        if (msg.includes('athlete')) {
          errorCode = ErrorCodes.ATHLETE_NOT_FOUND;
        } else if (msg.includes('competition')) {
          errorCode = ErrorCodes.COMPETITION_NOT_FOUND;
        }
      }
    }

    // Create and log app error
    createAppError(errorCode, details || 'Unknown error', 'error', { context });

    // Show user-friendly message
    showError(errorCode, details);
  }, [showError]);

  return {
    showError,
    showSuccess,
    showWarning,
    showInfo,
    handleError,
  };
}

/**
 * Export error codes for easy access
 */
export { ErrorCodes };
