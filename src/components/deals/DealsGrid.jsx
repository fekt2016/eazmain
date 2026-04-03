import styled, { keyframes } from 'styled-components';
import WishlistProductCard from '../../features/wishlist/WishlistProductCard';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const ProductsGrid = styled.div`
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

const DealsGrid = ({ products }) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <ProductsGrid>
      {products.map((product) => (
        <WishlistProductCard
          key={product._id || product.id}
          product={product}
          showWishlistRemove={false}
        />
      ))}
    </ProductsGrid>
  );
};

export default DealsGrid;
