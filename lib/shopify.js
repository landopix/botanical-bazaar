const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'the-botanical-bazaar.myshopify.com';
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

  // Extract sizes string by joining unique non-'Default Title' variant titles with " | "
  const variantTitles = variants
    .map(v => v.title)
    .filter(title => title && title !== 'Default Title');
  const sizes = variantTitles.length > 0 ? variantTitles.join(' | ') : 'Standard Pot';

  // Parse tags for categories, hardiness zones, and thermal thresholds
  const rawTags = node.tags || [];
  const categories = new Set();
  const zones = new Set();
  const cleanTags = [];

  if (node.productType) {
    categories.add(node.productType.toLowerCase().trim());
  }

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

  const images = node.images?.edges?.map(edge => edge.node.url) || [];
  const image = images[0] || '/assets/placeholder.png';

  const price = parseFloat(
    primaryVariant.price?.amount || node.priceRange?.minVariantPrice?.amount || 0
  );

  let quantity = 0;
  if (node.availableForSale) {
    if (typeof node.totalInventory === 'number' && node.totalInventory !== null) {
      quantity = node.totalInventory;
    } else {
      const sumVarQty = variants.reduce((sum, v) => sum + (v.quantityAvailable || 0), 0);
      quantity = sumVarQty > 0 ? sumVarQty : 10;
    }
  }

  return {
    id: node.id,
    slug: node.handle,
    name: node.title,
    sku: primaryVariant.sku || '',
    image,
    images,
    type: node.productType || 'Plant',
    description: node.description || '',
    descriptionHtml: node.descriptionHtml || '',
    price,
    quantity,
    zones: Array.from(zones),
    categories: Array.from(categories),
    sizes,
    tags: cleanTags,
    availableForSale: node.availableForSale,
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
            description
            descriptionHtml
            productType
            tags
            availableForSale
            totalInventory
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
        description
        descriptionHtml
        productType
        tags
        availableForSale
        totalInventory
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
            description
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price {
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
