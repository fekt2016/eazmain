import React from 'react';
import { useNavigate } from 'react-router-dom';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { PATHS } from '../../routes/routePaths';
import ShippingHero from '../../shared/components/shipping/ShippingHero';
import ShippingOptions from '../../shared/components/shipping/ShippingOptions';
import ShippingSteps from '../../shared/components/shipping/ShippingSteps';
import ShippingCosts from '../../shared/components/shipping/ShippingCosts';
import ShippingTracking from '../../shared/components/shipping/ShippingTracking';
import ShippingFAQ from '../../shared/components/shipping/ShippingFAQ';
import {
  ShippingPageContainer,
  SectionDivider,
} from './shipping.styles';

const ShippingInfoPage = () => {
  const navigate = useNavigate();

  useDynamicPageTitle({
    title: "Shipping Information",
    description: "Learn about EazShop delivery options, shipping times, costs, and how to track your orders. Fast and reliable shipping across Africa.",
    defaultTitle: "Shipping Information • EazShop",
    defaultDescription: "Understand how delivery works at EazShop",
  });

  return (
    <ShippingPageContainer>
      <ShippingHero />
      <SectionDivider />
      <ShippingOptions />
      <SectionDivider />
      <ShippingSteps />
      <SectionDivider />
      <ShippingCosts />
      <SectionDivider />
      <ShippingTracking navigate={navigate} />
      <SectionDivider />
      <ShippingFAQ />
    </ShippingPageContainer>
  );
};

export default ShippingInfoPage;

