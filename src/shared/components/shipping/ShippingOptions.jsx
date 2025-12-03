import React from 'react';
import { motion } from 'framer-motion';
import {
  FaTruck,
  FaRocket,
  FaClock,
} from 'react-icons/fa';
import {
  OptionsSection,
  OptionsContainer,
  OptionsTitle,
  OptionsDescription,
  OptionsGrid,
  OptionCard,
  OptionIcon,
  OptionTitle,
  OptionText,
  OptionTimeline,
} from './shipping.styles';

const optionsData = [
  {
    icon: <FaTruck />,
    title: 'Standard Delivery',
    timeline: '1–5 business days',
    description: 'Reliable delivery service available for all products. Delivery time depends on seller location and your shipping address.',
    color: '#0078cc',
  },
  {
    icon: <FaRocket />,
    title: 'Express Delivery',
    timeline: '1–2 business days',
    description: 'Faster delivery option for selected products. Perfect when you need your items quickly. Available at checkout for eligible items.',
    color: '#ffc400',
  },
  {
    icon: <FaClock />,
    title: 'Same-Day Delivery',
    timeline: 'Same day (if available)',
    description: 'Get your order delivered on the same day for selected cities. Order before the cutoff time to qualify. Available in major cities.',
    color: '#00C896',
  },
];

const ShippingOptions = () => {
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
    <OptionsSection
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={container}
    >
      <OptionsContainer>
        <OptionsTitle>Delivery Options</OptionsTitle>
        <OptionsDescription>
          Choose the delivery option that works best for you
        </OptionsDescription>
        <OptionsGrid>
          {optionsData.map((option, index) => (
            <OptionCard
              key={index}
              variants={fadeUp}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <OptionIcon $color={option.color}>
                {option.icon}
              </OptionIcon>
              <OptionTitle>{option.title}</OptionTitle>
              <OptionTimeline>{option.timeline}</OptionTimeline>
              <OptionText>{option.description}</OptionText>
            </OptionCard>
          ))}
        </OptionsGrid>
      </OptionsContainer>
    </OptionsSection>
  );
};

export default ShippingOptions;

