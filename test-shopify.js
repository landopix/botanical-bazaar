import { getTestMonsteraProduct } from './lib/shopify.js';

async function runTest() {
  console.log('Testing Shopify Storefront API connection...\n');
  try {
    const product = await getTestMonsteraProduct();
    if (!product) {
      console.log('❌ Could not find product "Test Monstera".');
      return;
    }

    console.log('✅ Connection Successful!\n');
    console.log('Product Details:');
    console.log(`- Title: ${product.title}`);
    console.log(`- Handle: ${product.handle}`);
    console.log(`- ID: ${product.id}`);
    console.log(`- Description: ${product.description}`);

    console.log('\nVariants:');
    const variants = product.variants?.edges?.map(edge => edge.node) || [];
    if (variants.length === 0) {
      console.log('  No variants found.');
    } else {
      variants.forEach((v, index) => {
        console.log(`  ${index + 1}. Title: ${v.title} | Price: ${v.price?.amount} ${v.price?.currencyCode} | Available: ${v.availableForSale}`);
      });
    }
  } catch (error) {
    console.error('❌ Shopify connection test failed with error:', error.message);
  }
}

runTest();
