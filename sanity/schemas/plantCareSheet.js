export default {
  name: 'plantCareSheet',
  title: 'Plant Care Sheet',
  type: 'document',
  fields: [
    {
      name: 'botanicalName',
      title: 'Botanical Name',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'commonName',
      title: 'Common Name',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'commonName', maxLength: 96 },
    },
    {
      name: 'lightNeeds',
      title: 'Light Needs',
      type: 'string',
      description: 'e.g. Bright Indirect Light, Full Sun, Shade',
    },
    {
      name: 'wateringNeeds',
      title: 'Watering Needs',
      type: 'string',
      description: 'e.g. Keep evenly moist, Allow top 2 inches to dry',
    },
    {
      name: 'humidityNeeds',
      title: 'Humidity Needs',
      type: 'string',
      description: 'e.g. High Humidity (60%+), Average Indoor',
    },
    {
      name: 'soilNeeds',
      title: 'Soil Needs',
      type: 'string',
      description: 'e.g. Well-draining chunky aroid mix, Rich organic loam',
    },
    {
      name: 'toxicity',
      title: 'Pet Safety / Toxicity',
      type: 'string',
      description: 'e.g. Non-toxic / Pet Safe, Toxic to cats and dogs if ingested',
    },
    {
      name: 'zoneCompatibility',
      title: 'USDA Zone Compatibility',
      type: 'string',
      description: 'e.g. Zones 9b - 11',
    },
    {
      name: 'careInstructions',
      title: 'Care Instructions',
      type: 'text',
    },
    {
      name: 'image',
      title: 'Plant Image',
      type: 'image',
      options: { hotspot: true },
    },
  ],
};
