import { useCallback, useMemo, useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaArrowRight, FaArrowLeft, FaStar, FaShieldAlt, FaTruck, FaHeadset, FaEnvelope } from "react-icons/fa";

import useProduct from '../../shared/hooks/useProduct';
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

  // Resolve ad link to full URL for external or path for internal
  const resolveAdLink = useCallback((link) => {
    if (!link || typeof link !== "string") return PATHS.PRODUCTS;
    const raw = link.trim();
    if (/^https?:\/\//i.test(raw)) return raw;
    return raw.startsWith("/") ? raw : `/${raw}`;
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
      {/* Hero Section */}
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
            const external = isExternalLink(slide.link);
            const ctaEl = external ? (
              <SlideButtonAsAnchor href={slide.link} target="_blank" rel="noopener noreferrer">
                {slide.cta} <FaArrowRight />
              </SlideButtonAsAnchor>
            ) : (
              <SlideButton to={slide.link}>
                {slide.cta} <FaArrowRight />
              </SlideButton>
            );
            return (
              <SwiperSlide key={slide.id}>
                <SlideContent>
                  <SlideImageBg style={{ backgroundImage: `url(${slide.image})` }} />
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

      {/* Featured Promotion Banner */}
      {isAdsLoading ? (
        <Section>
          <Container>
            <BannerSkeleton />
          </Container>
        </Section>
      ) : bannerAds.length > 0 ? (
        <Section>
          <Container>
            <AdBanner ad={bannerAds[0]} />
          </Container>
        </Section>
      ) : null}

      {/* Features / Trust Section */}
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

      {/* Categories Grid */}
      <Section>
        <Container>
          <SectionHeader>
            <SectionTitle>Browse Categories</SectionTitle>
            <SectionLink to={PATHS.CATEGORIES}>View All Categories <FaArrowRight /></SectionLink>
          </SectionHeader>
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
            <CategoryGrid>
              {categories.map((cat) => (
                <CategoryCard key={cat.id} $size={cat.size} to={`${PATHS.CATEGORIES}/${cat.id}`}>
                  <CategoryBg $image={cat.image} />
                  <CategoryContent>
                    <h3>{cat.name}</h3>
                    <span>{cat.count}</span>
                  </CategoryContent>
                </CategoryCard>
              ))}
            </CategoryGrid>
          )}
        </Container>
      </Section>

      {/* Trending Sellers */}
      <Section $bg="#f8f9fa">
        <Container fluid>
          <SectionHeader>
            <SectionTitle>Trending Now</SectionTitle>
            <SectionLink to={PATHS.SELLERS}>View All Sellers <FaArrowRight /></SectionLink>
          </SectionHeader>

          {isSellersLoading ? (
            <LoadingGrid>
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </LoadingGrid>
          ) : sellers.length === 0 ? (
            <EmptyState>
              <p>No trending sellers available at the moment.</p>
            </EmptyState>
          ) : (
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              navigation
              autoplay={{ delay: 3000, disableOnInteraction: true }}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              style={{ padding: "1rem 0.5rem" }}
            >
              {sellers.map((seller) => {
                const productImages = seller.products
                  ?.flatMap((product) => product.images || [])
                  ?.filter((img) => img)
                  ?.slice(0, 3) || [];

                return (
                  <SwiperSlide key={seller.id || seller._id}>
                    <SellerCard to={`${PATHS.SELLERS}/${seller.id || seller._id}`}>
                      <SellerCardHeader>
                        <SellerAvatarContainer>
                          <SellerAvatar
                            src={seller.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect fill='%23ffc400' width='120' height='120'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='40' font-weight='bold'%3EShop%3C/text%3E%3C/svg%3E"}
                            alt={seller.shopName || seller.name}
                            onError={(e) => {
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect fill='%23ffc400' width='120' height='120'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='40' font-weight='bold'%3EShop%3C/text%3E%3C/svg%3E";
                            }}
                          />
                          <VerifiedBadge>
                            <FaShieldAlt />
                          </VerifiedBadge>
                        </SellerAvatarContainer>
                        <SellerHeaderContent>
                          <SellerName>{seller.shopName || seller.name}</SellerName>
                          <SellerRating>
                            <StarRating rating={seller.rating || seller.ratings?.average || 0} size="14px" />
                            <RatingText>
                              {(seller.rating || seller.ratings?.average || 0).toFixed(1)}
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
                        
                        {productImages.length > 0 && (
                          <ProductPreviewSection>
                            <PreviewLabel>Featured Products</PreviewLabel>
                            <ProductPreview>
                              {productImages.map((image, index) => (
                                <PreviewImageWrapper key={index}>
                                  <PreviewImage
                                    src={image}
                                    alt={`Product ${index + 1}`}
                                  onError={(e) => {
                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23e2e8f0' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-size='24'%3EP%3C/text%3E%3C/svg%3E";
                                  }}
                                  />
                                </PreviewImageWrapper>
                              ))}
                              {productImages.length < 3 && (
                                <MoreProductsIndicator>
                                  +{Math.max(0, (seller.productCount || seller.products?.length || 0) - productImages.length)}
                                </MoreProductsIndicator>
                              )}
                            </ProductPreview>
                          </ProductPreviewSection>
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
          )}
        </Container>
      </Section>

      {/* EazShop Official Store Section */}
      <EazShopSection />

      {/* Deal of the Day: data-driven, best discount or promotionKey deal-of-the-day, countdown to midnight */}
      <DealOfTheDaySection
        dealProduct={dealOfTheDay.dealProduct}
        endOfDay={dealOfTheDay.endOfDay}
      />

      {/* All Products */}
      <Section>
        <Container>
          <SectionHeader>
            <SectionTitle>All Products</SectionTitle>
            <SectionLink to={PATHS.PRODUCTS}>View All <FaArrowRight /></SectionLink>
          </SectionHeader>
          {isLoading ? (
            <LoadingGrid>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <SkeletonCard key={i} />
              ))}
            </LoadingGrid>
          ) : products.length === 0 ? (
            <EmptyState>
              <p>No products available at the moment.</p>
            </EmptyState>
          ) : (
            <ProductGrid>
              {products.map((product) => (
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

      {/* Newsletter */}
      <NewsletterSection>
        <Container>
          <NewsletterContent>
            <NewsletterIcon><FaEnvelope /></NewsletterIcon>
            <h2>Subscribe to our Newsletter</h2>
            <p>Get the latest updates on new products and upcoming sales</p>
            <NewsletterForm>
              <input type="email" placeholder="Enter your email address" />
              <button>Subscribe</button>
            </NewsletterForm>
          </NewsletterContent>
        </Container>
      </NewsletterSection>
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

const HeroSection = styled.div`
  height: 600px;
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
      background: white;
      opacity: 0.5;
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

  @media ${devicesMax.md} {
    height: 500px;
  }
  @media ${devicesMax.sm} {
    height: 400px;
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
  background-size: cover;
  background-position: center;
  transition: transform 8s ease;
  
  .swiper-slide-active & {
    transform: scale(1.1);
  }
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
  max-width: 600px;
  color: white;
  padding: 2rem;
`;

const SlideTitle = styled.h1`
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 1rem;
  margin-left: 1.5rem;
  line-height: 1.1;
  color: #ffd700;
  opacity: 0;
  transform: translateY(30px);
  
  .swiper-slide-active & {
    animation: ${fadeInUp} 0.8s ease forwards 0.3s;
  }

  @media ${devicesMax.md} {
    font-size: 3rem;
    margin-left: 1.25rem;
  }
  @media ${devicesMax.sm} {
    font-size: 2.5rem;
    margin-left: 1rem;
  }
`;

const SlideSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
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
  padding: 1rem 2.5rem;
  background: white;
  color: black;
  font-weight: 600;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(30px);
  
  .swiper-slide-active & {
    animation: ${fadeInUp} 0.8s ease forwards 0.7s;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(255,255,255,0.2);
    gap: 15px;
  }
`;

const SlideButtonAsAnchor = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 1rem 2.5rem;
  background: white;
  color: black;
  font-weight: 600;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(30px);
  
  .swiper-slide-active & {
    animation: ${fadeInUp} 0.8s ease forwards 0.7s;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(255,255,255,0.2);
    gap: 15px;
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
  padding: 5rem 0;
  background: ${props => props.$bg || 'white'};
  
  @media ${devicesMax.md} {
    padding: 3rem 0;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  
  @media ${devicesMax.sm} {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -10px;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border-radius: 2px;
  }

  @media ${devicesMax.sm} {
    font-size: 2rem;
  }
`;

const SectionLink = styled(Link)`
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: gap 0.3s;
  
  &:hover {
    gap: 12px;
    color: #764ba2;
  }
`;

const TrustSection = styled.div`
  padding: 3rem 0;
  background: white;
  border-bottom: 1px solid #eee;
`;

const TrustGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: #f8f9fa;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
  }
`;

const TrustIcon = styled.div`
  font-size: 2rem;
  color: #667eea;
`;

const TrustInfo = styled.div`
  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 0.2rem;
  }
  p {
    color: #666;
    font-size: 0.9rem;
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
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
`;

const CategoryCard = styled(Link)`
  position: relative;
  border-radius: 20px;
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

  &:hover {
    div:first-child {
      transform: scale(1.1);
    }
  }
`;

const CategoryBg = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$image});
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;
`;

const CategoryContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
  background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
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
  grid-template-columns: repeat(4, 1fr); /* 4 cards per row */
  gap: 1.5rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr); /* 3 cards on medium screens */
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr); /* 2 cards on tablets */
    gap: 1rem;
  }
  
  @media ${devicesMax.sm} {
    grid-template-columns: repeat(2, 1fr); /* 2 cards on mobile */
    gap: 0.75rem;
  }
`;

const NewsletterSection = styled.section`
  padding: 5rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
`;

const NewsletterContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
  
  h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 2.5rem;
    opacity: 0.9;
    font-size: 1.1rem;
  }
`;

const NewsletterIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  animation: ${float} 3s ease-in-out infinite;
`;

const NewsletterForm = styled.div`
  display: flex;
  gap: 10px;
  background: rgba(255,255,255,0.1);
  padding: 10px;
  border-radius: 50px;
  backdrop-filter: blur(10px);
  
  input {
    flex: 1;
    background: transparent;
    border: none;
    padding: 0 1.5rem;
    color: white;
    font-size: 1rem;
    outline: none;
    
    &::placeholder {
      color: rgba(255,255,255,0.7);
    }
  }
  
  button {
    padding: 1rem 2.5rem;
    background: white;
    color: #764ba2;
    border: none;
    border-radius: 40px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      transform: scale(1.05);
    }
  }
  
  @media ${devicesMax.sm} {
    flex-direction: column;
    background: transparent;
    gap: 1rem;
    
    input {
      background: rgba(255,255,255,0.1);
      padding: 1rem;
      border-radius: 10px;
      text-align: center;
    }
    
    button {
      width: 100%;
    }
  }
`;

const LoadingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  
  @media ${devicesMax.md} {
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

const SellerCard = styled(Link)`
  position: relative;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
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

    ${SellerAvatar} {
      transform: scale(1.05);
    }
  }
`;

const SellerCardHeader = styled.div`
  position: relative;
  padding: 2rem 2rem 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-bottom: 1px solid #f1f5f9;
`;

const SellerAvatarContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
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
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.75rem 0;
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
  font-size: 1.4rem;
  font-weight: 600;
  color: #475569;
`;

const SellerCardBody = styled.div`
  padding: 1.5rem 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SellerStats = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-around;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;

  ${SellerCard}:hover & {
    background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
    border-color: rgba(255, 196, 0, 0.2);
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.span`
  font-size: 2rem;
  line-height: 1;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const StatValue = styled.span`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
`;

const StatLabel = styled.span`
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 500;
`;

const ProductPreviewSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PreviewLabel = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProductPreview = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const PreviewImageWrapper = styled.div`
  position: relative;
  width: 70px;
  height: 70px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  flex-shrink: 0;

  ${SellerCard}:hover & {
    border-color: rgba(255, 196, 0, 0.4);
    transform: scale(1.05);
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const MoreProductsIndicator = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffc400 0%, #ffb300 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
  font-weight: 700;
  border: 2px solid rgba(255, 196, 0, 0.3);
  flex-shrink: 0;
`;

const SellerCardFooter = styled.div`
  padding: 1.5rem 2rem;
  border-top: 1px solid #f1f5f9;
  background: #fafbfc;
`;

export default HomePage;