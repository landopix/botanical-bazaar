export default {
  name: 'product',
  title: 'Product Catalog',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96
      },
      validation: Rule => Rule.required(),
      // Editors programmatically restricted from altering SEO slugs or deleting core components
      readOnly: ({ currentUser }) => {
        const isEditor = currentUser?.roles?.some(r => r.name === 'editor');
        const isAdmin = currentUser?.roles?.some(r => r.name === 'administrator' || r.name === 'owner');
        return isEditor && !isAdmin;
      }
    },
    {
      name: 'sku',
      title: 'SKU',
      type: 'string'
    },
    {
      name: 'price_mode',
      title: 'Price Display Mode',
      type: 'string',
      options: {
        list: [
          { title: 'Fixed Price', value: 'fixed' },
          { title: 'Price on Request', value: 'request' }
        ],
        layout: 'radio'
      },
      initialValue: 'fixed',
      validation: Rule => Rule.required()
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: Rule => Rule.min(0)
    },
    {
      name: 'quantity',
      title: 'Inventory Quantity',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'image_alt',
      title: 'Product Image Alt Text',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'type',
      title: 'Type',
      type: 'string',
      description: 'e.g. Plant, Seed, Shrub'
    },
    {
      name: 'description',
      title: 'Rich-Text Description',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Engaging marketing copy and technical specifications in rich text format'
    },
    {
      name: 'variants',
      title: 'Variants Repeater',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Variant Label (Size/Container)', type: 'string', validation: Rule => Rule.required() },
            { name: 'price', title: 'Price (optional override)', type: 'number' }
          ]
        }
      ]
    },
    {
      name: 'sizes',
      title: 'Legacy Pipe-Separated Sizes (Fallback)',
      type: 'string',
      description: 'Pipe-separated sizes (e.g. 4" Pot | 1 Gal. Pot)'
    },
    {
      name: 'zones',
      title: 'USDA Zones',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'USDA Hardiness Zones (e.g. 9, 10, 11)'
    },
    {
      name: 'minTempInGround',
      title: 'Lowest Survivable Temp In-Ground',
      type: 'string',
      description: 'e.g. 28°F or 28°F - 30°F'
    },
    {
      name: 'minTempInPot',
      title: 'Lowest Survivable Temp In-Pot',
      type: 'string',
      description: 'e.g. 35°F or 32°F - 35°F'
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }]
    },
    {
      name: 'featured_order',
      title: 'Featured Order Placement',
      type: 'number',
      description: 'Lower numbers place higher in featured section lists (e.g. 1, 2, 3)'
    }
  ]
};
