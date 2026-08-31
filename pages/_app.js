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
            strategy="lazyOnload"
          />
          <Script
            id="google-analytics-init"
            strategy="lazyOnload"
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
          {/* Ahrefs Web Analytics */}
          <Script
            src="https://analytics.ahrefs.com/analytics.js"
            data-key="DjAqi8i2492m5GWfN+oQjw"
            strategy="lazyOnload"
          />
          {/* Leadfeeder Tracker */}
          <Script
            id="leadfeeder-tracker"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                (function(ss,ex){ window.ldfdr=window.ldfdr||function(){(ldfdr._q=ldfdr._q||[]).push([].slice.call(arguments));}; (function(d,s){ fs=d.getElementsByTagName(s)[0]; function ce(src){ var cs=d.createElement(s); cs.src=src; cs.async=1; fs.parentNode.insertBefore(cs,fs); }; ce("https://sc.lfeeder.com/lftracker_v1_"+ss+(ex?"_"+ex:"")+".js"); })(document,"script"); })("Xbp1oaE0oqg4EdVj");
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
