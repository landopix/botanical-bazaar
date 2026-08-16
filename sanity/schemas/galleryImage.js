export default {
  name: 'galleryImage',
  title: 'Gallery Image',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Image Title',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'image',
      title: 'High-Res Image',
      type: 'image',
      options: { hotspot: true },
      validation: Rule => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category Filter',
      type: 'string',
      options: {
        list: [
          { title: 'Rare Tropicals', value: 'Rare Tropicals' },
          { title: 'Orchids', value: 'Orchids' },
          { title: 'Aroids', value: 'Aroids' },
          { title: 'Nursery & Gardens', value: 'Nursery & Gardens' },
        ],
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'caption',
      title: 'Caption / Description',
      type: 'text',
    },
  ],
};
