import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import logger from '../../utils/logger';
import { FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ProductCard from '../ProductCard';
import { productService } from '../../services/productApi';
import { SkeletonGrid } from '../../../components/loading';
import { PATHS } from '../../../routes/routePaths';
import { devicesMax } from '../../styles/breakpoint';

const Section = styled.section`
  margin: 4rem 0;
  padding: 2rem 0;
  background: var(--color-white-0);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0 1rem;

  @media ${devicesMax.md} {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin: 0;
`;

const ViewAllLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary-500);
  text-decoration: none;
  font-weight: var(--font-semibold);
  font-size: var(--font-size-md);
  transition: color var(--transition-base);

  &:hover {
    color: var(--primary-700);
  }

  svg {
    font-size: var(--font-size-sm);
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  padding: 0 1rem;

  @media ${devicesMax.md} {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }

  @media ${devicesMax.sm} {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
`;

const SellerSection = styled.div`
  margin-bottom: 3rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SellerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 0 1rem;
`;

const SellerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SellerAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-grey-200);
`;

const SellerName = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin: 0;
`;

const ViewShopLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary-500);
  text-decoration: none;
  font-weight: var(--font-semibold);
  font-size: var(--font-size-sm);
  transition: color var(--transition-base);

  &:hover {
    color: var(--primary-700);
  }

  svg {
    font-size: var(--font-size-xs);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-grey-600);
`;

/**
 * Fetches and displays products from a single seller
 */
const SellerProducts = ({ seller }) => {
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['seller-products', seller._id || seller.id],
    queryFn: async () => {
      try {
        const response = await productService.getAllPublicProductsBySeller(seller._id || seller.id);
        // Handle different response structures
        if (Array.isArray(response)) return response;
        if (response?.products) return response.products;
        if (response?.data?.products) return response.data.products;
        return [];
      } catch (error) {
        logger.error(`Error fetching products for seller ${seller._id}:`, error);
        return [];
      }
    },
    enabled: !!(seller._id || seller.id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const products = useMemo(() => {
    if (!productsData) return [];
    if (Array.isArray(productsData)) return productsData;
    return [];
  }, [productsData]);

  // Show only active products, limit to 8
  const displayProducts = useMemo(() => {
    return products
      .filter(product => product.status === 'active')
      .slice(0, 8);
  }, [products]);

  if (isLoading) {
    return (
      <SellerSection>
        <SellerHeader>
          <SellerInfo>
            <SellerAvatar
              src={seller.avatar || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect fill='%23ffc400' width='48' height='48'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='20' font-weight='bold'%3E${(seller.shopName || seller.name || 'S').charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`}
              alt={seller.shopName || seller.name}
            />
            <SellerName>{seller.shopName || seller.name}</SellerName>
          </SellerInfo>
        </SellerHeader>
        <SkeletonGrid count={4} />
      </SellerSection>
    );
  }

  if (displayProducts.length === 0) {
    return null; // Don't show section if no products
  }

  return (
    <SellerSection>
      <SellerHeader>
        <SellerInfo>
          <SellerAvatar
            src={seller.avatar || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect fill='%23ffc400' width='48' height='48'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='20' font-weight='bold'%3E${(seller.shopName || seller.name || 'S').charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`}
            alt={seller.shopName || seller.name}
            onError={(e) => {
              e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect fill='%23ffc400' width='48' height='48'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='20' font-weight='bold'%3E${(seller.shopName || seller.name || 'S').charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`;
            }}
          />
          <SellerName>{seller.shopName || seller.name}</SellerName>
        </SellerInfo>
        <ViewShopLink to={`${PATHS.SELLERS}/${seller._id || seller.id}`}>
          View Shop <FaArrowRight />
        </ViewShopLink>
      </SellerHeader>
      <ProductsGrid>
        {displayProducts.map((product) => (
          <ProductCard
            key={product._id || product.id}
            product={product}
            showAddToCart
          />
        ))}
      </ProductsGrid>
    </SellerSection>
  );
};

/**
 * Displays products from top sellers
 */
const SellerProductsSection = ({ sellers = [] }) => {
  // Show products from top 3 sellers
  const topSellers = useMemo(() => {
    return sellers.slice(0, 3);
  }, [sellers]);

  if (topSellers.length === 0) {
    return null;
  }

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Products from Top Sellers</SectionTitle>
        <ViewAllLink to={PATHS.PRODUCTS}>
          View All Products <FaArrowRight />
        </ViewAllLink>
      </SectionHeader>
      {topSellers.map((seller) => (
        <SellerProducts key={seller._id || seller.id} seller={seller} />
      ))}
    </Section>
  );
};

export default SellerProductsSection;

