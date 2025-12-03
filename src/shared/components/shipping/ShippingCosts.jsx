import React from 'react';
import { motion } from 'framer-motion';
import {
  CostsSection,
  CostsContainer,
  CostsTitle,
  CostsDescription,
  CostsGrid,
  CostCard,
  CostType,
  CostAmount,
  CostDetails,
  CostNote,
} from './shipping.styles';

const costsData = [
  {
    type: 'Standard Delivery',
    amount: 'Free',
    details: 'Free shipping on orders over ₵200. Otherwise, shipping fees vary by seller and location.',
  },
  {
    type: 'Express Delivery',
    amount: 'From ₵15',
    details: 'Faster delivery option with additional fees. Exact cost shown at checkout based on your location.',
  },
  {
    type: 'Same-Day Delivery',
    amount: 'From ₵25',
    details: 'Premium same-day service available in select cities. Fee depends on distance and order size.',
  },
];

const ShippingCosts = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <CostsSection
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={container}
    >
      <CostsContainer>
        <CostsTitle>Shipping Costs</CostsTitle>
        <CostsDescription>
          Transparent pricing for all delivery options
        </CostsDescription>
        <CostsGrid>
          {costsData.map((cost, index) => (
            <CostCard
              key={index}
              variants={fadeUp}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <CostType>{cost.type}</CostType>
              <CostAmount>{cost.amount}</CostAmount>
              <CostDetails>{cost.details}</CostDetails>
            </CostCard>
          ))}
        </CostsGrid>
        <CostNote>
          * Shipping costs are calculated at checkout based on your delivery address, order weight, and selected delivery option. Some sellers may offer free shipping on specific products.
        </CostNote>
      </CostsContainer>
    </CostsSection>
  );
};

export default ShippingCosts;

