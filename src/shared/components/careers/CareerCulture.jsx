import React from 'react';
import { motion } from 'framer-motion';
import {
  FaLightbulb,
  FaUsers,
  FaHandshake,
  FaRocket,
} from 'react-icons/fa';
import {
  CultureSection,
  CultureContainer,
  CultureTitle,
  CultureDescription,
  CultureGrid,
  CultureCard,
  CultureIcon,
  CultureCardTitle,
  CultureCardText,
} from './careers.styles';

const cultureData = [
  {
    icon: <FaLightbulb />,
    title: 'Innovation & Impact',
    description: 'We build cutting-edge solutions that transform how people shop and sell across Africa. Every line of code, every feature, makes a real difference.',
  },
  {
    icon: <FaUsers />,
    title: 'Customer First Always',
    description: 'Our customers are at the heart of everything we do. We listen, learn, and iterate to deliver exceptional experiences that exceed expectations.',
  },
  {
    icon: <FaHandshake />,
    title: 'Team Collaboration',
    description: 'We believe in the power of diverse teams. Collaboration, respect, and open communication drive our success and create an inclusive environment.',
  },
  {
    icon: <FaRocket />,
    title: 'Learn & Grow Fast',
    description: 'We move fast, learn faster, and grow together. Continuous learning, mentorship, and challenging projects help you reach your full potential.',
  },
];

const CareerCulture = () => {
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
    <CultureSection
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={container}
    >
      <CultureContainer>
        <CultureTitle>Our Culture</CultureTitle>
        <CultureDescription>
          We're building more than a marketplace—we're creating opportunities and transforming commerce across Africa
        </CultureDescription>
        <CultureGrid>
          {cultureData.map((item, index) => (
            <CultureCard
              key={index}
              variants={fadeUp}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <CultureIcon>{item.icon}</CultureIcon>
              <CultureCardTitle>{item.title}</CultureCardTitle>
              <CultureCardText>{item.description}</CultureCardText>
            </CultureCard>
          ))}
        </CultureGrid>
      </CultureContainer>
    </CultureSection>
  );
};

export default CareerCulture;

