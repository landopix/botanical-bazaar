import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

const config = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || 'z3hyzavr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  useCdn: process.env.NODE_ENV === 'production',
};

export const sanityClient = createClient(config);

const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source) {
  if (!source) return null;
  return builder.image(source);
}

export function isSanityConfigured() {
  const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
  return Boolean(pid && pid !== 'mock-project-id');
}
