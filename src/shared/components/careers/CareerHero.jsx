import React from 'react';
import { motion } from 'framer-motion';
import { FaBriefcase } from 'react-icons/fa';
import {
  HeroSection,
  HeroContainer,
  HeroContent,
  HeroTitle,
  HeroSubtitle,
  HeroButton,
} from './careers.styles';

const CareerHero = ({ navigate }) => {
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
          <HeroTitle>Careers at EazShop</HeroTitle>
          <HeroSubtitle>
            Join our mission to power commerce across Africa.
          </HeroSubtitle>
          <HeroButton
            onClick={() => navigate('#jobs')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaBriefcase />
            View Open Roles
          </HeroButton>
        </HeroContent>
      </HeroContainer>
    </HeroSection>
  );
};

export default CareerHero;

