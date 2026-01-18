import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
// Using react-icons/fa for all icons (no Simple Icons)
import { FaFacebook, FaTwitter, FaInstagram, FaTiktok, FaCreditCard, FaBox, FaWallet, FaMoneyBillWave } from "react-icons/fa";
import { useNewsletter } from '../hooks/useNewsletter';
import { PrimaryButton } from '../components/ui/Buttons';
import { ButtonSpinner } from '../../components/loading';
import Logo from '../components/Logo';
import { PATHS } from '../../routes/routePaths';
import { SSLBadge, PCIBadge, PaystackBadge } from '../components/security';
import logger from '../utils/logger';

export default function Footer() {
  const [email, setEmail] = useState("");
  const { mutate: newsletterMutation, isPending: isSubscribing } = useNewsletter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    newsletterMutation(email, {
      onSuccess: () => {
        logger.log("subscribed successfully");
      },
    });
    setEmail("");
  };

  return (
    <FooterContainer>
      <FooterContent>
        {/* Top Section */}
        <FooterTop>
          <BrandSection>
            <LogoWrapper>
              <Logo to={PATHS.HOME} variant="default" />
            </LogoWrapper>
                <BrandTagline>Redefining Shopping Experience</BrandTagline>
            <BrandDescription>
              Your premier destination for curated products, exceptional service, 
              and seamless shopping. Discover quality, style, and convenience all in one place.
            </BrandDescription>
          </BrandSection>
        </FooterTop>

        {/* Middle Section - Links */}
        <FooterMiddle>
          <LinkGrid>
            <LinkColumn>
              <ColumnTitle>Shop</ColumnTitle>
              <LinkList>
                <LinkItem to="/new-arrivals">New Arrivals</LinkItem>
                <LinkItem to="/best-sellers">Best Sellers</LinkItem>
                <LinkItem to="/deals">Today's Deals</LinkItem>
                <LinkItem to="/trending">Trending</LinkItem>
                <LinkItem to="/electronics">Electronics</LinkItem>
                <LinkItem to="/fashion">Fashion</LinkItem>
              </LinkList>
            </LinkColumn>

            <LinkColumn>
              <ColumnTitle>Support</ColumnTitle>
              <LinkList>
                <LinkItem to="/help" aria-label="Help Center">Help Center</LinkItem>
                <LinkItem to="/contact">Contact Us</LinkItem>
                <LinkItem to={PATHS.SUPPORT}>Support</LinkItem>
                <LinkItem to={PATHS.SHIPPING_POLICY}>Shipping Info</LinkItem>
                <LinkItem to={PATHS.REFUND_POLICY}>Return & Refund Policy</LinkItem>
                <LinkItem to="/size-guide">Size Guide</LinkItem>
                <LinkItem to={PATHS.PRODUCT_CARE}>Product Care</LinkItem>
              </LinkList>
            </LinkColumn>

            <LinkColumn>
              <ColumnTitle>Company</ColumnTitle>
              <LinkList>
                <LinkItem to="/about">About Us</LinkItem>
                <LinkItem to={PATHS.PARTNER}>Partner With Us</LinkItem>
                <LinkItem to="/careers">Careers</LinkItem>
                <LinkItem to="/press">Press</LinkItem>
                <LinkItem to="/sustainability">Sustainability</LinkItem>
                <LinkItem to="/affiliates">Affiliate Program</LinkItem>
                <LinkItem to="/blog">Blog</LinkItem>
              </LinkList>
            </LinkColumn>

            <LinkColumn>
              <ColumnTitle>Connect</ColumnTitle>
              <SocialLinks>
                <SocialLink href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <SocialIcon>
                    <FaFacebook />
                  </SocialIcon>
                  <span>Facebook</span>
                </SocialLink>
                <SocialLink href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <SocialIcon>
                    <FaTwitter />
                  </SocialIcon>
                  <span>Twitter</span>
                </SocialLink>
                <SocialLink href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <SocialIcon>
                    <FaInstagram />
                  </SocialIcon>
                  <span>Instagram</span>
                </SocialLink>
                <SocialLink href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
                  <SocialIcon>
                    <FaTiktok />
                  </SocialIcon>
                  <span>TikTok</span>
                </SocialLink>
              </SocialLinks>
            </LinkColumn>
          </LinkGrid>
        </FooterMiddle>

        {/* Payment Methods Section */}
        <PaymentMethodsSection>
          <PaymentSectionTitle>We Accept</PaymentSectionTitle>
          <PaymentMethodsGrid>
            <PaymentMethod>
              <PaymentMethodIcon>
                <FaBox />
              </PaymentMethodIcon>
              <PaymentMethodLabel>Payment on Delivery</PaymentMethodLabel>
            </PaymentMethod>
            <PaymentMethod>
              <PaymentMethodIcon>
                <FaCreditCard />
              </PaymentMethodIcon>
              <PaymentMethodLabel>Paystack (Momo & Card)</PaymentMethodLabel>
            </PaymentMethod>
            <PaymentMethod>
              <PaymentMethodIcon>
                <FaWallet />
              </PaymentMethodIcon>
              <PaymentMethodLabel>App Wallet</PaymentMethodLabel>
            </PaymentMethod>
          </PaymentMethodsGrid>
        </PaymentMethodsSection>

        {/* Security & Certifications Section */}
        <SecuritySection>
          <SecuritySectionTitle>Security & Certifications</SecuritySectionTitle>
          <SecurityBadgesGrid>
            <SSLBadge />
            <PCIBadge />
            <PaystackBadge />
          </SecurityBadgesGrid>
        </SecuritySection>

        {/* Bottom Section */}
        <FooterBottom>
          <BottomContent>
            <Copyright>
              © {new Date().getFullYear()} Saysay. All rights reserved.
            </Copyright>
            
            <LegalLinks>
                    <LegalLink to={PATHS.SITEMAP}>Sitemap</LegalLink>
              <LegalLink to={PATHS.PRIVACY}>Privacy Policy</LegalLink>
              <LegalLink to={PATHS.TERMS}>Terms & Service</LegalLink>
              <LegalLink to="/cookies">Cookie Policy</LegalLink>
            </LegalLinks>
          </BottomContent>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
}

// Modern styled components with gradient and glassmorphism effects
const FooterContainer = styled.footer`
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  color: #ffffff;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 196, 0, 0.5), transparent);
  }
`;

const FooterContent = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 0 1.5rem;
  }
`;

const FooterTop = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
  padding: 6rem 0 4rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 968px) {
    gap: 4rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 3rem;
    padding: 4rem 0 3rem;
  }
`;

const BrandSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const LogoWrapper = styled.div`
  margin-bottom: 0.5rem;
  
  /* Ensure logo is visible on dark background */
  a {
    text-decoration: none;
  }
  
  /* Override logo text colors for dark footer */
  /* Target the first span (Eaz) to be white */
  div > div > span:first-of-type {
    color: #ffffff !important;
  }
  
  /* Keep the second span (Shop) yellow */
  div > div > span:last-of-type {
    color: #ffc400 !important;
  }
  
  /* Ensure logo icon stays yellow */
  svg {
    color: #ffc400 !important;
  }
`;

const BrandTagline = styled.span`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  letter-spacing: 0.5px;
  margin-top: 0.5rem;
`;

const BrandDescription = styled.p`
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.8;
  font-size: 1.2rem;
  margin: 0;
  max-width: 450px;
  font-weight: 400;
`;

const NewsletterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const NewsletterTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 196, 0, 0.9) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const NewsletterDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  margin: 0;
  line-height: 1.6;
`;

const NewsletterForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 0;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 0.4rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:focus-within {
    border-color: rgba(255, 196, 0, 0.5);
    box-shadow: 0 0 0 3px rgba(255, 196, 0, 0.1);
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    flex-direction: column;
    padding: 1.2rem;
    gap: 1rem;
  }
`;

const NewsletterInput = styled.input`
  flex: 1;
  padding: 1.2rem 1.5rem;
  border: none;
  background: transparent;
  color: #ffffff;
  font-size: 1rem;
  outline: none;
  font-weight: 400;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    color: #ffffff;
  }
`;

const SubscribeButton = styled(PrimaryButton)`
  padding: 1.2rem 2.4rem;
  border-radius: 8px;
  font-weight: 600;
  white-space: nowrap;
  background: linear-gradient(135deg, #ffc400 0%, #ff9800 100%);
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 196, 0, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 196, 0, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const FooterMiddle = styled.div`
  padding: 5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    padding: 3rem 0;
  }
`;

const LinkGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4rem;

  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`;

const LinkColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ColumnTitle = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  position: relative;
  padding-bottom: 1rem;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 3rem;
    height: 2px;
    background: linear-gradient(90deg, #ffc400, transparent);
    border-radius: 2px;
  }
`;

const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const LinkItem = styled(Link)`
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 1.3rem;
  transition: all 0.3s ease;
  padding: 0.5rem 0;
  position: relative;
  font-weight: 400;

  &::before {
    content: '';
    position: absolute;
    left: -1rem;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 2px;
    background: #ffc400;
    transition: width 0.3s ease;
    border-radius: 2px;
  }

  &:hover {
    color: #ffc400;
    padding-left: 1rem;
    
    &::before {
      width: 0.5rem;
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 1.3rem;
  transition: all 0.3s ease;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  font-weight: 400;

  &:hover {
    color: #ffffff;
    background: rgba(255, 196, 0, 0.1);
    border-color: rgba(255, 196, 0, 0.3);
    transform: translateX(4px);
  }

  span {
    flex: 1;
  }
`;

const SocialIcon = styled.span`
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;

  ${SocialLink}:hover & {
    background: rgba(255, 196, 0, 0.2);
    transform: scale(1.1);
  }
`;

const FooterBottom = styled.div`
  padding: 3rem 0;
  position: relative;
`;

const BottomContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
  }
`;

const Copyright = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
  font-weight: 400;
`;

const LegalLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const LegalLink = styled(Link)`
  // color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  // font-size: 1.2rem;
  transition: all 0.3s ease;
  font-weight: 400;
  position: relative;
  padding: 0.5rem 0;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 1px;
    background: #ffc400;
    transition: width 0.3s ease;
  }

  &:hover {
    color: #ffc400;
    
    &::after {
      width: 100%;
    }
  }
`;

const PaymentMethodsSection = styled.div`
  padding: 2rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);

  @media (max-width: 768px) {
    padding: 1.5rem 0;
  }
`;

const PaymentSectionTitle = styled.h2`
  color: rgba(255, 255, 255, 0.9);
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 1.2rem 0;
  text-align: center;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const PaymentMethodsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  align-items: center;
  justify-items: center;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    max-width: 100%;
  }

  @media (min-width: 769px) and (max-width: 968px) {
    gap: 1rem;
  }
`;

const PaymentMethod = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 1.2rem 0.8rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
  min-width: 140px;
  max-width: 180px;
  width: 100%;

  &:hover {
    background: rgba(255, 196, 0, 0.08);
    border-color: rgba(255, 196, 0, 0.25);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 196, 0, 0.15);
  }

  @media (max-width: 768px) {
    min-width: 100%;
    max-width: 100%;
    padding: 0.9rem;
  }
`;

const PaymentMethodIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;

  svg {
    font-size: 1.7rem;
  }

  ${PaymentMethod}:hover & {
    background: rgba(255, 196, 0, 0.15);
    color: #ffc400;
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    width: 3rem;
    height: 3rem;
    
    svg {
      font-size: 1.7rem;
    }
  }
`;

const PaymentMethodLabel = styled.span`
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.4;
  transition: color 0.3s ease;

  ${PaymentMethod}:hover & {
    color: rgba(255, 255, 255, 0.95);
  }

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const SecuritySection = styled.div`
  padding: 2rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);

  @media (max-width: 768px) {
    padding: 1.5rem 0;
  }
`;

const SecuritySectionTitle = styled.h4`
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.7rem;
  font-weight: 600;
  margin: 0 0 1.2rem 0;
  text-align: center;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 1.7rem;
    margin-bottom: 1rem;
  }
`;

const SecurityBadgesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.2rem;
  align-items: center;
  justify-items: center;
  max-width: 1000px;
  margin: 0 auto;

  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    max-width: 100%;
  }
`;