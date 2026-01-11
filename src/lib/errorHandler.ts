/**
 * Sanitizes error messages for user-facing display.
 * Prevents exposure of internal implementation details while providing helpful feedback.
 */
export const sanitizeError = (error: unknown): string => {
  // Log full details only in development
  if (import.meta.env.DEV) {
    console.error('[Error Details]', error);
  }

  const errorMessage = error instanceof Error 
    ? error.message 
    : typeof error === 'object' && error !== null && 'message' in error 
      ? String((error as { message: unknown }).message)
      : String(error);

  // Map known errors to user-friendly messages
  const errorMap: Record<string, string> = {
    'invalid login credentials': 'Invalid email or password. Please try again.',
    'user already registered': 'This email is already registered. Please sign in instead.',
    'email not confirmed': 'Please check your email to confirm your account.',
    'duplicate key': 'This record already exists.',
    'foreign key': 'Invalid reference provided.',
    'violates row-level security': 'You do not have permission for this action.',
    'violates': 'Invalid data submitted.',
    'permission denied': 'You do not have permission for this action.',
    'not found': 'The requested resource was not found.',
    'network': 'Network error. Please check your connection.',
    'timeout': 'Request timed out. Please try again.',
    'too many requests': 'Too many requests. Please wait a moment.',
  };

  const lowerMessage = errorMessage.toLowerCase();
  
  for (const [key, message] of Object.entries(errorMap)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return message;
    }
  }

  // Generic fallback - don't expose raw error messages
  return 'An error occurred. Please try again or contact support.';
};
