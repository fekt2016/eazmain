import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import ProductCard from '../../../shared/components/ProductCard';
import { PATHS } from '../../../routes/routePaths';
import { FaArrowRight } from 'react-icons/fa';

const SectionWrapper = styled.section`
  padding: 4rem 1rem; /* py-16 */
  background: white;
  font-family: 'Inter', sans-serif;
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem; /* H2 */
  font-weight: 700;
  color: #0f172a; /* gray-900 */
  margin: 0;
`;

const SectionLink = styled(Link)`
  color: #1e293b; /* Secondary */
  text-decoration: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #ffc400; /* Primary hover */
    gap: 12px;
  }
`;

// Responsive 4-Column Grid with strict gap
const ProductGridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem; /* gap-6 */

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }

  /* Enforce consistent card design overrides according to Design System */
  & > div, & > a {
    border-radius: 12px !important; /* rounded-xl */
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important; /* shadow-sm */
    transition: all 0.2s ease !important;
    border: 1px solid #f1f5f9; /* gray-100 */
    overflow: hidden;

    &:hover {
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important; /* shadow-md */
      transform: translateY(-2px) !important;
      border-color: #e2e8f0;
    }

    button {
      border-radius: 9999px !important; /* Pill buttons */
    }
  }
`;

const FeaturedProducts = ({
    products,
    isLoading,
    title = "Featured Products",
    link = PATHS.PRODUCTS,
    handleProductClick
}) => {
    if (!isLoading && (!products || products.length === 0)) {
        return null;
    }

    return (
        <SectionWrapper>
            <Container>
                <SectionHeader>
                    <SectionTitle>{title}</SectionTitle>
                    <SectionLink to={link}>
                        View All <FaArrowRight />
                    </SectionLink>
                </SectionHeader>

                {isLoading ? (
                    <ProductGridWrapper>
                        {/* Simple Skeleton layout matching card proportions */}
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} style={{ height: '350px', background: '#f8fafc', borderRadius: '12px' }} />
                        ))}
                    </ProductGridWrapper>
                ) : (
                    <ProductGridWrapper>
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                onClick={() => handleProductClick && handleProductClick(product._id)}
                                showAddToCart
                            />
                        ))}
                    </ProductGridWrapper>
                )}
            </Container>
        </SectionWrapper>
    );
};

export default FeaturedProducts;
