import React from 'react';
import { useNavigate } from 'react-router-dom';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { PATHS } from '../../routes/routePaths';
import CareerHero from '../../shared/components/careers/CareerHero';
import CareerCulture from '../../shared/components/careers/CareerCulture';
import CareerBenefits from '../../shared/components/careers/CareerBenefits';
import CareerDepartments from '../../shared/components/careers/CareerDepartments';
import CareerJobs from '../../shared/components/careers/CareerJobs';
import CareerLife from '../../shared/components/careers/CareerLife';
import CareerCTA from '../../shared/components/careers/CareerCTA';
import {
  CareersPageContainer,
  SectionDivider,
} from './careers.styles';

const CareersPage = () => {
  const navigate = useNavigate();

  useDynamicPageTitle({
    title: "Careers at Saiisai",
    description: "Join Saiisai and build the future of e-commerce in Ghana and Africa. Explore open roles, learn about our culture, and grow your career with us.",
    defaultTitle: "Careers at Saiisai • Saiisai",
    defaultDescription: "Join Saiisai and build the future of e-commerce in Ghana and Africa.",
  });

  return (
    <CareersPageContainer>
      <CareerHero navigate={navigate} />
      <SectionDivider />
      <CareerCulture />
      <SectionDivider />
      <CareerBenefits />
      <SectionDivider />
      <CareerDepartments navigate={navigate} />
      <SectionDivider />
      <CareerJobs navigate={navigate} />
      <SectionDivider />
      <CareerLife />
      <SectionDivider />
      <CareerCTA navigate={navigate} />
    </CareersPageContainer>
  );
};

export default CareersPage;

