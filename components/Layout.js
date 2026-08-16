import Head from 'next/head';
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const staticPages = [
  {
    title: "Shipping & Unpacking",
    href: "/shipping-pickup",
    category: "Information",
    description: "Shipping rates, live plant packaging, local pickup options, and transit details.",
    content: "shipping pickup transit local heat packs courier boxes winter delivery packing unpacked safe arrival"
  },
  {
    title: "FAQ Overview",
    href: "/faq",
    category: "Help & FAQ",
    description: "Frequently asked questions regarding plant care, ordering, payments, and collections.",
    content: "faq frequently asked questions care guides payment help orders issues support account"
  },
  {
    title: "Refunds & Replacements",
    href: "/returns",
    category: "Policies",
    description: "Our return policy, plant satisfaction guarantees, and claim procedures.",
    content: "refunds replacements returns return policy refund claim issues damaged plants satisfaction guarantee"
  },
  {
    title: "About The Botanical Bazaar",
    href: "/about",
    category: "Information",
    description: "Our story, rare tropical plant philosophy, and our local nursery background.",
    content: "about nursery botanical bazaar story team rare plants greenhouse collectors history tropical background"
  },
  {
    title: "Consultations",
    href: "/consultations",
    category: "Services",
    description: "Book an on-site or virtual landscape and plant design consultation.",
    content: "consultations consulting landscape design design garden layout indoor plants expert advice booking"
  },
  {
    title: "The Almanac",
    href: "/almanac",
    category: "Guides",
    description: "Historical botanical data, plant care tips, and rare species highlights.",
    content: "almanac garden guides history botanical facts care profiles taxonomy seasonal tips"
  },
  {
    title: "Events",
    href: "/events",
    category: "Information",
    description: "Upcoming plant sales, workshops, and botanical community meetups.",
    content: "events plant sale workshop classes meetups nursery schedule activities botanical show calendar"
  },
  {
    title: "Contact Us",
    href: "/contact",
    category: "Services",
    description: "Get in touch with our plant nursery, customer support, or custom orders.",
    content: "contact email phone location hours support message customer service custom inquiries"
  },
  {
    title: "Orchids Gallery",
    href: "/orchids-gallery",
    category: "Gallery",
    description: "High-resolution photos of our rare orchid varieties and custom arrangements.",
    content: "gallery orchids flowers visual photos greenhouse orchid display designs"
  },
  {
    title: "This Month in the Garden",
    href: "/garden-month",
    category: "Guides",
    description: "What to plant, fertilize, and prune this month for tropical microclimates.",
    content: "garden month seasonal planting gardening tips pruning fertilizer schedule tasks weather"
  },
  {
    title: "Best Plants for Your Zone",
    href: "/zones",
    category: "Guides",
    description: "Understand USDA cold hardiness zones and select matching tropical plants.",
    content: "zones usda cold hardiness zone map winter survival temperature protection guide"
  },
  {
    title: "Terms & Conditions",
    href: "/terms",
    category: "Policies",
    description: "Terms of service, website usage agreements, and purchase conditions.",
    content: "terms conditions service usage agreement legal disclaimer contract billing"
  },
  {
    title: "Privacy Policy",
    href: "/privacy",
    category: "Policies",
    description: "How we collect, protect, and handle your personal customer data.",
    content: "privacy policy data collection personal info cookies security tracking"
  }
];

export default function Layout({ children }) {
  const router = useRouter();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);

  // Hardiness Zone Detector state (defaults to Zone 10a)
  const [hardinessZone, setHardinessZone] = useState("10a");
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);

  // Keep track of group open/close states in sidebar
  const [isGuidesOpen, setIsGuidesOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);

  const [showBackToTop, setShowBackToTop] = useState(false);
  const sidebarRef = useRef(null);
  const toggleBtnRef = useRef(null);

  // Load products for the live navigation search
  useEffect(() => {
    const loadProducts = () => {
      setAllProducts(window.PRODUCTS || []);
    };
    if (typeof window !== "undefined") {
      const savedZone = localStorage.getItem("user_hardiness_zone");
      if (savedZone) {
        setHardinessZone(savedZone);
      }

      const handleZoneUpdated = () => {
        const updated = localStorage.getItem("user_hardiness_zone");
        if (updated) {
          setHardinessZone(updated);
        }
      };

      const handleOpenZoneModal = () => {
        setIsZoneModalOpen(true);
      };

      window.addEventListener("user_hardiness_zone_updated", handleZoneUpdated);
      window.addEventListener("open_zone_modal", handleOpenZoneModal);

      if (window.PRODUCTS) {
        loadProducts();
      }

      return () => {
        window.removeEventListener("user_hardiness_zone_updated", handleZoneUpdated);
        window.removeEventListener("open_zone_modal", handleOpenZoneModal);
      };
    }
  }, []);

  const handleSelectZone = (newZone) => {
    setHardinessZone(newZone);
    if (typeof window !== "undefined") {
      localStorage.setItem("user_hardiness_zone", newZone);
      window.dispatchEvent(new Event("user_hardiness_zone_updated"));
    }
    setIsZoneModalOpen(false);
  };

  // Manage Esc key press to close sidebar or USDA Zone modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isZoneModalOpen) {
          setIsZoneModalOpen(false);
        } else if (isSidebarOpen) {
          setIsSidebarOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen, isZoneModalOpen]);

  // Global event delegation for mobile toggle and outside clicks
  useEffect(() => {
    const handleDocumentClick = (e) => {
      const toggleBtn = e.target.closest(".header-mobile-toggle, .sidebar-toggle");
      if (toggleBtn) {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
        return;
      }

      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
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
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update body class for sidebar sliding
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (isSidebarOpen) {
        document.body.classList.add("sidebar-open");
      } else {
        document.body.classList.remove("sidebar-open");
      }
    }
  }, [isSidebarOpen]);

  // Close sidebar on page change
  useEffect(() => {
    setIsSidebarOpen(false);
    setSearchQuery("");
  }, [router.asPath]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sidebarItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Shop All", href: "/shop" },
    { label: "Consultations", href: "/consultations" },
    { label: "The Almanac", href: "/almanac" },
    { label: "Events", href: "/events" },
    { label: "Contact", href: "/contact" },
    { label: "Gallery", href: "/orchids-gallery" },
    {
      label: "Bazaar Collections",
      isGroup: true,
      id: "collections-submenu",
      isOpenState: isCollectionsOpen,
      setOpenState: setIsCollectionsOpen,
      items: [
        { label: "Houseplants", href: "/shop?category=houseplants" },
        {
          label: "Orchids & Tropicals",
          href: "/shop?category=orchids-tropicals",
        },
        { label: "Fruit Trees", href: "/shop?category=fruit-trees" },
        { label: "Herbs & Medicinal", href: "/shop?category=herbs-medicinal" },
        { label: "Seeds", href: "/shop?category=seeds" },
        { label: "Stickers & Art", href: "/shop?category=stickers-art" },
        {
          label: "Tinctures & Apothecary",
          href: "/shop?category=tinctures-apothecary",
        },
        {
          label: "Terrarium & Vivarium",
          href: "/shop?category=terrarium-vivarium",
        },
      ],
    },
    {
      label: "Plant Guides",
      isGroup: true,
      id: "guides-submenu",
      isOpenState: isGuidesOpen,
      setOpenState: setIsGuidesOpen,
      items: [
        { label: "This Month in the Garden", href: "/garden-month" },
        { label: "Best Plants for Your Zone", href: "/zones" },
      ],
    },
    {
      label: "FAQ",
      isGroup: true,
      id: "policies-submenu",
      isOpenState: isFaqOpen,
      setOpenState: setIsFaqOpen,
      items: [
        { label: "FAQ Overview", href: "/faq" },
        { label: "Shipping & Unpacking", href: "/shipping-pickup" },
        { label: "Refunds & Replacements", href: "/returns" },
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
      ],
    },
  ];

  const query = searchQuery.trim().toLowerCase();

  const matchingProducts =
    query !== ""
      ? allProducts
          .filter((p) => {
            let haystack = [p.name, p.type, p.description]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            if (Array.isArray(p.categories))
              haystack += " " + p.categories.join(" ").toLowerCase();
            if (Array.isArray(p.tags))
              haystack += " " + p.tags.join(" ").toLowerCase();
            return haystack.includes(query);
          })
          .slice(0, 10)
      : [];

  const matchingPages =
    query !== ""
      ? staticPages
          .filter((p) => {
            return (
              p.title.toLowerCase().includes(query) ||
              p.category.toLowerCase().includes(query) ||
              p.description.toLowerCase().includes(query) ||
              p.content.toLowerCase().includes(query)
            );
          })
      : [];

  return (
    <div className="site-wrapper">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Head>
        <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "c0O7LzW_8R4Z-X1"} />
        <meta name="msvalidate.01" content={process.env.NEXT_PUBLIC_BING_VERIFICATION || "43E15CEF6A1D8E6E25A3178CD99FE182"} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID || 'vxxgho3991'}");
            `
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "GardenStore",
              "@id": "https://thebotanicalbazaar.com/#nursery",
              "name": "The Botanical Bazaar",
              "alternateName": "The Botanical Bazaar LLC",
              "url": "https://thebotanicalbazaar.com",
              "logo": "https://thebotanicalbazaar.com/assets/lantern.png",
              "image": "https://thebotanicalbazaar.com/assets/brand-banner.png",
              "description": "Premier tropical plant nursery in St. Petersburg, Florida. Rare collector aroids, orchids, tropical fruit trees, medicinal herbs, and bespoke landscape consults.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "P.O. Box 35353",
                "addressLocality": "St. Petersburg",
                "addressRegion": "FL",
                "postalCode": "33705",
                "addressCountry": "US"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 27.7731,
                "longitude": -82.6400
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Thursday", "Friday", "Saturday", "Sunday"],
                  "opens": "10:00",
                  "closes": "17:00"
                }
              ],
              "priceRange": "$$",
              "telephone": "+1-727-555-0199",
              "sameAs": [
                "https://www.instagram.com/thebotanicalbazaar",
                "https://www.facebook.com/thebotanicalbazaar"
              ]
            })
          }}
        />
      </Head>
      {/* Sidebar backdrop overlay (Click outside to close) */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="sidebar-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(3px)",
            zIndex: 999,
            cursor: "pointer",
            transition: "opacity 0.2s ease-in-out",
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
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D4B06A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>

        {/* Cart Action Link with Badge */}
        <Link
          href="/cart"
          className="cart-btn"
          aria-label="View cart"
          style={{ position: "relative" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D4B06A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 11.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {cartCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "0",
                right: "0",
                backgroundColor: "#ba2f2f",
                color: "#ffffff",
                borderRadius: "50%",
                fontSize: "0.7rem",
                width: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                border: "1px solid #00301e",
                transform: "translate(25%, -25%)",
                zIndex: 10,
                boxSizing: "border-box",
              }}
            >
              {cartCount}
            </span>
          )}
        </Link>

        {/* Wishlist Action Link with Badge */}
        <Link
          href="/wishlist"
          className="wishlist-btn"
          aria-label="View wishlist"
          style={{ position: "relative" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D4B06A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          {wishlist.length > 0 && (
            <span
              style={{
                position: "absolute",
                top: "0",
                right: "0",
                backgroundColor: "#ba2f2f",
                color: "#ffffff",
                borderRadius: "50%",
                fontSize: "0.7rem",
                width: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                border: "1px solid #00301e",
                transform: "translate(25%, -25%)",
                zIndex: 10,
                boxSizing: "border-box",
              }}
            >
              {wishlist.length}
            </span>
          )}
        </Link>

        {/* Account Action Link */}
        <Link href="/account" className="account-btn" aria-label="My account">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D4B06A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
        className={`sidebar ${isSidebarOpen ? "open" : ""}`}
        role="navigation"
      >
        <div className="sidebar-search-container">
          <Link
            href="/"
            className="sidebar-search-submark-link"
            aria-label="Home"
          >
            <img
              src="/assets/lantern-submark.png"
              alt="Lantern submark"
              className="sidebar-search-submark"
            />
          </Link>
          <input
            id="sidebar-search"
            type="text"
            placeholder="Search"
            aria-label="Search navigation and products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {searchQuery.trim() !== "" ? (
          <div className="sidebar-search-results-drawer">
            {matchingPages.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <div className="search-results-title">
                  Page Matches ({matchingPages.length})
                </div>
                <div className="search-results-list">
                  {matchingPages.map((page) => (
                    <Link
                      href={page.href}
                      key={page.href}
                      className="search-result-item-card page-result-card"
                    >
                      <div className="result-info-wrapper" style={{ padding: "0.2rem" }}>
                        <strong className="result-name">{page.title}</strong>
                        <span className="result-type">{page.category}</span>
                        <p
                          className="no-matches-text"
                          style={{
                            fontSize: "0.8rem",
                            marginTop: "0.2rem",
                            color: "#8da38b",
                            fontStyle: "normal",
                          }}
                        >
                          {page.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="search-results-title">
              Product Matches ({matchingProducts.length})
            </div>
            {matchingProducts.length === 0 ? (
              matchingPages.length === 0 ? (
                <p className="no-matches-text">
                  No botanical goods match your search.
                </p>
              ) : (
                <p className="no-matches-text">
                  No matching products found.
                </p>
              )
            ) : (
              <div className="search-results-list">
                {matchingProducts.map((prod) => {
                  const isSold = !prod.quantity || prod.quantity < 3;
                  const resolvedImageSrc = prod.image
                    ? (prod.image.startsWith("http") || prod.image.startsWith("/")
                        ? prod.image
                        : "/" + prod.image)
                    : "/assets/placeholder.png";
                  return (
                    <Link
                      href={`/product/${prod.slug}`}
                      key={prod.slug}
                      className="search-result-item-card"
                    >
                      <div className="result-img-wrapper">
                        <img
                          src={resolvedImageSrc}
                          alt={prod.name}
                          className="result-img"
                        />
                      </div>
                      <div className="result-info-wrapper">
                        <strong className="result-name">{prod.name}</strong>
                        <span className="result-type">{prod.type}</span>
                        <div className="result-price-row">
                          {isSold ? (
                            <span className="result-sold-out">Sold Out</span>
                          ) : (
                            <span className="result-price">
                              {isNaN(prod.price) || !prod.price
                                ? "Price on Request"
                                : `${prod.price.toFixed(2)}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <ul>
            {sidebarItems.map((item, idx) => {
              if (item.isGroup) {
                const isOpen = item.isOpenState;
                const toggleGroup = () => {
                  item.setOpenState(!isOpen);
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
                    <ul
                      id={item.id}
                      className={`submenu ${isOpen ? "open" : ""}`}
                    >
                      {item.items.map((sub, sidx) => (
                        <li key={sidx}>
                          <Link
                            href={sub.href}
                            className={
                              router.pathname === sub.href ? "active" : ""
                            }
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
                    className={router.pathname === item.href ? "active" : ""}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {/* High-Fidelity Desktop Site Header */}
      <header>
        <Link href="/" style={{ display: "inline-block" }}>
          <img
            src="/assets/lantern.png"
            alt="Lantern sub mark"
            className="lantern-emblem"
            style={{ height: "60px" }}
          />
        </Link>
        <button
          className="header-mobile-toggle"
          aria-label="Toggle mobile menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D4B06A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <nav>
          <div className="nav-dropdown-wrapper">
            <Link href="/shop" className="nav-dropdown-trigger">
              SHOP ALL ▾
            </Link>
            <div className="nav-dropdown-menu">
              <Link href="/shop" className="dropdown-title">
                SHOP ALL
              </Link>
              <div className="dropdown-grid">
                <div className="dropdown-col">
                  <h4>LIVE PLANTS</h4>
                  <Link href="/shop?category=houseplants">Houseplants</Link>
                  <Link href="/shop?category=orchids-tropicals">
                    Orchids &amp; Tropicals
                  </Link>
                  <Link href="/shop?category=fruit-trees">Fruit Trees</Link>
                  <Link href="/shop?category=exotics-rare">
                    Exotics &amp; Rare
                  </Link>
                </div>
                <div className="dropdown-col">
                  <h4>Botanical Goods</h4>
                  <Link href="/shop?category=seeds">Seeds</Link>
                  <Link href="/shop?category=herbs-medicinal">
                    Herbs &amp; Medicinal
                  </Link>
                  <Link href="/shop?category=stickers-art">
                    Stickers &amp; Art
                  </Link>
                  <Link href="/shop?category=tinctures-apothecary">
                    Tinctures &amp; Apothecary
                  </Link>
                  <Link href="/shop?category=terrarium-vivarium">
                    Terrarium &amp; Vivarium
                  </Link>
                </div>
              </div>
            </div>
          </div>
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
      <main id="main-content" className="site-main">{children}</main>

      {/* High-Fidelity Footer */}
      <footer className="footer-container">
        <div className="footer-columns">
          <div className="footer-column">
            <h3>Contact Info</h3>
            <p className="contact-item">
              Address: P.O. Box 35353, St. Petersburg, FL 33705
            </p>
            <p className="contact-item">Email: info@thebotanicalbazaar.com</p>
            <p className="contact-item">Hours: Thurs - Sun: 10AM - 5PM</p>
          </div>
          <div className="footer-column">
            <h3>Ordering Info</h3>
            <Link href="/faq">FAQ Overview</Link>
            <Link href="/shipping-pickup">Shipping &amp; Unpacking</Link>
            <Link href="/returns">Refunds &amp; Replacements</Link>
            <Link href="/terms">Sales Tax &amp; Terms</Link>
          </div>
          <div className="footer-column">
            <h3>About Us</h3>
            <Link href="/about">Our Mercantile History</Link>
            <Link href="/contact">Store Visit &amp; Location</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
          <div className="footer-column">
            <h3>Find Plants &amp; Care</h3>
            <Link href="/shop">View All Goods</Link>
            <Link href="/zones">USDA Hardiness Zones</Link>
            <Link href="/garden-month">Monthly Plant Care Guides</Link>

            <div className="footer-zone-selector" style={{
              marginTop: "0.8rem",
              paddingTop: "0.8rem",
              borderTop: "1px solid rgba(212, 176, 106, 0.15)",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "0.2rem",
              fontFamily: "'Crimson Text', serif",
              fontSize: "0.95rem"
            }}>
              <span style={{ color: "#d4b06a", fontWeight: "bold", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>My Hardiness Zone</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <button
                  onClick={() => setIsZoneModalOpen(true)}
                  className="zone-pill-btn"
                  aria-label="Select USDA climate hardiness zone"
                >
                  Zone {hardinessZone} ▾
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} The Botanical Bazaar LLC. All rights
          reserved.
        </div>
      </footer>

      {/* Persistent Back-to-Top trigger */}
      <button
        id="back-to-top"
        title="Back to Top"
        aria-label="Back to top"
        onClick={scrollToTop}
        style={{
          display: showBackToTop ? "block" : "none",
          position: "fixed",
          bottom: "20px",
          left: "20px",
          background: "#D4B06A",
          color: "#1C3D2E",
          border: "none",
          borderRadius: "50%",
          width: "48px",
          height: "48px",
          fontSize: "1.5rem",
          cursor: "pointer",
          zIndex: 999,
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        ↑
      </button>

      <style jsx global>{`
        .sidebar::-webkit-scrollbar {
          width: 8px;
        }
        .sidebar::-webkit-scrollbar-track {
          background: #00301e;
        }
        .sidebar::-webkit-scrollbar-thumb {
          background-color: #d4b06a;
          border-radius: 4px;
        }

        .nav-dropdown-wrapper {
          position: relative;
          display: inline-block;
        }
        .nav-dropdown-trigger {
          cursor: pointer;
          font-family: var(--font-heading), "Cinzel", serif !important;
          color: #e9dcbe !important;
          margin: 0 1.2rem;
          text-decoration: none !important;
          letter-spacing: 0.05em;
          transition: color 0.2s ease;
        }
        .nav-dropdown-wrapper:hover .nav-dropdown-trigger {
          color: #d4b06a !important;
        }
        .nav-dropdown-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background-color: #00301e;
          border: 1px solid #d4b06a;
          border-radius: 8px;
          padding: 1.5rem;
          min-width: 380px;
          z-index: 1000;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
          margin-top: 0.5rem;
        }
        .nav-dropdown-menu::before {
          content: "";
          position: absolute;
          top: -20px;
          left: 0;
          right: 0;
          height: 20px;
          background: transparent;
        }
        .nav-dropdown-wrapper:hover .nav-dropdown-menu {
          display: block;
        }
        .dropdown-title {
          display: block !important;
          color: #d4b06a !important;
          font-family: "Cinzel", serif !important;
          text-align: center;
          font-weight: bold !important;
          border-bottom: 1px solid rgba(212, 176, 106, 0.2);
          padding-bottom: 0.6rem !important;
          margin-bottom: 0.8rem !important;
          text-transform: uppercase;
          font-size: 0.95rem !important;
          letter-spacing: 0.1em;
        }
        .dropdown-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.2rem;
        }
        .dropdown-col h4 {
          color: #d4b06a;
          font-family: "Cinzel", serif;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 0;
          margin-bottom: 0.5rem;
          border-bottom: 1px solid rgba(212, 176, 106, 0.1);
          padding-bottom: 0.2rem;
        }
        .dropdown-col a {
          display: block !important;
          color: #e9dcbe !important;
          padding: 0.25rem 0 !important;
          margin: 0 !important;
          font-size: 0.9rem !important;
          font-family: "Crimson Text", serif !important;
          font-weight: normal !important;
        }
        .dropdown-col a:hover {
          color: #d4b06a !important;
          text-decoration: underline !important;
        }

        .sidebar-search-results-drawer {
          width: 100%;
          box-sizing: border-box;
          padding: 0.5rem 0.2rem;
          overflow-x: hidden;
        }
        .search-results-title {
          font-family: "Cinzel", serif;
          font-size: 0.85rem;
          color: #d4b06a;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.8rem;
          border-bottom: 1px solid rgba(212, 176, 106, 0.2);
          padding-bottom: 0.3rem;
        }
        .no-matches-text {
          font-size: 0.95rem;
          color: #8da38b;
          font-style: italic;
        }
        .search-results-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          box-sizing: border-box;
          overflow-x: hidden;
        }
        .search-result-item-card {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 0.75rem !important;
          width: 100%;
          box-sizing: border-box;
          background-color: #123826;
          border: 1px solid rgba(212, 176, 106, 0.3);
          border-radius: 8px;
          padding: 0.6rem !important;
          text-decoration: none;
          color: #e9dcbe;
          transition: all 0.2s ease;
          overflow: hidden;
        }
        .search-result-item-card:hover {
          background-color: #1c3d2e;
          border-color: #d4b06a;
          transform: translateY(-2px);
        }
        .result-img-wrapper {
          width: 50px !important;
          height: 50px !important;
          flex-shrink: 0 !important;
          border-radius: 6px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.1);
          margin-bottom: 0 !important;
        }
        .result-img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        .result-info-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          width: 100%;
          box-sizing: border-box;
        }
        .result-name {
          font-family: "Cinzel", serif;
          font-size: 0.95rem;
          color: #d4b06a;
          line-height: 1.2;
          white-space: normal !important;
          word-break: normal;
          overflow-wrap: break-word;
        }
        .result-type {
          font-size: 0.8rem;
          color: #8da38b;
        }
        .result-price-row {
          font-weight: bold;
          font-size: 0.9rem;
          margin-top: 0.2rem;
        }
        .result-price {
          color: #f5e7c4;
        }
        .result-sold-out {
          color: #ba2f2f;
          font-weight: bold;
        }

        .footer-container {
          background-color: #001f14;
          border-top: 1px solid rgba(212, 176, 106, 0.3);
          padding: 3rem 2rem 1.5rem 2rem;
          color: #e9dcbe;
          width: 100%;
          box-sizing: border-box;
          font-family: "Crimson Text", serif;
        }
        .footer-columns {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2.5rem;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
          text-align: left !important;
        }
        .footer-column {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          text-align: left !important;
        }
        .footer-column h3 {
          color: #d4b06a;
          font-family: "Cinzel", serif;
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 0;
          margin-bottom: 0.8rem;
          border-bottom: 1px solid rgba(212, 176, 106, 0.25);
          padding-bottom: 0.4rem;
        }
        .footer-column p {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.4;
          color: #e9dcbe;
          text-align: left !important;
        }
        .footer-column a {
          color: #e9dcbe;
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.15s ease;
          width: fit-content;
        }
        .footer-column a:hover {
          color: #d4b06a;
          text-decoration: underline;
        }
        .footer-bottom {
          text-align: center;
          margin-top: 3rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(212, 176, 106, 0.15);
          font-size: 0.85rem;
          color: #8da38b;
          max-width: 1100px;
          margin-left: auto;
          margin-right: auto;
        }

        .header-mobile-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 900px) {
          header nav {
            display: none !important;
          }
          .header-mobile-toggle {
            display: flex !important;
          }
          .footer-columns {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
            text-align: center !important;
          }
          .footer-column {
            text-align: center !important;
            align-items: center !important;
          }
          .footer-column h3 {
            width: 100% !important;
            text-align: center !important;
          }
          .footer-column p {
            text-align: center !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .footer-column a {
            text-align: center !important;
            width: auto !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .footer-zone-selector {
            align-items: center !important;
            text-align: center !important;
          }
          .footer-zone-selector > div {
            justify-content: center !important;
          }
          .footer-bottom {
            text-align: center !important;
          }
        }
      `}</style>
      {isZoneModalOpen && (
        <div className="zone-modal-overlay" onClick={() => setIsZoneModalOpen(false)}>
          <div
            className="zone-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="zone-modal-title"
          >
            <div className="zone-modal-header">
              <h3 id="zone-modal-title" className="zone-modal-title">Select Your USDA Zone</h3>
              <button
                className="zone-modal-close"
                onClick={() => setIsZoneModalOpen(false)}
                aria-label="Close climate zone modal"
              >
                ✕
              </button>
            </div>
            <div className="zone-modal-grid">
              {Array.from({ length: 13 }, (_, i) => i + 1)
                .flatMap((z) => [`${z}a`, `${z}b`])
                .map((zone) => (
                  <button
                    key={zone}
                    className={`zone-modal-pill ${hardinessZone === zone ? 'active' : ''}`}
                    onClick={() => handleSelectZone(zone)}
                  >
                    Zone {zone}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
