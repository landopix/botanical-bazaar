// Preserve catalog order for equal scores and the existing sold-out fallback.
export function getRecommendedProducts(product, allProducts = []) {
    if (!product || !allProducts || allProducts.length === 0) return [];

    const currentSlug = product.slug;
    const currentCats = (product.categories || []).map(c => c.toLowerCase());
    const currentTags = (product.tags || []).map(t => t.toLowerCase());

    const scored = allProducts
      .filter(p => p.slug !== currentSlug && p.availableForSale !== false)
      .map(p => {
        let score = 0;
        const pCats = (p.categories || []).map(c => c.toLowerCase());
        const pTags = (p.tags || []).map(t => t.toLowerCase());

        pCats.forEach(c => {
          if (currentCats.includes(c)) score += 3;
        });

        pTags.forEach(t => {
          if (currentTags.includes(t)) score += 1;
        });

        return { product: p, score };
      });

    scored.sort((a, b) => b.score - a.score);
    const topScored = scored.map(s => s.product);

    // Fallback if less than 4 matches
    if (topScored.length < 4) {
      const remaining = allProducts.filter(p => p.slug !== currentSlug && !topScored.some(ts => ts.slug === p.slug));
      return [...topScored, ...remaining].slice(0, 8);
    }

    return topScored.slice(0, 8);

}
