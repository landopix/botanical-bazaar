import React from 'react';
import Link from 'next/link';

const NON_LIVING_COLLECTIONS = new Set([
  'seeds',
  'stickers-art',
  'tinctures-apothecary',
]);

export default function CollectionSeoBoilerplate({ collectionSlug, collectionTitle = 'Botanical' }) {
  const isNonLivingCollection = NON_LIVING_COLLECTIONS.has(collectionSlug);

  return (
    <section className="collection-seo-boilerplate" aria-labelledby="collection-seo-heading">
      <div className="seo-content-inner">
        <h3 id="collection-seo-heading" className="seo-heading">About Our {collectionTitle} Collection</h3>
        {isNonLivingCollection ? (
          <>
            <p className="seo-paragraph">
              Browse our {collectionTitle.toLowerCase()} collection at The Botanical Bazaar. We curate botanical goods
              and growing supplies that complement our St.&nbsp;Petersburg nursery&apos;s living collection. Each listing
              provides current product details, pricing, and fulfillment information so you can compare available
              options before ordering. Availability changes as small batches and seasonal releases move through the
              shop, so check individual listings for the latest selection.
            </p>
            <p className="seo-paragraph">
              Orders can be shipped within available service areas or collected through free local nursery pickup in
              St.&nbsp;Petersburg, FL. Review our <Link href="/shipping-pickup">shipping and pickup details</Link> before
              checkout, visit <Link href="/almanac">The Almanac</Link> for practical growing resources, or{' '}
              <Link href="/contact">contact our nursery team</Link> with product and availability questions. You can
              also browse <Link href="/collections">all Botanical Bazaar collections</Link> to discover more plants,
              supplies, and botanical goods.
            </p>
          </>
        ) : (
          <>
            <p className="seo-paragraph">
              Browse our {collectionTitle.toLowerCase()} collection at The Botanical Bazaar. Our St.&nbsp;Petersburg,
              Florida nursery grows, sources, and curates distinctive plants for collectors, home gardeners, and
              tropical landscapes. Every listing includes current availability and helpful growing information so you
              can compare specimens with confidence. Live plants are inspected before fulfillment and prepared with
              practical care for their journey from our nursery to your space.
            </p>
            <p className="seo-paragraph">
              Eligible live plants are protected by our <Link href="/returns">100% Live Arrival Guarantee</Link>.
              Choose nationwide standard shipping with secure live-plant packaging and weather holds when conditions
              require, or free local nursery pickup in St.&nbsp;Petersburg, FL. Review our{' '}
              <Link href="/shipping-pickup">shipping and pickup details</Link>, explore{' '}
              <Link href="/almanac">plant care guides</Link>, or <Link href="/contact">contact our nursery team</Link>{' '}
              for help selecting a specimen suited to your growing conditions.
            </p>
          </>
        )}
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
