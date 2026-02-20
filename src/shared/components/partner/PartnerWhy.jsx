import React from 'react';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaMoneyBillWave,
  FaChartLine,
  FaBullhorn,
  FaTruck,
  FaRocket,
} from 'react-icons/fa';
import {
  WhySection,
  WhyContainer,
  WhyTitle,
  WhyDescription,
  WhyGrid,
  WhyCard,
  WhyCardIcon,
  WhyCardTitle,
  WhyCardText,
} from './partner.styles';

const whyData = [
  {
    icon: <FaUsers />,
    title: 'Massive Customer Reach',
    description: 'Access millions of active buyers across Africa. Expand your market reach and grow your customer base exponentially.',
  },
  {
    icon: <FaMoneyBillWave />,
    title: 'Fast Payouts & Secure Payments',
    description: 'Get paid quickly with our secure payment system. Multiple payout options including bank transfers and mobile money.',
  },
  {
    icon: <FaChartLine />,
    title: 'Powerful Seller Dashboard',
    description: 'Manage your business with our intuitive dashboard. Track sales, manage inventory, and analyze performance in real-time.',
  },
  {
    icon: <FaBullhorn />,
    title: 'Marketing & Promotion Tools',
    description: 'Boost your sales with built-in marketing tools. Run promotions, discounts, and featured listings to increase visibility.',
  },
  {
    icon: <FaTruck />,
    title: 'Logistics & Fulfillment Support',
    description: 'Streamlined shipping and delivery solutions. Partner with our logistics network for reliable and fast order fulfillment.',
  },
  {
    icon: <FaRocket />,
    title: 'Zero Hassle Onboarding',
    description: 'Get started in minutes with our simple registration process. No complex paperwork, just quick verification and you\'re ready.',
  },
];

const PartnerWhy = () => {
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
    <WhySection
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={container}
    >
      <WhyContainer>
        <WhyTitle>Why Partner With Saiisai</WhyTitle>
        <WhyDescription>
          Join thousands of successful partners who are growing their businesses with Saiisai
        </WhyDescription>
        <WhyGrid>
          {whyData.map((item, index) => (
            <WhyCard
              key={index}
              variants={fadeUp}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <WhyCardIcon>{item.icon}</WhyCardIcon>
              <WhyCardTitle>{item.title}</WhyCardTitle>
              <WhyCardText>{item.description}</WhyCardText>
            </WhyCard>
          ))}
        </WhyGrid>
      </WhyContainer>
    </WhySection>
  );
};

export default PartnerWhy;

