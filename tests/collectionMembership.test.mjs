import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { isProductInCollection } from '../lib/collectionMembership.js';

/**
 * Fixtures mirror the live catalog crawled 2026-09-11 (real tags and the
 * description excerpts that mattered). collectionHandles are intentionally
 * omitted so these tests prove tag-based behavior regardless of what Shopify
 * collection assignments exist server-side.
 */
const CATALOG = [
  {
    slug: 'smooth-agave-agave-desmettiana', name: 'Smooth Agave',
    tags: ['agave', 'agave desmettiana', 'architectural plant', 'cacti & succulents', 'drought tolerant', 'full sun', 'live plant', 'outdoor plants', 'smooth agave', 'spineless agave', 'succulent'],
    description: 'Flourishing in full sun, Agave desmettiana produces graceful, architectural leaves with smooth edges and excellent drought tolerance. A highly porous, well-draining medium.',
  },
  {
    slug: 'buddha-belly-jatropha-podagrica', name: 'Buddha Belly',
    tags: ['buddha belly', 'caudex', 'drought tolerant', 'jatropha', 'jatropha podagrica', 'live plant', 'outdoor plants', 'rare plant', 'red flowers', 'tropical', 'tropical plant'],
    description: 'Jatropha podagrica produces a striking swollen basal stem, or caudex, topped with large architectural leaves and vibrant coral-red flower clusters.',
  },
  {
    slug: 'bellyache-bush-jatropha-gossypiifolia', name: 'Bellyache Bush',
    tags: ['bellyache bush', 'bronze foliage', 'drought tolerant', 'jatropha', 'jatropha gossypiifolia', 'live plant', 'outdoor plants', 'rare plant', 'red flowers', 'tropical', 'tropical plant'],
    description: 'Deeply lobed foliage that often emerges burgundy or bronze before maturing to a rich green. Characterized by glandular stems and small crimson flower clusters.',
  },
  {
    slug: 'barbados-lily-hippeastrum-striatum', name: 'Barbados Lily',
    tags: ['amaryllis', 'barbados lily', 'flowering houseplant', 'hippeastrum striatum', 'live plant', 'orange amaryllis', 'orange flowers', 'tropical bulb'],
    description: 'Hippeastrum striatum produces striking, trumpet-shaped coral-orange blooms. This tropical bulb often retains its lush, strap-like foliage during the blooming cycle.',
  },
  {
    slug: 'birds-nest-snake-plant-dracaena-trifasciata-hahnii', name: "Bird's Nest Snake Plant",
    tags: ['air purifying', "bird's nest snake plant", 'dracaena trifasciata', 'dracaena trifasciata hahnii green', "green bird's nest snake plant", 'hahnii green', 'indoor plant', 'live plant', 'low maintenance', 'sansevieria trifasciata hahnii green', 'snake plant', 'succulent'],
    description: "A compact, low rosette of stiff succulent leaves. Adapts well to indoor containers.",
  },
  {
    slug: 'peanut-butter-fruit-tree-bunchosia-glandulifera', name: 'Peanut Butter Fruit',
    tags: ['bunchosia glandulifera', 'edible fruit', 'flowering tree', 'fruit plant', 'live plant', 'peanut butter fruit', 'rare fruit tree', 'tropical tree'],
    description: 'A tropical evergreen shrub or small tree prized for bright red fruits with dense, sweet pulp and a distinctive flavor often compared with peanut butter.',
  },
  {
    slug: 'monstera-obliqua-peru', name: 'Monstera obliqua',
    tags: ['collector plant', 'fenestrated monstera', 'lace leaf monstera', 'live plant', 'monstera obliqua', 'monstera obliqua peru', 'rare aroid', 'rare plant', 'top cutting'],
    description: 'A crown jewel for advanced aroid collections. Soil: A chunky, airy, fast-draining epiphytic mix containing orchid bark, high-grade perlite, and sphagnum moss for strong root aeration.',
  },
  {
    slug: 'coral-bush-jatropha-multifida', name: 'Coral Bush',
    tags: ['coral bush', 'coral plant', 'flowering shrub', 'jatropha multifida', 'live plant', 'outdoor plants', 'physic nut', 'rare plant', 'tropical plant'],
    description: 'An extraordinary architectural specimen with deeply divided, umbrella-like leaves and vibrant clusters of coral-red flowers that bloom throughout the warm months.',
  },
  {
    slug: 'starfish-sansevieria-cylindrica-boncel', name: 'Starfish Sansevieria',
    tags: ['air purifying', 'collector plant', 'cylindrical snake plant', 'dracaena angolensis', 'drought tolerant', 'indoor plant', 'live plant', 'low maintenance', 'rare sansevieria', 'sansevieria cylindrica boncel', 'starfish sansevieria', 'succulent'],
    description: "Smooth, succulent, cylindrical leaves that fan outward in a distinctive star-shaped cluster. Adapts readily to indoor environments.",
  },
  {
    slug: 'philodendron-radiatum-barryii', name: 'Barryii Philodendron',
    tags: ['climbing aroid', 'collector plant', 'indoor plant', 'live plant', 'lobed philodendron', 'philodendron barryii', 'philodendron radiatum', 'rare aroid', 'rare philodendron'],
    description: 'Famed for its intensely divided, finger-like lobed leaves, an architecturally striking climbing aroid for bright indoor spaces.',
  },
  {
    slug: 'hanging-lobster-claw-heliconia-rostrata', name: 'Hanging Lobster Claw',
    tags: ['false bird of paradise', 'flowering plant', 'hanging lobster claw', 'heliconia', 'heliconia rostrata', 'live plant', 'lobster claw', 'outdoor plants', 'rhizomatous plant', 'tropical', 'tropical plant'],
    description: 'Pendulous flower clusters with vivid scarlet-red bracts tipped in yellow and green above lush, banana-like foliage.',
  },
  {
    slug: 'thai-black-banana-musa-balbisiana-thai-black', name: 'Thai Black Banana',
    tags: ['architectural plant', 'black banana', 'live plant', 'musa balbisiana', 'musa balbisiana thai black', 'ornamental banana', 'outdoor plants', 'rare plant', 'thai black banana', 'tropical plant'],
    description: "A towering ornamental banana with dramatic dark pseudostem, grown primarily for ornamental value rather than dependable fruit production.",
    availableForSale: false,
  },
];

const membersOf = (slug) =>
  CATALOG.filter((p) => isProductInCollection(p, slug)).map((p) => p.slug).sort();
const slugs = (...list) => [...list].sort();

test('T-015 regression: Monstera is NOT an orchid despite "orchid bark" in its description', () => {
  const monstera = CATALOG.find((p) => p.slug === 'monstera-obliqua-peru');
  assert.match(monstera.description, /orchid bark/); // the triggering phrase is present
  assert.equal(isProductInCollection(monstera, 'orchids'), false);
  assert.equal(membersOf('orchids').length, 0); // no orchids in stock -> collection empties
});

test('T-015: tropical-houseplants contains the houseplants, not the landscape plants', () => {
  assert.deepEqual(
    membersOf('tropical-houseplants'),
    slugs('birds-nest-snake-plant-dracaena-trifasciata-hahnii', 'philodendron-radiatum-barryii', 'starfish-sansevieria-cylindrica-boncel')
  );
  // Outdoor tropicals that previously matched via the word "tropical":
  for (const gone of ['buddha-belly-jatropha-podagrica', 'bellyache-bush-jatropha-gossypiifolia', 'coral-bush-jatropha-multifida', 'hanging-lobster-claw-heliconia-rostrata', 'peanut-butter-fruit-tree-bunchosia-glandulifera']) {
    assert.equal(isProductInCollection(CATALOG.find((p) => p.slug === gone), 'tropical-houseplants'), false, `${gone} should not be in tropical-houseplants`);
  }
});

test('T-015: fruit-trees contains fruiting plants, not ornamentals', () => {
  assert.deepEqual(membersOf('fruit-trees'), ['peanut-butter-fruit-tree-bunchosia-glandulifera']);
  assert.equal(isProductInCollection(CATALOG.find((p) => p.slug === 'thai-black-banana-musa-balbisiana-thai-black'), 'fruit-trees'), false);
});

test('explicit signals still work: tags, categories, handles', () => {
  assert.equal(isProductInCollection({ tags: ['orchid'] }, 'orchids'), true);
  assert.equal(isProductInCollection({ categories: ['art'] }, 'stickers-art'), true);
  assert.equal(isProductInCollection({ tags: ['substrate'] }, 'terrarium-vivarium'), true);
  assert.equal(isProductInCollection({ collectionHandles: ['exotics-rare', 'rare-plants', 'botanical-specimen'] }, 'exotics-rare'), true);
  assert.equal(isProductInCollection({ collectionHandles: ['exotics-rare', 'rare-plants', 'botanical-specimen'] }, 'rare-plants'), true);
  assert.equal(isProductInCollection({ collectionHandles: ['exotics-rare', 'rare-plants', 'botanical-specimen'] }, 'botanical-specimen'), true);
});

test('T-015: description text alone never matches any collection', () => {
  const wordy = {
    name: 'Tropical plant',
    description: 'Grown from seed, this rare and unusual exotic tropical houseplant bears medicinal herbs and rare fruit tree genetics for your vivarium tank.',
  };
  for (const slug of ['seeds', 'herbs-medicinal', 'exotics-rare', 'fruit-trees', 'tropical-houseplants', 'terrarium-vivarium', 'orchids', 'tinctures-apothecary']) {
    assert.equal(isProductInCollection(wordy, slug), false, `${slug} should not match on description text`);
  }
});

test('display-name variants normalize to slugs', () => {
  const assigned = { collectionHandles: ['exotics-rare'] };
  assert.equal(isProductInCollection(assigned, 'Exotics & Rare'), true);
  assert.equal(isProductInCollection({ collectionHandles: ['fruit-trees'] }, 'Fruit Trees'), true);
  assert.equal(isProductInCollection({ collectionHandles: ['tropical-houseplants'] }, 'Tropical Houseplants'), true);
});

test('membership is availability-agnostic (sold-out products keep their collection + sitemap place)', () => {
  const soldOutOrchid = { tags: ['orchid'], availableForSale: false, quantity: 0 };
  assert.equal(isProductInCollection(soldOutOrchid, 'orchids'), true);
});

test('sitemap end-to-end: orchids drops out, houseplants stays, sold-out product stays', async () => {
  const source = readFileSync(new URL('../pages/sitemap.xml.js', import.meta.url), 'utf8')
    .replace(/^import .*;\r?\n/gm, '')
    .replace('export async function', 'async function')
    .replace('export default SiteMap;', '');
  let output = '';
  const context = vm.createContext({
    isProductInCollection,
    getAllProducts: async () => CATALOG,
    getAlmanacArticles: async () => [{ handle: 'how-to-acclimate-a-shipped-tropical-plant' }],
  });
  vm.runInContext(source, context);
  await context.getServerSideProps({ res: { setHeader() {}, write(s) { output += s; }, end() {} } });

  // Empty collections (no members at all) must not be in the sitemap:
  assert.ok(!output.includes('/collections/orchids</loc>'), 'orchids must be excluded while empty');
  assert.ok(!output.includes('/collections/seeds</loc>'));
  assert.ok(!output.includes('/collections/herbs-medicinal</loc>'));
  // Populated collections stay:
  assert.ok(output.includes('/collections/tropical-houseplants</loc>'));
  assert.ok(output.includes('/collections/fruit-trees</loc>'));
  // Sold-out products remain in the sitemap (evergreen URL strategy, T-014):
  assert.ok(output.includes('/product/thai-black-banana-musa-balbisiana-thai-black</loc>'));
  // Monstera PDP itself still listed:
  assert.ok(output.includes('/product/monstera-obliqua-peru</loc>'));
});
