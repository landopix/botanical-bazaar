/**
 * Utility for title and meta description generation and length control for SEO.
 * Conditionally appends site name suffix if length <= 60 characters.
 * Truncates dynamic title text if it exceeds character limits (strictly max 60 chars).
 * Truncates meta description text if it exceeds character limits (strictly max 150 chars).
 */

export const DEFAULT_SITE_TITLE = 'The Botanical Bazaar St. Petersburg FL';
export const DEFAULT_SITE_DESCRIPTION = 'Discover rare tropical plants, collector aroids, specimen orchids, and medicinal flora at The Botanical Bazaar in St. Petersburg, FL. Standard shipping & local nursery pickup.';
export const DEFAULT_BRAND_BANNER = 'https://thebotanicalbazaar.com/assets/brand-banner.png';
export const DEFAULT_SITE_ORIGIN = 'https://thebotanicalbazaar.com';

export function formatTitle(rawTitle, suffix = ' | The Botanical Bazaar', limit = 60) {
  if (!rawTitle || typeof rawTitle !== 'string' || !rawTitle.trim()) {
    return DEFAULT_SITE_TITLE;
  }

  let clean = rawTitle.trim();

  // If clean title already ends with the suffix or part of it
  const cleanSuffix = suffix.trim();
  if (clean.endsWith(cleanSuffix)) {
    if (clean.length <= limit) return clean;
    // Strip suffix to evaluate base title
    clean = clean.slice(0, -cleanSuffix.length).trim();
  }

  // If appending suffix fits within limit
  if ((clean + suffix).length <= limit) {
    return clean + suffix;
  }

  // If clean title alone is under or equal to limit, return clean title
  if (clean.length <= limit) {
    return clean;
  }

  // Truncate clean title with ellipsis ensuring exact <= limit
  const truncated = clean.slice(0, limit - 1).trim() + '…';
  return truncated;
}

export function formatDescription(rawDescription, defaultDesc = DEFAULT_SITE_DESCRIPTION, limit = 150) {
  const desc = (rawDescription && typeof rawDescription === 'string' && rawDescription.trim())
    ? rawDescription.trim()
    : defaultDesc;

  if (desc.length <= limit) {
    return desc;
  }

  return desc.slice(0, limit - 1).trim() + '…';
}
