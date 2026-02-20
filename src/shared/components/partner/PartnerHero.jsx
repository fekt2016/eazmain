import React from 'react';
import { motion } from 'framer-motion';
import { FaStore, FaTruck, FaHandshake } from 'react-icons/fa';
import {
  HeroSection,
  HeroContainer,
  HeroContent,
  HeroLeft,
  HeroTitle,
  HeroSubtitle,
  HeroButtons,
  HeroButton,
  HeroButtonPrimary,
  HeroButtonSecondary,
  HeroRight,
  HeroIllustration,
} from './partner.styles';

const PartnerHero = ({ navigate }) => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <HeroSection
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      <HeroContainer>
        <HeroContent>
          <HeroLeft variants={fadeUp}>
            <HeroTitle>Partner With Saiisai</HeroTitle>
            <HeroSubtitle>
              Grow your business, reach millions of customers, and scale with us.
            </HeroSubtitle>
            <HeroButtons>
              <HeroButtonPrimary
                onClick={() => navigate('/signup?type=seller')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaStore />
                Become a Seller
              </HeroButtonPrimary>
              <HeroButtonSecondary
                onClick={() => navigate('/contact?type=logistics')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaTruck />
                Become a Logistics Partner
              </HeroButtonSecondary>
              <HeroButtonSecondary
                onClick={() => navigate('/contact?type=brand')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaHandshake />
                Become a Brand Partner
              </HeroButtonSecondary>
            </HeroButtons>
          </HeroLeft>
          <HeroRight variants={fadeUp}>
            <HeroIllustration>
              <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background Circle */}
                <circle cx="200" cy="200" r="180" fill="url(#gradient1)" opacity="0.1" />

                {/* Main Illustration Elements */}
                <g transform="translate(200, 200)">
                  {/* Store Icon */}
                  <g transform="translate(-80, -100)">
                    <rect x="0" y="0" width="60" height="60" rx="8" fill="#ffc400" opacity="0.2" />
                    <rect x="5" y="5" width="50" height="50" rx="6" fill="#ffc400" />
                    <rect x="15" y="15" width="30" height="20" rx="2" fill="white" />
                    <rect x="20" y="40" width="20" height="10" rx="2" fill="white" />
                  </g>

                  {/* Handshake Icon */}
                  <g transform="translate(20, -100)">
                    <circle cx="30" cy="30" r="30" fill="#00C896" opacity="0.2" />
                    <path
                      d="M15 25 L25 35 L35 25"
                      stroke="#00C896"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </g>

                  {/* Truck Icon */}
                  <g transform="translate(-80, 20)">
                    <rect x="0" y="20" width="50" height="30" rx="4" fill="#0078cc" opacity="0.2" />
                    <rect x="5" y="25" width="40" height="20" rx="3" fill="#0078cc" />
                    <circle cx="15" cy="50" r="8" fill="#1e293b" />
                    <circle cx="35" cy="50" r="8" fill="#1e293b" />
                  </g>

                  {/* Growth Arrow */}
                  <g transform="translate(20, 20)">
                    <path
                      d="M0 40 L20 20 L40 40"
                      stroke="#ffc400"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <path
                      d="M20 0 L20 20"
                      stroke="#ffc400"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </g>
                </g>

                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffc400" />
                    <stop offset="100%" stopColor="#00C896" />
                  </linearGradient>
                </defs>
              </svg>
            </HeroIllustration>
          </HeroRight>
        </HeroContent>
      </HeroContainer>
    </HeroSection>
  );
};

export default PartnerHero;

