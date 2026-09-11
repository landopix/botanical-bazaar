/**
 * Single source of truth for product → collection membership.
 *
 * Membership is based on EXPLICIT signals only, checked in this order:
 *   1. Shopify collection handles (product.collectionHandles)
 *   2. Product categories (product.categories)
 *   3. Product tags (product.tags), including curated tag sets per collection
 *
 * There is deliberately NO name/description substring matching. Loose text
 * matching previously pulled products into the wrong collections — e.g.
 * Monstera obliqua matched the "Orchids" collection purely because its soil
 * description mentions "orchid bark", and the "Tropical Houseplants"
 * collection filled up with outdoor landscape plants whose descriptions
 * contain the word "tropical" while excluding the actual houseplants.
 * See docs/seo/backlog.md (T-015).
 *
 * If a product is missing from a collection it belongs in, fix the product's
 * Shopify collection assignment or its tags — do not re-add text matching.
 */
export function isProductInCollection(product, slug) {
  if (!product || typeof slug !== 'string') return false;

  // Normalize common display-name variants to slugs
  // (e.g. "Exotics & Rare" → "exotics-rare", "Fruit Trees" → "fruit-trees")
  const normalized = slug
    .toLowerCase()
    .trim()
    .replace(/\s*&\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const matchesCollectionHandle = (handle) =>
    Array.isArray(product?.collectionHandles) &&
    product.collectionHandles.some((h) => h?.toLowerCase() === handle.toLowerCase());
  const matchesCategory = (cat) =>
    Array.isArray(product?.categories) &&
    product.categories.some((pc) => pc?.toLowerCase() === cat.toLowerCase());
  const matchesTag = (t) =>
    Array.isArray(product?.tags) &&
    product.tags.some((pt) => pt?.toLowerCase() === t.toLowerCase());
  const matchesAnyTag = (predicate) =>
    Array.isArray(product?.tags) && product.tags.some((pt) => predicate(pt?.toLowerCase()));

  // 1. Explicit assignment, category, or exact tag match
  if (
    matchesCollectionHandle(normalized) ||
    matchesCategory(normalized) ||
    matchesTag(normalized)
  ) {
    return true;
  }

  // 2. Curated tag sets per collection (explicit signals only)
  if (normalized === 'orchids' || normalized === 'orchid') {
    return matchesTag('orchid') || matchesTag('orchids') || matchesCategory('orchids');
  }
  if (normalized === 'tropical-houseplants' || normalized === 'houseplants') {
    return (
      matchesTag('houseplant') ||
      matchesTag('houseplants') ||
      matchesTag('indoor plant') ||
      matchesTag('indoor plants') ||
      matchesCategory('houseplants') ||
      matchesCategory('tropical-houseplants')
    );
  }
  if (normalized === 'fruit-trees' || normalized === 'fruit-tree') {
    // Tags that explicitly identify fruiting plants ("fruit tree", "fruit
    // plant", "edible fruit", "rare fruit tree"). Ornamental-only plants
    // (e.g. Musa balbisiana 'Thai Black') correctly stay out.
    return matchesAnyTag(
      (t) => /fruit[- ]?trees?/.test(t) || t === 'fruit plant' || t === 'edible fruit'
    );
  }
  if (normalized === 'herbs-medicinal' || normalized === 'herbs-and-medicinal') {
    return matchesTag('herb') || matchesTag('herbs') || matchesTag('medicinal');
  }
  if (normalized === 'exotics-rare' || normalized === 'exotics-and-rare') {
    return matchesTag('rare') || matchesTag('exotic') || matchesTag('exotics');
  }
  if (normalized === 'seeds') {
    return matchesTag('seed') || matchesTag('seeds');
  }
  if (normalized === 'stickers-art') {
    return (
      matchesCategory('art') ||
      matchesTag('sticker') ||
      matchesTag('stickers') ||
      matchesTag('art')
    );
  }
  if (normalized === 'tinctures-apothecary') {
    return (
      matchesCategory('apothecary') ||
      matchesTag('tincture') ||
      matchesTag('apothecary')
    );
  }
  if (normalized === 'terrarium-vivarium') {
    return (
      matchesCategory('habitat') ||
      matchesTag('leaf-litter') ||
      matchesTag('substrate')
    );
  }

  return false;
}
