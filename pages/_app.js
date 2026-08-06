import '../style.css';
import '../public/sidebar.css';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }) {
  return (
    <CartProvider>
      <WishlistProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </WishlistProvider>
    </CartProvider>
  );
}

export default MyApp;
