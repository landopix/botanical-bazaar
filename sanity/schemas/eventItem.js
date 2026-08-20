export default {
  name: 'eventItem',
  title: 'Event',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'dateTime',
      title: 'Date & Time',
      type: 'datetime',
      validation: Rule => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description / Content',
      type: 'text',
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g. St. Petersburg Nursery or Gulfport Community Center',
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Optional banner or highlight image for the event',
    },
    {
      name: 'ticketUrl',
      title: 'Ticket / Registration Link',
      type: 'url',
    },
  ],
};
