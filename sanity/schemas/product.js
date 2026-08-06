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
      validation: Rule => Rule.required()
    },
    {
      name: 'sku',
      title: 'SKU',
      type: 'string'
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'type',
      title: 'Type',
      type: 'string',
      description: 'e.g. Plant, Seed, Shrub'
    },
    {
      name: 'description',
      title: 'Dual-Layer Description Specs',
      type: 'text',
      description: 'First layer: engaging marketing copy; Second layer: technical specifications'
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
      name: 'zones',
      title: 'USDA Zones',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'USDA Hardiness Zones (e.g. 9, 10, 11)'
    },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Herbs & Medicinal', value: 'herbs-medicinal' },
          { title: 'Fruit Trees', value: 'fruit-trees' },
          { title: 'Houseplants', value: 'houseplants' },
          { title: 'Orchids & Tropicals', value: 'orchids-tropicals' },
          { title: 'Seeds', value: 'seeds' },
          { title: 'Exotics & Rare', value: 'exotics-rare' }
        ]
      }
    },
    {
      name: 'sizes',
      title: 'Pricing Tiers / Sizes',
      type: 'string',
      description: 'Size variants separated by pipes (e.g. 4" Pot | 1 Gal. Pot)'
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }]
    }
  ]
};
