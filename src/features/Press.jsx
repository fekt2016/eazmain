import React from "react";
import styled from "styled-components";
import { FaNewspaper, FaEnvelope, FaPhone, FaMapMarkerAlt, FaDownload } from "react-icons/fa";
import { PATHS } from "../routes/routePaths";
import { toast } from "react-toastify";

const PressContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 120rem;
  margin: 0 auto;
  padding: 0 2rem;
`;

const Header = styled.div`
  text-align: center;
  padding: 4rem 0;
  margin-bottom: 4rem;
`;

const Title = styled.h1`
  font-size: 4rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: #4a5568;
  max-width: 60rem;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const ContentSection = styled.section`
  background: white;
  border-radius: 1.2rem;
  padding: 4rem;
  margin-bottom: 3rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionIcon = styled.div`
  color: #ffc400;
  font-size: 2.5rem;
`;

const Description = styled.p`
  font-size: 1.1rem;
  line-height: 1.8;
  color: #4a5568;
  margin-bottom: 2rem;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const ContactCard = styled.div`
  background: #f7fafc;
  border-radius: 0.8rem;
  padding: 2rem;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const ContactIcon = styled.div`
  color: #ffc400;
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const ContactLabel = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.5rem;
`;

const ContactValue = styled.p`
  font-size: 1rem;
  color: #4a5568;
  margin: 0;
`;

const Link = styled.a`
  color: #ffc400;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  
  &:hover {
    color: #e6b000;
    text-decoration: underline;
  }
`;

const Button = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  background: #ffc400;
  color: #1a202c;
  padding: 1.2rem 2.4rem;
  border-radius: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  margin-top: 1rem;
  
  &:hover {
    background: #e6b000;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 196, 0, 0.4);
  }
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
`;

const ListItem = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid #e2e8f0;
  font-size: 1.1rem;
  color: #4a5568;
  
  &:last-child {
    border-bottom: none;
  }
  
  strong {
    color: #1a202c;
    font-weight: 600;
  }
`;

export default function Press() {
  const handleDownloadMediaKit = async () => {
    try {
      // For now, show a message that this feature is being prepared
      // In the future, this can be connected to an API endpoint that serves the media kit
      toast.info('Media kit download is being prepared. Please contact support for immediate access to media resources.');
      
      // Future implementation when API is ready:
      // const response = await fetch('/api/media-kit/download');
      // if (!response.ok) throw new Error('Download failed');
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = 'eazshop-media-kit.zip';
      // document.body.appendChild(a);
      // a.click();
      // document.body.removeChild(a);
      // window.URL.revokeObjectURL(url);
      // toast.success('Media kit downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download media kit. Please try again later.');
    }
  };

  return (
    <PressContainer>
      <Container>
        <Header>
          <Title>Press & Media</Title>
          <Subtitle>
            Welcome to EazShop's press center. Find the latest news, press releases, 
            media resources, and contact information for media inquiries.
          </Subtitle>
        </Header>

        <ContentSection>
          <SectionTitle>
            <SectionIcon>
              <FaNewspaper />
            </SectionIcon>
            About EazShop
          </SectionTitle>
          <Description>
            EazShop is a leading e-commerce platform revolutionizing the shopping experience 
            in Ghana and beyond. We connect buyers and sellers, offering a seamless, secure, 
            and convenient marketplace for quality products and services.
          </Description>
          <Description>
            Our mission is to make online shopping accessible, reliable, and enjoyable for 
            everyone while empowering local sellers to reach a wider audience and grow their businesses.
          </Description>
        </ContentSection>

        <ContentSection>
          <SectionTitle>
            <SectionIcon>
              <FaDownload />
            </SectionIcon>
            Media Resources
          </SectionTitle>
          <Description>
            Access our media kit, logos, brand guidelines, and press materials:
          </Description>
          <List>
            <ListItem>
              <strong>Brand Guidelines:</strong> Download our complete brand identity guide
            </ListItem>
            <ListItem>
              <strong>Logo Pack:</strong> High-resolution logos in various formats (PNG, SVG)
            </ListItem>
            <ListItem>
              <strong>Press Kit:</strong> Company overview, key statistics, and executive bios
            </ListItem>
            <ListItem>
              <strong>Product Images:</strong> High-quality product and platform screenshots
            </ListItem>
          </List>
          <Button 
            onClick={handleDownloadMediaKit}
          >
            <FaDownload />
            Download Media Kit
          </Button>
        </ContentSection>

        <ContentSection>
          <SectionTitle>
            <SectionIcon>
              <FaNewspaper />
            </SectionIcon>
            Press Inquiries
          </SectionTitle>
          <Description>
            For media inquiries, interview requests, or press-related questions, please contact 
            our press team. We're here to help with:
          </Description>
          <List>
            <ListItem>Company news and announcements</ListItem>
            <ListItem>Executive interviews and quotes</ListItem>
            <ListItem>Product launches and updates</ListItem>
            <ListItem>Partnership announcements</ListItem>
            <ListItem>Industry insights and data</ListItem>
          </List>
        </ContentSection>

        <ContentSection>
          <SectionTitle>Contact Information</SectionTitle>
          <ContactGrid>
            <ContactCard>
              <ContactIcon>
                <FaEnvelope />
              </ContactIcon>
              <ContactLabel>Email</ContactLabel>
              <ContactValue>
                <Link href="mailto:press@eazshop.com">press@eazshop.com</Link>
              </ContactValue>
            </ContactCard>

            <ContactCard>
              <ContactIcon>
                <FaPhone />
              </ContactIcon>
              <ContactLabel>Phone</ContactLabel>
              <ContactValue>
                <Link href="tel:+233XXXXXXXXX">+233 XX XXX XXXX</Link>
              </ContactValue>
            </ContactCard>

            <ContactCard>
              <ContactIcon>
                <FaMapMarkerAlt />
              </ContactIcon>
              <ContactLabel>Address</ContactLabel>
              <ContactValue>
                Accra, Ghana
              </ContactValue>
            </ContactCard>
          </ContactGrid>
        </ContentSection>

        <ContentSection>
          <SectionTitle>Stay Connected</SectionTitle>
          <Description>
            Follow us on social media for the latest updates, news, and announcements:
          </Description>
          <List>
            <ListItem>
              <strong>Twitter:</strong> <Link href="https://twitter.com/eazshop" target="_blank" rel="noopener noreferrer">@eazshop</Link>
            </ListItem>
            <ListItem>
              <strong>Facebook:</strong> <Link href="https://facebook.com/eazshop" target="_blank" rel="noopener noreferrer">EazShop</Link>
            </ListItem>
            <ListItem>
              <strong>Instagram:</strong> <Link href="https://instagram.com/eazshop" target="_blank" rel="noopener noreferrer">@eazshop</Link>
            </ListItem>
            <ListItem>
              <strong>LinkedIn:</strong> <Link href="https://linkedin.com/company/eazshop" target="_blank" rel="noopener noreferrer">EazShop</Link>
            </ListItem>
          </List>
        </ContentSection>
      </Container>
    </PressContainer>
  );
}
