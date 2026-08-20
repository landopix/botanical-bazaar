/**
 * Safely checks if an image URL originates from Sanity CDN.
 * Uses strict URL parsing to prevent CodeQL arbitrary host substring bypasses.
 */
export function isSanityCdnUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url, 'https://thebotanicalbazaar.com');
    return parsed.hostname === 'cdn.sanity.io';
  } catch (err) {
    return false;
  }
}
