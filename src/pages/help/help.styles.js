import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { devicesMax } from '../../shared/styles/breakpoint';

/**
 * Styled components for Help Center Page
 * Modern, elegant design following EazMain design system
 */

// Main Container
export const HelpContainer = styled.div`
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

export const HeroIcon = styled(motion.div)`
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  background: var(--color-primary-100);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-lg);
  color: var(--color-primary-500);
  font-size: var(--font-size-3xl);
  
  @media ${devicesMax.md} {
    width: 6rem;
    height: 6rem;
    font-size: var(--font-size-2xl);
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
    font-size: var(--font-size-base);
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
  text-align: center;
  margin-bottom: var(--spacing-md);
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const SectionDescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  text-align: center;
  max-width: 70rem;
  margin: 0 auto var(--spacing-2xl);
  line-height: 1.6;
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-base);
  }
`;

// Search Section
export const SearchSection = styled.div`
  display: flex;
  gap: var(--spacing-md);
  max-width: 80rem;
  margin: 0 auto;
  background: var(--color-white-0);
  border-radius: 12px;
  padding: var(--spacing-md);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  @media ${devicesMax.sm} {
    flex-direction: column;
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid var(--color-grey-200);
  border-radius: 8px;
  font-size: var(--font-size-base);
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(255, 196, 0, 0.1);
  }
  
  &::placeholder {
    color: var(--color-grey-400);
  }
`;

export const SearchButton = styled(motion.button)`
  padding: var(--spacing-md) var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--color-white-0);
  border: none;
  border-radius: 8px;
  font-size: var(--font-size-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 196, 0, 0.3);
  }
  
  @media ${devicesMax.sm} {
    width: 100%;
    justify-content: center;
  }
`;

// Categories Grid
export const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-xl);
  margin-top: var(--spacing-2xl);
  
  @media ${devicesMax.md} {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-lg);
  }
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

export const CategoryCard = styled(motion.div)`
  background: var(--color-white-0);
  border-radius: 12px;
  padding: var(--spacing-xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

export const CategoryIcon = styled.div`
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  background: ${props => props.$bgColor || 'var(--color-grey-100)'};
  color: ${props => props.$iconColor || 'var(--color-grey-700)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-lg);
`;

export const CategoryTitle = styled.h3`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-sm);
`;

export const CategoryDescription = styled.p`
  font-size: var(--font-size-base);
  color: var(--color-grey-600);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
`;

export const CategoryLink = styled(motion(Link))`
  color: var(--primary-700);
  text-decoration: none;
  font-weight: var(--font-semibold);
  font-size: var(--font-size-base);
  transition: color 0.3s ease;
  
  &:hover {
    color: var(--color-primary-700);
  }
`;

// Quick Links Grid
export const QuickLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-2xl);
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

export const QuickLinkCard = styled(motion.div)`
  background: var(--color-white-0);
  border-radius: 12px;
  padding: var(--spacing-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

export const QuickLinkIcon = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 8px;
  background: var(--color-primary-100);
  color: var(--primary-700);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-md);
`;

export const QuickLinkTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-xs);
`;

export const QuickLinkDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  margin-bottom: var(--spacing-md);
  line-height: 1.5;
`;

// CTA Section
export const CTASection = styled(motion.section)`
  padding: var(--spacing-3xl) var(--spacing-lg);
  background: linear-gradient(135deg, 
    var(--color-primary-50) 0%, 
    var(--primary-50) 100%
  );
  text-align: center;
  
  @media ${devicesMax.md} {
    padding: var(--spacing-2xl) var(--spacing-md);
  }
`;

export const CTATitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-md);
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const CTASubtitle = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  max-width: 60rem;
  margin: 0 auto var(--spacing-2xl);
  line-height: 1.6;
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-base);
  }
`;

export const CTAButtons = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
`;

export const CTAButton = styled(motion(Link))`
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: 8px;
  font-size: var(--font-size-base);
  font-weight: var(--font-semibold);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  ${props => props.$variant === 'outline' ? `
    background: transparent;
    color: var(--primary-700);
    border: 2px solid var(--color-primary-600);
    
    &:hover {
      background: var(--color-primary-600);
      color: var(--color-white-0);
    }
  ` : `
    background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
    color: var(--color-white-0);
    border: none;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(255, 196, 0, 0.3);
    }
  `}
  
  @media ${devicesMax.sm} {
    width: 100%;
    justify-content: center;
  }
`;

