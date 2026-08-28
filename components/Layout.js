export function getZoneFromZip(zipInput) {
  const cleanZip = String(zipInput || '').trim().replace(/\D/g, '').slice(0, 5);
  if (cleanZip.length < 5) return null;
  const num = parseInt(cleanZip, 10);

  if (num >= 33000 && num <= 33499) return '10b';
  if (num >= 33500 && num <= 33999) return '10a';
  if (num >= 34000 && num <= 34999) return '9b';
  if (num >= 32000 && num <= 32999) return '9a';
  if (num >= 600 && num <= 999) return '11a';
  if (num >= 96700 && num <= 96899) return '11a';
  if (num >= 99500 && num <= 99999) return '4b';
  if (num >= 90000 && num <= 92899) return '10a';
  if (num >= 93000 && num <= 95999) return '9a';
  if (num >= 97000 && num <= 99499) return '8b';
  if (num >= 70000 && num <= 79999) return '8b';
  if (num >= 30000 && num <= 31999) return '8a';
  if (num >= 39000 && num <= 39999) return '8a';
  if (num >= 27000 && num <= 28999) return '7b';
  if (num >= 20000 && num <= 24699) return '7a';
  if (num >= 37000 && num <= 38599) return '7a';
  if (num >= 40000 && num <= 42799) return '6b';
  if (num >= 15000 && num <= 19699) return '6b';
  if (num >= 10000 && num <= 14999) return '6b';
  if (num >= 43000 && num <= 47999) return '6a';
  if (num >= 60000 && num <= 62999) return '5b';
  if (num >= 63000 && num <= 65999) return '6a';
  if (num >= 50000 && num <= 58999) return '4b';
  if (num >= 48000 && num <= 49999) return '5b';
  if (num >= 3000 && num <= 5999) return '5a';
  if (num >= 80000 && num <= 89999) return '6a';

  return null;
}

import Head from 'next/head';
import Script from 'next/script';
import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { getAllProducts } from "../lib/shopify";

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
    href: "/almanac",
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
    title: "Plant Sourcing & Inquiries",
    href: "/sourcing",
    category: "Services",
    description: "Custom plant sourcing for rare collector species and exotic cultivars.",
    content: "sourcing custom requests rare plants collector specimen inquiry search nursery network"
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

const rawDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'the-botanical-bazaar.myshopify.com';
const shopifyAccountUrl = `https://${rawDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')}/account/login`;

const MEGA_MENU_BLUEPRINT = [
  {
    title: "Rare Plants",
    items: [
      { label: "Rare Foliage Plants", href: "/shop?tag=rare-foliage", keywords: ["rare", "foliage", "aroid", "philodendron", "monstera", "anthurium", "alocasia"] },
      { label: "Variegated Plants", href: "/shop?tag=variegated", keywords: ["variegated", "variegata"] },
      { label: "Bazaar Exclusive Hybrids", href: "/shop?tag=hybrid", keywords: ["hybrid", "bazaar exclusive", "exclusive"] },
      { label: "View All Rare Plants", href: "/shop?category=exotics-rare", alwaysShow: true }
    ]
  },
  {
    title: "Fragrant Plants",
    items: [
      { label: "Fragrant Rare Plants", href: "/shop?tag=fragrant-rare", keywords: ["fragrant", "scented", "aromatic"], mustAlsoMatch: ["rare", "exotic", "collector"] },
      { label: "Fragrant Indoor Plants", href: "/shop?tag=fragrant-indoor", keywords: ["fragrant", "scented", "aromatic"], mustAlsoMatch: ["indoor", "houseplant", "windowsill"] },
      { label: "Fragrant Tropical Plants", href: "/shop?tag=fragrant-tropical", keywords: ["fragrant", "scented", "aromatic"], mustAlsoMatch: ["tropical", "patio", "plumeria", "jasmine", "gardenia"] },
      { label: "Fragrant Hardy Plants", href: "/shop?tag=fragrant-hardy", keywords: ["fragrant", "scented", "aromatic"], mustAlsoMatch: ["hardy", "perennial"] },
      { label: "Fragrant Fruiting Plants", href: "/shop?tag=fragrant-fruiting", keywords: ["fragrant", "scented", "aromatic"], mustAlsoMatch: ["fruit", "fruiting", "citrus"] },
      { label: "View All Fragrant Plants", href: "/shop?tag=fragrant", alwaysShow: true }
    ]
  },
  {
    title: "Edible & Fruiting Plants",
    items: [
      { label: "Tropical Fruiting Plants", href: "/shop?category=fruit-trees", keywords: ["tropical"], mustAlsoMatch: ["fruit", "fruiting", "citrus", "mango", "avocado", "banana", "papaya"] },
      { label: "Herbs & Spices", href: "/shop?category=herbs-medicinal", keywords: ["herb", "spice", "medicinal", "vanilla", "pepper"] },
      { label: "Beverage Botanicals", href: "/shop?tag=beverage", keywords: ["beverage", "tea", "coffee", "citrus", "mint", "herbal"] },
      { label: "Fruiting Container Plants", href: "/shop?tag=container-fruit", keywords: ["container", "pot", "patio", "dwarf"], mustAlsoMatch: ["fruit", "fruiting"] },
      { label: "Hardy Fruiting Plants", href: "/shop?tag=hardy-fruit", keywords: ["hardy"], mustAlsoMatch: ["fruit", "fruiting", "berry", "fig", "mulberry"] },
      { label: "View All Fruiting Plants", href: "/shop?category=fruit-trees", alwaysShow: true },
      { label: "View All Edible Plants", href: "/shop?category=herbs-medicinal", alwaysShow: true }
    ]
  },
  {
    title: "Indoor Plants",
    items: [
      { label: "Indoor Windowsill Houseplants", href: "/shop?tag=windowsill", keywords: ["indoor", "windowsill", "houseplant", "peperomia", "pothos", "hoya"] },
      { label: "Indoor Succulent Plants", href: "/shop?tag=succulent", keywords: ["succulent", "cactus", "sansevieria", "snake plant"] },
      { label: "Indoor Tropical Plants", href: "/shop?category=tropical-houseplants", keywords: ["indoor", "houseplant", "tropical", "aroid", "fern", "calathea"] },
      { label: "Easy to Grow Indoor Houseplants", href: "/shop?tag=easy-to-grow", keywords: ["easy", "low maintenance", "beginner", "easy to grow", "tolerant"] },
      { label: "View All Indoor Plants", href: "/shop?category=tropical-houseplants", alwaysShow: true }
    ]
  },
  {
    title: "Tropical Plants",
    items: [
      { label: "Tropical Patio & Garden Plants", href: "/shop?tag=patio", keywords: ["tropical", "patio", "garden", "outdoor"] },
      { label: "Indoor Tropical Plants", href: "/shop?category=tropical-houseplants", keywords: ["tropical"], mustAlsoMatch: ["indoor", "houseplant"] },
      { label: "Tropical Vines", href: "/shop?tag=vines", keywords: ["vine", "vining", "climber", "monstera", "philodendron", "hoya", "passion"] },
      { label: "Tropical Summer Garden Plants", href: "/shop?tag=summer-garden", keywords: ["summer", "tropical", "patio", "heat"] },
      { label: "Tropical Fruiting Plants", href: "/shop?category=fruit-trees", keywords: ["tropical"], mustAlsoMatch: ["fruit", "fruiting"] },
      { label: "View All Tropical Plants", href: "/shop?category=tropical-houseplants", alwaysShow: true }
    ]
  },
  {
    title: "Hardy Plants",
    items: [
      { label: "Hardy Garden Plants", href: "/shop?tag=hardy-garden", keywords: ["hardy", "perennial", "outdoor", "cold hardy"] },
      { label: "Hardy Fruiting Plants", href: "/shop?tag=hardy-fruit", keywords: ["hardy"], mustAlsoMatch: ["fruit", "fruiting", "fig", "berry", "mulberry"] },
      { label: "View All Hardy Plants", href: "/shop?zone=8a", alwaysShow: true }
    ]
  },
  {
    title: "Orchids",
    items: [
      { label: "Cattleya Orchids", href: "/shop?tag=cattleya", keywords: ["cattleya"] },
      { label: "Coconut Orchids", href: "/shop?tag=coconut-orchid", keywords: ["coconut", "maxillaria", "tenuifolia"] },
      { label: "Fragrant Orchids", href: "/shop?tag=fragrant-orchid", keywords: ["orchid"], mustAlsoMatch: ["fragrant", "scented", "aromatic"] },
      { label: "Hardy Orchids", href: "/shop?tag=hardy-orchid", keywords: ["hardy", "ground orchid", "bletilla", "epidendrum"] },
      { label: "Jewel Orchids", href: "/shop?tag=jewel-orchid", keywords: ["jewel", "ludisia", "macodes", "anoectochilus"] },
      { label: "Phalaenopsis Orchids", href: "/shop?tag=phalaenopsis", keywords: ["phalaenopsis", "phal"] },
      { label: "Vanilla Bean Orchids", href: "/shop?tag=vanilla-orchid", keywords: ["vanilla", "planifolia"] },
      { label: "Orchid Accessories", href: "/shop?tag=orchid-accessories", keywords: ["accessory", "accessories", "pot", "media", "bark", "moss", "mount"] },
      { label: "View All Orchid Plants", href: "/shop?category=orchids", alwaysShow: true }
    ]
  }
];


export default function Layout({ children }) {
  const router = useRouter();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);

  // Desktop Header Dropdowns state
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isFaqDropdownOpen, setIsFaqDropdownOpen] = useState(false);

  // Hardiness Zone Detector state (defaults to Zone 10a)
  const [hardinessZone, setHardinessZone] = useState("10a");
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [zipInput, setZipInput] = useState("");
  const [selectedDropdownZone, setSelectedDropdownZone] = useState("10a");
  const [zipError, setZipError] = useState("");
  const [zoneStatusMessage, setZoneStatusMessage] = useState("");

  const sidebarRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const searchInputRef = useRef(null);
  const zoneModalRef = useRef(null);
  const triggerElementRef = useRef(null);

  const shopDropdownRef = useRef(null);
  const faqDropdownRef = useRef(null);
  const shopTriggerRef = useRef(null);
  const faqTriggerRef = useRef(null);

  // UX Fix: Hover delay timers to prevent menu from vanishing during diagonal mouse movement
  const shopTimerRef = useRef(null);
  const faqTimerRef = useRef(null);

  const handleShopMouseEnter = () => {
    if (shopTimerRef.current) clearTimeout(shopTimerRef.current);
    if (faqTimerRef.current) clearTimeout(faqTimerRef.current);
    setIsFaqDropdownOpen(false);
    setIsShopDropdownOpen(true);
  };

  const handleShopMouseLeave = () => {
    // UX Fix: 150ms transition delay on mouse leave for smooth diagonal cursor tracking
    shopTimerRef.current = setTimeout(() => {
      setIsShopDropdownOpen(false);
    }, 150);
  };

  const handleFaqMouseEnter = () => {
    if (shopTimerRef.current) clearTimeout(shopTimerRef.current);
    if (faqTimerRef.current) clearTimeout(faqTimerRef.current);
    setIsShopDropdownOpen(false);
    setIsFaqDropdownOpen(true);
  };

  const handleFaqMouseLeave = () => {
    // UX Fix: 150ms transition delay on mouse leave for smooth diagonal cursor tracking
    faqTimerRef.current = setTimeout(() => {
      setIsFaqDropdownOpen(false);
    }, 150);
  };

  const mainContentRef = useRef(null);
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const quickActionsRef = useRef(null);

  useEffect(() => {
    if (hardinessZone) {
      setSelectedDropdownZone(hardinessZone);
    }
  }, [hardinessZone]);

  const handleZipSubmit = (e) => {
    e.preventDefault();
    setZipError("");
    const zone = getZoneFromZip(zipInput);
    if (zone) {
      handleSelectZone(zone);
      setZipInput("");
    } else {
      setZipError("Please enter a valid 5-digit US ZIP Code.");
    }
  };

  const handleDropdownSubmit = (e) => {
    e.preventDefault();
    handleSelectZone(selectedDropdownZone);
  };

  // Keep track of group open/close states in sidebar
  const [isGuidesOpen, setIsGuidesOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);

  const [showBackToTop, setShowBackToTop] = useState(false);

  // Load products for the live navigation search
  useEffect(() => {
    let isMounted = true;
    async function fetchSearchProducts() {
      try {
        const products = await getAllProducts();
        if (isMounted && Array.isArray(products) && products.length > 0) {
          setAllProducts(products);
          if (typeof window !== "undefined") {
            window.PRODUCTS = products;
          }
        }
      } catch (err) {
        console.error("Failed to fetch live products for global search:", err);
        if (isMounted && typeof window !== "undefined" && window.PRODUCTS) {
          setAllProducts(window.PRODUCTS);
        }
      }
    }

    fetchSearchProducts();

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
        triggerElementRef.current = document.activeElement;
        setIsZoneModalOpen(true);
      };

      window.addEventListener("user_hardiness_zone_updated", handleZoneUpdated);
      window.addEventListener("open_zone_modal", handleOpenZoneModal);

      return () => {
        isMounted = false;
        window.removeEventListener("user_hardiness_zone_updated", handleZoneUpdated);
        window.removeEventListener("open_zone_modal", handleOpenZoneModal);
      };
    }
  }, []);

  const handleSelectZone = (newZone) => {
    setHardinessZone(newZone);
    const msg = `USDA Hardiness Zone updated to Zone ${newZone}.`;
    setZoneStatusMessage(msg);
    if (typeof window !== "undefined") {
      localStorage.setItem("user_hardiness_zone", newZone);
      window.dispatchEvent(new Event("user_hardiness_zone_updated"));
    }
    setTimeout(() => {
      setIsZoneModalOpen(false);
    }, 300);
  };

  // Manage Escape key press to close sidebar, USDA Zone modal, or desktop dropdowns & restore focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isZoneModalOpen) {
          setIsZoneModalOpen(false);
          if (triggerElementRef.current && typeof triggerElementRef.current.focus === "function") {
            triggerElementRef.current.focus();
          }
        } else if (isSidebarOpen) {
          setIsSidebarOpen(false);
          if (triggerElementRef.current && typeof triggerElementRef.current.focus === "function") {
            triggerElementRef.current.focus();
          } else if (toggleBtnRef.current) {
            toggleBtnRef.current.focus();
          }
        } else if (isShopDropdownOpen) {
          setIsShopDropdownOpen(false);
          shopTriggerRef.current?.focus();
        } else if (isFaqDropdownOpen) {
          setIsFaqDropdownOpen(false);
          faqTriggerRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen, isZoneModalOpen, isShopDropdownOpen, isFaqDropdownOpen]);

  // Focus management when opening/closing sidebar
  useEffect(() => {
    if (isSidebarOpen) {
      const searchInput = document.getElementById("sidebar-search");
      if (searchInput) {
        searchInput.focus();
      } else if (sidebarRef.current) {
        sidebarRef.current.focus();
      }
    } else {
      if (triggerElementRef.current && typeof triggerElementRef.current.focus === "function") {
        triggerElementRef.current.focus();
      }
    }
  }, [isSidebarOpen]);

  // Focus trapping within Navigation Sidebar
  useEffect(() => {
    if (!isSidebarOpen || !sidebarRef.current) return;

    const sidebar = sidebarRef.current;
    const focusableElements = sidebar.querySelectorAll(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"
    );
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    sidebar.addEventListener("keydown", handleTabKey);
    return () => sidebar.removeEventListener("keydown", handleTabKey);
  }, [isSidebarOpen]);

  // Focus trapping within Zone Selector Modal
  useEffect(() => {
    if (!isZoneModalOpen || !zoneModalRef.current) return;

    const modal = zoneModalRef.current;
    const focusableElements = modal.querySelectorAll(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"
    );
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modal.addEventListener("keydown", handleTabKey);
    return () => modal.removeEventListener("keydown", handleTabKey);
  }, [isZoneModalOpen]);

  useEffect(() => {
    if (isZoneModalOpen) {
      if (zoneModalRef.current) {
        const firstInput = zoneModalRef.current.querySelector("input, select, button");
        if (firstInput) firstInput.focus();
      }
    } else {
      if (triggerElementRef.current && typeof triggerElementRef.current.focus === "function") {
        triggerElementRef.current.focus();
      }
    }
  }, [isZoneModalOpen]);

  // Apply inert attribute and aria-hidden to background elements when sidebar or modal is open
  useEffect(() => {
    const isOverlayOpen = isSidebarOpen || isZoneModalOpen;
    const targets = [mainContentRef.current, headerRef.current, footerRef.current, quickActionsRef.current];

    targets.forEach((el) => {
      if (el) {
        if (isOverlayOpen) {
          el.setAttribute("aria-hidden", "true");
          el.setAttribute("inert", "");
        } else {
          el.removeAttribute("aria-hidden");
          el.removeAttribute("inert");
        }
      }
    });
  }, [isSidebarOpen, isZoneModalOpen]);

  // Global event handler for outside clicks to close sidebar drawer and header dropdowns
  useEffect(() => {
    const handleDocumentClick = (e) => {
      const toggleBtn = e.target.closest(".header-mobile-toggle, .sidebar-toggle");
      if (toggleBtn) {
        return;
      }

      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setIsSidebarOpen(false);
      }

      if (
        isShopDropdownOpen &&
        shopDropdownRef.current &&
        !shopDropdownRef.current.contains(e.target)
      ) {
        setIsShopDropdownOpen(false);
      }

      if (
        isFaqDropdownOpen &&
        faqDropdownRef.current &&
        !faqDropdownRef.current.contains(e.target)
      ) {
        setIsFaqDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [isSidebarOpen, isShopDropdownOpen, isFaqDropdownOpen]);

  // Handle scroll trigger for Back to Top
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

  // Update body class and scroll locking for sidebar sliding & modals
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (isSidebarOpen || isZoneModalOpen) {
        document.body.classList.add("sidebar-open");
        document.body.style.overflow = "hidden";
      } else {
        document.body.classList.remove("sidebar-open");
        document.body.style.overflow = "";
      }
    }
  }, [isSidebarOpen, isZoneModalOpen]);

  // Initialize Google Customer Reviews Badge widget on route change idempotently
  useEffect(() => {
    if (typeof window !== "undefined" && window.merchantwidget && typeof window.merchantwidget.start === "function") {
      try {
        const existingIframe = document.querySelector('iframe[src*="merchantcenter"], iframe[id*="merchantwidget"], iframe[src*="google.com/shopping/merchant"]');
        if (!existingIframe && !window.__merchantwidget_initialized) {
          window.merchantwidget.start({
            merchant_id: 5843329915,
            position: "BOTTOM_RIGHT",
            region: "US"
          });
          window.__merchantwidget_initialized = true;
        }
      } catch (err) {
        console.error("Google Merchant Widget start error:", err);
      }
    }
  }, [router.pathname]);

  // Route Change State Cleanup
  useEffect(() => {
    const handleRouteChange = () => {
      setIsSidebarOpen(false);
      setIsGuidesOpen(false);
      setIsFaqOpen(false);
      setIsCollectionsOpen(false);
      setIsZoneModalOpen(false);
      setIsShopDropdownOpen(false);
      setIsFaqDropdownOpen(false);
      setSearchQuery("");
      if (typeof document !== "undefined") {
        document.body.classList.remove("sidebar-open");
        document.body.style.overflow = "";
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  const handleShopBlur = (e) => {
    if (shopDropdownRef.current && !shopDropdownRef.current.contains(e.relatedTarget)) {
      setIsShopDropdownOpen(false);
    }
  };

  const handleFaqBlur = (e) => {
    if (faqDropdownRef.current && !faqDropdownRef.current.contains(e.relatedTarget)) {
      setIsFaqDropdownOpen(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sidebarItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Shop All", href: "/shop" },
    { label: "Consultations", href: "/consultations" },
    { label: "Plant Sourcing", href: "/sourcing" },
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
        { label: "Orchids", href: "/shop?category=orchids" },
        { label: "Tropical Houseplants", href: "/shop?category=tropical-houseplants" },
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
        { label: "This Month in the Garden", href: "/almanac" },
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
        { label: "Shipping & Local Pickup", href: "/shipping-pickup" },
        { label: "Plant Care Guarantee", href: "/returns" },
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
      ],
    },
  ];

  const query = searchQuery.trim().toLowerCase();

  const matchingProducts = useMemo(() => {
    if (query === "") return [];
    return allProducts
      .filter((p) => {
        let haystack = [p.name, p.title, p.type, p.description, p.sku, p.custom?.pot_size, p.custom?.hardiness_zone]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (Array.isArray(p.categories))
          haystack += " " + p.categories.join(" ").toLowerCase();
        if (Array.isArray(p.tags))
          haystack += " " + p.tags.join(" ").toLowerCase();
        if (Array.isArray(p.collections))
          haystack += " " + p.collections.join(" ").toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 10);
  }, [query, allProducts]);

  const dynamicMegaMenuColumns = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];

    const activeProducts = allProducts.filter(
      (p) => p && p.availableForSale !== false && (p.quantity === undefined || p.quantity > 0)
    );

    return MEGA_MENU_BLUEPRINT.map((column) => {
      const activeItems = column.items.filter((item) => {
        return activeProducts.some((p) => {
          const tags = Array.isArray(p?.tags) ? p.tags.map((t) => t.toLowerCase()) : [];
          const cats = Array.isArray(p?.categories) ? p.categories.map((c) => c.toLowerCase()) : [];
          const name = (p?.name || p?.title || "").toLowerCase();
          const desc = (p?.description || "").toLowerCase();
          const ptype = (p?.type || "").toLowerCase();
          const haystack = `${name} ${desc} ${ptype} ${tags.join(" ")} ${cats.join(" ")}`;

          let urlCategory = null;
          let urlTag = null;
          if (item.href && item.href.includes("?")) {
            const queryString = item.href.split("?")[1];
            const params = new URLSearchParams(queryString);
            urlCategory = params.get("category")?.toLowerCase();
            urlTag = params.get("tag")?.toLowerCase();
          }

          if (urlCategory) {
            const catMatch = cats.some((c) => c === urlCategory || c.includes(urlCategory));
            if (catMatch) return true;
          }

          if (urlTag) {
            const tagMatch = tags.some((t) => t === urlTag || t.includes(urlTag) || urlTag.includes(t));
            if (tagMatch) return true;
          }

          const keywords = (item.keywords || []).map((k) => k.toLowerCase());
          const mustAlso = (item.mustAlsoMatch || []).map((m) => m.toLowerCase());

          const kwMatch = keywords.length > 0 && keywords.some((kw) => haystack.includes(kw));
          const mustMatch = mustAlso.length === 0 || mustAlso.every((mm) => haystack.includes(mm));

          return kwMatch && mustMatch;
        });
      });

      return {
        ...column,
        items: activeItems,
      };
    }).filter((column) => column.items.length > 0);
  }, [allProducts]);

  const matchingPages = useMemo(() => {
    if (query === "") return [];
    return staticPages.filter((p) => {
      return (
        p.title.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query)
      );
    });
  }, [query]);

  return (
    <div className="site-wrapper">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Script
        id="merchantWidgetScript"
        src="https://www.gstatic.com/shopping/merchant/merchantwidget.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== "undefined" && window.merchantwidget && typeof window.merchantwidget.start === "function") {
            try {
              const existingIframe = document.querySelector('iframe[src*="merchantcenter"], iframe[id*="merchantwidget"], iframe[src*="google.com/shopping/merchant"]');
              if (!existingIframe && !window.__merchantwidget_initialized) {
                window.merchantwidget.start({
                  merchant_id: 5843329915,
                  position: "BOTTOM_RIGHT",
                  region: "US"
                });
                window.__merchantwidget_initialized = true;
              }
            } catch (err) {
              console.error("Google Merchant Widget onLoad error:", err);
            }
          }
        }}
      />
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
              "@type": ["GardenStore", "LocalBusiness"],
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
              "areaServed": [
                {
                  "@type": "AdministrativeArea",
                  "name": "St. Petersburg"
                },
                {
                  "@type": "AdministrativeArea",
                  "name": "Tampa"
                },
                {
                  "@type": "AdministrativeArea",
                  "name": "Clearwater"
                },
                {
                  "@type": "AdministrativeArea",
                  "name": "Pinellas County"
                },
                {
                  "@type": "State",
                  "name": "Florida"
                }
              ],
              "priceRange": "$$",
              "telephone": "+1-727-350-7876",
              "sameAs": [
                "https://www.instagram.com/thebotanicalbazaar",
                "https://www.facebook.com/thebotanicalbazaar"
              ]
            })
          }}
        />
      </Head>

      {/* Sidebar backdrop overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="sidebar-backdrop"
          aria-label="Close menu drawer overlay"
          role="button"
          tabIndex={-1}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 999,
            cursor: "pointer",
            transition: "opacity 200ms ease-in-out",
          }}
        />
      )}

      {/* Quick Actions Bubble Panel */}
      <div ref={quickActionsRef} className="quick-actions" role="region" aria-label="Quick action navigation stack">
        {/* Toggle / Search Bubble */}
        <button
          ref={toggleBtnRef}
          className="sidebar-toggle"
          aria-label="Toggle navigation search menu"
          aria-controls="site-sidebar"
          aria-expanded={isSidebarOpen}
          onClick={(e) => {
            triggerElementRef.current = e.currentTarget;
            setIsSidebarOpen((prev) => !prev);
          }}
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

        {/* Cart Action Link */}
        {router.pathname !== '/checkout' && (
          <Link
            href="/cart"
            className="cart-btn"
            aria-label={`View cart with ${cartCount} items`}
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
        )}

        {/* Wishlist Action Link */}
        <Link
          href="/wishlist"
          className="wishlist-btn"
          aria-label={`View wishlist with ${wishlist.length} items`}
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
        <a href={shopifyAccountUrl} className="account-btn" aria-label="My account login">
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
        </a>
      </div>

      {/* Stateful Navigation Sidebar */}
      <nav
        ref={sidebarRef}
        id="site-sidebar"
        className={`sidebar ${isSidebarOpen ? "open" : ""}`}
        role="dialog"
        aria-label="Navigation and Search Menu"
        aria-modal={isSidebarOpen ? "true" : "false"}
        tabIndex={-1}
      >
        <div className="sidebar-search-container" style={{ position: "relative", display: "flex", alignItems: "center" }}>
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
          <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
            <input
              id="sidebar-search"
              ref={searchInputRef}
              type="text"
              placeholder="Search"
              aria-label="Search navigation and products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape" && searchQuery) {
                  e.stopPropagation();
                  setSearchQuery("");
                }
              }}
              style={{ paddingRight: searchQuery.trim() !== "" ? "2rem" : "1rem", width: "100%" }}
            />
            {searchQuery.trim() !== "" && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search input"
                title="Clear search (Esc)"
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  background: "none",
                  border: "none",
                  color: "#D4B06A",
                  fontSize: "1.1rem",
                  lineHeight: 1,
                  cursor: "pointer",
                  padding: "0.2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  transition: "color 0.15s ease"
                }}
              >
                ✕
              </button>
            )}
          </div>
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
                  const isSold = prod.availableForSale === false || (prod.quantity !== undefined && prod.quantity < 1);
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
      <header ref={headerRef} style={{ position: "relative" }}>
        <Link href="/" style={{ display: "inline-block" }}>
          <img
            src="/assets/lantern.png"
            alt="Lantern sub mark"
            className="lantern-emblem"
            style={{ height: "60px" }}
          />
        </Link>
        <button
          className="header-mobile-toggle block lg:hidden"
          aria-label="Toggle mobile menu"
          aria-expanded={isSidebarOpen}
          aria-controls="site-sidebar"
          onClick={(e) => {
            triggerElementRef.current = e.currentTarget;
            setIsSidebarOpen((prev) => !prev);
          }}
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
          {/* Shop All Dropdown */}
          <div
            ref={shopDropdownRef}
            className="nav-dropdown-wrapper mega-menu-wrapper"
            onMouseEnter={handleShopMouseEnter}
            onMouseLeave={handleShopMouseLeave}
          >
            <Link
              ref={shopTriggerRef}
              href="/shop"
              className="nav-dropdown-trigger"
              aria-expanded={isShopDropdownOpen}
              aria-controls="desktop-shop-dropdown"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                  e.preventDefault();
                  setIsFaqDropdownOpen(false);
                  setIsShopDropdownOpen(true);
                }
              }}
            >
              SHOP ALL ▾
            </Link>
            <div
              id="desktop-shop-dropdown"
              className={`nav-dropdown-menu mega-menu-container ${isShopDropdownOpen ? "is-open" : ""}`}
            >
              <Link href="/shop" className="dropdown-title" onClick={() => setIsShopDropdownOpen(false)}>
                SHOP ALL CATALOG &rarr;
              </Link>
              <div className="mega-menu-grid">
                {dynamicMegaMenuColumns.map((col, cIdx) => (
                  <div key={cIdx} className="mega-menu-col">
                    <h4>{col.title}</h4>
                    {col.items.map((item, iIdx) => (
                      <Link
                        key={iIdx}
                        href={item.href}
                        className={item.alwaysShow ? "mega-menu-view-all" : ""}
                        onClick={() => setIsShopDropdownOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Link href="/consultations">Consultations</Link>
          <Link href="/almanac">The Almanac</Link>
          <Link href="/events">Events</Link>
          <Link href="/orchids-gallery">Gallery</Link>
          <Link href="/contact">Contact</Link>

          {/* FAQ Rich Dropdown Menu */}
          <div
            ref={faqDropdownRef}
            className="nav-dropdown-wrapper"
            onMouseEnter={handleFaqMouseEnter}
            onMouseLeave={handleFaqMouseLeave}
          >
            <Link
              ref={faqTriggerRef}
              href="/faq"
              className="nav-dropdown-trigger"
              aria-expanded={isFaqDropdownOpen}
              aria-controls="desktop-faq-dropdown"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                  e.preventDefault();
                  setIsShopDropdownOpen(false);
                  setIsFaqDropdownOpen(true);
                }
              }}
            >
              FAQ ▾
            </Link>
            <div
              id="desktop-faq-dropdown"
              className={`nav-dropdown-menu ${isFaqDropdownOpen ? "is-open" : ""}`}
              style={{ minWidth: "260px" }}
            >
              <Link href="/faq" className="dropdown-title" onClick={() => setIsFaqDropdownOpen(false)}>
                CUSTOMER HELP & FAQ
              </Link>
              <div className="dropdown-col" style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <Link href="/faq" onClick={() => setIsFaqDropdownOpen(false)}>FAQ Overview</Link>
                <Link href="/shipping-pickup" onClick={() => setIsFaqDropdownOpen(false)}>Shipping &amp; Local Pickup</Link>
                <Link href="/returns" onClick={() => setIsFaqDropdownOpen(false)}>Plant Care Guarantee</Link>
                <Link href="/terms" onClick={() => setIsFaqDropdownOpen(false)}>Terms &amp; Conditions</Link>
                <Link href="/privacy" onClick={() => setIsFaqDropdownOpen(false)}>Privacy Policy</Link>
              </div>
            </div>
          </div>
          <Link href="/about">About</Link>
        </nav>
      </header>

      {/* Accessible Live Region for Search Results */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {searchQuery.trim() !== "" ? `Search for "${searchQuery}" returned ${matchingProducts.length} product${matchingProducts.length === 1 ? "" : "s"} and ${matchingPages.length} page${matchingPages.length === 1 ? "" : "s"}.` : ""}
      </div>

      {/* Accessible Live Region for USDA Zone Updates */}
      <div
        role="status"
        aria-live="polite"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {zoneStatusMessage}
      </div>

      {/* Main Page Content Wrapper */}
      <main id="main-content" ref={mainContentRef} className="site-main">{children}</main>

      {/* High-Fidelity Footer */}
      <footer ref={footerRef} className="footer-container">
        <div className="footer-columns">
          <div className="footer-column">
            <h3>Contact Info</h3>
            <p className="contact-item">
              Address: P.O. Box 35353, St. Petersburg, FL 33705
            </p>
            <p className="contact-item">Phone: <a href="tel:7273507876" style={{ color: "inherit", textDecoration: "underline" }}>(727) 350-7876</a></p>
            <p className="contact-item">Email: info@thebotanicalbazaar.com</p>
            <p className="contact-item">Pickup coordination hours: Thurs - Sun: 10AM - 5PM</p>
          </div>
          <div className="footer-column">
            <h3>Ordering Info</h3>
            <Link href="/faq">FAQ</Link>
            <Link href="/shipping-pickup">Shipping &amp; Unpacking</Link>
            <Link href="/returns">Refunds &amp; Guarantee</Link>
            <a href={shopifyAccountUrl}>Track Order / Account</a>
            <Link href="/terms">Terms</Link>
          </div>
          <div className="footer-column">
            <h3>About Us</h3>
            <Link href="/about">Our History</Link>
            <Link href="/contact">Store Visit</Link>
            <Link href="/sourcing">Plant Sourcing</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/accessibility">Accessibility</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
          <div className="footer-column">
            <h3>Find Plants &amp; Care</h3>
            <Link href="/shop">Shop All</Link>
            <Link href="/sales">On Sale</Link>
            <Link href="/zones">USDA Zones</Link>
            <Link href="/almanac">Plant Care Almanac</Link>

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
                  onClick={(e) => {
                    triggerElementRef.current = e.currentTarget;
                    setIsZoneModalOpen(true);
                  }}
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
        .nav-dropdown-wrapper.mega-menu-wrapper {
          position: static;
        }
        .nav-dropdown-trigger {
          display: inline-block;
          background: none;
          border: none;
          padding: 0;
          font-size: inherit;
          cursor: pointer;
          font-family: var(--font-heading), "Cinzel", serif !important;
          color: #e9dcbe !important;
          margin: 0 1.2rem;
          text-decoration: none !important;
          letter-spacing: 0.05em;
          transition: color 0.2s ease;
        }
        .nav-dropdown-trigger:hover,
        .nav-dropdown-trigger:focus-visible {
          color: #d4b06a !important;
        }
        .nav-dropdown-menu {
          display: none !important;
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background-color: #00301e;
          border: 1px solid #d4b06a;
          border-radius: 8px;
          padding: 1.5rem;
          min-width: 320px;
          z-index: 1000;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
          margin-top: 0;
        }
        .nav-dropdown-menu.is-open {
          display: block !important;
        }
        .nav-dropdown-menu.mega-menu-container {
          width: 94vw;
          max-width: 1150px;
          min-width: auto;
          padding: 1.5rem 1.8rem;
          left: 50%;
          transform: translateX(-50%);
          box-sizing: border-box;
        }
        .mega-menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
          gap: 1.2rem 0.8rem;
        }
        .mega-menu-col {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          min-width: 0;
        }
        .mega-menu-col h4 {
          color: #d4b06a;
          font-family: "Cinzel", serif;
          font-size: 0.8rem;
          line-height: 1.25;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-top: 0;
          margin-bottom: 0.5rem;
          border-bottom: 1px solid rgba(212, 176, 106, 0.25);
          padding-bottom: 0.35rem;
          white-space: normal;
          word-break: normal;
          overflow-wrap: break-word;
        }
        .mega-menu-col a {
          display: block !important;
          color: #e9dcbe !important;
          padding: 0.15rem 0 !important;
          margin: 0 !important;
          font-size: 0.88rem !important;
          font-family: "Crimson Text", serif !important;
          font-weight: normal !important;
          line-height: 1.35;
          text-decoration: none !important;
          transition: color 0.15s ease;
        }
        .mega-menu-col a:hover,
        .mega-menu-col a:focus-visible {
          color: #d4b06a !important;
          text-decoration: underline !important;
        }
        .mega-menu-col a.mega-menu-view-all {
          color: #d4b06a !important;
          font-weight: bold !important;
          margin-top: 0.3rem !important;
          font-size: 0.85rem !important;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        /* UX Fix: Refined hover bridge pseudo-element strictly bridging the vertical gap below the nav trigger */
        .nav-dropdown-menu::before {
          content: "";
          position: absolute;
          top: -12px;
          left: 0;
          right: 0;
          height: 12px;
          background: transparent;
          display: block;
          pointer-events: auto;
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
        .dropdown-col a:hover,
        .dropdown-col a:focus-visible {
          color: #d4b06a !important;
          text-decoration: underline !important;
        }

        /* Focus rings for keyboard navigation */
        .nav-dropdown-trigger:focus-visible,
        header nav a:focus-visible,
        .nav-dropdown-menu a:focus-visible,
        .quick-actions button:focus-visible,
        .quick-actions a:focus-visible,
        .sidebar a:focus-visible,
        .sidebar button:focus-visible,
        .sidebar input:focus-visible,
        .zone-modal-container button:focus-visible,
        .zone-modal-container input:focus-visible,
        .zone-modal-container select:focus-visible {
          outline: 2px solid #D4B06A !important;
          outline-offset: 3px !important;
          border-radius: 4px;
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

        @media (min-width: 1024px) {
          .header-mobile-toggle {
            display: none !important;
          }
        }

        @media (max-width: 1023px) {
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
        <div
          className="zone-modal-overlay"
          onClick={() => {
            setIsZoneModalOpen(false);
            if (triggerElementRef.current && typeof triggerElementRef.current.focus === "function") {
              triggerElementRef.current.focus();
            }
          }}
        >
          <div
            ref={zoneModalRef}
            className="zone-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="zone-modal-title"
            style={{ maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="zone-modal-header">
              <h3 id="zone-modal-title" className="zone-modal-title">Select Your Hardiness Zone</h3>
              <button
                className="zone-modal-close"
                onClick={() => {
                  setIsZoneModalOpen(false);
                  if (triggerElementRef.current && typeof triggerElementRef.current.focus === "function") {
                    triggerElementRef.current.focus();
                  }
                }}
                aria-label="Close climate zone modal"
              >
                ✕
              </button>
            </div>

            <p style={{ color: '#E9DCBE', fontSize: '0.95rem', margin: '0 0 1.2rem 0', lineHeight: '1.5' }}>
              Calculate your USDA Hardiness Zone via 5-digit ZIP code or manually select your zone below.
            </p>

            {zoneStatusMessage && (
              <div
                role="status"
                style={{
                  background: "rgba(36, 145, 96, 0.2)",
                  border: "1px solid #249160",
                  color: "#F5E7C4",
                  padding: "0.6rem 0.8rem",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  marginBottom: "1rem",
                  textAlign: "center",
                  fontWeight: "bold"
                }}
              >
                ✓ {zoneStatusMessage}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* ZIP Code Lookup */}
              <form onSubmit={handleZipSubmit} style={{ background: '#123826', padding: '1.2rem', borderRadius: '10px', border: '1px solid rgba(212, 176, 106, 0.3)' }}>
                <label htmlFor="modal-zip-input" style={{ display: 'block', color: '#D4B06A', fontFamily: 'Cinzel, serif', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ZIP Code Lookup
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    id="modal-zip-input"
                    type="text"
                    placeholder="e.g. 33705"
                    maxLength={5}
                    value={zipInput}
                    onChange={(e) => { setZipInput(e.target.value); setZipError(''); }}
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      border: '1px solid #D4B06A',
                      backgroundColor: '#1C3D2E',
                      color: '#F5E7C4',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    className="zone-pill-btn"
                    style={{ background: '#D4B06A', color: '#00301E', fontWeight: 'bold', border: 'none', padding: '0.6rem 1rem', cursor: 'pointer' }}
                  >
                    Use ZIP
                  </button>
                </div>
                {zipError && (
                  <div style={{ color: '#ff8a8a', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    {zipError}
                  </div>
                )}
              </form>

              {/* Zone Dropdown */}
              <form onSubmit={handleDropdownSubmit} style={{ background: '#123826', padding: '1.2rem', borderRadius: '10px', border: '1px solid rgba(212, 176, 106, 0.3)' }}>
                <label htmlFor="modal-zone-select" style={{ display: 'block', color: '#D4B06A', fontFamily: 'Cinzel, serif', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Zone Dropdown
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    id="modal-zone-select"
                    value={selectedDropdownZone}
                    onChange={(e) => setSelectedDropdownZone(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      border: '1px solid #D4B06A',
                      backgroundColor: '#1C3D2E',
                      color: '#F5E7C4',
                      fontSize: '0.95rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {Array.from({ length: 9 }, (_, i) => i + 3)
                      .flatMap((z) => [`${z}a`, `${z}b`])
                      .map((z) => (
                        <option key={z} value={z}>
                          Zone {z}
                        </option>
                      ))}
                  </select>
                  <button
                    type="submit"
                    className="zone-pill-btn"
                    style={{ background: '#D4B06A', color: '#00301E', fontWeight: 'bold', border: 'none', padding: '0.6rem 1rem', cursor: 'pointer' }}
                  >
                    Use Zone
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
