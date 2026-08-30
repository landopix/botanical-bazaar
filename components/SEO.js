import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  formatTitle,
  formatDescription,
  DEFAULT_SITE_TITLE,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_BRAND_BANNER,
  DEFAULT_SITE_ORIGIN
} from '../lib/title-utils';

export default function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  canonical,
  noindex = false,
  children
}) {
  const router = useRouter();

  const formattedTitle = formatTitle(title);
  const formattedDescription = formatDescription(description, DEFAULT_SITE_DESCRIPTION);

  // Clean canonical / relative path
  let currentPath = (router?.asPath || '/').split('?')[0].split('#')[0];
  if (currentPath === '/') currentPath = '';

  const resolvedCanonicalUrl = canonical || `${DEFAULT_SITE_ORIGIN}${currentPath}`;
  const resolvedUrl = url || resolvedCanonicalUrl;

  let resolvedImage = image || DEFAULT_BRAND_BANNER;
  if (resolvedImage.startsWith('/')) {
    resolvedImage = `${DEFAULT_SITE_ORIGIN}${resolvedImage}`;
  }

  return (
    <Head>
      <title>{formattedTitle}</title>
      <meta name="description" content={formattedDescription} />
      <link rel="canonical" key="canonical" href={resolvedCanonicalUrl} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph Cards */}
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={formattedDescription} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:url" content={resolvedUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="The Botanical Bazaar" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={formattedDescription} />
      <meta name="twitter:image" content={resolvedImage} />

      {children}
    </Head>
  );
}
