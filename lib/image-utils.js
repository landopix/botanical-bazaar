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
 * Appends WebP compression parameters (&auto=format&fit=max&q=75) to Sanity and Shopify image URLs.
 */
export function optimizeCdnUrl(url, { quality = 75, fit = 'max', format = 'auto' } = {}) {
  if (!url || typeof url !== 'string') return url;
  try {
    const parsed = new URL(url, 'https://thebotanicalbazaar.com');
    if (parsed.hostname === 'cdn.sanity.io') {
      if (!parsed.searchParams.has('auto')) parsed.searchParams.set('auto', format);
      if (!parsed.searchParams.has('fit')) parsed.searchParams.set('fit', fit);
      if (!parsed.searchParams.has('q')) parsed.searchParams.set('q', String(quality));
      return parsed.toString();
    }
    if (parsed.hostname === 'cdn.shopify.com') {
      // Shopify supports format and width/quality parameters if applicable
      return parsed.toString();
    }
    return url;
  } catch (err) {
    return url;
  }
}

/**
 * Backward compatibility alias for isSanityCdnUrl.
 */
export function isSanityCdnUrl(url) {
  return isOptimizedCdnUrl(url);
}
