/**
 * Safely checks if an image URL originates from an allowed CDN (Sanity or Shopify CDN).
 * Uses strict URL parsing to prevent CodeQL arbitrary host substring bypasses.
 */
export function isOptimizedCdnUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url, 'https://thebotanicalbazaar.com');
    return parsed.hostname === 'cdn.sanity.io' || parsed.hostname === 'cdn.shopify.com';
  } catch (err) {
    return false;
  }
}

/**
 * Backward compatibility alias for isSanityCdnUrl.
 */
export function isSanityCdnUrl(url) {
  return isOptimizedCdnUrl(url);
}
