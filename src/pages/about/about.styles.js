import styled from 'styled-components';
import { motion } from 'framer-motion';
import { devicesMax } from '../../shared/styles/breakpoint';

/**
 * Styled components for About Page
 * Premium, modern design inspired by Shopify, Stripe, Notion, and Airbnb
 */

// Main Container
export const AboutContainer = styled.div`
  min-height: 100vh;
  background: var(--color-white-0);
  overflow-x: hidden;
`;

// Hero Section
export const HeroSection = styled(motion.section)`
  position: relative;
  padding: var(--spacing-3xl) var(--spacing-lg);
  background: linear-gradient(135deg, 
    var(--color-primary-50) 0%, 
    var(--color-white-0) 50%,
    var(--primary-50) 100%
  );
  text-align: center;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 50%, rgba(255, 196, 0, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 50%, rgba(0, 120, 204, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
  
  @media ${devicesMax.md} {
    padding: var(--spacing-2xl) var(--spacing-md);
  }
`;

export const HeroContent = styled.div`
  max-width: 120rem;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

export const HeroTitle = styled(motion.h1)`
  font-size: var(--font-size-4xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-md);
  line-height: 1.2;
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-3xl);
  }
  
  @media ${devicesMax.sm} {
    font-size: var(--font-size-2xl);
  }
`;

export const HeroSubtitle = styled(motion.p)`
  font-size: var(--font-size-xl);
  color: var(--color-grey-600);
  max-width: 80rem;
  margin: 0 auto;
  line-height: 1.6;
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-lg);
  }
  
  @media ${devicesMax.sm} {
    font-size: var(--font-size-md);
  }
`;

// Section Wrapper
export const SectionWrapper = styled(motion.section)`
  padding: var(--spacing-3xl) var(--spacing-lg);
  max-width: 120rem;
  margin: 0 auto;
  
  @media ${devicesMax.md} {
    padding: var(--spacing-2xl) var(--spacing-md);
  }
`;

export const SectionTitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-lg);
  text-align: center;
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const SectionDescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  text-align: center;
  max-width: 70rem;
  margin: 0 auto var(--spacing-xl);
  line-height: 1.7;
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
  }
`;

// Company Overview Section
export const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  align-items: center;
  
  @media ${devicesMax.md} {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
`;

export const OverviewContent = styled.div`
  h3 {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-bold);
    color: var(--color-grey-900);
    margin-bottom: var(--spacing-md);
  }
  
  p {
    font-size: var(--font-size-md);
    color: var(--color-grey-600);
    line-height: 1.7;
    margin-bottom: var(--spacing-md);
  }
  
  ul {
    list-style: none;
    padding: 0;
    
    li {
      font-size: var(--font-size-md);
      color: var(--color-grey-700);
      margin-bottom: var(--spacing-sm);
      padding-left: var(--spacing-lg);
      position: relative;
      
      &::before {
        content: '✓';
        position: absolute;
        left: 0;
        color: var(--color-primary-500);
        font-weight: var(--font-bold);
      }
    }
  }
`;

export const OverviewImage = styled(motion.div)`
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  background: var(--color-grey-100);
  aspect-ratio: 4 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-400);
  font-size: var(--font-size-lg);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// Mission & Vision Cards
export const MissionVisionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  
  @media ${devicesMax.md} {
    grid-template-columns: 1fr;
  }
`;

export const MissionCard = styled(motion.div)`
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-grey-200);
  transition: all var(--transition-base);
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
  }
  
  h3 {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-bold);
    color: var(--color-grey-900);
    margin-bottom: var(--spacing-md);
  }
  
  p {
    font-size: var(--font-size-md);
    color: var(--color-grey-600);
    line-height: 1.7;
  }
`;

// Core Values Section
export const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
  
  @media ${devicesMax.md} {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

export const ValueCard = styled(motion.div)`
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  text-align: center;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-grey-200);
  transition: all var(--transition-base);
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
  }
`;

export const ValueIcon = styled.div`
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  background: ${props => props.$bgColor || 'var(--color-primary-50)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-md);
  color: ${props => props.$iconColor || 'var(--color-primary-500)'};
  font-size: var(--font-size-2xl);
`;

export const ValueTitle = styled.h3`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-sm);
`;

export const ValueDescription = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  line-height: 1.6;
`;

// Timeline Section
export const TimelineContainer = styled.div`
  position: relative;
  padding: var(--spacing-xl) 0;
  
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--color-grey-300);
    transform: translateX(-50%);
    
    @media ${devicesMax.md} {
      left: 2rem;
    }
  }
`;

export const TimelineGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  position: relative;
  
  @media ${devicesMax.md} {
    grid-template-columns: 1fr;
    padding-left: var(--spacing-xl);
  }
`;

export const TimelineItem = styled(motion.div)`
  position: relative;
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-grey-200);
  
  ${props => props.$isEven ? `
    grid-column: 2;
    
    @media ${devicesMax.md} {
      grid-column: 1;
    }
  ` : `
    grid-column: 1;
  `}
  
  &::before {
    content: '';
    position: absolute;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    background: var(--color-primary-500);
    border: 4px solid var(--color-white-0);
    box-shadow: 0 0 0 2px var(--color-primary-500);
    ${props => props.$isEven ? `
      left: -3.2rem;
    ` : `
      right: -3.2rem;
    `}
    top: var(--spacing-lg);
    
    @media ${devicesMax.md} {
      left: -3.2rem !important;
      right: auto !important;
    }
  }
`;

export const TimelineYear = styled.div`
  font-size: var(--font-size-lg);
  font-weight: var(--font-bold);
  color: var(--color-primary-500);
  margin-bottom: var(--spacing-xs);
`;

export const TimelineTitle = styled.h3`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-sm);
`;

export const TimelineDescription = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  line-height: 1.6;
`;

// Team Section
export const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));
  gap: var(--spacing-xl);
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

export const TeamCard = styled(motion.div)`
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-lg);
  text-align: center;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-grey-200);
  transition: all var(--transition-base);
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-8px);
  }
`;

export const TeamImage = styled.div`
  width: 12rem;
  height: 12rem;
  border-radius: 50%;
  background: var(--color-grey-200);
  margin: 0 auto var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 4px solid var(--color-grey-100);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &::before {
    content: '👤';
    font-size: 4rem;
    color: var(--color-grey-400);
  }
`;

export const TeamName = styled.h3`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-xs);
`;

export const TeamRole = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-primary-500);
  font-weight: var(--font-semibold);
  margin-bottom: var(--spacing-sm);
`;

export const TeamBio = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  line-height: 1.6;
`;

// Metrics Section
export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-xl);
  
  @media ${devicesMax.md} {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

export const MetricCard = styled(motion.div)`
  text-align: center;
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, 
    var(--color-primary-50) 0%, 
    var(--color-white-0) 100%
  );
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--color-grey-200);
`;

export const MetricNumber = styled.div`
  font-size: var(--font-size-4xl);
  font-weight: var(--font-bold);
  color: var(--color-primary-500);
  margin-bottom: var(--spacing-sm);
  line-height: 1;
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-3xl);
  }
`;

export const MetricLabel = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-700);
  font-weight: var(--font-semibold);
`;

// CTA Section
export const CTASection = styled(motion.section)`
  background: linear-gradient(135deg, 
    var(--color-primary-500) 0%, 
    var(--color-primary-600) 100%
  );
  padding: var(--spacing-3xl) var(--spacing-lg);
  text-align: center;
  color: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  margin: var(--spacing-3xl) var(--spacing-lg);
  max-width: 120rem;
  margin-left: auto;
  margin-right: auto;
  
  @media ${devicesMax.md} {
    padding: var(--spacing-2xl) var(--spacing-md);
    margin: var(--spacing-2xl) var(--spacing-md);
  }
`;

export const CTATitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-md);
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const CTASubtitle = styled.p`
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xl);
  opacity: 0.95;
  max-width: 60rem;
  margin-left: auto;
  margin-right: auto;
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
  }
`;

export const CTAButtons = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
`;

export const CTAButton = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  background: ${props => props.$variant === 'outline' 
    ? 'transparent' 
    : 'var(--color-white-0)'};
  color: ${props => props.$variant === 'outline' 
    ? 'var(--color-white-0)' 
    : 'var(--color-primary-500)'};
  border: 2px solid var(--color-white-0);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  text-decoration: none;
  transition: all var(--transition-base);
  
  &:hover {
    background: ${props => props.$variant === 'outline' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'var(--color-grey-50)'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

