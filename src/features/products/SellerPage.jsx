import { FaHeart, FaShoppingBag, FaMapMarkerAlt, FaCalendarAlt, FaStar, FaShare } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import { spin } from "../../shared/styles/animations";
import { useGetSellerProfile } from '../../shared/hooks/useSeller';
import useProduct from '../../shared/hooks/useProduct';
import StarRating from '../../shared/components/StarRating';
import { useEffect, useMemo, useRef, useState } from "react";
import { useToggleFollow, useGetSellersFollowers } from '../../shared/hooks/useFollow';
import { useAddHistoryItem } from '../../shared/hooks/useBrowserhistory';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import logger from '../../shared/utils/logger';
import { getProductTotalStock } from '../../shared/utils/productHelpers';
import { useGetBestSellers } from '../../shared/hooks/useBestSellers';
import { ErrorState } from '../../components/loading';
import Container from '../../shared/components/Container';
import ProductCard from '../../shared/components/ProductCard';
import Grid from '../../components/ui/Grid';

const PublicSellerProfile = () => {
  const { id: sellerId } = useParams();

  // Guard against missing sellerId
  if (!sellerId) {
    return (
      <Container>
        <ErrorState
          title="Seller ID Missing"
          message="Seller ID is required. Please go back and try again."
        />
      </Container>
    );
  }

  const { useGetAllPublicProductBySeller } = useProduct();
  const [imageError, setImageError] = useState(false);

  const {
    data: sellerData,
    isLoading: isSellerLoading,
    error: sellerError,
  } = useGetSellerProfile(sellerId);

  const { toggleFollow, isFollowing, isLoading: isFollowLoading } = useToggleFollow(sellerId);
  const { data: followerData, isLoading: isFollowersLoading } = useGetSellersFollowers(sellerId);
  const { data: productsData, isLoading: isProductsLoading, error: productsError } = useGetAllPublicProductBySeller(sellerId);

  // Get similar sellers (best sellers excluding current seller)
  const { data: bestSellersData, isLoading: isSimilarSellersLoading } = useGetBestSellers({
    sort: 'orders',
    page: 1,
    limit: 10,
  });

  const products = useMemo(() => {
    console.log("🔍 [SellerPage] productsData:", productsData);
    console.log("🔍 [SellerPage] productsError:", productsError);
    console.log("🔍 [SellerPage] sellerId:", sellerId);

    if (!productsData) {
      console.log("⚠️ [SellerPage] No productsData");
      return [];
    }
    if (Array.isArray(productsData)) {
      console.log("✅ [SellerPage] productsData is array:", productsData.length);
      return productsData;
    }
    // Handle nested structures
    if (productsData.data?.products && Array.isArray(productsData.data.products)) {
      console.log("✅ [SellerPage] Found products at productsData.data.products:", productsData.data.products.length);
      return productsData.data.products;
    }
    if (productsData.products && Array.isArray(productsData.products)) {
      console.log("✅ [SellerPage] Found products at productsData.products:", productsData.products.length);
      return productsData.products;
    }
    console.warn("⚠️ [SellerPage] Could not extract products array");
    return [];
  }, [productsData, productsError, sellerId]);

  const seller = useMemo(() => {
    return sellerData?.data?.data?.data || sellerData?.data?.seller || sellerData?.seller || sellerData?.data?.data;
  }, [sellerData]);

  // SEO - Set page title based on seller data
  useDynamicPageTitle({
    title: "Seller Store",
    dynamicTitle: seller?.shopName && `${seller.shopName} — Shop on Saiisai`,
    dynamicDescription: seller?.description || seller?.bio,
    defaultTitle: "Saiisai",
    defaultDescription: "Shop from trusted sellers on Saiisai",
  });

  const followers = useMemo(() => {
    return followerData?.data.follows || [];
  }, [followerData]);

  // Get unique categories from seller's products
  const sellerCategories = useMemo(() => {
    if (!products || products.length === 0) return [];
    const categories = new Set();
    products.forEach((product) => {
      if (product?.category?._id) categories.add(product.category._id);
      if (product?.parentCategory?._id) categories.add(product.parentCategory._id);
      if (product?.category) categories.add(product.category);
      if (product?.parentCategory) categories.add(product.parentCategory);
    });
    return Array.from(categories);
  }, [products]);

  // Get similar sellers (filter out current seller and limit to 6)
  const similarSellers = useMemo(() => {
    if (!bestSellersData?.sellers) return [];
    return bestSellersData.sellers
      .filter((s) => s._id !== sellerId && s.id !== sellerId)
      .slice(0, 6);
  }, [bestSellersData, sellerId]);

  const hasRecordedHistory = useRef(false);
  const addHistoryItem = useAddHistoryItem();

  useEffect(() => {
    if (seller && !hasRecordedHistory.current) {
      hasRecordedHistory.current = true;
      addHistoryItem.mutate({
        type: "seller",
        itemId: seller._id,
        itemData: {
          name: seller.shopName,
          image: seller.avatar || "",
          rating: seller.ratings?.average || 0,
          reviewsCount: seller.ratings?.count || 0,
          location: seller.location || "Unknown",
          memberSince: new Date(seller.createdAt).getFullYear(),
        },
      });
    }
  }, [seller, addHistoryItem]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: seller.shopName,
          text: `Check out ${seller.shopName} on our marketplace`,
          url: window.location.href,
        });
      } catch (err) {
        logger.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  if (isSellerLoading || isProductsLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner size="lg" />
        <div>Loading seller profile...</div>
      </LoadingContainer>
    );
  }

  if (!seller || sellerError) {
    return (
      <NotFoundContainer>
        <NotFoundIcon>😔</NotFoundIcon>
        <h2>Seller not found</h2>
        <p>This seller might have moved or the link might be incorrect.</p>
        <BackButton to="/">Back to Home</BackButton>
      </NotFoundContainer>
    );
  }

  return (
    <ProfileContainer>
      {/* Header Section */}
      <HeaderSection>
        <Banner bgImage={seller.avatar}>
          <BannerOverlay />
          <HeaderContent>
            <AvatarSection>
              <Avatar
                src={imageError ? '/default-avatar.png' : seller.avatar}
                alt={seller.shopName}
                onError={() => setImageError(true)}
              />
              <VerifiedBadge>✓</VerifiedBadge>
            </AvatarSection>

            <ShopInfo>
              <ShopName>{seller.shopName}</ShopName>
              <ShopMeta>
                <MetaItem>
                  <FaMapMarkerAlt size={14} />
                  <span>{seller.location}</span>
                </MetaItem>
                <MetaItem>
                  <FaCalendarAlt size={14} />
                  <span>Member since {new Date(seller.createdAt).getFullYear()}</span>
                </MetaItem>
              </ShopMeta>

              <RatingSection>
                <StarRating rating={seller.ratings.average} />
                <RatingText>
                  <strong>{seller.ratings.average.toFixed(1)}</strong>
                  <span>({seller.ratings.count} reviews)</span>
                </RatingText>
              </RatingSection>
            </ShopInfo>

            <ActionButtons>
              <FollowButton
                onClick={toggleFollow}
                $isFollowing={isFollowing}
                disabled={isFollowLoading}
              >
                {isFollowLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <FaHeart size={16} />
                )}
                {isFollowLoading ? "Processing..." : isFollowing ? "Following" : "Follow"}
              </FollowButton>

              <ShareButton onClick={handleShare}>
                <FaShare size={14} />
                Share
              </ShareButton>
            </ActionButtons>
          </HeaderContent>
        </Banner>
      </HeaderSection>

      {/* Main Content */}
      <MainLayout>
        {/* Sidebar */}
        <Sidebar>
          <StatsCard>
            <StatItem>
              <StatNumber>{followers.length}</StatNumber>
              <StatLabel>Followers</StatLabel>
            </StatItem>
            <StatDivider />
            <StatItem>
              <StatNumber>{products.length}</StatNumber>
              <StatLabel>Products</StatLabel>
            </StatItem>
            <StatDivider />
            <StatItem>
              <StatNumber>{seller.ratings.count}</StatNumber>
              <StatLabel>Reviews</StatLabel>
            </StatItem>
          </StatsCard>

          <InfoCard>
            <CardTitle>About the Shop</CardTitle>
            <Description>{seller.description || "No description provided."}</Description>

            <InfoList>
              <InfoListItem>
                <FaMapMarkerAlt />
                <span>{seller.location || "Location not specified"}</span>
              </InfoListItem>
              <InfoListItem>
                <FaCalendarAlt />
                <span>Joined {new Date(seller.createdAt).toLocaleDateString()}</span>
              </InfoListItem>
            </InfoList>
          </InfoCard>
        </Sidebar>

        {/* Products Section */}
        <MainContent>
          <SectionHeader>
            <div>
              <SectionTitle>Shop Products</SectionTitle>
              <ResultsCount>{products.length} items available</ResultsCount>
            </div>
            <SortFilter>
              <FilterButton>Filter</FilterButton>
            </SortFilter>
          </SectionHeader>

          {products.length === 0 ? (
            <EmptyState>
              <EmptyIcon>🛍️</EmptyIcon>
              <h3>No products yet</h3>
              <p>This shop hasn't listed any products for sale.</p>
            </EmptyState>
          ) : (
            <Grid
              columns={4}
              style={{ marginTop: '1rem' }}
            >
              {products.map((product) => (
                <ProductCard
                  key={product?._id || product?.id}
                  product={product}
                  showAddToCart={true}
                />
              ))}
            </Grid>
          )}
        </MainContent>
      </MainLayout>

      {/* Similar Sellers Section */}
      {similarSellers.length > 0 && (
        <SimilarSellersSection>
          <SimilarSellersHeader>
            <SimilarSellersTitle>Similar Sellers</SimilarSellersTitle>
            <SimilarSellersSubtitle>Other top sellers you might like</SimilarSellersSubtitle>
          </SimilarSellersHeader>

          {isSimilarSellersLoading ? (
            <LoadingContainer>
              <LoadingSpinner size="md" />
            </LoadingContainer>
          ) : (
            <SimilarSellersGrid>
              {similarSellers.map((similarSeller) => (
                <SimilarSellerCard
                  key={similarSeller._id || similarSeller.id}
                  to={`/seller/${similarSeller._id || similarSeller.id}`}
                >
                  <SimilarSellerAvatar
                    src={similarSeller.avatar || '/default-avatar.png'}
                    alt={similarSeller.shopName || similarSeller.name}
                  />
                  <SimilarSellerInfo>
                    <SimilarSellerName>
                      {similarSeller.shopName || similarSeller.name || 'Seller'}
                    </SimilarSellerName>
                    <SimilarSellerRating>
                      <StarRating
                        rating={similarSeller.rating || similarSeller.ratings?.average || 0}
                        size={12}
                      />
                      <SimilarSellerRatingText>
                        {(similarSeller.rating || similarSeller.ratings?.average || 0).toFixed(1)}
                      </SimilarSellerRatingText>
                    </SimilarSellerRating>
                    <SimilarSellerStats>
                      <StatText>
                        {similarSeller.totalOrders || similarSeller.orderCount || 0} orders
                      </StatText>
                    </SimilarSellerStats>
                  </SimilarSellerInfo>
                </SimilarSellerCard>
              ))}
            </SimilarSellersGrid>
          )}
        </SimilarSellersSection>
      )}
    </ProfileContainer>
  );
};

export default PublicSellerProfile;

// Modern Styled Components
const ProfileContainer = styled.div`
  min-height: 100vh;
  background: #f9f7f4;
  width: 100%;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
  color: #64748b;
`;

// DEPRECATED: Use LoadingSpinner from shared/components instead
// const Spinner = styled.div`...` - REMOVED

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
`;

const NotFoundIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const BackButton = styled(Link)`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #D4882A 0%, #f0a845 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(212, 136, 42, 0.3);

  &:hover {
    background: linear-gradient(135deg, #B8711F 0%, #D4882A 100%);
    box-shadow: 0 4px 16px rgba(212, 136, 42, 0.4);
  }
`;

const HeaderSection = styled.section`
  position: relative;
  margin-bottom: 2rem;
`;

const Banner = styled.div`
  position: relative;
  height: 300px;
  background-image: url(${(props) => props.bgImage});
  background-size: cover;
  background-position: center;
  background-color: #1a1f2e;

  @media (max-width: 768px) {
    height: 250px;
  }
`;

const BannerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(26, 31, 46, 0.92) 0%, rgba(45, 52, 68, 0.88) 100%);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
    background-size: 28px 28px;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 20% 50%, rgba(212, 136, 42, 0.18) 0%, transparent 60%);
  }
`;

const HeaderContent = styled.div`
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  align-items: flex-end;
  gap: 2rem;
  height: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }
`;

const AvatarSection = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Avatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #D4882A;
  object-fit: cover;
  background: white;
  box-shadow: 0 8px 24px rgba(212, 136, 42, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
`;

const VerifiedBadge = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border: 2px solid white;
`;

const ShopInfo = styled.div`
  flex: 1;
  color: white;
`;

const ShopName = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ShopMeta = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
    gap: 1rem;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.9;
`;

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const RatingText = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  strong {
    font-size: 1.2rem;
  }

  span {
    opacity: 0.9;
    font-size: 0.9rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-direction: column;

  @media (max-width: 768px) {
    flex-direction: row;
  }
`;

const FollowButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.$isFollowing
    ? 'linear-gradient(135deg, #D4882A 0%, #f0a845 100%)'
    : 'transparent'};
  color: white;
  border: 2px solid ${props => props.$isFollowing ? '#D4882A' : 'rgba(255,255,255,0.7)'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  min-width: 120px;
  box-shadow: ${props => props.$isFollowing ? '0 4px 12px rgba(212,136,42,0.4)' : 'none'};

  &:hover {
    background: ${props => props.$isFollowing
      ? 'linear-gradient(135deg, #B8711F 0%, #D4882A 100%)'
      : 'rgba(212, 136, 42, 0.15)'};
    border-color: #D4882A;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ShareButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.08);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  min-width: 120px;
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(212, 136, 42, 0.2);
    border-color: rgba(212, 136, 42, 0.6);
  }
`;

const MainLayout = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
    
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 968px) {
    order: 2;
  }
`;

const StatsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #f0e8d8;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #D4882A;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
`;

const StatDivider = styled.div`
  width: 1px;
  height: 40px;
  background: #f0e8d8;
`;

const InfoCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #f0e8d8;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1f2e;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f0e8d8;
`;

const Description = styled.p`
  color: #475569;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const InfoListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #64748b;
  font-size: 0.9rem;

  svg {
    color: #D4882A;
  }
`;

const MainContent = styled.main`
  @media (max-width: 968px) {
    order: 1;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1f2e;
  margin-bottom: 0.5rem;
`;

const ResultsCount = styled.p`
  color: #64748b;
  font-size: 0.9rem;
`;

const SortFilter = styled.div`
  display: flex;
  gap: 1rem;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #f0e8d8;
  background: white;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    border-color: #D4882A;
    color: #D4882A;
    background: #fff7ed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #f0e8d8;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

// Similar Sellers Section Styles
const SimilarSellersSection = styled.section`
  max-width: 1200px;
  margin: 4rem auto 2rem;
  padding: 0 1rem;
`;

const SimilarSellersHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const SimilarSellersTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1f2e;
  margin-bottom: 0.5rem;
`;

const SimilarSellersSubtitle = styled.p`
  color: #64748b;
  font-size: 0.95rem;
`;

const SimilarSellersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
`;

const SimilarSellerCard = styled(Link)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #f0e8d8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &:hover {
    transform: translateY(-4px);
    border-color: #D4882A;
    box-shadow: 0 8px 24px rgba(212, 136, 42, 0.18);
    background: #fff7ed;
  }
`;

const SimilarSellerAvatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f0e8d8;
  margin-bottom: 1rem;
  background: #fff7ed;
  transition: border-color 0.3s ease;

  ${SimilarSellerCard}:hover & {
    border-color: #D4882A;
  }
`;

const SimilarSellerInfo = styled.div`
  width: 100%;
`;

const SimilarSellerName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1f2e;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const SimilarSellerRating = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const SimilarSellerRatingText = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
`;

const SimilarSellerStats = styled.div`
  margin-top: 0.5rem;
`;

const StatText = styled.p`
  font-size: 0.75rem;
  color: #64748b;
`;