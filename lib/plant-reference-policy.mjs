export const categories = ['identity', 'care', 'characteristics', 'safety', 'ecology', 'uses', 'processing'];
export const statuses = ['unverified', 'supported', 'conflicting', 'approved', 'needs recheck'];
const sensitive = c => c.category === 'safety' || c.category === 'processing' || c.category === 'uses';
const dateOK = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v));
const https = v => { try { return new URL(v).protocol === 'https:'; } catch { return false; } };

export function claimErrors(c, today = new Date().toISOString().slice(0, 10)) {
  const errors = [];
  if (!c?.text || !categories.includes(c.category) || !statuses.includes(c.status)) errors.push('Invalid claim text, category or review status');
  if (!['source fact', 'editorial recommendation', 'nursery observation'].includes(c?.kind)) errors.push('Claim origin is required');
  if (!c?.scope?.taxon || !c?.scope?.level || !c?.limitations) errors.push('Taxon scope and limitations are required');
  if (c?.status === 'approved') {
    if (!c.reviewer || !dateOK(c.reviewedAt) || c.reviewedAt > today) errors.push('Approval requires a named reviewer and valid review date');
    if (!dateOK(c.recheckBy) || c.recheckBy < today) errors.push('Claim review has expired or has no recheck date');
    if (c.kind === 'source fact') {
      if (!c.evidence?.length) errors.push('Source fact requires evidence');
      for (const e of c.evidence || []) {
        if (!https(e.url) || !e.title || !e.publisher || !dateOK(e.accessedAt) || e.accessedAt > today || !e.location || !e.evidenceType || !e.reuse || !e.originGroup || e.read !== true) errors.push('Incomplete or unread evidence');
      }
      if (sensitive(c) && (new Set((c.evidence || []).map(e => e.originGroup)).size < 2 || !c.safetyReviewer || !dateOK(c.safetyReviewedAt) || c.safetyReviewedAt > today)) errors.push('Consequential claim needs independent corroboration and safety review');
    }
    if (c.kind === 'nursery observation' && (!c.observation?.recordId || !dateOK(c.observation?.observedAt))) errors.push('Observation requires inventory evidence');
    if (c.category === 'processing' && c.actionable) {
      const p = c.processing;
      if (!p || !['species', 'plantPart', 'maturity', 'intendedOutput', 'methodUrl', 'equipment', 'criticalConditions', 'storage', 'hazards'].every(k => p[k]) || !https(p.methodUrl)) errors.push('Actionable processing requires an exact authoritative method and complete safety parameters');
    }
    if (c.category === 'uses' && c.actionable) errors.push('Actionable medicinal or food instructions belong in a separately reviewed processing method');
  }
  return errors;
}

export function recordErrors(record, today = new Date().toISOString().slice(0, 10)) {
  if (!record) return ['Plant reference is missing'];
  const errors = [];
  if (!statuses.includes(record.status)) errors.push('Invalid record review status');
  if (!record.taxonKey || !record.acceptedName || !Array.isArray(record.claims)) errors.push('Canonical identity and claims are required');
  const keys = (record.claims || []).map(c => c._key);
  if (keys.some(k => !k) || new Set(keys).size !== keys.length) errors.push('Claim keys must be unique');
  for (const c of record.claims || []) errors.push(...claimErrors(c, today).map(e => `${c._key}: ${e}`));
  if (record.status === 'approved') {
    if (!record.reviewer || !dateOK(record.reviewedAt) || record.reviewedAt > today) errors.push('Record approval requires reviewer and date');
    if (!record.claims?.some(c => c.category === 'identity' && c.status === 'approved')) errors.push('Approved identity is required');
    if (record.blockers?.length) errors.push('Unresolved release blockers');
    if (record.claims?.some(c => sensitive(c) && c.status !== 'approved')) errors.push('Unresolved consequential claims');
  }
  return errors;
}

export function publicClaims(record, today) {
  return (record?.claims || []).filter(c => c.status === 'approved' && claimErrors(c, today).length === 0 && c.kind === 'source fact' && !c.actionable);
}

// Returns copy only. Never constructs a Shopify mutation or copies inventory fields.
export function generateListing(record, productLink, today) {
  const errors = recordErrors(record, today);
  if (record?.status !== 'approved') errors.push('Record is not approved');
  if (productLink?.taxonKey !== record?.taxonKey || productLink?.status !== 'approved' || !productLink?.reviewer || !dateOK(productLink?.reviewedAt)) errors.push('Product-to-taxon link is not approved');
  if (errors.length) return { ready: false, reviewFlags: [...new Set(errors)], copy: null };
  const claims = publicClaims(record, today).filter(c => ['care', 'characteristics', 'safety'].includes(c.category) && (!c.scope.cultivar || c.scope.cultivar === productLink.cultivar));
  return { ready: true, reviewFlags: [], copy: claims.map(c => ({ claimId: c._key, category: c.category, text: c.text, sources: c.evidence.map(e => e.url) })) };
}
