import React from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaEnvelope } from 'react-icons/fa';
import {
  CTASection,
  CTAContainer,
  CTAContent,
  CTATitle,
  CTASubtitle,
  CTAButtons,
  CTAButtonPrimary,
  CTAButtonSecondary,
} from './careers.styles';

const CareerCTA = ({ navigate }) => {
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
          <CTATitle>Build Your Future With EazShop</CTATitle>
          <CTASubtitle>
            Ready to join our mission? Explore open roles or reach out to our HR team
          </CTASubtitle>
          <CTAButtons>
            <CTAButtonPrimary
              onClick={() => navigate('#jobs')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPaperPlane />
              Apply Now
            </CTAButtonPrimary>
            <CTAButtonSecondary
              onClick={() => navigate('/contact?subject=HR Inquiry')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaEnvelope />
              Email HR Team
            </CTAButtonSecondary>
          </CTAButtons>
        </CTAContent>
      </CTAContainer>
    </CTASection>
  );
};

export default CareerCTA;

