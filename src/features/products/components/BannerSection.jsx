import React from 'react';
import styled from 'styled-components';
import AdBanner from '../../home/AdBanner'; // Existing ad banner component

const SectionWrapper = styled.section`
  padding: 4rem 1rem; /* py-16 */
  background: white;
  font-family: 'Inter', sans-serif;
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`;

const SkeletonBanner = styled.div`
  width: 100%;
  height: 250px; /* Standard banner height */
  background: #f1f5f9; /* gray-100 */
  border-radius: 12px; /* rounded-xl */
`;

const BannerContainer = styled.div`
  /* Override inner ad styles to enforce strict border radius and shadow constraints */
  & > div {
    border-radius: 12px !important; /* rounded-xl */
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important; /* shadow-md for banners */
    border: none !important;
  }
`;

const BannerSection = ({ bannerAds, isLoading }) => {
  if (isLoading) {
    return (
      <SectionWrapper>
        <Container>
          <SkeletonBanner />
        </Container>
      </SectionWrapper>
    );
  }

  if (!bannerAds || bannerAds.length === 0) {
    return null;
  }

  // Just render the first banner ad as per the old logic, wrapped in new styling
  return (
    <SectionWrapper>
      <Container>
        <BannerContainer>
          <AdBanner ad={bannerAds[0]} />
        </BannerContainer>
      </Container>
    </SectionWrapper>
  );
};

export default BannerSection;
