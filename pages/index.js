import Head from 'next/head';
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useBfcacheReset from "../hooks/useBfcacheReset";
import ProductCard from "../components/ProductCard";
import { useWishlist } from "../context/WishlistContext";
import { getAllProducts } from "../lib/shopify";

export async function getStaticProps() {
  try {
    const products = await getAllProducts();
    return {
      props: {
        initialProducts: products || [],
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching homepage products in getStaticProps:", error);
    return {
      props: {
        initialProducts: [],
      },
      revalidate: 60,
    };
  }
}

export default function Index({ initialProducts = [] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [products, setProducts] = useState(initialProducts);

  useBfcacheReset(() => setSubmitting(false));

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/inquiry/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: email,
          inquiryType: "newsletter_subscription",
          subject: "Homepage Newsletter Subscription",
          message: `Newsletter subscription request from homepage for ${email}`
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribed(true);
        if (data.alreadySubscribed) {
          setSuccessMsg("Looks like you are already subscribed to The Almanac!");
        } else {
          setSuccessMsg("Thank you! You are subscribed. Check your inbox for your Almanac welcome email.");
        }
      } else {
        const isDuplicate = data?.alreadySubscribed || (typeof data?.error === "string" && (
          data.error.toLowerCase().includes("already exist") ||
          data.error.toLowerCase().includes("already in list") ||
          data.error.toLowerCase().includes("already subscribed") ||
          data.error.toLowerCase().includes("duplicate")
        ));

        if (isDuplicate) {
          setSubscribed(true);
          setSuccessMsg("Looks like you are already subscribed to The Almanac!");
        } else {
          setErrorMsg("Unable to subscribe right now. Please try again later.");
        }
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  // Slice the first 6 products for Featured Plants section
  const featuredProducts = (products || []).slice(0, 6);

  // Performance Optimization: Pre-compute in-stock item counts per category using useMemo
  // so that catalog array filtering is executed once per products inventory update rather
  // than repeatedly on every component re-render (e.g. user keystrokes in newsletter input).
  const categoryInStockCounts = useMemo(() => {
    const counts = {};
    const categoriesToCheck = [
      "houseplants",
      "orchids-tropicals",
      "fruit-trees",
      "herbs-medicinal",
      "exotics-rare",
      "seeds",
    ];

    categoriesToCheck.forEach((catId) => {
      counts[catId] = products.filter((product) => {
        const isSoldOut = product?.availableForSale === false || (product?.quantity !== undefined && product.quantity < 1);
        if (isSoldOut) return false;

        const catLower = catId.toLowerCase();
        const hasCategory = (c) =>
          Array.isArray(product.categories) &&
          product.categories.some((pc) => pc.toLowerCase() === c.toLowerCase());
        const hasTag = (t) =>
          Array.isArray(product.tags) &&
          product.tags.some((pt) => pt.toLowerCase() === t.toLowerCase());
        const textMatches = (keyword) => {
          const text =
            `${product.name} ${product.description || ""}`.toLowerCase();
          return text.includes(keyword);
        };

        if (catLower === "houseplants") {
          return (
            hasCategory("houseplants") ||
            hasTag("houseplant") ||
            textMatches("houseplant")
          );
        }
        if (
          catLower === "orchids-tropicals" ||
          catLower === "orchids & tropicals"
        ) {
          return (
            hasCategory("orchids-tropicals") ||
            hasCategory("plants") ||
            hasTag("tropical") ||
            hasTag("orchid") ||
            textMatches("orchid") ||
            textMatches("tropical")
          );
        }
        if (catLower === "fruit-trees" || catLower === "fruit trees") {
          return (
            hasCategory("fruit-trees") ||
            hasTag("fruit-tree") ||
            textMatches("fruit tree") ||
            textMatches("fruit")
          );
        }
        if (catLower === "herbs-medicinal" || catLower === "herbs & medicinal") {
          return (
            hasCategory("herbs-medicinal") ||
            hasTag("herb") ||
            hasTag("medicinal") ||
            textMatches("herb") ||
            textMatches("medicinal") ||
            textMatches("aromatic")
          );
        }
        if (catLower === "exotics-rare" || catLower === "exotics & rare") {
          return (
            hasCategory("exotics-rare") ||
            hasTag("rare") ||
            hasTag("exotic") ||
            textMatches("rare") ||
            textMatches("exotic") ||
            textMatches("unusual")
          );
        }
        if (catLower === "seeds") {
          return hasCategory("seeds") || hasTag("seed") || textMatches("seed");
        }

        return hasCategory(catId);
      }).length;
    });

    return counts;
  }, [products]);

  const showCategory = (catId) => {
    if (products.length === 0) return true; // keep visible during initial load
    return (categoryInStockCounts[catId] || 0) > 0;
  };

  return (
    <div className="home-container">
      <Head>
        <title>Rare Tropical Plants & Orchids | The Botanical Bazaar</title>
        <meta name="description" content="Discover rare tropical plants, collector aroids, specimen orchids, and medicinal flora at The Botanical Bazaar in St. Petersburg, FL. Standard shipping & local nursery pickup." />
        <link rel="canonical" key="canonical" href="https://thebotanicalbazaar.com/" />
        <meta property="og:title" content="The Botanical Bazaar | Rare Tropical Plants St. Petersburg FL" />
        <meta property="og:description" content="Discover rare tropical plants, collector aroids, specimen orchids, and medicinal flora at The Botanical Bazaar in St. Petersburg, FL." />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/brand-banner.png" />
        <meta property="og:url" content="https://thebotanicalbazaar.com/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="The Botanical Bazaar | Rare Tropical Plants St. Petersburg FL" />
        <meta name="twitter:description" content="Discover rare tropical plants, collector aroids, specimen orchids, and medicinal flora at The Botanical Bazaar in St. Petersburg, FL." />
        <meta name="twitter:image" content="https://thebotanicalbazaar.com/assets/brand-banner.png" />
      </Head>
      {/* Homepage specific styles injected cleanly */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Homepage-specific styles */
        .hero {
          padding: 2rem 1.5rem;
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
        }
        .hero-split {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 3rem;
          width: 100%;
        }
        .hero-image {
          flex: 1;
          max-width: 420px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          align-self: center;
          position: relative;
          background: radial-gradient(circle, rgba(0, 66, 38, 0.6) 0%, rgba(0, 48, 30, 0.2) 70%, transparent 100%);
        }
        .hero-video {
          width: 100%;
          height: auto;
          object-fit: cover;
          border-radius: 12px;
          box-shadow: 0 0 40px 20px rgba(1, 61, 36, 0.35);
          -webkit-mask-image: radial-gradient(circle, #000 50%, rgba(0, 0, 0, 0) 75%);
          mask-image: radial-gradient(circle, #000 50%, rgba(0, 0, 0, 0) 75%);
        }
        .hero-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          align-self: center;
          text-align: center;
        }
        .hero-text h1 {
          font-size: 2.8rem;
          line-height: 1.15;
          text-align: center;
          color: #D4B06A;
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-family: var(--font-heading, 'Cinzel', serif);
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
        @media (max-width: 767px) {
          .hero-split {
            flex-direction: column;
            text-align: center;
            gap: 2rem;
          }
          .hero-text {
            align-items: center;
            text-align: center;
          }
          .hero-text h1 {
            text-align: center;
            font-size: 2.2rem;
          }
        }
        .featured {
          padding: 2rem;
          text-align: center;
        }
        .featured h2 {
          color: #D4B06A;
          margin-bottom: 2rem;
          font-family: var(--font-heading, 'Cinzel', serif);
          font-size: 2rem;
        }
        .products {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.5rem;
          justify-content: center;
          align-items: stretch;
          max-width: 1100px;
          margin: 0 auto;
        }
        @media (max-width: 1023px) and (min-width: 640px) {
          .products {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 639px) {
          .products {
            grid-template-columns: 1fr;
          }
        }
        .shop-categories {
          padding: 2rem;
          text-align: center;
        }
        .shop-categories h2 {
          text-align: center;
          margin-bottom: 2rem;
          color: #D4B06A;
          font-family: var(--font-heading, 'Cinzel', serif);
          font-size: 2rem;
        }
        .categories-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 1.2rem;
          justify-content: center;
        }
        .category-card {
          background-color: #D4B06A;
          color: #00301E;
          padding: 1.2rem 1.6rem;
          border-radius: 12px;
          text-decoration: none;
          font-size: 1.1rem;
          font-weight: bold;
          box-shadow: 0 3px 14px rgba(20,40,30,0.10);
          transition: transform 0.12s, box-shadow 0.12s;
        }
        .category-card:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 5px 18px rgba(20,40,30,0.14);
        }
        .cta {
          background-color: #D4B06A;
          padding: 3rem 2rem;
          margin: 2rem calc(-50vw + 50%);
          width: 100vw;
          text-align: center;
          border-radius: 0;
          color: #1C3D2E;
          position: relative;
          overflow: hidden;
        }
        .cta::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          background-image: url('/assets/vine-pattern-light.png');
          background-repeat: repeat;
          background-size: 800px;
          opacity: 0.06;
          mix-blend-mode: soft-light;
          border-radius: inherit;
          z-index: 0;
        }
        .cta * {
          position: relative;
          z-index: 1;
        }
        .cta h2 {
          font-family: var(--font-heading, 'Cinzel', serif);
          margin-top: 0;
          font-size: 2rem;
        }
        .cta button {
          background-color: #1C3D2E;
          color: #F5E7C4;
          border: none;
          padding: 0.6rem 1.4rem;
          margin-top: 1rem;
          border-radius: 24px;
          cursor: pointer;
          font-family: 'Crimson Text', serif;
          font-size: 1.1rem;
          font-weight: bold;
        }
        @media (max-width: 1023px) {
          .hero {
            flex-direction: column;
            text-align: center;
          }
        }
      `,
        }}
      />

      {/* Hero section */}
      <section className="hero">
        <div className="hero-split">
          {/* Left Column: Animated Logo Video */}
          <div className="hero-image">
            <video
              src="/assets/logo-animation.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="hero-video"
              style={{
                width: "100%",
                height: "auto",
                boxShadow: "0 0 40px 20px rgba(1, 61, 36, 0.35)",
                borderRadius: "12px",
                objectFit: "cover",
                WebkitMaskImage: "radial-gradient(circle, #000 50%, transparent 75%)",
                maskImage: "radial-gradient(circle, #000 50%, transparent 75%)",
              }}
            />
          </div>

          {/* Right Column: Introductory Text & Call to Action Buttons */}
          <div className="hero-text">
            <h1>THE BOTANICAL BAZAAR</h1>
            <p
              style={{
                fontSize: "1.6rem",
                lineHeight: "1.3",
                margin: "0.5rem 0 1rem 0",
                fontFamily: "var(--font-heading, Cinzel, serif)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#E9DCBE",
              }}
            >
              ROOTED IN BEAUTY.
              <br />
              GROWN FOR YOU.
            </p>
            <p
              style={{
                fontSize: "1.1rem",
                margin: "0.5rem 0 1.5rem 0",
                maxWidth: "34ch",
                lineHeight: "1.4",
              }}
            >
              Rare and resilient tropical plants, curated in St.&nbsp;Petersburg,
              FL - lovingly grown for our community and beyond.
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Link
                href="/shop"
                style={{
                  background: "#D4B06A",
                  color: "#1C3D2E",
                  padding: "0.6rem 1.4rem",
                  borderRadius: "24px",
                  fontWeight: "bold",
                  textDecoration: "none",
                  minHeight: "44px",
                  minWidth: "44px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxSizing: "border-box",
                }}
              >
                Shop the Store
              </Link>
              <Link
                href="/consultations"
                style={{
                  background: "transparent",
                  color: "#D4B06A",
                  padding: "0.6rem 1.4rem",
                  borderRadius: "24px",
                  fontWeight: "bold",
                  border: "2px solid #D4B06A",
                  textDecoration: "none",
                  minHeight: "44px",
                  minWidth: "44px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxSizing: "border-box",
                }}
              >
                Book a Consultation
              </Link>
            </div>
          </div>
        </div>

        {/* Almanac Signup Section */}
        <div
          className="almanac-hero"
          style={{
            width: "100%",
            maxWidth: "600px",
            margin: "2.5rem auto 1rem auto",
            textAlign: "center",
          }}
        >
          <div
            className="almanac-signup-inner"
            style={{
              background: "#123826",
              color: "#F5E7C4",
              padding: "1.5rem",
              margin: "1rem auto",
              borderRadius: "12px",
              maxWidth: "600px",
              textAlign: "center",
              boxShadow: "0 3px 14px rgba(20,40,30,0.10)",
              border: "1px solid #D4B06A",
            }}
          >
            <h3
              style={{
                color: "#D4B06A",
                marginTop: "0",
                marginBottom: "0.5rem",
                fontFamily: "var(--font-heading, Cinzel, serif)",
              }}
            >
              Join Our Almanac
            </h3>
            <p
              style={{
                margin: "0.5rem auto 1rem auto",
                maxWidth: "500px",
                fontSize: "1.05rem",
                lineHeight: "1.4",
              }}
            >
              Subscribe to receive seasonal gardening tips, new plant arrivals
              and exclusive offers directly to your inbox.
            </p>
            {subscribed ? (
              <p role="status" aria-live="polite" style={{ color: "#D4B06A", fontWeight: "bold" }}>
                {successMsg || "Thank you! You are subscribed. Check your inbox for your Almanac welcome email."}
              </p>
            ) : (
              <form
                onSubmit={handleSubscribe}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "0.6rem",
                  maxWidth: "500px",
                  margin: "0 auto",
                }}
              >
                <label htmlFor="homepage-newsletter-email" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
                  Email Address for Almanac Subscription
                </label>
                <input
                  id="homepage-newsletter-email"
                  type="email"
                  placeholder="Your email address"
                  required
                  aria-required="true"
                  aria-invalid={!!errorMsg}
                  aria-describedby={errorMsg ? "homepage-newsletter-error" : undefined}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: "200px",
                    padding: "0.5rem 0.8rem",
                    borderRadius: "8px",
                    border: "1px solid #749c7f",
                    background: "#F5E7C4",
                    color: "#1C3D2E",
                    fontFamily: "inherit",
                    fontSize: "1rem",
                  }}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: "#D4B06A",
                    color: "#1C3D2E",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.5rem 1.2rem",
                    fontFamily: "inherit",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Submitting..." : "Subscribe"}
                </button>
              </form>
            )}
            {errorMsg && (
              <p id="homepage-newsletter-error" role="alert" style={{ color: "#ff8888", marginTop: "0.6rem", fontWeight: "bold" }}>
                {errorMsg}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Fulfillment Options Banner */}
      <div
        className="fulfillment-banner"
        style={{
          background: "#D4B06A",
          color: "#1C3D2E",
          padding: "0.8rem 1.2rem",
          margin: "1rem auto",
          borderRadius: "10px",
          maxWidth: "800px",
          fontSize: "1rem",
          textAlign: "center",
        }}
      >
        <strong>Standard Shipping &amp; Local Nursery Pickup:</strong> Now offering Standard Shipping from St. Petersburg, FL with secure live-plant packaging and weather holds, alongside Free Local Nursery Pickup $0.00. <Link href="/shipping-pickup" style={{ color: '#00301E', textDecoration: 'underline', fontWeight: 'bold', marginLeft: '0.5rem' }}>View Shipping Details &rarr;</Link>
      </div>

      {/* Browse by Category Grid */}
      <section className="shop-categories">
        <h2>Browse by Category</h2>
        <div className="categories-grid">
          <Link href="/shop" className="category-card">
            Shop&nbsp;All
          </Link>
          {showCategory("herbs-medicinal") && (
            <Link
              href="/collections/herbs-medicinal"
              className="category-card"
            >
              Herbs&nbsp;&amp;&nbsp;Medicinal
            </Link>
          )}
          {showCategory("fruit-trees") && (
            <Link href="/collections/fruit-trees" className="category-card">
              Fruit&nbsp;Trees
            </Link>
          )}
          {showCategory("houseplants") && (
            <Link href="/collections/tropical-houseplants" className="category-card">
              Houseplants
            </Link>
          )}
          {showCategory("orchids-tropicals") && (
            <Link
              href="/shop?category=tropical-houseplants"
              className="category-card"
            >
              Orchids&nbsp;&amp;&nbsp;Tropicals
            </Link>
          )}
          {showCategory("seeds") && (
            <Link href="/collections/seeds" className="category-card">
              Seeds
            </Link>
          )}
          {showCategory("exotics-rare") && (
            <Link href="/collections/exotics-rare" className="category-card">
              Exotics&nbsp;&amp;&nbsp;Rare
            </Link>
          )}
          <Link href="/zones" className="category-card">
            Best&nbsp;Plants&nbsp;for&nbsp;Your&nbsp;Zone
          </Link>
          <Link href="/orchids-gallery" className="category-card">
            Collector's&nbsp;Gallery
          </Link>
        </div>
      </section>

      {/* Featured Plants Grid */}
      <section className="featured" id="collection">
        <h2>Featured Plants</h2>
        <div className="products">
          {featuredProducts.map((product) => (
            <ProductCard key={product.slug || product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Book a Consultation Call to Action */}
      <section className="cta">
        <h2>Book Time with a Plant Guide</h2>
        <button onClick={() => router.push("/consultations")}>
          Book a Consultation
        </button>
      </section>
    </div>
  );
}
