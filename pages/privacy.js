import React from 'react';
import Head from 'next/head';
import { shopifyFetch } from '../lib/shopify';

export default function Privacy({ policy }) {
  return (
    <>
      <Head>
        <title>{policy?.title || 'Privacy Policy'} | The Botanical Bazaar LLC</title>
        <meta
          name="description"
          content="Official Privacy Policy of The Botanical Bazaar LLC in St. Petersburg, Florida. Learn how we collect, store, and safeguard your data."
        />
        <link rel="canonical" href="https://thebotanicalbazaar.com/privacy" />
      </Head>

      <div style={{ padding: '3.5rem 1.5rem', maxWidth: '900px', margin: '0 auto', boxSizing: 'border-box', color: '#E9DCBE', lineHeight: '1.7' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', borderBottom: '1px solid rgba(212, 176, 106, 0.3)', paddingBottom: '2rem' }}>
          <h1
            style={{
              color: '#D4B06A',
              fontFamily: 'Cinzel, serif',
              fontSize: '2.5rem',
              letterSpacing: '0.08em',
              marginBottom: '0.6rem',
              textTransform: 'uppercase'
            }}
          >
            {policy?.title || 'Privacy Policy'}
          </h1>
        </div>

        {policy && policy.body ? (
          <div
            className="shopify-policy-content"
            style={{
              background: '#1C3D2E',
              padding: '2.5rem',
              borderRadius: '12px',
              border: '1px solid #D4B06A',
              fontSize: '1.05rem',
              lineHeight: '1.8'
            }}
            dangerouslySetInnerHTML={{ __html: policy.body }}
          />
        ) : (
          <div
            style={{
              background: '#123826',
              padding: '2.5rem',
              borderRadius: '12px',
              border: '1px solid #D4B06A',
              textAlign: 'center'
            }}
          >
            <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0 }}>Privacy Policy Updates In Progress</h2>
            <p style={{ maxWidth: '650px', margin: '1rem auto 1.5rem auto', fontSize: '1.1rem' }}>
              Our official privacy policy is currently being synchronized with our Shopify Storefront backend. If you have immediate questions regarding data protection, access, or erasure requests, please contact our nursery team.
            </p>
            <p style={{ margin: 0, fontWeight: 'bold' }}>
              Official Contact Email:{' '}
              <a href="mailto:info@thebotanicalbazaar.com" style={{ color: '#D4B06A', textDecoration: 'underline' }}>
                info@thebotanicalbazaar.com
              </a>
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .shopify-policy-content h1,
        .shopify-policy-content h2,
        .shopify-policy-content h3,
        .shopify-policy-content h4 {
          color: #D4B06A !important;
          font-family: Cinzel, serif !important;
          margin-top: 1.8rem;
          margin-bottom: 0.8rem;
        }
        .shopify-policy-content p {
          margin-bottom: 1.2rem;
          color: #E9DCBE;
        }
        .shopify-policy-content a {
          color: #D4B06A;
          text-decoration: underline;
        }
        .shopify-policy-content ul,
        .shopify-policy-content ol {
          padding-left: 1.5rem;
          margin-bottom: 1.2rem;
        }
        .shopify-policy-content li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </>
  );
}

export async function getStaticProps() {
  let policy = null;

  try {
    const query = `
      query getPrivacyPolicy {
        shop {
          privacyPolicy {
            title
            body
          }
        }
      }
    `;

    const data = await shopifyFetch({ query });
    if (data?.shop?.privacyPolicy) {
      policy = data.shop.privacyPolicy;
    }
  } catch (error) {
    console.warn('Error fetching Shopify privacy policy, using fallback state:', error.message);
  }

  return {
    props: {
      policy,
    },
    revalidate: 60,
  };
}
