import { useCallback, useMemo, useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaArrowRight, FaArrowLeft, FaStar, FaShieldAlt, FaTruck, FaHeadset } from "react-icons/fa";

import useProduct from '../../shared/hooks/useProduct';
import useAuth from '../../shared/hooks/useAuth';
import { useFollowedSellerProducts } from '../../shared/hooks/useFollow';
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
import DealOfTheDaySection from '../home/DealOfTheDaySection';
import { useDealOfTheDay } from '../../shared/hooks/useDealOfTheDay';
import SaiisaiStories from '../home/SaiisaiStories';

// New Design System Components
import HeroSection from './components/HeroSection';
import CategoriesSection from './components/CategoriesSection';
import FeaturedProducts from './components/FeaturedProducts';
import TrendingSellers from './components/TrendingSellers';
import BannerSection from './components/BannerSection';
import TrustSection from './components/TrustSection';

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const HomePage = () => {
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
  const { recordProductView } = useAnalytics();
  const { data: productsData, isLoading } = getProducts;
  const { userData, isAuthenticated } = useAuth();
  const user = useMemo(() => {
    if (!userData) return null;
    if (userData?.id || userData?._id) return userData;
    return userData?.user || userData?.data || null;
  }, [userData]);
  const showFollowedSection = Boolean(isAuthenticated || user);
  const { products: followedProducts, isLoading: isFollowedProductsLoading, total: followedProductsTotal } = useFollowedSellerProducts(12);
  const { data: sellersData, isLoading: isSellersLoading } = useGetFeaturedSellers({ limit: 8 });
  const {
    bannerAds,
    carouselAds,
    popupAds,
    isLoading: isAdsLoading,
  } = useAds();

  const [activePopupAd, setActivePopupAd] = useState(null);

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

  const handleProductClick = useCallback((productId) => {
    const sessionId = getOrCreateSessionId();
    if (navigator.sendBeacon) {
      const data = new Blob([JSON.stringify({ productId, sessionId })], { type: "application/json" });
      navigator.sendBeacon("/analytics/product-view", data);
    } else {
      recordProductView.mutate({ productId, sessionId });
    }
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

        // First, check API URL - if it contains api.saiisai.com, use saiisai.com
        const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
        if (apiUrl && apiUrl.includes('api.saiisai.com')) {
          replacementUrl = 'https://saiisai.com';
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
        // Debug log
        console.log('[resolveAdLink] Normalized localhost URL (production):', {
          original: raw,
          normalized,
          replacementUrl,
          isProduction,
          currentOrigin
        });
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
    return parentCategories.slice(0, 5).map((cat, index) => ({
      id: cat._id,
      name: cat.name,
      image: cat.image || [
        "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
        "https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=800&q=80",
        "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80",
        "https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800&q=80",
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80"
      ][index % 5],
      count: `${Math.floor(Math.random() * 2000) + 500}+ Items`, // Placeholder count
      size: index === 0 ? "large" : "medium"
    }));
  }, [categoriesData]);

  return (
    <PageWrapper>
      <HeroSection
        heroSlides={heroSlides}
        resolveAdLink={resolveAdLink}
        formatPromoEndDate={formatPromoEndDate}
      />

      <BannerSection
        bannerAds={bannerAds}
        isLoading={isAdsLoading}
      />

      {/* Features / Trust Section */}
      <TrustSection />

      <CategoriesSection
        categories={categories}
        isLoading={isCategoriesLoading}
        isError={isCategoriesError}
      />

      <TrendingSellers
        sellers={sellers}
        isLoading={isSellersLoading}
      />

      <FeaturedProducts
        products={followedProducts}
        isLoading={isFollowedProductsLoading}
        title="From sellers you follow"
        link={PATHS.FOLLOWED}
        handleProductClick={handleProductClick}
      />

      <EazShopSection />

      <DealOfTheDaySection
        dealProduct={dealOfTheDay.dealProduct}
        endOfDay={dealOfTheDay.endOfDay}
      />

      <SaiisaiStories />

      <FeaturedProducts
        products={products}
        isLoading={isLoading}
        title="All Products"
        link={PATHS.PRODUCTS}
        handleProductClick={handleProductClick}
      />

      <AdPopup
        ad={activePopupAd}
        open={Boolean(activePopupAd)}
        onDismiss={handlePopupDismiss}
      />
    </PageWrapper>
  );
};

// Styled Components
const PageWrapper = styled.div`
  background-color: #ffffff;
  min-height: 100vh;
  overflow-x: hidden;
`;

export default HomePage;