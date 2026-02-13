import React from 'react';
import { motion } from 'framer-motion';
import {
  HeroSection,
  HeroContainer,
  HeroContent,
  HeroTitle,
  HeroSubtitle,
  SellerCount,
} from './bestSellers.styles';

const BestSellersHero = ({ totalSellers }) => {
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
          <HeroTitle>Best Sellers</HeroTitle>
          <HeroSubtitle>
            Discover top-performing sellers on saiisai marketplace with the most orders. Shop from trusted merchants.
          </HeroSubtitle>
          {totalSellers > 0 && (
            <SellerCount>
              {totalSellers.toLocaleString()} {totalSellers === 1 ? 'seller' : 'sellers'} available
            </SellerCount>
          )}
        </HeroContent>
      </HeroContainer>
    </HeroSection>
  );
};

export default BestSellersHero;
