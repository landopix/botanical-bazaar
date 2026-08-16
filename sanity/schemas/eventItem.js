export default {
  name: 'eventItem',
  title: 'Event Item',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Event Title',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'dateTime',
      title: 'Date and Time',
      type: 'datetime',
      validation: Rule => Rule.required(),
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g. St. Petersburg Nursery or Gulfport Community Center',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'ticketUrl',
      title: 'External Ticket / RSVP Link',
      type: 'url',
    },
  ],
};
