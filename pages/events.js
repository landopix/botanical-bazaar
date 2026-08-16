import Head from 'next/head';
import React, { useState } from 'react';
import { sanityClient, isSanityConfigured } from '../lib/sanity';
import Button from '../components/Button';

const defaultEvents = [
  {
    title: 'Spring Tropical Propagation & Air-Layering Workshop',
    dateTime: '2025-04-12T10:00:00Z',
    formattedDate: 'Saturday, April 12, 2025 at 10:00 AM',
    location: 'St. Petersburg Nursery & Demonstration Garden',
    description: 'Learn hands-on techniques for propagating rare tropicals, aroids, and fruit trees in Florida zone 9b/10a.',
    ticketUrl: 'https://thebotanicalbazaar.com/shop'
  },
  {
    title: 'Collector Orchid Mounts & Care Masterclass',
    dateTime: '2025-05-10T14:00:00Z',
    formattedDate: 'Saturday, May 10, 2025 at 2:00 PM',
    location: 'Gulfport Community Botanical Hub',
    description: 'Mount your own specimen orchid on cedar slab with live moss. All materials and light refreshments provided.',
    ticketUrl: 'https://thebotanicalbazaar.com/shop'
  }
];

export default function Events({ eventsList }) {
  const events = (eventsList && eventsList.length > 0) ? eventsList : defaultEvents;

  const [email, setEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatusMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setStatusMsg('');

    try {
      const res = await fetch('/api/almanac/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: email,
          subject: 'Event & Workshop Notification Signup',
          html: `<p>Thank you for subscribing to event notifications from The Botanical Bazaar!</p><p>We will notify <strong>${email}</strong> as soon as new workshop tickets and pop-ups are announced.</p>`
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg('Success! You are subscribed for event updates.');
        setEmail('');
      } else {
        setStatusMsg(data.error || 'Unable to subscribe right now. Please try again.');
      }
    } catch (err) {
      setStatusMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '900px', margin: '0 auto', color: '#E9DCBE' }}>
      <Head>
        <title>Upcoming Events & Workshops | The Botanical Bazaar St. Petersburg FL</title>
        <meta name="description" content="See upcoming plant sales, tropical workshops, markets and community events hosted by The Botanical Bazaar in St. Petersburg, Florida." />
        <link rel="canonical" href="https://thebotanicalbazaar.com/events" />
        <meta property="og:title" content="Upcoming Events & Workshops | The Botanical Bazaar" />
        <meta property="og:description" content="See upcoming plant sales, tropical workshops, markets and community events hosted by The Botanical Bazaar." />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/lantern.png" />
      </Head>

      <h1 style={{ color: '#D4B06A', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: '2.5rem', marginBottom: '0.8rem' }}>
        Upcoming Events & Workshops
      </h1>
      <p style={{ textAlign: 'center', fontSize: '1.15rem', maxWidth: '700px', margin: '0 auto 2.5rem auto', lineHeight: '1.6', fontStyle: 'italic' }}>
        We host plant swaps, pop-ups, and hands-on cultivation workshops in St. Petersburg and Gulfport. Explore our upcoming calendar below!
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3.5rem' }}>
        {events.map((evt, i) => (
          <div key={i} style={{ background: '#1C3D2E', borderRadius: '12px', border: '1px solid #D4B06A', padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ color: '#D4B06A', margin: 0, fontFamily: 'Cinzel, serif', fontSize: '1.4rem' }}>{evt.title}</h2>
              <span style={{ background: '#00301E', color: '#D4B06A', border: '1px solid #D4B06A', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                {evt.formattedDate || evt.dateTime}
              </span>
            </div>
            
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#F5E7C4', fontWeight: 'bold' }}>
              📍 {evt.location || 'St. Petersburg, FL'}
            </p>
            
            <p style={{ margin: 0, lineHeight: '1.6', fontSize: '1rem' }}>
              {evt.description}
            </p>

            <div style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
              {evt.ticketUrl ? (
                <Button variant="gold-filled" href={evt.ticketUrl}>RSVP & Tickets</Button>
              ) : (
                <span style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#D4B06A' }}>Free Community Event — No Ticket Required</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#00301E', padding: '2rem', borderRadius: '12px', border: '1px solid #D4B06A', textAlign: 'center' }}>
        <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0, fontSize: '1.5rem' }}>Stay in the Loop</h2>
        <p style={{ maxWidth: '500px', margin: '0.5rem auto 1.5rem auto' }}>
          Subscribe to receive immediate email updates when new pop-ups and workshops are scheduled.
        </p>

        <form onSubmit={handleNotifySubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', maxWidth: '420px', margin: '0 auto' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            style={{ padding: '0.7rem 1rem', borderRadius: '6px', border: '1px solid #D4B06A', width: '100%', fontFamily: 'Crimson Text, serif', fontSize: '1rem', background: '#F5E7C4', color: '#00301E' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ background: '#1C3D2E', color: '#F5E7C4', border: '1px solid #D4B06A', padding: '0.7rem 1.8rem', borderRadius: '24px', fontFamily: 'Cinzel, serif', fontWeight: 'bold', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Submitting...' : 'Notify Me'}
          </button>
        </form>

        {statusMsg && (
          <p style={{ marginTop: '1rem', color: statusMsg.startsWith('Success') ? '#D4B06A' : '#ff8888', fontWeight: 'bold' }}>
            {statusMsg}
          </p>
        )}
      </div>
    </div>
  );
}

export async function getStaticProps() {
  let eventsList = null;

  try {
    if (isSanityConfigured()) {
      const query = `*[_type == "eventItem"] | order(dateTime asc){
        title,
        dateTime,
        location,
        description,
        ticketUrl
      }`;
      const res = await sanityClient.fetch(query);
      if (Array.isArray(res) && res.length > 0) {
        eventsList = res.map(evt => ({
          ...evt,
          formattedDate: evt.dateTime ? new Date(evt.dateTime).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) : 'TBA'
        }));
      }
    }
  } catch (err) {
    console.warn('Sanity eventItem fetch error, using fallback:', err.message);
  }

  return {
    props: {
      eventsList,
    },
    revalidate: 60,
  };
}
