export default {
  name: 'globalSettings',
  title: 'Global Settings & Navigation',
  type: 'document',
  fields: [
    {
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'submark',
      title: 'Lantern Submark Image',
      type: 'image',
      options: { hotspot: true },
      validation: Rule => Rule.required()
    },
    {
      name: 'heroLogo',
      title: 'Hero Animated Logo',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'supportPhone',
      title: 'Support Phone',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'supportEmail',
      title: 'Support Email',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'mainMenuItems',
      title: 'Main Menu Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Label', type: 'string', validation: Rule => Rule.required() },
            { name: 'url', title: 'URL Target', type: 'string', validation: Rule => Rule.required() }
          ]
        }
      ]
    },
    {
      name: 'sidebarGroups',
      title: 'Sidebar Groups',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Group Title', type: 'string', validation: Rule => Rule.required() },
            {
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'label', title: 'Label', type: 'string', validation: Rule => Rule.required() },
                    { name: 'url', title: 'URL Target', type: 'string', validation: Rule => Rule.required() }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'footerLinks',
      title: 'Footer Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Label', type: 'string', validation: Rule => Rule.required() },
            { name: 'url', title: 'URL Target', type: 'string', validation: Rule => Rule.required() }
          ]
        }
      ]
    }
  ]
};
