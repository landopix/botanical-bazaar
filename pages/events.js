import Head from 'next/head';
import React, { useState } from 'react';
import { sanityClient, isSanityConfigured } from '../lib/sanity';
import Button from '../components/Button';
import SeasonalArchive from '../components/SeasonalArchive';

const defaultEvents = [
  {
    title: 'Spring Tropical Propagation & Air-Layering Workshop',
    dateTime: '2026-04-11T10:00:00Z',
    formattedDate: 'Saturday, April 11, 2026 at 10:00 AM',
    location: 'St. Petersburg Nursery & Demonstration Garden',
    description: 'Learn hands-on techniques for propagating rare tropicals, aroids, and fruit trees in Florida zone 9b/10a.',
    ticketUrl: 'https://thebotanicalbazaar.com/shop',
    publishFrom: '2026-01-01T00:00:00Z',
    expiresOn: '2026-04-12T00:00:00Z'
  },
  {
    title: 'Collector Orchid Mounts & Care Masterclass',
    dateTime: '2026-05-09T14:00:00Z',
    formattedDate: 'Saturday, May 9, 2026 at 2:00 PM',
    location: 'Gulfport Community Botanical Hub',
    description: 'Mount your own specimen orchid on cedar slab with live moss. All materials and light refreshments provided.',
    ticketUrl: 'https://thebotanicalbazaar.com/shop',
    publishFrom: '2026-01-01T00:00:00Z',
    expiresOn: '2026-05-10T00:00:00Z'
  }
];

export default function Events({ activeEvents = [], archivedEvents = [] }) {
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
      const res = await fetch('/api/inquiry/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: email,
          customerName: 'Event Subscriber',
          inquiryType: 'event_booking',
          subject: 'Event & Workshop Notification Signup',
          message: `Email signup for event updates from ${email}`
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
    <div style={{ padding: '3rem 1.5rem', maxWidth: '900px', margin: '0 auto', color: '#E9DCBE', fontFamily: 'Crimson Text, serif' }}>
      <Head>
        <title>Upcoming Events &amp; Workshops | The Botanical Bazaar St. Petersburg FL</title>
        <meta name="description" content="See upcoming plant sales, tropical workshops, markets and community events hosted by The Botanical Bazaar in St. Petersburg, Florida." />
        <link rel="canonical" href="https://thebotanicalbazaar.com/events" />
      </Head>

      <h1 style={{ color: '#D4B06A', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: '2.5rem', marginBottom: '0.8rem' }}>
        Upcoming Events &amp; Workshops
      </h1>
      <p style={{ textAlign: 'center', fontSize: '1.15rem', maxWidth: '700px', margin: '0 auto 2.5rem auto', lineHeight: '1.6', fontStyle: 'italic' }}>
        We host plant swaps, pop-ups, and hands-on cultivation workshops in St. Petersburg and Gulfport. Explore our upcoming calendar below!
      </p>

      {activeEvents.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3.5rem' }}>
          {activeEvents.map((evt, i) => (
            <div key={evt._id || i} style={{ background: '#1C3D2E', borderRadius: '12px', border: '1px solid #D4B06A', padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {evt.imageUrl && (
                <div style={{ width: '100%', height: '220px', borderRadius: '8px', overflow: 'hidden', background: '#001F14', marginBottom: '0.5rem' }}>
                  <img
                    src={evt.imageUrl}
                    alt={evt.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
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
                  <Button variant="gold-filled" href={evt.ticketUrl}>RSVP &amp; Tickets</Button>
                ) : (
                  <span style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#D4B06A' }}>Free Community Event — No Ticket Required</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <SeasonalArchive title="Past Events &amp; Workshop Archive">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {archivedEvents.map((evt, i) => (
              <div key={evt._id || i} style={{ background: 'rgba(28, 61, 46, 0.6)', borderRadius: '8px', border: '1px solid rgba(212, 176, 106, 0.3)', padding: '1.2rem' }}>
                {evt.imageUrl && (
                  <div style={{ width: '100%', height: '160px', borderRadius: '6px', overflow: 'hidden', background: '#001F14', marginBottom: '0.8rem' }}>
                    <img
                      src={evt.imageUrl}
                      alt={evt.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <h3 style={{ color: '#D4B06A', margin: '0 0 0.4rem 0', fontFamily: 'Cinzel, serif' }}>{evt.title}</h3>
                <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.9rem', color: '#E9DCBE' }}>Held: {evt.formattedDate || evt.dateTime}</p>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>{evt.description}</p>
              </div>
            ))}
          </div>
        </SeasonalArchive>
      )}

      <div style={{ background: '#00301E', padding: '2rem', borderRadius: '12px', border: '1px solid #D4B06A', textAlign: 'center' }}>
        <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0, fontSize: '1.5rem' }}>Stay in the Loop</h2>
        <p style={{ maxWidth: '500px', margin: '0.5rem auto 1.5rem auto' }}>
          Subscribe to receive immediate email updates when new pop-ups and workshops are scheduled.
        </p>

        <form onSubmit={handleNotifySubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', maxWidth: '420px', margin: '0 auto' }}>
          <label htmlFor="events-react-email" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
            Email Address
          </label>
          <input
            id="events-react-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            aria-describedby="events-react-status"
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
          <p id="events-react-status" role="status" aria-live="polite" style={{ marginTop: '1rem', color: statusMsg.startsWith('Success') ? '#D4B06A' : '#ff8888', fontWeight: 'bold' }}>
            {statusMsg}
          </p>
        )}
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const now = new Date();
  let rawEvents = defaultEvents;

  try {
    if (sanityClient) {
      const query = `*[_type == "eventItem"] | order(dateTime asc){
        _id,
        title,
        dateTime,
        location,
        description,
        ticketUrl,
        "imageUrl": image.asset->url,
        publishFrom,
        expiresOn
      }`;
      const res = await sanityClient.fetch(query);
      if (Array.isArray(res) && res.length > 0) {
        rawEvents = res;
      }
    }
  } catch (err) {
    console.warn('Sanity eventItem fetch error, using fallback:', err.message);
  }

  const activeEvents = [];
  const archivedEvents = [];

  rawEvents.forEach(evt => {
    const pubDate = evt.publishFrom ? new Date(evt.publishFrom) : null;
    const expDate = evt.expiresOn ? new Date(evt.expiresOn) : (evt.dateTime ? new Date(evt.dateTime) : null);

    const isPublished = !pubDate || pubDate <= now;
    const isExpired = expDate && expDate < now;

    const formatted = {
      ...evt,
      formattedDate: evt.dateTime ? new Date(evt.dateTime).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) : 'TBA'
    };

    if (isPublished && !isExpired) {
      activeEvents.push(formatted);
    } else {
      archivedEvents.push(formatted);
    }
  });

  return {
    props: {
      activeEvents,
      archivedEvents
    },
    revalidate: 60,
  };
}
