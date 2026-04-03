import { useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";
import { FaHeart, FaShoppingBag, FaArrowRight } from "react-icons/fa";
import { useWishlist } from '../../shared/hooks/useWishlist';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import seoConfig from '../../shared/config/seoConfig';
import WishlistProductCard from './WishlistProductCard';
import { LoadingState } from '../../components/loading';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const WishlistPage = () => {
  useDynamicPageTitle({
    title: seoConfig.wishlist.title,
    description: seoConfig.wishlist.description,
    keywords: seoConfig.wishlist.keywords,
    image: seoConfig.wishlist.image,
    type: seoConfig.wishlist.type,
    canonical: seoConfig.wishlist.canonical,
    jsonLd: seoConfig.wishlist.jsonLd,
    defaultTitle: seoConfig.wishlist.title,
    defaultDescription: seoConfig.wishlist.description,
  });
  const { data: wishlistData, isLoading, error } = useWishlist();

  const wishlist = useMemo(() => {
    if (!wishlistData) return [];
    const wishlistItems = wishlistData?.data?.wishlist?.products || wishlistData?.data?.products || [];
    return wishlistItems
      .filter(Boolean)
      .map((item) => {
        if (item && item.product && typeof item.product === 'object') return item.product;
        return item;
      })
      .filter(Boolean);
  }, [wishlistData]);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState message="Loading your wishlist..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <EmptyBox>
          <EmptyIconWrap style={{ background: '#fff1f0' }}>⚠️</EmptyIconWrap>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyText>{error.message || "We couldn't load your wishlist. Please try again."}</EmptyText>
          <ShopButton to="/">Continue Shopping <FaArrowRight /></ShopButton>
        </EmptyBox>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* ── Banner ───────────────────────────────────────────── */}
      <PageBanner>
        <BannerOverlay />
        <BannerInner>
          <BannerIcon><FaHeart /></BannerIcon>
          <BannerTextGroup>
            <BannerTitle>My Wishlist</BannerTitle>
            <BannerSub>
              {wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''} — ready to order when you are
            </BannerSub>
          </BannerTextGroup>
        </BannerInner>
      </PageBanner>

      <ContentWrap>
        {wishlist.length === 0 ? (
          <EmptyBox>
            <EmptyIconWrap>
              <FaHeart />
            </EmptyIconWrap>
            <EmptyTitle>Your wishlist is empty</EmptyTitle>
            <EmptyText>
              Tap the heart icon on any product to save it here for later.
            </EmptyText>
            <ShopButton to="/">
              <FaShoppingBag /> Browse Products
            </ShopButton>
          </EmptyBox>
        ) : (
          <>
            <WishlistGrid>
              {wishlist.map((product) => (
                <WishlistProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}
            </WishlistGrid>

            <BottomRow>
              <ContinueLink to="/">
                <FaShoppingBag /> Continue Shopping
              </ContinueLink>
            </BottomRow>
          </>
        )}
      </ContentWrap>
    </PageContainer>
  );
};

export default WishlistPage;

/* ─── Styled Components ──────────────────────────────────── */

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #f9f7f4;
  font-family: "Inter", sans-serif;
`;

/* ── Banner ─────────────────── */
const PageBanner = styled.div`
  position: relative;
  background: linear-gradient(135deg, #1a1f2e 0%, #2d3444 50%, #1a2035 100%);
  overflow: hidden;
  padding: 2.5rem 2rem;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(212,136,42,0.12) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
  }
`;

const BannerOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(212,136,42,0.15) 0%, transparent 60%);
  pointer-events: none;
`;

const BannerInner = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  animation: ${fadeUp} 0.4s ease;
`;

const BannerIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(212,136,42,0.2);
  border: 2px solid rgba(212,136,42,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #D4882A;
  flex-shrink: 0;
`;

const BannerTextGroup = styled.div``;

const BannerTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.25rem 0;
  line-height: 1.2;

  @media (max-width: 480px) {
    font-size: 1.4rem;
  }
`;

const BannerSub = styled.p`
  font-size: 0.9rem;
  color: rgba(255,255,255,0.65);
  margin: 0;
`;

/* ── Content ─────────────────── */
const ContentWrap = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
`;

const WishlistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  width: 100%;
  align-items: stretch;
  animation: ${fadeUp} 0.45s ease 0.1s both;

  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
    gap: 1rem;
  }

  @media (min-width: 768px) {
    gap: 1.15rem;
  }

  @media (min-width: 1200px) {
    gap: 1.25rem;
  }
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2.5rem;
`;

const ContinueLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  border: 2px solid #D4882A;
  border-radius: 30px;
  color: #D4882A;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s ease;
  background: transparent;

  &:hover {
    background: #D4882A;
    color: #ffffff;
  }
`;

/* ── Empty / Error State ─────── */
const EmptyBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem 1.5rem;
  max-width: 480px;
  margin: 3rem auto;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #f0e8d8;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  animation: ${fadeUp} 0.4s ease;
`;

const EmptyIconWrap = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(212,136,42,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #D4882A;
  margin-bottom: 1.5rem;
`;

const EmptyTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a1f2e;
  margin: 0 0 0.5rem 0;
`;

const EmptyText = styled.p`
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0 0 1.75rem 0;
  line-height: 1.55;
`;

const ShopButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: #D4882A;
  color: #ffffff;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.2s ease;

  &:hover {
    background: #B8711F;
  }
`;
