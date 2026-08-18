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
