import { categories, statuses, recordErrors } from '../../lib/plant-reference-policy.mjs';
const str = (name, type = 'string') => ({ name, title: name.replace(/([A-Z])/g, ' $1'), type });
const list = (name, values) => ({ ...str(name), options: { list: values } });
const strings = name => ({ name, type: 'array', of: [{ type: 'string' }] });
export const plantReference = {
  name: 'plantReference', title: 'Verified Plant Reference', type: 'document',
  validation: Rule => Rule.custom(record => recordErrors(record).join('; ') || true),
  fields: [
    { ...str('taxonKey'), description: 'Stable lowercase taxon key; one record per accepted taxon.', validation: Rule => Rule.required().custom(async (value, context) => {
      if (!value) return true;
      const id = context.document._id.replace(/^drafts\./, '');
      const count = await context.getClient({ apiVersion: '2023-05-03' }).fetch('count(*[_type == "plantReference" && taxonKey == $key && !(_id in [$id, $draft])])', { key: value, id, draft: `drafts.${id}` });
      return count === 0 || 'A canonical record already exists for this taxon';
    }) },
    str('acceptedName'), str('family'), strings('synonyms'), strings('commonNames'), str('identificationUncertainty', 'text'),
    list('status', statuses), str('reviewer'), str('reviewedAt', 'date'), strings('blockers'), strings('unknownFields'),
    { name: 'claims', type: 'array', of: [{ type: 'object', name: 'plantClaim', fields: [
      str('text', 'text'), list('category', categories), str('field'), list('kind', ['source fact', 'editorial recommendation', 'nursery observation']),
      list('status', statuses), str('limitations', 'text'), str('reviewer'), str('reviewedAt', 'date'), str('recheckBy', 'date'), str('safetyReviewer'), str('safetyReviewedAt', 'date'), str('actionable', 'boolean'),
      { name: 'scope', type: 'object', fields: ['taxon','level','cultivar','plantPart','preparation','environment','geography','audience','exposureRoute','assessmentDate'].map(n => str(n)) },
      { name: 'evidence', type: 'array', of: [{ type: 'object', fields: [str('url', 'url'), str('title'), str('publisher'), str('publicationDate'), str('accessedAt', 'date'), str('location', 'text'), str('passage', 'text'), str('evidenceType'), str('limitations', 'text'), str('originGroup'), str('reuse', 'text'), str('read', 'boolean')] }] },
      { name: 'processing', type: 'object', fields: ['species','plantPart','maturity','intendedOutput','methodUrl','equipment','criticalConditions','storage','hazards'].map(n => str(n, 'text')) },
      { name: 'observation', type: 'object', fields: [str('recordId'), str('observedAt', 'date'), str('observer')] },
    ], preview: { select: { title: 'text', subtitle: 'status' } } }] },
    { name: 'history', type: 'array', of: [{ type: 'object', fields: [str('date', 'date'), str('actor'), str('summary', 'text'), str('previousRevision')] }] },
  ], preview: { select: { title: 'acceptedName', subtitle: 'status' } },
};
export const productPlantLink = {
  name: 'productPlantLink', title: 'Product / Plant Link', type: 'document',
  fields: [str('productId'), str('handle'), str('cultivar'), str('taxonKey'), { name: 'plant', type: 'reference', to: [{ type: 'plantReference' }], validation: Rule => Rule.required() }, list('status', statuses), str('reviewer'), str('reviewedAt', 'date'), str('inventorySuitability', 'text')],
  preview: { select: { title: 'handle', subtitle: 'status' } },
};
