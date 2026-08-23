import { getAllProducts } from '../lib/shopify';

const EXTERNAL_DATA_URL = 'https://thebotanicalbazaar.com';

const staticRoutes = [
  '',
  '/shop',
  '/about',
  '/almanac',
  '/events',
  '/faq',
  '/zones',
  '/returns',
  '/shipping-pickup',
  '/sourcing',
  '/terms',
  '/privacy',
  '/cart',
  '/wishlist',
  '/contact',
  '/help',
  '/sales',
  '/orchids-gallery',
  '/accessibility'
];

function generateSiteMap(products) {
  const currentDate = new Date().toISOString().split('T')[0];

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

  <!-- Dynamic Product Pages -->
  ${(products || [])
    .map((product) => {
      if (!product || !product.slug) return '';
      return `
  <url>
    <loc>${EXTERNAL_DATA_URL}/product/${product.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
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
  let products = [];
  try {
    products = await getAllProducts();
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  const sitemap = generateSiteMap(products);

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=59');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
