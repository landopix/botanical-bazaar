const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self' https://*.shopify.com https://*.myshopify.com https://shop.thebotanicalbazaar.com",
  "script-src 'self' 'unsafe-inline' https://*.google.com https://*.gstatic.com https://www.googletagmanager.com https://*.clarity.ms https://analytics.ahrefs.com https://*.lfeeder.com https://sc.lfeeder.com https://apis.google.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://cdn.shopify.com https://cdn.sanity.io https://*.google.com https://*.gstatic.com https://*.google-analytics.com https://*.clarity.ms https://*.ahrefs.com https://*.lfeeder.com https://sc.lfeeder.com https://*.bing.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://shop.thebotanicalbazaar.com https://*.shopify.com https://*.myshopify.com https://cdn.shopify.com https://cdn.sanity.io https://*.sanity.io https://*.google.com https://*.google-analytics.com https://*.clarity.ms https://*.ahrefs.com https://*.lfeeder.com https://sc.lfeeder.com https://challenges.cloudflare.com",
  "frame-src 'self' https://*.google.com https://*.gstatic.com https://*.shopify.com https://*.myshopify.com https://shop.thebotanicalbazaar.com https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests"
].join('; ');

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    qualities: [65, 75],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on"
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload"
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()"
          },
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy
          }
        ]
      }
    ];
  },
  async redirects() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'shop.thebotanicalbazaar.com',
          },
        ],
        destination: 'https://thebotanicalbazaar.com/',
        permanent: true,
      },
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
        destination: 'https://shop.thebotanicalbazaar.com/account/login',
        permanent: true,
      },
      {
        source: '/account',
        destination: 'https://shop.thebotanicalbazaar.com/account/login',
        permanent: true,
      },
      {
        source: '/customer_authentication/:path*',
        destination: 'https://shop.thebotanicalbazaar.com/account/login',
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
        source: '/blog',
        destination: '/almanac',
        permanent: true,
      },
      {
        source: '/blog.html',
        destination: '/almanac',
        permanent: true,
      },
      {
        source: '/blogs/:path*',
        destination: '/almanac',
        permanent: true,
      },
      {
        source: '/almanac/:slug+',
        destination: '/almanac',
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
        source: '/terms-full',
        destination: '/terms',
        permanent: true,
      },
      {
        source: '/terms-full.html',
        destination: '/terms',
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
      }
    ];
  }
};

module.exports = nextConfig;
