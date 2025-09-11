import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useNewsletter } from "../hooks/useNewsletter";
import Button from "../components/Button";

export default function Footer() {
  const [email, setEmail] = useState("");

  // const [subscribed, setSubscribed] = useState(false);
  const { mutate: newsletterMutation, isPending: isSubscribing } =
    useNewsletter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    newsletterMutation(email, {
      onSuccess: () => {
        console.log("subscribed successfully");
      },
    });
    setEmail("");

    // Reset message after 3s
    // setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <Container>
      <FooterGrid>
        {/* Brand + Social */}
        <FooterColumn>
          <FooterTitle>EazShop</FooterTitle>
          <FooterText>
            Your one-stop destination for all your shopping needs. Discover
            thousands of products from trusted sellers.
          </FooterText>
          <SocialLinks>
            <SocialLink
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              brandColor="#3b5998"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </SocialLink>
            <SocialLink
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              brandColor="#1da1f2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </SocialLink>
            <SocialLink
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              brandColor="#e4405f"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </SocialLink>
            <SocialLink
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              brandColor="#cd201f"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </SocialLink>
          </SocialLinks>
        </FooterColumn>

        {/* Other Columns */}
        <FooterColumn>
          <FooterTitle>Company Info</FooterTitle>
          <FooterLinks>
            <FooterLink to="/">Home</FooterLink>
            <FooterLink to="/shops">Shop</FooterLink>
            <FooterLink to="/about">About Us</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
            <FooterLink to="/press">Press center</FooterLink>
            <FooterLink to="/company">Company Detail</FooterLink>
            <FooterLink to="/partners">Partners</FooterLink>
          </FooterLinks>
        </FooterColumn>

        <FooterColumn>
          <FooterTitle>Help</FooterTitle>
          <FooterLinks>
            <FooterLink to="/support">Support</FooterLink>
            <FooterLink to="/support">FAQs</FooterLink>
            <FooterLink to="/shops">Safety Center</FooterLink>
            <FooterLink to="/about">Eaz shop purchase protection</FooterLink>
            <FooterLink to="/contact">Site Map</FooterLink>
            <FooterLink to="/support">Sell on Eaz Shop</FooterLink>
            <FooterLink to="/support">Eaz Shop</FooterLink>
          </FooterLinks>
        </FooterColumn>

        <FooterColumn>
          <FooterTitle>Customer Care</FooterTitle>
          <FooterLinks>
            <FooterLink to="/refund">Refund policy</FooterLink>
            <FooterLink to="/terms">Terms & conditions</FooterLink>
            <FooterLink to="/privacy">Privacy policy</FooterLink>
            <FooterLink to="/shipping">Report suspicious activity</FooterLink>
            <FooterLink to="/shipping">Shipping policy</FooterLink>
          </FooterLinks>
        </FooterColumn>

        {/* Newsletter */}
        <FooterColumn>
          <FooterTitle>Newsletter</FooterTitle>
          <FooterText>
            Subscribe to our newsletter for the latest products, offers and
            news.
          </FooterText>
          <NewsletterForm onSubmit={handleSubmit}>
            <InputGroup>
              <EmailInput
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email address"
              />
              <Button isLoading={isSubscribing}>Subscribe</Button>
            </InputGroup>
            {isSubscribing && (
              <SuccessMessage role="status">
                Thank you for subscribing!
              </SuccessMessage>
            )}
          </NewsletterForm>
          <PrivacyText>
            By subscribing, you agree to our{" "}
            <PrivacyLink to="/privacy">Privacy Policy</PrivacyLink>.
          </PrivacyText>
        </FooterColumn>
      </FooterGrid>

      <Copyright>
        © {new Date().getFullYear()} EazShop. All rights reserved.
      </Copyright>
    </Container>
  );
}

/* ---------- Styled Components ---------- */

const Container = styled.footer`
  background-color: var(--color-brand-600);
  color: var(--color-white-0);
  padding: 5rem 5% 0;

  @media (max-width: 768px) {
    padding: 2rem 2rem 0;
  }
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;

  @media (max-width: 480px) {
    gap: 2rem;
  }
`;

const FooterColumn = styled.div``;

const FooterTitle = styled.h3`
  font-size: 2rem;
  margin-bottom: 2rem;
  position: relative;
  /* padding-bottom: 1rem; */
  color: var(--color-primary-500);

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 5rem;
    height: 0.2rem;
    background: var(--color-primary-500);
  }
`;

const FooterText = styled.p`
  margin-bottom: 1rem;
  line-height: 1.8;
  color: var(--color-grey-200);
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: ${(props) => props.brandColor};
  color: var(--color-white-0);
  text-decoration: none;
  transition: transform 0.3s, opacity 0.3s;

  &:hover {
    transform: translateY(-3px);
    opacity: 0.85;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FooterLink = styled(Link)`
  color: var(--color-grey-400);
  text-decoration: none;
  transition: color 0.3s;
  display: flex;
  align-items: center;

  &:hover {
    color: var(--color-primary-500);
  }

  &::before {
    content: "→";
    margin-right: 1rem;
    color: var(--color-primary-500);
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding: 2rem 0;
  border-top: 1px solid var(--color-primary-500);
  color: var(--color-primary-500);
  font-size: 1.4rem;
`;

const NewsletterForm = styled.form`
  margin-bottom: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;

  @media (max-width: 48rem) {
    flex-direction: column;
  }
`;

const EmailInput = styled.input`
  flex: 1;
  padding: 1.2rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1.4rem;
  background-color: var(--color-brand-500);
  color: var(--color-white-0);
  border: 1px solid var(--color-brand-400);

  &::placeholder {
    color: var(--color-grey-400);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    background-color: var(--color-brand-400);
  }
`;

const SubscribeButton = styled.button`
  padding: 1.2rem 1.8rem;
  border: none;
  border-radius: 0.5rem;
  background-color: var(--color-primary-500);
  color: var(--color-white-0);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;

  &:hover {
    background-color: var(--color-primary-600);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SuccessMessage = styled.p`
  color: var(--color-primary-400);
  font-size: 1.4rem;
  margin-top: 0.5rem;
  font-weight: 500;
`;

const PrivacyText = styled.p`
  font-size: 1.2rem;
  color: var(--color-grey-400);
  line-height: 1.6;
`;

const PrivacyLink = styled(Link)`
  color: var(--color-primary-500);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
