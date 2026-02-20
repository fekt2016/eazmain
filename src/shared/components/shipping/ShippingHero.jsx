import React from 'react';
import { motion } from 'framer-motion';
import { FaTruck } from 'react-icons/fa';
import {
  HeroSection,
  HeroContainer,
  HeroContent,
  HeroTitle,
  HeroSubtitle,
} from './shipping.styles';

const ShippingHero = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <HeroSection
      initial="hidden"
      animate="visible"
      variants={fadeUp}
    >
      <HeroContainer>
        <HeroContent>
          <HeroTitle>Shipping Information</HeroTitle>
          <HeroSubtitle>
            Understand how delivery works at Saiisai.
          </HeroSubtitle>
        </HeroContent>
      </HeroContainer>
    </HeroSection>
  );
};

export default ShippingHero;

