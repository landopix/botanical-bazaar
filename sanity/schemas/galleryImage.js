export default {
  name: 'galleryImage',
  title: 'Gallery Item',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: Rule => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'category',
      title: 'Category / Tag',
      type: 'string',
      options: {
        list: [
          { title: 'Collector Orchids', value: 'collector-orchids' },
          { title: 'Tropical Fruit Trees', value: 'tropical-fruit-trees' },
          { title: 'Herbs & Medicinal', value: 'herbs-medicinal' },
          { title: 'Rare Aroids', value: 'rare-aroids' },
          { title: 'Apothecary Goods', value: 'apothecary-goods' },
        ],
      },
      validation: Rule => Rule.required(),
    },
  ],
};
