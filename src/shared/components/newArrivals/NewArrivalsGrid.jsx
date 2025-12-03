import React from 'react';
import { motion } from 'framer-motion';
import ProductCard from '../ProductCard';
import {
  ProductsGrid,
  GridContainer,
} from './newArrivals.styles';

const NewArrivalsGrid = ({ products }) => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  return (
    <GridContainer
      initial="hidden"
      animate="visible"
      variants={container}
    >
      <ProductsGrid>
        {products.map((product, index) => (
          <motion.div
            key={product._id || product.id || index}
            variants={fadeIn}
          >
            <ProductCard
              product={product}
              showAddToCart
              showBadges
            />
          </motion.div>
        ))}
      </ProductsGrid>
    </GridContainer>
  );
};

export default NewArrivalsGrid;

