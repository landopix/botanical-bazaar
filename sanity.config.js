import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './sanity/schemas';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || 'z3hyzavr';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production';

export default defineConfig({
  name: 'default',
  title: 'The Botanical Bazaar Studio',
  projectId,
  dataset,
  basePath: '/admin',
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
});
