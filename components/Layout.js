import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Layout({ children }) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { cartCount } = useCart();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Global Header */}
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="logo-link">
            <img src="/assets/lantern.png" alt="Lantern sub mark" className="lantern-logo" />
          </Link>
          
          <nav className="main-nav">
            <Link href="/shop">Shop</Link>
            <Link href="/consultations">Consultations</Link>
            <Link href="/almanac">The Almanac</Link>
            <Link href="/events">Events</Link>
            <Link href="/gallery">Gallery</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/about">About</Link>
          </nav>

          <div className="header-actions">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <Link href="/cart" className="cart-link">
              Cart ({cartCount})
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ minHeight: '80vh' }}>
        {children}
      </main>

      {/* Global Footer */}
      <footer>
        <p style={{ margin: '0.5rem 0' }}>
          <Link href="/shipping-pickup">Shipping &amp; Pickup</Link>
          |
          <Link href="/returns">Live Plant Guarantee</Link>
          |
          <Link href="/terms">Terms &amp; Conditions</Link>
          |
          <Link href="/privacy">Privacy Policy</Link>
        </p>
        &copy; {new Date().getFullYear()} The Botanical Bazaar. All rights reserved.
      </footer>
    </>
  );
}
