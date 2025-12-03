import React from 'react';
import { motion } from 'framer-motion';
import {
  HeroSection,
  HeroContainer,
  HeroContent,
  HeroTitle,
  HeroSubtitle,
  ProductCount,
} from './newArrivals.styles';

const NewArrivalsHero = ({ totalProducts }) => {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <HeroSection
      initial="hidden"
      animate="visible"
      variants={fadeUp}
    >
      <HeroContainer>
        <HeroContent>
          <HeroTitle>New Arrivals</HeroTitle>
          <HeroSubtitle>
            Discover the latest products added to EazShop.
          </HeroSubtitle>
          {totalProducts > 0 && (
            <ProductCount>
              {totalProducts} {totalProducts === 1 ? 'product' : 'products'} available
            </ProductCount>
          )}
        </HeroContent>
      </HeroContainer>
    </HeroSection>
  );
};

export default NewArrivalsHero;

