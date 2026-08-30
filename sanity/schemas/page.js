export default {
  name: 'page',
  title: 'Page Layouts & Settings',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Page Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96
      },
      validation: Rule => Rule.required(),
      // Editors restricted from modifying slugs
      readOnly: ({ currentUser }) => {
        const isEditor = currentUser?.roles?.some(r => r.name === 'editor');
        const isAdmin = currentUser?.roles?.some(r => r.name === 'administrator' || r.name === 'owner');
        return isEditor && !isAdmin;
      }
    },
    {
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      description: 'Title for search engines and social cards (recommended max 60 characters).',
      validation: Rule => Rule.required().max(60).warning('SEO Titles should ideally be 60 characters or fewer for search engines.')
    },
    {
      name: 'seoDescription',
      title: 'Meta Description',
      type: 'text',
      description: 'Meta description for search engine listings (recommended max 155 characters).',
      validation: Rule => Rule.required().max(155).warning('Meta descriptions should ideally be 155 characters or fewer.')
    },
    {
      name: 'seoCanonical',
      title: 'Canonical Target URL',
      type: 'url',
      validation: Rule => Rule.required(),
      // Editors restricted from altering canonical URLs
      readOnly: ({ currentUser }) => {
        const isEditor = currentUser?.roles?.some(r => r.name === 'editor');
        const isAdmin = currentUser?.roles?.some(r => r.name === 'administrator' || r.name === 'owner');
        return isEditor && !isAdmin;
      }
    },
    {
      name: 'status',
      title: 'Page Publishing Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Preview', value: 'preview' },
          { title: 'Published', value: 'published' }
        ],
        layout: 'dropdown'
      },
      initialValue: 'draft',
      validation: Rule => Rule.required()
    }
  ]
};
