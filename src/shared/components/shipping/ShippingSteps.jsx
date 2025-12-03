import React from 'react';
import { motion } from 'framer-motion';
import {
  FaShoppingCart,
  FaBox,
  FaShippingFast,
  FaHome,
} from 'react-icons/fa';
import {
  StepsSection,
  StepsContainer,
  StepsTitle,
  StepsDescription,
  StepsGrid,
  StepCard,
  StepNumber,
  StepIcon,
  StepTitle,
  StepText,
  StepConnector,
} from './shipping.styles';

const stepsData = [
  {
    icon: <FaShoppingCart />,
    number: '01',
    title: 'Order Placed',
    description: 'You place your order and receive a confirmation email with your order details.',
  },
  {
    icon: <FaBox />,
    number: '02',
    title: 'Seller Prepares',
    description: 'The seller receives your order and prepares your items for shipment.',
  },
  {
    icon: <FaShippingFast />,
    number: '03',
    title: 'Order Shipped',
    description: 'Your order is shipped and you receive a tracking number to monitor delivery.',
  },
  {
    icon: <FaHome />,
    number: '04',
    title: 'Delivered',
    description: 'Your order arrives at your specified address. You can track the entire journey.',
  },
];

const ShippingSteps = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <StepsSection
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <StepsContainer>
        <StepsTitle>How Shipping Works</StepsTitle>
        <StepsDescription>
          A simple 4-step process from order to delivery
        </StepsDescription>
        <StepsGrid>
          {stepsData.map((step, index) => (
            <React.Fragment key={index}>
              <StepCard
                variants={fadeUp}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <StepNumber>{step.number}</StepNumber>
                <StepIcon>{step.icon}</StepIcon>
                <StepTitle>{step.title}</StepTitle>
                <StepText>{step.description}</StepText>
              </StepCard>
              {index < stepsData.length - 1 && <StepConnector />}
            </React.Fragment>
          ))}
        </StepsGrid>
      </StepsContainer>
    </StepsSection>
  );
};

export default ShippingSteps;

