import { useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { devicesMax } from '../../shared/styles/breakpoint';
import { Link } from "react-router-dom";
import { useGetFollowedSellerByUser } from '../../shared/hooks/useFollow';
import useProduct from '../../shared/hooks/useProduct';
import { 
  FaStore, 
  FaUsers, 
  FaBox, 
  FaStar, 
  FaRocket, 
  FaShoppingBag,
  FaHeart,
  FaRegHeart,
  FaEye,
  FaPlus
} from "react-icons/fa";

// ============== COMPONENT ==============
const FollowPage = () => {
  const { getProducts } = useProduct();
  const { data: productsData } = getProducts;

  const products = useMemo(() => {
    // Handle different response structures
    if (!productsData) {
      return [];
    }
    
    // If productsData is already an array
    if (Array.isArray(productsData)) {
      return productsData;
    }
    
    // Try different possible paths
    if (productsData.results && Array.isArray(productsData.results)) {
      return productsData.results;
    }
    
    if (productsData.data?.products && Array.isArray(productsData.data.products)) {
      return productsData.data.products;
    }
    
    if (productsData.data?.results && Array.isArray(productsData.data.results)) {
      return productsData.data.results;
    }
    
    if (productsData.products && Array.isArray(productsData.products)) {
      return productsData.products;
    }
    
    // Default to empty array if nothing matches
    return [];
  }, [productsData]);

  const { data: followedData } = useGetFollowedSellerByUser();

  const followedSellers = useMemo(() => {
    return followedData?.data.follows || [];
  }, [followedData]);

  const sellerMap = useMemo(() => {
    return followedSellers.reduce((map, follow) => {
      if (follow.seller) {
        map[follow.seller._id] = follow.seller;
      }
      return map;
    }, {});
  }, [followedSellers]);

  const newArrivalsBySeller = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const groupedByseller = {};
    
    // Ensure followedSellers is an array
    const validFollowedSellers = Array.isArray(followedSellers) ? followedSellers : [];
    validFollowedSellers.forEach((follow) => {
      if (follow.seller) {
        groupedByseller[follow.seller._id] = {
          seller: follow.seller,
          products: [],
        };
      }
    });

    // Ensure products is an array before using forEach
    const validProducts = Array.isArray(products) ? products : [];
    validProducts.forEach((product) => {
      const sellerId = product.seller?._id || product.seller;
      const seller = sellerMap[sellerId];
      if (seller && new Date(product.createdAt) > oneWeekAgo) {
        const isNew = new Date(product.createdAt) > oneWeekAgo;
        if (isNew) {
          if (!groupedByseller[sellerId]) {
            groupedByseller[sellerId] = {
              seller: seller,
              products: [],
            };
          }
          groupedByseller[sellerId].products.push(product);
        }
      }
    });
    return groupedByseller;
  }, [followedSellers, products, sellerMap]);

  return (
    <PageContainer>
      {/* Header Section */}
      <HeaderSection>
        <HeaderContent>
          <TitleSection>
            <Title>Followed Shops</Title>
            <Subtitle>Discover new arrivals from your favorite sellers</Subtitle>
          </TitleSection>
          
          <StatsGrid>
            <StatCard>
              <StatIcon $color="primary">
                <FaStore />
              </StatIcon>
              <StatContent>
                <StatValue>{followedSellers.length}</StatValue>
                <StatLabelMain>Shops Followed</StatLabelMain>
              </StatContent>
            </StatCard>
            <StatCard>
              <StatIcon $color="green">
                <FaRocket />
              </StatIcon>
              <StatContent>
                <StatValue>
                  {Object.values(newArrivalsBySeller).reduce((total, group) => total + group.products.length, 0)}
                </StatValue>
                <StatLabelMain>New Arrivals</StatLabelMain>
              </StatContent>
            </StatCard>
          </StatsGrid>
        </HeaderContent>
      </HeaderSection>

      {/* Main Content */}
      <ContentSection>
        {/* Followed Shops Section */}
        <Section>
          <SectionHeader>
            <SectionTitle>
              <FaHeart style={{ color: "var(--color-red-500)", marginRight: "8px" }} />
              Your Followed Shops
            </SectionTitle>
            <SectionAction>
              Discover More Shops
            </SectionAction>
          </SectionHeader>

          {followedSellers.length > 0 ? (
            <SellersGrid>
              {followedSellers.map((follow) => {
                if (!follow.seller) return null;
                
                const seller = follow.seller;
                const followerCount = Array.isArray(seller.followers)
                  ? seller.followers.length
                  : 0;
                const rating = seller.rating || 4.5;

                return (
                  <SellerCard key={follow._id}>
                    <CardHeader>
                      <SellerAvatar>
                        <AvatarImage src={seller.avatar} alt={seller.shopName} />
                        <OnlineIndicator />
                      </SellerAvatar>
                      <SellerInfo>
                        <ShopName>{seller.shopName}</ShopName>
                        <SellerRating>
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star key={index} $filled={index < Math.floor(rating)}>
                              <FaStar />
                            </Star>
                          ))}
                          <RatingValue>{rating}</RatingValue>
                        </SellerRating>
                      </SellerInfo>
                      <FollowButton>
                        <FaHeart />
                        Following
                      </FollowButton>
                    </CardHeader>

                    <SellerStats>
                      <Stat>
                        <StatIconSmall>
                          <FaBox />
                        </StatIconSmall>
                        <StatInfo>
                          <StatNumber>{seller.productCount || 0}</StatNumber>
                          <SellerStatLabel>Products</SellerStatLabel>
                        </StatInfo>
                      </Stat>
                      <Stat>
                        <StatIconSmall>
                          <FaUsers />
                        </StatIconSmall>
                        <StatInfo>
                          <StatNumber>{followerCount}</StatNumber>
                          <SellerStatLabel>Followers</SellerStatLabel>
                        </StatInfo>
                      </Stat>
                    </SellerStats>

                    <VisitShopButton to={`/seller/${seller._id}`}>
                      <FaEye />
                      Visit Shop
                    </VisitShopButton>
                  </SellerCard>
                );
              })}
            </SellersGrid>
          ) : (
            <EmptyState>
              <EmptyIllustration>
                <FaStore />
              </EmptyIllustration>
              <EmptyContent>
                <EmptyTitle>No Shops Followed Yet</EmptyTitle>
                <EmptyMessage>
                  Start following your favorite shops to see their latest products and updates here.
                </EmptyMessage>
                <ActionButton>
                  <FaPlus />
                  Discover Shops
                </ActionButton>
              </EmptyContent>
            </EmptyState>
          )}
        </Section>

        {/* New Arrivals Sections */}
        {Object.keys(newArrivalsBySeller).map((sellerId) => {
          const sellerGroup = newArrivalsBySeller[sellerId];
          if (sellerGroup.products.length === 0) return null;

          return (
            <Section key={sellerId}>
              <SectionHeader>
                <SellerSectionHeader>
                  <SellerHeaderInfo>
                    <SellerAvatarSmall>
                      <AvatarImage src={sellerGroup.seller.avatar} alt={sellerGroup.seller.shopName} />
                    </SellerAvatarSmall>
                    <div>
                      <SectionTitle>New from {sellerGroup.seller.shopName}</SectionTitle>
                      <SectionSubtitle>{sellerGroup.products.length} new products this week</SectionSubtitle>
                    </div>
                  </SellerHeaderInfo>
                  <ViewAllButton to={`/seller/${sellerId}`}>
                    View All Products
                  </ViewAllButton>
                </SellerSectionHeader>
              </SectionHeader>

              <ProductsGrid>
                {sellerGroup.products.map((product) => (
                  <ProductCard to={`/product/${product._id}`} key={product._id}>
                    <ProductImageContainer>
                      <ProductImage $imageUrl={product.imageCover} />
                      <NewBadge>
                        <FaRocket />
                        NEW
                      </NewBadge>
                      <QuickActions>
                        <QuickActionButton>
                          <FaHeart />
                        </QuickActionButton>
                      </QuickActions>
                    </ProductImageContainer>

                    <ProductInfo>
                      <ProductCategory>{product.category?.name || "Product"}</ProductCategory>
                      <ProductName>{product.name}</ProductName>
                      <ProductPrice>
                        ${(product.minPrice || product.defaultPrice || 0).toFixed(2)}
                      </ProductPrice>
                      <ProductSeller>
                        <SellerAvatarMini>
                          <AvatarImage src={sellerGroup.seller.avatar} alt={sellerGroup.seller.shopName} />
                        </SellerAvatarMini>
                        <SellerName>{sellerGroup.seller.shopName}</SellerName>
                      </ProductSeller>
                    </ProductInfo>
                  </ProductCard>
                ))}
              </ProductsGrid>
            </Section>
          );
        })}
      </ContentSection>
    </PageContainer>
  );
};

export default FollowPage;

// ============== MODERN STYLED COMPONENTS ==============
const PageContainer = styled.div`
  max-width: 120rem;
  margin: 0 auto;
  padding: 2.4rem;

  @media ${devicesMax.md} {
    padding: 1.6rem;
  }
`;

const HeaderSection = styled.section`
  margin-bottom: 3.2rem;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2.4rem;

  @media ${devicesMax.lg} {
    flex-direction: column;
    gap: 2rem;
  }
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 3.2rem;
  font-weight: 800;
  color: var(--color-grey-900);
  margin-bottom: 0.8rem;
  background: linear-gradient(135deg, var(--color-grey-900) 0%, var(--color-grey-700) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media ${devicesMax.md} {
    font-size: 2.8rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-600);
  max-width: 50rem;
`;

const StatsGrid = styled.div`
  display: flex;
  gap: 1.6rem;

  @media ${devicesMax.sm} {
    flex-direction: column;
    width: 100%;
  }
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  background: var(--color-white-0);
  padding: 1.6rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-grey-100);
  min-width: 20rem;

  @media ${devicesMax.sm} {
    min-width: auto;
  }
`;

const StatIcon = styled.div`
  width: 4rem;
  height: 4rem;
  background: ${props => {
    switch (props.$color) {
      case 'green': return 'linear-gradient(135deg, var(--color-green-500) 0%, var(--color-green-600) 100%)';
      case 'primary': 
      default: return 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)';
    }
  }};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white-0);
  font-size: 1.6rem;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.div`
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--color-grey-900);
  line-height: 1;
`;

// Fixed: Renamed to StatLabelMain to avoid duplicate
const StatLabelMain = styled.div`
  font-size: 1.2rem;
  color: var(--color-grey-600);
  font-weight: 500;
  margin-top: 0.4rem;
`;

const ContentSection = styled.div`
  background: var(--color-white-0);
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-grey-100);
  overflow: hidden;
`;

const Section = styled.section`
  padding: 3.2rem;

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }

  @media ${devicesMax.md} {
    padding: 2.4rem;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.4rem;

  @media ${devicesMax.sm} {
    flex-direction: column;
    align-items: stretch;
    gap: 1.6rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-grey-900);
  display: flex;
  align-items: center;
`;

const SectionAction = styled.button`
  background: var(--color-grey-50);
  color: var(--color-grey-700);
  border: 1px solid var(--color-grey-300);
  padding: 0.8rem 1.6rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--color-primary-50);
    border-color: var(--color-primary-500);
    color: var(--color-primary-600);
  }
`;

const SellerSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  @media ${devicesMax.sm} {
    flex-direction: column;
    align-items: stretch;
    gap: 1.6rem;
  }
`;

const SellerHeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const SellerAvatarSmall = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid var(--color-white-0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionSubtitle = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-600);
  margin-top: 0.4rem;
`;

const ViewAllButton = styled(Link)`
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  border: 1px solid var(--color-primary-200);
  padding: 0.8rem 1.6rem;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: var(--color-primary-100);
    border-color: var(--color-primary-300);
  }
`;

const SellersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;

  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

const SellerCard = styled.div`
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
    border-color: var(--color-primary-200);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
  margin-bottom: 1.6rem;
`;

const SellerAvatar = styled.div`
  position: relative;
  width: 6rem;
  height: 6rem;
  border-radius: 16px;
  overflow: hidden;
  border: 3px solid var(--color-white-0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const OnlineIndicator = styled.div`
  position: absolute;
  bottom: 0.2rem;
  right: 0.2rem;
  width: 1.2rem;
  height: 1.2rem;
  background: var(--color-green-500);
  border: 2px solid var(--color-white-0);
  border-radius: 50%;
`;

const SellerInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ShopName = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 0.4rem;
  line-height: 1.2;
`;

const SellerRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const Star = styled.span`
  color: ${props => props.$filled ? "var(--color-yellow-500)" : "var(--color-grey-300)"};
  font-size: 1.2rem;
  display: flex;
  align-items: center;
`;

const RatingValue = styled.span`
  font-size: 1.2rem;
  color: var(--color-grey-600);
  margin-left: 0.4rem;
  font-weight: 500;
`;

const FollowButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--color-red-500);
  color: var(--color-white-0);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--color-red-600);
    transform: translateY(-1px);
  }
`;

const SellerStats = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 1.6rem;
  padding: 1.2rem;
  background: var(--color-grey-50);
  border-radius: 12px;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex: 1;
`;

const StatIconSmall = styled.div`
  width: 3.2rem;
  height: 3.2rem;
  background: var(--color-white-0);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-500);
  font-size: 1.2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatNumber = styled.span`
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-grey-900);
  line-height: 1;
`;

// Fixed: Renamed to SellerStatLabel to avoid duplicate
const SellerStatLabel = styled.span`
  font-size: 1.1rem;
  color: var(--color-grey-600);
  margin-top: 0.2rem;
`;

const VisitShopButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  width: 100%;
  background: var(--color-primary-500);
  color: var(--color-white-0);
  border: none;
  padding: 1rem 1.6rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--color-primary-600);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;

  @media ${devicesMax.sm} {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
`;

const ProductCard = styled(Link)`
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
    border-color: var(--color-primary-200);
  }
`;

const ProductImageContainer = styled.div`
  position: relative;
  height: 20rem;
  overflow: hidden;
  background: var(--color-grey-100);
`;

const ProductImage = styled.div`
  height: 100%;
  background-image: ${(props) => `url(${props.$imageUrl})`};
  background-size: cover;
  background-position: center;
  transition: transform 0.3s ease;

  ${ProductCard}:hover & {
    transform: scale(1.05);
  }
`;

const NewBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: linear-gradient(135deg, var(--color-green-500) 0%, var(--color-green-600) 100%);
  color: var(--color-white-0);
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  z-index: 2;
`;

const QuickActions = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;

  ${ProductCard}:hover & {
    opacity: 1;
    transform: translateX(0);
  }
`;

const QuickActionButton = styled.button`
  width: 3.2rem;
  height: 3.2rem;
  background: var(--color-white-0);
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-600);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    background: var(--color-red-500);
    color: var(--color-white-0);
    transform: scale(1.1);
  }
`;

const ProductInfo = styled.div`
  padding: 1.6rem;
`;

const ProductCategory = styled.span`
  font-size: 1.2rem;
  color: var(--color-grey-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  display: block;
  margin-bottom: 0.4rem;
`;

const ProductName = styled.h3`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-900);
  margin-bottom: 0.8rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductPrice = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-primary-600);
  margin-bottom: 1.2rem;
`;

const ProductSeller = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-grey-100);
`;

const SellerAvatarMini = styled.div`
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 6px;
  overflow: hidden;
`;

const SellerName = styled.span`
  font-size: 1.2rem;
  color: var(--color-grey-600);
  font-weight: 500;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6.4rem 2.4rem;
  text-align: center;
`;

const EmptyIllustration = styled.div`
  width: 12rem;
  height: 12rem;
  background: linear-gradient(135deg, var(--color-grey-100) 0%, var(--color-grey-200) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4.8rem;
  color: var(--color-grey-400);
  margin-bottom: 2.4rem;
`;

const EmptyContent = styled.div`
  max-width: 50rem;
`;

const EmptyTitle = styled.h3`
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 0.8rem;
`;

const EmptyMessage = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-600);
  margin-bottom: 3.2rem;
  line-height: 1.5;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--color-white-0);
  border: none;
  padding: 1.2rem 2.4rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
  }
`;