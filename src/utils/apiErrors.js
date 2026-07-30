/**
 * Extract a user-facing message from axios error responses.
 */
export function getApiErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (!err) return fallback;

  if (!err.response) {
    if (err.message === 'Network Error') {
      return 'Network error — cannot reach the API. Check REACT_APP_API_URL and backend CORS.';
    }
    return err.message || fallback;
  }

  const data = err.response.data;
  if (!data) return fallback;

  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }

  const joiDetail = data.error?.details?.[0]?.message;
  if (joiDetail) return joiDetail;

  return fallback;
}
