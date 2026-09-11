/**
 * Score-based product recommendations for PDP "Recommended" carousels.
 *
 * Sold-out products are intentionally INCLUDED (sorted after in-stock items)
 * so their URLs keep earning internal links from other product pages while
 * waiting for restock — part of the evergreen product URL strategy
 * (docs/seo/backlog.md T-014). ProductCard renders a "Sold Out" badge for
 * them, so carousel placement is safe UX.
 */
export function getRecommendedProducts(product, allProducts = []) {
    if (!product || !allProducts || allProducts.length === 0) return [];

    const currentSlug = product.slug;
    const currentCats = (product.categories || []).map(c => c.toLowerCase());
    const currentTags = (product.tags || []).map(t => t.toLowerCase());

    const isSoldOut = (p) =>
        p?.availableForSale === false ||
        (typeof p?.quantity === 'number' && p.quantity < 1);

    const scored = allProducts
        .filter(p => p.slug !== currentSlug)
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

            return { product: p, score, soldOut: isSoldOut(p) };
        });

    // In-stock recommendations first (relevance order), then sold-out items
    // so they remain linked. Stable sort preserves catalog order for ties.
    scored.sort((a, b) => (a.soldOut - b.soldOut) || (b.score - a.score));

    return scored.map(s => s.product).slice(0, 8);
}
