import {defineArrayMember, defineField, defineType} from 'sanity'

export const collectorGallery = defineType({
  name: 'collectorGallery',
  title: 'Collector Gallery',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'intro',
      title: 'Introduction',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().max(500),
    }),

    defineField({
      name: 'items',
      title: 'Gallery Items',
      type: 'array',
      validation: (rule) => rule.required().min(1),
      of: [
        defineArrayMember({
          name: 'galleryItem',
          title: 'Gallery Item',
          type: 'object',

          fields: [
            defineField({
              name: 'image',
              title: 'Specimen Image',
              type: 'image',
              options: {hotspot: true},
              validation: (rule) => rule.required(),
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alternative Text',
                  type: 'string',
                  description:
                    'Describe what is visible rather than repeating the caption.',
                  validation: (rule) => rule.required().max(200),
                }),
              ],
            }),

            defineField({
              name: 'scientificName',
              title: 'Scientific Name',
              type: 'string',
              validation: (rule) => rule.required(),
            }),

            defineField({
              name: 'commonName',
              title: 'Common or Collection Name',
              type: 'string',
            }),

            defineField({
              name: 'plantGroup',
              title: 'Plant Group',
              type: 'string',
              options: {
                list: [
                  {title: 'Orchid', value: 'orchid'},
                  {title: 'Aroid', value: 'aroid'},
                  {
                    title: 'Tropical Foliage',
                    value: 'tropicalFoliage',
                  },
                  {title: 'Other', value: 'other'},
                ],
                layout: 'radio',
              },
              validation: (rule) => rule.required(),
            }),

            defineField({
              name: 'caption',
              title: 'Gallery Caption',
              type: 'text',
              rows: 4,
              validation: (rule) => rule.required().max(600),
            }),

            defineField({
              name: 'action',
              title: 'Optional Action',
              type: 'object',
              fields: [
                defineField({
                  name: 'kind',
                  title: 'Action Type',
                  type: 'string',
                  options: {
                    list: [
                      {title: 'Product Page', value: 'product'},
                      {
                        title: 'Sourcing Request',
                        value: 'sourcingRequest',
                      },
                    ],
                    layout: 'radio',
                  },
                }),
                defineField({
                  name: 'label',
                  title: 'Link Label',
                  type: 'string',
                }),
                defineField({
                  name: 'href',
                  title: 'Internal Path or URL',
                  type: 'string',
                  description:
                    'Examples: /products/example or /pages/sourcing-request',
                }),
              ],
            }),
          ],

          preview: {
            select: {
              title: 'scientificName',
              subtitle: 'commonName',
              media: 'image',
            },
          },
        }),
      ],
    }),

    defineField({
      name: 'seo',
      title: 'Search Metadata',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'SEO Title',
          type: 'string',
          validation: (rule) => rule.max(60),
        }),
        defineField({
          name: 'description',
          title: 'SEO Description',
          type: 'text',
          validation: (rule) => rule.max(160),
        }),
      ],
    }),
  ],
})
