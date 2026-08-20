import Head from 'next/head';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Button from "../components/Button";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/skeletons/ProductCardSkeleton";
import NurseryUpdateFallback from "../components/NurseryUpdateFallback";
import { useWishlist } from "../context/WishlistContext";
import { getAllProducts } from "../lib/shopify";

// Static list of requested category collections
const COLLECTIONS = [
  { id: "houseplants", name: "Houseplants" },
  { id: "orchids-tropicals", name: "Orchids & Tropicals" },
  { id: "fruit-trees", name: "Fruit Trees" },
  { id: "herbs-medicinal", name: "Herbs & Medicinal" },
  { id: "exotics-rare", name: "Exotics & Rare" },
  { id: "seeds", name: "Seeds" },
  { id: "stickers-art", name: "Stickers & Art" },
  { id: "tinctures-apothecary", name: "Tinctures & Apothecary" },
  { id: "terrarium-vivarium", name: "Terrarium & Vivarium" },
];

export async function getStaticProps() {
  try {
    const products = await getAllProducts();
    return {
      props: {
        initialProducts: products || [],
      },
      revalidate: 60, // ISR revalidate every 60 seconds
    };
  } catch (error) {
    console.error("Error fetching shop products in getStaticProps:", error);
    return {
      props: {
        initialProducts: [],
      },
      revalidate: 60,
    };
  }
}

export function getZoneCompatibility(product, userZone = "10a") {
  if (!product) return { badgeLabel: "Seasonal Culture", badgeColor: "#D4B06A", matchStatus: "SEASONAL" };

  const zones = Array.isArray(product.zones) ? product.zones.map(z => z.toLowerCase().trim()) : [];
  const userZoneClean = (userZone || "10a").toLowerCase().trim();
  const userNum = parseFloat(userZoneClean);

  let matchStatus = "SEASONAL";
  let badgeLabel = "Seasonal Culture";
  let badgeColor = "#D4B06A";

  if (zones.length > 0) {
    const isDirectMatch = zones.includes(userZoneClean) || zones.some(z => z.replace(/[a-b]/g, "") === userZoneClean.replace(/[a-b]/g, ""));

    if (isDirectMatch) {
      matchStatus = "GOOD_FIT";
      badgeLabel = "Good Fit Outdoors";
      badgeColor = "#249160";
    } else {
      const minZone = Math.min(...zones.map(z => parseFloat(z)).filter(n => !isNaN(n)));
      if (!isNaN(minZone) && userNum < minZone) {
        matchStatus = "NOT_RECOMMENDED";
        badgeLabel = "Not Recommended Outdoors";
        badgeColor = "#ba2f2f";
      }
    }
  }

  return { badgeLabel, badgeColor, matchStatus };
}

export default function Shop({ initialProducts = [] }) {
  const router = useRouter();
  const { toggleWishlist, wishlist } = useWishlist();

  // Products list provided via Next.js SSG/ISR
  const [products, setProducts] = useState(initialProducts);

  // Real-time filtered & sorted products list
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);

  // Active Filter & Sort States
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [userZone, setUserZone] = useState("10a");
  const [sortOrder, setSortOrder] = useState("");
  const [viewSoldOut, setViewSoldOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedLight, setSelectedLight] = useState("");
  const [selectedBloom, setSelectedBloom] = useState("");

  // Verification Gate for Catalog Launch (OPP-001, TBB-001)
  const hasOverallInventory = products.some((p) => p?.availableForSale !== false && (p?.quantity === undefined || p?.quantity >= 1));
  const hasShippingInventory = products.some((p) => {
    const isAvailable = p?.availableForSale !== false && (p?.quantity === undefined || p?.quantity >= 1);
    const isPickupOnly = Array.isArray(p?.tags) && p.tags.some((t) => t?.toLowerCase() === 'pickup-only' || t?.toLowerCase() === 'local-pickup-only');
    return isAvailable && !isPickupOnly;
  });
  const hasPickupInventory = products.some((p) => {
    const isAvailable = p?.availableForSale !== false && (p?.quantity === undefined || p?.quantity >= 1);
    const isNoPickup = Array.isArray(p?.tags) && p.tags.some((t) => t?.toLowerCase() === 'no-pickup' || t?.toLowerCase() === 'shipping-only');
    return isAvailable && !isNoPickup;
  });

  const launchGatePassed = hasOverallInventory && hasShippingInventory && hasPickupInventory;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("user_hardiness_zone");
      if (saved) setUserZone(saved);

      const handleZoneUpdated = () => {
        const updated = localStorage.getItem("user_hardiness_zone");
        if (updated) setUserZone(updated);
      };

      window.addEventListener("user_hardiness_zone_updated", handleZoneUpdated);
      return () => window.removeEventListener("user_hardiness_zone_updated", handleZoneUpdated);
    }
  }, []);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  // Initialize and synchronize states from URL query parameters
  useEffect(() => {
    if (!router.isReady) return;

    const { category, size, zone, sort, view_sold_out, search, tag, light, bloom } = router.query;

    if (category !== undefined) setSelectedCategory(category || "");
    if (size !== undefined) setSelectedSize(size || "");
    if (zone !== undefined) setSelectedZone(zone || "");
    if (sort !== undefined) setSortOrder(sort || "");
    if (view_sold_out !== undefined) {
      setViewSoldOut(view_sold_out === "true");
    } else {
      setViewSoldOut(false);
    }
    if (search !== undefined) setSearchQuery(search || "");
    if (tag !== undefined) setSelectedTag(tag || "");
    if (light !== undefined) setSelectedLight(light || "");
    if (bloom !== undefined) setSelectedBloom(bloom || "");
  }, [router.isReady, router.query]);

  // Helper to update both local state and router query parameters synchronously (two-way sync)
  const updateFilters = (updates) => {
    const params = new URLSearchParams(window.location.search);

    if (updates.category !== undefined) {
      setSelectedCategory(updates.category);
      if (updates.category) params.set("category", updates.category);
      else params.delete("category");
    }
    if (updates.size !== undefined) {
      setSelectedSize(updates.size);
      if (updates.size) params.set("size", updates.size);
      else params.delete("size");
    }
    if (updates.zone !== undefined) {
      setSelectedZone(updates.zone);
      if (updates.zone) params.set("zone", updates.zone);
      else params.delete("zone");
    }
    if (updates.sort !== undefined) {
      setSortOrder(updates.sort);
      if (updates.sort) params.set("sort", updates.sort);
      else params.delete("sort");
    }
    if (updates.view_sold_out !== undefined) {
      setViewSoldOut(updates.view_sold_out);
      if (updates.view_sold_out) params.set("view_sold_out", "true");
      else params.delete("view_sold_out");
    }
    if (updates.search !== undefined) {
      setSearchQuery(updates.search);
      if (updates.search) params.set("search", updates.search);
      else params.delete("search");
    }
    if (updates.tag !== undefined) {
      setSelectedTag(updates.tag);
      if (updates.tag) params.set("tag", updates.tag);
      else params.delete("tag");
    }
    if (updates.light !== undefined) {
      setSelectedLight(updates.light);
      if (updates.light) params.set("light", updates.light);
      else params.delete("light");
    }
    if (updates.bloom !== undefined) {
      setSelectedBloom(updates.bloom);
      if (updates.bloom) params.set("bloom", updates.bloom);
      else params.delete("bloom");
    }

    const newQuery = params.toString();
    router.replace(
      newQuery ? `?${newQuery}` : window.location.pathname,
      undefined,
      { shallow: true },
    );
  };

  // Perform real-time filtering and sorting
  useEffect(() => {
    let result = [...products];

    // 1. Collection Handle / Category Filter Logic
    if (selectedCategory) {
      const catLower = selectedCategory.toLowerCase();
      result = result.filter((product) => {
        const matchesCollectionHandle =
          Array.isArray(product?.collectionHandles) &&
          product.collectionHandles.some((h) => h?.toLowerCase() === catLower);
        const matchesCategory =
          Array.isArray(product?.categories) &&
          product.categories.some((pc) => pc?.toLowerCase() === catLower);
        const matchesTag =
          Array.isArray(product?.tags) &&
          product.tags.some((pt) => pt?.toLowerCase() === catLower);
        const textMatches = (keyword) =>
          `${product?.name || ""} ${product?.description || ""}`
            .toLowerCase()
            .includes(keyword);

        if (matchesCollectionHandle || matchesCategory || matchesTag) return true;

        if (catLower === "houseplants") {
          return matchesTag("houseplant") || textMatches("houseplant");
        }
        if (catLower === "orchids-tropicals" || catLower === "orchids & tropicals") {
          return (
            matchesCategory("plants") ||
            matchesTag("tropical") ||
            matchesTag("orchid") ||
            textMatches("orchid") ||
            textMatches("tropical")
          );
        }
        if (catLower === "fruit-trees" || catLower === "fruit trees") {
          return matchesTag("fruit-tree") || textMatches("fruit tree") || textMatches("fruit");
        }
        if (catLower === "herbs-medicinal" || catLower === "herbs & medicinal") {
          return matchesTag("herb") || matchesTag("medicinal") || textMatches("herb") || textMatches("medicinal");
        }
        if (catLower === "exotics-rare" || catLower === "exotics & rare") {
          return matchesTag("rare") || matchesTag("exotic") || textMatches("rare") || textMatches("exotic");
        }
        if (catLower === "seeds") {
          return matchesTag("seed") || textMatches("seed");
        }
        if (catLower === "stickers-art" || catLower === "stickers & art") {
          return matchesCategory("art") || matchesTag("sticker") || matchesTag("art") || textMatches("sticker") || textMatches("art");
        }
        if (catLower === "tinctures-apothecary" || catLower === "tinctures & apothecary") {
          return matchesCategory("apothecary") || matchesTag("tincture") || matchesTag("apothecary") || textMatches("tincture");
        }
        if (catLower === "terrarium-vivarium" || catLower === "terrarium & vivarium") {
          return matchesCategory("habitat") || matchesTag("leaf-litter") || matchesTag("substrate") || textMatches("vivarium") || textMatches("terrarium");
        }

        return false;
      });
    }

    // 2. Availability Filter
    if (!viewSoldOut) {
      result = result.filter((p) => {
        const isAvailable = p?.availableForSale !== false && (p?.quantity === undefined || p?.quantity >= 3);
        return isAvailable;
      });
    }

    // Tag Filter
    if (selectedTag) {
      const tLower = selectedTag.toLowerCase().replace(/-/g, ' ');
      result = result.filter((product) => {
        const hasTag = Array.isArray(product?.tags) && product.tags.some((pt) => pt?.toLowerCase().replace(/-/g, ' ').includes(tLower));
        const nameMatch = (product?.name || '').toLowerCase().includes(tLower);
        const descMatch = (product?.description || '').toLowerCase().includes(tLower);
        if (tLower === 'pet safe' || tLower === 'petsafe') {
          return product?.petSafe || hasTag || nameMatch || descMatch;
        }
        return hasTag || nameMatch || descMatch;
      });
    }

    // Light Requirements Filter
    if (selectedLight) {
      const lLower = selectedLight.toLowerCase().replace(/-/g, ' ');
      result = result.filter((product) => {
        const lightText = (product?.lightLevels || '').toLowerCase();
        const hasTag = Array.isArray(product?.tags) && product.tags.some((pt) => pt?.toLowerCase().replace(/-/g, ' ').includes(lLower));
        const descMatch = (product?.description || '').toLowerCase().includes(lLower);
        return lightText.includes(lLower) || hasTag || descMatch;
      });
    }

    // Bloom Season Filter
    if (selectedBloom) {
      const bLower = selectedBloom.toLowerCase().replace(/-/g, ' ');
      result = result.filter((product) => {
        const hasTag = Array.isArray(product?.tags) && product.tags.some((pt) => pt?.toLowerCase().replace(/-/g, ' ').includes(bLower));
        const descMatch = (product?.description || '').toLowerCase().includes(bLower);
        return hasTag || descMatch;
      });
    }

    // 3. Pot Size / Container Filter
    if (selectedSize) {
      const sizeLower = selectedSize.toLowerCase();
      result = result.filter((product) => {
        if (product?.custom?.pot_size) {
          if (product.custom.pot_size.toLowerCase().includes(sizeLower)) return true;
        }
        if (product?.sizes && typeof product.sizes === "string") {
          const parts = product.sizes.split("|").map((p) => p.trim().toLowerCase());
          return parts.some((p) => p.includes(sizeLower));
        }
        return false;
      });
    }

    // 4. Hardiness Zone Filter
    if (selectedZone) {
      const zoneTarget = selectedZone.toLowerCase();
      result = result.filter((product) => {
        if (product?.custom?.hardiness_zone) {
          if (product.custom.hardiness_zone.toLowerCase().includes(zoneTarget)) return true;
        }
        return Array.isArray(product?.zones) && product.zones.some((z) => z?.toLowerCase() === zoneTarget);
      });
    }

    // 5. Search Text Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => {
        let haystack = [p?.name, p?.type, p?.description, p?.sku, p?.custom?.pot_size, p?.custom?.hardiness_zone]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (Array.isArray(p?.categories)) haystack += " " + p.categories.join(" ").toLowerCase();
        if (Array.isArray(p?.zones)) haystack += " " + p.zones.join(" ").toLowerCase();
        if (Array.isArray(p?.tags)) haystack += " " + p.tags.join(" ").toLowerCase();
        return haystack.includes(q);
      });
    }

    // 6. Sorting
    if (sortOrder === "price-low-to-high") {
      result.sort((a, b) => {
        const priceA = a?.minVariantPrice !== undefined ? a.minVariantPrice : (a?.price || 0);
        const priceB = b?.minVariantPrice !== undefined ? b.minVariantPrice : (b?.price || 0);
        return priceA - priceB;
      });
    } else if (sortOrder === "price-high-to-low") {
      result.sort((a, b) => {
        const priceA = a?.minVariantPrice !== undefined ? a.minVariantPrice : (a?.price || 0);
        const priceB = b?.minVariantPrice !== undefined ? b.minVariantPrice : (b?.price || 0);
        return priceB - priceA;
      });
    } else if (sortOrder === "alphabetical") {
      result.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
    } else {
      result.sort((a, b) => {
        const dateA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    if (viewSoldOut) {
      result.sort((a, b) => {
        const aSold = a?.availableForSale === false || (!a?.quantity || a.quantity < 3);
        const bSold = b?.availableForSale === false || (!b?.quantity || b.quantity < 3);
        if (aSold && !bSold) return 1;
        if (!aSold && bSold) return -1;
        return 0;
      });
    }

    setFilteredProducts(result);
  }, [
    products,
    selectedCategory,
    selectedSize,
    selectedZone,
    sortOrder,
    viewSoldOut,
    searchQuery,
    selectedTag,
    selectedLight,
    selectedBloom,
  ]);

  // Dynamically extract unique available hardiness zones
  const availableZones = new Set();
  products.forEach((prod) => {
    if (prod?.custom?.hardiness_zone) {
      availableZones.add(prod.custom.hardiness_zone.trim());
    }
    if (Array.isArray(prod?.zones)) {
      prod.zones.forEach((zone) => {
        if (zone && zone !== "1" && zone !== "2") {
          availableZones.add(zone);
        }
      });
    }
  });
  const sortedZones = Array.from(availableZones).sort(
    (a, b) => parseFloat(a) - parseFloat(b) || a.localeCompare(b),
  );

  // Dynamically extract unique pot size options
  const availableSizes = new Set();
  products.forEach((prod) => {
    if (prod?.custom?.pot_size) {
      availableSizes.add(prod.custom.pot_size.trim());
    }
    if (prod?.sizes && typeof prod.sizes === "string") {
      const parts = prod.sizes.split("|");
      parts.forEach((part) => {
        const clean = part.trim();
        if (clean) {
          availableSizes.add(clean);
        }
      });
    }
  });
  const sortedSizes = Array.from(availableSizes).sort();

  const getActiveInStockCountForCategory = (categoryId) => {
    return products.filter((product) => {
      const isSoldOut = !product?.quantity || product.quantity < 3;
      if (isSoldOut) return false;

      const catLower = categoryId.toLowerCase();
      const hasCategory = (c) =>
        Array.isArray(product?.categories) &&
        product.categories.some((pc) => pc?.toLowerCase() === c.toLowerCase());
      const hasTag = (t) =>
        Array.isArray(product?.tags) &&
        product.tags.some((pt) => pt?.toLowerCase() === t.toLowerCase());
      const textMatches = (keyword) => {
        const text = `${product?.name || ""} ${product?.description || ""}`.toLowerCase();
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
      if (catLower === "stickers-art" || catLower === "stickers & art") {
        return (
          hasCategory("stickers-art") ||
          hasCategory("art") ||
          hasTag("sticker") ||
          hasTag("art") ||
          textMatches("sticker") ||
          textMatches("art")
        );
      }
      if (
        catLower === "tinctures-apothecary" ||
        catLower === "tinctures & apothecary"
      ) {
        return (
          hasCategory("tinctures-apothecary") ||
          hasCategory("apothecary") ||
          hasTag("tincture") ||
          hasTag("apothecary") ||
          textMatches("tincture") ||
          textMatches("apothecary") ||
          textMatches("drops")
        );
      }
      if (
        catLower === "terrarium-vivarium" ||
        catLower === "terrarium & vivarium"
      ) {
        return (
          hasCategory("terrarium-vivarium") ||
          hasCategory("habitat") ||
          hasTag("leaf-litter") ||
          hasTag("substrate") ||
          textMatches("leaf litter") ||
          textMatches("habitat") ||
          textMatches("vivarium") ||
          textMatches("shrimp") ||
          textMatches("tank")
        );
      }

      return hasCategory(categoryId);
    }).length;
  };

  const visibleCollections = COLLECTIONS.filter((collection) => {
    if (products.length === 0) return true;
    return getActiveInStockCountForCategory(collection.id) > 0;
  });

  return (
    <div className="shop-container">
      <Head>
        <title>Shop Rare Tropical Plants & Orchids | The Botanical Bazaar St. Petersburg FL</title>
        <meta name="description" content="Browse our catalog of rare tropical plants, collector aroids, philodendrons, monstera, and orchids. Standard shipping and local nursery pickup in St. Petersburg, FL." />
        <link rel="canonical" href="https://thebotanicalbazaar.com/shop" />
        <meta property="og:title" content="Shop Rare Tropical Plants & Orchids | The Botanical Bazaar St. Petersburg FL" />
        <meta property="og:description" content="Browse our catalog of rare tropical plants, collector aroids, philodendrons, monstera, and orchids. Standard shipping and local nursery pickup in St. Petersburg, FL." />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/brand-banner.png" />
        <meta property="og:url" content="https://thebotanicalbazaar.com/shop" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Shop Rare Tropical Plants & Orchids | The Botanical Bazaar" />
        <meta name="twitter:description" content="Browse our catalog of rare tropical plants, collector aroids, philodendrons, monstera, and orchids." />
        <meta name="twitter:image" content="https://thebotanicalbazaar.com/assets/brand-banner.png" />
      </Head>

      <h1 className="shop-title">Shop All Plants</h1>

      <div className="fulfillment-banner" style={{ background: '#D4B06A', color: '#1C3D2E', padding: '0.8rem 1.2rem', borderRadius: '10px', marginBottom: '1.2rem', textAlign: 'center', fontSize: '1rem' }}>
        <strong>Standard Shipping &amp; Local Nursery Pickup:</strong> Now offering Standard Shipping from St. Petersburg, FL with secure live-plant packaging and weather holds, alongside Free Local Nursery Pickup $0.00. <Link href="/shipping-pickup" style={{ color: '#00301E', textDecoration: 'underline', fontWeight: 'bold', marginLeft: '0.5rem' }}>View Shipping Details &rarr;</Link>
      </div>

      {!launchGatePassed ? (
        <NurseryUpdateFallback
          reason={
            !hasOverallInventory
              ? "All specimens in this drop have been claimed. Our nursery benches in St. Petersburg are preparing the next cohort."
              : !hasShippingInventory
              ? "Standard shipping is temporarily paused while we update weather-hold packaging for live plant transit."
              : "Local nursery pickup is currently being updated with new collection slots."
          }
        />
      ) : (
        <>
          <div className="filter-panel">
            <p className="shop-intro">
              Browse our curated selection of rare and resilient tropical plants
              grown in St.&nbsp;Petersburg. Use the filters to explore categories
              like Medicinal, Culinary, Fragrant, Flowering Trees, Seeds, Rare &amp;
              Unusual, Best Plants for Your Zone and more. All listings reflect live
              inventory; quantities are limited and updated daily.
            </p>

            <p className="shop-subtext">
              Browse our curated selection of plants grown and sourced for our
              St.&nbsp;Petersburg and Tampa Bay community. We stock tropical
              houseplants, fruit trees and edibles, orchids, and hardy landscape
              plants. Inventory changes regularly, so check back often or drop us a
              note if you're looking for something special.
            </p>

            <div className="category-section">
              <label className="filter-group-label">Collections:</label>
              <div className="category-pills">
                <button
                  onClick={() => updateFilters({ category: "" })}
                  className={selectedCategory === "" ? "active" : ""}
                >
                  Shop All
                </button>
                {visibleCollections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => updateFilters({ category: collection.id })}
                    className={selectedCategory === collection.id ? "active" : ""}
                  >
                    {collection.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="filters-grid">
              <div className="filter-control">
                <label htmlFor="search-input">Search Plants</label>
                <div className="search-input-wrapper">
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Search by name, type..."
                    value={searchQuery}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        updateFilters({ search: "" });
                      }
                    }}
                    aria-label="Search plants"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => updateFilters({ search: "" })}
                      className="search-clear-btn"
                      aria-label="Clear search query"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="filter-control">
                <label htmlFor="size-select">Pot Size / Container</label>
                <select
                  id="size-select"
                  value={selectedSize}
                  onChange={(e) => updateFilters({ size: e.target.value })}
                >
                  <option value="">All Sizes</option>
                  {sortedSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-control">
                <label>My Climate Zone</label>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedZone === userZone) {
                      updateFilters({ zone: "" });
                    } else {
                      updateFilters({ zone: userZone });
                    }
                  }}
                  className={`my-zone-btn ${selectedZone === userZone ? "active" : ""}`}
                  style={{
                    padding: "0.5rem 0.8rem",
                    borderRadius: "6px",
                    border: "1px solid #D4B06A",
                    backgroundColor: selectedZone === userZone ? "#D4B06A" : "#1C3D2E",
                    color: selectedZone === userZone ? "#00301E" : "#F5E7C4",
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  aria-label={`Filter catalog for my hardiness zone ${userZone}`}
                >
                  {selectedZone === userZone ? `✓ My Zone (${userZone})` : `Filter My Zone (${userZone})`}
                </button>
              </div>

              <div className="filter-control">
                <label htmlFor="zone-select">Hardiness Zone</label>
                <select
                  id="zone-select"
                  value={selectedZone}
                  onChange={(e) => updateFilters({ zone: e.target.value })}
                >
                  <option value="">All Zones</option>
                  {sortedZones.map((zone) => (
                    <option key={zone} value={zone}>
                      Zone {zone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-control">
                <label htmlFor="sort-select">Sort By</label>
                <select
                  id="sort-select"
                  value={sortOrder}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                >
                  <option value="">Featured / Newest</option>
                  <option value="price-low-to-high">Price: Low to High</option>
                  <option value="price-high-to-low">Price: High to Low</option>
                  <option value="alphabetical">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>

            <div className="toggle-section">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={viewSoldOut}
                  onChange={(e) =>
                    updateFilters({ view_sold_out: e.target.checked })
                  }
                  className="toggle-checkbox"
                />
                View Sold Out Plants
              </label>
            </div>
          </div>

          <div className="results-count" role="status" aria-live="polite">
            Showing {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"}
          </div>

          {selectedCategory &&
          products.length > 0 &&
          getActiveInStockCountForCategory(selectedCategory) === 0 ? (
            <div
              style={{
                width: "100%",
                maxWidth: "800px",
                margin: "2rem auto",
                background: "#00301E",
                border: "1px solid #D4B06A",
                padding: "3rem 2rem",
                borderRadius: "12px",
                textAlign: "center",
                color: "#F5E7C4",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                fontFamily: "'Crimson Text', serif",
                boxSizing: "border-box",
              }}
            >
              <h3
                style={{
                  color: "#D4B06A",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "1.8rem",
                  margin: "0 0 1rem 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Upcoming Batch / Gathering Inventory
              </h3>
              <p
                style={{
                  fontSize: "1.25rem",
                  lineHeight: "1.6",
                  maxWidth: "650px",
                  margin: "0 auto 1.5rem auto",
                }}
              >
                This batch is currently out of stock as we grow our next
                generation. Check back soon or submit a plant sourcing request for custom collector orders.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant="gold-filled" href="/sourcing">
                  Request Specimen &rarr;
                </Button>
                <Button variant="outline" onClick={() => updateFilters({ category: "", size: "", zone: "", tag: "", light: "", bloom: "", search: "" })}>
                  View All Available Flora
                </Button>
              </div>
            </div>
          ) : (
            <div className="products">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product?.slug || product?.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .shop-container {
          max-width: 1150px;
          margin: 32px auto;
          padding: 1.5rem;
          box-sizing: border-box;
          font-family: "Crimson Text", serif;
          color: #f5e7c4;
        }

        .shop-title {
          color: #e9dcbe;
          font-size: 2.5rem;
          text-align: center;
          letter-spacing: 0.15em;
          margin-top: 0.2em;
          margin-bottom: 0.4em;
          font-family: "Cinzel", serif;
          text-transform: uppercase;
        }

        .shop-intro {
          max-width: 850px;
          margin: 0 auto 0.6rem auto;
          font-size: 1.15rem;
          line-height: 1.6;
          color: #e9dcbe;
          text-align: center;
          font-family: "Crimson Text", serif;
        }

        .filter-panel {
          background: #00301e;
          border: 1px solid #d4b06a;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .filter-group-label {
          font-size: 1.1rem;
          font-weight: bold;
          color: #d4b06a;
          margin-bottom: 0.5rem;
          display: block;
          font-family: "Crimson Text", serif;
        }

        .category-section {
          margin-bottom: 1.5rem;
        }

        .category-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
        }

        .category-pills button {
          background: #D4B06A;
          color: #00301E;
          border: 1px solid #D4B06A;
          font-weight: 700;
          border-radius: 20px;
          padding: 0.4rem 1rem;
          font-family: "Crimson Text", serif;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .category-pills button:hover {
          background: #E9DCBE;
          color: #00301E;
          border-color: #00301E;
          transform: translateY(-2px) scale(1.02);
        }

        .category-pills button.active {
          background: #00301E;
          color: #D4B06A;
          border: 2px solid #D4B06A;
          font-weight: 700;
          box-shadow: 0 0 10px rgba(212, 176, 106, 0.35);
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.2rem;
          margin-bottom: 1.2rem;
        }

        .filter-control {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .filter-control label {
          font-size: 0.95rem;
          color: #d4b06a;
          font-weight: bold;
          font-family: "Crimson Text", serif;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .search-input-wrapper input {
          width: 100%;
          padding-right: 2.2rem !important;
        }

        .search-clear-btn {
          position: absolute;
          right: 0.6rem;
          background: none;
          border: none;
          color: #00301e;
          opacity: 0.7;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }

        .filter-control input,
        .filter-control select {
          padding: 0.5rem 0.8rem;
          border-radius: 8px;
          border: 1px solid rgba(212, 176, 106, 0.4);
          background: #f5e7c4;
          color: #00301e;
          font-family: "Crimson Text", serif;
          font-size: 1rem;
          outline: none;
          box-sizing: border-box;
        }

        .toggle-section {
          display: flex;
          align-items: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(212, 176, 106, 0.2);
        }

        .toggle-label {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          cursor: pointer;
          color: #f5e7c4;
          font-size: 1.05rem;
          font-family: "Crimson Text", serif;
        }

        .toggle-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #d4b06a;
          cursor: pointer;
        }

        .shop-subtext {
          max-width: 850px;
          margin: 0 auto 1.5rem auto;
          font-size: 1.1rem;
          line-height: 1.5;
          text-align: center;
          color: #f5e7c4;
          font-family: "Crimson Text", serif;
          border-bottom: 1px solid rgba(212, 176, 106, 0.25);
          padding-bottom: 1rem;
        }

        .results-count {
          text-align: center;
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
          color: #d4b06a;
          font-weight: bold;
          font-family: "Crimson Text", serif;
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
      `}</style>
    </div>
  );
}
