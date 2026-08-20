import Head from 'next/head';
import React from 'react';
import { sanityClient, isSanityConfigured } from '../lib/sanity';
import Button from '../components/Button';
import CareSheetCard from '../components/CareSheetCard';

const defaultCareSheets = [
  {
    botanicalName: 'Dendrobium Nobile',
    commonName: 'Nobile Dendrobium Orchid',
    lightNeeds: 'Bright Indirect Light',
    wateringNeeds: 'Allow to dry slightly between waterings',
    zoneCompatibility: 'Zones 10a - 11 (Protect under 45°F)',
    careInstructions: 'Provide ample air circulation and morning sunlight. Reduce watering during cool winter dormancy to encourage vibrant spring blooms.',
    imagePath: '/assets/lantern.png'
  },
  {
    botanicalName: 'Bunchosia Glandulifera',
    commonName: 'Peanut Butter Fruit Tree',
    lightNeeds: 'Full Sun to Partial Shade',
    wateringNeeds: 'Moderate, well-draining soil',
    zoneCompatibility: 'Zones 9b - 11',
    careInstructions: 'Fast-growing tropical shrub yielding sweet, peanut butter-flavored berries. Protect from hard freezes during early growth stages.',
    imagePath: '/assets/peanut-butter-fruit.jpg'
  },
  {
    botanicalName: 'Solanum Lycopersicum var. Cerasiforme',
    commonName: 'Everglades Tomato',
    lightNeeds: 'Full Sun',
    wateringNeeds: 'Regular moist conditions',
    zoneCompatibility: 'Zones 8a - 11',
    careInstructions: 'Extremely resilient Florida native heirloom vine. Highly heat and humidity tolerant, producing abundant sweet cherry tomatoes year-round in St. Petersburg.',
    imagePath: '/assets/everglades-tomato.jpg'
  }
];

export default function Almanac({ careSheets }) {
  const sheets = (careSheets && careSheets.length > 0) ? careSheets : defaultCareSheets;

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '1050px', margin: '0 auto', color: '#E9DCBE' }}>
      <Head>
        <title>The Almanac & Plant Care Guides | The Botanical Bazaar</title>
        <meta name="description" content="Explore tropical plant care sheets, seasonal gardening advice, and botanical guides curated for St. Petersburg growers by The Botanical Bazaar." />
        <link rel="canonical" href="https://thebotanicalbazaar.com/almanac" />
        <meta property="og:title" content="The Almanac & Plant Care Guides | The Botanical Bazaar" />
        <meta property="og:description" content="Explore tropical plant care sheets, seasonal gardening advice, and botanical guides curated for St. Petersburg growers." />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/lantern.png" />
      </Head>

      <h1 style={{ color: '#D4B06A', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: '2.5rem', marginBottom: '1rem' }}>
        The Almanac
      </h1>
      <p style={{ textAlign: 'center', fontSize: '1.15rem', maxWidth: '750px', margin: '0 auto 2.5rem auto', lineHeight: '1.6', fontStyle: 'italic' }}>
        Welcome to our Almanac, a curated library of tropical plant care sheets and cultivation guides for curious growers in St. Petersburg, Florida.
      </p>

      <section style={{ marginBottom: '3.5rem' }}>
        <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', borderBottom: '1px solid #D4B06A', paddingBottom: '0.5rem', marginBottom: '1.8rem' }}>
          Botanical Care Sheets
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'stretch' }}>
          {sheets.map((sheet, i) => (
            <CareSheetCard key={sheet?._id || sheet?.commonName || i} sheet={sheet} />
          ))}
        </div>
      </section>

      <section style={{ background: '#00301E', padding: '2rem', borderRadius: '12px', border: '1px solid #D4B06A', textAlign: 'center' }}>
        <h3 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0 }}>Explore Climate & Care Resources</h3>
        <p style={{ maxWidth: '600px', margin: '0.5rem auto 1.5rem auto' }}>
          Discover USDA hardiness zone recommendations or schedule a 1-on-1 botanical consultation with our St. Pete nursery staff.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="gold-filled" href="/zones">Hardiness Zone Guide</Button>
          <Button variant="outline" href="/consultations">Book Consultation</Button>
        </div>
      </section>
    </div>
  );
}

export async function getStaticProps() {
  let careSheets = null;

  try {
    if (isSanityConfigured()) {
      const query = `*[_type == "plantCareSheet"]{
        botanicalName,
        commonName,
        lightNeeds,
        wateringNeeds,
        zoneCompatibility,
        careInstructions,
        "imageUrl": image.asset->url
      }`;
      const res = await sanityClient.fetch(query);
      if (Array.isArray(res) && res.length > 0) {
        careSheets = res;
      }
    }
  } catch (err) {
    console.warn('Sanity plantCareSheet fetch error, using fallback:', err.message);
  }

  return {
    props: {
      careSheets,
    },
    revalidate: 60,
  };
}
