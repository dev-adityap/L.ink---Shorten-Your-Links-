/**
 * Configurable API base URL.
 * Defaults to http://localhost:5000 for local development.
 * Override via VITE_API_URL env var for production deployments.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Extracts UTM parameters from the current page URL for attribution tracking.
 * Returns an object with utm_source, utm_medium, utm_campaign, utm_term, utm_content.
 */
export function getUTMParams() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const utmParams = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((key) => {
    const value = params.get(key);
    if (value) utmParams[key] = value;
  });
  return utmParams;
}

export const shortenUrl = async (originalUrl) => {
  const response = await fetch(`${API_BASE_URL}/api/shorten`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to shorten URL');
  }

  return response.json();
};
