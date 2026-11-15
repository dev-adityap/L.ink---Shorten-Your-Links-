import crypto from 'crypto';

/**
 * Generates a unique 6-character short ID using the native crypto module.
 * Uses a URL-safe alphanumeric charset.
 */
export const generateShortId = () => {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(6);
  let id = '';
  for (let i = 0; i < 6; i += 1) {
    id += charset[bytes[i] % charset.length];
  }
  return id;
};
