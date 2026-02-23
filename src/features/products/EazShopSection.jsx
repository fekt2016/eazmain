import React from "react";
import styled from "styled-components";

const Section = styled.section`
  margin: 3rem 0;
  padding: 2rem 1.5rem;
  border-radius: 16px;
  background: linear-gradient(135deg, #fef3c7, #e0f2fe);
  border: 1px solid rgba(148, 163, 184, 0.3);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #0f172a;
`;

const Description = styled.p`
  margin: 0;
  color: #4b5563;
  font-size: 0.95rem;
`;

const EazShopSection = () => {
  return (
    <Section>
      <Title>Saiisai Only (EazShop)</Title>
      <Description>
        Curated products sold and fulfilled directly by Saiisai. This section is under active
        development and will surface highlighted EazShop offers.
      </Description>
    </Section>
  );
};

export default EazShopSection;

