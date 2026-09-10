import { getProductZones, parseZoneRank } from './fulfillment.js';

export function getPlantZoneGuidance(product, selectedZone) {
  const zone = typeof selectedZone === 'string' ? selectedZone.trim().toLowerCase() : '';
  const valid = /^(?:[1-9]|1[0-3])[ab]$/.test(zone);
  const zones = getProductZones(product).filter(z => /^(?:[1-9]|1[0-3])[ab]$/.test(z));
  const label = valid ? `Zone ${zone.toUpperCase()}` : 'USDA zone';
  if (!valid || !zones.length) return {
    badgeLabel: valid ? 'Hardiness Not Confirmed' : 'Select Your USDA Zone',
    badgeColor: '#D4B06A',
    title: `${label} Compatibility`,
    note: valid ? 'This plant does not have a confirmed USDA hardiness range in our catalog. Ask us about outdoor suitability and winter protection before planting.' : 'Choose your USDA zone to see guidance for this plant.',
  };
  const rank = parseZoneRank(zone);
  if (zones.includes(zone)) return {
    badgeLabel: 'Good Fit for Outdoors', badgeColor: '#249160',
    title: `${label} Outdoor Care`,
    note: `Your zone is within this plant's listed hardiness range. Follow its light, water, and soil guidance below. Protect container roots and new growth during unusual cold; USDA zones describe winter lows, not sun, heat, or watering needs.`,
  };
  if (rank < Math.min(...zones.map(z => parseZoneRank(z)))) return {
    badgeLabel: 'Seasonal / Protected Culture', badgeColor: '#B8533C',
    title: `${label} Summer & Overwintering Care`,
    note: `Your zone is colder than this plant's listed outdoor range. Grow in a movable container and overwinter in suitable indoor or heated greenhouse conditions. Move outside only when temperatures meet this plant's needs, and bring it in before damaging cold or frost.`,
  };
  return {
    badgeLabel: 'Outside Listed Range', badgeColor: '#D4B06A',
    title: `${label} Climate Suitability`,
    note: `Your zone is outside this plant's listed range. A warmer winter zone does not guarantee suitability: heat tolerance, humidity, and any winter dormancy requirements still matter. Ask us before choosing a permanent outdoor location.`,
  };
}
