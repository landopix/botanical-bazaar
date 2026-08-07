export default {
  name: 'accountDashboardCopy',
  title: 'Account Dashboard Copy',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Dashboard Welcome Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'subtitle',
      title: 'Welcome Subtitle',
      type: 'string'
    },
    {
      name: 'announcement',
      title: 'Almanac Sidebar / Notice Announcement',
      type: 'text'
    },
    {
      name: 'phoneSupport',
      title: 'Phone Support Line',
      type: 'string'
    },
    {
      name: 'emailSupport',
      title: 'Email Support Address',
      type: 'string'
    }
  ]
};
