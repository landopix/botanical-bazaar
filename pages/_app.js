import Script from 'next/script';
import { Cinzel, Crimson_Text } from 'next/font/google';
import '../style.css';
import '../public/sidebar.css';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import Layout from '../components/Layout';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-display',
});

const crimsonText = Crimson_Text({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-body',
});

function MyApp({ Component, pageProps }) {
  return (
    <div className={`${cinzel.variable} ${crimsonText.variable}`}>
      <CartProvider>
        <WishlistProvider>
          {/* Global Google Analytics (G-S0XS3CDM9G) */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-S0XS3CDM9G"
            strategy="afterInteractive"
          />
          <Script
            id="google-analytics-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-S0XS3CDM9G', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </WishlistProvider>
      </CartProvider>
    </div>
  );
}

export default MyApp;
