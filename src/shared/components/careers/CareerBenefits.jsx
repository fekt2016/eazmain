import React from 'react';
import { motion } from 'framer-motion';
import {
  FaDollarSign,
  FaClock,
  FaHeartbeat,
  FaGraduationCap,
  FaLaptop,
  FaCode,
  FaPalette,
  FaChartLine,
} from 'react-icons/fa';
import {
  BenefitsSection,
  BenefitsContainer,
  BenefitsTitle,
  BenefitsDescription,
  BenefitsGrid,
  BenefitCard,
  BenefitIcon,
  BenefitTitle,
} from './careers.styles';

const benefitsData = [
  { icon: <FaDollarSign />, title: 'Competitive Salary' },
  { icon: <FaClock />, title: 'Flexible Work' },
  { icon: <FaHeartbeat />, title: 'Health Support' },
  { icon: <FaGraduationCap />, title: 'Professional Growth' },
  { icon: <FaLaptop />, title: 'Remote-Friendly' },
  { icon: <FaCode />, title: 'Modern Tech Stack' },
  { icon: <FaPalette />, title: 'Creative Team' },
  { icon: <FaChartLine />, title: 'Fast Career Advancement' },
];

const CareerBenefits = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  return (
    <BenefitsSection
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={container}
    >
      <BenefitsContainer>
        <BenefitsTitle>Benefits & Perks</BenefitsTitle>
        <BenefitsDescription>
          We invest in our team's success and well-being
        </BenefitsDescription>
        <BenefitsGrid>
          {benefitsData.map((benefit, index) => (
            <BenefitCard
              key={index}
              variants={fadeUp}
              whileHover={{ y: -3, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <BenefitIcon>{benefit.icon}</BenefitIcon>
              <BenefitTitle>{benefit.title}</BenefitTitle>
            </BenefitCard>
          ))}
        </BenefitsGrid>
      </BenefitsContainer>
    </BenefitsSection>
  );
};

export default CareerBenefits;

