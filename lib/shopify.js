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
