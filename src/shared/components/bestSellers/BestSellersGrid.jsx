import React from 'react';
import styled from 'styled-components';
import { devicesMax } from '../../../shared/styles/breakpoint';
import BestSellerSellerCard from './BestSellerSellerCard';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-lg);
  margin: var(--space-2xl) 0;

  @media (max-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-md);
  }

  @media ${devicesMax.md} {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
  }

  @media ${devicesMax.sm} {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-sm);
  }

  @media ${devicesMax.xs} {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-xs);
  }
`;

const BestSellersGrid = ({ sellers }) => {
  if (!sellers || sellers.length === 0) {
    return null;
  }

  return (
    <GridContainer>
      {sellers.map((seller, index) => (
        <BestSellerSellerCard
          key={seller._id || seller.id}
          seller={seller}
          rank={index + 1}
        />
      ))}
    </GridContainer>
  );
};

export default BestSellersGrid;
