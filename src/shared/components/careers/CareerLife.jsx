import React from 'react';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaLaptop,
  FaShoppingBag,
} from 'react-icons/fa';
import {
  LifeSection,
  LifeContainer,
  LifeTitle,
  LifeDescription,
  LifeGrid,
  LifeCard,
  LifeIcon,
  LifeCardTitle,
  LifeCardText,
} from './careers.styles';

const lifeData = [
  {
    icon: <FaUsers />,
    title: 'Teamwork',
    description: 'Collaborate with talented individuals from diverse backgrounds. We believe great ideas come from great teams working together.',
  },
  {
    icon: <FaLaptop />,
    title: 'Remote Working',
    description: 'Work from anywhere in Africa. We provide the tools and flexibility you need to do your best work, whether at home or in our offices.',
  },
  {
    icon: <FaShoppingBag />,
    title: 'E-commerce Innovation',
    description: 'Build the future of online shopping. Every feature you ship impacts millions of buyers and sellers across the continent.',
  },
];

const CareerLife = () => {
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
    <LifeSection
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={container}
    >
      <LifeContainer>
        <LifeTitle>Life at EazShop</LifeTitle>
        <LifeDescription>
          Experience what it's like to work with a team that's transforming e-commerce
        </LifeDescription>
        <LifeGrid>
          {lifeData.map((item, index) => (
            <LifeCard
              key={index}
              variants={fadeUp}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <LifeIcon>{item.icon}</LifeIcon>
              <LifeCardTitle>{item.title}</LifeCardTitle>
              <LifeCardText>{item.description}</LifeCardText>
            </LifeCard>
          ))}
        </LifeGrid>
      </LifeContainer>
    </LifeSection>
  );
};

export default CareerLife;

