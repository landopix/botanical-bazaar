import Head from 'next/head';
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Button from "../components/Button";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/skeletons/ProductCardSkeleton";
import NurseryUpdateFallback from "../components/NurseryUpdateFallback";
import { useWishlist } from "../context/WishlistContext";
import { getAllProducts } from "../lib/shopify";
import { isZoneCompatible, normalizePotSize, getProductSizes, getAvailableZones } from "../lib/fulfillment";

// Static list of requested category collections
const COLLECTIONS = [
  { id: "orchids", name: "Orchids" },
  { id: "tropical-houseplants", name: "Tropical Houseplants" },
  { id: "fruit-trees", name: "Fruit Trees" },
  { id: "exotics-rare", name: "Exotics & Rare" },
  { id: "herbs-medicinal", name: "Herbs & Medicinal" },
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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Verification Gate for Catalog Launch (OPP-001, TBB-001)
  const { hasOverallInventory, hasShippingInventory, hasPickupInventory, launchGatePassed } = useMemo(() => {
    const hasOverall = products.some((p) => p?.availableForSale !== false && (p?.quantity === undefined || p?.quantity >= 1));
    const hasShipping = products.some((p) => {
      const isAvailable = p?.availableForSale !== false && (p?.quantity === undefined || p?.quantity >= 1);
      const isPickupOnly = Array.isArray(p?.tags) && p.tags.some((t) => t?.toLowerCase() === 'pickup-only' || t?.toLowerCase() === 'local-pickup-only');
      return isAvailable && !isPickupOnly;
    });
    const hasPickup = products.some((p) => {
      const isAvailable = p?.availableForSale !== false && (p?.quantity === undefined || p?.quantity >= 1);
      const isNoPickup = Array.isArray(p?.tags) && p.tags.some((t) => t?.toLowerCase() === 'no-pickup' || t?.toLowerCase() === 'shipping-only');
      return isAvailable && !isNoPickup;
    });
    return {
      hasOverallInventory: hasOverall,
      hasShippingInventory: hasShipping,
      hasPickupInventory: hasPickup,
      launchGatePassed: hasOverall && hasShipping && hasPickup,
    };
  }, [products]);

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

  // Real-time filtered & sorted products list derived via useMemo
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Collection Handle / Category Filter Logic
    if (selectedCategory) {
      const catLower = selectedCategory.toLowerCase();
      result = result.filter((product) => {
        const matchesCollectionHandle = (handle) =>
          Array.isArray(product?.collectionHandles) &&
          product.collectionHandles.some((h) => h?.toLowerCase() === handle.toLowerCase());
        const matchesCategory = (cat) =>
          Array.isArray(product?.categories) &&
          product.categories.some((pc) => pc?.toLowerCase() === cat.toLowerCase());
        const matchesTag = (t) =>
          Array.isArray(product?.tags) &&
          product.tags.some((pt) => pt?.toLowerCase() === t.toLowerCase());
        const textMatches = (keyword) =>
          `${product?.name || ""} ${product?.description || ""}`
            .toLowerCase()
            .includes(keyword.toLowerCase());

        if (matchesCollectionHandle(catLower) || matchesCategory(catLower) || matchesTag(catLower)) return true;

        if (catLower === "orchids" || catLower === "orchid") {
          return matchesTag("orchid") || matchesCategory("orchids") || textMatches("orchid");
        }
        if (catLower === "tropical-houseplants" || catLower === "houseplants") {
          return (
            matchesTag("houseplant") ||
            matchesTag("tropical") ||
            matchesCategory("houseplants") ||
            matchesCategory("tropical-houseplants") ||
            textMatches("houseplant") ||
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
          const isPlant = (product?.type || "").toLowerCase().includes("plant") || (product?.type || "").toLowerCase().includes("tree") || (Array.isArray(product?.tags) && product.tags.some(t => ["plant", "houseplant", "tree", "aroid", "orchid", "tropical", "rare", "succulent", "cactus"].includes(t.toLowerCase())));
          if (isPlant) return false;
          return matchesCollectionHandle("stickers-art") || matchesCategory("stickers-art") || matchesCategory("art") || matchesTag("sticker") || matchesTag("stickers-art") || (matchesTag("art") && !isPlant);
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
        const isAvailable = p?.availableForSale !== false && (p?.quantity === undefined || p?.quantity >= 1);
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
      result = result.filter((product) => isZoneCompatible(selectedZone, product));
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
        const aSold = a?.availableForSale === false || (a?.quantity !== undefined && a.quantity < 1);
        const bSold = b?.availableForSale === false || (b?.quantity !== undefined && b.quantity < 1);
        if (aSold && !bSold) return 1;
        if (!aSold && bSold) return -1;
        return 0;
      });
    }

    return result;
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
  const sortedZones = useMemo(() => {
    return getAvailableZones(products);
  }, [products]);

  // Dynamically extract unique pot size options
  const sortedSizes = useMemo(() => {
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
    return Array.from(availableSizes).sort();
  }, [products]);

  // Performance Optimization: Pre-compute in-stock item counts per collection category
  // using useMemo so that catalog array filtering is executed once per inventory update
  // rather than repeatedly on every component re-render.
  const categoryInStockCounts = useMemo(() => {
    const counts = {};
    if (!products || products.length === 0) {
      COLLECTIONS.forEach((c) => { counts[c.id] = 0; });
      return counts;
    }

    COLLECTIONS.forEach((collection) => {
      const categoryId = collection.id;
      const catLower = categoryId.toLowerCase();

      counts[categoryId] = products.filter((product) => {
        const isSoldOut = product?.availableForSale === false || (product?.quantity !== undefined && product.quantity < 1);
        if (isSoldOut) return false;

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

        if (catLower === "orchids" || catLower === "orchid") {
          return hasCategory("orchids") || hasTag("orchid") || textMatches("orchid");
        }
        if (catLower === "tropical-houseplants" || catLower === "houseplants") {
          return (
            hasCategory("tropical-houseplants") ||
            hasCategory("houseplants") ||
            hasTag("houseplant") ||
            hasTag("tropical") ||
            textMatches("houseplant") ||
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
          const isPlant = (product?.type || "").toLowerCase().includes("plant") || (product?.type || "").toLowerCase().includes("tree") || (Array.isArray(product?.tags) && product.tags.some(t => ["plant", "houseplant", "tree", "aroid", "orchid", "tropical", "rare", "succulent", "cactus"].includes(t.toLowerCase())));
          if (isPlant) return false;
          return (
            hasCategory("stickers-art") ||
            hasCategory("art") ||
            hasTag("sticker") ||
            hasTag("stickers-art")
          );
        }
        if (catLower === "tinctures-apothecary" || catLower === "tinctures & apothecary") {
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
        if (catLower === "terrarium-vivarium" || catLower === "terrarium & vivarium") {
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
    });

    return counts;
  }, [products]);


  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedSize) count++;
    if (selectedZone) count++;
    if (sortOrder) count++;
    if (viewSoldOut) count++;
    if (searchQuery) count++;
    if (selectedTag) count++;
    if (selectedLight) count++;
    if (selectedBloom) count++;
    return count;
  }, [selectedSize, selectedZone, sortOrder, viewSoldOut, searchQuery, selectedTag, selectedLight, selectedBloom]);

  const visibleCollections = useMemo(() => {
    if (products.length === 0) return COLLECTIONS;
    return COLLECTIONS.filter((collection) => (categoryInStockCounts[collection.id] || 0) > 0);
  }, [products, categoryInStockCounts]);

  // Dynamic meta title and description based on active filters
  const activeCategoryObj = COLLECTIONS.find(c => c.id === selectedCategory);
  const categoryName = activeCategoryObj ? activeCategoryObj.name : (selectedCategory ? selectedCategory.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') : '');
  const dynamicTitle = categoryName
    ? `${categoryName} | The Botanical Bazaar St. Petersburg FL`
    : (selectedTag
        ? `${selectedTag.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')} Plants | The Botanical Bazaar`
        : "Shop Rare Tropical Plants & Orchids | The Botanical Bazaar St. Petersburg FL");

  const dynamicDescription = categoryName
    ? `Browse our selection of ${categoryName.toLowerCase()} grown in St. Petersburg, FL. Standard shipping & local nursery pickup available.`
    : "Browse our catalog of rare tropical plants, collector aroids, philodendrons, monstera, and orchids. Standard shipping and local nursery pickup in St. Petersburg, FL.";

  return (
    <div className="shop-container">
      <Head>
        <title>{dynamicTitle}</title>
        <meta name="description" content={dynamicDescription} />
        <link rel="canonical" key="canonical" href="https://thebotanicalbazaar.com/shop" />
        <meta property="og:title" content={dynamicTitle} />
        <meta property="og:description" content={dynamicDescription} />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/brand-banner.png" />
        <meta property="og:url" content="https://thebotanicalbazaar.com/shop" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={dynamicTitle} />
        <meta name="twitter:description" content={dynamicDescription} />
        <meta name="twitter:image" content="https://thebotanicalbazaar.com/assets/brand-banner.png" />
      </Head>

      <h1 className="shop-title">Shop All Plants</h1>

      <div className="fulfillment-banner" style={{ background: '#D4B06A', color: '#1C3D2E', padding: '0.35rem 0.8rem', borderRadius: '6px', marginBottom: '0.6rem', textAlign: 'center', fontSize: '0.85rem', lineHeight: '1.3' }}>
        <strong>Standard Shipping &amp; Local Pickup:</strong> Secure live-plant packaging from St. Petersburg, FL + Free Nursery Pickup. <Link href="/shipping-pickup" style={{ color: '#00301E', textDecoration: 'underline', fontWeight: 'bold', marginLeft: '0.3rem' }}>Details &rarr;</Link>
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
              Browse live nursery inventory grown in St.&nbsp;Petersburg, FL for nationwide shipping and local pickup.
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

            {/* Mobile Filter Toggle Button */}
            <div className="mobile-filter-toggle-wrapper">
              <button
                type="button"
                className="mobile-filter-toggle-btn"
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                aria-expanded={isMobileFilterOpen}
              >
                <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount} active)` : ''}</span>
                <span className="toggle-arrow">{isMobileFilterOpen ? '▲' : '▾'}</span>
              </button>
              <div className="mobile-results-count" role="status" aria-live="polite">
                {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
              </div>
            </div>

            {/* Combined Toolbar / Filter Controls */}
            <div className={`filters-toolbar ${isMobileFilterOpen ? 'mobile-open' : ''}`}>
              <div className="filter-control search-control">
                <div className="search-input-wrapper">
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Search plants..."
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
                <select
                  id="size-select"
                  value={selectedSize}
                  onChange={(e) => updateFilters({ size: e.target.value })}
                  aria-label="Filter by pot size"
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
                  aria-label={`Filter catalog for my hardiness zone ${userZone}`}
                >
                  {selectedZone === userZone ? `✓ Zone ${userZone}` : `My Zone (${userZone})`}
                </button>
              </div>

              <div className="filter-control">
                <select
                  id="zone-select"
                  value={selectedZone}
                  onChange={(e) => updateFilters({ zone: e.target.value })}
                  aria-label="Filter by hardiness zone"
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
                <select
                  id="sort-select"
                  value={sortOrder}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  aria-label="Sort catalog"
                >
                  <option value="">Featured / Newest</option>
                  <option value="price-low-to-high">Price: Low to High</option>
                  <option value="price-high-to-low">Price: High to Low</option>
                  <option value="alphabetical">Alphabetical (A-Z)</option>
                </select>
              </div>

              <div className="filter-control toggle-control">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={viewSoldOut}
                    onChange={(e) =>
                      updateFilters({ view_sold_out: e.target.checked })
                    }
                    className="toggle-checkbox"
                  />
                  Sold Out
                </label>
              </div>

              <div className="desktop-results-count" role="status" aria-live="polite">
                {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
              </div>
            </div>
          </div>



          {selectedCategory &&
          products.length > 0 &&
          (categoryInStockCounts[selectedCategory] || 0) === 0 ? (
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
          margin: 12px auto 24px auto;
          padding: 0.75rem 1rem;
          box-sizing: border-box;
          font-family: "Crimson Text", serif;
          color: #f5e7c4;
        }

        .shop-title {
          color: #e9dcbe;
          font-size: 1.8rem;
          text-align: center;
          letter-spacing: 0.12em;
          margin-top: 0;
          margin-bottom: 0.3em;
          font-family: "Cinzel", serif;
          text-transform: uppercase;
        }

        .shop-intro {
          max-width: 850px;
          margin: 0 auto 0.4rem auto;
          font-size: 0.95rem;
          line-height: 1.35;
          color: #e9dcbe;
          text-align: center;
          font-family: "Crimson Text", serif;
        }

        .filter-panel {
          background: #00301e;
          border: 1px solid #d4b06a;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          margin-bottom: 1.2rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .filter-group-label {
          font-size: 0.9rem;
          font-weight: bold;
          color: #d4b06a;
          margin-bottom: 0;
          white-space: nowrap;
          display: inline-block;
          font-family: "Crimson Text", serif;
        }

        .category-section {
          margin-bottom: 0.6rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .category-pills {
          display: flex;
          justify-content: center;
          flex-wrap: nowrap;
          gap: 0.4rem;
          overflow-x: auto;
          white-space: nowrap;
          -ms-overflow-style: none;
          scrollbar-width: none;
          padding-bottom: 2px;
          flex: 1;
        }

        .category-pills::-webkit-scrollbar {
          display: none;
        }

        .category-pills button {
          background: #D4B06A;
          color: #00301E;
          border: 1px solid #D4B06A;
          font-weight: 700;
          border-radius: 16px;
          padding: 0.25rem 0.75rem;
          font-family: "Crimson Text", serif;
          font-size: 0.88rem;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .category-pills button:hover {
          background: #E9DCBE;
          color: #00301E;
          border-color: #00301E;
          transform: translateY(-1px);
        }

        .category-pills button.active {
          background: #00301E;
          color: #D4B06A;
          border: 1.5px solid #D4B06A;
          font-weight: 700;
          box-shadow: 0 0 8px rgba(212, 176, 106, 0.3);
        }

        .mobile-filter-toggle-wrapper {
          display: none;
        }

        .filters-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem 0.6rem;
          padding-top: 0.4rem;
          border-top: 1px solid rgba(212, 176, 106, 0.2);
        }

        .filter-control {
          display: flex;
          align-items: center;
        }

        .search-control {
          flex: 1 1 180px;
          min-width: 140px;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .search-input-wrapper input {
          width: 100%;
          padding-right: 1.8rem !important;
        }

        .search-clear-btn {
          position: absolute;
          right: 0.4rem;
          background: none;
          border: none;
          color: #00301e;
          opacity: 0.7;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          font-size: 0.85rem;
        }

        .filter-control input,
        .filter-control select {
          padding: 0.35rem 0.6rem;
          border-radius: 6px;
          border: 1px solid rgba(212, 176, 106, 0.4);
          background: #f5e7c4;
          color: #00301e;
          font-family: "Crimson Text", serif;
          font-size: 0.88rem;
          outline: none;
          box-sizing: border-box;
          height: 32px;
        }

        .my-zone-btn {
          padding: 0.35rem 0.6rem !important;
          border-radius: 6px !important;
          border: 1px solid #D4B06A !important;
          background-color: #1C3D2E !important;
          color: #F5E7C4 !important;
          font-weight: bold !important;
          font-size: 0.85rem !important;
          cursor: pointer !important;
          white-space: nowrap !important;
          height: 32px !important;
          display: inline-flex !important;
          align-items: center !important;
          transition: all 0.2s ease !important;
        }

        .my-zone-btn.active {
          background-color: #D4B06A !important;
          color: #00301E !important;
        }

        .toggle-control {
          margin-left: 0.2rem;
        }

        .toggle-label {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          color: #f5e7c4;
          font-size: 0.88rem;
          font-family: "Crimson Text", serif;
          white-space: nowrap;
        }

        .toggle-checkbox {
          width: 15px;
          height: 15px;
          accent-color: #d4b06a;
          cursor: pointer;
        }

        .desktop-results-count {
          margin-left: auto;
          font-size: 0.88rem;
          color: #d4b06a;
          font-weight: bold;
          font-family: "Crimson Text", serif;
          white-space: nowrap;
        }

        .products {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.2rem;
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
          .shop-title {
            font-size: 1.5rem;
          }
          .mobile-filter-toggle-wrapper {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-top: 0.4rem;
            border-top: 1px solid rgba(212, 176, 106, 0.2);
          }
          .mobile-filter-toggle-btn {
            background: #D4B06A;
            color: #00301E;
            border: none;
            border-radius: 6px;
            padding: 0.35rem 0.8rem;
            font-family: "Cinzel", serif;
            font-weight: bold;
            font-size: 0.85rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.4rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .mobile-results-count {
            font-size: 0.85rem;
            color: #d4b06a;
            font-weight: bold;
          }
          .desktop-results-count {
            display: none;
          }
          .filters-toolbar {
            display: none;
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
            margin-top: 0.6rem;
            border-top: none;
          }
          .filters-toolbar.mobile-open {
            display: flex;
          }
          .filter-control, .search-control {
            width: 100%;
          }
          .filter-control select, .my-zone-btn {
            width: 100%;
            justify-content: center;
          }
          .products {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
