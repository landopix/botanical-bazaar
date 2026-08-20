import Head from 'next/head';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import ProductCard from "../components/ProductCard";
import { useWishlist } from "../context/WishlistContext";
import { isSanityConfigured, sanityClient } from "../lib/sanity";

export default function Index() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [products, setProducts] = useState([]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (isSanityConfigured()) {
        try {
          const sanityData = await sanityClient.fetch(`*[_type == "product"]{
            "slug": slug.current,
            name,
            sku,
            "image": image.asset->url,
            type,
            description,
            price,
            quantity,
            zones,
            categories,
            sizes,
            tags
          }`);
          if (sanityData && sanityData.length > 0) {
            setProducts(sanityData);
            return;
          }
        } catch (err) {
          console.error(
            "Failed to fetch from Sanity.io. Falling back to local catalog.",
            err,
          );
        }
      }

      // Local offline fallback if window.PRODUCTS is set
      if (typeof window !== "undefined" && window.PRODUCTS) {
        setProducts(window.PRODUCTS);
      }
    };

    fetchProducts();
  }, []);

  // Slice the first 5 products for Featured Plants section
  const featuredProducts = products.slice(0, 5);

  // Helper to determine active in-stock count for categories dynamically
  const getActiveCount = (catId) => {
    return products.filter((product) => {
      const isSoldOut = !product.quantity || product.quantity < 3;
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
  };

  const showCategory = (catId) => {
    if (products.length === 0) return true; // keep visible during initial load
    return getActiveCount(catId) > 0;
  };

  return (
    <div className="home-container">
      <Head>
        <title>The Botanical Bazaar | Rare Tropical Plants & Orchids St. Petersburg FL</title>
        <meta name="description" content="Discover rare tropical plants, collector aroids, specimen orchids, and medicinal flora at The Botanical Bazaar in St. Petersburg, FL. Standard shipping & local nursery pickup." />
        <link rel="canonical" href="https://thebotanicalbazaar.com/" />
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
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 2rem;
          gap: 2rem;
          position: relative;
        }
        .hero-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .hero-text h1 {
          font-size: 3.2rem;
          line-height: 1.2;
          text-align: center;
          color: #D4B06A;
          margin-bottom: 0.5rem;
          font-family: var(--font-heading, 'Cinzel', serif);
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }
        .hero-image {
          width: 45%;
          max-width: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: radial-gradient(circle, rgba(0,66,38,0.5) 0%, rgba(0,66,38,0.1) 60%, transparent 90%);
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
        <div className="hero-text">
          <h1>THE BOTANICAL BAZAAR</h1>
          <p
            style={{
              fontSize: "1.8rem",
              lineHeight: "1.4",
              margin: "0.6rem 0 1.2rem 0",
              fontFamily: "var(--font-heading, Cinzel, serif)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
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
              maxWidth: "28ch",
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
              }}
            >
              Book a Consultation
            </Link>
          </div>
        </div>

        {/* Hero image with animated GIF using Next.js Image component with unoptimized=true */}
        <div className="hero-image">
          <Image
            src="/assets/logo-animation-optimized.gif"
            alt="The Botanical Bazaar Animated Logo"
            width={350}
            height={350}
            priority
            unoptimized={true}
            style={{
              width: "100%",
              height: "auto",
              boxShadow: "0 0 40px 20px rgba(1, 61, 36, 0.35)",
              borderRadius: "12px",
            }}
          />
        </div>

        {/* Almanac Signup Inside Hero */}
        <div
          className="almanac-hero"
          style={{
            width: "100%",
            maxWidth: "600px",
            marginTop: "1rem",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              color: "#D4B06A",
              marginBottom: "0.4rem",
              fontFamily: "var(--font-heading, Cinzel, serif)",
            }}
          >
            The Almanac
          </h2>
          <Link
            href="/garden-month"
            style={{
              display: "block",
              color: "#E9DCBE",
              textDecoration: "none",
              fontStyle: "italic",
              marginBottom: "0.3rem",
            }}
          >
            This Month in the Garden
          </Link>
          <Link
            href="/zones"
            style={{
              display: "block",
              color: "#E9DCBE",
              textDecoration: "none",
              marginBottom: "1rem",
            }}
          >
            Best Plants for Your Zone
          </Link>

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
              <p style={{ color: "#D4B06A", fontWeight: "bold" }}>
                Thank you! You are now subscribed to the Almanac.
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
                <input
                  type="email"
                  placeholder="Your email address"
                  required
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
                  style={{
                    background: "#D4B06A",
                    color: "#1C3D2E",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.5rem 1.2rem",
                    fontFamily: "inherit",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Subscribe
                </button>
              </form>
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
              href="/shop?category=herbs-medicinal"
              className="category-card"
            >
              Herbs&nbsp;&amp;&nbsp;Medicinal
            </Link>
          )}
          {showCategory("fruit-trees") && (
            <Link href="/shop?category=fruit-trees" className="category-card">
              Fruit&nbsp;Trees
            </Link>
          )}
          {showCategory("houseplants") && (
            <Link href="/shop?category=houseplants" className="category-card">
              Houseplants
            </Link>
          )}
          {showCategory("orchids-tropicals") && (
            <Link
              href="/shop?category=orchids-tropicals"
              className="category-card"
            >
              Orchids&nbsp;&amp;&nbsp;Tropicals
            </Link>
          )}
          {showCategory("seeds") && (
            <Link href="/shop?category=seeds" className="category-card">
              Seeds
            </Link>
          )}
          {showCategory("exotics-rare") && (
            <Link href="/shop?category=exotics-rare" className="category-card">
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
