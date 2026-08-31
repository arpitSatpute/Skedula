import { toast } from 'react-toastify';

/**
 * Centralized API Error Parser for Skedula.
 * Extracts clean, human-readable error messages without leaking
 * technical stack traces, verbose Java exception dumps, or raw JSON.
 */
export const parseApiError = (error, fallbackMessage = 'An unexpected error occurred. Please try again.') => {
  if (!error) return fallbackMessage;

  // 1. If error is already a clean string
  if (typeof error === 'string') {
    return sanitizeMessage(error, fallbackMessage);
  }

  // 2. Check if cleanMessage was already attached by ApiClient interceptor
  if (error.cleanMessage && typeof error.cleanMessage === 'string') {
    return error.cleanMessage;
  }

  // 3. Check for network / connection failure
  if (error.code === 'ERR_NETWORK' || !error.response) {
    if (error.message && error.message.includes('Network Error')) {
      return 'Unable to reach the server. Please check your internet connection.';
    }
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. The server took too long to respond.';
    }
  }

  const response = error.response;
  if (!response) {
    return error.message ? sanitizeMessage(error.message, fallbackMessage) : fallbackMessage;
  }

  const { status, data } = response;

  // 4. Extract message from structured backend ApiResponse / ApiError
  let extracted = null;

  if (data) {
    // Structured Spring Boot ApiResponse: { error: { message, subErrors } }
    if (data.error && typeof data.error === 'object') {
      if (Array.isArray(data.error.subErrors) && data.error.subErrors.length > 0) {
        extracted = data.error.subErrors[0];
      } else if (data.error.message) {
        extracted = data.error.message;
      }
    } else if (typeof data.error === 'string') {
      extracted = data.error;
    }

    // Standard Spring Boot default error attributes: { message: "..." }
    if (!extracted && data.message && typeof data.message === 'string') {
      extracted = data.message;
    }
  }

  // 5. Status code-based fallbacks if message is missing or generic
  if (!extracted || isTechnicalJargon(extracted)) {
    switch (status) {
      case 400:
        return 'Invalid request details. Please check your input and try again.';
      case 401:
        return 'Session expired or authentication required. Please sign in.';
      case 403:
        return 'Access denied. You do not have permission for this action.';
      case 404:
        return 'The requested resource or sanctuary could not be found.';
      case 409:
        return 'A scheduling or record conflict was detected. Please choose a different slot.';
      case 422:
        return 'Unprocessable request. Please verify the provided data.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again shortly.';
      default:
        return fallbackMessage;
    }
  }

  return sanitizeMessage(extracted, fallbackMessage);
};

/**
 * Filter out Java stack traces, SQL errors, or internal class names
 */
const isTechnicalJargon = (str) => {
  if (!str) return true;
  const lower = str.toLowerCase();
  return (
    lower.includes('exception') ||
    lower.includes('sql') ||
    lower.includes('hibernate') ||
    lower.includes('nullpointer') ||
    lower.includes('cannot deserialize') ||
    lower.includes('nested exception') ||
    lower.includes('stacktrace') ||
    lower.includes('internal server error') ||
    lower.startsWith('com.arpit') ||
    lower.startsWith('org.springframework')
  );
};

/**
 * Sanitize and truncate the error message to keep UI toasts concise
 */
const sanitizeMessage = (msg, fallback) => {
  if (!msg || typeof msg !== 'string') return fallback;
  
  if (isTechnicalJargon(msg)) {
    return fallback;
  }

  // Remove trailing internal error codes or technical prefixes like "Error: "
  let cleaned = msg.replace(/^(error:|exception:|failed:)\s*/i, '').trim();

  // Ensure first letter is capitalized
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  // Truncate if excessively long
  if (cleaned.length > 120) {
    cleaned = cleaned.substring(0, 117) + '...';
  }

  return cleaned;
};

/**
 * Display a clean, sanitized toast message for any error
 */
export const showErrorToast = (error, fallbackMessage) => {
  const msg = parseApiError(error, fallbackMessage);
  toast.error(msg);
  return msg;
};
