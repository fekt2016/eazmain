import styled from 'styled-components';
import { motion } from 'framer-motion';
import { devicesMax } from '../../shared/styles/breakpoint';

/**
 * Styled components for Product Care Page
 * Clean, educational, professional design for e-commerce knowledge section
 */

// Main Container
export const ProductCareContainer = styled.div`
  min-height: 100vh;
  background: var(--color-white-0);
  overflow-x: hidden;
`;

// Hero Section
export const HeroSection = styled(motion.section)`
  position: relative;
  padding: var(--spacing-3xl) var(--spacing-lg);
  background: linear-gradient(135deg, 
    var(--color-green-100) 0%, 
    var(--color-white-0) 50%,
    var(--color-primary-50) 100%
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
    background: radial-gradient(circle at 30% 50%, rgba(56, 161, 105, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 70% 50%, rgba(255, 196, 0, 0.1) 0%, transparent 50%);
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

export const HeroIcon = styled(motion.div)`
  font-size: 6rem;
  color: var(--color-primary-500);
  margin-bottom: var(--spacing-lg);
  display: flex;
  justify-content: center;
  
  @media ${devicesMax.md} {
    font-size: 4rem;
  }
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

// Category Grid
export const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
  
  @media ${devicesMax.md} {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
  }
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

export const CategoryCard = styled(motion.div)`
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-grey-200);
  text-align: center;
  transition: all var(--transition-base);
  cursor: pointer;
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
  }
`;

export const CategoryIcon = styled.div`
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  background: ${props => props.$bgColor || 'var(--color-primary-50)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-md);
  color: ${props => props.$iconColor || 'var(--color-primary-500)'};
  font-size: var(--font-size-3xl);
`;

export const CategoryTitle = styled.h3`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-sm);
`;

export const CategoryDescription = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  line-height: 1.6;
  margin: 0;
`;

// Care Section
export const CareSection = styled(motion.section)`
  margin-bottom: var(--spacing-3xl);
  padding: var(--spacing-2xl);
  background: ${props => props.$bgColor || 'var(--color-white-0)'};
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--color-grey-200);
  
  @media ${devicesMax.md} {
    padding: var(--spacing-xl);
    margin-bottom: var(--spacing-2xl);
  }
`;

export const CareSectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  
  @media ${devicesMax.sm} {
    flex-direction: column;
    text-align: center;
  }
`;

export const CareSectionIcon = styled.div`
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  background: ${props => props.$bgColor || 'var(--color-primary-50)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$iconColor || 'var(--color-primary-500)'};
  font-size: var(--font-size-2xl);
  flex-shrink: 0;
  
  @media ${devicesMax.sm} {
    width: 5rem;
    height: 5rem;
    font-size: var(--font-size-xl);
  }
`;

export const CareSectionTitle = styled.h2`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin: 0;
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-xl);
  }
`;

export const CareTipsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(28rem, 1fr));
  gap: var(--spacing-md);
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

export const CareTip = styled.li`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-grey-50);
  border-radius: var(--border-radius-md);
  border-left: 3px solid var(--color-primary-500);
  
  &::before {
    content: '✓';
    color: var(--color-primary-500);
    font-weight: var(--font-bold);
    font-size: var(--font-size-lg);
    flex-shrink: 0;
    margin-top: 0.2rem;
  }
`;

export const CareTipText = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-700);
  line-height: 1.7;
  margin: 0;
`;

// FAQ Section
export const FAQSection = styled(motion.section)`
  background: var(--color-grey-50);
  padding: var(--spacing-3xl) var(--spacing-lg);
  border-radius: var(--border-radius-xl);
  margin: var(--spacing-3xl) auto;
  max-width: 120rem;
  
  @media ${devicesMax.md} {
    padding: var(--spacing-2xl) var(--spacing-md);
    margin: var(--spacing-2xl) auto;
  }
`;

export const FAQList = styled.div`
  max-width: 80rem;
  margin: 0 auto;
`;

export const FAQItem = styled(motion.div)`
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-grey-200);
`;

export const FAQQuestion = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-sm);
  
  &::before {
    content: 'Q: ';
    color: var(--color-primary-500);
    font-weight: var(--font-bold);
  }
`;

export const FAQAnswer = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-700);
  line-height: 1.7;
  margin: 0;
  padding-left: var(--spacing-lg);
  
  &::before {
    content: 'A: ';
    color: var(--color-grey-600);
    font-weight: var(--font-semibold);
  }
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

