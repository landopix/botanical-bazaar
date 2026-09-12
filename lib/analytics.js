/**
 * GA4 Analytics & GA4 Ecommerce Utility Module
 * Measurement ID: G-S0XS3CDM9G
 */

export const GA_MEASUREMENT_ID = "G-S0XS3CDM9G";

/**
 * Safely push standard GA4 events to window.gtag
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

/**
 * Format item payload for GA4 ecommerce standard
 */
export function formatEcommerceItem(item, quantity = 1) {
  if (!item) return null;
  const itemPrice = parseFloat(item.price || item.activePrice || 0);
  return {
    item_id: String(item.id || item.variantId || item.sku || item.slug || ""),
    item_name: String(item.name || item.title || ""),
    item_category: String(item.type || item.category || "Plants"),
    item_variant: String(item.selectedVariantName || item.size || item.variantTitle || ""),
    price: isNaN(itemPrice) ? 0 : itemPrice,
    quantity: Number(quantity) || 1,
  };
}

/**
 * Track GA4 view_item event on product detail page
 */
export function trackViewItem(product, selectedVariant = null) {
  if (!product) return;
  const itemPrice = parseFloat(selectedVariant?.price || product.price || 0);
  const formattedItem = {
    item_id: String(selectedVariant?.id || product.id || product.slug || ""),
    item_name: String(product.name || product.title || ""),
    item_category: String(product.type || "Plants"),
    item_variant: String(selectedVariant?.title || selectedVariant?.name || ""),
    price: isNaN(itemPrice) ? 0 : itemPrice,
    quantity: 1,
  };

  trackEvent("view_item", {
    currency: "USD",
    value: formattedItem.price,
    items: [formattedItem],
  });
}

/**
 * Track GA4 add_to_cart event when a user adds item to cart
 */
export function trackAddToCart(product, selectedVariant = null, quantity = 1) {
  if (!product) return;
  const itemPrice = parseFloat(selectedVariant?.price || product.price || 0);
  const formattedItem = {
    item_id: String(selectedVariant?.id || product.id || product.slug || ""),
    item_name: String(product.name || product.title || ""),
    item_category: String(product.type || "Plants"),
    item_variant: String(selectedVariant?.title || selectedVariant?.name || ""),
    price: isNaN(itemPrice) ? 0 : itemPrice,
    quantity: Number(quantity) || 1,
  };

  trackEvent("add_to_cart", {
    currency: "USD",
    value: formattedItem.price * formattedItem.quantity,
    items: [formattedItem],
  });
}
