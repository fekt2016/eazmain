import styled from "styled-components";
import useSimilarProducts from '../hooks/useProduct';
import { LoadingState, ErrorState } from '../../components/loading';
import ProductCard from './ProductCard';

const SimilarProducts = ({ categoryId, currentProductId }) => {
  const { data, isLoading, error } = useSimilarProducts(
    categoryId,
    currentProductId
  );

  if (isLoading) return <LoadingState message="Loading similar products..." />;
  if (error) return <ErrorState title="Error loading similar products" message={error.message} />;
  if (!data || data.length === 0) return null;

  return (
    <SimilarGrid>
      {data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </SimilarGrid>
  );
};

const SimilarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }
`;

export default SimilarProducts;
