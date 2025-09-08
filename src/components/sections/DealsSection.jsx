import React from "react";
import styled from "styled-components";

export default function DealsSection({ products, handleProductClick }) {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Special Deals</SectionTitle>
        <SectionSubtitle>Limited time offers - don't miss out!</SectionSubtitle>
      </SectionHeader>
      <DealsGrid>
        {products
          .filter((product) => product.onSale)
          .slice(0, 4)
          .map((product) => (
            <DealCard key={product._id}>
              <Ribbon>Sale</Ribbon>
              <DealImage src={product.image} alt={product.name} />
              <DealInfo>
                <DealName>{product.name}</DealName>
                <PriceContainer>
                  <OriginalPrice>${product.price}</OriginalPrice>
                  <DiscountPrice>
                    ${(product.price * 0.8).toFixed(2)}
                  </DiscountPrice>
                </PriceContainer>
                <DiscountBadge>20% OFF</DiscountBadge>
                <ViewDealButton onClick={() => handleProductClick(product._id)}>
                  View Deal
                </ViewDealButton>
              </DealInfo>
            </DealCard>
          ))}
      </DealsGrid>
    </Section>
  );
}
const Section = styled.section`
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #fff6e6 0%, #ffe8e8 100%);
  margin: 3rem 0;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2e3a59;
  margin-bottom: 1rem;
`;

const SectionSubtitle = styled.p`
  font-size: 1.2rem;
  color: #6b7280;
`;

const DealsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const DealCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const Ribbon = styled.div`
  position: absolute;
  top: 1rem;
  left: -2.5rem;
  background: #ff4757;
  color: white;
  padding: 0.5rem 3rem;
  font-weight: 600;
  transform: rotate(-45deg);
  box-shadow: 0 2px 10px rgba(255, 71, 87, 0.4);
  z-index: 1;
`;

const DealImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const DealInfo = styled.div`
  padding: 1.5rem;
  text-align: center;
`;

const DealName = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #2e3a59;
`;

const PriceContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const OriginalPrice = styled.span`
  text-decoration: line-through;
  color: #6b7280;
  font-size: 1rem;
`;

const DiscountPrice = styled.span`
  font-size: 1.4rem;
  font-weight: 700;
  color: #ff4757;
`;

const DiscountBadge = styled.span`
  display: inline-block;
  background: #ffe8e8;
  color: #ff4757;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const ViewDealButton = styled.button`
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(37, 117, 252, 0.4);
  }
`;
