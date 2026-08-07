import React from 'react';
import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div className="site-wrapper">
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="logo-link">
            <img src="/assets/lantern.png" alt="TBB Lantern Emblem" className="logo-img" />
            <span className="brand-title">The Botanical Bazaar</span>
          </Link>
          <nav className="main-nav">
            <Link href="/shop" className="nav-link">Shop</Link>
            <Link href="/consultations" className="nav-link">Consultations</Link>
          </nav>
        </div>
      </header>
      
      <main className="site-main">
        {children}
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <p>&copy; {new Date().getFullYear()} The Botanical Bazaar (TBB). Rooted in Beauty. Grown for You.</p>
        </div>
      </footer>
    </div>
  );
}
