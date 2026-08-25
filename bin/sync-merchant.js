#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local if present
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');

if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const equalsIdx = trimmed.indexOf('=');
      if (equalsIdx > 0) {
        const key = trimmed.substring(0, equalsIdx).trim();
        let val = trimmed.substring(equalsIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

import { getAllProducts } from '../lib/shopify.js';
import { mapCatalogToGoogleMerchantItems, syncToGoogleMerchantContentApi } from '../lib/google-merchant.js';

async function runSync() {
  console.log('🌿 Starting Botanical Bazaar Google Merchant Center Sync Utility...\n');

  const merchantId = process.env.GOOGLE_MERCHANT_ID || '5843329915';
  const dataSourceName = process.env.GOOGLE_DATA_SOURCE_NAME || 'Botanical Bazaar Live Catalog';
  const dataSourceId = process.env.GOOGLE_DATA_SOURCE_ID || '10714664344';

  console.log(`- Merchant ID: ${merchantId}`);
  console.log(`- Data Source Name: ${dataSourceName}`);
  console.log(`- Data Source ID: ${dataSourceId}\n`);

  try {
    console.log('Fetching live product catalog from Shopify Storefront API...');
    const products = await getAllProducts();
    console.log(`✅ Successfully fetched ${products.length} products from Shopify.\n`);

    console.log('Mapping product catalog to Google Content API format...');
    const merchantItems = mapCatalogToGoogleMerchantItems(products, {
      dataSourceId,
      defaultBrand: 'The Botanical Bazaar'
    });
    console.log(`✅ Successfully mapped ${merchantItems.length} variant items.\n`);

    if (merchantItems.length > 0) {
      console.log('Sample Mapped Item Overview:');
      console.log(`  - Offer ID: ${merchantItems[0].offerId}`);
      console.log(`  - Title: ${merchantItems[0].title}`);
      console.log(`  - Link: ${merchantItems[0].link}`);
      console.log(`  - Price: ${merchantItems[0].price?.value} ${merchantItems[0].price?.currency}`);
      console.log(`  - Availability: ${merchantItems[0].availability}`);
      console.log(`  - Brand: ${merchantItems[0].brand}`);
      console.log(`  - Identifier Exists: ${merchantItems[0].identifierExists}\n`);
    }

    // Check for --export argument
    const exportIdx = process.argv.indexOf('--export');
    if (exportIdx !== -1 && process.argv[exportIdx + 1]) {
      const outputPath = path.resolve(process.cwd(), process.argv[exportIdx + 1]);
      fs.writeFileSync(outputPath, JSON.stringify(merchantItems, null, 2), 'utf8');
      console.log(`💾 Exported mapped Google Merchant items to: ${outputPath}\n`);
    }

    // Direct Google Content API push if credentials present
    if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      console.log('Sending Google Content API v2.1 batch push request...');
      const result = await syncToGoogleMerchantContentApi({
        items: merchantItems,
        merchantId,
        dataSourceId
      });
      console.log('✅ Google Content API sync completed:', JSON.stringify(result, null, 2));
    } else {
      console.log('ℹ️ Google Service Account credentials not found in environment.');
      console.log('   The catalog payload is ready to be served via GET /api/merchant/sync or pulled by Data Source 10714664344.');
    }

  } catch (err) {
    console.error('❌ Google Merchant Sync Failed:', err);
    process.exit(1);
  }
}

runSync();
