import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { Link, useNavigate, generatePath } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaArrowRight, FaArrowLeft, FaShieldAlt, FaTruck, FaHeadset, FaStore } from "react-icons/fa";

import useProduct from '../../shared/hooks/useProduct';
import useAuth from '../../shared/hooks/useAuth';
import { useFollowedSellerProducts, useGetFollowedSellerByUser } from '../../shared/hooks/useFollow';
import useCategory from '../../shared/hooks/useCategory';
import ProductCard from '../../shared/components/ProductCard';
import { getOrCreateSessionId } from '../../shared/utils/sessionUtils';
import useAnalytics from '../../shared/hooks/useAnalytics';
import Container from '../../shared/components/Container';
import { devicesMax } from '../../shared/styles/breakpoint';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import seoConfig from '../../shared/config/seoConfig';
import { PATHS } from "../../routes/routePaths";
import { useGetFeaturedSellers } from '../../shared/hooks/useSeller';
import StarRating from '../../shared/components/StarRating';
import EazShopSection from './EazShopSection';
import { EmptyState } from '../../components/loading';
import useAds from '../../shared/hooks/useAds';
import AdBanner from '../home/AdBanner';
import AdPopup from '../home/AdPopup';
import SellerAppPromoModal from '../home/SellerAppPromoModal';
import DealOfTheDaySection from '../home/DealOfTheDaySection';
import TestimonialsSection from '../home/TestimonialsSection';
import { useDealOfTheDay } from '../../shared/hooks/useDealOfTheDay';
import OptimizedImage from '../../shared/components/OptimizedImage';
import { IMAGE_SLOTS } from '../../shared/utils/cloudinaryConfig';
import { FRONTEND_URL } from '../../shared/config/appConfig';
import { HOMEPAGE_TRACK_EVENTS } from '../../shared/constants/homepageExperimentEvents';
import { hasUsableSellerAvatar, getShopInitials } from '../../shared/utils/sellerCardDisplay';

const RECENTLY_VIEWED_STORAGE_KEY = 'saiisai-recently-viewed-products';

function getFeaturedSellerProductImage(product) {
  const imgs = product?.images;
  if (!Array.isArray(imgs) || imgs.length === 0) return null;
  const first = imgs[0];
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object') {
    return first.url || first.secure_url || first.thumbnail || first.medium || null;
  }
  return null;
}

function truncateText(str, maxLen) {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= maxLen) return str;
  return `${str.slice(0, maxLen - 1)}…`;
}

const PRODUCT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'inStock', label: 'In Stock' },
  { id: 'deals', label: 'Deals' },
  { id: 'topRated', label: 'Top Rated' },
];
const UX_EXPERIMENTS = {
  defaultVariant: 'A',
  allowUrlOverride: true,
  sectionOrder: {
    A: ['categories', 'followed', 'trending', 'recommended', 'recentlyViewed'],
    B: ['recommended', 'categories', 'followed', 'trending', 'recentlyViewed'],
  },
  heroCopy: {
    A: {
      title: "Online shopping in Ghana – Ghana's e-commerce platform",
      intro:
        "Shop Ghana's favourite e-commerce website. Buy and sell online with Saiisai – the best online shopping platform in Ghana.",
    },
    B: {
      title: 'Shop smarter in Ghana with trusted sellers',
      intro:
        'Discover verified shops, better product deals, and faster delivery from one modern marketplace.',
    },
  },
};
// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const ViewInSection = ({ children, delayMs = 0, threshold = 0.12 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -5% 0px' }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [isVisible, threshold]);

  return (
    <ViewInWrapper ref={sectionRef} $isVisible={isVisible} $delayMs={delayMs}>
      {children}
    </ViewInWrapper>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  useDynamicPageTitle({
    title: seoConfig.home.title,
    description: seoConfig.home.description,
    keywords: seoConfig.home.keywords,
    image: seoConfig.home.image,
    type: seoConfig.home.type,
    canonical: seoConfig.home.canonical,
    jsonLd: seoConfig.home.jsonLd,
    defaultTitle: seoConfig.home.title,
    defaultDescription: seoConfig.home.description,
  });
  const { getProducts } = useProduct();
  const { recordProductView, recordScreenView } = useAnalytics();
  const { data: productsData, isLoading } = getProducts;
  const { userData, isAuthenticated } = useAuth();
  const user = useMemo(() => {
    if (!userData) return null;
    if (userData?.id || userData?._id) return userData;
    return userData?.user || userData?.data || null;
  }, [userData]);
  const showFollowedSection = Boolean(isAuthenticated || user);
  const { products: followedProducts, isLoading: isFollowedProductsLoading, total: followedProductsTotal } = useFollowedSellerProducts(12);
  const { data: sellersData, isLoading: isSellersLoading } = useGetFeaturedSellers({
    limit: 8,
    productsPerSeller: 2,
  });
  const {
    bannerAds,
    carouselAds,
    popupAds,
    isLoading: isAdsLoading,
  } = useAds();

  // Status/video system has been removed from web; no status viewer state.

  const [activePopupAd, setActivePopupAd] = useState(null);
  const [activeProductFilter, setActiveProductFilter] = useState('all');
  const [recentlyViewedIds, setRecentlyViewedIds] = useState([]);
  const [homepageVariant, setHomepageVariant] = useState(
    UX_EXPERIMENTS.defaultVariant
  );
  const [showVariantBadge, setShowVariantBadge] = useState(
    import.meta.env.DEV
  );
  const { data: followedShopsData } = useGetFollowedSellerByUser();
  const trackedVariantSeenRef = useRef(new Set());
  const recordScreenViewMutateRef = useRef(recordScreenView.mutate);

  useEffect(() => {
    recordScreenViewMutateRef.current = recordScreenView.mutate;
  }, [recordScreenView.mutate]);

  useEffect(() => {
    if (!UX_EXPERIMENTS.allowUrlOverride || typeof window === 'undefined') {
      return;
    }
    try {
      const params = new URLSearchParams(window.location.search);
      const paramVariant = (params.get('homeVariant') || '').toUpperCase();
      const debugBadge = params.get('showVariantBadge');
      if (paramVariant && UX_EXPERIMENTS.heroCopy[paramVariant]) {
        setHomepageVariant(paramVariant);
      }
      if (debugBadge === '1' || debugBadge === 'true') {
        setShowVariantBadge(true);
      }
    } catch (error) {
      // ignore URL parsing issues
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setRecentlyViewedIds(parsed.filter((id) => typeof id === 'string'));
      }
    } catch (error) {
      // Ignore malformed local storage data.
    }
  }, []);

  useEffect(() => {
    if (!popupAds || popupAds.length === 0) {
      setActivePopupAd(null);
      return;
    }

    const candidate = popupAds[0];
    if (!candidate) {
      setActivePopupAd(null);
      return;
    }

    const adId = candidate.id || candidate._id;
    const storageKey = adId ? `saiisai-popup-${adId}` : null;

    try {
      if (
        storageKey &&
        typeof window !== "undefined" &&
        window.sessionStorage
      ) {
        const seen = window.sessionStorage.getItem(storageKey);
        if (!seen) {
          setActivePopupAd(candidate);
        } else {
          setActivePopupAd(null);
        }
      } else {
        setActivePopupAd(candidate);
      }
    } catch (error) {
      setActivePopupAd(candidate);
    }
  }, [popupAds]);

  const handlePopupDismiss = useCallback((ad) => {
    const adId = ad?.id || ad?._id;
    const storageKey = adId ? `saiisai-popup-${adId}` : null;

    try {
      if (
        storageKey &&
        typeof window !== "undefined" &&
        window.sessionStorage
      ) {
        window.sessionStorage.setItem(storageKey, "dismissed");
      }
    } catch (error) {
      // Ignore storage errors
    }

    setActivePopupAd(null);
  }, []);

  const products = useMemo(() => {
    if (!productsData) return [];

    let productsList = [];

    // Handle nested data.data.data structure (from getAllProduct controller)
    if (productsData.data?.data && Array.isArray(productsData.data.data)) {
      productsList = productsData.data.data;
    }
    // Handle data.data.products
    else if (productsData.data?.products && Array.isArray(productsData.data.products)) {
      productsList = productsData.data.products;
    }
    // Handle data.products
    else if (productsData.products && Array.isArray(productsData.products)) {
      productsList = productsData.products;
    }
    // Handle data.results (if it's an array, not just a count)
    else if (productsData.results && Array.isArray(productsData.results)) {
      productsList = productsData.results;
    }
    // Handle data.data as array
    else if (productsData.data && Array.isArray(productsData.data)) {
      productsList = productsData.data;
    }
    // If productsData itself is an array
    else if (Array.isArray(productsData)) {
      productsList = productsData;
    }

    // CRITICAL: Filter out deleted products and unapproved products (client-side safety check)
    // Backend should already filter these via buildBuyerSafeQuery, but this ensures no deleted/unapproved products are shown
    return productsList.filter(product => {
      // Exclude products deleted by admin or seller
      if (product.isDeleted === true ||
        product.isDeletedByAdmin === true ||
        product.isDeletedBySeller === true ||
        product.status === 'archived') {
        return false;
      }

      // CRITICAL: Only show products that have been approved by admin
      // Backend buildBuyerSafeQuery requires: moderationStatus: 'approved'
      // Frontend safety check: Ensure moderationStatus is 'approved' if it exists
      if (product.moderationStatus && product.moderationStatus !== 'approved') {
        return false;
      }

      // NOTE: We no longer check isVisible - approved products are visible regardless of seller verification

      // Additional check: Ensure status is active or out_of_stock (backend also filters this)
      if (product.status && !['active', 'out_of_stock'].includes(product.status)) {
        return false;
      }

      return true;
    });
  }, [productsData]);
  const sellers = useMemo(() => sellersData || [], [sellersData]);

  // Deal of the Day: best discount or promotionKey 'deal-of-the-day', countdown to end of day
  const dealOfTheDay = useDealOfTheDay(products);

  const followedSellers = useMemo(() => {
    const raw =
      followedShopsData?.data?.follows ||
      followedShopsData?.follows ||
      followedShopsData?.data ||
      [];
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) => item?.seller || null)
      .filter(Boolean);
  }, [followedShopsData]);

  const followedSellerCount = followedSellers.length;

  // Status/video system has been removed from web; status groups and viewer handlers removed.

  const handleProductClick = useCallback((productId) => {
    const sessionId = getOrCreateSessionId();
    if (navigator.sendBeacon) {
      const data = new Blob([JSON.stringify({ productId, sessionId })], { type: "application/json" });
      navigator.sendBeacon("/analytics/product-view", data);
    } else {
      recordProductView.mutate({ productId, sessionId });
    }

    setRecentlyViewedIds((prev) => {
      const deduped = [productId, ...prev.filter((id) => id !== productId)];
      const next = deduped.slice(0, 12);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(
            RECENTLY_VIEWED_STORAGE_KEY,
            JSON.stringify(next)
          );
        } catch (error) {
          // Ignore storage errors
        }
      }
      return next;
    });
  }, [recordProductView]);

  // Resolve ad link to full URL using FRONTEND_URL environment variable
  // In development: Keeps localhost URLs as localhost
  // In production: Replaces localhost URLs with production domain
  const resolveAdLink = useCallback((link) => {
    if (!link || typeof link !== "string") return PATHS.PRODUCTS;
    const raw = link.trim();

    // Get current origin (in production: https://saiisai.com, in dev: http://localhost:5173)
    const currentOrigin = window.location.origin;
    const isProduction = !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(currentOrigin);

    // In DEVELOPMENT: Keep localhost URLs as-is, don't replace them
    if (!isProduction) {
      // If it's already a full URL (including localhost), return as-is
      if (/^https?:\/\//i.test(raw)) {
        return raw;
      }
      // If it's a relative path, prepend current origin (localhost)
      const cleanLink = raw.startsWith("/") ? raw.substring(1) : raw;
      return `${currentOrigin}/${cleanLink}`;
    }

    // In PRODUCTION: Replace localhost URLs with production domain
    // Determine the production frontend URL to use for replacing localhost links
    let productionFrontendUrl = import.meta.env.VITE_FRONTEND_URL;

    // Ignore localhost env vars in production
    if (productionFrontendUrl && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(productionFrontendUrl)) {
      productionFrontendUrl = null;
    }

    // Try to derive from API URL (if it's production API)
    if (!productionFrontendUrl) {
      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
      if (apiUrl && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(apiUrl)) {
        // Remove /api and trailing slashes to get frontend URL
        productionFrontendUrl = apiUrl.replace(/\/api\/?.*$/, '').replace(/\/$/, '');
      }
    }

    // Use current origin as fallback in production
    if (!productionFrontendUrl) {
      productionFrontendUrl = currentOrigin;
    }

    const cleanFrontendUrl = productionFrontendUrl.trim().replace(/\/$/, ''); // Remove trailing slash

    // In PRODUCTION: Replace localhost URLs with production URL
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(raw)) {
      try {
        const url = new URL(raw);
        const path = url.pathname + url.search + url.hash;

        // Determine production URL to use for replacement
        let replacementUrl = null;

        // First, use configured frontend URL from env-backed app config.
        const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
        if (FRONTEND_URL && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(FRONTEND_URL)) {
          replacementUrl = FRONTEND_URL.trim().replace(/\/$/, '');
        } else if (apiUrl && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(apiUrl)) {
          // If API URL is production (not localhost), derive frontend URL
          replacementUrl = apiUrl.replace(/\/api\/?.*$/, '').replace(/\/$/, '');
        }

        // If still not set, use cleanFrontendUrl only if it's NOT localhost
        if (!replacementUrl && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(cleanFrontendUrl)) {
          replacementUrl = cleanFrontendUrl;
        }

        // Use current origin as fallback
        if (!replacementUrl) {
          replacementUrl = currentOrigin;
        }

        const normalized = `${replacementUrl}${path}`;
        return normalized;
      } catch (error) {
        const pathMatch = raw.match(/^https?:\/\/[^\/]+(\/.*)?$/);
        const path = pathMatch && pathMatch[1] ? pathMatch[1] : '/';
        const normalized = `${cleanFrontendUrl}${path}`;
        return normalized;
      }
    }

    // If it's already an absolute URL (and not localhost), return as-is
    if (/^https?:\/\//i.test(raw)) return raw;

    // If it's a relative path, prepend FRONTEND_URL
    const cleanLink = raw.startsWith("/") ? raw.substring(1) : raw; // Remove leading slash
    return `${cleanFrontendUrl}/${cleanLink}`;
  }, []);

  const isExternalLink = useCallback((link) => {
    return link && /^https?:\/\//i.test(link);
  }, []);

  const formatPromoEndDate = useCallback((dateStr) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return null;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return null;
    }
  }, []);

  // Hero Slider: use carouselAds when available, else static fallback
  const heroSlides = useMemo(() => {
    if (carouselAds && carouselAds.length > 0) {
      return carouselAds.map((ad, index) => ({
        id: ad.id || ad._id || `ad-${index}`,
        title: (ad.title || "Special Offer").toUpperCase(),
        subtitle: ad.subtitle ?? ad.description ?? "",
        image: ad.imageUrl || "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
        cta: ad.ctaText || "Shop offer",
        link: resolveAdLink(ad.link),
        discountPercent: typeof ad.discountPercent === "number" ? ad.discountPercent : 0,
        endDate: ad.endDate || null,
      }));
    }
    return [
      { id: 1, title: "Summer Collection 2025", subtitle: "Experience the essence of luxury with our exclusive summer line.", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop", cta: "Shop Collection", link: PATHS.PRODUCTS, color: "#f8f9fa", discountPercent: 0, endDate: null },
      { id: 2, title: "Modern Tech Essentials", subtitle: "Upgrade your lifestyle with cutting-edge technology.", image: "https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?q=80&w=2070&auto=format&fit=crop", cta: "Explore Gadgets", link: PATHS.PRODUCTS, color: "#e9ecef", discountPercent: 0, endDate: null },
      { id: 3, title: "Elegant Home Decor", subtitle: "Transform your space into a sanctuary of style.", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=2070&auto=format&fit=crop", cta: "Discover More", link: PATHS.PRODUCTS, color: "#dee2e6", discountPercent: 0, endDate: null },
    ];
  }, [carouselAds, resolveAdLink]);

  const { getCategories } = useCategory();
  const { data: categoriesData, isLoading: isCategoriesLoading, isError: isCategoriesError } = getCategories;

  const categories = useMemo(() => {
    // Handle different response structures
    // Backend returns: { status: 'success', results: [...], meta: {...} }
    // Service now returns response.data directly
    const categoriesList =
      categoriesData?.results ||
      categoriesData?.data?.results ||
      [];

    if (!categoriesList || !Array.isArray(categoriesList) || categoriesList.length === 0) return [];

    // Filter to show only parent categories (top-level categories)
    const parentCategories = categoriesList.filter(
      (cat) => !cat.parentCategory || cat.parentCategory === null
    );

    if (parentCategories.length === 0) return [];

    // Map API categories to display format, adding images and sizes
    return parentCategories.slice(0, 5).map((cat, index) => {
      let resolvedImage = null;
      if (cat.image) {
        if (Array.isArray(cat.image)) {
          resolvedImage = cat.image[0]?.url || (typeof cat.image[0] === 'string' ? cat.image[0] : null);
        } else if (typeof cat.image === 'object') {
          resolvedImage = cat.image.url;
        } else if (typeof cat.image === 'string') {
          resolvedImage = cat.image;
        }
      }

      return {
        id: cat._id,
        name: cat.name,
        image: resolvedImage || [
          "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
          "https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=800&q=80",
          "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80",
          "https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800&q=80",
          "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80"
        ][index % 5],
        count: "",
        size: index === 0 ? "large" : "medium"
      };
    });
  }, [categoriesData]);

  const recommendedProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const scoreA = (a.totalSold || 0) + (a.averageRating || 0) * 5;
        const scoreB = (b.totalSold || 0) + (b.averageRating || 0) * 5;
        return scoreB - scoreA;
      })
      .slice(0, 8);
  }, [products]);

  const recentlyViewedProducts = useMemo(() => {
    if (!recentlyViewedIds.length) return [];
    const byId = new Map(products.map((product) => [product._id, product]));
    return recentlyViewedIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .slice(0, 8);
  }, [products, recentlyViewedIds]);

  const filteredProducts = useMemo(() => {
    if (activeProductFilter === 'inStock') {
      return products.filter((product) => product.stock > 0);
    }
    if (activeProductFilter === 'deals') {
      return products.filter(
        (product) =>
          (product.discountPercentage || 0) > 0 ||
          (product.salePrice || 0) > 0
      );
    }
    if (activeProductFilter === 'topRated') {
      return [...products]
        .filter((product) => (product.averageRating || 0) >= 4)
        .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }
    return products;
  }, [activeProductFilter, products]);

  const trackHomepageEvent = useCallback(
    (eventName, metadata = '') => {
      const sessionId = getOrCreateSessionId();
      const screen = metadata
        ? `home:${eventName}:${homepageVariant}:${metadata}`
        : `home:${eventName}:${homepageVariant}`;
      recordScreenView.mutate({ screen, sessionId });
    },
    [homepageVariant, recordScreenView.mutate]
  );

  useEffect(() => {
    const trackedKey = `${HOMEPAGE_TRACK_EVENTS.VARIANT_SEEN}:${homepageVariant}`;
    if (trackedVariantSeenRef.current.has(trackedKey)) return;

    trackedVariantSeenRef.current.add(trackedKey);
    const sessionId = getOrCreateSessionId();
    const screen = `home:${HOMEPAGE_TRACK_EVENTS.VARIANT_SEEN}:${homepageVariant}`;
    recordScreenViewMutateRef.current({ screen, sessionId });
  }, [homepageVariant]);

  const heroCopy = useMemo(() => {
    return (
      UX_EXPERIMENTS.heroCopy[homepageVariant] ||
      UX_EXPERIMENTS.heroCopy[UX_EXPERIMENTS.defaultVariant]
    );
  }, [homepageVariant]);

  const sectionOrder = useMemo(() => {
    return (
      UX_EXPERIMENTS.sectionOrder[homepageVariant] ||
      UX_EXPERIMENTS.sectionOrder[UX_EXPERIMENTS.defaultVariant]
    );
  }, [homepageVariant]);

  const homepageSections = useMemo(
    () => ({
      categories: (
        <Section key="categories">
          <Container>
            <SectionHeader>
              <SectionTitle>Browse Categories</SectionTitle>
              <SectionLink to={PATHS.CATEGORIES}>View All Categories <FaArrowRight /></SectionLink>
            </SectionHeader>
            <SectionDescription>
              Start with the most popular departments and explore what you need faster.
            </SectionDescription>
            {isCategoriesLoading ? (
              <LoadingGrid>
                {[1, 2, 3, 4, 5].map(i => (
                  <SkeletonCard key={i} />
                ))}
              </LoadingGrid>
            ) : isCategoriesError ? (
              <EmptyState>
                <p>Unable to load categories. Please try again later.</p>
              </EmptyState>
            ) : categories.length === 0 ? (
              <EmptyState>
                <p>No categories available at the moment.</p>
              </EmptyState>
            ) : (
              <>
                {/* Desktop: magazine-style bento grid */}
                <CategoryGrid>
                  {categories.map((cat) => (
                    <CategoryCard key={cat.id} $size={cat.size} to={`${PATHS.CATEGORIES}/${cat.id}`}>
                      <CategoryBg>
                        <OptimizedImage
                          src={cat.image}
                          slot={IMAGE_SLOTS.CATEGORY_HERO}
                          aspectRatio="16/9"
                          alt={cat.name}
                          objectFit="cover"
                        />
                      </CategoryBg>
                      <CategoryContent>
                        <h3>{cat.name}</h3>
                        <span>{cat.count}</span>
                      </CategoryContent>
                    </CategoryCard>
                  ))}
                </CategoryGrid>

                {/* Mobile: horizontal scrollable circular pills (matches mobile app) */}
                <CategoryPillRow>
                  {categories.map((cat) => (
                    <CategoryPillLink key={cat.id} to={`${PATHS.CATEGORIES}/${cat.id}`}>
                      <CategoryPillCircle>
                        <OptimizedImage
                          src={cat.image}
                          slot={IMAGE_SLOTS.CATEGORY_ICON}
                          aspectRatio="1/1"
                          alt={cat.name}
                          objectFit="cover"
                        />
                      </CategoryPillCircle>
                      <CategoryPillName>{cat.name}</CategoryPillName>
                    </CategoryPillLink>
                  ))}
                </CategoryPillRow>
              </>
            )}
          </Container>
        </Section>
      ),
      followed: showFollowedSection ? (
        <Section key="followed" $bg="#f8f9fa">
          <Container>
            <SectionHeader>
              <SectionTitle>From sellers you follow</SectionTitle>
              {followedProductsTotal > 12 && (
                <SectionLink to={PATHS.FOLLOWED}>
                  See all <FaArrowRight />
                </SectionLink>
              )}
            </SectionHeader>
            <SectionDescription>
              Fresh products from shops you already trust.
            </SectionDescription>
            {isFollowedProductsLoading ? (
              <LoadingGrid>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </LoadingGrid>
            ) : followedProducts.length > 0 ? (
              <ProductGrid>
                {followedProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onClick={() => handleProductClick(product._id)}
                    showAddToCart
                  />
                ))}
              </ProductGrid>
            ) : (
              <EmptyState>
                <p>No products from your followed sellers yet.</p>
                <SectionLink to={PATHS.FOLLOWED} style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                  View followed shops <FaArrowRight />
                </SectionLink>
              </EmptyState>
            )}
          </Container>
        </Section>
      ) : null,
      trending: (
        <Section key="trending" $bg="#f8f9fa">
          <Container>
            <SectionHeader>
              <SectionTitle>Featured Sellers</SectionTitle>
              <SectionLink to={PATHS.SELLERS}>View All Sellers <FaArrowRight /></SectionLink>
            </SectionHeader>
            <SectionDescription>
              Verified sellers with quality listings and reliable fulfillment.
            </SectionDescription>

            {isSellersLoading ? (
              <LoadingGrid>
                {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
              </LoadingGrid>
            ) : sellers.length === 0 ? (
              <EmptyState>
                <p>No trending sellers available at the moment.</p>
              </EmptyState>
            ) : (
              <SellerSwiperWrap>
                <Swiper
                  modules={[Autoplay, Navigation]}
                  slidesPerView={1.15}
                  spaceBetween={16}
                  grabCursor
                  loop={sellers.length > 3}
                  autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
                  navigation={{
                    nextEl: '.seller-swiper-next',
                    prevEl: '.seller-swiper-prev',
                  }}
                  breakpoints={{
                    580: { slidesPerView: 1.8, spaceBetween: 16 },
                    900: { slidesPerView: 2.5, spaceBetween: 16 },
                    1200: { slidesPerView: 4, spaceBetween: 16 },
                  }}
                  className="seller-swiper"
                >
                  {sellers.map((seller) => {
                    const topProducts = (seller.products || []).slice(0, 2);
                    const shopLabel = seller.shopName || seller.name || 'Seller';
                    const showAvatarImage = hasUsableSellerAvatar(seller.avatar);
                    const ratingVal = Number(
                      seller.rating ?? seller.ratings?.average ?? 0
                    );
                    const hasRating = Number.isFinite(ratingVal) && ratingVal > 0.05;
                    const sellerUrl = generatePath(PATHS.SELLER_SHOP, {
                      id: String(seller.id || seller._id),
                    });

                    return (
                      <SwiperSlide key={seller.id || seller._id}>
                        <SellerCard
                          role="link"
                          tabIndex={0}
                          aria-label={`View ${shopLabel} shop`}
                          onClick={() => navigate(sellerUrl)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              navigate(sellerUrl);
                            }
                          }}
                        >
                          <SellerCardHeader>
                            <SellerAvatarContainer>
                              {showAvatarImage ? (
                                <SellerAvatarFrame>
                                  <OptimizedImage
                                    src={seller.avatar}
                                    slot={IMAGE_SLOTS.AVATAR}
                                    aspectRatio="1/1"
                                    alt=""
                                    style={{ width: '100%', height: '100%' }}
                                    onError={(e) => {
                                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect fill='%23ffc400' width='120' height='120'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='40' font-weight='bold'%3EShop%3C/text%3E%3C/svg%3E";
                                    }}
                                  />
                                </SellerAvatarFrame>
                              ) : (
                                <SellerAvatarPlaceholder aria-hidden>
                                  {getShopInitials(shopLabel)}
                                </SellerAvatarPlaceholder>
                              )}
                              <VerifiedBadge>
                                <FaShieldAlt />
                              </VerifiedBadge>
                            </SellerAvatarContainer>
                            <SellerHeaderContent>
                              <SellerName>{shopLabel}</SellerName>
                              <SellerRating>
                                <StarRating rating={hasRating ? ratingVal : 0} size="14px" />
                                <RatingText>
                                  {hasRating ? ratingVal.toFixed(1) : 'New'}
                                </RatingText>
                              </SellerRating>
                            </SellerHeaderContent>
                          </SellerCardHeader>

                          <SellerCardBody>
                            <SellerStats>
                              <StatItem>
                                <StatIcon>📦</StatIcon>
                                <StatContent>
                                  <StatValue>{seller.productCount || seller.products?.length || 0}</StatValue>
                                  <StatLabel>Products</StatLabel>
                                </StatContent>
                              </StatItem>
                              {seller.totalSold && (
                                <StatItem>
                                  <StatIcon>✅</StatIcon>
                                  <StatContent>
                                    <StatValue>{seller.totalSold}</StatValue>
                                    <StatLabel>Sold</StatLabel>
                                  </StatContent>
                                </StatItem>
                              )}
                            </SellerStats>

                            {topProducts.length > 0 ? (
                              <MostOrderedSection>
                                <PreviewLabel>Most ordered</PreviewLabel>
                                <TopProductsRow>
                                  {topProducts.map((product) => {
                                    const pid = product.id || product._id;
                                    const imgSrc = getFeaturedSellerProductImage(product);
                                    const productUrl = generatePath(PATHS.PRODUCT_DETAIL, {
                                      id: String(pid),
                                    });
                                    return (
                                      <TopProductTile key={String(pid)}>
                                        <TopProductOpenButton
                                          type="button"
                                          aria-label={
                                            product.name
                                              ? `View ${product.name}`
                                              : 'View product'
                                          }
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            navigate(productUrl);
                                          }}
                                        >
                                          {imgSrc ? (
                                            <TopProductImageWrap>
                                              <OptimizedImage
                                                src={imgSrc}
                                                slot={IMAGE_SLOTS.TABLE_THUMB}
                                                aspectRatio="1/1"
                                                alt=""
                                                style={{ width: '100%', height: '100%' }}
                                                onError={(e) => {
                                                  e.target.src =
                                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23e2e8f0' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-size='24'%3EP%3C/text%3E%3C/svg%3E";
                                                }}
                                              />
                                            </TopProductImageWrap>
                                          ) : (
                                            <TopProductImageFallback aria-hidden>
                                              <FaStore />
                                            </TopProductImageFallback>
                                          )}
                                        </TopProductOpenButton>
                                        {product.name ? (
                                          <TopProductName title={product.name}>
                                            {truncateText(product.name, 40)}
                                          </TopProductName>
                                        ) : null}
                                      </TopProductTile>
                                    );
                                  })}
                                </TopProductsRow>
                              </MostOrderedSection>
                            ) : (
                              <SellerPreviewPlaceholder>
                                <FaStore aria-hidden />
                                <SellerPreviewPlaceholderText>
                                  No product photos yet — browse the shop for items
                                </SellerPreviewPlaceholderText>
                              </SellerPreviewPlaceholder>
                            )}
                          </SellerCardBody>

                          <SellerCardFooter>
                            <ViewShopButton>
                              View Shop <FaArrowRight />
                            </ViewShopButton>
                          </SellerCardFooter>
                        </SellerCard>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
                <button className="seller-swiper-prev" aria-label="Previous seller" type="button"><FaArrowLeft /></button>
                <button className="seller-swiper-next" aria-label="Next seller" type="button"><FaArrowRight /></button>
              </SellerSwiperWrap>
            )}
          </Container>
        </Section>
      ),
      recommended: (
        <Section key="recommended" $bg="#f8f9fa">
          <Container>
            <SectionHeader>
              <SectionTitle>Recommended for you</SectionTitle>
              <SectionLink to={PATHS.PRODUCTS}>See more <FaArrowRight /></SectionLink>
            </SectionHeader>
            <SectionDescription>
              Top-performing products shoppers in Ghana are buying right now.
            </SectionDescription>
            {isLoading ? (
              <LoadingGrid>
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </LoadingGrid>
            ) : recommendedProducts.length > 0 ? (
              <ProductGrid>
                {recommendedProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onClick={() => handleProductClick(product._id)}
                    showAddToCart
                  />
                ))}
              </ProductGrid>
            ) : null}
          </Container>
        </Section>
      ),
      recentlyViewed:
        recentlyViewedProducts.length > 0 ? (
          <Section key="recently-viewed">
            <Container>
              <SectionHeader>
                <SectionTitle>Recently viewed</SectionTitle>
                <SectionLink to={PATHS.PRODUCTS}>Continue shopping <FaArrowRight /></SectionLink>
              </SectionHeader>
              <SectionDescription>
                Pick up where you left off.
              </SectionDescription>
              <ProductGrid>
                {recentlyViewedProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onClick={() => handleProductClick(product._id)}
                    showAddToCart
                  />
                ))}
              </ProductGrid>
            </Container>
          </Section>
        ) : null,
    }),
    [
      categories,
      followedProducts,
      followedProductsTotal,
      handleProductClick,
      isCategoriesError,
      isCategoriesLoading,
      isFollowedProductsLoading,
      isLoading,
      isSellersLoading,
      recommendedProducts,
      recentlyViewedProducts,
      sellers,
      showFollowedSection,
    ]
  );

  return (
    <PageWrapper>
      {/* Hero Section */}
      <ViewInSection>
        <HeroSection>
        <Swiper
          modules={[Autoplay, EffectFade, Pagination, Navigation]}
          effect="fade"
          speed={1000}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          loop
          className="hero-swiper"
        >
          {heroSlides.map((slide) => {
            const formattedEnd = slide.endDate ? formatPromoEndDate(slide.endDate) : null;
            // CRITICAL: Always normalize the link to ensure no localhost URLs
            let normalizedSlideLink = slide.link ? resolveAdLink(slide.link) : PATHS.PRODUCTS;

            // Double-check: if somehow localhost still exists, replace it again
            if (normalizedSlideLink && typeof normalizedSlideLink === 'string') {
              if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(normalizedSlideLink)) {
                // Get production URL again
                let frontendUrl = import.meta.env.VITE_FRONTEND_URL;
                if (!frontendUrl) {
                  const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
                  if (apiUrl) {
                    frontendUrl = apiUrl.replace(/\/api\/?.*$/, '').replace(/\/$/, '');
                  }
                }
                if (!frontendUrl) {
                  frontendUrl = window.location.origin;
                }
                const cleanFrontendUrl = frontendUrl.trim().replace(/\/$/, '');
                try {
                  const url = new URL(normalizedSlideLink);
                  const path = url.pathname + url.search + url.hash;
                  normalizedSlideLink = `${cleanFrontendUrl}${path}`;
                } catch (error) {
                  const pathMatch = normalizedSlideLink.match(/^https?:\/\/[^\/]+(\/.*)?$/);
                  const path = pathMatch && pathMatch[1] ? pathMatch[1] : '/';
                  normalizedSlideLink = `${cleanFrontendUrl}${path}`;
                }
              }
            }

            // Determine if it's an external link (full URL) or internal (relative path)
            const external = normalizedSlideLink && /^https?:\/\//i.test(normalizedSlideLink);
            const ctaEl = external ? (
              <SlideButtonAsAnchor href={normalizedSlideLink} target="_blank" rel="noopener noreferrer">
                {slide.cta} <FaArrowRight />
              </SlideButtonAsAnchor>
            ) : (
              <SlideButton to={normalizedSlideLink}>
                {slide.cta} <FaArrowRight />
              </SlideButton>
            );
            return (
              <SwiperSlide key={slide.id}>
                <SlideContent>
                  <SlideImageBg>
                    <OptimizedImage
                      src={slide.image}
                      slot={IMAGE_SLOTS.HOME_HERO}
                      aspectRatio="21/9"
                      alt={slide.title}
                      objectFit="cover"
                    />
                  </SlideImageBg>
                  <SlideOverlay />
                  {slide.discountPercent > 0 ? (
                    <HeroDiscountBadge>-{slide.discountPercent}%</HeroDiscountBadge>
                  ) : null}
                  <Container>
                    <SlideTextContent>
                      <SlideSubtitle>{slide.subtitle}</SlideSubtitle>
                      <SlideTitle>{slide.title}</SlideTitle>
                      {ctaEl}
                    </SlideTextContent>
                  </Container>
                  {formattedEnd ? (
                    <SlideEndDate>Ends {formattedEnd}</SlideEndDate>
                  ) : null}
                </SlideContent>
              </SwiperSlide>
            );
          })}
        </Swiper>
        <button className="swiper-button-prev-custom" aria-label="Previous slide" type="button">
          <FaArrowLeft />
        </button>
        <button className="swiper-button-next-custom" aria-label="Next slide" type="button">
          <FaArrowRight />
        </button>
        </HeroSection>
      </ViewInSection>
      <MobileStickyActions aria-label="Quick shopping actions">
        <MobileActionLink
          to={PATHS.CATEGORIES}
          onClick={() =>
            trackHomepageEvent(
              HOMEPAGE_TRACK_EVENTS.MOBILE_STICKY_CLICK,
              'categories'
            )
          }
        >
          <MobileActionIcon>🗂️</MobileActionIcon>
          Categories
        </MobileActionLink>
        <MobileActionLink
          to={PATHS.PRODUCTS}
          onClick={() =>
            trackHomepageEvent(
              HOMEPAGE_TRACK_EVENTS.MOBILE_STICKY_CLICK,
              'products'
            )
          }
        >
          <MobileActionIcon>🛍️</MobileActionIcon>
          Shop
        </MobileActionLink>
        <MobileActionLink
          to={PATHS.SELLERS}
          onClick={() =>
            trackHomepageEvent(
              HOMEPAGE_TRACK_EVENTS.MOBILE_STICKY_CLICK,
              'sellers'
            )
          }
        >
          <MobileActionIcon>⭐</MobileActionIcon>
          Sellers
        </MobileActionLink>
      </MobileStickyActions>

      {/* SEO: H1 and intro - Ghana e-commerce keywords */}
      <ViewInSection delayMs={60}>
        <ValuePropSection>
        <Container>
          <HomepageH1>{heroCopy.title}</HomepageH1>
          <HomepageIntro>{heroCopy.intro}</HomepageIntro>
          {showVariantBadge && (
            <ExperimentBadge>
              Homepage Variant {homepageVariant}
            </ExperimentBadge>
          )}
          <QuickActionRow>
            <QuickActionCard
              to={PATHS.CATEGORIES}
              onClick={() =>
                trackHomepageEvent(
                  HOMEPAGE_TRACK_EVENTS.QUICK_ACTION_CLICK,
                  'categories'
                )
              }
            >
              <QuickActionIcon>🗂️</QuickActionIcon>
              <QuickActionTitle>Browse Categories</QuickActionTitle>
              <QuickActionText>Find products faster with curated departments.</QuickActionText>
            </QuickActionCard>
            <QuickActionCard
              to={PATHS.PRODUCTS}
              onClick={() =>
                trackHomepageEvent(
                  HOMEPAGE_TRACK_EVENTS.QUICK_ACTION_CLICK,
                  'products'
                )
              }
            >
              <QuickActionIcon>🛍️</QuickActionIcon>
              <QuickActionTitle>Shop All Products</QuickActionTitle>
              <QuickActionText>Compare top offers and get the best value.</QuickActionText>
            </QuickActionCard>
            <QuickActionCard
              to={PATHS.SELLERS}
              onClick={() =>
                trackHomepageEvent(
                  HOMEPAGE_TRACK_EVENTS.QUICK_ACTION_CLICK,
                  'sellers'
                )
              }
            >
              <QuickActionIcon>⭐</QuickActionIcon>
              <QuickActionTitle>Trusted Sellers</QuickActionTitle>
              <QuickActionText>Buy confidently from highly rated shops.</QuickActionText>
            </QuickActionCard>
          </QuickActionRow>
        </Container>
        </ValuePropSection>
      </ViewInSection>

      {/* Featured Promotion Banner */}
      {isAdsLoading ? (
        <ViewInSection delayMs={90}>
          <Section>
          <Container>
            <BannerSkeleton />
          </Container>
          </Section>
        </ViewInSection>
      ) : bannerAds.length > 0 ? (
        <ViewInSection delayMs={90}>
          <Section>
          <Container>
            <AdBanner ad={bannerAds[0]} />
          </Container>
          </Section>
        </ViewInSection>
      ) : null}

      {/* Features / Trust Section */}
      <ViewInSection delayMs={110}>
        <TrustSection>
        <Container>
          <TrustGrid>
            <TrustItem>
              <TrustIcon><FaShieldAlt /></TrustIcon>
              <TrustInfo>
                <h3>Secure Payment</h3>
                <p>100% secure payment</p>
              </TrustInfo>
            </TrustItem>
            <TrustItem>
              <TrustIcon><FaTruck /></TrustIcon>
              <TrustInfo>
                <h3>Fast Delivery</h3>
                <p>Within 24-48 hours</p>
              </TrustInfo>
            </TrustItem>
            <TrustItem>
              <TrustIcon><FaHeadset /></TrustIcon>
              <TrustInfo>
                <h3>24/7 Support</h3>
                <p>Dedicated support</p>
              </TrustInfo>
            </TrustItem>
          </TrustGrid>
        </Container>
        </TrustSection>
      </ViewInSection>

      {/* Deal of the Day: placed early for urgency and conversion */}
      <ViewInSection delayMs={130}>
        <DealOfTheDaySection
          dealProduct={dealOfTheDay.dealProduct}
          endOfDay={dealOfTheDay.endOfDay}
        />
      </ViewInSection>

      {sectionOrder.map((sectionKey, index) => (
        <ViewInSection key={sectionKey} delayMs={150 + index * 30}>
          {homepageSections[sectionKey]}
        </ViewInSection>
      ))}

      {/* EazShop Official Store Section */}
      <ViewInSection delayMs={260}>
        <EazShopSection />
      </ViewInSection>

      {/* Seller Testimonials */}
      <ViewInSection delayMs={280}>
        <TestimonialsSection />
      </ViewInSection>

      {/* All Products */}
      <ViewInSection delayMs={300}>
        <Section>
        <Container>
          <SectionHeader>
            <SectionTitle>All Products</SectionTitle>
            <SectionLink to={PATHS.PRODUCTS}>View All <FaArrowRight /></SectionLink>
          </SectionHeader>
          <SectionDescription>
            Explore the latest items across all categories.
            {showFollowedSection && followedSellerCount > 0
              ? ` You are following ${followedSellerCount} ${followedSellerCount === 1 ? 'seller' : 'sellers'}.`
              : ''}
          </SectionDescription>
          <FilterChipRow role="group" aria-label="Filter products">
            {PRODUCT_FILTERS.map((filter) => (
              <FilterChip
                key={filter.id}
                type="button"
                $active={activeProductFilter === filter.id}
                aria-pressed={activeProductFilter === filter.id}
                onClick={() => {
                  setActiveProductFilter(filter.id);
                  trackHomepageEvent(
                    HOMEPAGE_TRACK_EVENTS.FILTER_CLICK,
                    filter.id
                  );
                }}
              >
                {filter.label}
              </FilterChip>
            ))}
          </FilterChipRow>
          {isLoading ? (
            <LoadingGrid>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <SkeletonCard key={i} />
              ))}
            </LoadingGrid>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              title="No products found"
              message="No products match this filter yet. Try another option."
              action={
                <SectionLink to={PATHS.CATEGORIES}>Browse Categories</SectionLink>
              }
            />
          ) : (
            <ProductGrid>
              {filteredProducts.slice(0, 12).map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onClick={() => handleProductClick(product._id)}
                  showAddToCart
                />
              ))}
            </ProductGrid>
          )}
        </Container>
        </Section>
      </ViewInSection>

      <AdPopup
        ad={activePopupAd}
        open={Boolean(activePopupAd)}
        onDismiss={handlePopupDismiss}
      />
      <SellerAppPromoModal />
    </PageWrapper>
  );
};

// Styled Components
const PageWrapper = styled.div`
  background-color: #ffffff;
  min-height: 100vh;
  overflow-x: hidden;
`;

const ViewInWrapper = styled.div`
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transform: ${({ $isVisible }) =>
    $isVisible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.99)'};
  transition:
    opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: ${({ $delayMs }) => `${$delayMs}ms`};
  will-change: opacity, transform;
`;

const HomepageH1 = styled.h1`
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  color: var(--color-grey-900, #0f172a);
  text-align: center;
  margin: 0 0 0.65rem 0;
  line-height: 1.25;
  letter-spacing: -0.01em;
`;

const HomepageIntro = styled.p`
  font-size: clamp(0.95rem, 2vw, 1.05rem);
  color: var(--color-grey-600, #475569);
  text-align: center;
  max-width: 640px;
  margin: 0 auto;
  line-height: 1.55;
`;

const QuickActionRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 2rem;

  @media ${devicesMax.md} {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const QuickActionCard = styled(Link)`
  display: block;
  text-decoration: none;
  color: inherit;
  border-radius: 14px;
  border: 1px solid rgba(212, 136, 42, 0.2);
  background: #ffffff;
  padding: 1.25rem 1.25rem 1.1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  box-shadow: 0 2px 8px rgba(212, 136, 42, 0.06);

  &:hover {
    border-color: #D4882A;
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(212, 136, 42, 0.14);
    color: inherit;
  }
`;

const QuickActionTitle = styled.h3`
  margin: 0 0 0.3rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
`;

const QuickActionText = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
  line-height: 1.45;
`;

const ExperimentBadge = styled.span`
  display: inline-flex;
  margin: 1rem auto 0;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
`;

const HeroSection = styled.div`
  height: clamp(400px, 62vh, 620px);
  width: 100%;
  position: relative;
  overflow: hidden; /* Ensure content doesn't overflow */

  .hero-swiper {
    width: 100%;
    height: 100%;
    position: relative;
    
    .swiper-pagination-bullet {
      width: 12px;
      height: 12px;
      background: rgba(255, 255, 255, 0.85);
      opacity: 0.7;
      &.swiper-pagination-bullet-active {
        opacity: 1;
        transform: scale(1.2);
      }
    }
    
    .swiper-button-next, .swiper-button-prev {
      display: none !important; /* Hide default buttons completely */
      
      /* Remove any default text/content */
      &::after {
        display: none !important;
        content: none !important;
      }
      
      /* Hide any text spans */
      span {
        display: none !important;
      }
    }
  }
  
  /* Navigation buttons styled at HeroSection level since they're siblings of Swiper */
  .swiper-button-next-custom, .swiper-button-prev-custom {
    position: absolute !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    z-index: 999 !important; /* Very high z-index to ensure it's above all content */
    color: white !important;
    background: rgba(255,255,255,0.1) !important;
    width: 50px !important;
    height: 50px !important;
    border-radius: 50% !important;
    border: none !important;
    backdrop-filter: blur(5px) !important;
    transition: all 0.3s !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    margin: 0 !important;
    font-size: 0 !important;
    line-height: 0 !important;
    text-indent: -9999px !important;
    overflow: visible !important;
    pointer-events: auto !important;
    
    /* Ensure only SVG/icon is visible */
    svg {
      display: block !important;
      width: 20px !important;
      height: 20px !important;
      flex-shrink: 0 !important;
      position: relative !important;
      z-index: 1000 !important;
    }
    
    /* Hide any text content */
    &::before,
    &::after {
      display: none !important;
      content: none !important;
    }
    
    &:hover {
      background: rgba(255,255,255,0.3) !important;
    }
    &:active {
      transform: translateY(-50%) scale(0.95) !important;
    }
  }
  
  .swiper-button-prev-custom {
    left: 20px !important;
  }
  
  .swiper-button-next-custom {
    right: 20px !important;
  }
  
  @media (max-width: 768px) {
    .swiper-button-next-custom, .swiper-button-prev-custom {
      width: 40px !important;
      height: 40px !important;
      font-size: 16px !important;
      svg {
        width: 16px !important;
        height: 16px !important;
      }
    }
    .swiper-button-prev-custom {
      left: 10px !important;
    }
    .swiper-button-next-custom {
      right: 10px !important;
    }
  }

`;

const SlideContent = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
`;

const SlideImageBg = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const SlideOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%);
`;

const SlideTextContent = styled.div`
  position: relative;
  z-index: 2;
  max-width: 560px;
  color: white;
  padding: 1.5rem 1rem 1.5rem 3.75rem;

  @media ${devicesMax.md} {
    padding-left: 2.5rem;
  }

  @media ${devicesMax.sm} {
    padding-left: 2rem;
  }
`;

const SlideTitle = styled.h1`
  font-size: clamp(1.75rem, 5vw, 3.5rem);
  font-weight: 800;
  margin-bottom: 0.85rem;
  margin-left: 3.75rem;
  line-height: 1.08;
  color: #ffe9b6;
  opacity: 0;
  transform: translateY(30px);
  
  .swiper-slide-active & {
    animation: ${fadeInUp} 0.8s ease forwards 0.3s;
  }

  @media ${devicesMax.md} {
    font-size: 3rem;
    margin-left: 2.5rem;
  }
  @media ${devicesMax.sm} {
    font-size: 2.5rem;
    margin-left: 2rem;
  }
`;

const SlideSubtitle = styled.p`
  font-size: clamp(0.95rem, 2.4vw, 1.1rem);
  margin-bottom: 1.25rem;
  max-width: 48ch;
  color: #f8fafc;
  opacity: 0;
  transform: translateY(30px);
  
  .swiper-slide-active & {
    animation: ${fadeInUp} 0.8s ease forwards 0.5s;
  }
`;

const SlideButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0.8rem 1.25rem;
  background: #b66f16;
  color: #ffffff;
  font-weight: 600;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(30px);
  
  .swiper-slide-active & {
    animation: ${fadeInUp} 0.8s ease forwards 0.7s;
  }

  &:hover {
    background: #9f5f10;
    transform: translateY(-1px);
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.16);
    color: white;
  }
`;

const SlideButtonAsAnchor = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0.8rem 1.25rem;
  background: #b66f16;
  color: white;
  font-weight: 600;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(30px);
  
  .swiper-slide-active & {
    animation: ${fadeInUp} 0.8s ease forwards 0.7s;
  }

  &:hover {
    background: #9f5f10;
    transform: translateY(-1px);
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.16);
    color: white;
  }
`;

const HeroDiscountBadge = styled.div`
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  z-index: 3;
  padding: 0.85rem 1.5rem;
  font-size: 2.25rem;
  font-weight: 800;
  color: #ffffff;
  background: #dc2626;
  border: 3px double rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  letter-spacing: 0.05em;
  
  @media ${devicesMax.sm} {
    bottom: 1rem;
    right: 1rem;
    font-size: 1.75rem;
    padding: 0.65rem 1.2rem;
  }
`;

const SlideEndDate = styled.p`
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  margin: 0;
  padding: 0;
  font-size: 1.35rem;
  color: rgba(255, 255, 255, 0.95);
  text-align: left;
  z-index: 2;
  opacity: 0;
  transform: translateY(30px);
  
  .swiper-slide-active & {
    animation: ${fadeInUp} 0.8s ease forwards 0.6s;
  }
  
  @media ${devicesMax.sm} {
    bottom: 1.25rem;
    left: 1rem;
    font-size: 1.15rem;
  }
`;

const Section = styled.section`
  padding: 3.25rem 0;
  background: ${props => props.$bg || 'white'};

  @media ${devicesMax.md} {
    padding: 2.25rem 0;
  }
`;

const ValuePropSection = styled.section`
  padding: 2.75rem 0;
  background: linear-gradient(135deg, #fffbf2 0%, #fff9ee 50%, #fdf5e4 100%);
  border-bottom: 1px solid rgba(212, 136, 42, 0.12);
`;

const QuickActionIcon = styled.span`
  font-size: 1.75rem;
  display: block;
  margin-bottom: 0.6rem;
  line-height: 1;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.4rem;
  
  @media ${devicesMax.sm} {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.45rem, 3vw, 2rem);
  font-weight: 700;
  color: #1a1a1a;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -10px;
    width: 48px;
    height: 3px;
    background: linear-gradient(90deg, #D4882A 0%, #f0a845 100%);
    border-radius: 2px;
  }

  @media ${devicesMax.sm} {
    font-size: 1.5rem;
  }
`;

const SectionDescription = styled.p`
  margin: -0.5rem 0 1.75rem;
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const FilterChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin: 0 0 1.25rem;
`;

const FilterChip = styled.button`
  border: 1px solid ${({ $active }) => ($active ? '#d4882a' : '#d1d5db')};
  background: ${({ $active }) => ($active ? '#fff7ed' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#b45309' : '#334155')};
  border-radius: 999px;
  padding: 0.45rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #d4882a;
    color: #b45309;
  }
`;

const SectionLink = styled(Link)`
  color: #D4882A;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: gap 0.2s ease, color 0.2s ease;

  &:hover {
    gap: 10px;
    color: #B8711F;
  }
`;

const TrustSection = styled.div`
  padding: 1.75rem 0;
  background: #ffffff;
  border-top: 1px solid rgba(212, 136, 42, 0.15);
  border-bottom: 1px solid rgba(212, 136, 42, 0.15);
`;

const TrustGrid = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0;
  flex-wrap: wrap;

  @media ${devicesMax.sm} {
    gap: 0;
  }
`;

const TrustItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 2rem;
  text-align: left;
  flex: 1;
  min-width: 160px;
  max-width: 280px;
  border-right: 1px solid #f0e8d8;

  &:last-child {
    border-right: none;
  }

  @media ${devicesMax.sm} {
    border-right: none;
    border-bottom: 1px solid #f0e8d8;
    max-width: 100%;
    width: 100%;
    padding: 0.75rem 1rem;

    &:last-child {
      border-bottom: none;
    }
  }
`;

const TrustIcon = styled.div`
  font-size: 1.6rem;
  color: #D4882A;
  flex-shrink: 0;
  width: 2.4rem;
  height: 2.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 136, 42, 0.08);
  border-radius: 50%;
  padding: 0.45rem;
`;

const TrustInfo = styled.div`
  h3 {
    font-size: 0.95rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 0.1rem;
    white-space: nowrap;
  }
  p {
    color: #6b7280;
    font-size: 0.8rem;
    white-space: nowrap;
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 250px);
  gap: 1.5rem;

  @media ${devicesMax.md} {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 200px);
  }

  @media ${devicesMax.sm} {
    display: none;
  }
`;

/* Mobile-only horizontal pill row — matches the React Native home screen style */
const CategoryPillRow = styled.div`
  display: none;

  @media ${devicesMax.sm} {
    display: flex;
    flex-direction: row;
    gap: 0;
    overflow-x: auto;
    padding: 0.25rem 0 1rem;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const CategoryPillLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  text-decoration: none;
  color: inherit;
  flex-shrink: 0;
  padding: 0.25rem 0.9rem;
`;

const CategoryPillCircle = styled.div`
  width: 58px;
  height: 58px;
  border-radius: 50%;
  overflow: hidden;
  border: 1.5px solid #f3f4f6;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  ${CategoryPillLink}:hover & {
    border-color: #D4882A;
    box-shadow: 0 4px 12px rgba(212, 136, 42, 0.18);
  }
`;

const CategoryPillName = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  color: #374151;
  text-align: center;
  white-space: nowrap;
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;

  ${CategoryPillLink}:hover & {
    color: #D4882A;
  }
`;

const CategoryCard = styled(Link)`
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  display: block;
  text-decoration: none;
  grid-column: ${props => props.$size === 'large' ? 'span 2' : 'span 1'};
  grid-row: ${props => props.$size === 'large' ? 'span 2' : 'span 1'};
  
  @media ${devicesMax.sm} {
    grid-column: span 1;
    grid-row: span 1;
    height: 200px;
  }

`;

const CategoryBg = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
`;

const CategoryContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  color: white;
  
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  span {
    font-size: 0.9rem;
    opacity: 0.9;
    background: rgba(255,255,255,0.2);
    padding: 4px 12px;
    border-radius: 20px;
    backdrop-filter: blur(5px);
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 0;
  margin-bottom: 0.75rem;

  @media (min-width: 1600px) {
    grid-template-columns: repeat(5, 1fr);
    gap: 1.5rem;
  }

  @media (min-width: 1920px) {
    grid-template-columns: repeat(6, 1fr);
  }

  /* Tablet: 3 columns (513px – 1229px) */
  @media ${devicesMax.md} {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.85rem;
  }

  /* Mobile: 2 columns (≤ 512px) */
  @media ${devicesMax.xs} {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
`;

const LoadingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;

  /* Tablet: 3 columns */
  @media ${devicesMax.md} {
    grid-template-columns: repeat(3, 1fr);
  }

  /* Mobile: 2 columns */
  @media ${devicesMax.xs} {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const SkeletonCard = styled.div`
  height: 350px;
  background: #f0f0f0;
  border-radius: 16px;
  animation: ${shimmer} 2s infinite linear;
  background: linear-gradient(to right, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 1000px 100%;
`;

const BannerSkeleton = styled(SkeletonCard)`
  height: 240px;
`;

const CarouselSkeleton = styled(SkeletonCard)`
  height: 220px;
`;

// Seller Card Components
const ViewShopButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  font-size: 1.4rem;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;

  svg {
    transition: transform 0.3s ease;
  }
`;

const SellerAvatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #ffc400 0%, #ffb300 100%);
`;

const SellerCard = styled.div`
  position: relative;
  background: white;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #d4882a;
    outline-offset: 2px;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
    border-color: rgba(255, 196, 0, 0.3);

    ${ViewShopButton} {
      background: linear-gradient(135deg, #ffc400 0%, #ffb300 100%);
      transform: translateX(5px);
      color: white;
      border-color: rgba(255, 196, 0, 0.3);

      svg {
        transform: translateX(3px);
      }
    }

  }
`;

const SellerCardHeader = styled.div`
  position: relative;
  padding: 1.15rem 1rem 0.95rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-bottom: 1px solid #f1f5f9;
`;

const SellerAvatarContainer = styled.div`
  position: relative;
  margin-bottom: 0.65rem;
  display: flex;
  justify-content: center;
`;

const SellerAvatarFrame = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  flex-shrink: 0;

  & > div {
    width: 100%;
    height: 100%;
  }
`;

const SellerAvatarPlaceholder = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(145deg, #d4882a 0%, #ffc400 55%, #e29800 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.65rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  border: 4px solid white;
  box-shadow: 0 8px 24px rgba(212, 136, 42, 0.35);
  flex-shrink: 0;
`;

const SellerPreviewPlaceholder = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-height: 4.5rem;
  padding: 0.75rem 0.85rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #fff7e6 0%, #fef3c7 42%, #f1f5f9 100%);
  border: 1px dashed rgba(212, 136, 42, 0.4);
  color: #92400e;

  svg {
    flex-shrink: 0;
    font-size: 1.25rem;
    opacity: 0.9;
  }

  ${SellerCard}:hover & {
    border-color: rgba(212, 136, 42, 0.55);
    background: linear-gradient(135deg, #fffbeb 0%, #fef9c3 40%, #f8fafc 100%);
  }
`;

const SellerPreviewPlaceholderText = styled.span`
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.4;
  color: #78350f;
`;

const VerifiedBadge = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
`;

const SellerHeaderContent = styled.div`
  width: 100%;
`;

const SellerName = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.45rem 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SellerRating = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const RatingText = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
`;

const SellerCardBody = styled.div`
  padding: 0.95rem 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`;

const SellerStats = styled.div`
  display: flex;
  gap: 0.55rem;
  justify-content: space-around;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  padding: 0.7rem;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;

  ${SellerCard}:hover & {
    background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
    border-color: rgba(255, 196, 0, 0.2);
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.span`
  font-size: 1.15rem;
  line-height: 1;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const StatValue = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
`;

const StatLabel = styled.span`
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
`;

const PreviewLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MostOrderedSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
`;

const TopProductsRow = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: stretch;
`;

const TopProductTile = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const TopProductOpenButton = styled.button`
  appearance: none;
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;
  cursor: pointer;
  border-radius: 10px;
  display: block;
  width: 100%;
  text-align: left;

  &:focus-visible {
    outline: 2px solid #d4882a;
    outline-offset: 2px;
  }
`;

const TopProductImageWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  max-height: 72px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  transition: border-color 0.3s ease;

  ${SellerCard}:hover & {
    border-color: rgba(255, 196, 0, 0.45);
  }
`;

const TopProductImageFallback = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  max-height: 72px;
  border-radius: 10px;
  border: 2px dashed #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 1.35rem;
  background: #f8fafc;
`;

const TopProductName = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  color: #475569;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const SellerCardFooter = styled.div`
  padding: 0.85rem 1rem;
  border-top: 1px solid #f1f5f9;
  background: #fafbfc;
`;

const SellerSwiperWrap = styled.div`
  position: relative;

  .seller-swiper {
    padding-bottom: 0.5rem;

    .swiper-slide {
      height: auto;
      display: flex;
      flex-direction: column;
    }
  }

  .seller-swiper-prev,
  .seller-swiper-next {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    color: #374151;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.10);
    transition: all 0.2s ease;
    font-size: 0;

    svg {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }

    &:hover {
      background: #D4882A;
      color: #ffffff;
      border-color: #D4882A;
    }

    &.swiper-button-disabled {
      opacity: 0.35;
      cursor: default;
    }

    @media ${devicesMax.md} {
      display: none;
    }
  }

  .seller-swiper-prev {
    left: -18px;
  }

  .seller-swiper-next {
    right: -18px;
  }
`;

const MobileStickyActions = styled.nav`
  position: sticky;
  bottom: 0;
  z-index: 20;
  display: none;
  grid-template-columns: repeat(3, 1fr);
  background: rgba(255, 255, 255, 0.96);
  border-top: 1px solid #e2e8f0;
  backdrop-filter: blur(8px);

  @media ${devicesMax.md} {
    display: grid;
  }
`;

const MobileActionLink = styled(Link)`
  text-decoration: none;
  color: #374151;
  font-size: 0.72rem;
  font-weight: 700;
  text-align: center;
  padding: 0.55rem 0.25rem calc(0.55rem + env(safe-area-inset-bottom));
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  letter-spacing: 0.01em;

  &:last-child {
    border-right: none;
  }

  &:hover {
    color: #D4882A;
    background: #fff7ed;
  }
`;

const MobileActionIcon = styled.span`
  font-size: 1.1rem;
  line-height: 1;
`;

export default HomePage;