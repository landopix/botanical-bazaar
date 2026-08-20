const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.sanity.io'],
  },
  experimental: {
    serverMinification: false,
  },
  async redirects() {
    return [
      {
        source: '/account.html',
        destination: '/account',
        permanent: true,
      },
      {
        source: '/cart.html',
        destination: '/cart',
        permanent: true,
      },
      {
        source: '/wishlist.html',
        destination: '/wishlist',
        permanent: true,
      },
      {
        source: '/checkout.html',
        destination: '/checkout',
        permanent: true,
      },
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/shop.html',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/contact.html',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/about.html',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/almanac.html',
        destination: '/almanac',
        permanent: true,
      },
      {
        source: '/blog.html',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/consultations.html',
        destination: '/consultations',
        permanent: true,
      },
      {
        source: '/events.html',
        destination: '/events',
        permanent: true,
      },
      {
        source: '/faq.html',
        destination: '/faq',
        permanent: true,
      },
      {
        source: '/garden-month.html',
        destination: '/garden-month',
        permanent: true,
      },
      {
        source: '/privacy.html',
        destination: '/privacy',
        permanent: true,
      },
      {
        source: '/returns.html',
        destination: '/returns',
        permanent: true,
      },
      {
        source: '/shipping-pickup.html',
        destination: '/shipping-pickup',
        permanent: true,
      },
      {
        source: '/terms.html',
        destination: '/terms',
        permanent: true,
      },
      {
        source: '/terms-full.html',
        destination: '/terms-full',
        permanent: true,
      },
      {
        source: '/zone9b.html',
        destination: '/zone9b',
        permanent: true,
      },
      {
        source: '/zones.html',
        destination: '/zones',
        permanent: true,
      },
      {
        source: '/orchids-gallery.html',
        destination: '/orchids-gallery',
        permanent: true,
      },
      // Redirect legacy product.html?item=slug to extensionless route /product/slug
      {
        source: '/product.html',
        has: [
          {
            type: 'query',
            key: 'item',
            value: '(?<slug>.*)',
          },
        ],
        destination: '/product/:slug',
        permanent: true,
      },
      {
        source: '/product.html',
        destination: '/shop',
        permanent: true,
      }
    ];
  }
};

module.exports = nextConfig;
