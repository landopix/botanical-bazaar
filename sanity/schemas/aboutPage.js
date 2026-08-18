export default {
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'bioText',
      title: 'Bio Text / Main Story',
      type: 'array',
      of: [{ type: 'block' }],
    },
    {
      name: 'heroImages',
      title: 'Hero Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            },
          ],
        },
      ],
    },
    {
      name: 'teamInfo',
      title: 'Team Members',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', title: 'Name', type: 'string', validation: Rule => Rule.required() },
            { name: 'role', title: 'Role', type: 'string' },
            { name: 'bio', title: 'Short Bio', type: 'text' },
            { name: 'image', title: 'Photo', type: 'image', options: { hotspot: true } },
          ],
        },
      ],
    },
  ],
};
