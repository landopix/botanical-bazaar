import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Layout({ children }) {
  const router = useRouter();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = () => {
      setProducts(window.PRODUCTS || []);
    };
    if (typeof window !== 'undefined') {
      if (window.PRODUCTS) {
        loadProducts();
      } else {
        const script = document.createElement('script');
        script.src = '/products.js';
        script.onload = loadProducts;
        document.body.appendChild(script);
      }
    }
  }, []);

  const getLiveSearchResults = () => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.trim().toLowerCase();
    return products.filter(prod => {
      const nameMatch = prod.name && prod.name.toLowerCase().includes(query);
      const typeMatch = prod.type && prod.type.toLowerCase().includes(query);
      const descMatch = prod.description && prod.description.toLowerCase().includes(query);
      const catMatch = Array.isArray(prod.categories) && prod.categories.some(c => c.toLowerCase().includes(query));
      return nameMatch || typeMatch || descMatch || catMatch;
    });
  };

  // Keep track of group open/close states
  const [isGuidesOpen, setIsGuidesOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  const [showBackToTop, setShowBackToTop] = useState(false);
  const sidebarRef = useRef(null);
  const toggleBtnRef = useRef(null);

  // Manage Esc key press to close sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  // Manage click outside to close sidebar
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(e.target)
      ) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isSidebarOpen]);

  // Handle scroll trigger for Back to Top and body class toggle
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update body class for sidebar sliding
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isSidebarOpen) {
        document.body.classList.add('sidebar-open');
      } else {
        document.body.classList.remove('sidebar-open');
      }
    }
  }, [isSidebarOpen]);

  // Close sidebar on page change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [router.asPath]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sidebarItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Shop', href: '/shop' },
    { label: 'Consultations', href: '/consultations' },
    { label: 'The Almanac', href: '/almanac' },
    { label: 'Events', href: '/events' },
    { label: 'Contact', href: '/contact' },
    { label: 'Gallery', href: '/orchids-gallery' },
    {
      label: 'Plant Guides',
      isGroup: true,
      id: 'guides-submenu',
      items: [
        { label: 'This Month in the Garden', href: '/garden-month' },
        { label: 'Best Plants for Your Zone', href: '/zones' }
      ]
    },
    {
      label: 'FAQ',
      isGroup: true,
      id: 'policies-submenu',
      items: [
        { label: 'FAQ Overview', href: '/faq' },
        { label: 'Shipping & Pickup', href: '/shipping-pickup' },
        { label: 'Live Plant Guarantee', href: '/returns' },
        { label: 'Terms & Conditions', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' }
      ]
    }
  ];

  const query = searchQuery.trim().toLowerCase();

  // Filter items matching search query
  const filteredItems = sidebarItems.map(item => {
    if (item.isGroup) {
      const filteredChildren = item.items.filter(sub =>
        sub.label.toLowerCase().includes(query)
      );
      const groupMatches = item.label.toLowerCase().includes(query);
      if (groupMatches || filteredChildren.length > 0) {
        return {
          ...item,
          items: groupMatches ? item.items : filteredChildren,
          visible: true,
          forceOpen: query !== ''
        };
      }
      return { ...item, visible: false };
    } else {
      const matches = item.label.toLowerCase().includes(query);
      return { ...item, visible: matches };
    }
  });

  return (
    <div className="site-wrapper">
      {/* Sidebar backdrop overlay (Click outside to close) */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="sidebar-backdrop"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 999,
            cursor: 'pointer',
            transition: 'opacity 0.2s ease-in-out'
          }}
        />
      )}

      {/* Quick Actions Bubble Panel (Bottom Right) */}
      <div className="quick-actions">
        {/* Toggle / Search Bubble */}
        <button
          ref={toggleBtnRef}
          className="sidebar-toggle"
          aria-label="Toggle navigation"
          aria-controls="site-sidebar"
          aria-expanded={isSidebarOpen}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="20" y1="20" x2="15.65" y2="15.65"></line>
          </svg>
        </button>

        {/* Cart Action Link with Badge */}
        <Link href="/cart" className="cart-btn" aria-label="View cart" style={{ position: 'relative' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 11.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '0',
              right: '0',
              backgroundColor: '#ba2f2f',
              color: '#ffffff',
              borderRadius: '50%',
              fontSize: '0.7rem',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              border: '1px solid #00301e',
              transform: 'translate(25%, -25%)',
              zIndex: 10,
              boxSizing: 'border-box'
            }}>
              {cartCount}
            </span>
          )}
        </Link>

        {/* Wishlist Action Link with Badge */}
        <Link href="/wishlist" className="wishlist-btn" aria-label="View wishlist" style={{ position: 'relative' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          {wishlist.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '0',
              right: '0',
              backgroundColor: '#ba2f2f',
              color: '#ffffff',
              borderRadius: '50%',
              fontSize: '0.7rem',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              border: '1px solid #00301e',
              transform: 'translate(25%, -25%)',
              zIndex: 10,
              boxSizing: 'border-box'
            }}>
              {wishlist.length}
            </span>
          )}
        </Link>

        {/* Account Action Link */}
        <Link href="/account" className="account-btn" aria-label="My account">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M4 21v-2a4 4 0 0 1 3-3.87"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </Link>
      </div>

      {/* Stateful Navigation Sidebar */}
      <nav
        ref={sidebarRef}
        id="site-sidebar"
        className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
        role="navigation"
      >
        {/* Navigation Live Filter Search Input with clickable Lantern submark */}
        <div className="sidebar-search-container" style={{ position: 'relative' }}>
          <Link href="/" className="sidebar-search-submark-link" aria-label="Home">
            <img
              src="/assets/lantern-submark.png"
              alt="Lantern submark"
              className="sidebar-search-submark"
            />
          </Link>
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <input
              id="sidebar-search"
              type="text"
              placeholder="Search..."
              aria-label="Search navigation"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              style={{ width: '100%', paddingRight: '2rem' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  document.getElementById('sidebar-search')?.focus();
                }}
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#D4B06A',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  padding: '4px',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Live Search Results Dropdown */}
          {searchQuery.trim() && (
            <div className="live-search-dropdown" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              width: '100%',
              backgroundColor: '#00301e',
              border: '1px solid #D4B06A',
              borderRadius: '8px',
              marginTop: '6px',
              maxHeight: '260px',
              overflowY: 'auto',
              zIndex: 1001,
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
              boxSizing: 'border-box',
              padding: '0.5rem'
            }}>
              {getLiveSearchResults().length > 0 ? (
                getLiveSearchResults().map(prod => {
                  const isSoldOut = !prod.quantity || prod.quantity < 3;
                  const itemImg = prod.image ? (prod.image.startsWith('http') || prod.image.startsWith('/') ? prod.image : '/' + prod.image) : '/assets/placeholder.png';
                  return (
                    <Link
                      key={prod.slug}
                      href={`/product/${prod.slug}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        padding: '0.5rem',
                        textDecoration: 'none',
                        color: '#E9DCBE',
                        borderBottom: '1px solid rgba(212, 176, 106, 0.15)',
                        transition: 'background 0.2s',
                        borderRadius: '4px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1C3D2E'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <img
                        src={itemImg}
                        alt={prod.name}
                        className="live-search-dropdown-img"
                        style={{
                          width: '40px !important',
                          height: '40px !important',
                          maxWidth: '40px !important',
                          maxHeight: '40px !important',
                          objectFit: 'cover !important',
                          borderRadius: '4px',
                          border: '1px solid rgba(212, 176, 106, 0.3)',
                          display: 'block'
                        }}
                      />
                      <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                        <div style={{
                          fontSize: '0.95rem',
                          fontWeight: 'bold',
                          color: '#D4B06A',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontFamily: 'Cinzel, serif'
                        }}>
                          {prod.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#E9DCBE', opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prod.type || 'Plant'}{prod.categories && prod.categories.length > 0 ? ` | ${prod.categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}` : ''}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#F5E7C4', marginTop: '2px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#F5E7C4' }}>
                          {isSoldOut ? (
                            <span style={{ color: '#ba2f2f' }}>Sold Out</span>
                          ) : (
                            `$${prod.price ? prod.price.toFixed(2) : '0.00'}`
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div style={{ padding: '0.8rem', color: '#ba2f2f', textAlign: 'center', fontSize: '0.95rem' }}>
                  No plants found
                </div>
              )}
            </div>
          )}
        </div>

        <ul>
          {filteredItems.map((item, idx) => {
            if (item.visible === false) return null;

            if (item.isGroup) {
              const isOpen = item.forceOpen || (item.id === 'guides-submenu' ? isGuidesOpen : isFaqOpen);
              const toggleGroup = () => {
                if (item.id === 'guides-submenu') {
                  setIsGuidesOpen(!isGuidesOpen);
                } else {
                  setIsFaqOpen(!isFaqOpen);
                }
              };

              return (
                <li key={idx} className="group">
                  <button
                    className="group-toggle"
                    aria-expanded={isOpen}
                    aria-controls={item.id}
                    onClick={toggleGroup}
                  >
                    {item.label}
                  </button>
                  <ul id={item.id} className={`submenu ${isOpen ? 'open' : ''}`}>
                    {item.items.map((sub, sidx) => (
                      <li key={sidx}>
                        <Link
                          href={sub.href}
                          className={router.pathname === sub.href ? 'active' : ''}
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }

            return (
              <li key={idx}>
                <Link
                  href={item.href}
                  className={router.pathname === item.href ? 'active' : ''}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* High-Fidelity Desktop Site Header */}
      <header>
        <Link href="/" style={{ display: 'inline-block' }}>
          <img src="/assets/lantern.png" alt="Lantern sub mark" className="lantern-emblem" style={{ height: '60px' }} />
        </Link>
        <nav>
          <Link href="/shop">Shop</Link>
          <Link href="/consultations">Consultations</Link>
          <Link href="/almanac">The Almanac</Link>
          <Link href="/events">Events</Link>
          <Link href="/orchids-gallery">Gallery</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/about">About</Link>
        </nav>
      </header>

      {/* Main Page Content Wrapper */}
      <main className="site-main">
        {children}
      </main>

      {/* High-Fidelity Footer */}
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

      {/* Persistent Back-to-Top trigger */}
      <button
        id="back-to-top"
        title="Back to Top"
        aria-label="Back to top"
        onClick={scrollToTop}
        style={{
          display: showBackToTop ? 'block' : 'none',
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: '#D4B06A',
          color: '#1C3D2E',
          border: 'none',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          fontSize: '1.5rem',
          cursor: 'pointer',
          zIndex: 999,
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
        }}
      >
        ↑
      </button>
    </div>
  );
}
