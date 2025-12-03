import React from 'react';
import styled from 'styled-components';
import { devicesMax } from '../../shared/styles/breakpoint';
import Grid from '../ui/Grid';
import Card from '../ui/Card';
import ProductCard from '../../shared/components/ProductCard';

const GridContainer = styled.div`
  margin: var(--space-2xl) 0;
`;

const DealsGrid = ({ products }) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <GridContainer>
      <Grid columns={4}>
        {products.map((product) => (
          <Card key={product._id || product.id} clickable variant="elevated">
            <ProductCard
              product={product}
              showBadges={true}
              showAddToCart={false}
            />
          </Card>
        ))}
      </Grid>
    </GridContainer>
  );
};

export default DealsGrid;

