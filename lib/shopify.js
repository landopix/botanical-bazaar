const rawDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'the-botanical-bazaar.myshopify.com';
const domain = rawDomain.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '136153c263edc39e34b8b67afbef3a72';
const apiVersion = '2025-01';

/**
 * Helper to perform Storefront API GraphQL requests.
 */
export async function shopifyFetch({ query, variables = {} }) {
  const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();

    if (json.errors) {
      console.error('Shopify API errors:', json.errors);
      throw new Error(json.errors.map(e => e.message).join('\n'));
    }

    return json.data;
  } catch (error) {
    console.error('Error fetching from Shopify Storefront API:', error);
    throw error;
  }
}

/**
 * Formats a raw Shopify product GraphQL node into the data structure expected by frontend components.
 */
export function formatShopifyProduct(node) {
  if (!node) return null;

  const variants = node.variants?.edges?.map(edge => edge.node) || [];
  const primaryVariant = variants[0] || {};

  // Extract collections
  const collections = node.collections?.edges?.map(edge => edge.node) || [];
  const collectionHandles = collections.map(c => c.handle);

  // Custom metafields
  const potSizeValue = node.potSizeMetafield?.value || null;
  const hardinessZoneValue = node.hardinessZoneMetafield?.value || null;

  // Extract sizes string by joining unique non-'Default Title' variant titles with " | "
  const variantTitles = variants
    .map(v => v.title)
    .filter(title => title && title !== 'Default Title');

  let sizes = variantTitles.length > 0 ? variantTitles.join(' | ') : (potSizeValue || 'Standard Pot');

  // Parse tags for categories, hardiness zones, and thermal thresholds
  const rawTags = node.tags || [];
  const categories = new Set();
  const zones = new Set();
  const cleanTags = [];

  if (node.productType) {
    categories.add(node.productType.toLowerCase().trim());
  }

  // Include collection handles and titles in categories set
  collections.forEach(col => {
    if (col.handle) categories.add(col.handle.toLowerCase().trim());
    if (col.title) categories.add(col.title.toLowerCase().trim());
  });

  rawTags.forEach(tag => {
    const trimmed = tag.trim();
    const lower = trimmed.toLowerCase();
    cleanTags.push(lower);

    if (lower.startsWith('category:')) {
      categories.add(lower.replace('category:', '').trim());
    } else if (lower.startsWith('zone:')) {
      zones.add(lower.replace('zone:', '').trim());
    } else if (lower.startsWith('zones:')) {
      zones.add(lower.replace('zones:', '').trim());
    } else if (/^\d+[ab]?$/.test(lower)) {
      zones.add(lower);
    }
  });

  if (hardinessZoneValue) {
    zones.add(hardinessZoneValue.trim());
  }

  const images = node.images?.edges?.map(edge => edge.node.url) || [];
  const image = images[0] || '/assets/placeholder.png';

  const price = parseFloat(
    primaryVariant.price?.amount || node.priceRange?.minVariantPrice?.amount || 0
  );
  const minVariantPrice = parseFloat(node.priceRange?.minVariantPrice?.amount || price);

  const rawCompare = parseFloat(primaryVariant.compareAtPrice?.amount || 0);
  const compareAtPrice = rawCompare > price ? rawCompare : null;

  let quantity = 0;
  if (node.availableForSale) {
    if (typeof node.totalInventory === 'number' && node.totalInventory !== null) {
      quantity = node.totalInventory;
    } else {
      const sumVarQty = variants.reduce((sum, v) => sum + (v.quantityAvailable || 0), 0);
      quantity = sumVarQty > 0 ? sumVarQty : 10;
    }
  }

  // Metafields extraction with safe fallbacks
  const minTempGroundMetafield = node.minTempGroundMetafield?.value;
  const minTempPotMetafield = node.minTempPotMetafield?.value;
  const lightLevelsMetafield = node.lightLevelsMetafield?.value;
  const wateringSpecsMetafield = node.wateringSpecsMetafield?.value;
  const petSafeMetafield = node.petSafeMetafield?.value;

  const minTempInGround = minTempGroundMetafield
    ? (minTempGroundMetafield.includes('°F') ? minTempGroundMetafield : `${minTempGroundMetafield}°F`)
    : null;

  const minTempInPot = minTempPotMetafield
    ? (minTempPotMetafield.includes('°F') ? minTempPotMetafield : `${minTempPotMetafield}°F`)
    : null;

  const tempThreshold = minTempGroundMetafield
    ? minTempGroundMetafield.replace(/[^0-9]/g, '')
    : null;

  const lightLevels = lightLevelsMetafield || 'Bright Indirect Light';
  const wateringSpecs = wateringSpecsMetafield || 'Water when top soil feels dry';
  const petSafe = petSafeMetafield === 'true' || petSafeMetafield === true || cleanTags.includes('pet-safe') || cleanTags.includes('petsafe') || cleanTags.includes('pet safe');

  return {
    id: node.id,
    slug: node.handle,
    name: node.title,
    sku: primaryVariant.sku || '',
    createdAt: node.createdAt || '',
    image,
    images,
    type: node.productType || 'Plant',
    description: node.description || '',
    descriptionHtml: node.descriptionHtml || '',
    price,
    minVariantPrice,
    quantity,
    zones: Array.from(zones),
    categories: Array.from(categories),
    collections,
    collectionHandles,
    sizes,
    tags: cleanTags,
    minTempInGround,
    minTempInPot,
    temp_threshold: tempThreshold || '50',
    lightLevels,
    wateringSpecs,
    petSafe,
    compareAtPrice,
    availableForSale: node.availableForSale,
    custom: {
      pot_size: potSizeValue,
      hardiness_zone: hardinessZoneValue
    },
    variants: variants.map(v => ({
      id: v.id,
      title: v.title,
      price: parseFloat(v.price?.amount || price),
      availableForSale: v.availableForSale,
      quantityAvailable: v.quantityAvailable ?? 0,
      selectedOptions: v.selectedOptions || [],
      sku: v.sku || ''
    }))
  };
}

/**
 * GraphQL fragment for custom & botanical namespace metafields
 */
const PRODUCT_METAFIELDS_FRAGMENT = `
  potSizeMetafield: metafield(namespace: "custom", key: "pot_size") {
    value
    type
  }
  hardinessZoneMetafield: metafield(namespace: "custom", key: "hardiness_zone") {
    value
    type
  }
  minTempGroundMetafield: metafield(namespace: "botanical", key: "min_temp_ground") {
    value
    type
  }
  minTempPotMetafield: metafield(namespace: "botanical", key: "min_temp_pot") {
    value
    type
  }
  lightLevelsMetafield: metafield(namespace: "botanical", key: "light_levels") {
    value
    type
  }
  wateringSpecsMetafield: metafield(namespace: "botanical", key: "watering_specs") {
    value
    type
  }
  petSafeMetafield: metafield(namespace: "botanical", key: "pet_safe") {
    value
    type
  }
`;

/**
 * Fetches all products from Shopify for the shop grid catalog.
 */
export async function getAllProducts() {
  const query = `
    query getAllProducts($first: Int = 250) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            createdAt
            description
            descriptionHtml
            productType
            tags
            availableForSale
            totalInventory
            collections(first: 10) {
              edges {
                node {
                  id
                  title
                  handle
                }
              }
            }
            ${PRODUCT_METAFIELDS_FRAGMENT}
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 5) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 20) {
              edges {
                node {
                  id
                  title
                  sku
                  availableForSale
                  quantityAvailable
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch({ query });
  const rawProducts = data?.products?.edges?.map(edge => edge.node) || [];
  return rawProducts.map(formatShopifyProduct);
}

/**
 * Fetches a single product by handle/slug for the product details page.
 */
export async function getProductByHandle(handle) {
  const query = `
    query getProductByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        handle
        createdAt
        description
        descriptionHtml
        productType
        tags
        availableForSale
        totalInventory
        collections(first: 10) {
          edges {
            node {
              id
              title
              handle
            }
          }
        }
        ${PRODUCT_METAFIELDS_FRAGMENT}
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 20) {
          edges {
            node {
              id
              title
              sku
              availableForSale
              quantityAvailable
              price {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch({ query, variables: { handle } });
  if (!data?.productByHandle) return null;
  return formatShopifyProduct(data.productByHandle);
}

/**
 * Fetches product handles for getStaticPaths.
 */
export async function getAllProductHandles() {
  const query = `
    query getAllProductHandles($first: Int = 250) {
      products(first: $first) {
        edges {
          node {
            handle
          }
        }
      }
    }
  `;

  const data = await shopifyFetch({ query });
  const edges = data?.products?.edges || [];
  return edges.map(edge => edge.node.handle);
}

/**
 * Fetches the "Test Monstera" product by title query or handle.
 */
export async function getTestMonsteraProduct() {
  const query = `
    query getTestMonstera {
      products(first: 5, query: "title:'Test Monstera'") {
        edges {
          node {
            id
            title
            handle
            createdAt
            description
            ${PRODUCT_METAFIELDS_FRAGMENT}
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch({ query });
  const products = data?.products?.edges?.map(edge => edge.node) || [];
  return products[0] || null;
}

/**
 * Creates a Shopify Cart via Storefront API cartCreate mutation and returns checkoutUrl.
 * @param {Array} lines - Array of { merchandiseId, quantity, attributes }
 * @param {Object} buyerIdentity - Optional buyer email/address info
 * @param {Array} customAttributes - Custom order attributes (fulfillment, notes, etc.)
 */
export async function createShopifyCart({ lines = [], buyerIdentity = null, customAttributes = [] }) {
  const query = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          totalQuantity
          lines(first: 50) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          message
        }
        warnings {
          code
          message
        }
      }
    }
  `;

  const input = {};
  if (lines.length > 0) {
    input.lines = lines;
  }
  if (buyerIdentity) {
    input.buyerIdentity = buyerIdentity;
  }
  if (customAttributes.length > 0) {
    input.attributes = customAttributes;
  }

  const data = await shopifyFetch({ query, variables: { input } });

  if (data?.cartCreate?.userErrors && data.cartCreate.userErrors.length > 0) {
    const errorMsgs = data.cartCreate.userErrors.map(e => e.message).join('; ');
    throw new Error(`Shopify cartCreate error: ${errorMsgs}`);
  }

  const cart = data?.cartCreate?.cart;
  if (!cart || !cart.checkoutUrl) {
    throw new Error('Failed to retrieve checkoutUrl from Shopify cartCreate mutation.');
  }

  return {
    cartId: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity
  };
}
