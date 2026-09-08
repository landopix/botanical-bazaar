import { getProductByHandle } from '../lib/shopify';

export async function getServerSideProps({ query }) {
  const item = query?.item;

  if (item && typeof item === 'string' && item.trim()) {
    const cleanSlug = item.trim();
    try {
      const product = await getProductByHandle(cleanSlug);
      if (product) {
        return {
          redirect: {
            destination: `/product/${encodeURIComponent(cleanSlug)}`,
            permanent: true,
          },
        };
      }
    } catch (error) {
      console.error('Error checking legacy product item %s:', cleanSlug, error);
    }

    // Permanently removed specimen: return strict 404 to resolve Soft 404 flags
    return {
      notFound: true,
    };
  }

  // Bare product.html request: return strict 404
  return {
    notFound: true,
  };
}

export default function LegacyProductPage() {
  return null;
}
