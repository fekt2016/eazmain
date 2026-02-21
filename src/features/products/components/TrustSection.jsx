import React from 'react';
import styled from 'styled-components';
import { FaShieldAlt, FaTruck, FaHeadset } from 'react-icons/fa';

const SectionWrapper = styled.section`
  padding: 4rem 1rem; /* py-16 */
  background: white;
  font-family: 'Inter', sans-serif;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`;

const TrustGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: #f8fafc; /* gray-50 */
  border-radius: 12px; /* rounded-xl */
  border: 1px solid #e2e8f0; /* gray-200 */
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    border-color: #ffc400; /* Primary hover accent */
  }
`;

const TrustIcon = styled.div`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  color: #ffc400; /* Primary brand color */
  font-size: 1.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  flex-shrink: 0;
`;

const TrustInfo = styled.div`
  h3 {
    font-size: 1.125rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 0.25rem 0;
  }
  p {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0;
    line-height: 1.4;
  }
`;

const TrustSection = () => {
    return (
        <SectionWrapper>
            <Container>
                <TrustGrid>
                    <TrustItem>
                        <TrustIcon><FaShieldAlt /></TrustIcon>
                        <TrustInfo>
                            <h3>Secure Payment</h3>
                            <p>100% secure payment</p>
                        </TrustInfo>
                    </TrustItem>
                    <TrustItem>
                        <TrustIcon><FaTruck /></TrustIcon>
                        <TrustInfo>
                            <h3>Fast Delivery</h3>
                            <p>Within 24-48 hours</p>
                        </TrustInfo>
                    </TrustItem>
                    <TrustItem>
                        <TrustIcon><FaHeadset /></TrustIcon>
                        <TrustInfo>
                            <h3>24/7 Support</h3>
                            <p>Dedicated support</p>
                        </TrustInfo>
                    </TrustItem>
                </TrustGrid>
            </Container>
        </SectionWrapper>
    );
};

export default TrustSection;
