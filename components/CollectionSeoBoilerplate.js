import React from 'react';
import Link from 'next/link';

export default function CollectionSeoBoilerplate({ collectionTitle = 'Botanical' }) {
  return (
    <section className="collection-seo-boilerplate" aria-label="About Our Collection">
      <div className="seo-content-inner">
        <h3 className="seo-heading">About Our {collectionTitle} Collection</h3>
        <p className="seo-paragraph">
          Browse our extensive collection of {collectionTitle.toLowerCase()} at The Botanical Bazaar.
          Propagated with expert care in sunny St.&nbsp;Petersburg, FL, our living collection features
          hand-selected botanical specimens cultivated for exceptional vigor, health, and beauty.
          Whether you are expanding an urban indoor jungle, establishing a rare collector sanctuary, or seeking
          unique tropical additions, each specimen is thoroughly inspected and carefully acclimatized prior to dispatch.
        </p>
        <p className="seo-paragraph">
          We back every order with our <strong>100% Live Arrival Guarantee</strong>, ensuring your plants reach your doorstep healthy and vibrant.
          Enjoy nationwide <strong>climate-controlled shipping</strong> tailored to destination weather conditions, or select convenient{' '}
          <strong>Local Nursery Pickup in St.&nbsp;Petersburg, FL</strong> during checkout. Explore our <Link href="/almanac">care guides</Link> or{' '}
          <Link href="/contact">contact our horticultural team</Link> for personalized microclimate advice.
        </p>
      </div>

      <style jsx>{`
        .collection-seo-boilerplate {
          margin: 3.5rem auto 1.5rem auto;
          max-width: 1100px;
          background-color: #00301e;
          border: 1px solid rgba(212, 176, 106, 0.4);
          border-radius: 12px;
          padding: 2.2rem 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
          box-sizing: border-box;
          color: #f5e7c4;
          font-family: 'Crimson Text', serif;
        }

        .seo-content-inner {
          max-width: 900px;
          margin: 0 auto;
        }

        .seo-heading {
          color: #d4b06a;
          font-family: 'Cinzel', serif;
          font-size: 1.35rem;
          margin: 0 0 1rem 0;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .seo-paragraph {
          font-size: 1.05rem;
          line-height: 1.65;
          color: #e9dcbe;
          margin: 0 0 1rem 0;
        }

        .seo-paragraph:last-child {
          margin-bottom: 0;
        }

        .seo-paragraph :global(a) {
          color: #d4b06a;
          text-decoration: underline;
        }

        .seo-paragraph :global(a:hover) {
          color: #ffffff;
        }

        @media (max-width: 639px) {
          .collection-seo-boilerplate {
            padding: 1.5rem 1.2rem;
            margin-top: 2.5rem;
          }
          .seo-heading {
            font-size: 1.15rem;
          }
        }
      `}</style>
    </section>
  );
}
