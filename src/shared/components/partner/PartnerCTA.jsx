import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight, FaEnvelope } from 'react-icons/fa';
import {
  CTASection,
  CTAContainer,
  CTAContent,
  CTATitle,
  CTASubtitle,
  CTAButtons,
  CTAButtonPrimary,
  CTAButtonSecondary,
} from './partner.styles';

const PartnerCTA = ({ navigate }) => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <CTASection
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeUp}
    >
      <CTAContainer>
        <CTAContent>
          <CTATitle>Ready to Partner With EazShop?</CTATitle>
          <CTASubtitle>
            Join thousands of successful partners and start growing your business today
          </CTASubtitle>
          <CTAButtons>
            <CTAButtonPrimary
              onClick={() => navigate('/signup?type=partner')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Application
              <FaArrowRight />
            </CTAButtonPrimary>
            <CTAButtonSecondary
              onClick={() => navigate('/contact?type=partnership')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaEnvelope />
              Contact Partnership Team
            </CTAButtonSecondary>
          </CTAButtons>
        </CTAContent>
      </CTAContainer>
    </CTASection>
  );
};

export default PartnerCTA;

