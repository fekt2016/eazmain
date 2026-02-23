import styled from "styled-components";
import useSimilarProducts from '../hooks/useProduct';
import { LoadingState, ErrorState } from '../../components/loading';
import ProductCard from './ProductCard';

const SimilarProducts = ({ categoryId, currentProductId, currentProduct }) => {
  const { data, isLoading, error } = useSimilarProducts(
    categoryId,
    currentProductId
  );

  if (isLoading) return (
    <SimilarSection>
      <SectionTitle>You May Also Like</SectionTitle>
      <LoadingState message="Loading similar products..." />
    </SimilarSection>
  );
  if (error) return (
    <SimilarSection>
      <SectionTitle>You May Also Like</SectionTitle>
      <ErrorState title="Error loading similar products" message={error.message} />
    </SimilarSection>
  );
  const filteredData = data?.filter(p => {
    const isSameId = p.id === currentProductId || p._id === currentProductId || p.id === currentProduct?.id || p._id === currentProduct?._id;
    const isSameName = p.name && currentProduct?.name && p.name.trim().toLowerCase() === currentProduct.name.trim().toLowerCase();

    return !isSameId && !isSameName;
  }) || [];

  if (filteredData.length === 0) return null;

  return (
    <SimilarSection>
      <SectionTitle>You May Also Like</SectionTitle>
      <SimilarGrid>
        {filteredData.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </SimilarGrid>
    </SimilarSection>
  );
};

const SimilarSection = styled.div`
  margin-top: 5rem;
  padding-top: 3rem;
  border-top: 1px solid var(--color-grey-200);

  @media (max-width: 640px) {
    margin-top: 3rem;
    padding-top: 2rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.8rem;
  font-weight: 800;
  color: var(--color-grey-900);
  margin-bottom: 3rem;
  text-align: center;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 2.4rem;
    margin-bottom: 2rem;
  }
`;

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
