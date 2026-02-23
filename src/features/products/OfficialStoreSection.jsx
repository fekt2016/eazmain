import { useMemo } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { FaArrowRight, FaCheck, FaTruck, FaShieldAlt, FaAward } from "react-icons/fa";
import { useOfficialStore } from "../../shared/hooks/useOfficialStore";
import logger from "../../shared/utils/logger";
import ProductCard from "../../shared/components/ProductCard";
import Container from "../../shared/components/Container";
import { PATHS } from "../../routes/routePaths";
import { fadeInUp } from "../../shared/styles/animations";
import { devicesMax } from "../../shared/styles/breakpoint";

const OfficialStoreSection = () => {
  const { useGetOfficialStoreProducts } = useOfficialStore();
  const { data: officialProducts, isLoading, error } = useGetOfficialStoreProducts();

  const products = useMemo(() => {
    if (!officialProducts) return [];

    let productsList = [];
    // Handle different response structures
    if (Array.isArray(officialProducts)) {
      productsList = officialProducts;
    } else if (officialProducts?.products) {
      productsList = officialProducts.products;
    } else if (officialProducts?.data?.products) {
      productsList = officialProducts.data.products;
    }

    // CRITICAL: Filter out deleted products and unapproved products (final safety check)
    return productsList.filter(product => {
      if (!product) return false;
      // Exclude deleted products
      if (product.isDeleted === true ||
        product.isDeletedByAdmin === true ||
        product.isDeletedBySeller === true ||
        product.status === 'archived' ||
        product.status === 'inactive') {
        console.warn('[OfficialStoreSection] Filtered out deleted product:', product._id, product.name);
        return false;
      }

      // CRITICAL: Only show products that have been approved by admin
      if (product.moderationStatus && product.moderationStatus !== 'approved') {
        console.warn('[OfficialStoreSection] Filtered out unapproved product:', product._id, product.name, 'moderationStatus:', product.moderationStatus);
        return false;
      }

      // NOTE: We no longer check isVisible - approved products are visible regardless

      return true;
    });
  }, [officialProducts]);

  // Show only active, non-deleted, approved products, limit to 8
  const displayProducts = useMemo(() => {
    return products
      .filter(product => {
        // Must be a Saiisai official product
        if (!product.isEazShopProduct) return false;
        // Must be active
        if (product.status !== 'active') return false;
        // CRITICAL: Exclude deleted products (client-side safety check)
        if (product.isDeleted === true ||
          product.isDeletedByAdmin === true ||
          product.isDeletedBySeller === true ||
          product.status === 'archived') {
          return false;
        }
        // CRITICAL: Only show approved products
        if (product.moderationStatus && product.moderationStatus !== 'approved') {
          return false;
        }
        // NOTE: We no longer check isVisible - approved products are visible regardless
        return true;
      })
      .slice(0, 8);
  }, [products]);

  if (error) {
    logger.error("Error loading Official Store products:", error);
    return null; // Fail silently
  }

  if (isLoading) {
    return (
      <Section>
        <Container>
          <SectionHeader>
            <SectionTitle>Saiisai Official Store</SectionTitle>
          </SectionHeader>
          <LoadingGrid>
            {[1, 2, 3, 4].map(i => (
              <SkeletonCard key={i} />
            ))}
          </LoadingGrid>
        </Container>
      </Section>
    );
  }

  if (displayProducts.length === 0) {
    return null; // Don't show section if no products
  }

  return (
    <Section $gradient>
      <Container>
        <SectionHeader>
          <HeaderContent>
            <BadgeContainer>
              <OfficialBadge>
                <FaAward />
                <span>Official Store</span>
              </OfficialBadge>
              <TrustBadge>
                <FaCheck /> Trusted
              </TrustBadge>
              <TrustBadge>
                <FaShieldAlt /> Verified
              </TrustBadge>
              <TrustBadge>
                <FaTruck /> Fast Delivery
              </TrustBadge>
            </BadgeContainer>
            <TitleContainer>
              <SectionTitle>Saiisai Official Store</SectionTitle>
              <SectionSubtitle>
                Trusted • Verified • Fast Delivery
              </SectionSubtitle>
            </TitleContainer>
          </HeaderContent>
          <SectionLink to={PATHS.PRODUCTS} $query="?official=true">
            View All <FaArrowRight />
          </SectionLink>
        </SectionHeader>

        <ProductGrid>
          {displayProducts.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              showAddToCart
            />
          ))}
        </ProductGrid>
      </Container>
    </Section>
  );
};

export default OfficialStoreSection;

// Styled Components
const Section = styled.section`
  padding: 5rem 0;
  background: ${props => props.$gradient
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'white'};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
    pointer-events: none;
  }

  @media ${devicesMax.md} {
    padding: 3rem 0;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 3rem;
  position: relative;
  z-index: 1;
  
  @media ${devicesMax.sm} {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const BadgeContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const OfficialBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: ${fadeInUp} 0.6s ease;

  svg {
    font-size: 1rem;
  }
`;

const TrustBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: white;
  padding: 0.4rem 0.9rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.2);

  svg {
    font-size: 0.85rem;
  }
`;

const TitleContainer = styled.div`
  color: white;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  
  @media ${devicesMax.sm} {
    font-size: 2rem;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
  margin: 0;
`;

const SectionLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    gap: 12px;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  @media ${devicesMax.sm} {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 cards per row */
  gap: 1.5rem;
  position: relative;
  z-index: 1;
  
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

const LoadingGrid = styled.div`
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

const SkeletonCard = styled.div`
  height: 400px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: pulse 1.5s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% {
      opacity: 0.6;
    }
    50% {
      opacity: 0.8;
    }
  }
`;

