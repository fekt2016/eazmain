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
  color: #b0b3b8;

  &::before {
    content: "•";
    margin-right: 10px;
    color: #1cc88a;
    font-size: 20px;
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding: 25px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #b0b3b8;
  font-size: 14px;
`;
const FooterLink = styled.a`
  color: #b0b3b8;
  text-decoration: none;
  transition: color 0.3s;
  display: flex;
  align-items: center;

  &:hover {
    color: white;
  }

  &::before {
    content: "→";
    margin-right: 10px;
    color: #1cc88a;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;
const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
  transition: all 0.3s;

  &:hover {
    background: #4e73df;
    transform: translateY(-3px);
  }
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FooterText = styled.p`
  color: #b0b3b8;
  margin-bottom: 20px;
  line-height: 1.8;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 15px;
`;
const Container = styled.footer`
  background: #2e3a59;
  color: white;
  padding: 70px 5% 0;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 60px;
`;

const FooterColumn = styled.div``;

const FooterTitle = styled.h3`
  font-size: 20px;
  margin-bottom: 25px;
  position: relative;
  padding-bottom: 10px;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50px;
    height: 2px;
    background: #1cc88a;
  }
`;
