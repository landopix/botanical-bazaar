/**
 * Unified Fulfillment Rules & Agricultural Restrictions Config
 * The Botanical Bazaar (St. Petersburg, FL)
 */

export const FULFILLMENT_CONFIG = {
  origin: {
    city: 'St. Petersburg',
    state: 'FL',
    zip: '33701',
    name: 'The Botanical Bazaar Nursery'
  },
  weatherHolds: {
    advisoryTempF: 45, // Zone temperature below 45°F triggers weather hold advisory
    hardHoldTempF: 32, // Temperature under 32°F requires mandatory heat pack / dispatch hold
    messageAdvisory: "Destination temperatures are currently cool (< 45°F). Insulated botanical packaging will be automatically applied.",
    messageHardHold: "Severe cold weather hold active (< 32°F). Shipments will be dispatched upon thermal recovery or with heat pack protection."
  },
  agRestrictions: [
    {
      code: 'FL_CITRUS_REG',
      tags: ['citrus', 'no-out-of-state', 'fl-only'],
      productTypes: ['Citrus', 'Citrus Tree', 'Citrus Plant'],
      restrictedStates: ['ALL_EXCEPT_FL'], // Cannot ship outside FL
      title: 'Florida Citrus Regulation Notice',
      description: 'Per Florida Dept. of Agriculture & Consumer Services (FDACS) rules, citrus specimens cannot be shipped outside the state of Florida to protect against citrus greening.'
    }
  ]
};

/**
 * Checks if a product has agricultural shipping restrictions.
 */
export function checkAgRestrictions(product, destinationState = '') {
  if (!product) return { isRestricted: false };

  const tags = Array.isArray(product.tags) ? product.tags.map(t => t.toLowerCase()) : [];
  const pType = (product.type || product.productType || '').toLowerCase();
  const name = (product.name || '').toLowerCase();

  const isCitrus = tags.includes('citrus') || tags.includes('fl-only') || tags.includes('no-out-of-state') ||
                  pType.includes('citrus') || name.includes('citrus');

  if (isCitrus) {
    const isOutofState = destinationState && destinationState.toUpperCase() !== 'FL';
    return {
      isRestricted: true,
      code: 'FL_CITRUS_REG',
      title: 'Florida Citrus Regulation',
      badge: 'FL Native / In-State Shipping Only',
      message: 'FL Dept. of Agriculture rules prohibit shipping live citrus out of Florida.',
      blocksOutofState: isOutofState
    };
  }

  return { isRestricted: false };
}

/**
 * Checks weather hold status based on target temperature or zone threshold.
 */
export function checkWeatherHoldStatus(tempF) {
  if (tempF === undefined || tempF === null) return { status: 'NORMAL' };

  if (tempF < FULFILLMENT_CONFIG.weatherHolds.hardHoldTempF) {
    return {
      status: 'HARD_HOLD',
      badge: 'MANDATORY WEATHER HOLD (<32°F)',
      message: FULFILLMENT_CONFIG.weatherHolds.messageHardHold
    };
  }

  if (tempF < FULFILLMENT_CONFIG.weatherHolds.advisoryTempF) {
    return {
      status: 'ADVISORY',
      badge: 'INSULATED THERMAL PACKAGING (<45°F)',
      message: FULFILLMENT_CONFIG.weatherHolds.messageAdvisory
    };
  }

  return { status: 'NORMAL' };
}


/**
 * Evaluates USDA zone compatibility for a product against a target user hardiness zone.
 */
export function getZoneCompatibility(product, userZone = "10a") {
  if (!product) return { badgeLabel: "Seasonal Culture", badgeColor: "#D4B06A", matchStatus: "SEASONAL" };

  const zones = Array.isArray(product.zones) ? product.zones.map(z => z.toLowerCase().trim()) : [];
  const userZoneClean = (userZone || "10a").toLowerCase().trim();
  const userNum = parseFloat(userZoneClean);

  let matchStatus = "SEASONAL";
  let badgeLabel = "Seasonal Culture";
  let badgeColor = "#D4B06A";

  if (zones.length > 0) {
    const isDirectMatch = zones.includes(userZoneClean) || zones.some(z => z.replace(/[a-b]/g, "") === userZoneClean.replace(/[a-b]/g, ""));

    if (isDirectMatch) {
      matchStatus = "GOOD_FIT";
      badgeLabel = "Good Fit Outdoors";
      badgeColor = "#249160";
    } else {
      const minZone = Math.min(...zones.map(z => parseFloat(z)).filter(n => !isNaN(n)));
      if (!isNaN(minZone) && userNum < minZone) {
        matchStatus = "NOT_RECOMMENDED";
        badgeLabel = "Not Recommended Outdoors";
        badgeColor = "#ba2f2f";
      }
    }
  }

  return { badgeLabel, badgeColor, matchStatus };
}

/**
 * Helper to parse zone string into numeric rank for inclusive range checking.
 * e.g., "9a" -> 9.0, "9b" -> 9.5, "9" -> 9.0 (if min) or 9.5 (if max).
 */
export function parseZoneRank(zoneStr, isMax = false) {
  if (!zoneStr) return null;
  const match = String(zoneStr).toLowerCase().match(/(\d+)\s*([ab])?/);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  const letter = match[2];
  let offset = 0;
  if (letter === "a") offset = 0.0;
  else if (letter === "b") offset = 0.5;
  else offset = isMax ? 0.5 : 0.0;
  return num + offset;
}

/**
 * Checks if a selected user zone falls inclusively within a product hardy zone range.
 */
export function isZoneCompatible(selectedZone, product) {
  if (!selectedZone) return true;
  const targetRank = parseZoneRank(selectedZone);
  if (targetRank === null) return true;

  const rawZoneStrings = [];
  if (product?.custom?.hardiness_zone) {
    rawZoneStrings.push(product.custom.hardiness_zone);
  }
  if (product?.custom?.taxonomy_hardiness_zone) {
    if (typeof product.custom.taxonomy_hardiness_zone === 'string') {
      try {
        const parsed = JSON.parse(product.custom.taxonomy_hardiness_zone);
        if (Array.isArray(parsed)) {
          parsed.forEach(z => rawZoneStrings.push(String(z)));
        } else {
          rawZoneStrings.push(String(parsed));
        }
      } catch (e) {
        rawZoneStrings.push(product.custom.taxonomy_hardiness_zone);
      }
    }
  }
  if (Array.isArray(product?.zones)) {
    rawZoneStrings.push(...product.zones);
  }
  if (Array.isArray(product?.tags)) {
    product.tags.forEach(t => {
      if (t.toLowerCase().includes("zone")) rawZoneStrings.push(t);
    });
  }

  if (rawZoneStrings.length === 0) return true;

  for (const raw of rawZoneStrings) {
    if (!raw) continue;
    const str = String(raw).toLowerCase().trim();

    const targetClean = selectedZone.toLowerCase().trim();
    if (str.includes(targetClean)) return true;

    // Range match like "9a-11b", "9-11", "zone 9 to 11"
    const rangeMatch = str.match(/(\d+\s*[ab]?)\s*(?:-|–|to)\s*(\d+\s*[ab]?)/);
    if (rangeMatch) {
      const minRank = parseZoneRank(rangeMatch[1], false);
      const maxRank = parseZoneRank(rangeMatch[2], true);
      if (minRank !== null && maxRank !== null) {
        if (targetRank >= minRank && targetRank <= maxRank) {
          return true;
        }
      }
    }

    const allTokens = str.match(/\d+\s*[ab]?/g);
    if (allTokens && allTokens.length > 0) {
      const ranks = allTokens.map(t => parseZoneRank(t)).filter(r => r !== null);
      if (ranks.length > 0) {
        const minRank = Math.min(...ranks);
        let maxRank = Math.max(...ranks);
        const lastToken = allTokens[allTokens.length - 1];
        if (!lastToken.includes("a") && !lastToken.includes("b")) {
          maxRank += 0.5;
        }
        if (targetRank >= minRank && targetRank <= maxRank) {
          return true;
        }
      }
    }
  }

  return false;
}



const ALL_STANDARD_ZONES = ['3a','3b','4a','4b','5a','5b','6a','6b','7a','7b','8a','8b','9a','9b','10a','10b','11a','11b','12a','12b','13a','13b'];
const DEFAULT_STORE_ZONES = ['8a', '8b', '9a', '9b', '10a', '10b', '11a', '11b'];

/**
 * Parses raw zone string or zone metadata into raw string array.
 */
export function getProductZoneStrings(product) {
  if (!product) return [];
  const rawZoneStrings = [];

  if (product?.custom?.hardiness_zone) {
    rawZoneStrings.push(product.custom.hardiness_zone);
  }
  if (product?.custom?.taxonomy_hardiness_zone) {
    if (typeof product.custom.taxonomy_hardiness_zone === 'string') {
      try {
        const parsed = JSON.parse(product.custom.taxonomy_hardiness_zone);
        if (Array.isArray(parsed)) {
          parsed.forEach(z => rawZoneStrings.push(String(z)));
        } else {
          rawZoneStrings.push(String(parsed));
        }
      } catch (e) {
        rawZoneStrings.push(product.custom.taxonomy_hardiness_zone);
      }
    }
  }
  if (product?.custom?.minimum_zone || product?.minimum_zone || product?.min_zone) {
    const minZ = product?.custom?.minimum_zone || product?.minimum_zone || product?.min_zone;
    const maxZ = product?.custom?.maximum_zone || product?.maximum_zone || product?.max_zone;
    if (minZ && maxZ) {
      rawZoneStrings.push(`${minZ}-${maxZ}`);
    } else if (minZ) {
      rawZoneStrings.push(minZ);
    }
  }
  if (Array.isArray(product?.zones)) {
    rawZoneStrings.push(...product.zones);
  }
  if (Array.isArray(product?.tags)) {
    product.tags.forEach(t => {
      if (typeof t === 'string' && t.toLowerCase().includes('zone')) {
        rawZoneStrings.push(t);
      }
    });
  }

  return rawZoneStrings;
}

/**
 * Expands a raw zone string (e.g. "9a-11b", "10a") into discrete canonical zone tokens.
 */
export function expandZoneRange(str) {
  const zones = new Set();
  if (!str) return zones;
  const clean = String(str).toLowerCase().trim();

  const rangeMatch = clean.match(/(\d+\s*[ab]?)\s*(?:-|–|to)\s*(\d+\s*[ab]?)/);
  if (rangeMatch) {
    const minRank = parseZoneRank(rangeMatch[1], false);
    const maxRank = parseZoneRank(rangeMatch[2], true);
    if (minRank !== null && maxRank !== null) {
      ALL_STANDARD_ZONES.forEach(z => {
        const r = parseZoneRank(z);
        if (r >= minRank && r <= maxRank) zones.add(z);
      });
      return zones;
    }
  }

  const tokens = clean.match(/\d+\s*[ab]?/g);
  if (tokens) {
    tokens.forEach(t => {
      const match = t.match(/(\d+)\s*([ab])?/);
      if (match) {
        if (match[2]) {
          zones.add(`${match[1]}${match[2]}`);
        } else {
          zones.add(`${match[1]}a`);
          zones.add(`${match[1]}b`);
        }
      }
    });
  }
  return zones;
}

/**
 * Returns array of discrete compatible zones for a given product.
 */
export function getProductZones(product) {
  const strings = getProductZoneStrings(product);
  const zoneSet = new Set();
  strings.forEach(s => {
    const expanded = expandZoneRange(s);
    expanded.forEach(z => zoneSet.add(z));
  });
  return Array.from(zoneSet);
}

/**
 * Returns a sorted array of all unique available zones across a catalog of products.
 */
export function getAvailableZones(products = []) {
  const zoneSet = new Set();
  (products || []).forEach(p => {
    const pZones = getProductZones(p);
    pZones.forEach(z => zoneSet.add(z));
  });

  if (zoneSet.size === 0) {
    DEFAULT_STORE_ZONES.forEach(z => zoneSet.add(z));
  }

  return Array.from(zoneSet).sort((a, b) => {
    const rA = parseZoneRank(a) ?? 0;
    const rB = parseZoneRank(b) ?? 0;
    return rA - rB || a.localeCompare(b);
  });
}

/**
 * Normalizes a raw pot/container size string into a canonical representation.
 * e.g., "1 Gallon Pot" -> "1 Gallon", "6 inch" -> '6"', "6\"" -> '6"'
 */
export function normalizePotSize(rawSize) {
  if (!rawSize || typeof rawSize !== 'string') return '';
  let clean = rawSize.trim();
  if (!clean) return '';
  clean = clean.replace(/\s+pot$/i, '').trim();
  const gallonMatch = clean.match(/^(\d+(?:\.\d+)?)\s*(?:gal|gallon|gallons)$/i);
  if (gallonMatch) {
    return `${gallonMatch[1]} Gallon`;
  }
  const inchMatch = clean.match(/^(\d+(?:\.\d+)?)\s*(?:inch|in|"|”|″)$/i);
  if (inchMatch) {
    return `${inchMatch[1]}"`;
  }
  return clean;
}

/**
 * Returns an array of normalized size strings for a product based on its variants,
 * custom pot_size metafield, or legacy sizes string.
 */
export function getProductSizes(product) {
  if (!product) return [];
  const sizeSet = new Set();

  if (Array.isArray(product.variants)) {
    product.variants.forEach(v => {
      if (v?.title && v.title !== 'Default Title') {
        const norm = normalizePotSize(v.title);
        if (norm) sizeSet.add(norm);
      }
    });
  }

  if (product?.custom?.pot_size) {
    const norm = normalizePotSize(product.custom.pot_size);
    if (norm) sizeSet.add(norm);
  }

  if (product?.sizes && typeof product.sizes === 'string') {
    product.sizes.split('|').forEach(part => {
      const norm = normalizePotSize(part);
      if (norm) sizeSet.add(norm);
    });
  }

  return Array.from(sizeSet);
}
