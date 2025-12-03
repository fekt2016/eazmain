import { useMemo } from 'react';
import styled from 'styled-components';
import ProductCard from '../ProductCard';
import { usePersonalized } from '../../hooks/useRecommendations';
import { LoadingState, ErrorState } from '../../../components/loading';
import { devicesMax } from '../../styles/breakpoint';

const PersonalizedGrid = ({ userId, title = 'You May Also Like', limit = 10 }) => {
  const { data, isLoading, error } = usePersonalized(userId, limit);

  const products = useMemo(() => {
    if (!data?.data?.products) return [];
    return data.data.products;
  }, [data]);

  if (isLoading) {
    return (
      <Section>
        <SectionTitle>{title}</SectionTitle>
        <LoadingState message="Loading personalized recommendations..." />
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <SectionTitle>{title}</SectionTitle>
        <ErrorState title="Error loading recommendations" message={error.message} />
      </Section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <Section>
      <SectionTitle>{title}</SectionTitle>
      <ProductGrid>
        {products.map((product) => (
          <ProductCard key={product._id || product.id} product={product} showAddToCart />
        ))}
      </ProductGrid>
    </Section>
  );
};

const Section = styled.section`
  margin: 4rem 0;
  padding: 2rem 0;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--color-grey-900);
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  @media ${devicesMax.sm} {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
`;

export default PersonalizedGrid;

