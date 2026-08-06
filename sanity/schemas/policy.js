export default {
  name: 'policy',
  title: 'Policies & Legal Pages',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Policy Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title'
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'content',
      title: 'Policy Markdown/HTML Content',
      type: 'text',
      validation: Rule => Rule.required()
    },
    {
      name: 'lastUpdated',
      title: 'Last Updated Date',
      type: 'date'
    }
  ]
};
