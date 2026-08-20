import Head from 'next/head';
import React, { useState } from 'react';
import { sanityClient } from '../lib/sanity';
import Button from '../components/Button';
import EventCard from '../components/EventCard';
import EventCardSkeleton from '../components/skeletons/EventCardSkeleton';
import SeasonalArchive from '../components/SeasonalArchive';

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

  const hasEvents = activeEvents.length > 0 || archivedEvents.length > 0;

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
            <EventCard key={evt._id || evt.title || i} event={evt} />
          ))}
        </div>
      ) : archivedEvents.length > 0 ? (
        <SeasonalArchive title="Past Events &amp; Workshop Archive">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {archivedEvents.map((evt, i) => (
              <EventCard key={evt._id || evt.title || i} event={evt} />
            ))}
          </div>
        </SeasonalArchive>
      ) : (
        <div style={{
          background: '#00301E',
          border: '1px solid #D4B06A',
          borderRadius: '12px',
          padding: '3.5rem 2rem',
          textAlign: 'center',
          margin: '2rem auto 3.5rem auto',
          maxWidth: '650px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#D4B06A' }}>📅</div>
          <h3 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', fontSize: '1.8rem', marginTop: 0, marginBottom: '0.8rem', letterSpacing: '0.05em' }}>
            New Botanical Updates Coming Soon!
          </h3>
          <p style={{ color: '#E9DCBE', fontSize: '1.1rem', margin: '0 0 1.5rem 0', lineHeight: '1.6' }}>
            We are preparing our upcoming workshop calendar and community plant sales. Subscribe below to receive early notifications!
          </p>
        </div>
      )}

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
  const now = new Date();
  let rawEvents = [];

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
    console.warn('Sanity eventItem fetch error:', err.message);
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
