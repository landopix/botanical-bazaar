import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function HelpHub() {
  return (
    <div className="help-hub-container">
      <Head>
        <title>Help &amp; Support Hub | The Botanical Bazaar St. Petersburg FL</title>
        <meta name="description" content="Centralized support hub for plant care guidance, order tracking, shipping policies, returns, and plant sourcing inquiries." />
      </Head>

      <div className="hub-header">
        <h1 className="hub-title">Help &amp; Support Hub</h1>
        <p className="hub-subtitle">
          How can our nursery team assist you today? Explore policies, submit inquiries, or access plant care guides.
        </p>
      </div>

      <div className="hub-grid">
        <div className="hub-card">
          <div className="card-icon">🚚</div>
          <h2 className="card-title">Shipping &amp; Local Pickup</h2>
          <p className="card-desc">
            Details on standard live-plant transit, insulated weather holds, and free local pickup at our St. Petersburg nursery.
          </p>
          <Link href="/shipping-pickup" className="card-link">
            Shipping &amp; Pickup Policy &rarr;
          </Link>
        </div>

        <div className="hub-card">
          <div className="card-icon">🛡️</div>
          <h2 className="card-title">Live-Arrival Guarantee</h2>
          <p className="card-desc">
            Learn about our 48-hour live-arrival guarantee, transit coverage, and photo submission requirements for claims.
          </p>
          <Link href="/returns" className="card-link">
            Guarantee &amp; Claims &rarr;
          </Link>
        </div>

        <div className="hub-card">
          <div className="card-icon">🌿</div>
          <h2 className="card-title">Plant Sourcing &amp; Inquiries</h2>
          <p className="card-desc">
            Looking for a specific rare aroid, orchid, or fruiting specimen? Submit a custom sourcing request to our growers.
          </p>
          <Link href="/sourcing" className="card-link">
            Request Specimen &rarr;
          </Link>
        </div>

        <div className="hub-card">
          <div className="card-icon">📖</div>
          <h2 className="card-title">Botanical Almanac &amp; Care</h2>
          <p className="card-desc">
            Access cultivation guides, USDA zone 9b/10a tips, watering schedules, and bench notes from our nurserymen.
          </p>
          <Link href="/almanac" className="card-link">
            Explore Almanac &rarr;
          </Link>
        </div>

        <div className="hub-card">
          <div className="card-icon">❓</div>
          <h2 className="card-title">Frequently Asked Questions</h2>
          <p className="card-desc">
            Quick answers regarding plant acclimation, potting substrates, order processing, and visiting our nursery.
          </p>
          <Link href="/faq" className="card-link">
            View All FAQs &rarr;
          </Link>
        </div>

        <div className="hub-card">
          <div className="card-icon">✉️</div>
          <h2 className="card-title">Direct Contact</h2>
          <p className="card-desc">
            Have a custom question or need order assistance? Send a direct message to our nursery team.
          </p>
          <Link href="/contact" className="card-link">
            Contact Nursery Team &rarr;
          </Link>
        </div>
      </div>

      <style jsx>{`
        .help-hub-container {
          max-width: 1050px;
          margin: 3rem auto;
          padding: 0 1.5rem;
          color: #F5E7C4;
          font-family: 'Crimson Text', serif;
        }
        .hub-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .hub-title {
          font-family: 'Cinzel', serif;
          color: #D4B06A;
          font-size: 2.5rem;
          margin: 0 0 1rem 0;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .hub-subtitle {
          font-size: 1.2rem;
          color: #E9DCBE;
          max-width: 680px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .hub-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .hub-card {
          background: #00301E;
          border: 1px solid #D4B06A;
          border-radius: 12px;
          padding: 1.8rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s ease;
        }
        .hub-card:hover {
          transform: translateY(-4px);
        }
        .card-icon {
          font-size: 2rem;
          margin-bottom: 0.8rem;
        }
        .card-title {
          font-family: 'Cinzel', serif;
          color: #D4B06A;
          font-size: 1.3rem;
          margin: 0 0 0.6rem 0;
        }
        .card-desc {
          font-size: 1.05rem;
          color: #E9DCBE;
          line-height: 1.5;
          margin-bottom: 1.2rem;
          flex: 1;
        }
        .hub-card :global(.card-link) {
          color: #D4B06A;
          font-weight: bold;
          text-decoration: underline;
          font-size: 1.05rem;
        }
      `}</style>
    </div>
  );
}
