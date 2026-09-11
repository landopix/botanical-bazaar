const fs = require('fs');
const path = require('path');

// Domain definition
const SITE_DOMAIN = 'https://thebotanicalbazaar.com';

// Canonical static routes to include
const STATIC_ROUTES = [
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
  '/gallery',
  '/accessibility'
];

async function generateSitemap() {
  console.log('Generating build-time sitemap...');

  let productHandles = [];
  try {
    const { getAllProductHandles } = require('../lib/shopify');
    productHandles = await getAllProductHandles();
    console.log(`Fetched ${productHandles.length} product handles from Shopify.`);
  } catch (err) {
    console.warn('Could not fetch product handles from Shopify:', err.message);
    console.warn('Proceeding with static routes only or existing handles...');
  }

  const currentDate = new Date().toISOString().split('T')[0];

  const staticUrls = STATIC_ROUTES.map(route => {
    const priority = route === '' ? '1.0' : (route === '/shop' ? '0.9' : '0.8');
    return `  <url>
    <loc>${SITE_DOMAIN}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

  const productUrls = productHandles.map(handle => {
    return `  <url>
    <loc>${SITE_DOMAIN}/product/${handle}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<!-- Canonical Static Routes -->
${staticUrls.join('\n')}

<!-- Dynamic Shopify Product Routes -->
${productUrls.join('\n')}
</urlset>
`;

  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xmlContent.trim(), 'utf8');
  console.log(`Successfully generated public/sitemap.xml with ${STATIC_ROUTES.length + productHandles.length} entries.`);
}

generateSitemap().catch(err => {
  console.error('Error generating sitemap:', err);
  process.exit(1);
});
