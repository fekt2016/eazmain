import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';
import {
  RequirementsSection,
  RequirementsContainer,
  RequirementsTitle,
  RequirementsDescription,
  RequirementsGrid,
  RequirementItem,
  RequirementIcon,
  RequirementText,
} from './partner.styles';

const requirementsData = [
  'Valid business registration and details',
  'Product inventory or service catalog',
  'Bank account or payment details',
  'Ghana Mobile Money or Paystack-ready account',
  'National ID or Business Certificate',
  'Reliable logistics capacity (for delivery partners)',
  'Active business license (where applicable)',
  'Tax identification number (TIN)',
];

const PartnerRequirements = () => {
  const fadeUp = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
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
    <RequirementsSection
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={container}
    >
      <RequirementsContainer>
        <RequirementsTitle>Requirements</RequirementsTitle>
        <RequirementsDescription>
          Ensure you have the following ready before applying
        </RequirementsDescription>
        <RequirementsGrid>
          {requirementsData.map((requirement, index) => (
            <RequirementItem
              key={index}
              variants={fadeUp}
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <RequirementIcon>
                <FaCheck />
              </RequirementIcon>
              <RequirementText>{requirement}</RequirementText>
            </RequirementItem>
          ))}
        </RequirementsGrid>
      </RequirementsContainer>
    </RequirementsSection>
  );
};

export default PartnerRequirements;

