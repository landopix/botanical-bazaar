# Shopify Data Contract & Mapping Specification

## Overview
This document establishes the official data contract between the Shopify Storefront API and The Botanical Bazaar React frontend / components. It defines tag standards, custom metafield specifications, variant structure handling, and frontend React prop transformations.

---

## 1. Shopify Tag Conventions

Shopify product tags drive dynamic storefront filtering and categorization. Standardized tag prefixes MUST be used:

| Tag Prefix / Pattern | Example | Purpose / Behavior |
| :--- | :--- | :--- |
| `category:<slug>` | `category:houseplants` | Maps to shop collection & filter categories. Stripped of `category:` prefix during formatting. |
| `zone:<zone>` | `zone:9b` | Hardiness climate zone mapping. Stripped of `zone:` prefix. |
| `zones:<zone>` | `zones:10a` | Hardiness climate zone mapping alternative. Stripped of `zones:` prefix. |
| `^\d+[ab]?$` | `9b`, `10a` | Direct zone pattern regex matching. Added directly to hardiness zones filter list. |

*Note: In addition to tags, `productType` on the Shopify Product GraphQL Node is automatically included as a primary category.*

---

## 2. Product Variants & Size Formatting

Product variant titles determine pot size options displayed on product cards and detail pages:

- **Single Variant / Default**: If the product has a single variant with title `Default Title`, the component falls back to `"Standard Pot"`.
- **Multiple Variants**: Non-`Default Title` variant titles (e.g., `"4-inch Pot"`, `"6-inch Pot"`, `"1-gallon Container"`) are collected and joined with a pipe separator `" | "` into a single `sizes` string (e.g. `"4-inch Pot | 6-inch Pot | 1-gallon Container"`).
- Component size filtering splits this string on ` | ` to extract discrete size filter options.

---

## 3. Shopify Metafield Contract (`botanical` Namespace)

Custom plant specifications and care details are stored under the `botanical` custom namespace in Shopify:

| Metafield Identifier | Shopify Type | Description | Frontend React Property | Fallback Value |
| :--- | :--- | :--- | :--- | :--- |
| `botanical.min_temp_ground` | `number_integer` / `number_decimal` | Minimum cold hardiness temp in ground (°F) | `minTempInGround` | Parsed from tags or `"N/A"` |
| `botanical.min_temp_pot` | `number_integer` / `number_decimal` | Minimum cold hardiness temp in pot (°F) | `minTempInPot` | Parsed from tags or `"N/A"` |
| `botanical.light_levels` | `single_line_text_field` | Recommended light conditions (e.g. "Bright Indirect Light") | `lightLevels` | `"Bright Indirect Light"` |
| `botanical.watering_specs` | `single_line_text_field` | Recommended watering frequency/rules | `wateringSpecs` | `"Water when top soil feels dry"` |
| `botanical.pet_safe` | `boolean` | Indicates whether the plant is pet-safe / non-toxic | `petSafe` | `false` |

---

## 4. GraphQL Query & React Prop Transformation Mapping

The helper `formatShopifyProduct(node)` in `lib/shopify.js` transforms the raw GraphQL Node into the standard product contract object:

```typescript
interface FrontendProductContract {
  id: string;                 // Shopify GraphQL GID (e.g. "gid://shopify/Product/123456789")
  slug: string;               // Shopify handle (e.g. "monstera-deliciosa")
  name: string;               // Product title
  sku: string;                // SKU code from primary variant
  image: string;              // Primary image URL
  images: string[];           // Array of all product image URLs
  type: string;               // Product type (e.g. "Tropical Plant")
  description: string;        // Plaintext description
  descriptionHtml: string;    // Raw HTML description from Shopify
  price: number;              // Numeric price float
  quantity: number;           // Total inventory quantity available across variants
  zones: string[];            // Extracted hardiness climate zones array (e.g. ["9a", "9b", "10a"])
  categories: string[];       // Extracted categories array (e.g. ["houseplants", "rare"])
  sizes: string;              // Pipe-separated sizes string (e.g. "4-inch | 6-inch")
  tags: string[];             // Normalized array of lowercase tags
  minTempInGround: string;    // Cold hardiness temp in ground string (e.g. "25°F")
  minTempInPot: string;       // Cold hardiness temp in pot string (e.g. "35°F")
  lightLevels: string;        // Light level description
  wateringSpecs: string;      // Care watering requirements
  petSafe: boolean;           // Pet safety boolean flag
  availableForSale: boolean;  // Shopify availableForSale status
  variants: Array<{
    id: string;
    title: string;
    price: number;
    availableForSale: boolean;
    quantityAvailable: number;
    selectedOptions: Array<{ name: string; value: string }>;
    sku: string;
  }>;
}
```

---

## 5. Inventory & Availability Business Rules

1. **Sold-Out Threshold**: Products with `quantity < 3` or `availableForSale == false` are treated as Sold Out in catalog views.
2. **Catalog Default Display**: Catalog views default to suppressing sold-out products unless `view_sold_out=true` is set.
3. **Sorting Order**: When sold-out products are visible, in-stock products (`quantity >= 3`) are strictly sorted to precede sold-out items.
