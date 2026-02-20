import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { PATHS } from '../../routes/routePaths';
import PartnerHero from '../../shared/components/partner/PartnerHero';
import PartnerWhy from '../../shared/components/partner/PartnerWhy';
import PartnerCategories from '../../shared/components/partner/PartnerCategories';
import PartnerHowItWorks from '../../shared/components/partner/PartnerHowItWorks';
import PartnerRequirements from '../../shared/components/partner/PartnerRequirements';
import PartnerCTA from '../../shared/components/partner/PartnerCTA';
import {
  PartnerPageContainer,
  SectionDivider,
} from './partner.styles';

const PartnerPage = () => {
  const navigate = useNavigate();

  useDynamicPageTitle({
    title: "Partner With Saiisai",
    description: "Join Saiisai as a seller, logistics partner, or brand. Reach thousands of customers, grow your business, and scale with Ghana's leading e-commerce platform.",
    defaultTitle: "Partner With Saiisai • Saiisai",
    defaultDescription: "Partner with Saiisai and grow your business",
  });

  return (
    <PartnerPageContainer>
      <PartnerHero navigate={navigate} />
      <SectionDivider />
      <PartnerWhy />
      <SectionDivider />
      <PartnerCategories navigate={navigate} />
      <SectionDivider />
      <PartnerHowItWorks />
      <SectionDivider />
      <PartnerRequirements />
      <SectionDivider />
      <PartnerCTA navigate={navigate} />
    </PartnerPageContainer>
  );
};

export default PartnerPage;

