import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useNewsletter } from '../hooks/useNewsletter';
import { PrimaryButton } from '../components/ui/Buttons';
import { ButtonSpinner } from '../../components/loading';

export default function Footer() {
  const [email, setEmail] = useState("");
  const { mutate: newsletterMutation, isPending: isSubscribing } = useNewsletter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    newsletterMutation(email, {
      onSuccess: () => {
        console.log("subscribed successfully");
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
            <Logo>
              <LogoIcon>🛍️</LogoIcon>
              <BrandInfo>
                <BrandName>EazShop</BrandName>
                <BrandTagline>Redefining Shopping Experience</BrandTagline>
              </BrandInfo>
            </Logo>
            <BrandDescription>
              Your premier destination for curated products, exceptional service, 
              and seamless shopping.
            </BrandDescription>
          </BrandSection>

          <NewsletterSection>
            <NewsletterTitle>Stay Updated</NewsletterTitle>
            <NewsletterDescription>
              Get exclusive access to new collections and special discounts.
            </NewsletterDescription>
            <NewsletterForm onSubmit={handleSubmit}>
              <InputWrapper>
                <NewsletterInput
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <SubscribeButton 
                  type="submit" 
                  disabled={isSubscribing}
                >
                  {isSubscribing ? (
                    <ButtonSpinner size="sm" />
                  ) : (
                    "Subscribe"
                  )}
                </SubscribeButton>
              </InputWrapper>
            </NewsletterForm>
          </NewsletterSection>
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
                <LinkItem to="/help-center">Help Center</LinkItem>
                <LinkItem to="/contact">Contact Us</LinkItem>
                <LinkItem to="/shipping">Shipping Info</LinkItem>
                <LinkItem to="/returns">Returns & Exchanges</LinkItem>
                <LinkItem to="/size-guide">Size Guide</LinkItem>
                <LinkItem to="/product-care">Product Care</LinkItem>
              </LinkList>
            </LinkColumn>

            <LinkColumn>
              <ColumnTitle>Company</ColumnTitle>
              <LinkList>
                <LinkItem to="/about">About Us</LinkItem>
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
                <SocialLink href="https://facebook.com" target="_blank" rel="noopener">
                  <SocialIcon>📘</SocialIcon>
                  Facebook
                </SocialLink>
                <SocialLink href="https://twitter.com" target="_blank" rel="noopener">
                  <SocialIcon>🐦</SocialIcon>
                  Twitter
                </SocialLink>
                <SocialLink href="https://instagram.com" target="_blank" rel="noopener">
                  <SocialIcon>📷</SocialIcon>
                  Instagram
                </SocialLink>
                <SocialLink href="https://tiktok.com" target="_blank" rel="noopener">
                  <SocialIcon>🎵</SocialIcon>
                  TikTok
                </SocialLink>
              </SocialLinks>
            </LinkColumn>
          </LinkGrid>
        </FooterMiddle>

        {/* Bottom Section */}
        <FooterBottom>
          <BottomContent>
            <Copyright>
              © {new Date().getFullYear()} EazShop. All rights reserved.
            </Copyright>
            
            <LegalLinks>
              <LegalLink to="/privacy">Privacy Policy</LegalLink>
              <LegalLink to="/terms">Terms of Service</LegalLink>
              <LegalLink to="/cookies">Cookie Policy</LegalLink>
            </LegalLinks>

            <PaymentMethods>
              <PaymentText>We accept:</PaymentText>
              <PaymentIcons>
                <PaymentIcon>💳</PaymentIcon>
                <PaymentIcon>📱</PaymentIcon>
                <PaymentIcon>🔗</PaymentIcon>
              </PaymentIcons>
            </PaymentMethods>
          </BottomContent>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
}

// Clean, modern styled components
const FooterContainer = styled.footer`
  background: #1a1a1a;
  color: #ffffff;
  border-top: 1px solid #333;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const FooterTop = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  padding: 60px 0 40px;
  border-bottom: 1px solid #333;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 40px 0 30px;
  }
`;

const BrandSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const LogoIcon = styled.span`
  font-size: 2.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BrandInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const BrandName = styled.span`
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
`;

const BrandTagline = styled.span`
  font-size: 0.9rem;
  color: #999;
  margin-top: 2px;
`;

const BrandDescription = styled.p`
  color: #999;
  line-height: 1.6;
  font-size: 1rem;
  margin: 0;
  max-width: 400px;
`;

const NewsletterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const NewsletterTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
`;

const NewsletterDescription = styled.p`
  color: #999;
  font-size: 0.95rem;
  margin: 0;
`;

const NewsletterForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 10px;
  background: #2a2a2a;
  border-radius: 8px;
  padding: 5px;
  border: 1px solid #444;

  @media (max-width: 480px) {
    flex-direction: column;
    padding: 15px;
    gap: 15px;
  }
`;

const NewsletterInput = styled.input`
  flex: 1;
  padding: 12px 15px;
  border: none;
  background: transparent;
  color: #ffffff;
  font-size: 1rem;
  outline: none;

  &::placeholder {
    color: #666;
  }
`;

const SubscribeButton = styled(PrimaryButton)`
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  white-space: nowrap;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const FooterMiddle = styled.div`
  padding: 50px 0;
  border-bottom: 1px solid #333;
`;

const LinkGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;

  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const LinkColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ColumnTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
`;

const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LinkItem = styled(Link)`
  color: #999;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s ease;

  &:hover {
    color: #ffffff;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #999;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s ease;

  &:hover {
    color: #ffffff;
  }
`;

const SocialIcon = styled.span`
  font-size: 1.2rem;
`;

const FooterBottom = styled.div`
  padding: 30px 0;
`;

const BottomContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
`;

const Copyright = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const LegalLinks = styled.div`
  display: flex;
  gap: 25px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const LegalLink = styled(Link)`
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;

  &:hover {
    color: #ffffff;
  }
`;

const PaymentMethods = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PaymentText = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const PaymentIcons = styled.div`
  display: flex;
  gap: 5px;
`;

const PaymentIcon = styled.span`
  font-size: 1.2rem;
  opacity: 0.7;
`;