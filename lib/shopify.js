function getSanitizedShopDomain(str) {
  if (typeof str !== 'string') return 'the-botanical-bazaar.myshopify.com';
  let domain = str.trim();
  if (domain.startsWith('https://')) domain = domain.slice(8);
  if (domain.startsWith('http://')) domain = domain.slice(7);
  while (domain.endsWith('/')) {
    domain = domain.slice(0, -1);
  }
  return domain || 'the-botanical-bazaar.myshopify.com';
}

const domain = getSanitizedShopDomain(process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN);
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '136153c263edc39e34b8b67afbef3a72';
const apiVersion = '2026-07';

/**
 * Helper to perform Storefront API GraphQL requests.
 */
export async function shopifyFetch({ query, variables = {} }, retries = 3) {
  const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

  for (let attempt = 1; attempt <= retries; attempt++) {
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
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 500 * attempt));
        continue;
      }
      console.error('Error fetching from Shopify Storefront API:', error);
      throw error;
    }
  }
}

/**
 * Creates or updates a Customer record in Shopify Admin API with email marketing consent.
 * Uses SHOPIFY_ADMIN_ACCESS_TOKEN obtained via OAuth code flow.
 */
export async function createOrUpdateShopifyCustomer({ email, name = '', phone = '', tags = ['newsletter'] }) {
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!adminToken) {
    console.warn('[Shopify Admin API] SHOPIFY_ADMIN_ACCESS_TOKEN is not configured. Customer sync skipped.');
    return { success: false, reason: 'unconfigured' };
  }

  const cleanEmail = String(email).trim();
  const nameParts = String(name).trim().split(/\s+/);
  const firstName = nameParts[0] || 'Subscriber';
  const lastName = nameParts.slice(1).join(' ') || '';

  const adminEndpoint = `https://${domain}/admin/api/2026-01/customers.json`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': adminToken,
  };

  const consentPayload = {
    state: 'subscribed',
    opt_in_level: 'single_opt_in',
    consent_updated_at: new Date().toISOString(),
  };

  const customerPayload = {
    customer: {
      first_name: firstName,
      last_name: lastName,
      email: cleanEmail,
      email_marketing_consent: consentPayload,
      tags: Array.isArray(tags) ? tags.join(', ') : String(tags),
    },
  };

  if (phone && phone !== 'N/A') {
    customerPayload.customer.phone = String(phone).trim();
  }

  try {
    const createRes = await fetch(adminEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(customerPayload),
    });

    const createData = await createRes.json();

    if (createRes.ok && createData.customer) {
      return { success: true, customer: createData.customer };
    }

    // If customer already exists, search and update consent
    if (createRes.status === 422 || (createData.errors && createData.errors.email)) {
      const searchEndpoint = `https://${domain}/admin/api/2026-01/customers/search.json?query=email:${encodeURIComponent(cleanEmail)}`;
      const searchRes = await fetch(searchEndpoint, { headers });
      const searchData = await searchRes.json();

      const existingCustomer = searchData?.customers?.[0];

      if (existingCustomer && existingCustomer.id) {
        const updateEndpoint = `https://${domain}/admin/api/2026-01/customers/${existingCustomer.id}.json`;
        const existingTags = existingCustomer.tags ? existingCustomer.tags.split(',').map(t => t.trim()) : [];
        const mergedTags = Array.from(new Set([...existingTags, ...tags])).join(', ');

        const updatePayload = {
          customer: {
            id: existingCustomer.id,
            email_marketing_consent: consentPayload,
            tags: mergedTags,
          },
        };

        const updateRes = await fetch(updateEndpoint, {
          method: 'PUT',
          headers,
          body: JSON.stringify(updatePayload),
        });

        const updateData = await updateRes.json();
        if (updateRes.ok && updateData.customer) {
          return { success: true, customer: updateData.customer, updated: true };
        }
      }
    }

    console.warn('[Shopify Admin API Warning] Customer sync returned non-OK response:', createData);
    return { success: false, error: createData };
  } catch (err) {
    console.error('[Shopify Admin API Error] Failed to create or update customer:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Parses a product title string into common name and scientific name.
 * Example: "Monstera Deliciosa (Monstera deliciosa Liebm.)" ->
 * { commonName: "Monstera Deliciosa", scientificName: "Monstera deliciosa Liebm." }
 */
export function parseProductTitle(title) {
  if (!title) return { commonName: '', scientificName: null };
  const match = title.match(/^(.*?)\s*\((.*?)\)\s*$/);
  if (match) {
    return {
      commonName: match[1].trim(),
      scientificName: match[2].trim()
    };
  }
  return {
    commonName: title.trim(),
    scientificName: null
  };
}

/**
 * Formats a raw Shopify product GraphQL node into the data structure expected by frontend components.
 */
export function formatShopifyProduct(node) {
  if (!node) return null;

  const variants = node.variants?.edges?.map(edge => edge.node) || [];

  // Find lowest-priced in-stock variant, falling back to variants[0]
  const availableVariants = variants.filter(
    v => v.availableForSale !== false && (v.quantityAvailable === undefined || v.quantityAvailable > 0)
  );
  let primaryVariant = variants[0] || {};
  if (availableVariants.length > 0) {
    primaryVariant = availableVariants.reduce((lowest, v) => {
      const vPrice = parseFloat(v.price?.amount || 0);
      const lowestPrice = parseFloat(lowest.price?.amount || 0);
      return vPrice < lowestPrice ? v : lowest;
    }, availableVariants[0]);
  }

  // Extract collections
  const collections = node.collections?.edges?.map(edge => edge.node) || [];
  const collectionHandles = collections.map(c => c.handle);

  // Custom metafields
  const plantTypeValue = node.plantTypeMetafield?.value || null;
  const potSizeValue = node.potSizeMetafield?.value || null;
  const hardinessZoneValue = node.hardinessZoneMetafield?.value || null;
  const bloomStatusValue = node.bloomStatusMetafield?.value || null;
  const growthDormancyValue = node.growthDormancyMetafield?.value || null;

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
    vendor: node.vendor || null,
    slug: node.handle,
    name: node.title,
    sku: primaryVariant.sku || '',
    createdAt: node.createdAt || '',
    updatedAt: node.updatedAt || node.createdAt || '',
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
      plant_type: plantTypeValue,
      pot_size: potSizeValue,
      hardiness_zone: hardinessZoneValue,
      bloom_status: bloomStatusValue,
      growth_dormancy: growthDormancyValue
    },
    bloom_status: bloomStatusValue,
    growth_dormancy: growthDormancyValue,
    variants: variants.map(v => ({
      id: v.id,
      title: v.title,
      price: parseFloat(v.price?.amount || price),
      compareAtPrice: v.compareAtPrice?.amount ? parseFloat(v.compareAtPrice.amount) : null,
      availableForSale: v.availableForSale,
      quantityAvailable: v.quantityAvailable ?? 0,
      selectedOptions: v.selectedOptions || [],
      sku: v.sku || '',
      image: v.image?.url || null
    }))
  };
}

/**
 * GraphQL fragment for custom & botanical namespace metafields
 */
const PRODUCT_METAFIELDS_FRAGMENT = `
  plantTypeMetafield: metafield(namespace: "custom", key: "plant_type") {
    value
    type
  }
  potSizeMetafield: metafield(namespace: "custom", key: "pot_size") {
    value
    type
  }
  hardinessZoneMetafield: metafield(namespace: "custom", key: "hardiness_zone") {
    value
    type
  }
  bloomStatusMetafield: metafield(namespace: "custom", key: "bloom_status") {
    value
    type
  }
  growthDormancyMetafield: metafield(namespace: "custom", key: "growth_dormancy") {
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
    query getAllProducts($first: Int = 250, $after: String) {
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            title
            handle
            createdAt
            updatedAt
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

  let allRawProducts = [];
  let hasNextPage = true;
  let endCursor = null;

  while (hasNextPage) {
    const variables = { first: 250 };
    if (endCursor) {
      variables.after = endCursor;
    }

    const data = await shopifyFetch({ query, variables });
    const productsData = data?.products;
    const rawProducts = productsData?.edges?.map(edge => edge.node) || [];
    allRawProducts = allRawProducts.concat(rawProducts);

    hasNextPage = productsData?.pageInfo?.hasNextPage || false;
    endCursor = productsData?.pageInfo?.endCursor || null;
  }

  return allRawProducts.map(formatShopifyProduct);
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
        updatedAt
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
    query getAllProductHandles($first: Int = 250, $after: String) {
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            handle
          }
        }
      }
    }
  `;

  let allHandles = [];
  let hasNextPage = true;
  let endCursor = null;

  while (hasNextPage) {
    const variables = { first: 250 };
    if (endCursor) {
      variables.after = endCursor;
    }

    const data = await shopifyFetch({ query, variables });
    const productsData = data?.products;
    const handles = productsData?.edges?.map(edge => edge.node.handle).filter(Boolean) || [];
    allHandles = allHandles.concat(handles);

    hasNextPage = productsData?.pageInfo?.hasNextPage || false;
    endCursor = productsData?.pageInfo?.endCursor || null;
  }

  return allHandles;
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

/**
 * Fetches articles from a Shopify Blog by handle (defaults to "the-almanac").
 */
export async function getAlmanacArticles(blogHandle = 'the-almanac') {
  const query = `
    query getBlogArticles($blogHandle: String!) {
      blog(handle: $blogHandle) {
        id
        handle
        title
        articles(first: 20) {
          edges {
            node {
              id
              title
              handle
              excerpt
              excerptHtml
              content
              contentHtml
              publishedAt
              onlineStoreUrl
              authorV2 {
                name
              }
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch({ query, variables: { blogHandle } });
    const articles = data?.blog?.articles?.edges?.map(edge => {
      const node = edge.node;
      return {
        id: node.id,
        title: node.title,
        handle: node.handle,
        excerpt: node.excerpt || (node.content ? (node.content.length > 240 ? node.content.slice(0, 237) + '...' : node.content) : ''),
        publishedAt: node.publishedAt,
        onlineStoreUrl: node.onlineStoreUrl ? node.onlineStoreUrl.replace(/^https?:\/\/[^/]+\.myshopify\.com/, "https://thebotanicalbazaar.com") : null,
        author: node.authorV2?.name || 'The Botanical Bazaar',
        imageUrl: node.image?.url || null,
        imageAlt: node.image?.altText || node.title
      };
    }) || [];

    return articles;
  } catch (error) {
    console.error(`Error fetching blog articles for handle "${blogHandle}":`, error);
    return [];
  }
}

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
