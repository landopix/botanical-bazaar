import Link from 'next/link';
import SEO from '../components/SEO';
import Button from '../components/Button';

const CUSTOMER_ACCOUNT_LOGIN_URL = 'https://account.thebotanicalbazaar.com/authentication/login';

export default function Account() {
  const openCustomerAccount = () => {
    window.location.assign(CUSTOMER_ACCOUNT_LOGIN_URL);
  };

  return (
    <main className="account-page">
      <SEO
        title="Customer Account Portal"
        description="Sign in securely to view Botanical Bazaar orders, delivery details, and customer account information."
        canonical="https://thebotanicalbazaar.com/account"
      >
        <meta name="robots" content="noindex, follow" />
      </SEO>

      <section className="account-card" aria-labelledby="account-heading">
        <p className="eyebrow">Secure Customer Portal</p>
        <h1 id="account-heading">Orders &amp; Account</h1>
        <p>
          Sign in to view your order history, delivery details, and customer profile. Shopify securely hosts our
          passwordless account portal and will send a one-time verification code to the email connected to your order.
        </p>

        <Button onClick={openCustomerAccount}>Continue to Secure Sign In</Button>

        <p className="support-copy">
          Need help locating an order? Visit our <Link href="/help">Help &amp; Support Hub</Link> or{' '}
          <Link href="/contact">contact the nursery team</Link>.
        </p>
      </section>

      <style jsx>{`
        .account-page {
          min-height: 60vh;
          display: grid;
          place-items: center;
          padding: 5rem 1.5rem;
          color: #e9dcbe;
          font-family: 'Crimson Text', serif;
        }
        .account-card {
          width: min(100%, 650px);
          padding: 2.5rem;
          border: 1px solid rgba(212, 176, 106, 0.65);
          border-radius: 14px;
          background: #00301e;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          text-align: center;
        }
        .eyebrow {
          margin: 0 0 0.65rem;
          color: #d4b06a;
          font-family: 'Cinzel', serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        h1 {
          margin: 0 0 1rem;
          color: #d4b06a;
          font-family: 'Cinzel', serif;
          font-size: clamp(2rem, 5vw, 2.75rem);
        }
        .account-card > p:not(.eyebrow) {
          margin: 0 auto 1.75rem;
          max-width: 52ch;
          font-size: 1.12rem;
          line-height: 1.65;
        }
        .support-copy {
          margin-top: 1.75rem !important;
          margin-bottom: 0 !important;
          font-size: 1rem !important;
        }
        .support-copy :global(a) {
          color: #d4b06a;
          text-decoration: underline;
        }
        @media (max-width: 639px) {
          .account-page {
            padding: 3rem 1rem;
          }
          .account-card {
            padding: 2rem 1.25rem;
          }
        }
      `}</style>
    </main>
  );
}
