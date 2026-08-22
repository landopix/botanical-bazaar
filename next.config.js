const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/index.html',
        destination: '/',
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
        source: '/account.html',
        destination: '/account',
        permanent: true,
      },
      {
        source: '/checkout.html',
        destination: '/cart',
        permanent: true,
      },
      {
        source: '/checkout',
        destination: '/cart',
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
        source: '/garden-month',
        destination: '/almanac',
        permanent: true,
      },
      {
        source: '/garden-month.html',
        destination: '/almanac',
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
      {
        source: '/gallery.html',
        destination: '/gallery',
        permanent: true,
      },
      {
        source: '/sourcing.html',
        destination: '/sourcing',
        permanent: true,
      },
      {
        source: '/help.html',
        destination: '/help',
        permanent: true,
      },
      {
        source: '/sales.html',
        destination: '/sales',
        permanent: true,
      },
      {
        source: '/accessibility.html',
        destination: '/accessibility',
        permanent: true,
      },
      {
        source: '/success.html',
        destination: '/success',
        permanent: true,
      },
      {
        source: '/cancel.html',
        destination: '/cancel',
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
