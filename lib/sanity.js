import { createClient } from '@sanity/client';

const config = {
  projectId: process.env.SANITY_PROJECT_ID || 'mock-project-id',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
};

export const sanityClient = createClient(config);

export function isSanityConfigured() {
  return (
    process.env.SANITY_PROJECT_ID &&
    process.env.SANITY_PROJECT_ID !== 'mock-project-id'
  );
}
