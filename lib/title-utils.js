/**
 * Utility for title generation and length control for SEO.
 * Conditionally appends site name suffix if length <= 60 characters.
 * Truncates dynamic title text if it exceeds character limits.
 */
export function formatTitle(rawTitle, suffix = ' | The Botanical Bazaar', limit = 60) {
  if (!rawTitle || typeof rawTitle !== 'string') {
    return 'The Botanical Bazaar St. Petersburg FL';
  }

  let clean = rawTitle.trim();

  // If clean title already includes suffix or part of brand, check length
  if (clean.endsWith(suffix.trim())) {
    if (clean.length <= limit) return clean;
    // Strip suffix to evaluate base
    clean = clean.slice(0, -suffix.trim().length).trim();
  }

  // If appending suffix fits within limit
  if ((clean + suffix).length <= limit) {
    return clean + suffix;
  }

  // If clean title alone is under or equal to limit, return clean title
  if (clean.length <= limit) {
    return clean;
  }

  // Truncate clean title with ellipsis or clean boundary
  const truncated = clean.slice(0, limit - 1).trim() + '…';
  return truncated;
}
