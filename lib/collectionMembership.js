export function isProductInCollection(product, slug) {
  if (!product || typeof slug !== "string") return false;
  slug = slug.toLowerCase();

  const matchesCollectionHandle = (handle) =>
    Array.isArray(product?.collectionHandles) &&
    product.collectionHandles.some((h) => h?.toLowerCase() === handle.toLowerCase());
  const matchesCategory = (cat) =>
    Array.isArray(product?.categories) &&
    product.categories.some((pc) => pc?.toLowerCase() === cat.toLowerCase());
  const matchesTag = (t) =>
    Array.isArray(product?.tags) &&
    product.tags.some((pt) => pt?.toLowerCase() === t.toLowerCase());
  const textMatches = (keyword) =>
    `${product?.name || ''} ${product?.description || ''}`
      .toLowerCase()
      .includes(keyword.toLowerCase());

  if (matchesCollectionHandle(slug) || matchesCategory(slug) || matchesTag(slug)) return true;

  if (slug === 'orchids' || slug === 'orchid') {
    return matchesTag('orchid') || matchesCategory('orchids') || textMatches('orchid');
  }
  if (slug === 'tropical-houseplants' || slug === 'houseplants') {
    return (
      matchesTag('houseplant') ||
      matchesTag('tropical') ||
      matchesCategory('houseplants') ||
      matchesCategory('tropical-houseplants') ||
      textMatches('houseplant') ||
      textMatches('tropical')
    );
  }
  if (slug === 'fruit-trees' || slug === 'fruit-tree') {
    return matchesTag('fruit-tree') || textMatches('fruit tree') || textMatches('fruit');
  }
  if (slug === 'herbs-medicinal' || slug === 'herbs-and-medicinal') {
    return matchesTag('herb') || matchesTag('medicinal') || textMatches('herb') || textMatches('medicinal');
  }
  if (slug === 'exotics-rare' || slug === 'exotics-and-rare') {
    return matchesTag('rare') || matchesTag('exotic') || textMatches('rare') || textMatches('exotic');
  }
  if (slug === 'seeds') {
    return matchesTag('seed') || textMatches('seed');
  }
  if (slug === 'stickers-art') {
    return matchesCategory('art') || matchesTag('sticker') || matchesTag('art') || textMatches('sticker') || textMatches('art');
  }
  if (slug === 'tinctures-apothecary') {
    return matchesCategory('apothecary') || matchesTag('tincture') || matchesTag('apothecary') || textMatches('tincture');
  }
  if (slug === 'terrarium-vivarium') {
    return matchesCategory('habitat') || matchesTag('leaf-litter') || matchesTag('substrate') || textMatches('vivarium') || textMatches('terrarium');
  }

  return false;
}
