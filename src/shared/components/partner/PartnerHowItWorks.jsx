import React from 'react';
import { motion } from 'framer-motion';
import {
  FaUserPlus,
  FaFileAlt,
  FaCheckCircle,
  FaRocket,
} from 'react-icons/fa';
import {
  HowItWorksSection,
  HowItWorksContainer,
  HowItWorksTitle,
  HowItWorksDescription,
  StepsContainer,
  StepCard,
  StepNumber,
  StepIcon,
  StepTitle,
  StepDescription,
  StepConnector,
} from './partner.styles';

const stepsData = [
  {
    icon: <FaUserPlus />,
    number: '01',
    title: 'Register',
    description: 'Create your partner account with basic business information. It only takes a few minutes.',
  },
  {
    icon: <FaFileAlt />,
    number: '02',
    title: 'Submit Business Info',
    description: 'Complete your business profile with details about your products, services, or capabilities.',
  },
  {
    icon: <FaCheckCircle />,
    number: '03',
    title: 'Verification & Approval',
    description: 'Our team reviews your application and verifies your business credentials. Usually takes 1-3 business days.',
  },
  {
    icon: <FaRocket />,
    number: '04',
    title: 'Start Selling / Start Partnering',
    description: 'Once approved, you can immediately start listing products, accepting orders, or providing services.',
  },
];

const PartnerHowItWorks = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <HowItWorksSection
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <HowItWorksContainer>
        <HowItWorksTitle>How It Works</HowItWorksTitle>
        <HowItWorksDescription>
          Get started in four simple steps
        </HowItWorksDescription>
        <StepsContainer>
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
                <StepDescription>{step.description}</StepDescription>
              </StepCard>
              {index < stepsData.length - 1 && <StepConnector />}
            </React.Fragment>
          ))}
        </StepsContainer>
      </HowItWorksContainer>
    </HowItWorksSection>
  );
};

export default PartnerHowItWorks;

