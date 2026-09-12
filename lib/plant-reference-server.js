import { sanityClient } from './sanity';
import { recordErrors, publicClaims } from './plant-reference-policy.mjs';

async function publishedRecords(query, params) {
  try {
    return await sanityClient.withConfig({ useCdn: false, perspective: 'published', timeout: 10000 }).fetch(query, params);
  } catch {
    // Omit unavailable reference content without disrupting inventory or checkout.
    console.warn('Plant reference lookup unavailable; reviewed guidance omitted.');
    return [];
  }
}

function readerRecord(record) {
  return { taxonKey: record.taxonKey, acceptedName: record.acceptedName, reviewedAt: record.reviewedAt, claims: publicClaims(record), preview: false };
}

export function isPlantPilotPreview() {
  return process.env.NODE_ENV === 'development' && process.env.PLANT_REFERENCE_PREVIEW === '1';
}

export async function getPlantReference(handle) {
  if (isPlantPilotPreview()) {
    const pilot = (await import('../data/plant-reference/pilot.json')).default;
    const link = pilot.links.find(l => l.handle === handle);
    if (!link) return null;
    return { ...pilot.records.find(r => r.taxonKey === link.taxonKey), cultivar: link.cultivar, preview: true };
  }
  // Never use drafts or silently select the first of duplicate product links.
  const links = await publishedRecords(
    '*[_type == "productPlantLink" && handle == $handle && status == "approved" && !(_id in path("drafts.**"))]{status,taxonKey,cultivar,reviewer,reviewedAt,plant->}', { handle });
  if (links.length !== 1) return null;
  const link = links[0];
  const record = link.plant;
  if (!link.reviewer || !link.reviewedAt || record?.status !== 'approved' || record.taxonKey !== link.taxonKey || recordErrors(record).length) return null;
  return { ...readerRecord(record), cultivar: link.cultivar || null };
}

export async function getPlantGuide(taxonKey) {
  if (isPlantPilotPreview()) {
    const pilot = (await import('../data/plant-reference/pilot.json')).default;
    const record = pilot.records.find(r => r.taxonKey === taxonKey);
    return record ? { ...record, preview: true } : null;
  }
  const records = await publishedRecords(
    '*[_type == "plantReference" && taxonKey == $taxonKey && status == "approved" && !(_id in path("drafts.**"))]', { taxonKey });
  return records.length === 1 && !recordErrors(records[0]).length ? readerRecord(records[0]) : null;
}
