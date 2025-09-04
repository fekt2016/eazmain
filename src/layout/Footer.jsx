import React from "react";
import styled from "styled-components";

export default function Footer() {
  return (
    <Container>
      <FooterGrid>
        <FooterColumn>
          <FooterTitle>EazShop</FooterTitle>
          <FooterText>
            Your one-stop destination for all your shopping needs. Discover
            thousands of products from trusted sellers.
          </FooterText>
          <SocialLinks>
            <SocialLink href="#">
              <i>📱</i>
            </SocialLink>
            <SocialLink href="#">
              <i>📘</i>
            </SocialLink>
            <SocialLink href="#">
              <i>📸</i>
            </SocialLink>
            <SocialLink href="#">
              <i>🐦</i>
            </SocialLink>
          </SocialLinks>
        </FooterColumn>

        <FooterColumn>
          <FooterTitle>Quick Links</FooterTitle>
          <FooterLinks>
            <FooterLink href="#">Home</FooterLink>
            <FooterLink href="#">Shop</FooterLink>
            <FooterLink href="#">About Us</FooterLink>
            <FooterLink href="#">Contact</FooterLink>
            <FooterLink href="#">FAQs</FooterLink>
          </FooterLinks>
        </FooterColumn>

        <FooterColumn>
          <FooterTitle>Categories</FooterTitle>
          <FooterLinks>
            <FooterLink href="#">Electronics</FooterLink>
            <FooterLink href="#">Fashion</FooterLink>
            <FooterLink href="#">Home & Kitchen</FooterLink>
            <FooterLink href="#">Beauty</FooterLink>
            <FooterLink href="#">Sports</FooterLink>
          </FooterLinks>
        </FooterColumn>

        <FooterColumn>
          <FooterTitle>Contact Us</FooterTitle>
          <ContactInfo>
            <ContactItem>📌 E1/12 Nima highway Street, Accra</ContactItem>
            <ContactItem>📞 0244388190</ContactItem>
            <ContactItem>✉️ eazworld.com</ContactItem>
            <ContactItem>🕒 Mon-Fri: 9AM - 6PM</ContactItem>
          </ContactInfo>
        </FooterColumn>
      </FooterGrid>

      <Copyright>
        © {new Date().getFullYear()} eazShop. All rights reserved.
      </Copyright>
    </Container>
  );
}

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  color: var(--color-grey-400);
  transition: color 0.3s;

  &::before {
    content: "•";
    margin-right: 1rem;
    color: var(--color-primary-500);
    font-size: 2rem;
  }
  &:hover {
    color: var(--color-primary-500);
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding: 2.5rem 0;
  border-top: 1px solid var(--color-primary-100);
  color: var(--color-grey-400);
  font-size: 1.4rem;
`;
const FooterLink = styled.a`
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

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;
const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: var(--color-brand-400);
  color: var(--color-white-0);
  text-decoration: none;
  transition: all 0.3s;

  &:hover {
    background-color: var(--color-brand-400);
    transform: translateY(-3px);
  }
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const FooterText = styled.p`
  /* color: var(--color-brand-200); */
  margin-bottom: 2rem;
  line-height: 1.8;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 15px;
`;
const Container = styled.footer`
  background-color: var(--color-brand-600);
  color: var(--color-white-0);
  padding: 7rem 5% 0;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 4rem;
  margin-bottom: 6rem;
`;

const FooterColumn = styled.div``;

const FooterTitle = styled.h3`
  font-size: 2rem;
  margin-bottom: 2.5rem;
  position: relative;
  padding-bottom: 1rem;
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
