import SEO from "../components/SEO";
import Head from 'next/head';
import React, { useState } from 'react';
import Image from 'next/image';
import { sanityClient, isSanityConfigured } from '../lib/sanity';
import { getAlmanacArticles } from '../lib/shopify';
import { isOptimizedCdnUrl, optimizeCdnUrl } from '../lib/image-utils';
import Button from '../components/Button';
import CareSheetCard from '../components/CareSheetCard';
import useBfcacheReset from '../hooks/useBfcacheReset';

export default function Almanac({ careSheets, articles, shopifyArticles, events }) {
  const sheets = careSheets && careSheets.length > 0 ? careSheets : [];
  const articleList = shopifyArticles && shopifyArticles.length > 0 ? shopifyArticles : (articles && articles.length > 0 ? articles : []);
  const eventList = events && events.length > 0 ? events : [];

  // Almanac subscription form state
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState('success');

  useBfcacheReset(() => setSubmitting(false));

  const isLocalOrAllowedCdn = (url) => {
    if (!url || typeof url !== 'string') return false;
    if (url.startsWith('/')) return true;
    return isOptimizedCdnUrl(url);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatusType('error');
      setStatusMsg('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    setStatusMsg('');

    try {
      const res = await fetch('/api/inquiry/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: email,
          inquiryType: 'almanac_subscription',
          subject: 'Botanical Almanac Monthly Care Dispatch Signup',
          message: `Subscriber requested monthly Almanac care dispatches for ${email}`
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.alreadySubscribed) {
          setStatusType('info');
          setStatusMsg('Looks like you are already subscribed to The Almanac!');
        } else {
          setStatusType('success');
          setStatusMsg('Welcome! You are subscribed to our monthly Almanac botanical dispatches. Check your inbox for your welcome email.');
        }
        setEmail('');
      } else {
        const isDuplicate = data?.alreadySubscribed || (typeof data?.error === 'string' && (
          data.error.toLowerCase().includes('already exist') ||
          data.error.toLowerCase().includes('already in list') ||
          data.error.toLowerCase().includes('already subscribed') ||
          data.error.toLowerCase().includes('duplicate')
        ));

        if (isDuplicate) {
          setStatusType('info');
          setStatusMsg('Looks like you are already subscribed to The Almanac!');
          setEmail('');
        } else {
          setStatusType('error');
          setStatusMsg('Unable to subscribe right now. Please try again later.');
        }
      }
    } catch (err) {
      console.error('Almanac subscription error:', err);
      setStatusType('error');
      setStatusMsg('An unexpected error occurred. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '1050px', margin: '0 auto', color: '#E9DCBE', fontFamily: 'Crimson Text, serif' }}>
      <SEO title="The Almanac & Plant Care Guides" description="Explore tropical plant care sheets, seasonal gardening articles, events, and botanical guides curated for St. Petersburg growers by The Botanical Bazaar." />

      <h1 style={{ color: '#D4B06A', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: '2.5rem', marginBottom: '1rem' }}>
        The Almanac
      </h1>
      <p style={{ textAlign: 'center', fontSize: '1.15rem', maxWidth: '750px', margin: '0 auto 2.5rem auto', lineHeight: '1.6', fontStyle: 'italic' }}>
        Welcome to our Almanac, a comprehensive botanical hub for seasonal cultivation dispatches, care guides, and upcoming nursery events for growers in St. Petersburg, Florida.
      </p>

      {/* Almanac Email Dispatch Subscription Form */}
      <section id="subscribe" style={{ background: '#00301E', padding: '2.5rem 1.8rem', borderRadius: '12px', border: '1px solid #D4B06A', textAlign: 'center', marginBottom: '3.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', scrollMarginTop: '100px' }}>
        <h3 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0, fontSize: '1.8rem', letterSpacing: '0.05em' }}>
          Subscribe to Monthly Almanac Dispatches
        </h3>
        <p style={{ maxWidth: '620px', margin: '0.5rem auto 1.5rem auto', fontSize: '1.1rem', color: '#F5E7C4', lineHeight: '1.6' }}>
          Receive seasonal St. Petersburg planting advice, cold hardiness weather alerts, and rare specimen releases straight to your inbox.
        </p>

        <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', maxWidth: '460px', margin: '0 auto' }}>
          <label htmlFor="almanac-newsletter-email" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
            Email Address for Monthly Dispatches
          </label>
          <input
            id="almanac-newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            aria-required="true"
            aria-invalid={statusType === 'error' && !!statusMsg}
            aria-describedby={statusMsg ? "almanac-status-msg" : undefined}
            style={{
              padding: '0.8rem 1.2rem',
              borderRadius: '8px',
              border: '1px solid #D4B06A',
              width: '100%',
              fontFamily: 'Crimson Text, serif',
              fontSize: '1.05rem',
              background: '#123826',
              color: '#F5E7C4',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: '#D4B06A',
              color: '#00301E',
              border: '1px solid #D4B06A',
              padding: '0.8rem 2.2rem',
              borderRadius: '24px',
              fontFamily: 'Cinzel, serif',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              width: '100%',
              transition: 'all 0.2s ease'
            }}
          >
            {submitting ? 'Submitting...' : 'Join The Almanac Registry'}
          </button>
        </form>

        {statusMsg && (
          <div
            id="almanac-status-msg"
            role={statusType === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            style={{
              marginTop: '1.2rem',
              padding: '0.8rem 1rem',
              borderRadius: '6px',
              background: statusType === 'success' ? 'rgba(212, 176, 106, 0.15)' : 'rgba(224, 108, 117, 0.15)',
              border: statusType === 'success' ? '1px solid #D4B06A' : '1px solid #e06c75',
              color: statusType === 'success' ? '#D4B06A' : '#f08d8d',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {statusMsg}
          </div>
        )}
      </section>

      {/* Seasonal Articles & Dispatches Section */}
      <section id="articles" style={{ marginBottom: '3.5rem', scrollMarginTop: '100px' }}>
        <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', borderBottom: '1px solid #D4B06A', paddingBottom: '0.5rem', marginBottom: '1.8rem' }}>
          Seasonal Articles &amp; Dispatches
        </h2>
        {articleList.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {articleList.map((article, i) => {
              const title = article.title || article.name || article.seoTitle || 'Seasonal Gardening Note';
              const excerpt = article.excerpt || article.seoDescription || 'Read our latest insights on seasonal plant care and soil preparation.';
              const rawLink = (article.handle ? '/almanac/' + article.handle : null) || article.onlineStoreUrl || (article.slug ? '/page/' + article.slug : '#');
              const link = rawLink.replace(/^https?:\/\/[^\/]+\.(?:myshopify\.com|thebotanicalbazaar\.com)/, '').replace(/\/blogs\/[^\/]+\//, '/almanac/').replace(/\/products\//, '/product/');
              const imageUrl = article.imageUrl || '/assets/lantern.webp';
              const imageAlt = article.imageAlt || title;
              const publishedDate = article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : null;

              return (
                <div key={article.id || article._id || i} style={{ background: '#1C3D2E', border: '1px solid #D4B06A', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                  <div>
                    {imageUrl && (
                      <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.2rem', background: '#00301E' }}>
                        <Image
                          src={imageUrl}
                          alt={imageAlt}
                          width={1200}
                          height={800}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          style={{ objectFit: 'cover', position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                          unoptimized={!isLocalOrAllowedCdn(imageUrl)}
                          onError={(e) => { if (e.target) e.target.src = '/assets/lantern.webp'; }}
                        />
                      </div>
                    )}
                    {(publishedDate || article.author) && (
                      <div style={{ color: '#D4B06A', fontSize: '0.85rem', fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                        {publishedDate}{publishedDate && article.author ? ' • ' : ''}{article.author ? 'By ' + article.author : ''}
                      </div>
                    )}
                    <h3 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0, marginBottom: '0.8rem', fontSize: '1.35rem', lineHeight: '1.3' }}>
                      {title}
                    </h3>
                    <p style={{ color: '#F5E7C4', fontSize: '1rem', lineHeight: '1.6', margin: '0 0 1.2rem 0' }}>
                      {excerpt}
                    </p>
                  </div>
                  {link && (
                    <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                      <Button variant="gold-filled" href={link} target={article.onlineStoreUrl ? "_blank" : undefined} rel={article.onlineStoreUrl ? "noopener noreferrer" : undefined}>
                        Read Full Article
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ background: '#00301E', border: '1px solid rgba(212, 176, 106, 0.4)', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#F5E7C4', margin: 0, fontStyle: 'italic', fontSize: '1.05rem' }}>
              Fresh seasonal cultivation dispatches are currently being drafted for our upcoming issue. Check back soon for new articles!
            </p>
          </div>
        )}
      </section>

      {/* Botanical Care Sheets Section */}
      <section id="care-sheets" style={{ marginBottom: '3.5rem', scrollMarginTop: '100px' }}>
        <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', borderBottom: '1px solid #D4B06A', paddingBottom: '0.5rem', marginBottom: '1.8rem' }}>
          Botanical Care Sheets
        </h2>
        {sheets.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'stretch' }}>
            {sheets.map((sheet, i) => (
              <CareSheetCard key={sheet?._id || sheet?.commonName || i} sheet={sheet} />
            ))}
          </div>
        ) : (
          <div style={{
            background: '#00301E',
            border: '1px solid #D4B06A',
            borderRadius: '12px',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            margin: '1rem auto 2.5rem auto',
            maxWidth: '650px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}>

            <h3 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', fontSize: '1.8rem', marginTop: 0, marginBottom: '0.8rem', letterSpacing: '0.05em' }}>
              New Botanical Updates Coming Soon!
            </h3>
            <p style={{ color: '#E9DCBE', fontSize: '1.1rem', margin: '0 0 1.5rem 0', lineHeight: '1.6' }}>
              Our plant care library is currently updating with fresh cultivation sheets and tropical guides. Check back soon for detailed growing instructions.
            </p>
          </div>
        )}
      </section>

      {/* Nursery Calendar & Events Section */}
      <section id="events" style={{ marginBottom: '3.5rem', scrollMarginTop: '100px' }}>
        <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', borderBottom: '1px solid #D4B06A', paddingBottom: '0.5rem', marginBottom: '1.8rem' }}>
          Nursery Calendar &amp; Workshops
        </h2>
        {eventList.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {eventList.map((eventItem, i) => (
              <div key={eventItem._id || i} style={{ background: '#1C3D2E', border: '1px solid #D4B06A', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0, fontSize: '1.3rem' }}>
                    {eventItem.title}
                  </h3>
                  {eventItem.dateTime && (
                    <p style={{ color: '#E9DCBE', fontWeight: 'bold', margin: '0.2rem 0 0.5rem 0', fontSize: '0.95rem' }}>
                      {new Date(eventItem.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  {eventItem.location && (
                    <p style={{ color: '#D4B06A', fontStyle: 'italic', margin: '0 0 0.8rem 0', fontSize: '0.9rem' }}>
                      Location: {eventItem.location}
                    </p>
                  )}
                  <p style={{ color: '#F5E7C4', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {eventItem.description}
                  </p>
                </div>
                {eventItem.ticketUrl && (
                  <div style={{ marginTop: '1rem' }}>
                    <Button variant="gold-filled" href={eventItem.ticketUrl}>RSVP / Ticket Info</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: '#00301E', border: '1px solid rgba(212, 176, 106, 0.4)', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#F5E7C4', margin: '0 0 1rem 0', fontStyle: 'italic', fontSize: '1.05rem' }}>
              No upcoming public events currently scheduled. Check back soon for workshops and pop-up plant drops!
            </p>
            <Button variant="outline" href="/events">View Full Events Calendar</Button>
          </div>
        )}
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
  let articles = null;
  let events = null;
  let shopifyArticles = [];

  try {
    shopifyArticles = await getAlmanacArticles('the-almanac');
  } catch (err) {
    console.warn('Shopify Almanac articles fetch error:', err.message);
  }

  try {
    if (isSanityConfigured()) {
      const sheetsQuery = `*[_type == "plantCareSheet"]{
        _id,
        botanicalName,
        commonName,
        lightNeeds,
        wateringNeeds,
        zoneCompatibility,
        careInstructions,
        "imageUrl": image.asset->url + "?auto=format&fit=max&q=75"
      }`;

      const articlesQuery = `*[_type == "page" && status == "published"]{
        _id,
        name,
        "slug": slug.current,
        seoTitle,
        seoDescription
      }`;

      const eventsQuery = `*[_type == "eventItem"] | order(dateTime asc){
        _id,
        title,
        dateTime,
        description,
        location,
        ticketUrl,
        "imageUrl": image.asset->url + "?auto=format&fit=max&q=75"
      }`;

      const [resSheets, resArticles, resEvents] = await Promise.all([
        sanityClient.fetch(sheetsQuery).catch(() => []),
        sanityClient.fetch(articlesQuery).catch(() => []),
        sanityClient.fetch(eventsQuery).catch(() => [])
      ]);

      if (Array.isArray(resSheets) && resSheets.length > 0) careSheets = resSheets;
      if (Array.isArray(resArticles) && resArticles.length > 0) articles = resArticles;
      if (Array.isArray(resEvents) && resEvents.length > 0) events = resEvents;
    }
  } catch (err) {
    console.warn('Sanity Almanac content fetch error:', err.message);
  }

  return {
    props: {
      careSheets,
      articles,
      shopifyArticles,
      events
    },
    revalidate: 60,
  };
}
