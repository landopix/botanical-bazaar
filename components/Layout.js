import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guidesOpen, setGuidesOpen] = useState(false);
  const [policiesOpen, setPoliciesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter();
  const { cartCount } = useCart();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Floating Utility Dock */}
      <div className="quick-actions">
        <button
          className="sidebar-toggle"
          aria-label="Toggle navigation"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="20" y1="20" x2="15.65" y2="15.65"></line>
          </svg>
        </button>
        <Link href="/cart" className="cart-btn" aria-label="View cart" style={{ position: 'relative' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 11.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              background: '#ba2f2f',
              color: '#ffffff',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {cartCount}
            </span>
          )}
        </Link>
        <Link href="/wishlist" className="wishlist-btn" aria-label="View wishlist">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </Link>
        <Link href="/account" className="account-btn" aria-label="My account">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M4 21v-2a4 4 0 0 1 3-3.87"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </Link>
      </div>

      {/* Sidebar Navigation */}
      <nav id="site-sidebar" className={`sidebar ${sidebarOpen ? 'open' : ''}`} role="navigation">
        <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1rem' }}>
          <input
            type="search"
            id="sidebar-search"
            placeholder="Search plants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <ul>
          <li><Link href="/" onClick={() => setSidebarOpen(false)}>Home</Link></li>
          <li><Link href="/about" onClick={() => setSidebarOpen(false)}>About</Link></li>
          <li><Link href="/shop" onClick={() => setSidebarOpen(false)}>Shop</Link></li>
          <li><Link href="/consultations" onClick={() => setSidebarOpen(false)}>Consultations</Link></li>
          <li><Link href="/almanac" onClick={() => setSidebarOpen(false)}>The Almanac</Link></li>
          <li><Link href="/events" onClick={() => setSidebarOpen(false)}>Events</Link></li>
          <li><Link href="/contact" onClick={() => setSidebarOpen(false)}>Contact</Link></li>
          <li><Link href="/gallery" onClick={() => setSidebarOpen(false)}>Gallery</Link></li>

          <li className="group">
            <button
              className="group-toggle"
              aria-expanded={guidesOpen}
              onClick={() => setGuidesOpen(!guidesOpen)}
            >
              Plant Guides {guidesOpen ? '▲' : '▼'}
            </button>
            <ul className={`submenu ${guidesOpen ? 'open' : ''}`}>
              <li><Link href="/garden-month" onClick={() => setSidebarOpen(false)}>This Month in the Garden</Link></li>
              <li><Link href="/zones" onClick={() => setSidebarOpen(false)}>Best Plants for Your Zone</Link></li>
            </ul>
          </li>

          <li className="group">
            <button
              className="group-toggle"
              aria-expanded={policiesOpen}
              onClick={() => setPoliciesOpen(!policiesOpen)}
            >
              Policies {policiesOpen ? '▲' : '▼'}
            </button>
            <ul className={`submenu ${policiesOpen ? 'open' : ''}`}>
              <li><Link href="/shipping-pickup" onClick={() => setSidebarOpen(false)}>Shipping &amp; Pickup</Link></li>
              <li><Link href="/returns" onClick={() => setSidebarOpen(false)}>Live Plant Guarantee</Link></li>
              <li><Link href="/terms" onClick={() => setSidebarOpen(false)}>Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy" onClick={() => setSidebarOpen(false)}>Privacy Policy</Link></li>
              <li><Link href="/faq" onClick={() => setSidebarOpen(false)}>FAQ</Link></li>
            </ul>
          </li>
        </ul>
      </nav>

      {/* Global Header */}
      <header>
        <Link href="/" style={{ display: 'inline-block' }}>
          <img src="/assets/lantern.png" alt="Lantern sub mark" style={{ width: '90px', height: 'auto' }} />
        </Link>
        <nav>
          <Link href="/shop">Shop</Link>
          <Link href="/consultations">Consultations</Link>
          <Link href="/almanac">The Almanac</Link>
          <Link href="/events">Events</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/about">About</Link>
        </nav>
      </header>

      {/* Main Content Area */}
      <main style={{ minHeight: '80vh' }}>
        {children}
      </main>

      {/* Global Footer */}
      <footer>
        <p style={{ margin: '0.5rem 0' }}>
          <Link href="/shipping-pickup" style={{ color: '#E9DCBE', textDecoration: 'underline', marginRight: '0.6rem' }}>Shipping &amp; Pickup</Link>
          |
          <Link href="/returns" style={{ color: '#E9DCBE', textDecoration: 'underline', marginLeft: '0.6rem', marginRight: '0.6rem' }}>Live Plant Guarantee</Link>
          |
          <Link href="/terms" style={{ color: '#E9DCBE', textDecoration: 'underline', marginLeft: '0.6rem', marginRight: '0.6rem' }}>Terms &amp; Conditions</Link>
          |
          <Link href="/privacy" style={{ color: '#E9DCBE', textDecoration: 'underline', marginLeft: '0.6rem' }}>Privacy Policy</Link>
        </p>
        &copy; {new Date().getFullYear()} The Botanical Bazaar. All rights reserved.
      </footer>
    </>
  );
}
