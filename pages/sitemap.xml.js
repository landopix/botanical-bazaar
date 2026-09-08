import { getAllProducts, getAlmanacArticles } from '../lib/shopify';

const EXTERNAL_DATA_URL = 'https://thebotanicalbazaar.com';

const staticRoutes = [
  '',
  '/shop',
  '/collections',
  '/about',
  '/almanac',
  '/events',
  '/consultations',
  '/faq',
  '/gallery',
  '/zones',
  '/returns',
  '/shipping-pickup',
  '/sourcing',
  '/terms',
  '/privacy',
  '/contact',
  '/help',
  '/sales',
  '/accessibility'
];

const KNOWN_COLLECTIONS = [
  'orchids',
  'tropical-houseplants',
  'fruit-trees',
  'exotics-rare',
  'herbs-medicinal',
  'seeds',
  'stickers-art',
  'tinctures-apothecary',
  'terrarium-vivarium'
];

function formatDate(dateString, fallbackDate) {
  if (!dateString) return fallbackDate;
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return fallbackDate;
    return d.toISOString().split('T')[0];
  } catch (e) {
    return fallbackDate;
  }
}

function isProductInCollection(product, slug) {
  if (!product) return false;
  const s = slug.toLowerCase();
  const matchesHandle = Array.isArray(product.collectionHandles) && product.collectionHandles.some((h) => h?.toLowerCase() === s);
  const matchesCategory = Array.isArray(product.categories) && product.categories.some((c) => c?.toLowerCase() === s);
  const matchesTag = Array.isArray(product.tags) && product.tags.some((t) => t?.toLowerCase() === s);
  if (matchesHandle || matchesCategory || matchesTag) return true;

  const text = `${product.name || ''} ${product.description || ''}`.toLowerCase();
  if (s === 'orchids' || s === 'orchid') return matchesTag('orchid') || matchesCategory('orchids') || text.includes('orchid');
  if (s === 'tropical-houseplants' || s === 'houseplants') {
    return matchesTag('houseplant') || matchesTag('tropical') || matchesCategory('houseplants') || text.includes('houseplant') || text.includes('tropical');
  }
  if (s === 'fruit-trees' || s === 'fruit-tree') return matchesTag('fruit-tree') || text.includes('fruit tree') || text.includes('fruit');
  if (s === 'herbs-medicinal') return matchesTag('herb') || matchesTag('medicinal') || text.includes('herb') || text.includes('medicinal');
  if (s === 'exotics-rare') return matchesTag('rare') || matchesTag('exotic') || text.includes('rare') || text.includes('exotic');
  if (s === 'seeds') return matchesTag('seed') || text.includes('seed');
  if (s === 'stickers-art') return matchesCategory('art') || matchesTag('sticker') || matchesTag('art') || text.includes('sticker');
  if (s === 'tinctures-apothecary') return matchesCategory('apothecary') || matchesTag('tincture') || matchesTag('apothecary') || text.includes('tincture');
  if (s === 'terrarium-vivarium') return matchesCategory('habitat') || matchesTag('leaf-litter') || text.includes('vivarium') || text.includes('terrarium');

  return false;
}

function generateSiteMap(products, almanacArticles) {
  const currentDate = new Date().toISOString().split('T')[0];

  const collectionHandles = new Set(KNOWN_COLLECTIONS);
  (products || []).forEach((product) => {
    if (Array.isArray(product?.collectionHandles)) {
      product.collectionHandles.forEach((h) => {
        if (h && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(h)) {
          collectionHandles.add(h.toLowerCase());
        }
      });
    }
  });

  // Filter out empty collections without active products
  const activeCollectionHandles = Array.from(collectionHandles).filter((slug) =>
    (products || []).some((product) => isProductInCollection(product, slug))
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  ${staticRoutes
    .map((route) => {
      const priority = route === '' ? '1.0' : route === '/shop' ? '0.9' : '0.8';
      return `
  <url>
    <loc>${EXTERNAL_DATA_URL}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join('')}

  <!-- Collection Pages -->
  ${activeCollectionHandles
    .map((slug) => `
  <url>
    <loc>${EXTERNAL_DATA_URL}/collections/${slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`)
    .join('')}

  <!-- Dynamic Product Pages -->
  ${(products || [])
    .map((product) => {
      if (!product || !product.slug) return '';
      const lastmod = formatDate(product.updatedAt || product.createdAt, currentDate);
      return `
  <url>
    <loc>${EXTERNAL_DATA_URL}/product/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .filter(Boolean)
    .join('')}

  <!-- Almanac Articles -->
  ${(almanacArticles || [])
    .map((article) => {
      if (!article?.handle) return '';
      const lastmod = formatDate(article.publishedAt, currentDate);
      return `
  <url>
    <loc>${EXTERNAL_DATA_URL}/almanac/${article.handle}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .filter(Boolean)
    .join('')}
</urlset>`;
}

function SiteMap() {
  return null;
}

export async function getServerSideProps({ res }) {
  const [products, almanacArticles] = await Promise.all([
    getAllProducts(),
    getAlmanacArticles('the-almanac'),
  ]);

  const sitemap = generateSiteMap(products, almanacArticles);

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=59');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
