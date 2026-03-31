import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
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
        {/* Top Section: logo + tagline block (max 80px), then 24px before link columns */}
        <FooterTop>
          <BrandSection>
            <LogoBlock>
              <LogoWrapper>
                <Logo to={PATHS.HOME} variant="footer" />
              </LogoWrapper>
              <BrandTagline>Ghana's online shopping and e-commerce platform</BrandTagline>
            </LogoBlock>
            <BrandDescription>
              Saiisai is Ghana's e-commerce website for online shopping – buy and sell with trusted sellers.
              Your premier destination for curated products, fast delivery across Ghana, and secure payments.
            </BrandDescription>
          </BrandSection>
        </FooterTop>

        {/* Middle Section - Links: 4 columns desktop, 2 columns mobile */}
        <FooterMiddle>
          <LinkGridFourCol>
            <LinkColumn>
              <ColumnTitle>Shop</ColumnTitle>
              <LinkList>
                <LinkItem to="/new-arrivals">New Arrivals</LinkItem>
                <LinkItem to="/best-sellers">Best Sellers</LinkItem>
                <LinkItem to="/deals">Today's Deals</LinkItem>
                <LinkItem to="/trending">Trending</LinkItem>
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
                <LinkItem to={PATHS.SIZE_GUIDE}>Size Guide</LinkItem>
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
          </LinkGridFourCol>
        </FooterMiddle>

        {/* Payment Methods Section - centered, right-to-left infinite marquee */}
        <PaymentMethodsSection>
          <PaymentSectionTitle>We Accept</PaymentSectionTitle>
          <PaymentMethodsWrap>
            <PaymentMethodsTrack>
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
            </PaymentMethodsTrack>
          </PaymentMethodsWrap>
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
              © {new Date().getFullYear()} Saiisai. All rights reserved.
            </Copyright>

            <LegalLinks>
              <LegalLink to={PATHS.SITEMAP}>Sitemap</LegalLink>
              <LegalLink to={PATHS.PRIVACY}>Privacy Policy</LegalLink>
              <LegalLink to={PATHS.TERMS}>Terms & Service</LegalLink>
              <LegalLink to={PATHS.DATA_DELETION}>Data Deletion</LegalLink>
              <LegalLink to={PATHS.VAT_TAX_POLICY}>VAT & Tax Policy</LegalLink>
              <LegalLink to={PATHS.COOKIE_POLICY}>Cookie Policy</LegalLink>
            </LegalLinks>
          </BottomContent>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
}

const FooterContainer = styled.footer`
  background: #1A1F2E;
  color: #ffffff;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  padding: 20px 24px 12px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 20px 24px 12px;
  }
`;

const FooterContent = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  padding: 0;
  position: relative;
  z-index: 1;
`;

const FooterTop = styled.div`
  padding: 0 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const LogoBlock = styled.div`
  max-height: 48px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0;
`;

const BrandSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const LogoWrapper = styled.div`
  min-height: 32px;
  display: flex;
  align-items: center;
  
  a {
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }
  img, svg {
    min-height: 32px;
    height: 32px;
    width: auto;
    object-fit: contain;
  }
`;

const BrandTagline = styled.span`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  letter-spacing: 0.02em;
  margin-top: 4px;
`;

const BrandDescription = styled.p`
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
  font-size: 0.875rem;
  margin: 0;
  max-width: 450px;
  font-weight: 400;
  display: none;

  @media (min-width: 769px) {
    display: block;
    margin-top: 0.5rem;
  }
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const LinkGridFourCol = styled.div`
  display: grid;
  margin-bottom: 0;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
    column-gap: 32px;
    row-gap: 0;
    padding: 16px 0;
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    grid-template-columns: repeat(4, 1fr);
    column-gap: 16px;
    row-gap: 0;
    padding: 16px 0;
  }

  @media (min-width: 480px) and (max-width: 767px) {
    grid-template-columns: repeat(2, 1fr);
    column-gap: 24px;
    row-gap: 16px;
    padding: 16px 0;
  }

  @media (max-width: 479px) {
    grid-template-columns: repeat(2, 1fr);
    column-gap: 16px;
    row-gap: 12px;
    padding: 12px 0;
  }
`;

const LinkColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const ColumnTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  @media (max-width: 767px) {
    font-size: 13px;
    margin-bottom: 6px;
  }
`;

const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const LinkItem = styled(Link)`
  color: #9CA3AF;
  text-decoration: none;
  font-size: 14px;
  font-weight: 400;
  line-height: 28px;
  margin: 0;
  padding: 0;
  transition: color 0.2s ease;

  &:hover {
    color: #FFFFFF;
  }

  @media (max-width: 767px) {
    font-size: 13px;
    line-height: 26px;
    padding: 9px 0;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }
`;

const socialFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const socialIconFloat = keyframes`
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-2px) scale(1.04);
  }
`;

const SocialLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;

  a {
    animation: ${socialFadeIn} 0.4s ease-out backwards;
  }
  a:nth-child(1) { animation-delay: 0.05s; }
  a:nth-child(2) { animation-delay: 0.1s; }
  a:nth-child(3) { animation-delay: 0.15s; }
  a:nth-child(4) { animation-delay: 0.2s; }
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #9CA3AF;
  text-decoration: none;
  font-size: 14px;
  font-weight: 400;
  line-height: 28px;
  margin: 0;
  padding: 0;
  transition: color 0.2s ease, transform 0.25s ease;

  &:hover {
    color: #FFFFFF;
    transform: translateX(4px);
  }

  &:hover span:first-of-type {
    transform: scale(1.2);
  }

  span {
    flex: 1;
  }

  @media (max-width: 767px) {
    font-size: 13px;
    line-height: 26px;
    padding: 9px 0;
    min-height: 44px;
  }
`;

const SocialIcon = styled.span`
  font-size: 2.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  color: inherit;
  transition: transform 0.25s ease;
  flex-shrink: 0;
  animation: ${socialIconFloat} 2.6s ease-in-out infinite;

  ${SocialLink}:hover & {
    transform: scale(1.18) rotate(-4deg);
    animation-duration: 1.3s;
  }

  ${SocialLink}:nth-child(2) & {
    animation-delay: 0.15s;
  }
  ${SocialLink}:nth-child(3) & {
    animation-delay: 0.3s;
  }
  ${SocialLink}:nth-child(4) & {
    animation-delay: 0.45s;
  }

  @media (max-width: 767px) {
    font-size: 2.1rem;
    width: 2.9rem;
    height: 2.9rem;
  }
`;

const FooterBottom = styled.div`
  padding: 10px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;

  @media (max-width: 767px) {
    padding: 8px 0;
  }
`;

const BottomContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 767px) {
    flex-direction: column;
    text-align: center;
    gap: 4px;
  }

  @media (min-width: 768px) {
    gap: 0.5rem;
  }
`;

const Copyright = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
  font-weight: 400;

  @media (max-width: 767px) {
    font-size: 0.8125rem;
  }
`;

const LegalLinks = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 767px) {
    gap: 4px;
    justify-content: center;
  }
`;

const LegalLink = styled(Link)`
  color: #9CA3AF;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
  font-weight: 400;

  &:hover {
    color: #FFFFFF;
  }

  @media (max-width: 767px) {
    font-size: 0.8125rem;
  }
`;

const scrollRightToLeft = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
`;

const PaymentMethodsSection = styled.div`
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);

  @media (max-width: 767px) {
    padding: 12px 0;
  }
`;

const PaymentSectionTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: center;

  @media (max-width: 767px) {
    margin-bottom: 6px;
  }
`;

const PaymentMethodsWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
`;

const PaymentMethodsTrack = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 1.5rem;
  width: max-content;
  animation: ${scrollRightToLeft} 30s linear infinite;
  padding: 0 1rem;

  @media (max-width: 767px) {
    gap: 1rem;
    padding: 0 0.5rem;
  }
`;

const PaymentMethod = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.6rem 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
  flex-shrink: 0;
  min-width: 100px;
  max-width: 140px;

  &:hover {
    background: rgba(255, 196, 0, 0.08);
    border-color: rgba(255, 196, 0, 0.25);
  }

  @media (max-width: 767px) {
    padding: 0.5rem 0.6rem;
    min-width: 80px;
    max-width: 120px;
  }
`;

const PaymentMethodIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;

  svg {
    font-size: 1rem;
  }

  ${PaymentMethod}:hover & {
    background: rgba(255, 196, 0, 0.15);
    color: #ffc400;
  }

  @media (max-width: 767px) {
    width: 1.6rem;
    height: 1.6rem;

    svg {
      font-size: 0.85rem;
    }
  }
`;

const PaymentMethodLabel = styled.span`
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.3;
  transition: color 0.3s ease;

  ${PaymentMethod}:hover & {
    color: rgba(255, 255, 255, 0.95);
  }

  @media (max-width: 767px) {
    font-size: 0.8rem;
  }
`;

const SecuritySection = styled.div`
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);

  @media (max-width: 767px) {
    padding: 12px 0;
  }
`;

const SecuritySectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: center;

  @media (max-width: 767px) {
    margin-bottom: 6px;
  }
`;

const SecurityBadgesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
  align-items: center;
  justify-items: center;
  max-width: 1000px;
  margin: 0 auto;

  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 767px) {
    gap: 0.4rem;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    max-width: 100%;
  }
`;